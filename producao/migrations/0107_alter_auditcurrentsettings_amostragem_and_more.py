# Generated by Django 4.0.2 on 2022-02-05 15:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0106_auto_20220204_1042'),
    ]

    operations = [
        migrations.AlterField(
            model_name='auditcurrentsettings',
            name='amostragem',
            field=models.IntegerField(null=True, verbose_name='Amostragem'),
        ),
        migrations.AlterField(
            model_name='auditcurrentsettings',
            name='gsm',
            field=models.IntegerField(null=True, verbose_name='Gramagem'),
        ),
        migrations.AlterField(
            model_name='currentsettings',
            name='amostragem',
            field=models.IntegerField(null=True, verbose_name='Amostragem'),
        ),
        migrations.AlterField(
            model_name='currentsettings',
            name='gsm',
            field=models.IntegerField(null=True, verbose_name='Gramagem'),
        ),
        migrations.AlterField(
            model_name='emendas',
            name='emendas_rolo',
            field=models.SmallIntegerField(verbose_name='Emendas por Rolo'),
        ),
        migrations.AlterField(
            model_name='emendas',
            name='maximo',
            field=models.SmallIntegerField(default=0, verbose_name='Máximo Emendas'),
        ),
        migrations.AlterField(
            model_name='emendas',
            name='paletes_contentor',
            field=models.SmallIntegerField(verbose_name='Emendas Paletes por Contentor'),
        ),
        migrations.AlterField(
            model_name='tempaggordemfabrico',
            name='amostragem',
            field=models.IntegerField(null=True, verbose_name='Amostragem'),
        ),
    ]
