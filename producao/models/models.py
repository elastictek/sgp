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


class Turno(models.Model):
    TURNO = (('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D'), ('E', 'E'))
    DEP = (('Produção', 'Produção'), ('Logistica', 'Logistica'), ('Qualidade', 'Qualidade'))
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    dep = models.CharField(max_length=50, blank=True, choices=DEP)
    turno = models.CharField(max_length=1, blank=True, choices=TURNO)

    def __str__(self):
        return '%s: %s - Turno %s' % (self.user.username, self.dep, self.turno)


class PerfilEmbalamento(models.Model):
    des = models.CharField(max_length=200, unique=True, null=True, blank=True, verbose_name="Designação")
    cartao = models.BooleanField(default=False, verbose_name="Cartão")
    filme = models.BooleanField(default=False, verbose_name="Filme")
    plastico = models.BooleanField(default=False, verbose_name="Plástico")
    mdf = models.BooleanField(default=False, verbose_name="MDF")
    peso = models.DecimalField(max_digits=3, decimal_places=2, verbose_name="Peso total")

    def __str__(self):
        return '%s' % (self.des)

class CoreLargura(models.Model):
    CORE = (('3', '3'), ('6', '6'))
    core = models.CharField(verbose_name="Core", max_length=1, choices=CORE)
    largura = models.DecimalField(max_digits=6, decimal_places=0, null=True, blank=True)
    peso = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Peso em Kg")

    def __str__(self):
        return '%s - %s' % (self.core, self.largura)

