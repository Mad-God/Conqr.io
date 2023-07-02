import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync, sync_to_async
from datetime import datetime


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        # for initial request that comes in from client
        self.accept()
        self.room_group_name = self.scope["path"].split("/")[-1]
        self.room_group_name = "default"
        self.send("You are now connected")
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name,
        )

    def receive(self, text_data):  # for when the client sends messages
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": text_data,
                "sender": "Anonymous",
            },
        )

    def chat_message(self, event):
        self.send(event["message"])
