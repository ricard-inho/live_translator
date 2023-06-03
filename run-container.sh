#!/bin/bash

container_name="backend-container"

# Check if a container with the same name already exists
if docker ps -a --format '{{.Names}}' | grep -q "^${container_name}\$"; then
    # Stop and remove the existing container
    docker stop "${container_name}"
    docker rm "${container_name}"
fi

# Run the new container
docker run -it --name "${container_name}" -p 8000:8000 -v /Users/ricardmarsalcastan/Documents/Projects/My_AI/app:/app -w /app my-ai-image