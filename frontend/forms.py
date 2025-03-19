from django import forms
# Importing Django's forms module to create form classes

from django.contrib.auth import get_user_model
# Getting the active user model (default or custom)

from django.contrib.auth.forms import UserCreationForm
# Importing the built-in user creation form for user registration

User = get_user_model()
# Assigning the active user model to the variable 'User'

class CustomRegisterForm(UserCreationForm):
    # This form handles user registration with custom fields for first name, last name, and email

    first_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={'placeholder': 'John'}),
        label="First Name"
    )
    # Required field for the user's first name, with a placeholder 'John'

    last_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={'placeholder': 'Smith'}),
        label="Last Name"
    )
    # Required field for the user's last name, with a placeholder 'Smith'

    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={'placeholder': 'CSN Email'}),
        label="Email Address"
    )
    # Required field for the user's email, with a placeholder 'CSN Email'

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

    class Meta:
        model = User
        # Specifies the form is based on the active User model

        fields = ["first_name", "last_name", "email", "password1", "password2"]
        # Specifies the fields to be included in the form

    def save(self, commit=True):
        user = super().save(commit=False)
        # Calls the parent class's save method but doesn't save to the database yet

        user.username = self.cleaned_data["email"]
        # Sets the user's username to their email

        user.email = self.cleaned_data["email"]
        # Ensures the email is stored in the email field

        if commit:
            user.save()
        # Saves the user if commit is True

        return user
        # Returns the user object

    def clean_email(self):
        email = self.cleaned_data.get('email')
        allowed_domains = ["student.csn.edu", "csn.edu"]
        # List of allowed email domains

        if not any(email.endswith(f"@{domain}") for domain in allowed_domains):
            raise forms.ValidationError("Only @student.csn.edu and @csn.edu emails are allowed to register")
        # Raises a validation error if the email is not from an allowed domain

        return email
        # Returns the cleaned email if valid

class LoginForm(forms.Form):
    # A form for user login with email and password fields

    email = forms.EmailField(
        widget=forms.EmailInput(attrs={'placeholder': 'CSN Email'}),
        label="Email Address"
    )
    # Email input field with a placeholder 'CSN Email'

    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'NSHE ID'}),
        label="Password"
    )
    # Password input field with a placeholder 'NSHE ID'
