from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

def current_time():
    return timezone.now().time()

class User(AbstractUser):
    is_faculty = models.BooleanField(default=False)
    university_id = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        unique=True,
        help_text="Enter your university-issued ID if applicable."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.get_full_name() or self.username

    class Meta:
        # Change this from "users" to the table that already exists (e.g., "frontend_user")
        db_table = "frontend_user"

# Your other models can largely remain the same,
# but update foreign keys that referenced "Student" to reference the unified User.

class Exam(models.Model):
    exam_name = models.CharField(max_length=255, default='Untitled Exam')
    exam_date = models.DateField(default=timezone.localdate)
    exam_time = models.TimeField(default=current_time)
    location = models.CharField(max_length=255, default='Location_Name')
    building = models.CharField(max_length=255, default='Main Building')
    room_number = models.CharField(max_length=50, default='Room_Number')
    max_seats = models.IntegerField(default=20)
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    # For exams created by faculty, store a reference to the user (faculty).
    created_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL,
        help_text="Faculty member who created this exam."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.exam_name

class ExamRegistration(models.Model):
    # Since both students and faculty are now in the same user model,
    # use the unified User as the foreign key.
    # (If only students can enroll for exams, enforce that in your business logic.)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='enrollments')
    registration_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} -> {self.exam}"
