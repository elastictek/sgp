from producao.models import *
import datetime
from django.contrib.sessions.models import Session
import pyodbc
from support.database import encloseColumn, Filters, DBSql, TypeDml, fetchall, Check
from django.db import connections, transaction

def applyOFtoBobine(bobine,palete):
    db = DBSql(connections["default"].alias)
    if (bobine.ordem_changed==0 or bobine.ordem_changed is None) and palete.ordem_id_original is not None:
        bobine.ordem_changed=1
        b_ordem_id = bobine.ordem_id
        bm_id = bobine.bobinagem_id
        p_ordem_id = palete.ordem_id_original
        if p_ordem_id is not None:
            conn = connections["default"].cursor()
            if b_ordem_id is not None:
                b = db.executeSimpleList(lambda: (f"""select pp.agg_of_id_id agg_of_id from producao_bobine pb join planeamento_ordemproducao pp on pp.id=pb.ordem_id where pb.ordem_id={b_ordem_id} and pb.id={bobine.id}"""), conn, {})
            else:
                b = db.executeSimpleList(lambda: (f"""select acs.agg_of_id from producao_bobinagem pbm join audit_currentsettings acs on pbm.audit_current_settings_id=acs.id where pbm.id={bm_id}"""), conn, {})
            p = db.executeSimpleList(lambda: (f"""select pp.agg_of_id_id agg_of_id from producao_palete pl join planeamento_ordemproducao pp on pp.id=pl.ordem_id_original where pl.ordem_id={p_ordem_id} and pl.id = {palete.id}"""), conn, {})
            if len(b["rows"])>0 and len(p["rows"])>0:
                if b["rows"][0]["agg_of_id"] == p["rows"][0]["agg_of_id"] and b_ordem_id != p_ordem_id:
                    bobine.ordem_id=p_ordem_id

def areas(pk):
    bobinagem = Bobinagem.objects.get(pk=pk)
    bobine = Bobine.objects.filter(bobinagem=bobinagem)

    # area_g = bobinagem.area_g
    # area_r = bobinagem.area_r
    # area_dm = bobinagem.area_dm
    # area_ind = bobinagem.area_ind
    # area_ba = bobinagem.area_ba

    area_g = 0
    area_r = 0
    area_dm = 0
    area_ind = 0
    area_ba = 0

    for b in bobine:
        estado = b.estado

        if estado == 'G':
            area_g += b.area
        
        elif estado == 'R':
            area_r += b.area
        
        elif estado == 'DM':
            area_dm += b.area

        elif estado == 'IND':
            area_ind += b.area

        elif estado == 'BA':
            area_ba += b.area
    
    bobinagem.area_g = area_g
    bobinagem.area_r = area_r
    bobinagem.area_dm = area_dm
    bobinagem.area_ind = area_ind
    bobinagem.area_ba = area_ba
    bobinagem.save()

def update_areas_bobine(pk, estado):
    bobine = Bobine.objects.get(pk=pk)
    bobinagem = bobine.bobinagem
    estado_anterior = estado
    estado_actual = bobine.estado

    if estado_actual == estado_anterior:
        pass
    elif estado_anterior == 'LAB' or estado_anterior == 'HOLD':
        if estado_actual == 'G':
            bobinagem.area_g += bobine.area
        elif estado_actual == 'DM':
            bobinagem.area_dm += bobine.area
        elif estado_actual == 'R':
            bobinagem.area_r += bobine.area
        elif estado_actual == 'IND':
            bobinagem.area_ind += bobine.area
        elif  estado_actual == 'BA':
            bobinagem.area_ba += bobine.area
    elif estado_anterior == 'G':
        if estado_actual == 'DM':
            bobinagem.area_g -= bobine.area
            bobinagem.area_dm += bobine.area
        elif estado_actual == 'R':
            bobinagem.area_g -= bobine.area
            bobinagem.area_r += bobine.area
        elif estado_actual == 'IND':
            bobinagem.area_g -= bobine.area
            bobinagem.area_ind += bobine.area
        elif estado_actual == 'BA':
            bobinagem.area_g -= bobine.area
            bobinagem.area_ba += bobine.area
        elif estado_actual == 'LAB':
            bobinagem.area_g -= bobine.area
        elif estado_actual == 'HOLD':
            bobinagem.area_g -= bobine.area
            
    elif estado_anterior == 'DM':
        if estado_actual == 'G':
            bobinagem.area_dm -= bobine.area
            bobinagem.area_g += bobine.area
        elif estado_actual == 'R':
            bobinagem.area_dm -= bobine.area
            bobinagem.area_r += bobine.area
        elif estado_actual == 'IND':
            bobinagem.area_dm -= bobine.area
            bobinagem.area_ind += bobine.area
        elif estado_actual == 'BA':
            bobinagem.area_dm -= bobine.area
            bobinagem.area_ba += bobine.area
        elif estado_actual == 'LAB':
            bobinagem.area_dm -= bobine.area
            
        elif estado_actual == 'HOLD':
            bobinagem.area_dm -= bobine.area
            

    elif estado_anterior == 'R':
        if estado_actual == 'G':
            bobinagem.area_r -= bobine.area
            bobinagem.area_g += bobine.area
        elif estado_actual == 'DM':
            bobinagem.area_r -= bobine.area
            bobinagem.area_dm += bobine.area
        elif estado_actual == 'IND':
            bobinagem.area_r -= bobine.area
            bobinagem.area_ind += bobine.area
        elif estado_actual == 'BA':
            bobinagem.area_r -= bobine.area
            bobinagem.area_ba += bobine.area
        elif estado_actual == 'LAB':
            bobinagem.area_r -= bobine.area
            
        elif estado_actual == 'HOLD':
            bobinagem.area_r -= bobine.area
            

    elif estado_anterior == 'IND':
        if estado_actual == 'G':
            bobinagem.area_ind -= bobine.area
            bobinagem.area_g += bobine.area
        elif estado_actual == 'DM':
            bobinagem.area_ind -= bobine.area
            bobinagem.area_dm += bobine.area
        elif estado_actual == 'R':
            bobinagem.area_ind -= bobine.area
            bobinagem.area_r += bobine.area
        elif estado_actual == 'BA':
            bobinagem.area_ind -= bobine.area
            bobinagem.area_ba += bobine.area
        elif estado_actual == 'LAB':
            bobinagem.area_ind -= bobine.area
            
        elif estado_actual == 'HOLD':
            bobinagem.area_ind -= bobine.area
            
    elif estado_anterior == 'BA':
        if estado_actual == 'G':
            bobinagem.area_ba -= bobine.area
            bobinagem.area_g += bobine.area
        elif estado_actual == 'DM':
            bobinagem.area_ba -= bobine.area
            bobinagem.area_dm += bobine.area
        elif estado_actual == 'R':
            bobinagem.area_ba -= bobine.area
            bobinagem.area_r += bobine.area
        elif estado_actual == 'IND':
            bobinagem.area_ba -= bobine.area
            bobinagem.area_ind += bobine.area
        elif estado_actual == 'LAB':
            bobinagem.area_ba -= bobine.area
            
        elif estado_actual == 'HOLD':
            bobinagem.area_ba -= bobine.area
            
    
        
    bobinagem.save()    

        
    
