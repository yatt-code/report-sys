# Report System

A self-hosted reporting system with markdown support and modern features.

## Features (MVP)

- User authentication (login/logout)
- Report creation with markdown support
- Image upload capability
- Basic dashboard
- Mobile-responsive design

## Tech Stack

### Backend
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- PostgreSQL (Database)
- Alembic (Database migrations)

### Frontend
- React + Vite
- TailwindCSS
- React Router
- React Markdown

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL

### Development Setup
1. Clone the repository
2. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

## Project Structure
```
report-sys/
├── backend/           # FastAPI application
├── frontend/          # React application
└── docker-compose.yml # Docker compose configuration
```
