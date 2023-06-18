import os
import neat
import pygame
import pickle
from Dino import Game
import time


class DinoTrainer:
    def __init__(self):
        self.game = Game()
        pass

    def test_ai(self):
        pass

    def train_ai(self, genome, config, draw):
        run = True
        start_time = time.time()

        net = neat.nn.FeedForwardNetwork.create(genome, config)
        self.genome = genome

        max_crosses = 50

        while run:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    return True

            game_info = self.game.game_info()

            self.jump(net, game_info)

            if draw:
                self.game.draw()

            pygame.display.update()

            duration = time.time() - start_time
            if game_info["trees_crossed_count"] >= max_crosses or not self.game.running:
                self.calculate_fitness()
                break

        return False

    def jump(self, net, game_info):
        output = net.activate(
            (
                game_info["trees_crossed_count"],
                game_info["score"],
                game_info["dino_position"],
                game_info["closest_tree_dist"],
            )
        )
        decision = output.index(max(output))
        valid = True
        self.game.dino.jump(self.game.screen, jump_pressed=decision)

    def calculate_fitness(self):
        self.genome.fitness += self.game.trees_crossed_count


def eval_genomes(genomes, config):
    """
    Run each genome against eachother one time to determine the fitness.
    """
    width, height = 700, 500
    win = pygame.display.set_mode((width, height))
    pygame.display.set_caption("Pong")

    # old code from Pong Neat
    """
    # for i, (genome_id1, genome1) in enumerate(genomes):
    #     # print the progress
    #     print(round(i / len(genomes) * 100), end=" ")
    #     # set the initial fitness
    #     genome1.fitness = 0

    #     # for each genome after the current genome
    #     for genome_id2, genome2 in genomes[min(i + 1, len(genomes) - 1) :]:
    #         # set the fitness if not already set
    #         genome2.fitness = 0 if genome2.fitness == None else genome2.fitness
    #         # initialize the game
    #         pong = PongGame(win, width, height)
    #         # run the game
    #         force_quit = pong.train_ai(genome1, genome2, config, draw=True)
    #         if force_quit:
    #             quit()
    """

    for i, (genome_id1, genome1) in enumerate(genomes):
        # print the progress
        print(round(i / len(genomes) * 100), end=" ")
        # set the initial fitness
        genome1.fitness = 0

        dino_trainer = DinoTrainer()
        force_quit = dino_trainer.train_ai(genome1, config, draw=True)
        if force_quit:
            quit()


def run_neat(config):
    # Saving checkpoint to neat-checkpoint-4
    # p = neat.Checkpointer.restore_checkpoint('neat-checkpoint-85')
    p = neat.Population(config)
    p.add_reporter(neat.StdOutReporter(True))
    stats = neat.StatisticsReporter()
    p.add_reporter(stats)
    p.add_reporter(neat.Checkpointer(1))

    winner = p.run(eval_genomes, 5)
    with open("best.pickle", "wb") as f:
        pickle.dump(winner, f)


def test_best_network(config):
    with open("best.pickle", "rb") as f:
        winner = pickle.load(f)
    winner_net = neat.nn.FeedForwardNetwork.create(winner, config)

    pygame.display.set_caption("Pong")
    pong = DinoTrainer()
    pong.test_ai(winner_net)


if __name__ == "__main__":
    local_dir = os.path.dirname(__file__)
    config_path = os.path.join(local_dir, "config.txt")

    config = neat.Config(
        neat.DefaultGenome,
        neat.DefaultReproduction,
        neat.DefaultSpeciesSet,
        neat.DefaultStagnation,
        config_path,
    )

    # run_neat(config)
    test_best_network(config)
