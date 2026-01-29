"""AI Generator Service using Google GenAI SDK."""
from app.services.github import GitHubService
import asyncio
from typing import List
from google import genai
from google.genai import types
from app.config import settings
from app.schemas.schemas import FileTreeItem
from app.prompts.readme_prompt import get_readme_prompt


class AIGeneratorService:
    def __init__(self):
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY not set")
        # Use the new google.genai client with explicit http_options for v1 API
        self.client = genai.Client(
            api_key=settings.gemini_api_key,
            http_options=types.HttpOptions(api_version='v1')
        )
        self.model = "gemini-2.5-flash"

    async def generate_readme(
        self, github_service: GitHubService,
        owner: str,
        repo: str,
        branch: str,
        template_type: str = "professional"
    ) -> str:
        """Generate README content for a repository using Google Gemini."""

        # Get file tree
        file_tree = await github_service.get_repo_tree(owner, repo, branch)

        # Get imp file contents for context
        important_files_content = {}
        important_paths = [
            "package.json", "requirements.txt", "pom.xml", "Cargo.toml",
            "go.mod", "composer.json", "Gemfile", "pubspec.yaml",
            "README.md", "README", "LICENSE", "Dockerfile"
        ]

        for item in file_tree:
            if any(path.lower() in item.path.lower() for path in important_paths):
                if item.type == "file" and item.size and item.size < 50000:
                    content = await github_service.get_file_content(owner, repo, item.path, branch)
                    if content:
                        important_files_content[item.path] = content[:2000]

        # Build context
        context = f"Repository: {owner}/{repo}\n\n"
        if important_files_content:
            context += "Important File Contents:\n"
            for path, content in important_files_content.items():
                context += f"\n---{path} ---\n{content}\n"

        # Get prompt
        system_prompt = get_readme_prompt(file_tree, template_type)

        # Combine system prompt and context into a single prompt string
        prompt_text = (
            f"{system_prompt}\n\n"
            f"{context}\n\n"
            "Generate a README.md file for this repository. "
            "Return only the markdown content, no additional text or explanations."
        )

        def _generate_sync(prompt: str) -> str:
            """Synchronous helper to call Gemini from an async context."""
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
            )
            return response.text

        # Run the blocking Gemini call in a thread to keep this async-friendly
        return await asyncio.to_thread(_generate_sync, prompt_text)