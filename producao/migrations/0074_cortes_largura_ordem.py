# Generated by Django 3.2.8 on 2021-11-28 18:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0073_cortes_largura_json'),
    ]

    operations = [
        migrations.AddField(
            model_name='cortes',
            name='largura_ordem',
            field=models.CharField(default='', max_length=200, verbose_name='Larguras JSON'),
            preserve_default=False,
        ),
    ]
