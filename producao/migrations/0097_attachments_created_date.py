# Generated by Django 3.2.8 on 2022-01-14 11:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0096_alter_attachments_tipo_doc'),
    ]

    operations = [
        migrations.AddField(
            model_name='attachments',
            name='created_date',
            field=models.DateTimeField(auto_now=True, verbose_name='Data Criação'),
        ),
    ]
