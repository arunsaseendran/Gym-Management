from django.urls import path
from .views import MemberListCreate, MemberDetail, my_profile, approve_member, book_slot, upload_photo, update_water, send_renewal_reminder

urlpatterns = [
    path('',             MemberListCreate.as_view(), name='members-list'),
    path('<int:pk>/',    MemberDetail.as_view(),     name='member-detail'),
    path('me/',          my_profile,                 name='my-profile'),
    path('<int:pk>/approve/',      approve_member,        name='approve-member'),
    path('<int:pk>/book-slot/',    book_slot,             name='book-slot'),
    path('<int:pk>/upload-photo/', upload_photo,          name='upload-photo'),
    path('<int:pk>/water/',        update_water,          name='update-water'),
    path('<int:pk>/send-reminder/', send_renewal_reminder, name='send-reminder'),
]
