# Generated by Django 4.0.2 on 2022-08-16 11:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0142_recicladolotes'),
    ]

    operations = [
        migrations.AddField(
            model_name='recicladolotes',
            name='itm',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='recicladolotes',
            name='itm_des',
            field=models.CharField(blank=True, max_length=250, null=True),
        ),
    ]