def bobinagem_create(pk):
    instance = Bobinagem.objects.get(pk=pk)
    if not instance.nome:
        data = instance.data
        data = data.strftime('%Y%m%d')
        map(int, data)
        if instance.perfil.retrabalho == True and instance.num_emendas > 0:
            if instance.num_bobinagem < 10:
                # instance.nome = '3%s-0%s' % (data, instance.num_bobinagem)
                instance.nome = '3%s-0%s' % (data[1:], instance.num_bobinagem)

            else:
                instance.nome = '3%s-%s' % (data[1:], instance.num_bobinagem)
        elif instance.perfil.retrabalho == True and instance.num_emendas == 0:
            if instance.num_bobinagem < 10:
                instance.nome = '4%s-0%s' % (data[1:], instance.num_bobinagem)
            else:
                instance.nome = '4%s-%s' % (data[1:], instance.num_bobinagem)
        else:
            if instance.num_bobinagem < 10:
                instance.nome = '%s-0%s' % (data, instance.num_bobinagem)
            else:
                instance.nome = '%s-%s' % (data, instance.num_bobinagem)
     
    instance.save()
    desperdicio(instance.pk) 
    if not instance.perfil.retrabalho == True:
        tempo_duracao(instance.pk)
    area_bobinagem(instance.pk) 
    create_bobine(instance.pk) 

def bobinagem_create_retrabalho(pk):
    instance = Bobinagem.objects.get(pk=pk)
    if not instance.nome:
        data = instance.data
        data = data.strftime('%Y%m%d')
        map(int, data)
        if instance.num_bobinagem < 10:
            instance.nome = '4%s-0%s' % (data[1:], instance.num_bobinagem)
        else:
            instance.nome = '4%s-%s' % (data[1:], instance.num_bobinagem)
        
    instance.save()
    area_bobinagem(instance.pk) 
    create_bobine(instance.pk)   
      
     
       

def create_bobine(pk):
    instance = Bobinagem.objects.get(pk=pk)
    num = 1
    desp_bobine = instance.desper / Decimal(instance.perfil.num_bobines)
    for i in range(instance.perfil.num_bobines):
        lar = Largura.objects.get(perfil=instance.perfil, num_bobine=num)
        bob = Bobine.objects.filter(bobinagem=instance, largura=lar)
        if not bob:
            bob = Bobine.objects.create(bobinagem=instance, largura=lar, comp_actual=instance.comp, comp = instance.comp, artigo=lar.artigo, designacao_prod=lar.designacao_prod, diam=instance.diam, cliente=lar.cliente.nome)
            if num < 10:
                bob.nome = '%s-0%s' % (instance.nome, num)
            else:
                bob.nome = '%s-%s' % (instance.nome, num)
            if bob.bobinagem.estado == 'R':
                bob.estado = 'R'   
            elif bob.bobinagem.estado == 'DM':
                bob.estado = 'DM'
            elif bob.bobinagem.estado == 'G':
                bob.estado = 'G'
            elif bob.bobinagem.estado == 'BA':
                bob.estado = 'BA'
            elif bob.bobinagem.estado == 'IND':
                bob.estado = 'IND'
            elif bob.bobinagem.estado == 'SC':
                bob.estado = 'SC'
            else:
                bob.estado = 'LAB'

            if instance.tipo_desp == 'R':
                bob.tipo_desp = 'R'
                bob.desp = desp_bobine
            elif instance.tipo_desp == 'BA':
                bob.tipo_desp = 'BA'
                bob.desp = desp_bobine

            bob.save() 
            area_bobine(bob.pk)
        num += 1
  
    
