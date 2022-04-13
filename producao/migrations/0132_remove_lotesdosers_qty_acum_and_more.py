# Generated by Django 4.0.2 on 2022-04-07 21:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0131_rename_qty_lotesdosers_qty_lote_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='lotesdosers',
            name='qty_acum',
        ),
        migrations.RemoveField(
            model_name='lotesdosers',
            name='qty_cons',
        ),
        migrations.RemoveField(
            model_name='lotesdosers',
            name='qty_manual',
        ),
        migrations.AddField(
            model_name='lotesdosers',
            name='qty_acumulated',
            field=models.DecimalField(decimal_places=5, default=0, max_digits=12, null=True, verbose_name='Quantidade Acumulada'),
        ),
        migrations.AddField(
            model_name='lotesdosers',
            name='qty_consumed',
            field=models.DecimalField(decimal_places=5, default=0, max_digits=12, null=True, verbose_name='Quantidade consumida (consumida durante a produção)'),
        ),
        migrations.AddField(
            model_name='lotesdosers',
            name='qty_doser',
            field=models.DecimalField(decimal_places=5, default=0, max_digits=12, null=True, verbose_name='Quantidade consumida no doseador (consumida durante a produção)'),
        ),
        migrations.AddField(
            model_name='lotesdosers',
            name='qty_rest',
            field=models.DecimalField(decimal_places=5, default=0, max_digits=12, null=True, verbose_name='Quantidade Acumulada Anterior )'),
        ),
        migrations.AlterField(
            model_name='lotesdosers',
            name='qty_lote',
            field=models.DecimalField(decimal_places=5, default=0, max_digits=12, null=True, verbose_name='Quantidade Total do Lote'),
        ),
    ]
