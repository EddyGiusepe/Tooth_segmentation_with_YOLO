"""
Senior Data Scientist/AI Engineering.: Dr. Eddy Giusepe Chirinos Isidro

Backend — Dental Segmentation API
===================================
Exposes the POST /predict endpoint that receives a dental X-ray image
and returns the segmented result with FDI tooth labels via YOLOv8m-seg.

ENDPOINTS
---------
GET  /          → health-check
GET  /health    → health-check (JSON)
POST /predict   → run tooth segmentation on the uploaded image

RUN (development)
-----------------
uvicorn main:app --reload --host 0.0.0.0 --port 8000

RUN (production)
----------------
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from io import BytesIO

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

from model import get_model, run_inference
from schemas import Detection, PredictResponse

# Lifespan
# Load the model once on startup and release resources on shutdown.
# Recommended by the official FastAPI documentation:
# https://fastapi.tiangolo.com/advanced/events/

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load the YOLOv8 model
    get_model()
    yield
    # Shutdown: clean up resources (if necessary)
    # The model is kept in memory while the process is alive.
    # Add here release of GPU or external connections if necessary.


app = FastAPI(
    title="Dental Segmentation API",
    description=(
        "Tooth instance segmentation on panoramic X-ray images using YOLOv8m-seg "
        "trained on the Humans-in-the-Loop dataset with 32 FDI tooth classes."
    ),
    version="1.0.0",
    contact={
        "name": "Dr. Eddy Giusepe Chirinos Isidro",
        "email": "eddychirinos.unac@gmail.com",
    },
    lifespan=lifespan,
)

# CORS
# Allow the Next.js dev server (port 3000) and any production origin.
# Restrict to specific origins in production for security.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routes
@app.get("/", tags=["Health"])
async def root() -> dict:
    """Root health-check."""
    return {"status": "ok", "service": "Dental Segmentation API"}


@app.get("/health", tags=["Health"])
async def health() -> dict:
    """Structured health-check used by load-balancers and Docker healthchecks."""
    return {"status": "ok"}


@app.post(
    "/predict",
    response_model=PredictResponse,
    tags=["Inference"],
    summary="Segment teeth in a dental X-ray",
    response_description=(
        "Annotated image (base64 PNG) and list of detected FDI tooth classes."
    ),
)
async def predict(
    file: UploadFile = File(
        ...,
        description="Dental X-ray image (JPEG or PNG, max 20 MB recommended).",
    ),
    conf: float = Form(
        default=0.35,
        ge=0.10,
        le=0.95,
        description="Confidence threshold. Detections below this value are discarded.",
    ),
) -> PredictResponse:
    """
    Receive a dental X-ray image and return:

    - **image_b64**: the annotated image with coloured tooth masks, encoded as
      a base64 PNG string ready to be embedded in an `<img>` tag.
    - **detections**: list of detected teeth, one entry per unique FDI class,
      sorted alphabetically.  Each entry contains the tooth name, confidence
      score (best instance), and the hex colour used for its mask.
    """
    # Validate content type
    allowed = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(
            status_code=415,
            detail=(
                f"Unsupported media type '{file.content_type}'. "
                f"Accepted: {', '.join(sorted(allowed))}."
            ),
        )

    # Read & decode image:
    raw_bytes = await file.read()
    try:
        image = Image.open(BytesIO(raw_bytes))
    except UnidentifiedImageError:
        raise HTTPException(
            status_code=422,
            detail="Could not decode the uploaded file as an image.",
        )

    # Run inference:
    try:
        image_b64, raw_detections = run_inference(image, conf=conf)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Inference error: {exc}",
        )

    # Build response:
    detections = [Detection(**d) for d in raw_detections]
    return PredictResponse(image_b64=image_b64, detections=detections)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, workers=2, reload=True)