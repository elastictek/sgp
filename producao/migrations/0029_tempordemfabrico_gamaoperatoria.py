# Generated by Django 3.2.8 on 2021-11-16 15:42

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0028_alter_gamaoperatoria_unique_together'),
    ]

    operations = [
        migrations.AddField(
            model_name='tempordemfabrico',
            name='gamaOperatoria',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='producao.gamaoperatoria', verbose_name='Gama Operatória'),
        ),
    ]
