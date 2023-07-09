import pickle
import neat
import os


PICKLE_FILE_PATH = "..\\best.pickle"
CONFIG_FILE_PATH = "..\\config.txt"

with open(PICKLE_FILE_PATH, "rb") as f:
    winner = pickle.load(f)

local_dir = os.path.dirname(__file__)
config_path = os.path.join(local_dir, "config.txt")

config = neat.Config(
    neat.DefaultGenome,
    neat.DefaultReproduction,
    neat.DefaultSpeciesSet,
    neat.DefaultStagnation,
    CONFIG_FILE_PATH,
)

winner_net = neat.nn.FeedForwardNetwork.create(winner, config)


def get_ai_move(dino_position, tree_disctance, score, trees_crossed):
    print(dino_position, tree_disctance, score, trees_crossed)
    output = winner_net.activate((dino_position, tree_disctance, score, trees_crossed))
    decision = output.index(max(output))
    return decision
