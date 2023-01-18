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
from datetime import datetime, timedelta
# import cups
import os, tempfile

from pyodbc import Cursor, Error, connect, lowercase
from datetime import datetime
from django.http.response import JsonResponse
from rest_framework.decorators import api_view, authentication_classes, permission_classes, renderer_classes
from django.db import connections, transaction
from support.database import encloseColumn, Filters, DBSql, TypeDml, fetchall, Check
from support.myUtils import  ifNull

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

def export(sql, db_parameters, parameters,conn_name):
    if ("export" in parameters and parameters["export"] is not None):
        dbparams={}
        for key, value in db_parameters.items():
            if f"%({key})s" not in sql: 
                continue
            dbparams[key] = value
            sql = sql.replace(f"%({key})s",f":{key}")
        hash = base64.b64encode(hmac.new(bytes("SA;PA#Jct\"#f.+%UxT[vf5B)XW`mssr$" , 'utf-8'), msg = bytes(sql , 'utf-8'), digestmod = hashlib.sha256).hexdigest().upper().encode()).decode()
        req = {
            
            "conn-name":conn_name,
            "sql":sql,
            "hash":hash,
            "data":dbparams,
            **parameters
        }
        wService = "runxlslist" if parameters["export"] == "clean-excel" else "runlist"
        fstream = requests.post(f'http://192.168.0.16:8080/ReportsGW/{wService}', json=req)

        if (fstream.status_code==200):
            resp =  HttpResponse(fstream.content, content_type=fstream.headers["Content-Type"])
            if (parameters["export"] == "pdf"):
                resp['Content-Disposition'] = "inline; filename=list.pdf"
            elif (parameters["export"] == "excel"):
                resp['Content-Disposition'] = "inline; filename=list.xlsx"
            elif (parameters["export"] == "word"):
                resp['Content-Disposition'] = "inline; filename=list.docx"
            if (parameters["export"] == "csv"):
                resp['Content-Disposition'] = "inline; filename=list.csv"
            return resp




def inProduction(data,cursor):
        response = db.executeSimpleList(lambda: (
            f"""
                select 
                    `id`,`gamaoperatoria`,`nonwovens`,`artigospecs`,`cortes`,`cortesordem`,`cores`,`paletizacao`,`emendas`,`ofs`,`paletesstock`,
                    `status`,`observacoes`,`start_prev_date`,`end_prev_date`,`horas_previstas_producao`,`sentido_enrolamento`,`amostragem`,`type_op`,
                    `timestamp`,`action`,`contextid`,`agg_of_id`,`user_id`,`gsm`,`produto_id`,`produto_cod`,`lotes`,`dosers`,`created`,`limites`,
                    `ofs_ordem`,`end_date`,`start_date`,`ignore_audit`,`formulacaov2` formulacao, mx_id
                 from
                (
                SELECT acs.*, max(acs.id) over () mx_id 
                from producao_currentsettings cs
                join audit_currentsettings acs on cs.id=acs.contextid
                where cs.status=3
                ) t
                where id=mx_id
            """
        ), cursor, {})
        if len(response["rows"])>0:
            return response["rows"][0]
        return None


@api_view(['POST'])
@renderer_classes([JSONRenderer])
#@authentication_classes([SessionAuthentication])
#@permission_classes([IsAuthenticated])
def PaletesSql(request, format=None):
    if "parameters" in request.data and "method" in request.data["parameters"]:
        method=request.data["parameters"]["method"]
        func = globals()[method]
        response = func(request, format)
        return response
    return Response({})

