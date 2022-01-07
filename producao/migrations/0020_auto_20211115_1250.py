# Generated by Django 3.2.8 on 2021-11-15 12:50

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0019_formulacao_versao'),
    ]

    operations = [
        migrations.CreateModel(
            name='GamaOperatoria',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('designacao', models.CharField(max_length=50, null=True, verbose_name='Designação')),
                ('versao', models.SmallIntegerField(default=1, verbose_name='Versão')),
                ('artigo_cod', models.CharField(max_length=25, verbose_name='SAGE ITMREF_0 Código Produto Acabado')),
                ('created_date', models.DateTimeField(auto_now=True, verbose_name='Data Criação')),
                ('updated_date', models.DateTimeField(auto_now=True, verbose_name='Data Alteração')),
            ],
        ),
        migrations.CreateModel(
            name='GamasOperatoriasItems',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('item_des', models.CharField(max_length=100, null=True, verbose_name='Designação do Item')),
                ('item_values', models.CharField(max_length=100, null=True, verbose_name='Valores do Item')),
                ('tolerancia', models.DecimalField(decimal_places=1, default=10, max_digits=4, verbose_name='Tolerância')),
                ('gamaoperatoria', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='producao.gamaoperatoria', verbose_name='Gama Operatória')),
            ],
        ),
        migrations.DeleteModel(
            name='FormulacaoParametros',
        ),
    ]
