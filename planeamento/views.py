from django.shortcuts import render
from django.db.models import F
from .forms import *
from .models import *
from django.contrib.auth.models import User
from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from django.shortcuts import render, get_object_or_404, HttpResponseRedirect, redirect, reverse, HttpResponse
from django.contrib.auth.decorators import login_required, user_passes_test
from producao.models import *
from django.forms.models import modelformset_factory, inlineformset_factory
import datetime
from django.contrib import messages



def encomendas_list(request):
    template_name = 'encomendaV2/encomenda_list.html'
              

    context = {
       
        
    }
    return render(request, template_name, context)

# @login_required
# def create_ordem(request):
    
#     template_name = 'ordensproducao/create_ordem.html'
#     form = OrdemProducaoCreateForm(request.POST or None)

#     if form.is_valid():
#         instance = form.save(commit=False)
#         cd = form.cleaned_data
#         basis_weight_sup = cd.get('basis_weight_sup')
#         tensile_peak_sup = cd.get('tensile_peak_sup')
#         elong_break_cd_sup = cd.get('elong_break_cd_sup')
#         elong_n_cd_sup = cd.get('elong_n_cd_sup')
#         load_five_sup = cd.get('load_five_sup')
#         load_ten_sup = cd.get('load_ten_sup')
#         load_twenty_sup = cd.get('load_twenty_sup')
#         load_fifty_sup = cd.get('load_fifty_sup')
#         perm_set_second_sup = cd.get('perm_set_second_sup')
#         load_hundred_second_sup = cd.get('load_hundred_second_sup')
#         perm_set_third_sup = cd.get('perm_set_third_sup')
#         load_hundred_third_sup = cd.get('load_hundred_third_sup')
#         lamination_str_sup = cd.get('lamination_str_sup')
#         basis_weight_inf = cd.get('basis_weight_inf')
#         tensile_peak_inf = cd.get('tensile_peak_inf')
#         elong_break_cd_inf = cd.get('elong_break_cd_inf')
#         elong_n_cd_inf = cd.get('elong_n_cd_inf')
#         load_five_inf = cd.get('load_five_inf')
#         load_ten_inf = cd.get('load_ten_inf')
#         load_twenty_inf = cd.get('load_twenty_inf')
#         load_fifty_inf = cd.get('load_fifty_inf')
#         perm_set_second_inf = cd.get('perm_set_second_inf')
#         load_hundred_second_inf = cd.get('load_hundred_second_inf')
#         perm_set_third_inf = cd.get('perm_set_third_inf')
#         load_hundred_third_inf = cd.get('load_hundred_third_inf')
#         lamination_str_inf = cd.get('lamination_str_inf')
        
#         instance.user = request.user
#         ctsup = CTSup.objects.create(basis_weight=basis_weight_sup,tensile_peak=tensile_peak_sup, elong_break_cd=elong_break_cd_sup, elong_n_cd=elong_n_cd_sup, 
#         load_five=load_five_sup, load_ten=load_ten_sup, load_twenty=load_twenty_sup, load_fifty=load_fifty_sup, perm_set_second=perm_set_second_sup, 
#         load_hundred_second=load_hundred_second_sup, perm_set_third=perm_set_third_sup, load_hundred_third=load_hundred_third_sup, lamination_str=lamination_str_sup)
#         ctinf = CTInf.objects.create(basis_weight=basis_weight_inf,tensile_peak=tensile_peak_inf, elong_break_cd=elong_break_cd_inf, elong_n_cd=elong_n_cd_inf, 
#         load_five=load_five_inf, load_ten=load_ten_inf, load_twenty=load_twenty_inf, load_fifty=load_fifty_inf, perm_set_second=perm_set_second_inf, 
#         load_hundred_second=load_hundred_second_inf, perm_set_third=perm_set_third_inf, load_hundred_third=load_hundred_third_inf, lamination_str=lamination_str_inf)
#         ct = CaracteristicasTecnicas.objects.create(user=request.user, ctsup=ctsup, ctinf=ctinf)
#         instance.ct = ct
#         if instance.enc != None and instance.stock == False:
#             enc = Encomenda.objects.get(pk=instance.enc.pk)
#             ordens = OrdemProducao.objects.filter(enc=instance.enc)
#             num_paletes_total_ordens = 0
#             for o in ordens:
#                 num_paletes_total_ordens += o.num_paletes_total

