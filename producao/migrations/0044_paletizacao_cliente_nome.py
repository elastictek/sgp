# Generated by Django 3.2.8 on 2021-11-18 11:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0043_alter_tempordemfabrico_unique_together'),
    ]

    operations = [
        migrations.AddField(
            model_name='paletizacao',
            name='cliente_nome',
            field=models.CharField(max_length=80, null=True, verbose_name='Nome Cliente'),
        ),
    ]
