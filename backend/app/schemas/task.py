from datetime import datetime
from enum import Enum
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class TaskStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    completed = "completed"


class TaskBase(BaseModel):
    title: str
    subject_id: UUID
    status: TaskStatus = TaskStatus.todo
    due_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    id: UUID
    user_id: UUID
    subject_id: UUID
    title: str
    status: TaskStatus
    due_date: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SubjectTaskCount(BaseModel):
    subject_id: UUID
    subject_name: str
    total_tasks: int
    completed_tasks: int
    pending_tasks: int


class DashboardStatsResponse(BaseModel):
    total_completed_tasks: int
    total_pending_tasks: int
    tasks_by_subject: List[SubjectTaskCount]
