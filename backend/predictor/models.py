from django.db import models
from members.models import MemberProfile

class CaloriePrediction(models.Model):
    member      = models.ForeignKey(MemberProfile, on_delete=models.CASCADE, related_name='ml_predictions')
    date        = models.DateTimeField(auto_now_add=True)
    age         = models.FloatField()
    gender      = models.CharField(max_length=10)
    height      = models.FloatField()
    weight      = models.FloatField()
    duration    = models.FloatField()
    heart_rate  = models.FloatField()
    body_temp   = models.FloatField()
    predicted_calories = models.FloatField()

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.member} — {self.predicted_calories:.0f} kcal ({self.date.date()})"
