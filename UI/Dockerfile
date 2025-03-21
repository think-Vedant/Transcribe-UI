# Use a lightweight Node.js image
FROM node:18-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Build the Vite project
RUN npm run build

# Start a new container for serving the app
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile --production

# Copy built files from the previous build stage
COPY --from=build /app/dist /app/dist

# Install a lightweight HTTP server (e.g., serve)
RUN npm install -g serve

# Expose the port Vite preview server runs on (default 4173)
EXPOSE 4173

# Command to serve the built app
CMD ["serve", "-s", "dist", "-l", "4173"]
