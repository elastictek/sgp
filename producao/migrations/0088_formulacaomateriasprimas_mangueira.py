# Generated by Django 3.2.8 on 2021-12-21 14:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0087_palete_draft_ordem'),
    ]

    operations = [
        migrations.AddField(
            model_name='formulacaomateriasprimas',
            name='mangueira',
            field=models.CharField(max_length=2, null=True, verbose_name='Mangueira'),
        ),
    ]
