from django.db import models
from django.conf import settings
from members.models import MemberProfile
from slots.models import TimeSlot

class AttendanceRecord(models.Model):
    STATUS_CHOICES = [('present','Present'), ('absent','Absent'), ('late','Late Entry')]
    member     = models.ForeignKey(MemberProfile, on_delete=models.CASCADE, related_name='attendance_records')
    slot       = models.ForeignKey(TimeSlot, null=True, blank=True, on_delete=models.SET_NULL)
    date       = models.DateField(auto_now_add=True)
    time       = models.TimeField(auto_now_add=True)
    status     = models.CharField(max_length=10, choices=STATUS_CHOICES, default='present')
    scanned_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='scans_done')

    class Meta:
        ordering = ['-date', '-time']

    def __str__(self):
        return f"{self.member} — {self.date} ({self.status})"