def tempo_duracao(pk):
    instance = Bobinagem.objects.get(pk=pk)
    if instance.inico or instance.fim:
        # if not instance.duracao:
        fim = instance.fim
        fim = fim.strftime('%H:%M')
        inico = instance.inico
        inico = inico.strftime('%H:%M')
        (hf, mf) = fim.split(':')
        (hi, mi) = inico.split(':')
        if hf < hi: 
            result = (int(hf) * 3600 + int(mf) * 60) - (int(hi) * 3600 + int(mi) * 60) + 86400
        else:
            result = (int(hf) * 3600 + int(mf) * 60) - (int(hi) * 3600 + int(mi) * 60) 
        
        result_str = strftime("%H:%M", gmtime(result))
        instance.duracao = result_str
        instance.save()

def area_bobinagem(pk):
    instance = Bobinagem.objects.get(pk=pk)
    largura = instance.perfil.largura_bobinagem / 1000
    instance.area = instance.comp_cli * largura
    instance.save()

def desperdicio(pk):
    instance = Bobinagem.objects.get(pk=pk)
    if instance.comp_par > 0:
        desp = instance.comp - instance.comp_par
        x = instance.comp_par * Decimal('0.05')
        if desp <= x:
            instance.comp_cli = instance.comp
        else:        
            instance.comp_cli = instance.comp_par * Decimal('1.05')
            instance.desper = (instance.comp - instance.comp_cli) / 1000 * instance.perfil.largura_bobinagem
    elif instance.comp_par == 0:
        instance.comp_cli = instance.comp
        instance.desper = 0
    instance.save()

def area_bobine(pk):
    instance = Bobine.objects.get(pk=pk)
    largura = instance.largura.largura / 1000
    instance.area = largura * instance.bobinagem.comp_cli
    instance.save()

def etiqueta_add_bobine(pk_palete, pk_bobine):
    palete = Palete.objects.get(pk=pk_palete)
    bobine = Bobine.objects.get(pk=pk_bobine)
    e_p = EtiquetaPalete.objects.get(palete=palete)
    bob = [None] * 61
    
    posicao = bobine.posicao_palete
    bob[posicao] = bobine.nome
    if e_p.bobine1 == None or posicao == 1:
        e_p.bobine1 = bob[1]
    elif e_p.bobine2 == None or posicao == 2:    
        e_p.bobine2 = bob[2]
    elif e_p.bobine3 == None or posicao == 3:    
        e_p.bobine3 = bob[3]
    elif e_p.bobine4 == None or posicao == 4:    
        e_p.bobine4 = bob[4]
    elif e_p.bobine5 == None or posicao == 5:    
        e_p.bobine5 = bob[5]
    elif e_p.bobine6 == None or posicao == 6:  
        e_p.bobine6 = bob[6]
    elif e_p.bobine7 == None or posicao == 7:  
        e_p.bobine7 = bob[7]
    elif e_p.bobine8 == None or posicao == 8:  
        e_p.bobine8 = bob[8]
    elif e_p.bobine9 == None or posicao == 9:      
        e_p.bobine9 = bob[9]
    elif e_p.bobine10 == None or posicao == 10:  
        e_p.bobine10 = bob[10]
    elif e_p.bobine11 == None or posicao == 11: 
        e_p.bobine11 = bob[11]
    elif e_p.bobine12 == None or posicao == 12: 
        e_p.bobine12 = bob[12]
    elif e_p.bobine13 == None or posicao == 13: 
        e_p.bobine13 = bob[13]
    elif e_p.bobine14 == None or posicao == 14:     
        e_p.bobine14 = bob[14]
    elif e_p.bobine15 == None or posicao == 15: 
        e_p.bobine15 = bob[15]
    elif e_p.bobine16 == None or posicao == 16: 
        e_p.bobine16 = bob[16]
    elif e_p.bobine17 == None or posicao == 17: 
        e_p.bobine17 = bob[17]
    elif e_p.bobine18 == None or posicao == 18: 
        e_p.bobine18 = bob[18]
    elif e_p.bobine19 == None or posicao == 19: 
        e_p.bobine19 = bob[19]
    elif e_p.bobine20 == None or posicao == 20: 
        e_p.bobine20 = bob[20]
    elif e_p.bobine21 == None or posicao == 21: 
        e_p.bobine21 = bob[21]
    elif e_p.bobine22 == None or posicao == 22: 
        e_p.bobine22 = bob[22]
    elif e_p.bobine23 == None or posicao == 23: 
        e_p.bobine23 = bob[23]
    elif e_p.bobine24 == None or posicao == 24: 
        e_p.bobine24 = bob[24]
    elif e_p.bobine25 == None or posicao == 25: 
        e_p.bobine25 = bob[25]
    elif e_p.bobine26 == None or posicao == 26: 
        e_p.bobine26 = bob[26]
    elif e_p.bobine27 == None or posicao == 27: 
        e_p.bobine27 = bob[27]
    elif e_p.bobine28 == None or posicao == 28: 
        e_p.bobine28 = bob[28]
    elif e_p.bobine29 == None or posicao == 29: 
        e_p.bobine29 = bob[29]
    elif e_p.bobine30 == None or posicao == 30: 
        e_p.bobine30 = bob[30]
    elif e_p.bobine31 == None or posicao == 31: 
        e_p.bobine31 = bob[31]
    elif e_p.bobine32 == None or posicao == 32: 
        e_p.bobine32 = bob[32]
    elif e_p.bobine33 == None or posicao == 33: 
        e_p.bobine33 = bob[33]
    elif e_p.bobine34 == None or posicao == 34:
        e_p.bobine34 = bob[34]
    elif e_p.bobine35 == None or posicao == 35:
        e_p.bobine35 = bob[35]
    elif e_p.bobine36 == None or posicao == 36:
        e_p.bobine36 = bob[36]
    elif e_p.bobine37 == None or posicao == 37:
        e_p.bobine37 = bob[37]
    elif e_p.bobine38 == None or posicao == 38:
        e_p.bobine38 = bob[38]
    elif e_p.bobine39 == None or posicao == 39:
        e_p.bobine39 = bob[39]
    elif e_p.bobine40 == None or posicao == 40:
        e_p.bobine40 = bob[40]
    elif e_p.bobine41 == None or posicao == 41:
        e_p.bobine41 = bob[41]
    elif e_p.bobine42 == None or posicao == 42:
        e_p.bobine42 = bob[42]
    elif e_p.bobine43 == None or posicao == 43:
        e_p.bobine43 = bob[43]
    elif e_p.bobine44 == None or posicao == 44:
        e_p.bobine44 = bob[44]
    elif e_p.bobine45 == None or posicao == 45:
        e_p.bobine45 = bob[45]
    elif e_p.bobine46 == None or posicao == 46:
        e_p.bobine46 = bob[46]
    elif e_p.bobine47 == None or posicao == 47:
        e_p.bobine47 = bob[47]
    elif e_p.bobine48 == None or posicao == 48:
        e_p.bobine48 = bob[48]
    elif e_p.bobine49 == None or posicao == 49:
        e_p.bobine49 = bob[49]
    elif e_p.bobine50 == None or posicao == 50:
        e_p.bobine50 = bob[50]
    elif e_p.bobine51 == None or posicao == 51:
        e_p.bobine51 = bob[51]
    elif e_p.bobine52 == None or posicao == 52:
        e_p.bobine52 = bob[52]
    elif e_p.bobine53 == None or posicao == 53:
        e_p.bobine53 = bob[53]
    elif e_p.bobine54 == None or posicao == 54:
        e_p.bobine54 = bob[54]
    elif e_p.bobine55 == None or posicao == 55:
        e_p.bobine55 = bob[55]
    elif e_p.bobine56 == None or posicao == 56:
        e_p.bobine56 = bob[56]
    elif e_p.bobine57 == None or posicao == 57:
        e_p.bobine57 = bob[57]
    elif e_p.bobine58 == None or posicao == 58:
        e_p.bobine58 = bob[58]
    elif e_p.bobine59 == None or posicao == 59:
        e_p.bobine59 = bob[59]
    elif e_p.bobine60 == None or posicao == 60:
        e_p.bobine60 = bob[60]
    
    e_p.save()

