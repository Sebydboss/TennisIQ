from fastapi import FastAPI, UploadFile, File
import cv2
import numpy as np

app = FastAPI()

latest_result = {
    "technique": "Processing...",
    "power": "",
    "fixes": ""
}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    contents = await file.read()

    with open("temp.mp4", "wb") as f:
        f.write(contents)

    cap = cv2.VideoCapture("temp.mp4")

    frames = []
    count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if count % 10 == 0:
            resized = cv2.resize(frame, (224, 224))
            frames.append(resized)

        count += 1

    cap.release()

    # 🔥 simulate AI (replace with Claude later)
    global latest_result
    latest_result = {
        "technique": "Toss inconsistent",
        "power": "Needs more hip rotation",
        "fixes": "Focus on timing + leg drive"
    }

    return {"status": "done"}


@app.get("/results")
def results():
    return latest_result
