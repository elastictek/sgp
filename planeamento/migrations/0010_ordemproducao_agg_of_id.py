# Generated by Django 4.0.2 on 2022-02-23 07:49

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0116_alter_tempaggordemfabrico_horas_previstas_producao'),
        ('planeamento', '0009_auto_20220118_1752'),
    ]

    operations = [
        migrations.AddField(
            model_name='ordemproducao',
            name='agg_of_id',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='producao.tempaggordemfabrico', verbose_name='Ordem de Producao Agg'),
        ),
    ]
