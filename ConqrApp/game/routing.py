# routing.py
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from game.consumers import GameConsumer
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AuthMiddlewareStack(
            URLRouter(
                [
                    path("ws/game-socket/", GameConsumer.as_asgi()),
                ]
            )
        ),
    }
)
