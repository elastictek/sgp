# Generated by Django 3.2.8 on 2022-02-04 10:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0105_auto_20220204_1007'),
    ]

    operations = [
        migrations.AddField(
            model_name='auditcurrentsettings',
            name='dosers',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='currentsettings',
            name='dosers',
            field=models.JSONField(blank=True, null=True),
        ),
    ]
