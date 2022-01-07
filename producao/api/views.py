from typing import List
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView
from rest_framework.views import APIView
from django.http import Http404
from rest_framework.response import Response
from producao.models import Artigo, Palete, Bobine, Emenda, Bobinagem, Cliente, Encomenda, Carga
from .serializers import ArtigoDetailSerializer, PaleteStockSerializer, PaleteListSerializer, PaleteDetailSerializer, CargaListSerializer, PaletesCargaSerializer, CargasEncomendaSerializer, CargaDetailSerializer, BobineSerializer, EncomendaListSerializer, BobinagemCreateSerializer, BobinesDmSerializer, BobinesPaleteDmSerializer, EmendaSerializer, EmendaCreateSerializer, BobinagemListSerializer, BobineListAllSerializer, ClienteSerializer, BobinagemBobinesSerializer, PaleteDmSerializer
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import status


from pyodbc import Cursor, Error
from datetime import datetime
from django.http.response import JsonResponse
from rest_framework.decorators import api_view, authentication_classes, permission_classes, renderer_classes
from django.db import connections, transaction
from support.database import encloseColumn, Filters, DBSql, TypeDml, fetchall, Check

from rest_framework.renderers import JSONRenderer
from rest_framework.utils import encoders, json
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
import collections
import hashlib
import math

import time





#NEW API METHODS
connGatewayName = "postgres"
dbgw = DBSql(connections[connGatewayName].alias)
db = DBSql(connections["default"].alias)

# def disable(v):
#     return ''


# def enable(v):
#     return v


# def disableCols(v):
#     return 'count(*)'


# def executeList(sql, connection, parameters, ignore=[], customDisableCols=None):
#     with connection.cursor() as cursor:
#         print(f'SQL--> {sql(enable,enable)}')
#         print(f'PARAMS--> {parameters}')
#         cursor.execute(sql(enable, enable), parameters)
#         rows = fetchall(cursor, ignore)
#         cursor.execute(sql(
#             disable, disableCols if customDisableCols is None else customDisableCols), parameters)
#         count = cursor.fetchone()[0]
#     return {"rows": rows, "total": count}


# def executeSimpleList(sql, connection, parameters, ignore=[]):
#     with connection.cursor() as cursor:
#         print(f'SIMPLE LIST SQL--> {sql()}')
#         print(f'PARAMS--> {parameters}')
#         cursor.execute(sql(), parameters)
#         rows = fetchall(cursor, ignore)
#     return {"rows": rows}


# def execute(sql, connection, parameters, returning=False):
#     with connection.cursor() as cursor:
#         print(f'EXECUTE--> {sql}')
#         print(f'PARAMS--> {parameters}')
#         cursor.execute(sql, parameters)
#         if returning:
#             ret = cursor.fetchone()[0]
#             return ret
#         return


def filterMulti(data, parameters, forceWhere=True, overrideWhere=False, encloseColumns=True, logicOperator="and"):
    p = {}
    txt = ''
    _forceWhere = forceWhere
    _overrideWhere = overrideWhere
    hasFilters = False
    for mainKey, mainValue in parameters.items():
        if (hasFilters):
            _forceWhere = False
            _overrideWhere = logicOperator
        if data.get(mainKey) is not None:
            sp = {}
            for key in mainValue.get('keys'):
                table = f'"{mainValue.get("table")}".' if (mainValue.get(
                    "table") and encloseColumns) else mainValue.get("table", '')
                field = f'{table}"{key}"' if encloseColumns else f'{table}{key}'
                sp[key] = {"value": data.get(
                    mainKey).lower(), "field": f'lower({field})'}
            f = Filters(data)
            f.setParameters(sp, True)
            f.where(_forceWhere, _overrideWhere)
            f.auto()
            f.value('or')
            p = {**p, **f.parameters}
            txt = f'{txt}{f.text}'
            if (not hasFilters):
                hasFilters = f.hasFilters
    return {"hasFilters": hasFilters, "text": txt, "parameters": p}


def rangeP(data, key, field):
    ret = {}
    if data is None:
        return ret
    for i, v in enumerate(data):
        ret[f'{key}_{i}'] = {"key": key, "value": v, "field": field}

    print(f'PRINT RANGE --> {data}')
    return ret

#Ordens de Fabrico

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def OFabricoList(request, format=None):
    connection = connections[connGatewayName].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where(False,"and")
    #f.add(f'"of".id = :id', True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = dbgw.dql(request.data, False)
    #cols = encloseColumn(['ofitm."ROWID" OFROWID','itm."ROWID" ITMROWID', 'enc."ROWID" ENCROWID', 'ofitm.MFGNUM_0', 'itm.TSICOD_0',
    #        'itm.ITMREF_0', 'itm.ITMDES1_0', 'enc.SOHNUM_0', 'enclin.SOPLIN_0', 'enc.ORDDAT_0', 'enc.DEMDLVDAT_0', 'enc.SHIDAT_0',
    #        'enc.PRFNUM_0', 'enc.CUSORDREF_0', 'enc.DAYLTI_0',
    #        'enc.LASDLVDAT_0', 'enc.LASDLVNUM_0', 'enc.LASINVDAT_0', 'enc.LASINVNUM_0', 'enc.DSPTOTQTY_0', 'enc.DSPTOTVOL_0', 'enc.DSPTOTWEI_0',
    #        'enc.DSPVOU_0', 'enc.DSPWEU_0',
    #        'enc.BPCORD_0', 'enc.BPCNAM_0', 'enc.CREUSR_0', 'enc.CREDAT_0', 'enc.CREDATTIM_0', 'enc.UPDUSR_0', 'enc.UPDDAT_0', 'enc.UPDDATTIM_0'
    #],True,True,['"ROWID" OFROWID','"ROWID" ITMROWID', '"ROWID" ENCROWID'])
    #dql.columns = encloseColumn(cols,False)

    cols = f"""
        oflist.ofabrico, oflist.ofabrico_sgp_nome,oflist.ofabrico_sgp,
        oflist.item, oflist.item_nome, oflist.iorder,oflist.cliente_cod,oflist.cliente_nome,
        oflist.n_paletes_produzidas,sgp_op.num_paletes_produzir,
        oflist.n_paletes_stock_in,sgp_op.num_paletes_stock,
        oflist.n_paletes_total,sgp_op.num_paletes_total,
        oflist.n_paletes_produzidas || '/' || sgp_op.num_paletes_produzir produzidas,
        oflist.n_paletes_stock_in || '/' || sgp_op.num_paletes_stock stock,oflist.n_paletes_total || '/' || sgp_op.num_paletes_total total,
        sgp_op.retrabalho, oflist.start_date, oflist.end_date, sgp_op.ativa, sgp_op.completa, sgp_op.stock, 
        oflist.bom_alt, oflist.qty_prevista, oflist.qty_item, sgp_op.paletizacao_id, sgp_op.formulacao_id, sgp_op.status,
        sgp_p.produto_cod, sgp_a.produto_id, sgp_top.id temp_ofabrico, sgp_top.agg_of_id temp_ofabrico_agg, sgp_a.thickness item_thickness,
        sgp_a.diam_ref item_diam,sgp_a.core item_core, sgp_a.lar item_width, sgp_a.id item_id
    """

    response = dbgw.executeList(lambda p, c: (
        f"""
        SELECT {c(f'{cols}')} 
        FROM MV_OFABRICO_LIST oflist
        LEFT JOIN "SGP-DEV".planeamento_ordemproducao sgp_op on sgp_op.id = oflist.ofabrico_sgp
        LEFT JOIN "SGP-DEV".producao_tempordemfabrico sgp_top on sgp_top.of_id = oflist.ofabrico and sgp_top.item_cod=oflist.item
        LEFT JOIN "SGP-DEV".producao_artigo sgp_a on sgp_a.cod = oflist.item
        LEFT JOIN "SGP-DEV".producao_produtos sgp_p on sgp_p.id = sgp_a.produto_id
        WHERE 
        NOT EXISTS(SELECT 1 FROM "SGP-DEV".producao_ordemfabricodetails ex WHERE ex.cod = oflist.ofabrico)
        {f.text}
        {p(dql.sort)} {p(dql.paging)}
        """
    ), connection, parameters, [])
    return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SetOrdemFabricoStatus(request, format=None):
    conngw = connections[connGatewayName].cursor()
    conn = connections["default"].cursor()
    data = request.data.get("parameters")

    txt=""
    ativa = 0
    completa = 0
    if (data["ativa"]==1 and data["completa"]==0):
        ativa = 0
        completa = 1
        txt="Fechada"
    elif (data["ativa"]==0 and data["completa"]==0):
        ativa = 1
        txt="Iniciada"
    elif (data["ativa"]==0 and data["completa"]==1):
        ativa = 1
        completa = 0
        txt="Reaberta"
    
    dml = db.dml(TypeDml.UPDATE,{"ativa":ativa,"completa":completa},"planeamento_ordemproducao",{"id":f'=={data["ofabrico_sgp"]}'},None,False)
    try:
        with conn as cursor:
            db.execute(dml.statement, cursor, dml.parameters)
        return Response({"status": "success", "id":data["ofabrico"], "title": f'Ordem de Fabrico {data["ofabrico"]}', "subTitle":f"A Ordem de Fabrico foi {txt} com Sucesso!"})
    except Exception as error:
        return Response({"status": "error", "id":data["ofabrico"], "title": f'Ordem de Fabrico {data["ofabrico"]}', "subTitle":str(error)})


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SellItemsDetailsGet(request, format=None):
    conn = connections["default"].cursor()
    cols = ['pa.*,prod.produto_cod']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'cod = :cod', True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = dbgw.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    response = db.executeSimpleList(lambda: (
        f"""
            SELECT {dql.columns} 
            FROM producao_artigo pa
            JOIN producao_produtos prod on pa.produto_id=prod.id
            {f.text} {dql.sort} {dql.limit}
         """
    ), conn, parameters)
    return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def MateriasPrimasGet(request, format=None):
    conn = connections[connGatewayName].cursor()
    cols = ['pacabado."ITMREF_0" artigo_cod', 'pacabado."ITMDES1_0" artigo_des','matprima."ITMREF_0" matprima_cod', 'matprima."ITMDES1_0" matprima_des',
            'bm."BASQTY_0" qty_base', 'bm."UPDDAT_0" updatedate_bom', 'bmd."UPDDAT_0" updatedate_bomd',
            'bmd."BOMUOM_0" matprima_unidade', 'bmd."BOMQTY_0" qty', 'bm."BOMALT_0" bom_alt', 'bmd."BOMSEQ_0" bom_seq',
            'matprima."ZFAMILIA_0" matprima_familia', 'matprima."ZSUBFAMILIA_0" matprima_subfamilia'
            ]
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'pacabado."ITMREF_0" = :cod', True)
    f.add(f'ofabrico."MFGNUM_0" = :ofabrico',lambda v:"ofabrico" in request.data['filter'])
    f.add(f'bm."BOMALT_0" = :bomalt',lambda v:"bomalt" in request.data['filter'])
    f.value("and")
    parameters = {**f.parameters}
    
    dql = dbgw.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    response = db.executeSimpleList(lambda: (
        f"""SELECT {dql.columns} 
        FROM "SAGE-PROD"."BOM" bm
        JOIN "SAGE-PROD"."BOMD" bmd ON bm."ITMREF_0" = bmd."ITMREF_0" AND bm."BOMALT_0" = bmd."BOMALT_0"
        JOIN "SAGE-PROD"."ITMMASTER" matprima ON bmd."CPNITMREF_0" = matprima."ITMREF_0"
        JOIN "SAGE-PROD"."ITMMASTER" pacabado ON bm."ITMREF_0" = pacabado."ITMREF_0"
        {'JOIN "SAGE-PROD"."MFGITM" ofabrico ON ofabrico."ITMREF_0" =  bm."ITMREF_0" and ofabrico."BOMALT_0" = bm."BOMALT_0"' if "ofabrico" in request.data['filter'] else ''}
        {f.text} {dql.sort} {dql.limit}"""
    ), conn, parameters)
    return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def MateriasPrimasLookup(request, format=None):
    conn = connections[connGatewayName].cursor()
    cols = ['"ITMREF_0"','"ITMDES1_0"','"ZFAMILIA_0"','"ZSUBFAMILIA_0"','"STU_0"', '"SAUSTUCOE_0"']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.value("and")
    parameters = {**f.parameters}

    type = None if "type" not in request.data['parameters'] else request.data['parameters']['type']
    cfilter = ""
    if type=='nonwovens':
        cfilter = f"""LOWER("ITMDES1_0") LIKE 'nonwo%%' AND ("ACCCOD_0" = 'PT_MATPRIM')"""
    elif type=='cores':
        core = int(int(request.data['parameters']['core']) * 25.4)
        cfilter = f"""LOWER("ITMDES1_0") LIKE 'core%%%% {core}%%' AND ("ACCCOD_0" = 'PT_EMBALAG')"""
    else:
        cfilter = f"""(LOWER("ITMDES1_0") NOT LIKE 'nonwo%%' AND LOWER("ITMDES1_0") NOT LIKE 'core%%') AND ("ACCCOD_0" = 'PT_MATPRIM')"""

    dql = dbgw.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    response = db.executeSimpleList(lambda: (
        f"""
            select 
            {dql.columns}
            from "SAGE-PROD"."ITMMASTER" mprima
            where 
            {cfilter}
            {dql.sort}
        """
    ), conn, parameters)
    return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def BomLookup(request, format=None):
    conn = connections[connGatewayName].cursor()
    cols = ['bm."BOMALT_0"', 'bm."CREDAT_0"']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'bm."ITMREF_0" = :cod', True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = dbgw.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    response = db.executeSimpleList(lambda: (
        f"""
            select 
            DISTINCT {dql.columns}
            FROM "SAGE-PROD"."BOM" bm
            {f.text} {dql.sort}
        """
    ), conn, parameters)
    return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def IgnorarOrdemFabrico(request, format=None):
    data = request.data.get("parameters")
    def upsert(data,cursor):
        dml = db.dml(TypeDml.INSERT, {"cod":data['ofabrico'],"ignorar":1}, "producao_ordemfabricodetails",None,None,False)
        dml.statement = f"""
            {dml.statement}
            ON DUPLICATE KEY UPDATE 
                id = LAST_INSERT_ID(id),
                cod=VALUES(cod),
                ignorar=VALUES(ignorar)
        """
        db.execute(dml.statement, cursor, dml.parameters)
        return cursor.lastrowid

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                id = upsert(data,cursor)
        return Response({"status": "success","id":data["ofabrico"], "title": "A Ordem de Fabrico Foi Ignorada com Sucesso!", "subTitle":f'{data["ofabrico"]}'})
    except Error:
        return Response({"status": "error", "title": "Erro ao Ignorar Ordem de Fabrico!"})

