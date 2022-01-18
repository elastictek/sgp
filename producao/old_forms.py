from .models import Embalamento, Especificacoes, Mdf, Cinta, Core, Artigo, Filme, PaleteEmb, Perfil, Largura, Bobinagem, Bobine, Palete, Emenda, Cliente, Encomenda, Carga, EtiquetaRetrabalho, Nonwoven, ArtigoCliente, Fornecedor, Rececao, ArtigoNW, ProdutoGranulado, Reciclado, MovimentoMP, Transporte, TrasporteArtigoCliente
from django.forms import ModelForm, formset_factory, inlineformset_factory, modelformset_factory
from datetime import datetime
from planeamento.models import *
from django import forms
from django.core.exceptions import ValidationError
from django.db.models import Q


class PerfilCreateForm(ModelForm):

    class Meta:
        model = Perfil
        fields = ['nome', 'produto', 'num_bobines',
                  'largura_bobinagem', 'core', 'retrabalho']
    #    fields =['nome', 'num_bobines', 'retrabalho', 'largura_bobinagem', 'core', 'gramagem', 'espessura', 'densidade_mp', 'velocidade', 'producao']


class LarguraForm(ModelForm):

    class Meta:
        model = Largura
        fields = ['largura', 'designacao_prod']


class BobinagemCreateForm(ModelForm):
    ESTADO = (('G', 'G'), ('R', 'R'), ('BA', 'BA'), ('LAB', 'LAB'),
              ('IND', 'IND'), ('HOLD', 'HOLD'), ('SC', 'SC'))
    estado = forms.CharField(max_length=4, required=True,
                             widget=forms.Select(choices=ESTADO))

    class Meta:
        model = Bobinagem
        fields = ['data', 'num_bobinagem', 'perfil', 'tiponwsup', 'tiponwinf', 'lotenwsup', 'lotenwinf',
                  'nwsup', 'nwinf', 'comp', 'comp_par', 'diam', 'inico', 'fim', 'estado', 'obs', 'tipo_desp']

    def __init__(self, *args, **kwargs):
        bobinagem = Bobinagem.objects.filter(perfil__retrabalho=False)
        num = bobinagem.latest()
        num_b = num.num_bobinagem + 1
        fim = num.fim
        tiponwsup = num.tiponwsup
        tiponwinf = num.tiponwinf
        lotenwsup = num.lotenwsup
        lotenwinf = num.lotenwinf
        perfil = num.perfil
        diam = num.diam
        super(BobinagemCreateForm, self).__init__(*args, **kwargs)
        self.fields['perfil'].queryset = Perfil.objects.filter(
            Q(retrabalho=False) & Q(obsoleto=False))
        self.fields['num_bobinagem'].initial = num_b
        self.fields['inico'].initial = fim
        self.fields['tiponwsup'].initial = tiponwsup
        self.fields['tiponwinf'].initial = tiponwinf
        self.fields['lotenwsup'].initial = lotenwsup
        self.fields['lotenwinf'].initial = lotenwinf
        self.fields['perfil'].initial = perfil
        self.fields['diam'].initial = diam
        self.fields['estado'].initial = 'LAB'


class BobinagemCreateFormV2(ModelForm):
    nonwoven_sup = forms.CharField(
        max_length=20, label='Nonwoven Superior', required=True)
    nonwoven_inf = forms.CharField(
        max_length=20, label='Nonwoven Inferior', required=True)
    consumo_sup = forms.DecimalField(
        max_digits=6, decimal_places=2, label='Consumo Superior', required=True)
    consumo_inf = forms.DecimalField(
        max_digits=6, decimal_places=2, label='Consumo Inferior', required=True)

    class Meta:
        model = Bobinagem
        fields = ['data', 'num_bobinagem', 'perfil', 'comp',
                  'comp_par', 'diam', 'inico', 'fim', 'estado', 'obs']

    def __init__(self, *args, **kwargs):
        bobinagem = Bobinagem.objects.filter(perfil__retrabalho=False)
        num = bobinagem.latest()
        num_b = num.num_bobinagem + 1
        fim = num.fim
        perfil = num.perfil
        diam = num.diam
        super(BobinagemCreateFormV2, self).__init__(*args, **kwargs)
        self.fields['perfil'].queryset = Perfil.objects.filter(
            Q(retrabalho=False) & Q(obsoleto=False))
        self.fields['num_bobinagem'].initial = num_b
        self.fields['inico'].initial = fim
        self.fields['perfil'].initial = perfil
        self.fields['diam'].initial = diam


