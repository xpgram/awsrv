# Generated by Django 4.1 on 2022-09-01 22:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('GameData', '0004_rename_player_account_gameplayerlist_account_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='gamemetadata',
            name='fog_of_war',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='gamemetadata',
            name='starting_funds',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='gameplayerlist',
            name='co_id',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
