# Generated by Django 4.0.2 on 2023-11-11 16:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0214_alter_carga_enc'),
    ]

    operations = [
        migrations.AddField(
            model_name='attachments',
            name='tipo_acesso',
            field=models.SmallIntegerField(default=0, verbose_name='Tipo de acesso (0 à OF, 1 ao Agregado)'),
            preserve_default=False,
        ),
    ]
