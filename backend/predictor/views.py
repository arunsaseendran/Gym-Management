from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import serializers as drf_serializers
from members.models import MemberProfile
from .engine import predict_calories
from .models import CaloriePrediction

class PredictionSerializer(drf_serializers.ModelSerializer):
    date_str = drf_serializers.SerializerMethodField()
    class Meta:
        model  = CaloriePrediction
        fields = '__all__'
    def get_date_str(self, obj):
        return obj.date.strftime('%Y-%m-%d')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def run_prediction(request):
    """Run ML inference and store result."""
    data = request.data
    required = ['duration', 'heart_rate', 'body_temp']
    for field in required:
        if field not in data:
            return Response({'error': f'Missing field: {field}'}, status=400)

    # Get member profile for biometrics
    try:
        member = MemberProfile.objects.get(user=request.user)
        age    = float(data.get('age',    member.age))
        gender = data.get('gender',       member.gender)
        height = float(data.get('height', member.height_cm))
        weight = float(data.get('weight', member.weight_kg))
    except MemberProfile.DoesNotExist:
        # Allow manual input if no profile
        age    = float(data.get('age',    25))
        gender = data.get('gender', 'male')
        height = float(data.get('height', 170))
        weight = float(data.get('weight', 70))
        member = None

    duration   = float(data['duration'])
    heart_rate = float(data['heart_rate'])
    body_temp  = float(data['body_temp'])

    predicted = predict_calories(age, gender, height, weight, duration, heart_rate, body_temp)

    rec = None
    if member:
        rec = CaloriePrediction.objects.create(
            member=member, age=age, gender=gender, height=height, weight=weight,
            duration=duration, heart_rate=heart_rate, body_temp=body_temp,
            predicted_calories=predicted
        )

    return Response({
        'predicted_calories': predicted,
        'inputs': {
            'age': age, 'gender': gender, 'height': height, 'weight': weight,
            'duration': duration, 'heart_rate': heart_rate, 'body_temp': body_temp,
        },
        'record_id': rec.id if rec else None,
    })

class PredictionHistory(generics.ListAPIView):
    serializer_class = PredictionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        if u.role == 'admin':
            return CaloriePrediction.objects.all().select_related('member__user')
        return CaloriePrediction.objects.filter(member__user=u).select_related('member__user')
