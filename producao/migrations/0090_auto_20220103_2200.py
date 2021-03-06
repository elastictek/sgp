# Generated by Django 3.2.8 on 2022-01-03 22:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0089_auto_20220103_1707'),
    ]

    operations = [
        migrations.AddField(
            model_name='tempaggordemfabrico',
            name='amostragem',
            field=models.IntegerField(max_length=2, null=True, verbose_name='Amostragem'),
        ),
        migrations.AddField(
            model_name='tempaggordemfabrico',
            name='observacoes',
            field=models.TextField(blank=True, default='', max_length=1000, null=True, verbose_name='Observações'),
        ),
        migrations.AddField(
            model_name='tempaggordemfabrico',
            name='sentido_enrolamento',
            field=models.CharField(max_length=100, null=True, verbose_name='Sentido de Enrolamento'),
        ),
    ]
