# awdb/gamedata/serializers.py

from rest_framework import serializers
from .models import GameMetadata

class GameMetadataSerializer(serializers.ModelSerializer):
  class Meta:
    model = GameMetadata
    fields = ['id', 'created_on', 'created_by', 'map_id', 'fog_of_war', 'starting_funds']