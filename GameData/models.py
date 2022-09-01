from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.

class BattleMap(models.Model):
    author = models.CharField(max_length=32)

class GameMetadata(models.Model):
    # game_id = models.PositiveBigIntegerField(name="GameId", primary_key=True, auto_created=True)
    created_on = models.DateTimeField(default=timezone.now)
    map_id = models.ForeignKey(BattleMap, on_delete=models.CASCADE)
    game_over = models.BooleanField(default=False)

    class Meta:
      ordering = ['created_on']

class GamePlayerList(models.Model):
      # TODO GameId and Player# together should be a unique combination
    game_id = models.ForeignKey(GameMetadata, on_delete=models.CASCADE)
    player_num = models.PositiveSmallIntegerField(name="Player#")
    player_account = models.ForeignKey(User, on_delete=models.DO_NOTHING)
      # TODO No cascade delete for records purposes, but how do I handle missing persons then?