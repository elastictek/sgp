# Generated by Django 4.0.2 on 2024-02-04 09:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0218_cortesordem_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='bobine',
            name='mpalete',
            field=models.BooleanField(blank=True, default=False, null=True, verbose_name='Marcas Palete'),
        ),
        migrations.AddField(
            model_name='bobine',
            name='rasgo',
            field=models.BooleanField(blank=True, default=False, null=True, verbose_name='Rasgo'),
        ),
    ]