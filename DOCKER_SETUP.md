# Docker Setup Guide

## Overview
This project includes Docker configuration for:
- **Frontend**: React + Vite with Nginx
- **Backend**: Go with Fiber framework
- **Redis**: Caching layer
- **PostgreSQL**: Database

## Prerequisites
- Docker (v20.10+)
- Docker Compose (v1.29+)

## Quick Start

### 1. Build and Start All Services
```bash
docker-compose up --build
```

### 2. Access Services
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Redis**: localhost:6379
- **Database**: localhost:5432

## Environment Setup

### Backend (.env)
Copy `.env.example` to `.env` in the backend folder:
```bash
cp backend/.env.example backend/.env
```

### Frontend (.env)
Copy `.env.example` to `.env` in the frontend/logis folder:
```bash
cp frontend/.env.example frontend/.env
```

## Docker Compose Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f redis
docker-compose logs -f db
```

### Restart Services
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Rebuild Services
```bash
docker-compose build --no-cache
docker-compose up -d
```

## Database Setup

### Connect to Database
```bash
docker exec -it logis-db psql -U logis_user -d logis_db
```

### Run Migrations (if applicable)
```bash
docker exec -it logis-backend go run . migrate
```

## Redis Management

### Connect to Redis
```bash
docker exec -it logis-redis redis-cli
```

### Check Redis Status
```bash
docker exec -it logis-redis redis-cli ping
```

### Flush Redis (Clear Cache)
```bash
docker exec -it logis-redis redis-cli FLUSHALL
```

## Troubleshooting

### Port Already in Use
If ports 3000, 8080, 5432, or 6379 are already in use, modify `docker-compose.yml`:
```yaml
ports:
  - "3001:80"  # Change 3000 to 3001
```

### Database Connection Issues
```bash
# Check if database is healthy
docker-compose ps

# View database logs
docker-compose logs db
```

### Frontend Not Connecting to Backend
Check that the `VITE_API_URL` environment variable matches your backend service name and port.

### Clear Everything and Start Fresh
```bash
docker-compose down -v
docker-compose up --build
```

## Production Considerations

### Security
- Change default passwords in `.env`
- Update JWT secret key
- Enable HTTPS with SSL certificates
- Restrict CORS origins

### Performance
- Enable Redis caching
- Use environment-specific configs
- Add CDN for static assets
- Enable database query caching

### Monitoring
- Add health checks
- Set up logging aggregation
- Monitor container resources
- Set up alerts

## File Structure
```
project/
├── docker-compose.yml          # Main docker-compose file
├── backend/
│   ├── dockerfile              # Backend docker image
│   ├── .dockerignore
│   ├── .env.example
│   └── ...
├── frontend/
│   ├── dockerfile              # Frontend docker image
│   ├── nginx.conf              # Nginx configuration
│   ├── .dockerignore
│   ├── .env.example
│   └── logis/
│       ├── package.json
│       └── ...
└── README.md
```

## Useful Docker Commands

### View Running Containers
```bash
docker ps
```

### View All Images
```bash
docker images
```

### Remove Unused Images
```bash
docker image prune
```

### Remove Unused Volumes
```bash
docker volume prune
```

### Execute Command in Container
```bash
docker exec -it logis-backend sh
docker exec -it logis-frontend sh
```

## Notes
- All services are on the same network `logis-network` for inter-container communication
- Frontend can access backend at `http://backend:8080` within containers
- Database credentials must be kept in `.env` (never commit to git)
- Redis persists data using AOF (Append Only File)
- Postgres data persists in `postgres_data` volume
