# awdb/gamedata/urls.py

# from django.conf.urls import url
from django.urls import path, include

from .views import (
  GameMetadataApiView,
)

urlpatterns = [
  path('g', GameMetadataApiView.as_view()),
]