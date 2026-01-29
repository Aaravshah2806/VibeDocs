"""
AI Generator Service - Production Grade Implementation
Uses Google Generative AI SDK for README generation.
"""
import asyncio
import time
import logging
from typing import List, Optional, Dict, Any

import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

from app.config import settings
from app.services.github import GitHubService
from app.prompts.readme_prompt import get_readme_prompt

logger = logging.getLogger(__name__)


class AIGeneratorService:
    """
    Production-grade AI service for generating README content.
    
    Features:
    - Multiple model fallback
    - Automatic retry with exponential backoff
    - Proper error handling and logging
    - Safety settings configuration
    """
    
    # Models to try in order of preference (using models confirmed available)
    MODELS = [
        "gemini-2.5-flash",       # Latest flash model
        "gemini-2.0-flash-lite",  # Lighter/faster model  
        "gemini-flash-latest",    # Alias for latest
    ]
    
    # Safety settings - allow all content for code generation
    SAFETY_SETTINGS = {
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
    }
    
    def __init__(self):
        """Initialize the AI service with API key from settings."""
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        
        # Configure the SDK
        genai.configure(api_key=settings.gemini_api_key)
        logger.info("AIGeneratorService initialized with Gemini API")
    
    def _create_model(self, model_name: str) -> genai.GenerativeModel:
        """Create a GenerativeModel instance with proper configuration."""
        return genai.GenerativeModel(
            model_name=model_name,
            safety_settings=self.SAFETY_SETTINGS,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 8192,
            }
        )
    
    def _call_gemini(self, prompt: str) -> str:
        """
        Call Gemini API with retry logic and model fallback.
        
        Args:
            prompt: The prompt to send to Gemini
            
        Returns:
            Generated text content
            
        Raises:
            Exception: If all models fail after retries
        """
        last_error = None
        
        for model_name in self.MODELS:
            logger.info(f"Trying model: {model_name}")
            
            for attempt in range(3):
                try:
                    model = self._create_model(model_name)
                    response = model.generate_content(prompt)
                    
                    # Check if response has text
                    if response.text:
                        logger.info(f"Successfully generated with {model_name}")
                        return response.text
                    else:
                        logger.warning(f"Empty response from {model_name}")
                        continue
                        
                except Exception as e:
                    error_msg = str(e)
                    last_error = e
                    logger.warning(f"Model {model_name} attempt {attempt + 1} failed: {error_msg[:200]}")
                    
                    # Handle rate limiting
                    if "429" in error_msg or "quota" in error_msg.lower() or "rate" in error_msg.lower():
                        wait_time = min(30, 5 * (2 ** attempt))  # Exponential backoff, max 30s
                        logger.info(f"Rate limited. Waiting {wait_time}s before retry...")
                        time.sleep(wait_time)
                        continue
                    
                    # Handle model not found - try next model
                    elif "404" in error_msg or "not found" in error_msg.lower():
                        logger.info(f"Model {model_name} not available, trying next...")
                        break
                    
                    # Other errors - retry with backoff
                    else:
                        wait_time = 2 * (attempt + 1)
                        time.sleep(wait_time)
                        continue
        
        # All models failed
        error_detail = str(last_error) if last_error else "Unknown error"
        raise Exception(f"All Gemini models failed. Last error: {error_detail}")

    async def generate_readme(
        self,
        github_service: GitHubService,
        owner: str,
        repo: str,
        branch: str,
        template_type: str = "professional"
    ) -> str:
        """
        Generate README content for a GitHub repository.
        
        Args:
            github_service: GitHub API service instance
            owner: Repository owner
            repo: Repository name
            branch: Branch to analyze
            template_type: README template style
            
        Returns:
            Generated README markdown content
        """
        logger.info(f"Generating README for {owner}/{repo} on branch {branch}")
        
        # Step 1: Get file tree
        try:
            file_tree = await github_service.get_repo_tree(owner, repo, branch)
            logger.info(f"Retrieved file tree with {len(file_tree)} items")
        except Exception as e:
            logger.error(f"Failed to get file tree: {e}")
            raise

        # Step 2: Get important file contents for context
        important_files: Dict[str, str] = {}
        important_paths = [
            "package.json", "requirements.txt", "pyproject.toml",
            "pom.xml", "Cargo.toml", "go.mod", "composer.json",
            "Gemfile", "pubspec.yaml", "Dockerfile", "docker-compose.yml",
            "README.md", "LICENSE", ".env.example", "Makefile"
        ]

        for item in file_tree:
            filename = item.path.split("/")[-1].lower()
            if any(p.lower() in filename for p in important_paths):
                if item.type == "file" and item.size and item.size < 50000:
                    try:
                        content = await github_service.get_file_content(
                            owner, repo, item.path, branch
                        )
                        if content:
                            # Truncate large files
                            important_files[item.path] = content[:3000]
                    except Exception as e:
                        logger.warning(f"Failed to get {item.path}: {e}")

        logger.info(f"Retrieved {len(important_files)} important files")

        # Step 3: Build the prompt
        context = self._build_context(owner, repo, file_tree, important_files)
        system_prompt = get_readme_prompt(file_tree, template_type)
        
        full_prompt = f"""{system_prompt}

{context}

Generate a comprehensive README.md file for this repository.
Return ONLY the markdown content, no explanations or preamble.
Start directly with the title (# Project Name).
"""

        # Step 4: Call AI in a thread to keep async
        logger.info("Calling AI service...")
        result = await asyncio.to_thread(self._call_gemini, full_prompt)
        logger.info(f"Generated README with {len(result)} characters")
        
        return result
    
    def _build_context(
        self,
        owner: str,
        repo: str,
        file_tree: List[Any],
        important_files: Dict[str, str]
    ) -> str:
        """Build context string for the AI prompt."""
        
        # Repository info
        context = f"# Repository: {owner}/{repo}\n\n"
        
        # File structure summary
        dirs = set()
        extensions = {}
        for item in file_tree:
            if item.type == "tree":
                dirs.add(item.path.split("/")[0])
            else:
                ext = item.path.split(".")[-1] if "." in item.path else "no-ext"
                extensions[ext] = extensions.get(ext, 0) + 1
        
        context += "## Project Structure:\n"
        context += f"- Directories: {', '.join(sorted(dirs)[:10])}\n"
        context += f"- File types: {dict(sorted(extensions.items(), key=lambda x: -x[1])[:10])}\n"
        context += f"- Total files: {len([i for i in file_tree if i.type == 'file'])}\n\n"
        
        # Important file contents
        if important_files:
            context += "## Key Files:\n\n"
            for path, content in important_files.items():
                context += f"### {path}\n```\n{content}\n```\n\n"
        
        return context