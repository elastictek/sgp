# Generated by Django 3.2.8 on 2022-01-19 18:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0099_tempordemfabrico_status'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tempordemfabrico',
            name='status',
        ),
    ]