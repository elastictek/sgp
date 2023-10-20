import base64
from operator import eq
from pyexpat import features
import re
from typing import List
from wsgiref.util import FileWrapper
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView
from rest_framework.views import APIView
from django.http import Http404, request
from rest_framework.response import Response
from django.http.response import HttpResponse
from django.http import FileResponse
from producao.models import Artigo, Palete, Bobine, Emenda, Bobinagem, Cliente, Encomenda, Carga
from .serializers import ArtigoDetailSerializer, PaleteStockSerializer, PaleteListSerializer, PaleteDetailSerializer, CargaListSerializer, PaletesCargaSerializer, CargasEncomendaSerializer, CargaDetailSerializer, BobineSerializer, EncomendaListSerializer, BobinagemCreateSerializer, BobinesDmSerializer, BobinesPaleteDmSerializer, EmendaSerializer, EmendaCreateSerializer, BobinagemListSerializer, BobineListAllSerializer, ClienteSerializer, BobinagemBobinesSerializer, PaleteDmSerializer
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import status
import mimetypes
from datetime import datetime,date, timedelta
# import cups
import os, tempfile

from pyodbc import Cursor, Error, connect, lowercase
from datetime import datetime
from django.http.response import JsonResponse
from rest_framework.decorators import api_view, authentication_classes, permission_classes, renderer_classes
from django.db import connections, transaction
from support.database import encloseColumn, Filters, DBSql, TypeDml, fetchall, Check
from support.myUtils import  ifNull,delKeys

from rest_framework.renderers import JSONRenderer, MultiPartRenderer, BaseRenderer
from rest_framework.utils import encoders, json
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
import collections
import hmac
import hashlib
import math
from django.core.files.storage import FileSystemStorage
from sistema.settings.appSettings import AppSettings
import time
import requests
import psycopg2
from decimal import Decimal
from producao.api.exports import export

connGatewayName = "postgres"
connMssqlName = "sqlserver"
dbgw = DBSql(connections[connGatewayName].alias)
db = DBSql(connections["default"].alias)
dbmssql = DBSql(connections[connMssqlName].alias)

@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def download_file(request):
    f = request.GET['f'] #file path
    i = request.GET['i'] #Id
    t = request.GET['f'] #type
    dt = datetime.now().strftime("%Y%m%d-%H%M%S")
    fs = FileSystemStorage()
    path = fs.open(f,'rb')

    # # Define text file name
    filename = f'{t.replace(" ",".")}_{str(i)}_{dt}'
    mime_type, _ = mimetypes.guess_type(f)
    print(mime_type)
    # # Set the return value of the HttpResponse
    response =  FileResponse(path, content_type=mime_type)
    # # Set the HTTP header for sending to browser
    response['Content-Disposition'] = "inline; filename=%s" % filename
    return response

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
                table = f'{mainValue.get("table")}.' if (mainValue.get("table") and encloseColumns) else mainValue.get("table", '')
                field = f'{table}"{key}"' if encloseColumns else f'{table}{key}'
                sp[key] = {"value": data.get(mainKey).lower(), "field": f'lower({field})'}
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


def rangeP(data, key, field, fieldDiff=None,pName=None):
    ret = {}
    if data is None:
        return ret
    if isinstance(key, list):
        hasNone = False
        for i, v in enumerate(data):
            if v is not None:
                ret[f'{pName}{key[i]}_{i}'] = {"key": key[i], "value": v, "field": field}
            else:
                hasNone = True
        if hasNone == False and len(data)==2 and fieldDiff is not None:
            ret[f'{pName}{key[0]}_{key[1]}'] = {"key": key, "value": ">=0", "field": fieldDiff}
    else:    
        for i, v in enumerate(data):
            if v is not None:
                ret[f'{pName}{key}_{i}'] = {"key": key, "value": v, "field": field}
    return ret

def rangeP2(data, key, field1, field2, fieldDiff=None):
    ret = {}
    field=False
    if data is None:
        return ret
    if isinstance(key, list):
        hasNone = False
        for i, v in enumerate(data):
            if v is not None:
                ret[f'{key[i]}_{i}'] = {"key": key[i], "value": v, "field": field1 if field is False else field2}
            else:
                hasNone = True
        if hasNone == False and len(data)==2 and fieldDiff is not None:
            ret[f'{key[0]}_{key[1]}'] = {"key": key, "value": ">=0", "field": fieldDiff}
    else:    
        for i, v in enumerate(data):
            if v is not None:
                ret[f'{key}_{i}'] = {"key": key, "value": v, "field": field1 if field is False else field2}
    return ret

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def Sql(request, format=None):
    try:
        if "parameters" in request.data and "method" in request.data["parameters"]:
            method=request.data["parameters"]["method"]
            func = globals()[method]
            response = func(request, format)
            return response
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response({})

