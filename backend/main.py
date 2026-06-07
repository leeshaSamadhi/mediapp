"""
Medi App Backend - FastAPI Application
"""
import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import Optional, List

import bcrypt
import jwt
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from dotenv import load_dotenv

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import (
    create_user,
    get_user_by_email,
    get_user_by_mobile,
    get_user_by_id,
    update_user,
    create_fingerprint_auth,
    verify_fingerprint,
    init_database,
    get_connection,
)

# Load environment variables
load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "medi-app-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

# CORS configuration
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI.
    Handles startup and shutdown events.
    """
    # Startup
    print("Initializing database...")
    try:
        init_database()
        print("Database initialization completed successfully")
    except Exception as e:
        print(f"Database initialization warning: {e}")
    yield
    # Shutdown
    print("Shutting down...")


# Initialize FastAPI app with lifespan
app = FastAPI(title="Medi App API", version="1.0.0", lifespan=lifespan)

# CORS configuration
# In production, tokens should be verified properly with JWT signature verification
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================
# Pydantic Models
# =============================================

class UserSignup(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=1)
    mobile: str = Field(..., min_length=1)
    password: str = Field(..., min_length=6)
    dob: str = Field(..., description="Date of birth in YYYY-MM-DD format")
    avatar_url: Optional[str] = None
    fingerprint_data: Optional[str] = None


class UserLogin(BaseModel):
    email_or_mobile: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class FingerprintLogin(BaseModel):
    fingerprint_data: str = Field(..., min_length=1)


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    dob: Optional[str] = None
    avatar_url: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: Optional[str] = None
    new_password: str = Field(..., min_length=6)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class AppointmentCreate(BaseModel):
    doctor_id: str
    date: str
    time: str
    patient_name: str
    for_self: bool = True
    notes: Optional[str] = None
    amount: float = 0.0


class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    cancel_reason: Optional[str] = None
    cancel_notes: Optional[str] = None


class ReviewCreate(BaseModel):
    appointment_id: str
    doctor_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class PaymentMethodCreate(BaseModel):
    type: str
    card_number: Optional[str] = None
    card_holder: Optional[str] = None
    expiry_date: Optional[str] = None
    cvv: Optional[str] = None
    is_default: bool = False


class PaymentMethodUpdate(BaseModel):
    card_holder: Optional[str] = None
    expiry_date: Optional[str] = None
    is_default: Optional[bool] = None


class NotificationUpdate(BaseModel):
    read: bool


class ChatMessageCreate(BaseModel):
    receiver_id: str
    message: str


class FavoriteToggle(BaseModel):
    doctor_id: str
    user_id: Optional[str] = None


# =============================================
# Helper Functions
# =============================================

def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash."""
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    """
    Create JWT access token.
    
    In production, tokens should be verified properly with JWKS and signature verification.
    This is a simplified implementation for learning purposes.
    """
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Decode JWT token.
    
    In production, tokens should be verified properly with JWKS and signature verification.
    This is a simplified implementation for learning purposes.
    """
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def execute_query(query: str, params: tuple = None, fetch_one: bool = False, fetch_all: bool = True):
    """Execute a database query and return results."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(query, params)
        
        if fetch_one:
            result = cursor.fetchone()
            conn.commit()  # Commit transaction for INSERT/UPDATE/DELETE with RETURNING
        elif fetch_all:
            result = cursor.fetchall()
        else:
            conn.commit()
            result = cursor.rowcount
        
        cursor.close()
        return result
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


# =============================================
# API Routes - Health & Welcome
# =============================================

