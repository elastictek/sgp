# Generated by Django 3.2.8 on 2021-11-22 15:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0067_tempaggordemfabrico_of_id'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tempaggordemfabrico',
            name='of_id',
        ),
        migrations.AddField(
            model_name='tempordemfabrico',
            name='agg_ofid_original',
            field=models.IntegerField(null=True, verbose_name='Agg Original'),
        ),
    ]
