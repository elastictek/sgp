# Generated by Django 4.0.2 on 2023-02-03 15:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0178_bobine_troca_etiqueta'),
    ]

    operations = [
        migrations.AddField(
            model_name='bobine',
            name='timestamp',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]