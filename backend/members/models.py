from django.db import models
from django.conf import settings

class MemberProfile(models.Model):
    PLAN_CHOICES = [
        ('standard_monthly', 'Standard Monthly'),
        ('elite_quarterly',  'Elite Quarterly'),
        ('premium_annual',   'Premium Annual'),
    ]
    STATUS_CHOICES = [('active','Active'), ('inactive','Inactive'), ('suspended','Suspended')]
    PAYMENT_CHOICES = [('paid','Paid'), ('pending','Pending'), ('overdue','Overdue')]
    GENDER_CHOICES = [('male','Male'), ('female','Female'), ('other','Other')]

    user             = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='member_profile')
    age              = models.PositiveIntegerField()
    gender           = models.CharField(max_length=10, choices=GENDER_CHOICES)
    height_cm        = models.FloatField()
    weight_kg        = models.FloatField()
    target_weight_kg = models.FloatField()
    calorie_target   = models.PositiveIntegerField(default=2200)
    membership_plan  = models.CharField(max_length=20, choices=PLAN_CHOICES, default='standard_monthly')
    membership_validity = models.DateField()
    status           = models.CharField(max_length=15, choices=STATUS_CHOICES, default='inactive')
    approved         = models.BooleanField(default=False)
    payment_status   = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default='pending')
    assigned_trainer = models.ForeignKey('trainers.TrainerProfile', null=True, blank=True, on_delete=models.SET_NULL, related_name='trainees')
    selected_slot    = models.ForeignKey('slots.TimeSlot', null=True, blank=True, on_delete=models.SET_NULL, related_name='booked_members')
    water_intake     = models.PositiveIntegerField(default=0)
    profile_photo    = models.ImageField(upload_to='profiles/', blank=True, null=True)
    qr_code          = models.ImageField(upload_to='qrcodes/', blank=True, null=True)
    created_at       = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.get_full_name()} – {self.membership_plan}"

    @property
    def bmi(self):
        h = self.height_cm / 100
        return round(self.weight_kg / (h * h), 1)
