from django.urls import path, include
from game.views import game, get_lobby, index
from game.consumers import GameConsumer
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path("", index),
    path("join-lobby/", game),
    path("get-lobby-id/", get_lobby),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

websocket_urlpatterns = [
    path("ws/game-socket/", GameConsumer.as_asgi()),
]
