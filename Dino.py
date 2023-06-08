import pygame
import time
import os
import random

BASE_DIR = os.getcwd()


class Dino:
    SPEED = 100
    INITIAL_VELOCITY = 25
    GRAVITY = INITIAL_VELOCITY / -15
    MAX_VELOCITY = 175

    def __init__(self, window):
        self.dino = pygame.image.load(os.path.join(BASE_DIR, "assets/dino/dino.png"))
        self.rect = self.dino.get_rect()
        self.rect.x, self.rect.y = (
            window.get_width() / 2,
            window.get_height() - self.rect.height,
        )
        self.jumping = False
        self.velocity = self.INITIAL_VELOCITY
        self.time = 0

    def jump(self, window, jump_pressed):
        if jump_pressed and not self.jumping:
            self.jumping = True

        if self.jumping:
            self.velocity = self.INITIAL_VELOCITY + self.GRAVITY * self.time

            # for continuous boost with spacebar
            if jump_pressed and self.jumping and self.velocity > 0:
                self.velocity = (self.velocity * 2) % self.MAX_VELOCITY

            self.rect.y = min(
                self.rect.y - self.velocity,
                window.get_width() - self.dino.get_height(),
            )

            self.time += 1

            if self.rect.y >= window.get_height() - self.dino.get_height():
                print(self.rect.y)
                self.rect.y = window.get_height() - self.dino.get_height()
                self.jumping = False
                self.velocity = self.INITIAL_VELOCITY
                self.time = 0


class Game:
    WIDTH = 1200
    HEIGHT = 720

    TREE_LIST = [
        "tree-1.png",
        "tree-2.png",
        "tree-3.jpg",
        "tree-4.jpg",
    ]
    TREE_HEIGHT = 100
    TREE_WIDTH = 100

    FONT_SIZE = 140
    FONT_COLOR = (0, 0, 0)
    SCORE_WIDTH = 110
    SCORE_HEIGHT = 110

    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((self.WIDTH, self.HEIGHT))
        self.clock = pygame.time.Clock()
        self.running = True
        self.dt = 0

        self.dino = Dino(self.screen)

        # trees
        self.tree_velocity = 500
        self.tree_frequency = 2.5
        self.tree_render_list = []
        self.tree_timer = time.time()

        # score
        self.score = 0
        self.font = pygame.font.Font(None, self.FONT_SIZE)

    def add_tree(self):
        if random.choice([True, False, True]):
            print("adding")
            tree = pygame.image.load(
                os.path.join(BASE_DIR, "assets/dino/" + random.choice(self.TREE_LIST))
            )
            self.tree_render_list.append(
                (
                    tree,
                    pygame.Rect(
                        self.screen.get_width(),
                        self.screen.get_height() - self.TREE_HEIGHT,
                        self.TREE_WIDTH,
                        self.TREE_HEIGHT,
                    ),
                )
            )

    def draw(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False

        self.screen.fill("white")
        # print(time.time() - self.tree_timer, self.tree_frequency)
        if time.time() - self.tree_timer > self.tree_frequency:
            self.add_tree()
            self.tree_timer = time.time()

        tree_list_update = []
        for i in range(len(self.tree_render_list)):
            tree = self.tree_render_list[i][0]
            tree_rect = self.tree_render_list[i][1]
            if tree_rect.x > -tree.get_width():
                tree_rect.x -= self.tree_velocity * self.dt
                tree = pygame.transform.scale(tree, (self.TREE_WIDTH, self.TREE_HEIGHT))
                self.screen.blit(tree, tree_rect)
                if self.dino.rect.colliderect(tree_rect):
                    self.score = 0
                    pygame.draw.rect(self.screen, (0, 0, 0), tree_rect, 4)

                tree_list_update.append(self.tree_render_list[i])
        self.tree_render_list = tree_list_update
        print(self.tree_render_list)

        self.screen.blit(self.dino.dino, self.dino.rect)

        keys = pygame.key.get_pressed()

        self.dino.jump(self.screen, pygame.key.get_pressed()[pygame.K_SPACE])

        self.update_score()

        self.level_up()
        # dt is delta time in seconds since last frame, used for framerate-
        self.clock.tick(60)  # limits FPS to 60
        pygame.display.flip()
        self.dt = self.clock.tick(60) / 1000

    def update_score(self):
        self.score += 0.5
        text = self.font.render(str(int(self.score)), True, self.FONT_COLOR)
        self.screen.blit(text, (self.SCORE_WIDTH, self.SCORE_HEIGHT))

    def level_up(self):
        if self.score < 50:
            self.tree_velocity = 500
        else:
            self.tree_velocity = 500 + self.score
        if self.tree_velocity > 1500:
            self.tree_velocity = 1500

    def run(self):
        while self.running:
            self.draw()


game = Game()

game.run()
