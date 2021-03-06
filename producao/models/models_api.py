#from msilib.schema import CreateFolder
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
class QRCodes(models.Model):
    cod = models.CharField(max_length=20,verbose_name="Código", null=False)
    description = models.CharField(max_length=100,verbose_name="Descrição", null=False)
    status = models.SmallIntegerField(default=0, verbose_name="Status")


class LotesLinha(models.Model):
    n_lote = models.CharField(max_length=100,verbose_name="Nº Lote", null=True)
    artigo_cod = models.CharField(max_length=25,verbose_name="Código Artigo", null=True) #ADDED - CÓDIGO ARTIGO SAGE ID
    qty_lote = models.DecimalField(default=0, verbose_name="Quantidade Total do Lote", max_digits=12, decimal_places=5, null=True)
    qty_doser = models.DecimalField(default=0, verbose_name="Quantidade consumida no doseador (consumida durante a produção)", max_digits=12, decimal_places=5, null=True)
    qty_consumed = models.DecimalField(default=0, verbose_name="Quantidade consumida (consumida durante a produção)", max_digits=12, decimal_places=5, null=True)
    qty_acumulated = models.DecimalField(default=0, verbose_name="Quantidade Acumulada", max_digits=12, decimal_places=5, null=True)
    qty_rest = models.DecimalField(default=0, verbose_name="Quantidade Acumulada Anterior )", max_digits=12, decimal_places=5, null=True)
    status = models.SmallIntegerField(default=0, verbose_name="Status") #(-1 - anulado, 0 não está na linha de produção, 1 na linha de produção)
    type_mov = models.CharField(max_length=4,verbose_name="Tipo de Movimento", null=False) #IN - INPUT , OUT - OUTPUT , CONS - CONSUMED , CORR - MANUAL CONSUME CORRECTION   
    item_id = models.IntegerField(verbose_name="Item ID", null=True) #(ID do Item da Formulação - (No caso da formulação ter alterado durante a produção este ID não corresponde ao id do item da formulação no planeamento))
    t_stamp = models.DateTimeField(blank=False, null=False)
    formulacao = models.ForeignKey('producao.Formulacao', on_delete=models.PROTECT, verbose_name="Formulação", null=True)
    cs = models.ForeignKey('CurrentSettings', on_delete=models.PROTECT, verbose_name="Current Settings", null=True)
    ig_bobinagem_id = models.IntegerField(verbose_name="Id IG BOBINAGEM", null=True)
    audit_cs = models.ForeignKey('AuditCurrentSettings', on_delete=models.PROTECT, verbose_name="Audit Current Settings", null=True)


class LotesDosers(models.Model):
    n_lote = models.CharField(max_length=100,verbose_name="Nº Lote", null=True)
    doser = models.CharField(max_length=2,verbose_name="Doseadora", null=False)
    artigo_cod = models.CharField(max_length=25,verbose_name="Código Artigo", null=True) #ADDED - CÓDIGO ARTIGO SAGE ID
    qty_total_lote = models.DecimalField(default=0, verbose_name="Quantidade Total do Lote", max_digits=12, decimal_places=5, null=True)
    qty_lote = models.DecimalField(default=0, verbose_name="Quantidade Total do Lote por doseador", max_digits=12, decimal_places=5, null=True)
    qty_doser = models.DecimalField(default=0, verbose_name="Quantidade consumida no doseador (consumida durante a produção)", max_digits=12, decimal_places=5, null=True)
    qty_consumed = models.DecimalField(default=0, verbose_name="Quantidade consumida (consumida durante a produção)", max_digits=12, decimal_places=5, null=True)
    qty_acumulated = models.DecimalField(default=0, verbose_name="Quantidade Acumulada", max_digits=12, decimal_places=5, null=True)
    qty_rest = models.DecimalField(default=0, verbose_name="Quantidade Acumulada Anterior )", max_digits=12, decimal_places=5, null=True)
    status = models.SmallIntegerField(default=0, verbose_name="Status") #(-1 - anulado, 0 não está na linha de produção, 1 na linha de produção)
    type_mov = models.CharField(max_length=4,verbose_name="Tipo de Movimento", null=False) #IN - INPUT , OUT - OUTPUT , CONS - CONSUMED , CORR - MANUAL CONSUME CORRECTION   
    item_id = models.IntegerField(verbose_name="Item ID", null=True) #(ID do Item da Formulação - (No caso da formulação ter alterado durante a produção este ID não corresponde ao id do item da formulação no planeamento))
    t_stamp = models.DateTimeField(blank=False, null=False)
    t_stamp_fix = models.DateTimeField(null=True)
    formulacao = models.ForeignKey('producao.Formulacao', on_delete=models.PROTECT, verbose_name="Formulação", null=True)
    cs = models.ForeignKey('CurrentSettings', on_delete=models.PROTECT, verbose_name="Current Settings", null=True)
    ig_bobinagem_id = models.IntegerField(verbose_name="Id IG BOBINAGEM", null=True)
    order = models.IntegerField(verbose_name="Ordem principal", null=True)
    sub_order = models.IntegerField(verbose_name="sub Ordem", null=True)
    audit_cs = models.ForeignKey('AuditCurrentSettings', on_delete=models.PROTECT, verbose_name="Audit Current Settings", null=True)


