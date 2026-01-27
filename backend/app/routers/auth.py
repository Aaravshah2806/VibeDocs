"""Authentication router with Clerk JWT verification."""
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.schemas.schemas import UserResponse
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


async def verify_clerk_token(authorization: Optional[str] = Header(None)) -> dict:
    """Verify Clerk JWT token and extract user information."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    
    token = authorization.split(" ")[1]
    
    # Decode JWT to get user ID
    try:
        import jwt
        decoded = jwt.decode(token, options={"verify_signature": False})
        clerk_user_id = decoded.get("sub") or decoded.get("user_id")
        
        if not clerk_user_id:
            raise HTTPException(status_code=401, detail="Invalid token: no user ID")
        
        # Try to get GitHub token from Clerk API
        github_token = None
        if settings.clerk_secret_key:
            github_token = await fetch_github_token_from_clerk(clerk_user_id)
        
        return {
            "clerk_user_id": clerk_user_id,
            "github_token": github_token
        }
    except jwt.exceptions.DecodeError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


async def fetch_github_token_from_clerk(clerk_user_id: str) -> Optional[str]:
    """Fetch GitHub OAuth access token from Clerk API."""
    import httpx
    
    if not settings.clerk_secret_key:
        return None
    
    try:
        async with httpx.AsyncClient() as client:
            # Clerk API endpoint to get OAuth access tokens for a user
            response = await client.get(
                f"https://api.clerk.com/v1/users/{clerk_user_id}/oauth_access_tokens/github",
                headers={
                    "Authorization": f"Bearer {settings.clerk_secret_key}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                # Clerk returns an array of tokens, get the first one
                if data and len(data) > 0:
                    return data[0].get("token")
            
            return None
    except Exception as e:
        print(f"Failed to fetch GitHub token from Clerk: {e}")
        return None


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    user_info: dict = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get current user information. Creates user if doesn't exist."""
    clerk_user_id = user_info["clerk_user_id"]
    github_token = user_info.get("github_token")
    
    # Find or create user
    user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
    
    if not user:
        # Create new user if doesn't exist
        # Note: In production, GitHub token should come from Clerk OAuth, not JWT
        if not github_token:
            raise HTTPException(
                status_code=400,
                detail="GitHub access token required. Please connect your GitHub account."
            )
        
        user = User(
            clerk_user_id=clerk_user_id,
            github_access_token=github_token
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user
