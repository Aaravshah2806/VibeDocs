"""
Badge Generator Service
Maps project dependencies/files to Shields.io badges.
"""
from typing import List, Dict, Any
import json
import re

class BadgeGeneratorService:
    """Service to detect tech stack and generate badges."""
    
    # Mapping of keywords/files to Shields.io badge URLs
    # Format: "keyword": ("Label", "Color", "Logo")
    BADGE_MAPPINGS = {
        # Languages
        "python": ("Python", "3776AB", "python"),
        "javascript": ("JavaScript", "F7DF1E", "javascript"),
        "typescript": ("TypeScript", "3178C6", "typescript"),
        "rust": ("Rust", "000000", "rust"),
        "go": ("Go", "00ADD8", "go"),
        "java": ("Java", "007396", "java"),
        "php": ("PHP", "777BB4", "php"),
        
        # Frameworks/Libraries - Web
        "react": ("React", "61DAFB", "react"),
        "vue": ("Vue.js", "4FC08D", "vuedotjs"),
        "angular": ("Angular", "DD0031", "angular"),
        "next": ("Next.js", "000000", "nextdotjs"),
        "svelte": ("Svelte", "FF3E00", "svelte"),
        "django": ("Django", "092E20", "django"),
        "flask": ("Flask", "000000", "flask"),
        "fastapi": ("FastAPI", "009688", "fastapi"),
        "express": ("Express.js", "000000", "express"),
        "nestjs": ("NestJS", "E0234E", "nestjs"),
        "laravel": ("Laravel", "FF2D20", "laravel"),
        "spring": ("Spring", "6DB33F", "spring"),
        
        # Tools/Infra
        "docker": ("Docker", "2496ED", "docker"),
        "kubernetes": ("Kubernetes", "326CE5", "kubernetes"),
        "aws": ("AWS", "232F3E", "amazonwebservices"),
        "firebase": ("Firebase", "FFCA28", "firebase"),
        "supabase": ("Supabase", "3ECF8E", "supabase"),
        "postgresql": ("PostgreSQL", "4169E1", "postgresql"),
        "mongodb": ("MongoDB", "47A248", "mongodb"),
        "redis": ("Redis", "DC382D", "redis"),
        "nginx": ("Nginx", "009639", "nginx"),
        "vite": ("Vite", "646CFF", "vite"),
        "webpack": ("Webpack", "8DD6F9", "webpack"),
        "tailwindcss": ("Tailwind CSS", "06B6D4", "tailwindcss"),
    }
    
    def generate_badges(self, file_tree: List[Any], file_contents: Dict[str, str]) -> List[Dict[str, str]]:
        """
        Detect technologies and return a list of badges.
        
        Args:
            file_tree: List of file objects from GitHub
            file_contents: Dictionary of filename -> content for key files
            
        Returns:
            List of dicts with {label, url, markdown}
        """
        detected_tech = set()
        
        # 1. Check file extensions/names in tree
        for item in file_tree:
            path = item.path.lower()
            if path.endswith(".py"): detected_tech.add("python")
            if path.endswith(".js") or path.endswith(".jsx"): detected_tech.add("javascript")
            if path.endswith(".ts") or path.endswith(".tsx"): detected_tech.add("typescript")
            if path.endswith(".rs"): detected_tech.add("rust")
            if path.endswith(".go"): detected_tech.add("go")
            if path.endswith(".java"): detected_tech.add("java")
            if path.endswith(".php"): detected_tech.add("php")
            
            if "dockerfile" in path: detected_tech.add("docker")
            if "docker-compose" in path: detected_tech.add("docker")
            if "next.config.js" in path: detected_tech.add("next")
            if "vite.config" in path: detected_tech.add("vite")
            if "tailwind.config" in path: detected_tech.add("tailwindcss")
            
        # 2. Parse file contents (package.json, requirements.txt)
        
        # NPM/Node
        if "package.json" in file_contents:
            try:
                data = json.loads(file_contents["package.json"])
                deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
                
                if "react" in deps: detected_tech.add("react")
                if "vue" in deps: detected_tech.add("vue")
                if "svelte" in deps: detected_tech.add("svelte")
                if "express" in deps: detected_tech.add("express")
                if "@nestjs/core" in deps: detected_tech.add("nestjs")
                if "firebase" in deps: detected_tech.add("firebase")
                if "@supabase/supabase-js" in deps: detected_tech.add("supabase")
                if "mongodb" in deps or "mongoose" in deps: detected_tech.add("mongodb")
                if "pg" in deps: detected_tech.add("postgresql")
            except:
                pass
                
        # Python
        if "requirements.txt" in file_contents:
            content = file_contents["requirements.txt"].lower()
            if "django" in content: detected_tech.add("django")
            if "flask" in content: detected_tech.add("flask")
            if "fastapi" in content: detected_tech.add("fastapi")
            if "psycopg2" in content or "asyncpg" in content: detected_tech.add("postgresql")
            if "pymongo" in content: detected_tech.add("mongodb")
            if "redis" in content: detected_tech.add("redis")
            if "boto3" in content: detected_tech.add("aws")

        # 3. Generate Badges
        badges = []
        for tech in detected_tech:
            if tech in self.BADGE_MAPPINGS:
                label, color, logo = self.BADGE_MAPPINGS[tech]
                # Shields.io URL format: https://img.shields.io/badge/Label-Color?logo=Logo&logoColor=white
                url = f"https://img.shields.io/badge/{label}-{color}?logo={logo}&logoColor=white"
                badges.append({
                    "id": tech,
                    "label": label,
                    "url": url,
                    "markdown": f"![{label}]({url})"
                })
        
        # Sort badges by label
        badges.sort(key=lambda x: x["label"])
        return badges
