import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

app = FastAPI(title="Triage Agent API")

# Add CORS Middleware to allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# We will initialize the client inside the endpoint to ensure it picks up the latest key

class TriageRequest(BaseModel):
    message: str

class Entity(BaseModel):
    entity_type: str
    value: str

class TriageResponse(BaseModel):
    urgency: str
    intent: str
    entities: list[Entity]
    draft_response: str

@app.get("/")
def home():
    return {"message": "Triage Agent API is running."}

@app.post("/api/triage")
def triage_message(request: TriageRequest):
    from pathlib import Path
    env_path = Path(__file__).parent / ".env"
    load_dotenv(dotenv_path=env_path, override=True)
    
    api_key = os.getenv("GROQ_API_KEY") or os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        raise HTTPException(status_code=500, detail="Groq API key not found in .env file.")
        
    # Strip any accidental quotes or whitespace
    api_key = api_key.strip().strip('"').strip("'")
    
    try:
        client = Groq(api_key=api_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize Groq client: {e}")
        
    prompt = f"""
    You are an expert triage assistant for a Non-Profit organization.
    Analyze the following incoming message and return ONLY a valid JSON object.
    Do not include any markdown formatting like ```json.
    
    The JSON object must have these exact keys:
    1. "urgency": String ('High', 'Medium', 'Low').
    2. "intent": String (e.g., 'Donation Issue', 'Volunteer Inquiry', 'Information Request').
    3. "entities": Array of objects, where each object has "entity_type" (e.g., 'Name', 'Date', 'Donor ID') and "value".
    4. "draft_response": String (A highly structured, professional draft response).
    
    CRITICAL: The "draft_response" MUST be heavily structured. It MUST include:
    - A clear "Subject:" line at the very top.
    - Double newlines (\\n\\n) between paragraphs to ensure it is highly readable and well spaced.
    - A polite greeting.
    - Bullet points (using -) if explaining multiple steps or details.
    - A professional sign-off.
    
    Incoming Message:
    {request.message}
    """
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that outputs only JSON."
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        
        result_text = chat_completion.choices[0].message.content
        result = json.loads(result_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))