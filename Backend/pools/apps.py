from django.apps import AppConfig
from .listener import start_event_listener


class PoolsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pools'

    def ready(self):
        start_event_listener()