#             if instance.num_paletes_total > (enc.num_paletes - num_paletes_total_ordens):
#                 messages.error(request, 'O número de paletes que deseja produzir nesta Ordem de Produção é maior que o permitido na encomenda.') 
#             else:
#                 count = OrdemProducao.objects.filter(enc=instance.enc).count()
#                 instance.op = instance.enc.cliente.nome + '-' + instance.enc.eef + '-' + str(count + 1)
#                 instance.save()
#                 return redirect('planeamento:list_ordem')
#         elif instance.enc == None and instance.stock == True:
#             count = OrdemProducao.objects.filter(stock=True).count()
#             instance.op = 'STOCK ' + str(instance.data_prevista_inicio) + '-' + str(instance.artigo.cod) + '-' + str(count + 1)
#             instance.enc = None
#             instance.save()
#             return redirect('planeamento:list_ordem')
#         elif instance.enc != None and instance.stock == True:
#             messages.error(request, 'Não pode ser criada uma Ordem de Produção para uma encomenda e em simultâneo para stock.') 
        
   

#     context = {
#        "form": form
#     }
#     return render(request, template_name, context)

@login_required
def create_ordem(request):
    
    template_name = 'ordensproducao/create_ordem.html'
    form = OrdemProducaoCreateForm(request.POST or None)
    if request.method == 'POST':
        form = OrdemProducaoCreateForm(request.POST, request.FILES)

        if form.is_valid():
            instance = form.save(commit=False)
            instance.user = request.user
            
        
            if instance.enc != None and instance.stock == False:
                enc = Encomenda.objects.get(pk=instance.enc.pk)
                ordens = OrdemProducao.objects.filter(enc=instance.enc)
                num_paletes_total_ordens = 0
                for o in ordens:
                    num_paletes_total_ordens += o.num_paletes_total

                if instance.num_paletes_total > (enc.num_paletes - num_paletes_total_ordens):
                    messages.error(request, 'O número de paletes que deseja produzir nesta Ordem de Produção é maior que o permitido na encomenda.') 
                elif (instance.bobines_por_palete == 0 or instance.palete_por_palete == 1 and instance.bobines_por_palete_inf != 0 or instance.palete_por_palete == 2 and instance.bobines_por_palete_inf == 0):
                    messages.error(request, 'Número de bobines por palete incorreto. Verifique valores inseridos.') 
                else:
                    count = OrdemProducao.objects.filter(enc=instance.enc).count()
                    instance.op = instance.enc.cliente.nome + ' L' + str(instance.largura) + ' LINHA ' + instance.enc.eef + ' ' + str(count + 1)
                    instance.num_paletes_total = instance.num_paletes_stock + instance.num_paletes_produzir
                    if instance.data_prevista_inicio != None and instance.hora_prevista_inicio != None and instance.horas_previstas_producao != None:
                        dt = datetime.datetime.combine(instance.data_prevista_inicio, instance.hora_prevista_inicio)
                        dt += timedelta(hours=instance.horas_previstas_producao)
                        instance.data_prevista_fim = dt.date()
                        instance.hora_prevista_fim = dt.time()
                    instance.cliente = instance.enc.cliente
                    instance.save()
                    return redirect('planeamento:list_ordem')
            elif instance.enc == None and instance.stock == True:
                if (instance.bobines_por_palete == 0 or instance.palete_por_palete == 1 and instance.bobines_por_palete_inf != 0 or instance.palete_por_palete == 2 and instance.bobines_por_palete_inf == 0):
                    messages.error(request, 'Número de bobines por palete incorreto. Verifique valores inseridos.') 
                else:
                    count = OrdemProducao.objects.filter(stock=True).count()
                    instance.op = instance.cliente.nome + ' L' + str(instance.largura) + ' LINHA STOCK ' + str(count + 1)
                    instance.enc = None
                    instance.num_paletes_total = instance.num_paletes_stock + instance.num_paletes_produzir
                    if instance.data_prevista_inicio != None and instance.hora_prevista_inicio != None and instance.horas_previstas_producao != None:
                            dt = datetime.datetime.combine(instance.data_prevista_inicio, instance.hora_prevista_inicio)
                            dt += timedelta(hours=instance.horas_previstas_producao)
                            instance.data_prevista_fim = dt.date()
                            instance.hora_prevista_fim = dt.time()
                    instance.save()
                return redirect('planeamento:list_ordem')
            elif instance.enc != None and instance.stock == True:
                messages.error(request, 'Não pode ser criada uma Ordem de Produção para uma encomenda e em simultâneo para stock.') 
        
   

    context = {
       "form": form
    }
    return render(request, template_name, context)

