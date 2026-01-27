from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    clerk_user_id: str
    github_username: Optional[str] = None

class UserCreate(UserBase):
    github_access_token: str

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Repository Schemas
class RepositoryBase(BaseModel):
    github_repo_id: int
    full_name: str
    default_branch: str = "main"

class RepositoryCreate(RepositoryBase):
    user_id: str

class RepositoryResponse(RepositoryBase):
    id: str
    user_id: str
    last_synced_at: datetime

    class Config:
        from_attributes = True

# GitHub API Response Schemas
class GitHubRepo(BaseModel):
    id: int
    name: str
    full_name: str
    description: Optional[str] = None
    language: Optional[str] = None
    stargrazers_count: int = 0
    forks_count: int = 0
    visibility: str = "public"
    default_branch: str = "main"
    updated_at: str

# Generation Schemas
class GenerationBase(BaseModel):
    template_type: str = "professional"
    # minimalist/professional/portfolio

class GenerationCreate(GenerationBase):
    repo_id: str

class GenerationResponse(GenerationBase):
    id: str
    repo_id: str
    content: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Generation Request/Response
class GenerationRequest(BaseModel):
    repo_id: str
    template_type: str = "professional"

class GenerationResponse(BaseModel):
    generation_id: str
    content: str
    status: str

# Generate Request/Response (used by generate router)
class GenerateRequest(BaseModel):
    repo_id: str
    template_type: str = "professional"

class GenerateResponse(BaseModel):
    generation_id: str
    content: str
    status: str

# Commit Request
class CommitRequest(BaseModel):
    generation_id: str
    commit_message: str = "docs: Add AI-generated README"

#File Tree Response
class FileTreeItem(BaseModel):
    path: str
    type: str
    size: Optional[int] = None

class FileTreeResponse(BaseModel):
    tree: list[FileTreeItem]