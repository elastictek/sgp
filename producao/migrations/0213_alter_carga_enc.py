# Generated by Django 4.0.2 on 2023-10-12 07:46

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0212_carga_cliente'),
    ]

    operations = [
        migrations.AlterField(
            model_name='carga',
            name='enc',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='producao.encomenda', verbose_name='Encomenda'),
        ),
    ]