class BobinagemConsumos(models.Model):
    ig_bobinagem_id = models.IntegerField(verbose_name="Id IG BOBINAGEM", null=True)
    A1 = models.DecimalField(verbose_name="A1", max_digits=12, decimal_places=5, null=True)
    A2 = models.DecimalField(verbose_name="A2", max_digits=12, decimal_places=5, null=True)
    A3 = models.DecimalField(verbose_name="A3", max_digits=12, decimal_places=5, null=True)
    A4 = models.DecimalField(verbose_name="A4", max_digits=12, decimal_places=5, null=True)
    A5 = models.DecimalField(verbose_name="A5", max_digits=12, decimal_places=5, null=True)
    A6 = models.DecimalField(verbose_name="A6", max_digits=12, decimal_places=5, null=True)
    B1 = models.DecimalField(verbose_name="B1", max_digits=12, decimal_places=5, null=True)
    B2 = models.DecimalField(verbose_name="B2", max_digits=12, decimal_places=5, null=True)
    B3 = models.DecimalField(verbose_name="B3", max_digits=12, decimal_places=5, null=True)
    B4 = models.DecimalField(verbose_name="B4", max_digits=12, decimal_places=5, null=True)
    B5 = models.DecimalField(verbose_name="B5", max_digits=12, decimal_places=5, null=True)
    B6 = models.DecimalField(verbose_name="B6", max_digits=12, decimal_places=5, null=True)
    C1 = models.DecimalField(verbose_name="C1", max_digits=12, decimal_places=5, null=True)
    C2 = models.DecimalField(verbose_name="C2", max_digits=12, decimal_places=5, null=True)
    C3 = models.DecimalField(verbose_name="C3", max_digits=12, decimal_places=5, null=True)
    C4 = models.DecimalField(verbose_name="C4", max_digits=12, decimal_places=5, null=True)
    C5 = models.DecimalField(verbose_name="C5", max_digits=12, decimal_places=5, null=True)
    C6 = models.DecimalField(verbose_name="C6", max_digits=12, decimal_places=5, null=True)
    metros = models.IntegerField(verbose_name="Metros", null=True)
    nw_inf = models.IntegerField(verbose_name="Id IG BOBINAGEM", null=True)
    nw_sup = models.IntegerField(verbose_name="Id IG BOBINAGEM", null=True)
    peso = models.DecimalField(verbose_name="Peso", max_digits=12, decimal_places=5, null=True)
    diametro = models.DecimalField(verbose_name="Diametro", max_digits=12, decimal_places=5, null=True)
    inicio = models.DateTimeField(verbose_name="Data Início", null=True, blank=True)
    fim = models.DateTimeField(verbose_name="Data Fim", null=True, blank=True)
    bobinagem = models.ForeignKey('producao.Bobinagem', on_delete=models.PROTECT, verbose_name="Bobinagem", null=True, blank=True)

