# Generated by Django 4.0.2 on 2022-10-14 09:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('producao', '0153_rename_valid_tsamp_bobinagem_valid_tstamp'),
    ]

    operations = [
        migrations.AddField(
            model_name='auditcurrentsettings',
            name='ignore_audit',
            field=models.IntegerField(null=True, verbose_name='No Log'),
        ),
        migrations.AddField(
            model_name='currentsettings',
            name='ignore_audit',
            field=models.IntegerField(null=True, verbose_name='No Log'),
        ),
    ]