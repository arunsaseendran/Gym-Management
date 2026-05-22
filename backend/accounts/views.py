from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, CustomTokenSerializer

User = get_user_model()

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    user = request.user
    old  = request.data.get('old_password')
    new  = request.data.get('new_password')
    if not user.check_password(old):
        return Response({'error': 'Old password incorrect'}, status=400)
    user.set_password(new)
    user.save()
    return Response({'message': 'Password changed successfully'})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_users(request):
    if request.user.role != 'admin':
        return Response({'error': 'Forbidden'}, status=403)
    users = User.objects.all()
    return Response(UserSerializer(users, many=True).data)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def check_availability(request):
    username = request.data.get('username')
    email = request.data.get('email')
    
    if username and User.objects.filter(username__iexact=username).exists():
        return Response({'available': False, 'error': 'Username is already taken.'})
        
    if email and User.objects.filter(email__iexact=email).exists():
        return Response({'available': False, 'error': 'Email is already registered.'})
        
    return Response({'available': True})
