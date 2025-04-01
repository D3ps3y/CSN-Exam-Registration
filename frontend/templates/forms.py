# Import the forms module from Django to create form classes
from django import forms

# Import the built-in User model provided by Django for authentication
from django.contrib.auth.models import User

# Define a registration form that extends Django's ModelForm
class RegisterForm(forms.ModelForm):
    # Define a password field with a password input widget for hiding input text
    password = forms.CharField(widget=forms.PasswordInput())

    # Meta class to specify the model and fields used in this form
    class Meta:
        model = User  # Specifies that this form is based on the User model
        fields = ['username', 'email', 'password']  # Defines which fields will be included in the form

# Define a login form that extends Django's base Form class
class LoginForm(forms.Form):
    # Define a username field with a text input widget and a placeholder
    username = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Username'}))

    # Define a password field with a password input widget and a placeholder
    password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Password'}))





