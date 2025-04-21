from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    category: str

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str
    name: str
    address: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    address: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    is_active: bool
    address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class OrderItemBase(BaseModel):
    item_id: int
    quantity: int
    price: float

class OrderBase(BaseModel):
    user_id: int
    total_amount: float
    status: str
    items: List[OrderItemBase]

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: int

    class Config:
        from_attributes = True

class ChatMessageCreate(BaseModel):
    receiver_id: str
    message: str
    message_type: str = "text"

class ChatMessageResponse(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    message: str
    timestamp: datetime
    is_read: bool
    message_type: str

    class Config:
        from_attributes = True 