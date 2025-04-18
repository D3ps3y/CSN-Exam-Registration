from django.urls import path, include
from .views import (
    home,
    register,
    student_dashboard,
    faculty_dashboard,
    custom_logout,
    ajax_register,
    ajax_login,
    enroll_exam,
    add_exam,
    edit_exam,
    delete_exam,
    cancel_exam,
    fetch_bookings_html,
    fetch_registration_html,
    get_exam_count
)

urlpatterns = [
    path('', home, name='home'),
    path('register/', register, name='register'),
    path("ajax/register/", ajax_register, name="ajax_register"),
    path("ajax/login/", ajax_login, name="ajax_login"),
    path('logout/', custom_logout, name='logout'),
    path('student/', student_dashboard, name='student_dashboard'),
    path('enroll_exam/<int:exam_id>/', enroll_exam, name='enroll_exam'),
    path("cancel_exam/<int:exam_id>/", cancel_exam, name="cancel_exam"),
    path('faculty/', faculty_dashboard, name='faculty_dashboard'),
    path('faculty/exam/add/', add_exam, name='add_exam'),
    path('faculty/exam/edit/<int:exam_id>/', edit_exam, name='edit_exam'),
    path('faculty/exam/delete/<int:exam_id>/', delete_exam, name='delete_exam'),
    path("fetch_bookings_html/", fetch_bookings_html, name="fetch_bookings_html"),
    path('fetch_registration_html/', fetch_registration_html, name='fetch_registration_html'),
    path('get_exam_count/', get_exam_count, name='get_exam_count'),

]
