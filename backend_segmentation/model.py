"""
Senior Data Scientist/AI Engineering.: Dr. Eddy Giusepe Chirinos Isidro

Backend — Dental Segmentation API
===================================
Singleton model loader and inference logic.

The YOLOv8m-seg model is loaded once at startup and reused for every
request, avoiding the overhead of reloading weights on every call.

'run_inference' receives a PIL image, overlays the predicted tooth
masks using HSV-spaced unique colours (one colour per FDI class), and
returns:
  - The annotated image as a base64-encoded PNG string.
  - A deduplicated list of detected teeth (highest-confidence instance
    per class) with their assigned colour.
"""

from __future__ import annotations

import base64
import colorsys
import io
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from ultralytics import YOLO

# Model path:
# Resolved relative to this file so the backend can be started from any cwd.
_BACKEND_DIR  = Path(__file__).parent
_PROJECT_ROOT = _BACKEND_DIR.parent
_MODEL_PATH   = _PROJECT_ROOT / "runs" / "teeth_safe_run-3" / "weights" / "best.pt"

# Singleton:
_model: YOLO | None = None


def get_model() -> YOLO:
    """Load the YOLO model once and cache it for the lifetime of the process."""
    global _model
    if _model is None:
        if not _MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Model weights not found at '{_MODEL_PATH}'. "
                "Please train the model or adjust _MODEL_PATH in model.py."
            )
        _model = YOLO(str(_MODEL_PATH))
    return _model


# Colour helpers:
def _make_unique_palette(cls_ids: list[int]) -> dict[int, tuple[int, int, int]]:
    """
    Generate one visually distinct RGB colour per unique class ID.

    Colours are evenly spaced in the HSV hue wheel so they never repeat,
    regardless of the number of detected classes (up to 32 for FDI).
    """
    n = len(cls_ids)
    palette: dict[int, tuple[int, int, int]] = {}
    for i, cls_id in enumerate(cls_ids):
        hue = i / max(n, 1)
        r, g, b = colorsys.hsv_to_rgb(hue, 0.85, 0.90)
        palette[cls_id] = (int(r * 255), int(g * 255), int(b * 255))
    return palette


def _rgb_to_hex(rgb: tuple[int, int, int]) -> str:
    return "#{:02x}{:02x}{:02x}".format(*rgb)


# Inference:

def run_inference(
    image: Image.Image,
    conf: float = 0.35,
) -> tuple[str, list[dict]]:
    """
    Run tooth segmentation on *image* and return the annotated result.

    Parameters
    ----------
    image:
        PIL image (any mode; converted to RGB internally).
    conf:
        Confidence threshold in [0, 1].  Detections below this score
        are discarded.

    Returns
    -------
    image_b64:
        Base64-encoded PNG of the annotated image.
    detections:
        List of dicts ``{name, confidence, color}`` — one entry per
        unique FDI class detected, sorted alphabetically.
    """
    model = get_model()

    # Ensure RGB:
    image = image.convert("RGB")
    img_array = np.array(image)
    h_img, w_img = img_array.shape[:2]

    # Run prediction:
    results = model.predict(source=image, conf=conf, verbose=False)
    result  = results[0]

    # Build unique colour palette:
    unique_cls_ids = sorted({int(b.cls) for b in result.boxes})
    palette        = _make_unique_palette(unique_cls_ids)

    # Overlay masks:
    overlay = img_array.copy()

    # Store centroids and tooth numbers for label drawing after blending:
    labels: list[tuple[int, int, str]] = []  # (cx, cy, tooth_number)

    if result.masks is not None:
        for mask_tensor, box in zip(result.masks.data, result.boxes):
            cls_id = int(box.cls)
            color  = palette[cls_id]

            # Resize mask to original image dimensions:
            mask_pil     = Image.fromarray(
                (mask_tensor.cpu().numpy() * 255).astype(np.uint8)
            ).resize((w_img, h_img), Image.NEAREST)
            mask_arr = np.array(mask_pil) > 127

            # Blend: 45 % original + 55 % mask colour:
            for c, val in enumerate(color):
                overlay[:, :, c] = np.where(
                    mask_arr,
                    overlay[:, :, c] * 0.45 + val * 0.55,
                    overlay[:, :, c],
                ).astype(np.uint8)

            # Compute centroid and extract tooth number (e.g. "UR1_T24" → "24"):
            ys, xs = np.where(mask_arr)
            if len(xs) > 0:
                cx = int(xs.mean())
                cy = int(ys.mean())
                tooth_num = model.names[cls_id].split("_T")[-1]
                labels.append((cx, cy, tooth_num))

    # Draw tooth numbers on top of the blended overlay:
    annotated_pil = Image.fromarray(overlay)

    if labels:
        draw = ImageDraw.Draw(annotated_pil)

        # Scale font size to image width (readable at any resolution):
        font_size = max(14, w_img // 70)
        font: ImageFont.ImageFont | ImageFont.FreeTypeFont
        try:
            # Use a system TrueType font if available:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except (OSError, IOError):
            font = ImageFont.load_default()

        for cx, cy, tooth_num in labels:
            # Anchor text at center using textbbox for accurate positioning:
            try:
                bbox = draw.textbbox((0, 0), tooth_num, font=font)
                tw = bbox[2] - bbox[0]
                th = bbox[3] - bbox[1]
            except AttributeError:
                # Pillow < 9.2 fallback:
                tw, th = draw.textsize(tooth_num, font=font)  # type: ignore[attr-defined]
            tx = cx - tw // 2
            ty = cy - th // 2

            # Black outline for legibility over any mask colour:
            for dx, dy in [(-1, -1), (-1, 1), (1, -1), (1, 1),
                           (-1, 0),  (1, 0),  (0, -1), (0, 1)]:
                draw.text((tx + dx, ty + dy), tooth_num, fill=(0, 0, 0), font=font)

            # White text on top:
            draw.text((tx, ty), tooth_num, fill=(255, 255, 255), font=font)

    buffer = io.BytesIO()
    annotated_pil.save(buffer, format="PNG")
    image_b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    # Collect detections (best confidence per class):
    best: dict[int, dict] = {}
    for box in result.boxes:
        cls_id = int(box.cls)
        conf_  = float(box.conf)
        if cls_id not in best or conf_ > best[cls_id]["confidence"]:
            best[cls_id] = {
                "name":       model.names[cls_id],
                "confidence": round(conf_, 4),
                "color":      _rgb_to_hex(palette[cls_id]),
            }

    detections = sorted(best.values(), key=lambda d: d["name"])

    return image_b64, detections
