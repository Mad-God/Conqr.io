from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import json
from game.models import Room
from django.contrib import messages


# Create your views here.


def index(request):
    return render(request, "index.html")


def game(request):
    return render(request, "game.html")

def get_lobby(request):
    print(request.GET)
    request_type = request.GET.get("type")
    room = Room.objects.none()
    # breakpoint()
    # Room.objects.order_by("-id")[0].room_id + 1
    if request_type == "vs-ai":
        room = Room.objects.create(room_type = "vsai")
    if request_type == "join" and request.GET.get("room_id"):
            qs = Room.objects.filter(id=int(request.GET.get("room_id")))
            qs = qs.filter(first_player_joined = False).union(qs.filter(second_player_joined=False))
            print(qs)
            if qs.exists():
                room = qs[0]
            
        # try:
        # except:
        #     pass
    if request_type == "spectate":
        room = Room.objects.create(room_type = "allai")
    if request_type == "create":
        room = Room.objects.create(room_type = "pvp")
    if not room:
        print("adding message")
        messages.add_message(request, messages.INFO, "Room invalid")
    return JsonResponse({"room_id":room.id if room else None}, safe=False)
