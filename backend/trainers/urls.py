from django.urls import path
from .views import TrainerList, TrainerDetail, my_trainees, send_advice
urlpatterns = [
    path('',          TrainerList.as_view(),   name='trainer-list'),
    path('<int:pk>/', TrainerDetail.as_view(), name='trainer-detail'),
    path('my-trainees/', my_trainees,          name='my-trainees'),
    path('advice/',      send_advice,          name='send-advice'),
]