class RetrabalhoCreateForm(ModelForm):

    class Meta:
        model = Bobinagem
        fields = ['data', 'num_bobinagem', 'perfil', 'inico']

    def __init__(self, *args, **kwargs):
        bobinagem = Bobinagem.objects.filter(perfil__retrabalho=True)
        num = bobinagem.latest()
        num_b = num.num_bobinagem + 1
        perfil = num.perfil
        fim = num.fim

        super(RetrabalhoCreateForm, self).__init__(*args, **kwargs)
        self.fields['perfil'].queryset = Perfil.objects.filter(
            Q(retrabalho=True) & Q(obsoleto=False))
        # self.fields['num_bobinagem'].widget.attrs['readonly'] = True
        # self.fields['data'].widget.attrs['readonly'] = True
        self.fields['num_bobinagem'].initial = num_b
        self.fields['perfil'].initial = perfil
        self.fields['inico'].widget.attrs['readonly'] = True
        self.fields['inico'].initial = fim


class PaleteCreateForm(ModelForm):

    class Meta:
        model = Palete
        fields = ['ordem', 'perfil_embalamento', 'num', 'data_pal',
                  'num_bobines', 'largura_bobines', 'core_bobines']

    def __init__(self, *args, **kwargs):
        palete = Palete.objects.filter(estado='G', data_pal__year='2021').latest('num')
        num_bobines = palete.num_bobines
        largura_bobines = palete.largura_bobines
        core_bobines = palete.core_bobines
        num = palete.num
        # destino = palete.destino
        super(PaleteCreateForm, self).__init__(*args, **kwargs)
        self.fields['ordem'].queryset = OrdemProducao.objects.filter(Q(ativa=True) & Q(completa=False))
        self.fields['num_bobines'].initial = num_bobines
        self.fields['largura_bobines'].initial = largura_bobines
        self.fields['core_bobines'].initial = core_bobines
        self.fields['num'].initial = num + 1
        # self.fields['destino'].initial = destino


class ClienteCreateForm(ModelForm):

    class Meta:
        model = Cliente
        fields = ['cod', 'nome', 'abv', 'limsup', 'liminf', 'diam_ref']


class BobineStatus(ModelForm):

    class Meta:
        model = Bobine
        fields = ['largura', 'estado', 'con', 'descen', 'presa',
                  'diam_insuf', 'furos', 'esp', 'troca_nw', 'buraco', 'outros', 'obs']

# class BobinagemUpdate(ModelForm):
#      class Meta:
#         model = Bobinagem
#         fields = ['tiponwsup', 'tiponwinf', 'lotenwsup', 'lotenwinf', 'nwsup', 'nwinf', 'comp', 'comp_par', 'diam', 'inico', 'fim']


class EmendasCreateForm(ModelForm):
    #  bobine = forms.CharField(label='Bobine original')

    class Meta:
        model = Emenda
        fields = ['bobine', 'metros', 'num_emenda', 'emenda']

    #  def __init__(self, *args, **kwargs):
    #      super(EmendasCreateForm, self).__init__(*args, **kwargs)
    #      self.fields['bobine'].queryset = Bobine.objects.filter(estado='DM')


class Picagem(forms.Form):
    nome = forms.CharField(max_length=50)


class UpdateBobineForm(ModelForm):
    class Meta:
        model = Bobine
        fields = ['estado', 'con', 'descen', 'presa', 'diam_insuf', 'furos',
                  'esp', 'troca_nw', 'outros', 'buraco', 'obs', 'l_real', 'nok']


