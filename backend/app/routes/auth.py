from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.models.booking import User, UserRole, UserHistory
from app.services.auth_service import (
  authenticate_user, create_user, create_access_token, get_user, get_user_by_email
)
from app.dependencies import get_current_active_user

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/login")
async def login_for_access_token(
  form_data: OAuth2PasswordRequestForm = Depends(),
  db: Session = Depends(get_db)
):
  user = authenticate_user(db, form_data.username, form_data.password)
  if not user:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Incorrect username or password",
      headers={"WWW-Authenticate": "Bearer"},
    )
  access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
  access_token = create_access_token(
    data={"sub": user.username, "role": user.role},
    expires_delta=access_token_expires
  )
  return {
    "access_token": access_token,
    "token_type": "bearer",
    "user": {
      "id": user.id,
      "username": user.username,
      "email": user.email,
      "full_name": user.full_name,
      "role": user.role,
      "is_active": user.is_active
    }
  }


@router.post("/register")
async def register_user(
  username: str,
  email: str,
  password: str,
  full_name: str = "",
  role: str = UserRole.STAFF.value,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_active_user)
):
  # Only admins can register new users
  if current_user.role != UserRole.ADMIN.value:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Only admins can register new users"
    )
  # Disallow creating customer users
  if role == UserRole.CUSTOMER.value:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Cannot create customer users via this endpoint. Customers must be created through the front desk."
    )
  # Check if username exists
  existing_user = get_user(db, username)
  if existing_user:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Username already registered"
    )
  # Check if email exists
  existing_email = get_user_by_email(db, email)
  if existing_email:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Email already registered"
    )
  # Create user
  user = create_user(db, username, email, password, full_name, role)
  
  # Log creation in history
  history_entry = UserHistory(
    user_id=user.id,
    username=user.username,
    full_name=user.full_name,
    email=user.email,
    role=user.role,
    action="created",
    action_by=current_user.username,
    started_at=user.created_at
  )
  db.add(history_entry)
  db.commit()
  
  return {
    "success": True,
    "user": {
      "id": user.id,
      "username": user.username,
      "email": user.email,
      "full_name": user.full_name,
      "role": user.role
    }
  }


@router.get("/users")
async def get_all_users(
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_active_user)
):
  # Only admins can get all users
  if current_user.role != UserRole.ADMIN.value:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Only admins can view all users"
    )
  users = db.query(User).all()
  return [{
    "id": user.id,
    "username": user.username,
    "email": user.email,
    "full_name": user.full_name,
    "role": user.role,
    "is_active": user.is_active,
    "created_at": user.created_at.isoformat() if user.created_at else None
  } for user in users]


@router.get("/users/history")
async def get_user_history(
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_active_user)
):
  # Only admins can view user history
  if current_user.role != UserRole.ADMIN.value:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Only admins can view user history"
    )
  history = db.query(UserHistory).order_by(UserHistory.action_at.desc()).all()
  return [{
    "id": entry.id,
    "user_id": entry.user_id,
    "username": entry.username,
    "full_name": entry.full_name,
    "email": entry.email,
    "role": entry.role,
    "action": entry.action,
    "action_by": entry.action_by,
    "action_at": entry.action_at.isoformat() if entry.action_at else None,
    "started_at": entry.started_at.isoformat() if entry.started_at else None,
    "ended_at": entry.ended_at.isoformat() if entry.ended_at else None
  } for entry in history]


@router.delete("/users/{user_id}")
async def delete_user(
  user_id: int,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_active_user)
):
  # Only admins can delete users
  if current_user.role != UserRole.ADMIN.value:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Only admins can delete users"
    )
  # Don't allow deleting yourself
  if current_user.id == user_id:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Cannot delete your own account"
    )
  # Find the user
  user = db.query(User).filter(User.id == user_id).first()
  if not user:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="User not found"
    )
  
  # Log deletion in history
  history_entry = UserHistory(
    user_id=user.id,
    username=user.username,
    full_name=user.full_name,
    email=user.email,
    role=user.role,
    action="deleted",
    action_by=current_user.username,
    started_at=user.created_at,
    ended_at=datetime.utcnow()
  )
  db.add(history_entry)
  
  # Delete the user
  db.delete(user)
  db.commit()
  return {"success": True, "message": "User deleted successfully"}


@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_active_user)):
  return {
    "id": current_user.id,
    "username": current_user.username,
    "email": current_user.email,
    "full_name": current_user.full_name,
    "role": current_user.role,
    "is_active": current_user.is_active,
    "created_at": current_user.created_at.isoformat() if current_user.created_at else None
  }
