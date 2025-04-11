from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from frontend.forms import UnifiedRegisterForm, LoginForm, ExamForm
from .models import Exam, ExamRegistration

User = get_user_model()

#########################################################################
# Unified Home View (for Login and Redirection)
#########################################################################
def home(request):
    if request.user.is_authenticated:
        # Redirect based on user role: faculty go to faculty_dashboard, students to student_dashboard.
        if request.user.is_faculty:
            return redirect('faculty_dashboard')
        else:
            return redirect('student_dashboard')
    login_form = LoginForm()
    register_form = UnifiedRegisterForm()
    return render(request, 'home.html', {
        'login_form': login_form, 'register_form': register_form,
    })

#########################################################################
# Unified Registration View
#########################################################################
def register(request):
    if request.method == "POST":
        form = UnifiedRegisterForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data["email"]
            user = form.save(commit=False)
            # Set the is_faculty flag based on the email domain.
            if email.endswith("@csn.edu"):
                user.is_faculty = True
                user.student_id = None  # Faculty do not have a student ID.
            else:
                user.is_faculty = False
            user.save()
            login(request, user)
            return redirect('home')
        else:
            print("Registration errors:", form.errors)
    else:
        form = UnifiedRegisterForm()
    return render(request, 'registration.html', {'form': form})

#########################################################################
# Student Dashboard
#########################################################################
@login_required
def student_dashboard(request):
    # This returns all exam records.
    exams = Exam.objects.all()
    
    # You might list the IDs of exams that the student is already enrolled in
    enrolled_exam_ids = request.user.enrollments.values_list("exam_id", flat=True)
    
    context = {
        "exams": exams,
        "enrolled_exam_ids": enrolled_exam_ids,
    }
    return render(request, 'student_dashboard.html', context)
#########################################################################
# Faculty Dashboard
#########################################################################
@login_required
def faculty_dashboard(request):
    # Display only the exams created by this faculty user.
    exams = Exam.objects.filter(created_by=request.user)
    return render(request, 'faculty_dashboard.html', {'exams': exams})

#########################################################################
# Faculty Exam Management
#########################################################################
@login_required
def add_exam(request):
    if request.method == "POST":
        form = ExamForm(request.POST)
        if form.is_valid():
            exam = form.save(commit=False)
            exam.created_by = request.user
            exam.save()
            return redirect('faculty_dashboard')
    else:
        form = ExamForm()
    return render(request, 'add_exam.html', {'form': form})

@login_required
def edit_exam(request, exam_id):
    exam = get_object_or_404(Exam, id=exam_id, created_by=request.user)
    if request.method == "POST":
        form = ExamForm(request.POST, instance=exam)
        if form.is_valid():
            form.save()
            return redirect('faculty_dashboard')
    else:
        form = ExamForm(instance=exam)
    return render(request, 'edit_exam.html', {'form': form, 'exam': exam})

@login_required
def delete_exam(request, exam_id):
    exam = get_object_or_404(Exam, id=exam_id, created_by=request.user)
    if request.method == "POST":
        exam.delete()
        return redirect('faculty_dashboard')
    return render(request, 'delete_exam.html', {'exam': exam})

#########################################################################
# Enrollment (Student Enrolls in Exam)
#########################################################################
@login_required
def enroll_exam(request, exam_id):
    exam = get_object_or_404(Exam, id=exam_id)
    ExamRegistration.objects.get_or_create(exam=exam, student=request.user)
    return redirect('student_dashboard')

#########################################################################
# Logout View
#########################################################################
def custom_logout(request):
    logout(request)
    return redirect('home')

#########################################################################
# AJAX Registration View (Optional)
#########################################################################
def ajax_register(request):
    if request.method == "POST":
        form = UnifiedRegisterForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data["email"]
            user = form.save(commit=False)
            if email.endswith("@csn.edu"):
                user.is_faculty = True
                user.student_id = None
            else:
                user.is_faculty = False
            user.save()
            login(request, user)
            return JsonResponse({"success": True, "redirect_url": "/"})
        else:
            errors = []
            for error_list in form.errors.values():
                errors.extend(error_list)
            return JsonResponse({"success": False, "errors": errors})
    return JsonResponse({"success": False, "errors": ["Invalid request method."]})

#########################################################################
# AJAX Login View
#########################################################################
def ajax_login(request):
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data["email"]
            password = form.cleaned_data["password"]
            try:
                user_obj = User.objects.get(email=email)
                username = user_obj.username
                user = authenticate(request, username=username, password=password)
            except User.DoesNotExist:
                user = None
            if user is not None:
                login(request, user)
                if user.is_faculty:
                    return JsonResponse({"success": True, "redirect_url": "/faculty/"})
                else:
                    return JsonResponse({"success": True, "redirect_url": "/student/"})
            else:
                return JsonResponse({"success": False, "errors": ["Invalid email or password."]})
        else:
            errors = []
            for error_list in form.errors.values():
                errors.extend(error_list)
            return JsonResponse({"success": False, "errors": errors})
    return JsonResponse({"success": False, "errors": ["Invalid request method."]})
