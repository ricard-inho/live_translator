# Use an official Node.js runtime as the base image
FROM node:14-alpine

RUN npm install --save recordrtc
RUN npm install worker-loader

WORKDIR /app

# Define the command to start the React app
CMD ["npm", "start"]