class Produtos(models.Model):
    produto_cod = models.CharField(max_length=80,verbose_name="Código Produto", null=False) #ADDED - CÓDIGO PRODUTO

class BaseTempAggOrdemFabrico(models.Model):
    cod = models.CharField(max_length=25,verbose_name="Código Agg", null=False)
    formulacao = models.ForeignKey('producao.Formulacao', on_delete=models.PROTECT, verbose_name="Formulação", null=True, blank=True)
    gamaoperatoria = models.ForeignKey('producao.GamaOperatoria', on_delete=models.PROTECT, verbose_name="Gama Operatória", null=True, blank=True)
    nonwovens = models.ForeignKey('producao.ArtigoNonwovens', on_delete=models.PROTECT, verbose_name="Nonwovens", null=True, blank=True)
    artigospecs = models.ForeignKey('producao.ArtigoSpecs', on_delete=models.PROTECT, verbose_name="Especificações do Artigo", null=True, blank=True)
    cortes = models.ForeignKey('producao.Cortes', on_delete=models.PROTECT, verbose_name="Cortes", null=True, blank=True)
    cortesordem = models.ForeignKey('producao.CortesOrdem', on_delete=models.PROTECT, verbose_name="Posicionamento dos Cortes", null=True, blank=True)
    sentido_enrolamento = models.CharField(verbose_name="Sentido de Enrolamento", max_length=100, null=True)
    amostragem = models.IntegerField(verbose_name="Amostragem", null=True)
    observacoes=models.TextField(max_length = 1000, null = True, blank = True, verbose_name = "Observações", default = "")
    year = models.IntegerField(verbose_name="Ano", null=False, default=datetime.date.today().year)
    status = models.SmallIntegerField(default=0, verbose_name="Status") #ADDED - Status [0 - A Validar/Aberta | 1 - Na Produção/Aberta | 5 - A Validar/Reaberta | 7 - Em Produção | 9 - Fechada | -1 - Disabled],
    start_prev_date = models.DateTimeField(verbose_name="Data Início Prevista", null=True, blank=True)
    end_prev_date = models.DateTimeField(verbose_name="Data Fim Prevista", null=True, blank=True)
    start_date = models.DateTimeField(verbose_name="Data Início", null=True, blank=True)
    end_date = models.DateTimeField(verbose_name="Data Fim", null=True, blank=True)
    horas_previstas_producao= models.DecimalField(default=0, verbose_name="Horas previstas de produção", null=True, blank=True,decimal_places=2,max_digits=10)
    class Meta:
        abstract = True

class TempAggOrdemFabrico(BaseTempAggOrdemFabrico):
    pass

