# Generated by Django 4.0.2 on 2022-04-06 17:11

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0126_lotesdosers_cs'),
    ]

    operations = [
        migrations.AddField(
            model_name='lotesdosers',
            name='update_t_stamp',
            field=models.DateTimeField(default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]