from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from frontend.forms import UnifiedRegisterForm, LoginForm, ExamForm
from .models import Exam, ExamRegistration
from django.template.loader import render_to_string
import json

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
        "first_name": request.user.first_name,
        "last_name": request.user.last_name,
    }
    return render(request, 'student_dashboard.html', context)
#########################################################################
# Faculty Dashboard
#########################################################################
@login_required
def faculty_dashboard(request):
    # Display only the exams created by this faculty user.
    exams = Exam.objects.filter(created_by=request.user)

    context = {
        "exams": exams,
        "first_name": request.user.first_name,
        "last_name": request.user.last_name,
    }

    return render(request, 'faculty_dashboard.html', context)

#########################################################################
# Faculty Exam Management
#########################################################################
@login_required
def add_exam(request):
    if request.method == "POST" and request.headers.get("x-requested-with") == "XMLHttpRequest":
        form = ExamForm(request.POST)
        if form.is_valid():
            exam = form.save(commit=False)
            exam.created_by = request.user
            exam.save()
            return JsonResponse({"success": True})
        else:
            return JsonResponse({"success": False, "errors": form.errors}, status=400)
    return JsonResponse({"success": False, "error": "Invalid request."}, status=400)

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
# Logout View
#########################################################################
def custom_logout(request):
    logout(request)
    return redirect('home')

#########################################################################
# AJAX Registration View
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

#########################################################################
# AJAX Exam Cancellation View (Student Cancels an Exam)
#########################################################################
def cancel_exam(request, exam_id):
    if request.method == "POST" and request.headers.get('x-requested-with') == 'XMLHttpRequest':
        try:
            ExamRegistration.objects.get(student=request.user, exam_id=exam_id).delete()
            return JsonResponse({'success': True})
        except ExamRegistration.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Enrollment not found'}, status=404)
    return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)

#########################################################################
# AJAX Booking Fetcher
#########################################################################
@login_required
def fetch_bookings_html(request):
    confirmed_regs = ExamRegistration.objects.filter(
        student=request.user,
        status="confirmed"
    ).select_related("exam")

    exam_data = []
    for reg in confirmed_regs:
        exam = reg.exam
        confirmed_count = exam.enrollments.filter(status="confirmed").count()
        exam_data.append({
            "exam": exam,
            "confirmed_count": confirmed_count
        })

    html = render_to_string("partials/bookings_list.html", {
        "exam_data": exam_data
    })

    return JsonResponse({"html": html})


#########################################################################
# AJAX Unregistered Exam List Fetcher
#########################################################################

def fetch_registration_html(request):
    print("Fetching registration HTML...")

    enrolled_exam_ids = ExamRegistration.objects.filter(
        student=request.user
    ).values_list("exam_id", flat=True)

    print("Enrolled exam IDs:", list(enrolled_exam_ids))

    available_exams = Exam.objects.exclude(id__in=enrolled_exam_ids)

    # Build a list of dicts with each exam and its confirmed count
    exam_data = []
    for exam in available_exams:
        confirmed_count = exam.enrollments.filter(status='confirmed').count()
        exam_data.append({
            'exam': exam,
            'confirmed_count': confirmed_count
        })

    print("Available exams with confirmed counts:", exam_data)

    html = render_to_string("partials/registration_exam_list.html", {
        "exam_data": exam_data
    })

    return JsonResponse({"html": html})

#########################################################################
# Grabs Exam Count
#########################################################################
@login_required
def get_exam_count(request):
    count = ExamRegistration.objects.filter(
        student=request.user,
        status="confirmed" # Only confirmed exams should count as registered
    ).count()
    return JsonResponse({"count": count})

#########################################################################
# AJAX Exam Confirmation Fetcher
#########################################################################
@login_required
def fetch_confirmation_html(request):
    queued_regs = ExamRegistration.objects.filter(
        student=request.user,
        status="queued"
    ).select_related("exam")

    exam_data = []
    for reg in queued_regs:
        exam = reg.exam
        confirmed_count = exam.enrollments.filter(status="confirmed").count()
        exam_data.append({
            "exam": exam,
            "confirmed_count": confirmed_count
        })

    html = render_to_string("partials/exam_confirmation_list.html", {
        "exam_data": exam_data
    })

    return JsonResponse({"html": html})


