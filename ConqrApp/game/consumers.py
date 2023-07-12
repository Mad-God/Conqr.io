import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync, sync_to_async
from datetime import datetime

# from game.utils import *


class GameConsumer(WebsocketConsumer):
    ID = 1

    def connect(self):
        # for initial request that comes in from client
        self.accept()
        self.room_group_name = self.scope["path"].split("/")[-1]
        self.room_group_name = "default"
        self.send(
            json.dumps(
                {
                    "message": "You are now connected",
                    "id": GameConsumer.ID,
                    "type": "connected",
                }
            )
        )
        GameConsumer.ID += 1
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name,
        )
        print(self.ID)

    def receive(self, text_data):  # for when the client sends messages
        # group send code
        """
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": text_data,
                "sender": "Anonymous",
            },
        )
        """

        data = json.loads(text_data)
        print(data)
        # if type(data["position"]) != int:
        #     return

        # response = get_ai_move(
        #     dino_position=data["position"],
        #     tree_disctance=data["closest_tree"],
        #     score=data["score"],
        #     trees_crossed=data["crossed"],
        # )

        # self.send()
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "chat_message",
                "div-id": data["id"],
                "sender": data["sender"],
            },
        )

    def chat_message(self, event):
        self.send(json.dumps(event))