def updateMaterializedView(mv):
    conngw = connections[connGatewayName]
    cgw = conngw.cursor()
    cgw.execute(f"REFRESH MATERIALIZED VIEW public.{mv};")
    conngw.commit()

def CreateCarga(request, format=None):
    data = request.data.get("parameters")

    def checkOrder(eef):
        c = connections[connGatewayName].cursor()
        f = Filters({"eef":eef})
        f.where(False,"and")
        f.value("and")
        response = dbgw.executeSimpleList(lambda: (f"""select id from mv_openorders oo where oo.status_enc=1 {f.text}"""), c, f.parameters)
        if len(response["rows"])>0:
            return response["rows"][0]
        return None

    try:
        open = checkOrder(data.get("values").get("eef"))
        if not open or open is None:
            return Response({"status": "error", "title": "A encomenda já se encontra fechada!"})
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                data.get("values")["artigos"] = json.dumps(data.get("values").get("artigos"), ensure_ascii=False)
                args = [*[value for value in data.get("values").values()],request.user.id]
                print(data)
                print(args)
                cursor.callproc('create_carga',args)
                rows = fetchall(cursor)
                updateMaterializedView("mv_cargas")
                #row = cursor.fetchone()
                #cursor.execute("select * from tmp_paletecheck_report;")
                #report = fetchall(cursor)
        return Response({"status": "success", "data":rows, "title":None})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})