class TempOrdemFabrico(models.Model):
    of_id = models.CharField(max_length=25,verbose_name="Ordem de Produção", null=True) #ADDED - ORDEM FABRICO SAGE ID
    order_cod = models.CharField(max_length=25,verbose_name="Código Encomenda", null=True) #ADDED - CÓDIGO ENCOMENDA SAGE ID
    prf_cod = models.CharField(max_length=25,verbose_name="Código PRF", null=True) #ADDED - CÓDIGO PRF SAGE ID
    cliente_cod = models.CharField(max_length=15,verbose_name="Código Cliente", null=True) #ADDED - CÓDIGO CLIENTE SAGE ID
    cliente_nome = models.CharField(max_length=80,verbose_name="Nome Cliente", null=True) #ADDED - NOME CLIENTE SAGE NOME
    produto_alt = models.CharField(max_length=200,verbose_name="Designação de Produto Alternativo", null=True) #ADDED - Designação do Produto Alternativo
    item_cod = models.CharField(max_length=25,verbose_name="Código Artigo", null=True) #ADDED - CÓDIGO ARTIGO SAGE ID
    item_id = models.IntegerField(verbose_name="Id Artigo", null=True) #ADDED - Id ARTIGO
    produto = models.ForeignKey('producao.Produtos',on_delete=models.PROTECT,verbose_name="Id Produto") #ADDED - ID PRODUTO
    qty_encomenda = models.DecimalField(verbose_name="Quantidade da Encomenda", max_digits=12, decimal_places=5, null=True)
    linear_meters = models.DecimalField(verbose_name="Metros lineares", max_digits=12, decimal_places=5, null=True)
    sqm_bobine = models.DecimalField(verbose_name="Metros Quadrados por Bobine", max_digits=12, decimal_places=5, null=True)
    core_cod = models.CharField(verbose_name="SAGE ITMREF_0 Código Matéria Prima (CORE)", max_length=25, null=True)
    core_des = models.CharField(verbose_name="SAGE ITMDES1_0 Designação Matéria Prima (CORE)", max_length=100, null=True)
    #sqm_palete = models.DecimalField(verbose_name="Metros Quadrados por Palete", max_digits=12, decimal_places=5, null=True)
    #sqm_contentor = models.DecimalField(verbose_name="Metros Quadrados por Camião/Contentor", max_digits=12, decimal_places=5, null=True)
    n_voltas = models.DecimalField(verbose_name="Nº Voltas", max_digits=12, decimal_places=5, null=True)
    n_paletes_total = models.DecimalField(verbose_name="Nº de Paletes Total", max_digits=12, decimal_places=5, null=True)
    n_paletes = models.CharField(max_length=5000,verbose_name="N Paletes", null=True)
    paletizacao = models.ForeignKey('producao.Paletizacao', on_delete=models.PROTECT, verbose_name="Paletização", null=True, blank=True)
    emendas = models.ForeignKey('producao.Emendas', on_delete=models.PROTECT, verbose_name="Emendas", null=True, blank=True)
    agg_of = models.ForeignKey('producao.TempAggOrdemFabrico', on_delete=models.PROTECT, verbose_name="Aggregate Ordem de Fabrico", null=True, blank=True)
    agg_ofid_original = models.IntegerField(verbose_name="Agg Original", null=True) #Apenas como referência, mas utilizado para os lookups...
    aggregated = models.SmallIntegerField(verbose_name="Ordem de Fabrico agregada (0/1)", default=0)
    class Meta:
        unique_together = (('of_id', 'item_cod'))

class BaseCurrentSettings(models.Model):
    agg_of = models.ForeignKey('producao.TempAggOrdemFabrico', on_delete=models.PROTECT, verbose_name="Aggregate Ordem de Fabrico", null=True, blank=True)
    produto = models.ForeignKey('producao.Produtos', on_delete=models.PROTECT, verbose_name="Produto", null=True, blank=True)
    produto_cod = models.CharField(max_length=200,verbose_name="Codigo do Produto", null=True)
    formulacao = models.JSONField(blank=True, null=True)
    gamaoperatoria = models.JSONField(blank=True, null=True)
    nonwovens = models.JSONField(blank=True, null=True)
    artigospecs = models.JSONField(blank=True, null=True)
    cortes = models.JSONField(blank=True, null=True)
    cortesordem = models.JSONField(blank=True, null=True)
    cores = models.JSONField(blank=True, null=True)
    paletizacao = models.JSONField(blank=True, null=True)
    emendas = models.JSONField(blank=True, null=True)
    limites = models.JSONField(blank=True, null=True)
    lotes = models.JSONField(blank=True, null=True)
    dosers = models.JSONField(blank=True, null=True)
    ofs = models.JSONField(blank=True, null=True)
    ofs_ordem = models.JSONField(blank=True, null=True)
    paletesstock = models.JSONField(blank=True, null=True)
    status = models.SmallIntegerField(default=0, verbose_name="Status") #ADDED 0 Suspended/Stopped | 1 In Use/Active | 3 In Progress | 9 Finished
    observacoes=models.TextField(max_length = 1000, null = True, blank = True, verbose_name = "Observações", default = "")
    start_prev_date = models.DateTimeField(verbose_name="Data Início Prevista", null=True, blank=True)
    end_prev_date = models.DateTimeField(verbose_name="Data Fim Prevista", null=True, blank=True)
    horas_previstas_producao= models.IntegerField(default=0, verbose_name="Horas previstas de produção", null=True, blank=True)
    sentido_enrolamento = models.CharField(verbose_name="Sentido de Enrolamento", max_length=100, null=True)
    amostragem = models.IntegerField(verbose_name="Amostragem", null=True)
    gsm = models.IntegerField(verbose_name="Gramagem", null=True)
    user = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Username", null=True)
    type_op = models.CharField(max_length=45, blank=True, null=True)
    created = models.DateTimeField(blank=True, null=True)
    class Meta:
        abstract = True

