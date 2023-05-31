# Example file showing a basic pygame "game loop"
import pygame
import functools
import random
from threading import Timer
import threading


def set_interval(func, sec):
    def func_wrapper():
        set_interval(func, sec)
        func()

    t = threading.Timer(sec, func_wrapper)
    t.start()
    return t


# pygame setup
pygame.init()
screen = pygame.display.set_mode((880, 720))
clock = pygame.time.Clock()
running = True

dt = 0

player_pos = pygame.Vector2(screen.get_width() / 2, screen.get_height() - 40)

# dino
dino = pygame.image.load("assets/dino/dino.png")
dino_rect = dino.get_rect()
dino_rect.x, dino_rect.y = (
    screen.get_width() / 2,
    screen.get_height() - dino_rect.height,
)

# tree
tree_list = [
    "tree-1.png",
    "tree-2.png",
    "tree-3.jpg",
    "tree-4.jpg",
]
tree_ind = 0
tree_render_list = []
tree_width = 100
tree_height = 100

vel_x = 500

# keep adding tree every second
tree_freq = 1.5


def add_tree():
    if random.choice([True, False, True]):
        tree = pygame.image.load("assets/dino/" + random.choice(tree_list))
        tree_render_list.append(
            (
                tree,
                pygame.Rect(
                    screen.get_width(),
                    screen.get_height() - tree_height,
                    tree_width,
                    tree_height,
                ),
            )
        )


set_interval(add_tree, 1 * tree_freq)


# jumping
time = 0
jumping = False
vel_y_init = 25
vel_y = vel_y_init
max_vel_y = 175
gravity = vel_y_init / -15


# score keeping
score = 0
font_size = 136
font_color = (0, 0, 0)
font = pygame.font.Font(None, font_size)


while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    screen.fill("white")

    # RENDER YOUR GAME HERE

    # render trees in the queue
    tree_list_update = []
    for i in range(len(tree_render_list)):
        tree = tree_render_list[i][0]
        tree_rect = tree_render_list[i][1]
        if tree_rect.x > -tree.get_width():
            tree_rect.x -= vel_x * dt
            tree = pygame.transform.scale(tree, (tree_width, tree_height))
            screen.blit(tree, tree_rect)
            if dino_rect.colliderect(tree_rect):
                score = 0
                pygame.draw.rect(screen, (0, 0, 0), tree_rect, 4)

            tree_list_update.append(tree_render_list[i])
    tree_render_list = tree_list_update

    screen.blit(dino, dino_rect)

    keys = pygame.key.get_pressed()
    if keys[pygame.K_a]:
        dino_rect.x = max(dino_rect.x - 300 * dt, 0)
    if keys[pygame.K_d]:
        dino_rect.x = min(dino_rect.x + 300 * dt, screen.get_width() - dino.get_width())

    # jumping
    if keys[pygame.K_SPACE] and not jumping:
        jumping = True

    # with accelaration
    if jumping:
        vel_y = vel_y_init + gravity * time
        # for continuous boost with spacebar
        if keys[pygame.K_SPACE] and jumping and vel_y > 0:
            vel_y = (vel_y * 2) % max_vel_y
            print("vel_y: ", vel_y)
        dino_rect.y = min(dino_rect.y - vel_y, screen.get_width() - dino.get_height())
        time += 1
        if dino_rect.y >= screen.get_height() - dino.get_height():
            print(dino_rect.y)
            dino_rect.y = screen.get_height() - dino.get_height()
            jumping = False
            vel_y = vel_y_init
            time = 0

    # score
    score += 0.5
    text_surface = font.render(str(int(score)), True, font_color)
    screen.blit(text_surface, (110, 110))

    # level_up
    if score < 50:
        vel_x = 500
    else:
        vel_x = 500 + score
    if vel_x > 1500:
        vel_x = 1500
    # dt is delta time in seconds since last frame, used for framerate-
    clock.tick(60)  # limits FPS to 60
    pygame.display.flip()
    dt = clock.tick(60) / 1000


pygame.quit()
