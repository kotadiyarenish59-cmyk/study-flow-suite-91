from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class SubjectBase(BaseModel):
    name: str


class SubjectCreate(SubjectBase):
    pass


class SubjectResponse(SubjectBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
