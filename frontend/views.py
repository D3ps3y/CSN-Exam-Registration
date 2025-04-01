from django.shortcuts import render, redirect  # Import functions for rendering templates and redirecting users
from django.contrib.auth import authenticate, login, logout, get_user_model  # Import authentication functions
from django.contrib.auth.decorators import login_required  # Import decorator to restrict views to logged-in users
from frontend.forms import CustomRegisterForm, LoginForm  # Import custom registration and login forms
from django.http import JsonResponse  # Import JsonResponse to handle AJAX responses

# Get the user model (allows for custom user models if defined)
User = get_user_model()

# ==============================
# Views for Different Dashboards
# ==============================

@login_required  # Ensures that only logged-in users can access this view
def student_dashboard(request):
    """
    Render the student dashboard page.
    Only accessible to authenticated users.
    """
    return render(request, 'student_home.html')

@login_required  # Ensures that only logged-in users can access this view
def faculty_dashboard(request):
    """
    Render the faculty dashboard page.
    Only accessible to authenticated users.
    """
    return render(request, 'faculty_home.html')

# ==============================
# Home Page View
# ==============================

def home(request):
    """
    Home page view that serves as the main entry point.
    It includes both login and registration forms.
    Redirects authenticated users to their respective dashboards.
    """
    if request.user.is_authenticated:  # Check if the user is already logged in
        user_email = request.user.email

        # Redirect students to the student dashboard
        if user_email.endswith('@student.csn.edu'):
            return redirect('student_dashboard')

        # Redirect faculty to the faculty dashboard
        elif user_email.endswith('@csn.edu'):
            return redirect('faculty_dashboard')

    # Create empty forms to be used inside home.html
    register_form = CustomRegisterForm()
    login_form = LoginForm()

    # Handle form submissions (Login/Register)
    if request.method == "POST":

        if "register" in request.POST:  # If Register form was submitted

            register_form = CustomRegisterForm(request.POST)

            if register_form.is_valid():
                print("Registration Is Valid")
                print(register_form.cleaned_data)  # Debugging: Print cleaned form data

                user = register_form.save()  # Save new user
                login(request, user)  # Auto-login after successful registration
                return redirect('home')  # Redirect back to home

            else:
                print("Registration Is Invalid")
                print(register_form.errors)  # Debugging: Print form errors

        elif "login" in request.POST:  # If Login form was submitted

            login_form = LoginForm(request.POST)

            if login_form.is_valid():
                email = login_form.cleaned_data["email"]
                password = login_form.cleaned_data["password"]

                try:
                    user_obj = User.objects.get(email=email)  # Look up user by email
                    username = user_obj.username  # Get username from email

                except User.DoesNotExist:
                    username = None  # Set username to None if user does not exist

                user = authenticate(request, username=username, password=password)  # Authenticate user

                if user is not None:
                    login(request, user)  # Log in the user
                    return redirect('home')  # Redirect to home after successful login

    # Render the home template with the forms
    return render(request, 'home.html', {
        'register_form': register_form,
        'login_form': login_form,
    })

# ==============================
# User Logout View
# ==============================

def custom_logout(request):
    """
    Logs out the current user and redirects them to the home page.
    """
    logout(request)  # Django function to log out the user
    return redirect('home')  # Redirect back to home after logging out

# ==============================
# AJAX Register View
# ==============================

def ajax_register(request):
    """
    Handles user registration via AJAX.
    Returns a JSON response indicating success or failure.
    """
    if request.method == "POST":
        form = CustomRegisterForm(request.POST)

        if form.is_valid():
            user = form.save()  # Save new user
            login(request, user)  # Log in the user
            return JsonResponse({"success": True, "redirect_url": "/"})  # Return success response

        else:
            errors = []
            for field_errors in form.errors.values():  # Collect all form validation errors
                errors.extend(field_errors)

            return JsonResponse({"success": False, "errors": errors})  # Return error response

    return JsonResponse({"success": False, "errors": ["Invalid request method."]})  # Handle non-POST requests

# ==============================
# AJAX Login View
# ==============================

def ajax_login(request):
    """
    Handles user login via AJAX.
    Returns a JSON response indicating success or failure.
    """
    if request.method == "POST":
        form = LoginForm(request.POST)

        if form.is_valid():
            email = form.cleaned_data["email"]
            password = form.cleaned_data["password"]

            try:
                user_obj = User.objects.get(email=email)  # Look up user by email
                username = user_obj.username  # Get username from email

            except User.DoesNotExist:
                username = None  # Set username to None if user does not exist

            user = authenticate(request, username=username, password=password)  # Authenticate user

            if user is not None:
                login(request, user)  # Log in the user
                return JsonResponse({"success": True, "redirect_url": "/"})  # Return success response

            else:
                return JsonResponse({"success": False, "errors": ["Invalid email or password."]})  # Invalid credentials

        else:
            errors = []
            for field_errors in form.errors.values():  # Collect all form validation errors
                errors.extend(field_errors)

            return JsonResponse({"success": False, "errors": errors})  # Return error response

    return JsonResponse({"success": False, "errors": ["Invalid request method."]})  # Handle non-POST requests
