from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model
from .models import Exam

User = get_user_model()

#########################################################################
# Unified Registration Form
#########################################################################
class UnifiedRegisterForm(UserCreationForm):
    first_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={'placeholder': 'First Name'}),
        label="First Name"
    )
    last_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={'placeholder': 'Last Name'}),
        label="Last Name"
    )
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={'placeholder': 'Email Address'}),
        label="Email Address"
    )

    password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'NSHE ID'}),
        label="Password"
    )
    # Password field for the user's password, with a placeholder 'NSHE ID'

    password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'NSHE ID'}),
        label="Confirm Password"
    )
    # Confirmation password field, with a placeholder 'NSHE ID'

    university_id = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'placeholder': 'University ID (if applicable)'}),
        label="University ID"
    )
    
    class Meta:
        model = User
        # Update the fields list to include university_id instead of student_id.
        fields = ["first_name", "last_name", "email", "university_id", "password1", "password2"]

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if email:
            # Accept only emails ending with @student.csn.edu or @csn.edu.
            if not (email.endswith("@student.csn.edu") or email.endswith("@csn.edu")):
                raise forms.ValidationError(
                    "Email must end with @student.csn.edu (for students) or @csn.edu (for faculty)."
                )
            if User.objects.filter(email=email).exists():
                raise forms.ValidationError("A user with this email already exists.")
        return email

    def clean_university_id(self):
        # Return the university_id value (empty values are allowed)
        return self.cleaned_data.get("university_id", "").strip()

    def save(self, commit=True):
        user = super().save(commit=False)
        email = self.cleaned_data.get("email")

        if User.objects.filter(username=email).exists():
            raise ValueError("Attempted to save a user with duplicate username/email.")

        user.username = self.cleaned_data["email"]
        # Sets the user's username to their email

        user.email = self.cleaned_data["email"]
        # Ensures the email is stored in the email field

        # Automatically set the university_id based on the part before the '@'
        university_id = self.cleaned_data.get("university_id")
        if not university_id:
            user.university_id = email.split('@')[0]
        else:
            user.university_id = university_id
        
        # Determine role based on email domain.
        if email.endswith("@csn.edu"):
            user.is_faculty = True
            user.university_id = None  # Faculty may not require an ID.
        else:
            user.is_faculty = False

        # Set the username as the email if not provided.
        if not user.username:
            user.username = email

        if commit:
            user.save()
        return user

#########################################################################
# Login Form
#########################################################################
class LoginForm(forms.Form):
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={'placeholder': 'Email Address'}),
        label="Email"
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Password'}),
        label="Password"
    )

#########################################################################
# Exam Form (for Faculty)
#########################################################################
class ExamForm(forms.ModelForm):
    class Meta:

        model = Exam
        fields = ['exam_subject', 'exam_number', 'exam_date', 'exam_time', 'location', 'building', 'room_number', 'max_seats', 'status']
        widgets = {
            'exam_date': forms.DateInput(attrs={'type': 'date'}),
            # Include 'step': '1' so the input accepts time values in one-second increments.
            'exam_time': forms.TimeInput(attrs={'type': 'time', 'step': '1'}),
        }