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
│   ├── main.py       # Main FastAPI application
│   ├── models.py     # Database models
│   └── schemas.py    # Pydantic schemas
├── frontend/          # React frontend application
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── package.json  # Dependencies
├── docker-compose.yml # Docker configuration
└── requirements.txt   # Python dependencies
```

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository.

## Acknowledgments

- FastAPI for the backend framework
- Vite for modern frontend development
- Tailwind CSS for styling
