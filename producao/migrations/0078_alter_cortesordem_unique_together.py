# Generated by Django 3.2.8 on 2021-11-29 15:17

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0077_auto_20211129_1515'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='cortesordem',
            unique_together={('cortes_id', 'ordem_cod')},
        ),
    ]
