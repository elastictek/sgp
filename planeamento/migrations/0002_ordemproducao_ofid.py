# Generated by Django 3.2.8 on 2021-10-16 12:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planeamento', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='ordemproducao',
            name='ofid',
            field=models.CharField(max_length=25, null=True, verbose_name='Ordem de Produção'),
        ),
    ]
