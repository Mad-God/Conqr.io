import os
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ConqrApp.settings")


# asgi.py

from django.urls import path
from channels.routing import ProtocolTypeRouter
from game.routing import *

application = application
application123 = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
    }
)
