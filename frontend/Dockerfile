FROM node:18-slim

WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose port
EXPOSE 5173

# Command to run the development server
CMD ["npm", "run", "dev"]