from django.contrib import admin
from django.urls import path, include
import game
from game.consumers import GameConsumer
urlpatterns = [path("admin/", admin.site.urls), path("", include("game.urls")),] # path("ws/game-socket/", GameConsumer.as_asgi()),]