@login_required
def delete_ordem(request, pk):
    template_name = 'ordensproducao/delete_ordem.html'
    ordem = get_object_or_404(OrdemProducao, pk=pk)
    if request.method == "POST":
        if ordem.ativa == False and ordem.completa == False:
            if ordem.retrabalho == True:
                paletes_a_retrabalhar = PaletesARetrabalhar.objects.filter(ordem=ordem)
                bobines_a_retrabalhar = BobinesARetrabalhar.objects.filter(ordem=ordem)
                for palete in paletes_a_retrabalhar:
                    palete.delete()
                for bobine in bobines_a_retrabalhar:
                    bobine.delete()
                ordem.delete()
            else:
                ordem.delete()
            return redirect('planeamento:list_ordem')
        else:
            messages.error(request, 'A ordem de fabrico selecionada não pode ser apagada porque está em progresso ou finalizada.')

         


    context = {
       "ordem": ordem
    }
    return render(request, template_name, context)

@login_required
def list_ordem(request):
    ordem = OrdemProducao.objects.filter(ativa = 1, completa = 0)
    for ordem in ordem:
            ordem.num_paletes_produzidas = Palete.objects.filter(ordem=ordem, ordem_original_stock = 0, nome__isnull=False).exclude(ordem=ordem, num_bobines__gt=F('num_bobines_act')).count()
            ordem.num_paletes_stock_in = Palete.objects.filter(ordem=ordem, ordem_original_stock = 1, nome__isnull=False).exclude(ordem=ordem, num_bobines__gt=F('num_bobines_act')).count()
            ordem.save()            
    ordens_list = OrdemProducao.objects.filter(retrabalho=False).order_by('-ativa', 'completa', '-fim')
    template_name = 'ordensproducao/list_ordem.html'
        
    query = ""
    if request.GET:
        query = request.GET.get('q', '')
        ordens_list = OrdemProducao.objects.filter(op__icontains=query, retrabalho=False).order_by('-ativa', 'completa', '-fim')


    paginator = Paginator(ordens_list, 12)
    page = request.GET.get('page')
    

    try:
        ordens = paginator.page(page)
    except PageNotAnInteger:
        ordens = paginator.page(1)
    except EmptyPage:
        ordens = paginator.page(paginator.num_pages)
             

    context = {
        "ordens": ordens,
        
    }
    return render(request, template_name, context)

@login_required
def list_ordem_retrabalho(request):
    ordens_list = OrdemProducao.objects.filter(retrabalho=True).order_by('-ativa', 'completa', '-fim')
    template_name = 'ordensproducao/list_ordem_retrabalho.html'
    
    query = ""
    if request.GET:
        query = request.GET.get('q', '')
        ordens_list = OrdemProducao.objects.filter(op__icontains=query, retrabalho=True).order_by('-ativa', 'completa', '-fim')


    paginator = Paginator(ordens_list, 12)
    page = request.GET.get('page')
    

    try:
        ordens = paginator.page(page)
    except PageNotAnInteger:
        ordens = paginator.page(1)
    except EmptyPage:
        ordens = paginator.page(paginator.num_pages)
             

    context = {
        "ordens": ordens,
        
    }
    return render(request, template_name, context)

