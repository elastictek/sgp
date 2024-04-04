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
from support.database import encloseColumn, Filters, DBSql, TypeDml, fetchall, Check,ParsedFilters
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
from support.postdata import PostData

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

# def updateMaterializedView(mv):
#     conngw = connections[connGatewayName]
#     cgw = conngw.cursor()
#     cgw.execute(f"REFRESH MATERIALIZED VIEW public.{mv};")
#     conngw.commit()

# def CreateCarga(request, format=None):
#     data = request.data.get("parameters")

#     def checkOrder(eef):
#         c = connections[connGatewayName].cursor()
#         f = Filters({"eef":eef})
#         f.where(False,"and")
#         f.value("and")
#         response = dbgw.executeSimpleList(lambda: (f"""select id from mv_openorders oo where oo.status_enc=1 {f.text}"""), c, f.parameters)
#         if len(response["rows"])>0:
#             return response["rows"][0]
#         return None

#     try:
#         open = checkOrder(data.get("values").get("eef"))
#         if not open or open is None:
#             return Response({"status": "error", "title": "A encomenda já se encontra fechada!"})
#         with transaction.atomic():
#             with connections["default"].cursor() as cursor:
#                 data.get("values")["artigos"] = json.dumps(data.get("values").get("artigos"), ensure_ascii=False)
#                 args = [*[value for value in data.get("values").values()],request.user.id]
#                 print(data)
#                 print(args)
#                 cursor.callproc('create_carga',args)
#                 rows = fetchall(cursor)
#                 updateMaterializedView("mv_cargas")
#                 #row = cursor.fetchone()
#                 #cursor.execute("select * from tmp_paletecheck_report;")
#                 #report = fetchall(cursor)
#         return Response({"status": "success", "data":rows, "title":None})
#     except Exception as error:
#         return Response({"status": "error", "title": str(error)})

# def CargasLookup(request, format=None):
#     cols = ['*']
#     f = Filters(request.data['filter'])
#     f.setParameters({}, False)
#     f.where()
#     f.add(f'carga.eef = :enc', lambda v:(v!=None))
#     f.add(f'carga.eef = :feef', lambda v:(v!=None))
#     f.add(f'carga.prf = :fprf', lambda v:(v!=None))
#     f.value("and")
#     parameters = {**f.parameters}
    
#     dql = db.dql(request.data, False)
#     dql.columns = encloseColumn(cols,False)
#     with connections["default"].cursor() as cursor:
#         response = db.executeSimpleList(lambda: (
#             f"""
#                 select distinct * from(
#                     select 
#                     carga.*,
#                     case when p.id is null then 0 else count(*) over (partition by carga.id) end npaletes,
#                     sum(p.nbobines_emendas) over (partition by carga.id) nbobines_emendas,
#                     sum(p.nbobines_real) over (partition by carga.id) nbobines_real,
#                     IFNULL(sum(case when p.nbobines_real = 0 then 0 else p.nbobines_emendas/p.nbobines_real end) over (partition by carga.id),0) perc_nbobines_emendas,
#                     sum(p.area_real) over (partition by carga.id) area_real
#                     from producao_carga carga
#                     left join producao_palete p on p.carga_id=carga.id
#                     {f.text}
#                 ) t
#                 {dql.sort}
#             """
#         ), cursor, parameters)
#         return Response(response)

