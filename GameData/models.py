from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Constants
# ...

# Create your models here.

class BattleMap(models.Model):
    author_account = models.ForeignKey(User, on_delete=models.DO_NOTHING, blank=True, null=True)
    in_standard_map_library = models.BooleanField()
    map_name = models.CharField(max_length=64)

    # TODO The model supports descriptions of user maps.
    # Right now it's by-ref only, which means built-in only.
    # I need a Db model for user maps that can stretch in block size to describe all map features.
    # Including all of the json at once would be swell, but I don't know how to do that since they
    # can vary in size quite a bit. Can I just not set max_length?

    # TODO If ever updated, any Game objects which reference this id must be deleted, or at least marked hidden or something.
    # Move history linked to a GameMetadata referencing this map is immediately broken, unless the link was
    # only corrected to link to the same map.

    def __str__(self):
        prepend = "std" if self.in_standard_map_library else f"{self.author_account}" if self.author_account != None else "[NullUser]"
        return f"{prepend}: {self.map_name}"


class GameMetadata(models.Model):
    created_on = models.DateTimeField(default=timezone.now)
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, blank=True, null=True, default=None)
    map_id = models.ForeignKey(BattleMap, on_delete=models.CASCADE)

    # global game data
    game_over = models.BooleanField(default=False)
    winning_player_num = models.PositiveSmallIntegerField(blank=True, null=True, default=None)
      # if game_over && winning==None, the game was a draw

    # scenario data — I don't want this serialized 'cause I want admin options
      # this would mean I have to update scenario data in two places to add new options, though
    fog_of_war = models.BooleanField(default=False)
    starting_funds = models.PositiveIntegerField(default=0)
      # ...

    # TODO Does this actually do anything?
    readonly_fields = ['created_on', 'map_id']

    class Meta:
      ordering = ['created_on']

    def __str__(self):
        username = self.created_by if self.created_by != None else "[NullUser]"
        return f"""{self.id}: "{self.map_id}" by {username}"""
      

class GamePlayerList(models.Model):
    game_id = models.ForeignKey(GameMetadata, on_delete=models.CASCADE)
    player_num = models.PositiveSmallIntegerField()

    account = models.ForeignKey(User, on_delete=models.DO_NOTHING, blank=True, null=True)

    # player-specific data for this game (CO, Handicaps, etc.)
    co_id = models.PositiveIntegerField(default=0)  # TODO non-number CO reference

    # TODO Does this do anything?
    readonly_fields = ['game_id', 'player_num']

    class Meta:
        constraints = [
          models.UniqueConstraint(fields=['game_id','player_num'], name='PlayerId')
        ]

    def __str__(self):
        return f"{self.game_id.id}: p{self.player_num} {self.account}"


class GameAction(models.Model):
    game_id = models.ForeignKey(GameMetadata, on_delete=models.CASCADE)
    turn_ordinal = models.PositiveIntegerField()
    action_ordinal = models.PositiveIntegerField()

    player_num = models.PositiveSmallIntegerField()
    command_data = models.CharField(max_length=200)
      # TODO place:path:action:which:focal:seed:drop:drop:drop:drop
      # TODO Rename to json_data, depending? Json won't be as compact, but it might mean fewer interpretive errors.

    # TODO Does this do anything?
    readonly_fields = ['game_id', 'turn_ordinal', 'action_ordinal', 'player_num', 'command_data']

    class Meta:
      ordering = ['game_id', 'turn_ordinal', 'action_ordinal']
      constraints = [
        models.UniqueConstraint(fields=['game_id', 'turn_ordinal', 'action_ordinal'], name='Ordinal')
      ]

    def __str__(self):
        return f"{self.game_id.id}: {self.turn_ordinal}-{self.action_ordinal}"