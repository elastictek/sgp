from django import template
from producao.forms import PerfilCreateForm, BobinagemCreateForm, ConfirmReciclarForm, RetrabalhoFormEmendas, AcompanhamentoDiarioSearchForm, PaleteCreateForm, SelecaoPaleteForm, AddPalateStockForm, PaletePesagemForm, CargaCreateForm, Picagem, RetrabalhoCreateForm, EmendasCreateForm, ClienteCreateForm, UpdateBobineForm, PaleteRetrabalhoForm, ClassificacaoBobines, EncomendaCreateForm
from producao.models import Perfil, Bobinagem, Emenda, Palete
from django.forms import formset_factory

register = template.Library()

@register.inclusion_tag('perfil/perfil_form.html')
def perfil_form(self):
    form = PerfilCreateForm()
    return {'form': form }

@register.inclusion_tag('producao/bobinagem_form.html')
def bobinagem_form(self):
    form = BobinagemCreateForm()
    return {'form': form }

@register.inclusion_tag('palete/palete_form.html')
def palete_form(self):
    form = PaleteCreateForm()
    return {'form': form }

@register.inclusion_tag('retrabalho/retrabalho_form.html')
def retrabalho_form(self):
     form = RetrabalhoCreateForm()
     return {'form': form }

@register.inclusion_tag('retrabalho/emendas_form.html')
def emendas_form(self):
    form = EmendasCreateForm()
    return {
            'form': form,
            }

@register.inclusion_tag('retrabalho/final_form.html')
def final_form(self):
    form = BobinagemCreateForm()
    return {'form': form }

@register.inclusion_tag('cliente/cliente_form.html')
def cliente_form(self):
    form = ClienteCreateForm()
    return {'form': form }

@register.inclusion_tag('producao/bobine_update_form.html')
def bobine_update_form(self):
    form = UpdateBobineForm(instance=self.instance)
    return {'form': form, "instance": self.instance}


@register.inclusion_tag('retrabalho/palete_retrabalho_form.html')
def palete_retrabalho_form(self):
    form = PaleteRetrabalhoForm()
    return {'form': form }

# @register.inclusion_tag('palete/ordenar_bobines_form.html')
# def ordenar_bobines_form(self):
#     form = OrdenarBobines()
#     return {'form': form }
    
@register.inclusion_tag('producao/classificacao_bobines_form.html')
def classificacao_bobines(self):
    form = ClassificacaoBobines(instance=self.bobinagem)
    return {'form': form, "instance": self.bobinagem}

@register.inclusion_tag('encomenda/encomenda_form.html')
def encomenda_form(self):
    form = EncomendaCreateForm()
    return {'form': form}

@register.inclusion_tag('carga/carga_create_form.html')
def carga_form(self):
    form = CargaCreateForm()
    return {'form': form}

@register.inclusion_tag('palete/palete_selecao_form.html')
def palete_selecao_form(self):
    form = SelecaoPaleteForm()
    return {'form': form}

@register.inclusion_tag('palete/palete_pesagem_form.html')
def palete_pesagem_form(self):
    form = PaletePesagemForm(instance=self.instance)
    return {'form': form, "instance": self.instance}

@register.inclusion_tag('stock/stock_add_carga_form.html')
def stock_add_carga_form(self):
    form = AddPalateStockForm(instance=self.instance)
    return {'form': form, "instance": self.instance}


@register.inclusion_tag('lab/acompanhamento_diario_form.html')
def acompanhamento_diario_form(self):
    form = AcompanhamentoDiarioSearchForm()
    return {'form': form}
    
@register.inclusion_tag('retrabalho/retrabalho_form_v2.html')
def retrabalho_form_v2(self):
    form = RetrabalhoFormEmendas()
    return {'form': form}

@register.inclusion_tag('retrabalho/recycle_confirm_form.html')
def recycle_confirm_form(self):
    form = ConfirmReciclarForm()
    return {'form': form }

@register.filter
def index(indexable, i):
    return indexable[i]

@register.filter('has_group')
def has_group(user, group_name):
    """
    Verifica se este usuário pertence a um grupo
    """
    groups = user.groups.all().values_list('name', flat=True)
    return True if group_name in groups else False