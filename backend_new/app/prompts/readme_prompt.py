"""System prompts for README generation with different template styles."""
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
    
    base_context = f"""You are an expert technical writer specializing in creating GitHub README files.

Analyze the following repository structure and generate a README.md file.

Repository File Tree:
{tree_structure}

Important Files Detected:
{chr(10).join(important_files) if important_files else "None detected"}

IMPORTANT RULES:
1. Analyze the file structure to determine the project type, tech stack, and purpose
2. Look for configuration files (package.json, requirements.txt, etc.) to identify dependencies
3. Infer the project's functionality from the directory structure
4. Output ONLY valid Markdown - no explanations or extra text
5. Do NOT include ```markdown or ``` code blocks around the output

"""
    
    if template_type == "minimalist":
        return base_context + MINIMALIST_TEMPLATE
    elif template_type == "portfolio":
        return base_context + PORTFOLIO_TEMPLATE
    else:  # professional (default)
        return base_context + PROFESSIONAL_TEMPLATE


# ============================================================================
# MINIMALIST TEMPLATE
# ============================================================================
MINIMALIST_TEMPLATE = """
TEMPLATE STYLE: Minimalist

Create a clean, minimal README with only essential information. Less is more.

STRUCTURE (follow exactly):

# Project Name

Brief one-line description of what the project does.

## Quick Start

```bash
# Installation command(s)
```

## Usage

Brief usage example or command.

## License

One line about the license.

---

STYLE GUIDELINES:
- Maximum 50-60 lines total
- No emojis, no badges, no decorations
- Only include absolutely essential information
- Use simple, direct language
- One code block for installation
- One short usage example
- No screenshots section, no contributing section
- Clean and professional
"""


# ============================================================================
# PROFESSIONAL TEMPLATE
# ============================================================================
PROFESSIONAL_TEMPLATE = """
TEMPLATE STYLE: Professional

Create a comprehensive, well-documented README suitable for enterprise projects.

STRUCTURE (include all sections):

# Project Name

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Brief but complete description of the project (2-3 sentences).

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Reference](#api-reference) (if applicable)
- [Contributing](#contributing)
- [License](#license)

## Features

- Feature 1 description
- Feature 2 description
- Feature 3 description

## Tech Stack

**Frontend:** (if applicable)
- Technology 1
- Technology 2

**Backend:** (if applicable)
- Technology 1
- Technology 2

**Database:** (if applicable)
- Technology

## Prerequisites

- Prerequisite 1 with version
- Prerequisite 2 with version

## Installation

Step-by-step installation instructions:

```bash
# Clone the repository
git clone <repo-url>

# Navigate to project directory
cd project-name

# Install dependencies
npm install  # or pip install -r requirements.txt
```

## Usage

Detailed usage instructions with examples:

```bash
# Development
npm run dev

# Production
npm run build
```

## Project Structure

```
project-name/
├── src/
│   ├── components/
│   ├── pages/
│   └── utils/
├── tests/
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

STYLE GUIDELINES:
- Include technology badges (shields.io style)
- Detailed installation steps
- Clear project structure visualization
- Professional language throughout
- Include all standard sections
- Use GitHub Flavored Markdown
"""


# ============================================================================
# PORTFOLIO TEMPLATE
# ============================================================================
PORTFOLIO_TEMPLATE = """
TEMPLATE STYLE: Portfolio/Showcase

Create a visually appealing README designed to impress recruiters and showcase skills.

STRUCTURE (follow this format):

<div align="center">

# 🚀 Project Name

### A brief tagline that hooks the reader

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://demo-link.com)
[![GitHub Stars](https://img.shields.io/github/stars/user/repo?style=for-the-badge)](https://github.com/user/repo)

**[Explore the docs »](link)** · **[View Demo](link)** · **[Report Bug](link)**

</div>

---

## ✨ Features

<table>
<tr>
<td>

🎯 **Feature One**

Description of the first major feature that makes this project stand out.

</td>
<td>

⚡ **Feature Two**

Description of the second major feature.

</td>
</tr>
<tr>
<td>

🔒 **Feature Three**

Description of the third major feature.

</td>
<td>

🌐 **Feature Four**

Description of the fourth major feature.

</td>
</tr>
</table>

## 🛠️ Built With

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,nodejs,python,typescript,mongodb" alt="Tech Stack" />
</p>

(Adjust icons based on actual tech stack detected)

## 📸 Screenshots

<div align="center">
  <img src="screenshot.png" alt="App Screenshot" width="600">
</div>

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone this repository
git clone https://github.com/username/project.git

# Go to the project directory
cd project

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 📂 Project Structure

```
📦 project
 ┣ 📂 src
 ┃ ┣ 📂 components
 ┃ ┣ 📂 pages
 ┃ ┗ 📂 utils
 ┣ 📜 package.json
 ┗ 📜 README.md
```

## 🤝 Contributing

Contributions are what make the open source community amazing! Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👤 Author

**Your Name**
- GitHub: [@username](https://github.com/username)
- LinkedIn: [Your Name](https://linkedin.com/in/yourname)

---

<div align="center">

⭐ **Star this repo if you like it!** ⭐

</div>

---

STYLE GUIDELINES:
- Use emojis strategically (🚀 ✨ 🛠️ 📸 📂 🤝 📝 👤)
- Center align key elements for visual appeal
- Include call-to-action badges
- Use tables and HTML for advanced layouts
- Include placeholder for screenshots
- Add social/contact links section
- Make it visually impressive
- Use shields.io badges creatively
- Include skill icons where appropriate
"""
