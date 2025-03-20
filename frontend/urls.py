from django.urls import path
from .views import home, student_dashboard, faculty_dashboard, custom_logout

urlpatterns = [

    path('', home, name='home'),
    path('logout/', custom_logout, name = 'logout'),
    path('student/', student_dashboard, name='student_dashboard'),
    path('faculty/', faculty_dashboard, name='faculty_dashboard'),

]