# Generated by Django 4.0.2 on 2022-04-07 21:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0130_lotesdosers_type_mov'),
    ]

    operations = [
        migrations.RenameField(
            model_name='lotesdosers',
            old_name='qty',
            new_name='qty_lote',
        ),
        migrations.AlterField(
            model_name='lotesdosers',
            name='artigo_cod',
            field=models.CharField(max_length=25, null=True, verbose_name='Código Artigo'),
        ),
        migrations.AlterField(
            model_name='lotesdosers',
            name='n_lote',
            field=models.CharField(max_length=100, null=True, verbose_name='Nº Lote'),
        ),
    ]
