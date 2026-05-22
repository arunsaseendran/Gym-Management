from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/',           admin.site.urls),
    path('api/auth/',        include('accounts.urls')),
    path('api/members/',     include('members.urls')),
    path('api/trainers/',    include('trainers.urls')),
    path('api/slots/',       include('slots.urls')),
    path('api/attendance/',  include('attendance.urls')),
    path('api/workouts/',    include('workouts.urls')),
    path('api/payments/',    include('payments.urls')),
    path('api/predictor/',   include('predictor.urls')),
    path('api/reports/',     include('reports.urls')),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
