# Generated by Django 4.0.2 on 2022-12-28 16:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0166_remove_palete_nbobines'),
    ]

    operations = [
        migrations.AddField(
            model_name='palete',
            name='disabled',
            field=models.BooleanField(default=False, verbose_name='Indica se a Palete existe!'),
        ),
    ]