@login_required
def details_ordem(request, pk):
    ordem = OrdemProducao.objects.get(pk=pk)
    palete = Palete.objects.filter(ordem=ordem)
    num_paletes = Palete.objects.filter(ordem=ordem).count()
    ordem.num_paletes_produzidas = Palete.objects.filter(ordem=ordem, ordem_original_stock = 0, nome__isnull=False).exclude(ordem=ordem, num_bobines__gt=F('num_bobines_act')).count()
    ordem.num_paletes_stock_in = Palete.objects.filter(ordem=ordem, ordem_original_stock = 1, nome__isnull=False).exclude(ordem=ordem, num_bobines__gt=F('num_bobines_act')).count()
    ordem.save()
    template_name = 'ordensproducao/details_ordem.html'
    bobines_para_retrabalho = 0
    paletes_em_falta = ordem.num_paletes_produzir - ordem.num_paletes_produzidas
    paletes_em_falta_stock = ordem.num_paletes_stock - ordem.num_paletes_stock_in

    if ordem.retrabalho == True:
        bobines_para_retrabalho = BobinesARetrabalhar.objects.filter(ordem=ordem).order_by('-bobine__palete')

    

    context = {
        "ordem": ordem,
        "palete":palete,
        "num_paletes": num_paletes,
        "bobines_para_retrabalho": bobines_para_retrabalho,
        "paletes_em_falta": paletes_em_falta,
        "paletes_em_falta_stock": paletes_em_falta_stock 
        
    }
    return render(request, template_name, context)

@login_required
def ordem_add_stock(request, pk):
    ordem = OrdemProducao.objects.get(pk=pk)
    paletes_stock = Palete.objects.filter((Q(stock=True) & Q(cliente=ordem.cliente)) | (Q(stock=True) & Q(cliente=None)))
    paletes_ordem = Palete.objects.filter(ordem=ordem)
    template_name = 'ordensproducao/ordem_add_stock.html'
    num_paletes_total = Palete.objects.filter(ordem=ordem).count() 
    paletes_em_falta = ordem.num_paletes_stock - ordem.num_paletes_stock_in
    
  

    context = {
        "ordem": ordem,
        "paletes_stock": paletes_stock,
        "paletes_ordem": paletes_ordem,
        "num_paletes_total": num_paletes_total,
        "paletes_em_falta": paletes_em_falta
    }
    return render(request, template_name, context)
    

    
       
@login_required
def ordem_iniciar(request, pk):
    ordem = OrdemProducao.objects.get(pk=pk)
    ordem.ativa = True
    ordem.inicio = datetime.datetime.now()
    ordem.save()
    

    return redirect('planeamento:details_ordem', pk=ordem.pk)

@login_required
def ordem_cancelar(request, pk):
    ordem = OrdemProducao.objects.get(pk=pk)
    paletes = Palete.objects.filter(ordem=ordem)
    for palete in paletes:
        palete.ordem = None
        palete.palete_original = ordem.op
        palete.stock = True
        palete.save()
    ordem.num_paletes_produzidas = 0
    ordem.ativa = False
    ordem.inicio = None
    ordem.completa = True

    ordem.save()
    

    return redirect('planeamento:details_ordem', pk=ordem.pk)


@login_required
def palete_inserir_ordem(request, pk_palete, pk_ordem):
    ordem = OrdemProducao.objects.get(pk=pk_ordem)
    palete = Palete.objects.get(pk=pk_palete)
    num_paletes_ordem = Palete.objects.filter(pk=pk_ordem)
    if ordem.num_paletes_stock == ordem.num_paletes_stock_in:
        messages.error(request, 'Não é possivel inserir mais Paletes de stock na ordem de fabrico porque já foi atingido o limite.') 
    else:
        palete.ordem = ordem
        palete.stock = False
        palete.cliente = ordem.enc.cliente
        ordem.num_paletes_stock_in += 1
        ordem.save() 
        palete.save()

    return redirect('planeamento:ordem_add_stock', pk=ordem.pk)
    