#region CLIENTES
@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SellCustomersLookup(request, format=None):
    cols = ['BPCNUM_0', 'BPCNAM_0']
    f = filterMulti(request.data['filter'], {'fmulti_customer': {"keys": cols}})
    parameters = {**f['parameters']}

    dql = dbgw.dql(request.data, False)
    dql.columns = encloseColumn(cols)
    with connections[connGatewayName].cursor() as cursor:
       response = dbgw.executeSimpleList(lambda: (
         f'SELECT {dql.columns} FROM "SAGE-PROD"."BPCUSTOMER" {f["text"]} {dql.sort} {dql.limit}'
       ), cursor, parameters)
       return Response(response)
#endregion




#region PALETIZAÇÃO SCHEMA
@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def PaletizacoesLookup(request, format=None):
    #conn = connections[connGatewayName].cursor()
    print(f"request--->{request.data['filter']}")
    cols = ['*']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'p.artigo_cod = :artigo_cod', True)
    f.add(f'p.cliente_cod = :cliente_cod', lambda v:(v!=None))
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                select 
                {dql.columns}
                from producao_paletizacao p
                {f.text}
                {dql.sort}
            """
        ), cursor, parameters)
        return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def PaletizacaoDetailsGet(request, format=None):
    #conn = connections[connGatewayName].cursor()
    cols = ['*']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'pd.paletizacao_id = :paletizacao_id', True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                select 
                {dql.columns}
                from producao_paletizacaodetails pd
                {f.text}
                {dql.sort}
            """
        ), cursor, parameters)
        return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
# @transaction.atomic()
def NewPaletizacaoSchema(request, format=None):
    data = request.data.get("parameters")
    
    def checkPaletizacao(data, cursor):
        if ("id" in data):
            f = Filters({"id":data["id"]})
            f.where()
            f.add(f'paletizacao_id = :id', True)
            f.value("and")
            return db.exists("producao_tempordemfabrico",f,cursor).exists
        return 0

    def upsertPaletizacao(data, cursor):
        data["designacao"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S") if (not "designacao" in data or not data["designacao"]) else data["designacao"] 
        dml = db.dml(TypeDml.INSERT, {
            'cliente_cod': data['cliente_cod'] if 'cliente_cod' in data else None,
            'cliente_nome': data['cliente_nome'] if 'cliente_nome' in data else None,
            'artigo_cod': data['artigo_cod'],
            'contentor_id': data['contentor_id'],
            'npaletes': data['npaletes'],
            'palete_maxaltura': data['palete_maxaltura'],
            'paletes_sobrepostas': data['paletes_sobrepostas'] if 'paletes_sobrepostas' in data else 0, 
            'netiquetas_bobine': data['netiquetas_bobine'], 
            'netiquetas_lote': data['netiquetas_lote'], 
            'netiquetas_final': data['netiquetas_final'], 
            'filmeestiravel_bobines': data['filmeestiravel_bobines'] if 'filmeestiravel_bobines' in data else 0, 
            'filmeestiravel_exterior': data['filmeestiravel_exterior'] if 'filmeestiravel_exterior' in data else 0,
            'cintas': data['cintas'] if 'cintas' in data else 0, 
            'ncintas': data['ncintas'], 
            'cintas_palete': data['cintas_palete'],
            'designacao':data['designacao']
        }, "producao_paletizacao",None,None,False)
        dml.statement = f"""
            {dml.statement}
            ON DUPLICATE KEY UPDATE 
                id = LAST_INSERT_ID(id),
                cliente_cod=VALUES(cliente_cod),
                cliente_nome=VALUES(cliente_nome),
                artigo_cod=VALUES(artigo_cod),
                contentor_id=VALUES(contentor_id),
                npaletes=VALUES(npaletes),
                palete_maxaltura=VALUES(palete_maxaltura),
                paletes_sobrepostas=VALUES(paletes_sobrepostas), 
                netiquetas_bobine=VALUES(netiquetas_bobine), 
                netiquetas_lote=VALUES(netiquetas_lote), 
                netiquetas_final=VALUES(netiquetas_final), 
                filmeestiravel_bobines=VALUES(filmeestiravel_bobines), 
                filmeestiravel_exterior=VALUES(filmeestiravel_exterior), 
                cintas=VALUES(cintas),
                ncintas=VALUES(ncintas), 
                cintas_palete=VALUES(cintas_palete),
                designacao=VALUES(designacao) 
        """
        print(f"---->>>{dml.statement}")
        db.execute(dml.statement, cursor, dml.parameters)
        return cursor.lastrowid
    def deletePaletizacaoDetails(id,cursor):
        dml = db.dml(TypeDml.DELETE, None,'producao_paletizacaodetails',{"paletizacao_id":f'=={id}'},None,False)
        db.execute(dml.statement, cursor, dml.parameters)
    def insertPaletizacaoDetails(id,cursor):
        for idx, v in enumerate(reversed(data['paletizacao'])):
            dt = {}
            if v['item_id'] == 1: 
                dt = {'item_id':1,'item_des':'Palete','item_order':idx,'item_paletesize':v['item_paletesize'],'paletizacao_id':id}
            elif v['item_id'] == 2:
                dt = {'item_id':2,'item_des':'Bobines','item_order':idx,'item_numbobines':v['item_numbobines'],'paletizacao_id':id}
            elif v['item_id'] == 3:
                dt = {'item_id':3,'item_des':'Placa de Cartão','item_order':idx,'paletizacao_id':id}
            elif v['item_id'] == 4:
                dt = {'item_id':4,'item_des':'Placa MDF','item_order':idx,'paletizacao_id':id}
            else:
                dt = {'item_id':5,'item_des':'Placa de Plástico','item_order':idx,'paletizacao_id':id}
            dml = db.dml(TypeDml.INSERT, dt, "producao_paletizacaodetails",None,None,False)
            db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                exists = checkPaletizacao(data,cursor)
                if exists==0:
                    id = upsertPaletizacao(data,cursor)
                    deletePaletizacaoDetails(id,cursor)
                    insertPaletizacaoDetails(id,cursor)
                    return Response({"status": "success", "id":id, "title": "O esquema de Paletização foi Registado com Sucesso!", "subTitle":f'Id do Esquema {id}'})
                return Response({"status": "error", "title": "Não é possível alterar o esquema de paletização! Este já se encontra referenciado em Ordens de Fabrico."})
    except Error:
        return Response({"status": "error", "title": "Erro ao Registar o Esquema de Paletização!"})
#endregion

#region FORMULAÇÃO
@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def FormulacoesLookup(request, format=None):
    #conn = connections[connGatewayName].cursor()
    print(f"request--->{request.data['filter']}")
    cols = ['*']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'f.produto_id = :produto_id', True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                select 
                {dql.columns}
                from producao_formulacao f
                {f.text}
                {dql.sort}
            """
        ), cursor, parameters)
        return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
# @transaction.atomic()
def NewFormulacao(request, format=None):
    data = request.data.get("parameters")
    print(f'request--->{data}')

    def getVersao(data, cursor):
        f = Filters({"produto_id": data['produto_id']})
        f.setParameters({}, False)
        f.where()
        f.add(f'f.produto_id = :produto_id', True)
        f.value("and")   
        return db.executeSimpleList(lambda: (f'SELECT IFNULL(MAX(versao),0)+1 AS mx FROM producao_formulacao f {f.text}'), cursor, f.parameters)['rows'][0]['mx']


    def upsertFormulacao(data, versao, cursor):
        data["designacao"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S") if  (not "designacao" in data or not data["designacao"]) else data["designacao"] 
        dml = db.dml(TypeDml.INSERT, {
            'produto_id': data['produto_id'],
            'designacao': data['designacao'],
            'cliente_cod': data['cliente_cod'] if 'cliente_cod' in data else None,
            'cliente_nome': data['cliente_nome'] if 'cliente_nome' in data else None,
            'versao': f'{versao}',
            'extr0': data['extr0'],
            'extr1': data['extr1'],
            'extr2': data['extr2'],
            'extr3': data['extr3'],
            'extr4': data['extr4'],
            'extr0_val': data['extr0_val'],
            'extr1_val': data['extr1_val'],
            'extr2_val': data['extr2_val'],
            'extr3_val': data['extr3_val'],
            'extr4_val': data['extr4_val'],
            "created_date": datetime.now(),
            "updated_date": datetime.now()
        }, "producao_formulacao",None,None,False,['versao'])
        dml.statement = f"""
            {dml.statement}
            ON DUPLICATE KEY UPDATE 
                id = LAST_INSERT_ID(id),
                produto_id=VALUES(produto_id),
                designacao=VALUES(designacao),
                cliente_cod=VALUES(cliente_cod),
                cliente_nome=VALUES(cliente_nome),
                extr0=VALUES(extr0),
                extr1=VALUES(extr1),
                extr2=VALUES(extr2),
                extr3=VALUES(extr3),
                extr4=VALUES(extr4),
                extr0_val=VALUES(extr0_val),
                extr1_val=VALUES(extr1_val),
                extr2_val=VALUES(extr2_val),
                extr3_val=VALUES(extr3_val),
                extr4_val=VALUES(extr4_val),
                updated_date=VALUES(updated_date)                
        """
        print(f"---->{dml.statement}")
        db.execute(dml.statement, cursor, dml.parameters)
        return cursor.lastrowid
    def deleteFormulacaoItems(id,cursor):
        dml = db.dml(TypeDml.DELETE, None,'producao_formulacaomateriasprimas',{"formulacao_id":f'=={id}'},None,False)
        db.execute(dml.statement, cursor, dml.parameters)
    def insertFormulacaoItems(id,cursor):
        for idx, v in enumerate(data['items']):
            dml = db.dml(TypeDml.INSERT, {**v, 'formulacao_id':id}, "producao_formulacaomateriasprimas",None,None,False)
            db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                versao = getVersao(data,cursor)
                id = upsertFormulacao(data, versao, cursor)
                deleteFormulacaoItems(id,cursor)
                insertFormulacaoItems(id,cursor)
                return Response({"status": "success", "id":id, "title": "A Formulação foi Registada com Sucesso!", "subTitle":f'Formulação {data["designacao"]} v{versao}'})
    except Error:
        return Response({"status": "error", "title": "Erro ao Registar a Formulação!"})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def FormulacaoMateriasPrimasGet(request, format=None):
    #conn = connections[connGatewayName].cursor()
    cols = ['*']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'fmp.formulacao_id = :formulacao_id', True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                select 
                {dql.columns}
                from producao_formulacaomateriasprimas fmp
                {f.text}
                {dql.sort}
            """
        ), cursor, parameters)
        return Response(response)

