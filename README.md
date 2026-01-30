# VibeDocs

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

VibeDocs is a full-stack web application designed to revolutionize the creation of professional and engaging README files for GitHub repositories. Leveraging AI capabilities, it intelligently analyzes repository contents and user inputs to generate comprehensive markdown documentation, significantly enhancing project discoverability and clarity.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## Features

- **AI-Powered README Generation:** Automatically generates detailed and structured READMEs by analyzing repository files and code.
- **GitHub Integration:** Seamlessly connect and fetch repository information directly from your GitHub account.
- **User Authentication & Management:** Secure user registration and login, allowing personalized experiences and saved generations.
- **Interactive Markdown Preview:** Visualize your README in real-time before finalizing and saving.
- **Dashboard Overview:** Manage your generated READMEs and connected repositories from a centralized dashboard.
- **Modular & Scalable Architecture:** Built with a clear separation of concerns using FastAPI for the backend and React for the frontend.
- **Containerized Development:** Easy setup and deployment using Docker and Docker Compose for consistent environments.

## Tech Stack

**Frontend:**
- **React.js:** A JavaScript library for building user interfaces.
- **Vite:** A fast build tool that provides an instant development server and bundles your code for production.
- **JavaScript/ES6+:** Core programming language.
- **CSS:** For styling and responsive design.
- **Nginx:** High-performance web server used to serve the static frontend assets.

**Backend:**
- **Python:** The primary programming language.
- **FastAPI:** A modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints.
- **SQLAlchemy:** SQL toolkit and Object-Relational Mapper (ORM) for interacting with the database.
- **SQLite:** Lightweight, file-based relational database used for development.
- **Docker:** Containerization platform for packaging the application and its dependencies.
- **AI/LLM Integration:** Utilizes an underlying Language Model (LLM) for content generation (e.g., OpenAI, implied by `ai_generator.py`).

**Orchestration:**
- **Docker Compose:** Tool for defining and running multi-container Docker applications.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Git:** For cloning the repository.
  - [Download Git](https://git-scm.com/downloads)
- **Docker Engine (v20.10+):** For running containerized applications.
  - [Install Docker](https://docs.docker.com/engine/install/)
- **Docker Compose (v2.0+):** For orchestrating multi-container applications.
  - [Install Docker Compose](https://docs.docker.com/compose/install/)

## Installation

Follow these steps to get VibeDocs up and running on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Aaravshah2806/VibeDocs.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd VibeDocs
    ```

3.  **Configure Environment Variables:**
    Copy the example environment file and rename it to `.env`.
    ```bash
    cp .env.docker.example .env
    ```
    Open the `.env` file and update the variables as needed, especially for GitHub API keys and AI service credentials.

4.  **Build and Run with Docker Compose:**
    Execute the following command to build the Docker images and start the services in detached mode:
    ```bash
    docker-compose up --build -d
    ```
    This command will:
    - Build the `backend_new` Docker image based on `backend_new/Dockerfile`.
    - Build the `frontend` Docker image based on `frontend/Dockerfile`.
    - Create and start the `backend` and `frontend` containers.
    - Set up the necessary network configurations.

## Usage

Once the Docker containers are running, you can access VibeDocs:

1.  **Access the Frontend:**
    Open your web browser and navigate to `http://localhost:80`.
    You should see the VibeDocs user interface.

2.  **Register and Log In:**
    Create a new account or log in if you already have one.

3.  **Connect GitHub (Optional but Recommended):**
    Navigate to the settings or integration section to connect your GitHub account. This allows VibeDocs to fetch your repository details.

4.  **Generate a README:**
    Go to the "Generator" page, select a repository (or provide repository details manually), and initiate the AI generation process. Review and customize the generated markdown using the integrated preview.

5.  **Explore the Dashboard:**
    Visit the dashboard to view your history of generated READMEs and manage your connected repositories.

## Project Structure

```
VibeDocs/
├── .env.docker.example     # Example environment variables for Docker Compose
├── .gitignore              # Specifies intentionally untracked files to ignore
├── backend_implementation_plan.md # Development plan for backend
├── backend_new/            # Backend service directory
│   ├── .dockerignore       # Files to ignore when building backend Docker image
│   ├── .env.example        # Example environment variables for backend (local)
│   ├── Dockerfile          # Dockerfile for the backend service
│   ├── README.md           # README for the backend service
│   ├── app/                # Backend application source code
│   │   ├── config.py       # Configuration settings
│   │   ├── database.py     # Database connection and session management
│   │   ├── main.py         # FastAPI application entry point
│   │   ├── models/         # Database models (User, Repository, Generation)
│   │   ├── prompts/        # AI prompt definitions (e.g., readme_prompt.py)
│   │   ├── routers/        # API route definitions (auth, generate, repos)
│   │   ├── schemas/        # Pydantic schemas for data validation
│   │   └── services/       # Business logic services (AI generator, GitHub API)
│   ├── readme_ai.db        # SQLite database file
│   └── requirements.txt    # Python dependencies
├── frontend/               # Frontend service directory
│   ├── .dockerignore       # Files to ignore when building frontend Docker image
│   ├── .gitignore          # Files to ignore for frontend git
│   ├── Dockerfile          # Dockerfile for the frontend service
│   ├── README.md           # README for the frontend service
│   ├── nginx.conf          # Nginx configuration for serving frontend
│   ├── package.json        # Node.js project configuration and dependencies
│   ├── public/             # Static assets (logos, favicons)
│   └── src/                # Frontend application source code
│       ├── App.jsx         # Main React application component
│       ├── assets/         # Images and other static assets
│       ├── components/     # Reusable React components
│       ├── pages/          # Page-level React components (Dashboard, Generator)
│       └── main.jsx        # Frontend entry point
└── docker-compose.yml      # Defines and configures the multi-container application
```

## API Reference

The backend API is built with FastAPI, which automatically generates interactive API documentation. Once the application is running, you can access the documentation at:

-   **Swagger UI:** `http://localhost:8000/docs`
-   **ReDoc:** `http://localhost:8000/redoc`

These interfaces allow you to explore available endpoints, request/response schemas, and even test the API directly from your browser.

## Contributing

We welcome contributions to VibeDocs! To contribute, please follow these steps:

1.  **Fork the repository:** Click the "Fork" button at the top right of this page.
2.  **Clone your forked repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/VibeDocs.git
    cd VibeDocs
    ```
3.  **Create a new branch:**
    ```bash
    git checkout -b feature/your-feature-name
    ```
4.  **Make your changes:** Implement your feature or fix bugs.
5.  **Commit your changes:**
    ```bash
    git commit -m 'feat: Add amazing feature'
    ```
    (Please follow conventional commit messages if possible)
6.  **Push to your branch:**
    ```bash
    git push origin feature/your-feature-name
    ```
7.  **Open a Pull Request:** Go to the original repository on GitHub and open a new Pull Request from your forked branch. Provide a clear description of your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
