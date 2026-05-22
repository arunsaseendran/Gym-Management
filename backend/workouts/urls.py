from django.urls import path
from .views import (
    WorkoutLogList, WorkoutLogDetail, AdviceList, 
    WorkoutPlanList, WorkoutPlanDetail,
    DietPlanList, DietPlanDetail
)

urlpatterns = [
    path('',                  WorkoutLogList.as_view(),   name='workout-list'),
    path('<int:pk>/',         WorkoutLogDetail.as_view(), name='workout-detail'),
    path('advice/',           AdviceList.as_view(),       name='advice-list'),
    path('plans/',            WorkoutPlanList.as_view(),   name='workout-plan-list'),
    path('plans/<int:pk>/',   WorkoutPlanDetail.as_view(), name='workout-plan-detail'),
    path('diets/',            DietPlanList.as_view(),      name='diet-plan-list'),
    path('diets/<int:pk>/',   DietPlanDetail.as_view(),    name='diet-plan-detail'),
]
