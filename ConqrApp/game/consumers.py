import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync, sync_to_async
from datetime import datetime
# from game.models import Room


# from game.utils import *
def print_board(board):
    ind= 0
    upgoing = True
    row = 0
    cols = 5
    for i in range(9):
        print(" "*(9-cols), end="")
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
        from game.models import Room

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
            self.close()
            return
            
        
        # set the player number
        if not room.first_player_joined:
            player_id = 1
            room.first_player_joined = True
            bomb_count = room.first_player_bomb
        elif not room.second_player_joined:
            player_id = 2
            room.second_player_joined = True
            bomb_count = room.second_player_bomb
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
                    "both-player-joined":room.first_player_joined and room.second_player_joined,
                    "player-bomb-count":bomb_count
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
        from game.models import Room
        is_neutralised = False
        data = json.loads(text_data)
        will_explode = False
        will_neutralise = False
        room = Room.objects.get(id = self.room_id)
        board = room.board
        
        if data.get("type") == "heartbeat":
            player_id = data["sender"]
            if player_id == 1:
                room.first_player_joined = True
            else:
                room.second_player_joined = True
            room.save()
            return
        elif data.get("type") == "bomb-sync":
            player_id = data["sender"]
            if player_id == 1:
                room.first_player_bomb = data["bomb_count"]
            elif player_id == 2:
                room.second_player_bomb = data["bomb_count"]
            else:
                return
            room.save()
            return
        elif data.get("type") == "neutralise":
            print("neutralising div:", data)
            board = board[:int(data["id"])] + "0" + board[int(data["id"])+1:]
            is_neutralised = True
        else:
            if data['sender'] == 1:
                if data["bombed"]:
                    if board[int(data["id"])] == "4":
                        will_neutralise = True                        
                    board = board[:int(data["id"])] + "2" + board[int(data["id"])+1:]
                else:
                    if board[int(data["id"])] == "4":
                        will_explode = True                        
                    board = board[:int(data["id"])] + "1" + board[int(data["id"])+1:]
            if data['sender'] == 2:
                if data["bombed"]:
                    if board[int(data["id"])] == "4":
                        will_neutralise = True                        
                    board = board[:int(data["id"])] + "4" + board[int(data["id"])+1:]
                else:
                    if board[int(data["id"])] == "2":
                        will_explode = True                        
                    board = board[:int(data["id"])] + "3" + board[int(data["id"])+1:]
        room.board = board
        room.save()
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "chat_message",
                "div-id": data["id"],
                "sender": data["sender"],
                "is_bombed": data.get("bombed", False),
                "is_neutralised": is_neutralised
            },
        )

        if will_explode or will_neutralise:
            return
        first_player_alive = False
        second_player_alive = False
        for i in room.board:
            if i == "1" or i == "2":
                first_player_alive = True
            if i == "3" or i == "4":
                second_player_alive = True
        if not first_player_alive:
            print("game over")
            async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "chat_message",
                "msg-type": "game-over",
                "loser":1
            },
        )
        if not second_player_alive:
            print("game over")
            async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "chat_message",
                "msg-type": "game-over",
                "loser":2
            },
        )
        
            
            

    def chat_message(self, event):
        from game.models import Room

        self.send(json.dumps(event))

    def disconnect(self, *args, **kwargs):
        from game.models import Room
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
