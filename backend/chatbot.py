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
            print(response.json()["choices"][0]["message"]["content"])
            return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Groq call failed: {e}")
        return "Sorry, I couldn't fetch a response at the moment."

def create_system_prompt() -> str:
    return """
    You are a friendly and helpful chatbot on a site called Fododot and your name is FodoBot, where users come to discover recipes.
    Your job is to suggest recipe names based on the ingredients the user lists.
    
    - By default, only suggest recipes that use **exactly those ingredients** and nothing more.
    - If the user explicitly allows it, then and only then, you may include recipes with extra ingredients.
    
    Keep your responses concise, polite, and approachable. You're here to help, not to overwhelm.
    Be civil and friendly—after all, a happy user might just leave you a tip!
    Keep the output structured keep each line within 3-5 words.
    Add a newline character after end of each line
    """

