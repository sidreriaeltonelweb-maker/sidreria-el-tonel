from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.db.database import get_db
from app.models.gallery import GalleryImage
from app.models.user import User
from app.schemas.content import GalleryImageUpdate
from app.services.cloudinary import cloudinary_configured, delete_image, upload_image
from app.services.google_calendar import calendar_configured
from app.services.google_places import get_google_reviews, places_configured

router = APIRouter(prefix="/contenido", tags=["Contenido"])
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/avif"}
MAX_IMAGE_SIZE = 8 * 1024 * 1024


@router.get("/fotos")
def listar_fotos_publicas(db: Session = Depends(get_db)):
    return db.query(GalleryImage).filter(
        GalleryImage.activa == True
    ).order_by(GalleryImage.orden, GalleryImage.id).all()


@router.get("/fotos/admin")
def listar_fotos_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return db.query(GalleryImage).order_by(
        GalleryImage.orden, GalleryImage.id
    ).all()


@router.post("/fotos")
async def crear_foto(
    archivo: UploadFile = File(...),
    alt: str = Form("Sidrería El Tonel"),
    orden: int = Form(0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if archivo.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Formato de imagen no permitido")
    content = await archivo.read(MAX_IMAGE_SIZE + 1)
    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="La imagen supera los 8 MB")
    if not content:
        raise HTTPException(status_code=400, detail="La imagen está vacía")
    try:
        uploaded = await upload_image(
            content,
            archivo.filename or "imagen",
            archivo.content_type,
        )
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error

    optimized_url = uploaded["secure_url"].replace(
        "/upload/", "/upload/f_auto,q_auto,w_1600/"
    )
    image = GalleryImage(
        url=optimized_url,
        public_id=uploaded["public_id"],
        alt=alt.strip() or "Sidrería El Tonel",
        orden=orden,
        activa=True,
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.patch("/fotos/{image_id}")
def actualizar_foto(
    image_id: int,
    data: GalleryImageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    image = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(image, field, value)
    db.commit()
    db.refresh(image)
    return image


@router.delete("/fotos/{image_id}")
async def eliminar_foto(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    image = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    try:
        await delete_image(image.public_id)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    db.delete(image)
    db.commit()
    return {"message": "Imagen eliminada"}


@router.get("/resenas")
async def listar_resenas_google():
    try:
        return await get_google_reviews()
    except RuntimeError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error


@router.get("/configuracion")
def estado_integraciones(current_user: User = Depends(require_admin)):
    return {
        "cloudinary": cloudinary_configured(),
        "google_calendar": calendar_configured(),
        "google_reviews": places_configured(),
    }