def palete_nome(pk):
    instance = Palete.objects.get(pk=pk)
    if not instance.nome:
        ano = instance.data_pal
        ano = ano.strftime('%Y')
        if instance.estado == 'DM':
            num = instance.num
            
            if num < 10:
                instance.nome = 'DM000%s-%s' % (num, ano)
            elif num < 100:
                instance.nome = 'DM00%s-%s' % (num, ano)
            elif num < 1000:
                instance.nome = 'DM0%s-%s' % (num, ano)
            else:
                instance.nome = 'DM%s-%s' % (num, ano)
            instance.save()

        elif instance.estado == 'G':
            if instance.retrabalhada == False: 
                # palete = Palete.objects.filter(estado='G', data_pal__gte='2019-01-01')
                # num = 0
                # for p in palete:
                #     if p.num > num:
                #         num = p.num
                       
                num = instance.num
                if num < 10:    
                    instance.nome = 'P000%s-%s' % (num, ano)  
                elif num < 100:
                    instance.nome = 'P00%s-%s' % (num, ano)
                elif num < 1000:
                    instance.nome = 'P0%s-%s' % (num, ano)
                else: 
                    instance.nome = 'P%s-%s' % (num, ano)

                instance.save()

        
        if EtiquetaPalete.objects.filter(palete=instance).exists():
            return redirect('producao:palete_details', pk=instance.pk)
        else:
            if instance.retrabalhada == False:
                e_p = EtiquetaPalete.objects.create(palete=instance, palete_nome=instance.nome, largura_bobine=instance.largura_bobines)
                if instance.cliente != None:
                    e_p.cliente = instance.cliente.nome
            else:
               e_p = EtiquetaPalete.objects.create(palete=instance, palete_nome=instance.nome, largura_bobine=instance.largura_bobines)
            e_p.save()
               
            
def bobinagem_retrabalho_nome(data, num_bobinagem):
    data = data.strftime('%Y%m%d')
    map(int, data)
    if num_bobinagem < 10:
        nome_s_emendas = '4%s-0%s' % (data[1:], num_bobinagem)
        nome_c_emendas = '3%s-0%s' % (data[1:], num_bobinagem)
    else:
        nome_s_emendas = '4%s-%s' % (data[1:], num_bobinagem)
        nome_c_emendas = '3%s-%s' % (data[1:], num_bobinagem)

    return (nome_s_emendas, nome_c_emendas)


