# Generated by Django 3.2.8 on 2021-11-16 15:50

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0029_tempordemfabrico_gamaoperatoria'),
    ]

    operations = [
        migrations.RenameField(
            model_name='tempordemfabrico',
            old_name='gamaOperatoria',
            new_name='gamaoperatoria',
        ),
    ]
