# Generated by Django 4.0.2 on 2023-01-11 14:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0169_palete_paletizacao_alter_tempaggordemfabrico_year'),
    ]

    operations = [
        migrations.AddField(
            model_name='palete',
            name='destinos',
            field=models.JSONField(blank=True, null=True),
        ),
    ]