def update_etiqueta_final(pk):
    palete = get_object_or_404(Palete, pk=pk)
    e_p = get_object_or_404(EtiquetaPalete, palete=palete)
    e_f = get_object_or_404(EtiquetaFinal, palete=palete)
    bobines = Bobine.objects.filter(palete=palete)
    bobine_1 = Bobine.objects.get(palete=palete, posicao_palete=1)
    palete_nome = e_p.palete_nome
    produto = e_p.produto
    largura_bobine = e_p.largura_bobine
    diam_min = e_p.diam_min
    diam_max = e_p.diam_max
    cliente = e_p.cliente
    cod_cliente = palete.cliente.cod
    core_bobines = palete.core_bobines
    area = palete.area
    comp_total = palete.comp_total
    prf = palete.carga.enc.prf
    num_bobines = palete.num_bobines
    peso_liquido = palete.peso_liquido
    peso_bruto = palete.peso_bruto
    num_paletes_total = palete.carga.num_paletes
    num_palete_carga = palete.num_palete_carga

    cod_cliente_cliente = None
    if cliente == 'ONTEX':
        if largura_bobines == 140:
            cod_cliente_cliente = 'G2.6592'
        elif largura_bobines == 80:
            cod_cliente_cliente = 'G2.6590'
        elif largura_bobines == 70:
            cod_cliente_cliente = 'G2.6589'
        elif largura_bobines == 65:
            cod_cliente_cliente = 'G2.6543'
        elif largura_bobines == 130:
            cod_cliente_cliente = 'G2.6591'
    elif cliente == 'ABENA':
        if largura_bobines == 150:
            cod_cliente_cliente = '10000018848'
    elif cliente == 'Paul Hartman':
        if largura_bobines == 240:
            cod_cliente_cliente = 'ELASTEK m16'
    elif cliente == 'Sanita S.A.L.':
        if largura_bobines == 150:
            cod_cliente_cliente = 'R406EAR15'

    if core_bobines == '3':
        core_bobines = 76.6
    elif core_bobines == '6':
        core_bobines = 152.6

    #data_inicial = palete.carga.data
    data_init = None
    for b in bobines:
        if  data_init == None or b.bobinagem.data < data_init:
            data_init = b.bobinagem.data
    data_prod = data_init
    #data_prod = data_inicial
    
    data_validade = data_prod + datetime.timedelta(days=356)

    gsm = bobine_1.largura.gsm

    if cod_cliente_cliente is not None:
        e_f.palete_nome = palete_nome
        e_f.produto = produto
        e_f.largura_bobine = largura_bobine
        e_f.diam_min = diam_min
        e_f.diam_max = diam_max
        e_f.cod_cliente = cod_cliente
        e_f.cod_cliente_cliente = cod_cliente_cliente
        e_f.core = core_bobines
        e_f.area = area
        e_f.comp = comp_total
        e_f.prf = prf
        e_f.num_bobines = num_bobines
        e_f.palete_num = num_palete_carga
        e_f.palete_total = num_paletes_total
        e_f.peso_liquido = peso_liquido
        e_f.peso_bruto = peso_bruto
        e_f.data_prod = data_prod
        e_f.data_validade = data_validade
        e_f.gsm = gsm
        e_f.save()
    else:
        e_f.palete_nome = palete_nome
        e_f.produto = produto
        e_f.largura_bobine = largura_bobine
        e_f.diam_min = diam_min
        e_f.diam_max = diam_max
        e_f.cod_cliente = cod_cliente
        e_f.core = core_bobines
        e_f.area = area
        e_f.comp = comp_total
        e_f.prf = prf
        e_f.num_bobines = num_bobines
        e_f.palete_num = num_palete_carga
        e_f.palete_total = num_paletes_total
        e_f.peso_liquido = peso_liquido
        e_f.peso_bruto = peso_bruto
        e_f.data_prod = data_prod
        e_f.data_validade = data_validade
        e_f.gsm = gsm
        e_f.save()
    
  

