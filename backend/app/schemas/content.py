from pydantic import BaseModel, field_validator


class GalleryImageUpdate(BaseModel):
    alt: str | None = None
    orden: int | None = None
    activa: bool | None = None

    @field_validator("alt")
    @classmethod
    def validar_alt(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("La descripción de la imagen es obligatoria")
        return value
