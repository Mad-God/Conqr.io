import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync, sync_to_async
from datetime import datetime
from game.models import Room

# from game.utils import *
def print_board(board):
    ind= 0
    upgoing = True
    row = 0
    cols = 5
    for i in range(9):
        print(" "*(9-cols), end="")
        # print(cols)
        for j in range(cols):
            print(board[ind], end=" ")
            ind +=1
        print()
        row += 1
        if row < 5:
            cols += 1
        else:
            cols -= 1

    print(ind)

class GameConsumer(WebsocketConsumer):
    def connect(self):

        # get the rom id from params
        params = self.scope["query_string"].decode("utf-8")
        params_dict = {}
        for param in params.split("&"):
            params_dict[param.split("=")[0]] = param.split("=")[1]
        room_id_calculated = params_dict["room_id"]

        # get the room and check vacancy
        room = Room.objects.get(id=room_id_calculated)
        
        if room.first_player_joined and room.second_player_joined:
            print("no vacancy; connection refused")
            return
            
        
        # set the player number
        if not room.first_player_joined:
            player_id = 1
            room.first_player_joined = True
        elif not room.second_player_joined:
            player_id = 2
            room.second_player_joined = True
        room.save()
        
        # set socket room id and group name
        self.room_id = room.id
        self.accept()
        self.room_group_name = str(room.id)
        self.send(
            json.dumps(
                {
                    "message": "You are now connected",
                    "player_id": player_id,
                    "board": room.board,
                    "msg-type": "connected",
                }
            )
        )
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name,
        )
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "chat_message",
                "msg-type": "player-connect",
                "player-id": player_id
            },
        )

    def receive(self, text_data):
        data = json.loads(text_data)
        print(data)
        
        room = Room.objects.get(id = self.room_id)
        if data.get("type") == "heartbeat":
            player_id = data["sender"]
            if player_id == 1:
                room.first_player_joined = True
            else:
                room.second_player_joined = True
            room.save()
            return
        board = room.board
        if data['sender'] == 1:
            if data["bombed"]:
                board = board[:int(data["id"])] + "2" + board[int(data["id"])+1:]
            else:
                board = board[:int(data["id"])] + "1" + board[int(data["id"])+1:]
        if data['sender'] == 2:
            if data["bombed"]:
                board = board[:int(data["id"])] + "4" + board[int(data["id"])+1:]
            else:
                board = board[:int(data["id"])] + "3" + board[int(data["id"])+1:]
        room.board = board
        room.save()
        print_board(room.board)
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

    def disconnect(self, *args, **kwargs):
        try:
            # get the current room 
            room = Room.objects.get(id=self.room_id)
            print("player left")
            # inform the group that a connection left
            async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                    "type": "chat_message",
                    "msg-type": "disconnect",
                },
            )
            print("informed group")

            # set both players as inactive
            room.first_player_joined = False
            room.second_player_joined = False
            room.save()
        except:
            print("no socket connection")
