# Multi-stage build for BabyHealth application
# Stage 1: Build SPA (app-design / ex-Figma export)
FROM node:18-alpine AS frontend-builder

WORKDIR /app/app-design

COPY app-design/package.json ./
RUN npm install

COPY app-design/index.html app-design/vite.config.ts app-design/postcss.config.mjs ./
COPY app-design/src ./src
COPY app-design/guidelines ./guidelines

# Same-origin /api in container (FastAPI serves the built SPA)
ENV VITE_API_BASE_URL=

RUN npm run build


# Stage 2: Python runtime with FastAPI backend
FROM python:3.11-slim

WORKDIR /app

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend ./backend

# Copy built frontend from stage 1 (default path expected by backend config)
COPY --from=frontend-builder /app/app-design/dist ./frontend/dist

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Run the application
CMD ["sh", "-c", "cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT"]