class PaleteEmb(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    updated = models.DateTimeField(auto_now=True, verbose_name="Updated at")
    created = models.DateTimeField(auto_now_add=True, verbose_name="Created at")
    cod = models.CharField(max_length=200, verbose_name="Cód. Palete de embalamento")
    des = models.CharField(max_length=200, verbose_name="Descrição Palete de Embalamento")

    def __str__(self):
        return '%s - %s' % (self.cod, self.des)

class Filme(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    updated = models.DateTimeField(auto_now=True, verbose_name="Updated at")
    created = models.DateTimeField(auto_now_add=True, verbose_name="Created at")
    cod = models.CharField(max_length=200, verbose_name="Cód. Filme")
    des = models.CharField(max_length=200,verbose_name="Descrição Filme")

    def __str__(self):
        return '%s - %s' % (self.cod, self.des)

class Cinta(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    updated = models.DateTimeField(auto_now=True, verbose_name="Updated at")
    created = models.DateTimeField(auto_now_add=True, verbose_name="Created at")
    cod = models.CharField(max_length=200, verbose_name="Cód. Cinta")
    des = models.CharField(max_length=200,verbose_name="Descrição Cinta")

    def __str__(self):
        return '%s - %s' % (self.cod, self.des)

class Mdf(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    updated = models.DateTimeField(auto_now=True, verbose_name="Updated at")
    created = models.DateTimeField(auto_now_add=True, verbose_name="Created at")
    cod = models.CharField(max_length=200, verbose_name="Cód. MDF")
    des = models.CharField(max_length=200,verbose_name="Descrição MDF")

    def __str__(self):
        return '%s - %s' % (self.cod, self.des)

class Cartao(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    updated = models.DateTimeField(auto_now=True, verbose_name="Updated at")
    created = models.DateTimeField(auto_now_add=True, verbose_name="Created at")
    cod = models.CharField(max_length=200, verbose_name="Cód. Cartão")
    des = models.CharField(max_length=200,verbose_name="Descrição Cartão")

    def __str__(self):
        return '%s - %s' % (self.cod, self.des)

class Core(models.Model):
    CORE = (('3', '3'), ('6', '6'))
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    updated = models.DateTimeField(auto_now=True, verbose_name="Updated at")
    created = models.DateTimeField(auto_now_add=True, verbose_name="Created at")
    cod = models.CharField(max_length=200, verbose_name="Cód. Core")
    des = models.CharField(max_length=200, verbose_name="Descrição Core")
    core = models.CharField(verbose_name="Core", max_length=1, choices=CORE)

    def __str__(self):
        return '%s - %s - %s' % (self.cod, self.des, self.core)

class Etiqueta(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    updated = models.DateTimeField(auto_now=True, verbose_name="Updated at")
    created = models.DateTimeField(auto_now_add=True, verbose_name="Created at")
    cod = models.CharField(max_length=200, verbose_name="Cód. Etiqueta")
    des = models.CharField(max_length=200,verbose_name="Descrição Etiqueta")

    def __str__(self):
        return '%s - %s' % (self.cod, self.des)

class TipoEmenda(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    updated = models.DateTimeField(auto_now=True, verbose_name="Updated at")
    created = models.DateTimeField(auto_now_add=True, verbose_name="Created at")
    des = models.TextField(verbose_name="Tipo Emenda")
    preta = models.BooleanField(default=False)
    metalica = models.BooleanField(default=False)

    def __str__(self):
        return '%s' % (self.des)
    
    
class Embalamento(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    updated = models.DateTimeField(auto_now=True, verbose_name="Updated at")
    created = models.DateTimeField(auto_now_add=True, verbose_name="Created at")
    paletemb = models.ForeignKey(PaleteEmb, on_delete=models.PROTECT, verbose_name="Palete embalamento")
    filme = models.ForeignKey(Filme, on_delete=models.PROTECT, verbose_name="Filme")
    cinta = models.ForeignKey(Cinta, on_delete=models.PROTECT, verbose_name="Cinta", null=True, blank=True)
    core = models.ForeignKey(Core, on_delete=models.PROTECT, verbose_name="Core")
    mdf = models.ForeignKey(Mdf, on_delete=models.PROTECT, verbose_name="MDF", null=True, blank=True)
    cartao = models.ForeignKey(Cartao, on_delete=models.PROTECT, verbose_name="Cartao", null=True, blank=True)
    qtd_cartao = models.DecimalField(max_digits=2, decimal_places=1, null=True, blank=True)
    qtd_mdf = models.DecimalField(max_digits=2, decimal_places=1, null=True, blank=True)

        
class EtiquetaEmbalamento(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    updated = models.DateTimeField(auto_now=True, verbose_name="Updated at")
    created = models.DateTimeField(auto_now_add=True, verbose_name="Created at")
    etiqueta = models.ForeignKey(Etiqueta, on_delete=models.PROTECT, verbose_name="Etiqueta")
    embalamento = models.ForeignKey(Embalamento, on_delete=models.PROTECT, verbose_name="Username")
    qtd = models.PositiveIntegerField()

class Transporte(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    updated = models.DateTimeField(auto_now=True, verbose_name="Updated at")
    created = models.DateTimeField(auto_now_add=True, verbose_name="Created at")
    tipo = models.CharField(max_length=200)

    def __str__(self):
        return self.tipo


class Perfil(models.Model):
    CORE = (('3', '3'), ('6', '6'))
    GSM = (('105', '105 gsm'), ('100', '100 gsm'), ('95', '95 gsm'), ('90', '90 gsm'), ('75', '75 gsm'), ('80', '80 gsm'),
           ('60', '60 gsm'), ('57', '57 gsm'), ('50', '50 gsm'), ('48', '48 gsm'), ('45', '45 gsm'), ('25', '25 gsm'))
    PRODUTO = (
                ('NONWOVEN ELASTIC BANDS ELA-ACE 100 HE', 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HE'),
                ('STRETCHABLE NONWOVEN ELASTIC BANDS ELA-ACE 100 HE', 'STRETCHABLE NONWOVEN ELASTIC BANDS ELA-ACE 100 HE'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 90 HE', 'NONWOVEN ELASTIC BANDS ELA-ACE 90 HE'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 90 T-HT', 'NONWOVEN ELASTIC BANDS ELA-ACE 90 T-HT'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 100 HT', 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HT'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 95 HT', 'NONWOVEN ELASTIC BANDS ELA-ACE 95 HT'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 95 HE', 'NONWOVEN ELASTIC BANDS ELA-ACE 95 HE'),
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 90 HE HL', 'NONWOVEN ELASTIC BANDS ELA-SPUN 90 HE HL'),
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 95 HE HL', 'NONWOVEN ELASTIC BANDS ELA-SPUN 95 HE HL'),
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 90 HT HL', 'NONWOVEN ELASTIC BANDS ELA-SPUN 90 HT HL'),
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 95 HE HL', 'NONWOVEN ELASTIC BANDS ELA-SPUN 95 HE HL'),
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 100 HE HL', 'NONWOVEN ELASTIC BANDS ELA-SPUN 100 HE HL'),
                ('SIDE PANEL ELA-ACE 100 HE', 'SIDE PANEL ELA-ACE 100 HE'),
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 100 HE BICO', 'NONWOVEN ELASTIC BANDS ELA-SPUN 100 HE BICO'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 105 HE', 'NONWOVEN ELASTIC BANDS ELA-ACE 105 HE'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 100 HE(D)', 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HE(D)'),
                ('FRONTAL TAPE 48', 'FRONTAL TAPE 48'),
                ('CAR PROTECTION SHEET 57', 'CAR PROTECTION SHEET 57'),
                ('ELASTIC FILM', 'ELASTIC FILM'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 100 HE(L)', 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HE(L)'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 75 HE', 'NONWOVEN ELASTIC BANDS ELA-ACE 75 HE'),
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 60 HE', 'NONWOVEN ELASTIC BANDS ELA-SPUN 60 HE'),
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 60 HT', 'NONWOVEN ELASTIC BANDS ELA-SPUN 60 HT'),
                ('NONWOVEN TEXTILE BACKSHEET ELA-TBS 50 23B', 'NONWOVEN TEXTILE BACKSHEET ELA-TBS 50 23B'),
                ('NONWOVEN TEXTILE BACKSHEET ELA-TBS 50 23A', 'NONWOVEN TEXTILE BACKSHEET ELA-TBS 50 23A'),
                ('NONWOVEN TEXTILE BACKSHEET ELA-TBS 45 16B', 'NONWOVEN TEXTILE BACKSHEET ELA-TBS 45 16B'),
                ('NONWOVEN TEXTILE BACKSHEET ELA-TBS 45 16A', 'NONWOVEN TEXTILE BACKSHEET ELA-TBS 45 16A'),
                ('NONWOVEN ELASTIC BAND ELA-CARDED AMOSTRA', 'NONWOVEN ELASTIC BAND ELA-CARDED AMOSTRA'),
                ('NONWOVEN ELASTIC BAND ELA-CARDED 100', 'NONWOVEN ELASTIC BAND ELA-CARDED 100'),
                ('NONWOVEN ELASTIC BAND ELA-CARDED 100 HE', 'NONWOVEN ELASTIC BAND ELA-CARDED 100 HE'),
                ('NONWOVEN ELASTIC BAND ELA-SPUN 75 HT', 'NONWOVEN ELASTIC BAND ELA-SPUN 75 HT'),
                ('NONWOVEN ELASTIC BAND 100 HE NON WOVEN STRETCH EAR', 'NONWOVEN ELASTIC BAND 100 HE NON WOVEN STRETCH EAR'),
                ('NONWOVEN ELASTIC BAND ELA-ACE 100 T-HT', 'NONWOVEN ELASTIC BAND ELA-ACE 100 T-HT'),
                ('NONWOVEN ELASTIC BAND ELA-ACE 100 T-HE', 'NONWOVEN ELASTIC BAND ELA-ACE 100 T-HE'),
                ('NONWOVEN ELASTIC BAND ELA-ACE 100 HE(L) PUNCTURED', 'NONWOVEN ELASTIC BAND ELA-ACE 100 HE(L) PUNCTURED'),
                ('NONWOVEN ELASTIC BAND ELA-ACE 95 T-HE', 'NONWOVEN ELASTIC BAND ELA-ACE 95 T-HE'),
                ('NONWOVEN ELASTIC BAND ELA-CARDED 80', 'NONWOVEN ELASTIC BAND ELA-CARDED 80'),
                ('NW Elastic Bands ELA-ACE 100 HE (L) PUNCTURED Amostra', 'NW Elastic Bands ELA-ACE 100 HE (L) PUNCTURED Amostra'),
                ('Nonwoven Elastic Bands ELA-CARDED 80 HE','Nonwoven Elastic Bands ELA-CARDED 80 HE'),
                ('Nonwoven Elastic Bands ELA-CARDED 90 HE','Nonwoven Elastic Bands ELA-CARDED 90 HE'),
                ('Nonwoven Elastic Bands ELA-CARDED 80 HT','Nonwoven Elastic Bands ELA-CARDED 80 HT'),
                ('Nonwoven Elastic Bands ELA-CARDED 90 HT','Nonwoven Elastic Bands ELA-CARDED 90 HT')
        )
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    timestamp = models.DateTimeField(auto_now_add=True)
    nome = models.CharField(verbose_name="Perfil", max_length=200, unique=True, null=True, blank=True)
    produto = models.CharField(verbose_name="Produto", max_length=100, default="", choices=PRODUTO)
    retrabalho = models.BooleanField(default=False, verbose_name="Retrabalho")
    num_bobines = models.PositiveIntegerField(verbose_name="Número de bobines")
    largura_bobinagem = models.DecimalField(verbose_name="Largura da bobinagem", max_digits=10, decimal_places=0, null=True, blank=True)
    core = models.CharField(verbose_name="Core", max_length=1, choices=CORE)
    gramagem = models.CharField(verbose_name="Gramagem", max_length=10, null=True, blank=True, choices=GSM)
    espessura = models.DecimalField(verbose_name="Espessura", max_digits=10, decimal_places=2, null=True, blank=True)
    densidade_mp = models.DecimalField(verbose_name="Densidade da matéria prima", max_digits=10, decimal_places=2, null=True, blank=True)
    velocidade = models.DecimalField(verbose_name="Velocidade", max_digits=10, decimal_places=2, null=True, blank=True)
    producao = models.DecimalField(verbose_name="Produção", max_digits=10, decimal_places=2, null=True, blank=True)
    obsoleto = models.BooleanField(default=False, verbose_name="Obsoleto")
    token = models.CharField(verbose_name="Token", max_length=255, unique=True, null=True, blank=True)
    core_original = models.CharField(verbose_name="Core", max_length=1, null=True, blank=True, choices=CORE)
    largura_original = models.DecimalField(verbose_name="Largura da bobinagem", max_digits=10, decimal_places=0, null=True, blank=True)

    class Meta:
        verbose_name_plural = "Perfis"
        ordering = ['-timestamp']

    def __str__(self):
        larguras = Largura.objects.filter(perfil=self)
        nome = self.nome
        try:
            if self.retrabalho == True:
                for lar in larguras:
                    nome += ' - ' + lar.cliente.abv
                return '%s' % nome
            else:
                return '%s' % (self.nome)
        except:
            return '%s' % (self.nome)

    def get_absolute_url(self):
        return f"{self.id}"


class Artigo(models.Model):
    GSM = (('105', '105 gsm'), ('100', '100 gsm'), ('95', '95 gsm'), ('90', '90 gsm'), ('80', '80 gsm'), ('60', '60 gsm'), ('75', '75 gsm'), ('57', '57 gsm'), ('50', '50 gsm'), ('48', '48 gsm'), ('45', '45 gsm'), ('25', '25 gsm'))
    CORE = (('3', '3'), ('6', '6'))
    FORMU = (('HE', 'HE'), ('HT', 'HT'),('NA', 'NA'))
    PRODUTO = (
                ('NONWOVEN ELASTIC BANDS ELA-ACE 100 HE', 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HE'),
                ('STRETCHABLE NONWOVEN ELASTIC BANDS ELA-ACE 100 HE', 'STRETCHABLE NONWOVEN ELASTIC BANDS ELA-ACE 100 HE'), 
                ('NONWOVEN ELASTIC BANDS ELA-ACE 90 HE', 'NONWOVEN ELASTIC BANDS ELA-ACE 90 HE'), 
                ('NONWOVEN ELASTIC BANDS ELA-ACE 90 T-HT', 'NONWOVEN ELASTIC BANDS ELA-ACE 90 T-HT'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 100 HT', 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HT'), 
                ('NONWOVEN ELASTIC BANDS ELA-ACE 95 HT', 'NONWOVEN ELASTIC BANDS ELA-ACE 95 HT'), 
                ('NONWOVEN ELASTIC BANDS ELA-ACE 95 HE', 'NONWOVEN ELASTIC BANDS ELA-ACE 95 HE'), 
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 90 HE HL', 'NONWOVEN ELASTIC BANDS ELA-SPUN 90 HE HL'), 
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 95 HE HL', 'NONWOVEN ELASTIC BANDS ELA-SPUN 95 HE HL'), 
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 90 HT HL', 'NONWOVEN ELASTIC BANDS ELA-SPUN 90 HT HL'), 
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 95 HE HL', 'NONWOVEN ELASTIC BANDS ELA-SPUN 95 HE HL'), 
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 100 HE HL', 'NONWOVEN ELASTIC BANDS ELA-SPUN 100 HE HL'), 
                ('SIDE PANEL ELA-ACE 100 HE', 'SIDE PANEL ELA-ACE 100 HE'), 
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 100 HE BICO', 'NONWOVEN ELASTIC BANDS ELA-SPUN 100 HE BICO'), 
                ('NONWOVEN ELASTIC BANDS ELA-ACE 105 HE',  'NONWOVEN ELASTIC BANDS ELA-ACE 105 HE'), 
                ('NONWOVEN ELASTIC BANDS ELA-ACE 100 HE(D)', 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HE(D)'), 
                ('FRONTAL TAPE 48', 'FRONTAL TAPE 48'), ('CAR PROTECTION SHEET 57', 'CAR PROTECTION SHEET 57'), 
                ('ELASTIC FILM', 'ELASTIC FILM'), ('NONWOVEN ELASTIC BANDS ELA-ACE 100 HE(L)', 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HE(L)'), 
                ('NONWOVEN ELASTIC BANDS ELA-ACE 75 HE', 'NONWOVEN ELASTIC BANDS ELA-ACE 75 HE'), 
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 60 HE', 'NONWOVEN ELASTIC BANDS ELA-SPUN 60 HE'), 
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 60 HT', 'NONWOVEN ELASTIC BANDS ELA-SPUN 60 HT'), 
                ('NONWOVEN TEXTILE BACKSHEET ELA-TBS 50 23B', 'NONWOVEN TEXTILE BACKSHEET ELA-TBS 50 23B'), 
                ('NONWOVEN TEXTILE BACKSHEET ELA-TBS 50 23A', 'NONWOVEN TEXTILE BACKSHEET ELA-TBS 50 23A'), 
                ('NONWOVEN TEXTILE BACKSHEET ELA-TBS 45 16B', 'NONWOVEN TEXTILE BACKSHEET ELA-TBS 45 16B'), 
                ('NONWOVEN TEXTILE BACKSHEET ELA-TBS 45 16A', 'NONWOVEN TEXTILE BACKSHEET ELA-TBS 45 16A'), 
                ('NONWOVEN ELASTIC BAND ELA-CARDED AMOSTRA', 'NONWOVEN ELASTIC BAND ELA-CARDED AMOSTRA'),
                ('NONWOVEN ELASTIC BAND ELA-CARDED 100', 'NONWOVEN ELASTIC BAND ELA-CARDED 100'), 
                ('NONWOVEN ELASTIC BAND ELA-CARDED 100 HE', 'NONWOVEN ELASTIC BAND ELA-CARDED 100 HE'), 
                ('NONWOVEN ELASTIC BAND ELA-SPUN 75 HT', 'NONWOVEN ELASTIC BAND ELA-SPUN 75 HT'), 
                ('NONWOVEN ELASTIC BAND 100 HE NON WOVEN STRETCH EAR', 'NONWOVEN ELASTIC BAND 100 HE NON WOVEN STRETCH EAR'), 
                ('NONWOVEN ELASTIC BAND ELA-ACE 100 T-HT', 'NONWOVEN ELASTIC BAND ELA-ACE 100 T-HT'), 
                ('NONWOVEN ELASTIC BAND ELA-ACE 100 T-HE', 'NONWOVEN ELASTIC BAND ELA-ACE 100 T-HE'),
                ('NONWOVEN ELASTIC BAND ELA-ACE 100 HE(L) PUNCTURED', 'NONWOVEN ELASTIC BAND ELA-ACE 100 HE(L) PUNCTURED'),
                ('NONWOVEN ELASTIC BAND ELA-ACE 95 T-HE', 'NONWOVEN ELASTIC BAND ELA-ACE 95 T-HE'),
                ('NONWOVEN ELASTIC BAND ELA-CARDED 80', 'NONWOVEN ELASTIC BAND ELA-CARDED 80'),
                ('NW Elastic Bands ELA-ACE 100 HE (L) PUNCTURED Amostra', 'NW Elastic Bands ELA-ACE 100 HE (L) PUNCTURED Amostra'),
                ('Nonwoven Elastic Bands ELA-CARDED 80 HE','Nonwoven Elastic Bands ELA-CARDED 80 HE'),
                ('Nonwoven Elastic Bands ELA-CARDED 90 HE','Nonwoven Elastic Bands ELA-CARDED 90 HE'),
                ('Nonwoven Elastic Bands ELA-CARDED 80 HT','Nonwoven Elastic Bands ELA-CARDED 80 HT'),
                ('Nonwoven Elastic Bands ELA-CARDED 90 HT','Nonwoven Elastic Bands ELA-CARDED 90 HT')
            )                                                                                                                                                                                      
    cod = models.CharField(verbose_name="Cód. Artigo", max_length=18, unique=True)
    des = models.CharField(verbose_name="Descrição artigo", max_length=200, unique=False)
    tipo = models.CharField(verbose_name="Tipo", max_length=50, default="Produto final")
    nw1 = models.CharField(verbose_name="NW1", max_length=10, default="")
    formu = models.CharField(verbose_name="Formulação", max_length=10, default="", choices=FORMU)
    nw2 = models.CharField(verbose_name="NW2", max_length=10, default="", null=True, blank=True)
    lar = models.DecimalField(verbose_name="Largura", max_digits=10, decimal_places=2, default=0)
    diam_ref = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Diametro de referência", null=True, blank=True)
    core = models.CharField(verbose_name="Core", max_length=1, choices=CORE, default="")
    gsm = models.CharField(max_length=10, choices=GSM, null=True, blank=True, verbose_name="Gramagem")
    gtin = models.CharField(verbose_name="GTIN", max_length=14, unique=True, default="")
    produto = models.CharField(verbose_name="Produto", max_length=100, default="", choices=PRODUTO)
    produto_id = models.ForeignKey('producao.Produtos',db_column="produto_id",on_delete=models.PROTECT,verbose_name="Id Produto", blank=True, null=True) #ADDED - ID PRODUTO
    thickness = models.IntegerField(verbose_name="Espessura (Estimada/Referência) microns", default=325, blank=True, null=True) #ADDED
    class Meta:
        verbose_name_plural = "Artigos"
        ordering = ['cod']

    def __str__(self):
        return self.cod


class Cliente(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    cod = models.PositiveIntegerField(verbose_name="Código de cliente", unique=True)
    nome = models.CharField(max_length=255, unique=True, null=True, blank=True, verbose_name="Nome") #OBSOLETE
    abv = models.CharField(max_length=3, unique=True, null=True, blank=True, verbose_name="Abreviatura")
    limsup = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Limite Superior")
    liminf = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Limite Inferior")
    diam_ref = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Diametro de referência", null=True, blank=True)
    name = models.CharField(max_length=255, unique=False, null=True, blank=True, verbose_name="Nome") #ADDED

    class Meta:
        verbose_name_plural = "Clientes"
        ordering = ['-timestamp', '-nome']

    def __str__(self):
        return self.nome


class Largura(models.Model):
    GSM = (('105', '105 gsm'), ('100', '100 gsm'), ('95', '95 gsm'), ('90', '90 gsm'), ('80', '80 gsm'), ('60', '60 gsm'), ('75', '75 gsm'), ('57', '57 gsm'), ('50', '50 gsm'), ('48', '48 gsm'), ('45', '45 gsm'), ('25', '25 gsm'))
    PRODUTO = (
                ('NONWOVEN ELASTIC BANDS ELA-ACE 100 HE', 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HE'),
                ('STRETCHABLE NONWOVEN ELASTIC BANDS ELA-ACE 100 HE', 'STRETCHABLE NONWOVEN ELASTIC BANDS ELA-ACE 100 HE'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 90 HE', 'NONWOVEN ELASTIC BANDS ELA-ACE 90 HE'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 90 T-HT', 'NONWOVEN ELASTIC BANDS ELA-ACE 90 T-HT'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 100 HT', 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HT'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 95 HT', 'NONWOVEN ELASTIC BANDS ELA-ACE 95 HT'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 95 HE', 'NONWOVEN ELASTIC BANDS ELA-ACE 95 HE'),
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 90 HE HL', 'NONWOVEN ELASTIC BANDS ELA-SPUN 90 HE HL'),
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 95 HE HL', 'NONWOVEN ELASTIC BANDS ELA-SPUN 95 HE HL'),
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 90 HT HL', 'NONWOVEN ELASTIC BANDS ELA-SPUN 90 HT HL'),
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 95 HE HL', 'NONWOVEN ELASTIC BANDS ELA-SPUN 95 HE HL'),
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 100 HE HL', 'NONWOVEN ELASTIC BANDS ELA-SPUN 100 HE HL'),
                ('SIDE PANEL ELA-ACE 100 HE', 'SIDE PANEL ELA-ACE 100 HE'),
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 100 HE BICO', 'NONWOVEN ELASTIC BANDS ELA-SPUN 100 HE BICO'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 105 HE', 'NONWOVEN ELASTIC BANDS ELA-ACE 105 HE'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 100 HE(D)', 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HE(D)'),
                ('FRONTAL TAPE 48', 'FRONTAL TAPE 48'),
                ('CAR PROTECTION SHEET 57', 'CAR PROTECTION SHEET 57'),
                ('ELASTIC FILM', 'ELASTIC FILM'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 100 HE(L)', 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HE(L)'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 75 HE', 'NONWOVEN ELASTIC BANDS ELA-ACE 75 HE'),
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 60 HE', 'NONWOVEN ELASTIC BANDS ELA-SPUN 60 HE'),
                ('NONWOVEN ELASTIC BANDS ELA-SPUN 60 HT', 'NONWOVEN ELASTIC BANDS ELA-SPUN 60 HT'),
                ('NONWOVEN TEXTILE BACKSHEET ELA-TBS 50 23B', 'NONWOVEN TEXTILE BACKSHEET ELA-TBS 50 23B'),
                ('NONWOVEN TEXTILE BACKSHEET ELA-TBS 50 23A', 'NONWOVEN TEXTILE BACKSHEET ELA-TBS 50 23A'),
                ('NONWOVEN TEXTILE BACKSHEET ELA-TBS 45 16B', 'NONWOVEN TEXTILE BACKSHEET ELA-TBS 45 16B'),
                ('NONWOVEN TEXTILE BACKSHEET ELA-TBS 45 16A', 'NONWOVEN TEXTILE BACKSHEET ELA-TBS 45 16A'),
                ('NONWOVEN ELASTIC BAND ELA-CARDED AMOSTRA', 'NONWOVEN ELASTIC BAND ELA-CARDED AMOSTRA'),
                ('NONWOVEN ELASTIC BAND ELA-CARDED 100', 'NONWOVEN ELASTIC BAND ELA-CARDED 100'),
                ('NONWOVEN ELASTIC BAND ELA-CARDED 100 HE', 'NONWOVEN ELASTIC BAND ELA-CARDED 100 HE'),
                ('NONWOVEN ELASTIC BAND ELA-SPUN 75 HT', 'NONWOVEN ELASTIC BAND ELA-SPUN 75 HT'),
                ('NONWOVEN ELASTIC BAND 100 HE NON WOVEN STRETCH EAR', 'NONWOVEN ELASTIC BAND 100 HE NON WOVEN STRETCH EAR'),
                ('NONWOVEN ELASTIC BAND ELA-ACE 100 T-HT', 'NONWOVEN ELASTIC BAND ELA-ACE 100 T-HT'),
                ('NONWOVEN ELASTIC BAND ELA-ACE 100 T-HE', 'NONWOVEN ELASTIC BAND ELA-ACE 100 T-HE'),
                ('NONWOVEN ELASTIC BAND ELA-ACE 100 HE(L) PUNCTURED', 'NONWOVEN ELASTIC BAND ELA-ACE 100 HE(L) PUNCTURED'),
                ('NONWOVEN ELASTIC BAND ELA-ACE 95 T-HE', 'NONWOVEN ELASTIC BAND ELA-ACE 95 T-HE'),
                ('NONWOVEN ELASTIC BAND ELA-CARDED 80', 'NONWOVEN ELASTIC BAND ELA-CARDED 80'),
                ('NW Elastic Bands ELA-ACE 100 HE (L) PUNCTURED Amostra', 'NW Elastic Bands ELA-ACE 100 HE (L) PUNCTURED Amostra'),
                ('Nonwoven Elastic Bands ELA-CARDED 80 HE','Nonwoven Elastic Bands ELA-CARDED 80 HE'),
                ('Nonwoven Elastic Bands ELA-CARDED 90 HE','Nonwoven Elastic Bands ELA-CARDED 90 HE'),
                ('Nonwoven Elastic Bands ELA-CARDED 80 HT','Nonwoven Elastic Bands ELA-CARDED 80 HT'),
                ('Nonwoven Elastic Bands ELA-CARDED 90 HT','Nonwoven Elastic Bands ELA-CARDED 90 HT')
    )
    perfil = models.ForeignKey(Perfil, on_delete=models.CASCADE, verbose_name="Largura")
    num_bobine = models.PositiveIntegerField(verbose_name="Bobine nº")
    largura = models.DecimalField(max_digits=6, decimal_places=0, null=True, blank=True)
    designacao_prod = models.CharField(verbose_name="Produto", max_length=100, default="", choices=PRODUTO)
    gsm = models.CharField(max_length=7, choices=GSM, null=True, blank=True, verbose_name="Gramagem")
    artigo = models.ForeignKey(Artigo, on_delete=models.PROTECT, verbose_name="Artigo", null=True, blank=True)
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, verbose_name="Cliente", null=True, blank=True)

    class Meta:
        verbose_name_plural = "Larguras"
        ordering = ['perfil']

    def __str__(self):
        return '%s - Bobine nº: %s, %s mm' % (self.perfil, self.num_bobine, self.largura)

    def get_absolute_url(self):
        return f"/producao/perfil/{self.perfil.id}"

class ArtigoCliente(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username", null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    artigo = models.ForeignKey(Artigo, on_delete=models.PROTECT, verbose_name="Artigo")
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, verbose_name="Cliente")
    tipoemenda = models.ForeignKey(TipoEmenda, on_delete=models.PROTECT, verbose_name="Tipo de Emenda", null=True, blank=True)
    embalamento = models.ForeignKey(Embalamento, on_delete=models.PROTECT, verbose_name="Embalamento", null=True, blank=True)
    cod_client = models.CharField(max_length=200, unique=False, verbose_name="Cód. Cliente", null=True, blank=True)
    num_emendas_bobine = models.PositiveIntegerField(verbose_name="Numero de emendas por bobine", null=True, blank=True)
    produto = models.CharField(verbose_name="Produto", max_length=200, default="", null=True, blank=True)

    class Meta:
        verbose_name_plural = "Artigos Cliente"
        ordering = ['-timestamp']

    def __str__(self):
        return '%s - %s' % (self.artigo.des, self.cliente.nome)

class Especificacoes(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    updated = models.DateTimeField(auto_now=True, verbose_name="Updated at")
    created = models.DateTimeField(auto_now_add=True, verbose_name="Created at")
    artigo_cliente = models.ForeignKey(ArtigoCliente, on_delete=models.PROTECT, verbose_name="Artigo Cliente")
    spec = models.CharField(max_length=200, unique=False, null=False, blank=False)
    basis_weight_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Basis Weight (g/m2) Inferior")
    tensile_peak_cd_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Tensile at peak CD (N/25mm) Inferior")
    elongation_break_cd_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Elongation at break CD (%) Inferior")
    elongation_n_cd_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Elongation at 9.81N CD (%) Inferior")
    tensile_peak_md_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Tensile at peak MD (N/25mm) Inferior")
    elongation_break_md_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Elongation at break MD (%) Inferior")
    elongation_n_md_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Elongation at 9.81N MD (%) Inferior")
    load_five_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Load at 5% elongation 1st cycle (N) Inferior")
    load_ten_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Load at 10% elongation 1st cycle (N) Inferior")
    load_twenty_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Load at 20% elongation 1st cycle (N) Inferior")
    load_50_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Load at 50% elongation 1st cycle (N) Inferior")
    permanent_set_second_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Permanent set 2º Cicle (%) Inferior")
    load_hundred_second_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Load at 100% elongation 2cicle (N/50mm) Inferior")
    permanent_set_third_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Permanent set 3º Cicle (%) Inferior")
    load_hundred_third_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Load at 100% elongation 3cicle (N/50mm) Inferior")
    peel_test_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Peel test - (CD) (N/25mm) Inferior")
    elongation_ten_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Elongation at 10 N (mm) Inferior")
    force_max_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Force Max (N) Inferior")
    force_relax_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Force Relaxation 1st Cycle (%) Inferior")
    tensile_set_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Tensile Set (%) Inferior")
    load_first_cycle_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="LOAD 1ST CYCLE (N/50mm) Inferior")
    load_first_relax_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="LOAD 1ST RELAXATION (N/50mm) Inferior")
    first_retract_force_fifty_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="1ST RETRACTION FORCE AT 50% (N/50mm) Inferior")
    first_cycle_permanent_set_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="1st cycle PERMANENT SET (mm) Inferior")
    load_second_cycle_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="LOAD 2ND CYCLE (N/50mm) Inferior")
    load_second_relax_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="LOAD 2ND RELAXATION (N/50mm) Inferior")
    second_retract_force_fifty_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="2ND RETRACTION FORCE AT 50% (N/50mm) Inferior")
    max_load_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="MAXIMUM LOAD (N/50mm) Inferior")
    extension_max_load_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="EXTENSION AT MAXIMUM LOAD (mm) Inferior")
    load_break_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="LOAD AT BREAK (N/50mm) Inferior")
    extencion_break_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="EXTENSION AT BREAK (mm) Inferior")
    extencion_preset_point_load_ten_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="EXTENSION AT PRESET POINT - LOAD 10N (mm) Inferior")
    load_preset_point_tensile_extention_fortyfive_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="LOAD AT PRESET POINT - TENSILE EXTENSION 45mm (N/50mm) Inferior")
    elongation_capacity_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Elongation capacity (%) Inferior")
    max_elongation_capacity_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Maximum elongation capacity (%) Inferior")
    retract_capacity_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Retraction capacity (%) Inferior")
    deformation_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Deformation (%) Inferior")
    tensile_strengh_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Tensile strengh (N/50mm) Inferior")
    elongation_break_cd_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Elongation at break CD (%) Inferior")
    elongation_n_out_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Elongation at 9,81N - fora estufa (%) Inferior")
    elongation_after_one_forty_inf = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Elongation after 1h at 40°C (%) Inferior")
    basis_weight_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Basis Weight (g/m2) Superior")
    tensile_peak_cd_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Tensile at peak CD (N/25mm) Superior")
    elongation_break_cd_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Elongation at break CD (%) Superior")
    elongation_n_cd_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Elongation at 9.81N CD (%) Superior")
    tensile_peak_md_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Tensile at peak MD (N/25mm) Superior")
    elongation_break_md_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Elongation at break MD (%) Superior")
    elongation_n_md_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Elongation at 9.81N MD (%) Superior")
    load_five_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Load at 5% elongation 1st cycle (N) Superior")
    load_ten_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Load at 10% elongation 1st cycle (N) Superior")
    load_twenty_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Load at 20% elongation 1st cycle (N) Superior")
    load_50_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Load at 50% elongation 1st cycle (N) Superior")
    permanent_set_second_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Permanent set 2º Cicle (%) Superior")
    load_hundred_second_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Load at 100% elongation 2cicle (N/50mm) Superior")
    permanent_set_third_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Permanent set 3º Cicle (%) Superior")
    load_hundred_third_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Load at 100% elongation 3cicle (N/50mm) Superior")
    peel_test_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Peel test - (CD) (N/25mm) Superior")
    elongation_ten_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Elongation at 10 N (mm) Superior")
    force_max_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Force Max (N) Superior")
    force_relax_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Force Relaxation 1st Cycle (%) Superior")
    tensile_set_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Tensile Set (%) Superior")
    load_first_cycle_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="LOAD 1ST CYCLE (N/50mm)  Superior")
    load_first_relax_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="LOAD 1ST RELAXATION (N/50mm) Superior")
    first_retract_force_fifty_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="1ST RETRACTION FORCE AT 50% (N/50mm) Superior")
    first_cycle_permanent_set_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="1st cycle PERMANENT SET (mm) Superior")
    load_second_cycle_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="LOAD 2ND CYCLE (N/50mm) Superior")
    load_second_relax_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="LOAD 2ND RELAXATION (N/50mm) Superior")
    second_retract_force_fifty_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="2ND RETRACTION FORCE AT 50% (N/50mm) Superior")
    max_load_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="MAXIMUM LOAD (N/50mm) Superior")
    extension_max_load_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="EXTENSION AT MAXIMUM LOAD (mm) Superior")
    load_break_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="LOAD AT BREAK (N/50mm) Superior")
    extencion_break_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="EXTENSION AT BREAK (mm) Superior")
    extencion_preset_point_load_ten_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="EXTENSION AT PRESET POINT - LOAD 10N (mm) Superior")
    load_preset_point_tensile_extention_fortyfive_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="LOAD AT PRESET POINT - TENSILE EXTENSION 45mm (N/50mm) Superior")
    elongation_capacity_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Elongation capacity (%)  Superior")
    max_elongation_capacity_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Maximum elongation capacity (%) Superior")
    retract_capacity_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Retraction capacity (%)  Superior")
    deformation_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Deformation (%) Superior")
    tensile_strengh_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Tensile strengh (N/50mm) Superior")
    elongation_break_cd_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Elongation at break CD (%) Superior")
    elongation_n_out_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Elongation at 9,81N - fora estufa (%) Superior")
    elongation_after_one_forty_sup = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True, verbose_name="Elongation after 1h at 40°C (%) Superior")

    def __str__(self):
        return '%s - %s %s ' % (self.spec, self.artigo_cliente.cliente, self.artigo_cliente.artigo)


