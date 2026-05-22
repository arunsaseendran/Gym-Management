from django.urls import path
from .views import dashboard_stats, weekly_checkins, calorie_trends, slot_occupancy
urlpatterns = [
    path('dashboard/',      dashboard_stats,  name='dashboard-stats'),
    path('weekly-checkins/',weekly_checkins,  name='weekly-checkins'),
    path('calorie-trends/', calorie_trends,   name='calorie-trends'),
    path('slot-occupancy/', slot_occupancy,   name='slot-occupancy'),
]