class PaleteRetrabalhoForm(ModelForm):

    class Meta:
        model = Palete
        fields = ['num', 'data_pal', 'num_bobines', 'perfil_embalamento']

    def __init__(self, *args, **kwargs):
        palete = Palete.objects.filter(
            estado='DM', data_pal__year='2021').latest('num')
        num = palete.num
        super(PaleteRetrabalhoForm, self).__init__(*args, **kwargs)

        self.fields['num'].initial = num + 1


class OrdenarBobines(ModelForm):

    class Meta:
        model = Bobine
        fields = ['posicao_palete']


class ClassificacaoBobines(ModelForm):

    class Meta:
        model = Bobine
        fields = ['estado', 'con', 'descen', 'presa', 'diam_insuf',
                  'furos', 'esp', 'troca_nw', 'outros', 'obs', 'buraco']


class RetrabalhoForm(ModelForm):

    bobine = forms.CharField(max_length=14)

    class Meta:
        model = Emenda
        fields = ['bobine', 'metros']


class EncomendaCreateForm(forms.ModelForm):

    class Meta:
        model = Encomenda
        fields = ['cliente', 'data', 'data_prevista',
                  'eef', 'prf', 'sqm', 'num_paletes', 'order_num']
        ordering = ('cliente')

    def __init__(self, *args, **kwargs):
        encomenda = Encomenda.objects.all().latest('id')
        prf = encomenda.prf
        eef = encomenda.eef
        cliente = encomenda.cliente
        sqm = encomenda.sqm

        super(EncomendaCreateForm, self).__init__(*args, **kwargs)

        self.fields['eef'].initial = eef
        self.fields['prf'].initial = prf
        self.fields['cliente'].initial = cliente
        self.fields['sqm'].initial = sqm
        self.fields['cliente'].queryset = Cliente.objects.order_by('nome')


class CargaCreateForm(forms.ModelForm):
    class Meta:
        model = Carga
        fields = ['enc', 'data', 'data_prevista',
                  'num_carga', 'num_paletes', 'tipo']

    def __init__(self, *args, **kwargs):
        carga = Carga.objects.all().latest('id')
        enc = carga.enc
        num_carga = carga.num_carga + 1
        num_paletes = carga.num_paletes
        tipo = carga.tipo
        super(CargaCreateForm, self).__init__(*args, **kwargs)
        self.fields['enc'].queryset = Encomenda.objects.filter(
            estado='A').order_by('-eef')
        self.fields['enc'].initial = enc
        self.fields['num_carga'].initial = num_carga
        self.fields['num_paletes'].initial = num_paletes
        self.fields['tipo'].initial = tipo


class SelecaoPaleteForm(forms.Form):
    palete = forms.CharField(max_length=11)


class PaletePesagemForm(ModelForm):
    class Meta:
        model = Palete
        fields = ['stock', 'peso_bruto', 'peso_palete']

class PaletePesagemDMForm(ModelForm):
    class Meta:
        model = Palete
        fields = ['peso_bruto', 'peso_palete']


class AddPalateStockForm(ModelForm):
    class Meta:
        model = Palete
        fields = ['carga']

    def __init__(self, *args, **kwargs):
        # carga = Carga.objects.filter(estado='I')
        super(AddPalateStockForm, self).__init__(*args, **kwargs)
        self.fields['carga'].queryset = Carga.objects.filter(estado='I')


class AcompanhamentoDiarioSearchForm(forms.Form):
    data_inicio = forms.DateField(input_formats='%Y-%m-%d')
    hora_inicio = forms.TimeField(input_formats='%H:%M')
    data_fim = forms.DateField(input_formats='%Y-%m-%d')
    hora_fim = forms.TimeField(input_formats='%H:%M')


class RetrabalhoFormEmendas(forms.Form):
    bobine_1 = forms.CharField(
        max_length=15, label='Bobine original 1', required=True)
    bobine_2 = forms.CharField(
        max_length=15, label='Bobine original 2', required=False)
    bobine_3 = forms.CharField(
        max_length=15, label='Bobine original 3', required=False)
    m_bobine_1 = forms.DecimalField(
        max_digits=6, decimal_places=2, label='Metros enrolados da bobine original 1', required=True)
    m_bobine_2 = forms.DecimalField(
        max_digits=6, decimal_places=2, label='Metros enrolados da bobine original 2', required=False)
    m_bobine_3 = forms.DecimalField(
        max_digits=6, decimal_places=2, label='Metros enrolados da bobine original 3', required=False)