@login_required
def palete_remover_ordem(request, pk_palete, pk_ordem):
    ordem = OrdemProducao.objects.get(pk=pk_ordem)
    palete = Palete.objects.get(pk=pk_palete)
    num_paletes_ordem = Palete.objects.filter(pk=pk_ordem)
    try:
        palete.ordem = OrdemProducao.objects.get(op=palete.ordem_original)
    except:
        palete.ordem = None

    palete.cliente = None
    ordem.num_paletes_stock_in -= 1
    palete.stock = True
    palete.save()
    ordem.save()

    return redirect('planeamento:ordem_add_stock', pk=ordem.pk)


@login_required
def create_ordem_dm(request):
    
    template_name = 'ordensproducao/create_ordem_dm.html'
    form = OrdemProducaoDMCreateForm(request.POST or None)
    if request.method == 'POST':
        form = OrdemProducaoDMCreateForm(request.POST, request.FILES)
        if form.is_valid():
        
            instance = form.save(commit=False)
            instance.user = request.user
            instance.retrabalho = True

            if instance.enc != None and instance.stock == False:
                enc = Encomenda.objects.get(pk=instance.enc.pk)
                if instance.enc.cliente != instance.cliente:
                    messages.error(request, 'O cliente que introduziu não condiz com o cliente referente à encomenda.') 
                else:
                    ordens = OrdemProducao.objects.filter(enc=instance.enc, retrabalho=True)
                    num_paletes_total_ordens = 0
                    for o in ordens:
                        num_paletes_total_ordens += o.num_paletes_total

                    if instance.num_paletes_total > (enc.num_paletes - num_paletes_total_ordens):
                        messages.error(request, 'O número de paletes que deseja produzir nesta Ordem de Produção é maior que o permitido na encomenda.') 
                    else:
                        count = OrdemProducao.objects.filter(enc=instance.enc).count()
                        instance.op = instance.enc.cliente.nome + ' L' + str(instance.largura) + ' DM12 ' + instance.enc.eef + ' ' + str(count + 1)
                        instance.num_paletes_total = instance.num_paletes_produzir
                        if instance.data_prevista_inicio != None and instance.hora_prevista_inicio != None and instance.horas_previstas_producao != None:
                            dt = datetime.datetime.combine(instance.data_prevista_inicio, instance.hora_prevista_inicio)
                            dt += timedelta(hours=instance.horas_previstas_producao)
                            instance.data_prevista_fim = dt.date()
                            instance.hora_prevista_fim = dt.time()
                        instance.save()
                        return redirect('planeamento:add_paletes_retrabalho', pk=instance.pk)
            elif instance.enc == None and instance.stock == True and instance.cliente != None:
                count = OrdemProducao.objects.filter(stock=True, retrabalho=True, cliente=instance.cliente).count()
                instance.op = instance.cliente.nome + ' L' + str(instance.largura) + ' DM12 STOCK ' + str(count + 1)
                instance.enc = None
                instance.num_paletes_total = instance.num_paletes_produzir
                if instance.data_prevista_inicio != None and instance.hora_prevista_inicio != None and instance.horas_previstas_producao != None:
                    dt = datetime.datetime.combine(instance.data_prevista_inicio, instance.hora_prevista_inicio)
                    dt += timedelta(hours=instance.horas_previstas_producao)
                    instance.data_prevista_fim = dt.date()
                    instance.hora_prevista_fim = dt.time()
                instance.save()
                return redirect('planeamento:add_paletes_retrabalho', pk=instance.pk)
            elif instance.enc != None and instance.stock == True:
                messages.error(request, 'Não pode ser criada uma Ordem de Produção para uma encomenda e em simultâneo para stock.') 
            elif instance.enc == None and instance.cliente != None and instance.stock == False:
                messages.error(request, 'Não é possivel criar uma ordem de produçaõ DM para cliente sem encomenda e sem ser para Stock.') 
            
        
   

    context = {
       "form": form
    }
    return render(request, template_name, context)

@login_required
def add_paletes_retrabalho(request, pk):
    op = get_object_or_404(OrdemProducao, pk=pk)
    paletes_dm = Palete.objects.filter(estado='DM', num_bobines_act__gte=1)
    paletes_ordem = PaletesARetrabalhar.objects.filter(ordem=op)
    
    template_name = 'ordensproducao/add_paletes_ordem.html'

    context = {
       "op": op,
       "paletes_dm": paletes_dm,
       "paletes_ordem": paletes_ordem
    }
    return render(request, template_name, context)

