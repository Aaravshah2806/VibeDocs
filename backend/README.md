# VibeDocs Backend v2.0

AI-powered README generation backend for GitHub repositories.

## Features

- 🔐 **Clerk Authentication** - Secure JWT-based authentication
- 📂 **Repository Management** - List, import, and sync GitHub repos
- 🔍 **Code Analysis** - Automatic tech stack detection
- 🤖 **Dual AI Support** - Gemini or Claude for README generation
- 📝 **Multiple Templates** - Minimalist, Professional, Portfolio
- 📤 **GitHub Commit** - Push READMEs directly to your repos

## Quick Start

### 1. Setup Environment

```bash
cd backend_new

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Unix/Mac)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit with your keys
# Required: GEMINI_API_KEY, CLERK_SECRET_KEY
# Optional: GITHUB_TOKEN (fallback), ANTHROPIC_API_KEY
```

### 3. Run the Server

```bash
# Development mode
python run.py

# Or with uvicorn directly
uvicorn app.main:app --reload --port 8000
```

### 4. Access API

- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/sync` | Sync user with GitHub |
| GET | `/api/auth/github-status` | Check GitHub connection |

### Repositories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/repos/` | List GitHub repositories |
| GET | `/api/repos/imported` | List imported repos |
| GET | `/api/repos/fetch/{id}` | Fetch repo by ID or owner/repo |
| POST | `/api/repos/import` | Import a repository |
| GET | `/api/repos/{id}` | Get repository details |
| GET | `/api/repos/{id}/details` | Get full repo details with tree |
| GET | `/api/repos/{id}/tree` | Get file tree |
| DELETE | `/api/repos/{id}` | Remove imported repo |

### README Generation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate/` | Start async generation |
| POST | `/api/generate/sync` | Sync generation (blocks) |
| GET | `/api/generate/history` | Generation history |
| GET | `/api/generate/{id}` | Get generation status |
| POST | `/api/generate/commit` | Commit to GitHub |

### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analysis/{id}` | Analyze repository |
| GET | `/api/analysis/{id}/tech-stack` | Get tech stack only |

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes* | Google Gemini API key |
| `ANTHROPIC_API_KEY` | Alt* | Anthropic Claude API key |
| `CLERK_SECRET_KEY` | Yes | Clerk authentication key |
| `GITHUB_TOKEN` | No | Fallback GitHub PAT |
| `DATABASE_URL` | No | Default: SQLite |
| `CORS_ORIGINS` | No | Allowed origins |

*At least one AI key required

## Project Structure

```
backend_new/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry
│   ├── config.py            # Environment settings
│   ├── database.py          # SQLite setup
│   ├── models/
│   │   ├── user.py
│   │   ├── repository.py
│   │   └── generation.py
│   ├── schemas/
│   │   └── schemas.py       # Pydantic models
│   ├── routers/
│   │   ├── auth.py          # Authentication
│   │   ├── repos.py         # Repository CRUD
│   │   ├── generate.py      # README generation
│   │   └── analysis.py      # Tech stack analysis
│   ├── services/
│   │   ├── github.py        # GitHub API client
│   │   ├── ai_generator.py  # AI generation
│   │   └── code_analyzer.py # Tech detection
│   └── prompts/
│       └── readme_prompt.py # AI prompts
├── .env.example
├── requirements.txt
├── run.py
└── README.md
```

## License

MIT
