from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user_id
from app.database.supabase import supabase
from app.schemas.subject import SubjectCreate, SubjectResponse

router = APIRouter(prefix="/subjects", tags=["Subjects"])


@router.get("", response_model=List[SubjectResponse])
def get_subjects(current_user_id: str = Depends(get_current_user_id)):
    """
    List all subjects created by the current user.
    """
    try:
        response = (
            supabase.table("subjects")
            .select("*")
            .eq("user_id", current_user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch subjects: {str(e)}"
        )


@router.post("", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
def create_subject(
    payload: SubjectCreate,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Create a new subject for the current user (without color_code).
    """
    try:
        response = (
            supabase.table("subjects")
            .insert({
                "user_id": current_user_id,
                "name": payload.name
            })
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create subject."
            )

        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating subject: {str(e)}"
        )


@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(
    subject_id: UUID,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Delete a subject owned by the current user.
    """
    try:
        # Check ownership
        existing = (
            supabase.table("subjects")
            .select("id")
            .eq("id", str(subject_id))
            .eq("user_id", current_user_id)
            .execute()
        )

        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subject not found or access denied."
            )

        supabase.table("subjects").delete().eq("id", str(subject_id)).execute()
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting subject: {str(e)}"
        )
