# Generated by Django 4.0.2 on 2023-01-26 13:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0173_palete_nbobines_emendas'),
    ]

    operations = [
        migrations.AddField(
            model_name='bobine',
            name='destinos_has_obs',
            field=models.IntegerField(blank=True, null=True, verbose_name='Indica se os destinos têm observações'),
        ),
    ]