# def CargasList(request, format=None):
#     connection = connections[connGatewayName].cursor()
#     print("filter")
#     print(request.data['filter'])
#     f = Filters(request.data['filter'])
#     f.setParameters({
#         "expedicao": {"value": lambda v: Filters.getNumeric(v.get('fdispatched')), "field": lambda k, v: f'me.{k}'},
#     #    **rangeP(f.filterData.get('fdata'), 'timestamp', lambda k, v: f'DATE(timestamp)'),
#     #    **rangeP(f.filterData.get('fdatain'), 'in_t', lambda k, v: f'DATE(in_t)'),
#     #    **rangeP(f.filterData.get('fdataout'), 'out_t', lambda k, v: f'DATE(out_t)'),
#     #    "diff": {"value": lambda v: '>0' if "fdataout" in v and v.get("fdataout") is not None else None, "field": lambda k, v: f'TIMESTAMPDIFF(second,in_t,out_t)'},
#     #    "nome": {"value": lambda v: v.get('flote').lower() if v.get('flote') is not None else None, "field": lambda k, v: f'lower(sgppl.{k})'},
#     #    "carga": {"value": lambda v: v.get('fcarganome').lower() if v.get('fcarganome') is not None else None, "field": lambda k, v: f'lower(sgppl.{k})'},
#     #    "nbobines_real": {"value": lambda v: Filters.getNumeric(v.get('fnbobinesreal')), "field": lambda k, v: f'sgppl.{k}'},
#     #    "nbobines_emendas": {"value": lambda v: Filters.getNumeric(v.get('fnbobines_emendas')), "field": lambda k, v: f'sgppl.{k}'},
#     #    "nbobines_sem_destino": {"value": lambda v: Filters.getNumeric(v.get('fnbobines_sem_destino')), "field": lambda k, v: f'sgppl.{k}'},
#     #    "lar": {"value": lambda v: Filters.getNumeric(v.get('flargura')), "field": lambda k, v: f"j->>'{k}'"},
#     #    "area_real": {"value": lambda v: Filters.getNumeric(v.get('farea')), "field": lambda k, v: f'sgppl.{k}'},
#     #    "comp_real": {"value": lambda v: Filters.getNumeric(v.get('fcomp')), "field": lambda k, v: f'sgppl.{k}'},
#     #    "mes": {"value": lambda v: Filters.getNumeric(v.get('fmes')), "field": lambda k, v: f'mv.{k}'},
#     #    "disabled": {"value": lambda v: Filters.getNumeric(v.get('fdisabled')), "field": lambda k, v: f'sgppl.{k}'},
#     #    "ano": {"value": lambda v: Filters.getNumeric(v.get('fano')), "field": lambda k, v: f'mv.{k}'},
#     #    "diam_avg": {"value": lambda v: Filters.getNumeric(v.get('fdiam_avg')), "field": lambda k, v: f'sgppl.{k}'},
#     #    "diam_max": {"value": lambda v: Filters.getNumeric(v.get('fdiam_max')), "field": lambda k, v: f'sgppl.{k}'},
#     #    "diam_min": {"value": lambda v: Filters.getNumeric(v.get('fdiam_min')), "field": lambda k, v: f'sgppl.{k}'},
#     #    "destino": {"value": lambda v: v.get('fdestinoold').lower() if v.get('fdestinoold') is not None else None, "field": lambda k, v: f'lower(sgppl.{k})'},
#     #    "peso_bruto": {"value": lambda v: Filters.getNumeric(v.get('fpeso_bruto')), "field": lambda k, v: f'sgppl.{k}'},
#     #    "peso_liquido": {"value": lambda v: Filters.getNumeric(v.get('fpeso_liquido')), "field": lambda k, v: f'sgppl.{k}'},
#     #    "carga_id": {"value": lambda v: v.get('fcarga'), "field": lambda k, v: f'sgppl.{k}'},
#     #    "nok":{"value": lambda v: Filters.getNumeric(v.get('fnok')), "field": lambda k, v: f'{k}'},
#     #    "nok_estados":{"value": lambda v: Filters.getNumeric(v.get('fnok_estados')), "field": lambda k, v: f'{k}'},
#     #    "cliente_nome": {"value": lambda v: v.get('fcliente').lower() if v.get('fcliente') is not None else None, "field": lambda k, v: f'lower(sgppl."{k}")'},
#     #    "ofid": {"value": lambda v: v.get('fof').upper() if v.get('fof') is not None else None, "field": lambda k, v: f'sgppl."{k}"'},
#     #    "ISSDHNUM_0": {"value": lambda v: v.get('fdispatched'), "field": lambda k, v: f' mv."SDHNUM_0"'},
#     #    "SDHNUM_0": {"value": lambda v: v.get('fsdh').lower() if v.get('fsdh') is not None else None, "field": lambda k, v: f'lower(mv."SDHNUM_0")'},
#     #    "BPCNAM_0": {"value": lambda v: v.get('fclienteexp').lower() if v.get('fclienteexp') is not None else None, "field": lambda k, v: f'lower(mv."{k}")'},
#     #    "EECICT_0": {"value": lambda v: v.get('feec').lower() if v.get('feec') is not None else None, "field": lambda k, v: f'lower(mv."{k}")'},
       
#     #    "matricula": {"value": lambda v: v.get('fmatricula').lower() if v.get('fmatricula') is not None else None, "field": lambda k, v: f'lower(mol.{k})'},
#     #    "matricula_reboque": {"value": lambda v: v.get('fmatricula_reboque').lower() if v.get('fmatricula_reboque') is not None else None, "field": lambda k, v: f'lower(mol.{k})'},
#     #    "prf": {"value": lambda v: v.get('fprf').lower() if v.get('fprf') is not None else None, "field": lambda k, v: f'lower(mol.{k})'},
#     #    "iorder": {"value": lambda v: v.get('forder').lower() if v.get('forder') is not None else None, "field": lambda k, v: f'lower(mol.{k})'},