@app.get("/")
async def root():
    """Welcome endpoint."""
    return {"message": "Welcome to Medi App API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


# =============================================
# API Routes - Authentication
# =============================================

@app.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserSignup):
    """
    Create a new user account.
    
    - Hashes password before storing
    - Creates optional fingerprint authentication
    - Returns JWT token
    """
    # Check if email already exists
    existing_email = get_user_by_email(user_data.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check if mobile already exists
    existing_mobile = get_user_by_mobile(user_data.mobile)
    if existing_mobile:
        raise HTTPException(status_code=400, detail="Mobile number already registered")

    # Validate DOB format
    try:
        dob_date = datetime.strptime(user_data.dob, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    # Hash password
    hashed_password = hash_password(user_data.password)

    # Create user
    try:
        user = create_user(
            full_name=user_data.full_name,
            email=user_data.email,
            mobile=user_data.mobile,
            password_hash=hashed_password,
            dob=dob_date,
            avatar_url=user_data.avatar_url,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

    # Create fingerprint auth if provided
    if user_data.fingerprint_data:
        try:
            create_fingerprint_auth(user["id"], user_data.fingerprint_data)
        except Exception as e:
            # Non-critical error, log but don't fail
            print(f"Warning: Failed to create fingerprint auth: {e}")

    # Create JWT token
    access_token = create_access_token(user["id"], user["email"])

    return TokenResponse(
        access_token=access_token,
        user={
            "id": str(user["id"]),
            "full_name": user["full_name"],
            "email": user["email"],
            "mobile": user["mobile"],
            "dob": str(user["dob"]),
            "avatar_url": user["avatar_url"],
            "fingerprint_enabled": user["fingerprint_enabled"],
            "created_at": user["created_at"].isoformat() if user["created_at"] else None,
        },
    )


@app.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    """
    Authenticate user with email/mobile and password.
    
    - Looks up user by email or mobile
    - Verifies password
    - Returns JWT token
    """
    # Try to find user by email or mobile
    user = get_user_by_email(login_data.email_or_mobile)
    if not user:
        user = get_user_by_mobile(login_data.email_or_mobile)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Verify password
    if not user.get("password_hash"):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Create JWT token
    access_token = create_access_token(user["id"], user["email"])

    return TokenResponse(
        access_token=access_token,
        user={
            "id": str(user["id"]),
            "full_name": user["full_name"],
            "email": user["email"],
            "mobile": user["mobile"],
            "dob": str(user["dob"]),
            "avatar_url": user["avatar_url"],
            "fingerprint_enabled": user["fingerprint_enabled"],
            "created_at": user["created_at"].isoformat() if user["created_at"] else None,
        },
    )


@app.post("/login/fingerprint", response_model=TokenResponse)
async def login_with_fingerprint(login_data: FingerprintLogin):
    """
    Authenticate user using fingerprint data.
    
    - Verifies fingerprint against stored data
    - Returns JWT token
    """
    # Verify fingerprint
    user = verify_fingerprint(login_data.fingerprint_data)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid fingerprint")

    # Get full user data
    full_user = get_user_by_id(user["user_id"])
    if not full_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Create JWT token
    access_token = create_access_token(full_user["id"], full_user["email"])

    return TokenResponse(
        access_token=access_token,
        user={
            "id": str(full_user["id"]),
            "full_name": full_user["full_name"],
            "email": full_user["email"],
            "mobile": full_user["mobile"],
            "dob": str(full_user["dob"]),
            "avatar_url": full_user["avatar_url"],
            "fingerprint_enabled": full_user["fingerprint_enabled"],
            "created_at": full_user["created_at"].isoformat() if full_user["created_at"] else None,
        },
    )


# =============================================
# API Routes - User Profile
# =============================================

@app.get("/profile/{user_id}")
async def get_profile(user_id: str):
    """Get user profile by ID."""
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": str(user["id"]),
        "full_name": user["full_name"],
        "email": user["email"],
        "mobile": user["mobile"],
        "dob": str(user["dob"]),
        "avatar_url": user["avatar_url"],
        "fingerprint_enabled": user["fingerprint_enabled"],
        "created_at": user["created_at"].isoformat() if user["created_at"] else None,
        "updated_at": user["updated_at"].isoformat() if user["updated_at"] else None,
    }


@app.put("/profile/{user_id}")
async def update_profile(user_id: str, profile_data: UserProfileUpdate):
    """
    Update user profile.
    
    - Updates only provided fields
    - Validates input data
    """
    # Check if user exists
    existing_user = get_user_by_id(user_id)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Build update dictionary with only provided fields
    update_dict = {}
    
    if profile_data.full_name is not None:
        update_dict["full_name"] = profile_data.full_name
    
    if profile_data.email is not None:
        # Check email uniqueness
        email_check = get_user_by_email(profile_data.email)
        if email_check and str(email_check["id"]) != user_id:
            raise HTTPException(status_code=400, detail="Email already in use")
        update_dict["email"] = profile_data.email
    
    if profile_data.mobile is not None:
        # Check mobile uniqueness
        mobile_check = get_user_by_mobile(profile_data.mobile)
        if mobile_check and str(mobile_check["id"]) != user_id:
            raise HTTPException(status_code=400, detail="Mobile number already in use")
        update_dict["mobile"] = profile_data.mobile
    
    if profile_data.dob is not None:
        try:
            update_dict["dob"] = datetime.strptime(profile_data.dob, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    if profile_data.avatar_url is not None:
        update_dict["avatar_url"] = profile_data.avatar_url

    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Update user
    try:
        updated_user = update_user(user_id, **update_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

    # Update patient_name in appointments where for_self = TRUE if full_name changed
    if "full_name" in update_dict:
        try:
            execute_query(
                """
                UPDATE public.appointments 
                SET patient_name = %s 
                WHERE user_id = %s AND for_self = TRUE
                """,
                (update_dict["full_name"], user_id),
                fetch_all=False
            )
            print(f"Updated patient_name in appointments for user {user_id}")
        except Exception as e:
            # Log error but don't fail the profile update
            print(f"Warning: Failed to update patient_name in appointments: {e}")

    return {
        "id": str(updated_user["id"]),
        "full_name": updated_user["full_name"],
        "email": updated_user["email"],
        "mobile": updated_user["mobile"],
        "dob": str(updated_user["dob"]),
        "avatar_url": updated_user["avatar_url"],
        "fingerprint_enabled": updated_user["fingerprint_enabled"],
        "created_at": updated_user["created_at"].isoformat() if updated_user["created_at"] else None,
        "updated_at": updated_user["updated_at"].isoformat() if updated_user["updated_at"] else None,
    }


@app.put("/profile/{user_id}/password")
async def change_password(user_id: str, password_data: PasswordChange):
    """
    Change user password.
    
    - If current_password is provided, verifies it before changing
    - Hashes new password before storing
    """
    # Check if user exists
    existing_user = get_user_by_id(user_id)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify current password if provided
    if password_data.current_password:
        if not existing_user.get("password_hash"):
            raise HTTPException(status_code=400, detail="No password set for this account")
        if not verify_password(password_data.current_password, existing_user["password_hash"]):
            raise HTTPException(status_code=400, detail="Current password is incorrect")

    # Hash new password
    hashed_password = hash_password(password_data.new_password)

    # Update password in database
    try:
        update_user(user_id, password_hash=hashed_password)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update password: {str(e)}")

    return {"message": "Password updated successfully"}


# =============================================
# API Routes - Doctors
# =============================================

@app.get("/doctors")
async def get_doctors(specialty: Optional[str] = None, search: Optional[str] = None, user_id: Optional[str] = None):
    """Get all doctors, optionally filtered by specialty or search term.
    
    When user_id is provided, the is_favorite field reflects the user's
    personal favorite status (from the favorites table) instead of the
    global doctors.is_favorite column.
    """
    if user_id:
        query = """
            SELECT d.*, 
                   CASE WHEN f.id IS NOT NULL THEN TRUE ELSE FALSE END AS user_is_favorite
            FROM public.doctors d
            LEFT JOIN public.favorites f ON f.doctor_id = d.id AND f.user_id = %s
            WHERE 1=1
        """
        params = [user_id]
    else:
        query = "SELECT * FROM public.doctors WHERE 1=1"
        params = []
    
    if specialty:
        query += " AND d.specialty = %s" if user_id else " AND specialty = %s"
        params.append(specialty)
    
    if search:
        query += " AND (d.name ILIKE %s OR d.specialty ILIKE %s)" if user_id else " AND (name ILIKE %s OR specialty ILIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])
    
    query += " ORDER BY rating DESC"
    
    doctors = execute_query(query, tuple(params) if params else None, fetch_all=True)
    
    return [
        {
            "id": str(doc["id"]),
            "name": doc["name"],
            "specialty": doc["specialty"],
            "gender": doc["gender"],
            "rating": float(doc["rating"]),
            "messages": doc["messages"],
            "photo_url": doc["photo_url"],
            "is_favorite": bool(doc["user_is_favorite"]) if user_id else doc["is_favorite"],
            "experience": doc["experience"],
            "focus": doc["focus"],
            "about": doc["about"],
            "availability": {
                "days": doc["availability_days"],
                "time": doc["availability_time"],
            },
        }
        for doc in doctors
    ]


@app.get("/doctors/{doctor_id}")
async def get_doctor(doctor_id: str, user_id: Optional[str] = None):
    """Get doctor details by ID.
    
    When user_id is provided, the is_favorite field reflects the user's
    personal favorite status (from the favorites table).
    """
    if user_id:
        doctor = execute_query(
            """
            SELECT d.*, 
                   CASE WHEN f.id IS NOT NULL THEN TRUE ELSE FALSE END AS user_is_favorite
            FROM public.doctors d
            LEFT JOIN public.favorites f ON f.doctor_id = d.id AND f.user_id = %s
            WHERE d.id = %s
            """,
            (user_id, doctor_id),
            fetch_one=True
        )
    else:
        doctor = execute_query(
            "SELECT * FROM public.doctors WHERE id = %s",
            (doctor_id,),
            fetch_one=True
        )
    
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Get schedule
    schedule = execute_query(
        "SELECT day, slots FROM public.doctor_schedule WHERE doctor_id = %s ORDER BY day",
        (doctor_id,),
        fetch_all=True
    )
    
    return {
        "id": str(doctor["id"]),
        "name": doctor["name"],
        "specialty": doctor["specialty"],
        "gender": doctor["gender"],
        "rating": float(doctor["rating"]),
        "messages": doctor["messages"],
        "photo_url": doctor["photo_url"],
        "is_favorite": bool(doctor["user_is_favorite"]) if user_id else doctor["is_favorite"],
        "experience": doctor["experience"],
        "focus": doctor["focus"],
        "about": doctor["about"],
        "availability": {
            "days": doctor["availability_days"],
            "time": doctor["availability_time"],
        },
        "schedule": [
            {"day": s["day"], "slots": s["slots"]}
            for s in schedule
        ] if schedule else [],
    }


@app.post("/doctors/{doctor_id}/favorite")
async def toggle_doctor_favorite(doctor_id: str, fav_data: dict = {}):
    """Toggle doctor as favorite for user."""
    user_id = fav_data.get('user_id')
    
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    
    # Check if favorite exists
    existing = execute_query(
        "SELECT id FROM public.favorites WHERE user_id = %s AND doctor_id = %s",
        (user_id, doctor_id),
        fetch_one=True
    )
    
    if existing:
        # Remove favorite
        execute_query(
            "DELETE FROM public.favorites WHERE id = %s",
            (existing["id"],),
            fetch_all=False
        )
        return {"favorited": False}
    else:
        # Add favorite
        execute_query(
            "INSERT INTO public.favorites (user_id, doctor_id) VALUES (%s, %s)",
            (user_id, doctor_id),
            fetch_all=False
        )
        return {"favorited": True}


# =============================================
# API Routes - Appointments
# =============================================

@app.get("/appointments")
async def get_appointments(user_id: str, status: Optional[str] = None):
    """Get user appointments, optionally filtered by status."""
    query = """
        SELECT a.*, d.name as doctor_name, d.specialty as doctor_specialty, d.photo_url as doctor_photo
        FROM public.appointments a
        JOIN public.doctors d ON a.doctor_id = d.id
        WHERE a.user_id = %s
    """
    params = [user_id]
    
    if status:
        query += " AND a.status = %s"
        params.append(status)
    
    query += " ORDER BY a.date DESC, a.time DESC"
    
    appointments = execute_query(query, tuple(params), fetch_all=True)
    
    return [
        {
            "id": str(apt["id"]),
            "doctor_id": str(apt["doctor_id"]),
            "doctor_name": apt["doctor_name"],
            "doctor_specialty": apt["doctor_specialty"],
            "doctor_photo": apt["doctor_photo"],
            "date": str(apt["date"]),
            "time": apt["time"],
            "status": apt["status"],
            "patient_name": apt["patient_name"],
            "for_self": apt["for_self"],
            "notes": apt["notes"],
            "amount": float(apt["amount"]),
            "cancel_reason": apt["cancel_reason"],
            "cancel_notes": apt["cancel_notes"],
            "created_at": apt["created_at"].isoformat() if apt["created_at"] else None,
        }
        for apt in appointments
    ]


@app.post("/appointments")
async def create_appointment(user_id: str, apt_data: AppointmentCreate):
    """Create a new appointment."""
    # Verify doctor exists
    doctor = execute_query(
        "SELECT id FROM public.doctors WHERE id = %s",
        (apt_data.doctor_id,),
        fetch_one=True
    )
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Validate date format
    try:
        apt_date = datetime.strptime(apt_data.date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Create appointment
    result = execute_query(
        """
        INSERT INTO public.appointments (user_id, doctor_id, date, time, patient_name, for_self, notes, amount)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *
        """,
        (user_id, apt_data.doctor_id, apt_date, apt_data.time, apt_data.patient_name, apt_data.for_self, apt_data.notes, apt_data.amount),
        fetch_one=True
    )
    
    # Update doctor message count
    execute_query(
        "UPDATE public.doctors SET messages = messages + 1 WHERE id = %s",
        (apt_data.doctor_id,),
        fetch_all=False
    )
    
    return {
        "id": str(result["id"]),
        "doctor_id": str(result["doctor_id"]),
        "date": str(result["date"]),
        "time": result["time"],
        "status": result["status"],
        "patient_name": result["patient_name"],
        "for_self": result["for_self"],
        "notes": result["notes"],
        "amount": float(result["amount"]),
        "created_at": result["created_at"].isoformat() if result["created_at"] else None,
    }


@app.put("/appointments/{appointment_id}")
async def update_appointment(appointment_id: str, apt_data: AppointmentUpdate):
    """Update appointment status."""
    # Build update query
    update_fields = []
    params = []
    
    if apt_data.status:
        update_fields.append("status = %s")
        params.append(apt_data.status)
    
    if apt_data.cancel_reason:
        update_fields.append("cancel_reason = %s")
        params.append(apt_data.cancel_reason)
    
    if apt_data.cancel_notes:
        update_fields.append("cancel_notes = %s")
        params.append(apt_data.cancel_notes)
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    params.append(appointment_id)
    
    result = execute_query(
        f"""
        UPDATE public.appointments 
        SET {', '.join(update_fields)}
        WHERE id = %s
        RETURNING *
        """,
        tuple(params),
        fetch_one=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return {
        "id": str(result["id"]),
        "status": result["status"],
        "cancel_reason": result["cancel_reason"],
        "cancel_notes": result["cancel_notes"],
        "updated_at": result["updated_at"].isoformat() if result["updated_at"] else None,
    }


# =============================================
# API Routes - Reviews
# =============================================

@app.get("/reviews")
async def get_reviews(doctor_id: Optional[str] = None, appointment_id: Optional[str] = None):
    """Get reviews, optionally filtered by doctor or appointment."""
    query = """
        SELECT r.*, u.full_name as user_name
        FROM public.reviews r
        JOIN public.users u ON r.appointment_id IN (
            SELECT id FROM public.appointments WHERE user_id = u.id
        )
        WHERE 1=1
    """
    params = []
    
    if doctor_id:
        query += " AND r.doctor_id = %s"
        params.append(doctor_id)
    
    if appointment_id:
        query += " AND r.appointment_id = %s"
        params.append(appointment_id)
    
    query += " ORDER BY r.created_at DESC"
    
    reviews = execute_query(query, tuple(params) if params else None, fetch_all=True)
    
    return [
        {
            "id": str(rev["id"]),
            "appointment_id": str(rev["appointment_id"]),
            "doctor_id": str(rev["doctor_id"]),
            "rating": rev["rating"],
            "comment": rev["comment"],
            "date": str(rev["date"]),
            "user_name": rev["user_name"],
            "created_at": rev["created_at"].isoformat() if rev["created_at"] else None,
        }
        for rev in reviews
    ]


@app.post("/reviews")
async def create_review(user_id: str, review_data: ReviewCreate):
    """Create a review for an appointment."""
    # Verify appointment exists and belongs to user
    appointment = execute_query(
        "SELECT * FROM public.appointments WHERE id = %s AND user_id = %s",
        (review_data.appointment_id, user_id),
        fetch_one=True
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Check if review already exists
    existing_review = execute_query(
        "SELECT id FROM public.reviews WHERE appointment_id = %s",
        (review_data.appointment_id,),
        fetch_one=True
    )
    if existing_review:
        raise HTTPException(status_code=400, detail="Review already exists for this appointment")
    
    # Create review
    result = execute_query(
        """
        INSERT INTO public.reviews (appointment_id, doctor_id, rating, comment)
        VALUES (%s, %s, %s, %s)
        RETURNING *
        """,
        (review_data.appointment_id, review_data.doctor_id, review_data.rating, review_data.comment),
        fetch_one=True
    )
    
    # Update doctor rating
    avg_rating = execute_query(
        "SELECT AVG(rating) as avg_rating FROM public.reviews WHERE doctor_id = %s",
        (review_data.doctor_id,),
        fetch_one=True
    )
    if avg_rating:
        execute_query(
            "UPDATE public.doctors SET rating = %s WHERE id = %s",
            (round(float(avg_rating["avg_rating"]), 1), review_data.doctor_id),
            fetch_all=False
        )
    
    return {
        "id": str(result["id"]),
        "appointment_id": str(result["appointment_id"]),
        "doctor_id": str(result["doctor_id"]),
        "rating": result["rating"],
        "comment": result["comment"],
        "date": str(result["date"]),
        "created_at": result["created_at"].isoformat() if result["created_at"] else None,
    }


# =============================================
# API Routes - Payment Methods
# =============================================

@app.get("/payment-methods")
async def get_payment_methods(user_id: str):
    """Get user payment methods."""
    methods = execute_query(
        "SELECT * FROM public.payment_methods WHERE user_id = %s ORDER BY is_default DESC, created_at DESC",
        (user_id,),
        fetch_all=True
    )
    
    return [
        {
            "id": str(method["id"]),
            "type": method["type"],
            "card_number": method["card_number"],
            "card_holder": method["card_holder"],
            "expiry_date": method["expiry_date"],
            "is_default": method["is_default"],
            "created_at": method["created_at"].isoformat() if method["created_at"] else None,
        }
        for method in methods
    ]


@app.post("/payment-methods")
async def create_payment_method(user_id: str, method_data: PaymentMethodCreate):
    """Create a new payment method."""
    # If setting as default, unset other defaults
    if method_data.is_default:
        execute_query(
            "UPDATE public.payment_methods SET is_default = FALSE WHERE user_id = %s",
            (user_id,),
            fetch_all=False
        )
    
    result = execute_query(
        """
        INSERT INTO public.payment_methods (user_id, type, card_number, card_holder, expiry_date, cvv, is_default)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING *
        """,
        (user_id, method_data.type, method_data.card_number, method_data.card_holder, method_data.expiry_date, method_data.cvv, method_data.is_default),
        fetch_one=True
    )
    
    return {
        "id": str(result["id"]),
        "type": result["type"],
        "card_number": result["card_number"],
        "card_holder": result["card_holder"],
        "expiry_date": result["expiry_date"],
        "is_default": result["is_default"],
        "created_at": result["created_at"].isoformat() if result["created_at"] else None,
    }


@app.put("/payment-methods/{method_id}")
async def update_payment_method(method_id: str, method_data: PaymentMethodUpdate):
    """Update a payment method."""
    update_fields = []
    params = []
    
    if method_data.card_holder is not None:
        update_fields.append("card_holder = %s")
        params.append(method_data.card_holder)
    
    if method_data.expiry_date is not None:
        update_fields.append("expiry_date = %s")
        params.append(method_data.expiry_date)
    
    if method_data.is_default is not None:
        update_fields.append("is_default = %s")
        params.append(method_data.is_default)
        
        # If setting as default, unset other defaults
        if method_data.is_default:
            method = execute_query(
                "SELECT user_id FROM public.payment_methods WHERE id = %s",
                (method_id,),
                fetch_one=True
            )
            if method:
                execute_query(
                    "UPDATE public.payment_methods SET is_default = FALSE WHERE user_id = %s AND id != %s",
                    (method["user_id"], method_id),
                    fetch_all=False
                )
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    params.append(method_id)
    
    result = execute_query(
        f"""
        UPDATE public.payment_methods 
        SET {', '.join(update_fields)}
        WHERE id = %s
        RETURNING *
        """,
        tuple(params),
        fetch_one=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Payment method not found")
    
    return {
        "id": str(result["id"]),
        "type": result["type"],
        "card_holder": result["card_holder"],
        "expiry_date": result["expiry_date"],
        "is_default": result["is_default"],
        "updated_at": result["updated_at"].isoformat() if result["updated_at"] else None,
    }


@app.delete("/payment-methods/{method_id}")
async def delete_payment_method(method_id: str):
    """Delete a payment method."""
    result = execute_query(
        "DELETE FROM public.payment_methods WHERE id = %s RETURNING id",
        (method_id,),
        fetch_one=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Payment method not found")
    
    return {"message": "Payment method deleted successfully"}


# =============================================
# API Routes - Notifications
# =============================================

@app.get("/notifications")
async def get_notifications(user_id: str, unread_only: bool = False):
    """Get user notifications."""
    query = "SELECT * FROM public.notifications WHERE user_id = %s"
    params = [user_id]
    
    if unread_only:
        query += " AND read = FALSE"
    
    query += " ORDER BY created_at DESC"
    
    notifications = execute_query(query, tuple(params), fetch_all=True)
    
    return [
        {
            "id": str(notif["id"]),
            "title": notif["title"],
            "message": notif["message"],
            "type": notif["type"],
            "read": notif["read"],
            "date": str(notif["date"]),
            "created_at": notif["created_at"].isoformat() if notif["created_at"] else None,
        }
        for notif in notifications
    ]


@app.put("/notifications/{notification_id}")
async def update_notification(notification_id: str, notif_data: NotificationUpdate):
    """Update notification read status."""
    result = execute_query(
        "UPDATE public.notifications SET read = %s WHERE id = %s RETURNING *",
        (notif_data.read, notification_id),
        fetch_one=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {
        "id": str(result["id"]),
        "read": result["read"],
        "updated_at": datetime.utcnow().isoformat(),
    }


@app.put("/notifications/mark-all-read")
async def mark_all_notifications_read(user_id: str):
    """Mark all notifications as read for a user."""
    execute_query(
        "UPDATE public.notifications SET read = TRUE WHERE user_id = %s AND read = FALSE",
        (user_id,),
        fetch_all=False
    )
    
    return {"message": "All notifications marked as read"}


@app.post("/notifications")
async def create_notification(user_id: str, notif_data: dict):
    """Create a new notification."""
    result = execute_query(
        """
        INSERT INTO public.notifications (user_id, title, message, type, date)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING *
        """,
        (user_id, notif_data.get('title'), notif_data.get('message'), notif_data.get('type'), notif_data.get('date')),
        fetch_one=True
    )
    
    return {
        "id": str(result["id"]),
        "title": result["title"],
        "message": result["message"],
        "type": result["type"],
        "read": result["read"],
        "date": str(result["date"]),
        "created_at": result["created_at"].isoformat() if result["created_at"] else None,
    }


# =============================================
# API Routes - Chat Messages
# =============================================

@app.get("/messages")
async def get_messages(user_id: str, other_user_id: Optional[str] = None):
    """Get chat messages for a user."""
    if other_user_id:
        # Get messages between two users
        query = """
            SELECT * FROM public.chat_messages 
            WHERE (sender_id = %s AND receiver_id = %s) 
               OR (sender_id = %s AND receiver_id = %s)
            ORDER BY timestamp ASC
        """
        messages = execute_query(
            query,
            (user_id, other_user_id, other_user_id, user_id),
            fetch_all=True
        )
    else:
        # Get all messages for user
        query = """
            SELECT * FROM public.chat_messages 
            WHERE sender_id = %s OR receiver_id = %s
            ORDER BY timestamp DESC
        """
        messages = execute_query(query, (user_id, user_id), fetch_all=True)
    
    return [
        {
            "id": str(msg["id"]),
            "sender_id": str(msg["sender_id"]),
            "receiver_id": str(msg["receiver_id"]),
            "message": msg["message"],
            "timestamp": msg["timestamp"].isoformat() if msg["timestamp"] else None,
            "is_read": msg["is_read"],
            "created_at": msg["created_at"].isoformat() if msg["created_at"] else None,
        }
        for msg in messages
    ]


@app.post("/messages")
async def send_message(sender_id: str, msg_data: ChatMessageCreate):
    """Send a chat message."""
    result = execute_query(
        """
        INSERT INTO public.chat_messages (sender_id, receiver_id, message)
        VALUES (%s, %s, %s)
        RETURNING *
        """,
        (sender_id, msg_data.receiver_id, msg_data.message),
        fetch_one=True
    )
    
    return {
        "id": str(result["id"]),
        "sender_id": str(result["sender_id"]),
        "receiver_id": str(result["receiver_id"]),
        "message": result["message"],
        "timestamp": result["timestamp"].isoformat() if result["timestamp"] else None,
        "is_read": result["is_read"],
        "created_at": result["created_at"].isoformat() if result["created_at"] else None,
    }


@app.put("/messages/{message_id}/read")
async def mark_message_read(message_id: str):
    """Mark a message as read."""
    result = execute_query(
        "UPDATE public.chat_messages SET is_read = TRUE WHERE id = %s RETURNING *",
        (message_id,),
        fetch_one=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Message not found")
    
    return {"id": str(result["id"]), "is_read": result["is_read"]}


# =============================================
# API Routes - Favorites
# =============================================

@app.get("/favorites")
async def get_favorites(user_id: str):
    """Get user's favorite doctors."""
    favorites = execute_query(
        """
        SELECT d.*, f.id as favorite_id
        FROM public.favorites f
        JOIN public.doctors d ON f.doctor_id = d.id
        WHERE f.user_id = %s
        ORDER BY f.created_at DESC
        """,
        (user_id,),
        fetch_all=True
    )
    
    return [
        {
            "id": str(doc["id"]),
            "favorite_id": str(doc["favorite_id"]),
            "name": doc["name"],
            "specialty": doc["specialty"],
            "gender": doc["gender"],
            "rating": float(doc["rating"]),
            "messages": doc["messages"],
            "photo_url": doc["photo_url"],
            "is_favorite": True,
            "experience": doc["experience"],
            "focus": doc["focus"],
            "about": doc["about"],
            "availability": {
                "days": doc["availability_days"],
                "time": doc["availability_time"],
            },
        }
        for doc in favorites
    ]


@app.post("/favorites/{doctor_id}")
async def add_favorite(user_id: str, doctor_id: str):
    """Add a doctor to favorites."""
    # Check if already favorited
    existing = execute_query(
        "SELECT id FROM public.favorites WHERE user_id = %s AND doctor_id = %s",
        (user_id, doctor_id),
        fetch_one=True
    )
    
    if existing:
        raise HTTPException(status_code=400, detail="Doctor already in favorites")
    
    execute_query(
        "INSERT INTO public.favorites (user_id, doctor_id) VALUES (%s, %s)",
        (user_id, doctor_id),
        fetch_all=False
    )
    
    return {"message": "Doctor added to favorites"}


@app.delete("/favorites/{doctor_id}")
async def remove_favorite(user_id: str, doctor_id: str):
    """Remove a doctor from favorites."""
    result = execute_query(
        "DELETE FROM public.favorites WHERE user_id = %s AND doctor_id = %s RETURNING id",
        (user_id, doctor_id),
        fetch_one=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    return {"message": "Doctor removed from favorites"}


# =============================================
# API Routes - FAQs
# =============================================

@app.get("/faqs")
async def get_faqs(category: Optional[str] = None):
    """Get FAQs, optionally filtered by category."""
    query = "SELECT * FROM public.faqs"
    params = []
    
    if category:
        query += " WHERE category = %s"
        params.append(category)
    
    query += " ORDER BY created_at"
    
    faqs = execute_query(query, tuple(params) if params else None, fetch_all=True)
    
    return [
        {
            "id": str(faq["id"]),
            "question": faq["question"],
            "answer": faq["answer"],
            "category": faq["category"],
        }
        for faq in faqs
    ]


# =============================================
# API Routes - Services
# =============================================

@app.get("/services")
async def get_services():
    """Get all available services."""
    services = execute_query(
        "SELECT * FROM public.services ORDER BY name",
        fetch_all=True
    )
    
    return [
        {
            "id": str(svc["id"]),
            "name": svc["name"],
            "brief": svc["brief"],
            "is_favorite": svc["is_favorite"],
        }
        for svc in services
    ]


@app.put("/services/{service_id}/favorite")
async def toggle_service_favorite(service_id: str):
    """Toggle service as favorite."""
    # Get current state
    service = execute_query(
        "SELECT is_favorite FROM public.services WHERE id = %s",
        (service_id,),
        fetch_one=True
    )
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    new_state = not service["is_favorite"]
    execute_query(
        "UPDATE public.services SET is_favorite = %s WHERE id = %s",
        (new_state, service_id),
        fetch_all=False
    )
    
    return {"favorited": new_state}


# =============================================
# Main Entry Point
# =============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)