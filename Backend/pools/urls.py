from django.urls import path
from . import views

urlpatterns = [
    path("createpools/", views.create_pool, name='createpools')
]