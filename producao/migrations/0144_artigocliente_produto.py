# Generated by Django 4.0.2 on 2022-08-19 13:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0143_recicladolotes_itm_recicladolotes_itm_des'),
    ]

    operations = [
        migrations.AddField(
            model_name='artigocliente',
            name='produto',
            field=models.CharField(blank=True, default='', max_length=200, null=True, verbose_name='Produto'),
        ),
    ]
