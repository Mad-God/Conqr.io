import pygame
import neat
import os
import time
import pickle
from django.conf import settings

BASE_DIR = os.getcwd()
# net1 = neat.nn.FeedForwardNetwork.create(genome1, config)
# net2 = neat.nn.FeedForwardNetwork.create(genome2, config)
# os.remove(BASE_DIR + "\\game\\neat-static\\net2.pkl")
# os.remove(BASE_DIR + "\\game\\neat-static\\net1.pkl")

# with open(BASE_DIR + "\\game\\neat-static\\net1.pkl", "wb+") as file:
#     pickle.dump(net1, file)
# print(f"Network saved to '{BASE_DIR + 'neat-static/net1.pkl'}'.")

# with open(BASE_DIR + "\\game\\neat-static\\net2.pkl", "wb+") as file:
#     pickle.dump(net2, file)
# print(f"Network saved to '{BASE_DIR + 'neat-static/net1.pkl'}'.")

# while not os.path.exists(BASE_DIR + "\\game\\neat-static\\flag.txt"):
#     time.sleep(
#         1
#     )  # Adjust the sleep interval (in seconds) to control how often the function checks for the file.
#     continue
# get the Neural network
# if player_id == 1:
#     filename = os.getcwd() + "\\game\\neat-static\\net1.pkl"
# elif player_id == 2:
filename = os.getcwd() + "\\game\\neat-static\\gen2.pkl"
# else:
#     print("Player ID is invalid for Neaural nmetwork")
with open(filename, "rb") as file:
    network = pickle.load(file)
print(f"Network loaded from '{filename}'.")
# self.neat_net = network


breakpoint()
