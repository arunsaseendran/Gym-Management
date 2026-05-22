from django.urls import path
from .views import run_prediction, PredictionHistory
urlpatterns = [
    path('predict/', run_prediction,              name='predict'),
    path('history/', PredictionHistory.as_view(), name='prediction-history'),
]
