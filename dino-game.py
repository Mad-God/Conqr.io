# Example file showing a basic pygame "game loop"
import pygame
import functools


# pygame setup
pygame.init()
screen = pygame.display.set_mode((880, 720))
clock = pygame.time.Clock()
running = True

dt = 0

player_pos = pygame.Vector2(screen.get_width() / 2, screen.get_height() - 40)


# jumping
time = 0
jumping = False
vel_y_init = 100
vel_y = vel_y_init
gravity = (vel_y_init/-10)

while running:
    # poll for events
    # pygame.QUIT event means the user clicked X to close your window
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # fill the screen with a color to wipe away anything from last frame
    screen.fill("purple")

    # RENDER YOUR GAME HERE

    pygame.draw.circle(screen, "red", player_pos, 40)
    keys = pygame.key.get_pressed()
    if keys[pygame.K_w]:
        player_pos.y -= 300 * dt
    if keys[pygame.K_s]:
        player_pos.y += 300 * dt
    if keys[pygame.K_a]:
        player_pos.x -= 300 * dt
    if keys[pygame.K_d]:
        player_pos.x += 300 * dt
    
    if keys[pygame.K_SPACE] and not jumping:
        jumping = True
    

    # with accelaration
    if jumping:

        vel_y = vel_y_init + gravity*time
        player_pos.y -= vel_y
        time +=1
        print(f"pso.y: {player_pos.y}; vel_y: {vel_y}; time: {time}")
        if vel_y <= (vel_y_init*(-1)):
            jumping = False
            vel_y = vel_y_init
            time = 0
        

    # flip() the display to put your work on screen
    pygame.display.flip()

    clock.tick(60)  # limits FPS to 60

    # dt is delta time in seconds since last frame, used for framerate-
    # independent physics.
    dt = clock.tick(60) / 1000


pygame.quit()
