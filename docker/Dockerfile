FROM node:slim

WORKDIR /node

# Copy server output
COPY server/dist /node/server
COPY server/package*.json /node/server/

# Copy Angular dist
COPY client/dist/browser /node/client

# Install production dependencies
WORKDIR /node/server
RUN npm ci --omit=dev

EXPOSE 3000
CMD ["node", "index.js"]
