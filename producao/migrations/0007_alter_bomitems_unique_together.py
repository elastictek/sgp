# Generated by Django 3.2.8 on 2021-10-22 13:52

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0006_bomitems'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='bomitems',
            unique_together={('artigo_cod', 'bom_alt', 'matprima_cod')},
        ),
    ]