#endregion

#region GAMA OPERATÓRIA
@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def GamasOperatoriasLookup(request, format=None):
    #conn = connections[connGatewayName].cursor()
    #print(f"request--->{request.data['filter']}")
    cols = ['*']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'go.produto_id = :produto_id', True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                select 
                {dql.columns}
                from producao_gamaoperatoria go
                {f.text}
                {dql.sort}
            """
        ), cursor, parameters)
        return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
# @transaction.atomic()
def NewGamaOperatoria(request, format=None):
    data = request.data.get("parameters")
    def getVersao(data, cursor):
        f = Filters({"produto_id": data['produto_id']})
        f.setParameters({}, False)
        f.where()
        f.add(f'gop.produto_id = :produto_id', True)
        f.value("and")   
        return db.executeSimpleList(lambda: (f'SELECT IFNULL(MAX(versao),0)+1 AS mx FROM producao_gamaoperatoria gop {f.text}'), cursor, f.parameters)['rows'][0]['mx']

    def upsertGamaOperatoria(data, versao, cursor):
        data["designacao"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S") if  (not "designacao" in data or not data["designacao"]) else data["designacao"] 
        dml = db.dml(TypeDml.INSERT, {
            'produto_id': data['produto_id'],
            'designacao': data['designacao'],
            'versao': f'{versao}',
            "created_date": datetime.now(),
            "updated_date": datetime.now()
        }, "producao_gamaoperatoria",None,None,False,['versao'])
        dml.statement = f"""
            {dml.statement}
            ON DUPLICATE KEY UPDATE 
                id = LAST_INSERT_ID(id),
                produto_id=VALUES(produto_id),
                designacao=VALUES(designacao),
                updated_date=VALUES(updated_date)                
        """
        db.execute(dml.statement, cursor, dml.parameters)
        return cursor.lastrowid
    def deleteGamaOperatoriaItems(id,cursor):
        dml = db.dml(TypeDml.DELETE, None,'producao_gamaoperatoriaitems',{"gamaoperatoria_id":f'=={id}'},None,False)
        db.execute(dml.statement, cursor, dml.parameters)
    def insertGamaOperatoriaItems(id,nitems,cursor):
        itms = collections.OrderedDict(sorted(data.items()))
        for i in range(nitems):            
            key = itms[f'key-{i}']
            values = [ v for k,v in itms.items() if k.startswith(f'v{key}-')]
            v = {
                "item_des":itms[f'des-{i}'], 
                "item_values":json.dumps(values), 
                "tolerancia":itms[f'tolerancia-{i}'],
                "gamaoperatoria_id":id,
                "item_key":key,
                "item_nvalues":len(values)
            }            
            dml = db.dml(TypeDml.INSERT, v, "producao_gamaoperatoriaitems",None,None,False)
            db.execute(dml.statement, cursor, dml.parameters)
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                versao = getVersao(data,cursor)
                id = upsertGamaOperatoria(data, versao, cursor)
                deleteGamaOperatoriaItems(id,cursor)
                insertGamaOperatoriaItems(id,data['nitems'],cursor)
                return Response({"status": "success", "id":id, "title": "A Gama Operatória foi Registada com Sucesso!", "subTitle":f'Gama Operatória {data["designacao"]} v{versao}'})
    except Error:
        return Response({"status": "error", "title": "Erro ao Registar a Gama Operatória!"})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def GamaOperatoriaItemsGet(request, format=None):
    #conn = connections[connGatewayName].cursor()
    cols = ['*']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'gop.gamaoperatoria_id = :gamaoperatoria_id', True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                select 
                {dql.columns}
                from producao_gamaoperatoriaitems gop
                {f.text}
                {dql.sort}
            """
        ), cursor, parameters)
        return Response(response)
#endregion


#region PALETES STOCK
@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def PaletesStockLookup(request, format=None):
    cols = ['distinct(pp.id),pp.nome,pp.largura_bobines,pp.core_bobines,pp.area,pp.comp_total']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where(False,"and")
    f.add(f'pb.artigo_id = :item_id', True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        # response = db.executeList(lambda p, c: (
        #     f"""
        #     SELECT {c(f'{dql.columns}')} 
        #     FROM sistema.producao_palete pp
        #     join sistema.producao_bobine pb on pb.palete_id=pp.id 
        #     join sistema.producao_artigo pa on pb.artigo_id=pa.id
        #     join sistema_dev.producao_tempordemfabrico ptof on ptof.item_cod = pa.cod
        #     where 
        #     pp.stock=1 
        #     {f.text}
        #     {p(dql.sort)} {p(dql.paging)}
        #     """
        # ), cursor, parameters, [], lambda v: 'count(distinct(pp.id))')
        response = db.executeList(lambda p, c: (
            f"""
            SELECT {c(f'{dql.columns}')} 
            FROM sistema_dev.producao_palete pp
            JOIN sistema_dev.producao_bobine pb on pb.palete_id=pp.id {f.text}
            join sistema.producao_artigo pa on pb.artigo_id=pa.id
            where pp.stock=1
            {p(dql.sort)} {p(dql.paging)}
            """
        ), cursor, parameters, [], lambda v: 'count(distinct(pp.id))')
        return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def PaletesStockGet(request, format=None):
    cols = ['pp.id ,pp.nome, pp.largura_bobines, pp.core_bobines, pp.area, pp.comp_total']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'pp.draft_ordem_id = :of_id', True)
    f.value("and")
    parameters = {**f.parameters}    
    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        response = db.executeList(lambda p, c: (
            f"""
            SELECT {c(f'{dql.columns}')} 
            FROM sistema_dev.producao_palete pp
            {f.text}
            {p(dql.sort)} {p(dql.paging)}
            """
        ), cursor, parameters, [], lambda v: 'count(distinct(pp.id))')
        return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
# @transaction.atomic()
def SavePaletesStock(request, format=None):
    data = request.data.get("parameters")
    paletesAdd = data['left'] if 'left' in data else []
    paletesRemove = data['right'] if 'right' in data else []
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                if (len(paletesAdd)>0):
                    dml = db.dml(TypeDml.UPDATE,{"stock":0,"draft_ordem_id":data["id"]},"producao_palete",{},None,False)
                    statement = f"""{dml.statement} WHERE id in ({','.join(str(v) for v in paletesAdd)})"""
                    db.execute(statement, cursor, dml.parameters)
                if (len(paletesRemove)>0):
                    dml = db.dml(TypeDml.UPDATE,{"stock":1,"draft_ordem_id":None},"producao_palete",{},None,False)
                    statement = f"""{dml.statement} WHERE id in ({','.join(str(v) for v in paletesRemove)})"""
                    db.execute(statement, cursor, dml.parameters)
        return Response({"status": "success","id":None, "title": "As Paletes foram Relacionadas com Sucesso!", "subTitle":''})
    except BaseException as e:
        return Response({"status": "error", "title": "Erro ao Relacionar as Paletes!","value":e.args[len(e.args)-1]})




#endregion

