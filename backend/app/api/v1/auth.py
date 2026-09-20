from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user_id
from app.database.supabase import supabase
from app.schemas.user import UserLogin, UserProfile, UserSignup, TokenData

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenData, status_code=status.HTTP_201_CREATED)
def signup(payload: UserSignup):
    """
    Register a new user with Supabase Auth and initialize their profile.
    """
    try:
        auth_response = supabase.auth.sign_up(
            {
                "email": payload.email,
                "password": payload.password,
                "options": {
                    "data": {
                        "full_name": payload.full_name or ""
                    }
                }
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Signup failed: {str(e)}"
        )

    if not auth_response.user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create user."
        )

    user_id = auth_response.user.id

    # Create profile in public.profiles table
    try:
        supabase.table("profiles").upsert(
            {
                "id": user_id,
                "email": payload.email,
                "full_name": payload.full_name,
            }
        ).execute()
    except Exception:
        pass  # Handle gracefully if trigger already created profile

    access_token = auth_response.session.access_token if auth_response.session else ""

    return TokenData(
        access_token=access_token,
        token_type="bearer",
        user=UserProfile(
            id=user_id,
            email=payload.email,
            full_name=payload.full_name,
            created_at=auth_response.user.created_at
        )
    )


@router.post("/login", response_model=TokenData)
def login(payload: UserLogin):
    """
    Authenticate user with Supabase Auth and return access token.
    """
    try:
        auth_response = supabase.auth.sign_in_with_password(
            {
                "email": payload.email,
                "password": payload.password
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid credentials: {str(e)}"
        )

    if not auth_response.session or not auth_response.user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Login failed. Check your email and password."
        )

    # Fetch user profile from database
    profile_res = (
        supabase.table("profiles")
        .select("*")
        .eq("id", auth_response.user.id)
        .execute()
    )

    full_name = None
    if profile_res.data and len(profile_res.data) > 0:
        full_name = profile_res.data[0].get("full_name")

    return TokenData(
        access_token=auth_response.session.access_token,
        token_type="bearer",
        user=UserProfile(
            id=auth_response.user.id,
            email=auth_response.user.email,
            full_name=full_name,
            created_at=auth_response.user.created_at
        )
    )


@router.get("/me", response_model=UserProfile)
def get_me(current_user_id: str = Depends(get_current_user_id)):
    """
    Get current logged in user's profile details.
    """
    try:
        profile_res = (
            supabase.table("profiles")
            .select("*")
            .eq("id", current_user_id)
            .execute()
        )
        if profile_res.data and len(profile_res.data) > 0:
            profile_data = profile_res.data[0]
            return UserProfile(
                id=profile_data["id"],
                email=profile_data["email"],
                full_name=profile_data.get("full_name"),
                created_at=profile_data.get("created_at")
            )
    except Exception:
        pass

    return UserProfile(
        id=current_user_id,
        email="student@studyflow.com",
        full_name="Student",
        created_at=None
    )
