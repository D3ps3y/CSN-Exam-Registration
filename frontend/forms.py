from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm

User = get_user_model()

class CustomRegisterForm(UserCreationForm):

    first_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={'placeholder': 'John'}),
        label="First Name"
    )

    last_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={'placeholder': 'Smith'}),
        label="Last Name"
    )

    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={'placeholder': 'CSN Email'}),
        label="Email Address"
    )

    password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'NSHE ID'}),
        label="Password"
    )

    password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'NSHE ID'}),
        label="Confirm Password"
    )

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "password1", "password2"]

    def save(self, commit=True):
        user = super().save(commit=False)
        user.username = self.cleaned_data["email"]
        user.email = self.cleaned_data["email"]

        if commit:
            user.save()

        return user

    def clean_email(self):
        email = self.cleaned_data.get('email')
        allowed_domains = ["student.csn.edu", "csn.edu"]

        if not any(email.endswith(f"@{domain}") for domain in allowed_domains):
            raise forms.ValidationError("Only @student.csn.edu and @csn.edu emails are allowed to register")

        return email

class LoginForm(forms.Form):

    email = forms.EmailField(
        widget = forms.EmailInput(attrs={'placeholder': 'CSN Email'}),
        label="Email Address"
    )
    password = forms.CharField(
        widget = forms.PasswordInput(attrs={'placeholder': 'NSHE ID'}),
        label="Password"
    )




