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
    games = GameMetadata.objects.all()
    # games = GameMetadata.objects.filter(created_by = request.user.id)
      # TODO This needs to be combined with PlayersList to know who can actually see it.
    serializer = GameMetadataSerializer(games, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


  # 2. Create
  def post(self, request, *args, **kwargs):
    '''Create a game item with given data'''
    data = {
      'created_by': request.data.get('created_by'),
      'map_id': request.data.get('map_id'),
      'fog_of_war': request.data.get('fog_of_war'),
      'starting_funds': request.data.get('starting_funds'),
    }
    serializer = GameMetadataSerializer(data=data)
    if serializer.is_valid():
      serializer.save()
      return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GameMetadataDetailApiView(APIView):
  # add permission to check if user is authenticated
  permission_classes = [permissions.IsAuthenticated]
  
  
  def get_object(self, game_id, user_id):
    '''Helper method to get the object with the given game_id and user_id'''
    try:
      return GameMetadata.objects.get(id=game_id, created_by=user_id)
    except GameMetadata.DoesNotExist:
      return None


  # 3. Retrieve
  def get(self, request, game_id, *args, **kwargs):
    '''List all the game items for given requested user'''

    game_instance = self.get_object(game_id, request.user.id)
    if not game_instance:
      return Response(
        {"res": "Object with game id does not exist."},
        status=status.HTTP_400_BAD_REQUEST
      )

    serializer = GameMetadataSerializer(game_instance)
    return Response(serializer.data, status=status.HTTP_200_OK)


  # 4. Update
  def put(self, request, game_id, *args, **kwargs):
      '''Updates the game item with given game_id if it exists'''
      # TODO Remove; this is just here for learning purposes

      game_instance = self.get_object(game_id, request.user.id)
      if not game_instance:
          return Response(
              {"res": "Object with todo id does not exists"}, 
              status=status.HTTP_400_BAD_REQUEST
          )

      data = {
          'starting_funds': request.data.get('starting_funds'), 
          'fog_of_war': request.data.get('fog_of_war'),
      }
      serializer = GameMetadataSerializer(instance = game_instance, data=data, partial = True)

      if serializer.is_valid():
          serializer.save()
          return Response(serializer.data, status=status.HTTP_200_OK)

      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


  # 5. Delete
  def delete(self, request, game_id, *args, **kwargs):
    '''Deletes the game item with the given game_id if it exists.'''

    game_instance = self.get_object(game_id, request.user.id)
    if not game_instance:
      return Response(
        {"res": "Object with game id does not exist."},
        status=status.HTTP_400_BAD_REQUEST
      )

    game_instance.delete()
    
    return Response(
      {"res": "Object was deleted."},
      status=status.HTTP_200_OK
    )