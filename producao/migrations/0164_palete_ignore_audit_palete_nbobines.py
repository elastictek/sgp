# Generated by Django 4.0.2 on 2022-12-27 12:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0163_alter_gamaoperatoria_designacao'),
    ]

    operations = [
        migrations.AddField(
            model_name='palete',
            name='ignore_audit',
            field=models.IntegerField(blank=True, null=True, verbose_name='Ignore Audit'),
        ),
        migrations.AddField(
            model_name='palete',
            name='nbobines',
            field=models.IntegerField(null=True, verbose_name='Bobines total'),
        ),
    ]
