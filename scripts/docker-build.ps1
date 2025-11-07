# Docker Build and Test Script

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Boteco.pt Docker Build & Test Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
$dockerRunning = $false
try {
    docker ps 2>&1 | Out-Null
    $dockerRunning = $true
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start Docker Desktop and run this script again." -ForegroundColor Yellow
    Write-Host "Waiting for Docker Desktop to start..." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Building Docker image..." -ForegroundColor Yellow
Write-Host "This may take several minutes on first build..." -ForegroundColor Gray
Write-Host ""

# Build the image
docker build -t boteco-pt:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Docker image built successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Show image details
    Write-Host "Image details:" -ForegroundColor Cyan
    docker images boteco-pt:latest
    Write-Host ""
    
    # Ask if user wants to run the container
    $run = Read-Host "Do you want to run the container now? (y/n)"
    
    if ($run -eq 'y' -or $run -eq 'Y') {
        Write-Host ""
        Write-Host "Starting container..." -ForegroundColor Yellow
        
        # Stop and remove existing container if it exists
        docker stop boteco-pt 2>&1 | Out-Null
        docker rm boteco-pt 2>&1 | Out-Null
        
        # Run the container
        docker run -d `
            --name boteco-pt `
            -p 3000:80 `
            --restart unless-stopped `
            boteco-pt:latest
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✓ Container started successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Access the application at:" -ForegroundColor Cyan
            Write-Host "  → http://localhost:3000" -ForegroundColor White
            Write-Host "  → http://localhost:3000/pt" -ForegroundColor White
            Write-Host ""
            Write-Host "Useful commands:" -ForegroundColor Yellow
            Write-Host "  View logs:        docker logs -f boteco-pt" -ForegroundColor Gray
            Write-Host "  Stop container:   docker stop boteco-pt" -ForegroundColor Gray
            Write-Host "  Start container:  docker start boteco-pt" -ForegroundColor Gray
            Write-Host "  Remove container: docker rm boteco-pt" -ForegroundColor Gray
            Write-Host "  Container stats:  docker stats boteco-pt" -ForegroundColor Gray
            Write-Host ""
            
            # Wait a moment for container to start
            Start-Sleep -Seconds 3
            
            # Test health endpoint
            Write-Host "Testing health endpoint..." -ForegroundColor Yellow
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
                Write-Host "✓ Health check passed: $($response.Content)" -ForegroundColor Green
            } catch {
                Write-Host "⚠ Health check failed - container may still be starting" -ForegroundColor Yellow
            }
            Write-Host ""
            
            # Ask if user wants to view logs
            $logs = Read-Host "View container logs? (y/n)"
            if ($logs -eq 'y' -or $logs -eq 'Y') {
                docker logs -f boteco-pt
            }
        } else {
            Write-Host "✗ Failed to start container" -ForegroundColor Red
        }
    } else {
        Write-Host ""
        Write-Host "To run the container later, use:" -ForegroundColor Cyan
        Write-Host "  docker run -d -p 3000:80 --name boteco-pt boteco-pt:latest" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "✗ Docker build failed" -ForegroundColor Red
    Write-Host "Check the error messages above for details" -ForegroundColor Yellow
    Write-Host ""
}
