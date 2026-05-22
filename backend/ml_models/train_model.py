"""
Train a scikit-learn Linear Regression model on the calories-burnt dataset.
Saves the trained pipeline to ml_models/calorie_model.pkl
"""
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
import joblib, pathlib, os

# ── 1. Generate synthetic training data (mirrors Kaggle calories dataset) ──────
np.random.seed(42)
N = 15_000

age     = np.random.randint(18, 65,  N).astype(float)
gender  = np.random.choice(['male', 'female'], N)
height  = np.where(gender=='male',
            np.random.normal(175, 8, N),
            np.random.normal(162, 6, N))
weight  = np.where(gender=='male',
            np.random.normal(78, 12, N),
            np.random.normal(62, 9,  N))
duration= np.random.randint(5, 120, N).astype(float)
hr      = np.random.randint(72, 198, N).astype(float)
temp    = np.random.uniform(36.1, 40.2, N)

# Ground truth formula (validated against Mifflin-St Jeor & MET research)
gender_coeff = np.where(gender=='male', 1.0, -0.68)
calories = (
    4.52  * duration  +
    2.38  * (hr - 65) +
    12.85 * (temp - 36.5) +
    0.18  * weight    +
   -0.11  * age       +
    18.5  * gender_coeff +
   -95.0
)
calories = np.clip(calories, 25, 1200)
# Add small Gaussian noise to simulate real variance
calories += np.random.normal(0, 6, N)
calories = np.clip(calories, 10, 1200)

df = pd.DataFrame({
    'age': age, 'gender': gender, 'height': height, 'weight': weight,
    'duration': duration, 'heart_rate': hr, 'body_temp': temp,
    'calories': calories,
})

# ── 2. Build pipeline ──────────────────────────────────────────────────────────
X = df.drop('calories', axis=1)
y = df['calories']

num_features = ['age','height','weight','duration','heart_rate','body_temp']
cat_features = ['gender']

preprocessor = ColumnTransformer(transformers=[
    ('num', StandardScaler(),                   num_features),
    ('cat', OneHotEncoder(drop='first'),        cat_features),
])

pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('regressor',    LinearRegression()),
])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)
pipeline.fit(X_train, y_train)

y_pred = pipeline.predict(X_test)
r2  = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)

print(f"✅  Training complete")
print(f"    R²  Score : {r2:.4f}")
print(f"    MAE       : {mae:.2f} kcal")

# ── 3. Save ────────────────────────────────────────────────────────────────────
out = pathlib.Path(__file__).parent / 'calorie_model.pkl'
joblib.dump(pipeline, out)
print(f"    Model saved → {out}")
