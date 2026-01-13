# ============================================================================
# Hardware Source: Dockerfile
# Version: 1.0.0
# Why: Deploy Node.js bot with Python 3.10+ support for yt-dlp
# Env / Identity: Production Container
# ============================================================================

# 1. Use a base image that has Python (easier to install Node on it or vice versa)
# We use Python 3.11-slim as base to ensure reliable yt-dlp support
FROM python:3.11-slim

# 2. Install Node.js (Version 18 or 20)
# We use curl to fetch the setup script
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 3. Create App Directory
WORKDIR /app

# 4. Copy Dependencies
COPY package*.json ./

# 5. Install Node Dependencies
# --omit=dev keeps it light for production
RUN npm ci --omit=dev

# 6. Copy Source Code
COPY . .

# 7. Environment Variables
# These should be overridden by Cloud Run secrets, but defaults help
ENV NODE_ENV=production
ENV PORT=3000

# 8. Start
CMD ["npm", "start"]