def gerar_etiqueta_final(pk):
    palete = get_object_or_404(Palete, pk=pk)
    e_p = get_object_or_404(EtiquetaPalete, palete=palete)
    bobines = Bobine.objects.filter(palete=palete)
    bobine_1 = Bobine.objects.get(palete=palete, posicao_palete=1)
    palete_nome = e_p.palete_nome
    produto = e_p.produto
    largura_bobines = e_p.largura_bobine
    diam_min = e_p.diam_min
    diam_max = e_p.diam_max
    cliente = e_p.cliente
    cod_cliente = palete.cliente.cod
    core_bobines = palete.core_bobines
    area = palete.area
    comp_total = palete.comp_total
    prf = palete.carga.enc.prf
    order_num = palete.carga.enc.order_num
    num_bobines = palete.num_bobines
    peso_liquido = palete.peso_liquido
    peso_bruto = palete.peso_bruto
    num_paletes_total = palete.carga.num_paletes
    num_palete_carga = palete.num_palete_carga
    artigo = bobine_1.artigo
    ult_cont = EtiquetaFinal.objects.latest('id').cont


    palete_hora_str = palete.timestamp.strftime('%H')
    palete_hora = int(palete_hora_str)
    turno = ''
    
    if palete_hora >= 8 and palete_hora < 16:
        turno = 'A'
    elif palete_hora >= 16 and palete_hora <= 23:
        turno = 'B'
    elif palete_hora >= 0 and palete_hora < 8:
        turno = 'C'
            
    cod_cliente_cliente = None
    try:
        artigo_cliente = ArtigoCliente.objects.get(artigo=bobine_1.artigo, cliente=palete.cliente)
        cod_cliente_cliente = artigo_cliente.cod_client
    except:
        cod_cliente_cliente = None
    

    # if cliente == 'ONTEX':
    #     if largura_bobines == 140:
    #         cod_cliente_cliente = 'G2.6592'
    #     elif largura_bobines == 80:
    #         cod_cliente_cliente = 'G2.6590'
    #     elif largura_bobines == 70:
    #         cod_cliente_cliente = 'G2.6589'
    #     elif largura_bobines == 65:
    #         cod_cliente_cliente = 'G2.6543'
    #     elif largura_bobines == 130:
    #         cod_cliente_cliente = 'G2.6591'
    # elif cliente == 'ABENA':
    #     if largura_bobines == 150:
    #         cod_cliente_cliente = '10000018848'
    # elif cliente == 'Paul Hartman':
    #     if largura_bobines == 240:
    #         cod_cliente_cliente = 'ELASTEK m16'
    if cliente == 'NUNEX' or cliente == 'Faderco SPA':
        area = (peso_liquido * 1000) / 100 
        comp_total = (Decimal(area) / ((Decimal(num_bobines) * Decimal(largura_bobines)) * Decimal(0.001))) * (Decimal(num_bobines))




    if core_bobines == '3':
        core_bobines = 76.6
    elif core_bobines == '6':
        core_bobines = 152.6

    #data_inicial = palete.carga.data
    data_init = None
    dup = 0
    previous_artigo = None
    for b in bobines:
        if previous_artigo != None and previous_artigo != b.artigo_id:
            dup = dup + 1
        previous_artigo = b.artigo_id
        if  data_init == None or b.bobinagem.data < data_init:
            data_init = b.bobinagem.data
    data_prod = data_init
    #data_prod = data_inicial

    if dup>0:
        return -1
        
    data_validade = data_prod + datetime.timedelta(days=356)

    #gsm = bobine_1.largura.gsm
    gsm = artigo.gsm
    
    cont = ult_cont + 1
    gtin = artigo.gtin
    # control = cont
    # gtin_str = (str(gtin)[:-2])
    # sscc_str = "0" + gtin_str + str(cont) + str(control)
    # sscc = sscc_str
    
    if EtiquetaFinal.objects.filter(palete=palete).exists():
        e_f_e = EtiquetaFinal.objects.filter(palete=palete)
        for e in e_f_e:
            e.activa = False
            e.save()

    
    if cod_cliente_cliente is not None:
        e_f = EtiquetaFinal.objects.create(cont=cont, gtin=gtin, palete=palete, palete_nome=palete_nome, produto=produto, largura_bobine=largura_bobines, diam_min=diam_min, diam_max=diam_max, cod_cliente=cod_cliente, cod_cliente_cliente=cod_cliente_cliente, core=core_bobines, area=area, comp=comp_total, prf=prf, num_bobines=num_bobines, palete_num=num_palete_carga, palete_total=num_paletes_total, peso_liquido=peso_liquido, peso_bruto=peso_bruto, data_prod=data_prod, data_validade=data_validade, gsm=gsm, order_num=order_num, turno=turno)
    else:
        e_f = EtiquetaFinal.objects.create(cont=cont, gtin=gtin, palete=palete, palete_nome=palete_nome, produto=produto, largura_bobine=largura_bobines, diam_min=diam_min, diam_max=diam_max, cod_cliente=cod_cliente, core=core_bobines, area=area, comp=comp_total, prf=prf, num_bobines=num_bobines, palete_num=num_palete_carga, palete_total=num_paletes_total, peso_liquido=peso_liquido, peso_bruto=peso_bruto, data_prod=data_prod, data_validade=data_validade, gsm=gsm, order_num=order_num, turno=turno)
    return 0

