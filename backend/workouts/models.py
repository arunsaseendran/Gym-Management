from django.db import models
from members.models import MemberProfile
from trainers.models import TrainerProfile

class WorkoutLog(models.Model):
    EXERCISE_CHOICES = [
        ('cardio','Cardio'),('strength','Weight Training'),('yoga','Yoga'),
        ('hiit','HIIT'),('pilates','Pilates'),('swimming','Swimming'),
        ('crossfit','CrossFit'),('other','Other'),
    ]
    INTENSITY_CHOICES = [('low','Low'),('medium','Medium'),('high','High')]

    member          = models.ForeignKey(MemberProfile, on_delete=models.CASCADE, related_name='workout_logs')
    date            = models.DateField(auto_now_add=True)
    exercise_type   = models.CharField(max_length=20, choices=EXERCISE_CHOICES)
    duration_min    = models.PositiveIntegerField()
    intensity       = models.CharField(max_length=10, choices=INTENSITY_CHOICES)
    calories_burned = models.FloatField(null=True, blank=True)  # filled by ML
    notes           = models.TextField(blank=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.member} — {self.date} ({self.exercise_type})"

class TrainerAdvice(models.Model):
    member  = models.ForeignKey(MemberProfile, on_delete=models.CASCADE, related_name='advice_received')
    trainer = models.ForeignKey(TrainerProfile, on_delete=models.CASCADE, related_name='advice_sent')
    date    = models.DateTimeField(auto_now_add=True)
    text    = models.TextField()

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Advice from {self.trainer} to {self.member}"

class WorkoutPlan(models.Model):
    DIFF_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced')
    ]
    member      = models.ForeignKey(MemberProfile, on_delete=models.CASCADE, related_name='workout_plans')
    trainer     = models.ForeignKey(TrainerProfile, on_delete=models.CASCADE, related_name='assigned_plans')
    name        = models.CharField(max_length=100, default='Weekly Workout Plan')
    difficulty  = models.CharField(max_length=15, choices=DIFF_CHOICES, default='intermediate')
    notes       = models.TextField(blank=True)
    routines    = models.JSONField(default=dict)  # Stores day-wise routines
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Workout Plan: {self.name} for {self.member.user.get_full_name() or self.member.user.username} by {self.trainer.user.get_full_name() or self.trainer.user.username}"

class DietPlan(models.Model):
    member       = models.ForeignKey(MemberProfile, on_delete=models.CASCADE, related_name='diet_plans')
    trainer      = models.ForeignKey(TrainerProfile, on_delete=models.CASCADE, related_name='assigned_diet_plans')
    name         = models.CharField(max_length=100, default='Daily Diet Plan')
    breakfast    = models.TextField(blank=True)
    lunch        = models.TextField(blank=True)
    dinner       = models.TextField(blank=True)
    snack        = models.TextField(blank=True)
    water_intake = models.CharField(max_length=50, default='3 litres daily')
    notes        = models.TextField(blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Diet Plan: {self.name} for {self.member.user.get_full_name() or self.member.user.username} by {self.trainer.user.get_full_name() or self.trainer.user.username}"
