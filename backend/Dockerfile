FROM python:3.11-slim

WORKDIR /app

# Install uv for fast dependency resolution
RUN pip install uv

# Install Python dependencies
COPY requirements.txt .
RUN uv pip install --system -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8000

# Run DB migrations then start the server
CMD alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000
