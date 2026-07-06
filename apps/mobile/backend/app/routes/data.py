from datetime import date, datetime
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import inspect, select, text
from sqlalchemy.orm import Session

from app.models.user import User, UserStatus
from app.utils.database import engine, get_db

router = APIRouter(tags=["Data"])


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
    current_user_id: int | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
):
    query = select(User).where(User.status != UserStatus.DEACTIVATED).limit(limit)
    if current_user_id:
        query = query.where(User.id != current_user_id)

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
def list_bookings(db: Session = Depends(get_db), limit: int = Query(default=50, ge=1, le=100)):
    return rows_from_table(db, "bookings", limit)


@router.get("/stores")
def list_stores(db: Session = Depends(get_db), limit: int = Query(default=50, ge=1, le=100)):
    return rows_from_table(db, "stores", limit)


@router.get("/wallet/summary")
def wallet_summary(user_id: int | None = None, db: Session = Depends(get_db)):
    transactions = []
    balance = 0

    if table_exists("wallet_transactions"):
        query = "SELECT * FROM wallet_transactions"
        params: dict[str, Any] = {}
        if user_id:
            query += " WHERE user_id = :user_id"
            params["user_id"] = user_id
        query += " ORDER BY created_at DESC LIMIT 20"
        result = db.execute(text(query), params)
        transactions = [
            {key: serialize_value(value) for key, value in row._mapping.items()}
            for row in result
        ]
        balance = sum(float(row.get("amount") or 0) for row in transactions)

    return {
        "balance": balance,
        "transactions": transactions,
    }
