# Generated by Django 4.0.2 on 2024-01-30 07:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0217_emenda_t_stamp_alter_artigo_produto_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='cortesordem',
            name='status',
            field=models.SmallIntegerField(default=1, verbose_name='Estado'),
        ),
    ]