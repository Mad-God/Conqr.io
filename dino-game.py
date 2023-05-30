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
dino = pygame.image.load("assets/dino.png")
dino_rect = dino.get_rect()
dino_rect.x, dino_rect.y = screen.get_width() / 2, screen.get_height() - dino_rect.height

# tree
tree_list = ["tree-1.png", "tree-2.png", "tree-3.jpg", "tree-4.jpg",]
tree_ind = 0
tree_rect_default = pygame.Rect(screen.get_width(), screen.get_height() - 200, 200, 200)
tree_render_list = []

# keep adding tree every second
tree_freq = 1
def add_tree():
    if random.choice ([True, False]):
        print("adding tree")
        tree = pygame.image.load("assets/"+random.choice(tree_list))
        tree_render_list.append((tree, pygame.Rect(screen.get_width(), screen.get_height() - 200, 200, 200)))
    else:
        print("not adding tree")

set_interval(add_tree, 1 * tree_freq)



# jumping
time = 0
jumping = False
vel_y_init = 100
vel_y = vel_y_init
gravity = (vel_y_init/-10)

# moving
vel_x = 600


# collision
boundary_box = pygame.Rect(300, 300, 200, 200)

while running:
    # poll for events
    # pygame.QUIT event means the user clicked X to close your window
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # fill the screen with a color to wipe away anything from last frame
    screen.fill("white")

    # RENDER YOUR GAME HERE


    # render trees in the queue
    tree_list_update = []
    for i in range(len(tree_render_list)):
        tree = tree_render_list[i][0]
        tree_rect = tree_render_list[i][1]
        if tree_rect.x > -200:
            tree_rect.x -= vel_x * dt
            screen.blit(tree, tree_rect)
            tree_list_update.append(tree_render_list[i])
    tree_render_list = tree_list_update


    screen.blit(dino, dino_rect)


    keys = pygame.key.get_pressed()
    if keys[pygame.K_w]:
        dino_rect.y -= 300 * dt
    if keys[pygame.K_s]:
        dino_rect.y += 300 * dt
    if keys[pygame.K_a]:
        dino_rect.x -= 300 * dt
    if keys[pygame.K_d]:
        dino_rect.x += 300 * dt
    
    pygame.draw.rect(screen, (0, 0, 0), boundary_box, 4)
    
    # jumping
    if keys[pygame.K_SPACE] and not jumping:
        jumping = True
       
    # with accelaration
    if jumping:
        vel_y = vel_y_init + gravity*time
        dino_rect.y -= vel_y
        time +=1
        if vel_y <= (vel_y_init*(-1)):
            jumping = False
            vel_y = vel_y_init
            time = 0
        
    # check collision
    if dino_rect.colliderect(boundary_box):
        print("colliding")


    # game logic end
    # flip() the display to put your work on screen
    pygame.display.flip()

    clock.tick(60)  # limits FPS to 60

    # dt is delta time in seconds since last frame, used for framerate-
    dt = clock.tick(60) / 1000


pygame.quit()
