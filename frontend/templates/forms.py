from django import forms
# Importing Django's forms module to create form classes

from django.contrib.auth.models import User
# Importing the built-in User model for authentication

class RegisterForm(forms.ModelForm):
    # This form allows users to register, based on the built-in User model

    password = forms.CharField(widget=forms.PasswordInput())
    # Custom password field with a widget to hide the characters when typed

    class Meta:
        model = User
        # Specifies the form is based on the User model

        fields = ['username', 'email', 'password']
        # These fields will be included in the form for user registration

class LoginForm(forms.Form):
    # This form handles user login (not tied to a model)

    username = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Username'}))
    # Username field with a placeholder text for better UX
    
    password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Password'}))
    # Password field with a widget for hidden characters and a placeholder




