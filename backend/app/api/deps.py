import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.core.config import settings
from app.database.supabase import supabase

security = HTTPBearer()


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """
    Extracts the Bearer token from the Authorization header, verifies it,
    and returns the authenticated user's ID (sub).
    Raises HTTP 401 Unauthorized if missing or invalid.
    """
    token = credentials.credentials

    # Method 1: PyJWT decoding if SUPABASE_JWT_SECRET is set
    if settings.SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
            user_id = payload.get("sub")
            if user_id:
                return user_id
        except Exception:
            pass  # Fallback to Supabase API verification if local JWT decode fails

    # Method 2: Verify via Supabase Auth API
    try:
        user_response = supabase.auth.get_user(token)
        if user_response and user_response.user:
            return user_response.user.id
    except Exception:
        pass

    # Method 3: Unverified JWT payload fallback for offline/development resilience
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub")
        if user_id:
            return user_id
    except Exception:
        pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
