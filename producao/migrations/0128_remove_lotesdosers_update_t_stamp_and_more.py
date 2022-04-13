# Generated by Django 4.0.2 on 2022-04-07 09:30

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0127_lotesdosers_update_t_stamp'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='lotesdosers',
            name='update_t_stamp',
        ),
        migrations.AddField(
            model_name='lotesdosers',
            name='qty_acum',
            field=models.DecimalField(decimal_places=5, default=0, max_digits=12, verbose_name='Quantidade Acumulada Anterior )'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='lotesdosers',
            name='qty_manual',
            field=models.DecimalField(decimal_places=5, default=0, max_digits=12, verbose_name='Quantidade atual (igual à qty cons, ou seja, consumida durante produção, é este o valor a ter em consideração, no entanto este valor pode ser ajustado manualmente )'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='lotesdosers',
            name='audit_cs',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='producao.auditcurrentsettings', verbose_name='Audit Current Settings'),
        ),
        migrations.AlterField(
            model_name='lotesdosers',
            name='cs',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='producao.currentsettings', verbose_name='Current Settings'),
        ),
        migrations.AlterField(
            model_name='lotesdosers',
            name='formulacao',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='producao.formulacao', verbose_name='Formulação'),
        ),
        migrations.AlterField(
            model_name='lotesdosers',
            name='qty_cons',
            field=models.DecimalField(decimal_places=5, max_digits=12, verbose_name='Quantidade consumida (consumida durante a produção)'),
        ),
    ]
