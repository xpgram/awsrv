# awdb/gamedata/urls.py

# from django.conf.urls import url
from django.urls import path, include

from .views import (
  GameMetadataApiView,
  GameMetadataDetailApiView,
)

urlpatterns = [
  path('g/', GameMetadataApiView.as_view()),
  path('g/<int:game_id>/', GameMetadataDetailApiView.as_view()),
]