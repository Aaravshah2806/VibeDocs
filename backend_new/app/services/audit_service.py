"""
Audit Service for READMEs.
Calculates a "Vibe Score" based on best practices.
"""
import re
from typing import Dict, Any, List

class AuditService:
    """Service to audit README content and generate a score."""
    
    def audit_readme(self, content: str) -> Dict[str, Any]:
        """
        Analyze README content and return score + suggestions.
        
        Score breakdown (Total 100):
        - Length (20): > 500 characters
        - Structure (30): Has Title, Install, Usage, License headers
        - Visuals (20): Has images/screenshots
        - Code (15): Has code blocks
        - Clarity (15): Paragraph length, formatting
        """
        score = 0
        suggestions = []
        breakdown = {}
        
        # 1. Length Check (20 pts)
        length = len(content)
        if length > 1000:
            score += 20
            breakdown["length"] = 20
        elif length > 500:
            score += 10
            breakdown["length"] = 10
            suggestions.append("Expand your README. It's a bit short.")
        else:
            breakdown["length"] = 0
            suggestions.append("Your README is too short. Add more details.")
            
        # 2. Structure Check (30 pts)
        headers = re.findall(r'^#+\s+(.+)$', content, re.MULTILINE)
        headers_text = [h.lower() for h in headers]
        
        structure_score = 0
        required_sections = {
            "installation": ["install", "setup", "getting started"],
            "usage": ["usage", "how to use", "examples"],
            "license": ["license", "copyright"],
            "features": ["features", "capabilities"]
        }
        
        for section, keywords in required_sections.items():
            if any(any(k in h for k in keywords) for h in headers_text):
                structure_score += 7.5
            else:
                suggestions.append(f"Add a '{section.capitalize()}' section.")
                
        # Cap structure score at 30
        structure_score = min(30, structure_score)
        score += structure_score
        breakdown["structure"] = structure_score
        
        # 3. Visuals Check (20 pts)
        # Checks for ![alt](url) or <img src="...">
        has_images = bool(re.search(r'!\[.*?\]\(.*?\)|<img.*?src=.*?>', content))
        if has_images:
            score += 20
            breakdown["visuals"] = 20
        else:
            breakdown["visuals"] = 0
            suggestions.append("Add screenshots or diagrams. Visuals are key!")
            
        # 4. Code Blocks (15 pts)
        has_code = bool(re.search(r'```', content))
        if has_code:
            score += 15
            breakdown["code"] = 15
        else:
            breakdown["code"] = 0
            suggestions.append("Show, don't just tell. Add code examples.")
            
        # 5. Clarity/Formatting (15 pts)
        # Check for bolding, lists, links
        has_bold = bool(re.search(r'\*\*.*?\*\*', content))
        has_lists = bool(re.search(r'^\s*[-*]\s+', content, re.MULTILINE))
        has_links = bool(re.search(r'\[.*?\]\(.*?\)', content))
        
        clarity_score = 0
        if has_bold: clarity_score += 5
        if has_lists: clarity_score += 5
        if has_links: clarity_score += 5
        
        score += clarity_score
        breakdown["clarity"] = clarity_score
        if clarity_score < 15:
            suggestions.append("Use more formatting (bold, lists, links) to improve readability.")

        return {
            "score": int(score),
            "grade": self._get_grade(score),
            "breakdown": breakdown,
            "suggestions": suggestions
        }
        
    def _get_grade(self, score: int) -> str:
        if score >= 90: return "A+"
        if score >= 80: return "A"
        if score >= 70: return "B"
        if score >= 60: return "C"
        if score >= 50: return "D"
        return "F"