#region ARTIGO SPECS
@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def ArtigosSpecsLookup(request, format=None):
    #conn = connections[connGatewayName].cursor()
    #print(f"request--->{request.data['filter']}")
    cols = ['*']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'specs.produto_id = :produto_id', True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                select 
                {dql.columns}
                from producao_artigospecs specs
                {f.text}
                {dql.sort}
            """
        ), cursor, parameters)
        return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
# @transaction.atomic()
def NewArtigoSpecs(request, format=None):
    data = request.data.get("parameters")
    def getVersao(data, cursor):
        f = Filters({"produto_id": data['produto_id']})
        f.setParameters({}, False)
        f.where()
        f.add(f'specs.produto_id = :produto_id', True)
        f.value("and")   
        return db.executeSimpleList(lambda: (f'SELECT IFNULL(MAX(versao),0)+1 AS mx FROM producao_artigospecs specs {f.text}'), cursor, f.parameters)['rows'][0]['mx']

    def upsertArtigoSpecs(data, versao, cursor):
        dml = db.dml(TypeDml.INSERT, {
            'produto_id': data['produto_id'],
            'designacao': data['designacao'],
            'cliente_cod': data['cliente_cod'] if 'cliente_cod' in data else None,
            'cliente_nome': data['cliente_nome'] if 'cliente_nome' in data else None,
            'versao': f'{versao}',
            "created_date": datetime.now(),
            "updated_date": datetime.now()
        }, "producao_artigospecs",None,None,False,['versao'])
        dml.statement = f"""
            {dml.statement}
            ON DUPLICATE KEY UPDATE 
                id = LAST_INSERT_ID(id),
                produto_id=VALUES(produto_id),
                designacao=VALUES(designacao),
                cliente_cod=VALUES(cliente_cod),
                cliente_nome=VALUES(cliente_nome),
                updated_date=VALUES(updated_date)                
        """
        db.execute(dml.statement, cursor, dml.parameters)
        return cursor.lastrowid
    
    def deleteArtigoSpecsItems(id,cursor):
        dml = db.dml(TypeDml.DELETE, None,'producao_artigospecsitems',{"artigospecs_id":f'=={id}'},None,False)
        db.execute(dml.statement, cursor, dml.parameters)
    def insertArtigoSpecsItems(id,nitems,cursor):
        itms = collections.OrderedDict(sorted(data.items()))
        for i in range(nitems):            
            key = itms[f'key-{i}']
            values = [ v for k,v in itms.items() if k.startswith(f'v{key}-')]
            v = {
                "item_des":itms[f'des-{i}'], 
                "item_values":json.dumps(values), 
                "artigospecs_id":id,
                "item_key":key,
                "item_nvalues":len(values)
            }            
            dml = db.dml(TypeDml.INSERT, v, "producao_artigospecsitems",None,None,False)
            db.execute(dml.statement, cursor, dml.parameters)
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                data["designacao"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S") if  (not "designacao" in data or not data["designacao"]) else data["designacao"] 
                versao = getVersao(data,cursor)
                id = upsertArtigoSpecs(data, versao, cursor)
                deleteArtigoSpecsItems(id,cursor)
                insertArtigoSpecsItems(id,data['nitems'],cursor)
                return Response({"status": "success", "id":id, "title": "As Especificações foram Registadas com Sucesso!", "subTitle":f'Especificações {data["designacao"]} v{versao}'})
    except Error:
        return Response({"status": "error", "title": "Erro ao Registar as Especificações!"})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def ArtigoSpecsItemsGet(request, format=None):
    #conn = connections[connGatewayName].cursor()
    cols = ['*']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'specsi.artigospecs_id = :artigospecs_id', True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                select 
                {dql.columns}
                from producao_artigospecsitems specsi
                {f.text}
                {dql.sort}
            """
        ), cursor, parameters)
        return Response(response)
#endregion

#region NONWOVENS
@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def NonwovensLookup(request, format=None):
    #conn = connections[connGatewayName].cursor()
    #print(f"request--->{request.data['filter']}")
    cols = ['*']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'nw.produto_id = :produto_id', True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                select 
                {dql.columns}
                from producao_artigononwovens nw
                {f.text}
                {dql.sort}
            """
        ), cursor, parameters)
        return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def NewArtigoNonwovens(request, format=None):
    data = request.data.get("parameters")
    def getVersao(data, cursor):
        f = Filters({"produto_id": data['produto_id']})
        f.setParameters({}, False)
        f.where()
        f.add(f'anw.produto_id = :produto_id', True)
        f.value("and")   
        return db.executeSimpleList(lambda: (f'SELECT IFNULL(MAX(versao),0)+1 AS mx FROM producao_artigononwovens anw {f.text}'), cursor, f.parameters)['rows'][0]['mx']

    def upsertNonwovens(data, versao, cursor):
        data["designacao"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S") if ("designacao" not in data or not data["designacao"]) else data["designacao"] 
        dml = db.dml(TypeDml.INSERT, {
            'produto_id': data['produto_id'],
            'designacao': data['designacao'],
            'versao': f'{versao}',
            'nw_cod_sup': data['nw_cod_sup'] if 'nw_cod_sup' in data else None,
            'nw_des_sup': data['nw_des_sup'] if 'nw_des_sup' in data else None,
            'nw_cod_inf': data['nw_cod_inf'] if 'nw_cod_inf' in data else None,
            'nw_des_inf': data['nw_des_inf'] if 'nw_des_inf' in data else None,
            "created_date": datetime.now(),
            "updated_date": datetime.now()
        }, "producao_artigononwovens",None,None,False,['versao'])
        dml.statement = f"""
            {dml.statement}
            ON DUPLICATE KEY UPDATE 
                id = LAST_INSERT_ID(id),
                produto_id=VALUES(produto_id),
                designacao=VALUES(designacao),
                nw_cod_sup=VALUES(nw_cod_sup),
                nw_des_sup=VALUES(nw_des_sup),
                nw_cod_inf=VALUES(nw_cod_inf),
                nw_des_inf=VALUES(nw_des_inf),
                updated_date=VALUES(updated_date)                
        """
        db.execute(dml.statement, cursor, dml.parameters)
        return cursor.lastrowid
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                versao = getVersao(data,cursor)
                id = upsertNonwovens(data, versao, cursor)
                return Response({"status": "success", "id":id, "title": "Os Nonwovens foram Registados com Sucesso!", "subTitle":f'Nonwovens {data["designacao"]} v{versao}'})
    except Error:
        return Response({"status": "error", "title": "Erro ao Registar os Nonwovens!"})

#endregion

#region CORTES
@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def CortesOrdemLookup(request, format=None):
    #conn = connections[connGatewayName].cursor()
    #print(f"request--->{request.data['filter']}")
    cols = ['*']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'co.cortes_id = :cortes_id', True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                select 
                {dql.columns}
                from producao_cortesordem co
                {f.text}
                {dql.sort}
            """
        ), cursor, parameters)
        return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def ArtigosTempAggLookup(request, format=None):
    cols = ["""
    pc.id cortes_id, pc.largura_cod, pc.largura_json, pca.id cortes_artigo_id,pca.largura cortes_artigo_lar, COALESCE(pca.ncortes,1) cortes_artigo_ncortes,tof.of_id,
    tof.item_cod,itm_sage."ITMDES1_0" item_des, itm.lar item_lar, pco.designacao, pco.largura_ordem, pco.id largura_id, toaf.cortesordem_id
    """]
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'toaf.id = :agg_id', True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    with connections[connGatewayName].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""              
                select 
                {dql.columns}
                from "SGP-DEV".producao_tempordemfabrico tof
                join "SGP-DEV".producao_tempaggordemfabrico toaf on toaf.id = tof.agg_of_id
                join "SGP-DEV".producao_artigo itm on itm.cod = tof.item_cod
                join "SAGE-PROD"."ITMMASTER" itm_sage on itm_sage."ITMREF_0" = tof.item_cod
                left join "SGP-DEV".producao_cortes pc on toaf.cortes_id= pc.id
                left join "SGP-DEV".producao_cortesordem pco on pc.id= pco.cortes_id and toaf.cortesordem_id = pco.id
                left join "SGP-DEV".producao_cortesartigos pca on pca.cortes_id = pc.id and pca.of_id = tof.of_id and pca.artigo_cod = tof.item_cod
                {f.text}
                {dql.sort}
            """
        ), cursor, parameters)
        return Response(response)

def CortesGet(request, format=None):
    cols = ['*']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'pc.id = :cortes_id', True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                select 
                {dql.columns}
                from producao_cortes pc
                join producao_cortesartigos pca on pca.cortes_id = pc.id
                {f.text}
                {dql.sort}
            """
        ), cursor, parameters)
        return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
# @transaction.atomic()
def NewCortes(request, format=None):
    data = request.data.get("parameters")
    def computeLarguraCod(data):
        list = sorted(data['cortes'], key=lambda k: k['item_lar'])
        cod = {}
        for v in list:
            cod[v["item_lar"]] = v["cortes_artigo_ncortes"] if v["item_lar"] not in cod else cod[v["item_lar"]] + v["cortes_artigo_ncortes"]
        return {"json":json.dumps(cod),"cod":hashlib.md5(json.dumps(cod).encode('utf-8')).hexdigest()[ 0 : 16 ]}

    def getCortesId(larguras, cursor):
        f = Filters({"largura_cod": larguras["cod"]})
        f.setParameters({}, False)
        f.where()
        f.add(f'ct.largura_cod = :largura_cod', True)
        f.value("and")   
        rows = db.executeSimpleList(lambda: (f'SELECT id FROM producao_cortes ct {f.text}'), cursor, f.parameters)['rows']
        if len(rows)>0:
            return rows[0]['id']
        return None

    def insertCortes(id, larguras, data, cursor):        
        fields = {
            "largura_cod":  larguras["cod"],
            "largura_json": larguras["json"],
            "created_date": datetime.now(),
            "updated_date": datetime.now()
        }
        if not id:
            dml = db.dml(TypeDml.INSERT,fields,"producao_cortes",None,None,False)
            db.execute(dml.statement, cursor, dml.parameters)
            return cursor.lastrowid
        return id


    def deleteCortesArtigos(id,cursor):
        s = "','"
        of_ids = f"'{s.join([v['of_id'] for v in data['cortes']])}'"
        dml = db.dml(TypeDml.DELETE, None,'producao_cortesartigos',{"cortes_id":f'=={id}'},None,False)
        statement = f'{dml.statement} or of_id in ({of_ids})'
        db.execute(statement, cursor, dml.parameters)

    def insertCortesArtigos(id,data,cursor):
        for v in data["cortes"]:
            values = {
                "artigo_cod":v["item_cod"], 
                "largura":v["item_lar"], 
                "cortes_id":id,
                "of_id":v["of_id"],
                "ncortes":v["cortes_artigo_ncortes"]
            }            
            dml = db.dml(TypeDml.INSERT, values, "producao_cortesartigos",None,None,False)
            db.execute(dml.statement, cursor, dml.parameters)

    def updateTempAggOFabrico(cortes_id,data,cursor,cortes_are_equal):
        params = {"cortes_id":cortes_id}
        if (not cortes_are_equal):
           params['cortesordem_id'] = None        
        dml = db.dml(TypeDml.UPDATE, params , "producao_tempaggordemfabrico",{"id":data["agg_id"]},None,False)
        db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                if 'cortes' not in data:
                    raise ValueError("Os Cortes têm de estar Definidos.")
                if 'agg_id' not in data:
                    raise ValueError("Erro ao Registar os Cortes! Sem Agregação!")
                larguras = computeLarguraCod(data)
                cortes_are_equal = data["cortes"][0]["largura_cod"] == larguras["cod"]
                cortes_id = getCortesId(larguras,cursor)
                cortes_id = insertCortes(cortes_id, larguras, data, cursor)
                deleteCortesArtigos(cortes_id,cursor)
                insertCortesArtigos(cortes_id,data,cursor)
                updateTempAggOFabrico(cortes_id,data,cursor,cortes_are_equal)
                return Response({"status": "success", "id":cortes_id, "title": "Os Cortes foram Registados com Sucesso!", "subTitle":''})
    except Error:
        return Response({"status": "error", "title": "Erro ao Registar os Cortes!"})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
