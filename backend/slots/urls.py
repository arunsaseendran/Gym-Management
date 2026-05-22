from django.urls import path
from .views import SlotList, SlotDetail
urlpatterns = [
    path('',          SlotList.as_view(),   name='slot-list'),
    path('<int:pk>/', SlotDetail.as_view(), name='slot-detail'),
]
