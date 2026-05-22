from rest_framework import serializers
from .models import TrainerProfile
from accounts.serializers import UserSerializer

class TrainerProfileSerializer(serializers.ModelSerializer):
    user           = UserSerializer(read_only=True)
    full_name      = serializers.SerializerMethodField()
    email          = serializers.SerializerMethodField()
    trainee_count  = serializers.SerializerMethodField()
    spec_display   = serializers.SerializerMethodField()

    class Meta:
        model  = TrainerProfile
        fields = '__all__'

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_email(self, obj):
        return obj.user.email

    def get_trainee_count(self, obj):
        return obj.trainees.count()

    def get_spec_display(self, obj):
        return obj.get_specialization_display()

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
