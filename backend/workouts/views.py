from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from members.models import MemberProfile
from trainers.models import TrainerProfile
from .models import WorkoutLog, TrainerAdvice, WorkoutPlan, DietPlan
from .serializers import WorkoutLogSerializer, TrainerAdviceSerializer, WorkoutPlanSerializer, DietPlanSerializer
from predictor.engine import predict_calories

class WorkoutLogList(generics.ListCreateAPIView):
    serializer_class = WorkoutLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        qs = WorkoutLog.objects.all().select_related('member__user')
        if u.role == 'member':
            qs = qs.filter(member__user=u)
        elif u.role == 'trainer':
            qs = qs.filter(member__assigned_trainer__user=u)
        member_id = self.request.query_params.get('member')
        if member_id:
            qs = qs.filter(member_id=member_id)
        return qs

    def perform_create(self, serializer):
        member = serializer.validated_data.get('member') or MemberProfile.objects.get(user=self.request.user)
        # Auto-predict calories using ML model
        calories = predict_calories(
            age=member.age,
            gender=member.gender,
            height=member.height_cm,
            weight=member.weight_kg,
            duration=serializer.validated_data['duration_min'],
            heart_rate=145 if serializer.validated_data['intensity']=='high' else 125 if serializer.validated_data['intensity']=='medium' else 95,
            body_temp=38.3 if serializer.validated_data['intensity']=='high' else 37.6 if serializer.validated_data['intensity']=='medium' else 36.8,
        )
        serializer.save(calories_burned=calories)

class WorkoutLogDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = WorkoutLog.objects.all()
    serializer_class = WorkoutLogSerializer
    permission_classes = [permissions.IsAuthenticated]

class AdviceList(generics.ListAPIView):
    serializer_class = TrainerAdviceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        if u.role == 'member':
            return TrainerAdvice.objects.filter(member__user=u).select_related('trainer__user','member__user')
        if u.role == 'trainer':
            return TrainerAdvice.objects.filter(trainer__user=u).select_related('trainer__user','member__user')
        return TrainerAdvice.objects.all().select_related('trainer__user','member__user')

class WorkoutPlanList(generics.ListCreateAPIView):
    serializer_class = WorkoutPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        qs = WorkoutPlan.objects.all().select_related('member__user', 'trainer__user')
        if u.role == 'member':
            qs = qs.filter(member__user=u)
        elif u.role == 'trainer':
            qs = qs.filter(trainer__user=u)
        
        member_id = self.request.query_params.get('member')
        if member_id:
            qs = qs.filter(member_id=member_id)
        return qs

    def perform_create(self, serializer):
        u = self.request.user
        if u.role == 'trainer':
            trainer = TrainerProfile.objects.get(user=u)
            serializer.save(trainer=trainer)
        else:
            serializer.save()

class WorkoutPlanDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = WorkoutPlan.objects.all()
    serializer_class = WorkoutPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

class DietPlanList(generics.ListCreateAPIView):
    serializer_class = DietPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        qs = DietPlan.objects.all().select_related('member__user', 'trainer__user')
        if u.role == 'member':
            qs = qs.filter(member__user=u)
        elif u.role == 'trainer':
            qs = qs.filter(trainer__user=u)
        
        member_id = self.request.query_params.get('member')
        if member_id:
            qs = qs.filter(member_id=member_id)
        return qs

    def perform_create(self, serializer):
        u = self.request.user
        if u.role == 'trainer':
            trainer = TrainerProfile.objects.get(user=u)
            serializer.save(trainer=trainer)
        else:
            serializer.save()

class DietPlanDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = DietPlan.objects.all()
    serializer_class = DietPlanSerializer
    permission_classes = [permissions.IsAuthenticated]