@login_required
def add_palete_retrabalho(request, pk_ordem, pk_palete):
    op = get_object_or_404(OrdemProducao, pk=pk_ordem)
    palete = get_object_or_404(Palete, pk=pk_palete)

    if PaletesARetrabalhar.objects.filter(ordem=op, palete=palete).exists():
        messages.error(request, 'A palete ' + palete.nome + ' já foi adicionada.')
    else:
        add = PaletesARetrabalhar.objects.create(palete=palete, ordem=op)
    

    return redirect('planeamento:add_paletes_retrabalho', pk=op.pk)

@login_required
def remove_palete_retrabalho(request, pk):
    palete_a_remover = PaletesARetrabalhar.objects.get(pk=pk)
    op = get_object_or_404(OrdemProducao, pk=palete_a_remover.ordem.pk)

    palete_a_remover.delete()
    

    return redirect('planeamento:add_paletes_retrabalho', pk=op.pk)

@login_required
def submit_paletes_para_retrabalho(request, pk):
    op = get_object_or_404(OrdemProducao, pk=pk)
    paletes_a_retrabalhar = PaletesARetrabalhar.objects.filter(ordem=op)
    for palete_a_retrabalhar in paletes_a_retrabalhar:
        palete = Palete.objects.get(pk=palete_a_retrabalhar.palete.pk)
        bobines = Bobine.objects.filter(palete=palete)
        for bob in bobines:
            bob.para_retrabalho = True
            bob.save()
        
    return redirect('planeamento:add_bobines_para_retrabalho', pk=op.pk)

@login_required
def add_bobines_para_retrabalho(request, pk):
    template_name = 'ordensproducao/add_bobines_para_retrabalho.html'
    op = get_object_or_404(OrdemProducao, pk=pk)
    paletes_a_retrabalhar = PaletesARetrabalhar.objects.filter(ordem=op)
            
    context = {
       "op": op,
       "paletes_a_retrabalhar": paletes_a_retrabalhar
       
    }
    return render(request, template_name, context)


@login_required
def change_status_bobine_retrabalho(request, pk, pk_ordem):
    op = OrdemProducao.objects.get(pk=pk_ordem)
    bobine = Bobine.objects.get(pk=pk)
    if bobine.para_retrabalho == True:
        bobine.para_retrabalho = False
        bobine.save()
    else:
        bobine.para_retrabalho = True
        bobine.save()
   

    return redirect('planeamento:add_bobines_para_retrabalho', pk=op.pk)

@login_required
def reset_status_bobine_retrabalho(request, pk_ordem):
    op = OrdemProducao.objects.get(pk=pk_ordem)
    paletes_a_retrabalhar = PaletesARetrabalhar.objects.filter(ordem=op)
    for palete_a_retrabalhar in paletes_a_retrabalhar:
        palete = Palete.objects.get(pk=palete_a_retrabalhar.palete.pk)
        bobines = Bobine.objects.filter(palete=palete)
        for bob in bobines:
            bob.para_retrabalho = True
            bob.save()

    return redirect('planeamento:add_bobines_para_retrabalho', pk=op.pk)

@login_required
def finalizar_ordem_retrabalho_dm(request, pk):
    op = OrdemProducao.objects.get(pk=pk)
    paletes_a_retrabalhar = PaletesARetrabalhar.objects.filter(ordem=op)
    for palete_a_retrabalhar in paletes_a_retrabalhar:
        palete = Palete.objects.get(pk=palete_a_retrabalhar.palete.pk)
        bobines = Bobine.objects.filter(palete=palete)
        for bob in bobines:
            if bob.para_retrabalho == True:
                bobine_a_retrabalhar = BobinesARetrabalhar.objects.create(bobine=bob, ordem=op, retrabalhar=True)
                bob.para_retrabalho = False
                bob.save()
            else:
                bobine_a_retrabalhar = BobinesARetrabalhar.objects.create(bobine=bob, ordem=op, retrabalhar=False)
  
    return redirect('planeamento:details_ordem', pk=op.pk)



