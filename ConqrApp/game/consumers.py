import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync, sync_to_async
from datetime import datetime
import os
import pickle
import neat


# from game.utils import *
def print_board(board):
    ind = 0
    upgoing = True
    row = 0
    cols = 5
    for i in range(9):
        print(" " * (9 - cols), end="")
        for j in range(cols):
            print(board[ind], end=" ")
            ind += 1
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

        # breakpoint()
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
            self.player_id = player_id
            room.first_player_joined = True
            bomb_count = room.first_player_bomb
        elif not room.second_player_joined:
            player_id = 2
            self.player_id = player_id
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
                    "both-player-joined": room.first_player_joined
                    and room.second_player_joined,
                    "player-bomb-count": bomb_count,
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
                "player-id": player_id,
            },
        )
        print(room.room_type)

        # check if we're training AI
        if room.room_type != "allai":
            return

        # get the Genome network
        if player_id == 1:
            filename = os.getcwd() + "\\game\\neat-static\\genome1.pkl"
        elif player_id == 2:
            filename = os.getcwd() + "\\game\\neat-static\\genome2.pkl"
        else:
            print("Player ID is invalid for Neaural nmetwork")
            return

        if not os.path.exists(filename):
            raise FileNotFoundError(f"The file '{filename}' does not exist.")

        with open(filename, "rb") as file:
            genome = pickle.load(file)
        print(f"Genome loaded from '{filename}'.")

        # create the network
        BASE_DIR = os.getcwd()
        config_path = os.path.join(BASE_DIR, "neat-config.txt")

        config = neat.Config(
            neat.DefaultGenome,
            neat.DefaultReproduction,
            neat.DefaultSpeciesSet,
            neat.DefaultStagnation,
            config_path,
        )
        network = neat.nn.FeedForwardNetwork.create(genome, config)
        self.neat_net = network
        self.genome_fitness = genome.fitness
        # return network

    def get_ai_move(self, data):
        try:
            output_moves = []

            for hex_id in data["accessible_hexes"]:
                input_tuple = (
                    data["player_id"],
                    hex_id,
                    data["bombs_available"],
                    data["lost_count"],
                    data["claim_count"],
                    *data["board_string"],
                )
                output = self.neat_net.activate(input_tuple)
                output_move = output.index(max(output))
                output_moves.append((output_move, max(output), hex_id))

            def get_middle_value(tuple):
                return tuple[1]

            return max(output_moves, key=get_middle_value)
        except:
            return (None, None, None)

    def calculate_fitness(self):
        from game.models import Room

        print("calculating fitness for", self.player_id)
        print("current fitness: ", self.genome_fitness)
        self_player_count = 0
        opponent_player_count = 0
        room = Room.objects.get(id=self.room_id)
        if self.player_id == 1:
            for i in room.board:
                if i == "1" or i == "2":
                    self_player_count += 1
                if i == "3" or i == "4":
                    opponent_player_count += 1
        if self.player_id == 2:
            for i in room.board:
                if i == "1" or i == "2":
                    opponent_player_count += 1
                if i == "3" or i == "4":
                    self_player_count += 1

        if self_player_count > opponent_player_count:
            self.genome_fitness += 1
        print("updated fitness: ", self.genome_fitness)
        with open(f"flag{self.player_id}.txt", "w") as file:
            file.write(str(self.genome_fitness))
        print("created the flag file.")

    def receive(self, text_data):
        try:
            from game.models import Room

            is_neutralised = False
            # print(text_data)
            data = json.loads(text_data)
            will_explode = False
            will_neutralise = False
            room = Room.objects.get(id=self.room_id)
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
                board = board[: int(data["id"])] + "0" + board[int(data["id"]) + 1 :]
                is_neutralised = True

            elif data.get("type") == "get-ai-move":
                (move, confidence, hex_id) = self.get_ai_move(data)
                if not hex_id:
                    return
                self.send(
                    json.dumps(
                        {
                            "player_id": data["player_id"],
                            "msg-type": "ai-move",
                            "hex-id": hex_id,
                            "move": move,
                            "move-confidence": confidence,
                        }
                    )
                )
                return

            elif data.get("type") == "timeout":
                # move = self.calculate_fitness()
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {"type": "chat_message", "msg-type": "game-timeout"},
                )
                return

            elif data.get("type") == "calculate-fitness":
                self.calculate_fitness()
            # add bomb to the board
            else:
                if data["sender"] == 1:
                    if data["bombed"]:
                        if board[int(data["id"])] == "4":
                            will_neutralise = True
                        board = (
                            board[: int(data["id"])]
                            + "2"
                            + board[int(data["id"]) + 1 :]
                        )
                    else:
                        if board[int(data["id"])] == "4":
                            will_explode = True
                        board = (
                            board[: int(data["id"])]
                            + "1"
                            + board[int(data["id"]) + 1 :]
                        )
                if data["sender"] == 2:
                    if data["bombed"]:
                        if board[int(data["id"])] == "4":
                            will_neutralise = True
                        board = (
                            board[: int(data["id"])]
                            + "4"
                            + board[int(data["id"]) + 1 :]
                        )
                    else:
                        if board[int(data["id"])] == "2":
                            will_explode = True
                        board = (
                            board[: int(data["id"])]
                            + "3"
                            + board[int(data["id"]) + 1 :]
                        )

            room.board = board
            room.save()

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "div-id": data["id"],
                    "sender": data["sender"],
                    "is_bombed": data.get("bombed", False),
                    "is_neutralised": is_neutralised,
                },
            )
            # if the board will explode or neutralise, we postpone ending the game
            if will_explode or will_neutralise:
                return

            # check if the game has ended
            first_player_alive = False
            second_player_alive = False
            for i in room.board:
                if i == "1" or i == "2":
                    first_player_alive = True
                if i == "3" or i == "4":
                    second_player_alive = True
            if not first_player_alive:
                print("game over")
                self.calculate_fitness()
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {"type": "chat_message", "msg-type": "game-over", "loser": 1},
                )
            if not second_player_alive:
                print("game over")
                self.calculate_fitness()
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {"type": "chat_message", "msg-type": "game-over", "loser": 2},
                )

        except Exception as e:
            print("Eror=====>", str(e))
            # raise "not allowed"

    def chat_message(self, event):
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
