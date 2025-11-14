# Docker Deployment Guide

## Overview

This project uses a multi-stage Docker build for optimal production deployment:
- **Stage 1 (Builder)**: Builds the React application using Node.js 20 and pnpm
- **Stage 2 (Production)**: Serves the static files using nginx Alpine (minimal footprint)

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

Access the application at: http://localhost

### Option 2: Docker CLI

```bash
# Build the image
docker build -t boteco-pt:latest .

# Run the container
docker run -d \
  --name boteco-pt \
  -p 80:80 \
  --restart unless-stopped \
  boteco-pt:latest

# View logs
docker logs -f boteco-pt

# Stop and remove
docker stop boteco-pt
docker rm boteco-pt
```

## Production Deployment

### Environment Variables

For production, you can inject environment variables at build time:

```bash
docker build \
  --build-arg VITE_CLERK_PUBLISHABLE_KEY=your_key \
  --build-arg VITE_CLERK_FRONTEND_API_URL=your_url \
  -t boteco-pt:latest .
```

### Port Configuration

By default, the container exposes port 80. To use a different port:

```bash
# Run on port 8080 instead of 80
docker run -d -p 8080:80 boteco-pt:latest
```

### Docker Hub Deployment

```bash
# Tag the image
docker tag boteco-pt:latest your-username/boteco-pt:latest
docker tag boteco-pt:latest your-username/boteco-pt:1.0.0

# Push to Docker Hub
docker push your-username/boteco-pt:latest
docker push your-username/boteco-pt:1.0.0
```

## Image Optimization

The production image is optimized with:
- ✅ **Multi-stage build** (only production assets in final image)
- ✅ **Alpine Linux** (minimal base image ~5MB)
- ✅ **nginx** (efficient static file serving)
- ✅ **Gzip compression** (reduced bandwidth)
- ✅ **Cache headers** (optimal browser caching)
- ✅ **Health checks** (container orchestration support)

### Image Size
- Builder stage: ~900MB (discarded)
- Final image: ~25-30MB (nginx + built assets)

## Configuration Files

### Dockerfile
Multi-stage build configuration with builder and production stages.

### nginx.conf
Production-ready nginx configuration with:
- SPA routing support (all routes → index.html)
- Static asset caching (1 year for immutable assets)
- Security headers (XSS, frame options, etc.)
- Gzip compression
- Health check endpoint at `/health`

### .dockerignore
Excludes unnecessary files from Docker context:
- node_modules
- Development files
- Test files
- Documentation
- Git files

## Testing

### Build Test

```bash
# Build the image
docker build -t boteco-pt:test .

# Check image size
docker images boteco-pt:test

# Inspect the image
docker inspect boteco-pt:test
```

### Runtime Test

```bash
# Start the container
docker run -d -p 3000:80 --name boteco-test boteco-pt:test

# Test the application
curl http://localhost:3000/health
curl -I http://localhost:3000/pt

# Check logs
docker logs boteco-test

# Cleanup
docker stop boteco-test
docker rm boteco-test
```

### Health Check

```bash
# Check container health status
docker ps --filter name=boteco-pt

# Manual health check
docker exec boteco-pt wget -qO- http://localhost/health
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs boteco-pt

# Check nginx configuration
docker exec -it boteco-pt nginx -t
```

### Build fails

```bash
# Build with verbose output
docker build --progress=plain -t boteco-pt:latest .

# Check Docker context size
docker build --no-cache -t boteco-pt:debug .
```

### Routes not working (404 errors)

The nginx configuration should handle SPA routing. Verify:
```bash
# Check nginx config in container
docker exec -it boteco-pt cat /etc/nginx/nginx.conf

# Restart nginx
docker exec -it boteco-pt nginx -s reload
```

## Production Best Practices

1. **Use specific image tags** (not just `latest`)
   ```bash
   docker build -t boteco-pt:1.0.0 .
   ```

2. **Scan for vulnerabilities**
   ```bash
   docker scan boteco-pt:latest
   ```

3. **Use Docker secrets** for sensitive data (in orchestration)
   ```yaml
   # docker-compose with secrets
   secrets:
     - clerk_key
   ```

4. **Set resource limits**
   ```bash
   docker run -d \
     --cpus="0.5" \
     --memory="512m" \
     -p 80:80 \
     boteco-pt:latest
   ```

5. **Enable logging drivers**
   ```bash
   docker run -d \
     --log-driver=json-file \
     --log-opt max-size=10m \
     --log-opt max-file=3 \
     boteco-pt:latest
   ```

## Kubernetes Deployment

Example Kubernetes deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: boteco-pt
spec:
  replicas: 3
  selector:
    matchLabels:
      app: boteco-pt
  template:
    metadata:
      labels:
        app: boteco-pt
    spec:
      containers:
      - name: boteco-pt
        image: your-username/boteco-pt:1.0.0
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 30
---
apiVersion: v1
kind: Service
metadata:
  name: boteco-pt
spec:
  selector:
    app: boteco-pt
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build & Push

on:
  push:
    tags:
      - 'v*'

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t boteco-pt:${{ github.ref_name }} .
      
      - name: Push to registry
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker push boteco-pt:${{ github.ref_name }}
```

## Monitoring

Monitor container health:

```bash
# Container stats
docker stats boteco-pt

# Resource usage
docker exec boteco-pt top

# Nginx access logs
docker logs -f boteco-pt

# Nginx error logs
docker exec boteco-pt tail -f /var/log/nginx/error.log
```

---

**Image**: `boteco-pt:latest`  
**Base**: `nginx:alpine`  
**Exposed Port**: `80`  
**Health Endpoint**: `/health`
