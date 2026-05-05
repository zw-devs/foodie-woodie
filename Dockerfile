# Use a lightweight Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy dependency files first (optimizes Docker caching)
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate the Prisma Client
RUN npx prisma generate

# Expose the port your Express app uses
EXPOSE 3000

# Start the application using your dev script
CMD ["npm", "run", "dev"]