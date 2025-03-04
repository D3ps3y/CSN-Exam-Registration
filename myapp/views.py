from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib.auth import authenticate, logout
from django.contrib.auth import login
from myapp.forms import RegisterForm, LoginForm

def home(request):
    return render(request, 'home.html')

def register(request):
    
    if request.method == 'POST':

        form = RegisterForm(request.POST)

        if form.is_valid():

            user = form.save(commit = False)
            user.set_password(form.cleaned_data['password'])
            user.save()

            return redirect('home')

        else:

            print(form.errors)

    else:

        form = RegisterForm()

    return render(request, 'registration.html', {'form': form})

def custom_logout(request):

    logout(request)

    return redirect('home')

def custom_login(request):

    form = LoginForm()

    if request.method == 'POST':
        form = LoginForm(request.POST)

        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
        
            if user is not None:
                login(request, user)
                return redirect('home')

        return render(request, 'login.html', {'form': form, 'error': 'Invalid username or password'})

    return render(request, 'login.html', {'form': form})

# Create your views here.
