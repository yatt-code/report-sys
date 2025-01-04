# Report System

A modern report management system built with FastAPI and React.

## Features

- Markdown-based report creation and editing
- Inline image support
- File attachments
- Full-text search
- Responsive design
- JWT Authentication
- Pagination and sorting

## Development Setup

### Backend Setup

1. Install Conda if you haven't already:
   ```bash
   # On macOS with Homebrew
   brew install --cask miniconda
   
   # Or download from official site
   # https://docs.conda.io/en/latest/miniconda.html
   ```

2. Create and activate Conda environment:
   ```bash
   # Create environment from environment.yml
   conda env create -f environment.yml
   
   # Activate environment
   conda activate report-sys
   ```

3. Run the backend server:
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Run the FastAPI server with auto-reload
   uvicorn app.main:app --reload --port 8000
   ```

4. The backend server will be running at `http://localhost:8000`
   - API documentation: `http://localhost:8000/docs`
   - Alternative docs: `http://localhost:8000/redoc`

### Frontend Setup

1. Install Node.js dependencies:
   ```bash
   # Navigate to frontend directory
   cd frontend
   
   # Install dependencies
   npm install
   ```

2. Set up environment variables:
   ```bash
   # Copy example env file
   cp .env.example .env
   
   # Edit .env file with your settings
   # VITE_API_URL=http://localhost:8000/api
   ```

3. Run the development server:
   ```bash
   # Start Vite dev server
   npm run dev
   ```

4. The frontend will be available at `http://localhost:5173`

## Project Structure

```
report-sys/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── core/        # Core functionality
│   │   ├── models/      # Database models
│   │   ├── routers/     # API routes
│   │   └── schemas/     # Pydantic schemas
│   └── tests/           # Backend tests
├── frontend/            # React frontend
│   ├── src/
│   │   ├── api/        # API client
│   │   ├── components/ # React components
│   │   ├── contexts/   # React contexts
│   │   └── pages/      # Page components
│   └── tests/          # Frontend tests
└── uploads/            # Uploaded files
```

## Environment Variables

### Backend
- `DATABASE_URL`: SQLite database URL
- `SECRET_KEY`: JWT secret key
- `ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiry

### Frontend
- `VITE_API_URL`: Backend API URL

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
