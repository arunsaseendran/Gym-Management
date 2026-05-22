from django.db import models


class PaymentOrder(models.Model):
    STATUS_CHOICES = [
        ('created', 'Created'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    ]

    razorpay_order_id  = models.CharField(max_length=100, unique=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True)
    razorpay_signature = models.CharField(max_length=255, blank=True)

    plan         = models.CharField(max_length=50)
    amount_paise = models.PositiveIntegerField()   # stored in paise (INR × 100)
    currency     = models.CharField(max_length=5, default='INR')
    status       = models.CharField(max_length=10, choices=STATUS_CHOICES, default='created')

    email        = models.EmailField(blank=True)
    name         = models.CharField(max_length=100, blank=True)

    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.razorpay_order_id} | {self.plan} | {self.status}"
