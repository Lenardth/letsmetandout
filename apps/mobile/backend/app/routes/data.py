from datetime import date, datetime
from decimal import Decimal
from typing import Any, Optional

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import inspect, select, text
from sqlalchemy.orm import Session

from app.models.user import User, UserStatus
from app.utils.database import engine, get_db
from app.utils.security import get_current_active_user

def require_profile(user: User = Depends(get_current_active_user)):
    if not all(value and value.strip() for value in [user.first_name, user.last_name, user.city, user.province]):
        raise HTTPException(status_code=403, detail="Complete your profile before using SafeMeet")
    return user


router = APIRouter(tags=["Data"], dependencies=[Depends(require_profile)])


def serialize_value(value: Any):
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    return value


def table_exists(table_name: str) -> bool:
    return table_name in inspect(engine).get_table_names()


def rows_from_table(db: Session, table_name: str, limit: int = 50):
    if not table_exists(table_name):
        return []

    result = db.execute(text(f"SELECT * FROM {table_name} LIMIT :limit"), {"limit": limit})
    return [
        {key: serialize_value(value) for key, value in row._mapping.items()}
        for row in result
    ]


@router.get("/discover/users")
def discover_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    current_user_id: Optional[int] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
):
    query = select(User).where(User.status.notin_([UserStatus.DEACTIVATED, UserStatus.SUSPENDED]), User.id != current_user.id).limit(limit)

    users = db.scalars(query).all()
    return [
        {
            "id": user.id,
            "name": user.full_name,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "bio": user.bio,
            "city": user.city,
            "province": user.province,
            "location": ", ".join(part for part in [user.city, user.province] if part),
            "interests": user.interests or [],
            "image": user.profile_photo_url,
            "verificationLevel": user.verification_level.value,
            "emailVerified": user.email_verified,
            "phoneVerified": user.phone_verified,
            "idVerified": user.id_verified,
            "createdAt": serialize_value(user.created_at),
        }
        for user in users
    ]


@router.get("/groups")
def list_groups(db: Session = Depends(get_db), limit: int = Query(default=50, ge=1, le=100)):
    return rows_from_table(db, "groups", limit)


@router.get("/plans")
def list_plans(db: Session = Depends(get_db), limit: int = Query(default=50, ge=1, le=100)):
    return rows_from_table(db, "meetup_plans", limit)


@router.get("/bookings")
def list_bookings(db: Session = Depends(get_db), limit: int = Query(default=50, ge=1, le=100), current_user: User = Depends(get_current_active_user)):
    if not table_exists("bookings") or "user_id" not in {column["name"] for column in inspect(engine).get_columns("bookings")}:
        return []
    result = db.execute(text("SELECT * FROM bookings WHERE user_id = :user_id LIMIT :limit"), {"user_id": current_user.id, "limit": limit})
    return [{key: serialize_value(value) for key, value in row._mapping.items()} for row in result]


@router.get("/stores")
def list_stores(db: Session = Depends(get_db), limit: int = Query(default=50, ge=1, le=100)):
    return rows_from_table(db, "stores", limit)


@router.get("/wallet/summary")
def wallet_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    transactions = []
    balance = 0

    if table_exists("wallet_transactions"):
        query = "SELECT * FROM wallet_transactions"
        params: dict[str, Any] = {}
        query += " WHERE user_id = :user_id"
        params["user_id"] = current_user.id
        query += " ORDER BY created_at DESC LIMIT 20"
        result = db.execute(text(query), params)
        transactions = [
            {key: serialize_value(value) for key, value in row._mapping.items()}
            for row in result
        ]
        balance = float(db.execute(text("SELECT COALESCE(SUM(amount), 0) FROM wallet_transactions WHERE user_id = :user_id"), {"user_id": current_user.id}).scalar() or 0)

    return {
        "balance": balance,
        "transactions": transactions,
    }
