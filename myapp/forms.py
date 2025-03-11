from django import forms
from django.contrib.auth.models import User

# to see repository on jira

class RegisterForm(forms.ModelForm):
    password = forms.CharField(widget = forms.PasswordInput(attrs={'placeholder': 'Password'}))

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

class LoginForm(forms.Form):

    username = forms.CharField(widget = forms.TextInput(attrs={'placeholder': 'Username'}))
    password = forms.CharField(widget = forms.PasswordInput(attrs={'placeholder': 'Password'}))




