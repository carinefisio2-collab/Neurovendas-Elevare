"""
Auth Routes Module - Elevare NeuroVendas
Módulo de autenticação separado para melhor organização
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta
from typing import Optional
import jwt
import uuid
import os

# Router instance
router = APIRouter(prefix="/auth", tags=["Authentication"])

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
JWT_SECRET = os.environ.get("JWT_SECRET", "elevare-neurovendas-jwt-secret-2024-ultra-secure")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# Pydantic Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    token: str
    user: dict

# Helper Functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

# Database dependency will be injected from main server
db = None

def set_database(database):
    global db
    db = database

# Routes
@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    """Registra novo usuário"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Check if email exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    new_user = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "hashed_password": hashed_password,
        "plan": "free",
        "credits": 999999,  # Beta mode
        "xp": 0,
        "level": 1,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "onboarding_completed": False,
        "diagnosis_completed": False,
    }
    
    await db.users.insert_one(new_user)
    
    # Generate token
    token = create_access_token({"user_id": user_id})
    
    # Return user without sensitive data
    user_response = {k: v for k, v in new_user.items() if k not in ["hashed_password", "_id"]}
    
    return {"token": token, "user": user_response}

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Autentica usuário existente"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    user = await db.users.find_one({"email": credentials.email})
    
    if not user:
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")
    
    if not user.get("hashed_password"):
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")
    
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")
    
    # Generate token
    token = create_access_token({"user_id": user["id"]})
    
    # Return user without sensitive data
    user_response = {k: v for k, v in user.items() if k not in ["hashed_password", "_id"]}
    
    return {"token": token, "user": user_response}
