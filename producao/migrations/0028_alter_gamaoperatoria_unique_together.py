# Generated by Django 3.2.8 on 2021-11-16 15:30

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0027_auto_20211116_1527'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='gamaoperatoria',
            unique_together={('artigo_cod', 'designacao')},
        ),
    ]
