# Docker Build Troubleshooting

## Issue: Build Failed - Missing Module Resolution

### Error Message
```
[vite]: Rollup failed to resolve import "@/components/ui/toaster" from "/app/src/App.tsx".
```

### Root Cause
The `.dockerignore` file was excluding TypeScript and Vite configuration files that are required for the build process.

### Solution Applied
Updated `.dockerignore` to include necessary build configuration files:
- `tsconfig*.json` - TypeScript configuration
- `vite.config.ts` - Vite bundler configuration  
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `components.json` - shadcn/ui component registry

### Files Modified
✅ `.dockerignore` - Removed exclusions for build-critical config files

## Docker Desktop Not Running

### Error Message
```
ERROR: error during connect: open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

### Solution
1. **Start Docker Desktop**
   - Windows: Search for "Docker Desktop" in Start Menu
   - Mac: Open Docker Desktop from Applications
   - Linux: Run `sudo systemctl start docker`

2. **Wait for Docker to fully initialize**
   - Look for the Docker whale icon in system tray
   - Icon should be static (not animated)
   - May take 30-60 seconds

3. **Verify Docker is running**
   ```powershell
   docker ps
   ```
   Should return a list of containers (may be empty)

## Build Process

Once Docker Desktop is running:

### Option 1: Automated Script (Recommended)
```powershell
.\docker-build.ps1
```

This script will:
- ✅ Check Docker status
- ✅ Build the image
- ✅ Optionally run the container
- ✅ Test health endpoint
- ✅ Display logs

### Option 2: Manual Build
```bash
# Build the image
docker build -t boteco-pt:latest .

# Expected output:
# - [builder 1/7] FROM node:20-alpine
# - [builder 2/7] RUN npm install -g pnpm@10
# - [builder 3/7] WORKDIR /app
# - [builder 4/7] COPY package.json pnpm-lock.yaml ./
# - [builder 5/7] RUN pnpm install --frozen-lockfile
# - [builder 6/7] COPY . .
# - [builder 7/7] RUN pnpm build
# - [production 1/3] FROM nginx:alpine
# - [production 2/3] COPY nginx.conf /etc/nginx/nginx.conf
# - [production 3/3] COPY --from=builder /app/dist /usr/share/nginx/html
# - Successfully built [image-id]
# - Successfully tagged boteco-pt:latest

# Run the container
docker run -d -p 3000:80 --name boteco-pt boteco-pt:latest

# Verify it's running
docker ps

# Test the application
curl http://localhost:3000/health
curl http://localhost:3000/pt
```

## Common Build Issues

### Issue 1: Build fails with "ELIFECYCLE Command failed"

**Cause**: Missing dependencies or configuration files

**Solution**:
1. Verify local build works: `pnpm build`
2. Check `.dockerignore` isn't excluding needed files
3. Ensure all config files are present:
   - `package.json`
   - `pnpm-lock.yaml`
   - `tsconfig.json`
   - `vite.config.ts`
   - `tailwind.config.ts`

### Issue 2: "node_modules not found" during build

**Cause**: `.dockerignore` is correct (it should exclude node_modules)

**Solution**: This is expected. Docker installs dependencies in the container with `RUN pnpm install`

### Issue 3: Build is very slow

**Cause**: First build or no Docker layer caching

**Solution**:
- First build: 5-10 minutes (normal)
- Subsequent builds: 30-60 seconds (with cache)
- To clear cache: `docker build --no-cache -t boteco-pt:latest .`

### Issue 4: "COPY failed: file not found"

**Cause**: File is excluded in `.dockerignore`

**Solution**: Review `.dockerignore` and remove exclusion if file is needed for build

### Issue 5: Port already in use

**Error**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution**:
```bash
# Find what's using the port
netstat -ano | findstr :3000

# Use a different port
docker run -d -p 8080:80 --name boteco-pt boteco-pt:latest

# Or stop the existing container
docker stop boteco-pt
docker rm boteco-pt
```

## Verification Steps

After successful build:

### 1. Check Image
```bash
# List images
docker images boteco-pt:latest

# Expected:
# REPOSITORY   TAG      IMAGE ID       CREATED         SIZE
# boteco-pt    latest   [hash]         [time]          ~25-30MB
```

### 2. Run Container
```bash
# Start container
docker run -d -p 3000:80 --name boteco-pt boteco-pt:latest

# Check status
docker ps

# Expected:
# CONTAINER ID   IMAGE              STATUS         PORTS                  NAMES
# [hash]         boteco-pt:latest   Up [time]      0.0.0.0:3000->80/tcp   boteco-pt
```

### 3. Test Endpoints
```bash
# Health check
curl http://localhost:3000/health
# Expected: "healthy"

# Homepage
curl http://localhost:3000/pt
# Expected: HTML content

# Check response headers
curl -I http://localhost:3000/pt
# Expected:
# HTTP/1.1 200 OK
# Content-Type: text/html
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
```

### 4. View Logs
```bash
# Follow logs
docker logs -f boteco-pt

# Expected:
# [nginx startup messages]
# No errors
```

## Build Performance

### Typical Build Times
- **First build**: 5-10 minutes
  - Download base images
  - Install all dependencies
  - Build application

- **Cached build**: 30-60 seconds
  - Reuse cached layers
  - Only rebuild changed parts

### Optimizing Build Time
1. **Don't change `package.json` frequently**
   - Dependencies layer is cached
   - Changing forces reinstall

2. **Use `.dockerignore` wisely**
   - Smaller context = faster transfer
   - Already optimized in this project

3. **Multi-stage build benefits**
   - Build stage discarded
   - Only final artifacts in image
   - Smaller image = faster deployment

## Next Steps

Once build succeeds:

1. ✅ **Test locally**
   ```bash
   docker run -d -p 3000:80 --name boteco-pt boteco-pt:latest
   ```

2. ✅ **Verify all routes**
   - http://localhost:3000/pt (Portuguese)
   - http://localhost:3000/en (English)
   - http://localhost:3000/es (Spanish)
   - http://localhost:3000/fr (French)

3. ✅ **Test theme switching**
   - Dark/light mode should work
   - No theme flash on load

4. ✅ **Check health endpoint**
   ```bash
   curl http://localhost:3000/health
   ```

5. ✅ **Review logs**
   ```bash
   docker logs boteco-pt
   ```

6. ✅ **Push to registry** (when ready)
   ```bash
   docker tag boteco-pt:latest username/boteco-pt:1.0.0
   docker push username/boteco-pt:1.0.0
   ```

## Getting Help

If issues persist:

1. **Check Docker logs**:
   ```bash
   docker logs boteco-pt
   ```

2. **Check build logs**:
   ```bash
   docker build --progress=plain -t boteco-pt:latest .
   ```

3. **Inspect container**:
   ```bash
   docker exec -it boteco-pt sh
   ls -la /usr/share/nginx/html
   cat /etc/nginx/nginx.conf
   ```

4. **Clean Docker cache**:
   ```bash
   docker system prune -a
   docker build --no-cache -t boteco-pt:latest .
   ```

---

**Status**: ✅ `.dockerignore` fixed - Ready to build when Docker Desktop starts
