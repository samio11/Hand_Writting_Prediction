import os
import io
import base64
import numpy as np
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf

app = FastAPI(
    title="Handwriting Digit Predictor API",
    description="FastAPI Backend serving MNIST ANN digit model with Bounding Box Centering.",
    version="1.1.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "handwriting_model.keras")

# Global model instance
model = None

@app.on_event("startup")
def load_trained_model():
    global model
    if os.path.exists(MODEL_PATH):
        try:
            model = tf.keras.models.load_model(MODEL_PATH)
            print(f"Loaded Keras model successfully from {MODEL_PATH}")
        except Exception as e:
            print(f"Failed to load model: {e}")
    else:
        print(f"Warning: Model file not found at {MODEL_PATH}.")

class CanvasImageData(BaseModel):
    image: str  # Base64 data URL string from HTML5 canvas

def preprocess_canvas_image(image_bytes: bytes):
    """
    Standard MNIST Preprocessing:
    1. Handle RGBA alpha channel transparency (paste on black background).
    2. Extract bounding box of drawn digit.
    3. Scale digit to fit 20x20 box preserving aspect ratio.
    4. Pad and center inside 28x28 frame matching MNIST spatial distribution.
    """
    img = Image.open(io.BytesIO(image_bytes))

    # Create solid black background (L mode)
    background = Image.new("L", img.size, 0)
    if img.mode == "RGBA":
        # Use alpha channel as mask if available
        alpha = img.split()[3]
        background.paste(img.convert("L"), mask=alpha)
    else:
        background = img.convert("L")

    # Get bounding box of the drawn digit (non-black pixels)
    bbox = background.getbbox()

    if bbox:
        left, upper, right, lower = bbox
        width = right - left
        height = lower - upper

        # Crop the digit
        cropped = background.crop((left, upper, right, lower))

        # Scale to fit inside 20x20 box while preserving aspect ratio
        if width > height:
            new_w = 20
            new_h = max(1, int(round(height * 20.0 / width)))
        else:
            new_h = 20
            new_w = max(1, int(round(width * 20.0 / height)))

        resized_digit = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

        # Create 28x28 black canvas and paste centered
        final_img = Image.new("L", (28, 28), 0)
        paste_x = (28 - new_w) // 2
        paste_y = (28 - new_h) // 2
        final_img.paste(resized_digit, (paste_x, paste_y))
    else:
        # Empty canvas fallback
        final_img = background.resize((28, 28), Image.Resampling.LANCZOS)

    # Convert to array and normalize (0 to 1)
    img_array = np.array(final_img, dtype=np.float32) / 255.0

    # Encode 28x28 processed image back to base64 for debug UI
    buffer = io.BytesIO()
    final_img.save(buffer, format="PNG")
    processed_base64 = "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode("utf-8")

    return img_array, processed_base64

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Handwriting Digit Predictor API",
        "model_loaded": model is not None
    }

@app.post("/predict")
async def predict_digit(payload: CanvasImageData):
    global model
    if model is None:
        if os.path.exists(MODEL_PATH):
            model = tf.keras.models.load_model(MODEL_PATH)
        else:
            raise HTTPException(
                status_code=503,
                detail="Model is not loaded. Please ensure handwriting_model.keras exists."
            )

    try:
        raw_image_data = payload.image
        if "," in raw_image_data:
            _, encoded = raw_image_data.split(",", 1)
        else:
            encoded = raw_image_data

        image_bytes = base64.b64decode(encoded)

        # Perform MNIST-standard bounding box preprocessing
        img_array, processed_base64 = preprocess_canvas_image(image_bytes)

        # Batch dimension (1, 28, 28)
        input_data = np.expand_dims(img_array, axis=0)

        # Model Prediction
        predictions = model.predict(input_data)
        probabilities = predictions[0].tolist()
        predicted_digit = int(np.argmax(probabilities))
        confidence = float(probabilities[predicted_digit])

        return {
            "success": True,
            "prediction": predicted_digit,
            "confidence": round(confidence * 100, 2),
            "probabilities": [round(p * 100, 2) for p in probabilities],
            "processed_image": processed_base64
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to process image and predict: {str(e)}"
        )
