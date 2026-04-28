from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from datetime import timedelta
from app.models.user import User
from app.services.auth import get_password_hash, verify_password, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    username: str
    email: str
    role: str

@router.post("/register", response_model=UserResponse)
async def register(req: RegisterRequest):
    exists = await User.find_one(User.username == req.username)
    if exists:
        raise HTTPException(status_code=400, detail="Username already registered")
    email_exists = await User.find_one(User.email == req.email)
    if email_exists:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user = User(
        username=req.username,
        email=req.email,
        hashed_password=get_password_hash(req.password),
        role="operator"
    )
    await user.insert()
    return UserResponse(username=user.username, email=user.email, role=user.role)

@router.post("/login", response_model=Token)
async def login(req: LoginRequest):
    user = await User.find_one(User.username == req.username)
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        username=current_user.username, 
        email=current_user.email, 
        role=current_user.role
    )
