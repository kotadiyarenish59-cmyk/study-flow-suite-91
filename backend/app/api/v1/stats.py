from typing import Dict
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user_id
from app.database.supabase import supabase
from app.schemas.task import DashboardStatsResponse, SubjectTaskCount

router = APIRouter(prefix="/stats", tags=["Dashboard Statistics"])


@router.get("/dashboard", response_model=DashboardStatsResponse)
def get_dashboard_stats(current_user_id: str = Depends(get_current_user_id)):
    """
    Get dashboard analytics: total completed tasks, pending tasks, and breakdown grouped by subject.
    """
    try:
        # Fetch subjects owned by current user
        subjects_res = (
            supabase.table("subjects")
            .select("id, name")
            .eq("user_id", current_user_id)
            .execute()
        )
        subjects = subjects_res.data or []

        # Fetch tasks owned by current user
        tasks_res = (
            supabase.table("tasks")
            .select("id, subject_id, status")
            .eq("user_id", current_user_id)
            .execute()
        )
        tasks = tasks_res.data or []

        total_completed = 0
        total_pending = 0

        # Map to hold stats per subject_id
        subject_stats: Dict[str, Dict[str, int]] = {
            s["id"]: {"total": 0, "completed": 0, "pending": 0}
            for s in subjects
        }

        for task in tasks:
            status_val = task.get("status")
            subj_id = task.get("subject_id")

            if status_val == "completed":
                total_completed += 1
            else:
                total_pending += 1

            if subj_id in subject_stats:
                subject_stats[subj_id]["total"] += 1
                if status_val == "completed":
                    subject_stats[subj_id]["completed"] += 1
                else:
                    subject_stats[subj_id]["pending"] += 1

        tasks_by_subject = [
            SubjectTaskCount(
                subject_id=s["id"],
                subject_name=s["name"],
                total_tasks=subject_stats[s["id"]]["total"],
                completed_tasks=subject_stats[s["id"]]["completed"],
                pending_tasks=subject_stats[s["id"]]["pending"]
            )
            for s in subjects
        ]

        return DashboardStatsResponse(
            total_completed_tasks=total_completed,
            total_pending_tasks=total_pending,
            tasks_by_subject=tasks_by_subject
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard statistics: {str(e)}"
        )
