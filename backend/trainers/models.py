from django.db import models
from django.conf import settings

class TrainerProfile(models.Model):
    SPEC_CHOICES = [
        ('strength','Strength Training'),('yoga','Yoga & Flexibility'),
        ('cardio','Cardio & HIIT'),('crossfit','CrossFit'),
        ('swimming','Swimming'),('pilates','Pilates'),('general','General Fitness'),
    ]
    user           = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='trainer_profile')
    specialization = models.CharField(max_length=20, choices=SPEC_CHOICES, default='general')
    schedule       = models.CharField(max_length=100)
    availability   = models.BooleanField(default=True)
    bio            = models.TextField(blank=True)
    profile_photo  = models.ImageField(upload_to='trainers/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.get_specialization_display()})"