#########################################################################
# AJAX Exam Confirmation Queue
#########################################################################
@login_required
def queue_exam(request, exam_id):
    if request.method == "POST":
        exam = get_object_or_404(Exam, id=exam_id)

        # Already confirmed
        if ExamRegistration.objects.filter(exam=exam, student=request.user, status="confirmed").exists():
            return JsonResponse({"success": False, "error": "You are already enrolled in this exam."})

        # Already queued
        if ExamRegistration.objects.filter(exam=exam, student=request.user, status="queued").exists():
            return JsonResponse({"success": False, "error": "You have already queued this exam."})

        ExamRegistration.objects.create(exam=exam, student=request.user, status="queued")

        return JsonResponse({"success": True})

    return JsonResponse({"success": False})

#########################################################################
# AJAX Queue Confirmation (Get sent to bookings)
#########################################################################
@login_required
def confirm_queued_exam(request, exam_id):
    if request.method == "POST":
        exam = get_object_or_404(Exam, id=exam_id)

        try:
            queued = ExamRegistration.objects.get(
                exam=exam, student=request.user, status="queued"
            )
        except ExamRegistration.DoesNotExist:
            return JsonResponse({"success": False, "error": "You have not queued this exam."})

        # Check if the exam is full (only confirmed count matters)
        confirmed_count = exam.enrollments.filter(status="confirmed").count()
        if exam.max_seats and confirmed_count >= exam.max_seats:
            return JsonResponse({"success": False, "error": "This exam is already full."})

        # Promote from queued to confirmed
        queued.status = "confirmed"
        queued.save()

        return JsonResponse({"success": True})

    return JsonResponse({"success": False, "error": "Invalid request method"})

#########################################################################
# AJAX Grabs Add Exam Form
#########################################################################
@login_required
def fetch_add_exam_form(request):
    form = ExamForm()
    html = render_to_string("partials/add_exam.html", {"form": form}, request=request)
    return JsonResponse({"html": html})

#########################################################################
# AJAX Grabs Edit Exam Form
#########################################################################
@login_required
def fetch_edit_exam_form(request):  # plural
    exams = Exam.objects.filter(created_by=request.user)

    # Prepare a list of (exam, form) tuples
    exam_forms = [(exam, ExamForm(instance=exam)) for exam in exams]

    html = render_to_string("partials/edit_exam.html", {
        "exam_forms": exam_forms
    }, request=request)

    return JsonResponse({"html": html})


#########################################################################
# AJAX Update Exam
#########################################################################
@login_required
def update_exam(request, exam_id):
    if request.method == "POST" and request.headers.get("x-requested-with") == "XMLHttpRequest":
        exam = get_object_or_404(Exam, id=exam_id, created_by=request.user)
        try:
            data = json.loads(request.body)

            # Update fields
            exam.exam_subject = data.get("exam_subject", exam.exam_subject)
            exam.exam_number = data.get("exam_number", exam.exam_number)
            exam.exam_date = data.get("exam_date", exam.exam_date)
            exam.exam_time = data.get("exam_time", exam.exam_time)
            exam.location = data.get("location", exam.location)
            exam.building = data.get("building", exam.building)
            exam.room_number = data.get("room_number", exam.room_number)
            exam.max_seats = data.get("max_seats", exam.max_seats)
            exam.status = data.get("status", exam.status)

            exam.save()

            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=400)

    return JsonResponse({"success": False, "error": "Invalid request"}, status=400)

#########################################################################
# AJAX Grabs Faculty Exams (Grid)
#########################################################################
@login_required
def fetch_faculty_exam_grid(request):
    exams = Exam.objects.filter(created_by=request.user)

    html = render_to_string("partials/faculty_exam_grid.html", {
        "exams": exams
    })

    return JsonResponse({"html": html})

#########################################################################
# AJAX Grabs Exams Data
#########################################################################
@login_required
def get_exam_data(request, exam_id):
    exam = get_object_or_404(Exam, id=exam_id, created_by=request.user)

    # Convert the exam fields into a dictionary
    data = {
        "exam_subject": exam.exam_subject,
        "exam_number": exam.exam_number,
        "exam_date": exam.exam_date.strftime("%Y-%m-%d"),
        "exam_time": exam.exam_time.strftime("%H:%M:%S"),
        "location": exam.location,
        "building": exam.building,
        "room_number": exam.room_number,
        "max_seats": exam.max_seats,
        "status": exam.status,
    }

    return JsonResponse(data)
