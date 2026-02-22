# VibeDocs

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

VibeDocs is an AI-powered application designed to streamline the creation of comprehensive and professional GitHub README files. It features a robust Python FastAPI backend for AI generation, repository integration, and user management, coupled with an interactive React.js frontend for a seamless user experience and customization.

## Features

- **AI-Driven README Generation:** Leverages advanced AI models to generate tailored README content based on repository analysis and user input.
- **User Authentication & Management:** Secure user registration and login functionalities for personalized experiences.
- **GitHub Integration:** Connects with GitHub to fetch repository details and facilitate seamless README updates.
- **Dynamic Badge Generation:** Automatically creates and embeds relevant badges for project status, technologies, and more.
- **Intuitive Web Interface:** A modern and responsive React.js frontend for easy interaction, previewing, and managing generated READMEs.
- **Persistent Storage:** Utilizes a local SQLite database to store user data, generated READMEs, and repository information.
- **Containerized Environment:** Fully Dockerized setup for easy deployment and consistent development environments.

## Tech Stack

**Frontend:**

- React.js
- Vite
- JavaScript
- CSS
- Nginx (for serving static assets)

**Backend:**

- Python 3.13
- FastAPI
- SQLAlchemy (ORM)
- AI/LLM Integration (for prompt engineering and generation)
- Uvicorn (ASGI server)

**Database:**

- SQLite

**Containerization:**

- Docker
- Docker Compose

## Prerequisites

- Git
- Docker Engine (v20.10+)
- Docker Compose (v2.0+)

## Installation

Follow these steps to get VibeDocs up and running on your local machine:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Aaravshah2806/VibeDocs.git
    cd VibeDocs
    ```

2.  **Configure Environment Variables:**
    - For Docker Compose, copy the example file:
      ```bash
      cp .env.docker.example .env.docker
      ```
      Edit `.env.docker` to configure ports or other global settings if necessary.
    - For the Backend service, copy its example file:
      ```bash
      cp backend/.env.example backend/.env
      ```
      Edit `backend/.env` to configure database settings, API keys for AI services, or any other backend-specific variables.

3.  **Build and Run with Docker Compose:**
    ```bash
    docker-compose up --build -d
    ```
    This command will:
    - Build the Docker images for both the frontend and backend services.
    - Start the services in detached mode (`-d`).
    - Migrate the database (if defined in the backend's startup script).

## Usage

Once the Docker containers are running, you can access the application:

1.  **Access the Frontend:** Open your web browser and navigate to `http://localhost` (or the port you configured in `.env.docker` for the frontend service).

2.  **Register/Login:** Create a new user account or log in if you already have one.

3.  **Generate READMEs:**
    - Provide the necessary repository details (e.g., GitHub URL).
    - Customize your README preferences through the interactive interface.
    - Initiate the AI generation process to receive a comprehensive README.

4.  **Backend API:** The backend API will be accessible at `http://localhost:8000` (or the port configured for the backend service).

## Project Structure

```
VibeDocs/
├── .env.docker.example       # Example environment variables for Docker Compose
├── .gitignore                # Files/directories to ignore in Git
├── backend/                  # Python FastAPI Backend Service
│   ├── .dockerignore         # Docker ignore rules for backend
│   ├── .env.example          # Example environment variables for backend
│   ├── Dockerfile            # Dockerfile for building the backend image
│   ├── app/                  # FastAPI application source code
│   │   ├── config.py         # Application configuration settings
│   │   ├── database.py       # SQLAlchemy database connection and session management
│   │   ├── main.py           # Main FastAPI application entry point
│   │   ├── models/           # SQLAlchemy ORM models (User, Repository, Generation)
│   │   ├── prompts/          # AI prompt templates and management
│   │   ├── routers/          # FastAPI API endpoint modules (Auth, Generate, Repos)
│   │   ├── schemas/          # Pydantic schemas for request/response validation
│   │   └── services/         # Business logic and external integrations (AI generator, GitHub service)
│   ├── readme_ai.db          # SQLite database file (generated on first run)
│   ├── requirements.txt      # Python dependencies for the backend
│   └── run.py                # Script to run the backend application (e.g., for local development)
├── docker-compose.yml        # Docker Compose configuration for multi-service orchestration
├── frontend/                 # React.js Frontend Service
│   ├── .dockerignore         # Docker ignore rules for frontend
│   ├── .gitignore            # Git ignore rules for frontend
│   ├── Dockerfile            # Dockerfile for building the frontend image
│   ├── nginx.conf            # Nginx configuration to serve the React app
│   ├── package.json          # Node.js project dependencies and scripts
│   ├── public/               # Static assets (logos, favicons)
│   ├── src/                  # React application source code
│   │   ├── App.jsx           # Main React application component
│   │   └── components/       # Reusable React components (e.g., BadgeSelector, GlassSurface)
│   └── index.html            # Main HTML file for the React app
└── README.md                 # This project README file
```

## API Reference

The VibeDocs backend provides a comprehensive RESTful API. When the backend service is running, interactive API documentation is automatically generated and accessible:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

Key API endpoint categories include:

- `/auth`: User authentication, registration, and token management.
- `/repos`: Endpoints for managing and integrating with user repositories (e.g., fetching details).
- `/generate`: Endpoints dedicated to triggering and managing the AI-powered README generation process.

## Contributing

We welcome contributions to VibeDocs! To contribute, please follow these steps:

1.  **Fork** the repository on GitHub.
2.  **Clone** your forked repository to your local machine.
    ```bash
    git clone https://github.com/your-username/VibeDocs.git
    cd VibeDocs
    ```
3.  **Create a new branch** for your feature or bug fix.
    ```bash
    git checkout -b feature/amazing-feature
    ```
4.  **Make your changes** and ensure they adhere to the project's coding standards.
5.  **Commit your changes** with a clear and descriptive commit message.
    ```bash
    git commit -m 'feat: Add amazing feature'
    ```
6.  **Push your branch** to your forked repository.
    ```bash
    git push origin feature/amazing-feature
    ```
7.  **Open a Pull Request** against the `main` branch of the original repository. Provide a detailed description of your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
