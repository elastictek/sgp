# Generated by Django 4.0.2 on 2022-04-07 11:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0128_remove_lotesdosers_update_t_stamp_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='lotesdosers',
            name='ig_bobinagem_id',
            field=models.IntegerField(null=True, verbose_name='Id IG BOBINAGEM'),
        ),
    ]