class AuditCurrentSettings(BaseCurrentSettings):
    timestamp = models.DateTimeField(blank=True, null=True)
    action = models.CharField(max_length=8, blank=True, null=True)
    contextid = models.IntegerField(blank=True, null=True)
    class Meta:
        db_table = 'audit_currentsettings'

class CurrentSettings(BaseCurrentSettings):
    pass

class Attachments(models.Model):
    of = models.ForeignKey('producao.TempOrdemFabrico', on_delete=models.PROTECT, verbose_name="Temporary Ordem fabrico")
    tipo_doc = models.CharField(verbose_name="Tipo Documento", max_length=100)
    path=models.TextField(max_length = 1000, verbose_name = "Caminho", default = "")
    created_date = models.DateTimeField(auto_now=True, verbose_name="Data Criação")
    

class Emendas(models.Model):
    designacao = models.CharField(verbose_name="Designação", max_length=20,null=True)
    cliente_cod = models.PositiveIntegerField(verbose_name="SAGE BPCORD_0 Código de cliente", unique=False, null=True)
    cliente_nome = models.CharField(max_length=80,verbose_name="Nome Cliente", null=True) #ADDED - NOME CLIENTE SAGE NOME
    artigo_cod = models.CharField(verbose_name="SAGE ITMREF_0 Código Produto Acabado", max_length=25)
    tipo_emenda = models.CharField(verbose_name="Tipo Emenda", max_length=35)
    maximo = models.SmallIntegerField(verbose_name="Máximo Emendas", default=0)
    emendas_rolo = models.SmallIntegerField(verbose_name="Emendas por Rolo")
    paletes_contentor = models.SmallIntegerField(verbose_name="Emendas Paletes por Contentor")
    hashcode = models.CharField(verbose_name="hashcode", max_length=25, null=True, blank=True)
    class Meta:
        unique_together = (('designacao', 'cliente_cod', 'artigo_cod'))

class Paletizacao(models.Model):
    designacao = models.CharField(verbose_name="Designação", max_length=20,null=True)
    cliente_cod = models.PositiveIntegerField(verbose_name="SAGE BPCORD_0 Código de cliente", unique=False, null=True)
    cliente_nome = models.CharField(max_length=80,verbose_name="Nome Cliente", null=True) #ADDED - NOME CLIENTE SAGE NOME
    artigo_cod = models.CharField(verbose_name="SAGE ITMREF_0 Código Produto Acabado", max_length=25)
    contentor_id = models.CharField(verbose_name="Id do Contentor", max_length=8)
    filmeestiravel_bobines = models.SmallIntegerField(verbose_name="Filme Estirável por Palete", default=0)
    filmeestiravel_exterior = models.SmallIntegerField(verbose_name="Filme Estirável Exterior", default=0)
    cintas = models.SmallIntegerField(verbose_name="Cintas por Palete Sim/Não", default=0)
    ncintas = models.SmallIntegerField(verbose_name="Número ce Cintas por Palete", default=0)
    cintas_palete = models.SmallIntegerField(verbose_name="Aplicar Cintas em 1-Ambas as Paletes | 2-Palete Superior | 3-Palete Inferior", default=1)
    paletes_sobrepostas = models.SmallIntegerField(verbose_name="Paletes Sobrepostas", default=0)
    npaletes = models.SmallIntegerField(verbose_name="Número Paletes por Contentor")
    palete_maxaltura = models.DecimalField(verbose_name="Altura Máxima da Palete", max_digits=4, decimal_places=2)
    netiquetas_bobine = models.SmallIntegerField(verbose_name="Número Etiquetas por Bobine")
    netiquetas_lote = models.SmallIntegerField(verbose_name="Número de Etiquetas do Lote")
    netiquetas_final = models.SmallIntegerField(verbose_name="Número de Etiquetas Final")
    folha_identificativa = models.SmallIntegerField(verbose_name="Folha Identificativa de Palete", default=0)
    versao = models.SmallIntegerField(verbose_name="Versão", default=1)

    class Meta:
        unique_together = (('designacao', 'cliente_cod', 'artigo_cod','contentor_id'))
    
    def __str__(self):
         return self.contentor_id

