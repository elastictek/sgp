# Generated by Django 3.2.8 on 2021-11-22 12:48

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0064_auto_20211122_1233'),
    ]

    operations = [
        migrations.AddField(
            model_name='formulacao',
            name='produto',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.PROTECT, to='producao.produtos', verbose_name='Id Produto'),
            preserve_default=False,
        ),
        migrations.AlterUniqueTogether(
            name='formulacao',
            unique_together={('produto_id', 'designacao')},
        ),
        migrations.RemoveField(
            model_name='formulacao',
            name='artigo_cod',
        ),
    ]
