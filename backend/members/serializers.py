from rest_framework import serializers
from .models import MemberProfile
from accounts.serializers import UserSerializer

class MemberProfileSerializer(serializers.ModelSerializer):
    user     = UserSerializer(read_only=True)
    bmi      = serializers.FloatField(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email    = serializers.CharField(source='user.email',    read_only=True)
    full_name= serializers.SerializerMethodField()
    slot_time= serializers.SerializerMethodField()
    trainer_name = serializers.SerializerMethodField()

    class Meta:
        model = MemberProfile
        fields = '__all__'

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_slot_time(self, obj):
        return str(obj.selected_slot) if obj.selected_slot else None

    def get_trainer_name(self, obj):
        return obj.assigned_trainer.user.get_full_name() if obj.assigned_trainer else None

    def update(self, instance, validated_data):
        user_data = self.initial_data.get('user', {})
        if user_data:
            user = instance.user
            user.username = user_data.get('username', user.username)
            user.email = user_data.get('email', user.email)
            user.first_name = user_data.get('first_name', user.first_name)
            user.last_name = user_data.get('last_name', user.last_name)
            user.phone = user_data.get('phone', user.phone)
            pw = user_data.get('password')
            if pw:
                user.set_password(pw)
            user.save()
        
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        return instance

class MemberWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberProfile
        exclude = ['user', 'qr_code']