# @transaction.atomic()
def ClearCortes(request, format=None):
    data = request.data.get("parameters")
    
    def updateTempAggOFabrico(data,cursor):
        dml = db.dml(TypeDml.UPDATE, {"cortes_id":None,"cortesordem_id":None} , "producao_tempaggordemfabrico",{"id":data["agg_id"]},None,False)
        db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:                
                updateTempAggOFabrico(data,cursor)
                return Response({"status": "success", "id":data["agg_id"], "title": "Os Cortes foram Removidos com Sucesso!", "subTitle":''})
    except Error:
        return Response({"status": "error", "title": "Erro ao Remover os Cortes!"})



@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
# @transaction.atomic()
def UpdateCortesOrdem(request, format=None):
    data = request.data.get("parameters")
    
    def getVersao(data, cursor):
        f = Filters({"cortes_id": data['cortes_id']})
        f.setParameters({}, False)
        f.where()
        f.add(f'co.cortes_id = :cortes_id', True)
        f.value("and")   
        return db.executeSimpleList(lambda: (f'SELECT IFNULL(MAX(versao),0)+1 AS mx FROM producao_cortesordem co {f.text}'), cursor, f.parameters)['rows'][0]['mx']

    def upsertCortesOrdem(data, versao, cursor):
        dml = db.dml(TypeDml.INSERT, {
            'cortes_id': data['cortes_id'],
            'designacao': data['designacao'],
            'largura_ordem': data['largura_ordem'],
            'ordem_cod': hashlib.md5(data['largura_ordem'].encode('utf-8')).hexdigest()[ 0 : 16 ],
            'versao': f'{versao}',
            "created_date": datetime.now(),
            "updated_date": datetime.now()
        }, "producao_cortesordem",None,None,False,['versao'])
        dml.statement = f"""
            {dml.statement}
            ON DUPLICATE KEY UPDATE 
                id = LAST_INSERT_ID(id),
                cortes_id=VALUES(cortes_id),
                designacao=VALUES(designacao),
                largura_ordem=VALUES(largura_ordem),
                ordem_cod=VALUES(ordem_cod),
                updated_date=VALUES(updated_date)                
        """
        db.execute(dml.statement, cursor, dml.parameters)
        return cursor.lastrowid 

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                data["designacao"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S") if ("designacao" not in data or not data["designacao"]) else data["designacao"] 
                versao = getVersao(data,cursor)
                id = upsertCortesOrdem(data, versao, cursor)
                return Response({"status": "success", "id":id, "title": "Os Cortes foram Posicionados com Sucesso!", "subTitle":''})
    except Error:
        return Response({"status": "error", "title": "Erro ao Posicionados os Cortes!"})




#endregion

#region TEMP ORDEMFABRICO SCHEMA
def computeRolledLength(aggId):
    pass

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
# @transaction.atomic()
def SaveTempOrdemFabrico(request, format=None):
    data = request.data.get("parameters")
    def computeLinearMeters(data):
        artigo = data["artigo"] if "artigo" in data else data
        if artigo is not None:
            t = (float(artigo['artigo_thickness'])/1000)
            D1 = float(artigo['artigo_diam'])
            d1 = float(artigo['artigo_core']) * 25.4
            l = (( math.pi * ( (D1/2)**2 - (d1/2)**2 ) ) / t) / 1000
            nvoltas = (D1 - d1) / ( 2 * t )
            return {
                "qty_encomenda":artigo['qty_item'] if 'qty_item' in artigo else data['qty_item'],
                "linear_meters":l,
                "n_voltas":nvoltas,
                "sqm_bobine":(l*float(artigo['artigo_width']))/1000
            }
        return None

    def computePaletizacao(cp,data,cursor):
        paletizacao = None
        if "paletizacao_id" in data and data["paletizacao_id"] is not None:
            rows = db.executeSimpleList(lambda: (f"""
                select  pp.npaletes,ppd.* 
                from producao_paletizacao pp
                left join producao_paletizacaodetails ppd on pp.id=ppd.paletizacao_id and ppd.item_id=2
                where pp.id={data['paletizacao_id']}
            """), cursor, {})['rows']
            if len(rows)>0:
                paletizacao=rows
        else:
            rows = db.executeSimpleList(lambda: (f"""
                select pp.npaletes, ppd.* 
                from producao_tempordemfabrico tof
                left join producao_paletizacao pp on pp.id=tof.paletizacao_id
                left join producao_paletizacaodetails ppd on pp.id=ppd.paletizacao_id and ppd.item_id=2
                where tof.of_id='{data['ofabrico']}'
            """), cursor, {})['rows']
            if len(rows)>0:
                paletizacao=rows
        computed = {}
        sqm_paletes_total = 0
        nitems = 0
        items = []
        if paletizacao is not None:
            for pitem in paletizacao:
                if pitem["id"] is not None:
                    nitems += 1
                    items.append({
                        "id":pitem["id"],
                        "num_bobines":pitem["item_numbobines"],
                        "sqm_palete":cp["sqm_bobine"]*pitem["item_numbobines"]
                    })
                    sqm_paletes_total += (cp["sqm_bobine"]*pitem["item_numbobines"])
            if nitems>0:
                computed["total"] = {
                    "sqm_paletes_total":sqm_paletes_total,
                    "sqm_contentor":sqm_paletes_total*paletizacao[0]["npaletes"],
                    "n_paletes":(cp["qty_encomenda"]/sqm_paletes_total)*nitems
                }
                computed["items"] = items
        return computed

    def computeGtin(cursor,main_gtin):
        id = getMaxArtigoGtin(cursor,main_gtin)
        cod = main_gtin + str(int(id[:-1].replace(main_gtin,''))+1)
        total = 0
        for i,element in enumerate(cod[::-1]):
            if (i+1) % 2 == 0:
                total = total + int(element)
            else:
                total = total + (int(element) * 3)
        chk = (math.ceil(total / 10) * 10) - total
        return cod + str(chk)

    def getMaxArtigoGtin(cursor,main_gtin):
        f = Filters({})
        f.where()
        f.value("and")   
        return db.executeSimpleList(lambda: (f"SELECT IFNULL(MAX(gtin),0) AS mx FROM producao_artigo f WHERE gtin like '{main_gtin}%%'"), cursor,{})['rows'][0]['mx']

    def addProduto(data,cursor):
        artigo = data["artigo"] if "artigo" in data else None
        if artigo is not None:
            dml = db.dml(TypeDml.INSERT, {"produto_cod":artigo["produto_cod"]}, "producao_produtos",None,None,False)
            db.execute(dml.statement, cursor, dml.parameters)
            return cursor.lastrowid
        return None

    def addArtigo(data,produto_id,cursor):
        artigo = data["artigo"] if "artigo" in data else None
        if artigo is not None:
            dta = {
            'cod': data['item'],
            'des': artigo['artigo_nome'],
            'tipo': "Produto Final",
            'core': artigo['artigo_core'],
            'diam_ref': artigo['artigo_diam'] if 'artigo_diam' in artigo else None,
            'formu': artigo['artigo_formu'],
            'gsm': artigo['artigo_gram'],
            'lar': artigo['artigo_width'],
            'nw1': artigo['artigo_nw1'],
            'produto': artigo['produto_cod'],
            'produto_id': produto_id,
            'thickness': artigo['artigo_thickness'],
            'nw2': artigo['artigo_nw2'] if 'artigo_nw2' in artigo else None
            }
            dml = None
            if "artigo_gtin" in artigo:
                dta["gtin"] = artigo["artigo_gtin"]
            else:
                dta["gtin"] = computeGtin(cursor,artigo['main_gtin'])
            dml = db.dml(TypeDml.INSERT, dta, "producao_artigo",None,None,False)
            db.execute(dml.statement, cursor, dml.parameters)
            return cursor.lastrowid
        else:
            return None

    def getAgg(data, cursor):
        f = Filters({"of_id": data['ofabrico'], "item_cod": data['item']})
        f.setParameters({}, False)
        f.where()
        f.add(f'of_id = :of_id', True)
        f.add(f'item_cod = :item_cod', True)
        f.value("and")   
        rows = db.executeSimpleList(lambda: (f'SELECT agg_of_id,agg_ofid_original FROM producao_tempordemfabrico {f.text}'), cursor, f.parameters)['rows']
        return rows[0] if len(rows)>0 else None

    def upsertTempAggOrdemFabrico(data, ids, cursor):
        dta = {
            'core_cod': data['core_cod'] if 'core_cod' in data else None,
            'core_des': data['core_des'] if 'core_des' in data else None,
            'status': data['status'] if 'status' in data else 0
        }
        if "formulacao_id" in data:
            dta["formulacao_id"] = data["formulacao_id"]
        if "cortesordem_id" in data:
            dta["cortesordem_id"] = data["cortesordem_id"]
        if "gamaoperatoria_id" in data:
            dta["gamaoperatoria_id"] = data["gamaoperatoria_id"]
        if "artigospecs_id" in data:
            dta["artigospecs_id"] = data["artigospecs_id"]
        if "nonwovens_id" in data:
            dta["nonwovens_id"] = data["nonwovens_id"]

        if ids is None:
            dml = db.dml(TypeDml.INSERT, dta, "producao_tempaggordemfabrico",None,None,False)
            statement = f"""
                insert into producao_tempaggordemfabrico(year,cod,{",".join(dml.columns)})
                select YEAR(CURDATE()) year, CONCAT('AGG-OF-',LPAD(IFNULL(count(*),0)+1,4,'0'),'/',YEAR(CURDATE())) d, {",".join(dml.tags)}
                from producao_tempaggordemfabrico where year=YEAR(CURDATE())
            """
            db.execute(statement, cursor, dml.parameters)
            return cursor.lastrowid
        else:
            aggid = data['agg_of_id'] if ("agg_of_id" in data) else ids["agg_of_id"]
            agg_ofid_original = ids["agg_ofid_original"] if ids is not None else aggid
            if agg_ofid_original != aggid:
                dml = db.dml(TypeDml.UPDATE,{"status":-1},"producao_tempaggordemfabrico",{"id":f'=={agg_ofid_original}'},None,False)
                db.execute(dml.statement, cursor, dml.parameters)

            dml = db.dml(TypeDml.UPDATE,dta,"producao_tempaggordemfabrico",{"id":f'=={ids["agg_of_id"]}'},None,False)
            print(f'xxxxxxxxxxxxxxxxxxxxxxxxx{data}----{dml.statement}')
            db.execute(dml.statement, cursor, dml.parameters)
            return ids["agg_of_id"]

    def upsertTempOrdemFabrico(data,aggid,produto_id, cp, cpp, cursor):
        dta = {
            'agg_of_id': aggid,
            'agg_ofid_original': aggid,
            'of_id': data['ofabrico'],
            'order_cod': data['iorder'],
            'cliente_cod': data['cliente_cod'],
            'cliente_nome': data['cliente_nome'],
            'item_cod': data['item'],
            'item_id': data['item_id'],
            'produto_id': data['produto_id'] if produto_id is None else produto_id
        }        
        onDuplicate = ""
        # if "formulacao_id" in data:
        #     dta["formulacao_id"] = data["formulacao_id"]
        #     onDuplicate+=",formulacao_id=VALUES(formulacao_id)"
        # if "gamaoperatoria_id" in data:
        #     dta["gamaoperatoria_id"] = data["gamaoperatoria_id"]
        #     onDuplicate+=",gamaoperatoria_id=VALUES(gamaoperatoria_id)"
        # if "artigospecs_id" in data:
        #     dta["artigospecs_id"] = data["artigospecs_id"]
        #     onDuplicate+=",artigospecs_id=VALUES(artigospecs_id)"
        if "paletizacao_id" in data:
            dta["paletizacao_id"] = data["paletizacao_id"]
            onDuplicate+=",paletizacao_id=VALUES(paletizacao_id)"
        # if "nonwovens_id" in data:
        #     dta["nonwovens_id"] = data["nonwovens_id"]
        #     onDuplicate+=",nonwovens_id=VALUES(nonwovens_id)"
        artigo = data["artigo"] if "artigo" in data else data
        if artigo is not None:
            dta['qty_encomenda'] = cp['qty_encomenda'],
            dta['linear_meters'] = cp["linear_meters"],
            dta['n_voltas'] = cp["n_voltas"],
            dta['sqm_bobine'] = cp["sqm_bobine"]
            dta['n_paletes'] = json.dumps(cpp)
            onDuplicate+=",qty_encomenda=VALUES(qty_encomenda)"
            onDuplicate+=",linear_meters=VALUES(linear_meters)"
            onDuplicate+=",sqm_bobine=VALUES(sqm_bobine)"
            onDuplicate+=",qty_encomenda=VALUES(qty_encomenda)"
            onDuplicate+=",n_voltas=VALUES(n_voltas)"
            onDuplicate+=",n_paletes=VALUES(n_paletes)"

        dml = db.dml(TypeDml.INSERT, dta, "producao_tempordemfabrico",None,None,False)
        dml.statement = f"""
            {dml.statement}
            ON DUPLICATE KEY UPDATE 
                id = LAST_INSERT_ID(id),
                of_id=VALUES(of_id),
                agg_of_id=VALUES(agg_of_id),
                order_cod=VALUES(order_cod),
                cliente_cod=VALUES(cliente_cod),
                cliente_nome=VALUES(cliente_nome),
                produto_id=VALUES(produto_id),
                item_cod=VALUES(item_cod),
                item_id=VALUES(item_id)
                {onDuplicate}
        """
        db.execute(dml.statement, cursor, dml.parameters)
        return cursor.lastrowid

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                cp = computeLinearMeters(data)
                cpp = computePaletizacao(cp,data,cursor)
                produto_id = addProduto(data,cursor)
                addArtigo(data,produto_id,cursor)
                ids = getAgg(data,cursor)
                aggid = upsertTempAggOrdemFabrico(data,ids,cursor)
                id = upsertTempOrdemFabrico(data,aggid,produto_id,cp, cpp, cursor)
        return Response({"status": "success","id":data["ofabrico"], "title": "A Ordem de Fabrico Foi Guardada com Sucesso!", "subTitle":f'{data["ofabrico"]}'})
    except Error:
        return Response({"status": "error", "title": "Erro ao Guardar a Ordem de Fabrico!"})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
# @transaction.atomic()
def SaveTempAgg(request, format=None):
    data = request.data.get("parameters")
    agg_ids = [d['tempof_id'] for d in data['aggs'] if d['checked']==1]
    remove_agg_ids = [d['tempof_id'] for d in data['aggs'] if d['checked']==0]

    def getAggsAlreadyGrouped(data, cursor):
        f = Filters({"agg_of_id": data["agg_id"]})
        f.setParameters({}, False)
        f.where(False,override='and')
        f.add(f't.agg_of_id <> :agg_of_id', True)
        f.value("and")   
        rows = db.executeSimpleList(lambda: (f"""        
            select agg_of_id,GROUP_CONCAT(of_id) group_ofid from sistema_dev.producao_tempordemfabrico tof 
            where 
            exists (
            SELECT 1 FROM sistema_dev.producao_tempordemfabrico t where id in (
            {','.join(str(v) for v in agg_ids)}
            ) 
            {f.text} 
            and t.agg_of_id = tof.agg_of_id
            )
            group by agg_of_id
            having count(*) > 1        
        """), cursor, f.parameters)['rows']
        ofs = [d['group_ofid'] for d in rows]
        return ofs

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                v = getAggsAlreadyGrouped(data,cursor)
                if (len(v)>0):
                    return Response({"status": "error", "title": "Não é possível Agrupar as Ordens de Fabrico, As seguintes Ordens já estão Agrupadas!","value":v})
                if (len(agg_ids)==0):
                    return Response({"status": "error", "title": "Não Foram Selecionadas Ordens de Fabrico!"})
                dml = db.dml(TypeDml.UPDATE,{"agg_of_id":data["agg_id"]},"producao_tempordemfabrico",{},None,False)
                statement = f"""{dml.statement} WHERE id in ({','.join(str(v) for v in agg_ids)})"""
                db.execute(statement, cursor, dml.parameters)
                if (len(remove_agg_ids)>0):
                    dml = db.dml(TypeDml.UPDATE,{},"producao_tempordemfabrico",{"agg_of_id":f'=={data["agg_id"]}'},None,False)
                    statement = f"""{dml.statement.replace('SET','SET agg_of_id=agg_ofid_original',1)} and id in ({','.join(str(v) for v in remove_agg_ids)})"""
                    db.execute(statement, cursor, dml.parameters)
        return Response({"status": "success","id":None, "title": "As Ordens de Fabrico Foram Agrupadas com Sucesso!", "subTitle":''})
    except BaseException as e:
        return Response({"status": "error", "title": "Erro ao Agrupar as Ordens de Fabrico!","value":e.args[len(e.args)-1]})



@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def TempOFabricoGet(request, format=None):
    #conn = connections[connGatewayName].cursor()
    cols = ['tof.*','tagg.core_cod,tagg.core_des,tagg.artigospecs_id,tagg.formulacao_id,tagg.gamaoperatoria_id,tagg.nonwovens_id,tagg.year,tagg.cod,tagg.status,tagg.cortes_id']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'tof.of_id = :of_id', True)
    f.add(f'tof.item_cod = :item_cod', True)
    f.add(f'tof.cliente_cod = :cliente_cod',lambda v:(v!=None))
    f.add(f'tof.order_cod = :order_cod',lambda v:(v!=None))
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                select 
                {dql.columns}
                from producao_tempordemfabrico tof
                join producao_tempaggordemfabrico tagg on tof.agg_of_id = tagg.id
                {f.text}
                {dql.sort}
            """
        ), cursor, parameters)
        return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def TempAggOFabricoLookup(request, format=None):
    f = Filters(request.data['filter'])
    group = request.data['parameters']['group'] if 'group' in request.data['parameters'] else True
    if group:
        cols=["tofa.id,string_agg(tof.id::text,',') group_id,string_agg(tof.of_id,',') group_ofid,string_agg(tof.item_cod,',') group_item_cod,string_agg(oflist.qty_item::text,',') group_qty_item"]
        #cols = ['tofa.id,GROUP_CONCAT(tof.id) group_id,GROUP_CONCAT(tof.of_id) group_ofid,GROUP_CONCAT(tof.item_cod) group_item_cod']
        group = "group by tofa.id"
    else:
        cols=["""oflist.ofabrico,oflist.item, oflist.item_nome, oflist.iorder,oflist.cliente_cod,oflist.cliente_nome,oflist.qty_prevista, 
            oflist.qty_item,tofa.id, tof.id tempof_id, tof.of_id of_id, tof.item_id item_id, tof.item_cod item_cod, tof.agg_ofid_original"""]
        #cols = ['tofa.id, tof.id tempof_id, tof.of_id of_id, tof.item_cod item_cod, tof.agg_ofid_original']
        group = ""
    
    f.setParameters({}, False)
    f.where()
    f.add(f'tofa.status = :status',lambda v:(v!=None))  
    f.add(f'tof.produto_id = :produto_id',lambda v:(v!=None))
    f.value("and")
    parameters = {**f.parameters}
    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    with connections[connGatewayName].cursor() as cursor:
        if group:
            response = db.executeSimpleList(lambda:(f"""
                select json_agg(t) v from (
                SELECT
                tofa.cod,tofa.id,tof.id tempof_id, tof.of_id,tof.item_id,tof.item_cod,tof.order_cod,tof.cliente_nome,tof.linear_meters,tof.n_paletes,tof.qty_encomenda,tof.sqm_bobine, tof.paletizacao_id
                ,(select json_agg(pd) x from "SGP-DEV".producao_paletizacaodetails pd where tof.paletizacao_id=pd.paletizacao_id) paletizacao,
                ppz.filmeestiravel_bobines, ppz.filmeestiravel_exterior,ppz.cintas, ppz.ncintas,
                (select json_agg(pp.nome) x from "SGP-DEV".producao_palete pp where tof.id=pp.draft_ordem_id) paletesstock
                FROM MV_OFABRICO_LIST oflist
                join "SGP-DEV".producao_tempordemfabrico tof on tof.of_id=oflist.ofabrico and tof.item_cod=oflist.item
                join "SGP-DEV".producao_tempaggordemfabrico tofa on tofa.id=tof.agg_of_id
                left join "SGP-DEV".producao_paletizacao ppz on ppz.id=tof.paletizacao_id
                {f.text}
                ) t
            """),cursor,parameters)
        else:
            response = db.executeSimpleList(lambda: (
                f"""
                    select 
                    {dql.columns}
                    FROM MV_OFABRICO_LIST oflist
                    join "SGP-DEV".producao_tempordemfabrico tof on tof.of_id=oflist.ofabrico and tof.item_cod=oflist.item
                    join "SGP-DEV".producao_tempaggordemfabrico tofa on tofa.id=tof.agg_of_id
                    {f.text}
                    {dql.sort}
                    {group}
                """
            ), cursor, parameters)
        # response = db.executeSimpleList(lambda: (
        #     f"""
        #         select 
        #         {dql.columns}
        #         from producao_tempordemfabrico tof
        #         join producao_tempaggordemfabrico tofa on tofa.id=tof.agg_of_id
        #         #where tof.agg_of_id=tof.agg_ofid_original
        #         {f.text}
        #         {dql.sort}
        #         {group}
        #     """
        # ), cursor, parameters)
        return Response(response)

