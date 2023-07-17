from django.urls import path, include
from . import views
from . import consumers
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path("", views.index),
    path("join-lobby/", views.game),
    path("get-lobby-id/", views.get_lobby),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

websocket_urlpatterns = [
    path("ws/game-socket/", consumers.GameConsumer.as_asgi()),
]
