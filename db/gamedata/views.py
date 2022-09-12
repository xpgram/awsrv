from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from .models import GameMetadata
from .serializers import GameMetadataSerializer


# Create your views here.

class GameMetadataApiView(APIView):
  # add permission to check if user is authenticated
  permission_classes = [permissions.IsAuthenticated]

  # 1. List all
  def get(self, request, *args, **kwargs):
    '''List all the game items for given requested user'''
    games = GameMetadata.objects.filter(created_by = request.user.id)
      # TODO This needs to be combined with PlayersList to know who can actually see it.
    serializer = GameMetadataSerializer(games, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

  # 2. Create
  def post(self, request, *args, **kwargs):
    '''Create a game item with given data'''
    data = {
      'created_by': request.data.get('id'),
      'map_id': request.data.get('map_id'),
    }
    serializer = GameMetadataSerializer(data=data)
    if serializer.is_valid():
      serializer.save()
      return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)