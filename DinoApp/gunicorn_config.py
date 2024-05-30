import multiprocessing

# Gunicorn configuration
bind = "127.0.0.1:8000"  # Replace with your desired address and port
workers = 1