class PaletizacaoDetails(models.Model):
    paletizacao = models.ForeignKey(Paletizacao, on_delete=models.PROTECT, verbose_name="Paletização", null=False, blank=False)
    item_id = models.SmallIntegerField(verbose_name="Id do Item")
    item_des = models.CharField(verbose_name="Item designação", max_length=100)
    item_order = models.SmallIntegerField(verbose_name="Item Ordem")
    item_numbobines = models.SmallIntegerField(verbose_name="Item Número de Bobines", null=True)
    item_paletesize = models.CharField(verbose_name="Item Tamanho Palete", max_length=20, null=True)

    def __str__(self):
         return self.item_id

class ArtigoNonwovens(models.Model):
    designacao = models.CharField(verbose_name="Designação", max_length=50,null=True)
    versao = models.SmallIntegerField(verbose_name="Versão", default=1)
    #artigo_cod = models.CharField(verbose_name="SAGE ITMREF_0 Código Produto Acabado", max_length=25)
    produto = models.ForeignKey('producao.Produtos',on_delete=models.PROTECT,verbose_name="Id Produto") #ADDED - ID PRODUTO
    created_date = models.DateTimeField(auto_now=True, verbose_name="Data Criação")
    updated_date = models.DateTimeField(auto_now=True, verbose_name="Data Alteração")
    nw_cod_sup = models.CharField(verbose_name="SAGE ITMREF_0 Código Matéria Prima (NONWOVEN)", max_length=25)
    nw_des_sup = models.CharField(verbose_name="SAGE ITMDES1_0 Designação Matéria Prima (NONWOVEN)", max_length=100, null=True)
    nw_cod_inf = models.CharField(verbose_name="SAGE ITMREF_0 Código Matéria Prima (NONWOVEN)", max_length=25)
    nw_des_inf = models.CharField(verbose_name="SAGE ITMDES1_0 Designação Matéria Prima (NONWOVEN)", max_length=100, null=True)

    class Meta:
        unique_together = (('produto_id', 'designacao'))

class Formulacao(models.Model):
    designacao = models.CharField(verbose_name="Designação", max_length=50,null=True)
    versao = models.SmallIntegerField(verbose_name="Versão", default=1)
    #artigo_cod = models.CharField(verbose_name="SAGE ITMREF_0 Código Produto Acabado", max_length=25)
    produto = models.ForeignKey('producao.Produtos',on_delete=models.PROTECT,verbose_name="Id Produto") #ADDED - ID PRODUTO
    cliente_cod = models.CharField(max_length=15,verbose_name="Código Cliente", null=True)
    cliente_nome = models.CharField(max_length=80,verbose_name="Nome Cliente", null=True)
    created_date = models.DateTimeField(auto_now=True, verbose_name="Data Criação")
    updated_date = models.DateTimeField(auto_now=True, verbose_name="Data Alteração")
    extr0 = models.CharField(verbose_name="Extrusora 0", max_length=2, default='A')
    extr1 = models.CharField(verbose_name="Extrusora 1", max_length=2, default='C')
    extr2 = models.CharField(verbose_name="Extrusora 2", max_length=2, default='B')
    extr3 = models.CharField(verbose_name="Extrusora 3", max_length=2, default='C')
    extr4 = models.CharField(verbose_name="Extrusora 4", max_length=2, default='A')
    extr0_val = models.DecimalField(verbose_name="Extrusora 0 Valor %", max_digits=4, decimal_places=1, default=5)
    extr1_val = models.DecimalField(verbose_name="Extrusora 1 Valor %", max_digits=4, decimal_places=1, default=22.5)
    extr2_val = models.DecimalField(verbose_name="Extrusora 2 Valor %", max_digits=4, decimal_places=1, default=45)
    extr3_val = models.DecimalField(verbose_name="Extrusora 3 Valor %", max_digits=4, decimal_places=1, default=22.5)
    extr4_val = models.DecimalField(verbose_name="Extrusora 4 Valor %", max_digits=4, decimal_places=1, default=5)

    class Meta:
        unique_together = (('produto_id', 'designacao'))

