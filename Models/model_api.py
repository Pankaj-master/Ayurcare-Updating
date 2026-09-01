import os
from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI()

# Load model with correct filename and absolute path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = joblib.load(os.path.join(BASE_DIR, "diet_model.joblib"))

class InputData(BaseModel):
    text: str

@app.post("/predict")
def predict(data: InputData):
    x = data.text
    result = model.predict([x])[0]
    return {"prediction": result}


'''from fastapi import FastAPI
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
'''