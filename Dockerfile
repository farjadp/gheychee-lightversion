# ============================================================================
# Hardware Source: Dockerfile
# Version: 1.0.0
# Why: Deploy Node.js bot with Python 3.10+ support for yt-dlp
# Env / Identity: Production Container
# ============================================================================

# 1. Use a base image that has Python (easier to install Node on it or vice versa)
# We use Python 3.11-slim as base to ensure reliable yt-dlp support
# 1. Use Node.js as the primary base image
FROM node:18-slim

# 2. Install Python 3 and dependencies for yt-dlp
# We need python3 for yt-dlp to run.
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 3. Create App Directory
WORKDIR /app

# 4. Copy Dependencies
COPY package*.json ./

# 5. Install Node Dependencies
RUN npm ci --omit=dev

# 6. Copy Source Code
COPY . .

# 7. Environment Variables
ENV NODE_ENV=production
ENV PORT=3000

# 8. Start
CMD ["npm", "start"]
