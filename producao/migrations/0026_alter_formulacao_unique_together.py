# Generated by Django 3.2.8 on 2021-11-16 15:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0025_alter_formulacao_unique_together'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='formulacao',
            unique_together={('artigo_cod', 'designacao')},
        ),
    ]
