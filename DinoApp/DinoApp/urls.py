from django.contrib import admin
from django.urls import path, include
import game

urlpatterns = [path("admin/", admin.site.urls), path("", include("game.urls"))]
