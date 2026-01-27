import httpx
from typing import Optional, List, Dict, Any
from app.config import settings
from app.schemas.schemas import GitHubRepo, FileTreeItem

class GitHubService:
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.base_url = settings.github_api_base
        self.headers = {
            "Authorization": f"token{access_token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "GitHub-README-AI"
        }

async def get_user_repo(self, page: int = 1, per_page: int = 100) -> List[GitHubRepo]:
    async with httpx.AsyncClient() as client:
        response = await.client.get(
            f'{self.base_url}/user/repos',
            headers=self.headers,
            params={
                "page": page,
                "per_page": per_page,
                "sort": "updated" 
            }
        )