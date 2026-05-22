"""
Inference engine — loads the trained sklearn pipeline and runs predictions.
Thread-safe: model loaded once at import time.
"""
import joblib
import pandas as pd
import numpy as np
from django.conf import settings

_model = None

def _get_model():
    global _model
    if _model is None:
        _model = joblib.load(settings.ML_MODEL_PATH)
    return _model

def predict_calories(age: float, gender: str, height: float, weight: float,
                     duration: float, heart_rate: float, body_temp: float) -> float:
    model = _get_model()
    df = pd.DataFrame([{
        'age':        age,
        'gender':     gender.lower(),
        'height':     height,
        'weight':     weight,
        'duration':   duration,
        'heart_rate': heart_rate,
        'body_temp':  body_temp,
    }])
    pred = model.predict(df)[0]
    return max(10.0, round(float(pred), 1))