class ConfirmReciclarForm(forms.Form):
    recycle_1 = forms.BooleanField(initial=False, label='', required=False)
    recycle_2 = forms.BooleanField(initial=False, label='', required=False)
    recycle_3 = forms.BooleanField(initial=False, label='', required=False)


class PicagemBobines(forms.Form):
    bobine = forms.CharField(label='', max_length=15)


class ClassificacaoBobines(forms.Form):
    STATUSP = (('G', 'G'), ('DM', 'DM12'), ('R', 'R'), ('BA', 'BA'),
               ('LAB', 'LAB'), ('IND', 'IND'), ('HOLD', 'HOLD'))
    estado = forms.CharField(
        max_length=4, widget=forms.Select(choices=STATUSP))
    con = forms.BooleanField(initial=False, label='', required=False)
    descen = forms.BooleanField(initial=False, label='', required=False)
    presa = forms.BooleanField(initial=False, label='', required=False)
    diam_insuf = forms.BooleanField(initial=False, label='', required=False)
    furos = forms.BooleanField(initial=False, label='', required=False)
    buraco = forms.BooleanField(initial=False, label='', required=False)
    esp = forms.BooleanField(initial=False, label='', required=False)
    troca_nw = forms.BooleanField(initial=False, label='', required=False)
    outros = forms.BooleanField(initial=False, label='', required=False)
    obs = forms.CharField(max_length=500, label='', required=False)
    l_real = forms.IntegerField(required=False)


class ImprimirEtiquetaBobine(forms.Form):
    IMP = (('Bobinadora_CAB_A4_200', 'BOBINADORA'), ('DM12_CAB_A4_200', 'DM12'))
    impressora = forms.CharField(
        max_length=200, widget=forms.Select(choices=IMP), required=True)
    num_copias = forms.IntegerField(
        label="Nº de Cópias", required=True, initial=1, max_value=5, min_value=1)


class ImprimirEtiquetaPalete(forms.Form):
    IMP = (('Bobinadora_CAB_A4_200', 'BOBINADORA'), ('DM12_CAB_A4_200', 'DM12'))
    impressora = forms.CharField(
        max_length=200, widget=forms.Select(choices=IMP), required=True)
    num_copias = forms.IntegerField(
        label="Nº de Cópias", required=True, initial=4, max_value=4, min_value=1)


class ImprimirEtiquetaFinalPalete(forms.Form):
    num_copias = forms.IntegerField(
        label="Nº de Cópias", required=True, initial=1, max_value=4, min_value=1)


class PerfilLinhaForm(ModelForm):
    largura_bobines = forms.DecimalField(required=False)

    class Meta:
        model = Perfil
        fields = ['produto', 'num_bobines', 'core', 'gramagem']


class PerfilDMForm(ModelForm):
    CORE = ((None, '---------'), ('3', '3"'), ('6', '6"'))
    largura_bobines = forms.DecimalField(required=False)
    core_original = forms.CharField(
        label="Core original", max_length=200, required=True, widget=forms.Select(choices=CORE))
    largura_original = forms.DecimalField(required=True)

    class Meta:
        model = Perfil
        fields = ['produto', 'num_bobines', 'core', 'gramagem']


