# Generated by Django 3.2.8 on 2021-11-22 10:41

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0056_auto_20211122_0930'),
    ]

    operations = [
        migrations.AddField(
            model_name='artigo',
            name='produto_id',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='producao.produtos', verbose_name='Id Produto'),
        ),
    ]