class FormulacaoMateriasPrimas(models.Model):
    formulacao = models.ForeignKey(Formulacao, on_delete=models.PROTECT, verbose_name="Formulacao", null=False, blank=False)
    matprima_cod = models.CharField(verbose_name="SAGE ITMREF_0 Código Matéria Prima", max_length=25)
    matprima_des = models.CharField(verbose_name="SAGE ITMDES1_0 Designação Matéria Prima", max_length=100, null=True)
    tolerancia = models.DecimalField(verbose_name="Tolerância", max_digits=6, decimal_places=1, default=.5)
    densidade = models.DecimalField(verbose_name="Densidade", max_digits=6, decimal_places=4, default=0)
    arranque = models.DecimalField(verbose_name="Arranque", max_digits=6, decimal_places=2, default=0)
    vglobal = models.DecimalField(verbose_name="Valor Global", max_digits=6, decimal_places=2, default=0)
    mangueira = models.CharField(verbose_name="Mangueira", max_length=2, null=True)
    extrusora = models.CharField(verbose_name="Extrusora", max_length=2, default='A')

class GamaOperatoria(models.Model):
    designacao = models.CharField(verbose_name="Designação", max_length=50,null=True)
    versao = models.SmallIntegerField(verbose_name="Versão", default=1)
    produto = models.ForeignKey('producao.Produtos',on_delete=models.PROTECT,verbose_name="Id Produto") #ADDED - ID PRODUTO
    #artigo_cod = models.CharField(verbose_name="SAGE ITMREF_0 Código Produto Acabado", max_length=25)
    created_date = models.DateTimeField(auto_now=True, verbose_name="Data Criação")
    updated_date = models.DateTimeField(auto_now=True, verbose_name="Data Alteração")
    
    class Meta:
        unique_together = (('produto_id', 'designacao'))

class GamaOperatoriaItems(models.Model):
    gamaoperatoria = models.ForeignKey(GamaOperatoria, on_delete=models.PROTECT, verbose_name="Gama Operatória", null=False, blank=False)
    item_des = models.CharField(verbose_name="Designação do Item", max_length=100, null=True)
    item_values = models.JSONField(verbose_name="Valores do Item", null=True)
    item_nvalues = models.SmallIntegerField(verbose_name="Nº de Valores", default=1)
    item_key = models.CharField(verbose_name="Chave do Item", max_length=100, null=True)
    tolerancia = models.DecimalField(verbose_name="Tolerância", max_digits=4, decimal_places=1, default=10)

class Cortes(models.Model):
    largura_cod = models.CharField(verbose_name="Código de larguras", max_length=25) #HASH MD5 Na forma (Nº de Cortes A * Largura A, Nº de Cortes B * Largura B, ...)
    largura_json = models.CharField(verbose_name="Larguras JSON", max_length=200) #(Nº de Cortes por largura)
    created_date = models.DateTimeField(auto_now=True, verbose_name="Data Criação")
    updated_date = models.DateTimeField(auto_now=True, verbose_name="Data Alteração")
    largura_util = models.SmallIntegerField(verbose_name="Largura Útil", null=True)

class CortesOrdem(models.Model):
    designacao = models.CharField(verbose_name="Designação", max_length=50,null=True)
    versao = models.SmallIntegerField(verbose_name="Versão", default=1)
    cortes = models.ForeignKey('producao.Cortes',on_delete=models.PROTECT,verbose_name="Id dos Cortes")
    largura_ordem = models.CharField(verbose_name="Larguras JSON", max_length=200) #(Ordem dos Cortes)
    ordem_cod = models.CharField(verbose_name="Código de Posotionamento das larguras", max_length=25) #HASH MD5 Ordem dos Cortes
    created_date = models.DateTimeField(auto_now=True, verbose_name="Data Criação")
    updated_date = models.DateTimeField(auto_now=True, verbose_name="Data Alteração")
    
    class Meta:
        unique_together = (('cortes_id', 'ordem_cod'))

