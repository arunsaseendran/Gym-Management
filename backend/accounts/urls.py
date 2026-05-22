from django.urls import path
from .views import LoginView, RegisterView, MeView, change_password, list_users, check_availability

urlpatterns = [
    path('login/',              LoginView.as_view(),    name='login'),
    path('register/',           RegisterView.as_view(), name='register'),
    path('me/',                 MeView.as_view(),       name='me'),
    path('change-password/',    change_password,        name='change-password'),
    path('users/',              list_users,             name='list-users'),
    path('check-availability/', check_availability,     name='check-availability'),
]
