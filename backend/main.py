from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import List
from models import User, LoginHistory, ChatMessage
from schemas import UserCreate, UserResponse, ChatMessageCreate, ChatMessageResponse
from database import init_db
from beanie import PydanticObjectId
import os
from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from chatbot import ChatMessage, ChatRequest, get_groq_response, create_system_prompt

load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class LoginRequest(BaseModel):
    email: str
    password: str

# Startup event
@app.on_event("startup")
async def startup_event():
    await init_db()

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, os.getenv("SECRET_KEY"), algorithm=os.getenv("ALGORITHM"))
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=[os.getenv("ALGORITHM")])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await User.get(user_id)
    if user is None:
        raise credentials_exception
    return user

# Authentication endpoints
@app.post("/register")
async def register(user: UserCreate):
    try:
        # Validate email
        if not user.email or user.email.strip() == "":
            return {"status": "error", "detail": "Email cannot be empty"}
            
        # Check if user already exists
        existing_user = await User.find_one({"email": user.email.lower()})
        if existing_user:
            return {"status": "error", "detail": "Email already registered"}
        
        # Create new user
        hashed_password = get_password_hash(user.password)
        db_user = User(
            email=user.email.lower(),
            name=user.name,
            hashed_password=hashed_password,
            address=user.address
        )
        await db_user.insert()
        
        # Create access token
        access_token = create_access_token(data={"sub": str(db_user.id)})
        
        return {
            "status": "ok",
            "data": access_token,
            "user": {
                "id": str(db_user.id),
                "email": db_user.email,
                "name": db_user.name
            }
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@app.post("/login")
async def login(login_data: LoginRequest):
    try:
        user = await User.find_one({"email": login_data.email.lower()})
        if not user:
            return {"status": "error", "detail": "Incorrect email or password"}
            
        if not verify_password(login_data.password, user.hashed_password):
            # Record failed login attempt
            login_history = LoginHistory(
                user_id=str(user.id),
                status="failed",
                failure_reason="Invalid password"
            )
            await login_history.insert()
            return {"status": "error", "detail": "Incorrect email or password"}
        
        # Record successful login
        login_history = LoginHistory(
            user_id=str(user.id),
            status="success"
        )
        await login_history.insert()
        
        access_token = create_access_token(data={"sub": str(user.id)})
        return {
            "status": "ok",
            "data": access_token,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name
            }
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}

# Keep the OAuth2 token endpoint for compatibility
@app.post("/token")
async def token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await User.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

# Chat endpoints
@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        # Add system prompt if it's a new conversation
        if len(request.messages) == 1:
            system_message = ChatMessage(role="system", content=create_system_prompt())
            request.messages.insert(0, system_message)
        
        # Get response from Groq
        response = await get_groq_response(request.messages)
        
        return {
            "status": "ok",
            "response": response
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@app.post("/chat/messages", response_model=ChatMessageResponse)
async def send_message(
    message: ChatMessageCreate,
    current_user: User = Depends(get_current_user)
):
    chat_message = ChatMessage(
        sender_id=str(current_user.id),
        receiver_id=message.receiver_id,
        message=message.message,
        message_type=message.message_type
    )
    await chat_message.insert()
    return chat_message

@app.get("/chat/messages/{receiver_id}", response_model=List[ChatMessageResponse])
async def get_messages(
    receiver_id: str,
    current_user: User = Depends(get_current_user)
):
    messages = await ChatMessage.find({
        "$or": [
            {"sender_id": str(current_user.id), "receiver_id": receiver_id},
            {"sender_id": receiver_id, "receiver_id": str(current_user.id)}
        ]
    }).to_list()
    return messages

@app.get("/chat/history", response_model=List[ChatMessageResponse])
async def get_chat_history(current_user: User = Depends(get_current_user)):
    messages = await ChatMessage.find({
        "$or": [
            {"sender_id": str(current_user.id)},
            {"receiver_id": str(current_user.id)}
        ]
    }).sort(-ChatMessage.timestamp).to_list()
    return messages

# Get current user endpoint
@app.get("/user/me")
async def get_current_user(current_user: User = Depends(get_current_user)):
    try:
        return {
            "status": "ok",
            "user": {
                "id": str(current_user.id),
                "email": current_user.email,
                "name": current_user.name
            }
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=os.getenv("HOST"), port=int(os.getenv("PORT"))) 