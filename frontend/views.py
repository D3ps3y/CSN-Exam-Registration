from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from frontend.forms import CustomRegisterForm, LoginForm

User = get_user_model()

@login_required
def student_dashboard(request):
    return render(request, 'student_home.html')

@login_required
def faculty_dashboard(request):
    return render(request, 'faculty_home.html')

# Home Page View (Now Includes Login and Register Forms)
def home(request):
    if request.user.is_authenticated:
        user_email = request.user.email

        if user_email.endswith('@student.csn.edu'):
            return redirect('student_dashboard')
        elif user_email.endswith('@csn.edu'):
            return redirect('faculty_dashboard')

    # Create empty forms to be used inside home.html
    register_form = CustomRegisterForm()
    login_form = LoginForm()

    # Handle form submission
    if request.method == "POST":

        if "register" in request.POST:  # If Register form was submitted

            register_form = CustomRegisterForm(request.POST)

            if register_form.is_valid():

                print("Registration Is Valid")
                print(register_form.cleaned_data)

                user = register_form.save()
                login(request, user)  # Auto-login after registration
                return redirect('home')  # Redirect to home after successful registration

            else:

                print("Registration Is Invalid")
                print(register_form.errors)


        elif "login" in request.POST:  # If Login form was submitted

            login_form = LoginForm(request.POST)

            if login_form.is_valid():

                email = login_form.cleaned_data["email"]
                password = login_form.cleaned_data["password"]

                try:

                    user_obj = User.objects.get(email=email)
                    username = user_obj.username  # Get username from email

                except User.DoesNotExist:

                    username = None

                user = authenticate(request, username=username, password=password)

                if user is not None:

                    login(request, user)
                    return redirect('home')  # Redirect to home after login

    return render(request, 'home.html', {
        'register_form': register_form,
        'login_form': login_form,
    })

# User Logout View
def custom_logout(request):
    logout(request)  # Logs the user out
    return redirect('home')  # Redirects back to home