#        #mv."BPCNAM_0",mv."ITMREF_0",mv."ITMDES1_0",mv."EECICT_0"

#     #    "fof": {"value": lambda v: v.get('fof')},
#     #    "vcr_num": {"value": lambda v: v.get('fvcr')},
#     #    "qty_lote": {"value": lambda v: v.get('fqty'), "field": lambda k, v: f'{k}'},
#     #    "qty_reminder": {"value": lambda v: v.get('fqty_reminder'), "field": lambda k, v: f'{k}'},
#     #    "type_mov": {"value": lambda v: v.get('ftype_mov'), "field": lambda k, v: f'{k}'}
#     }, True)
#     f.where()
#     f.auto()
#     f.value()

#     parameters = {**f.parameters}
#     dql = dbgw.dql(request.data, False,False)
#     cols = f"""*"""
#     dql.columns=encloseColumn(cols,False)
#     sql = lambda p, c, s: (
#         f"""            
#         with expedicoes as(
#             select distinct on(me."LOT_0") me.* 
#             from mv_expedicoes me
#         )  
#         select {c(f'{dql.columns}')} from(
#             select 
#             distinct on(mc.id) mc.*,
#             me.expedicao,me."IPTDAT_0" data_expedicao,
#             case when mp.id is null then 0 else count(*) over (partition by mc.id) end npaletes,
#             sum(mp.nbobines_emendas) over (partition by mc.id) nbobines_emendas,
#             sum(mp.nbobines_real) over (partition by mc.id) nbobines_real,
#             coalesce(sum(case when mp.nbobines_real = 0 then 0 else mp.nbobines_emendas/mp.nbobines_real end) over (partition by mc.id),0) perc_nbobines_emendas,
#             sum(mp.area_real) over (partition by mc.id) area_real
#             from mv_cargas mc
#             left join mv_paletes mp on mp.carga_id=mc.id
#             left join expedicoes me on me.carga_id = mc.id and me."LOT_0" = mp.nome
#             {f.text}
#         ) t 
#         {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
#         """
#     )
#     if ("export" in request.data["parameters"]):
#         dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
#         dql.paging=""
#         return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["gw"],dbi=dbgw,conn=connection)
#     try:
#         response = dbgw.executeList(sql, connection, parameters,[],None,None)
#     except Exception as error:
#         print(str(error))
#         return Response({"status": "error", "title": str(error)})
#     return Response(response)


