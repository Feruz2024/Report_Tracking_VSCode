# Backend Dockerfile for Django
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y build-essential libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project files
COPY . /app/

# Collect static files (optional, for production)
# RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Default command
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]