class TrasporteArtigoCliente(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    updated = models.DateTimeField(auto_now=True, verbose_name="Updated at")
    created = models.DateTimeField(auto_now_add=True, verbose_name="Created at")
    transporte = models.ForeignKey(Transporte, on_delete=models.PROTECT, verbose_name="Transporte")
    artigocliente = models.ForeignKey(ArtigoCliente, on_delete=models.PROTECT, verbose_name="Artigo Cliente")
    num_bobines_palete = models.PositiveIntegerField()
    num_paletes_transporte = models.PositiveIntegerField()


class Bobinagem(models.Model):
    STATUSP = (('G', 'G'), ('DM', 'DM12'), ('R', 'R'), ('BA', 'BA'), ('LAB', 'LAB'), ('IND', 'IND'), ('HOLD', 'HOLD'), ('SC', 'SC'))
    TIPODESP = (('R', 'R'), ('BA', 'BA'))
    TIPONW = (('Suominen 25 gsm', 'Suominen 25 gsm'),('Sandler SPUNLACE 100%PP', 'Sandler SPUNLACE 100%PP'), ('BCN 70%PP/30%PE', 'BCN 70%PP/30%PE'), ('Sandler', 'Sandler'), ('PEGAS BICO 17gsm', 'PEGAS BICO 17gsm'), ('Suominen', 'Suominen'), ('BCN', 'BCN'), ('ORMA', 'ORMA'), ('PEGAS 22', 'PEGAS 22'), ('SAWASOFT', 'SAWASOFT'), ('SAWABOND', 'SAWABOND'), ('Teksis', 'Teksis'), ('Union', 'Union'), ('Radici', 'Radici'), ('Fitesa', 'Fitesa'), ('ALBIS 23', 'ALBIS 23'), ('ALBIS 16', 'ALBIS 16'), ('Union Pillow', 'Union Pillow'), ('Union UV', 'Union UV'), ('Jacob Holm', 'Jacob Holm'), ('Nonwoven Nikoo 25gsm Spunlace 100PP', 'Nonwoven Nikoo 25gsm Spunlace 100PP'), ('ELA-ACE', 'ELA-ACE'), ('ELA-SPUN', 'ELA-SPUN'), ('Nonwoven Nikoo 28gsm Spunlace 100PP', 'Nonwoven Nikoo 28gsm Spunlace 100PP'), ('NW Vaporjet 25gsm Spunlace 100PP 2200', 'NW Vaporjet 25gsm Spunlace 100PP 2200'), ('Sandler Sawabond 7059 24gsm', 'Sandler Sawabond 7059 24gsm'), ('Nonwoven ANT - ANTJET 25gsm 100PP 2200', 'Nonwoven ANT - ANTJET 25gsm 100PP 2200'),('Sandler 16gsm Sawabond 100PP 2200', 'Sandler 16gsm Sawabond 100PP 2200'),('Teksis 52160EL 16gsm L2200', 'Teksis 52160EL 16gsm L2200'),('Union KB1600PHW 16gsm L2200', 'Union KB1600PHW 16gsm L2200'))
    user=models.ForeignKey(User, on_delete = models.PROTECT, verbose_name = "Username")
    perfil=models.ForeignKey(Perfil, on_delete = models.PROTECT, verbose_name = "Perfil")
    num_emendas=models.IntegerField(verbose_name = "Número de emendas", null = True, blank = True, default = 0)
    timestamp=models.DateTimeField(auto_now_add = True)
    nome=models.CharField(verbose_name = "Bobinagem", max_length = 200, unique = True)
    data=models.DateField(auto_now_add = False, auto_now = False, default = datetime.date.today, verbose_name = "Data")
    num_bobinagem=models.PositiveIntegerField(verbose_name = "Bobinagem nº")
    comp=models.DecimalField(max_digits = 6, decimal_places = 2, verbose_name = "Comprimento Final", default = 0)
    tiponwsup=models.CharField(max_length = 200, choices = TIPONW, default = '', verbose_name = "Tipo Nonwoven Superior", null = True, blank = True)
    tiponwinf=models.CharField(max_length = 200, choices = TIPONW, default = '', verbose_name = "Tipo Nonwoven Inferior", null = True, blank = True)
    estado=models.CharField(max_length = 4, choices = STATUSP, default = 'LAB', verbose_name = "Estado")
    lotenwsup=models.CharField(verbose_name = "Lote Nonwoven Superior", max_length = 200, unique = False, null = True, blank = True,)
    lotenwinf=models.CharField(verbose_name = "Lote Nonwoven Inferior", max_length = 200, unique = False, null = True, blank = True,)
    nwsup=models.DecimalField(max_digits = 10, decimal_places = 2, verbose_name = "Consumo Nonwoven Superior", null = True, blank = True)
    nwinf=models.DecimalField(max_digits = 10, decimal_places = 2, verbose_name = "Consumo Nonwoven Inferior", null = True, blank = True)
    comp_par=models.DecimalField(max_digits = 10, decimal_places = 2, verbose_name = "Comprimento Emenda", null = True, blank = True, default = 0)
    comp_cli=models.DecimalField(max_digits = 10, decimal_places = 2, verbose_name = "Comprimento Cliente", default = 0)
    desper=models.DecimalField(max_digits = 10, decimal_places = 2, verbose_name = "Desperdício", default = 0)
    tipo_desp=models.CharField(max_length = 4, choices = TIPODESP, default = None, verbose_name = "Tipo de desperdício", null = True, blank = True)
    diam=models.DecimalField(max_digits = 10, decimal_places = 2, verbose_name = "Diametro", null = True, blank = True)
    area=models.DecimalField(max_digits = 10, decimal_places = 2, verbose_name = "Área", null = True, blank = True)
    inico=models.TimeField(auto_now_add = False, auto_now = False, verbose_name = "Início", null = True, blank = True)
    fim=models.TimeField(auto_now_add = False, auto_now = False, verbose_name = "Fim", null = True, blank = True)
    duracao=models.CharField(max_length = 200, null = True, blank = True, verbose_name = "Duração")
    obs=models.TextField(max_length = 500, null = True, blank = True, verbose_name = "Observações", default = "")
    area_g=models.DecimalField(max_digits = 10, decimal_places = 2, verbose_name = "Área Good", default = 0)
    area_dm=models.DecimalField(max_digits = 10, decimal_places = 2, verbose_name = "Área DM", default = 0)
    area_r=models.DecimalField(max_digits = 10, decimal_places = 2, verbose_name = "Área R", default = 0)
    area_ind=models.DecimalField(max_digits = 10, decimal_places = 2, verbose_name = "Área Ind", default = 0)
    area_ba=models.DecimalField(max_digits = 10, decimal_places = 2, verbose_name = "Área BA", default = 0)
    valid = models.SmallIntegerField(default=1, verbose_name="Bobinagem Validada") #ADDED
    audit_current_settings=models.ForeignKey('producao.AuditCurrentSettings', on_delete = models.PROTECT, verbose_name = "Audit Current Settings", null = True) #ADDED
    ig_bobinagem_id=models.IntegerField(verbose_name = "IG_BOBINAGEM", null = True, blank = True, default = 0) #ADDED
    largura_bruta=models.DecimalField(max_digits = 10, decimal_places = 2, verbose_name = "Largura Bruta", default = 0, null = True, blank = True) #ADDED
    valid_tstamp = models.DateTimeField(verbose_name="Data Validação", null=True, blank=True) #ADDED
    vcr_num_inf=models.CharField(max_length = 80, null = True, blank = True, verbose_name = "Vcr inf") #ADDED
    vcr_num_sup=models.CharField(max_length = 80, null = True, blank = True, verbose_name = "Vcr sup") #ADDED
    def __str__(self):
        return self.nome

    @property
    def title(self):
        return self.nome

    class Meta:
        verbose_name_plural="Bobinagens"
        ordering=['-data', '-fim', '-nome']
        get_latest_by=['data', 'fim']

    def get_absolute_url(self):
        return f"/producao/bobinagem/{self.id}"


class Encomenda(models.Model):
    STATUS=(('A', 'A'), ('F', 'F'))
    user=models.ForeignKey(User, on_delete = models.PROTECT, verbose_name = "Username")
    cliente=models.ForeignKey(Cliente, on_delete = models.PROTECT, verbose_name = "Cliente")
    timestamp=models.DateTimeField(auto_now_add = True)
    data=models.DateField(auto_now_add = False, auto_now = False, default = datetime.date.today, verbose_name = "Data")
    data_prevista=models.DateField(verbose_name = "Data Prevista de Conclusão", null = True, blank = True)
    data_encomenda = models.DateTimeField(verbose_name = "Data de Encomenda", null = True, blank = True)
    data_solicitada = models.DateTimeField(verbose_name = "Data Solicitada de Expedição", null = True, blank = True)
    data_expedicao = models.DateTimeField(verbose_name = "Data de Expedição", null = True, blank = True)
    data_prevista_expedicao = models.DateTimeField(verbose_name = "Data Prevista de Expedição", null = True, blank = True)
    prazo = models.IntegerField(default = 0)
    eef=models.CharField(max_length = 17, unique = True, verbose_name = "Encomenda")
    prf=models.CharField(max_length = 15, verbose_name = "Proforma", null = True, blank = True)
    sqm=models.DecimalField(max_digits = 10, decimal_places = 2, verbose_name = "Metros quadrados")
    estado=models.CharField(max_length = 1, choices = STATUS, default = 'A', verbose_name = "Estado")
    num_cargas_actual=models.IntegerField(default = 0)
    num_cargas=models.IntegerField(default = 0)
    order_num=models.CharField(max_length = 100, unique = False, null = True, blank = True, verbose_name ="Order Number")
    num_paletes_actual=models.IntegerField(default = 0, verbose_name = "Nº de Paletes Actual")
    num_paletes=models.IntegerField(default = 0, verbose_name = "Nº de Paletes Total")

    def __str__(self):
        return self.eef

    class Meta:
        verbose_name_plural="Encomendas"
        ordering=['-eef', 'estado', '-data']

class LinhaEncomenda(models.Model):
    encomenda = models.ForeignKey(Encomenda, on_delete = models.PROTECT, verbose_name = "Encomenda")
    artigo = models.ForeignKey(Artigo, on_delete = models.PROTECT, verbose_name = "Artigo")
    linha = models.IntegerField(default = 0)
    qtd = models.DecimalField(max_digits = 10, decimal_places = 2, verbose_name = "Metros quadrados")
    prc = models.DecimalField(max_digits = 10, decimal_places = 5, verbose_name = "Preço Metro")

    def __str__(self):
        return '%s - %s - %s' % (self.linha, self.encomenda, self.artigo)

    

class Carga(models.Model):
    STATUS=(('I', 'I'), ('C', 'C'))
    TIPO=(('CONTENTOR', 'CONTENTOR'), ('CAMIÃO', 'CAMIÃO'))
    user=models.ForeignKey(User, on_delete = models.PROTECT, verbose_name = "Username")
    enc=models.ForeignKey(Encomenda, on_delete = models.SET_NULL, verbose_name = "Encomenda",null=True)
    timestamp=models.DateTimeField(auto_now_add = True)
    data=models.DateField(auto_now_add = False, auto_now = False, default = datetime.date.today, verbose_name = "Data")
    carga=models.CharField(max_length = 200, unique = True, verbose_name = "Carga")
    num_carga=models.IntegerField(default = 0, verbose_name = "Carga nº")
    num_paletes=models.IntegerField(default = 0, verbose_name = "Número de paletes total")
    num_paletes_actual=models.IntegerField(default = 0, verbose_name = "Número de paletes actual")
    estado=models.CharField(max_length = 1, choices = STATUS, default = 'I', verbose_name = "Estado")
    sqm=models.DecimalField(max_digits = 10, decimal_places = 2, verbose_name = "Metros quadrados")
    metros=models.DecimalField(max_digits = 15, decimal_places = 2, verbose_name = "Metros lineares", default = 0)
    tipo=models.CharField(max_length = 9, choices = TIPO, default = 'CONTENTOR', verbose_name = "Tipo de Carga")
    data_expedicao=models.DateField(null = True, blank = True, verbose_name = "Data de expedição")
    hora_expedicao=models.TimeField(auto_now_add = False, auto_now = False, verbose_name = "Hora de expedição", null = True, blank =True)
    data_prevista=models.DateField(null = True, blank = True, verbose_name = "Data prevista de expedição")
    expedida=models.BooleanField(default = False, verbose_name = "Expedida")
    eef=models.CharField(max_length = 17, null = True, verbose_name = "Encomenda") #ADDED
    artigos = models.JSONField(blank=True, null=True) #ADDED
    prf=models.CharField(max_length = 17, null = True, verbose_name = "prf") #ADDED
    cliente=models.CharField(max_length = 255, null = True, verbose_name = "cliente") #ADDED
    def __str__(self):
        return self.carga

    class Meta:
        verbose_name_plural="Cargas"
        ordering=['-carga', '-data']


class Palete(models.Model):
    CORE=(('3', '3'), ('6', '6'))
    STATUSP=(('G', 'G'), ('DM', 'DM'))
    PESOP=(('0', '0 Kg'), ('8', '8 Kg'), ('13', '13 Kg'))
    user=models.ForeignKey(User, on_delete = models.PROTECT, verbose_name = "Username")
    cliente=models.ForeignKey(Cliente, on_delete = models.PROTECT, verbose_name = "Cliente", null = True, blank = True)
    carga=models.ForeignKey(Carga, on_delete = models.PROTECT, verbose_name = "Carga", null = True, blank = True)
    ordem=models.ForeignKey('planeamento.OrdemProducao', on_delete = models.PROTECT, verbose_name = "Ordem de Producao", null = True, blank = True)
    draft_ordem=models.ForeignKey('producao.TempOrdemFabrico', on_delete = models.PROTECT, verbose_name = "Draft Ordem de Producao", null = True, blank = True) #ADDED
    ordem_original=models.CharField(max_length = 200, null = True, blank = True, verbose_name = "Ordem de produção Original")
    perfil_embalamento=models.ForeignKey(PerfilEmbalamento, on_delete = models.PROTECT, null = True, blank = True, verbose_name = "PerfilEmbalamento")
    stock=models.BooleanField(default = False, verbose_name = "Stock")
    timestamp=models.DateTimeField(auto_now_add = True)
    data_pal=models.DateField(auto_now = False, auto_now_add = False, default = datetime.date.today, verbose_name = "Data da Palete")
    nome=models.CharField(max_length = 200, unique = True, null=True, blank=True, verbose_name="Palete")
    num = models.IntegerField(unique=False, null=True,blank=True, verbose_name="Palete nº")
    num_palete_carga = models.IntegerField(unique=False, null=True, blank=True, verbose_name="Nº Palete Carga")
    num_palete_ordem = models.IntegerField(unique=False, null=True, blank=True, verbose_name="Nº Palete Ordem")
    estado = models.CharField(max_length=2, choices=STATUSP, default='G', verbose_name="Estado")
    area = models.DecimalField(max_digits=11, decimal_places=1, verbose_name="Área palete")
    comp_total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Comprimento palete")
    lote = models.CharField(max_length=200, unique=True, null=True, blank=True, verbose_name="Nº Lote")
    num_bobines = models.IntegerField(verbose_name="Bobines total")
    num_bobines_act = models.IntegerField(default=0)
    largura_bobines = models.DecimalField(max_digits=6, decimal_places=2, verbose_name="Largura das bobines", null=True, blank=True)
    diametro = models.DecimalField(max_digits=6, decimal_places=2, verbose_name="Diâmetro das bobines", null=True, blank=True)
    core_bobines = models.CharField(max_length=1, choices=CORE, default='3', verbose_name="Core das bobines")
    peso_bruto = models.DecimalField(max_digits=5, decimal_places=2, default=0, null=True, blank=True, verbose_name="Peso bruto")
    peso_palete = models.CharField(max_length=5, choices=PESOP, null=True, blank=True, verbose_name="Peso palete")
    peso_liquido = models.DecimalField(max_digits=5, decimal_places=2, default=0, null=True, blank=True, verbose_name="Peso liqudo")
    retrabalhada = models.BooleanField(default=False, verbose_name="Retrabalhada")
    destino = models.CharField(max_length=200, null=True, blank=True, verbose_name="Destino")
    add = models.BooleanField(default=False, verbose_name="Adicionar Palete")
    ordem_original_stock = models.BooleanField(default=False, verbose_name="Ordem original Stock")
    ordem_id_original = models.IntegerField(unique=False, null=True, blank=True, verbose_name="Ordem ID Original") #ADDED
    ignore_audit = models.IntegerField(unique=False, null=True, blank=True, verbose_name="Ignore Audit") #ADDED
    nbobines_real = models.IntegerField(verbose_name="Bobines total", null=True) #ADDED
    area_real = models.DecimalField(max_digits=10, decimal_places=2, null=True, verbose_name="Área palete") #ADDED
    comp_real = models.DecimalField(max_digits=10, decimal_places=2, null=True, verbose_name="Comprimento palete") #ADDED
    diam_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, verbose_name="Diametro Minimo palete") #ADDED
    diam_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, verbose_name="Diametro Maximo palete") #ADDED
    diam_avg = models.DecimalField(max_digits=10, decimal_places=2, null=True, verbose_name="Diametro AVG palete") #ADDED
    disabled = models.BooleanField(default=False, verbose_name="Indica se a Palete existe!") #ADDED
    artigo = models.JSONField(blank=True, null=True) #ADDED
    paletizacao = models.JSONField(blank=True, null=True) #ADDED
    destinos = models.JSONField(blank=True, null=True) #ADDED
    nbobines_emendas = models.IntegerField(verbose_name="Bobines Com emendas", null=True) #ADDED
    destinos_has_obs = models.IntegerField(unique=False, null=True, blank=True, verbose_name="Indica se os destinos têm observações") #ADDED
    lvl_item_id = models.IntegerField(verbose_name="Indica o id do item no embalamento", null=True) #ADDED
    lvl = models.IntegerField(verbose_name="Indica a posição no embalamento", null=True) #ADDED
    nbobines_sem_destino = models.IntegerField(verbose_name="Indica o numero de bobines sem destino em estado DM", null=True) #ADDED
    nok_estados = models.IntegerField(verbose_name="Indica se as bobines da palete de produto acabado estão apenas em LAB e G se sim nok=0 senão nok=1", null=True) #ADDED
    nok = models.IntegerField(verbose_name="em conjugação com nok_estados mais o nº de bobines(se corresponde ao nbones defindo)", null=True) #ADDED
    reported = models.IntegerField(verbose_name="Indica se a palete foi sincronizada com o SAGE", null=True) #ADDED
    def __str__(self):
        return self.nome

    class Meta:
        verbose_name_plural = "Paletes"
        ordering = ['-data_pal', '-num']


