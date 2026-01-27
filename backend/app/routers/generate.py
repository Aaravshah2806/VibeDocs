"""README generation router."""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
from typing import List, Tuple, Optional
from app.database import get_db
from app.models.user import User
from app.models.repository import Repository
from app.models.generation import Generation
from app.schemas.schemas import (
    GenerateRequest,
    GenerateResponse,
    GenerationResponse,
    CommitRequest
)
from app.services.github import GitHubService
from app.services.ai_generator import AIGeneratorService
from app.routers.auth import verify_clerk_token

router = APIRouter(prefix="/api/generate", tags=["generate"])


def get_user_with_token(
    user_info: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
) -> Tuple[User, str]:
    """Get user and their GitHub access token."""
    clerk_user_id = user_info["clerk_user_id"]
    user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    github_token = user_info.get("github_token") or user.github_access_token
    
    if not github_token:
        raise HTTPException(
            status_code=400,
            detail="GitHub access token not found. Please connect your GitHub account."
        )
    
    return user, github_token


async def generate_readme_background(
    generation_id: str,
    repo_id: str,
    template_type: str,
    github_token: str
):
    """Background task to generate README."""
    from app.database import SessionLocal
    
    db = SessionLocal()
    try:
        # Get repository
        repo = db.query(Repository).filter(Repository.id == repo_id).first()
        if not repo:
            return
        
        # Parse owner/repo
        owner, repo_name = repo.full_name.split("/", 1)
        
        # Initialize services
        github_service = GitHubService(github_token)
        ai_service = AIGeneratorService()
        
        # Generate README
        content = await ai_service.generate_readme(
            github_service,
            owner,
            repo_name,
            repo.default_branch,
            template_type
        )
        
        # Update generation
        generation = db.query(Generation).filter(Generation.id == generation_id).first()
        if generation:
            generation.content = content
            generation.status = "completed"
            db.commit()
    except Exception as e:
        # Update generation status to failed
        try:
            generation = db.query(Generation).filter(Generation.id == generation_id).first()
            if generation:
                generation.status = "failed"
                db.commit()
        except:
            pass
        print(f"Error generating README: {str(e)}")
    finally:
        db.close()


@router.post("/", response_model=GenerateResponse)
async def generate_readme(
    request: GenerateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user_and_token: Tuple[User, str] = Depends(get_user_with_token)
):
    """Generate README with AI."""
    user, github_token = user_and_token
    
    # Verify repository belongs to user
    repo = db.query(Repository).filter(
        Repository.id == request.repo_id,
        Repository.user_id == user.id
    ).first()
    
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    # Create generation record
    generation = Generation(
        repo_id=request.repo_id,
        template_type=request.template_type,
        status="pending"
    )
    
    db.add(generation)
    db.commit()
    db.refresh(generation)
    
    # Start background task
    background_tasks.add_task(
        generate_readme_background,
        str(generation.id),
        request.repo_id,
        request.template_type,
        github_token
    )
    
    return GenerateResponse(
        generation_id=str(generation.id),
        content="",  # Will be populated by background task
        status="pending"
    )


@router.get("/history", response_model=List[GenerationResponse])
async def get_generation_history(
    repo_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user_and_token: Tuple[User, str] = Depends(get_user_with_token)
):
    """List past README generations."""
    user, _ = user_and_token
    
    query = db.query(Generation).join(Repository).filter(Repository.user_id == user.id)
    
    if repo_id:
        query = query.filter(Generation.repo_id == repo_id)
    
    generations = query.order_by(Generation.created_at.desc()).limit(50).all()
    
    return generations


@router.get("/{generation_id}", response_model=GenerationResponse)
async def get_generation(
    generation_id: str,
    db: Session = Depends(get_db),
    user_and_token: Tuple[User, str] = Depends(get_user_with_token)
):
    """Get specific generation."""
    user, _ = user_and_token
    
    generation = db.query(Generation).join(Repository).filter(
        Generation.id == generation_id,
        Repository.user_id == user.id
    ).first()
    
    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")
    
    return generation


@router.post("/commit")
async def commit_readme(
    request: CommitRequest,
    db: Session = Depends(get_db),
    user_and_token: Tuple[User, str] = Depends(get_user_with_token)
):
    """Commit generated README to GitHub."""
    user, github_token = user_and_token
    
    # Get generation
    generation = db.query(Generation).join(Repository).filter(
        Generation.id == request.generation_id,
        Repository.user_id == user.id
    ).first()
    
    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")
    
    if generation.status != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Generation not completed. Current status: {generation.status}"
        )
    
    if not generation.content:
        raise HTTPException(status_code=400, detail="No content to commit")
    
    # Get repository
    repo = generation.repository
    owner, repo_name = repo.full_name.split("/", 1)
    
    # Commit to GitHub
    github_service = GitHubService(github_token)
    
    try:
        success = await github_service.commit_file(
            owner,
            repo_name,
            "README.md",
            generation.content,
            request.commit_message,
            repo.default_branch
        )
        
        if success:
            return {"message": "README committed successfully", "status": "success"}
        else:
            raise HTTPException(status_code=500, detail="Failed to commit README")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to commit README: {str(e)}")
