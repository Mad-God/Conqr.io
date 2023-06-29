# # consumers.py

# from channels.generic.websocket import AsyncWebsocketConsumer


# class MyConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         # Called when the websocket is handshaking as part of the connection process.
#         print("connected")
#         await self.accept()

#     async def disconnect(self, close_code):
#         # Called when the WebSocket closes for any reason.
#         print("disconnected")
#         pass

#     async def receive(self, text_data):
#         print(text_data)
#         await self.send_message(text_data)
#         # Called with the body of the message from the WebSocket.
#         # Handle incoming messages from the client.
#         pass

#     async def send_message(self, event):
#         # Called to send a message back to the WebSocket client.
#         await self.send(text_data=event)

# chat/consumers.py


"""

import json
from channels.generic.websocket import WebsocketConsumer, AsyncConsumer


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = "default"
        self.room_group_name = "chat_%s" % self.room_name

        # Join room group
        self.channel_layer.group_add(self.room_group_name, self.channel_name)

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    def receive(self, text_data):
        message = text_data
        print("recieved from client: ", text_data)
        self.chat_message(text_data)
        # Send message to room group
        x = (
            self.channel_layer.group_send(
                self.room_group_name, {"type": "chat_message", "message": message}
            ),
        )
        print("group sent", self.channel_name)
        # breakpoint()

    def chat_message(self, event):
        message = event
        print("sending to client: ", event)
        # Send message to WebSocket
        self.send(text_data=message)
"""
# """

import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync, sync_to_async
from datetime import datetime


# from .models import ChatGroup, TextMessage
# from base.models import User


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        # for initial request that comes in from client
        self.accept()
        self.room_group_name = self.scope["path"].split("/")[-1]
        self.room_group_name = "default"
        # self.send(
        #     text_data=json.dumps(
        #         {
        #             "type": "connection_established",
        #             "message": "You are now connected",
        #         }
        #     )
        # )
        self.send("You are now connected")
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name,
        )

    def receive(self, text_data):  # for when the client sends messages
        # text_data_json = json.loads(text_data)
        # message = text_data_json["message"]

        # sender = self.save_message(text_data_json)

        # async_to_sync(self.channel_layer.group_send)(
        #     self.room_group_name,
        #     {
        #         "type": "chat_message",
        #         "message": message,
        #         "sender": sender.username if sender else "Anonymous",
        #     },
        # )
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": text_data,
                "sender": "Anonymous",
            },
        )

    # def save_message(self, message):
    #     if message["sender"]:
    #         sender = User.objects.get(id=int(message["sender"]))
    #         TextMessage.objects.create(
    #             text=message["message"],
    #             sender=sender,
    #             group=ChatGroup.objects.get(slug=self.room_group_name),
    #         )
    #     else:
    #         TextMessage.objects.create(
    #             text=message["message"],
    #             group=ChatGroup.objects.get(slug=self.room_group_name),
    #         )
    #         sender = None
    #     return sender

    def chat_message(self, event):
        # message = event["message"]
        # print(event)
        self.send(event["message"])
        # message = event["message"]
        # self.send(
        #     text_data=json.dumps(
        #         {"type": "chat", "message": message, "sender": event["sender"]}
        #     )
        # )


# """
