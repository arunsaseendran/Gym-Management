"""
Seed the database with sample users, trainers, members, slots, attendance, and workouts.
Usage: python manage.py seed_data
"""
import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from trainers.models import TrainerProfile
from members.models import MemberProfile
from slots.models import TimeSlot
from attendance.models import AttendanceRecord
from workouts.models import WorkoutLog, TrainerAdvice
from predictor.engine import predict_calories
from members.views import generate_qr

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with demo data'

    def handle(self, *args, **kwargs):
        self.stdout.write("🌱  Seeding database…")

        # ── Admin ─────────────────────────────────────────────────────────
        admin, _ = User.objects.get_or_create(username='admin', defaults={
            'email':'admin@smartgym.com','first_name':'Gym','last_name':'Admin',
            'role':'admin','is_staff':True,'is_superuser':True,
        })
        admin.set_password('admin123')
        admin.save()

        # ── Trainers ──────────────────────────────────────────────────────
        trainer_data = [
            ('rajesh',  'Rajesh', 'Kumar',  'strength', '6:00 AM – 12:00 PM'),
            ('vikram',  'Vikram', 'Singh',  'yoga',     '4:00 PM – 9:00 PM'),
            ('sarah',   'Sarah',  "D'Souza",'cardio',   '6:00 AM – 10:00 AM'),
        ]
        trainers = []
        for uname, fn, ln, spec, sched in trainer_data:
            u, _ = User.objects.get_or_create(username=uname, defaults={
                'email':f'{uname}@smartgym.com','first_name':fn,'last_name':ln,'role':'trainer'
            })
            u.set_password('trainer123'); u.save()
            tp, _ = TrainerProfile.objects.get_or_create(user=u, defaults={'specialization':spec,'schedule':sched})
            trainers.append(tp)

        # ── Timeslots ─────────────────────────────────────────────────────
        slot_data = [
            ('Morning Early',   '06:00', '07:00'),
            ('Morning Prime',   '07:00', '08:00'),
            ('Morning Late',    '08:00', '09:00'),
            ('Evening Prime',   '18:00', '19:00'),
            ('Evening Late',    '19:00', '20:00'),
        ]
        slots = []
        for label, st, et in slot_data:
            s, _ = TimeSlot.objects.get_or_create(
                label=label,
                defaults={'start_time':st+':00','end_time':et+':00','max_capacity':5}
            )
            slots.append(s)

        # ── Members ───────────────────────────────────────────────────────
        member_data = [
            ('rahul',  'Rahul', 'Sharma', 26,'male',  175,74,70, 2400, 'premium_annual',  True,  trainers[0], slots[3]),
            ('priya',  'Priya', 'Patel',  29,'female',162,58,55, 2000, 'standard_monthly', True,  trainers[2], slots[0]),
            ('rohan',  'Rohan', 'Verma',  32,'male',  180,88,80, 2800, 'elite_quarterly',  False, trainers[1], slots[3]),
            ('ananya', 'Ananya','Mehta',  24,'female',158,52,50, 1900, 'standard_monthly', True,  trainers[2], slots[4]),
        ]
        members = []
        for uname, fn, ln, age, gender, h, w, tw, ct, plan, approved, trainer, slot in member_data:
            u, _ = User.objects.get_or_create(username=uname, defaults={
                'email':f'{uname}@smartgym.com','first_name':fn,'last_name':ln,'role':'member'
            })
            u.set_password('member123'); u.save()
            validity = datetime.date.today().replace(year=2027)
            mp, created = MemberProfile.objects.get_or_create(user=u, defaults={
                'age':age,'gender':gender,'height_cm':h,'weight_kg':w,'target_weight_kg':tw,
                'calorie_target':ct,'membership_plan':plan,'membership_validity':validity,
                'status':'active' if approved else 'inactive','approved':approved,
                'payment_status':'paid' if approved else 'pending',
                'assigned_trainer':trainer,'selected_slot':slot,'water_intake':4,
            })
            if created and approved:
                generate_qr(mp)
            members.append(mp)

        # ── Attendance ────────────────────────────────────────────────────
        today = datetime.date.today()
        for i, m in enumerate(members[:3]):
            AttendanceRecord.objects.get_or_create(
                member=m, date=today,
                defaults={'slot':m.selected_slot,'status':'present','scanned_by':admin}
            )

        # ── Workouts ──────────────────────────────────────────────────────
        workout_samples = [
            (members[0], 'strength', 45, 'high'),
            (members[0], 'cardio',   30, 'medium'),
            (members[1], 'yoga',     50, 'low'),
            (members[1], 'cardio',   40, 'high'),
            (members[3], 'hiit',     35, 'high'),
        ]
        for member, ex, dur, intensity in workout_samples:
            hr   = 145 if intensity=='high' else 125 if intensity=='medium' else 95
            temp = 38.3 if intensity=='high' else 37.6 if intensity=='medium' else 36.8
            cal  = predict_calories(member.age, member.gender, member.height_cm, member.weight_kg, dur, hr, temp)
            WorkoutLog.objects.get_or_create(
                member=member, exercise_type=ex,
                defaults={'duration_min':dur,'intensity':intensity,'calories_burned':cal}
            )

        # ── Advice ────────────────────────────────────────────────────────
        TrainerAdvice.objects.get_or_create(
            member=members[0], trainer=trainers[0],
            defaults={'text':'Great form on squats today! Focus on lowering weight slowly for better hypertrophy.'}
        )
        TrainerAdvice.objects.get_or_create(
            member=members[1], trainer=trainers[2],
            defaults={'text':'Excellent hydration levels! Add 5 more minutes to your warm-up before tomorrow\'s cardio session.'}
        )

        self.stdout.write(self.style.SUCCESS("✅  Seed complete!"))
        self.stdout.write("  Admin:   admin / admin123")
        self.stdout.write("  Trainers: rajesh,vikram,sarah / trainer123")
        self.stdout.write("  Members: rahul,priya,rohan,ananya / member123")