# @api_view(['POST'])
# @renderer_classes([JSONRenderer])
# @authentication_classes([SessionAuthentication])
# @permission_classes([IsAuthenticated])
# def TempAggOFabricoItemsGet(request, format=None):
#     cols = ['*']
#     f = Filters(request.data['filter'])
#     f.setParameters({}, False)
#     f.where()
#     f.add(f'f.agg_of_id = :agg_of_id',True)
#     f.value("and")
#     parameters = {**f.parameters}
    
#     dql = db.dql(request.data, False)
#     dql.columns = encloseColumn(cols,False)
#     with connections["default"].cursor() as cursor:
#         response = db.executeSimpleList(lambda: (
#             f"""
#                 select 
#                 {dql.columns}
#                 from producao_tempordemfabrico f
#                 {f.text}
#                 {dql.sort}
#             """
#         ), cursor, parameters)
#         return Response(response)
#endregion



#End Ordens de Fabrico











@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SellOrdersList(request, format=None):
    connection = connections[connGatewayName].cursor()
    def statusFilter(v):
        if v == 'all':
            return None
        elif v == 'notcreated':
            return 'isnull'
        elif v == 'inpreparation':
            return '==0'
        elif v == 'inprogress':
            return '==1'
        elif v == 'finished':
            return '==99'
        return None
    groupByOrder = request.data["parameters"].get('groupByOrder')

    f = Filters(request.data['filter'])
    f.setParameters({
        **rangeP(f.filterData.get('forderdate'), 'ORDDAT_0', lambda k, v: f'"enc"."{k}"'),
        **rangeP(f.filterData.get('SHIDAT_0'), 'SHIDAT_0', lambda k, v: f'"enc"."{k}"'),
        "LASDLVNUM_0": {"value": lambda v: v.get('LASDLVNUM_0').lower() if v.get('LASDLVNUM_0') is not None else None, "field": lambda k, v: f'lower("enc"."{k}")'},
        "status": {"value": lambda v: statusFilter(v.get('ofstatus')), "field": lambda k, v: f'"of"."{k}"'}
    }, True)
    f.where()
    f.auto()
    f.value()

    f2 = filterMulti(request.data['filter'], {
        'fmulti_customer': {"keys": ['BPCORD_0', 'BPCNAM_0'], "table": 'enc'},
        'fmulti_order': {"keys": ['SOHNUM_0', 'PRFNUM_0'], "table": 'enc'},
        'fmulti_item': {"keys": ['ITMREF_0', 'ITMDES1_0'], "table": 'itm'}
    }, False, "and" if f.hasFilters else False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = dbgw.dql(request.data, False)

    if groupByOrder == True:
        dql.columns = encloseColumn(['enc.ROWID', 'enc.SOHNUM_0', 'enc.ORDDAT_0', 'enc.DEMDLVDAT_0', 'enc.SHIDAT_0', 'enc.PRFNUM_0', 'enc.CUSORDREF_0', 'enc.DAYLTI_0',
                                    'enc.LASDLVDAT_0', 'enc.LASDLVNUM_0', 'enc.LASINVDAT_0', 'enc.LASINVNUM_0', 'enc.DSPTOTQTY_0', 'enc.DSPTOTVOL_0', 'enc.DSPTOTWEI_0',
                                     'enc.DSPVOU_0', 'enc.DSPWEU_0',
                                     'enc.BPCORD_0', 'enc.BPCNAM_0', 'enc.CREUSR_0', 'enc.CREDAT_0', 'enc.CREDATTIM_0', 'enc.UPDUSR_0', 'enc.UPDDAT_0', 'enc.UPDDATTIM_0'])

        response = dbgw.executeList(lambda p, c: (
            f"""
            SELECT {c(f'distinct(enc."SOHNUM_0") "key", {dql.columns}')} 
            FROM "SAGE"."SORDER" as enc
            JOIN "SAGE"."SORDERQ" as enclin on enc."SOHNUM_0" = enclin."SOHNUM_0"
            JOIN "SAGE"."ITMMASTER" as itm on enclin."ITMREF_0" = itm."ITMREF_0"
            {f.text} {f2['text']}
            {p(dql.sort)} {p(dql.paging)}
            """
        ), connection, parameters, ["AUUID_0", "ROWID"], lambda v: 'count(distinct(enc."SOHNUM_0"))')
    else:
        #dql.columns = encloseColumn(['enc.ROWID', 'itm.ITMREF_0', 'itm.ITMDES1_0', 'enc.SOHNUM_0', 'enclin.SOPLIN_0', 'enc.ORDDAT_0', 'enc.DEMDLVDAT_0', 'enc.SHIDAT_0', 'enc.PRFNUM_0', 'enc.CUSORDREF_0', 'enc.DAYLTI_0',
        #                            'enc.LASDLVDAT_0', 'enc.LASDLVNUM_0', 'enc.LASINVDAT_0', 'enc.LASINVNUM_0', 'enc.DSPTOTQTY_0', 'enc.DSPTOTVOL_0', 'enc.DSPTOTWEI_0',
        #                             'enc.DSPVOU_0', 'enc.DSPWEU_0',
        #                             'enc.BPCORD_0', 'enc.BPCNAM_0', 'enc.CREUSR_0', 'enc.CREDAT_0', 'enc.CREDATTIM_0', 'enc.UPDUSR_0', 'enc.UPDDAT_0', 'enc.UPDDATTIM_0',
        #                             'ofa.ordemfabrico_id', 'of.status',
        #                             'sgpitm.id', 'sgpitm.nw1', 'sgpitm.nw2', 'sgpitm.lar', 'sgpitm.formu', 'sgpitm.diam_ref', 'sgpitm.core', 'sgpitm.gsm', 'sgpitm.gtin'
        #                             ])

        dql.columns = encloseColumn(['enc.ROWID', 'itm.ITMREF_0', 'itm.ITMDES1_0', 'enc.SOHNUM_0', 'enclin.SOPLIN_0', 'enc.ORDDAT_0', 'enc.DEMDLVDAT_0', 'enc.SHIDAT_0', 'enc.PRFNUM_0', 'enc.CUSORDREF_0', 'enc.DAYLTI_0',
                                    'enc.LASDLVDAT_0', 'enc.LASDLVNUM_0', 'enc.LASINVDAT_0', 'enc.LASINVNUM_0', 'enc.DSPTOTQTY_0', 'enc.DSPTOTVOL_0', 'enc.DSPTOTWEI_0',
                                     'enc.DSPVOU_0', 'enc.DSPWEU_0',
                                     'enc.BPCORD_0', 'enc.BPCNAM_0', 'enc.CREUSR_0', 'enc.CREDAT_0', 'enc.CREDATTIM_0', 'enc.UPDUSR_0', 'enc.UPDDAT_0', 'enc.UPDDATTIM_0'
                                     ])

        response = dbgw.executeList(lambda p, c: (
            f"""
            SELECT {c(f'{dql.columns}')} 
            FROM "SAGE-PROD"."SORDER" as enc
            JOIN "SAGE-PROD"."SORDERQ" as enclin on enc."SOHNUM_0" = enclin."SOHNUM_0"
            JOIN "SAGE-PROD"."ITMMASTER" as itm on enclin."ITMREF_0" = itm."ITMREF_0"
            --LEFT JOIN producao_artigodetails as sgpitm on sgpitm.cod = itm."ITMREF_0"
            --LEFT JOIN planeamento_ordemfabricoartigos as ofa on ofa.encomenda_num = enclin."SOHNUM_0" and ofa.artigo_cod = itm."ITMREF_0"
            --LEFT JOIN planeamento_ordemfabrico as "of" on "of".id = ofa.ordemfabrico_id
            {f.text} {f2['text']}
            {p(dql.sort)} {p(dql.paging)}
            """
        ), connection, parameters, ["AUUID_0", "ROWID"])

    return Response(response)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SellOrderItemsList(request, format=None):
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add('enclin."SOHNUM_0" = :SOHNUM_0', True)
    f.value()
    parameters = {**f.parameters}

    dql = dbgw.dql(request.data, False)
    dql.columns = encloseColumn(['enclin.SOHNUM_0', 'enclin.SDHNUM_0', 'enclin.ITMREF_0', 'enclin.ORIQTY_0',
                                'enclin.QTY_0', 'itm.ITMDES1_0', 'itm.TSICOD_2', 'itm.TSICOD_3', 'itm.TSICOD_0', 'itm.TSICOD_1'])

    response = dbgw.executeSimpleList(lambda: (
        f"""
         SELECT {dql.columns} 
         FROM "SAGE"."SORDERQ" as enclin
         JOIN "SAGE"."ITMMASTER" as itm on enclin."ITMREF_0" = itm."ITMREF_0"
         {f.text}
         {dql.sort}
         """
    ), connection, parameters, [])
    return Response(response)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SellCustomersLookup_OLD(request, format=None):
    cols = ['BPCNUM_0', 'BPCNAM_0']
    f = filterMulti(request.data['filter'], {
                    'fmulti_customer': {"keys": cols}})
    parameters = {**f['parameters']}

    dql = dbgw.dql(request.data, False)
    dql.columns = encloseColumn(cols)

    response = dbgw.executeSimpleList(lambda: (
        f'SELECT {dql.columns} FROM "SAGE"."BPCUSTOMER" {f["text"]} {dql.sort} {dql.limit}'
    ), connection, parameters)
    return Response(response)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SellOrdersLookup(request, format=None):
    cols = ['SOHNUM_0', 'PRFNUM_0']
    f = filterMulti(request.data['filter'], {'fmulti_order': {"keys": cols}})
    parameters = {**f['parameters']}

    dql = dbgw.dql(request.data, False)
    dql.columns = encloseColumn(cols)

    response = dbgw.executeSimpleList(lambda: (
        f'SELECT {dql.columns} FROM "SAGE"."SORDER" {f["text"]} {dql.sort} {dql.limit}'
    ), connection, parameters)
    return Response(response)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SellItemsLookup(request, format=None):
    cols = ['ITMREF_0', 'ITMDES1_0']
    f = filterMulti(request.data['filter'], {'fmulti_item': {"keys": cols}})
    parameters = {**f['parameters']}

    dql = dbgw.dql(request.data, False)
    dql.columns = encloseColumn(cols)

    response = dbgw.executeSimpleList(lambda: (
        f'SELECT {dql.columns} FROM "SAGE"."ITMMASTER" {f["text"]} {dql.sort} {dql.limit}'
    ), connection, parameters)
    return Response(response)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def NewOrdemFabrico(request, format=None):
    data = request.data.get("parameters")

    def checkIfExistsRelationArtigos(data, cursor):
        idx = 0
        fp = {}
        for k, v in data.items():
            fp[f'SOHNUM_0_{idx}'] = v["SOHNUM_0"]
            fp[f'ITMREF_0_{idx}'] = v["ITMREF_0"]
            idx += 1
        f = Filters(fp)
        f.setParameters({}, False)
        f.where()
        for idx, v in enumerate(data.keys()):
            f.add(
                f'(encomenda_num = :SOHNUM_0_{idx} and artigo_cod = :ITMREF_0_{idx})', True)
            f.value("or")
        return dbgw.exists("planeamento_ordemfabricoartigos", f, cursor)

    def upsertArtigos(data, cursor):
        for k, v in data.items():
            if (v["new"] or v["changed"]):
                dml = dbgw.dml(TypeDml.INSERT, {
                    "cod": v['ITMREF_0'],
                    "core": v['core'],
                    "diam_ref": v['diam'],
                    "lar": v['width'],
                    "gsm": v['gram']
                }, "producao_artigodetails")
                dml.statement = f"""
                    {dml.statement} 
                    ON CONFLICT (cod) DO UPDATE SET 
                    core = EXCLUDED.core,
                    diam_ref = EXCLUDED.diam_ref,
                    lar = EXCLUDED.lar,
                    gsm = EXCLUDED.gsm
                """
                dbgw.execute(dml.statement, cursor, dml.parameters)

    def insertOrdemFabrico(data, cursor):
        dml = dbgw.dml(TypeDml.INSERT, {
            "created": datetime.now(),
            "updated": datetime.now(),
            "user_create_id": request.user.id,
            "status": 0
        }, "planeamento_ordemfabrico", "id")
        id = dbgw.execute(dml.statement, cursor, dml.parameters, True)
        return id

    def relationOrdemFabrico(id, data, cursor):
        for k, v in data.items():
            dml = dbgw.dml(TypeDml.INSERT, {
                "encomenda_num": v['SOHNUM_0'],
                "artigo_cod": v['ITMREF_0'],
                "cliente_cod": v['BPCORD_0'],
                "ordemfabrico_id": id,
                "created": datetime.now(),
                "updated": datetime.now(),
                "user_create_id": request.user.id
            }, "planeamento_ordemfabricoartigos")
            dbgw.execute(dml.statement, cursor, dml.parameters)

    with connection.cursor() as cursor:
        exists = checkIfExistsRelationArtigos(data, cursor).exists
        if not exists:
            upsertArtigos(data, cursor)
            id = insertOrdemFabrico(data, cursor)
            relationOrdemFabrico(id, data, cursor)
            return Response({"status": "success", "id":id, "title": "A Ordem de Fabrico foi Criada com Sucesso!", "subTitle":f'Número da Ordem de Fabrico {id}'})
    return Response({"status": "error", "title": "Alguns artigos selecionados já se encontram associados a uma ordem de Fabrico!"})


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def NonWovenLookup(request, format=None):
    conn = connections[connGatewayName].cursor()
    cols = ['"ITMREF_0"','"ITMDES1_0"','"ZFAMILIA_0"','"ZSUBFAMILIA_0"']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'cod = :cod', True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = dbgw.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    response = db.executeSimpleList(lambda: (
        f"""
            select 
            {dql.columns}
            from "SAGE-PROD"."ITMMASTER" mprima
            where 
            "ACCCOD_0" = 'PT_MATPRIM' and 
            ("ZFAMILIA_0" IN ('NWSL','NONW','NWSB','NWBC','NWBI') or
            "ZSUBFAMILIA_0" IN ('0022','0025'))
            {dql.sort}
        """
    ), conn, parameters)
    return Response(response)

def statusFilter(v):
    print(f'------>FILTERPG{v}')
    return True



@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def PaletizacaoGet(request, format=None):
    conn = connections[connGatewayName].cursor()
    cols = ['*']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'pp.cliente_cod = :clientecod', True)
    f.add(f'pp.artigo_cod = :artigocod',True)
    f.add(f'pp.contentor_id = :contentorid',True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = dbgw.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    response = db.executeSimpleList(lambda: (
        f"""SELECT {dql.columns} 
            from 
            "SGP-DEV".producao_paletizacao pp
            join "SGP-DEV".producao_paletizacaodetails ppd on ppd.paletizacao_id = pp.id
            {f.text} 
            order by ppd.item_order    
            {dql.limit}
        """
    ), conn, parameters)
    return Response(response)




@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def OFArtigosList(request, format=None):
    cols = ['ofa.id as ofaid','itm."ITMDES1_0"','enclin."ORIQTY_0"', 'enc."BPCNAM_0"', 'itmd.*']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'"of".id = :id', True)
    f.value("and")
    parameters = {**f.parameters}
    dql = dbgw.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    response = dbgw.executeSimpleList(lambda: (
        f"""
            SELECT {dql.columns} 
            FROM planeamento_ordemfabrico as "of"
            JOIN planeamento_ordemfabricoartigos as ofa on ofa.ordemfabrico_id = "of".id
            JOIN producao_artigodetails as itmd on ofa.artigo_cod = itmd.cod
            JOIN "SAGE"."ITMMASTER" as itm on itmd.cod = itm."ITMREF_0"
            JOIN "SAGE"."SORDER" as enc on enc."SOHNUM_0" = ofa.encomenda_num
            JOIN "SAGE"."SORDERQ" as enclin on ofa.encomenda_num = enclin."SOHNUM_0" and ofa.artigo_cod = enclin."ITMREF_0" 
            {f.text} 
            {dql.sort}
        """
    ), connection, parameters)
    return Response(response)





