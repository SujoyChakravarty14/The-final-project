from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
import json
import random

import os

# ✅ Initialize Gemini client (NEW SDK)
client = Groq(api_key=os.environ.get("GROQ_API_KEY", "YOUR_API_KEY_HERE"))

# Initialize app
app = FastAPI()

# ✅ CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost",
        "http://127.0.0.1"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global storage
user_history = []
current_question = {}

# Dataset
donor_emails = [
    {
        "id": 1,
        "body": "We are seeking support for children's education.",
        "ideal_answer": "A warm, appreciative response explaining impact."
    },
    {
        "id": 2,
        "body": "We appreciate your past donation. Would you like to continue supporting?",
        "ideal_answer": "Grateful tone with encouragement for continued support."
    },
    {
        "id": 3,
        "body": "Your contribution can help provide food to needy families.",
        "ideal_answer": "Empathetic and motivating response."
    }
]

# Request model
class UserResponse(BaseModel):
    answer: str

# Root endpoint
@app.get("/")
def home():
    return {"message": "AI Education Bot is running 🚀"}

# Get question
@app.get("/question")
def get_question():
    global current_question
    current_question = random.choice(donor_emails)
    return current_question

# Submit answer
@app.post("/submit")
def submit_answer(response: UserResponse):
    if not current_question:
        return {"error": "No question loaded. Call /question first."}

    raw_output = evaluate_answer(response.answer)

    try:
        evaluation = json.loads(raw_output)
    except:
        evaluation = {"error": raw_output}

    user_history.append({
        "question": current_question,
        "answer": response.answer,
        "evaluation": evaluation
    })

    return {
        "your_answer": response.answer,
        "evaluation": evaluation
    }

# Gemini evaluation function
def evaluate_answer(user_answer):
    prompt = f"""
You are an expert in nonprofit fundraising communication.

Evaluate the user's response based on:
- Personalization (0-3)
- Clarity (0-2)
- Emotional Tone (0-3)
- Call-to-Action (0-2)

Donor Email:
{current_question['body']}

Ideal Answer:
{current_question['ideal_answer']}

User Answer:
{user_answer}

Return ONLY valid JSON:
{{
    "score": number,
    "strengths": ["point1"],
    "weaknesses": ["point1"],
    "improved_answer": "text"
}}
"""

    completion = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[
        {"role": "system", "content": "Return ONLY valid JSON."},
        {"role": "user", "content": prompt}
    ]
)

    return completion.choices[0].message.content

# History endpoint
@app.get("/history")
def get_history():
    return user_history