# Generated by Django 4.0.2 on 2024-03-04 09:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0220_paletizacaodetails_item_cintas'),
    ]

    operations = [
        migrations.AddField(
            model_name='paletizacao',
            name='artigo_des',
            field=models.CharField(max_length=200, null=True, verbose_name='Designacao Artigo'),
        ),
        migrations.AlterField(
            model_name='paletizacaodetails',
            name='item_cintas',
            field=models.SmallIntegerField(default=0, verbose_name='Item Ordem'),
        ),
    ]