def load_artigos(request):
    enc_id = request.GET.get('enc_id')
    enc = Encomenda.objects.get(id=enc_id)
    cliente = Cliente.objects.get(id=enc.cliente.id)
    artigos_cliente = ArtigoCliente.objects.filter(cliente=cliente).order_by('artigo')
    return render(request, 'ordensproducao/dropdown_options.html', {'artigos_cliente': artigos_cliente})     

def load_cliente(request):
    enc_id = request.GET.get('enc_id')
    enc = Encomenda.objects.get(id=enc_id)
    clientes = Cliente.objects.filter(id=enc.cliente.id)
    return render(request, 'ordensproducao/dropdown_options_cliente.html', {'clientes': clientes})     

@login_required
def load_encomendas(request):
    cliente = request.GET.get('cliente_id')
    cliente_obj = get_object_or_404(Cliente, pk=cliente) 
    encomendas = Encomenda.objects.filter(cliente=cliente_obj)
    
    return render(request, 'perfil/dropdown_enc.html', {'encomendas': encomendas})  

@login_required
def finalizar_ordem(request, pk):
    ordem = get_object_or_404(OrdemProducao, pk=pk)
    ordem.fim = datetime.datetime.now()
    if ordem.num_paletes_produzidas < ordem.num_paletes_produzir or ordem.num_paletes_stock_in < ordem.num_paletes_stock:
        messages.error(request, 'Numero de paletes insuficiente!')
    else:
        #ordem.num_paletes_total = ordem.num_paletes_produzidas + ordem.num_paletes_stock_in
        #ordem.num_paletes_stock = ordem.num_paletes_stock_in
        #ordem.num_paletes_produzir = ordem.num_paletes_produzidas
        ordem.ativa = False
        ordem.completa = True
        ordem.save()
    return redirect('planeamento:details_ordem', pk=ordem.pk)

@login_required
def reabrir_ordem(request, pk):
    ordem = get_object_or_404(OrdemProducao, pk=pk)
    ordem.fim = None
    ordem.ativa = True
    ordem.completa = False
    ordem.save()
    return redirect('planeamento:details_ordem', pk=ordem.pk)

@login_required
def edit_ordem(request, pk):
    ordem = get_object_or_404(OrdemProducao, pk=pk)
    template_name = 'ordensproducao/edit_ordem.html'
   
    form = OrdemProducaoEditForm(request.POST or None, instance=ordem)
    form_inc = OrdemProducaoEditIncForm(request.POST or None, instance=ordem)

    if request.method == 'POST':
        if ordem.completa == False and ordem.ativa == False:
            form = OrdemProducaoEditForm(request.POST, request.FILES, instance=ordem)
            if form.is_valid():
                instance = form.save(commit=False)
                instance.user = request.user
                try:
                    dt = datetime.datetime.combine(instance.data_prevista_inicio, instance.hora_prevista_inicio)
                    dt += timedelta(hours=instance.horas_previstas_producao)
                    instance.data_prevista_fim = dt.date()
                    instance.hora_prevista_fim = dt.time()
                    instance.num_paletes_total = instance.num_paletes_stock + instance.num_paletes_produzir
                    instance.save()
                    return redirect('planeamento:details_ordem', pk=ordem.pk)
                except:
                    messages.error(request, 'O formulário de edição tem erros. Por favor verifique a infromação introduzida.') 
        elif ordem.completa == False and ordem.ativa == True:           
            form_inc = OrdemProducaoEditIncForm(request.POST, request.FILES, instance=ordem)
            if form_inc.is_valid():
                instance = form_inc.save(commit=False)
                instance.user = request.user
                try:
                    instance.num_paletes_total = instance.num_paletes_stock + instance.num_paletes_produzir
                    instance.save()
                    return redirect('planeamento:details_ordem', pk=ordem.pk)
                except:
                    messages.error(request, 'O formulário de edição tem erros. Por favor verifique a infromação introduzida.') 

                  

            
            
    context = {
       "form": form,
       "form_inc": form_inc,
       "ordem": ordem
    }
    return render(request, template_name, context)