from django.urls import path
from . import views
from .views import student_dashboard, faculty_dashboard

urlpatterns = [

    path('', views.home, name='home'),
    
    path('login/', views.custom_login, name = 'login'),

    path('logout/', views.custom_logout, name = 'logout'),

    path('register/', views.register, name='register'),

    path('student/', student_dashboard, name='student_dashboard'),

    path('faculty/', faculty_dashboard, name='faculty_dashboard'),

]