class ArtigoSpecs(models.Model):
    designacao = models.CharField(verbose_name="Designação", max_length=50,null=True)
    versao = models.SmallIntegerField(verbose_name="Versão", default=1)
    #artigo_cod = models.CharField(verbose_name="SAGE ITMREF_0 Código Produto Acabado", max_length=25)
    produto = models.ForeignKey('producao.Produtos',on_delete=models.PROTECT,verbose_name="Id Produto") #ADDED - ID PRODUTO
    cliente_cod = models.CharField(max_length=15,verbose_name="Código Cliente", null=True)
    cliente_nome = models.CharField(max_length=80,verbose_name="Nome Cliente", null=True)
    created_date = models.DateTimeField(auto_now=True, verbose_name="Data Criação")
    updated_date = models.DateTimeField(auto_now=True, verbose_name="Data Alteração")

    class Meta:
        unique_together = (('produto_id', 'designacao'))

class ArtigoSpecsItems(models.Model):
    artigospecs = models.ForeignKey(ArtigoSpecs, on_delete=models.PROTECT, verbose_name="Características Técnicas", null=False, blank=False)
    item_des = models.CharField(verbose_name="Designação do Item", max_length=100, null=True)
    item_values = models.JSONField(verbose_name="Valores do Item", null=True)
    item_key = models.CharField(verbose_name="Chave do Item", max_length=100, null=True)
    item_nvalues = models.SmallIntegerField(verbose_name="Nº de Valores", default=1)

class BomItems(models.Model):
    bom_alt = models.SmallIntegerField(verbose_name="SAGE BOMALT_0 BOM Alternativo por Artigo", default=10)
    bom_seq = models.SmallIntegerField(verbose_name="SAGE BOMSEQ_0 Sequência BOM do Artigo", default=5)
    artigo_cod = models.CharField(verbose_name="SAGE ITMREF_0 Código Produto Acabado", max_length=25)
    artigo_des = models.CharField(verbose_name="SAGE ITMDES1_0 Designação Produto Acabado", max_length=100)
    matprima_cod = models.CharField(verbose_name="SAGE ITMREF_0 Código Matéria Prima", max_length=25)
    matprima_des = models.CharField(verbose_name="SAGE ITMDES1_0 Designação Matéria Prima", max_length=100)
    qty_base = models.DecimalField(verbose_name="SAGE BASQTY_0 Quantidade Base (Razão)", max_digits=28, decimal_places=13)
    updatedate_bom = models.DateTimeField(auto_now=True, verbose_name="SAGE UPDDAT_0 Update Date do BOM")
    updatedate_bomd = models.DateTimeField(auto_now=True, verbose_name="SAGE UPDDAT_0 Update Date da Matéria Prima BOM")
    matprima_unidade = models.CharField(verbose_name="SAGE BOMUOM_0 Unidade de Medida Matéria Prima", max_length=5)
    qty = models.DecimalField(verbose_name="SAGE BOMQTY_0 Quantidade Matéria Prima", max_digits=28, decimal_places=13)
    fromsage = models.SmallIntegerField(verbose_name="Coluna de controlo para indicar se a importação foi pelo SAGE 1 sim 0 não", default=0)
    class Meta:
        unique_together = (('artigo_cod', 'bom_alt','matprima_cod','bom_seq'))

    def __str__(self):
         return self.artigo_cod  

class OrdemFabricoDetails(models.Model):
    cod = models.CharField(verbose_name="SAGE MFGNUM_0 Número Ordem Fabrico", max_length=25, unique=True)
    ignorar = models.SmallIntegerField(verbose_name="SAGE 1 - Ignorar Ordem de Produção | 0 - Não Ignorar", default=1)
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