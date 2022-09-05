import os

import django
from channels.http import AsgiHandler
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import re_path
from . import consumers

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema.settings')
django.setup()

#application = ProtocolTypeRouter({
#  "http": AsgiHandler(),
#  # Just HTTP for now. (We can add other protocols later.)
#})


websocket_urlpatterns = [
    re_path(r'^ws/lotespick$', consumers.LotesPickConsumer.as_asgi()),
    re_path(r'^ws/realtimealerts$', consumers.RealTimeAlerts.as_asgi()),
    re_path(r'^ws/realtimeofs$', consumers.RealTimeOfs.as_asgi()),
    re_path(r'^ws/realtimegeneric$', consumers.RealTimeGeneric.as_asgi())
]

application = ProtocolTypeRouter({
    "http": AsgiHandler(),
    'websocket': AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})