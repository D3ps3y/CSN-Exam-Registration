from django.urls import path
from .views import home, student_dashboard, faculty_dashboard, custom_logout, ajax_register, ajax_login

urlpatterns = [

    path('', home, name='home'),
    path("ajax/register/", ajax_register, name="ajax_register"),
    path("ajax/login/", ajax_login, name="ajax_login"),
    path('logout/', custom_logout, name = 'logout'),
    path('student/', student_dashboard, name='student_dashboard'),
    path('faculty/', faculty_dashboard, name='faculty_dashboard'),

]