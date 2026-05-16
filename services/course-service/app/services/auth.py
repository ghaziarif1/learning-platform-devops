from typing import Optional, Dict, Any

import httpx
from fastapi import Header, HTTPException

from app.config import settings


async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing")

    token = authorization.split(" ", 1)[1]
    headers = {"Authorization": f"Bearer {token}"}
    url = f"{settings.user_service_url}/auth/me"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            payload = response.json()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail="Invalid token or unauthorized")
    except Exception:
        raise HTTPException(status_code=503, detail="Unable to validate token")

    data = payload.get("data") or {}
    user = data.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Unable to retrieve user information")

    return user