def CargasList(request, format=None):
    connection = connections["default"].cursor()
    r = PostData(request)
    pf = ParsedFilters(r.filter,"where",r.apiversion)
    dql = db.dql(request.data, False,False)
    parameters = {**pf.parameters}
    cols=f"""*"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""  
            select {c(f'{dql.columns}')} from (    
                select 
                    DISTINCT pc.*,(select round((sum(ifnull(nbobines_emendas,0))/sum(ifnull(nbobines_real,0)))*100,2) from producao_palete pl where pl.carga_id=pc.id) nbobines_emendas,
                    (select sum(pl.area) from producao_palete pl where pl.carga_id=pc.id) m2,
                    JSON_ARRAYAGG(po.ofid) over (partition by pc.id) ofid, pcl.nome cliente_nome
                from producao_carga pc
                join planeamento_ordemproducao po on po.eef=pc.eef
                join producao_cliente pcl on pcl.id=po.cliente_id
                {pf.group()}
            ) pc
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in r.data):
        dql.limit=f"""limit {r.data.get("limit")}"""
        dql.paging=""
        return export(sql, db_parameters=parameters, parameters=r.data,conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    try:
        response = db.executeList(sql, connection, parameters,[],None,None,r.norun)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def PaletesCargaList(request, format=None):
    connection = connections["default"].cursor()
    r = PostData(request)
    pf = ParsedFilters(r.filter,"and",r.apiversion)
   
    parameters = {**pf.parameters}
    dql = db.dql(request.data, False,False)
    cols = f"""sgppl.id, sgppl.`timestamp`, sgppl.data_pal, sgppl.nome, sgppl.num, sgppl.estado, sgppl.area,
            sgppl.comp_total,sgppl.num_bobines,sgppl.diametro,sgppl.peso_bruto,sgppl.peso_palete, sgppl.peso_liquido,
            sgppl.cliente_id, sgppl.retrabalhada,sgppl.stock, sgppl.carga_id, sgppl.num_palete_carga, sgppl.destino,
            sgppl.ordem_id, sgppl.ordem_original, sgppl.ordem_original_stock, sgppl.num_palete_ordem,
            sgppl.draft_ordem_id,sgppl.ordem_id_original, sgppl.area_real, sgppl.comp_real,
            sgppl.diam_avg, sgppl.diam_max, sgppl.diam_min,sgppl.nbobines_real, sgppl.disabled,
            sgppl.artigo, sgppl.destinos, sgppl.nbobines_emendas,sgppl.destinos_has_obs,sgppl.nbobines_sem_destino,sgppl.core_bobines,
            sgppl.nok_estados, sgppl.nok, sgppl.lvl, pcarga.carga, po1.ofid AS ofid_original, po2.ofid, po1.op AS op_original,
            po2.op, pc.cod AS cliente_cod, pc.name AS cliente_nome, pc.limsup AS cliente_limsup, pc.liminf AS cliente_liminf,
            pc.diam_ref AS cliente_diamref,pt.prf_cod prf,pt.order_cod iorder"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""  
            SELECT {c(f'{dql.columns}')}
            FROM producao_palete sgppl
            LEFT JOIN producao_carga pcarga ON pcarga.id = sgppl.carga_id
            LEFT JOIN producao_cliente pc ON pc.id = sgppl.cliente_id
            LEFT JOIN planeamento_ordemproducao po1 ON po1.id = sgppl.ordem_id_original
            LEFT JOIN planeamento_ordemproducao po2 ON po2.id = sgppl.ordem_id
            LEFT JOIN producao_tempordemfabrico pt ON pt.id = po2.draft_ordem_id
            WHERE sgppl.disabled=0
            {pf.group()}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in r.data):
        dql.limit=f"""limit {r.data.get("limit")}"""
        dql.paging=""
        return export(sql, db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    try:
        response = db.executeList(sql, connection, parameters,[],None,None,r.norun)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def UpdateCarga(request, format=None):
    r = PostData(request)
    
    def _checkCargas(ids, cursor):
        response = db.executeSimpleList(lambda: (f"""        
            select count(*) cnt from producao_carga pc where pc.id in({ids}) and (pc.estado='C' or pc.expedida=1)
        """), cursor, {})
        return response["rows"][0]["cnt"]

    def _update(id,data,cursor):
        values = {
            "num_paletes":data.get("num_paletes"),
            "data_prevista":data.get("data_prevista"),
            "tipo":data.get("tipo")
        }
        dml = db.dml(TypeDml.UPDATE, values, "producao_carga", {"id":Filters.getNumeric(id,"isnull")}, None, False,[])
        db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                ids = ','.join(str(x["id"]) for x in r.data.get("rows"))
                chk = _checkCargas(ids,cursor)
                if chk >0:
                     return Response({"status": "error", "title": f"Existem cargas que se encontram fechadas. Não é possível efetuar alterações!"})
                for i, v in enumerate(r.data.get("rows")):
                    _update(v.get("id"),v,cursor)
        return Response({"status": "success", "title": "Alterações à carga efectuadas com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})


def UpdateCargaPL(request, format=None):
    r = PostData(request)
    
    def _update(id,data,cursor):
        values = {
            "matricula":data.get("matricula"),
            "matricula_reboque":data.get("matricula_reboque"),
            "modo_exp":data.get("modo_exp"),
            "data_producao":1 if data.get("data_producao") else 0,
            "po_cliente":data.get("po_cliente")
        }
        dml = db.dml(TypeDml.UPDATE, values, "producao_carga", {"id":Filters.getNumeric(id,"isnull")}, None, False,[])
        db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                _update(r.filter.get("carga_id"),r.data,cursor)
        return Response({"status": "success", "title": "Alterações à carga efectuadas com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})


def DeleteCarga(request, format=None):
    r = PostData(request)
    
    def _checkCarga(id, cursor):
        response = db.executeSimpleList(lambda: (f"""        
            select count(*) cnt from producao_carga pc where pc.id={id} and pc.estado='I' and pc.expedida=0
        """), cursor, {})
        return response["rows"][0]["cnt"]

    def _checkCargaHasPaletes(id, cursor):
        response = db.executeSimpleList(lambda: (f"""        
            select count(*) cnt from producao_palete pp where pp.carga_id={id}
        """), cursor, {})
        return response["rows"][0]["cnt"]

    def _delete(id,cursor):
        dml = db.dml(TypeDml.DELETE, None, "producao_carga", {"id":Filters.getNumeric(id,"isnull")}, None, False,[])
        db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                id = r.data.get("id")
                chk = _checkCarga(id,cursor)
                if chk == 0:
                     return Response({"status": "error", "title": f"A carga encontra-se completa. Não é possível efetuar alterações!"})
                chk = _checkCargaHasPaletes(id,cursor)
                if chk > 0:
                    return Response({"status": "error", "title": f"Não é possível eliminar a carga! Existem paletes que pertencem a esta carga!"})
                _delete(id,cursor)
        return Response({"status": "success", "title": "Carga removida com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def CloseCarga(request, format=None):
    r = PostData(request)
    
    def _checkCarga(id, cursor):
        response = db.executeSimpleList(lambda: (f"""        
            select count(*) cnt from producao_carga pc where pc.id={id} and pc.estado='I' and pc.expedida=0 and pc.num_paletes=pc.num_paletes_actual
        """), cursor, {})
        return response["rows"][0]["cnt"]

    def _checkCargaPaletes(id, cursor):
        response = db.executeSimpleList(lambda: (f"""        
            select count(*) cnt from producao_palete pp where pp.carga_id={id} and (pp.nok=1 or (pp.nome not like 'P%%' and pp.nome not like 'R%%'))
        """), cursor, {})
        return response["rows"][0]["cnt"]

    def _update(id,cursor):
        values={
            "estado":"C"
        }
        dml = db.dml(TypeDml.UPDATE, values, "producao_carga", {"id":Filters.getNumeric(id,"isnull")}, None, False,[])
        db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                id = r.data.get("id")
                chk = _checkCarga(id,cursor)
                if chk == 0:
                     return Response({"status": "error", "title": f"ANão é possível fechar a carga!"})
                chk = _checkCargaPaletes(id,cursor)
                if chk > 0:
                    return Response({"status": "error", "title": f"Não é possível fechar a carga! Existem paletes que não estão válidas/completas!"})
                _update(id,cursor)
        return Response({"status": "success", "title": "Carga Fechada com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def ConfirmCarga(request, format=None):
    r = PostData(request)
    
    def _checkCarga(id, cursor):
        response = db.executeSimpleList(lambda: (f"""        
            select count(*) cnt from producao_carga pc where pc.id={id} and pc.estado='C' and pc.expedida=0
        """), cursor, {})
        return response["rows"][0]["cnt"]

    def _checkCargaPaletes(id,paletes, cursor):
        print(f"""        
            select count(*) cnt from producao_palete pp where pp.nome in ({paletes}) and pp.carga_id={id} and (pp.nok=0 and (pp.nome like 'P%%' or pp.nome like 'R%%'))
        """)
        response = db.executeSimpleList(lambda: (f"""        
            select count(*) cnt from producao_palete pp where pp.nome in ({paletes}) and pp.carga_id={id} and (pp.nok=0 and (pp.nome like 'P%%' or pp.nome like 'R%%'))
        """), cursor, {})
        return response["rows"][0]["cnt"]

    def _update(id,cursor):
        values={
            "expedida":1,
            "data_expedicao":datetime.now()
        }
        dml = db.dml(TypeDml.UPDATE, values, "producao_carga", {"id":Filters.getNumeric(id,"isnull")}, None, False,[])
        db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                id = r.data.get("carga_id")
                n = len(r.data.get("paletes"))
                chk = _checkCarga(id,cursor)                
                if chk == 0:
                    return Response({"status": "error", "title": f"Não é possível confirmar a carga!"})
                paletes = ','.join(f"'{str(x)}'" for x in r.data.get("paletes"))
                print(paletes)
                chk = _checkCargaPaletes(id,paletes,cursor)
                if chk != n:
                    return Response({"status": "error", "title": f"A carga não pode ser confirmada. Existem paletes que não estão válidas/completas!"})
                _update(id,cursor)
        return Response({"status": "success", "title": "Carga Fechada com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def _compute(ids,cursor):
    if not ids:
        return {"sqm":0,"metros":0,"num_paletes_actual":0,"artigos":None}
    response = db.executeSimpleList(lambda: (f"""        
        with ARTIGOS AS(
            SELECT JSON_ARRAYAGG(JSON_OBJECT('id',artigo_id,'cod',artigo_cod,'des',artigo_des)) artigo from (
                SELECT 
                DISTINCT pa.* 
                FROM producao_palete pp,
                json_table(pp.artigo,'$[*]'columns(artigo_id int path '$.id',artigo_cod varchar(50) path '$.cod',artigo_des varchar(255) path '$.des')) pa
                WHERE pp.id in ({ids})
            ) t
        ),
        PALS AS (
            select sum(pp.area) sqm,sum(pp.comp_total) metros,count(*) num_paletes_actual 
            FROM producao_palete pp 
            WHERE pp.id in ({ids})
        )
        select ARTIGOS.artigo,PALS.* 
        from ARTIGOS
        CROSS JOIN PALS
    """), cursor, {})
    if "rows" in response and len(response["rows"])>0:
        return response["rows"][0]
    return None

def _update(carga_id,cursor):
        paletes = db.executeSimpleList(lambda: (f"""select id from producao_palete pp where carga_id={carga_id}"""), cursor, {})
        _data = None
        if paletes.get("rows") and len(paletes["rows"])>0:
            ids = ','.join(str(x["id"]) for x in paletes.get("rows"))
            _data = _compute(ids,cursor)
        if _data is None:
            _data = {"num_paletes_actual":0,"sqm":0,"metros":0,"artigos":None}
        dml = db.dml(TypeDml.UPDATE, _data, "producao_carga", {"id":Filters.getNumeric(carga_id,"isnull")}, None, False,[])
        db.execute(dml.statement, cursor, dml.parameters)

def DeletePaletesCarga(request, format=None):
    r = PostData(request)
    
    def _checkCarga(id, cursor):
        response = db.executeSimpleList(lambda: (f"""        
            select count(*) cnt from producao_carga pc where pc.id={id} and pc.estado='I' and pc.expedida=0
        """), cursor, {})
        return response["rows"][0]["cnt"]

    def _checkPaletes(ids,carga_id, cursor):
        response = db.executeSimpleList(lambda: (f"""        
            select count(*) cnt from producao_palete pp where pp.id in ({ids}) and pp.carga_id<>{carga_id}
        """), cursor, {})
        return response["rows"][0]["cnt"]

    def _checkExpedicaoSage(ids):
        connection = connections[connGatewayName].cursor()
        response = dbgw.executeSimpleList(lambda: (f"""
                select count(*) cnt
                from mv_paletes pp
                LEFT JOIN mv_pacabado_status mv on mv."LOT_0" = pp.nome
                where pp.id in ({ids}) and mv."SDHNUM_0" is not null
        """), connection, {})
        return response["rows"][0]["cnt"]

    def _delete(id,cursor):
        dml = db.dml(TypeDml.UPDATE, {"carga_id":None}, "producao_palete", {"id":Filters.getNumeric(id,"isnull")}, None, False,[])
        db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                carga_id = r.data.get("carga_id")
                chk = _checkCarga(carga_id,cursor)
                if chk == 0:
                     return Response({"status": "error", "title": f"A carga encontra-se completa. Não é possível efetuar alterações!"})
                ids = ','.join(str(x["id"]) for x in r.data.get("rows"))
                chk = _checkPaletes(ids,carga_id,cursor)
                if chk > 0:
                    return Response({"status": "error", "title": f"Não é possível remover uma ou mais paletes da carga! Existem paletes que não pertencem a esta carga!"})
                chk = _checkExpedicaoSage(ids)
                if chk > 0:
                    return Response({"status": "error", "title": f"Não é possível remover uma ou mais paletes da carga!. Verifique se foi expedida."})
                for i, v in enumerate(r.data.get("rows")):
                    _delete(v.get("id"),cursor)
                _update(carga_id,cursor)
        return Response({"status": "success", "title": "Palete(s) removida(s) da carga com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def AddPaletesCarga(request, format=None):
    r = PostData(request)
    
    def _checkCarga(id, cursor):
        response = db.executeSimpleList(lambda: (f"""        
            select count(*) cnt from producao_carga pc where pc.id={id} and pc.estado='I' and pc.expedida=0
        """), cursor, {})
        return response["rows"][0]["cnt"]

    def _checkPaletes(ids,carga_id, cursor):
        response = db.executeSimpleList(lambda: (f"""        
            select count(*) cnt from producao_palete pp where pp.id in ({ids}) and pp.carga_id is not null and pp.nok=1
        """), cursor, {})
        return response["rows"][0]["cnt"]

    def _checkExpedicaoSage(ids):
        connection = connections[connGatewayName].cursor()
        response = dbgw.executeSimpleList(lambda: (f"""
                select count(*) cnt
                from mv_paletes pp
                LEFT JOIN mv_pacabado_status mv on mv."LOT_0" = pp.nome
                where pp.id in ({ids}) and mv."SDHNUM_0" is not null
        """), connection, {})
        return response["rows"][0]["cnt"]

    def _add(id,carga_id,cursor):
        dml = db.dml(TypeDml.UPDATE, {"carga_id":carga_id}, "producao_palete", {"id":Filters.getNumeric(id,"isnull")}, None, False,[])
        db.execute(dml.statement, cursor, dml.parameters)  

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                carga_id = r.data.get("carga_id")
                chk = _checkCarga(carga_id,cursor)
                if chk == 0:
                     return Response({"status": "error", "title": f"A carga encontra-se completa. Não é possível efetuar alterações!"})
                ids = ','.join(str(x["id"]) for x in r.data.get("rows"))
                chk = _checkPaletes(ids,carga_id,cursor)
                if chk > 0:
                    return Response({"status": "error", "title": f"Não é possível adicionar uma ou mais paletes à carga! Existem paletes que já se encontram em carga, ou não estão ok!"})
                chk = _checkExpedicaoSage(ids)
                if chk > 0:
                    return Response({"status": "error", "title": f"Não é possível adicionar uma ou mais paletes na carga!. Verifique se foram expedidas."})
                for i, v in enumerate(r.data.get("rows")):
                    _add(v.get("id"),carga_id,cursor)
                _update(carga_id,cursor)
        return Response({"status": "success", "title": "Palete(s) adicionada(s) à carga com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def OpenOrderPaletesList(request, format=None):
    connection = connections["default"].cursor()
    r = PostData(request)
    pf = ParsedFilters(r.filter,"and",r.apiversion)   
    dql = db.dql(request.data, False,False)
    parameters = {**pf.parameters}

    cols = f"""pp.id,pp.nome,pp.area,pp.comp_total,pp.num_bobines,pp.num_bobines_act,pp.nbobines_real,pp.diam_avg,pp.diam_min,pp.diam_max,pp.peso_bruto,pp.peso_palete,pp.peso_liquido,
            artigo,po.ofid,po.eef,pp.timestamp"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""            
            select {c(f'{dql.columns}')}
            from producao_palete pp
            join planeamento_ordemproducao po on po.id=pp.ordem_id
            where carga_id is null  {pf.group()}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    try:
        response = db.executeList(sql, connection, parameters,[],None,None,r.norun)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def GetOrdemFabricoByOrder(request, format=None):
    connection = connections["default"].cursor()
    r = PostData(request)
    pf = ParsedFilters(r.filter,"where",r.apiversion)
    dql = db.dql(request.data, False,False)
    parameters = {**pf.parameters}

    cols = f"""*"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""            
            select {c(f'{dql.columns}')}
            from planeamento_ordemproducao
            {pf.group()}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    try:
        response = db.executeList(sql, connection, parameters,[],None,None,r.norun)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def NewCarga(request, format=None):
    r = PostData(request)
    
    def _checkPaletes(ids, cursor):
        response = db.executeSimpleList(lambda: (f"""        
            select count(*) cnt from producao_palete pp where pp.id in({ids}) and pp.carga_id is not null and pp.nbobines_real<>pp.num_bobines
        """), cursor, {})
        return response["rows"][0]["cnt"]

    def _cargaNome(data,cursor):
        response = db.executeSimpleList(lambda: (f"""select count(*) cnt from producao_carga pc where pc.eef = '{data.get("eef")}'"""), cursor, {})
        _n = response["rows"][0]["cnt"]+1
        _npad = "000" + str(_n)
        _npad=_npad[-3:]
        _tipo= "CAM" if data.get("contentor_id")=="Camião" else "CON"
        _nome= f"""{data.get("prf")}-{_tipo}{_npad}-{data.get("cliente_abr")}"""
        return {"num_carga":_n,"nome":_nome}



    def _insert(data,computed,_nome,cursor):
        values = {
                "carga":_nome.get("nome"),
                "num_carga":_nome.get("num_carga"),
                "artigos":computed.get("artigo"),
                "sqm":computed.get("sqm"),
                "metros":computed.get("metros"),
                "num_paletes":data.get("num_paletes"),
                "num_paletes_actual":computed.get("num_paletes_actual"),
                "expedida":0,
                "estado":"I",
                "eef":data.get("eef"),
                "prf":data.get("prf"),
                "cliente":data.get("cliente").strip(),
                "cliente_cod":data.get("cliente_cod"),
                "data_prevista":data.get("data_prevista"),
                "tipo":data.get("contentor_id").upper(),
                "timestamp":datetime.now(),
                "data":datetime.now().strftime("%Y-%m-%d"),
                "user_id":request.user.id,
            }
        dml = db.dml(TypeDml.INSERT, values, "producao_carga", None , None, False,[])
        db.execute(dml.statement, cursor, dml.parameters)
        return cursor.lastrowid
    
    def _update(id,carga_id,cursor):
        values = {
                "carga_id":carga_id
            }
        dml = db.dml(TypeDml.UPDATE, values, "producao_palete", {"id":Filters.getNumeric(id,"isnull")} , None, False,[])
        db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                ids = ','.join(str(x["id"]) for x in r.data.get("paletes"))
                if ids:
                    chk = _checkPaletes(ids,cursor)
                    if chk >0:
                        return Response({"status": "error", "title": f"Existem Paletes que não podem fazer parte da carga!"})
                _data = _compute(ids,cursor)
                if _data is None:
                    return Response({"status": "error", "title": f"Não é possível criar a carga!"})
                if r.data.get("num_paletes")< _data.get("num_paletes_actual"):
                    return Response({"status": "error", "title": f"O nº de paletes definidas não corresponde às paletes selecionadas!"})
                _nome = _cargaNome(r.data,cursor)
                _id = _insert(r.data,_data,_nome,cursor)
                if _id and ids:
                    for i, v in enumerate(r.data.get("paletes")):
                        _update(v.get("id"),_id,cursor)
                else:
                    return Response({"status": "error", "title": f"Erro ao criar a carga!"})
        return Response({"status": "success", "title": "Carga criada com sucesso!", "carga":_nome.nome, "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def CargasLookup(request, format=None):
    connection = connections["default"].cursor()
    r = PostData(request)
    pf = ParsedFilters(r.filter,"where",r.apiversion)   
    dql = db.dql(request.data, False,False)
    print(r.data)
    print(r.filter)
    print(pf.group())
    parameters = {**pf.parameters}

    cols = f"""t.id,t.carga,t.cliente,t.cliente_cod,t.eef,t.prf,t.matricula_reboque,t.matricula,t.modo_exp,t.tipo,
                t.num_paletes,t.num_paletes_actual,t.estado,t.sqm,t.metros,t.expedida,t.data_producao,t.po_cliente,
                JSON_ARRAYAGG(IFNULL(pac.produto,IFNULL(pp.produto_cod,pa.produto))) produto"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""            
            select {c(f'{dql.columns}')}
                from (
                SELECT distinct pc.*,pa.*,pcc.id cliente_id
                FROM producao_carga pc
                JOIN producao_palete pp on pp.carga_id = pc.id
                JOIN producao_cliente pcc on pcc.cod=pc.cliente_cod,
                json_table(pp.artigo,'$[*]'columns(artigo_id int path '$.id',artigo_cod varchar(50) path '$.cod',artigo_des varchar(255) path '$.des')) pa
                {pf.group()}
            ) t
            join producao_artigo pa on pa.id=t.artigo_id
            left join producao_produtos pp on pp.id=pa.produto_id    
            left join producao_artigocliente pac on pac.artigo_id=t.artigo_id and pac.cliente_id=t.cliente_id  
            group by t.id,t.carga,t.cliente,t.cliente_cod,t.eef,t.prf,t.matricula_reboque,t.matricula,t.modo_exp,t.tipo,
            t.num_paletes,t.num_paletes_actual,t.estado,t.sqm,t.metros,t.expedida
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    try:
        response = db.executeList(sql, connection, parameters,[],None,None,r.norun)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def OpenOrdersList(request, format=None):
    connection = connections[connGatewayName].cursor()
    r = PostData(request)
    pf = ParsedFilters(r.filter,"and",r.apiversion)   
    dql = dbgw.dql(request.data, False,False)
    parameters = {**pf.parameters}

    cols = f"""*"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""            
            select {c(f'{dql.columns}')} from (
            select distinct on(eef,prf) id,data_create,data_expedicao,eef,prf,cliente,cliente_abr,cliente_cod,
            json_agg(json_build_object('artigo_cod',artigo_cod,'artigo_des',artigo_des,'n_paletes_total',n_paletes_total,'qtd',qtd)) over (partition by eef,prf) details
            from mv_openorders oo 
            where oo.status_enc=1 {pf.group()}
            ) t
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["gw"],dbi=dbgw,conn=connection)
    try:
        response = dbgw.executeList(sql, connection, parameters,[],None,None,r.norun)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)