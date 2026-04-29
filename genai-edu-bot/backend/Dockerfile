FROM python:3.10-slim

WORKDIR /app

# Copy application files
COPY . .

# Install dependencies directly since there's no requirements.txt
RUN pip install --no-cache-dir fastapi uvicorn pydantic groq

# Expose port
EXPOSE 8001

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
