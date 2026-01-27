# 📘 Master Product Requirements Document (PRD)

## 1. Executive Summary & Goals

- **Project Name**: GitHub README AI
- **The Problem**: Writing high-quality READMEs is a repetitive, time-consuming task that developers often skip, leading to poorly documented projects.
- **The Vision**: To provide a seamless, AI-powered documentation experience where users can generate professional READMEs by simply selecting a repository from their dashboard or pasting a link.

---

## 2. Target Audience

- **User Personas**: Individual developers, open-source contributors, and students building portfolios.
- **User Story**:
  > "As a developer, I want to automatically generate documentation from my code structure so I can showcase my work professionally without manual writing."

---

## 3. Functional Requirements

### Phase 1: The Foundation (P0)

- **GitHub OAuth Integration**: Secure user login and repository access.
- **Repository Browser**: A dashboard to search and "Import" repositories directly using the GitHub API.
- **Metadata Extraction**: Automatically fetch file trees and primary languages.

### Phase 2: AI Core (P1)

- **AI Content Generation**: Analyze code logic using LLMs to write descriptive project sections.
- **Template Engine**: Offer styles like Minimalist, Professional, and Portfolio.
- **Live Preview**: Side-by-side Markdown editor with real-time rendering.

### Phase 3: Media & Export (P2)

- **Media Gallery**: Drag-and-drop support for project screenshots or GIFs.
- **Direct Commit**: Option to commit the generated file directly to the GitHub repository.

---

## 4. Technical Architecture

| Layer            | Technology                | Purpose                                              |
| :--------------- | :------------------------ | :--------------------------------------------------- |
| **Frontend**     | React.js &CSS    | For a fast, responsive, and developer-friendly UI.   |
| **Components**   | Shadcn UI                 | For consistent buttons, cards, and search inputs.    |
| **AI Brain**     | Claude 3.5 Sonnet         | For processing large file trees and generating text. |
| **Orchestrator** | LangChain                 | To manage prompts and AI responses.                  |
| **Backend**      | Python & SQLLite        | For secure authentication and data storage.          |

---

## 5. Database Schema (SQLLite)

### Users

_Stores profile & encrypted access tokens._

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  github_id TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Repositories

_Metadata for projects the user has imported._

```sql
CREATE TABLE repositories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  github_repo_id INTEGER NOT NULL,
  full_name TEXT NOT NULL,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### README Generations

_History of AI attempts and content._

```sql
CREATE TABLE readme_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repo_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  template_type TEXT DEFAULT 'professional',
  content TEXT, -- Generated Markdown
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 6. AI Instruction (System Prompt)

- **Role**: Expert Technical Writer.
- **Task**: Analyze the file tree (e.g., finding `package.json` or `requirements.txt`) to determine the tech stack and project purpose.
- **Output**: Return GitHub Flavored Markdown including Title, Features, Tech Stack (with badges), and Installation instructions.
