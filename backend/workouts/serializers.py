from rest_framework import serializers
from .models import WorkoutLog, TrainerAdvice, WorkoutPlan, DietPlan

class WorkoutLogSerializer(serializers.ModelSerializer):
    member_name   = serializers.SerializerMethodField()
    exercise_display = serializers.SerializerMethodField()
    class Meta:
        model  = WorkoutLog
        fields = '__all__'
    def get_member_name(self, obj):
        return obj.member.user.get_full_name()
    def get_exercise_display(self, obj):
        return obj.get_exercise_type_display()

class TrainerAdviceSerializer(serializers.ModelSerializer):
    trainer_name = serializers.SerializerMethodField()
    member_name  = serializers.SerializerMethodField()
    class Meta:
        model  = TrainerAdvice
        fields = '__all__'
    def get_trainer_name(self, obj):
        return obj.trainer.user.get_full_name()
    def get_member_name(self, obj):
        return obj.member.user.get_full_name()

class WorkoutPlanSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    trainer_name = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutPlan
        fields = '__all__'

    def get_member_name(self, obj):
        return obj.member.user.get_full_name() or obj.member.user.username

    def get_trainer_name(self, obj):
        return obj.trainer.user.get_full_name() or obj.trainer.user.username

class DietPlanSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    trainer_name = serializers.SerializerMethodField()

    class Meta:
        model = DietPlan
        fields = '__all__'

    def get_member_name(self, obj):
        return obj.member.user.get_full_name() or obj.member.user.username

    def get_trainer_name(self, obj):
        return obj.trainer.user.get_full_name() or obj.trainer.user.username
