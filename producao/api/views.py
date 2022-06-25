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

# from psycopg2 import pool


# postgreSQL_pool = psycopg2.pool.SimpleConnectionPool(1, 20, user="postgres",
#                                                          password="Inf0rmat1ca",
#                                                          host="192.168.0.16",
#                                                          port="5432",
#                                                          database="postgres")

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

#Ordens de Fabrico

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
        fstream = requests.post('http://localhost:8080/ReportsGW/runlist', json=req)
        if (fstream.status_code==200):
            resp =  HttpResponse(fstream.content, content_type=fstream.headers["Content-Type"])
            if (parameters["export"] == "pdf"):
                resp['Content-Disposition'] = "inline; filename=list.pdf"
            elif (parameters["export"] == "excel"):
                resp['Content-Disposition'] = "inline; filename=list.xlsx"
            elif (parameters["export"] == "word"):
                resp['Content-Disposition'] = "inline; filename=list.docx"
            return resp


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def ExportFile(request, format=None):
    print("uiuiuiuiuiuiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
    print(request.data)
    print("----------------------------------------------------------")
    
    p = request.data["parameters"]
    req = {**p}
    fstream = requests.post('http://localhost:8080/ReportsGW/run', json=req)
    if (fstream.status_code==200):
        resp =  HttpResponse(fstream.content, content_type=fstream.headers["Content-Type"])
        if (p["export"] == "pdf"):
            resp['Content-Disposition'] = "inline; filename=list.pdf"
        elif (p["export"] == "excel"):
            resp['Content-Disposition'] = "inline; filename=list.xlsx"
        elif (p["export"] == "word"):
            resp['Content-Disposition'] = "inline; filename=list.docx"
        return resp


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def PrintMPBuffer(request,format=None):
    #Canon_iR-ADV_C3720_UFR_II
    print(request.data)
    tmp = tempfile.NamedTemporaryFile()
    print(tmp)
    print(tmp.name)
    fstream = requests.post('http://192.168.0.16:8080/ReportsGW/run', json={
        "config":"default",
        "conn-name":"MYSQL-SGP",
        "name":"ETIQUETAS-BUFFER",
        "path":"ETIQUETAS/MP-BUFFER",
        "export":"pdf",
        "data":{      
            "artigo_cod":request.data["parameters"]["ITMREF_0"],
            "n_lote":request.data["parameters"]["LOT_0"],
            "artigo_des":request.data["parameters"]["ITMDES1_0"],
            "unit":request.data["parameters"]["PCU_0"],
            "qty":float(request.data["parameters"]["QTYPCU_0"])
        }
    })
    print(fstream)
    try:
        print(tmp.name)
        tmp.write(fstream.content)
        # conn = cups.Connection()
        # conn.printFile("PRINTER-BUFFER",tmp.name,"",{}) 
        print("###########################")
    finally:
        pass
        #tmp.close()
        #os.unlink(tmp.name)
    
    #p = request.data["parameters"]
    #req = {**p}
    #conn = cups.Connection()
    #conn.printFile(printer_name,'/home/pi/Desktop/a.pdf',"",{}) 
    return Response({"status": "success", "id":None, "title": f'Etiqueta Impressa com Sucesso!', "subTitle":None})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def OFabricoList(request, format=None):
    def statusFilter(v):
        if ('fofstatus' not in v):
            return ''
        elif v['fofstatus'] == 'Todos':
            return ''
        elif v['fofstatus'] == 'Por Validar':
            return 'and ((sgp_op.status=0 or sgp_op.status is null) and sgp_top.id is null)'
        elif v['fofstatus'] == 'Em Elaboração':
            return 'and ((sgp_op.status=1 or sgp_op.status is null) and sgp_top.id is not null)'
        elif v['fofstatus'] == 'Na Produção':
            return 'and (sgp_op.status=2 and sgp_top.id is not null)'
        elif v['fofstatus'] == 'Em Produção':
            return 'and (sgp_op.status=3 and sgp_top.id is not null)'
        elif v['fofstatus'] == 'Finalizada':
            return 'and (sgp_op.status=9 and sgp_top.id is not null)'
        elif v['fofstatus'] == 'IN(2,3)':
            return 'and (sgp_op.status in (2,3) and sgp_top.id is not null)'
        return ''

    connection = connections[connGatewayName].cursor()
    f = Filters(request.data['filter'])

    f.setParameters({
        **rangeP(f.filterData.get('forderdate'), 'data_encomenda', lambda k, v: f'DATE(oflist.{k})'),
        **rangeP(f.filterData.get('fstartprevdate'), 'start_prev_date', lambda k, v: f'DATE(sgp_tagg.{k})'),
        **rangeP(f.filterData.get('fendprevdate'), 'end_prev_date', lambda k, v: f'DATE(sgp_tagg.{k})'),
        # **rangeP(f.filterData.get('SHIDAT_0'), 'SHIDAT_0', lambda k, v: f'"enc"."{k}"'),
        # "LASDLVNUM_0": {"value": lambda v: v.get('LASDLVNUM_0').lower() if v.get('LASDLVNUM_0') is not None else None, "field": lambda k, v: f'lower("enc"."{k}")'}
    }, True)
    f.where(False,"and")
    f.auto()
    f.value()

    f2 = filterMulti(request.data['filter'], {
        'fmulti_customer': {"keys": ['cliente_cod', 'cliente_nome'], "table": 'oflist.'},
        'fmulti_order': {"keys": ['iorder', 'prf'], "table": 'oflist.'},
        'fmulti_item': {"keys": ['item', 'item_nome'], "table": 'oflist.'},
        'f_ofabrico': {"keys": ['ofabrico'], "table": 'oflist.'},
        'f_agg': {"keys": ['cod'], "table": 'sgp_tagg.'}
    }, False, "and",False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = dbgw.dql(request.data, False)
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")
    mv_ofabrico_list = AppSettings.materializedViews.get("MV_OFABRICO_LIST")
    #cols = encloseColumn(['ofitm."ROWID" OFROWID','itm."ROWID" ITMROWID', 'enc."ROWID" ENCROWID', 'ofitm.MFGNUM_0', 'itm.TSICOD_0',
    #        'itm.ITMREF_0', 'itm.ITMDES1_0', 'enc.SOHNUM_0', 'enclin.SOPLIN_0', 'enc.ORDDAT_0', 'enc.DEMDLVDAT_0', 'enc.SHIDAT_0',
    #        'enc.PRFNUM_0', 'enc.CUSORDREF_0', 'enc.DAYLTI_0',
    #        'enc.LASDLVDAT_0', 'enc.LASDLVNUM_0', 'enc.lasinvdat_0', 'enc.LASINVNUM_0', 'enc.DSPTOTQTY_0', 'enc.DSPTOTVOL_0', 'enc.DSPTOTWEI_0',
    #        'enc.DSPVOU_0', 'enc.DSPWEU_0',
    #        'enc.BPCORD_0', 'enc.BPCNAM_0', 'enc.CREUSR_0', 'enc.CREDAT_0', 'enc.CREDATTIM_0', 'enc.UPDUSR_0', 'enc.UPDDAT_0', 'enc.UPDDATTIM_0'
    #],True,True,['"ROWID" OFROWID','"ROWID" ITMROWID', '"ROWID" ENCROWID'])
    #dql.columns = encloseColumn(cols,False)

    cols = f"""
        sgp_tagg.cod,
        oflist.ofabrico, oflist.prf, oflist.ofabrico_sgp_nome,oflist.ofabrico_sgp,
        oflist.item, oflist.item_nome, oflist.iorder,oflist.cliente_cod,oflist.cliente_nome,
        oflist.n_paletes_produzidas,sgp_op.num_paletes_produzir,
        oflist.n_paletes_stock_in,sgp_op.num_paletes_stock,
        oflist.n_paletes_total,sgp_op.num_paletes_total,
        sgp_op.inicio,sgp_op.fim,
        oflist.n_paletes_produzidas || '/' || sgp_op.num_paletes_produzir produzidas,
        oflist.n_paletes_stock_in || '/' || sgp_op.num_paletes_stock stock,oflist.n_paletes_total || '/' || sgp_op.num_paletes_total total,
        sgp_op.retrabalho, oflist.start_date, oflist.end_date, sgp_op.ativa, sgp_op.completa, sgp_op.stock, 
        oflist.bom_alt, oflist.qty_prevista, oflist.qty_item, sgp_op.status,
        sgp_p.produto_cod, sgp_a.produto_id, sgp_top.id temp_ofabrico, sgp_top.agg_of_id temp_ofabrico_agg, sgp_a.thickness item_thickness,
        sgp_a.diam_ref item_diam,sgp_a.core item_core, sgp_a.lar item_width, sgp_a.id item_id,
		sgp_tagg.start_prev_date,sgp_tagg.end_prev_date,oflist.matricula,oflist.matricula_reboque,oflist.modo_exp
    """


    


    sql = lambda p, c, s: (
        f"""
        SELECT {c(f'{cols}')} 
        FROM {mv_ofabrico_list} oflist
        LEFT JOIN {sgpAlias}.planeamento_ordemproducao sgp_op on sgp_op.id = oflist.ofabrico_sgp
        LEFT JOIN {sgpAlias}.producao_tempordemfabrico sgp_top on sgp_top.of_id = oflist.ofabrico and sgp_top.item_cod=oflist.item
        LEFT JOIN {sgpAlias}.producao_tempaggordemfabrico sgp_tagg on sgp_top.agg_of_id = sgp_tagg.id
        LEFT JOIN {sgpAlias}.producao_artigo sgp_a on sgp_a.cod = oflist.item
        LEFT JOIN {sgpAlias}.producao_produtos sgp_p on sgp_p.id = sgp_a.produto_id
        WHERE 
        NOT EXISTS(SELECT 1 FROM {sgpAlias}.producao_ordemfabricodetails ex WHERE ex.cod = oflist.ofabrico)
        {statusFilter(request.data['filter'])}
        {f.text} {f2["text"]}
        {s(dql.sort)} {p(dql.paging)}
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["gw"])

    #print(sql(lambda v:v,lambda v:v))
    print(sql)
    response = dbgw.executeList(sql, connection, parameters, [])


    # cols = f"""
    #     t.prf,t.data_encomenda,t.rowid,t.ofabrico,
    #     t.ofabrico_status,t.start_date,t.end_date,t.qty_prevista,t.qty_realizada,t.ofabrico_sgp,
    #     t.ofabrico_sgp_nome,t.paletes_produzir_sgp,t.paletes_stock_sgp,t.paletes_total_sgp,
    #     t.retrabalho_sgp,t.ativa_sgp,t.completa_sgp,t.item,t.item_nome,t.qty_item,t.iorder,
    #     t.cliente_cod,t.cliente_nome,t.cod,t.inicio,t.fim,t.retrabalho, t.ativa, t.completa, t.stock, 
    #     t.status,t.produto_cod, t.produto_id, t.temp_ofabrico, t.temp_ofabrico_agg, t.item_thickness,
    #     t.item_diam,t.item_core, t.item_width, t.item_id,t.start_prev_date,t.end_prev_date
    # """

    # response = dbgw.executeList(lambda p, c, s: (
    #     f"""
    #     SELECT {c(f'{cols}')} 
    #     from (
    #     SELECT DISTINCT ON (ofh."MFGNUM_0", ofitm."MFGLIN_0") ofh."MFGNUM_0" AS ofabrico,
    #     oforder."PRFNUM_0" AS prf,
    #     oforder."ORDDAT_0" AS data_encomenda,
    #     ofh."ROWID" AS rowid,
    #     ofh."MFGTRKFLG_0" AS ofabrico_status,
    #     ofh."STRDAT_0" AS start_date,
    #     ofh."ENDDAT_0" AS end_date,
    #     ofh."EXTQTY_0" AS qty_prevista,
    #     ofh."CPLQTY_0" AS qty_realizada,
    #     sgp_op.id AS ofabrico_sgp,
    #     sgp_op.op AS ofabrico_sgp_nome,
    #     sgp_op.num_paletes_produzir AS paletes_produzir_sgp,
    #     sgp_op.num_paletes_stock AS paletes_stock_sgp,
    #     sgp_op.num_paletes_total AS paletes_total_sgp,
    #     sgp_op.retrabalho AS retrabalho_sgp,
    #     sgp_op.ativa AS ativa_sgp,
    #     sgp_op.completa AS completa_sgp,
    #     ofitm."ITMREF_0" AS item,
    #     itmsales."ITMDES1_0" AS item_nome,
    #     ofitm."UOMEXTQTY_0" AS qty_item,
    #     sgp_tagg.cod,
    #     sgp_op.inicio,sgp_op.fim,
    #     sgp_op.retrabalho, sgp_op.ativa, sgp_op.completa, sgp_op.stock, 
    #     sgp_op.status,
    #     sgp_p.produto_cod, sgp_a.produto_id, sgp_top.id temp_ofabrico, sgp_top.agg_of_id temp_ofabrico_agg, sgp_a.thickness item_thickness,
    #     sgp_a.diam_ref item_diam,sgp_a.core item_core, sgp_a.lar item_width, sgp_a.id item_id,
    #     sgp_tagg.start_prev_date,sgp_tagg.end_prev_date,
    #     CASE
    #     WHEN length(ofitm."VCRNUMORI_0"::text) = 1 THEN sgp_op.enccod
    #     ELSE ofitm."VCRNUMORI_0"
    #     END AS iorder,
    #     CASE
    #     WHEN oforder."BPCORD_0" IS NULL THEN sgp_op.clientecod
    #     ELSE oforder."BPCORD_0"
    #     END AS cliente_cod,
    #     CASE
    #     WHEN oforder."BPCNAM_0" IS NULL THEN sgp_op.clientenome
    #     ELSE oforder."BPCNAM_0"
    #     END AS cliente_nome
    #     FROM {sageAlias}."MFGHEAD" ofh
    #     LEFT JOIN {sageAlias}."MFGITM" ofitm ON ofitm."MFGNUM_0"::text = ofh."MFGNUM_0"::text
    #     LEFT JOIN {sageAlias}."SORDER" oforder ON oforder."SOHNUM_0"::text = ofitm."VCRNUMORI_0"::text
    #     LEFT JOIN {sageAlias}."ITMSALES" itmsales ON itmsales."ITMREF_0"::text = ofitm."ITMREF_0"::text
    #     LEFT JOIN {sgpAlias}.planeamento_ordemproducao sgp_op ON sgp_op.ofid::text = ofh."MFGNUM_0"::text
    #     LEFT JOIN {sgpAlias}.producao_tempordemfabrico sgp_top on sgp_top.of_id = ofh."MFGNUM_0" and sgp_top.item_cod=ofitm."ITMREF_0"
    #     LEFT JOIN {sgpAlias}.producao_tempaggordemfabrico sgp_tagg on sgp_top.agg_of_id = sgp_tagg.id
    #     LEFT JOIN {sgpAlias}.producao_artigo sgp_a on sgp_a.cod = ofitm."ITMREF_0"
    #     LEFT JOIN {sgpAlias}.producao_produtos sgp_p on sgp_p.id = sgp_a.produto_id
    #     WHERE 
    #     NOT EXISTS(SELECT 1 FROM {sgpAlias}.producao_ordemfabricodetails ex WHERE ex.cod = ofh."MFGNUM_0")
    #     ) t
    #     {f.text} {f2["text"]}
    #     {s(dql.sort)} {p(dql.paging)}
    #     """
    # ), connection, parameters, [])

    #ret = dbgw.executeSimpleList(lambda:(f"""SELECT id,status FROM {sgpAlias}.planeamento_ordemproducao where id>679"""),connection,{})
    #print(f'----------------------{ret}')
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
    cols = ['pa.*, prod.produto_cod']
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
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")
    dql.columns = encloseColumn(cols,False)
    response = dbgw.executeSimpleList(lambda: (
        f"""SELECT {dql.columns} 
        FROM {sageAlias}."BOM" bm
        JOIN {sageAlias}."BOMD" bmd ON bm."ITMREF_0" = bmd."ITMREF_0" AND bm."BOMALT_0" = bmd."BOMALT_0"
        JOIN {sageAlias}."ITMMASTER" matprima ON bmd."CPNITMREF_0" = matprima."ITMREF_0"
        JOIN {sageAlias}."ITMMASTER" pacabado ON bm."ITMREF_0" = pacabado."ITMREF_0"
        {f'JOIN {sageAlias}."MFGITM" ofabrico ON ofabrico."ITMREF_0" =  bm."ITMREF_0" and ofabrico."BOMALT_0" = bm."BOMALT_0"' if "ofabrico" in request.data['filter'] else ''}
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
        cfilter = f"""LOWER("ITMDES1_0") LIKE 'nonwo%%' AND LOWER("ITMDES1_0") LIKE '%%gsm%%' AND ("ACCCOD_0" = 'PT_MATPRIM')"""
    elif type=='cores':
        core = int(int(request.data['parameters']['core']) * 25.4)
        largura = str(request.data['parameters']['largura'])[:-1]
        cfilter = f"""LOWER("ITMDES1_0") LIKE 'core%%%% {core}%%x%%x{largura}_ mm%%' AND ("ACCCOD_0" = 'PT_EMBALAG')"""
    else:
        cfilter = f"""(LOWER("ITMDES1_0") NOT LIKE 'nonwo%%' AND LOWER("ITMDES1_0") NOT LIKE 'core%%') AND ("ACCCOD_0" = 'PT_MATPRIM')"""

    dql = dbgw.dql(request.data, False)
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")
    dql.columns = encloseColumn(cols,False)
    print(f'LARGURA--{cfilter}')
    response = dbgw.executeSimpleList(lambda: (
        f"""
            select 
            {dql.columns}
            from {sageAlias}."ITMMASTER" mprima
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
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")
    dql.columns = encloseColumn(cols,False)
    response = dbgw.executeSimpleList(lambda: (
        f"""
            select 
            DISTINCT {dql.columns}
            FROM {sageAlias}."BOM" bm
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


#region MATERIAS-PRIMAS

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def StockListBuffer(request, format=None):
    connection = connections[connGatewayName].cursor()    
    
    print("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
    print(request.data['filter'])
    
    f = Filters(request.data['filter'])
    print(f.filterData)
    f.setParameters({
        # "picked": {"value": lambda v: None if "fpicked" not in v or v.get("fpicked")=="ALL" else f'=={v.get("fpicked")}' , "field": lambda k, v: f'{k}'},
        "LOT_0": {"value": lambda v: v.get('flote'), "field": lambda k, v: f'ST."{k}"'},
        "QTYPCU_0": {"value": lambda v: v.get('fqty_lote'), "field": lambda k, v: f'"{k}"'},
        **rangeP(f.filterData.get('fdate'), 't_stamp', lambda k, v: f'ST."CREDATTIM_0"::date')
        # "qty_lote_available": {"value": lambda v: v.get('fqty_lote_available'), "field": lambda k, v: f'{k}'},
        # "qty_artigo_available": {"value": lambda v: v.get('fqty_artigo_available'), "field": lambda k, v: f'{k}'},
    }, True)
    f.where(False,"and")
    f.auto()
    f.value("and")

    f2 = filterMulti(request.data['filter'], {
        'fartigo': {"keys": ['ITMREF_0', 'ITMDES1_0'], "table":"mprima"}
    }, False, "and" if f.hasFilters else "and")    

    def filterLocationMultiSelect(data,name,field,hasFilters=False):
        f = Filters(data)
        fP = {}
        #v = [{"value":"ARM"},{"value":"BUFFER"}] if name not in data else data[name]
        v = [] if name not in data else data[name]
        dt = [o['value'] for o in v]
        value = None if len(v)==0 else 'in:' + ','.join(f"{w}" for w in dt)
        fP[field] = {"key": field, "value": value, "field": lambda k, v: f'{k}'}
        f.setParameters({**fP}, True)
        f.auto()
        f.where(False, hasFilters)
        f.value()
        return f
    flocation = filterLocationMultiSelect(request.data['filter'],'fmulti_location','"LOC_0"',"and" if f.hasFilters or f2["hasFilters"] else "and")
    print(flocation.text)


    parameters = {**f.parameters, **flocation.parameters, **f2['parameters']}
    #parameters = {**f.parameters}
    
    dql = dbgw.dql(request.data, False)
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")

    cols = f'''*'''
    sql = lambda p, c, s: (
        f"""

            SELECT {c(f'{cols}')} FROM(
                SELECT
                ST."ROWID",ST."CREDATTIM_0",ST."ITMREF_0",ST."LOT_0",ST."LOC_0",ST."VCRNUM_0",
                SUM (ST."QTYPCU_0") OVER (PARTITION BY ST."ITMREF_0",ST."LOT_0",ST."VCRNUM_0") QTY_SUM,
                ST."QTYPCU_0",ST."PCU_0",mprima."ITMDES1_0"
                FROM {sageAlias}."STOJOU" ST
                JOIN {sageAlias}."ITMMASTER" mprima on ST."ITMREF_0"= mprima."ITMREF_0"
                where (
                    ST."LOC_0" in ('BUFFER') 
                    --OR ST."ITMREF_0" LIKE 'R000%%'
                    )
                {f.text} {f2["text"]} {flocation.text}
                --AND NOT EXISTS(SELECT 1 FROM "SGP-PROD".loteslinha ll WHERE ll.lote_id=ST."ROWID" AND ll.status<>0)

            ) t
            where (QTY_SUM > 0)
        {s(dql.sort)} {p(dql.paging)}
        """
    )
    print(sql)
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["gw"])
    response = dbgw.executeList(sql, connection, parameters, [])
    return Response(response)



@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def StockList(request, format=None):
    connection = connections[connGatewayName].cursor()    
    typeList = request.data['parameters']['typelist'] if 'typelist' in request.data['parameters'] else [{"value":'B'}]
    
    print("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
    print(request.data['filter'])
    
    f = Filters(request.data['filter'])
    f.setParameters({
        "picked": {"value": lambda v: None if "fpicked" not in v or v.get("fpicked")=="ALL" else f'=={v.get("fpicked")}' , "field": lambda k, v: f'{k}'},
        "n_lote": {"value": lambda v: v.get('flote'), "field": lambda k, v: f'{k}'},
        "qty_lote": {"value": lambda v: v.get('fqty_lote'), "field": lambda k, v: f'{k}'},
        "qty_lote_available": {"value": lambda v: v.get('fqty_lote_available'), "field": lambda k, v: f'{k}'},
        "qty_artigo_available": {"value": lambda v: v.get('fqty_artigo_available'), "field": lambda k, v: f'{k}'},
    }, True)
    f.where()
    f.auto()
    f.value("and")

    f2 = filterMulti(request.data['filter'], {
        'fartigo': {"keys": ['matprima_cod', 'matprima_des']}
    }, False, "and" if f.hasFilters else False)    

    def filterLocationMultiSelect(data,name,field):
        f = Filters(data)
        fP = {}
        v = [{"value":"ARM"},{"value":"BUFFER"}] if name not in data else data[name]
        dt = [o['value'] for o in v]
        value = 'in:' + ','.join(f"{w}" for w in dt)
        fP[field] = {"key": field, "value": value, "field": lambda k, v: f'ST.{k}'}
        f.setParameters({**fP}, True)
        f.auto()
        f.where(False, "and")
        f.value()
        return f
    
    def filterDosersMultiSelect(data,name,hasFilters):
        v = data[name] if name in data else []
        dt = [o['value'] for o in v]
        value = '|'.join(f"{w}" for w in dt)
        if not value:
            return ""
        _filter = f"""{"and" if hasFilters else "WHERE"} frm @? '$[*] ? (@.doseador like_regex "{value}" )'"""
        return _filter

    fdosers = filterDosersMultiSelect(request.data['filter'],'fmulti_dosers', (True if f.hasFilters or f2['hasFilters'] else False))
    flocation = filterLocationMultiSelect(request.data['filter'],'fmulti_location','"LOC_0"')



    # f2 = filterMulti(request.data['filter'], {
    #     'fmulti_location': {"keys": ['matprima_cod', 'matprima_des'], "table": 'enc'}
    # }, False, "and" if f.hasFilters else False)
    parameters = {**f.parameters, **flocation.parameters, **f2['parameters']}
    
    # print(f2["text"])

    dql = dbgw.dql(request.data, False)
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")

    cols = f'''rowid,loc,qty_lote, unit, inbuffer,frm,ofs,picked,matprima_cod,matprima_des,n_lote,qty_lote_available,qty_lote_consumed,qty_artigo_available,max_type_mov'''
    sql = lambda p, c, s: (
        f"""
        SELECT {c(f'{cols}')} FROM(
            WITH LOTES_EM_LINHA AS(
            select t.*,SUM(t.qty_lote_available) over (PARTITION BY t.group_id) qty_artigo_available
            FROM (
                select distinct * from (
                SELECT 
                DOSERS.group_id, LOTES.artigo_cod,LOTES.n_lote,LOTES.qty_lote,DOSERS.loteslinha_id,LOTES.t_stamp,DOSERS."status",
                SUM(DOSERS.qty_consumed) over (PARTITION BY LOTES.artigo_cod,LOTES.n_lote) qty_lote_consumed,
                qty_lote + SUM(DOSERS.qty_consumed) over (PARTITION BY LOTES.artigo_cod,LOTES.n_lote) qty_lote_available,
                MIN(DOSERS.t_stamp) over (PARTITION BY LOTES.artigo_cod,LOTES.n_lote) min_t_stamp, --FIFO DATE TO ORDER ASC
                MAX(LOTES.t_stamp) over (PARTITION BY LOTES.artigo_cod,LOTES.n_lote) max_t_stamp,
                MAX(LOTES.type_mov) over (PARTITION BY LOTES.artigo_cod,LOTES.n_lote) max_type_mov
                FROM {sgpAlias}.loteslinha LOTES
                LEFT JOIN {sgpAlias}.lotesdosers DOSERS ON LOTES.id=DOSERS.loteslinha_id 
                WHERE LOTES.status=1 
                ) t WHERE  max_t_stamp=t_stamp and "status"=1
            ) t
            ),
            BASE AS(
                SELECT * FROM(SELECT acs.*, max(acs.id) over () mx_id, cs.id cs_id 
                from {sgpAlias}.producao_currentsettings cs
                join {sgpAlias}.audit_currentsettings acs on cs.id=acs.contextid
                where cs.status=3) BASE where BASE.id=BASE.mx_id
            ),
            OFS AS(
                SELECT jsonb_agg(json_build_object(
                    'of_cod',dta.value->>'of_cod','order_cod',dta.value->>'order_cod',
                    'prf_cod',dta.value->>'prf_cod','item_cod',dta.value->>'item_cod',
                    'item_des',dta.value->>'item_des','cliente_nome',dta.value->>'cliente_nome')) ofs 
                FROM BASE
                JOIN jsonb_array_elements(BASE.ofs::jsonb) dta ON true
            ),
            FORMULACAO AS(
                SELECT 
                    fitems::jsonb->>'matprima_cod' matprima_cod,
                    fitems::jsonb->>'matprima_des' matprima_des, 
                    jsonb_agg(json_build_object(
                        'doseador',concat(fitems::jsonb->>'doseador_A',fitems::jsonb->>'doseador_B',',',fitems::jsonb->>'doseador_C'),
                        'arranque',fitems::jsonb->>'arranque',
                        'densidade',fitems::jsonb->>'densidade'
                    )) frm
                FROM BASE
                join jsonb_array_elements(BASE.formulacao::jsonb->'items') fitems on true
                group by matprima_cod,matprima_des
            ),
            SETTINGS AS(
                select * from FORMULACAO
                JOIN OFS ON true
            )
            SELECT 
            ST."LOC_0" loc,ST."ROWID" rowid,
            CASE WHEN ST."ITMREF_0" IS NULL THEN matprima_cod ELSE ST."ITMREF_0" END matprima_cod,
            CASE WHEN ST."LOT_0" IS NULL THEN n_lote ELSE ST."LOT_0" END n_lote,
            CASE WHEN mprima."ITMDES1_0" IS NULL THEN matprima_des ELSE mprima."ITMDES1_0" END matprima_des,
            CASE WHEN ST."ITMREF_0" IS NULL THEN 0 ELSE CASE WHEN ST."LOC_0"='ARM' THEN 0 ELSE 1 END END inbuffer,
            CASE WHEN max_type_mov IS NULL THEN 0 ELSE CASE WHEN ST."LOC_0"='ARM' THEN 0 ELSE 1 END END picked,
            SETTINGS.frm,SETTINGS.ofs,
            ST."QTYPCU_0" qty_lote, ST."PCU_0" unit,qty_lote_available,qty_lote_consumed,qty_artigo_available,max_type_mov 
            FROM {sageAlias}."STOCK" ST
            JOIN {sageAlias}."ITMMASTER" mprima on ST."ITMREF_0"= mprima."ITMREF_0"
            LEFT JOIN SETTINGS ON ST."ITMREF_0" = SETTINGS.matprima_cod
            LEFT JOIN LOTES_EM_LINHA LL ON LL.artigo_cod=ST."ITMREF_0" AND LL.n_lote=ST."LOT_0" {flocation.text}
            WHERE 
            (LOWER(mprima."ITMDES1_0") NOT LIKE 'nonwo%%' AND LOWER(mprima."ITMDES1_0") NOT LIKE 'core%%') AND (mprima."ACCCOD_0" = 'PT_MATPRIM') AND
            ST."STOFCY_0" = 'E01' {flocation.text}/*and ST."LOC_0"='BUFFER'*/ {"AND frm IS NOT NULL" if any(obj.get('value') == 'B' for obj in typeList) else ""} --AND ST."ITMREF_0"='RAPRA0000000078'
            --ORDER BY frm ASC, ST."ITMREF_0",ST."LOT_0"
        ) t
         {f.text} {f2["text"]} {fdosers}
        {s(dql.sort)} {p(dql.paging)}
        """
    )
    print(sql)
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["gw"])
    response = dbgw.executeList(sql, connection, parameters, [])
    return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def StockListByIgBobinagem(request, format=None):
    dataFilters = request.data["filter"]
    connection = connections[connGatewayName].cursor()    
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")

    f1 = Filters(request.data['filter'])
    f1.setParameters({}, False)
    f1.where()
    f1.add("pbm.ig_bobinagem_id = :ig_id",True)
    f1.value("and")

    if "lastof" in request.data["parameters"] and request.data["parameters"]["lastof"] == True:
        end_id = 0
        default_cursor = connections["default"].cursor()
        dql = db.dql(request.data, False)
        response = db.executeSimpleList(lambda: (f"""
            select id from lotesdosers 
            where status<>0 and closed=0 and `order`< (select min(`order`) from lotesdosers where status<>0 and closed=0 and ig_bobinagem_id={request.data["parameters"]["ig_id"]})
            and type_mov="END" order by `order` desc limit 1
        """), default_cursor, {})
        if len(response["rows"])>0:
            end_id = response["rows"][0]["id"]
        
        cols = f'''LOTESAVAILABLE.*,mprima."ITMDES1_0"'''
        sql = lambda p, c, s: (f"""
            WITH MATPRIMAS AS(
            SELECT DISTINCT 
            fitems->>'matprima_cod' cod,
            jsonb_agg(json_build_object(
            'doseador',concat(fitems::jsonb->>'doseador_A',fitems::jsonb->>'doseador_B',',',fitems::jsonb->>'doseador_C'),
            'arranque',fitems::jsonb->>'arranque',
            'densidade',fitems::jsonb->>'densidade'
            )) frm
            FROM {sgpAlias}.producao_bobinagem pbm
            LEFT JOIN {sgpAlias}.audit_currentsettings acs on acs.id = pbm.audit_current_settings_id 
            LEFT JOIN jsonb_array_elements(acs.formulacao::jsonb->'items') fitems on true
            {f1.text}
            GROUP BY fitems->>'matprima_cod'
            ),
            LOTESAVAILABLE AS(
            SELECT ll.lote_id "ROWID", ll.t_stamp "CREDATTIM_0", ll.artigo_cod "ITMREF_0", ll.n_lote "LOT_0", 'PRODUCTION' "LOC_0", ll.qty_reminder "QTYPCU_0", MP.frm, 'kg' "PCU_0",ll.end_id, ll.id
            FROM {sgpAlias}.loteslinha ll
            JOIN MATPRIMAS MP ON ll.artigo_cod = MP.cod
            WHERE 
            ll.end_id = {end_id}  and ll.status<>0 and ll.closed=0 and ll.type_mov = 'OUT'
            )
            select {c(f'{cols}')} from LOTESAVAILABLE
            JOIN {sageAlias}."ITMMASTER" mprima on LOTESAVAILABLE."ITMREF_0"= mprima."ITMREF_0"
            WHERE NOT EXISTS (SELECT 1 FROM {sgpAlias}.loteslinha ll WHERE ll.lote_id=LOTESAVAILABLE."ROWID" and ll.status<>0 and ll.closed=0  and ll.type_mov = 'IN' and ll.end_id = {end_id})
            {s(dql.sort)} {p(dql.paging)}
        """
        )
        if ("export" in request.data["parameters"]):
            return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=f1.parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
        response = dbgw.executeList(sql, connection, f1.parameters, [])        
        return Response(response)
    else:
        

        f2 = Filters(request.data['filter'])
        f2.setParameters({
            "fartigo": {"value": lambda v:  v.get('fartigo').lower() if v.get('fartigo') is not None else None, "field": lambda k, v: f'lower("ITMDES1_0")'},
            "flote": {"value": lambda v: v.get('flote').lower() if v.get('flote') is not None else None, "field": lambda k, v: f'lower("LOT_0")'},
            "fqty":{"value":">0","field":"QTY_SUM"}
        }, True)
        f2.where()
        f2.auto()
        f2.value("and")

        f3 = Filters(request.data['filter'])
        if "ft_stamp" in dataFilters:
            f3.setParameters({**rangeP(f3.filterData.get('ft_stamp'), 't_stamp', lambda k, v: f'ST."CREDATTIM_0"::date')},True)
            f3.where()
            f3.auto()
        else:
            f3.setParameters({}, False)
            f3.where()
            f3.add(f'''(ST."CREDATTIM_0"::date BETWEEN (:t_stamp __date  - INTERVAL '2 DAY') AND :t_stamp __date)''',True)
        f3.value("and")


        parameters = {**f1.parameters,**f2.parameters,**f3.parameters}
        dql = dbgw.dql(request.data, False)


        cols = f'''LOTESAVAILABLE.*,mprima."ITMDES1_0"'''
        sql = lambda p, c, s: (
            f"""
                WITH MATPRIMAS AS(
                SELECT DISTINCT 
                    fitems->>'matprima_cod' cod,
                    jsonb_agg(json_build_object(
                        'doseador',concat(fitems::jsonb->>'doseador_A',fitems::jsonb->>'doseador_B',',',fitems::jsonb->>'doseador_C'),
                        'arranque',fitems::jsonb->>'arranque',
                        'densidade',fitems::jsonb->>'densidade'
                    )) frm
                FROM {sgpAlias}.producao_bobinagem pbm
                LEFT JOIN {sgpAlias}.audit_currentsettings acs on acs.id = pbm.audit_current_settings_id 
                LEFT JOIN jsonb_array_elements(acs.formulacao::jsonb->'items') fitems on true
                {f1.text}
                GROUP BY fitems->>'matprima_cod'
                ),
                LOTESAVAILABLE AS(
                SELECT 
                ST."ROWID",ST."CREDATTIM_0",ST."ITMREF_0",ST."LOT_0",ST."LOC_0",ST."VCRNUM_0", 
                SUM (ST."QTYPCU_0") OVER (PARTITION BY ST."ITMREF_0",ST."LOT_0",ST."VCRNUM_0") QTY_SUM,
                ST."QTYPCU_0",MP.frm,ST."PCU_0"
                --ST."PCU_0",ST."QTYPCU_0",mprima."ITMDES1_0",ST."ITMREF_0",ST."LOT_0", ST."ROWID",MP.frm
                FROM {sageAlias}."STOJOU" ST
                JOIN MATPRIMAS MP ON ST."ITMREF_0" = MP.cod
                AND --{f3.text.replace(" __date","::date")} AND 
                ST."LOC_0" in ('BUFFER') AND NOT EXISTS(SELECT 1 FROM {sgpAlias}.loteslinha ll WHERE ll.lote_id=ST."ROWID" AND ll.status<>0)
                union
                SELECT
                    ST."ROWID",ST."CREDATTIM_0",ST."ITMREF_0",ST."LOT_0",ST."LOC_0",NULL "VCRNUM_0",
                    SUM (ST."QTYPCU_0") OVER (PARTITION BY ST."ITMREF_0",ST."LOT_0") QTY_SUM,
                    ST."QTYPCU_0",MP.frm,ST."PCU_0"
                    --ST."PCU_0",ST."QTYPCU_0",mprima."ITMDES1_0",ST."ITMREF_0",ST."LOT_0", ST."ROWID",MP.frm
                    FROM "SAGE-PROD"."STOCK" ST
                    JOIN MATPRIMAS MP ON ST."ITMREF_0" = MP.cod
                    where MP.cod LIKE 'R000%%'
                )
                select {c(f'{cols}')}
                from LOTESAVAILABLE
                JOIN {sageAlias}."ITMMASTER" mprima on LOTESAVAILABLE."ITMREF_0"= mprima."ITMREF_0"  
                {f2.text}
                {s(dql.sort)} {p(dql.paging)}
            """
        )
        if ("export" in request.data["parameters"]):
            return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["gw"])
        response = dbgw.executeList(sql, connection, parameters, [])
        return Response(response)


#endregion



#region LOGS

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def BobinesOriginaisList(request, format=None):
    connection = connections["default"].cursor()    
    f = Filters(request.data['filter'])
    f.setParameters({
        **rangeP(f.filterData.get('fbobinedate'), 'data', lambda k, v: f'pbm0.{k}')
    }, True)
    f.where()
    f.auto()
    f.value("and")

    fbs=""
    if 'fbobines' in request.data['filter']:
        fbs = request.data['filter']['fbobines']
        fbs = re.sub(f""""|'""","",fbs)
        fbs = "pb0.nome in ('" + re.sub("\n|,","','",fbs).strip(f""""',""") + "')"
    fbms=""
    if 'fbobinagens' in request.data['filter']:
        fbms = request.data['filter']['fbobinagens']
        fbms = re.sub(f""""|'""","",fbms)
        fbms = f"pb0.bobinagem_id in ( select id from producao_bobinagem where nome in ('" + re.sub("\n|,","','",fbms).strip(f""""',""") + "') )"
    fps=""
    if 'fpaletes' in request.data['filter']:
        fps = request.data['filter']['fpaletes']
        fps = re.sub(f""""|'""","",fps)
        fps = f"pb0.palete_id in ( select id from producao_palete where nome in ('" + re.sub("\n|,","','",fps).strip(f""""',""") + "') )"

    fs = ' or '.join(x for x in [fbs,fbms,fps] if x)
    if f.hasFilters:
        fs=f"{f.text} {f'AND ({fs})' if fs else ''}"
    else:
        fs = f'WHERE ({fs})' if fs else ''

    parameters = {**f.parameters}
    data = {**request.data,"pagination":{"enabled":False,"limit":5000}} if "pagination" not in request.data or not request.data["pagination"]["enabled"] else request.data
    #dql = db.dql(data, False)
    cols = f'''
            row_number() over() rowid,
            plt.nome,
            root,emenda,emenda_lvl1,emenda_lvl2,emenda_lvl3,emenda_lvl4,
            
            
            bobine,comp0,largura0,
            original_lvl1, comp1 comp1_original, (comp1 - metros) comp1_atual, metros metros_cons,largura1,
            original_lvl2, comp2 comp2_original, (comp2 - metros_lvl1) comp2_atual, metros_lvl1 metros_cons_lvl1,largura2,
            original_lvl3, comp3 comp3_original, (comp3 - metros_lvl2) comp3_atual, metros_lvl2 metros_cons_lvl2,largura3,
            original_lvl4, comp4 comp4_original, (comp4 - metros_lvl3) comp4_atual, metros_lvl3 metros_cons_lvl3,largura4,
            original_lvl5, comp5 comp5_original, (comp5 - metros_lvl4) comp5_atual, metros_lvl4 metros_cons_lvl4,largura5,
            
            
            
            b1,b2,b3,b4,b5,
            #nextl1,nextl2,nextl3,nextl4,nextl5,
            #N1,N2,N3,N4,N5,
            nretrabalhos
            #,(
            #SUM(N1) OVER (PARTITION BY bobine) +
            #SUM(N2) OVER (PARTITION BY bobine,original_lvl1) +
            #SUM(N3) OVER (PARTITION BY bobine,original_lvl1,original_lvl2) +
            #SUM(N4) OVER (PARTITION BY bobine,original_lvl1,original_lvl2,original_lvl3) +
            #SUM(N5) OVER (PARTITION BY bobine,original_lvl1,original_lvl2,original_lvl3,original_lvl4)
            #) ST
    '''
    sql = lambda: (
        f"""

            select
            {cols}
            FROM (
            select
            palete_id,bobine, original_lvl1, original_lvl2, original_lvl3, original_lvl4,
            original_lvl5,
            IFNULL(original_lvl5, IFNULL(original_lvl4, IFNULL(original_lvl3, IFNULL(original_lvl2, original_lvl1)))) root

            ,case when (original_lvl5 is not null) THEN 5
            ELSE (case when (original_lvl4 is not null) THEN 4
            ELSE (case when (original_lvl3 is not null) THEN 3
            ELSE (case when (original_lvl2 is not null) THEN 2
            ELSE (case when (original_lvl1 is not null) THEN 1
            ELSE 0 END) END) END) END) END nretrabalhos,
            
            (select SUM(metros) from sistema.producao_emenda where bobine_id=b5 and bobinagem_id=bm4) metros_lvl4,
            (select SUM(metros) from sistema.producao_emenda where bobine_id=b4 and bobinagem_id=bm3) metros_lvl3,
            (select SUM(metros) from sistema.producao_emenda where bobine_id=b3 and bobinagem_id=bm2) metros_lvl2,
            (select SUM(metros) from sistema.producao_emenda where bobine_id=b2 and bobinagem_id=bm1) metros_lvl1,
            (select SUM(metros) from sistema.producao_emenda where bobine_id=b1 and bobinagem_id=bm0) metros,
            
            (select JSON_ARRAYAGG(JSON_OBJECT(original_lvl5,metros,'e',emenda)) from sistema.producao_emenda where bobine_id=b5 and bobinagem_id=bm4) emenda_lvl4,
            (select JSON_ARRAYAGG(JSON_OBJECT(original_lvl4,metros,'e',emenda)) from sistema.producao_emenda where bobine_id=b4 and bobinagem_id=bm3) emenda_lvl3,
            (select JSON_ARRAYAGG(JSON_OBJECT(original_lvl3,metros,'e',emenda)) from sistema.producao_emenda where bobine_id=b3 and bobinagem_id=bm2) emenda_lvl2,
            (select JSON_ARRAYAGG(JSON_OBJECT(original_lvl2,metros,'e',emenda)) from sistema.producao_emenda where bobine_id=b2 and bobinagem_id=bm1) emenda_lvl1,
            (select JSON_ARRAYAGG(JSON_OBJECT(original_lvl1,metros,'e',emenda)) from sistema.producao_emenda where bobine_id=b1 and bobinagem_id=bm0) emenda
            ,comp0,comp1,comp2,comp3,comp4,comp5
            ,b1,b2,b3,b4,b5
			,largura0,largura1,largura2,largura3,largura4,largura5
            from (
            select distinct pb0.palete_id,pb0.nome bobine, pb.nome original_lvl1,      
            pb2.nome original_lvl2,
            pb3.nome original_lvl3, pb4.nome original_lvl4, pb5.nome original_lvl5 ,   
            pb0.bobinagem_id bm0,pb0.id b0, case when pb0.comp=0 then pbm0.comp else pb0.comp end comp0,
            pb.bobinagem_id bm1,pb.id b1, case when pb.comp=0 then pbm.comp else pb.comp end comp1,
            pb2.bobinagem_id bm2,pb2.id b2, case when pb2.comp=0 then pbm2.comp else pb2.comp end comp2,
            pb3.bobinagem_id bm3,pb3.id b3, case when pb3.comp=0 then pbm3.comp else pb3.comp end comp3,
            pb4.bobinagem_id bm4,pb4.id b4, case when pb4.comp=0 then pbm4.comp else pb4.comp end comp4,
            pb5.bobinagem_id bm5,pb5.id b5, case when pb5.comp=0 then pbm5.comp else pb5.comp end comp5
			
            ,l0.largura largura0,l.largura largura1,l2.largura largura2,
            l3.largura largura3,l4.largura largura4,l5.largura largura5

            FROM sistema.producao_bobine pb0
            JOIN sistema.producao_bobinagem pbm0 on pb0.bobinagem_id = pbm0.id
            JOIN sistema.producao_largura l0 on l0.id = pb0.largura_id

            /*NÍVEL 1*/
            join sistema.producao_emenda pem on pem.bobinagem_id = pb0.bobinagem_id
            left join sistema.producao_bobine pb on pem.bobine_id = pb.id
            left join sistema.producao_bobinagem pbm on pb.bobinagem_id = pbm.id
            left join sistema.producao_largura l on l.id = pb.largura_id
            /**/

            /*NÍVEL 2*/
            left join sistema.producao_emenda pem2 on pem2.bobinagem_id = pb.bobinagem_id      
            left join sistema.producao_bobine pb2 on pem2.bobine_id = pb2.id
            left join sistema.producao_bobinagem pbm2 on pb2.bobinagem_id = pbm2.id
            left join sistema.producao_largura l2 on l2.id = pb2.largura_id
            /**/

            /*NÍVEL 3*/
            left join sistema.producao_emenda pem3 on pem3.bobinagem_id = pb2.bobinagem_id     
            left join sistema.producao_bobine pb3 on pem3.bobine_id = pb3.id
            left join sistema.producao_bobinagem pbm3 on pb3.bobinagem_id = pbm3.id
            left join sistema.producao_largura l3 on l3.id = pb3.largura_id
            /**/

            /*NÍVEL 4*/
            left join sistema.producao_emenda pem4 on pem4.bobinagem_id = pb3.bobinagem_id     
            left join sistema.producao_bobine pb4 on pem4.bobine_id = pb4.id
            left join sistema.producao_bobinagem pbm4 on pb4.bobinagem_id = pbm4.id
            left join sistema.producao_largura l4 on l4.id = pb4.largura_id
            /**/

            /*NÍVEL 5*/
            left join sistema.producao_emenda pem5 on pem5.bobinagem_id = pb4.bobinagem_id     
            left join sistema.producao_bobine pb5 on pem5.bobine_id = pb5.id
            left join sistema.producao_bobinagem pbm5 on pb5.bobinagem_id = pbm5.id
            left join sistema.producao_largura l5 on l5.id = pb5.largura_id
            /**/
             {fs}

            ) tb0 LIMIT 5000) tb1
            LEFT JOIN producao_palete plt on tb1.palete_id=plt.id
        """
    )
    print(sql())
    print(parameters)
    if ("export" in request.data["parameters"]):
        return export(sql(), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    if fs:
        response = db.executeSimpleList(sql, connection, parameters, [])
    else:
        return Response([])
    return Response(response)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def OFabricoTimeLineList(request, format=None):
    connection = connections["default"].cursor()    
    f = Filters(request.data['filter'])
    f.setParameters({
        "max_date": {"value": lambda v: v.get('fim_ts'), "field": lambda k, v: f'{k}'}
    }, True)
    f.where(False,"and")
    f.add("(t.max_date >=:max_date and t.astatus in (9,1)) or (t.min_date <=:max_date and t.astatus in (3))",True)
    f.value("and")


    parameters = {**f.parameters}
    dql = db.dql(request.data, False)
    cols = f'''t.*,cs.`status`'''
    sql = lambda p, c, s: (
        f"""
        select {c(f'{cols}')}  from (
            select 
            id,
            min(start_prev_date) over (partition by contextid) min_date,
            max(end_prev_date) over (partition by contextid) max_date,
            max(id) over (partition by contextid) max_id,
            contextid,
            JSON_EXTRACT(acs.ofs, '$[*].of_cod') ofs,
            JSON_EXTRACT(acs.ofs, '$[*].order_cod') orders,
            `status` astatus,`timestamp` 
            from audit_currentsettings acs where `status` in (9,1,3)
        ) t 
        JOIN producao_currentsettings cs on t.contextid=cs.id
        WHERE t.id=t.max_id
        {f.text}
        {s(dql.sort)} {p(dql.paging)}
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])

    response = db.executeList(sql, connection, parameters, [])
    return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def LineLogList(request, format=None):
    connection = connections["default"].cursor()    
    #typeList = request.data['parameters']['typelist'] if 'typelist' in request.data['parameters'] else [{"value":'B'}]
    
    fduracao=None
    fd=None
    if "fduracao" in request.data['filter']:
        pattern = f'(^==|^=|^!==|^!=|^>=|^<=|^>|^<|^between:|^in:|^!between:|^!in:|isnull|!isnull|^@:)(.*)'
        result = re.match(pattern, request.data['filter'].get('fduracao'), re.IGNORECASE)
        fduracao=f"{result.group(1)}TIME_TO_SEC('{result.group(2)}')"
        fd=f"TIME_TO_SEC('{result.group(2)}')"

    f = Filters(request.data['filter'])
    f.setParameters({
        
        # **rangeP(f.filterData.get('ftime'), ['inico','fim'], lambda k, v: f'TIME(pbm.{k})', lambda k, v: f'TIMEDIFF(TIME(pbm.{k[1]}),TIME(pbm.{k[0]}))'),
        #"nome": {"value": lambda v: v.get('fbobinagem'), "field": lambda k, v: f'pbm.{k}'},
        "duracao": {"value": lambda v: fduracao, "field": lambda k, v: f'(TIMESTAMPDIFF(SECOND,ig.inicio_ts,ig.fim_ts))'},
        
        #**rangeP2(f.filterData.get('fdate'), 'inicio_ts', 'fim_ts', lambda k, v: f'DATE(ig.{k})'),
        **rangeP( f.filterData.get('ftime'), ['inicio_ts','fim_ts'], lambda k, v: f'TIME(ig.{k})', lambda k, v: f'TIMEDIFF(ig.{k[1]},ig.{k[0]})','ftime'),
        **rangeP( f.filterData.get('fdate'), ['inicio_ts','fim_ts'], lambda k, v: f'DATE(ig.{k})', lambda k, v: f'DATEDIFF(ig.{k[1]},ig.{k[0]})','fdate'),
        "bobinagem_id": {"value": lambda v: None if "fhasbobinagem" not in v or v.get("fhasbobinagem")=="ALL" else "isnull" if v.get('fhasbobinagem') == 0 else "!isnull" , "field": lambda k, v: f'pbm.id'},
        #"n_lote": {"value": lambda v: v.get('flote'), "field": lambda k, v: f'{k}'},
        #"qty_lote": {"value": lambda v: v.get('fqty_lote'), "field": lambda k, v: f'{k}'},
        #"qty_lote_available": {"value": lambda v: v.get('fqty_lote_available'), "field": lambda k, v: f'{k}'},
        #"qty_artigo_available": {"value": lambda v: v.get('fqty_artigo_available'), "field": lambda k, v: f'{k}'},
    }, True)
    f.where()
    f.auto()
    f.value("and")
    if fduracao:
        f.text = f.text.replace("%(auto_duracao)s",fd)

    def filterEventoMultiSelect(data,name,field,hasFilters):
        f = Filters(data)
        fP = {}
        v = None if name not in data else data[name]
        if v is None:
            value=None
        else:
            dt = [o['value'] for o in v]
            value = 'in:' + ','.join(f"{w}" for w in dt)
        fP[field] = {"key": field, "value": value, "field": lambda k, v: f'ig.{k}'}
        f.setParameters({**fP}, True)
        f.auto()
        f.where(False, "and" if hasFilters else "where")
        f.value()
        return f
    fevento = filterEventoMultiSelect(request.data['filter'],'fevento','type',(True if f.hasFilters else False))

    parameters = {**f.parameters, **fevento.parameters}

    dql = db.dql(request.data, False)

    cols = f'''ig.*,pbm.nome'''
    sql = lambda p, c, s: (
        f"""
        SELECT {c(f'{cols}')} 
        FROM ig_bobinagens ig
        LEFT JOIN producao_bobinagem pbm ON pbm.ig_bobinagem_id=ig.id
        {f.text} {fevento.text}
        {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    response = db.executeList(sql, connection, parameters, [])
    return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def ConsumptionNeedLogList(request, format=None):
    connection = connections[connGatewayName].cursor()

    f = Filters(request.data['filter'])
    f.setParameters({
        **rangeP(f.filterData.get('fdate'), 't_stamp', lambda k, v: f'{k}::date'),
        **rangeP( f.filterData.get('ftime'), ['t_stamp','t_stamp'], lambda k, v: f'{k}::time', lambda k, v: f"extract(epoch from ({k[1]}::time - {k[0]}::time))::integer/60",'ftime'),
        "nome": {"value": lambda v: v.get('fbobinagem'), "field": lambda k, v: f'{k}'},
        "closed": {"value": lambda v: f"=={v.get('festado')}" if 'festado' in v else "==0", "field": lambda k, v: f'{k}'}
    }, True)
    f.where(False,"and")
    f.auto()
    f.value()

    def filterTipoMovMultiSelect(data,name,relname):
        f = Filters(data)
        frel = "and"
        op = "=="
        if relname in data:
            if data[relname]=="ou":
                frel = "or"
            if data[relname]=="!ou":
                frel = "or"
                op = "!=="
            if data[relname]=="!e":
                frel = "and"
                op = "!=="
        
        fP = {}
        if name in data:
            dt = [o['value'] for o in data[name]]
            print(dt)
            for idx,v in enumerate(dt):
                fP[f"ftipomov_{idx}"] = {"key": f"ftipomov_{idx}", "value": f"{op}{v}", "field": lambda k, v: f'type_mov_doser'}
        f.setParameters({**fP}, True)
        f.auto()
        f.where(False, "and")
        f.value(frel)
        return f

    ftipomov = filterTipoMovMultiSelect(request.data['filter'],'ftipomov','freltipomov')

    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")
    parameters = {**f.parameters,**ftipomov.parameters}
    dql = dbgw.dql(request.data, False)

    cols = f'''*'''
    sql = lambda p, c, s: (f"""
            SELECT {c(f'{cols}')} FROM (
                SELECT row_number() over() rowid,ll.id idlinha,ld.id iddoser,ld.t_stamp,ld.doser,ll.artigo_cod,ll.n_lote,ll.lote_id,ld.status,
                --CASE WHEN ld.type_mov='C' THEN NULL ELSE ll.type_mov END type_mov_linha,
                ld.type_mov type_mov_doser,
                ll.qty_lote,ld.qty_consumed,ld.qty_to_consume,ll.qty_reminder,ll.group,ld.ig_bobinagem_id,pbm.nome,pbm.diam,pbm.comp,
                sum(ld.qty_consumed) over (partition by ld.ig_bobinagem_id,ld.doser,ld.group_id) qty_consumed_doser,ld.closed
                FROM {sgpAlias}.loteslinha ll
                FULL OUTER JOIN {sgpAlias}.lotesdosers ld on ld.loteslinha_id=ll.id
                LEFT JOIN {sgpAlias}.producao_bobinagem pbm on pbm.ig_bobinagem_id=ld.ig_bobinagem_id
                ORDER BY ld."order"
            ) t
            WHERE (lote_id is null OR type_mov_doser IN('IN','OUT') OR (qty_to_consume + qty_consumed_doser)<>0) {f.text} {ftipomov.text}
            {s(dql.sort)} {p(dql.paging)}
    """)

    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["gw"])
    response = dbgw.executeList(sql, connection, parameters, [])
    return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def StockLogList(request, format=None):
    connection = connections[connGatewayName].cursor()
    print("#$#$$%&$%$%$%$##$#$#$#$#$#")
    print(request.data)
    typeList = request.data['parameters']['typelist'] if 'typelist' in request.data['parameters'] else 'A'
    f = Filters(request.data['filter'])
    f.setParameters({
        #**rangeP2(f.filterData.get('fdate'), 'inicio_ts', 'fim_ts', lambda k, v: f'DATE(ig.{k})'),
        #**rangeP( f.filterData.get('ftime'), ['inicio_ts','fim_ts'], lambda k, v: f'TIME(ig.{k})', lambda k, v: f'TIMEDIFF(ig.{k[1]},ig.{k[0]})','ftime'),
        #**rangeP( f.filterData.get('fdate'), ['inicio_ts','fim_ts'], lambda k, v: f'DATE(ig.{k})', lambda k, v: f'DATEDIFF(ig.{k[1]},ig.{k[0]})','fdate'),
        #"bobinagem_id": {"value": lambda v: None if "fhasbobinagem" not in v or v.get("fhasbobinagem")=="ALL" else "isnull" if v.get('fhasbobinagem') == 0 else "!isnull" , "field": lambda k, v: f'pbm.id'},
        #"n_lote": {"value": lambda v: v.get('flote'), "field": lambda k, v: f'{k}'},
        #"qty_lote": {"value": lambda v: v.get('fqty_lote'), "field": lambda k, v: f'{k}'},
        #"qty_lote_available": {"value": lambda v: v.get('fqty_lote_available'), "field": lambda k, v: f'{k}'},
        #"qty_artigo_available": {"value": lambda v: v.get('fqty_artigo_available'), "field": lambda k, v: f'{k}'},
    }, True)
    f.where()
    f.auto()
    f.value("and")


    def filterEventoMultiSelect(data,name,field,hasFilters):
        f = Filters(data)
        fP = {}
        v = None if name not in data else data[name]
        if v is None:
            value=None
        else:
            dt = [o['value'] for o in v]
            value = 'in:' + ','.join(f"{w}" for w in dt)
        fP[field] = {"key": field, "value": value, "field": lambda k, v: f'ig.{k}'}
        f.setParameters({**fP}, True)
        f.auto()
        f.where(False, "and" if hasFilters else "where")
        f.value()
        return f
    #fevento = filterEventoMultiSelect(request.data['filter'],'fevento','type',(True if f.hasFilters else False))
    #parameters = {**f.parameters, **fevento.parameters}

#group by
# SELECT contextid,artigo_cod,n_lote,sum(qty_to_consume) FROM (
# SELECT ll.id idlinha,ld.id iddoser,ld.t_stamp,ld.doser,ll.artigo_cod,ll.n_lote,
# CASE WHEN ld.type_mov='C' THEN NULL ELSE ll.type_mov END type_mov_linha,
# ld.type_mov type_mov_doser,
# ll.qty_lote,ld.qty_consumed,ld.qty_to_consume,ll.qty_reminder,ll.group,ld.ig_bobinagem_id,acs.contextid
# FROM "SGP-PROD".loteslinha ll
# LEFT JOIN "SGP-PROD".lotesdosers ld on ld.loteslinha_id=ll.id
# LEFT JOIN "SGP-PROD".producao_bobinagem pbm on pbm.ig_bobinagem_id=ld.ig_bobinagem_id
# LEFT JOIN "SGP-PROD".audit_currentsettings acs on acs.id=pbm.audit_current_settings_id
# ) t
# group by contextid,artigo_cod,n_lote


    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")
    parameters = {**f.parameters}
    dql = dbgw.dql(request.data, False)

    if typeList=='A':
        cols = f'''row_number() over() rowid,nome,"order",id,grp,status,doser_closed,linha_closed,ig_bobinagem_id,dosers,maxid,type_mov,
        qty_bobinagem_to_consume,qty_bobinagem_consumed,artigo_cod, n_lote,qty_lote, no_lotes,erro_consumos,ofs, t_stamp'''
        sql = lambda p, c, s: (f"""
                SELECT {c(f'{cols}')} FROM( 
                WITH IO AS(
                SELECT * FROM(
                SELECT
                t."order", t.id,t.grp,t.ig_bobinagem_id,t.no_lotes,t.status,t.doser_closed,t.linha_closed,
                CASE WHEN t.type_mov='C' THEN string_agg(t.doser,',') over w ELSE string_agg(t.doser,',') over wio END dosers,
                max(t.id) over wio maxid,
                t.type_mov,t.qty_bobinagem_to_consume,t.qty_bobinagem_consumed,t.artigo_cod,t.n_lote,t.qty_lote,
                CASE WHEN (t.no_lotes=0 and (t.qty_bobinagem_to_consume+t.qty_bobinagem_consumed) <> 0) or t.no_lotes>0 THEN 1 ELSE 0 END erro_consumos
                FROM (
                SELECT
                ld.id,ld.doser,ld.status,ld.closed doser_closed,ll.closed linha_closed,
                CASE WHEN ld.type_mov='C' THEN NULL ELSE ld.lote_id END lote_id,  
                CASE WHEN ld.type_mov='C' THEN NULL ELSE ld.artigo_cod END artigo_cod,
                CASE WHEN ld.type_mov='C' THEN NULL ELSE ld.n_lote END n_lote,
                CASE WHEN ld.type_mov='C' THEN sum(CASE WHEN ld.lote_id is null THEN 1 ELSE 0 END) over (partition by ld.ig_bobinagem_id) ELSE null END no_lotes,
                CASE WHEN ld.type_mov='C' THEN sum(ld.qty_to_consume) over (partition by ld.ig_bobinagem_id) ELSE null END qty_bobinagem_to_consume,
                CASE WHEN ld.type_mov='C' THEN sum(ld.qty_consumed) over (partition by ld.ig_bobinagem_id) ELSE null END qty_bobinagem_consumed,
                ld.type_mov,ll.qty_lote,ld.qty_to_consume,ld.ig_bobinagem_id,ld."order",
                ROW_NUMBER() OVER(ORDER BY ld."order") -  ROW_NUMBER() OVER(PARTITION BY ld.type_mov ORDER BY ld."order") grp
                FROM {sgpAlias}.loteslinha ll
                FULL OUTER JOIN {sgpAlias}.lotesdosers ld on ld.loteslinha_id=ll.id and ld.status<>0   
                WHERE ll.status<>0 or ll.status is null
                ) t
                WINDOW w AS (PARTITION BY t.grp,t.ig_bobinagem_id),wio AS (PARTITION BY t.grp,t.ig_bobinagem_id,t.lote_id)
                order by t."order"
                ) tbl where tbl.id=tbl.maxid
                )
                SELECT pbm.nome,pbm.timestamp t_stamp,IO.*,
                (select jsonb_agg(tx -> 'of_cod') from jsonb_array_elements(acs.ofs::jsonb) as x(tx)) as ofs
                FROM IO
                LEFT JOIN {sgpAlias}.producao_bobinagem pbm ON pbm.ig_bobinagem_id=IO.ig_bobinagem_id
                LEFT JOIN {sgpAlias}.audit_currentsettings acs on acs.id=pbm.audit_current_settings_id
                order by "order"
                ) t
                {s(dql.sort)} {p(dql.paging)}
        """)

    if typeList=='B':
        cols = f'''row_number() over() rowid,ll.id idlinha,ld.id iddoser,ld.t_stamp,ld.doser,ll.artigo_cod,ll.n_lote,
                CASE WHEN ld.type_mov='C' THEN NULL ELSE ll.type_mov END type_mov_linha,
                ld.type_mov type_mov_doser,
                ll.qty_lote,ld.qty_consumed,ld.qty_to_consume,ll.qty_reminder,ll.group,ld.ig_bobinagem_id,pbm.nome,pbm.diam,pbm.comp'''
        sql = lambda p, c, s: (
            f"""
                SELECT * FROM (
                SELECT {c(f'{cols}')} 
                FROM {sgpAlias}.loteslinha ll
                FULL OUTER JOIN {sgpAlias}.lotesdosers ld on ld.loteslinha_id=ll.id
                LEFT JOIN {sgpAlias}.producao_bobinagem pbm on pbm.ig_bobinagem_id=ld.ig_bobinagem_id
                {f.text}
            ) t
            {s(dql.sort)} {p(dql.paging)}
            """
        )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["gw"])
    response = dbgw.executeList(sql, connection, parameters, [])
    return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def CreateBobinagem(request, format=None):
    data = request.data.get("parameters")
    #{'acs_id': 106, 'cs_id': 21, 'ig_id': 2465}
    def getIgBobinagem(data,cursor):
        f = Filters({"id": data["ig_id"]})
        f.where()
        f.add(f'id = :id', True)
        f.value("and")  
        f1 = Filters({"idigd": data["ig_id"]})
        f1.where()
        f1.add(f'ig_bobinagem_id = :idigd', True)
        f1.value("and")
        parameters={**f.parameters,**f1.parameters}
        rows = db.executeSimpleList(lambda: (f'SELECT * FROM ig_bobinagens {f.text} and NOT EXISTS(SELECT id from producao_bobinagem {f1.text})'), cursor, parameters)['rows']
        if len(rows)>0:
            return rows[0]
        return None

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                igb = getIgBobinagem(data,cursor)
                if igb is not None:
                    args = (igb["id"], igb["diametro"],igb["metros"],igb["peso"],igb["nw_inf"],igb["nw_sup"],igb["inicio_ts"],igb["fim_ts"],
                    (ifNull(igb["A1_RESET"],0) if igb["A1"] < igb["A1_LAG"] else 0)  + ifNull(igb["A1"],0)-ifNull(igb["A1_LAG"],0),
                    (ifNull(igb["A2_RESET"],0) if igb["A2"] < igb["A2_LAG"] else 0)  + ifNull(igb["A2"],0)-ifNull(igb["A2_LAG"],0),
                    (ifNull(igb["A3_RESET"],0) if igb["A3"] < igb["A3_LAG"] else 0)  + ifNull(igb["A3"],0)-ifNull(igb["A3_LAG"],0),
                    (ifNull(igb["A4_RESET"],0) if igb["A4"] < igb["A4_LAG"] else 0)  + ifNull(igb["A4"],0)-ifNull(igb["A4_LAG"],0),
                    (ifNull(igb["A5_RESET"],0) if igb["A5"] < igb["A5_LAG"] else 0)  + ifNull(igb["A5"],0)-ifNull(igb["A5_LAG"],0),
                    (ifNull(igb["A6_RESET"],0) if igb["A6"] < igb["A6_LAG"] else 0)  + ifNull(igb["A6"],0)-ifNull(igb["A6_LAG"],0),

                    (ifNull(igb["B1_RESET"],0) if igb["B1"] < igb["B1_LAG"] else 0)  + ifNull(igb["B1"],0)-ifNull(igb["B1_LAG"],0),
                    (ifNull(igb["B2_RESET"],0) if igb["B2"] < igb["B2_LAG"] else 0)  + ifNull(igb["B2"],0)-ifNull(igb["B2_LAG"],0),
                    (ifNull(igb["B3_RESET"],0) if igb["B3"] < igb["B3_LAG"] else 0)  + ifNull(igb["B3"],0)-ifNull(igb["B3_LAG"],0),
                    (ifNull(igb["B4_RESET"],0) if igb["B4"] < igb["B4_LAG"] else 0)  + ifNull(igb["B4"],0)-ifNull(igb["B4_LAG"],0),
                    (ifNull(igb["B5_RESET"],0) if igb["B5"] < igb["B5_LAG"] else 0)  + ifNull(igb["B5"],0)-ifNull(igb["B5_LAG"],0),
                    (ifNull(igb["B6_RESET"],0) if igb["B6"] < igb["B6_LAG"] else 0)  + ifNull(igb["B6"],0)-ifNull(igb["B6_LAG"],0),

                    (ifNull(igb["C1_RESET"],0) if igb["C1"] < igb["C1_LAG"] else 0)  + ifNull(igb["C1"],0)-ifNull(igb["C1_LAG"],0),
                    (ifNull(igb["C2_RESET"],0) if igb["C2"] < igb["C2_LAG"] else 0)  + ifNull(igb["C2"],0)-ifNull(igb["C2_LAG"],0),
                    (ifNull(igb["C3_RESET"],0) if igb["C3"] < igb["C3_LAG"] else 0)  + ifNull(igb["C3"],0)-ifNull(igb["C3_LAG"],0),
                    (ifNull(igb["C4_RESET"],0) if igb["C4"] < igb["C4_LAG"] else 0)  + ifNull(igb["C4"],0)-ifNull(igb["C4_LAG"],0),
                    (ifNull(igb["C5_RESET"],0) if igb["C5"] < igb["C5_LAG"] else 0)  + ifNull(igb["C5"],0)-ifNull(igb["C5_LAG"],0),
                    (ifNull(igb["C6_RESET"],0) if igb["C6"] < igb["C6_LAG"] else 0)  + ifNull(igb["C6"],0)-ifNull(igb["C6_LAG"],0),
                    data["acs_id"]
                    )
                    cursor.callproc('create_bobinagem',args)
                else:
                    return Response({"status": "error", "title": "Não é possível criar a Bobinagem, o evento já está associado a uma bobinagem!"})
                pass
                return Response({"status": "success", "id":0, "title": "Bobinagem Criada com Sucesso!", "subTitle":''})
    except Error:
        return Response({"status": "error", "title": "Erro ao Criar Bobinagem!"})

#endregion

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
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")
    dql.columns = encloseColumn(cols)
    with connections[connGatewayName].cursor() as cursor:
       response = dbgw.executeSimpleList(lambda: (
         f'SELECT {dql.columns} FROM {sageAlias}."BPCUSTOMER" {f["text"]} {dql.sort} {dql.limit}'
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

    def getVersao(data, cursor):
        f = Filters({"cliente_cod": data['cliente_cod'], "contentor_id":data["contentor_id"],"artigo_cod":data["artigo_cod"]})
        f.setParameters({}, False)
        f.where()
        f.add(f'cliente_cod = :cliente_cod', True)
        f.add(f'contentor_id = :contentor_id', True)
        f.add(f'artigo_cod = :artigo_cod', True)
        f.value("and")   
        return db.executeSimpleList(lambda: (f'SELECT IFNULL(MAX(versao),0)+1 AS mx FROM producao_paletizacao {f.text}'), cursor, f.parameters)['rows'][0]['mx']

    def checkPaletizacao(data, cursor):
        exists=0
        if ("id" in data):
            f = Filters({"id":data["id"]})
            f.where()
            f.add(f'paletizacao_id = :id', True)
            f.value("and")
            exists = db.exists("producao_tempordemfabrico",f,cursor).exists
            if (exists!=0):
                f = Filters({"id":data["id"]})
                f.where()
                f.add(f'id = :id', True)
                f.value("and")
                row = db.limit("producao_paletizacao",f,1,cursor).rows
                if (row[0]["cliente_cod"]==data["cliente_cod"] and row[0]["contentor_id"]==data["contentor_id"] and row[0]["designacao"]==data["designacao"] and row[0]["artigo_cod"]==data["artigo_cod"]):
                    exists = 1
                else:
                    exists = 2        
        return exists

    def upsertPaletizacao(data, versao, cursor):
        dml = db.dml(TypeDml.INSERT, {
            'cliente_cod': data['cliente_cod'] if 'cliente_cod' in data else None,
            'cliente_nome': data['cliente_nome'] if 'cliente_nome' in data else None,
            'artigo_cod': data['artigo_cod'],
            'contentor_id': data['contentor_id'],
            'versao': f'{versao}',
            'npaletes': data['npaletes'],
            'palete_maxaltura': data['palete_maxaltura'],
            'paletes_sobrepostas': data['paletes_sobrepostas'] if 'paletes_sobrepostas' in data else 0, 
            'netiquetas_bobine': data['netiquetas_bobine'], 
            'netiquetas_lote': data['netiquetas_lote'], 
            'netiquetas_final': data['netiquetas_final'], 
            'folha_identificativa': data['folha_identificativa'], 
            'filmeestiravel_bobines': data['filmeestiravel_bobines'] if 'filmeestiravel_bobines' in data else 0, 
            'filmeestiravel_exterior': data['filmeestiravel_exterior'] if 'filmeestiravel_exterior' in data else 0,
            'cintas': data['cintas'] if 'cintas' in data else 0, 
            'ncintas': data['ncintas'], 
            'cintas_palete': data['cintas_palete'],
            'designacao':data['designacao']
        }, "producao_paletizacao",None,None,False,['versao'])
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
                folha_identificativa=VALUES(folha_identificativa), 
                netiquetas_final=VALUES(netiquetas_final), 
                filmeestiravel_bobines=VALUES(filmeestiravel_bobines), 
                filmeestiravel_exterior=VALUES(filmeestiravel_exterior), 
                cintas=VALUES(cintas),
                ncintas=VALUES(ncintas), 
                cintas_palete=VALUES(cintas_palete),
                designacao=VALUES(designacao) 
        """
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
                if (exists==0 or exists==2):
                    data["designacao"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S") if (not "designacao" in data or not data["designacao"]) else data["designacao"]
                    versao = getVersao(data,cursor)
                    id = upsertPaletizacao(data, versao, cursor)
                    if (exists==0):
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

    def getVersao(data, cursor):
        f = Filters({"produto_id": data['produto_id']})
        f.setParameters({}, False)
        f.where()
        f.add(f'f.produto_id = :produto_id', True)
        f.value("and")   
        return db.executeSimpleList(lambda: (f'SELECT IFNULL(MAX(versao),0)+1 AS mx FROM producao_formulacao f {f.text}'), cursor, f.parameters)['rows'][0]['mx']

    def checkFormulacao(data, cursor):
        exists=0
        if ("id" in data):
            f = Filters({"id":data["id"]})
            f.where()
            f.add(f'formulacao_id = :id', True)
            f.value("and")
            exists = db.exists("producao_tempaggordemfabrico",f,cursor).exists
            if (exists!=0):
                f = Filters({"id":data["id"]})
                f.where()
                f.add(f'id = :id', True)
                f.value("and")
                row = db.limit("producao_formulacao",f,1,cursor).rows
                if (row[0]["produto_id"]==data["produto_id"] and row[0]["designacao"]==data["designacao"]):
                    exists = 1
                else:
                    exists = 2        
        return exists

    def upsertFormulacao(data, versao, cursor):
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
                exists = checkFormulacao(data,cursor)
                if (exists==0 or exists==2):
                    data["designacao"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S") if (not "designacao" in data or not data["designacao"]) else data["designacao"]
                    versao = getVersao(data,cursor)
                    if (exists==0 or exists==2):
                        id = upsertFormulacao(data, versao, cursor)
                        if (exists==0):
                            deleteFormulacaoItems(id,cursor)
                        insertFormulacaoItems(id,cursor)
                        return Response({"status": "success", "id":id, "title": "A Formulação foi Registada com Sucesso!", "subTitle":f'Formulação {data["designacao"]}'})
                return Response({"status": "error", "title": "Não é possível alterar a Formulação! Esta já se encontra referenciada em Ordens de Fabrico."})
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

    def checkGamaOperatoria(data, cursor):
        exists=0
        if ("id" in data):
            f = Filters({"id":data["id"]})
            f.where()
            f.add(f'gamaoperatoria_id = :id', True)
            f.value("and")
            exists = db.exists("producao_tempaggordemfabrico",f,cursor).exists
            if (exists!=0):
                f = Filters({"id":data["id"]})
                f.where()
                f.add(f'id = :id', True)
                f.value("and")
                row = db.limit("producao_gamaoperatoria",f,1,cursor).rows
                if (row[0]["produto_id"]==data["produto_id"] and row[0]["designacao"]==data["designacao"]):
                    exists = 1
                else:
                    exists = 2        
        return exists

    def upsertGamaOperatoria(data, versao, cursor):
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
                exists = checkGamaOperatoria(data,cursor)
                if (exists==0 or exists==2):
                    data["designacao"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S") if (not "designacao" in data or not data["designacao"]) else data["designacao"]
                    versao = getVersao(data,cursor)
                    if (exists==0 or exists==2):
                        id = upsertGamaOperatoria(data, versao, cursor)
                        if (exists==0):
                            deleteGamaOperatoriaItems(id,cursor)
                        insertGamaOperatoriaItems(id,data['nitems'],cursor)
                        return Response({"status": "success", "id":id, "title": "A Gama Operatória foi Registada com Sucesso!", "subTitle":f'Gama Operatória {data["designacao"]}'})
                return Response({"status": "error", "title": "Não é possível alterar a Gama Operatória! Esta já se encontra referenciada em Ordens de Fabrico."})
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
    f.setParameters({
        "nome": {"value": lambda v: f"%{v.get('fpl-filter').lower()}%" if v.get('fpl-filter') is not None else None}
    }, False)
    f.where(False,"and")
    f.add(f'lower(pp.nome) like :nome', lambda v:(v!=None))
    f.add(f'pb.artigo_id = :item_id', True)
    f.value("and")
    parameters = {**f.parameters}

    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        # response = db.executeList(lambda p, c, s: (
        #     f"""
        #     SELECT {c(f'{dql.columns}')} 
        #     FROM producao_palete pp
        #     join producao_bobine pb on pb.palete_id=pp.id 
        #     join producao_artigo pa on pb.artigo_id=pa.id
        #     join producao_tempordemfabrico ptof on ptof.item_cod = pa.cod
        #     where 
        #     pp.stock=1 
        #     {f.text}
        #     {s(dql.sort)} {p(dql.paging)}
        #     """
        # ), cursor, parameters, [], lambda v: 'count(distinct(pp.id))')
        response = db.executeList(lambda p, c, s: (
            f"""
            SELECT {c(f'{dql.columns}')} 
            FROM producao_palete pp
            JOIN producao_bobine pb on pb.palete_id=pp.id {f.text}
            join producao_artigo pa on pb.artigo_id=pa.id
            where pp.stock=1 or pp.estado = 'DM'
            {s(dql.sort)} {p(dql.paging)}
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
    f.setParameters({
        "nome": {"value": lambda v: f"%{v.get('fpr-filter').lower()}%" if v.get('fpr-filter') is not None else None}
    }, False)
    f.where()
    f.add(f'lower(pp.nome) like :nome', lambda v:(v!=None))
    f.add(f'pp.draft_ordem_id = :of_id', True)
    f.value("and")
    parameters = {**f.parameters}    
    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        response = db.executeList(lambda p, c, s: (
            f"""
            SELECT {c(f'{dql.columns}')} 
            FROM producao_palete pp
            {f.text}
            {s(dql.sort)} {p(dql.paging)}
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

    def checkArtigoSpecs(data, cursor):
        exists=0
        if ("id" in data):
            f = Filters({"id":data["id"]})
            f.where()
            f.add(f'artigospecs_id = :id', True)
            f.value("and")
            exists = db.exists("producao_tempaggordemfabrico",f,cursor).exists
            if (exists!=0):
                f = Filters({"id":data["id"]})
                f.where()
                f.add(f'id = :id', True)
                f.value("and")
                row = db.limit("producao_artigospecs",f,1,cursor).rows
                if (row[0]["produto_id"]==data["produto_id"] and row[0]["designacao"]==data["designacao"]):
                    exists = 1
                else:
                    exists = 2        
        return exists

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
                exists = checkArtigoSpecs(data,cursor)
                if (exists==0 or exists==2):
                    data["designacao"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S") if (not "designacao" in data or not data["designacao"]) else data["designacao"]
                    versao = getVersao(data,cursor)
                    if (exists==0 or exists==2):
                        id = upsertArtigoSpecs(data, versao, cursor)
                        if (exists==0):
                            deleteArtigoSpecsItems(id,cursor)
                        insertArtigoSpecsItems(id,data['nitems'],cursor)
                        return Response({"status": "success", "id":id, "title": "As Especificações foram Registadas com Sucesso!", "subTitle":f'Especificações {data["designacao"]}'})
                return Response({"status": "error", "title": "Não é possível alterar as Especificações! Estas já se encontram referenciadas em Ordens de Fabrico."})
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

#region CURRENT SETTINGS
@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def CurrentSettingsGet(request, format=None):
    cols = ['*']
    f = Filters(request.data['filter'])
    f.setParameters({
        "st": {"value": 3, "field": lambda k, v: f'{k}'},
    }, False)
    f.where()
    f.add(f'agg_of_id = :aggId', lambda v:(v!=None))
    f.add(f'status = :st',lambda v:"aggId" not in request.data['filter'])
    f.value("and")
    parameters = {**f.parameters}
    

    dql = db.dql(request.data, False, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                select 
                {dql.columns}
                from producao_currentsettings
                {f.text}
                {dql.sort}
            """
        ), cursor, parameters)
        return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def CurrentSettingsInProductionGet(request, format=None):
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                select * from
                (
                SELECT acs.*, max(acs.id) over () mx_id 
                from producao_currentsettings cs
                join audit_currentsettings acs on cs.id=acs.contextid
                where cs.status=3
                ) t
                where id=mx_id
            """
        ), cursor, {})
        return Response(response)



@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def LotesLookup(request, format=None):
    cols = ["ITMREF_0","UPDDATTIM_0","LOT_0", "QTYPCU_0", "PCUORI_0","LOC_0"]
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'lower("ITMREF_0") = lower(:item_cod)', lambda v:(v!=None))
    f.add(f'lower("LOT_0") like lower(:lote_cod)', True)
    f.add(f'"LOC_0" = :loc_cod', True)
    f.add(f'"STOFCY_0" = \'E01\'',True)
    f.value("and")
    parameters = {**f.parameters}   

    dql = dbgw.dql(request.data, False)
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")
    dql.columns = encloseColumn(cols)
    with connections[connGatewayName].cursor() as cursor:
       response = dbgw.executeSimpleList(lambda: (
         f'''
            SELECT {dql.columns}
            FROM {sageAlias}."STOCK" {f.text} {dql.sort} {dql.limit} --Where "ITMREF_0" = 'NNWSB0025000023' And "STOFCY_0" = 'E01'
         '''
         #f'SELECT {dql.columns} FROM {sageAlias}."BPCUSTOMER" {f["text"]} {dql.sort} {dql.limit}'
       ), cursor, parameters)
       return Response(response)



def getEmendas(data, cursor):
    vals = {
        "artigo_cod":data["artigo_cod"],
        "emendas_rolo":data["nemendas_rolo"],
        "tipo_emenda":data["tipo_emenda"],
        "maximo":data["maximo"],
        "paletes_contentor":data["nemendas_paletescontentor"]
    }
    if "cliente_cod" in data and data["cliente_cod"] is not None:
        vals["cliente_cod"]=data["cliente_cod"]
    f = Filters({"hashcode": hashlib.md5(json.dumps(vals).encode('utf-8')).hexdigest()[ 0 : 16 ]})
    f.setParameters({}, False)
    f.where()
    f.add(f'hashcode = :hashcode', True)
    f.value("and")   
    rows = db.executeSimpleList(lambda: (f'SELECT * FROM producao_emendas {f.text}'), cursor, f.parameters)['rows']
    return rows[0] if len(rows)>0 else None


def createEmendas(data,cursor):
    print("entri")
    print(data)
    emendas_id = None
    emenda = getEmendas(data,cursor)
    print("xxxxx")
    print(emenda)
    return
    if emenda is None:
        vals = {
            "artigo_cod":data["artigo_cod"],
            "emendas_rolo":data["nemendas_rolo"],
            "tipo_emenda":data["tipo_emenda"],
            "maximo":data["maximo"],
            "paletes_contentor":data["nemendas_paletescontentor"]
        }
        if "cliente_cod" in data and data["cliente_cod"] is not None:
            vals["cliente_cod"]=data["cliente_cod"]
        vals["hashcode"] = hashlib.md5(json.dumps(vals).encode('utf-8')).hexdigest()[ 0 : 16 ]
        if "cliente_nome" in data and data["cliente_nome"] is not None:
            vals["cliente_nome"]=data["cliente_nome"]
        vals["designacao"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        dml = db.dml(TypeDml.INSERT,vals,"producao_emendas",None,None,False)
        db.execute(dml.statement, cursor, dml.parameters)
        emendas_id = cursor.lastrowid
    else:
        emendas_id = data["emendas_id"] if "emendas_id" in data and data["emendas_id"] is not None else emenda["id"]
    vl = {"emendas_id":emendas_id,"n_paletes_total":data["n_paletes_total"],"cliente_cod":data["cliente_cod"],"cliente_nome":data["cliente_nome"]}
    if "core_cod" in data:
        vl["core_cod"] = data["core_cod"]
        vl["core_des"] = data["core_des"]
    dml = db.dml(TypeDml.UPDATE,vl,"producao_tempordemfabrico",{"id":f'=={data["ofabrico_id"]}'},None,False)
    db.execute(dml.statement, cursor, dml.parameters)
    return data["ofabrico_id"]



@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def UpdateCurrentSettings(request, format=None):
    data = request.data.get("parameters")

    def getCurrentSettings(data,cursor):
        f = Filters({"id": data["csid"],"status":3})
        f.where()
        f.add(f'id = :id', True)
        f.add(f'status = :status', True)
        f.value("and")  
        rows = db.executeSimpleList(lambda: (f'SELECT * FROM producao_currentsettings {f.text}'), cursor, f.parameters)['rows']
        if len(rows)>0:
            return rows[0]
        return None

    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'id = :csid', True)
    f.value("and")
    if data['type'].startswith('formulacao'):
        ok=1
        for v in data['formulacao']['items']:
            if "doseador_A" in v:
                pass
            elif  "doseador_B" in v or "doseador_C" in v:
                pass
            else:
                ok=0
                break
        data["formulacao"]["valid"] = ok
        dosers = []
        for v in data["formulacao"]["items"]:
            if "doseador_A" in v:
                dosers.append({
                    "nome":v["doseador_A"],
                    "grupo":v["cuba_A"],
                    "matprima_cod": v["matprima_cod"]
                })
            if "doseador_B" in v:
                dosers.append({
                    "nome":v["doseador_B"],
                    "grupo":v["cuba_BC"],
                    "matprima_cod": v["matprima_cod"]
                })
            if "doseador_C" in v:
                dosers.append({
                    "nome":v["doseador_C"],
                    "grupo":v["cuba_BC"],
                    "matprima_cod": v["matprima_cod"]
                })
        dta = {
            "dosers":json.dumps(dosers, ensure_ascii=False),
            "formulacao":json.dumps(data['formulacao'], ensure_ascii=False),
            "type_op":data['type']
        }
        dml = db.dml(TypeDml.UPDATE,dta,"producao_currentsettings",f,None,False)
        try:
            with connections["default"].cursor() as cursor:
                db.execute(dml.statement, cursor, dml.parameters)
            return Response({"status": "success", "id":request.data['filter']['csid'], "title": f'Definições Atuais Atualizadas com Sucesso', "subTitle":f""})
        except Exception as error:
            return Response({"status": "error", "id":request.data['filter']['csid'], "title": f'Definições Atuais', "subTitle":str(error)})
    if data['type'] == 'gamaoperatoria':
        items = []
        itms = collections.OrderedDict(sorted(data["gamaoperatoria"].items()))
        for i in range(data["gamaoperatoria"]['nitems']):            
            key = itms[f'key-{i}']
            values = [ v for k,v in itms.items() if k.startswith(f'v{key}-')]
            items.append({
                "item_des":itms[f'des-{i}'], 
                "item_values":values, 
                "tolerancia":itms[f'tolerancia-{i}'],
                "gamaoperatoria_id":data["gamaoperatoria"]['id'],
                "item_key":key,
                "item_nvalues":len(values)
            })
        dta = {
            "gamaoperatoria" : json.dumps({ 
                'id': data["gamaoperatoria"]['id'],
                'produto_id': data["gamaoperatoria"]["produto_id"],
                'designacao': data["gamaoperatoria"]["designacao"],
                'versao': data["gamaoperatoria"]["versao"],
                "created_date": data["gamaoperatoria"]["created_date"],
                "updated_date": data["gamaoperatoria"]["updated_date"],
                "items":items
            }, ensure_ascii=False),
            "type_op":"gamaoperatoria"
        }
        dml = db.dml(TypeDml.UPDATE,dta,"producao_currentsettings",f,None,False)
        try:
            with connections["default"].cursor() as cursor:
                db.execute(dml.statement, cursor, dml.parameters)
            return Response({"status": "success", "id":request.data['filter']['csid'], "title": f'Definições Atuais Atualizadas com Sucesso', "subTitle":f""})
        except Exception as error:
            return Response({"status": "error", "id":request.data['filter']['csid'], "title": f'Definições Atuais', "subTitle":str(error)})
    if data['type'] == 'specs':
        items = []
        itms = collections.OrderedDict(sorted(data["specs"].items()))
        for i in range(data["specs"]['nitems']):            
            key = itms[f'key-{i}']
            values = [ v for k,v in itms.items() if k.startswith(f'v{key}-')]
            items.append({
                "item_des":itms[f'des-{i}'], 
                "item_values":json.dumps(values),
                "artigospecs_id":data["specs"]['id'],
                "item_key":key,
                "item_nvalues":len(values)
            })
        dta = {
            "artigospecs":json.dumps({ 
                'id': data["specs"]['id'],
                'produto_id': data["specs"]["produto_id"],
                'designacao': data["specs"]["designacao"],
                'versao': data["specs"]["versao"],
                'cliente_cod': data["specs"]["cliente_cod"],
                'cliente_nome': data["specs"]["cliente_nome"],
                "created_date": data["specs"]["created_date"],
                "updated_date": data["specs"]["updated_date"],
                "items":items
            }, ensure_ascii=False),
            "type_op":"specs"
        }
        dml = db.dml(TypeDml.UPDATE,dta,"producao_currentsettings",f,None,False)
        try:
            with connections["default"].cursor() as cursor:
                db.execute(dml.statement, cursor, dml.parameters)
            return Response({"status": "success", "id":request.data['filter']['csid'], "title": f'Definições Atuais Atualizadas com Sucesso', "subTitle":f""})
        except Exception as error:
            return Response({"status": "error", "id":request.data['filter']['csid'], "title": f'Definições Atuais', "subTitle":str(error)})
    if data['type'] == 'cortes':
        dml = db.dml(TypeDml.UPDATE,{"cortes_id":data["cortes"]["cortes_id"],"cortesordem_id":data["cortes"]["cortesordem_id"]},"producao_currentsettings",f,None,False)
        dml.statement = f"""        
                update 
                producao_currentsettings pcs
                JOIN (
                select 
                %(csid)s csid,
                (select 
                JSON_OBJECT('created_date', pc.created_date,'id', pc.id,'largura_cod', pc.largura_cod,'largura_json', pc.largura_json,'updated_date', pc.updated_date
                ) cortes
                FROM producao_cortes pc
                where pc.id=%(cortes_id)s) cortes,
                (select 
                JSON_OBJECT('cortes_id', pco.cortes_id,'created_date', pco.created_date,'designacao', pco.designacao,'id', pco.id,'largura_ordem', pco.largura_ordem,'ordem_cod', 
                pco.ordem_cod,'updated_date', pco.updated_date,'versao', pco.versao
                ) cortesordem
                FROM producao_cortesordem pco
                WHERE pco.id=%(cortesordem_id)s) cortesordem
                ) tbl
                on tbl.csid=pcs.id
                set
                pcs.cortes = tbl.cortes,
                pcs.cortesordem = tbl.cortesordem,
                pcs.type_op = 'cortes'     
        """
        try:
            with connections["default"].cursor() as cursor:
                db.execute(dml.statement, cursor, dml.parameters)
            return Response({"status": "success", "id":request.data['filter']['csid'], "title": f'Definições Atuais Atualizadas com Sucesso', "subTitle":f""})
        except Exception as error:
            return Response({"status": "error", "id":request.data['filter']['csid'], "title": f'Definições Atuais', "subTitle":str(error)})
    if data['type'] == 'settings':
        try:
            with connections["default"].cursor() as cursor:
                cs = getCurrentSettings(data,cursor)
                if cs is None:
                    return Response({"status": "error", "id":None, "title": f'Erro ao Alterar Definições', "subTitle":"Não é possível alterar as Definições atuais."})
                print("data........")
                print(data)
                print("----")
                print(cs["ofs"])
                print("----")
                #print(cs["limites"])
                #print("----")
                #print(cs["cores"])
                #print("----")
                #print(cs["emendas"])
                #print("----")
                #print(cs["sentido_enrolamento"])
                #print(cs["amostragem"])
                print("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
                print(cs["ofs"])
                for x in json.loads(cs["ofs"]):
                    if x["of_id"]==data["ofabrico_cod"]:
                        print(x["of_id"])
                emendas = json.loads(cs["emendas"])
                for idx,x in enumerate(emendas):


# vals = {
#         "artigo_cod":data["artigo_cod"],
#         "emendas_rolo":data["nemendas_rolo"],
#         "tipo_emenda":data["tipo_emenda"],
#         "maximo":data["maximo"],
#         "paletes_contentor":data["nemendas_paletescontentor"]
#     }
#     if "cliente_cod" in data and data["cliente_cod"] is not None:


                    if x["of_id"]==data["ofabrico_cod"]:
                        print("####################################")
                        print(x)
                        emendas[idx]={**x,"maximo":data["maximo"],"tipo_emenda":data["tipo_emenda"],"emendas_rolo":data["nemendas_rolo"],"paletes_contentor":data["nemendas_paletescontentor"]}
                cores = json.loads(cs["cores"])
                for idx,x in enumerate(cores):
                    if x["of_id"]==data["ofabrico_cod"]:
                        cores[idx] = {**x,"core_cod":data["core_cod"],"core_des":data["core_des"]}
                limites = json.loads(cs["limites"])
                for x in json.loads(cs["limites"]):
                    if x["of_id"]==data["ofabrico_cod"]:
                        limites[idx] = {**x}

                return Response({"status": "success", "id":None, "title": f'Definições Atuais Atualizadas com Sucesso', "subTitle":f""})
            return Response({"status": "success", "id":request.data['filter']['csid'], "title": f'Definições Atuais Atualizadas com Sucesso', "subTitle":f""})
        except Exception as error:
            return Response({"status": "error", "id":None, "title": f'Definições Atuais', "subTitle":str(error)})


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def ChangeCurrSettingsStatus(request, format=None):
    data = request.data.get("parameters")
    def checkOfIsValid(id,data,cursor):
        f = Filters({"id": id})
        f.setParameters({}, False)
        f.where()
        f.add(f'id = :id', True)
        f.value("and")   
        return db.executeSimpleList(lambda: (f"""
            SELECT CASE WHEN 
            JSON_EXTRACT(formulacao, "$.valid")=1 AND 
            JSON_EXTRACT(cortes, "$.id") IS NOT NULL AND 
            JSON_EXTRACT(cortesordem, "$.id") IS NOT NULL 
            THEN 1 ELSE 0 END 
            valid
            FROM producao_currentsettings 
            {f.text}
        """), cursor, f.parameters)['rows'][0]['valid']

    def updateOP(id,data,cursor,status_str):
        dml = db.dml(TypeDml.UPDATE,{"id":id},"planeamento_ordemproducao",{},None,False)
        dml.statement = f"""
                update planeamento_ordemproducao op
                join (select t.ofid from
                (SELECT JSON_EXTRACT(ofs, "$[*].of_id") ofids FROM producao_currentsettings where id=%(id)s) ofs
                join JSON_TABLE(CAST(ofids as JSON), "$[*]" COLUMNS(ofid INT PATH "$")) t ON TRUE
                ) t on op.id=t.ofid
                set 
                {status_str}
        """
        db.execute(dml.statement, cursor, dml.parameters)

    def getLastOrder(ig_id,cursor):
        f = Filters({"id":ig_id})
        f.where(False,"and")
        f.add(f'ig_bobinagem_id = :id', True)
        f.value("and")  
        rows = db.executeSimpleList(lambda: (f'select IFNULL(max(`order`),0) n from lotesdosers where closed=0 and status<>0 {f.text}'), cursor, f.parameters)['rows']
        if len(rows)>0:
            return rows[0]
        return None

    try:
        with connections["default"].cursor() as cursor:
            if (data["status"]==3):
                print("Em producao")
                exists = db.exists("producao_currentsettings",{"status":3},cursor).exists
                if (exists==0):
                    #CHECK IF DOSERS AND CUTS ARE CORRECTLY DEFINED
                    if checkOfIsValid(data["id"],data,cursor)==1:
                        dml = db.dml(TypeDml.UPDATE, {"status":3,"type_op":"status_inproduction"} , "producao_currentsettings",{"id":f'=={data["id"]}'},None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                        updateOP(data["id"],data,cursor,"`status`=3,ativa=1,completa=0")
                        return Response({"status": "success", "id":0, "title": f'Ordem de Fabrico Iniciada!', "subTitle":f""})
                    else:
                        return Response({"status": "error", "id":0, "title": f'A formulação ou Posição dos Cortes não estão corretamente definidos !', "subTitle":""})
            elif (data["status"]==0):
                print("redo plan....")
                pass
            elif (data["status"]==1):
                print("stop")
                exists = db.exists("producao_currentsettings",{"status":3},cursor).exists
                if (exists==1):
                        dml = db.dml(TypeDml.UPDATE, {"status":1,"type_op":"status_stopped"} , "producao_currentsettings",{"id":f'=={data["id"]}'},None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                        updateOP(data["id"],data,cursor,"`status`=2,ativa=0,completa=0")
                        return Response({"status": "success", "id":0, "title": f'Ordem de Fabrico Parada!', "subTitle":f""})
            elif (data["status"]==9):
                exists = db.exists("producao_currentsettings",{"status":"<9"},cursor).exists
                print("finish")
                print(exists)
                if (exists==1):
                        maxOrder = getLastOrder(data["ig_id"],cursor)
                        dml = db.dml(TypeDml.UPDATE, {"status":9,"type_op":"status_finished"} , "producao_currentsettings",{"id":f'=={data["id"]}'},None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                        updateOP(data["id"],data,cursor,"`status`=9,ativa=0,completa=1")
                        t_stamp = datetime.strptime(data["date"], "%Y-%m-%d %H:%M:%S") if data["last"] == False else datetime.now()
                        ld = {"doser":"X","status":-1,"t_stamp":t_stamp,"agg_of_id":data["agg_of_id"],"type_mov":"END","`order`":maxOrder["n"]+1,"closed":0}
                        dml = db.dml(TypeDml.INSERT, ld , "lotesdosers",None,None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                        return Response({"status": "success", "id":0, "title": f'Ordem de Fabrico Finalizada!', "subTitle":f""})
                pass
    except Exception as error:
        return Response({"status": "error", "id":0, "title": f'Erro ao alterar estado.', "subTitle":str(error)})
    return Response({"status": "error", "id":0, "title": f'Já existe uma Ordem de Fabrico em Curso!', "subTitle":""})




        # items = []
        # itms = collections.OrderedDict(sorted(data["specs"].items()))
        # for i in range(data["specs"]['nitems']):            
        #     key = itms[f'key-{i}']
        #     values = [ v for k,v in itms.items() if k.startswith(f'v{key}-')]
        #     items.append({
        #         "item_des":itms[f'des-{i}'], 
        #         "item_values":json.dumps(values),
        #         "artigospecs_id":data["specs"]['id'],
        #         "item_key":key,
        #         "item_nvalues":len(values)
        #     })
        # dta = {
        #     "artigospecs":json.dumps({ 
        #         'id': data["specs"]['id'],
        #         'produto_id': data["specs"]["produto_id"],
        #         'designacao': data["specs"]["designacao"],
        #         'versao': data["specs"]["versao"],
        #         'cliente_cod': data["specs"]["cliente_cod"],
        #         'cliente_nome': data["specs"]["cliente_nome"],
        #         "created_date": data["specs"]["created_date"],
        #         "updated_date": data["specs"]["updated_date"],
        #         "items":items
        #     }, ensure_ascii=False)
        # }
        # dml = db.dml(TypeDml.UPDATE,dta,"producao_currentsettings",f,None,False)
        # try:
        #     with connections["default"].cursor() as cursor:
        #         db.execute(dml.statement, cursor, dml.parameters)
        #     return Response({"status": "success", "id":request.data['filter']['csid'], "title": f'Definições Atuais Atualizadas com Sucesso', "subTitle":f""})
        # except Exception as error:
        #     return Response({"status": "error", "id":request.data['filter']['csid'], "title": f'Definições Atuais', "subTitle":str(error)})


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

    def checkNonwovens(data, cursor):
        exists=0
        if ("id" in data):
            f = Filters({"id":data["id"]})
            f.where()
            f.add(f'nonwovens_id = :id', True)
            f.value("and")
            exists = db.exists("producao_tempaggordemfabrico",f,cursor).exists
            if (exists!=0):
                f = Filters({"id":data["id"]})
                f.where()
                f.add(f'id = :id', True)
                f.value("and")
                row = db.limit("producao_artigononwovens",f,1,cursor).rows
                if (row[0]["produto_id"]==data["produto_id"] and row[0]["designacao"]==data["designacao"]):
                    exists = 1
                else:
                    exists = 2        
        return exists

    def upsertNonwovens(data, versao, cursor):
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
                exists = checkNonwovens(data,cursor)
                if (exists==0 or exists==2):
                    data["designacao"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S") if (not "designacao" in data or not data["designacao"]) else data["designacao"]
                    versao = getVersao(data,cursor)
                    if (exists==0 or exists==2):
                        id = upsertNonwovens(data, versao, cursor)
                        return Response({"status": "success", "id":id, "title": "Os Nonwovens foram Registados com Sucesso!", "subTitle":f'Nonwovens {data["designacao"]}'})
                return Response({"status": "error", "title": "Não é possível alterar os Nonwovens! Estes já se encontram referenciados em Ordens de Fabrico."})                
    except Error:
        return Response({"status": "error", "title": "Erro ao Registar os Nonwovens!"})

#endregion

#region EMENDAS
@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def EmendasLookup(request, format=None):
    cols = ['*']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'em.cliente_cod = :cliente_cod', lambda v:(v!=None))
    f.add(f'em.artigo_cod = :artigo_cod', True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                select 
                {dql.columns}
                from producao_emendas em
                {f.text}
                {dql.sort}
                {dql.limit}
            """
        ), cursor, parameters)
        return Response(response)


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
    connection = connections[connGatewayName].cursor()
    cols = ["""
    pc.id cortes_id, pc.largura_cod, pc.largura_json, tof.of_id,
    tof.item_cod,itm_sage."ITMDES1_0" item_des, itm.lar item_lar, pco.designacao, pco.largura_ordem, pco.id largura_id, toaf.cortesordem_id
    """]
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'toaf.id = :agg_id', True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = dbgw.dql(request.data, False)
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")
    dql.columns = encloseColumn(cols,False)
    with connections[connGatewayName].cursor() as cursor:
        response = dbgw.executeSimpleList(lambda: (
            f"""              
                select 
                {dql.columns}
                from {sgpAlias}.producao_tempordemfabrico tof
                join {sgpAlias}.producao_tempaggordemfabrico toaf on toaf.id = tof.agg_of_id
                join {sgpAlias}.producao_artigo itm on itm.cod = tof.item_cod
                join {sageAlias}."ITMMASTER" itm_sage on itm_sage."ITMREF_0" = tof.item_cod
                left join {sgpAlias}.producao_cortes pc on toaf.cortes_id= pc.id
                left join {sgpAlias}.producao_cortesordem pco on pc.id= pco.cortes_id and toaf.cortesordem_id = pco.id
                {f.text}
                {dql.sort}
            """
        ), connection, parameters)
        #pca.id cortes_artigo_id,pca.largura cortes_artigo_lar, COALESCE(pca.ncortes,1) cortes_artigo_ncortes
#left join {sgpAlias}.producao_cortesartigos pca on pca.cortes_id = pc.id and pca.of_id = tof.of_id and pca.artigo_cod = tof.item_cod
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
        list = sorted(data['cortes'], key=lambda k: int(k['item_lar']))
        cod = {}
        largura_util = 0
        for v in list:
            keyncortes = "cortes_artigo_ncortes" if "cortes_artigo_ncortes" in v else "item_ncortes"
            cod[v["item_lar"]] = v[keyncortes] if v["item_lar"] not in cod else cod[v["item_lar"]] + v[keyncortes]
            largura_util = largura_util + ( int(v["item_lar"])*v[keyncortes] )
        return {"json":json.dumps(cod),"cod":hashlib.md5(json.dumps(cod).encode('utf-8')).hexdigest()[ 0 : 16 ],"largura_util":largura_util}

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
            "largura_util": larguras["largura_util"],
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
                larguras = computeLarguraCod(data)
                cortes_id = getCortesId(larguras,cursor)
                cortes_id = insertCortes(cortes_id, larguras, data, cursor)
                if 'agg_id' in data:
                    #deleteCortesArtigos(cortes_id,cursor)
                    #insertCortesArtigos(cortes_id,data,cursor)
                    cortes_are_equal = data["cortes"][0]["largura_cod"] == larguras["cod"]
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
        dml = db.dml(TypeDml.UPDATE, {"cortes_id":None,"cortesordem_id":None,"horas_previstas_producao":None,"end_prev_date":None} , "producao_tempaggordemfabrico",{"id":data["agg_id"]},None,False)
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

#region ATTACHMENTS

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def OfAttachmentsGet(request, format=None):
    #conn = connections[connGatewayName].cursor()
    cols = ['*']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'of_id = :of_id', True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                select 
                {dql.columns}
                from producao_attachments
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
def OfAttachmentsChange(request, format=None):
    print(f"{request.data}")
    if "type" in request.data:
        try:
            with transaction.atomic():
                with connections["default"].cursor() as cursor:
                    if request.data.get("type") == "changedtypes":
                        for key, value in request.data.get("changedTypes").items():
                            dml = db.dml(TypeDml.UPDATE, {"tipo_doc":value}, "producao_attachments",{"id":key},None,None)
                            db.execute(dml.statement, cursor, dml.parameters)
                    elif request.data.get("type") == "remove":
                            dml = db.dml(TypeDml.DELETE, {}, "producao_attachments",{"id":request.data.get("id")},None,None)
                            db.execute(dml.statement, cursor, dml.parameters)
            return Response({"status": "success", "title": "Anexo(s) alterado(s) com Sucesso!", "subTitle":''})
        except Error:
            return Response({"status": "error", "title": "Erro ao Alterar Anexo(s)!"})
    return Response({"status": "error", "title": "Erro de Parâmetros"})
    
@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
# @transaction.atomic()
def OfUpload(request, format=None):
    statements = []
    folder = request.data.get("of_id").replace("\\","_").replace("/","_")
    fs = FileSystemStorage(f'docs/OF/{folder}')
    for k, v in request.FILES.items():
        filename = fs.save(f'{v.name}', v)
        statements.append(f"('{request.data.get(f'{k}_type')}','docs/OF/{folder}/{filename}',{request.data.get('tempof_id')},'{datetime.now()}')")
        #data.append({"tipo_doc":request.data.get(f'{k}_type'),"path":f'docs/OF/{folder}/{filename}'})
    statement = f"""
        INSERT INTO 
        producao_attachments(tipo_doc,path,of_id,created_date)
        VALUES
        {','.join(statements)}
    """
    if len(statements) == 0:
        return Response({"status": "error", "title": "Não foram selecionados Ficheiros!"})
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                db.execute(statement, cursor, {})
        return Response({"status": "success","id":"", "title": "Os Ficheiros foram Guardados com Sucesso!", "subTitle":""})
    except Error:
        return Response({"status": "error", "title": "Erro ao Guardar os Ficheiros!"})

#endregion

#region TEMP ORDEMFABRICO SCHEMA

def computeProductionHours(aggid,cursor):
    f=None
    rows=None
    f = Filters({"id": aggid})
    f.setParameters({}, False)
    f.where()
    f.add(f'tofa.id = :id', True)
    f.value("and")
    rows = db.executeSimpleList(lambda: (
        f"""
            select 
            tbl.*,JSON_EXTRACT(goi.item_values, '$[0]') speed,co.largura_util
            from(
            SELECT 
            tofa.id, tofa.gamaoperatoria_id,tofa.cortes_id,sum(tof.qty_encomenda) qty, tofa.start_prev_date
            FROM producao_tempaggordemfabrico tofa
            join producao_tempordemfabrico tof on tof.agg_of_id=tofa.id
            {f.text}
            group by tofa.id,tofa.gamaoperatoria_id,tofa.cortes_id
            ) tbl
            join producao_gamaoperatoriaitems goi on goi.gamaoperatoria_id = tbl.gamaoperatoria_id and goi.item_key='D'
            join producao_cortes co on co.id = tbl.cortes_id
        """    
    ), cursor, f.parameters)['rows']
    if len(rows)>0:
        start_prev_date = rows[0]["start_prev_date"]
        qty = int(rows[0]["qty"])
        speed = int(rows[0]["speed"])
        usable_width = int(rows[0]["largura_util"])
        hours=0
        width = usable_width/1000
        goal_time = 0.9
        goal_quality = 0.9
        hours = (((qty/(speed*width))/goal_time)/goal_quality)/60  #"{:.0f}H:{:.0f}m".format(*divmod(((qty/(speed*width))/goal_time)/goal_quality, 60))
        end_prev_date = start_prev_date + timedelta(hours=hours)
        return {"hours":math.ceil(hours),"end_prev_date":end_prev_date}    
    return {"hours":0,"end_prev_date":None}

# def computeProductionHours(data,cursor):
#     if ("ofabrico_id" in data):
#         f=None
#         rows=None
#         if "ofabrico_id" in data:
#             f = Filters({"id": data["ofabrico_id"]})
#             f.setParameters({}, False)
#             f.where()
#             f.add(f'id = :id', True)
#             f.value("and")
#             rows = db.executeSimpleList(lambda: (
#                 f"""
#                     select 
#                     tbl.*,JSON_EXTRACT(goi.item_values, '$[0]') speed,co.largura_util
#                     from(
#                     SELECT 
#                     tofa.id, tofa.gamaoperatoria_id,tofa.cortes_id,sum(tof.qty_encomenda) qty, tofa.start_prev_date
#                     FROM producao_tempaggordemfabrico tofa
#                     join producao_tempordemfabrico tof on tof.agg_of_id=tofa.id
#                     where 
#                     tofa.id in (SELECT agg_of_id FROM producao_tempordemfabrico {f.text})
#                     group by tofa.id,tofa.gamaoperatoria_id,tofa.cortes_id
#                     ) tbl
#                     join producao_gamaoperatoriaitems goi on goi.gamaoperatoria_id = tbl.gamaoperatoria_id and goi.item_key='D'
#                     join producao_cortes co on co.id = tbl.cortes_id
#                 """    
#             ), cursor, f.parameters)['rows']
#         if len(rows)>0:
#             start_prev_date = rows[0]["start_prev_date"]
#             qty = int(rows[0]["qty"])
#             speed = int(rows[0]["speed"])
#             usable_width = int(rows[0]["largura_util"])
#             hours=0
#             width = usable_width/1000
#             goal_time = 0.9
#             goal_quality = 0.9
#             hours = (((qty/(speed*width))/goal_time)/goal_quality)/60  #"{:.0f}H:{:.0f}m".format(*divmod(((qty/(speed*width))/goal_time)/goal_quality, 60))
#             end_prev_date = start_prev_date + timedelta(hours=hours)
#             return {"hours":hours,"end_prev_date":end_prev_date}    
#     return {"hours":0,"end_prev_date":None}

def getSageCliente(cod):
    cols = ['BPCNUM_0', 'BPCNAM_0','BPCSHO_0']
    f = Filters({"cod": cod})
    f.setParameters({}, False)
    f.where()
    f.add(f'"BPCNUM_0" = :cod', True)
    f.value("and")
    dql = db.dql({})
    dql.columns = encloseColumn(cols,True)
    sageAlias = dbgw.dbAlias.get("sage")
    with connections[connGatewayName].cursor() as cursor:
        rows = dbgw.executeSimpleList(lambda: (
          f'''            
            SELECT {dql.columns} FROM {sageAlias}."BPCUSTOMER" {f.text}            
            '''
        ), cursor, f.parameters)['rows']
        return rows[0] if len(rows)>0 else None 

def getSageEncomenda(cod):
    cols = []
    f = Filters({"cod": cod})
    f.setParameters({}, False)
    f.where()
    f.add(f'"enc"."SOHNUM_0" = :cod', True)
    f.value("and")
    sageAlias = dbgw.dbAlias.get("sage")
    with connections[connGatewayName].cursor() as cursor:
        rows = dbgw.executeSimpleList(lambda: (
          f'''            
            SELECT 
            tbl.*,
            round(sqm/5400)+1 as num_paletes
            FROM
            (
            SELECT 
            DISTINCT ON ("enc"."SOHNUM_0") "enc"."SOHNUM_0" ,"enc"."PRFNUM_0","enc"."ORDDAT_0","enc"."DEMDLVDAT_0", "enc"."SHIDAT_0", "enclin"."EXTDLVDAT_0",
            SUM("enclin"."QTY_0") OVER w as sqm
            FROM {sageAlias}."SORDER" as enc
            JOIN {sageAlias}."SORDERQ" as enclin on enc."SOHNUM_0" = enclin."SOHNUM_0" 
            JOIN {sageAlias}."ITMMASTER" as itm on enclin."ITMREF_0" = itm."ITMREF_0"  
            {f.text}
            WINDOW w AS (PARTITION BY "enc"."SOHNUM_0")
            ) tbl            
            '''
        ), cursor, f.parameters)['rows']
        return rows[0] if len(rows)>0 else None 

def sgpSaveEncomendaCliente(clienteId,encomendaId,clientCod,orderCod,userId,cursor):
    print(f"FORPRODUCTION---{userId} -- ")
    if clienteId is None:
        #INSERIR CLIENTE NO SGP (não existe)
        sage_cliente = getSageCliente(clientCod)
        print(f"Insert into clients--- -- {sage_cliente} -- ")
    if encomendaId is None:
        #INSERIR ENCOMENDA NO SGP (Não existe)
        sage_order = getSageEncomenda(orderCod)
        if sage_order is not None:
            dta={
                "timestamp": datetime.now(),
                "data":datetime.now(),
                "eef":sage_order["SOHNUM_0"],
                "prf":sage_order["PRFNUM_0"],
                "sqm":sage_order["sqm"],
                "estado":'A',
                "num_cargas":0,
                "num_cargas_actual":0,
                "num_paletes":sage_order["num_paletes"],
                "num_paletes_actual":0,
                "data_encomenda":sage_order["ORDDAT_0"],
                "data_expedicao":sage_order["SHIDAT_0"],
                "data_prevista_expedicao":sage_order["EXTDLVDAT_0"],
                "data_solicitada":sage_order["DEMDLVDAT_0"],
                "prazo":0,
                "user_id":userId,
                "cliente_id":clienteId
            }
            dml = db.dml(TypeDml.INSERT, dta, "producao_encomenda")
            db.execute(dml.statement, cursor, dml.parameters)
            encomendaId = cursor.lastrowid
    return {"clienteId":clienteId,"encomendaId":encomendaId}

def sgpForProduction(data,aggid,user,cursor):
    #Funcção que retorna todas as OF Planeadas da Agg
    def GetOrdensFabrico(aggId, cursor):
        f = Filters({"agg_of_id": aggId})
        f.setParameters({}, False)
        f.where()
        f.add(f'pto.agg_of_id = :agg_of_id', True)
        f.value("and")   
        rows = db.executeSimpleList(lambda: (f''' 
            SELECT
            pto.id,of_id,pto.core_cod,pto.core_des,
            JSON_OBJECT(
            'id',pa.id,'cod',pa.cod,'des',pa.des,'tipo',pa.tipo,'gtin',pa.gtin,'core',pa.core,'diam_ref',pa.diam_ref,
            'formu',pa.formu,'gsm',pa.gsm,'lar',pa.lar,'nw1',pa.nw1,'nw2',pa.nw2,'produto',pa.produto,
            'produto_id',pa.produto_id,'thickness',pa.thickness,'produto_cod',pprod.produto_cod
            ) as artigo,
            JSON_OBJECT(
            'designacao', pe.designacao, 'tipo_emenda', pe.tipo_emenda, 'maximo', pe.maximo, 'emendas_rolo', pe.emendas_rolo,
            'paletes_contentor', pe.paletes_contentor
            ) as emendas,
            JSON_OBJECT(
            'descentrado_min',0,'descentrado_max',3,'conico_min',0,'conico_max',6,'diametros',900,'diametro_dm12',900) as limites,
            JSON_OBJECT(
            'id',pp.id,'cliente_cod',pp.cliente_cod,'artigo_cod',pp.artigo_cod,'contentor_id',pp.contentor_id,'filmeestiravel_bobines',pp.filmeestiravel_bobines,
            'filmeestiravel_exterior',pp.filmeestiravel_exterior,'cintas',pp.cintas,'ncintas',pp.ncintas,'paletes_sobrepostas',pp.paletes_sobrepostas,'npaletes',pp.npaletes, 
            'palete_maxaltura',pp.palete_maxaltura,'netiquetas_bobine',pp.netiquetas_bobine,'netiquetas_lote',pp.netiquetas_lote,'netiquetas_final',pp.netiquetas_final,      
            'designacao',pp.designacao,'cintas_palete',pp.cintas_palete,'cliente_nome',pp.cliente_nome,
            'details', (select JSON_ARRAYAGG(JSON_OBJECT('order',ppdb.item_order,'num_bobines',ppdb.item_numbobines))
            FROM producao_paletizacaodetails ppdb WHERE ppdb.paletizacao_id=pp.id and ppdb.item_id=2)
            ) paletizacao_bobines,
            JSON_OBJECT(
            'id',pp.id,'cliente_cod',pp.cliente_cod,'artigo_cod',pp.artigo_cod,'contentor_id',pp.contentor_id,'filmeestiravel_bobines',pp.filmeestiravel_bobines,
            'filmeestiravel_exterior',pp.filmeestiravel_exterior,'cintas',pp.cintas,'ncintas',pp.ncintas,'paletes_sobrepostas',pp.paletes_sobrepostas,'npaletes',pp.npaletes, 
            'palete_maxaltura',pp.palete_maxaltura,'netiquetas_bobine',pp.netiquetas_bobine,'netiquetas_lote',pp.netiquetas_lote,'netiquetas_final',pp.netiquetas_final,      
            'designacao',pp.designacao,'cintas_palete',pp.cintas_palete,'cliente_nome',pp.cliente_nome,
            'details', (select JSON_ARRAYAGG(JSON_OBJECT('id', ppd.id,'item_des', ppd.item_des,'item_id', ppd.item_id,'item_numbobines', ppd.item_numbobines,
            'item_order', ppd.item_order,'item_paletesize', ppd.item_paletesize,'paletizacao_id', ppd.paletizacao_id))
            FROM producao_paletizacaodetails ppd WHERE ppd.paletizacao_id=pp.id)
            ) paletizacao,
            JSON_OBJECT(
            'id',pan.id,'designacao',pan.designacao,'versao',pan.versao,'nw_cod_sup',pan.nw_cod_sup,
            'nw_des_sup',pan.nw_des_sup,'nw_cod_inf',pan.nw_cod_inf,'nw_des_inf',pan.nw_des_inf,'produto_id',pan.produto_id
            ) nonwovens,
            (select JSON_ARRAYAGG(JSON_OBJECT('created_date', patt.created_date,'id', patt.id,'of_id', patt.of_id,'path', patt.path,'tipo_doc', patt.tipo_doc))
            FROM producao_attachments patt WHERE patt.of_id=pto.id) attachments,
            pto.cliente_cod, pto.cliente_nome, pc.id as cliente_id,
            pto.order_cod, penc.id as encomenda_id,
            (select JSON_ARRAYAGG(ppal.id)
            FROM producao_palete ppal WHERE ppal.draft_ordem_id=pto.id) paletesstock,
            (select count(*) from producao_palete tpp where tpp.draft_ordem_id=pto.id) n_paletes_stock,
            pto.n_paletes_total,ptoagg.sentido_enrolamento, ptoagg.amostragem
            FROM producao_tempordemfabrico pto
            JOIN producao_tempaggordemfabrico ptoagg on pto.agg_of_id = ptoagg.id
            JOIN producao_artigononwovens pan on pan.id = ptoagg.nonwovens_id
            JOIN producao_emendas pe on pe.id=pto.emendas_id
            JOIN producao_artigo pa on pa.id=pto.item_id
            JOIN producao_produtos pprod on pto.produto_id=pprod.id        
            JOIN producao_paletizacao pp on pto.paletizacao_id=pp.id       
            LEFT JOIN producao_cliente pc on pc.cod = pto.cliente_cod      
            LEFT JOIN producao_encomenda penc on penc.eef = pto.order_cod  
            {f.text}
        '''), cursor, f.parameters)['rows']
        return rows

    def GetAggData(aggId,ops, cursor):
        f = Filters({"agg_of_id": aggId})
        f.setParameters({}, False)
        f.where()
        f.add(f'ptoagg.id = :agg_of_id', True)
        f.value("and")   
        rows = db.executeSimpleList(lambda: (f''' 
            SELECT 
            ptoagg.id, ptoagg.status,ptoagg.amostragem,
            JSON_OBJECT('cliente_cod', pfo.cliente_cod,'cliente_nome', pfo.cliente_nome,'created_date', pfo.created_date,'designacao', pfo.designacao,'extr0', 
            pfo.extr0,'extr0_val', pfo.extr0_val,'extr1', pfo.extr1,'extr1_val', pfo.extr1_val,'extr2', pfo.extr2,'extr2_val', 
            pfo.extr2_val,'extr3', pfo.extr3,'extr3_val', pfo.extr3_val,'extr4', pfo.extr4,'extr4_val', pfo.extr4_val,'id', 
            pfo.id,'produto_id', pfo.produto_id,'updated_date', pfo.updated_date,'versao', pfo.versao,
            'items',(select JSON_ARRAYAGG(JSON_OBJECT('arranque', pfomp.arranque,'densidade', pfomp.densidade,'extrusora', 
            pfomp.extrusora,'formulacao_id', pfomp.formulacao_id,'id', pfomp.id,'mangueira', pfomp.mangueira,'matprima_cod', 
            pfomp.matprima_cod,'matprima_des', pfomp.matprima_des,'tolerancia', pfomp.tolerancia,'vglobal', pfomp.vglobal))
            FROM producao_formulacaomateriasprimas pfomp where pfomp.formulacao_id = ptoagg.formulacao_id))
            formulacao,
            JSON_OBJECT('created_date', pan.created_date,'designacao', pan.designacao,'id', pan.id,'nw_cod_inf', pan.nw_cod_inf,'nw_cod_sup', 
            pan.nw_cod_sup,'nw_des_inf', pan.nw_des_inf,'nw_des_sup', pan.nw_des_sup,'produto_id', pan.produto_id,'updated_date', pan.updated_date,'versao', pan.versao
            ) nonwovens,
            JSON_OBJECT('cortes_id', pco.cortes_id,'created_date', pco.created_date,'designacao', pco.designacao,'id', pco.id,'largura_ordem', pco.largura_ordem,'ordem_cod', 
            pco.ordem_cod,'updated_date', pco.updated_date,'versao', pco.versao
            ) cortesordem,
            JSON_OBJECT('created_date', pc.created_date,'id', pc.id,'largura_cod', pc.largura_cod,'largura_json', pc.largura_json,'updated_date', pc.updated_date
            ) cortes,
            JSON_OBJECT('id',pas.id,'designacao',pas.designacao,'versao',pas.versao,'created_date', pas.created_date,'updated_date', pas.updated_date,'cliente_cod',pas.cliente_cod,'cliente_nome',pas.cliente_nome,'produto_id',pas.produto_id,
            'items',  (select JSON_ARRAYAGG(JSON_OBJECT('id',pasi.id,'item_des',pasi.item_des,'item_values',pasi.item_values,'item_key',
            pasi.item_key,'artigospecs_id',pasi.artigospecs_id,'item_nvalues',pasi.item_nvalues)) j
            from producao_artigospecsitems pasi where pasi.artigospecs_id = ptoagg.artigospecs_id)
            ) specs,
            JSON_OBJECT('created_date', pgo.created_date,'designacao', pgo.designacao,'id', pgo.id,'produto_id', pgo.produto_id,'updated_date', 
            pgo.updated_date,'versao', pgo.versao,'items',( SELECT JSON_ARRAYAGG(JSON_OBJECT('gamaoperatoria_id', pgoi.gamaoperatoria_id,'id', pgoi.id,'item_des', pgoi.item_des,'item_key', pgoi.item_key,
            'item_nvalues', pgoi.item_nvalues,'item_values', pgoi.item_values,'tolerancia', pgoi.tolerancia))
            FROM producao_gamaoperatoriaitems pgoi WHERE pgoi.gamaoperatoria_id = ptoagg.gamaoperatoria_id)
            ) gamaoperatoria,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('agg_of_id', tof.agg_of_id,'agg_ofid_original', tof.agg_ofid_original,'cliente_cod', tof.cliente_cod,'cliente_nome', 
            tof.cliente_nome,'core_cod', tof.core_cod,'core_des', tof.core_des,'emendas_id', tof.emendas_id,'draft_of_id', tof.id,'item_cod', tof.item_cod,'item_id', tof.item_id,
            'linear_meters', tof.linear_meters,'n_paletes', tof.n_paletes,'n_paletes_total', tof.n_paletes_total,
            'n_bobines_palete',(SELECT SUM(v) FROM JSON_TABLE(tof.n_paletes, '$.items[*].num_bobines' COLUMNS (v INT PATH '$')) t),
            'n_voltas', tof.n_voltas,'of_cod', tof.of_id,'order_cod', 
            tof.order_cod,'paletizacao_id', tof.paletizacao_id,'prf_cod', tof.prf_cod,'produto_id', tof.produto_id,'qty_encomenda', tof.qty_encomenda,
            'sqm_bobine', tof.sqm_bobine,'of_id',pop.id,'item_des',pa.des,'produto_id',pa.produto_id,'produto_cod',ppr.produto_cod,'artigo_id', pa.id, 
            'artigo_cod', pa.cod, 'artigo_des', pa.des, 'artigo_tipo', pa.tipo, 'artigo_gtin', pa.gtin, 'artigo_core', pa.core, 'artigo_diam_ref', pa.diam_ref, 'artigo_formu', pa.formu, 'artigo_gsm', pa.gsm, 
            'artigo_lar', pa.lar, 'artigo_nw1', pa.nw1, 'artigo_nw2', pa.nw2, 'artigo_produto', pa.produto, 'artigo_produto_id', pa.produto_id, 'artigo_thickness', pa.thickness)) 
            FROM producao_tempordemfabrico tof 
            JOIN producao_artigo pa on pa.id = tof.item_id
            JOIN producao_produtos ppr on ppr.id = pa.produto_id
            JOIN planeamento_ordemproducao pop on pop.draft_ordem_id = tof.id 
            WHERE tof.agg_of_id=ptoagg.id) ofs,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT("draft_of_id",pop.draft_ordem_id ,"of_cod",pop.ofid, "of_id" ,pop.id , "paletes",
			(SELECT JSON_ARRAYAGG(JSON_OBJECT("id",ppal.id,"nome",ppal.nome)) FROM producao_palete ppal where ppal.ordem_id = pop.id)
			)) paletesstock
			FROM planeamento_ordemproducao pop
			where pop.id in ({ops})) paletesstock,
            pcs.id cs_id
            FROM producao_tempaggordemfabrico ptoagg 
            JOIN producao_formulacao pfo on pfo.id = ptoagg.formulacao_id
            JOIN producao_artigononwovens pan on pan.id = ptoagg.nonwovens_id
            JOIN producao_artigospecs pas on pas.id = ptoagg.artigospecs_id
            JOIN producao_gamaoperatoria pgo on pgo.id = ptoagg.gamaoperatoria_id
            JOIN producao_cortes pc on pc.id = ptoagg.cortes_id
            LEFT JOIN producao_cortesordem pco on pco.id = ptoagg.cortesordem_id
            LEFT JOIN producao_currentsettings pcs on pcs.agg_of_id = ptoagg.id
            {f.text}
        '''), cursor, f.parameters)['rows']
        return rows

    #Se a ação for para criar as ordens de produção/fabrico
    if 'forproduction' in data and data['forproduction']==True:
        ofs = GetOrdensFabrico(aggid,cursor)
        hours = computeProductionHours(aggid,cursor)
        if len(ofs)>0:
            #Update Agg status
            dml = db.dml(TypeDml.UPDATE,{"status":1,"end_prev_date":hours["end_prev_date"],"horas_previstas_producao":hours["hours"]},"producao_tempaggordemfabrico",{"id":f'=={aggid}'},None,False)
            db.execute(dml.statement, cursor, dml.parameters)
        emendas = []
        paletizacao = []
        cores = []
        limites = []

        ops=[]
        encss = []
        for idx, ordemfabrico in enumerate(ofs):
            if (ordemfabrico['encomenda_id'] not in encss):
                vals = sgpSaveEncomendaCliente(ordemfabrico['cliente_id'],ordemfabrico['encomenda_id'],ordemfabrico['cliente_cod'],ordemfabrico['order_cod'],user.id,cursor)
                encss.append(ordemfabrico['encomenda_id'])

            #Registar ordem de produção....
            _artigo = json.loads(ordemfabrico['artigo'])
            _emendas = json.loads(ordemfabrico['emendas'])
            _paletizacao = json.loads(ordemfabrico['paletizacao_bobines'])
            _nonwovens = json.loads(ordemfabrico['nonwovens'])

            #Attachments
            atts = {}
            if ordemfabrico['attachments'] is not None:
                _attachments = json.loads(ordemfabrico['attachments'])
                for idx, att in enumerate(_attachments):
                    tipo_doc = att["tipo_doc"]
                    att_path = "/".join((att["path"].split('/')[1:]))
                    if tipo_doc.lower() == "ficha de processo":
                        atts["ficha_processo"] = att_path
                    elif tipo_doc.lower() == "resumo de produção":
                        atts["res_prod"] = att_path
                    elif tipo_doc.lower() == "ficha técnica":
                        atts["ficha_tecnica"] = att_path
                    elif tipo_doc.lower() == "packing list":
                        atts["pack_list"] = att_path
                    elif tipo_doc.lower() == "orientação qualidade":
                        atts["ori_qua"] = att_path
                    elif tipo_doc.lower() == "ordem de fabrico":
                        atts["`of`"] = att_path


            tipoemendas = { "1": "Fita Preta", "2": "Fita metálica e Fita Preta","3": "Fita metálica" }
            enrolamento = {"1": "Anti-horário", "2":"Horário"}
            #delta = datetime.strptime(data["end_prev_date"], "%Y-%m-%d %H:%M:%S") - datetime.strptime(data["start_prev_date"], "%Y-%m-%d %H:%M:%S")
            dta = {
                **atts,
                "timestamp": datetime.now(),
                "op": ordemfabrico["cliente_nome"] + ' L' + str(int(_artigo['lar'])) + ' LINHA ' + ordemfabrico["order_cod"],
                "largura": _artigo['lar'],
                "core": _artigo['core'] + '"',
                "num_paletes_produzir":ordemfabrico['n_paletes_total'] - ordemfabrico['n_paletes_stock'],
                "num_paletes_stock":ordemfabrico['n_paletes_stock'],
                "num_paletes_total":ordemfabrico['n_paletes_total'],
                "emendas":f"{_emendas['emendas_rolo']}/rolo (máximo {_emendas['maximo']}% - {_emendas['paletes_contentor']} paletes/contentor)",
                "nwsup":_nonwovens['nw_des_sup'],
                "nwinf":_nonwovens['nw_des_inf'],
                "tipo_paletes":'970x970',
                "palete_por_palete": 2 if _paletizacao['paletes_sobrepostas'] == 1 else 1,
                "bobines_por_palete": _paletizacao['details'][0]['num_bobines'] if _paletizacao['paletes_sobrepostas'] == 0 else _paletizacao['details'][1]['num_bobines'],
                "bobines_por_palete_inf": _paletizacao['details'][0]['num_bobines'] if _paletizacao['paletes_sobrepostas'] == 1 else 0,
                "folha_id":1,
                "enrolamento":enrolamento[ordemfabrico['sentido_enrolamento']],
                "freq_amos":ordemfabrico['amostragem'],
                "diam_min":_artigo["diam_ref"],
                "diam_max":_artigo["diam_ref"],
                "stock":0,
                "tipo_transporte":_paletizacao["contentor_id"],
                "paletes_camiao":_paletizacao["npaletes"],
                "altura_max":_paletizacao["palete_maxaltura"],
                "paletes_sobre":_paletizacao["paletes_sobrepostas"],
                "cintas": 1 if _paletizacao["ncintas"] > 0 else 0,
                "etiqueta_bobine":_paletizacao["netiquetas_bobine"],
                "etiqueta_palete":_paletizacao["netiquetas_lote"],
                "etiqueta_final":_paletizacao["netiquetas_final"],
                "artigo_id":_artigo["id"],
                "enc_id":vals["encomendaId"],
                "user_id":user.id,
                "tipo_emenda":tipoemendas[_emendas["tipo_emenda"]],
                "cliente_id":vals["clienteId"],
                "retrabalho":0,
                "ativa":0,
                "completa":0,
                "num_paletes_produzidas":0,                                
                "data_prevista_inicio": datetime.strptime(data["start_prev_date"], "%Y-%m-%d %H:%M:%S").strftime("%Y-%m-%d"),
                "hora_prevista_inicio": datetime.strptime(data["start_prev_date"], "%Y-%m-%d %H:%M:%S").strftime("%H:%M:%S"),
                "data_prevista_fim": hours["end_prev_date"].strftime("%Y-%m-%d"), #datetime.strptime(data["end_prev_date"], "%Y-%m-%d %H:%M:%S").strftime("%Y-%m-%d"),
                "hora_prevista_fim": hours["end_prev_date"].strftime("%H:%M:%S"),#datetime.strptime(data["end_prev_date"], "%Y-%m-%d %H:%M:%S").strftime("%H:%M:%S"),
                "num_paletes_stock_in":0,
                "ofid":ordemfabrico["of_id"],
                "draft_ordem_id":ordemfabrico["id"],
                "agg_of_id_id":aggid,
                "status":2,
                "horas_previstas_producao": hours['hours'] #divmod(delta.total_seconds(), 3600)[0]
            }
            #Save Current Settings
            dml = db.dml(TypeDml.INSERT, dta, "planeamento_ordemproducao")
            db.execute(dml.statement, cursor, dml.parameters)
            opid = cursor.lastrowid 
            ops.append(opid)    

            #Dados para currentSettings
            emendas.append({"of_id":opid,"draft_of_id":ordemfabrico["id"],"of_cod":ordemfabrico["of_id"],"emendas":ordemfabrico["emendas"]})
            paletizacao.append({"of_id":opid,"draft_of_id":ordemfabrico["id"],"of_cod":ordemfabrico["of_id"],"paletizacao":ordemfabrico["paletizacao"]})
            limites.append({"of_id":opid,"draft_of_id":ordemfabrico["id"],"of_cod":ordemfabrico["of_id"],"limites":ordemfabrico["limites"]})
            cores.append({"of_id":opid,"draft_of_id":ordemfabrico["id"],"of_cod":ordemfabrico["of_id"],"cores":[{"core_cod":ordemfabrico["core_cod"],"core_des":ordemfabrico["core_des"]}]})

            #Adicionar Paletes em stock 
            if ordemfabrico['paletesstock'] is not None:
                dta = {
                    "cliente_id":vals["clienteId"],
                    "ordem_id":opid,
                    "stock":0
                }
                dml = db.dml(TypeDml.UPDATE,dta,"producao_palete",{},None,False)
                statement = f'{dml.statement} WHERE id in(select id from (select pp.id FROM producao_palete pp WHERE pp.draft_ordem_id={ordemfabrico["id"]}) t)'
                db.execute(statement, cursor, dml.parameters)

        aggdata = GetAggData(aggid,",".join(str(v) for v in ops),cursor)
        dta = {
            "formulacao":aggdata[0]["formulacao"],
            "gamaoperatoria":aggdata[0]["gamaoperatoria"],
            "nonwovens":aggdata[0]["nonwovens"],
            "artigospecs":aggdata[0]["specs"],
            "cortes":aggdata[0]["cortes"],
            "cortesordem":aggdata[0]["cortesordem"],
            "ofs":aggdata[0]["ofs"],
            "paletesstock":aggdata[0]["paletesstock"],
            "agg_of_id":aggid,
            "emendas":json.dumps(emendas, ensure_ascii=False),
            "paletizacao":json.dumps(paletizacao, ensure_ascii=False),
            "cores":json.dumps(cores, ensure_ascii=False),
            "limites":json.dumps(limites, ensure_ascii=False),
            "status":2,
            "start_prev_date": datetime.strptime(data["start_prev_date"], "%Y-%m-%d %H:%M:%S"),
            "end_prev_date":hours["end_prev_date"],
            "horas_previstas_producao": hours["hours"],#divmod(delta.total_seconds(), 3600)[0],
            "sentido_enrolamento":ordemfabrico['sentido_enrolamento'],
            "amostragem":ordemfabrico['amostragem'],
            "observacoes":data['observacoes'],
            "gsm":data['artigo_gram'],
            "produto_id":data['produto_id'],
            "produto_cod":data['produto_cod'],
            "user_id":user.id,
            "type_op":"created",
            "created": datetime.now(),
        }
        if aggdata[0]["cs_id"] is not None:
            dta["id"] = aggdata[0]["cs_id"]
        dml = db.dml(TypeDml.INSERT, dta, "producao_currentsettings")
        dml.statement = f"""
            {dml.statement}
            ON DUPLICATE KEY UPDATE 
                id=LAST_INSERT_ID(id),
                formulacao=values(formulacao),
                gamaoperatoria=values(gamaoperatoria),
                nonwovens=values(nonwovens),
                artigospecs=values(artigospecs),
                cortes=values(cortes),
                cortesordem=values(cortesordem),
                ofs=values(ofs),
                paletesstock=values(paletesstock),
                agg_of_id=values(agg_of_id),
                emendas=values(emendas),
                limites=values(limites),
                paletizacao=values(paletizacao),
                cores=values(cores),
                status=values(status),
                start_prev_date=values(start_prev_date),
                end_prev_date=values(end_prev_date),
                horas_previstas_producao=values(horas_previstas_producao),
                sentido_enrolamento=values(sentido_enrolamento),
                amostragem=values(amostragem),
                observacoes=values(observacoes),
                produto_id=values(produto_id),
                produto_cod=values(produto_cod),
                gsm=values(gsm),
                user_id=values(user_id),
                type_op=values(type_op),
                created=values(created)
        """
        db.execute(dml.statement, cursor, dml.parameters)
        csid = cursor.lastrowid

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
        computed = {}
        if ("ofabrico_id" not in data):
            return computed
        rows = db.executeSimpleList(lambda: (f"""
            select pp.npaletes, ppd.* 
            from producao_tempordemfabrico tof
            left join producao_paletizacao pp on pp.id=tof.paletizacao_id
            left join producao_paletizacaodetails ppd on pp.id=ppd.paletizacao_id and ppd.item_id=2
            where tof.id='{data['ofabrico_id']}'
        """), cursor, {})['rows']
        if len(rows)>0:
            paletizacao=rows
    sqm_paletes_total = 0
    nitems = 0
    items = []
    computed = {}
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


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
# @transaction.atomic()
def SaveTempOrdemFabrico(request, format=None):
    data = request.data.get("parameters")

    def getAggStatus(data,cursor):
        if "ofabrico_id" not in data:
            f = Filters({"cod": data['ofabrico_cod']})
            f.setParameters({}, False)
            f.where()
            f.add(f'tof.of_id = :cod', True)
            f.value("and")   
            exists = db.exists("producao_tempordemfabrico tof", f, cursor).exists
            if (not exists):
                return {"status":"success"}
            else:
                return {"status": "error", "title": "Erro ao Guardar a Ordem de Fabrico!","subTitle":"A Ordem de Fabrico já se encontra Criada."}
        else:
            f = Filters({"id": data['ofabrico_id']})
            f.setParameters({}, False)
            f.where()
            f.add(f'tof.id = :id', True)
            f.value("and")   
            rows = db.executeSimpleList(lambda: (f'''
                    select toaf.status
                    FROM producao_tempordemfabrico tof
                    join producao_tempaggordemfabrico toaf on tof.agg_of_id=toaf.id
                    {f.text}
            '''), cursor, f.parameters)['rows']
            status = rows[0]["status"] if len(rows)>0 else None
            print(data)
            return {"status":"success"}
            if (status==None):
                return {"status": "error", "title": "Erro ao Guardar a Ordem de Fabrico!","subTitle":"Não existe Ordem de Produção Agregada."}
            elif (status==0):
                return {"status":"success"}
            else:
                return {"status": "error", "title": "Erro ao Guardar a Ordem de Fabrico!","subTitle":"O planeamento da Ordem de Fabrico Já se encontra Fechado."}

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
            f = Filters({"produto_cod": artigo["produto_cod"].lower().strip() })
            f.where()
            f.add(f'lower(produto_cod) = :produto_cod', True)
            f.value("and")
            produtoId = db.executeSimpleList(lambda: (f'SELECT id from producao_produtos {f.text}'), cursor, f.parameters)['rows']
            if len(produtoId)>0:
                return produtoId[0]['id']
            dml = db.dml(TypeDml.INSERT, {"produto_cod":artigo["produto_cod"].strip()}, "producao_produtos",None,None,False)
            db.execute(dml.statement, cursor, dml.parameters)
            return cursor.lastrowid
        return None

    def addArtigo(data,produto_id,cursor):
        artigo = data["artigo"] if "artigo" in data else None
        if artigo is not None:

            f = Filters({"cod": data["item"]})
            f.where()
            f.add(f'cod = :cod', True)
            f.value("and")
            artigoId = db.executeSimpleList(lambda: (f'SELECT id from producao_artigo {f.text}'), cursor, f.parameters)['rows']

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
            if len(artigoId)>0:
                dml = db.dml(TypeDml.UPDATE, dta, "producao_artigo",{"id":artigoId[0]["id"]},None,None)
                db.execute(dml.statement, cursor, dml.parameters)
                return artigoId[0]["id"]
            else:
                dml = db.dml(TypeDml.INSERT, dta, "producao_artigo",None,None)
                db.execute(dml.statement, cursor, dml.parameters)
                return cursor.lastrowid
        else:
            return None

    def getAgg(data, cursor):
        if ("ofabrico_id" not in data):
            return None
        f = Filters({"id": data['ofabrico_id'], "item_cod": data['item']})
        f.setParameters({}, False)
        f.where()
        f.add(f'id = :id', True)
        f.add(f'item_cod = :item_cod', True)
        f.value("and")   
        rows = db.executeSimpleList(lambda: (f'SELECT agg_of_id,agg_ofid_original FROM producao_tempordemfabrico {f.text}'), cursor, f.parameters)['rows']
        return rows[0] if len(rows)>0 else None

    def upsertTempAggOrdemFabrico(data, ids, cursor):
        dta = {
            'status': data['status'] if 'status' in data else 0,
            'sentido_enrolamento': data['sentido_enrolamento'] if 'sentido_enrolamento' in data else None,
            'amostragem': data['f_amostragem'] if 'f_amostragem' in data else None,
            'observacoes': data['observacoes'] if 'observacoes' in data else None,
            'start_prev_date':datetime.now().strftime("%Y-%m-%d %H:%M:%S") if (not "start_prev_date" in data or not data["start_prev_date"]) else data["start_prev_date"]
            #'end_prev_date':datetime.now().strftime("%Y-%m-%d %H:%M:%S") if (not "end_prev_date" in data or not data["end_prev_date"]) else data["end_prev_date"]
            #'horas_previstas_producao':round(hours,2)
        }

        if "formulacao_id" in data:
            dta["formulacao_id"] = data["formulacao_id"] if (data["formulacao_id"] is None) else ( data["formulacao_id"] if (data["formulacao_id"] >=1) else None)
        if "cortesordem_id" in data:
            dta["cortesordem_id"] = data["cortesordem_id"] if (data["cortesordem_id"] is None) else ( data["cortesordem_id"] if (data["cortesordem_id"] >=1) else None)
        if "gamaoperatoria_id" in data:
            dta["gamaoperatoria_id"] = data["gamaoperatoria_id"] if (data["gamaoperatoria_id"] is None) else ( data["gamaoperatoria_id"] if (data["gamaoperatoria_id"] >=1) else None)
        if "artigospecs_id" in data:
            dta["artigospecs_id"] = data["artigospecs_id"] if (data["artigospecs_id"] is None) else ( data["artigospecs_id"] if (data["artigospecs_id"] >=1) else None)
        if "nonwovens_id" in data:
            dta["nonwovens_id"] = data["nonwovens_id"] if (data["nonwovens_id"] is None) else ( data["nonwovens_id"] if (data["nonwovens_id"] >=1) else None)

        if ids is None:
            dml = db.dml(TypeDml.INSERT, dta, "producao_tempaggordemfabrico",None,None,False)
            tags = []
            for idx, val in enumerate(dml.columns):
                tags.append(f'{dml.tags[idx]} {val}')
            statement = f"""
                insert into producao_tempaggordemfabrico(year,cod,{",".join(dml.columns)})
                select * from (
                    select YEAR(CURDATE()) year, CONCAT('AGG-OF-',LPAD(IFNULL(count(*),0)+1,4,'0'),'/',YEAR(CURDATE())) d, {",".join(tags)}
                    from producao_tempaggordemfabrico where year=YEAR(CURDATE())
                ) t
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

            db.execute(dml.statement, cursor, dml.parameters)
            return ids["agg_of_id"]

    def upsertTempOrdemFabrico(data,aggid,produto_id, cp, cpp, cursor):
        dta = {
            'aggregated':0,
            'agg_of_id': aggid,
            'agg_ofid_original': aggid,
            'of_id': data['ofabrico_cod'],
            'order_cod': data['iorder'],
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
        if "cliente_cod" in data and data["cliente_cod"] is not None:
            dta["cliente_cod"]=data["cliente_cod"]
            dta["cliente_nome"]=data["cliente_nome"]
            onDuplicate+=",cliente_cod=VALUES(cliente_cod)"
            onDuplicate+=",cliente_nome=VALUES(cliente_nome)"                
                
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
                produto_id=VALUES(produto_id),
                item_cod=VALUES(item_cod),
                item_id=VALUES(item_id)
                {onDuplicate}
        """
        db.execute(dml.statement, cursor, dml.parameters)
        return cursor.lastrowid

    def updateTempOrdemFabrico(data,cursor):
        if data["type"] == "paletizacao":
            cp = computeLinearMeters(data)
            cpp = computePaletizacao(cp,data,cursor)
            dta={}
            if (len(cp.keys())>0):
                dta['qty_encomenda'] = cp['qty_encomenda'],
                dta['linear_meters'] = cp["linear_meters"],
                dta['n_voltas'] = cp["n_voltas"],
                dta['sqm_bobine'] = cp["sqm_bobine"]
                dta['n_paletes'] = json.dumps(cpp)
            
            pid = data["paletizacao_id"] if ("paletizacao_id" in data) else None
            dta['n_paletes'] = {} if pid is None else dta['n_paletes']
            dml = db.dml(TypeDml.UPDATE,{"paletizacao_id":pid,**dta},"producao_tempordemfabrico",{"id":f'=={data["ofabrico_id"]}'},None,False)
            db.execute(dml.statement, cursor, dml.parameters)
            return data["ofabrico_id"]
        if data["type"] == "settings":
            print("entri")
            print(data)
            emendas_id = None
            emenda = getEmendas(data,cursor)
            if emenda is None:
                vals = {
                    "artigo_cod":data["artigo_cod"],
                    "emendas_rolo":data["nemendas_rolo"],
                    "tipo_emenda":data["tipo_emenda"],
                    "maximo":data["maximo"],
                    "paletes_contentor":data["nemendas_paletescontentor"]
                }
                if "cliente_cod" in data and data["cliente_cod"] is not None:
                    vals["cliente_cod"]=data["cliente_cod"]
                vals["hashcode"] = hashlib.md5(json.dumps(vals).encode('utf-8')).hexdigest()[ 0 : 16 ]
                if "cliente_nome" in data and data["cliente_nome"] is not None:
                    vals["cliente_nome"]=data["cliente_nome"]
                vals["designacao"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                dml = db.dml(TypeDml.INSERT,vals,"producao_emendas",None,None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                emendas_id = cursor.lastrowid
            else:
                emendas_id = data["emendas_id"] if "emendas_id" in data and data["emendas_id"] is not None else emenda["id"]
            vl = {"emendas_id":emendas_id,"n_paletes_total":data["n_paletes_total"],"cliente_cod":data["cliente_cod"],"cliente_nome":data["cliente_nome"]}
            if "core_cod" in data:
                vl["core_cod"] = data["core_cod"]
                vl["core_des"] = data["core_des"]
            dml = db.dml(TypeDml.UPDATE,vl,"producao_tempordemfabrico",{"id":f'=={data["ofabrico_id"]}'},None,False)
            db.execute(dml.statement, cursor, dml.parameters)
            return data["ofabrico_id"]

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                aggStatus = getAggStatus(data,cursor)
                if (aggStatus["status"]=="error"):
                    return Response(aggStatus)
                if ("type" in data):
                    id = updateTempOrdemFabrico(data,cursor)
                else:
                    cp = computeLinearMeters(data)
                    cpp = computePaletizacao(cp,data,cursor)
                    produto_id = addProduto(data,cursor)
                    addArtigo(data,produto_id,cursor)
                    ids = getAgg(data,cursor)
                    aggid = upsertTempAggOrdemFabrico(data,ids,cursor)
                    id = upsertTempOrdemFabrico(data,aggid,produto_id,cp, cpp, cursor)
                    sgpForProduction(data,aggid,request.user,cursor)
        if 'forproduction' in data and data['forproduction']==True:
            mv_ofabrico_list = AppSettings.materializedViews.get("MV_OFABRICO_LIST")
            conngw = connections[connGatewayName]
            cgw = conngw.cursor()
            cgw.execute(f"REFRESH MATERIALIZED VIEW public.{mv_ofabrico_list};")
            conngw.commit()

                  
        return Response({"status": "success","id":data["ofabrico_cod"], "title": "A Ordem de Fabrico Foi Guardada com Sucesso!", "subTitle":f'{data["ofabrico_cod"]}'})
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
        # rows = db.executeSimpleList(lambda: (f"""        
        #     select agg_of_id,GROUP_CONCAT(of_id) group_ofid from producao_tempordemfabrico tof 
        #     where 
        #     exists (
        #     SELECT 1 FROM producao_tempordemfabrico t where id in (
        #     {','.join(str(v) for v in agg_ids)}
        #     ) 
        #     {f.text} 
        #     and t.agg_of_id = tof.agg_of_id
        #     )
        #     group by agg_of_id
        #     having count(*) > 1        
        # """), cursor, f.parameters)['rows']
        print(f"select count(*) from producao_tempordemfabrico t where t.id in ({','.join(str(v) for v in agg_ids)}) {f.text} and t.aggregated=1")
        cnt = db.executeSimpleList(lambda: (f"select count(*) cnt from producao_tempordemfabrico t where t.id in ({','.join(str(v) for v in agg_ids)}) {f.text} and t.aggregated=1"),cursor,f.parameters)
        return cnt["rows"][0]["cnt"]
        #ofs = [d['group_ofid'] for d in rows]
        #return ofs

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                v = getAggsAlreadyGrouped(data,cursor)
                if (v>0):
                    return Response({"status": "error", "title": "Não é possível Agrupar as Ordens de Fabrico, Existem Ordens que já estão Agrupadas!"})
                if (len(agg_ids)==0):
                    return Response({"status": "error", "title": "Não Foram Selecionadas Ordens de Fabrico!"})
                dml = db.dml(TypeDml.UPDATE,{"agg_of_id":data["agg_id"],"aggregated": 0 if len(agg_ids)==1 else 1},"producao_tempordemfabrico",{},None,False)
                statement = f"""{dml.statement} WHERE id in ({','.join(str(v) for v in agg_ids)})"""
                db.execute(statement, cursor, dml.parameters)
                if (len(remove_agg_ids)>0):
                    dml = db.dml(TypeDml.UPDATE,{},"producao_tempordemfabrico",{"agg_of_id":f'=={data["agg_id"]}'},None,False)
                    statement = f"""{dml.statement.replace('SET','SET agg_of_id=agg_ofid_original, aggregated=0',1)} and id in ({','.join(str(v) for v in remove_agg_ids)})"""
                    db.execute(statement, cursor, dml.parameters)
        return Response({"status": "success","id":None, "title": "As Ordens de Fabrico Foram Agrupadas com Sucesso!", "subTitle":''})
    except BaseException as e:
        return Response({"status": "error", "title": "Erro ao Agrupar as Ordens de Fabrico!","value":e.args[len(e.args)-1]})


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
# @transaction.atomic()
def SaveProdutoAlt(request, format=None):
    data = request.data.get("parameters")
    print(request.data)
    id = data["artigo_id"] if "artigo_id" in data else None
    des = data["produto_alt"] if "produto_alt" in data else None
    
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                if id is not None and des is not None:
                    dml = db.dml(TypeDml.UPDATE, {"produto":des}, "producao_artigo", {'id': f'=={id}'}, None, False)
                    db.execute(dml.statement, cursor, dml.parameters)
                else:
                    return Response({"status": "error", "title": f"Não é possível alterar a designação do Produto no artigo!"})
        return Response({"status": "success", "id": None, "title": f"A designação do Produto foi alterada com Sucesso!", "subTitle": ''})
    except Error:
        return Response({"status": "error", "title": f"Erro ao Alterar a Designação do Produto no Artigo!"})



@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def TempOFabricoGet(request, format=None):
    #conn = connections[connGatewayName].cursor()
    #cols = ['tof.*','tagg.core_cod,tagg.core_des,tagg.artigospecs_id,tagg.formulacao_id,tagg.gamaoperatoria_id,tagg.nonwovens_id,tagg.year,tagg.cod,tagg.status,tagg.cortes_id']
    cols = ['tof.*','tagg.*']
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
    
    dql = dbgw.dql(request.data, False)
    sgpAlias = dbgw.dbAlias.get("sgp")
    mv_ofabrico_list = AppSettings.materializedViews.get("MV_OFABRICO_LIST")
    dql.columns = encloseColumn(cols,False)

    with connections[connGatewayName].cursor() as cursor:
        if group:
            f = Filters(request.data['filter'])
            f.setParameters({}, False)
            f.where()
            f.add(f'tof.agg_of_id <= :agg_id',lambda v:(v!=None)) 
            f.value("and")
            response = dbgw.executeSimpleList(lambda:(f"""
                select json_agg(t) v from (
                SELECT
                tofa.cod,tofa.id,tof.id tempof_id, tof.of_id,tof.core_cod,tof.core_des,tof.item_id,tof.item_cod,tof.order_cod,tof.cliente_nome,tof.cliente_cod,tof.linear_meters,tof.n_paletes,tof.n_paletes_total,tof.qty_encomenda,tof.sqm_bobine, tof.paletizacao_id
                ,(select json_agg(pd) x from {sgpAlias}.producao_paletizacaodetails pd where tof.paletizacao_id=pd.paletizacao_id) paletizacao,
                ppz.filmeestiravel_bobines, ppz.filmeestiravel_exterior,ppz.cintas, ppz.ncintas,
                (select json_agg(pp.nome) x from {sgpAlias}.producao_palete pp where tof.id=pp.draft_ordem_id) paletesstock,
                (select row_to_json(_) from (select pe.*) as _) emendas,
                (select row_to_json(_) from (select pa.*) as _) artigo
                FROM {mv_ofabrico_list} oflist
                join {sgpAlias}.producao_tempordemfabrico tof on tof.of_id=oflist.ofabrico and tof.item_cod=oflist.item
                join {sgpAlias}.producao_tempaggordemfabrico tofa on tofa.id=tof.agg_of_id
                left join {sgpAlias}.producao_paletizacao ppz on ppz.id=tof.paletizacao_id
                left join {sgpAlias}.producao_emendas pe on pe.id=tof.emendas_id
                left join {sgpAlias}.producao_artigo pa on pa.id=tof.item_id
                {f.text}
                ) t
            """),cursor,f.parameters)
        else:
            f = Filters(request.data['filter'])
            f.setParameters({}, False)
            f.where()
            f.add(f'tofa.status <= :status',lambda v:(v!=None)) 
            f.value("and")
            f1 = Filters(request.data['filter'])
            f1.where(False,"and" if f.hasFilters else False)
            f1.add(f'tof.agg_of_id = :agg_id',lambda v:(v!=None))
            f1.add(f'(tof.produto_id = :produto_id and tof.aggregated=0)',lambda v:(v!=None))
            f1.value("or")
            filter = f"""{f.text}{f1.text}"""
            parameters = {**f.parameters,**f1.parameters}
            response = dbgw.executeSimpleList(lambda: (
                f"""
                    select 
                    {dql.columns}
                    FROM {mv_ofabrico_list} oflist
                    join {sgpAlias}.producao_tempordemfabrico tof on tof.of_id=oflist.ofabrico and tof.item_cod=oflist.item
                    join {sgpAlias}.producao_tempaggordemfabrico tofa on tofa.id=tof.agg_of_id
                    {filter}
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


#region BOBINAGENS

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def ValidarBobinagensList(request, format=None):
    connection = connections["default"].cursor()
    feature = request.data['parameters']['feature'] if 'feature' in request.data['parameters'] else None
    typeList = request.data['parameters']['typelist'] if 'typelist' in request.data['parameters'] else 'A'


    f = Filters(request.data['filter'])
    f.setParameters({
        **rangeP(f.filterData.get('fdata'), 'data', lambda k, v: f'DATE(pbm.{k})'),
        **rangeP(f.filterData.get('ftime'), ['inico','fim'], lambda k, v: f'TIME(pbm.{k})', lambda k, v: f'TIMEDIFF(TIME(pbm.{k[1]}),TIME(pbm.{k[0]}))'),
        "nome": {"value": lambda v: v.get('fbobinagem'), "field": lambda k, v: f'pbm.{k}'},
        "duracao": {"value": lambda v: v.get('fduracao'), "field": lambda k, v: f'(TIME_TO_SEC(pbm.{k})/60)'},
        "area": {"value": lambda v: v.get('farea'), "field": lambda k, v: f'pbm.{k}'},
        "diam": {"value": lambda v: v.get('fdiam'), "field": lambda k, v: f'pbm.{k}'},
        "core": {"value": lambda v: v.get('fcore'), "field": lambda k, v: f'pf.{k}'},
        "comp": {"value": lambda v: v.get('fcomp'), "field": lambda k, v: f'pbm.{k}'}
    }, True)
    f.where(False, "and")
    f.auto()
    f.value()
    
    f2 = filterMulti(request.data['filter'], {}, False, "and",False)
    
    def filterDefeitosMultiSelect(data,name,relname):
        f = Filters(data)
        frel = "and"
        value = "==1"
        if relname in data:
            if data[relname]=="ou":
                frel = "or"
            if data[relname]=="!ou":
                frel = "or"
                value = "!==1"
            if data[relname]=="!e":
                frel = "and"
                value = "!==1"
        
        fP = {}
        if name in data:
            dt = [o['value'] for o in data[name]]
            for v in dt:
                fP[v] = {"key": v, "value": value, "field": lambda k, v: f'tpb.{k}'}
        f.setParameters({**fP}, True)
        f.auto()
        f.where(False, "and")
        f.value(frel)
        return f

    def filterMultiSelect(data,name,field):
        f = Filters(data)
        fP = {}
        if name in data:
            dt = [o['value'] for o in data[name]]
        
            value = 'in:' + ','.join(f"{w}" for w in dt)
            fP['estado'] = {"key": field, "value": value, "field": lambda k, v: f'tpb.{k}'}
        f.setParameters({**fP}, True)
        f.auto()
        f.where(False, "and")
        f.value()
        return f

    fdefeitos = filterDefeitosMultiSelect(request.data['filter'],'fdefeitos','freldefeitos')
    festados = filterMultiSelect(request.data['filter'],'festados','estado')
    
    f4 = Filters(request.data['filter'])
    f4.setParameters({
        "cliente": {"value": lambda v: v.get('fcliente'), "field": lambda k, v: f'tpb.{k}'},
        "destino": {"value": lambda v: v.get('fdestino'), "field": lambda k, v: f'tpb.{k}'}
    }, True)
    f4.where(False, "and")
    f4.auto()
    f4.value("and")

    parameters = {**f.parameters, **f2['parameters'], **fdefeitos.parameters, **festados.parameters, **f4.parameters}

    dql = db.dql(request.data, False)
    cols = f"""pbm.*,JSON_ARRAYAGG(JSON_OBJECT('id',pb.id,'lar',pl.largura,'cliente',pb.cliente,'estado',pb.estado)) bobines"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f""" 
            SELECT
            {c(f'{dql.columns}')}
            from(
                select pbm.*,pf.core
                {f''',(SELECT GROUP_CONCAT(ld.doser) FROM lotesdosers ld where ld.ig_bobinagem_id=pbm.ig_bobinagem_id and (ld.n_lote is null or ld.qty_to_consume<>ld.qty_consumed)) no_lotes_dosers,
                (select count(*) FROM lotesdosers ld where ld.ig_bobinagem_id=pbm.ig_bobinagem_id and (ld.n_lote is null or ld.qty_to_consume<>ld.qty_consumed)) no_lotes
                ''' if feature=='fixconsumos' else ''}
                {f''',ROUND(pbc.A1,2) A1,ROUND(pbc.A2,2) A2,ROUND(pbc.A3,2) A3,ROUND(pbc.A4,2) A4,ROUND(pbc.A5,2) A5,ROUND(pbc.A6,2) A6,
                      ROUND(pbc.B1,2) B1,ROUND(pbc.B2,2) B2,ROUND(pbc.B3,2) B3,ROUND(pbc.B4,2) B4,ROUND(pbc.B5,2) B5,ROUND(pbc.B6,2) B6,
                      ROUND(pbc.C1,2) C1,ROUND(pbc.C2,2) C2,ROUND(pbc.C3,2) C3,ROUND(pbc.C4,2) C4,ROUND(pbc.C5,2) C5,ROUND(pbc.C6,2) C6''' if typeList=='B' else '' }
                ,JSON_EXTRACT(acs.ofs, '$[*].of_cod') ofs
                FROM producao_bobinagem pbm
                join producao_perfil pf on pf.id = pbm.perfil_id and pf.retrabalho=0
                join audit_currentsettings acs on acs.id=pbm.audit_current_settings_id
                {'LEFT JOIN producao_bobinagemconsumos pbc ON pbc.bobinagem_id=pbm.id' if typeList=='B' else '' }
                where pbm.valid=0 {f.text} {f2["text"]}
                {f'and EXISTS (SELECT 1 FROM producao_bobine tpb where tpb.bobinagem_id = pbm.id {festados.text} {fdefeitos.text} {f4.text} )' if festados.hasFilters or fdefeitos.hasFilters or f4.hasFilters else '' }
                {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
            ) pbm
            join producao_bobine pb on pb.bobinagem_id = pbm.id
            join producao_largura pl on pl.id = pb.largura_id
            {f'WHERE no_lotes>0' if feature=='fixconsumos' else ''}
            group by pbm.id {',A1,A2,A3,A4,A5,A6,B1,B2,B3,B4,B5,B6,C1,C2,C3,C4,C5,C6' if typeList=='B' else '' } 
            {s(dql.sort)}
        """
    )
    sqlCount = f""" 
            SELECT count(*) FROM (
                SELECT
                pbm.id 
                {f''',(select count(*) FROM lotesdosers ld where ld.ig_bobinagem_id=pbm.ig_bobinagem_id and (ld.n_lote is null or ld.qty_to_consume<>ld.qty_consumed)) no_lotes''' if feature=='fixconsumos' else ''}
                FROM producao_bobinagem pbm
                join producao_perfil pf on pf.id = pbm.perfil_id and pf.retrabalho=0
                where pbm.valid=0  {f.text} {f2["text"]}
                {f'and EXISTS (SELECT 1 FROM producao_bobine tpb where tpb.bobinagem_id = pbm.id {festados.text} {fdefeitos.text} {f4.text} )' if (festados.hasFilters or fdefeitos.hasFilters or f4.hasFilters) else '' }
            ) t
            {f'WHERE no_lotes>0' if feature=='fixconsumos' else ''}
        """
    if ("export" in request.data["parameters"]):
        for x in range(0, 30):
            request.data["parameters"]['cols'][f'{x+1}']={"title":f'{x+1}',"width":6}
        tmpsql = sql(lambda v:'',lambda v:v,lambda v:v)
        if typeList=='A':
            tmpsql = f"""SELECT t.*,
                concat(t.bobines->>'$[0].estado','\\n',t.bobines->>'$[0].lar') as '1',concat(t.bobines->>'$[1].estado','\\n',t.bobines->>'$[1].lar') as '2',
                concat(t.bobines->>'$[2].estado','\\n',t.bobines->>'$[2].lar') as '3',concat(t.bobines->>'$[3].estado','\\n',t.bobines->>'$[3].lar') as '4',
                concat(t.bobines->>'$[4].estado','\\n',t.bobines->>'$[4].lar') as '5',concat(t.bobines->>'$[5].estado','\\n',t.bobines->>'$[5].lar') as '6',
                concat(t.bobines->>'$[6].estado','\\n',t.bobines->>'$[6].lar') as '7',concat(t.bobines->>'$[7].estado','\\n',t.bobines->>'$[7].lar') as '8',
                concat(t.bobines->>'$[8].estado','\\n',t.bobines->>'$[8].lar') as '9',concat(t.bobines->>'$[9].estado','\\n',t.bobines->>'$[9].lar') as '10',

                concat(t.bobines->>'$[10].estado','\\n',t.bobines->>'$[10].lar') as '11',concat(t.bobines->>'$[11].estado','\\n',t.bobines->>'$[11].lar') as '12',
                concat(t.bobines->>'$[12].estado','\\n',t.bobines->>'$[12].lar') as '13',concat(t.bobines->>'$[13].estado','\\n',t.bobines->>'$[13].lar') as '14',
                concat(t.bobines->>'$[14].estado','\\n',t.bobines->>'$[14].lar') as '15',concat(t.bobines->>'$[15].estado','\\n',t.bobines->>'$[15].lar') as '16',
                concat(t.bobines->>'$[16].estado','\\n',t.bobines->>'$[16].lar') as '17',concat(t.bobines->>'$[17].estado','\\n',t.bobines->>'$[17].lar') as '18',
                concat(t.bobines->>'$[18].estado','\\n',t.bobines->>'$[18].lar') as '19',concat(t.bobines->>'$[19].estado','\\n',t.bobines->>'$[19].lar') as '20',

                concat(t.bobines->>'$[20].estado','\\n',t.bobines->>'$[20].lar') as '21',concat(t.bobines->>'$[21].estado','\\n',t.bobines->>'$[21].lar') as '22',
                concat(t.bobines->>'$[22].estado','\\n',t.bobines->>'$[22].lar') as '23',concat(t.bobines->>'$[23].estado','\\n',t.bobines->>'$[23].lar') as '24',
                concat(t.bobines->>'$[24].estado','\\n',t.bobines->>'$[24].lar') as '25',concat(t.bobines->>'$[25].estado','\\n',t.bobines->>'$[25].lar') as '26',
                concat(t.bobines->>'$[26].estado','\\n',t.bobines->>'$[26].lar') as '27',concat(t.bobines->>'$[27].estado','\\n',t.bobines->>'$[27].lar') as '28',
                concat(t.bobines->>'$[28].estado','\\n',t.bobines->>'$[28].lar') as '29',concat(t.bobines->>'$[29].estado','\\n',t.bobines->>'$[29].lar') as '30'
                from (
                {tmpsql} 
                ) t"""
        return export(tmpsql, db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    response = db.executeList(sql, connection, parameters, [],None,sqlCount)
    return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def ValidarBobinesList(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({})
    f.where()
    f.add("bobinagem_id = :bobinagem_id",True)
    f.value()
    

    parameters = {**f.parameters}

    dql = db.dql(request.data, False)
    cols = f"""pb.*,pl.largura"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f""" 
        select
        {c(f'{dql.columns}')}
        FROM producao_bobine pb
        join producao_largura pl on pb.largura_id=pl.id
        {f.text}
        {s(dql.sort)} {p(dql.paging)}            
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    response = db.executeList(sql, connection, parameters, [],None)
    return Response(response)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def ValidarBobinagem(request, format=None):
    data = request.data['parameters']

    def checkIfIsValid(data, cursor):
        exists = 0
        if ("bobinagem_id" in data):
            f = Filters({"id": data["bobinagem_id", "valid":0]})
            f.where()
            f.add(f'id = :id', True)
            f.add(f'valid = :valid', True)
            f.value("and")
            exists = db.exists("producao_bobinagem", f, cursor).exists
        return exists

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                #if checkIfIsValid(data,cursor)==0:
                    if 'bobines' in data:
                        for v in data['bobines']:
                            id = v.pop("id", None)
                            dml = db.dml(TypeDml.UPDATE, v, "producao_bobine", {'id': f'=={id}'}, None, False)
                            db.execute(dml.statement, cursor, dml.parameters)
                        dml = db.dml(TypeDml.UPDATE, {"valid": 1}, "producao_bobinagem", {'id': f'=={data["bobinagem_id"]}'}, None, False)
                        db.execute(dml.statement, cursor, dml.parameters)
                    else:
                        return Response({"status": "error", "title": "Não existem dados para validar/classificar!"})
                #else:
                #    return Response({"status": "error", "title": "Não existem dados para validar/classificar!"})
        return Response({"status": "success", "id": None, "title": f"A Bobinagem {data['bobinagem_nome']} foi Validada/Classificada com Sucesso!", "subTitle": ''})
    except Error:
        return Response({"status": "error", "title": f"Erro ao Validar/Classificar a Bobinagem {data['bobinagem_nome']}!"})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def FixSimulatorList(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({})
    f.where()
    f.add("bobinagem_id = :bobinagem_id",True)
    f.value()
    

    parameters = {**f.parameters}

    dql = db.dql(request.data, False)
    cols = f"""*"""
    sql = lambda p, c, s: (
        f""" 
        SELECT * FROM(		
            WITH CONSUMOS AS(
            select id,doser,qty_to_consume cons,ig_bobinagem_id,t_stamp from lotesdosers where status=1 AND type_mov='C' and ig_bobinagem_id in (2619)
            ),
            QTY_LOTES_AVAILABLE AS(
                select t.*,SUM(t.qty_lote_available) over (PARTITION BY t.group_id) qty_artigo_available
                FROM (
                    select distinct * from (
                    SELECT 
                    DOSERS.group_id, LOTES.artigo_cod,LOTES.lote_id,LOTES.n_lote,LOTES.qty_lote,DOSERS.loteslinha_id,LOTES.t_stamp,DOSERS.`status`,
                    SUM(DOSERS.qty_consumed) over (PARTITION BY LOTES.artigo_cod,LOTES.lote_id,LOTES.n_lote) qty_lote_consumed,
                    qty_lote + SUM(DOSERS.qty_consumed) over (PARTITION BY LOTES.artigo_cod,LOTES.lote_id,LOTES.n_lote) qty_lote_available,
                    MIN(DOSERS.t_stamp) over (PARTITION BY LOTES.artigo_cod,LOTES.lote_id,LOTES.n_lote) min_t_stamp, #FIFO DATE TO ORDER ASC
                    MAX(LOTES.t_stamp) over (PARTITION BY LOTES.artigo_cod,LOTES.lote_id,LOTES.n_lote) max_t_stamp
                    FROM loteslinha LOTES
                    LEFT JOIN lotesdosers DOSERS ON LOTES.id=DOSERS.loteslinha_id  and DOSERS.status<>0
                    WHERE LOTES.status=-1 
                    ) t WHERE  max_t_stamp=t_stamp
                ) t where qty_lote_available>0
            ),
            GROUP_DOSER AS(
                SELECT DOSERS.doser,DOSERS.group_id,COUNT(*) OVER (PARTITION BY group_id) n_dosers FROM lotesdosers DOSERS 
                WHERE DOSERS.status=-1 AND DOSERS.id in(SELECT DISTINCT MAX(id) OVER (PARTITION BY D.doser) FROM lotesdosers D WHERE D.`status`=-1 AND D.type_mov<>'C')
            ),
            CONS_BY_LOTE AS(
            SELECT 
            C.id, GD.group_id, QLA.min_t_stamp,C.doser, QLA.artigo_cod, QLA.lote_id, QLA.n_lote,QLA.loteslinha_id, C.ig_bobinagem_id, GD.n_dosers,
            QLA.qty_lote,QLA.qty_lote_consumed,QLA.qty_lote_available,QLA.qty_artigo_available, C.t_stamp,
            C.cons qty_to_consume,
            SUM(CASE WHEN QLA.n_lote IS NULL THEN NULL ELSE C.cons END) OVER (PARTITION BY QLA.artigo_cod, QLA.lote_id,QLA.n_lote,C.ig_bobinagem_id) qty_to_consume_lote,
            (C.cons/SUM(CASE WHEN QLA.n_lote IS NULL THEN NULL ELSE C.cons END) OVER (PARTITION BY QLA.artigo_cod, QLA.lote_id,QLA.n_lote,C.ig_bobinagem_id)) percent_to_consume,
            CASE WHEN LAG(GD.doser,1) OVER (ORDER BY GD.group_id IS NULL, group_id, C.ig_bobinagem_id, GD.doser, min_t_stamp) is null or LAG(GD.doser,1) OVER (ORDER BY GD.group_id IS NULL, group_id,C.ig_bobinagem_id, GD.doser, min_t_stamp) <> GD.doser THEN 1 ELSE 0 END doser_changed,
            CASE WHEN ((SUM(CASE WHEN QLA.n_lote IS NULL THEN NULL ELSE C.cons END) OVER (PARTITION BY QLA.artigo_cod, QLA.lote_id, QLA.n_lote,C.ig_bobinagem_id)) > QLA.qty_lote_available) THEN 1 ELSE 0 END qty_exceeds
            FROM CONSUMOS C
            LEFT JOIN GROUP_DOSER GD ON GD.doser=C.doser
            LEFT JOIN QTY_LOTES_AVAILABLE QLA ON GD.group_id = QLA.group_id
            order by GD.group_id IS NULL, group_id, GD.doser, min_t_stamp
            )
            #SELECT * FROM CONS_BY_LOTE
            SELECT 
            id,doser,lote_id,n_lote,artigo_cod,1 `status`,t_stamp, now() t_stamp_fix,to_consume_cumulative qty_consumed,'C' type_mov,
            CASE WHEN to_consume_cumulative >= 0 THEN NULL ELSE loteslinha_id END loteslinha_id,
            group_id, ig_bobinagem_id, qty_to_consume,qty_lote,
            CASE WHEN n_lote is null THEN qty_to_consume ELSE (SUM(to_consume_cumulative) over(partition by doser) + qty_to_consume) END lacks_consume,
            CASE WHEN n_lote is null THEN 0 else SUM(to_consume_cumulative) over(partition by lote_id) END qty_lote_consumed,
            CASE WHEN n_lote is null THEN 0 else SUM(to_consume_cumulative) over(partition by artigo_cod) END qty_artigo_consumed
            FROM (

                SELECT 
                    CBL.qty_lote,CBL.qty_artigo_available, CBL.t_stamp, CBL.id, CBL.doser,CBL.lote_id,CBL.n_lote,CBL.artigo_cod,CBL.loteslinha_id,CBL.group_id,CBL.qty_to_consume,CBL.ig_bobinagem_id,
                    CASE WHEN doser_changed=1 THEN @rest_dosers:=qty_to_consume_lote ELSE @rest_dosers END rest_dosers,
                    CASE WHEN doser_changed=1 THEN @rest_doser:=qty_to_consume ELSE @rest_doser END rest_doser,
                    @auxdosers:=@rest_dosers auxdosers,
                    @auxdoser:=@rest_doser auxdoser,
                    CASE WHEN @rest_doser=0 THEN 1 ELSE 0 END all_consumed_doser,
                    -1*(CASE WHEN @auxdosers > qty_lote_available THEN qty_lote_available*percent_to_consume ELSE @rest_doser END) to_consume_cumulative,
                    CASE WHEN @auxdosers > qty_lote_available THEN @rest_dosers:=@rest_dosers-(qty_lote_available*percent_to_consume) ELSE @rest_dosers:=@rest_dosers-@rest_doser END updated_rest_dosers,
                    CASE WHEN @auxdosers > qty_lote_available THEN @rest_doser:=@rest_doser-(qty_lote_available*percent_to_consume) ELSE @rest_doser:=0 END updated_rest_doser
                FROM CONS_BY_LOTE CBL

            ) t where not (all_consumed_doser=1 and to_consume_cumulative=0)

            )t
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    response = db.executeList(sql, connection, parameters, [],None)
    return Response(response)


#endregion


#region PICAGEM DE LOTES

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def GetConsumosBobinagensLookup(request, format=None):
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where(False,"and")
    f.add(f'pbm.nome like :fbobinagem',  lambda v:(v!=None))
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                SELECT distinct pbm.nome,ig.t_stamp,ig.id, ld.agg_of_id
                FROM lotesdosers ld
                JOIN ig_bobinagens ig on ld.ig_bobinagem_id = ig.id
                JOIN producao_bobinagem pbm on pbm.ig_bobinagem_id=ld.ig_bobinagem_id
                WHERE ld.`status`<>0 and ld.closed=0
                {f.text}
                {dql.sort}
                {dql.limit}
            """
        ), cursor, parameters)
        return Response(response)



@api_view(['POST'])
@renderer_classes([JSONRenderer])
def MPGranuladoIO(request, format=None):
    connection = connections[connGatewayName].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({
       # **rangeP(f.filterData.get('forderdate'), 'ORDDAT_0', lambda k, v: f'"enc"."{k}"'),
       #**rangeP(f.filterData.get('SHIDAT_0'), 'SHIDAT_0', lambda k, v: f'"enc"."{k}"'),
       #"LASDLVNUM_0": {"value": lambda v: v.get('LASDLVNUM_0').lower() if v.get('LASDLVNUM_0') is not None else None, "field": lambda k, v: f'lower("enc"."{k}")'},
       #"status": {"value": lambda v: statusFilter(v.get('ofstatus')), "field": lambda k, v: f'"of"."{k}"'}
    }, True)
    f.where()
    f.auto()
    f.value()
    parameters = {**f.parameters}

    dql = dbgw.dql(request.data, False)
    cols = f'''*'''
    dql.columns=encloseColumn(cols,False)
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")

    response = dbgw.executeList(lambda p, c, s: (
        f"""
            select distinct {c(f'{dql.columns}')} from(
            select ld.id,ld.type_mov,mprima."ITMDES1_0",ld.artigo_cod,ld.n_lote,ld.t_stamp,ll.qty_lote,
            STRING_AGG (ld.doser,',') OVER (PARTITION BY ld.artigo_cod,ld.n_lote,ld.loteslinha_id) dosers,
            MAX(ld."order") OVER (PARTITION BY ld.artigo_cod,ld.n_lote,ld.loteslinha_id) max_order,
            ld."order",ld.group_id,ld.loteslinha_id
            from {sgpAlias}.lotesdosers ld
            JOIN {sgpAlias}.loteslinha ll on ll.id=ld.loteslinha_id
            LEFT JOIN {sageAlias}."ITMMASTER" mprima ON mprima."ITMREF_0"=ld.artigo_cod
            WHERE ld.type_mov in ('IN','OUT','END') AND ld.closed=0 AND ld."status"<>0
            ) t
            where "order" = max_order
            {f.text}
            {s(dql.sort)} {p(dql.paging)}            
        """
    ), connection, parameters)

    return Response(response)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
def PickMP(request, format=None):
    data = request.data['parameters']
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                group=9999
                if data["source"] == "A1":
                    group = 1
                elif data["source"] == "A2":
                    group = 2
                elif data["source"] == "A3;B5;C5":
                    group = 3
                elif data["source"] == "A6;B6;C6":
                    group = 4
                elif data["source"] == "B2;C2":
                    group = 5
                elif data["source"] == "B1;C1":
                    group = 6
                elif data["source"] == "B3;C3":
                    group = 7
                reciclado = 0
                if data["artigo_cod"].startswith("R000"):
                    reciclado = 1
                #{'source': 'A3;B3', 'artigo_cod': 'AAAA', 'n_lote': 'AAAAA', 'qty': '44'}
                lote_id = data["lote_id"] if "lote_id" in data else None
                tstamp = datetime.now()
                dml = db.dml(TypeDml.INSERT,{"qty_lote":data["qty"],"t_stamp":tstamp,"type_mov":data["type_mov"],"status":-1,"artigo_cod":data["artigo_cod"],"n_lote":data["n_lote"],"`group`":group,"lote_id":lote_id},"loteslinha",None,None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                lastid = cursor.lastrowid
                linha_order = lastid*100000000
                lote_id =  linha_order if reciclado==1 else lote_id
                dml = db.dml(TypeDml.UPDATE,{"`order`":linha_order,"lote_id":lote_id},"loteslinha",{"id":f'=={lastid}'},None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                for idx, d in enumerate(data["source"].split(';')):
                    dml = db.dml(TypeDml.INSERT,{"t_stamp":tstamp,"doser":d,"type_mov":data["type_mov"],"status":-1,"artigo_cod":data["artigo_cod"],"n_lote":data["n_lote"],"lote_id":lote_id,"group_id":group,"loteslinha_id":lastid,"qty_consumed":0},"lotesdosers",None,None,False)
                    db.execute(dml.statement, cursor, dml.parameters)
                    lid = cursor.lastrowid
                    order = lid*100000000                                                         
                    dml = db.dml(TypeDml.UPDATE,{"`order`":order},"lotesdosers",{"id":f'=={lid}'},None,False)
                    db.execute(dml.statement, cursor, dml.parameters)
        return Response({"status": "success", "id": None, "title": f"Registado com Sucesso!", "subTitle": ''})
    except Error:
        return Response({"status": "error", "title": f"Erro ao Registar!"})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
def PickManual(request, format=None):
    data = request.data['parameters']

    def getInOut(data, cursor):
        plg = []
        ig_id = None
        if ("pickItems" in data and "ig_id" in data):
            plg=data["pickItems"]
            ig_id=int(data["ig_id"])
        else:
            return None

        response = db.executeSimpleList(lambda: (
        f"""           
            WITH PICK_LOTES_GROUPS AS(
                SELECT t.*,{data["qty_lote"]} qty_lote FROM JSON_TABLE(
                '{json.dumps(plg)}'
                ,"$[*]" COLUMNS(rowid FOR ORDINALITY, group_id BIGINT(16) PATH "$.group_id", lote_id INT PATH "$.lote_id", artigo_cod VARCHAR(100) PATH "$.artigo_cod", n_lote VARCHAR(100) PATH "$.n_lote", doser VARCHAR(2) PATH "$.doser", qty_lote_buffer decimal(12,5) PATH "$.qty_lote_buffer", end_id int PATH "$.end_id")
                ) t
            ),
            VIEW_LINHA AS(SELECT * FROM loteslinha where `status` <> 0 AND closed=0),
            VIEW_DOSERS AS(
                    
                    SELECT id,doser,n_lote,artigo_cod,t_stamp,qty_consumed,type_mov,loteslinha_id,group_id,ig_bobinagem_id,qty_to_consume,lote_id,t_stamp_fix,`order`,closed 
                    FROM lotesdosers where `status` <> 0 AND closed=0 AND 
                    `order` > (SELECT IFNULL(MAX(`order`),0) from sistema.lotesdosers tt where tt.`order` <= (
                    select MAX(tld.`order`) limit_order from sistema.lotesdosers tld where tld.`status` <> 0 AND tld.closed=0 AND tld.ig_bobinagem_id = {ig_id}
                    ) and type_mov='END') AND 
                    `order` < (select MIN(`order`) `limit_order` from lotesdosers ld where `status` <> 0 AND closed=0 AND ld.ig_bobinagem_id = {ig_id})
                    
                    #SELECT id,doser,n_lote,artigo_cod,t_stamp,qty_consumed,type_mov,loteslinha_id,group_id,ig_bobinagem_id,qty_to_consume,lote_id,t_stamp_fix,`order`,closed 
                    #FROM lotesdosers 
                    #where `status` <> 0 AND closed=0 AND `order` < (select MIN(`order`) `limit_order` from lotesdosers ld where `status` <> 0 AND closed=0 AND ld.ig_bobinagem_id = {ig_id})
            ),
            LOTES_AVAILABLE AS(
                    select t.*,SUM(t.qty_lote_available) over (PARTITION BY t.group_id) qty_artigo_available
                    FROM (
                        SELECT DISTINCT * FROM (
                        SELECT 
                        DOSERS.group_id, LOTES.artigo_cod,LOTES.lote_id,LOTES.n_lote,LOTES.qty_lote,DOSERS.loteslinha_id,DOSERS.`order`,
                        SUM(DOSERS.qty_consumed) over (PARTITION BY LOTES.lote_id) qty_lote_consumed,
                        qty_lote + SUM(DOSERS.qty_consumed) over (PARTITION BY LOTES.lote_id) qty_lote_available,
                        MIN(DOSERS.`order`) over (PARTITION BY LOTES.lote_id) min_order, #FIFO DATE TO ORDER ASC
                        MAX(DOSERS.`order`) over (PARTITION BY LOTES.lote_id) max_order
                        FROM VIEW_LINHA LOTES
                        LEFT JOIN VIEW_DOSERS DOSERS ON LOTES.id=DOSERS.loteslinha_id
                        WHERE DOSERS.group_id is not null
                        ) t WHERE  max_order=`order`
                    ) t WHERE qty_lote_available>0
            ),
            DOSERS_LASTMOV_OUT AS(
            SELECT * FROM (
                select DOSERS.id,DOSERS.`order`,DOSERS.loteslinha_id,DOSERS.doser,DOSERS.artigo_cod,DOSERS.n_lote,DOSERS.lote_id,DOSERS.type_mov,DOSERS.group_id,
                max(DOSERS.`order`) over (partition by DOSERS.doser) mx_order 
                from VIEW_DOSERS DOSERS	where type_mov = 'OUT'
            ) t 
            WHERE t.mx_order=t.`order`
            ),
            LOTESDOSERS_ARTIGO AS(
                SELECT * FROM (
                    select DOSERS.id,DOSERS.`order`,DOSERS.loteslinha_id,DOSERS.doser,DOSERS.artigo_cod,DOSERS.n_lote,
                    DOSERS.lote_id,DOSERS.type_mov,DOSERS.group_id,max(DOSERS.`order`) over (partition by DOSERS.artigo_cod,DOSERS.doser) mx_order 
                    from VIEW_DOSERS DOSERS
                    LEFT JOIN DOSERS_LASTMOV_OUT DOUT ON DOSERS.doser=DOUT.doser
                    where DOSERS.type_mov <> 'C' and DOSERS.`order`>IFNULL(DOUT.`order`,0)
                ) t 
                WHERE t.mx_order=t.`order` and t.type_mov='IN'
            ),
            LOTESDOSERS_LOTE AS(
                SELECT * FROM (
                    select DOSERS.id,DOSERS.`order`,DOSERS.loteslinha_id,DOSERS.doser,DOSERS.artigo_cod,DOSERS.n_lote,DOSERS.lote_id,DOSERS.type_mov,DOSERS.group_id,
                    count(*) over (partition by DOSERS.lote_id) cnt_dosers, 
                    max(DOSERS.`order`) over (partition by DOSERS.lote_id,DOSERS.doser) mx_order
                    from VIEW_DOSERS DOSERS
                    LEFT JOIN DOSERS_LASTMOV_OUT DOUT ON DOSERS.doser=DOUT.doser
                    where DOSERS.type_mov <> 'C' and DOSERS.`order`>IFNULL(DOUT.`order`,0)
                ) t 
                WHERE t.mx_order=t.`order` and t.type_mov='IN'
            ),
            ACTUAL_GROUPS AS(
                #VERIFICA SE O LOTE PICADO JÁ FOI PREVIAMENTE PICADO
                select 
                PLG.*,
                d.id loteslinha_id, #SE NULL DAR ENTRADA EM LOTESLINHA
                LDL.`order`,LDL.lote_id loteid_doser, #SE NULL DAR ENTRADA DO LOTE/DOSER EM LOTESDOSERS, SENÃO JÁ EXISTE E IGNORAR
                CASE WHEN d.`group` IS NOT NULL THEN d.`group` ELSE CASE WHEN LDA.group_id IS NOT NULL THEN LDA.group_id ELSE PLG.group_id END END group_final
                FROM PICK_LOTES_GROUPS PLG
                LEFT JOIN (
                    select ll.id,ll.`order`,ll.artigo_cod,ll.n_lote,ll.lote_id,ll.type_mov,ll.`group`,max(ll.`order`) over (partition by ll.lote_id) mx_order 
                    from VIEW_LINHA ll
                ) d ON d.mx_order=d.`order` AND d.type_mov='IN' AND PLG.lote_id = d.lote_id
                LEFT JOIN LOTESDOSERS_ARTIGO LDA ON PLG.artigo_cod=LDA.artigo_cod and LDA.doser=PLG.doser
                LEFT JOIN LOTESDOSERS_LOTE LDL ON PLG.lote_id = LDL.lote_id and PLG.doser = LDL.doser
            ),
            IN_LINE AS (
            SELECT 
            /*LA.group_id lote_available_group_id, LA.qty_lote_available,*/ 
            AG.`order`,AG.lote_id,AG.artigo_cod,AG.n_lote,AG.doser,AG.loteslinha_id,AG.loteid_doser,AG.group_final group_id,AG.qty_lote,'IN' mov, AG.end_id
            FROM ACTUAL_GROUPS AG
            LEFT JOIN LOTES_AVAILABLE LA ON LA.lote_id=AG.lote_id
            WHERE (AG.loteid_doser is null or AG.loteslinha_id is null) and (LA.group_id is null or LA.qty_lote_available>0)
            ),
            OUT_DOSER_LINE AS (
                SELECT LL.`order`,LL.lote_id,LL.artigo_cod,LL.n_lote,LL.doser,LL.loteslinha_id,LL.id loteid_doser,LL.group_id,null qty_lote, CASE WHEN I.lote_id IS NULL THEN 'OUT' ELSE NULL END mov
                FROM LOTESDOSERS_LOTE LL
                LEFT JOIN IN_LINE I ON LL.group_id = I.group_id AND LL.doser=I.doser
                #WHERE I.lote_id IS NULL
            ),
            OUT_LINE AS (
                SELECT 
                LDL.`order`,LDL.lote_id,LDL.artigo_cod,LDL.n_lote,LDL.doser,LDL.loteslinha_id,LDL.id loteid_doser,LDL.group_id,null qty_lote,
                CASE WHEN (LDL.cnt_dosers <= count(*) over (partition by LDL.lote_id)) THEN 'OUT_LINE' ELSE 'OUT' END mov,null end_id
                FROM IN_LINE IL
                JOIN LOTESDOSERS_LOTE LDL ON LDL.doser=IL.doser
                WHERE IL.group_id<>LDL.group_id
            )
            SELECT OUT_LINE.*,'{data["date"]}' t_stamp FROM OUT_LINE
            UNION
            SELECT IN_LINE.*,'{data["date"]}' t_stamp FROM IN_LINE
          
        """
        ), cursor, {})
       
        return response["rows"]

    def getOrder(data,cursor):
        ig_id = None
        direction = data["direction"] if "direction" in data else "up"
        if ("ig_id" in data):
            ig_id=int(data["ig_id"])
        else:
            return None
        if direction=="up":
            #ORDER ACIMA DE...IG_BOBINAGEM
            sql =f"""select `order` n from lotesdosers where `order`< (select min(`order`) from lotesdosers where closed=0 and status<>0 and ig_bobinagem_id={ig_id}) order by `order` desc limit 1"""
        else:
            #ORDER ABAIXO DE...IG_BOBINAGEM
            sql=f"""select max(`order`) n from lotesdosers where closed=0 and status<>0 AND ig_bobinagem_id={ig_id}"""
            
        response = db.executeSimpleList(lambda: (sql), cursor, {})
        if len(response["rows"])>0:
            return response["rows"][0]["n"]
        return 1

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:

                if "move_position" in data and data["move_position"]==1:
                    order = getOrder(data,cursor)                    
                    dml = db.dml(TypeDml.UPDATE,{"t_stamp":data["date"]},"loteslinha",{"id":f'=={data["idlinha"]}',"closed":"==0"},None,False)
                    db.execute(dml.statement, cursor, dml.parameters)
                    dml = db.dml(TypeDml.UPDATE,{"t_stamp":data["date"],"`order`":order+1},"lotesdosers",{"loteslinha_id":f'=={data["idlinha"]}',"closed":"==0"},None,False)
                    db.execute(dml.statement, cursor, dml.parameters)
                    return Response({"status": "success", "id": None, "title": f"Registado com Sucesso!", "subTitle": ''})
                else:
                    io = getInOut(data,cursor)
                    order = getOrder(data,cursor)
                    _inline = {}
                    _indoser = {}
                    _out = {}
                    _outline = {}

                    for idx, item in enumerate(io):
                        reciclado = 0
                        if item["artigo_cod"].startswith("R000"):
                            reciclado = 1
                        
                        order = order + 1
                        if data["saida_mp"]==1:
                            pass
                            # if ((item['mov']=='OUT' or item['mov']=='OUT_LINE') and f'{item["lote_id"]}-{item["doser"]}' not in _out):
                            #     dml = db.dml(TypeDml.INSERT,{"doser":item["doser"],"type_mov":"OUT","status":-1,"`order`":order,"t_stamp":data["date"]},"lotesdosers",None,None,False)
                            #     db.execute(dml.statement, cursor, dml.parameters)
                            #     _out[f'{item["lote_id"]}-{item["doser"]}'] = True
                            # if (item['mov']=='OUT_LINE' and f'{item["lote_id"]}' not in _outline):
                            #     dml = db.dml(TypeDml.INSERT,{"lote_id":item["lote_id"],"n_lote":item["n_lote"],"artigo_cod":item["artigo_cod"],"type_mov":"OUT","status":-1,"t_stamp":data["date"]},"loteslinha",None,None,False)
                            #     db.execute(dml.statement, cursor, dml.parameters)
                            #     lastid = cursor.lastrowid
                            #     dml = db.dml(TypeDml.UPDATE,{},"loteslinha",{"id":f'=={lastid}'},None,False)
                            #     statement = f"""{dml.statement.replace('SET',f"SET `order`={lastid}*100000000",1)} """
                            #     db.execute(statement, cursor, dml.parameters)
                            #     _outline[f'{item["lote_id"]}'] = True
                        
                        if data["saida_mp"] == 3:
                            pass

                        if (item['mov']=='IN'):
                            group_id = data["group_id"] if "group_id" in data and data["group_id"] is not None else item["group_id"]
                            n_lote = data["n_lote"] if "n_lote" in data and data["n_lote"]!=item["n_lote"] else item["n_lote"]           
                            lote_id_sage = data["id"] if "id" in data and data["id"] else item["lote_id"] 
                            qty_lote_buffer = data["qty_lote_buffer"] if "qty_lote_buffer" in data and data["qty_lote_buffer"] else item["qty_lote"] 
                            #print("----------------------------------------")
                            #print({"qty_lote":data["qty_lote"],"t_stamp":data["date"],"end_id":item["end_id"],"type_mov":"IN","status":-1,"artigo_cod":item["artigo_cod"],"n_lote":n_lote,"lote_id":data["lote_id"],"`group`":group_id,"lote_id_sage":lote_id_sage,"qty_lote_buffer":qty_lote_buffer})
                            #print({"t_stamp":data["date"],"doser":item["doser"],"`order`":order,"type_mov":"IN","status":-1,"artigo_cod":item["artigo_cod"],"n_lote":n_lote,"lote_id":data["lote_id"],"group_id":group_id,"loteslinha_id":2222222222222,"qty_consumed":0})
                            #return Response({"status": "success", "id": None, "title": f"Registado com Sucesso!", "subTitle": ''})
                            linha_order = None
                            if item['end_id'] is None:
                                if item['loteslinha_id'] is None and item['loteid_doser'] is None:
                                    if  f'{item["lote_id"]}' not in _inline:
                                        print("INSERT IN LINE")
                                        dml = db.dml(TypeDml.INSERT,{"qty_lote":data["qty_lote"],"t_stamp":data["date"],"type_mov":"IN","status":-1,"artigo_cod":item["artigo_cod"],"n_lote":n_lote,"lote_id":data["lote_id"],"`group`":group_id,"lote_id_sage":lote_id_sage,"qty_lote_buffer":qty_lote_buffer},"loteslinha",None,None,False)
                                        db.execute(dml.statement, cursor, dml.parameters)
                                        lastid = cursor.lastrowid
                                        linha_order = lastid*100000000
                                        _inline[f'{item["lote_id"]}'] = lastid                              
                                        dml = db.dml(TypeDml.UPDATE,{},"loteslinha",{"id":f'=={lastid}'},None,False)
                                        statement = f"""{dml.statement.replace('SET',f"SET `order`={lastid}*100000000",1)} """
                                        db.execute(statement, cursor, dml.parameters)
                                if item['loteslinha_id'] is None or item['loteid_doser'] is None:
                                    if  f'{item["lote_id"]}-{item["doser"]}' not in _indoser:
                                        print("INSERT IN LOTE DOSER")
                                        order = order + 1
                                        linhaId = item['loteslinha_id'] if  f'{item["lote_id"]}' not in _inline else _inline[f'{item["lote_id"]}']
                                        lote_id =  linha_order if reciclado==1 else data["lote_id"]
                                        dml = db.dml(TypeDml.INSERT,{"t_stamp":data["date"],"doser":item["doser"],"`order`":order,"type_mov":"IN","status":-1,"artigo_cod":item["artigo_cod"],"n_lote":n_lote,"lote_id":lote_id,"group_id":group_id,"loteslinha_id":linhaId,"qty_consumed":0},"lotesdosers",None,None,False)
                                        db.execute(dml.statement, cursor, dml.parameters)
                                        _indoser[f'{item["lote_id"]}-{item["doser"]}'] = True
                            else:
                                pass
                                if item['loteslinha_id'] is None and item['loteid_doser'] is None:
                                    if  f'{item["lote_id"]}' not in _inline:
                                        print("INSERT IN LINE")
                                        dml = db.dml(TypeDml.INSERT,{"qty_lote":data["qty_lote"],"t_stamp":data["date"],"end_id":item["end_id"],"type_mov":"IN","status":-1,"artigo_cod":item["artigo_cod"],"n_lote":n_lote,"lote_id":data["lote_id"],"`group`":group_id,"lote_id_sage":lote_id_sage,"qty_lote_buffer":qty_lote_buffer},"loteslinha",None,None,False)
                                        db.execute(dml.statement, cursor, dml.parameters)
                                        lastid = cursor.lastrowid
                                        linha_order = lastid*100000000
                                        _inline[f'{item["lote_id"]}'] = lastid                              
                                        dml = db.dml(TypeDml.UPDATE,{},"loteslinha",{"id":f'=={lastid}'},None,False)
                                        statement = f"""{dml.statement.replace('SET',f"SET `order`={lastid}*100000000",1)} """
                                        db.execute(statement, cursor, dml.parameters)
                                if item['loteslinha_id'] is None or item['loteid_doser'] is None:
                                    if  f'{item["lote_id"]}-{item["doser"]}' not in _indoser:
                                        print("INSERT IN LOTE DOSER")
                                        order = order + 1
                                        linhaId = item['loteslinha_id'] if  f'{item["lote_id"]}' not in _inline else _inline[f'{item["lote_id"]}']
                                        lote_id =  linha_order if reciclado==1 else data["lote_id"]
                                        dml = db.dml(TypeDml.INSERT,{"t_stamp":data["date"],"doser":item["doser"],"`order`":order,"type_mov":"IN","status":-1,"artigo_cod":item["artigo_cod"],"n_lote":n_lote,"lote_id":lote_id,"group_id":group_id,"loteslinha_id":linhaId,"qty_consumed":0},"lotesdosers",None,None,False)
                                        db.execute(dml.statement, cursor, dml.parameters)
                                        _indoser[f'{item["lote_id"]}-{item["doser"]}'] = True
                                
                        
                        
                        
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    #     print(item)
                    #     if item['id'] is None:
                    #         linharow = db.executeSimpleList(lambda: (f"""
                    #                 SELECT ll.id
                    #                 FROM loteslinha ll
                    #                 join (SELECT MAX(id) id FROM loteslinha WHERE lote_id={item["lote_id"]} AND `status`=1) mx on ll.id=mx.id
                    #                 WHERE type_mov='IN' AND `status`=1
                    #         """), cursor, {})['rows']
                    #         linhaId = linharow[0]['id'] if len(linharow) else None
                    #         if linhaId is None:
                    #             dml = db.dml(TypeDml.INSERT,{"type_mov":"IN","status":1,"artigo_cod":item["artigo_cod"],"n_lote":item["n_lote"],"lote_id":item["lote_id"],"`group`":item["group_id"],"qty_lote":item["qty_lote"]},"loteslinha",None,None,False)
                    #             db.execute(dml.statement, cursor, dml.parameters)
                    #             linhaId = cursor.lastrowid
                    #         dml = db.dml(TypeDml.INSERT,{"doser":item["pick_doser"],"type_mov":"IN","status":1,"artigo_cod":item["artigo_cod"],"n_lote":item["n_lote"],"lote_id":item["lote_id"],"group_id":item["group_id"],"loteslinha_id":linhaId,"qty_consumed":0},"lotesdosers",None,None,False)
                    #         db.execute(dml.statement, cursor, dml.parameters)
                    #     else:
                    #         dml = db.dml(TypeDml.INSERT,{"doser":item["pick_doser"],"type_mov":"IN","status":1,"artigo_cod":item["artigo_cod"],"n_lote":item["n_lote"],"lote_id":item["lote_id"],"group_id":item["group_id"],"loteslinha_id":item["id"],"qty_consumed":0},"lotesdosers",None,None,False)
                    #         db.execute(dml.statement, cursor, dml.parameters)
        return Response({"status": "success", "id": None, "title": f"Registado com Sucesso!", "subTitle": ''})
    except Error:
        return Response({"status": "error", "title": f"Erro ao Registar!"})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
def Pick(request, format=None):
    data = request.data['parameters']
    print("#######################")
    
    def getInOut(data, cursor):
        plg = []
        #pgd = []
        print("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
        print(data)
        if ("pickItems" in data):
            plg=data["pickItems"]
        else:
            for artigo_key, artigo_value in data["artigos"].items():
                for group_key, group_value in artigo_value.items():
                    if group_key!='undefined':
                        if ('lotes' in group_value):
                            for lote_value in group_value['lotes']:
                                for doser_value in group_value['dosers']:
                                    print(lote_value)
                                    plg.append({"group_id":group_key, "lote_id":lote_value["lote_id"], "artigo_cod":artigo_key,"n_lote":lote_value["n_lote"],"qty_lote":lote_value["qty_lote"], "doser":doser_value})
                        #if ('dosers' in group_value):
                        #    for doser_value in group_value['dosers']:
                        #        print("DOSERVALUES")
                        #        print(doser_value)
                        #        pgd.append({"group_id":group_key,"artigo_cod":artigo_key,"doser":doser_value})
        print("...................")
        print(plg)
        print("ooooooooooooooooooooo")

        response = db.executeSimpleList(lambda: (
        f"""
            
           WITH PICK_LOTES_GROUPS AS(
                SELECT * FROM JSON_TABLE(
                '{json.dumps(plg)}'
                ,"$[*]" COLUMNS(rowid FOR ORDINALITY, group_id BIGINT(16) PATH "$.group_id", lote_id INT PATH "$.lote_id", artigo_cod VARCHAR(100) PATH "$.artigo_cod", n_lote VARCHAR(100) PATH "$.n_lote", doser VARCHAR(2) PATH "$.doser", qty_lote decimal(12,5) PATH "$.qty_lote")
                ) t
            ),
            VIEW_LINHA AS(SELECT * FROM loteslinha where `status` =1 AND closed=0),
            VIEW_DOSERS AS(
                    SELECT id,doser,n_lote,artigo_cod,t_stamp,qty_consumed,type_mov,loteslinha_id,group_id,ig_bobinagem_id,qty_to_consume,lote_id,t_stamp_fix,`order`,closed 
                    FROM lotesdosers 
                    where `status` = 1 AND closed=0
            ),
            LOTES_AVAILABLE AS(
                select t.*,SUM(t.qty_lote_available) over (PARTITION BY t.group_id) qty_artigo_available
                    FROM (
                        SELECT DISTINCT * FROM (
                        SELECT 
                        DOSERS.group_id, LOTES.artigo_cod,LOTES.lote_id,LOTES.n_lote,LOTES.qty_lote,DOSERS.loteslinha_id,DOSERS.`order`,
                        SUM(DOSERS.qty_consumed) over (PARTITION BY LOTES.lote_id) qty_lote_consumed,
                        qty_lote + SUM(DOSERS.qty_consumed) over (PARTITION BY LOTES.lote_id) qty_lote_available,
                        MIN(DOSERS.`order`) over (PARTITION BY LOTES.lote_id) min_order, #FIFO DATE TO ORDER ASC
                        MAX(DOSERS.`order`) over (PARTITION BY LOTES.lote_id) max_order
                        FROM VIEW_LINHA LOTES
                        LEFT JOIN VIEW_DOSERS DOSERS ON LOTES.id=DOSERS.loteslinha_id
                        WHERE DOSERS.group_id is not null
                        ) t WHERE  max_order=`order`
                    ) t WHERE qty_lote_available>0
            ),
            DOSERS_LASTMOV_OUT AS(
                SELECT * FROM (
                    select DOSERS.id,DOSERS.`order`,DOSERS.loteslinha_id,DOSERS.doser,DOSERS.artigo_cod,DOSERS.n_lote,DOSERS.lote_id,DOSERS.type_mov,DOSERS.group_id,
                    max(DOSERS.`order`) over (partition by DOSERS.doser) mx_order 
                    from VIEW_DOSERS DOSERS	where type_mov = 'OUT'
                ) t 
                WHERE t.mx_order=t.`order`
            ),
            LOTESDOSERS_ARTIGO AS(
                SELECT * FROM (
                    select DOSERS.id,DOSERS.`order`,DOSERS.loteslinha_id,DOSERS.doser,DOSERS.artigo_cod,DOSERS.n_lote,
                    DOSERS.lote_id,DOSERS.type_mov,DOSERS.group_id,max(DOSERS.`order`) over (partition by DOSERS.artigo_cod,DOSERS.doser) mx_order 
                    from VIEW_DOSERS DOSERS
                    LEFT JOIN DOSERS_LASTMOV_OUT DOUT ON DOSERS.doser=DOUT.doser
                    where DOSERS.type_mov <> 'C' and DOSERS.`order`>IFNULL(DOUT.`order`,0)
                ) t 
                WHERE t.mx_order=t.`order` and t.type_mov='IN'
            ),
            LOTESDOSERS_LOTE AS(
                	SELECT * FROM (
                        select DOSERS.id,DOSERS.`order`,DOSERS.loteslinha_id,DOSERS.doser,DOSERS.artigo_cod,DOSERS.n_lote,DOSERS.lote_id,DOSERS.type_mov,DOSERS.group_id,
                        count(*) over (partition by DOSERS.lote_id) cnt_dosers, 
                        max(DOSERS.`order`) over (partition by DOSERS.lote_id,DOSERS.doser) mx_order
                        from VIEW_DOSERS DOSERS
                        LEFT JOIN DOSERS_LASTMOV_OUT DOUT ON DOSERS.doser=DOUT.doser
                        where DOSERS.type_mov <> 'C' and DOSERS.`order`>IFNULL(DOUT.`order`,0)
                    ) t 
                    WHERE t.mx_order=t.`order` and t.type_mov='IN'
            ),
            ACTUAL_GROUPS AS(
               #VERIFICA SE O LOTE PICADO JÁ FOI PREVIAMENTE PICADO
                select 
                PLG.*,
                d.id loteslinha_id, #SE NULL DAR ENTRADA EM LOTESLINHA
                LDL.`order`,LDL.lote_id loteid_doser, #SE NULL DAR ENTRADA DO LOTE/DOSER EM LOTESDOSERS, SENÃO JÁ EXISTE E IGNORAR
                CASE WHEN d.`group` IS NOT NULL THEN d.`group` ELSE CASE WHEN LDA.group_id IS NOT NULL THEN LDA.group_id ELSE PLG.group_id END END group_final
                FROM PICK_LOTES_GROUPS PLG
                LEFT JOIN (
                    select ll.id,ll.`order`,ll.artigo_cod,ll.n_lote,ll.lote_id,ll.type_mov,ll.`group`,max(ll.`order`) over (partition by ll.lote_id) mx_order 
                    from VIEW_LINHA ll
                ) d ON d.mx_order=d.`order` AND d.type_mov='IN' AND PLG.lote_id = d.lote_id
                LEFT JOIN LOTESDOSERS_ARTIGO LDA ON PLG.artigo_cod=LDA.artigo_cod and LDA.doser=PLG.doser
                LEFT JOIN LOTESDOSERS_LOTE LDL ON PLG.lote_id = LDL.lote_id and PLG.doser = LDL.doser
            ),
            IN_LINE AS (
                SELECT 
                /*LA.group_id lote_available_group_id, LA.qty_lote_available,*/ 
                AG.`order`,AG.lote_id,AG.artigo_cod,AG.n_lote,AG.doser,AG.loteslinha_id,AG.loteid_doser,AG.group_final group_id,AG.qty_lote,'IN' mov
                FROM ACTUAL_GROUPS AG
                LEFT JOIN LOTES_AVAILABLE LA ON LA.lote_id=AG.lote_id
                WHERE (AG.loteid_doser is null or AG.loteslinha_id is null) and (LA.group_id is null or LA.qty_lote_available>0)
            ),
            OUT_DOSER_LINE AS (
               SELECT LL.`order`,LL.lote_id,LL.artigo_cod,LL.n_lote,LL.doser,LL.loteslinha_id,LL.id loteid_doser,LL.group_id,null qty_lote, CASE WHEN I.lote_id IS NULL THEN 'OUT' ELSE NULL END mov
                FROM LOTESDOSERS_LOTE LL
                LEFT JOIN IN_LINE I ON LL.group_id = I.group_id AND LL.doser=I.doser
                #WHERE I.lote_id IS NULL
            ),
            OUT_LINE AS (
                SELECT 
                LDL.`order`,LDL.lote_id,LDL.artigo_cod,LDL.n_lote,LDL.doser,LDL.loteslinha_id,LDL.id loteid_doser,LDL.group_id,null qty_lote,
                CASE WHEN (LDL.cnt_dosers <= count(*) over (partition by LDL.lote_id)) THEN 'OUT_LINE' ELSE 'OUT' END mov
                FROM IN_LINE IL
                JOIN LOTESDOSERS_LOTE LDL ON LDL.doser=IL.doser
                WHERE IL.group_id<>LDL.group_id
            )
            SELECT * FROM OUT_LINE
            UNION
            SELECT * FROM IN_LINE

        """
        ), cursor, {})
        return response["rows"]

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                io = getInOut(data,cursor)
                _inline = {}
                _indoser = {}
                _out = {}
                _outline = {}
                for item in io:
                    if ((item['mov']=='OUT' or item['mov']=='OUT_LINE') and f'{item["lote_id"]}-{item["doser"]}' not in _out):
                        dml = db.dml(TypeDml.INSERT,{"doser":item["doser"],"type_mov":"OUT","status":1},"lotesdosers",None,None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                        lastid = cursor.lastrowid
                        dml = db.dml(TypeDml.UPDATE,{},"lotesdosers",{"id":f'=={lastid}'},None,False)
                        statement = f"""{dml.statement.replace('SET',f"SET `order`={lastid}*100000000",1)} """
                        db.execute(statement, cursor, dml.parameters)
                        _out[f'{item["lote_id"]}-{item["doser"]}'] = True
                    if (item['mov']=='OUT_LINE' and f'{item["lote_id"]}' not in _outline):
                        dml = db.dml(TypeDml.INSERT,{"lote_id":item["lote_id"],"n_lote":item["n_lote"],"artigo_cod":item["artigo_cod"],"type_mov":"OUT","status":1},"loteslinha",None,None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                        lastid = cursor.lastrowid
                        dml = db.dml(TypeDml.UPDATE,{},"loteslinha",{"id":f'=={lastid}'},None,False)
                        statement = f"""{dml.statement.replace('SET',f"SET `order`={lastid}*100000000",1)} """
                        db.execute(statement, cursor, dml.parameters)
                        _outline[f'{item["lote_id"]}'] = True
                    if (item['mov']=='IN'):
                        if item['loteslinha_id'] is None and item['loteid_doser'] is None:
                            if  f'{item["lote_id"]}' not in _inline:
                                print("INSERT IN LINE")
                                dml = db.dml(TypeDml.INSERT,{"type_mov":"IN","status":1,"artigo_cod":item["artigo_cod"],"n_lote":item["n_lote"],"lote_id":item["lote_id"],"`group`":item["group_id"],"qty_lote":item["qty_lote"]},"loteslinha",None,None,False)
                                db.execute(dml.statement, cursor, dml.parameters)
                                lastid = cursor.lastrowid
                                _inline[f'{item["lote_id"]}'] = lastid                              
                                dml = db.dml(TypeDml.UPDATE,{},"loteslinha",{"id":f'=={lastid}'},None,False)
                                statement = f"""{dml.statement.replace('SET',f"SET `order`={lastid}*100000000",1)} """
                                db.execute(statement, cursor, dml.parameters)
                        if item['loteslinha_id'] is None or item['loteid_doser'] is None:
                            if  f'{item["lote_id"]}-{item["doser"]}' not in _indoser:
                                print("INSERT IN LOTE DOSER")
                                linhaId = item['loteslinha_id'] if  f'{item["lote_id"]}' not in _inline else _inline[f'{item["lote_id"]}']
                                dml = db.dml(TypeDml.INSERT,{"doser":item["doser"],"type_mov":"IN","status":1,"artigo_cod":item["artigo_cod"],"n_lote":item["n_lote"],"lote_id":item["lote_id"],"group_id":item["group_id"],"loteslinha_id":linhaId,"qty_consumed":0},"lotesdosers",None,None,False)
                                db.execute(dml.statement, cursor, dml.parameters)
                                lastid = cursor.lastrowid
                                dml = db.dml(TypeDml.UPDATE,{},"lotesdosers",{"id":f'=={lastid}'},None,False)
                                statement = f"""{dml.statement.replace('SET',f"SET `order`={lastid}*100000000",1)} """
                                db.execute(statement, cursor, dml.parameters)
                                _indoser[f'{item["lote_id"]}-{item["doser"]}'] = True
                    #     print(item)
                    #     if item['id'] is None:
                    #         linharow = db.executeSimpleList(lambda: (f"""
                    #                 SELECT ll.id
                    #                 FROM loteslinha ll
                    #                 join (SELECT MAX(id) id FROM loteslinha WHERE lote_id={item["lote_id"]} AND `status`=1) mx on ll.id=mx.id
                    #                 WHERE type_mov='IN' AND `status`=1
                    #         """), cursor, {})['rows']
                    #         linhaId = linharow[0]['id'] if len(linharow) else None
                    #         if linhaId is None:
                    #             dml = db.dml(TypeDml.INSERT,{"type_mov":"IN","status":1,"artigo_cod":item["artigo_cod"],"n_lote":item["n_lote"],"lote_id":item["lote_id"],"`group`":item["group_id"],"qty_lote":item["qty_lote"]},"loteslinha",None,None,False)
                    #             db.execute(dml.statement, cursor, dml.parameters)
                    #             linhaId = cursor.lastrowid
                    #         dml = db.dml(TypeDml.INSERT,{"doser":item["pick_doser"],"type_mov":"IN","status":1,"artigo_cod":item["artigo_cod"],"n_lote":item["n_lote"],"lote_id":item["lote_id"],"group_id":item["group_id"],"loteslinha_id":linhaId,"qty_consumed":0},"lotesdosers",None,None,False)
                    #         db.execute(dml.statement, cursor, dml.parameters)
                    #     else:
                    #         dml = db.dml(TypeDml.INSERT,{"doser":item["pick_doser"],"type_mov":"IN","status":1,"artigo_cod":item["artigo_cod"],"n_lote":item["n_lote"],"lote_id":item["lote_id"],"group_id":item["group_id"],"loteslinha_id":item["id"],"qty_consumed":0},"lotesdosers",None,None,False)
                    #         db.execute(dml.statement, cursor, dml.parameters)
        return Response({"status": "success", "id": None, "title": f"Registado com Sucesso!", "subTitle": ''})
    except Error:
        return Response({"status": "error", "title": f"Erro ao Registar!"})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SaidaMP(request, format=None):
    data = request.data['parameters']
    def getLastMov(data,cursor):
        f = Filters({"artigo_cod": data['artigo_cod'], "n_lote":data["n_lote"], "status":1})
        f.setParameters({}, False)
        f.where()
        f.add(f'artigo_cod = :artigo_cod', True)
        f.add(f'n_lote = :n_lote', True)
        f.add(f'status = :status', True)
        f.value("and")   
        print(f.text)
        print(f.parameters)
        return db.executeSimpleList(lambda: (f'SELECT type_mov FROM loteslinha {f.text} order by id desc limit 1'), cursor, f.parameters)['rows'][0]['type_mov']

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                lastmov = getLastMov(data['lote'],cursor)
                if lastmov=='IN':
                    dml = db.dml(TypeDml.INSERT,{"lote_id":data['lote']["lote_id"],"artigo_cod":data['lote']["artigo_cod"],"n_lote":data['lote']["n_lote"],"qty_reminder":data["reminder"],"status":1,"type_mov":"OUT"},"loteslinha",None,None,False)
                    db.execute(dml.statement, cursor, dml.parameters)
                    lastid = cursor.lastrowid
                    dml = db.dml(TypeDml.UPDATE,{},"loteslinha",{"id":f'=={lastid}'},None,False)
                    statement = f"""{dml.statement.replace('SET',f"SET `order`={lastid}*100000000",1)} """
                    db.execute(statement, cursor, dml.parameters)
        return Response({"status": "success", "id": None, "title": f"Registado com Sucesso!", "subTitle": ''})
    except Error:
        return Response({"status": "error", "title": f"Erro ao Registar!"})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SaidaDoser(request, format=None):
    data = request.data['parameters']
    
    def filterMultiSelect(data,name,field):
        f = Filters(data)
        fP = {}
        if name in data:
            dt = [o['value'] for o in data[name]]
        
            value = 'in:' + ','.join(f"{w}" for w in dt)
            fP[field] = {"key": field, "value": value, "field": lambda k, v: f'{k}'}
        f.setParameters({**fP}, True)
        f.auto()
        f.where()
        f.value()
        return f
    fdosers = filterMultiSelect(data,'dosers','doser')

    def getLastMoves(filter,cursor):
        return db.executeSimpleList(lambda: (f"""
            select * from (
                SELECT 
                id,type_mov,
                doser,
                MAX(id) over (partition by doser) mx_id
                FROM lotesdosers {filter.text} and `status`= 1
            ) t WHERE mx_id=id and type_mov<>'OUT'
        """), cursor, filter.parameters)['rows']




    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                lmoves = getLastMoves(fdosers,cursor)
                for item in lmoves:
                    dml = db.dml(TypeDml.INSERT,{"doser":item['doser'],"status":1,"qty_consumed":0,"type_mov":"OUT"},"lotesdosers",None,None,False)
                    db.execute(dml.statement, cursor, dml.parameters)
                    lastid = cursor.lastrowid
                    dml = db.dml(TypeDml.UPDATE,{},"lotesdosers",{"id":f'=={lastid}'},None,False)
                    statement = f"""{dml.statement.replace('SET',f"SET `order`={lastid}*100000000",1)} """
                    db.execute(statement, cursor, dml.parameters)  
        return Response({"status": "success", "id": None, "title": f"Registado com Sucesso!", "subTitle": ''})
    except Error:
        return Response({"status": "error", "title": f"Erro ao Registar!"})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def RectifyBobinagem(request, format=None):
    data = request.data.get("parameters")
    def allowRectify(data,cursor):
        f = Filters({"idigd": data["ig_id"]})
        f.where()
        f.add(f'ig_bobinagem_id = :idigd', True)
        f.value("and")
        parameters={**f.parameters}
        rows = db.executeSimpleList(lambda: (f'SELECT count(*) n FROM lotesdosers {f.text} and closed=0 and status=1'), cursor, parameters)['rows']
        if len(rows)>0:
            return True
        return False

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                allow = allowRectify(data,cursor)
                if allow:
                    dml = db.dml(TypeDml.UPDATE,{"artigo_cod":None,"n_lote":None,"loteslinha_id":None,"lote_id":None,"qty_consumed":"xx"},"lotesdosers",{"ig_bobinagem_id":f'=={data["ig_id"]}'},None,False)
                    statement = dml.statement.replace("%(qty_consumed)s","qty_to_consume*-1")
                    db.execute(statement, cursor, dml.parameters)
                    args = [data["ig_id"]]
                    cursor.callproc('fix_consumos',args)
                else:
                    return Response({"status": "error", "title": "Não é possível retificar a bobinagem!"})
                pass
                return Response({"status": "success", "id":0, "title": "Bobinagem Retificada com sucesso!", "subTitle":''})
    except Error:
        return Response({"status": "error", "title": "Erro ao Retificar Bobinagem!"})


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def LotesAvailable(request, format=None):
    connection = connections[connGatewayName].cursor()
    print("dddddddddddddddddddddddddddddddddddd")
    print(request.data["parameters"])
    f = Filters(request.data['filter'])
    f.setParameters({
       # **rangeP(f.filterData.get('forderdate'), 'ORDDAT_0', lambda k, v: f'"enc"."{k}"'),
       #**rangeP(f.filterData.get('SHIDAT_0'), 'SHIDAT_0', lambda k, v: f'"enc"."{k}"'),
       #"LASDLVNUM_0": {"value": lambda v: v.get('LASDLVNUM_0').lower() if v.get('LASDLVNUM_0') is not None else None, "field": lambda k, v: f'lower("enc"."{k}")'},
       #"status": {"value": lambda v: statusFilter(v.get('ofstatus')), "field": lambda k, v: f'"of"."{k}"'}
    }, True)
    f.where()
    f.auto()
    f.value()
    parameters = {**f.parameters}

    dql = dbgw.dql(request.data, False)
    cols = f'''QLA.*,ITM."ITMDES1_0"'''
    dql.columns=encloseColumn(cols,False)
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")

    response = dbgw.executeList(lambda p, c, s: (
        f"""
        WITH
            VIEW_LINHA AS(SELECT * FROM {sgpAlias}.loteslinha where status <> 0 AND closed=0),
            VIEW_DOSERS AS(
                SELECT id,doser,n_lote,artigo_cod,t_stamp,qty_consumed,type_mov,loteslinha_id,group_id,ig_bobinagem_id,qty_to_consume,lote_id,t_stamp_fix,"order",closed 
                FROM {sgpAlias}.lotesdosers where status <> 0 AND closed=0 --AND `order` < (select MIN(`order`) `limit_order` from lotesdosers ld where `status` <> 0 AND closed=0 AND ld.ig_bobinagem_id = 2460)
            ),
            QTY_LOTES_AVAILABLE AS(
                select t.*,SUM(t.qty_lote_available) over (PARTITION BY t.group_id) qty_artigo_available
                FROM (
                    SELECT DISTINCT * FROM (
                    SELECT 
                    DOSERS.group_id, LOTES.artigo_cod,LOTES.lote_id,LOTES.n_lote,LOTES.qty_lote,DOSERS.loteslinha_id,DOSERS."order",
                    SUM(DOSERS.qty_consumed) over (PARTITION BY LOTES.lote_id) qty_lote_consumed,
                    qty_lote + SUM(DOSERS.qty_consumed) over (PARTITION BY LOTES.lote_id) qty_lote_available,
                    MIN(DOSERS."order") over (PARTITION BY LOTES.lote_id) min_order, --FIFO DATE TO ORDER ASC
                    MAX(DOSERS."order") over (PARTITION BY LOTES.lote_id) max_order
                    FROM VIEW_LINHA LOTES
                    LEFT JOIN VIEW_DOSERS DOSERS ON LOTES.id=DOSERS.loteslinha_id
                    WHERE DOSERS.group_id is not null
                    ) t WHERE  max_order="order"
                ) t --WHERE qty_lote_available>0
            )
            SELECT {c(f'{dql.columns}')} 
            FROM QTY_LOTES_AVAILABLE QLA
            JOIN {sageAlias}."ITMMASTER" ITM on ITM."ITMREF_0" = QLA.artigo_cod
            {f.text}
            {s(dql.sort)} {p(dql.paging)}
        """
    ), connection, parameters)

    return Response(response)



#endregion































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
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")

    if groupByOrder == True:
        dql.columns = encloseColumn(['enc.ROWID', 'enc.SOHNUM_0', 'enc.ORDDAT_0', 'enc.DEMDLVDAT_0', 'enc.SHIDAT_0', 'enc.PRFNUM_0', 'enc.CUSORDREF_0', 'enc.DAYLTI_0',
                                    'enc.LASDLVDAT_0', 'enc.LASDLVNUM_0', 'enc.LASINVDAT_0', 'enc.LASINVNUM_0', 'enc.DSPTOTQTY_0', 'enc.DSPTOTVOL_0', 'enc.DSPTOTWEI_0',
                                     'enc.DSPVOU_0', 'enc.DSPWEU_0',
                                     'enc.BPCORD_0', 'enc.BPCNAM_0', 'enc.CREUSR_0', 'enc.CREDAT_0', 'enc.CREDATTIM_0', 'enc.UPDUSR_0', 'enc.UPDDAT_0', 'enc.UPDDATTIM_0'])

        response = dbgw.executeList(lambda p, c, s: (
            f"""
            SELECT {c(f'distinct(enc."SOHNUM_0") "key", {dql.columns}')} 
            FROM {sageAlias}."SORDER" as enc
            JOIN {sageAlias}."SORDERQ" as enclin on enc."SOHNUM_0" = enclin."SOHNUM_0"
            JOIN {sageAlias}."ITMMASTER" as itm on enclin."ITMREF_0" = itm."ITMREF_0"
            {f.text} {f2['text']}
            {s(dql.sort)} {p(dql.paging)}
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

        response = dbgw.executeList(lambda p, c, s: (
            f"""
            SELECT {c(f'{dql.columns}')} 
            FROM {sageAlias}."SORDER" as enc
            JOIN {sageAlias}."SORDERQ" as enclin on enc."SOHNUM_0" = enclin."SOHNUM_0"
            JOIN {sageAlias}."ITMMASTER" as itm on enclin."ITMREF_0" = itm."ITMREF_0"
            --LEFT JOIN producao_artigodetails as sgpitm on sgpitm.cod = itm."ITMREF_0"
            --LEFT JOIN planeamento_ordemfabricoartigos as ofa on ofa.encomenda_num = enclin."SOHNUM_0" and ofa.artigo_cod = itm."ITMREF_0"
            --LEFT JOIN planeamento_ordemfabrico as "of" on "of".id = ofa.ordemfabrico_id
            {f.text} {f2['text']}
            {s(dql.sort)} {p(dql.paging)}
            """
        ), connection, parameters, ["AUUID_0", "ROWID"])

    return Response(response)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SellOrderItemsList(request, format=None):
    connection = connections[connGatewayName].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add('enclin."SOHNUM_0" = :SOHNUM_0', True)
    f.value()
    parameters = {**f.parameters}

    dql = dbgw.dql(request.data, False)
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")
    dql.columns = encloseColumn(['enclin.SOHNUM_0', 'enclin.SDHNUM_0', 'enclin.ITMREF_0', 'enclin.ORIQTY_0',
                                'enclin.QTY_0', 'itm.ITMDES1_0', 'itm.TSICOD_2', 'itm.TSICOD_3', 'itm.TSICOD_0', 'itm.TSICOD_1'])

    response = dbgw.executeSimpleList(lambda: (
        f"""
         SELECT {dql.columns} 
         FROM {sageAlias}."SORDERQ" as enclin
         JOIN {sageAlias}."ITMMASTER" as itm on enclin."ITMREF_0" = itm."ITMREF_0"
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
    connection = connections[connGatewayName].cursor()
    cols = ['BPCNUM_0', 'BPCNAM_0']
    f = filterMulti(request.data['filter'], {
                    'fmulti_customer': {"keys": cols}})
    parameters = {**f['parameters']}

    dql = dbgw.dql(request.data, False)
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")
    dql.columns = encloseColumn(cols)

    response = dbgw.executeSimpleList(lambda: (
        f'SELECT {dql.columns} FROM {sageAlias}."BPCUSTOMER" {f["text"]} {dql.sort} {dql.limit}'
    ), connection, parameters)
    return Response(response)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SellOrdersLookup(request, format=None):
    connection = connections[connGatewayName].cursor()
    cols = ['SOHNUM_0', 'PRFNUM_0']
    f = filterMulti(request.data['filter'], {'fmulti_order': {"keys":cols}})
    parameters = {**f['parameters']}

    dql = dbgw.dql(request.data, False)
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")
    dql.columns = encloseColumn(cols)

    response = dbgw.executeSimpleList(lambda: (
        f'SELECT {dql.columns}, concat("SOHNUM_0", \' \', "PRFNUM_0") COMPUTED FROM {sageAlias}."SORDER" {f["text"]} {dql.sort} {dql.limit}'
    ), connection, parameters)
    return Response(response)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SellItemsLookup(request, format=None):
    connection = connections[connGatewayName].cursor()
    cols = ['ITMREF_0', 'ITMDES1_0']
    f = filterMulti(request.data['filter'], {'fmulti_item': {"keys": cols}})
    parameters = {**f['parameters']}

    dql = dbgw.dql(request.data, False)
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")
    dql.columns = encloseColumn(cols)

    response = dbgw.executeSimpleList(lambda: (
        f'SELECT {dql.columns}, concat("ITMREF_0", \' \', "ITMDES1_0") COMPUTED FROM {sageAlias}."ITMMASTER" {f["text"]} {dql.sort} {dql.limit}'
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
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")
    dql.columns = encloseColumn(cols,False)
    response = db.executeSimpleList(lambda: (
        f"""
            select 
            {dql.columns}
            from {sageAlias}."ITMMASTER" mprima
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
    sgpAlias = dbgw.dbAlias.get("sgp")
    dql.columns = encloseColumn(cols,False)
    response = db.executeSimpleList(lambda: (
        f"""SELECT {dql.columns} 
            from 
            {sgpAlias}.producao_paletizacao pp
            join {sgpAlias}.producao_paletizacaodetails ppd on ppd.paletizacao_id = pp.id
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
    connection = connections[connGatewayName].cursor()
    cols = ['ofa.id as ofaid','itm."ITMDES1_0"','enclin."ORIQTY_0"', 'enc."BPCNAM_0"', 'itmd.*']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'"of".id = :id', True)
    f.value("and")
    parameters = {**f.parameters}
    dql = dbgw.dql(request.data, False)
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")
    dql.columns = encloseColumn(cols,False)
    response = dbgw.executeSimpleList(lambda: (
        f"""
            SELECT {dql.columns} 
            FROM planeamento_ordemfabrico as "of"
            JOIN planeamento_ordemfabricoartigos as ofa on ofa.ordemfabrico_id = "of".id
            JOIN producao_artigodetails as itmd on ofa.artigo_cod = itmd.cod
            JOIN {sageAlias}."ITMMASTER" as itm on itmd.cod = itm."ITMREF_0"
            JOIN {sageAlias}."SORDER" as enc on enc."SOHNUM_0" = ofa.encomenda_num
            JOIN {sageAlias}."SORDERQ" as enclin on ofa.encomenda_num = enclin."SOHNUM_0" and ofa.artigo_cod = enclin."ITMREF_0" 
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

