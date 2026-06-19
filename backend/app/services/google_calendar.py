import base64
import json
from datetime import datetime
from urllib.parse import quote
from zoneinfo import ZoneInfo

import requests
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import service_account

from app.core.config import settings

CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar"


def calendar_configured() -> bool:
    return bool(settings.GOOGLE_SERVICE_ACCOUNT_JSON and settings.GOOGLE_CALENDAR_ID)


def _service_account_info() -> dict:
    raw = settings.GOOGLE_SERVICE_ACCOUNT_JSON.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return json.loads(base64.b64decode(raw).decode("utf-8"))


def _access_token() -> str:
    credentials = service_account.Credentials.from_service_account_info(
        _service_account_info(), scopes=[CALENDAR_SCOPE]
    )
    credentials.refresh(GoogleRequest())
    return credentials.token


def _event_body(reserva, mesa_nombre: str | None = None) -> dict:
    timezone = ZoneInfo("Europe/Madrid")
    inicio = datetime.combine(reserva.fecha, reserva.hora, timezone)
    fin = datetime.combine(reserva.fecha, reserva.hora_fin, timezone)
    comedor = "Terraza exterior" if reserva.zona_preferida == "exterior" else "Comedor interior"
    mesa = mesa_nombre or "Sin mesa asignada"
    return {
        "summary": f"Reserva - {reserva.cliente_nombre} ({reserva.personas})",
        "description": (
            f"Teléfono: {reserva.cliente_telefono}\n"
            f"Personas: {reserva.personas}\n"
            f"Comedor: {comedor}\n"
            f"Mesa: {mesa}\n"
            f"Observaciones: {reserva.observaciones or 'Sin observaciones'}"
        ),
        "location": "Sidrería El Tonel, Soto de Cangas, Asturias",
        "start": {"dateTime": inicio.isoformat(), "timeZone": "Europe/Madrid"},
        "end": {"dateTime": fin.isoformat(), "timeZone": "Europe/Madrid"},
        "extendedProperties": {
            "private": {"reservaId": str(reserva.id)}
        },
    }


def sync_reservation_event(reserva, mesa_nombre: str | None = None) -> str | None:
    if not calendar_configured():
        return reserva.google_event_id

    calendar_id = quote(settings.GOOGLE_CALENDAR_ID, safe="")
    base_url = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events"
    headers = {
        "Authorization": f"Bearer {_access_token()}",
        "Content-Type": "application/json",
    }
    body = _event_body(reserva, mesa_nombre)
    if reserva.google_event_id:
        url = f"{base_url}/{quote(reserva.google_event_id, safe='')}"
        response = requests.put(url, headers=headers, json=body, timeout=30)
    else:
        response = requests.post(url=base_url, headers=headers, json=body, timeout=30)
    if response.status_code >= 400:
        raise RuntimeError("Google Calendar no pudo sincronizar la reserva")
    return response.json()["id"]


def delete_reservation_event(event_id: str | None) -> None:
    if not calendar_configured() or not event_id:
        return
    calendar_id = quote(settings.GOOGLE_CALENDAR_ID, safe="")
    event = quote(event_id, safe="")
    url = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events/{event}"
    response = requests.delete(
        url,
        headers={"Authorization": f"Bearer {_access_token()}"},
        timeout=30,
    )
    if response.status_code not in [204, 404, 410]:
        raise RuntimeError("Google Calendar no pudo cancelar la reserva")
