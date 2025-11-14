#!/bin/bash

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}=====================================${NC}"
echo -e "${CYAN}Boteco.pt Docker Build & Test Script${NC}"
echo -e "${CYAN}=====================================${NC}"
echo ""

# Check if Docker is running
echo -e "${YELLOW}Checking Docker status...${NC}"
if ! docker ps &> /dev/null; then
    echo -e "${RED}✗ Docker is not running${NC}"
    echo ""
    echo -e "${YELLOW}Please start Docker and run this script again.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Build the image
echo -e "${YELLOW}Building Docker image...${NC}"
echo -e "${GRAY}This may take several minutes on first build...${NC}"
echo ""

docker build -t boteco-pt:latest .

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Docker image built successfully!${NC}"
    echo ""
    
    # Show image details
    echo -e "${CYAN}Image details:${NC}"
    docker images boteco-pt:latest
    echo ""
    
    # Ask if user wants to run the container
    read -p "Do you want to run the container now? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${YELLOW}Starting container...${NC}"
        
        # Stop and remove existing container if it exists
        docker stop boteco-pt 2>/dev/null
        docker rm boteco-pt 2>/dev/null
        
        # Run the container
        docker run -d \
            --name boteco-pt \
            -p 3000:80 \
            --restart unless-stopped \
            boteco-pt:latest
        
        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✓ Container started successfully!${NC}"
            echo ""
            echo -e "${CYAN}Access the application at:${NC}"
            echo -e "  → ${WHITE}http://localhost:3000${NC}"
            echo -e "  → ${WHITE}http://localhost:3000/pt${NC}"
            echo ""
            echo -e "${YELLOW}Useful commands:${NC}"
            echo -e "  ${GRAY}View logs:        docker logs -f boteco-pt${NC}"
            echo -e "  ${GRAY}Stop container:   docker stop boteco-pt${NC}"
            echo -e "  ${GRAY}Start container:  docker start boteco-pt${NC}"
            echo -e "  ${GRAY}Remove container: docker rm boteco-pt${NC}"
            echo -e "  ${GRAY}Container stats:  docker stats boteco-pt${NC}"
            echo ""
            
            # Wait a moment for container to start
            sleep 3
            
            # Test health endpoint
            echo -e "${YELLOW}Testing health endpoint...${NC}"
            if curl -s -f http://localhost:3000/health > /dev/null; then
                echo -e "${GREEN}✓ Health check passed${NC}"
            else
                echo -e "${YELLOW}⚠ Health check failed - container may still be starting${NC}"
            fi
            echo ""
            
            # Ask if user wants to view logs
            read -p "View container logs? (y/n) " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                docker logs -f boteco-pt
            fi
        else
            echo -e "${RED}✗ Failed to start container${NC}"
        fi
    else
        echo ""
        echo -e "${CYAN}To run the container later, use:${NC}"
        echo -e "  ${WHITE}docker run -d -p 3000:80 --name boteco-pt boteco-pt:latest${NC}"
        echo ""
    fi
else
    echo ""
    echo -e "${RED}✗ Docker build failed${NC}"
    echo -e "${YELLOW}Check the error messages above for details${NC}"
    echo ""
fi
