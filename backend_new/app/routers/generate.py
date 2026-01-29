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
from app.config import settings
from app.services.github import GitHubService
from app.services.ai_generator import AIGeneratorService
from app.routers.auth import verify_clerk_token

router = APIRouter(prefix="/api/generate", tags=["generate"])

import os
from datetime import datetime

def log_trace(msg):
    try:
        with open("generation_trace.log", "a") as f:
            f.write(f"{datetime.now()}: {msg}\n")
    except:
        pass



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
    
    # Fallback to system token from env
    if not github_token:
        github_token = settings.github_token
    
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
    log_trace(f"Background task started for generation_id: {generation_id}")
    from app.database import SessionLocal
    
    db = SessionLocal()
    try:
        # Get repository
        repo = db.query(Repository).filter(Repository.id == repo_id).first()
        if not repo:
            log_trace(f"Repo not found in DB: {repo_id}")
            return
        
        # Parse owner/repo
        owner, repo_name = repo.full_name.split("/", 1)
        log_trace(f"Generating for {owner}/{repo_name} on branch {repo.default_branch}")
        
        # Initialize services
        github_service = GitHubService(github_token)
        ai_service = AIGeneratorService()
        
        # Generate README
        log_trace("Calling AI service...")
        content = await ai_service.generate_readme(
            github_service,
            owner,
            repo_name,
            repo.default_branch,
            template_type
        )
        log_trace(f"Content generated, length: {len(content)}")
        
        # Update generation
        generation = db.query(Generation).filter(Generation.id == generation_id).first()
        if generation:
            generation.content = content
            generation.status = "completed"
            db.commit()
            log_trace("Database updated to completed")
    except Exception as e:
        # Update generation status to failed
        log_trace(f"EXCEPTION in background task: {str(e)}")
        try:
            generation = db.query(Generation).filter(Generation.id == generation_id).first()
            if generation:
                generation.status = "failed"
                db.commit()
        except:
            pass
            
        error_msg = f"Error generating README: {str(e)}"
        print(error_msg)
        try:
            import logging
            # Configure logging to append to file
            logging.basicConfig(
                filename='backend_errors.log', 
                level=logging.ERROR,
                format='%(asctime)s - %(levelname)s - %(message)s'
            )
            logging.error(error_msg)
        except:
            print("Failed to write to error log")
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
    log_trace(f"Received generation request for repo_id: {request.repo_id}")
    user, github_token = user_and_token
    log_trace(f"User: {user.id}, Token present: {bool(github_token)}")
    
    print(f"DEBUG: Handling Generate Request. RepoID: '{request.repo_id}'. User: '{user.id}'", flush=True)
    
    # Strip whitespace just in case
    request.repo_id = request.repo_id.strip() if request.repo_id else ""

    # Verify repository belongs to user
    repo = db.query(Repository).filter(
        Repository.id == request.repo_id,
        Repository.user_id == user.id
    ).first()
    
    if not repo:
        print(f"DEBUG: Repo NOT found via standard query.", flush=True)
        # Check if repo exists at all
        any_repo = db.query(Repository).filter(Repository.id == request.repo_id).first()
        if any_repo:
             print(f"DEBUG: Repo EXISTS but belongs to user: {any_repo.user_id}", flush=True)
        else:
             print(f"DEBUG: Repo does NOT exist in DB at all. ID provided: {request.repo_id}", flush=True)
             
        raise HTTPException(status_code=404, detail="Repository not found")
    
    print(f"DEBUG: Repo Found: {repo.full_name}", flush=True)
    
    # Create generation record
    generation = Generation(
        repo_id=repo.id,
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
        repo.id,
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
