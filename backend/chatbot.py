from typing import List
from pydantic import BaseModel
import os
import httpx
from dotenv import load_dotenv

load_dotenv()
# print("DEBUG GROQ KEY:", os.getenv("GROQ_API_KEY"))
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

async def get_groq_response(messages: List[ChatMessage]) -> str:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    formatted_messages = [{"role": m.role, "content": m.content} for m in messages]

    data = {
        "model": "llama3-8b-8192",
        "messages": formatted_messages,
        "temperature": 0.7,
        # "max_tokens": 1024
    }

    try:
        async with httpx.AsyncClient() as client:
            print("DEBUG formatted_messages:", formatted_messages)
            response = await client.post(GROQ_API_URL, headers=headers, json=data)
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Groq call failed: {e}")
        return "Sorry, I couldn't fetch a response at the moment."

def create_system_prompt() -> str:
    return """You are a restaurant chatbot. Based on the user chat history and available menu items, suggest the best recipe that fits the user's preferences. If no clear preferences are found, suggest a popular or suitable dish from the menu. Keep it simple and concise."""
