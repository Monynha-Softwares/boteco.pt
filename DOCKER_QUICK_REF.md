# Docker Quick Reference

## Build Commands

```bash
# Basic build
docker build -t boteco-pt:latest .

# Build with environment variables
docker build \
  --build-arg VITE_CLERK_PUBLISHABLE_KEY=your_key \
  --build-arg VITE_CLERK_FRONTEND_API_URL=your_url \
  -t boteco-pt:latest .

# Build with version tag
docker build -t boteco-pt:1.0.0 .
docker tag boteco-pt:1.0.0 boteco-pt:latest
```

## Run Commands

```bash
# Run on port 3000
docker run -d -p 3000:80 --name boteco-pt boteco-pt:latest

# Run on port 80
docker run -d -p 80:80 --name boteco-pt boteco-pt:latest

# Run with auto-restart
docker run -d \
  --name boteco-pt \
  -p 3000:80 \
  --restart unless-stopped \
  boteco-pt:latest
```

## Management Commands

```bash
# View logs
docker logs -f boteco-pt

# View container stats
docker stats boteco-pt

# Stop container
docker stop boteco-pt

# Start container
docker start boteco-pt

# Restart container
docker restart boteco-pt

# Remove container
docker rm boteco-pt

# Remove container (force)
docker rm -f boteco-pt

# Execute command in container
docker exec -it boteco-pt sh

# Inspect container
docker inspect boteco-pt

# View nginx config
docker exec boteco-pt cat /etc/nginx/nginx.conf
```

## Docker Compose Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Stop and remove volumes
docker-compose down -v
```

## Health Checks

```bash
# Check health status
docker ps --filter name=boteco-pt

# Manual health check
curl http://localhost:3000/health

# Health check from inside container
docker exec boteco-pt wget -qO- http://localhost/health
```

## Cleanup Commands

```bash
# Remove image
docker rmi boteco-pt:latest

# Remove all unused images
docker image prune -a

# Remove all stopped containers
docker container prune

# Complete cleanup (use with caution!)
docker system prune -a --volumes
```

## Testing

```bash
# Test the application
curl http://localhost:3000/pt
curl -I http://localhost:3000/pt
curl http://localhost:3000/health

# Test gzip compression
curl -H "Accept-Encoding: gzip" -I http://localhost:3000/pt

# Test different locales
curl http://localhost:3000/en
curl http://localhost:3000/es
curl http://localhost:3000/fr
```

## Automated Scripts

### Windows (PowerShell)
```powershell
.\docker-build.ps1
```

### Linux/Mac (Bash)
```bash
chmod +x docker-build.sh
./docker-build.sh
```

## Common Issues

### Container won't start
```bash
# Check logs for errors
docker logs boteco-pt

# Test nginx configuration
docker exec boteco-pt nginx -t
```

### Port already in use
```bash
# Find what's using the port
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Use different port
docker run -d -p 8080:80 --name boteco-pt boteco-pt:latest
```

### Image too large
```bash
# Check image size
docker images boteco-pt:latest

# View image layers
docker history boteco-pt:latest

# Use multi-stage build (already configured)
```

## Production Deployment

### Push to Docker Hub
```bash
# Login
docker login

# Tag image
docker tag boteco-pt:latest username/boteco-pt:latest
docker tag boteco-pt:latest username/boteco-pt:1.0.0

# Push
docker push username/boteco-pt:latest
docker push username/boteco-pt:1.0.0
```

### Pull and Run
```bash
# Pull image
docker pull username/boteco-pt:latest

# Run
docker run -d -p 80:80 --name boteco-pt username/boteco-pt:latest
```

## URLs

- Local: http://localhost:3000
- Portuguese: http://localhost:3000/pt
- English: http://localhost:3000/en
- Spanish: http://localhost:3000/es
- French: http://localhost:3000/fr
- Health: http://localhost:3000/health

---

**See also**: `docs/DOCKER_DEPLOYMENT.md` for comprehensive guide
