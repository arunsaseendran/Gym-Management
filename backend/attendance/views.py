from rest_framework import serializers, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from members.models import MemberProfile
from .models import AttendanceRecord

class AttendanceSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    slot_label  = serializers.SerializerMethodField()
    class Meta:
        model  = AttendanceRecord
        fields = '__all__'
    def get_member_name(self, obj):
        return obj.member.user.get_full_name() or obj.member.user.username
    def get_slot_label(self, obj):
        return str(obj.slot) if obj.slot else "—"

class AttendanceList(generics.ListAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        qs = AttendanceRecord.objects.all().select_related('member__user','slot')
        if u.role == 'member':
            qs = qs.filter(member__user=u)
        elif u.role == 'trainer':
            qs = qs.filter(member__assigned_trainer__user=u)
        date = self.request.query_params.get('date')
        if date:
            qs = qs.filter(date=date)
        return qs

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def qr_checkin(request):
    """Scan QR → look up member by user_id → log attendance."""
    user_id = request.data.get('user_id')
    try:
        member = MemberProfile.objects.select_related('user','selected_slot').get(user_id=user_id)
    except MemberProfile.DoesNotExist:
        return Response({'error': 'Member not found'}, status=404)

    if not member.approved or member.status != 'active':
        return Response({'error': f'Access denied. Membership is {member.status}. Not yet approved.'}, status=403)

    now = timezone.localtime()
    today = now.date()

    if AttendanceRecord.objects.filter(member=member, date=today).exists():
        return Response({'error': 'You have already marked your attendance for today.'}, status=400)

    is_late = now.hour >= 10  # simple rule: after 10AM = late

    rec = AttendanceRecord.objects.create(
        member=member,
        slot=member.selected_slot,
        status='late' if is_late else 'present',
        scanned_by=request.user
    )
    return Response({
        'success': True,
        'member_name': member.user.get_full_name(),
        'status': rec.status,
        'time': now.strftime('%I:%M %p'),
        'slot': str(member.selected_slot) if member.selected_slot else '—',
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_attendance(request):
    """Trainer/admin manually marks attendance."""
    if request.user.role not in ('admin','trainer'):
        return Response({'error': 'Forbidden'}, status=403)
    member_id = request.data.get('member_id')
    status    = request.data.get('status', 'present')
    try:
        member = MemberProfile.objects.get(pk=member_id)
    except MemberProfile.DoesNotExist:
        return Response({'error': 'Member not found'}, status=404)

    now = timezone.localtime()
    today = now.date()
    if AttendanceRecord.objects.filter(member=member, date=today).exists():
        return Response({'error': 'This member has already been marked present for today.'}, status=400)

    rec = AttendanceRecord.objects.create(member=member, slot=member.selected_slot, status=status, scanned_by=request.user)
    return Response(AttendanceSerializer(rec).data, status=201)
