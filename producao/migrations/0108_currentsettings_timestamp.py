# Generated by Django 4.0.2 on 2022-02-08 18:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0107_alter_auditcurrentsettings_amostragem_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='currentsettings',
            name='timestamp',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
