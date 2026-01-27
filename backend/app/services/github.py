"""GitHub API service for repository operations."""
import httpx
from typing import Optional, List, Dict, Any
from app.config import settings
from app.schemas.schemas import GitHubRepo, FileTreeItem


class GitHubService:
    """Service for interacting with GitHub API."""
    
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.base_url = settings.github_api_base
        # GitHub API accepts both "token" and "Bearer" formats
        # Using "token" for compatibility with older tokens
        self.headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "GitHub-README-AI"
        }
    
    async def get_user_repos(self, page: int = 1, per_page: int = 100) -> List[GitHubRepo]:
        """Fetch user's repositories from GitHub."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/user/repos",
                headers=self.headers,
                params={"page": page, "per_page": per_page, "sort": "updated"}
            )
            response.raise_for_status()
            repos_data = response.json()
            return [GitHubRepo(**repo) for repo in repos_data]
    
    async def get_repo(self, owner: str, repo: str) -> GitHubRepo:
        """Get a specific repository."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}",
                headers=self.headers
            )
            response.raise_for_status()
            return GitHubRepo(**response.json())
    
    async def get_repo_tree(self, owner: str, repo: str, branch: str = "main", recursive: bool = True) -> List[FileTreeItem]:
        """Get repository file tree."""
        async with httpx.AsyncClient() as client:
            # First, get the SHA of the branch
            branch_response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/branches/{branch}",
                headers=self.headers
            )
            branch_response.raise_for_status()
            branch_sha = branch_response.json()["commit"]["sha"]
            
            # Get the tree
            tree_response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/git/trees/{branch_sha}",
                headers=self.headers,
                params={"recursive": "1" if recursive else "0"}
            )
            tree_response.raise_for_status()
            tree_data = tree_response.json()
            
            return [
                FileTreeItem(
                    path=item["path"],
                    type=item["type"],
                    size=item.get("size")
                )
                for item in tree_data.get("tree", [])
            ]
    
    async def get_file_content(self, owner: str, repo: str, path: str, branch: str = "main") -> Optional[str]:
        """Get file content from repository."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/repos/{owner}/{repo}/contents/{path}",
                    headers=self.headers,
                    params={"ref": branch}
                )
                response.raise_for_status()
                content_data = response.json()
                
                # Decode base64 content
                import base64
                if content_data.get("encoding") == "base64":
                    content = base64.b64decode(content_data["content"]).decode("utf-8")
                    return content
                return None
            except httpx.HTTPStatusError:
                return None
    
    async def commit_file(
        self,
        owner: str,
        repo: str,
        path: str,
        content: str,
        message: str,
        branch: str = "main"
    ) -> bool:
        """Commit a file to the repository."""
        async with httpx.AsyncClient() as client:
            # Get current file SHA if it exists
            try:
                current_file = await client.get(
                    f"{self.base_url}/repos/{owner}/{repo}/contents/{path}",
                    headers=self.headers,
                    params={"ref": branch}
                )
                current_sha = current_file.json().get("sha")
            except httpx.HTTPStatusError:
                current_sha = None
            
            # Encode content to base64
            import base64
            encoded_content = base64.b64encode(content.encode("utf-8")).decode("utf-8")
            
            # Commit the file
            commit_data = {
                "message": message,
                "content": encoded_content,
                "branch": branch
            }
            if current_sha:
                commit_data["sha"] = current_sha
            
            response = await client.put(
                f"{self.base_url}/repos/{owner}/{repo}/contents/{path}",
                headers=self.headers,
                json=commit_data
            )
            response.raise_for_status()
            return True
    
    async def get_user_info(self) -> Dict[str, Any]:
        """Get authenticated user information."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/user",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
