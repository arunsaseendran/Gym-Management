from django.urls import path
from .views import AttendanceList, qr_checkin, mark_attendance
urlpatterns = [
    path('',        AttendanceList.as_view(), name='attendance-list'),
    path('qr/',     qr_checkin,              name='qr-checkin'),
    path('manual/', mark_attendance,         name='mark-attendance'),
]
