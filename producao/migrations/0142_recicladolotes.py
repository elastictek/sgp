# Generated by Django 4.0.2 on 2022-08-15 18:14

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('producao', '0141_delete_recicladolotes'),
    ]

    operations = [
        migrations.CreateModel(
            name='RecicladoLotes',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(verbose_name='Created')),
                ('lote', models.CharField(max_length=50, unique=True)),
                ('source', models.CharField(max_length=15)),
                ('qtd', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Quantidade')),
                ('unit', models.CharField(max_length=4, verbose_name='Unidade Medida')),
                ('reciclado', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='producao.reciclado', verbose_name='Reciclado')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL, verbose_name='Username')),
            ],
        ),
    ]
