# Generated by Django 3.2.8 on 2021-12-09 15:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0083_auto_20211209_1212'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tempordemfabrico',
            name='n_paletes',
            field=models.CharField(max_length=5000, null=True, verbose_name='N Paletes'),
        ),
    ]
