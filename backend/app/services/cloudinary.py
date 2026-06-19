import hashlib
import time

import httpx

from app.core.config import settings


def cloudinary_configured() -> bool:
    return all(
        [
            settings.CLOUDINARY_CLOUD_NAME,
            settings.CLOUDINARY_API_KEY,
            settings.CLOUDINARY_API_SECRET,
        ]
    )


def _signature(params: dict[str, str | int]) -> str:
    payload = "&".join(f"{key}={params[key]}" for key in sorted(params))
    return hashlib.sha1(
        f"{payload}{settings.CLOUDINARY_API_SECRET}".encode("utf-8")
    ).hexdigest()


async def upload_image(content: bytes, filename: str, content_type: str) -> dict:
    if not cloudinary_configured():
        raise RuntimeError("Cloudinary no está configurado")

    params = {"folder": "sidreria-el-tonel", "timestamp": int(time.time())}
    data = {
        **params,
        "api_key": settings.CLOUDINARY_API_KEY,
        "signature": _signature(params),
    }
    url = (
        f"https://api.cloudinary.com/v1_1/"
        f"{settings.CLOUDINARY_CLOUD_NAME}/image/upload"
    )
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            url,
            data=data,
            files={"file": (filename, content, content_type)},
        )
    if response.is_error:
        raise RuntimeError("No se pudo subir la imagen")
    return response.json()


async def delete_image(public_id: str) -> None:
    if not cloudinary_configured() or not public_id:
        return

    params = {"public_id": public_id, "timestamp": int(time.time())}
    data = {
        **params,
        "api_key": settings.CLOUDINARY_API_KEY,
        "signature": _signature(params),
    }
    url = (
        f"https://api.cloudinary.com/v1_1/"
        f"{settings.CLOUDINARY_CLOUD_NAME}/image/destroy"
    )
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(url, data=data)
    if response.is_error:
        raise RuntimeError("No se pudo eliminar la imagen")