def add_artigo_to_bobine(pk):
    palete = get_object_or_404(Palete, pk=pk)
    bobines = Bobine.objects.filter(palete=palete)
    cliente = palete.cliente
    artigos = Artigo.objects.all()
    
    if cliente.nome == 'BB DISTRIBE SAS':
        for b in bobines:
            if (b.largura.largura == 160 and b.palete.cliente.diam_ref == 1200 and b.bobinagem.perfil.core == '6' and b.largura.gsm == '100' and b.largura.designacao_prod == 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HE'):
                artigo = get_object_or_404(Artigo, pk=61)
                b.artigo = artigo
                b.save()
            else:
                for a in artigos:
                    if (b.largura.largura == a.lar and b.palete.cliente.diam_ref == a.diam_ref and b.bobinagem.perfil.core == a.core and b.largura.gsm == a.gsm and b.largura.designacao_prod == a.produto):
                        artigo = get_object_or_404(Artigo, pk=a.pk)
                        b.artigo = artigo
                        b.save()

    elif cliente.nome == 'Faderco SPA':
        for b in bobines:
            if (b.largura.largura == 160 and b.palete.cliente.diam_ref == 1200 and b.bobinagem.perfil.core == '6' and b.largura.gsm == '100' and b.largura.designacao_prod == 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HE'):
                artigo = get_object_or_404(Artigo, pk=48)
                b.artigo = artigo
                b.save()
            else:
                for a in artigos:
                    if (b.largura.largura == a.lar and b.palete.cliente.diam_ref == a.diam_ref and b.bobinagem.perfil.core == a.core and b.largura.gsm == a.gsm and b.largura.designacao_prod == a.produto):
                        artigo = get_object_or_404(Artigo, pk=a.pk)
                        b.artigo = artigo
                        b.save()

    elif cliente.nome == 'ENKA HIJYEN' or cliente.nome == 'PAKTEN SAGLIK URUNLERI' :
        for b in bobines:
            if (b.largura.largura == 75 and b.palete.cliente.diam_ref == 1100 and b.bobinagem.perfil.core == '6' and b.largura.gsm == '100' and b.largura.designacao_prod == 'NONWOVEN ELASTIC BANDS ELA-ACE 100 HE'):
                artigo = get_object_or_404(Artigo, pk=66)
                b.artigo = artigo
                b.save()
            else:
                for a in artigos:
                    if (b.largura.largura == a.lar and b.palete.cliente.diam_ref == a.diam_ref and b.bobinagem.perfil.core == a.core and b.largura.gsm == a.gsm and b.largura.designacao_prod == a.produto):
                        artigo = get_object_or_404(Artigo, pk=a.pk)
                        b.artigo = artigo
                        b.save()

    else:
        for b in bobines:
            for a in artigos:
                if (b.largura.largura == a.lar and b.palete.cliente.diam_ref == a.diam_ref and b.bobinagem.perfil.core == a.core and b.largura.gsm == a.gsm and b.largura.designacao_prod == a.produto):
                    artigo = get_object_or_404(Artigo, pk=a.pk)
                    b.artigo = artigo
                    b.save()

# def palete_carga_num(carga_pk, palete_pk):
#     carga = get_object_or_404(Carga, pk=carga_pk)
#     palete = get_object_or_404(Palete, pk=palete_pk)
    
#     paletes_carga_1 = Palete.objects.filter(carga=carga)
#     cont1 = 0
#     array_num_palete = []
        
#     for p1 in paletes_carga_1:
#         array_num_palete[cont1] = p1.num_palete_carga
#         cont1 += 1

#     if len(array_num_palete) == 0:
#         palete.num_palete_carga = 1
#     else:
#         array_num_palete.sort()
#         cont2 = 0
#         for a in array_num_palete:
#             if a[cont2] != cont2 + 1:
#                 palete.num_palete_carga = cont2 + 1
#                 break
#             elif len(array_num_palete) == cont2 + 1:
#                 palete.num_palete_carga = cont2 + 2
#                 break 
#             cont2 += 1
    
#     palete.save()
    

def comp_dm(b1, m1, b2, m2, b3, m3):
    b_1 = Bobine.objects.get(pk=b1.pk)
    
    try:
        b_2 = Bobine.objects.get(pk=b2.pk)
    except:
        b_2 = "N/A"
        m_2 = "N/A"
   
    try:
        b_3 = Bobine.objects.get(pk=b3.pk)
    except:
        b_3 = "N/A"
        m_3 = "N/A"

    if b_1 != "N/A"  and b_2 != "N/A" and b_3 != "N/A":
        comp_total = int(m1) + int(m2) + int(m3)
    elif b_1 != "N/A" and b_2 != "N/A":
        comp_total = int(m1) + int(m2)
    elif b_1 != "N/A":
        comp_total = int(m1)

    return comp_total


def retrabalho_nome(pk, emendas):
    bobinagem = Bobinagem.objects.get(pk=pk)
    bobines = Bobine.objects.filter(bobinagem=bobinagem)
    data = bobinagem.data
    data = data.strftime('%Y%m%d')
    map(int, data)
    if emendas > 1:
        if bobinagem.num_bobinagem < 10:
            bobinagem.nome = '3%s-0%s' % (data[1:], bobinagem.num_bobinagem)
            bobinagem.save()
        else:
            bobinagem.nome = '3%s-%s' % (data[1:], bobinagem.num_bobinagem)
            bobinagem.save()

        for b in bobines:
            if b.largura.num_bobine < 10:
                b.nome = '%s-0%s' % (bobinagem.nome, b.largura.num_bobine)
                b.save()
            else:
                b.nome = '%s-%s' % (bobinagem.nome, b.largura.num_bobine)
                b.save()
    
       
    
def recycling_bobine(pk):
    bobines = []
    bobinagem = get_object_or_404(Bobinagem, pk=pk)
    emendas = Emenda.objects.filter(bobinagem=bobinagem)
    for e in emendas:
        if e.bobine.recycle == True:
            bobines.append(e.bobine)
    
    print(bobines)

    # Remover bobine da palete e recalcular campos da palete
    for b in bobines:
        if b.palete != None:
            palete = get_object_or_404(Palete, pk=b.palete.pk)
            posicao_palete = b.posicao_palete
            b.palete = None
            b.posicao_palete = None
            palete.area -= b.area
            palete.comp_total -= b.bobinagem.comp_cli
            palete.num_bobines -= 1
            palete.num_bobines_act -= 1
            palete.save()

    # Correção de posições das bobines da Palete
    bobines_palete = Bobine.objects.filter(palete=palete).order_by('posicao_palete')
    count = 1
    for bp in bobines_palete:
        if bp.posicao_palete == count:
            count += 1
            bp.save()
        else: 
            bp.posicao_palete = count
            count += 1
            bp.save()

    # Etiqueta de palete
    
    return print('recycling_bobine')

def invert_recycle_bobine(pk):

    return print('invert_recycle_bobine')

def cancel_insert_larguras(request, pk):
    perfil = get_object_or_404(Perfil, pk=pk)
    larguras = Largura.objects.filter(perfil=perfil)
    for l in larguras:
        l.delete()

    
    if perfil.retrabalho == False:
        perfil.delete()
        return redirect('producao:perfil_create_linha_v2')
    else:
        perfil.delete()
        return redirect('producao:perfil_create_dm_v2')

def create_perfil_token(num_bobines, produto, core, larguras, produtos, gsms, retrabalho, core_original, largura_original, clientes, artigos):
    
    produtos_dict = {
        'NONWOVEN ELASTIC BANDS ELA-ACE 100 HE': 'A',
        'NONWOVEN ELASTIC BANDS ELA-ACE 100 HT': 'B',
        'NONWOVEN ELASTIC BANDS ELA-ACE 95 HE': 'C', 
        'NONWOVEN ELASTIC BANDS ELA-SPUN 90 HE HL': 'D', 
        'NONWOVEN ELASTIC BANDS ELA-SPUN 95 HE HL': 'E', 
        'NONWOVEN ELASTIC BANDS ELA-SPUN 90 HT HL': 'F', 
        'NONWOVEN ELASTIC BANDS ELA-SPUN 95 HE HL': 'G', 
        'NONWOVEN ELASTIC BANDS ELA-SPUN 100 HE HL': 'H', 
        'SIDE PANEL ELA-ACE 100 HE': 'I',
        'NONWOVEN ELASTIC BANDS ELA-SPUN 100 HE BICO': 'J',
        'NONWOVEN ELASTIC BANDS ELA-ACE 105 HE': 'K', 
        'NONWOVEN ELASTIC BANDS ELA-ACE 100 HE(D)': 'L', 
        'FRONTAL TAPE 48': 'M', 
        'CAR PROTECTION SHEET 57': 'N', 
        'ELASTIC FILM': 'O',
        'NONWOVEN ELASTIC BANDS ELA-ACE 100 HE(L)': 'P',
        'NONWOVEN ELASTIC BANDS ELA-ACE 75 HE': 'Q',
        'NONWOVEN ELASTIC BANDS ELA-ACE 95 HT': 'R',
        'NONWOVEN ELASTIC BANDS ELA-SPUN 60 HE': 'S',
        'NONWOVEN ELASTIC BANDS ELA-SPUN 60 HT': 'T',
        'NONWOVEN TEXTILE BACKSHEET ELA-TBS 50 23B': 'U',
        'NONWOVEN TEXTILE BACKSHEET ELA-TBS 50 23A':'V',
        'NONWOVEN TEXTILE BACKSHEET ELA-TBS 45 16B': 'W',
        'NONWOVEN TEXTILE BACKSHEET ELA-TBS 45 16A': 'X',
        'STRETCHABLE NONWOVEN ELASTIC BANDS ELA-ACE 100 HE': 'Y',
        'NONWOVEN ELASTIC BAND ELA-CARDED AMOSTRA': 'Z',
        'NONWOVEN ELASTIC BAND ELA-CARDED 100 HE': 'AA',
        'NONWOVEN ELASTIC BAND ELA-SPUN 75 HT': 'AB',
	    'NONWOVEN ELASTIC BAND ELA-CARDED 100': 'AC',
	    'NONWOVEN ELASTIC BAND 100 HE NON WOVEN STRETCH EAR': 'AD',
	    'NONWOVEN ELASTIC BAND ELA-ACE 100 T-HT': 'AE',
	    'NONWOVEN ELASTIC BAND ELA-ACE 100 T-HE': 'AF',
        'NONWOVEN ELASTIC BAND ELA-ACE 100 HE(L) PUNCTURED': 'AG',
        'NONWOVEN ELASTIC BAND ELA-ACE 95 T-HE': 'AH',
        'NONWOVEN ELASTIC BAND ELA-CARDED 80': 'AI',
        'Nonwoven Elastic Band ELA-ACE Amostra': 'AJ',
        'NW Elastic Bands ELA-ACE 100 HE (L) PUNCTURED Amostra': 'AK',
        'NONWOVEN ELASTIC BANDS ELA-ACE 90 T-HT': 'AL'

    }

    gsm_dict = {
        '105': '1',
        '100': '2',
        '95': '3',
        '90': '4',
        '80': '5',
        '57': '6',
        '50': '7',
        '48': '8',
        '75': '9',
        '60': '10',
        '45': '11',
        '25': '12',
    }

    token = '' + str(num_bobines) + produtos_dict.get(produto) + core 

    for l in larguras:
        token += str(l)

    for p in produtos:
        token += produtos_dict.get(p)
    
    for gsm in gsms:
        token += gsm_dict.get(gsm)
    
    for cliente in clientes:
        if cliente != None:
            token += str(cliente.pk)
        else:
            token += 'N'
    
    for artigo in artigos:
        if artigo != None:
            token += str(artigo.pk)
        else:
            token += 'N'
    
    if retrabalho == True:
        token = 'DM' + token + str(core_original) + str(largura_original)
    else:
        token = 'L1' + token
    
    return token

def edit_bobine(pk):
    bobinagem = get_object_or_404(Bobinagem, pk=pk)
    bobines = Bobine.objects.filter(bobinagem=bobinagem)
    desp_bobine = bobinagem.desper / Decimal(bobinagem.perfil.num_bobines)

    for bob in bobines:
        bob.comp = bobinagem.comp_cli
        bob.comp_actual = bobinagem.comp_cli
        largura = bob.largura.largura / 1000
        bob.area = largura * bob.bobinagem.comp_cli

        if bobinagem.tipo_desp == 'R':
            bob.tipo_desp = 'R'
            bob.desp = desp_bobine
        elif bobinagem.tipo_desp == 'BA':
            bob.tipo_desp = 'BA'
            bob.desp = desp_bobine
        bob.save()
        etiqueta = get_object_or_404(EtiquetaRetrabalho, bobine=bob.nome)
        etiqueta.diam = bobinagem.diam
        etiqueta.comp_total = bobinagem.comp_cli
        etiqueta.area = bob.area
        etiqueta.save()



# def delete_sessions():
#     if datetime.now() == '12:54':
#         Session.objects.all().delete()



def multipleOf10(num):

    result = num%10
    print(result)

    return result