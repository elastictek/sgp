# Generated by Django 3.2.8 on 2022-01-29 21:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0103_auto_20220129_0957'),
    ]

    operations = [
        migrations.AddField(
            model_name='auditcurrentsettings',
            name='lotes',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='currentsettings',
            name='lotes',
            field=models.JSONField(blank=True, null=True),
        ),
    ]
