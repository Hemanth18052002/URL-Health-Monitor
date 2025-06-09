# URL Health Monitor

A modern web application for monitoring the health and uptime of multiple URLs. Built with FastAPI and React, this application provides real-time health checks and historical tracking for your URLs.

## Features

- Real-time URL health monitoring
- Multiple URL checking capability
- Response time measurement
- Uptime percentage calculation
- Historical tracking of URL checks
- Modern, responsive UI with Tailwind CSS
- Docker containerization for easy deployment

## Tech Stack

### Backend
- Python 3.11
- FastAPI (Web Framework)
- Uvicorn (ASGI Server)
- SQLite (Database)
- Pydantic (Data Validation)
- Requests (HTTP Client)

### Frontend
- React 19
- Vite (Build Tool)
- Tailwind CSS (Styling)
- Axios (HTTP Client)
- TypeScript (Type Safety)

## Project Structure

```
URLHealthMonitor/
├── backend/           # FastAPI backend service
│   ├── main.py        # Main FastAPI application
├── frontend/          # React frontend application
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   └── package.json   # Dependencies
├── docker-compose.yml # Docker configuration
└── requirements.txt   # Python dependencies
```

## Website

![image](https://github.com/user-attachments/assets/59057154-b89b-41d3-ae4a-6403eb22347d)

![image](https://github.com/user-attachments/assets/a06a01f2-9ccb-4229-8a80-9053e991b928)

![image](https://github.com/user-attachments/assets/d5f9aa16-af2a-4d96-bc6b-8c41e65c9531)


## Installation

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- Docker and Docker Compose

### Using Docker (Recommended)

1. Build and run the containers:
```bash
docker compose up --build
```

2. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8081

### Local Development

1. Backend:
```bash
cd backend
python -m uvicorn main:app --reload --port 8081
```

2. Frontend:
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Health Check
```http
POST /check-urls/
Content-Type: application/json

{
    "urls": "url1.com,url2.com"
}
```

### URL History
```http
GET /history/{url_id}
```

## Usage

1. Enter URLs in the input field (comma-separated)
2. Click "Check URLs" to start monitoring
3. View real-time health status and response times
4. Check historical data for each URL

## Dockerization

This application is fully containerized using Docker and Docker Compose, making it easy to deploy and run consistently across different environments. The project includes separate Docker configurations for both the backend (FastAPI) and frontend (React/Vite) services, with proper volume mounts for development and environment-based configurations. The docker-compose.yml file orchestrates both services, ensuring they work seamlessly together with proper networking and port mappings.

![image](https://github.com/user-attachments/assets/7393950b-fdf5-4726-85b0-d2e162c86c1e)


## AI Assistance

This project was developed with the assistance of Windsurf-Codieum AI, an advanced AI coding assistant designed by the Windsurf engineering team. Windsurf-Codieum provided expert guidance throughout the development process, helping with:
- Architecture design and implementation
- Docker containerization
- Error resolution and debugging
- Code optimization and best practices
- Documentation generation

![image](https://github.com/user-attachments/assets/19cb6852-af43-498a-bc58-5ca9f87afeb0)


## Acknowledgments

- FastAPI for the backend framework
- Vite for modern frontend development
- Tailwind CSS for styling
