# Generated by Django 4.0.2 on 2023-07-24 16:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0194_tempaggordemfabrico_formulacao_plan'),
    ]

    operations = [
        migrations.AddField(
            model_name='auditcurrentsettings',
            name='formulacao_plan',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='currentsettings',
            name='formulacao_plan',
            field=models.JSONField(blank=True, null=True),
        ),
    ]
