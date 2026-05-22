from rest_framework import serializers, generics, permissions
from .models import TimeSlot

class TimeSlotSerializer(serializers.ModelSerializer):
    occupancy = serializers.IntegerField(read_only=True)
    is_full   = serializers.BooleanField(read_only=True)
    class Meta:
        model  = TimeSlot
        fields = '__all__'

class SlotList(generics.ListCreateAPIView):
    queryset = TimeSlot.objects.filter(active=True)
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

class SlotDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.IsAuthenticated]
