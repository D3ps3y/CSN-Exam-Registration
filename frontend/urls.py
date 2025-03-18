from django.urls import path
from django.contrib.auth import views as auth_views
from django.urls import path
from . import views

urlpatterns = [
    
    path('login/', views.custom_login, name = 'login'),

    path('logout/', views.custom_logout, name = 'logout'),

    path('', views.home, name='home'),

    path('register/', views.register, name='register'),

]