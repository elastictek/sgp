# Generated by Django 4.0.2 on 2022-12-13 18:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0161_bobine_ignore_audit'),
    ]

    operations = [
        migrations.AlterField(
            model_name='formulacao',
            name='designacao',
            field=models.CharField(max_length=80, null=True, verbose_name='Designação'),
        ),
    ]