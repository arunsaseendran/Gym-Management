from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id','username','email','first_name','last_name','role','phone','password']

    def create(self, validated_data):
        pw = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(pw)
        user.save()

        # Handle nested profiles on creation to ensure they show up in backend querysets
        role = user.role
        if role == 'member':
            from members.models import MemberProfile
            from django.utils import timezone
            import datetime

            profile_data = self.initial_data.get('member_profile', {})
            # Ensure correct types and handle default values gracefully
            try:
                age = int(profile_data.get('age', 25))
            except Exception:
                age = 25
            try:
                height = float(profile_data.get('height_cm', 170))
            except Exception:
                height = 170
            try:
                weight = float(profile_data.get('weight_kg', 70))
            except Exception:
                weight = 70
            try:
                target_w = float(profile_data.get('target_weight_kg', 65))
            except Exception:
                target_w = 65
            try:
                cal_t = int(profile_data.get('calorie_target', 2200))
            except Exception:
                cal_t = 2200

            MemberProfile.objects.create(
                user=user,
                age=age,
                gender=profile_data.get('gender', 'male'),
                height_cm=height,
                weight_kg=weight,
                target_weight_kg=target_w,
                calorie_target=cal_t,
                membership_plan=profile_data.get('membership_plan', 'standard_monthly'),
                membership_validity=profile_data.get('membership_validity', (timezone.now() + datetime.timedelta(days=30)).date()),
                status='inactive',
                approved=False,
                payment_status='pending',
                water_intake=0
            )
        elif role == 'trainer':
            from trainers.models import TrainerProfile
            profile_data = self.initial_data.get('trainer_profile', {})
            TrainerProfile.objects.create(
                user=user,
                specialization=profile_data.get('specialization', 'general'),
                schedule=profile_data.get('schedule', '6:00 AM – 2:00 PM'),
                availability=True,
                bio=profile_data.get('bio', '')
            )

        return user

    def update(self, instance, validated_data):
        pw = validated_data.pop('password', None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        if pw:
            instance.set_password(pw)
        instance.save()
        return instance

class CustomTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role']  = user.role
        token['name']  = user.get_full_name() or user.username
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['role']  = self.user.role
        data['name']  = self.user.get_full_name() or self.user.username
        data['email'] = self.user.email
        data['id']    = self.user.id
        return data
