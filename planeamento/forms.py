from producao.models import *
from .models import *
from django.forms import ModelForm, formset_factory, inlineformset_factory, modelformset_factory
from datetime import datetime
from django import forms
from django.core.exceptions import ValidationError
from django.db.models import Q


class OrdemProducaoCreateForm(ModelForm):
    emendas                     = forms.CharField(widget=forms.Textarea)
    
    class Meta:
        model = OrdemProducao
        fields =['enc', 'cliente', 'artigo', 'data_prevista_inicio', 'hora_prevista_inicio', 'horas_previstas_producao', 'largura', 'core', 'num_paletes_produzir', 'num_paletes_stock', 'emendas', 'nwsup', 'nwinf', 
        'tipo_paletes', 'palete_por_palete', 
         'bobines_por_palete', 'bobines_por_palete_inf', 'enrolamento', 'folha_id', 'freq_amos', 'diam_min', 'diam_max', 'stock', 'ficha_processo', 'tipo_transporte', 'paletes_camiao', 
         'altura_max', 'ficha_tecnica', 'of', 'pack_list', 'res_prod', 'ori_qua']

    def __init__(self, *args, **kwargs):
        super(OrdemProducaoCreateForm, self).__init__(*args, **kwargs)  
        self.fields['enc'].queryset = Encomenda.objects.filter(estado='A')
        self.fields['artigo'].queryset = Artigo.objects.all()

        if 'artigo' in self.data:
            try:
                artigo_id = int(self.data.get('artigo'))
                self.fields['artigo'].queryset = Artigo.objects.filter(id=artigo_id)
               
            except(ValueError, TypeError):
                pass
        

class AddStockForm(ModelForm):
    class Meta:
        model = Palete
        fields = ['add']

class OrdemProducaoDMCreateForm(ModelForm):
    emendas                     = forms.CharField(widget=forms.Textarea)
    class Meta:
        model  = OrdemProducao
        fields = ['cliente', 'enc', 'artigo','data_prevista_inicio', 'hora_prevista_inicio', 'horas_previstas_producao', 'largura', 'core', 'num_paletes_produzir', 'tipo_emenda', 'emendas', 'tipo_paletes', 'palete_por_palete',
         'bobines_por_palete', 'enrolamento', 'diam_min', 'diam_max', 'stock', 'ficha_processo', 'ficha_tecnica', 'of', 'pack_list', 'bobines_por_palete_inf',  'res_prod', 'ori_qua']
         

    def __init__(self, *args, **kwargs):
        super(OrdemProducaoDMCreateForm, self).__init__(*args, **kwargs)  
        self.fields['enc'].queryset = Encomenda.objects.filter(estado='A')

class OrdemProducaoEditForm(ModelForm):
    class Meta:
        model  = OrdemProducao
        fields = ['artigo', 'data_prevista_inicio', 'hora_prevista_inicio', 'horas_previstas_producao', 'largura', 'core', 'num_paletes_produzir', 'num_paletes_stock', 'emendas', 
        'tipo_paletes', 'palete_por_palete', 
         'bobines_por_palete', 'bobines_por_palete_inf', 'enrolamento', 'folha_id', 'freq_amos', 'diam_min', 'diam_max', 'ficha_processo', 'paletes_camiao', 
         'altura_max', 'ficha_tecnica', 'of', 'pack_list', 'res_prod', 'ori_qua']

class OrdemProducaoEditIncForm(ModelForm):
    class Meta:
        model  = OrdemProducao
        fields = ['num_paletes_produzir', 'num_paletes_stock', 'ficha_processo', 'ficha_tecnica', 'of', 'pack_list', 'res_prod', 'ori_qua']



