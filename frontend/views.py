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

# Home Page View
@login_required
def home(request):

    user_email = request.user.email

    if user_email.endswith('@student.csn.edu'):
        return redirect(request, 'student_dashboard')
    elif user_email.endswith('@csn.edu'):
        return redirect(request, 'faculty_dashboard')
    else:
        return render(request, 'home.html')

# User Registration View
def register(request):
    
    if request.method == 'POST': # If the user submits the form

        # Create the form with submitted data
        form = CustomRegisterForm(request.POST)

        # Check if the form data is valid
        if form.is_valid():

            user = form.save()  # Saves the user to the database
            login(request, user) # Logs the user in after registration
            return redirect('home') # Redirects the user to the home page

        else:

            print(form.errors) # If form validation fails, print errors (Good for debugging)

    else:

        # If it's a GET request, display a blank registration form
        form = CustomRegisterForm()

    # Render the registration template
    return render(request, 'registration.html', {'form': form})

# User Logout View
def custom_logout(request):

    logout(request) # Logs the user out by clearing session data

    return redirect('home') # Redirects back to the home page

# User Login View
def custom_login(request):

    form = LoginForm() # Creates a blank login form

    if request.method == 'POST': # If the user submits the login form

        form = LoginForm(request.POST) # Populate the form with user input

        if form.is_valid(): # If the form data is valid

            email = form.cleaned_data["email"] # Gets the cleaned email from the form

            password = form.cleaned_data["password"] # Gets the cleaned password from the form

            try:
                user_obj = User.objects.get(email=email)
                username = user_obj.username
            except User.DoesNotExist:
                username = None

            user = authenticate(request, username=username, password=password) # Verifies credentials

            # If authentication is successful
            if user is not None:

                login(request, user) # Logs the user in

                return redirect('home') # Redirects to the home page

        # If authentication fails, re-render the login page with an error message
        return render(request, 'login.html', {'form': form, 'error': 'Invalid username or password'})

    # Render the login template if it's a GET request
    return render(request, 'login.html', {'form': form})

# Create your views here.
