import time

import httpx

from app.core.config import settings

_cache: dict = {"expires": 0, "data": None}


def places_configured() -> bool:
    return bool(settings.GOOGLE_PLACES_API_KEY and settings.GOOGLE_PLACE_ID)


async def get_google_reviews() -> dict:
    if not places_configured():
        return {"configured": False, "reviews": []}
    if _cache["data"] and _cache["expires"] > time.time():
        return _cache["data"]

    url = f"https://places.googleapis.com/v1/places/{settings.GOOGLE_PLACE_ID}"
    headers = {
        "X-Goog-Api-Key": settings.GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": "displayName,rating,userRatingCount,reviews,googleMapsUri",
    }
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(url, headers=headers, params={"languageCode": "es"})
    if response.is_error:
        raise RuntimeError("No se pudieron consultar las reseñas de Google")

    place = response.json()
    reviews = []
    for review in place.get("reviews", []):
        author = review.get("authorAttribution", {})
        reviews.append(
            {
                "autor": author.get("displayName", "Cliente de Google"),
                "autor_url": author.get("uri"),
                "foto": author.get("photoUri"),
                "puntuacion": review.get("rating", 5),
                "texto": review.get("text", {}).get("text", ""),
                "fecha_relativa": review.get("relativePublishTimeDescription", ""),
            }
        )
    data = {
        "configured": True,
        "nombre": place.get("displayName", {}).get("text", "Sidrería El Tonel"),
        "puntuacion": place.get("rating"),
        "total": place.get("userRatingCount"),
        "google_maps_url": place.get("googleMapsUri"),
        "reviews": reviews,
    }
    _cache.update({"expires": time.time() + 21600, "data": data})
    return data
