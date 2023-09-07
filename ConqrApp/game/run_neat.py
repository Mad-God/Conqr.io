# import os
# import neat
# import pygame
# import pickle
# import time
# # from game.models import Room
# from django.conf import settings
# import os

# neat_model = None


# def train_ai(genome1, genome2, config, draw=False):
#     """
#     Train the AI by passing two NEAT neural networks and the NEAt config object.
#     These AI's will play against eachother to determine their fitness.
#     """
#     global neat_model
#     run = True
#     start_time = time.time()

#     net1 = neat.nn.FeedForwardNetwork.create(genome1, config)
#     net2 = neat.nn.FeedForwardNetwork.create(genome2, config)

#     with open(settings.BASE_DIR / 'game/neat/net1.pkl', 'wb') as file:
#         pickle.dump(net1, file)
#     print(f"Network saved to '{settings.BASE_DIR / 'game/neat/net1.pkl'}'.")


#     with open(settings.BASE_DIR / 'game/neat/net2.pkl', 'wb') as file:
#         pickle.dump(net2, file)
#     print(f"Network saved to '{settings.BASE_DIR / 'game/neat/net1.pkl'}'.")


#     while not os.path.exists(settings.BASE_DIR / 'game/neat/flag.txt'):
#         time.sleep(1)  # Adjust the sleep interval (in seconds) to control how often the function checks for the file.
#         continue

#     # file_path = os.path.join(directory, filename)

#     # while not os.path.exists(file_path):

#     # File detected, delete it.
#     try:
#         os.remove(settings.BASE_DIR / 'game/neat/flag.txt')
#         print(f"File '{settings.BASE_DIR / 'game/neat/flag.txt'}' deleted.")
#     except OSError as e:
#         print(f"Failed to delete the file '{settings.BASE_DIR / 'game/neat/flag.txt'}': {e}")

#     return


#     # calculate_fitness(genome1)
#     # calculate_fitness(genome2)


#     # max_hits = 50

#     # while run:
#     #     for event in pygame.event.get():
#     #         if event.type == pygame.QUIT:
#     #             return True

#     #     game_info = self.game.loop()

#     #     self.move_ai_paddles(net1, net2)

#     #     if draw:
#     #         self.game.draw(draw_score=False, draw_hits=True)

#     #     pygame.display.update()

#     #     duration = time.time() - start_time
#     #     if game_info.left_score == 1 or game_info.right_score == 1 or game_info.left_hits >= max_hits:
#     #         self.calculate_fitness(game_info, duration)
#     #         break

#     # return False


# def eval_genomes(genomes, config):
#     """
#     Run each genome against eachother one time to determine the fitness.
#     """
#     # width, height = 700, 500
#     # win = pygame.display.set_mode((width, height))
#     # pygame.display.set_caption("Pong")

#     for i, (genome_id1, genome1) in enumerate(genomes):
#         print(round(i/len(genomes) * 100), end=" ")
#         genome1.fitness = 0
#         for genome_id2, genome2 in genomes[min(i+1, len(genomes) - 1):]:
#             genome2.fitness = 0 if genome2.fitness == None else genome2.fitness
#             # pong = PongGame(win, width, height)

#             force_quit = train_ai(genome1, genome2, config)
#             if force_quit:
#                 quit()

#     #p = neat.Checkpointer.restore_checkpoint('neat-checkpoint-85')
#     p = neat.Population(config)
#     p.add_reporter(neat.StdOutReporter(True))
#     stats = neat.StatisticsReporter()
#     p.add_reporter(stats)
#     p.add_reporter(neat.Checkpointer(1))

#     winner = p.run(eval_genomes, 5)
#     with open("best.pickle", "wb") as f:
#         pickle.dump(winner, f)

#     # run_neat(config)
#     # test_best_network(config)
#  eval_genomes()
