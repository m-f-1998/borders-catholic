FROM node:slim

RUN mkdir -p /home/node
RUN chown -R node:node /home/node

WORKDIR /node

# Copy server output
COPY --chown=node:node server/dist /node/server
COPY --chown=node:node server/package*.json /node/server/

# Copy Angular dist
COPY --chown=node:node client/dist/browser /node/client

# Assets
COPY --chown=node:node assets /node/assets

RUN apt-get update && apt-get install -y --no-install-recommends nano

# Set a non-root user (optional, good practice)
USER node

# Install production dependencies
WORKDIR /node/server
RUN npm ci --prefer-offline --no-audit --omit=dev

EXPOSE 3000
CMD ["node", "index.js"]
