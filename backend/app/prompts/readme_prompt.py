"""System prompts for README generation."""
from typing import List
from app.schemas.schemas import FileTreeItem


def get_readme_prompt(file_tree: List[FileTreeItem], template_type: str = "professional") -> str:
    """Generate system prompt for README generation based on template type."""
    
    # Filter important files
    important_files = [
        item.path for item in file_tree
        if any(keyword in item.path.lower() for keyword in [
            "package.json", "requirements.txt", "pom.xml", "cargo.toml",
            "go.mod", "composer.json", "gemfile", "pubspec.yaml",
            "readme.md", "readme", "license", ".gitignore",
            "dockerfile", "docker-compose", "makefile"
        ])
    ]
    
    # Get file tree structure (limit to first 100 files for context)
    tree_structure = "\n".join([item.path for item in file_tree[:100]])
    
    base_prompt = f"""You are an expert technical writer specializing in creating professional GitHub README files.

Analyze the following repository structure and generate a comprehensive README.md file.

Repository File Tree:
{tree_structure}

Important Files Detected:
{chr(10).join(important_files) if important_files else "None detected"}

Instructions:
1. Analyze the file structure to determine the project type, tech stack, and purpose
2. Look for configuration files (package.json, requirements.txt, etc.) to identify dependencies
3. Infer the project's functionality from the directory structure
4. Generate appropriate badges for the tech stack
5. Create clear installation and usage instructions
6. Include relevant sections based on the project type

"""
    
    if template_type == "minimalist":
        return base_prompt + """
Template Style: Minimalist
- Keep it clean and simple
- Include: Title, Description, Installation, Basic Usage
- Avoid excessive sections
- Focus on essential information only
"""
    
    elif template_type == "portfolio":
        return base_prompt + """
Template Style: Portfolio/Showcase
- Make it visually appealing
- Include: Title with emoji, Features list, Tech Stack with badges, Screenshots section (placeholder), Installation, Usage, Contributing, License
- Use emojis appropriately
- Highlight project achievements and features
- Make it showcase-ready for portfolios
"""
    
    else:  # professional (default)
        return base_prompt + """
Template Style: Professional
- Comprehensive documentation
- Include: Title, Description, Features, Tech Stack (with badges), Installation, Usage, Project Structure, Contributing, License, Author
- Detailed and complete
- Professional formatting
- Include all standard sections
- Use GitHub Flavored Markdown
"""
