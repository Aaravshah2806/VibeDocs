# GitHub README AI - Backend Implementation Plan

Build a Python backend for the GitHub README AI application using FastAPI, SQLite, LangChain, and Claude 3.5 Sonnet.

---

## Proposed Changes

### Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry
│   ├── config.py            # Environment & settings
│   ├── database.py          # SQLite connection
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py          # User model
│   │   ├── repository.py    # Repository model
│   │   └── generation.py    # README generation model
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── schemas.py       # Pydantic request/response
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py          # Clerk JWT verification
│   │   ├── repos.py         # GitHub repo endpoints
│   │   └── generate.py      # AI generation endpoint
│   ├── services/
│   │   ├── __init__.py
│   │   ├── github.py        # GitHub API client
│   │   └── ai_generator.py  # LangChain + Claude
│   └── prompts/
│       └── readme_prompt.py # System prompt templates
├── .env                     # API keys (not tracked)
├── requirements.txt
└── README.md
```

---

### Dependencies

| Package               | Purpose                          |
| --------------------- | -------------------------------- |
| `fastapi`             | Web framework                    |
| `uvicorn`             | ASGI server                      |
| `sqlalchemy`          | ORM for SQLite                   |
| `pydantic`            | Data validation                  |
| `httpx`               | Async HTTP client for GitHub API |
| `langchain`           | AI orchestration                 |
| `langchain-anthropic` | Claude integration               |
| `python-jose`         | JWT verification (Clerk)         |
| `cryptography`        | Token encryption                 |

---

### API Endpoints

#### Auth Router (`/api/auth`)

| Method | Endpoint | Description                     |
| ------ | -------- | ------------------------------- |
| GET    | `/me`    | Get current user from Clerk JWT |

#### Repos Router (`/api/repos`)

| Method | Endpoint          | Description                     |
| ------ | ----------------- | ------------------------------- |
| GET    | `/`               | List user's GitHub repositories |
| GET    | `/{repo_id}`      | Get repository details          |
| GET    | `/{repo_id}/tree` | Fetch file tree from GitHub     |
| POST   | `/import`         | Import/sync a repository        |

#### Generate Router (`/api/generate`)

| Method | Endpoint           | Description             |
| ------ | ------------------ | ----------------------- |
| POST   | `/`                | Generate README with AI |
| GET    | `/history`         | List past generations   |
| GET    | `/{generation_id}` | Get specific generation |
| POST   | `/commit`          | Commit README to GitHub |

---

### Database Models (SQLite)

#### Users Table

| Column              | Type     | Description           |
| ------------------- | -------- | --------------------- |
| id                  | UUID     | Primary key           |
| clerk_user_id       | TEXT     | Clerk's user ID       |
| github_username     | TEXT     | GitHub username       |
| github_access_token | TEXT     | Encrypted OAuth token |
| created_at          | DATETIME | Account creation      |

#### Repositories Table

| Column         | Type     | Description         |
| -------------- | -------- | ------------------- |
| id             | UUID     | Primary key         |
| user_id        | UUID     | Foreign key → Users |
| github_repo_id | INTEGER  | GitHub's repo ID    |
| full_name      | TEXT     | owner/repo format   |
| default_branch | TEXT     | main/master         |
| last_synced_at | DATETIME | Last sync time      |

#### Generations Table

| Column        | Type     | Description                       |
| ------------- | -------- | --------------------------------- |
| id            | UUID     | Primary key                       |
| repo_id       | UUID     | Foreign key → Repositories        |
| template_type | TEXT     | minimalist/professional/portfolio |
| content       | TEXT     | Generated markdown                |
| status        | TEXT     | pending/completed/failed          |
| created_at    | DATETIME | Generation time                   |

---

### GitHub Integration

1. **Clerk OAuth** → Get GitHub access token from Clerk
2. **Fetch Repos** → `GET https://api.github.com/user/repos`
3. **Fetch Tree** → `GET https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1`
4. **Read Files** → `GET https://api.github.com/repos/{owner}/{repo}/contents/{path}`
5. **Commit README** → `PUT https://api.github.com/repos/{owner}/{repo}/contents/README.md`

---

### AI Generation Flow (LangChain + Claude)

**Key Files to Analyze:**

- `package.json` / `requirements.txt` → Dependencies
- `README.md` (existing) → Context
- `src/` or `app/` structure → Architecture
- `.github/workflows/` → CI/CD info

**Template Types:**
| Template | Style |
|----------|-------|
| Minimalist | Title, description, install, usage |
| Professional | Full docs with badges, API reference |
| Portfolio | Showcase-ready with screenshots |

---

### Environment Variables

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=sqlite:///./readme_ai.db
CLERK_SECRET_KEY=sk_live_...
```

---

## Prerequisites

1. **Clerk**: Enable GitHub OAuth in Dashboard (User & Authentication → Social Connections)
2. **Anthropic**: Get API key from [console.anthropic.com](https://console.anthropic.com)

---

## Verification

1. Run `uvicorn app.main:app --reload`
2. Test `/api/repos` returns GitHub repos
3. Test `/api/generate` creates README content
