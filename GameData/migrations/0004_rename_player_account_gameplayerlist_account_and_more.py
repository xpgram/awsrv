# Generated by Django 4.1 on 2022-09-01 22:41

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('GameData', '0003_alter_gamemetadata_created_on'),
    ]

    operations = [
        migrations.RenameField(
            model_name='gameplayerlist',
            old_name='player_account',
            new_name='account',
        ),
        migrations.CreateModel(
            name='GameAction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('turn_ordinal', models.PositiveIntegerField()),
                ('action_ordinal', models.PositiveIntegerField()),
                ('Player#', models.PositiveSmallIntegerField()),
                ('cmd_data', models.CharField(max_length=200)),
                ('game_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='GameData.gamemetadata')),
            ],
            options={
                'ordering': ['game_id', 'turn_ordinal', 'action_ordinal'],
            },
        ),
    ]
