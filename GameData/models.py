from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Constants

POINT_SERIAL_LENGTH = 9 # Allows for 3-digits; '(111,111)'

# Create your models here.

class BattleMap(models.Model):
    author = models.CharField(max_length=32)

class GameMetadata(models.Model):
    # game_id = models.PositiveBigIntegerField(name="GameId", primary_key=True, auto_created=True)
    created_on = models.DateTimeField(default=timezone.now)
    map_id = models.ForeignKey(BattleMap, on_delete=models.CASCADE)
      # TODO Model map references. In db, or in client? And which?
    game_over = models.BooleanField(default=False)

    # scenario data — I don't want this serialized 'cause I want admin options
    fog_of_war = models.BooleanField(default=False)
    starting_funds = models.PositiveIntegerField(default=0)
      # and more ...

    class Meta:
      ordering = ['created_on']

class GamePlayerList(models.Model):
      # TODO GameId and Player# together should be a unique combination
    game_id = models.ForeignKey(GameMetadata, on_delete=models.CASCADE)
    player_num = models.PositiveSmallIntegerField(name="Player#")
    account = models.ForeignKey(User, on_delete=models.DO_NOTHING)
      # TODO No cascade delete for records purposes, but how do I handle missing persons then?
    # TODO This tri-combination should be unique

    # player-specific data for this game (CO, Handicaps, etc.)
    co_id = models.PositiveIntegerField(default=0)

class GameAction(models.Model):
    game_id = models.ForeignKey(GameMetadata, on_delete=models.CASCADE)
    turn_ordinal = models.PositiveIntegerField()
    action_ordinal = models.PositiveIntegerField()
    player_number = models.PositiveSmallIntegerField(name="Player#")
    command_data = models.CharField(max_length=200)
      # TODO place:path:action:which:focal:seed:drop:drop:drop:drop
      # TODO Rename to json_data, depending? Json won't be as compact, but it might mean fewer interpretive errors.

    class Meta:
      ordering = ['game_id', 'turn_ordinal', 'action_ordinal']