from django.contrib import admin
from .models import BattleMap, GameMetadata, GamePlayerList

# Register your models here.

admin.site.register([BattleMap, GameMetadata, GamePlayerList])