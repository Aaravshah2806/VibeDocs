"""Authentication router with GitHub OAuth."""
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.schemas import UserResponse
from app.config import settings
from app.utils.security import create_access_token, get_current_user
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.get("/github/login")
async def github_login():
    """Redirect to GitHub OAuth login page."""
    if not settings.github_client_id:
        raise HTTPException(status_code=500, detail="GitHub Client ID not configured")
    
    redirect_uri = settings.github_redirect_uri or "http://localhost:5175/auth/callback"
    
    params = {
        "client_id": settings.github_client_id,
        "redirect_uri": redirect_uri,
        "scope": "user repo",
        "allow_signup": "true",
    }
    query_params = "&".join([f"{k}={v}" for k, v in params.items()])
    url = f"https://github.com/login/oauth/authorize?{query_params}"
    logger.info(f"GitHub login URL: {url}")
    return {"url": url}

@router.get("/github/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    """Handle GitHub OAuth callback."""
    if not settings.github_client_id or not settings.github_client_secret:
        raise HTTPException(status_code=500, detail="GitHub OAuth not configured")
    
    redirect_uri = settings.github_redirect_uri or "http://localhost:5175/auth/callback"
    
    # Exchange code for access token
    try:
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://github.com/login/oauth/access_token",
                data={
                    "client_id": settings.github_client_id,
                    "client_secret": settings.github_client_secret,
                    "code": code,
                    "redirect_uri": redirect_uri,
                },
                headers={"Accept": "application/json"}
            )
            token_data = token_response.json()
            access_token = token_data.get("access_token")
            
            if not access_token:
                github_error = token_data.get("error", "unknown_error")
                github_error_desc = token_data.get("error_description", "No description")
                logger.error(f"GitHub token error: {github_error} - {github_error_desc}")
                logger.error(f"Full token response: {token_data}")
                raise HTTPException(
                    status_code=400, 
                    detail=f"GitHub auth failed: {github_error} - {github_error_desc}"
                )
            
            # Fetch user info from GitHub
            user_response = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"token {access_token}"}
            )
            github_user = user_response.json()
            github_id = str(github_user.get("id"))
            github_username = github_user.get("login")
            avatar_url = github_user.get("avatar_url")
            
            # Find or create user
            user = db.query(User).filter(User.github_id == github_id).first()
            if not user:
                user = User(
                    github_id=github_id,
                    github_username=github_username,
                    avatar_url=avatar_url,
                    github_access_token=access_token
                )
                db.add(user)
            else:
                user.github_access_token = access_token
                user.github_username = github_username
                user.avatar_url = avatar_url
            
            db.commit()
            db.refresh(user)
            
            # Generate local JWT
            jwt_token = create_access_token(data={"user_id": user.id})
            
            return {
                "access_token": jwt_token,
                "token_type": "bearer",
                "user": {
                    "id": user.id,
                    "github_username": user.github_username,
                    "avatar_url": user.avatar_url
                }
            }
            
    except Exception as e:
        logger.error(f"OAuth error: {e}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")

@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    """Get current user information."""
    return user