class Fornecedor(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    timestamp = models.DateTimeField(auto_now_add=True)
    cod = models.CharField(max_length=20, unique=True, verbose_name="Código Fornecedor", null=True, blank=True)
    abv = models.CharField(max_length=3, unique=True, verbose_name="Abreviatura", null=True, blank=True)
    designacao = models.CharField(max_length=200, unique=True, verbose_name="Designação")

    def __str__(self):
        return '%s - %s' % (self.cod, self.designacao)

    class Meta:
        verbose_name_plural = "Fornecedores"
        ordering = ['-timestamp']


class Rececao(models.Model):
    STATUS = (('A', 'Aberta'), ('F', 'Fechada'))
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    timestamp = models.DateTimeField(auto_now_add=True)
    fornecedor = models.ForeignKey(Fornecedor, on_delete=models.PROTECT, verbose_name="Fornecedor")
    rececao = models.CharField(max_length=20, unique=True, verbose_name="Receção")
    num = models.IntegerField(verbose_name="Rececao nº", null=True, blank=True)
    quantidade = models.IntegerField(verbose_name="Quantidade de Lotes", null=True, blank=True)
    estado = models.CharField(max_length=1, choices=STATUS, default='A', verbose_name="Estado da Receção")
    encomenda = models.CharField(max_length=15, unique=True, verbose_name="Encomenda")

    def __str__(self):
        return self.rececao

    class Meta:
        verbose_name_plural = "Receções"
        ordering = ['-timestamp']


class ArtigoNW(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    timestamp = models.DateTimeField(auto_now_add=True)
    fornecedor = models.ForeignKey(Fornecedor, on_delete=models.PROTECT, verbose_name="Fornecedor")
    cod = models.CharField(max_length=50, unique=True, verbose_name="Código Artigo Nonwoven")
    designacao = models.CharField(max_length=200, unique=True, verbose_name="Designação")
    gsm = models.IntegerField(verbose_name="Gramagem")
    largura = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Largura")

    def __str__(self):
        return '%s - %s' % (self.cod, self.designacao)

    class Meta:
        verbose_name_plural = "Artigos Nonwoven"
        ordering = ['-timestamp']


class Nonwoven(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    timestamp = models.DateTimeField(auto_now_add=True)
    artigo_nw = models.ForeignKey(ArtigoNW, on_delete=models.PROTECT, verbose_name="Artigo Nonwoven", null=True, blank=True)
    rececao = models.ForeignKey(Rececao, on_delete=models.PROTECT, verbose_name="Receção", null=True, blank=True)
    cod_nw = models.CharField(max_length=50, verbose_name="Código Nonwoven", unique=True, null=True, blank=True)
    stack_num = models.CharField(max_length=20, verbose_name="Stack number", unique=True, null=True, blank=True)
    sqm = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Metros quadrados", null=True, blank=True)
    lote = models.CharField(max_length=10, verbose_name="Lote", null=True, blank=True)
    prod = models.CharField(max_length=10, verbose_name="Produção", null=True, blank=True)
    comp_total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Comprimento total")
    comp_actual = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Comprimento actual")
    vazio = models.BooleanField(default=False, verbose_name="Utilizado")

    def __str__(self):
        return '%s - %s - %s' % (self.stack_num, self.rececao, self.artigo_nw.designacao)

    class Meta:
        verbose_name_plural = "Nonwovens"
        ordering = ['-timestamp']


class EtiquetaNonwoven(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    nonwoven = models.ForeignKey(Nonwoven, on_delete=models.CASCADE, verbose_name="Nonwoven")
    rececao = models.ForeignKey(Rececao, on_delete=models.PROTECT, verbose_name="Receção")
    cod_nw = models.CharField(max_length=100, verbose_name="Código NW")
    nw_des = models.CharField(max_length=100, verbose_name="Descrição NW")
    rececao_rec = models.CharField(max_length=100, verbose_name="Receção Rec")
    encomenda = models.CharField(max_length=100, verbose_name="Encomenda")
    data_rec = models.CharField(max_length=100, verbose_name="Data de Receção")
    impressora = models.CharField(max_length=200, verbose_name="Impressora", null=True, blank=True)
    num_copias = models.IntegerField(verbose_name="Nº de Cópias", unique=False, null=True, blank=True)
    estado_impressao = models.BooleanField(default=False, verbose_name="Imprimir")

    def __str__(self):
        return self.cod_nw

    class Meta:
        verbose_name_plural = "Etiquetas Nonwoven"
        ordering = ['-timestamp']


class ConsumoNonwoven(models.Model):
    POS = (('SUP', 'Superior'), ('INF', 'Inferior'))
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    timestamp = models.DateTimeField(auto_now_add=True)
    bobinagem = models.ForeignKey(Bobinagem, on_delete=models.PROTECT, verbose_name="Bobinagem")
    nonwoven = models.ForeignKey(Nonwoven, on_delete=models.PROTECT, verbose_name="Nonwoven")
    posicao = models.CharField(max_length=10, verbose_name="Posição (Sup/Inf)", choices=POS)
    consumo = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Consumo")

    def __str__(self):
        return '%s - %s:  %s' % (self.bobinagem.nome, self.nonwoven.designacao, self.posicao)

    class Meta:
        verbose_name_plural = "Consumos de Nonwoven"
        ordering = ['-timestamp']


class Bobine(models.Model):
    STATUSP = (('G', 'G'), ('DM', 'DM12'), ('R', 'R'), ('BA', 'BA'), ('LAB', 'LAB'), ('IND', 'IND'), ('HOLD', 'HOLD'), ('SC', 'SC'))
    PRODUTO = (
            ('NONWOVEN ELASTIC BANDS ELA-ACE 100 HE', 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HE'), 
            ('STRETCHABLE NONWOVEN ELASTIC BANDS ELA-ACE 100 HE', 'STRETCHABLE NONWOVEN ELASTIC BANDS ELA-ACE 100 HE'), 
            ('NONWOVEN ELASTIC BANDS ELA-ACE 90 HE', 'NONWOVEN ELASTIC BANDS ELA-ACE 90 HE'), 
            ('NONWOVEN ELASTIC BANDS ELA-ACE 90 T-HT', 'NONWOVEN ELASTIC BANDS ELA-ACE 90 T-HT'),
            ('NONWOVEN ELASTIC BANDS ELA-ACE 100 HT', 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HT'), 
            ('NONWOVEN ELASTIC BANDS ELA-ACE 95 HT', 'NONWOVEN ELASTIC BANDS ELA-ACE 95 HT'), 
            ('NONWOVEN ELASTIC BANDS ELA-ACE 95 HE', 'NONWOVEN ELASTIC BANDS ELA-ACE 95 HE'), 
            ('NONWOVEN ELASTIC BANDS ELA-SPUN 90 HE HL', 'NONWOVEN ELASTIC BANDS ELA-SPUN 90 HE HL'), 
            ('NONWOVEN ELASTIC BANDS ELA-SPUN 95 HE HL', 'NONWOVEN ELASTIC BANDS ELA-SPUN 95 HE HL'), 
            ('NONWOVEN ELASTIC BANDS ELA-SPUN 90 HT HL', 'NONWOVEN ELASTIC BANDS ELA-SPUN 90 HT HL'), 
            ('NONWOVEN ELASTIC BANDS ELA-SPUN 95 HE HL', 'NONWOVEN ELASTIC BANDS ELA-SPUN 95 HE HL'), 
            ('NONWOVEN ELASTIC BANDS ELA-SPUN 100 HE HL', 'NONWOVEN ELASTIC BANDS ELA-SPUN 100 HE HL'), 
            ('SIDE PANEL ELA-ACE 100 HE', 'SIDE PANEL ELA-ACE 100 HE'), 
            ('NONWOVEN ELASTIC BANDS ELA-SPUN 100 HE BICO', 'NONWOVEN ELASTIC BANDS ELA-SPUN 100 HE BICO'), 
            ('NONWOVEN ELASTIC BANDS ELA-ACE 105 HE', 'NONWOVEN ELASTIC BANDS ELA-ACE 105 HE'), 
            ('NONWOVEN ELASTIC BANDS ELA-ACE 100 HE(D)', 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HE(D)'), 
            ('FRONTAL TAPE 48', 'FRONTAL TAPE 48'), 
            ('CAR PROTECTION SHEET 57', 'CAR PROTECTION SHEET 57'), 
            ('ELASTIC FILM', 'ELASTIC FILM'), 
            ('NONWOVEN ELASTIC BANDS ELA-ACE 100 HE(L)', 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HE(L)'), 
            ('NONWOVEN ELASTIC BANDS ELA-ACE 75 HE', 'NONWOVEN ELASTIC BANDS ELA-ACE 75 HE'), 
            ('NONWOVEN ELASTIC BANDS ELA-SPUN 60 HE', 'NONWOVEN ELASTIC BANDS ELA-SPUN 60 HE'), 
            ('NONWOVEN ELASTIC BANDS ELA-SPUN 60 HT', 'NONWOVEN ELASTIC BANDS ELA-SPUN 60 HT'), 
            ('NONWOVEN TEXTILE BACKSHEET ELA-TBS 50 23B', 'NONWOVEN TEXTILE BACKSHEET ELA-TBS 50 23B'), 
            ('NONWOVEN TEXTILE BACKSHEET ELA-TBS 50 23A', 'NONWOVEN TEXTILE BACKSHEET ELA-TBS 50 23A'), 
            ('NONWOVEN TEXTILE BACKSHEET ELA-TBS 45 16B', 'NONWOVEN TEXTILE BACKSHEET ELA-TBS 45 16B'), 
            ('NONWOVEN TEXTILE BACKSHEET ELA-TBS 45 16A', 'NONWOVEN TEXTILE BACKSHEET ELA-TBS 45 16A'), 
            ('NONWOVEN ELASTIC BAND ELA-CARDED AMOSTRA', 'NONWOVEN ELASTIC BAND ELA-CARDED AMOSTRA'), 
            ('NONWOVEN ELASTIC BAND ELA-CARDED 100', 'NONWOVEN ELASTIC BAND ELA-CARDED 100'),
            ('NONWOVEN ELASTIC BAND ELA-CARDED 100 HE', 'NONWOVEN ELASTIC BAND ELA-CARDED 100 HE'), 
            ('NONWOVEN ELASTIC BAND ELA-SPUN 75 HT', 'NONWOVEN ELASTIC BAND ELA-SPUN 75 HT'), 
            ('NONWOVEN ELASTIC BAND 100 HE NON WOVEN STRETCH EAR', 'NONWOVEN ELASTIC BAND 100 HE NON WOVEN STRETCH EAR'), 
            ('NONWOVEN ELASTIC BAND ELA-ACE 100 T-HT', 'NONWOVEN ELASTIC BAND ELA-ACE 100 T-HT'), 
            ('NONWOVEN ELASTIC BAND ELA-ACE 100 T-HE', 'NONWOVEN ELASTIC BAND ELA-ACE 100 T-HE'),
            ('NONWOVEN ELASTIC BAND ELA-CARDED 80', 'NONWOVEN ELASTIC BAND ELA-CARDED 80'),
            ('Nonwoven Elastic Bands ELA-CARDED 90 HE','Nonwoven Elastic Bands ELA-CARDED 90 HE'),
            ('Nonwoven Elastic Bands ELA-CARDED 80 HT','Nonwoven Elastic Bands ELA-CARDED 80 HT'),
            ('Nonwoven Elastic Bands ELA-CARDED 90 HT','Nonwoven Elastic Bands ELA-CARDED 90 HT')
    )
    TIPODESP = (('R', 'R'), ('BA', 'BA'))
    bobinagem = models.ForeignKey(Bobinagem, on_delete=models.CASCADE, verbose_name="Bobinagem")
    largura = models.ForeignKey(Largura, on_delete=models.PROTECT, null=True, blank=True, verbose_name="Largura")
    artigo = models.ForeignKey(Artigo, on_delete=models.PROTECT, verbose_name="Artigo", null=True, blank=True)
    designacao_prod = models.CharField(verbose_name="Produto", max_length=100, default="", null=True, blank=True, choices=PRODUTO)
    cliente = models.CharField(verbose_name="Cliente", max_length=100, default="", null=True, blank=True)
    comp = models.DecimalField(max_digits=10, decimal_places=2,verbose_name="Comprimento", default=0, null=True, blank=True)
    comp_actual = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Comprimento actual", default=0, null=True, blank=True)
    diam = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Diametro", null=True, blank=True)
    nome = models.CharField(verbose_name="Bobine", max_length=200, null=True, blank=True, default="")
    palete = models.ForeignKey(Palete, on_delete=models.SET_NULL, null=True, blank=True)
    posicao_palete = models.PositiveIntegerField(verbose_name="Posição", default=0)
    estado = models.CharField(max_length=4, choices=STATUSP, default='G', verbose_name="Estado")
    area = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Área bobine", null=True, blank=True)
    con = models.BooleanField(default=False, verbose_name="Cónica")
    descen = models.BooleanField(default=False, verbose_name="Descentrada")
    presa = models.BooleanField(default=False, verbose_name="Presa")
    diam_insuf = models.BooleanField(default=False, verbose_name="Diâmetro insuficiente")
    furos = models.BooleanField(default=False, verbose_name="Furos")
    esp = models.BooleanField(default=False, verbose_name="Gramagem")
    troca_nw = models.BooleanField(default=False, verbose_name="Troca NW")
    outros = models.BooleanField(default=False, verbose_name="Outros")
    buraco = models.BooleanField(default=False, verbose_name="Buracos")
    obs = models.TextField(max_length=500, null=True, blank=True, verbose_name="Observações", default="")
    recycle = models.BooleanField(default=False, verbose_name="Reciclada")
    destino = models.TextField(max_length=500, null=True, blank=True, verbose_name="Destino", default="")
    l_real = models.IntegerField(unique=False, null=True, blank=True, verbose_name="Largura Real")
    nok = models.BooleanField(default=False, verbose_name="Largura NOK")
    fc = models.BooleanField(default=False, verbose_name="Falha de corte")
    ff = models.BooleanField(default=False, verbose_name="Falha de filme")
    fmp = models.BooleanField(default=False, verbose_name="Falha de Matéria Prima")
    suj = models.BooleanField(default=False, verbose_name="Sujidade/Caiu do carro")
    car = models.BooleanField(default=False, verbose_name="Carro andou para trás")
    lac = models.BooleanField(default=False, verbose_name="Laçou")
    ncore = models.BooleanField(default=False, verbose_name="Não colou core/Falta de fita cola")
    sbrt = models.BooleanField(default=False, verbose_name="Sobre tiragem")
    prop = models.BooleanField(default=False, verbose_name="Propriedades")
    prop_obs = models.TextField(max_length=200, null=True, blank=True, verbose_name="Observações Propriedades", default="")
    fc_diam_ini = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="Falha de corte inicio", null=True, blank=True)
    fc_diam_fim = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="Falha de corte fim", null=True, blank=True)
    ff_m_ini = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="Falha de filme inicio", null=True, blank=True)
    ff_m_fim = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="Falha de fimle fim", null=True, blank=True)
    desp = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Desperdício", null=True, blank=True)
    tipo_desp = models.CharField(max_length=4, choices=TIPODESP, default=None, verbose_name="Tipo de desperdício", null=True, blank=True)
    para_retrabalho = models.BooleanField(default=False, verbose_name="Para retrabalho")
    fc_pos = models.JSONField(blank=True, null=True) #ADDED
    ff_pos = models.JSONField(blank=True, null=True) #ADDED
    buracos_pos = models.JSONField(blank=True, null=True) #ADDED
    furos_pos = models.JSONField(blank=True, null=True) #ADDED
    rugas_pos = models.JSONField(blank=True, null=True) #ADDED
    rugas = models.BooleanField(default=False, verbose_name="Rugas", null=True, blank=True) #ADDED
    tr = models.BooleanField(default=False, verbose_name="Troca Rápida", null=True, blank=True) #ADDED
    ordem_id = models.IntegerField(unique=False, null=True, blank=True, verbose_name="Ordem ID Original") #ADDED
    ordem_changed = models.IntegerField(unique=False, null=True, blank=True, verbose_name="Indica se a ordem foi alterada após primeira atribuição") #ADDED
    core = models.IntegerField(unique=False, null=True, blank=True, verbose_name="Core") #ADDED
    lar = models.IntegerField(unique=False, null=True, blank=True, verbose_name="Core") #ADDED
    lotenwsup=models.CharField(verbose_name = "Lote Nonwoven Superior", max_length = 200, unique = False, null = True, blank = True,) #ADDED
    lotenwinf=models.CharField(verbose_name = "Lote Nonwoven Inferior", max_length = 200, unique = False, null = True, blank = True,) #ADDED
    nwsup=models.DecimalField(max_digits = 10, decimal_places = 2, verbose_name = "Consumo Nonwoven Superior", null = True, blank = True) # ADDED
    nwinf=models.DecimalField(max_digits = 10, decimal_places = 2, verbose_name = "Consumo Nonwoven Inferior", null = True, blank = True) #ADDED
    acs_id = models.IntegerField(unique=False, null=True, blank=True, verbose_name="Settings applyed ") #ADDED
    agg_of_id = models.IntegerField(unique=False, null=True, blank=True, verbose_name="Aggregated OF") #ADDED
    ignore_audit = models.IntegerField(unique=False, null=True, blank=True, verbose_name="Ignore Audit") #ADDED
    destinos = models.JSONField(blank=True, null=True) #ADDED
    ig_id = models.IntegerField(unique=False, null=True, blank=True, verbose_name="ig_id") #ADDED
    destinos_has_obs = models.IntegerField(unique=False, null=True, blank=True, verbose_name="Indica se os destinos têm observações") #ADDED
    vcr_num_inf=models.CharField(max_length = 80, null = True, blank = True, verbose_name = "Vcr inf") #ADDED
    vcr_num_sup=models.CharField(max_length = 80, null = True, blank = True, verbose_name = "Vcr sup") #ADDED
    troca_etiqueta = models.IntegerField(unique=False, null=True, blank=True, verbose_name="Troca de Etiqueta") #ADDED 0/1/2
    timestamp = models.DateTimeField(blank=True, null=True) #ADDED
    cliente_id = models.IntegerField(unique=False, null=True, blank=True, verbose_name="Cliente") #ADDED
    cliente_cod = models.IntegerField(unique=False, null=True, blank=True, verbose_name="Cliente") #ADDED
    produto_id = models.IntegerField(unique=False, null=True, blank=True, verbose_name="Produto") #ADDED
    def __str__(self):
        return self.nome

    class Meta:
        verbose_name_plural = "Bobines"

    def get_absolute_url(self):
        return f"/producao/bobine/details/{self.id}"

    @classmethod
    def add_bobine(cls, palete, bobine):
        bobine = Bobine.objects.get(pk=bobine)
        palete = Palete.objects.get(pk=palete)
        if palete.estado == 'DM':
            if bobine.ordem_id is None:
                bobine.ordem_id=palete.ordem_id_original
            bobine.posicao_palete = palete.num_bobines_act + 1
            bobine.palete = palete
            palete.num_bobines_act += 1
            palete.area = bobine.largura
            bobine.save()
            palete.save()

        elif palete.num_bobines_act < palete.num_bobines:
            if bobine.ordem_id is None:
                bobine.ordem_id=palete.ordem_id_original
            bobine.posicao_palete = palete.num_bobines_act + 1
            bobine.palete = palete
            palete.num_bobines_act += 1
            palete.area = bobine.largura
            bobine.save()
            palete.save()

        else:
            return redirect('/producao/palete/')

    @classmethod
    def remove_bobine(cls, palete, bobine):
        bobine = Bobine.objects.get(pk=bobine)
        palete = Palete.objects.get(pk=palete)
        bobine.palete = None
        palete.num_bobines_act -= 1
        e_p = EtiquetaPalete.objects.get(palete=palete)

        bobine_filter = Bobine.objects.filter(palete=palete)
        bobine.save()
        palete.save()


class Emenda(models.Model):
    bobinagem = models.ForeignKey(Bobinagem, on_delete=models.CASCADE, verbose_name="Bobinagem", null=True, blank=True)
    bobine = models.ForeignKey(Bobine, on_delete=models.PROTECT, verbose_name="Bobine")
    num_emenda = models.IntegerField(verbose_name="Bobine nº", null=True, blank=True, default=0)
    emenda = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Emenda metros", null=True, blank=True, default=0)
    metros = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Metros gastos", blank=True, default=0)
    bobinagem_original_id = models.IntegerField(verbose_name="Bobinagem Original em caso de clone", null=True, blank=True) #ADDED
    troca_etiqueta = models.BooleanField(verbose_name="Indica se foi troca de eqiqueta", null=True, blank=True, default=False) #ADDED
    def __str__(self):
        return 'Emenda nº %s da bobinagem %s' % (self.num_emenda, self.bobinagem)

    # def get_absolute_url(self):
    #     return f"/producao/retrabalho/{self.bobinagem.id}"

# class Aging(models.Model):
#     pass


class EtiquetaRetrabalho(models.Model):
    IMP = (('Bobinadora_CAB_A4_200', 'BOBINADORA'), ('DM12_CAB_A4_200', 'DM12'))
    bobinagem = models.ForeignKey(Bobinagem, on_delete=models.CASCADE, verbose_name="Bobinagem")
    bobine = models.CharField(verbose_name="Bobine", max_length=200)
    data = models.DateField(auto_now_add=False, auto_now=False, default=datetime.date.today, verbose_name="Data")
    produto = models.CharField(verbose_name="Produto", max_length=200)
    largura_bobinagem = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Largura da bobinagem")
    diam = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Diâmetro")
    largura_bobine = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Largura")
    comp_total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Comprimento total")
    area = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Área")
    bobine_original_1 = models.CharField(verbose_name="Bobine1", max_length=200,  null=True, blank=True)
    bobine_original_2 = models.CharField(verbose_name="Bobine2", max_length=200,  null=True, blank=True)
    bobine_original_3 = models.CharField(verbose_name="Bobine3", max_length=200,  null=True, blank=True)
    emenda1 = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Emenda 1", default=0)
    metros1 = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Metros Consumidos 1", default=0)
    emenda2 = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Emenda 2", default=0)
    metros2 = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Metros Consumidos 2", default=0)
    emenda3 = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Emenda 3", default=0)
    metros3 = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Metros Consumidos 3", default=0)
    impressora = models.CharField(max_length=200, verbose_name="Impressora", null=True, blank=True, choices=IMP)
    num_copias = models.IntegerField(verbose_name="Nº de Cópias", unique=False, null=True, blank=True)
    estado_impressao = models.BooleanField(default=False, verbose_name="Imprimir")
    artigo = models.CharField(max_length=200, verbose_name="Artigo", null=True, blank=True)
    cod_cliente = models.CharField(max_length=200, verbose_name="Código do Cliente", null=True, blank=True)

    def __str__(self):
        return self.bobine


class EtiquetaPalete(models.Model):
    IMP = (('Bobinadora_CAB_A4_200', 'BOBINADORA'), ('DM12_CAB_A4_200', 'DM12'))
    palete = models.ForeignKey(Palete, on_delete=models.CASCADE, verbose_name="Palete")
    palete_nome = models.CharField(verbose_name="Palete nome", max_length=200)
    produto = models.CharField(verbose_name="Produto", max_length=200)
    largura_bobine = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Largura")
    diam_min = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Diâmetro minimo", null=True, blank=True)
    diam_max = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Diâmetro máximo", null=True, blank=True)
    cliente = models.CharField(verbose_name="Cliente", max_length=200)
    bobine1 = models.CharField(verbose_name="Bobine nº 1", max_length=200, null=True, blank=True)
    bobine2 = models.CharField(verbose_name="Bobine nº 2", max_length=200, null=True, blank=True)
    bobine3 = models.CharField(verbose_name="Bobine nº 3", max_length=200, null=True, blank=True)
    bobine4 = models.CharField(verbose_name="Bobine nº 4", max_length=200, null=True, blank=True)
    bobine5 = models.CharField(verbose_name="Bobine nº 5", max_length=200, null=True, blank=True)
    bobine6 = models.CharField(verbose_name="Bobine nº 6", max_length=200, null=True, blank=True)
    bobine7 = models.CharField(verbose_name="Bobine nº 7", max_length=200, null=True, blank=True)
    bobine8 = models.CharField(verbose_name="Bobine nº 8", max_length=200, null=True, blank=True)
    bobine9 = models.CharField(verbose_name="Bobine nº 9", max_length=200, null=True, blank=True)
    bobine10 = models.CharField(verbose_name="Bobine nº 10", max_length=200, null=True, blank=True)
    bobine11 = models.CharField(verbose_name="Bobine nº 11", max_length=200, null=True, blank=True)
    bobine12 = models.CharField(verbose_name="Bobine nº 12", max_length=200, null=True, blank=True)
    bobine13 = models.CharField(verbose_name="Bobine nº 13", max_length=200, null=True, blank=True)
    bobine14 = models.CharField(verbose_name="Bobine nº 14", max_length=200, null=True, blank=True)
    bobine15 = models.CharField(verbose_name="Bobine nº 15", max_length=200, null=True, blank=True)
    bobine16 = models.CharField(verbose_name="Bobine nº 16", max_length=200, null=True, blank=True)
    bobine17 = models.CharField(verbose_name="Bobine nº 17", max_length=200, null=True, blank=True)
    bobine18 = models.CharField(verbose_name="Bobine nº 18", max_length=200, null=True, blank=True)
    bobine19 = models.CharField(verbose_name="Bobine nº 19", max_length=200, null=True, blank=True)
    bobine20 = models.CharField(verbose_name="Bobine nº 20", max_length=200, null=True, blank=True)
    bobine21 = models.CharField(verbose_name="Bobine nº 21", max_length=200, null=True, blank=True)
    bobine22 = models.CharField(verbose_name="Bobine nº 22", max_length=200, null=True, blank=True)
    bobine23 = models.CharField(verbose_name="Bobine nº 23", max_length=200, null=True, blank=True)
    bobine24 = models.CharField(verbose_name="Bobine nº 24", max_length=200, null=True, blank=True)
    bobine25 = models.CharField(verbose_name="Bobine nº 25", max_length=200, null=True, blank=True)
    bobine26 = models.CharField(verbose_name="Bobine nº 26", max_length=200, null=True, blank=True)
    bobine27 = models.CharField(verbose_name="Bobine nº 27", max_length=200, null=True, blank=True)
    bobine28 = models.CharField(verbose_name="Bobine nº 28", max_length=200, null=True, blank=True)
    bobine29 = models.CharField(verbose_name="Bobine nº 29", max_length=200, null=True, blank=True)
    bobine30 = models.CharField(verbose_name="Bobine nº 30", max_length=200, null=True, blank=True)
    bobine31 = models.CharField(verbose_name="Bobine nº 31", max_length=200, null=True, blank=True)
    bobine32 = models.CharField(verbose_name="Bobine nº 32", max_length=200, null=True, blank=True)
    bobine33 = models.CharField(verbose_name="Bobine nº 33", max_length=200, null=True, blank=True)
    bobine34 = models.CharField(verbose_name="Bobine nº 34", max_length=200, null=True, blank=True)
    bobine35 = models.CharField(verbose_name="Bobine nº 35", max_length=200, null=True, blank=True)
    bobine36 = models.CharField(verbose_name="Bobine nº 36", max_length=200, null=True, blank=True)
    bobine37 = models.CharField(verbose_name="Bobine nº 37", max_length=200, null=True, blank=True)
    bobine38 = models.CharField(verbose_name="Bobine nº 38", max_length=200, null=True, blank=True)
    bobine39 = models.CharField(verbose_name="Bobine nº 39", max_length=200, null=True, blank=True)
    bobine40 = models.CharField(verbose_name="Bobine nº 40", max_length=200, null=True, blank=True)
    bobine41 = models.CharField(verbose_name="Bobine nº 41", max_length=200, null=True, blank=True)
    bobine42 = models.CharField(verbose_name="Bobine nº 42", max_length=200, null=True, blank=True)
    bobine43 = models.CharField(verbose_name="Bobine nº 43", max_length=200, null=True, blank=True)
    bobine44 = models.CharField(verbose_name="Bobine nº 44", max_length=200, null=True, blank=True)
    bobine45 = models.CharField(verbose_name="Bobine nº 45", max_length=200, null=True, blank=True)
    bobine46 = models.CharField(verbose_name="Bobine nº 46", max_length=200, null=True, blank=True)
    bobine47 = models.CharField(verbose_name="Bobine nº 47", max_length=200, null=True, blank=True)
    bobine48 = models.CharField(verbose_name="Bobine nº 48", max_length=200, null=True, blank=True)
    bobine49 = models.CharField(verbose_name="Bobine nº 49", max_length=200, null=True, blank=True)
    bobine50 = models.CharField(verbose_name="Bobine nº 50", max_length=200, null=True, blank=True)
    bobine51 = models.CharField(verbose_name="Bobine nº 51", max_length=200, null=True, blank=True)
    bobine52 = models.CharField(verbose_name="Bobine nº 52", max_length=200, null=True, blank=True)
    bobine53 = models.CharField(verbose_name="Bobine nº 53", max_length=200, null=True, blank=True)
    bobine54 = models.CharField(verbose_name="Bobine nº 54", max_length=200, null=True, blank=True)
    bobine55 = models.CharField(verbose_name="Bobine nº 55", max_length=200, null=True, blank=True)
    bobine56 = models.CharField(verbose_name="Bobine nº 56", max_length=200, null=True, blank=True)
    bobine57 = models.CharField(verbose_name="Bobine nº 57", max_length=200, null=True, blank=True)
    bobine58 = models.CharField(verbose_name="Bobine nº 58", max_length=200, null=True, blank=True)
    bobine59 = models.CharField(verbose_name="Bobine nº 59", max_length=200, null=True, blank=True)
    bobine60 = models.CharField(verbose_name="Bobine nº 60", max_length=200, null=True, blank=True)
    artigo = models.CharField(max_length=200, verbose_name="Artigo", null=True, blank=True)
    cod_cliente = models.CharField(max_length=200, verbose_name="Código do Cliente", null=True, blank=True)
    impressora = models.CharField(max_length=200, verbose_name="Impressora", null=True, blank=True, choices=IMP)
    num_copias = models.IntegerField(verbose_name="Nº de Cópias", unique=False, null=True, blank=True)
    estado_impressao = models.BooleanField(default=False, verbose_name="Imprimir")
    bobines = models.JSONField(blank=True, null=True) #ADDED
    to_sign = models.IntegerField(verbose_name="Assinar", unique=False, null=True, blank=True) #ADDED
    def __str__(self):
        return self.palete_nome


class EtiquetaFinal(models.Model):
    # IMP = (('ARMAZEM_CAB_SQUIX_6.3_200', 'ARMAZEM'))
    palete = models.ForeignKey(Palete, on_delete=models.CASCADE, verbose_name="Palete")
    palete_nome = models.CharField(verbose_name="Palete nome", max_length=200)
    produto = models.CharField(verbose_name="Produto", max_length=200)
    largura_bobine = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Largura")
    diam_min = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Diâmetro minimo", null=True, blank=True)
    diam_max = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Diâmetro máximo", null=True, blank=True)
    cod_cliente = models.IntegerField(unique=False, verbose_name="Cód. Cliente")
    cod_cliente_cliente = models.CharField(verbose_name="Cód. Cliente do Cliente", max_length=200, null=True, blank=True)
    pais = models.CharField(verbose_name="Produido em:", max_length=200, default="Portugal")
    poroduzido_por = models.CharField(verbose_name="Produido por:", max_length=200, default="Elastictek")
    core = models.DecimalField(max_digits=4, decimal_places=1, verbose_name="Core")
    area = models.DecimalField(max_digits=15, decimal_places=1, verbose_name="Área")
    comp = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Comprimento")
    prf = models.CharField(verbose_name="Proforma", max_length=200)
    num_bobines = models.IntegerField(unique=False, verbose_name="Nº de bobines")
    palete_num = models.IntegerField(unique=False, verbose_name="Paleten nº")
    palete_total = models.IntegerField(unique=False, verbose_name="Paleten total")
    peso_liquido = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Peso Líquido")
    peso_bruto = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Peso Bruto")
    data_prod = models.DateField(auto_now_add=False, auto_now=False, verbose_name="Data de produção")
    data_validade = models.DateField(auto_now_add=False, auto_now=False, verbose_name="Validade")
    gsm = models.IntegerField(unique=False, verbose_name="Gramagem")
    cont = models.PositiveIntegerField(verbose_name="Contador", unique=True, default=0)
    control = models.PositiveIntegerField(verbose_name="Variável de controlo", unique=False, default=0)
    gtin = models.CharField(verbose_name="GTIN", max_length=14, unique=False, default="")
    sscc = models.CharField(verbose_name="SSCC", max_length=18, unique=False, default="")
    activa = models.BooleanField(default=True, verbose_name="Activa")
    impressora = models.CharField(max_length=200, verbose_name="Impressora", null=True, blank=True)
    num_copias = models.IntegerField(verbose_name="Nº de Cópias", unique=False, null=True, blank=True)
    estado_impressao = models.BooleanField(default=False, verbose_name="Imprimir")
    order_num = models.CharField(max_length=100, null=True, blank=True, verbose_name="Order Number")
    turno = models.CharField(max_length=1, null=True, blank=True, verbose_name="Turno")

    def __str__(self):
        return self.palete_nome


class InventarioBobinesDM(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    timestamp = models.DateTimeField(auto_now_add=True)
    bobine = models.ForeignKey(Bobine, on_delete=models.PROTECT, verbose_name="Bobine")
    nome = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.nome

    class Meta:
        verbose_name_plural = "Inventário Bobines DM"


class InventarioPaletesCliente(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    timestamp = models.DateTimeField(auto_now_add=True)
    palete = models.ForeignKey(Palete, on_delete=models.PROTECT, verbose_name="Palete")
    nome = models.CharField(max_length=15, blank=True, null=True)
    artigo = models.ForeignKey(Artigo, on_delete=models.PROTECT, verbose_name="Artigo", null=True, blank=True)
    cliente = models.CharField(max_length=50, blank=True, null=True)
    comp_total = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Comprimento Total", null=True, blank=True)
    area = models.DecimalField(max_digits=15, decimal_places=1, verbose_name="Área", null=True, blank=True)
    largura_bobine = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Largura", null=True, blank=True)
    diam_min = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Diâmetro minimo", null=True, blank=True)
    diam_max = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Diâmetro máximo", null=True, blank=True)
    core_bobines = models.CharField(max_length=1, verbose_name="Core das bobines", null=True, blank=True)

    def __str__(self):
        return self.nome

    class Meta:
        verbose_name_plural = "Intentário Paletes Cliente"


class MovimentosBobines(models.Model):
    bobine = models.ForeignKey(Bobine, on_delete=models.CASCADE, verbose_name="Bobine")
    palete = models.ForeignKey(Palete, on_delete=models.CASCADE, verbose_name="Palete", null=True, blank=True)
    timestamp = models.DateTimeField()
    destino = models.CharField(max_length=200, verbose_name="Destino", null=True, blank=True)

    class Meta:
        verbose_name_plural = "Movimentos de Bobines"
        ordering = ['-timestamp']


class ProdutoGranulado(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    timestamp = models.DateTimeField(auto_now_add=True)
    produto_granulado = models.CharField(max_length=15, verbose_name="Produto Granulado")

    def __str__(self):
        return self.produto_granulado

    class Meta:
        verbose_name_plural = "Produto Granulado"
        ordering = ['-timestamp']


class Reciclado(models.Model):
    STATUS = (('G', 'G'),  ('R', 'R'), ('NOK', 'NOK'))
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    timestamp = models.DateTimeField(verbose_name="Created")
    timestamp_inicio = models.DateTimeField(null=True, blank=True)
    timestamp_edit = models.DateTimeField(verbose_name="Edited")
    produto_granulado = models.ForeignKey(ProdutoGranulado, on_delete=models.PROTECT, verbose_name="Produto Granulado")
    lote = models.CharField(max_length=15, unique=True)
    tara = models.CharField(max_length=5, unique=False)
    num = models.PositiveIntegerField(verbose_name="Número", default=0)
    estado = models.CharField(max_length=4, choices=STATUS, default='G', verbose_name="Estado")
    peso = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Peso")
    obs = models.TextField(max_length=500, null=True, blank=True, verbose_name="Observações")
    status = models.PositiveIntegerField(verbose_name="Estado", default=0) #ADDED
    reported = models.IntegerField(verbose_name="Indica se o reciclado foi sincronizado com o SAGE", null=True) #ADDED
    def __str__(self):
        return self.lote

    class Meta:
        verbose_name_plural = "Reciclado"
        ordering = ['-timestamp']

class RecicladoLotes(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    timestamp = models.DateTimeField(verbose_name="Created")
    lote = models.CharField(max_length=50, unique=True)
    itm = models.CharField(max_length=100, null=True, blank=True)
    itm_des = models.CharField(max_length=250, null=True, blank=True)
    source = models.CharField(max_length=15)
    qtd = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Quantidade")
    unit = models.CharField(max_length=4, verbose_name="Unidade Medida")
    reciclado = models.ForeignKey(Reciclado, on_delete=models.PROTECT, verbose_name="Reciclado")
    def __str__(self):
        return self.lote


class MovimentoMP(models.Model):
    TIPO = (('Entrada', 'Entrada'), ('NOK', 'NOK'))
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    timestamp = models.DateTimeField(auto_now_add=True)
    lote = models.CharField(max_length=30, unique=False, verbose_name="Lote")
    tipo = models.CharField(max_length=7, choices=TIPO, default='Entrada', verbose_name="Tipo de movimento")
    motivo = models.TextField(max_length=500, null=True, blank=True, verbose_name="Motivo")

    def __str__(self):
        return self.lote

    class Meta:
        verbose_name_plural = "Movimentos de MP"
        ordering = ['-timestamp']


class EtiquetaReciclado(models.Model):
    # IMP = (('ARMAZEM_CAB_SQUIX_6.3_200', 'ARMAZEM'))
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username")
    # timestamp       = models.DateTimeField(unique=False, null=True, blank=True)
    inicio = models.DateTimeField()
    fim = models.DateTimeField()
    reciclado = models.ForeignKey(Reciclado, on_delete=models.PROTECT, verbose_name="Reciclado")
    lote = models.CharField(max_length=30, unique=True, verbose_name="Lote de Reciclado")
    produto_granulado = models.CharField(max_length=20, verbose_name="Produto Granulado")
    peso = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Peso")
    impressora = models.CharField(max_length=200, verbose_name="Impressora", null=True, blank=True)
    num_copias = models.IntegerField(verbose_name="Nº de Cópias", unique=False, null=True, blank=True)
    estado_impressao = models.BooleanField(default=False, verbose_name="Imprimir")

    def __str__(self):
        return self.lote




    