from django.db import models
# Create your models here.


ROOM_TYPES = [
    ('VS-AI', "vsai"),
    ('ALL-AI', "allai"),
    ('P-V-P', "pvp"),
]

class Room(models.Model):
    room_id = models.IntegerField(null=True, blank=True)
    player_count = models.IntegerField(default=0)
    is_inactive = models.BooleanField(default=False)
    inactive_date = models.DateTimeField(blank=True, null=True)
    is_ai_enabled = models.BooleanField(default=False)
    player_id = models.BooleanField(default=False)
    room_type = models.CharField(choices=ROOM_TYPES, max_length=10, blank=True, null=True)
    first_player_joined = models.BooleanField(default=False)
    second_player_joined = models.BooleanField(default=False)
    board = models.CharField(max_length=61, default="0"*61)