def PaletesList(request, format=None):
    connection = connections[connGatewayName].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({
        **rangeP(f.filterData.get('fdata'), 'timestamp', lambda k, v: f'DATE(timestamp)'),
    #    **rangeP(f.filterData.get('fdatain'), 'in_t', lambda k, v: f'DATE(in_t)'),
    #    **rangeP(f.filterData.get('fdataout'), 'out_t', lambda k, v: f'DATE(out_t)'),
    #    "diff": {"value": lambda v: '>0' if "fdataout" in v and v.get("fdataout") is not None else None, "field": lambda k, v: f'TIMESTAMPDIFF(second,in_t,out_t)'},
        "nome": {"value": lambda v: v.get('flote').lower() if v.get('flote') is not None else None, "field": lambda k, v: f'lower(sgppl.{k})'},
        "carga": {"value": lambda v: v.get('fcarganome').lower() if v.get('fcarganome') is not None else None, "field": lambda k, v: f'lower(sgppl.{k})'},
        "nbobines_real": {"value": lambda v: Filters.getNumeric(v.get('fnbobinesreal')), "field": lambda k, v: f'sgppl.{k}'},
        "lar": {"value": lambda v: Filters.getNumeric(v.get('flargura')), "field": lambda k, v: f"j->>'{k}'"},
        "area_real": {"value": lambda v: Filters.getNumeric(v.get('farea')), "field": lambda k, v: f'sgppl.{k}'},
        "comp_real": {"value": lambda v: Filters.getNumeric(v.get('fcomp')), "field": lambda k, v: f'sgppl.{k}'},
        "mes": {"value": lambda v: Filters.getNumeric(v.get('fmes')), "field": lambda k, v: f'mv.{k}'},
        "disabled": {"value": lambda v: Filters.getNumeric(v.get('fdisabled')), "field": lambda k, v: f'sgppl.{k}'},
        "ano": {"value": lambda v: Filters.getNumeric(v.get('fano')), "field": lambda k, v: f'mv.{k}'},
        "diam_avg": {"value": lambda v: Filters.getNumeric(v.get('fdiam_avg')), "field": lambda k, v: f'sgppl.{k}'},
        "diam_max": {"value": lambda v: Filters.getNumeric(v.get('fdiam_max')), "field": lambda k, v: f'sgppl.{k}'},
        "diam_min": {"value": lambda v: Filters.getNumeric(v.get('fdiam_min')), "field": lambda k, v: f'sgppl.{k}'},
        "destino": {"value": lambda v: v.get('fdestinoold').lower() if v.get('fdestinoold') is not None else None, "field": lambda k, v: f'lower(sgppl.{k})'},
        "peso_bruto": {"value": lambda v: Filters.getNumeric(v.get('fpeso_bruto')), "field": lambda k, v: f'sgppl.{k}'},
        "peso_liquido": {"value": lambda v: Filters.getNumeric(v.get('fpeso_liquido')), "field": lambda k, v: f'sgppl.{k}'},
        "carga_id": {"value": lambda v: v.get('fcarga'), "field": lambda k, v: f'sgppl.{k}'},
        "ISSDHNUM_0": {"value": lambda v: v.get('fdispatched'), "field": lambda k, v: f' mv."SDHNUM_0"'},
        "SDHNUM_0": {"value": lambda v: v.get('fsdh').lower() if v.get('fsdh') is not None else None, "field": lambda k, v: f'lower(mv."SDHNUM_0")'},
        "BPCNAM_0": {"value": lambda v: v.get('fclienteexp').lower() if v.get('fclienteexp') is not None else None, "field": lambda k, v: f'lower(mv."{k}")'},
        "EECICT_0": {"value": lambda v: v.get('feec').lower() if v.get('feec') is not None else None, "field": lambda k, v: f'lower(mv."{k}")'},
       


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

    fartigo = filterMulti(request.data['filter'], {
        'fartigo': {"keys": ["'cod'", "'des'"], "table": 'j->>'},
        'fartigoexp': {"keys": ['"ITMREF_0"', '"ITMDES1_0"'], "table": 'mv.'},
    }, False, "and" if f.hasFilters else "and" ,False)

    def filterMultiSelectJson(data,name,field,alias):
        f = Filters(data)
        fP = {}
        if name in data:
            dt = [o['value'] for o in data[name]]       
            value = 'in:' + ','.join(f"{w}" for w in dt)
            fP['estado'] = {"key": field, "value": value, "field": lambda k, v: f"{alias}->>'{k}'"}
        f.setParameters({**fP}, True)
        f.auto()
        f.where(False, "and")
        f.value()
        return f
    festados = filterMultiSelectJson(request.data['filter'],'festados','estado','j')

    fbobinemulti = filterMulti(request.data['filter'], {
        'flotenw': {"keys": ['lotenwinf', 'lotenwsup'], "table": 'mb.'},
        'ftiponw': {"keys": ['tiponwinf', 'tiponwsup'], "table": 'mb.'},
        'fbobine': {"keys": ['nome'], "table": 'mb.'},
    }, False, "and" if f.hasFilters else "and" ,False)
    # fbobine = Filters(request.data['filter'])
    # fbobine.setParameters({"bobinenome": {"value": lambda v: v.get('fbobine'), "field": lambda k, v: f'nome'}}, True)
    # fbobine.where()
    # fbobine.auto()
    # fbobine.value()
    fbobinemulti["text"] = f"""and exists (select 1 from mv_bobines mb where mb.palete_id=sgppl.id and mb.recycle=0 and mb.comp_actual>0 {fbobinemulti["text"].lstrip("where (").rstrip(")")}))""" if fbobinemulti["hasFilters"] else ""

    fartigompmulti = filterMulti(request.data['filter'], {
        'fartigo_mp': {"keys": ['matprima_cod', 'matprima_des'], "table": 'mcg.'},
        'flote_mp': {"keys": ['n_lote'], "table": 'mcg.'},
    }, False, "and" if f.hasFilters else "and" ,False)
    # fbobine = Filters(request.data['filter'])
    # fbobine.setParameters({"bobinenome": {"value": lambda v: v.get('fbobine'), "field": lambda k, v: f'nome'}}, True)
    # fbobine.where()
    # fbobine.auto()
    # fbobine.value()
    fartigompmulti["text"] = f""" and exists (select 1 from mv_bobines mb join mv_consumo_granulado mcg on mcg.ig_id = mb.ig_id where mb.palete_id=sgppl.id and mb.recycle=0 and mb.comp_actual>0 {fartigompmulti["text"].lstrip("where (").rstrip(")")}) limit 1) """ if fartigompmulti["hasFilters"] else ""
    #fartigompmulti["text"] = f"""and exists (select 1 from mv_bobines mb where mb.palete_id=sgppl.id {fartigompmulti["text"].lstrip("where (").rstrip(")")}))""" if fartigompmulti["hasFilters"] else ""



    parameters = {**f.parameters, **fartigo['parameters'], **festados.parameters, **fbobinemulti["parameters"], **fartigompmulti["parameters"]}
    dql = dbgw.dql(request.data, False)
    cols = f"""distinct on (sgppl.id) id, mv.STOCK_LOC,mv.STOCK_LOT,mv.STOCK_ITMREF,mv.STOCK_QTYPCU,mv."SDHNUM_0",mv."BPCNAM_0",mv."ITMREF_0",mv."ITMDES1_0",mv."EECICT_0",mv."IPTDAT_0",mv."VCRNUM_0",
                mv."VCRNUMORI_0",mv.mes,mv.ano,mv."BPRNUM_0",mv."VCRLINORI_0",mv."VCRSEQORI_0",
                sgppl."timestamp",sgppl.data_pal,sgppl.nome,sgppl.num,sgppl.estado,sgppl.area,sgppl.comp_total,
                sgppl.num_bobines,sgppl.diametro,sgppl.peso_bruto,sgppl.peso_palete,sgppl.peso_liquido,sgppl.cliente_id,
                sgppl.retrabalhada,sgppl.stock,sgppl.carga_id,sgppl.num_palete_carga,sgppl.destino,sgppl.ordem_id,sgppl.ordem_original,
                sgppl.ordem_original_stock,sgppl.num_palete_ordem,sgppl.draft_ordem_id,sgppl.ordem_id_original,sgppl.area_real,
                sgppl.comp_real,sgppl.diam_avg,sgppl.diam_max,sgppl.diam_min,sgppl.nbobines_real, sgppl.ofid_original, sgppl.ofid, sgppl.disabled,
                sgppl.cliente_nome,sgppl.artigo
            """
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""  
            select * from ( select {c(f'{dql.columns}')}
            FROM mv_paletes sgppl
            LEFT JOIN mv_pacabado_status mv on mv."LOT_0" = sgppl.nome
            cross join lateral json_array_elements ( sgppl.artigo ) as j
            WHERE nbobines_real>0 and (disabled=0 or mv."SDHNUM_0" is not null)
            {f.text} {fartigo["text"]} {festados.text} {fbobinemulti["text"]} {fartigompmulti["text"]}
            ) t
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["gw"])
    try:
        response = dbgw.executeList(sql, connection, parameters,[],None,None)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def PaletesLookup(request, format=None):
    connection = connections[connGatewayName].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({
    #    **rangeP(f.filterData.get('fdata'), 't_stamp', lambda k, v: f'DATE(t_stamp)'),
    #    **rangeP(f.filterData.get('fdatain'), 'in_t', lambda k, v: f'DATE(in_t)'),
    #    **rangeP(f.filterData.get('fdataout'), 'out_t', lambda k, v: f'DATE(out_t)'),
    #    "diff": {"value": lambda v: '>0' if "fdataout" in v and v.get("fdataout") is not None else None, "field": lambda k, v: f'TIMESTAMPDIFF(second,in_t,out_t)'},
    #    "n_lote": {"value": lambda v: v.get('flote'), "field": lambda k, v: f'{k}'},
    "id": {"value": lambda v: v.get('palete_id')},
    #    "vcr_num": {"value": lambda v: v.get('fvcr')},
    #    "qty_lote": {"value": lambda v: v.get('fqty'), "field": lambda k, v: f'{k}'},
    #    "qty_reminder": {"value": lambda v: v.get('fqty_reminder'), "field": lambda k, v: f'{k}'},
    #    "type_mov": {"value": lambda v: v.get('ftype_mov'), "field": lambda k, v: f'{k}'}
    }, True)
    f.where()
    f.auto()
    f.value()

    f2 = filterMulti(request.data['filter'], {
        # 'fartigo': {"keys": ['artigo_cod', 'artigo_des'], "table": 't.'}
    }, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = dbgw.dql(request.data, False)
    cols = f"""sgppl.*,mv."SDHNUM_0",mv."BPCNAM_0",mv."EECICT_0",mv."IPTDAT_0" """
    dql.columns=encloseColumn(cols,False)
    sql = lambda: (
        f"""  
            select
                {f'{dql.columns}'}
            FROM mv_paletes sgppl
            LEFT JOIN mv_pacabado_status mv on mv."LOT_0" = sgppl.nome
            {f.text} {f2["text"]}
            {dql.sort} {dql.limit}
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["gw"])
    try:
        response = dbgw.executeSimpleList(sql, connection, parameters)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def PaletesHistoryList(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({
    #    **rangeP(f.filterData.get('fdata'), 't_stamp', lambda k, v: f'DATE(t_stamp)'),
    #    **rangeP(f.filterData.get('fdatain'), 'in_t', lambda k, v: f'DATE(in_t)'),
    #    **rangeP(f.filterData.get('fdataout'), 'out_t', lambda k, v: f'DATE(out_t)'),
    #    "diff": {"value": lambda v: '>0' if "fdataout" in v and v.get("fdataout") is not None else None, "field": lambda k, v: f'TIMESTAMPDIFF(second,in_t,out_t)'},
        "id": {"value": lambda v: f"=={v.get('palete_id')}", "field": lambda k, v: f'{k}'},
    #    "fof": {"value": lambda v: v.get('fof')},
    #    "vcr_num": {"value": lambda v: v.get('fvcr')},
    #    "qty_lote": {"value": lambda v: v.get('fqty'), "field": lambda k, v: f'{k}'},
    #    "qty_reminder": {"value": lambda v: v.get('fqty_reminder'), "field": lambda k, v: f'{k}'},
    #    "type_mov": {"value": lambda v: v.get('ftype_mov'), "field": lambda k, v: f'{k}'}
    }, True)
    f.where()
    f.auto()
    f.value()

    f2 = filterMulti(request.data['filter'], {
        # 'fartigo': {"keys": ['artigo_cod', 'artigo_des'], "table": 't.'}
    }, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""t.*,pc.nome cliente_nome,po1.ofid ofid_original,po2.ofid ofid"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""  
            select
                {c(f'{dql.columns}')}
            FROM (

                select * from audit_producao_palete pp {f.text}
                union
                select null,null,null,pp.* from producao_palete pp {f.text}

            ) t
            LEFT JOIN producao_carga pcarga ON pcarga.id = t.carga_id
            LEFT JOIN producao_cliente pc ON pc.id = t.cliente_id
            LEFT JOIN planeamento_ordemproducao po1 ON po1.id = t.ordem_id_original
            LEFT JOIN planeamento_ordemproducao po2 ON po2.id = t.ordem_id
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    try:
        response = db.executeList(sql, connection, parameters,[],None,None)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def PaletizacaoLookup(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({"id": {"value": lambda v: v.get('palete_id')}}, True)
    f.where()
    f.auto()
    f.value()

    parameters={**f.parameters}
    dql = db.dql(request.data, False)
    cols = f"""pp.paletizacao"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda: (
        f"""  
            select
                {f'{dql.columns}'}
            FROM producao_palete pp
            {f.text}
            {dql.sort} {dql.limit}
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    try:
        response = db.executeSimpleList(sql, connection, parameters)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)




def StockAvailableList(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])

    f.setParameters({
    #    **rangeP(f.filterData.get('fdata'), 't_stamp', lambda k, v: f'DATE(t_stamp)'),
    #    **rangeP(f.filterData.get('fdatain'), 'in_t', lambda k, v: f'DATE(in_t)'),
    #    **rangeP(f.filterData.get('fdataout'), 'out_t', lambda k, v: f'DATE(out_t)'),
    #    "diff": {"value": lambda v: '>0' if "fdataout" in v and v.get("fdataout") is not None else None, "field": lambda k, v: f'TIMESTAMPDIFF(second,in_t,out_t)'},
    #    "n_lote": {"value": lambda v: v.get('flote'), "field": lambda k, v: f'{k}'},
    #    "fof": {"value": lambda v: v.get('fof')},
    #    "vcr_num": {"value": lambda v: v.get('fvcr')},
    #    "qty_lote": {"value": lambda v: v.get('fqty'), "field": lambda k, v: f'{k}'},
    #    "qty_reminder": {"value": lambda v: v.get('fqty_reminder'), "field": lambda k, v: f'{k}'},
    #    "type_mov": {"value": lambda v: v.get('ftype_mov'), "field": lambda k, v: f'{k}'}
    }, True)
    f.where(False,"and")
    f.auto()
    f.value()

    f2 = filterMulti(request.data['filter'], {
        # 'fartigo': {"keys": ['artigo_cod', 'artigo_des'], "table": 't.'}
    }, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""*"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""
            select
                {c(f'{dql.columns}')}
            from produto_stock_disponivel
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    try:
        response = db.executeList(sql, connection, parameters,[],None,None)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def PaletesStockList(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'] if "filter" in request.data else {})

    f.setParameters({
    #    **rangeP(f.filterData.get('fdata'), 't_stamp', lambda k, v: f'DATE(t_stamp)'),
    #    **rangeP(f.filterData.get('fdatain'), 'in_t', lambda k, v: f'DATE(in_t)'),
    #    **rangeP(f.filterData.get('fdataout'), 'out_t', lambda k, v: f'DATE(out_t)'),
    #    "diff": {"value": lambda v: '>0' if "fdataout" in v and v.get("fdataout") is not None else None, "field": lambda k, v: f'TIMESTAMPDIFF(second,in_t,out_t)'},
    #    "n_lote": {"value": lambda v: v.get('flote'), "field": lambda k, v: f'{k}'},
    #    "fof": {"value": lambda v: v.get('fof')},
    #    "vcr_num": {"value": lambda v: v.get('fvcr')},
    #    "qty_lote": {"value": lambda v: v.get('fqty'), "field": lambda k, v: f'{k}'},
    #    "qty_reminder": {"value": lambda v: v.get('fqty_reminder'), "field": lambda k, v: f'{k}'},
    #    "type_mov": {"value": lambda v: v.get('ftype_mov'), "field": lambda k, v: f'{k}'}
    }, True)
    f.where(False,"and")
    f.auto()
    f.value()

    f2 = filterMulti(request.data['filter'] if "filter" in request.data else {}, {
        # 'fartigo': {"keys": ['artigo_cod', 'artigo_des'], "table": 't.'}
    }, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""t.nbobines,pl.*"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""
            select {c(f'{dql.columns}')} from (
            select distinct pl.id,count(*) over (partition by pb.palete_id) nbobines
            from producao_palete pl
            join producao_bobine pb on pb.palete_id=pl.id and pb.recycle=0 #and #pb.estado in ('G','DM')
            where pl.carga_id is null #pl.stock=1
            ) t 
            join producao_palete pl on pl.id=t.id
            where t.nbobines>0
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    try:
        response = db.executeList(sql, connection, parameters,[],None,None)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def AllowedOFChanges(request, format=None):
    f = Filters({**request.data['filter'],"status":3})
    f.setParameters({
        "agg_of_id_id": {"value": lambda v: v.get('agg_of_id'), "field": lambda k, v: f'{k}'},
    }, True)
    f.where()
    f.auto()
    #f.add(f'cs.status = :cs_status', lambda v:(v!=None))
    f.add(f'`status` = :status', lambda v:(v!=None))
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                SELECT * from planeamento_ordemproducao
                {f.text}
                {dql.sort} {dql.limit}
            """
        ), cursor, parameters)
        return Response(response)


def UpdateDestinos(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    def checkPalete01(id, cursor):
        f = Filters({"id":id})
        f.where()
        f.add(f'id = :id', True)
        f.add(f'carga_id is null',True)
        f.value("and")
        response = db.executeSimpleList(lambda: (f"""select id from producao_palete {f.text} limit 1"""), cursor, f.parameters)
        if len(response["rows"])>0:
            return response["rows"][0]
        return None

    def checkPalete02(id, cursor):
        connection = connections[connGatewayName].cursor()
        f = Filters({"id":id})
        f.where()
        f.add(f'id = :id', True)
        f.value("and")
        response = dbgw.executeSimpleList(lambda: (f"""
        SELECT sgppl.id
        FROM mv_paletes sgppl
        LEFT JOIN mv_pacabado_status mv on mv."LOT_0" = sgppl.nome
        {f.text} and sgppl.nbobines_real>0 and disabled=0 and mv."SDHNUM_0" is null
        """), connection, f.parameters)
        if len(response["rows"])>0:
            return response["rows"][0]
        return None

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                chk01 = checkPalete01(filter["palete_id"],cursor)
                chk02 = checkPalete02(filter["palete_id"],cursor)
                if chk01 is None or chk02 is None:
                    return Response({"status": "error", "title": f"Não é possível alterar destinos na palete! A palete já tem carga associada ou é palete final."})
                ids_d = ','.join(str(x) for x in data["rowsDestinos"])
                ids_o = ','.join(str(x) for x in data["rowsObs"])                    

                dml = db.dml(TypeDml.UPDATE,{
                    "destinos":json.dumps(data["values"]["destinos"]),
                    "destino":data["values"]["destinoTxt"]
                    }, "producao_bobine",{"id":f'in:{ids_d}'},None,False)
                db.execute(dml.statement, cursor, dml.parameters)

                dml = db.dml(TypeDml.UPDATE,{"obs":data["values"]["obs"]},"producao_bobine",{"id":f'in:{ids_o}'},None,False)
                db.execute(dml.statement, cursor, dml.parameters)

                dml = db.dml(TypeDml.UPDATE,{},"producao_palete",{"id":f'=={filter["palete_id"]}'},None,False)
                statement = dml.statement.replace('SET',
                f'''SET 
                destinos = (SELECT JSON_ARRAYAGG(destinos) FROM (select distinct destinos from producao_bobine pb where palete_id = {filter["palete_id"]}) t), 
                destino = (select GROUP_CONCAT(DISTINCT destino ORDER BY pb.nome SEPARATOR ' // ') from producao_bobine pb where palete_id = {filter["palete_id"]})
                '''
                ,1)
                db.execute(statement, cursor, dml.parameters)

        return Response({"status": "success", "success":f"""Registos atualizados com sucesso!"""})
    except Error as error:
        return Response({"status": "error", "title": str(error)})