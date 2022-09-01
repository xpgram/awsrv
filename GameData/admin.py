from django.contrib import admin
from .models import BattleMap, GameMetadata, GamePlayerList, GameAction

# Register your models here.

admin.site.register([BattleMap, GameMetadata, GamePlayerList, GameAction])