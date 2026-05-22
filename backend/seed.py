import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gymcore.settings')
django.setup()

from django.contrib.auth import get_user_model
from members.models import MemberProfile
from trainers.models import TrainerProfile
from slots.models import TimeSlot

User = get_user_model()

def seed_db():
    print("Seeding database...")

    # Create Admin
    if not User.objects.filter(username="admin").exists():
        admin = User.objects.create_superuser("admin", "admin@smartgym.com", "admin123")
        admin.first_name = "System"
        admin.last_name = "Admin"
        admin.role = "admin"
        admin.phone = "9876543210"
        admin.save()
        print("Created admin user (username: admin, password: admin123)")

    # Create Slots
    slot_am, _ = TimeSlot.objects.get_or_create(start_time="06:00:00", end_time="08:00:00", defaults={"label": "Morning", "max_capacity": 20})
    slot_pm, _ = TimeSlot.objects.get_or_create(start_time="18:00:00", end_time="20:00:00", defaults={"label": "Evening", "max_capacity": 20})

    # Create a Trainer
    trainer_user, _ = User.objects.get_or_create(username="trainer1", defaults={
        "email": "trainer@smartgym.com",
        "first_name": "John",
        "last_name": "Doe",
        "role": "trainer"
    })
    if _:
        trainer_user.set_password("trainer123")
        trainer_user.save()
        
    trainer, _ = TrainerProfile.objects.get_or_create(user=trainer_user, defaults={
        "specialization": "strength",
        "schedule": "06:00-18:00",
        "bio": "Expert in weightlifting and general fitness."
    })
    print("Ensured trainer user (username: trainer1, password: trainer123)")

    # Create a Member
    member_user, _ = User.objects.get_or_create(username="member1", defaults={
        "email": "member@smartgym.com",
        "first_name": "Alice",
        "last_name": "Smith",
        "role": "member"
    })
    if _:
        member_user.set_password("member123")
        member_user.save()

    member, _ = MemberProfile.objects.get_or_create(
        user=member_user,
        defaults={
            "age": 28,
            "gender": "female",
            "height_cm": 165,
            "weight_kg": 60,
            "target_weight_kg": 55,
            "calorie_target": 1800,
            "membership_plan": "standard_monthly",
            "membership_validity": date.today() + timedelta(days=30),
            "status": "active",
            "approved": True,
            "payment_status": "paid",
            "assigned_trainer": trainer,
            "selected_slot": slot_am
        }
    )
    print("Ensured member user (username: member1, password: member123)")

    print("Database seeding complete!")

if __name__ == "__main__":
    seed_db()
