# Use a Node.js image, not a Java/Maven image!
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the backend package.json files first
COPY package*.json ./

# Install the backend dependencies
RUN npm install

# Copy the rest of the repository code (including 'client' and 'server.js')
COPY . .

# Run the build script defined in your backend package.json
# (This automatically drops into the 'client' folder, runs npm install, and builds React)
RUN npm run build

# Expose the port your server runs on
EXPOSE 5000

# Start the Node.js server
CMD [ "npm", "start" ]
