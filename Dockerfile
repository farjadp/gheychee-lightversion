# ============================================================================
# Hardware Source: Dockerfile
# Version: 2.0.0
# Why: Deploy Node.js bot with Python 3 + yt-dlp (pip) + ffmpeg
# Changelog: Install yt-dlp via pip for reliable Linux support
# Env / Identity: Production Container
# ============================================================================

# 1. Base image: Node.js 18 on Debian slim
FROM node:18-slim

# 2. Install system dependencies: Python 3, pip, ffmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ffmpeg \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 3. Install yt-dlp via pip (most reliable on Linux)
RUN pip3 install -q --break-system-packages yt-dlp

# 4. Verify yt-dlp is working
RUN yt-dlp --version

# 5. Create App Directory
WORKDIR /app

# 6. Copy Dependencies
COPY package*.json ./

# 7. Install Node Dependencies
RUN npm ci --omit=dev

# 8. Copy Source Code
COPY . .

# 9. Environment Variables
ENV NODE_ENV=production
ENV PORT=3000
# Tell youtube-dl-exec to use the system yt-dlp installed via pip
ENV YTDLP_PATH=/usr/local/bin/yt-dlp

# 10. Start
CMD ["npm", "start"]