def CargasLookup(request, format=None):
    cols = ['*']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'carga.eef = :enc', lambda v:(v!=None))
    f.add(f'carga.eef = :feef', lambda v:(v!=None))
    f.add(f'carga.prf = :fprf', lambda v:(v!=None))
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                select distinct * from(
                    select 
                    carga.*,
                    case when p.id is null then 0 else count(*) over (partition by carga.id) end npaletes,
                    sum(p.nbobines_emendas) over (partition by carga.id) nbobines_emendas,
                    sum(p.nbobines_real) over (partition by carga.id) nbobines_real,
                    IFNULL(sum(case when p.nbobines_real = 0 then 0 else p.nbobines_emendas/p.nbobines_real end) over (partition by carga.id),0) perc_nbobines_emendas,
                    sum(p.area_real) over (partition by carga.id) area_real
                    from producao_carga carga
                    left join producao_palete p on p.carga_id=carga.id
                    {f.text}
                ) t
                {dql.sort}
            """
        ), cursor, parameters)
        return Response(response)

def CargasList(request, format=None):
    connection = connections[connGatewayName].cursor()
    print("filter")
    print(request.data['filter'])
    f = Filters(request.data['filter'])
    f.setParameters({
        "expedicao": {"value": lambda v: Filters.getNumeric(v.get('fdispatched')), "field": lambda k, v: f'me.{k}'},
    #    **rangeP(f.filterData.get('fdata'), 'timestamp', lambda k, v: f'DATE(timestamp)'),
    #    **rangeP(f.filterData.get('fdatain'), 'in_t', lambda k, v: f'DATE(in_t)'),
    #    **rangeP(f.filterData.get('fdataout'), 'out_t', lambda k, v: f'DATE(out_t)'),
    #    "diff": {"value": lambda v: '>0' if "fdataout" in v and v.get("fdataout") is not None else None, "field": lambda k, v: f'TIMESTAMPDIFF(second,in_t,out_t)'},
    #    "nome": {"value": lambda v: v.get('flote').lower() if v.get('flote') is not None else None, "field": lambda k, v: f'lower(sgppl.{k})'},
    #    "carga": {"value": lambda v: v.get('fcarganome').lower() if v.get('fcarganome') is not None else None, "field": lambda k, v: f'lower(sgppl.{k})'},
    #    "nbobines_real": {"value": lambda v: Filters.getNumeric(v.get('fnbobinesreal')), "field": lambda k, v: f'sgppl.{k}'},
    #    "nbobines_emendas": {"value": lambda v: Filters.getNumeric(v.get('fnbobines_emendas')), "field": lambda k, v: f'sgppl.{k}'},
    #    "nbobines_sem_destino": {"value": lambda v: Filters.getNumeric(v.get('fnbobines_sem_destino')), "field": lambda k, v: f'sgppl.{k}'},
    #    "lar": {"value": lambda v: Filters.getNumeric(v.get('flargura')), "field": lambda k, v: f"j->>'{k}'"},
    #    "area_real": {"value": lambda v: Filters.getNumeric(v.get('farea')), "field": lambda k, v: f'sgppl.{k}'},
    #    "comp_real": {"value": lambda v: Filters.getNumeric(v.get('fcomp')), "field": lambda k, v: f'sgppl.{k}'},
    #    "mes": {"value": lambda v: Filters.getNumeric(v.get('fmes')), "field": lambda k, v: f'mv.{k}'},
    #    "disabled": {"value": lambda v: Filters.getNumeric(v.get('fdisabled')), "field": lambda k, v: f'sgppl.{k}'},
    #    "ano": {"value": lambda v: Filters.getNumeric(v.get('fano')), "field": lambda k, v: f'mv.{k}'},
    #    "diam_avg": {"value": lambda v: Filters.getNumeric(v.get('fdiam_avg')), "field": lambda k, v: f'sgppl.{k}'},
    #    "diam_max": {"value": lambda v: Filters.getNumeric(v.get('fdiam_max')), "field": lambda k, v: f'sgppl.{k}'},
    #    "diam_min": {"value": lambda v: Filters.getNumeric(v.get('fdiam_min')), "field": lambda k, v: f'sgppl.{k}'},
    #    "destino": {"value": lambda v: v.get('fdestinoold').lower() if v.get('fdestinoold') is not None else None, "field": lambda k, v: f'lower(sgppl.{k})'},
    #    "peso_bruto": {"value": lambda v: Filters.getNumeric(v.get('fpeso_bruto')), "field": lambda k, v: f'sgppl.{k}'},
    #    "peso_liquido": {"value": lambda v: Filters.getNumeric(v.get('fpeso_liquido')), "field": lambda k, v: f'sgppl.{k}'},
    #    "carga_id": {"value": lambda v: v.get('fcarga'), "field": lambda k, v: f'sgppl.{k}'},
    #    "nok":{"value": lambda v: Filters.getNumeric(v.get('fnok')), "field": lambda k, v: f'{k}'},
    #    "nok_estados":{"value": lambda v: Filters.getNumeric(v.get('fnok_estados')), "field": lambda k, v: f'{k}'},
    #    "cliente_nome": {"value": lambda v: v.get('fcliente').lower() if v.get('fcliente') is not None else None, "field": lambda k, v: f'lower(sgppl."{k}")'},
    #    "ofid": {"value": lambda v: v.get('fof').upper() if v.get('fof') is not None else None, "field": lambda k, v: f'sgppl."{k}"'},
    #    "ISSDHNUM_0": {"value": lambda v: v.get('fdispatched'), "field": lambda k, v: f' mv."SDHNUM_0"'},
    #    "SDHNUM_0": {"value": lambda v: v.get('fsdh').lower() if v.get('fsdh') is not None else None, "field": lambda k, v: f'lower(mv."SDHNUM_0")'},
    #    "BPCNAM_0": {"value": lambda v: v.get('fclienteexp').lower() if v.get('fclienteexp') is not None else None, "field": lambda k, v: f'lower(mv."{k}")'},
    #    "EECICT_0": {"value": lambda v: v.get('feec').lower() if v.get('feec') is not None else None, "field": lambda k, v: f'lower(mv."{k}")'},
       
    #    "matricula": {"value": lambda v: v.get('fmatricula').lower() if v.get('fmatricula') is not None else None, "field": lambda k, v: f'lower(mol.{k})'},
    #    "matricula_reboque": {"value": lambda v: v.get('fmatricula_reboque').lower() if v.get('fmatricula_reboque') is not None else None, "field": lambda k, v: f'lower(mol.{k})'},
    #    "prf": {"value": lambda v: v.get('fprf').lower() if v.get('fprf') is not None else None, "field": lambda k, v: f'lower(mol.{k})'},
    #    "iorder": {"value": lambda v: v.get('forder').lower() if v.get('forder') is not None else None, "field": lambda k, v: f'lower(mol.{k})'},


       #mv."BPCNAM_0",mv."ITMREF_0",mv."ITMDES1_0",mv."EECICT_0"

    #    "fof": {"value": lambda v: v.get('fof')},
    #    "vcr_num": {"value": lambda v: v.get('fvcr')},
    #    "qty_lote": {"value": lambda v: v.get('fqty'), "field": lambda k, v: f'{k}'},
    #    "qty_reminder": {"value": lambda v: v.get('fqty_reminder'), "field": lambda k, v: f'{k}'},
    #    "type_mov": {"value": lambda v: v.get('ftype_mov'), "field": lambda k, v: f'{k}'}
    }, True)
    f.where()
    f.auto()
    f.value()

    parameters = {**f.parameters}
    dql = dbgw.dql(request.data, False,False)
    cols = f"""*"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""            
        with expedicoes as(
            select distinct on(me."LOT_0") me.* 
            from mv_expedicoes me
        )  
        select {c(f'{dql.columns}')} from(
            select 
            distinct on(mc.id) mc.*,
            me.expedicao,me."IPTDAT_0" data_expedicao,
            case when mp.id is null then 0 else count(*) over (partition by mc.id) end npaletes,
            sum(mp.nbobines_emendas) over (partition by mc.id) nbobines_emendas,
            sum(mp.nbobines_real) over (partition by mc.id) nbobines_real,
            coalesce(sum(case when mp.nbobines_real = 0 then 0 else mp.nbobines_emendas/mp.nbobines_real end) over (partition by mc.id),0) perc_nbobines_emendas,
            sum(mp.area_real) over (partition by mc.id) area_real
            from mv_cargas mc
            left join mv_paletes mp on mp.carga_id=mc.id
            left join expedicoes me on me.carga_id = mc.id and me."LOT_0" = mp.nome
            {f.text}
        ) t 
        {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["gw"],dbi=dbgw,conn=connection)
    try:
        response = dbgw.executeList(sql, connection, parameters,[],None,None)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def OpenOrdersList(request, format=None):
    connection = connections[connGatewayName].cursor()
    print("filter")
    print(request.data['filter'])
    f = Filters(request.data['filter'])
    
    f.setParameters({
        "prf": {"value": lambda v: Filters.getLower(v.get('fprf')), "field": lambda k, v: f'lower(oo.{k})'},
        "eef": {"value": lambda v: Filters.getLower(v.get('feef')), "field": lambda k, v: f'lower(oo.{k})'},
        "cliente": {"value": lambda v: Filters.getLower(v.get('fcliente')), "field": lambda k, v: f'lower(oo.{k})'},
    #    "expedicao": {"value": lambda v: Filters.getNumeric(v.get('fdispatched')), "field": lambda k, v: f'me.{k}'},
    #    **rangeP(f.filterData.get('fdata'), 'timestamp', lambda k, v: f'DATE(timestamp)'),
    #    **rangeP(f.filterData.get('fdatain'), 'in_t', lambda k, v: f'DATE(in_t)'),
    #    **rangeP(f.filterData.get('fdataout'), 'out_t', lambda k, v: f'DATE(out_t)'),
    #    "diff": {"value": lambda v: '>0' if "fdataout" in v and v.get("fdataout") is not None else None, "field": lambda k, v: f'TIMESTAMPDIFF(second,in_t,out_t)'},
    #    "nome": {"value": lambda v: v.get('flote').lower() if v.get('flote') is not None else None, "field": lambda k, v: f'lower(sgppl.{k})'},
    #    "carga": {"value": lambda v: v.get('fcarganome').lower() if v.get('fcarganome') is not None else None, "field": lambda k, v: f'lower(sgppl.{k})'},
    #    "nbobines_real": {"value": lambda v: Filters.getNumeric(v.get('fnbobinesreal')), "field": lambda k, v: f'sgppl.{k}'},
    #    "nbobines_emendas": {"value": lambda v: Filters.getNumeric(v.get('fnbobines_emendas')), "field": lambda k, v: f'sgppl.{k}'},
    #    "nbobines_sem_destino": {"value": lambda v: Filters.getNumeric(v.get('fnbobines_sem_destino')), "field": lambda k, v: f'sgppl.{k}'},
    #    "lar": {"value": lambda v: Filters.getNumeric(v.get('flargura')), "field": lambda k, v: f"j->>'{k}'"},
    #    "area_real": {"value": lambda v: Filters.getNumeric(v.get('farea')), "field": lambda k, v: f'sgppl.{k}'},
    #    "comp_real": {"value": lambda v: Filters.getNumeric(v.get('fcomp')), "field": lambda k, v: f'sgppl.{k}'},
    #    "mes": {"value": lambda v: Filters.getNumeric(v.get('fmes')), "field": lambda k, v: f'mv.{k}'},
    #    "disabled": {"value": lambda v: Filters.getNumeric(v.get('fdisabled')), "field": lambda k, v: f'sgppl.{k}'},
    #    "ano": {"value": lambda v: Filters.getNumeric(v.get('fano')), "field": lambda k, v: f'mv.{k}'},
    #    "diam_avg": {"value": lambda v: Filters.getNumeric(v.get('fdiam_avg')), "field": lambda k, v: f'sgppl.{k}'},
    #    "diam_max": {"value": lambda v: Filters.getNumeric(v.get('fdiam_max')), "field": lambda k, v: f'sgppl.{k}'},
    #    "diam_min": {"value": lambda v: Filters.getNumeric(v.get('fdiam_min')), "field": lambda k, v: f'sgppl.{k}'},
    #    "destino": {"value": lambda v: v.get('fdestinoold').lower() if v.get('fdestinoold') is not None else None, "field": lambda k, v: f'lower(sgppl.{k})'},
    #    "peso_bruto": {"value": lambda v: Filters.getNumeric(v.get('fpeso_bruto')), "field": lambda k, v: f'sgppl.{k}'},
    #    "peso_liquido": {"value": lambda v: Filters.getNumeric(v.get('fpeso_liquido')), "field": lambda k, v: f'sgppl.{k}'},
    #    "carga_id": {"value": lambda v: v.get('fcarga'), "field": lambda k, v: f'sgppl.{k}'},
    #    "nok":{"value": lambda v: Filters.getNumeric(v.get('fnok')), "field": lambda k, v: f'{k}'},
    #    "nok_estados":{"value": lambda v: Filters.getNumeric(v.get('fnok_estados')), "field": lambda k, v: f'{k}'},
    #    "cliente_nome": {"value": lambda v: v.get('fcliente').lower() if v.get('fcliente') is not None else None, "field": lambda k, v: f'lower(sgppl."{k}")'},
    #    "ofid": {"value": lambda v: v.get('fof').upper() if v.get('fof') is not None else None, "field": lambda k, v: f'sgppl."{k}"'},
    #    "ISSDHNUM_0": {"value": lambda v: v.get('fdispatched'), "field": lambda k, v: f' mv."SDHNUM_0"'},
    #    "SDHNUM_0": {"value": lambda v: v.get('fsdh').lower() if v.get('fsdh') is not None else None, "field": lambda k, v: f'lower(mv."SDHNUM_0")'},
    #    "BPCNAM_0": {"value": lambda v: v.get('fclienteexp').lower() if v.get('fclienteexp') is not None else None, "field": lambda k, v: f'lower(mv."{k}")'},
    #    "EECICT_0": {"value": lambda v: v.get('feec').lower() if v.get('feec') is not None else None, "field": lambda k, v: f'lower(mv."{k}")'},
       
    #    "matricula": {"value": lambda v: v.get('fmatricula').lower() if v.get('fmatricula') is not None else None, "field": lambda k, v: f'lower(mol.{k})'},
    #    "matricula_reboque": {"value": lambda v: v.get('fmatricula_reboque').lower() if v.get('fmatricula_reboque') is not None else None, "field": lambda k, v: f'lower(mol.{k})'},
    #    "prf": {"value": lambda v: v.get('fprf').lower() if v.get('fprf') is not None else None, "field": lambda k, v: f'lower(mol.{k})'},
    #    "iorder": {"value": lambda v: v.get('forder').lower() if v.get('forder') is not None else None, "field": lambda k, v: f'lower(mol.{k})'},


       #mv."BPCNAM_0",mv."ITMREF_0",mv."ITMDES1_0",mv."EECICT_0"

    #    "fof": {"value": lambda v: v.get('fof')},
    #    "vcr_num": {"value": lambda v: v.get('fvcr')},
    #    "qty_lote": {"value": lambda v: v.get('fqty'), "field": lambda k, v: f'{k}'},
    #    "qty_reminder": {"value": lambda v: v.get('fqty_reminder'), "field": lambda k, v: f'{k}'},
    #    "type_mov": {"value": lambda v: v.get('ftype_mov'), "field": lambda k, v: f'{k}'}
    }, True)
    f.where(False,"and")
    f.auto()
    f.value()

    parameters = {**f.parameters}
    dql = dbgw.dql(request.data, False,False)
    cols = f"""*"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""            
            select {c(f'{dql.columns}')} from (
            select distinct on(eef,prf) id,data_create,data_expedicao,eef,prf,cliente,cliente_abr,
            json_agg(json_build_object('artigo_cod',artigo_cod,'artigo_des',artigo_des,'n_paletes_total',n_paletes_total,'qtd',qtd)) over (partition by eef,prf) details
            from mv_openorders oo 
            where oo.status_enc=1 {f.text}
            ) t
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["gw"],dbi=dbgw,conn=connection)
    try:
        response = dbgw.executeList(sql, connection, parameters,[],None,None)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)