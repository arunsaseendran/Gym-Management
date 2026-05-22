import io, qrcode
from django.core.files.base import ContentFile
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from slots.models import TimeSlot
from .models import MemberProfile
from .serializers import MemberProfileSerializer, MemberWriteSerializer

class IsAdminOrSelf(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.role == 'admin' or obj.user == request.user

def generate_qr(member: MemberProfile):
    data = f"SMARTGYM|{member.user.id}|{member.user.username}|{member.membership_plan}"
    img  = qrcode.make(data)
    buf  = io.BytesIO()
    img.save(buf, format='PNG')
    fname = f"qr_{member.user.username}.png"
    member.qr_code.save(fname, ContentFile(buf.getvalue()), save=True)

class MemberListCreate(generics.ListCreateAPIView):
    serializer_class = MemberProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        if u.role == 'admin':
            return MemberProfile.objects.all().select_related('user','assigned_trainer__user','selected_slot')
        if u.role == 'trainer':
            return MemberProfile.objects.filter(assigned_trainer__user=u).select_related('user','assigned_trainer__user','selected_slot')
        return MemberProfile.objects.filter(user=u).select_related('user','assigned_trainer__user','selected_slot')

class MemberDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = MemberProfile.objects.all().select_related('user','assigned_trainer__user','selected_slot')
    serializer_class = MemberProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSelf]

    def perform_update(self, serializer):
        instance = serializer.save()
        if not instance.qr_code:
            generate_qr(instance)

    def perform_destroy(self, instance):
        user = instance.user
        instance.delete()
        user.delete()

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_profile(request):
    try:
        profile = MemberProfile.objects.select_related('user','assigned_trainer__user','selected_slot').get(user=request.user)
        return Response(MemberProfileSerializer(profile).data)
    except MemberProfile.DoesNotExist:
        return Response({'error': 'No member profile found'}, status=404)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def approve_member(request, pk):
    if request.user.role != 'admin':
        return Response({'error': 'Admin only'}, status=403)
    try:
        m = MemberProfile.objects.get(pk=pk)
        m.approved = True
        m.status   = 'active'
        m.payment_status = 'paid'
        m.save()
        if not m.qr_code:
            generate_qr(m)
        return Response({'message': f'{m.user.get_full_name()} approved', 'qr_code': m.qr_code.url if m.qr_code else None})
    except MemberProfile.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def book_slot(request, pk):
    try:
        m = MemberProfile.objects.get(pk=pk)
        if m.user != request.user and request.user.role != 'admin':
            return Response({'error': 'Forbidden'}, status=403)
        slot_id = request.data.get('slot_id')
        slot    = TimeSlot.objects.get(pk=slot_id)
        occupancy = MemberProfile.objects.filter(selected_slot=slot).count()
        if m.selected_slot_id != slot.id and occupancy >= slot.max_capacity:
            return Response({'error': f'Slot is FULL ({occupancy}/{slot.max_capacity}). Choose another.'}, status=400)
        m.selected_slot = slot
        m.save()
        return Response({'message': f'Slot "{slot}" booked successfully!'})
    except (MemberProfile.DoesNotExist, TimeSlot.DoesNotExist):
        return Response({'error': 'Not found'}, status=404)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser])
def upload_photo(request, pk):
    try:
        m = MemberProfile.objects.get(pk=pk)
        if m.user != request.user and request.user.role != 'admin':
            return Response({'error': 'Forbidden'}, status=403)
        m.profile_photo = request.FILES['photo']
        m.save()
        return Response({'photo_url': request.build_absolute_uri(m.profile_photo.url)})
    except MemberProfile.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_water(request, pk):
    try:
        m = MemberProfile.objects.get(pk=pk)
        if m.user != request.user:
            return Response({'error': 'Forbidden'}, status=403)
        m.water_intake = request.data.get('water_intake', m.water_intake)
        m.save()
        return Response({'water_intake': m.water_intake})
    except MemberProfile.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_renewal_reminder(request, pk):
    """Admin-only: send a membership renewal reminder email/notification."""
    if request.user.role != 'admin':
        return Response({'error': 'Admin only'}, status=403)
    try:
        from datetime import date
        from django.core.mail import send_mail
        from django.conf import settings

        m = MemberProfile.objects.select_related('user').get(pk=pk)
        validity = m.membership_validity
        if not validity:
            return Response({'error': 'No membership validity date set.'}, status=400)

        days_left = (validity - date.today()).days
        member_name = m.user.get_full_name() or m.user.username
        plan_label  = m.membership_plan.replace('_', ' ').title()

        subject = f"⚠️ SmartGYM – Your {plan_label} expires in {days_left} day{'s' if days_left != 1 else ''}!"
        body = (
            f"Dear {member_name},\n\n"
            f"This is a friendly reminder from SmartGYM that your current membership plan "
            f"({plan_label}) expires on {validity.strftime('%B %d, %Y')} "
            f"({days_left} day{'s' if days_left != 1 else ''} remaining).\n\n"
            f"Renew now to continue enjoying uninterrupted access to the gym, your trainer-assigned "
            f"workout plans, personalised diet plans, and AI calorie tracking.\n\n"
            f"To renew, visit the SmartGYM portal and contact your gym administrator.\n\n"
            f"Stay strong,\nThe SmartGYM Team"
        )

        try:
            send_mail(
                subject, body,
                getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@smartgym.app'),
                [m.user.email],
                fail_silently=False,
            )
            email_sent = True
        except Exception:
            email_sent = False   # email not configured in dev – still return success

        return Response({
            'success': True,
            'email_sent': email_sent,
            'member': member_name,
            'days_left': days_left,
            'expires': str(validity),
        })
    except MemberProfile.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

