# Stage 1: Build
FROM python:3.12-slim-bookworm AS builder

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Final
FROM python:3.12-slim-bookworm

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY . .

# Ensure the database directory is writable (for SQLite on EFS)
# EFS will be mounted to /app/data
RUN mkdir -p /app/data && chmod -R 777 /app/data

# Set environment variables
ENV SQLALCHEMY_DATABASE_URL=sqlite+aiosqlite:////app/data/sql_app.db
ENV PORT=8000

# Expose the port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main.py:app", "--host", "0.0.0.0", "--port", "8000"]
