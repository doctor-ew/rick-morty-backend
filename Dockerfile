# Use an official Node.js runtime as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json to the container
COPY package*.json ./

# Install the application dependencies inside the container
RUN npm install

# Copy the rest of the application to the container
COPY . .

# Specify the command to run when the container starts
CMD [ "npm", "start" ]
