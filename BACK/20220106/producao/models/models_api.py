from django.db import models
import datetime
import time
from django.conf import settings
from django.db.models.fields import CharField
from django.shortcuts import render, get_object_or_404, redirect
from django.db import models
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from datetime import timedelta
from time import gmtime, strftime
from django.db.models import Max
from django.contrib.auth.models import User
from decimal import *

#NEW MODELS
class OrdemFabricoDetails(models.Model):
    rowid = models.BigIntegerField(verbose_name="SAGE ROWID Ordem Fabrico", unique=True)
    cod = models.CharField(verbose_name="SAGE MFGNUM_0 Número Ordem Fabrico", max_length=25, unique=True)

    def __str__(self):
         return self.cod

class ArtigoDetails(models.Model):
    rowid = models.BigIntegerField(verbose_name="SAGE ROWID Artigo", unique=True)
    cod = models.CharField(verbose_name="SAGE ITMREF_0 Código Artigo", max_length=25, unique=True)

    def __str__(self):
         return self.cod

class EncomendaDetails(models.Model):
    rowid = models.BigIntegerField(verbose_name="SAGE ROWID Encomenda", unique=True)
    cod = models.CharField(verbose_name="SAGE SOHNUM_0 Encomenda", max_length=25, unique=True)

    def __str__(self):
         return self.cod

# class ArtigoDetails(models.Model):                                                                                                                                                     
#     cod = models.CharField(verbose_name="Cód. Artigo", max_length=18, unique=True)
#     nw1 = models.CharField(verbose_name="NW1", max_length=10, null=True, blank=True)
#     formu = models.CharField(verbose_name="Formulação", max_length=10, null=True, blank=True)
#     nw2 = models.CharField(verbose_name="NW2", max_length=10, null=True, blank=True)
#     lar = models.DecimalField(verbose_name="Largura", max_digits=10, decimal_places=2, null=True, blank=True)
#     diam_ref = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Diametro de referência", null=True, blank=True)
#     core = models.CharField(verbose_name="Core", max_length=1, null=True, blank=True)
#     gsm = models.CharField(max_length=10, null=True, blank=True, verbose_name="Gramagem")
#     gtin = models.CharField(verbose_name="GTIN", max_length=14, unique=True, null=True)
#     class Meta:
#         verbose_name_plural = "Artigos"
#         ordering = ['cod']
#     def __str__(self):
#         return self.cod

#END NEW MODELS