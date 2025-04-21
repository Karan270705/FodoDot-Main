from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from dotenv import load_dotenv
from models import User, LoginHistory, ChatMessage

load_dotenv()

async def init_db():
    # Create Motor client
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    
    # Initialize beanie with the Product document class and database
    await init_beanie(
        database=client.services_db,  # Your exact database name
        document_models=[
            User,
            LoginHistory,
            ChatMessage
        ]
    ) 