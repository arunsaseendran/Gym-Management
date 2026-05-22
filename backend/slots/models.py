from django.db import models

class TimeSlot(models.Model):
    label        = models.CharField(max_length=50)
    start_time   = models.TimeField()
    end_time     = models.TimeField()
    max_capacity = models.PositiveIntegerField(default=5)
    active       = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.label} ({self.start_time.strftime('%I:%M %p')} – {self.end_time.strftime('%I:%M %p')})"

    @property
    def occupancy(self):
        return self.booked_members.count()

    @property
    def is_full(self):
        return self.occupancy >= self.max_capacity
