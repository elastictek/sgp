# Generated by Django 3.2.8 on 2022-01-14 11:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0095_attachments'),
    ]

    operations = [
        migrations.AlterField(
            model_name='attachments',
            name='tipo_doc',
            field=models.CharField(max_length=100, verbose_name='Tipo Documento'),
        ),
    ]
