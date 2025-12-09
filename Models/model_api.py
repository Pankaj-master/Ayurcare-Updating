from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI()

# Load model
model = joblib.load("model.joblib")

class InputData(BaseModel):
    text: str   # or whatever your model expects

@app.post("/predict")
def predict(data: InputData):
    x = data.text
    result = model.predict([x])[0]
    return {"prediction": result}
