from django.urls import path
from .views import home, student_dashboard, faculty_dashboard, custom_login, custom_logout, register

urlpatterns = [

    path('', home, name='home'),
    
    path('login/', custom_login, name = 'login'),

    path('logout/', custom_logout, name = 'logout'),

    path('register/', register, name='register'),

    path('student/', student_dashboard, name='student_dashboard'),

    path('faculty/', faculty_dashboard, name='faculty_dashboard'),

]