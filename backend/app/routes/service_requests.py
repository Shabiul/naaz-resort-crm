from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import (
    ServiceRequest,
    RequestCategory,
    Priority,
    RequestStatus,
    RequestSource,
    UserRole
)
from app.dependencies import get_current_active_user
from app.models.booking import User

router = APIRouter(prefix="/api/service-requests", tags=["Service Requests"])


def generate_request_number(db: Session) -> str:
    today = datetime.utcnow().strftime("%Y%m%d")
    count = db.query(ServiceRequest).filter(ServiceRequest.request_number.startswith(f"SR{today}")).count()
    return f"SR{today}{str(count + 1).zfill(4)}"


def get_auto_assigned_role(category: str) -> str | None:
    auto_map = {
        RequestCategory.HOUSEKEEPING.value: UserRole.HOUSEKEEPING.value,
        RequestCategory.MAINTENANCE.value: UserRole.MAINTENANCE.value,
        RequestCategory.RESTAURANT.value: UserRole.RESTAURANT.value,
        RequestCategory.SPA.value: UserRole.SPA.value
    }
    return auto_map.get(category)


def has_access_to_request(user: User, request: ServiceRequest) -> bool:
    if user.role == UserRole.ADMIN.value:
        return True
    if user.role == UserRole.STAFF.value:
        return True
    if user.role == request.assigned_role:
        return True
    if user.role == UserRole.ROOMS.value and request.category == RequestCategory.BOOKING.value:
        return True
    if user.role == UserRole.CUSTOMER.value and request.created_by_user_id == user.id:
        return True
    return False


@router.post("")
async def create_service_request(
    title: str,
    category: str,
    description: str = "",
    room_number: str = "",
    priority: str = Priority.MEDIUM.value,
    source: str = RequestSource.ADMIN.value,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if user can create requests
    if current_user.role not in [UserRole.ADMIN.value, UserRole.STAFF.value, UserRole.ROOMS.value, UserRole.CUSTOMER.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create service requests"
        )

    request_number = generate_request_number(db)
    assigned_role = get_auto_assigned_role(category)
    status_val = RequestStatus.OPEN.value if not assigned_role else RequestStatus.ASSIGNED.value

    db_request = ServiceRequest(
        request_number=request_number,
        title=title,
        description=description,
        room_number=room_number,
        category=category,
        priority=priority,
        status=status_val,
        assigned_role=assigned_role,
        created_by_user_id=current_user.id,
        source=source
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request


@router.get("")
async def get_service_requests(
    category: str | None = None,
    priority: str | None = None,
    status: str | None = None,
    assigned_role: str | None = None,
    source: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(ServiceRequest)

    # Apply RBAC filters
    if current_user.role == UserRole.HOUSEKEEPING.value:
        query = query.filter(ServiceRequest.category == RequestCategory.HOUSEKEEPING.value)
    elif current_user.role == UserRole.MAINTENANCE.value:
        query = query.filter(ServiceRequest.category == RequestCategory.MAINTENANCE.value)
    elif current_user.role == UserRole.RESTAURANT.value:
        query = query.filter(ServiceRequest.category == RequestCategory.RESTAURANT.value)
    elif current_user.role == UserRole.SPA.value:
        query = query.filter(ServiceRequest.category == RequestCategory.SPA.value)
    elif current_user.role == UserRole.ROOMS.value:
        query = query.filter(ServiceRequest.category == RequestCategory.BOOKING.value)
    elif current_user.role == UserRole.CUSTOMER.value:
        query = query.filter(ServiceRequest.created_by_user_id == current_user.id)

    # Apply filter parameters
    if category:
        query = query.filter(ServiceRequest.category == category)
    if priority:
        query = query.filter(ServiceRequest.priority == priority)
    if status:
        query = query.filter(ServiceRequest.status == status)
    if assigned_role:
        query = query.filter(ServiceRequest.assigned_role == assigned_role)
    if source:
        query = query.filter(ServiceRequest.source == source)
    if start_date:
        query = query.filter(ServiceRequest.created_at >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(ServiceRequest.created_at <= datetime.fromisoformat(end_date))

    return query.order_by(ServiceRequest.created_at.desc()).all()


@router.get("/{request_id}")
async def get_service_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found"
        )

    if not has_access_to_request(current_user, request):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this request"
        )

    return request


@router.patch("/{request_id}")
async def update_service_request(
    request_id: int,
    title: str | None = None,
    description: str | None = None,
    room_number: str | None = None,
    category: str | None = None,
    priority: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found"
        )

    if not has_access_to_request(current_user, request):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this request"
        )

    # Restrict non-admin users to limited updates
    if current_user.role != UserRole.ADMIN.value and current_user.role != UserRole.STAFF.value:
        if current_user.role == UserRole.CUSTOMER.value:
            if title or room_number or category or priority:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only update the description"
                )
        else:
            if title or room_number or category or priority:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to update these fields"
                )

    if title:
        request.title = title
    if description:
        request.description = description
    if room_number:
        request.room_number = room_number
    if category:
        request.category = category
        request.assigned_role = get_auto_assigned_role(category)
    if priority:
        request.priority = priority

    db.commit()
    db.refresh(request)
    return request


@router.patch("/{request_id}/assign")
async def assign_service_request(
    request_id: int,
    assigned_role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can assign requests"
        )

    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found"
        )

    request.assigned_role = assigned_role
    if assigned_role:
        request.status = RequestStatus.ASSIGNED.value
    else:
        request.status = RequestStatus.OPEN.value

    db.commit()
    db.refresh(request)
    return request


@router.patch("/{request_id}/status")
async def update_request_status(
    request_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found"
        )

    if not has_access_to_request(current_user, request):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this request's status"
        )

    request.status = new_status
    if new_status == RequestStatus.COMPLETED.value or new_status == RequestStatus.CLOSED.value:
        request.resolved_at = datetime.utcnow()
    else:
        request.resolved_at = None

    db.commit()
    db.refresh(request)
    return request


@router.delete("/{request_id}")
async def delete_service_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete requests"
        )

    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found"
        )

    db.delete(request)
    db.commit()
    return {"success": True, "message": "Service request deleted successfully"}
