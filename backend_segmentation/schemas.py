"""
Senior Data Scientist/AI Engineering.: Dr. Eddy Giusepe Chirinos Isidro

Backend — Dental Segmentation API
===================================
Pydantic schemas for request validation and response serialization.

Each 'Detection' carries the FDI tooth name, the model's confidence
score, and the unique hex colour assigned to that class so the
front-end can render a matching legend without extra computation.

'PredictResponse' wraps the annotated image (PNG encoded as base64)
together with the list of detected teeth, one entry per unique class.
"""

from pydantic import BaseModel, Field


class Detection(BaseModel):
    """A single detected tooth instance."""

    name: str = Field(
        ..., # required
        description="FDI tooth identifier, e.g. 'UR1_T1'.",
        examples=["UR1_T1"],
    )
    confidence: float = Field(
        ..., # required
        ge=0.0,
        le=1.0,
        description="Model confidence score in [0, 1].",
        examples=[0.87],
    )
    color: str = Field(
        ...,
        description="Hex colour (#rrggbb) used to render the mask for this class.",
        examples=["#e63946"],
    )


class PredictResponse(BaseModel):
    """Response returned by POST /predict."""

    image_b64: str = Field(
        ...,
        description=(
            "Annotated image encoded as a base64 PNG string. "
            "Render in the browser with: "
            "<img src='data:image/png;base64,{image_b64}' />"
        ),
    )
    detections: list[Detection] = Field(
        ...,
        description=(
            "List of unique teeth detected, sorted alphabetically by FDI name. "
            "If the same class appears multiple times the entry with the highest "
            "confidence is kept."
        ),
    )
