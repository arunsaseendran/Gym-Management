from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Avg, Count
from members.models import MemberProfile
from attendance.models import AttendanceRecord
from workouts.models import WorkoutLog
from predictor.models import CaloriePrediction
from trainers.models import TrainerProfile

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    today = timezone.localdate()
    return Response({
        'total_members':    MemberProfile.objects.count(),
        'active_members':   MemberProfile.objects.filter(status='active').count(),
        'pending_approval': MemberProfile.objects.filter(approved=False).count(),
        'total_trainers':   TrainerProfile.objects.count(),
        'checkins_today':   AttendanceRecord.objects.filter(date=today).count(),
        'workouts_total':   WorkoutLog.objects.count(),
        'avg_calories':     WorkoutLog.objects.aggregate(a=Avg('calories_burned'))['a'] or 0,
        'ml_predictions':   CaloriePrediction.objects.count(),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weekly_checkins(request):
    from django.db.models.functions import TruncDate
    qs = (AttendanceRecord.objects
          .filter(date__gte=timezone.localdate() - timezone.timedelta(days=7))
          .values('date')
          .annotate(count=Count('id'))
          .order_by('date'))
    return Response(list(qs))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def calorie_trends(request):
    member_id = request.query_params.get('member')
    qs = CaloriePrediction.objects
    if member_id:
        qs = qs.filter(member_id=member_id)
    elif request.user.role == 'member':
        qs = qs.filter(member__user=request.user)
    data = (qs.order_by('date')
              .values('date','predicted_calories')[:30])
    return Response(list(data))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def slot_occupancy(request):
    from slots.models import TimeSlot
    from slots.views import TimeSlotSerializer
    slots = TimeSlot.objects.filter(active=True)
    return Response(TimeSlotSerializer(slots, many=True).data)
