"""Repository router for GitHub operations."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Tuple
from app.database import get_db
from app.models.user import User
from app.models.repository import Repository
from app.schemas.schemas import (
    RepositoryResponse,
    GitHubRepo,
    FileTreeResponse,
    FileTreeItem
)
from app.services.github import GitHubService
from app.routers.auth import verify_clerk_token

router = APIRouter(prefix="/api/repos", tags=["repos"])


def get_user_with_token(
    user_info: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
) -> Tuple[User, str]:
    """Get user and their GitHub access token. Creates user if not exists."""
    clerk_user_id = user_info["clerk_user_id"]
    github_token = user_info.get("github_token")
    
    user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
    
    if not user:
        # Auto-create user if they have a GitHub token
        if github_token:
            user = User(
                clerk_user_id=clerk_user_id,
                github_access_token=github_token
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            raise HTTPException(
                status_code=400,
                detail="GitHub access token not found. Please connect your GitHub account in Clerk."
            )
    
    # Get GitHub token from user or from Clerk JWT
    token = github_token or user.github_access_token
    
    if not token:
        raise HTTPException(
            status_code=400,
            detail="GitHub access token not found. Please connect your GitHub account."
        )
    
    return user, token


@router.get("/", response_model=List[GitHubRepo])
async def list_repositories(
    page: int = Query(1, ge=1),
    per_page: int = Query(100, ge=1, le=100),
    user_and_token: Tuple[User, str] = Depends(get_user_with_token)
):
    """List user's GitHub repositories."""
    user, github_token = user_and_token
    github_service = GitHubService(github_token)
    
    try:
        repos = await github_service.get_user_repos(page=page, per_page=per_page)
        return repos
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch repositories: {str(e)}")


@router.get("/{repo_id}", response_model=RepositoryResponse)
async def get_repository(
    repo_id: str,
    db: Session = Depends(get_db),
    user_and_token: Tuple[User, str] = Depends(get_user_with_token)
):
    """Get repository details from database."""
    user, _ = user_and_token
    
    repo = db.query(Repository).filter(
        Repository.id == repo_id,
        Repository.user_id == user.id
    ).first()
    
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    return repo


@router.get("/{repo_id}/tree", response_model=FileTreeResponse)
async def get_repository_tree(
    repo_id: str,
    branch: str = Query("main"),
    db: Session = Depends(get_db),
    user_and_token: Tuple[User, str] = Depends(get_user_with_token)
):
    """Get repository file tree from GitHub."""
    user, github_token = user_and_token
    
    # Get repo from database
    repo = db.query(Repository).filter(
        Repository.id == repo_id,
        Repository.user_id == user.id
    ).first()
    
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    # Parse owner/repo from full_name
    owner, repo_name = repo.full_name.split("/", 1)
    
    github_service = GitHubService(github_token)
    
    try:
        tree = await github_service.get_repo_tree(owner, repo_name, branch or repo.default_branch)
        return FileTreeResponse(tree=tree)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch file tree: {str(e)}")


@router.post("/import", response_model=RepositoryResponse)
async def import_repository(
    github_repo: GitHubRepo,
    db: Session = Depends(get_db),
    user_and_token: Tuple[User, str] = Depends(get_user_with_token)
):
    """Import/sync a repository to the database."""
    user, _ = user_and_token
    
    # Check if repository already exists
    existing_repo = db.query(Repository).filter(
        Repository.github_repo_id == github_repo.id,
        Repository.user_id == user.id
    ).first()
    
    if existing_repo:
        # Update last_synced_at
        from datetime import datetime, timezone
        existing_repo.last_synced_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(existing_repo)
        return existing_repo
    
    # Create new repository
    new_repo = Repository(
        user_id=user.id,
        github_repo_id=github_repo.id,
        full_name=github_repo.full_name,
        default_branch=github_repo.default_branch
    )
    
    db.add(new_repo)
    db.commit()
    db.refresh(new_repo)
    
    return new_repo
