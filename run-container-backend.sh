#!/bin/bash

container_name="backend-container"

# Check if a container with the same name already exists
if docker ps -a --format '{{.Names}}' | grep -q "^${container_name}\$"; then
    # Stop and remove the existing container
    docker stop "${container_name}"
    docker rm "${container_name}"
fi

# Run the new container
# Check if GPU is available
if nvidia-smi &> /dev/null; then
    # Run with GPU
    docker run -it --gpus device=0 --name "${container_name}" -p 8000:8000 -v /mnt/ricard/ricard/ricard/My_AI/backend/app:/app -w /app my-ai-image-backend
else
    # Run without GPU
    docker run -it --name "${container_name}" -p 8000:8000 -v /mnt/ricard/ricard/ricard/My_AI/backend/app:/app -w /app my-ai-image-backend
fi