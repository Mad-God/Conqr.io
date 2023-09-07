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
    if request_type == "vs-ai":
        room = Room.objects.create(room_type="vsai")
    if request_type == "join" and request.GET.get("room_id"):
        qs = Room.objects.filter(id=int(request.GET.get("room_id")))
        qs = qs.filter(first_player_joined=False).union(
            qs.filter(second_player_joined=False)
        )
        if qs.exists():
            room = qs[0]
    if request_type == "spectate":
        room = Room.objects.create(room_type="allai")
        room.board = room.board[0:26] + "1" + room.board[27:34] + "3" + room.board[35:]
        room.save()
    if request_type == "create":
        room = Room.objects.create(room_type="pvp")
        room.board = room.board[0:26] + "1" + room.board[27:34] + "3" + room.board[35:]
        room.save()
    return JsonResponse({"room_id": room.id if room else None}, safe=False)
