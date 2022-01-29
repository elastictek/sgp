import os

import django
from channels.http import AsgiHandler
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.conf.urls import url
from . import consumers

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema.settings')
django.setup()

#application = ProtocolTypeRouter({
#  "http": AsgiHandler(),
#  # Just HTTP for now. (We can add other protocols later.)
#})

websocket_urlpatterns = [
    url(r'^ws/lotespick$', consumers.LotesPickConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "http": AsgiHandler(),
    'websocket': AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})