class SearchPerfil(forms.Form):
    CORE = (
            (None, '---------'), 
            ('3', '3"'), ('6', '6"')
            )
    PRODUTO = (
                (None, '---------'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 100 HE', 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HE'),
                ('NONWOVEN ELASTIC BANDS ELA-ACE 100 HT', 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HT'),
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
                ('ELASTIC FILM', 'ELASTIC FILM')
                )
    nome = forms.CharField(label="Produto", max_length=200,
                           required=False, widget=forms.Select(choices=PRODUTO))
    num_bobines = forms.IntegerField(label="Nº de bobines", required=False)
    core = forms.CharField(label="Core", max_length=200,
                           required=False, widget=forms.Select(choices=CORE))
    largura_bobinagem = forms.DecimalField(
        label="Largura da Bobinagem", required=False)
    retrabalho = forms.BooleanField(required=False)


class SearchBobinagem(forms.Form):
    nome = forms.CharField(label="Bobinagem", max_length=200, required=True)


class InventarioBobineDMInsert(forms.Form):
    bobine = forms.CharField(max_length=15, required=True)


class InventarioPaleteClienteInsert(forms.Form):
    palete = forms.CharField(max_length=20, required=True)


class ArtigoClientInsert(ModelForm):
    class Meta:
        model = ArtigoCliente
        fields = ['artigo', 'cod_client', 'tipoemenda', 'num_emendas_bobine'] 


class FornecedorCreateForm(ModelForm):
    class Meta:
        model = Fornecedor
        fields = ['cod', 'abv', 'designacao']


class FornecedorEditForm(ModelForm):
    class Meta:
        model = Fornecedor
        fields = ['abv', 'designacao']


class RececaoCreateForm(ModelForm):
    class Meta:
        model = Rececao
        fields = ['fornecedor', 'encomenda']


class ArtigoNWCreateForm(ModelForm):
    class Meta:
        model = ArtigoNW
        fields = ['cod', 'designacao', 'fornecedor', 'largura', 'gsm']


class RececaoInsertNW(forms.Form):
    artigo_nw = forms.CharField(max_length=20, required=True, widget=forms.TextInput(
        attrs={'autofocus': True, 'value': ''}))
    sqm = forms.CharField(max_length=20, required=True)
    lote = forms.CharField(max_length=20, required=True)
    prod = forms.CharField(max_length=20, required=True)
    stack_num = forms.CharField(max_length=20, required=True)


class ClasssificacaoBobineDm(forms.Form):
    nok = forms.BooleanField(required=False)
    con = forms.BooleanField(required=False)
    descen = forms.BooleanField(required=False)
    presa = forms.BooleanField(required=False)
    diam_insuf = forms.BooleanField(required=False)
    suj = forms.BooleanField(required=False)
    car = forms.BooleanField(required=False)
    lac = forms.BooleanField(required=False)
    ncore = forms.BooleanField(required=False)
    sbrt = forms.BooleanField(required=False)
    fc = forms.BooleanField(required=False)
    ff = forms.BooleanField(required=False)
    fmp = forms.BooleanField(required=False)
    furos = forms.BooleanField(required=False)
    buraco = forms.BooleanField(required=False)
    esp = forms.BooleanField(required=False)
    prop = forms.BooleanField(required=False)
    outros = forms.BooleanField(required=False)
    troca_nw = forms.BooleanField(required=False)
    prop_obs = forms.CharField(
        max_length=500, required=False, widget=forms.Textarea)
    obs = forms.CharField(max_length=500, required=False,
                          widget=forms.Textarea)
    fc_diam_ini = forms.DecimalField(required=False)
    fc_diam_fim = forms.DecimalField(required=False)
    ff_m_ini = forms.DecimalField(required=False)
    ff_m_fim = forms.DecimalField(required=False)


class ProdutoGranuladoCreateForm(ModelForm):
    class Meta:
        model = ProdutoGranulado
        fields = ['produto_granulado']


class RecicladoCreateForm(ModelForm):
    ESTADO = (('G', 'G'), ('R', 'R'))
    TARA = (('15 kg', '15 kg'), ('30 kg', '30 kg'))
    estado = forms.CharField(max_length=1, required=True,
                             widget=forms.Select(choices=ESTADO))
    tara = forms.CharField(max_length=5, required=True,
                           widget=forms.Select(choices=TARA))

    class Meta:
        model = Reciclado
        fields = ['produto_granulado', 'num', 'peso', 'tara', 'obs']

    def __init__(self, *args, **kwargs):
        reciclado = Reciclado.objects.all()
        # data = datetime.now().date()
        data = datetime.date.today()
        try:
            reciclado = reciclado.latest('timestamp')
            data_reciclado = reciclado.timestamp.date()
            if data == data_reciclado:
                num = reciclado.num + 1
            elif data > data_reciclado:
                num = 1

        except:
            num = 1

        super(RecicladoCreateForm, self).__init__(*args, **kwargs)

        self.fields['num'].initial = num


class RecicladoEditForm(ModelForm):
    ESTADO = (('G', 'G'), ('R', 'R'))
    estado = forms.CharField(max_length=1, required=True,
                             widget=forms.Select(choices=ESTADO))

    class Meta:
        model = Reciclado
        fields = ['produto_granulado', 'estado', 'peso', 'obs']


class ImprimirEtiquetaReciclado(forms.Form):
    num_copias = forms.IntegerField(
        label="Nº de Cópias", required=True, initial=4, max_value=4, min_value=1)


class MovimentoCreateForm(ModelForm):

    class Meta:
        model = MovimentoMP
        fields = ['lote', 'tipo', 'motivo']


class ExportBobinesToExcel(forms.Form):
    abv = forms.CharField(max_length=3, required=False)
    data_inicial = forms.DateField(required=False)
    data_final = forms.DateField(required=False)


class BobinagemEditForm(ModelForm):
    class Meta:
        model = Bobinagem
        fields = ['inico', 'fim', 'diam', 'comp', 'comp_par', 'tiponwsup',
                  'tiponwinf', 'lotenwsup', 'lotenwinf', 'nwsup', 'nwinf', 'obs', 'tipo_desp']


class BobinagemEditHasPaleteForm(ModelForm):
    class Meta:
        model = Bobinagem
        fields = ['inico', 'fim', 'tiponwsup', 'tiponwinf',
                  'lotenwsup', 'lotenwinf', 'nwsup', 'nwinf', 'obs']


class BobineEditForm(ModelForm):
    CLIENTE = (
                ('ABENA', 'ABENA'),
                ('Activ Medical Disposable', 'Activ Medical Disposable'),
                ('Active Medical Iberica, SL', 'Active Medical Iberica, SL'),
                ('Ali Bardi Paper Mill Co.', 'Ali Bardi Paper Mill Co.'),
                ('ARKAN', 'ARKAN'),
                ('BB DISTRIBE SAS', 'BB DISTRIBE SAS'),
                ('Bravery Ovation Lda', 'Bravery Ovation Lda'),
                ('BV Trading SA', 'BV Trading SA'),
                ('CAN HYGIENE', 'CAN HYGIENE'),
                ('Celluloses de Brocéliande', 'Celluloses de Brocéliande'),
                ('CEPRO', 'CEPRO'),
                ('Cleopatra Tissue Products (PTY) Ltd', 'Cleopatra Tissue Products (PTY) Ltd'),
                ('ClotheUp', 'ClotheUp'),
                ('Colunex Portuguesa - Indústria e Distribuição Sistemas Descanso, SA', 'Colunex Portuguesa - Indústria e Distribuição Sistemas Descanso, SA'),
                ('Confecções Capricho Ltda.', 'Confecções Capricho Ltda.'),
                ('DIATEC S.r.l', 'DIATEC S.r.l'),
                ('Drylock Technologies Ltd', 'Drylock Technologies Ltd'),
                ('Drylock Technologies SL', 'Drylock Technologies SL'),
                ('Drylock Technologies sro', 'Drylock Technologies sro'),
                ('El Ghazou', 'El Ghazou'),
                ('Elastictek', 'Elastictek'),
                ('ENKA HIJYEN', 'ENKA HIJYEN'),
                ('Faderco SPA', 'Faderco SPA'),
                ('FAS SOCIETA PER AZIONI', 'FAS SOCIETA PER AZIONI'),
                ('Fine Hygienic Paper Co.', 'Fine Hygienic Paper Co.'),
                ('HALK HYGIENE', 'HALK HYGIENE'),
                ('Hospital Doutor Francisco Zagalo', 'Hospital Doutor Francisco Zagalo'),
                ('Hospital Garcia de Orta', 'Hospital Garcia de Orta'),
                ('Hygienic Paper Company Ltd', 'Hygienic Paper Company Ltd'),
                ('Industrualização', 'Industrualização'),
                ('Intigena Produktion GmbH & Co. KG', 'Intigena Produktion GmbH & Co. KG'),
                ('LAMATEM SARL', 'LAMATEM SARL'),
                ('MACONFIL, Unipessoal, Lda', 'MACONFIL, Unipessoal, Lda'),
                ('MADAR GROUP', 'MADAR GROUP'),
                ('MEDIANE', 'MEDIANE'),
                ('MEGA DISPOSABLES S.A.', 'MEGA DISPOSABLES S.A.'),
                ('NANO', 'NANO'),
                ('Napco Consumer Products Co., branch of NAPCO NATIONAL COMPANY', 'Napco Consumer Products Co., branch of NAPCO NATIONAL COMPANY'),
                ('NAPCO RIYADH PAPER PRODUCTS CO., branch of NAPCO NATIONAL COMPANY', 'NAPCO RIYADH PAPER PRODUCTS CO., branch of NAPCO NATIONAL COMPANY'),
                ('National Paper Company LTD. branch of NAPCO NATIONAL COMPANY', 'National Paper Company LTD. branch of NAPCO NATIONAL COMPANY'),
                ('National Pride', 'National Pride'),
                ('NORSUDEX', 'NORSUDEX'),
                ('NORTE EM AÇÃO (SAOM - Serviços de Assistência)', 'NORTE EM AÇÃO (SAOM - Serviços de Assistência)'),
                ('Novatis', 'Novatis'),
                ('NUNEX', 'NUNEX'),
                ('Obviperiplo, Lda', 'Obviperiplo, Lda'),
                ('ONTEX TUKETIM URUNLERI SAN VE TIC AS', 'ONTEX TUKETIM URUNLERI SAN VE TIC AS'),
                ('PAKTEN SAGLIK URUNLERI', 'PAKTEN SAGLIK URUNLERI'),
                ('PANAI S.A.L.', 'PANAI S.A.L.'),
                ('PARMON', 'PARMON'),
                ('PAUL HARTMANN AG', 'PAUL HARTMANN AG'),
                ('PESQUISUAVE, LDA', 'PESQUISUAVE, LDA'),
                ('Pozzani Disposables S.p.A.', 'Pozzani Disposables S.p.A.'),
                ('SAH', 'SAH'),
                ('SAI PHARMACEUTICALS KENYA LIMITED', 'SAI PHARMACEUTICALS KENYA LIMITED'),
                ('SANCELLA TUNISIE', 'SANCELLA TUNISIE'),
                ('SANITA CONSUMER PRODUCTS S.A.E.', 'SANITA CONSUMER PRODUCTS S.A.E.'),
                ('Sanita S.A.L.', 'Sanita S.A.L.'),
                ('Seni S.A.', 'Seni S.A.'),
                ('Sté SOFAS S.A.R.L.', 'Sté SOFAS S.A.R.L.')
        )
    cliente = forms.CharField(
        max_length=100, required=True, widget=forms.Select(choices=CLIENTE))

    class Meta:
        model = Bobine
        fields = ['cliente', 'artigo', 'designacao_prod', 'comp', 'diam']


class BobinagemFinalizarForm(ModelForm):

    class Meta:
        model = Bobinagem
        fields = ['fim', 'diam']

class ArtigoCreateForm(ModelForm):
    class Meta:
        model = Artigo
        fields = "__all__"

class PaleteEmbCreateForm(ModelForm):
    class Meta:
        model = PaleteEmb
        fields = ['cod', 'des']

class FilmeCreateForm(ModelForm):
    class Meta:
        model = Filme
        fields = ['cod', 'des']

class CintaCreateForm(ModelForm):
    class Meta:
        model = Cinta
        fields = ['cod', 'des']

class CoreCreateForm(ModelForm):
    class Meta:
        model = Core
        fields = ['cod', 'des', 'core']

class MdfCreateForm(ModelForm):
    class Meta:
        model = Mdf
        fields = ['cod', 'des']

class CartaoCreateForm(ModelForm):
    class Meta:
        model = Mdf
        fields = ['cod', 'des']

class TransporteCreateForm(ModelForm):
    class Meta:
        model = Transporte
        fields = ['tipo']

class TransporteArtigoClienteAddCreateForm(ModelForm):
    class Meta:
        model = TrasporteArtigoCliente
        fields = ['transporte', 'num_bobines_palete', 'num_paletes_transporte']

class EspecificacoesArtigoClienteAddCreateForm(ModelForm):
    class Meta:
        model = Especificacoes
        fields = ['spec',
                'basis_weight_inf',
                'tensile_peak_cd_inf',
                'elongation_break_cd_inf',
                'elongation_n_cd_inf',
                'tensile_peak_md_inf',
                'elongation_break_md_inf',
                'elongation_n_md_inf',
                'load_five_inf',
                'load_ten_inf',
                'load_twenty_inf',
                'load_50_inf',
                'permanent_set_second_inf',
                'load_hundred_second_inf',
                'permanent_set_third_inf',
                'load_hundred_third_inf',
                'peel_test_inf',
                'elongation_ten_inf',
                'force_max_inf',
                'force_relax_inf',
                'tensile_set_inf',
                'load_first_cycle_inf',
                'load_first_relax_inf',
                'first_retract_force_fifty_inf',
                'first_cycle_permanent_set_inf',
                'load_second_cycle_inf',
                'load_second_relax_inf',
                'second_retract_force_fifty_inf',
                'max_load_inf',
                'extension_max_load_inf',
                'load_break_inf',
                'extencion_break_inf',
                'extencion_preset_point_load_ten_inf',
                'load_preset_point_tensile_extention_fortyfive_inf',
                'elongation_capacity_inf',
                'max_elongation_capacity_inf',
                'retract_capacity_inf',
                'deformation_inf',
                'tensile_strengh_inf',
                'elongation_break_cd_inf',
                'elongation_n_out_inf',
                'elongation_after_one_forty_inf',
                'basis_weight_sup',
                'tensile_peak_cd_sup',
                'elongation_break_cd_sup',
                'elongation_n_cd_sup',
                'tensile_peak_md_sup',
                'elongation_break_md_sup',
                'elongation_n_md_sup',
                'load_five_sup',
                'load_ten_sup',
                'load_twenty_sup',
                'load_50_sup',
                'permanent_set_second_sup',
                'load_hundred_second_sup',
                'permanent_set_third_sup',
                'load_hundred_third_sup',
                'peel_test_sup',
                'elongation_ten_sup',
                'force_max_sup',
                'force_relax_sup',
                'tensile_set_sup',
                'load_first_cycle_sup',
                'load_first_relax_sup',
                'first_retract_force_fifty_sup',
                'first_cycle_permanent_set_sup',
                'load_second_cycle_sup',
                'load_second_relax_sup',
                'second_retract_force_fifty_sup',
                'max_load_sup',
                'extension_max_load_sup',
                'load_break_sup',
                'extencion_break_sup',
                'extencion_preset_point_load_ten_sup',
                'load_preset_point_tensile_extention_fortyfive_sup',
                'elongation_capacity_sup',
                'max_elongation_capacity_sup',
                'retract_capacity_sup',
                'deformation_sup',
                'tensile_strengh_sup',
                'elongation_break_cd_sup',
                'elongation_n_out_sup',
                'elongation_after_one_forty_sup',
                ]

class EmbalamentoCreateForm(ModelForm):
    class Meta:
        model = Embalamento
        fields = ['paletemb', 'filme', 'cinta', 'core', 'mdf', 'cartao', 'qtd_mdf', 'qtd_cartao']

class EncomendaEditForm(ModelForm):
    class Meta:
        model = Encomenda
        fields = ['prf', 'order_num', 'sqm', 'num_paletes']


class AtribuirDestino(forms.Form):
    destino = forms.CharField(max_length=200, required=True)


class ExportBobinesOriginais(forms.Form):
    carga = forms.CharField(max_length=200, required=False)
    prf = forms.CharField(max_length=200, required=False)
    nwtipo = forms.CharField(max_length=200, required=False)
    nwlote = forms.CharField(max_length=200, required=False)
    data_inicio = forms.DateField(required=False)
    data_fim = forms.DateField(required=False)
    bobines = forms.FileField(required=False)
    paletes = forms.FileField(required=False)
    bobinagens = forms.FileField(required=False)

    