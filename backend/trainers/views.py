from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import TrainerProfile
from .serializers import TrainerProfileSerializer

class TrainerList(generics.ListAPIView):
    queryset = TrainerProfile.objects.all().select_related('user')
    serializer_class = TrainerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

class IsAdminOrSelf(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        if obj.user == request.user:
            return request.method in permissions.SAFE_METHODS or request.method in ('PUT', 'PATCH')
        return False

class TrainerDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = TrainerProfile.objects.all().select_related('user')
    serializer_class = TrainerProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSelf]

    def perform_destroy(self, instance):
        user = instance.user
        instance.delete()
        user.delete()

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_trainees(request):
    """Trainer sees their assigned members."""
    try:
        tp = TrainerProfile.objects.get(user=request.user)
    except TrainerProfile.DoesNotExist:
        return Response({'error': 'Not a trainer'}, status=403)
    from members.serializers import MemberProfileSerializer
    members = tp.trainees.all().select_related('user','selected_slot')
    return Response(MemberProfileSerializer(members, many=True).data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_advice(request):
    from workouts.models import TrainerAdvice
    from workouts.serializers import TrainerAdviceSerializer
    if request.user.role not in ('admin','trainer'):
        return Response({'error': 'Trainer/Admin only'}, status=403)
    try:
        tp = TrainerProfile.objects.get(user=request.user)
    except TrainerProfile.DoesNotExist:
        return Response({'error': 'Trainer profile missing'}, status=400)
    data = request.data.copy()
    data['trainer'] = tp.id
    ser = TrainerAdviceSerializer(data=data)
    if ser.is_valid():
        ser.save()
        return Response(ser.data, status=201)
    return Response(ser.errors, status=400)