#END NEW API METHODS




class PaleteListAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Palete.objects.all().order_by('-data_pal', '-num')[:100]
    serializer_class = PaleteListSerializer

class PaleteListHistoricoAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Palete.objects.all().order_by('-data_pal', '-num')
    serializer_class = PaleteListSerializer

class PaleteDetailAPIView(LoginRequiredMixin, RetrieveAPIView):
    queryset = Palete.objects.all()
    serializer_class = PaleteDetailSerializer

class ClienteDetailAPIView(LoginRequiredMixin, RetrieveAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class BobineDetailAPIView(LoginRequiredMixin, RetrieveAPIView):
    queryset = Bobine.objects.all()
    serializer_class = BobineSerializer

class BobineListAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Bobine.objects.filter()
    serializer_class = BobineSerializer

class BobineListAllAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Bobine.objects.filter()
    serializer_class = BobineListAllSerializer

class BobineList(LoginRequiredMixin, APIView):
    
    def get(self, request, pk, format=None):
        bobine = Bobine.objects.filter(palete=pk)
        serializer = BobineSerializer(bobine, many=True)
        return Response(serializer.data)
        

class EmendaListAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Emenda.objects.all()
    serializer_class = EmendaSerializer


class EmendaCreateAPIView(LoginRequiredMixin, CreateAPIView):
    queryset = Emenda.objects.all()
    serializer_class = EmendaCreateSerializer

class BobinagemListAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Bobinagem.objects.all().order_by('-data', '-fim')[:200]
    serializer_class = BobinagemListSerializer

class BobinagemListHistoricoAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Bobinagem.objects.all().order_by('-data', '-fim')
    serializer_class = BobinagemListSerializer

class BobinesBobinagemAPIView(LoginRequiredMixin, APIView):
    
    def get(self, request, pk, format=None):
        bobinagem = Bobinagem.objects.get(pk=pk)
        bobine = Bobine.objects.filter(bobinagem=bobinagem)
        serializer = BobinagemBobinesSerializer(bobine, many=True)
        return Response(serializer.data)

class PaleteDmAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Palete.objects.filter(estado='DM')
    serializer_class = PaleteDmSerializer
    
class PaleteDmBobinesAPIView(LoginRequiredMixin, APIView):
    def get(self, request, pk, format=None):
        palete = Palete.objects.get(pk=pk)
        bobines = Bobine.objects.filter(palete=palete).order_by('posicao_palete')
        serializer = BobinesPaleteDmSerializer(bobines, many=True)
        return Response(serializer.data)



class BobineListDmAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Bobine.objects.filter(estado='DM')
    serializer_class = BobinesDmSerializer

class BobinagemCreateDmAPIView(LoginRequiredMixin, CreateAPIView):
    queryset = Bobinagem.objects.all()
    serializer_class = BobinagemCreateSerializer

class BobinagemListDmAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Bobinagem.objects.filter(perfil__retrabalho=True)
    serializer_class = BobinagemListSerializer

class EncomendaListAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Encomenda.objects.filter()
    serializer_class = EncomendaListSerializer

class CargaListAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Carga.objects.filter()
    serializer_class = CargaListSerializer

class CargaDetailAPIView(LoginRequiredMixin, RetrieveAPIView):
    queryset = Carga.objects.all()
    serializer_class = CargaDetailSerializer

class EncomendaCargaAPIView(LoginRequiredMixin, APIView):
    def get(self, request, pk, format=None):
        enc = Encomenda.objects.get(pk=pk)
        cargas = Carga.objects.filter(enc=enc)
        serializer = CargasEncomendaSerializer(cargas, many=True)
        return Response(serializer.data)

class CargaPaletesAPIView(LoginRequiredMixin, APIView):
    def get(self, request, pk, format=None):
        carga = Carga.objects.get(pk=pk)
        paletes = Palete.objects.filter(carga=carga).order_by('num_palete_carga')
        serializer = PaletesCargaSerializer(paletes, many=True)
        return Response(serializer.data)

class StockListAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Palete.objects.filter(stock=True)
    serializer_class = PaleteListSerializer

class PaleteListStockAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Palete.objects.filter(stock=True)
    serializer_class = PaleteStockSerializer

class ArtigoDetailAPIView(LoginRequiredMixin, RetrieveAPIView):
    queryset = Artigo.objects.all()
    serializer_class = ArtigoDetailSerializer
    
class ClienteListAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class ArtigoListAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Artigo.objects.all()
    serializer_class = ArtigoDetailSerializer

