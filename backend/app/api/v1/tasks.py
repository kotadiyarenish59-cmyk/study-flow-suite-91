from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.api.deps import get_current_user_id
from app.database.supabase import supabase
from app.schemas.task import TaskCreate, TaskResponse, TaskStatus, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=List[TaskResponse])
def get_tasks(
    subject_id: Optional[UUID] = Query(None, description="Filter tasks by subject ID"),
    status_filter: Optional[TaskStatus] = Query(None, alias="status", description="Filter tasks by status"),
    current_user_id: str = Depends(get_current_user_id)
):
    """
    List tasks for current user with optional filtering by subject_id or status.
    """
    try:
        query = (
            supabase.table("tasks")
            .select("*")
            .eq("user_id", current_user_id)
        )

        if subject_id:
            query = query.eq("subject_id", str(subject_id))

        if status_filter:
            query = query.eq("status", status_filter.value)

        response = query.order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch tasks: {str(e)}"
        )


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Create a new task for the current user.
    """
    # Verify subject belongs to user
    subject_res = (
        supabase.table("subjects")
        .select("id")
        .eq("id", str(payload.subject_id))
        .eq("user_id", current_user_id)
        .execute()
    )

    if not subject_res.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject not found or does not belong to the user."
        )

    task_data = {
        "user_id": current_user_id,
        "subject_id": str(payload.subject_id),
        "title": payload.title,
        "status": payload.status.value,
        "due_date": payload.due_date.isoformat() if payload.due_date else None,
    }

    try:
        response = supabase.table("tasks").insert(task_data).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create task."
            )
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating task: {str(e)}"
        )


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: UUID,
    payload: TaskUpdate,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Update title, status, or due_date of a task owned by current user.
    """
    # Verify task ownership
    existing = (
        supabase.table("tasks")
        .select("id")
        .eq("id", str(task_id))
        .eq("user_id", current_user_id)
        .execute()
    )

    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied."
        )

    update_fields = {}
    if payload.title is not None:
        update_fields["title"] = payload.title
    if payload.status is not None:
        update_fields["status"] = payload.status.value
    if payload.due_date is not None:
        update_fields["due_date"] = payload.due_date.isoformat()

    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided to update."
        )

    try:
        response = (
            supabase.table("tasks")
            .update(update_fields)
            .eq("id", str(task_id))
            .execute()
        )
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating task: {str(e)}"
        )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: UUID,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Delete a task owned by the current user.
    """
    existing = (
        supabase.table("tasks")
        .select("id")
        .eq("id", str(task_id))
        .eq("user_id", current_user_id)
        .execute()
    )

    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied."
        )

    try:
        supabase.table("tasks").delete().eq("id", str(task_id)).execute()
        return None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting task: {str(e)}"
        )
