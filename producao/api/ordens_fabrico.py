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
import pandas as pd
# import cups
import os, tempfile
from collections import Counter
from producao.api.stock_cutter_1d import StockCutter1D

from pyodbc import Cursor, Error, connect, lowercase
from datetime import datetime
from django.http.response import JsonResponse
from rest_framework.decorators import api_view, authentication_classes, permission_classes, renderer_classes
from django.db import connections, transaction
from support.database import encloseColumn, Filters, DBSql, TypeDml, fetchall,fetchone, Check
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
from decimal import Decimal
from producao.api.currentsettings import checkCurrentSettings,updateCurrentSettings,changeStatus


connGatewayName = "postgres"
connMssqlName = "sqlserver"
dbgw = DBSql(connections[connGatewayName].alias)
sgpAlias = dbgw.dbAlias.get("sgp")
sageAlias = dbgw.dbAlias.get("sage")
db = DBSql(connections["default"].alias)
dbmssql = DBSql(connections[connMssqlName].alias)
mv_ofabrico_list = "mv_ofabrico_listv2"

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

def updateMaterializedView():
    conngw = connections[connGatewayName]
    cgw = conngw.cursor()
    cgw.execute(f"REFRESH MATERIALIZED VIEW public.{mv_ofabrico_list};")
    conngw.commit()

def _checkInitProduction(cs_id):
    with transaction.atomic():
        with connections["default"].cursor() as cursor:
            args = [cs_id]
            print(args)
            cursor.callproc('check_init_production',args)
            cursor.execute("select * from tmp_initproduction_report;")
            return fetchall(cursor)

def CheckInitProduction(request, format=None):
    data = request.data.get("parameters")
    try:
        report = _checkInitProduction(data.get("cs_id"))
        print(report)
        return Response({"status": "success", "data":report})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def OrdensFabricoList(request, format=None):
    def statusFilter(v):
        if ('fofabrico_status' not in v):
            return ''
        elif v['fofabrico_status'] == 'Todos':
            return ''
        elif v['fofabrico_status'] == 'Por Validar':
            return 'and (ofabrico_status = 0)'
        elif v['fofabrico_status'] == 'Em Elaboração':
            return 'and (ofabrico_status = 1)'
        elif v['fofabrico_status'] == 'Na Produção':
            return 'and (ofabrico_status = 2)'
        elif v['fofabrico_status'] == 'Em Produção':
            return 'and (ofabrico_status = 3)'
        elif v['fofabrico_status'] == 'Finalizada':
            return 'and (ofabrico_status = 9)'
        elif v['fofabrico_status'] == 'IN(2,3)':
            return 'and (ofabrico_status in (2,3))'
        elif v['fofabrico_status'] == 'IN(2,3,9)':
            return 'and (ofabrico_status in (2,3,9))'
        return ''
    allowInElaboration = True if request.data['parameters'].get('allowInElaboration') else False
    allowViewValidar = True if request.data['parameters'].get('allowViewValidar') else False
    connection = connections[connGatewayName].cursor()
    f = Filters(request.data['filter'])

    f.setParameters({
        "ativa":{"value": lambda v: Filters.getNumeric(v.get('fativa')), "field": lambda k, v: f'{k}'},
        "ofabrico":{"value": lambda v: Filters.getLower(v.get('fofabrico')), "field": lambda k, v: f'lower({k})'},
        "prf":{"value": lambda v: Filters.getLower(v.get('fprf')), "field": lambda k, v: f'lower({k})'},
        "iorder":{"value": lambda v: Filters.getLower(v.get('fiorder')), "field": lambda k, v: f'lower({k})'},
        "cod":{"value": lambda v: Filters.getLower(v.get('fcod')), "field": lambda k, v: f'lower({k})'},
        "cliente_nome":{"value": lambda v: Filters.getLower(v.get('fcliente_nome')), "field": lambda k, v: f'lower({k})'},
        "item":{"value": lambda v: Filters.getLower(v.get('fitem')), "field": lambda k, v: f'lower({k})'},
        "num_paletes_total":{"value": lambda v: Filters.getNumeric(v.get('fnum_paletes_total')), "field": lambda k, v: f'{k}'},
        "n_paletes_produzidas":{"value": lambda v: Filters.getNumeric(v.get('fn_paletes_produzidas')), "field": lambda k, v: f'{k}'},
        "n_paletes_stock_in":{"value": lambda v: Filters.getNumeric(v.get('fn_paletes_stock_in')), "field": lambda k, v: f'{k}'},
        **rangeP(f.filterData.get('fstart_prev_date'), 'start_prev_date', lambda k, v: f'{k}'),
        **rangeP(f.filterData.get('fend_prev_date'), 'end_prev_date', lambda k, v: f'{k}'),
        **rangeP(f.filterData.get('finicio'), 'inicio', lambda k, v: f'{k}'),
        **rangeP(f.filterData.get('ffim'), 'fim', lambda k, v: f'{k}')
        #**rangeP(f.filterData.get('fstart_prev_date'), 'start_prev_date', lambda k, v: f'{k}'),
        #**rangeP(f.filterData.get('fend_prev_date'), 'end_prev_date', lambda k, v: f'{k}'),
        #**rangeP(f.filterData.get('finicio'), 'inicio', lambda k, v: f'{k}'),
        #**rangeP(f.filterData.get('ffim'), 'fim', lambda k, v: f'{k}')
       
        
        #**rangeP(f.filterData.get('forderdate'), 'data_encomenda', lambda k, v: f'DATE({k})'),
        #**rangeP(f.filterData.get('fstartprevdate'), 'start_prev_date', lambda k, v: f'DATE({k})'),
        #**rangeP(f.filterData.get('fendprevdate'), 'end_prev_date', lambda k, v: f'DATE({k})'),
        # **rangeP(f.filterData.get('SHIDAT_0'), 'SHIDAT_0', lambda k, v: f'"enc"."{k}"'),
        # "LASDLVNUM_0": {"value": lambda v: v.get('LASDLVNUM_0').lower() if v.get('LASDLVNUM_0') is not None else None, "field": lambda k, v: f'lower("enc"."{k}")'}
    }, True)
    f.where(False,"and")
    f.auto()
    f.value()

    f2 = filterMulti(request.data['filter'], {
        #'fmulti_customer': {"keys": ['cliente_cod', 'cliente_nome'], "table": ''},
        #'fmulti_order': {"keys": ['iorder', 'prf'], "table": ''},
        #'fmulti_item': {"keys": ['item', 'item_nome'], "table": ''},
        #'f_ofabrico': {"keys": ['ofabrico'], "table": ''},
        #'f_agg': {"keys": ['cod'], "table": ''}
    }, False, "and",False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = dbgw.dql(request.data, False)
    cols = f"""*"""
    sql = lambda p, c, s: (
        f"""
        SELECT {c(f'{cols}')} 
        FROM {mv_ofabrico_list} oflist
        WHERE 1=1
        { ' and ofabrico_status not in (1)' if not allowInElaboration else ''}
        { ' and ofabrico_status not in (0)' if not allowViewValidar else ''}
        {statusFilter(request.data['filter'])}
        {f.text} {f2["text"]}
        {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    print(f.text)
    print(f.parameters)
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["gw"],dbi=dbgw,conn=connection)
    response = dbgw.executeList(sql, connection, parameters, [])
    return Response(response)

def OrdensFabricoInElaboration(request, format=None):
    connection = connections["default"].cursor()
    response = db.executeSimpleList(lambda: (
        f"""
            select pt.id, pt.cod,pt.status,pt2.of_id,pf.id formulacao_id,pf.designacao,pf.group_name ,pf.subgroup_name , pf.versao, pt2.cliente_nome 
            from producao_tempaggordemfabrico pt
            join producao_tempordemfabrico pt2 on pt2.agg_of_id = pt.id
            left join producao_formulacao pf on pf.id=pt.formulacao_id
            where pt.status=0 and not exists(select 1 from producao_ordemfabricodetails pa where pa.cod=pt2.of_id)
            order by pt.cod ASC, pt2.of_id ASC
        """
    ), connection, {})
    return Response(response)

def OrdensFabricoInElaborationAllowed(request, format=None):
    filter = request.data.get("filter")
    connection = connections["default"].cursor()
    f = Filters(filter)
    #f = Filters({"produto_id":2,"artigo_id":3})
    f.where(False,"")
    #f.add(f'(pt2.produto_id {f.nullValue("produto_id","=:produto_id")})',True )
    f.add(f'(pt2.produto_id = :produto_id)',lambda v:(v!=None) )
    f.add(f'(pt2.item_id = :artigo_id)',lambda v:(v!=None) )
    f.add(f'(pt2.cliente_cod = :cliente_cod)',lambda v:(v!=None) )
    f.value("and")
    f2 = Filters({"artigo_id":filter.get("artigo_id")})
    f2.where(False,"or" if f.hasFilters else "")
    f2.add(f'(exists ( select 1 from group_artigos tga where tga.artigo_id=:artigo_id and tga.`group`=ga.`group`))',lambda v:(v!=None))
    f2.value("and")
    response = db.executeSimpleList(lambda: (
        f"""
            select pt.id, pt.cod,pt.status,pt2.of_id,pf.id formulacao_id,pf.designacao,pf.group_name ,pf.subgroup_name , pf.versao
            from producao_tempaggordemfabrico pt
            join producao_tempordemfabrico pt2 on pt2.agg_of_id = pt.id
            left join producao_artigo pa on pa.id=pt2.item_id
            left join group_artigos ga on ga.artigo_id = pt2.item_id
            left join producao_formulacao pf on pf.id=pt.formulacao_id
            where 
            pt.status=0 and not exists(select 1 from producao_ordemfabricodetails pa where pa.cod=pt2.of_id)
             {f'and ({f.text} {f2.text})' if f.hasFilters or f2.hasFilters else ''}
            order by pt.cod ASC, pt2.of_id ASC
        """
    ), connection, {**f.parameters,**f2.parameters})
    return Response(response)

def OrdensFabricoAllowed(request, format=None):
    filter = request.data.get("filter")
    connection = connections["default"].cursor()
    f = Filters(filter)
    #f = Filters({"produto_id":2,"artigo_id":3})
    f.where(False,"")
    #f.add(f'(pt2.produto_id {f.nullValue("produto_id","=:produto_id")})',True )
    f.add(f'(pt2.produto_id = :produto_id)',lambda v:(v!=None) )
    f.add(f'(pt2.item_id = :artigo_id)',lambda v:(v!=None) )
    f.add(f'(pt2.cliente_cod = :cliente_cod)',lambda v:(v!=None) )
    f.add(f'(pt2.item_cod = :artigo_cod)',lambda v:(v!=None) )
    f.value("and")
    f2 = Filters({"artigo_id":filter.get("artigo_id")})
    f2.where(False,"or" if f.hasFilters else "")
    f2.add(f'(exists ( select 1 from group_artigos tga where tga.artigo_id=:artigo_id and tga.`group`=ga.`group`))',lambda v:(v!=None))
    f2.value("and")
    response = db.executeSimpleList(lambda: (
        f"""
            select distinct * from (
	            select pt.id, pt.cod, case when po.status is null then 1 else po.status end ofabrico_status,pt2.of_id, IFNULL(po.was_in_production,0) was_in_production,pc.id cs_id,pt2.cliente_nome, pt2.item_cod artigo_cod
	            from producao_tempaggordemfabrico pt
	            join producao_tempordemfabrico pt2 on pt2.agg_of_id = pt.id
	            left join planeamento_ordemproducao po on po.agg_of_id_id =pt.id
                left join producao_currentsettings pc on pc.agg_of_id = po.agg_of_id_id
	            left join producao_artigo pa on pa.id=pt2.item_id
	            left join group_artigos ga on ga.artigo_id = pt2.item_id
	            #left join producao_formulacao pf on pf.id=pt.formulacao_id
	            where
	            (pt.status=0 or po.status in (1,2,3))  and not exists(select 1 from producao_ordemfabricodetails pa where pa.cod=pt2.of_id)
	            {f'and ({f.text} {f2.text})' if f.hasFilters or f2.hasFilters else ''}
             ) t
             where t.ofabrico_status<9
            order by cod ASC, of_id ASC
        """
    ), connection, {**f.parameters,**f2.parameters})
    print(f"""
            select distinct * from (
	            select pt.id, pt.cod, case when po.status is null then 1 else po.status end ofabrico_status,pt2.of_id, IFNULL(po.was_in_production,0) was_in_production,pc.id cs_id,pt2.cliente_nome, pt2.item_cod artigo_cod
	            from producao_tempaggordemfabrico pt
	            join producao_tempordemfabrico pt2 on pt2.agg_of_id = pt.id
	            left join planeamento_ordemproducao po on po.agg_of_id_id =pt.id
                left join producao_currentsettings pc on pc.agg_of_id = po.agg_of_id_id
	            left join producao_artigo pa on pa.id=pt2.item_id
	            left join group_artigos ga on ga.artigo_id = pt2.item_id
	            #left join producao_formulacao pf on pf.id=pt.formulacao_id
	            where
	            (pt.status=0 or po.status in (1,2,3))  and not exists(select 1 from producao_ordemfabricodetails pa where pa.cod=pt2.of_id)
	            {f'and ({f.text} {f2.text})' if f.hasFilters or f2.hasFilters else ''}
             ) t
             where t.ofabrico_status<9
            order by cod ASC, of_id ASC
        """)
    print({**f.parameters,**f2.parameters})
    return Response(response)

def OrdensFabricoPlanGet(request, format=None):
    filter = request.data.get("filter")
    allowInElaboration = request.data.get("parameters").get("allowInElaboration") if "allowInElaboration" in request.data.get("parameters") else None
    connection = connections["default"].cursor()
    f = Filters(filter)
    f.where(False,"and")
    f.add(f'(po.was_in_production = :was_in_production)',lambda v:(v!=None) )
    f.add(f'(po.id = :id)',lambda v:(v!=None) )
    f.add(f'(po.stock = :stock)',lambda v:(v!=None) )
    f.add(f'(pt.id = :draft_id)',lambda v:(v!=None) )
    f.add(f'(po.ativa = :ativa)',lambda v:(v!=None) )
    f.value("and")
    response = db.executeSimpleList(lambda: (
        f"""
            select esquema,po.id,pt.of_id ofid,po.op,pt.cliente_nome ,pt.prf_cod ,pt.order_cod ,pt.item_cod ,pt.id draft_id , t1.artigo_des, po.bobines_por_palete, po.was_in_production, 
            CASE WHEN po.`status` IS NULL AND pt.id is not null and pt2.`status`=0 THEN 1 ELSE
                CASE WHEN pc.`status`= 1 THEN 2 ELSE
                    CASE WHEN pc.`status`= 2 THEN 2 ELSE
                        3
                        END
                    END
            END
            ofabrico_status,
            po.ativa
            from producao_tempordemfabrico pt
            left join producao_tempaggordemfabrico pt2 on pt2.id=pt.agg_of_id
            left join planeamento_ordemproducao po on pt.id=po.draft_ordem_id
            left join producao_currentsettings pc on pc.agg_of_id = po.agg_of_id_id
            left join JSON_TABLE (pc.paletizacao,"$[*]"COLUMNS ( of_id INT PATH "$.of_id", esquema JSON PATH "$") ) t on t.of_id=po.id
            left join JSON_TABLE (pc.ofs,"$[*]"COLUMNS ( of_id INT PATH "$.of_id", artigo_des VARCHAR(200) PATH "$.artigo_des") ) t1 on t1.of_id=po.id
            where ({"(pt.id is not null and pt2.`status`=0 ) or " if allowInElaboration else "1=1 and"} (pc.status in (1,2,3))) {f.text} order by po.ofid is null,pt.of_id,po.ofid
        """
    ), connection, {**f.parameters})
    return Response(response)    


def OrdensFabricoGet(request, format=None):
    filter = request.data.get("filter")
    connection = connections["default"].cursor()
    f = Filters(filter)
    f.where()
    f.add(f'(po.was_in_production = :was_in_production)',lambda v:(v!=None) )
    f.add(f'(po.id = :id)',lambda v:(v!=None) )
    f.add(f'(po.stock = :stock)',lambda v:(v!=None) )
    f.add(f'(po.draft_ordem_id = :draft_id)',lambda v:(v!=None) )
    f.add(f'(po.ativa = :ativa)',lambda v:(v!=None) )
    f.value("and")
    response = db.executeSimpleList(lambda: (
        f"""
            select esquema,po.id,po.ofid,po.op,pt.cliente_nome ,pt.prf_cod ,pt.order_cod ,pt.item_cod ,pt.id draft_id , t1.artigo_des, po.bobines_por_palete, po.was_in_production, po.`status` ofabrico_status,po.ativa
            from planeamento_ordemproducao po 
            left join producao_currentsettings pc on pc.agg_of_id = po.agg_of_id_id
            left join JSON_TABLE (pc.paletizacao,"$[*]"COLUMNS ( of_id INT PATH "$.of_id", esquema JSON PATH "$") ) t on t.of_id=po.id
            left join JSON_TABLE (pc.ofs,"$[*]"COLUMNS ( of_id INT PATH "$.of_id", artigo_des VARCHAR(200) PATH "$.artigo_des") ) t1 on t1.of_id=po.id
            left join producao_tempordemfabrico pt on pt.id=po.draft_ordem_id 
            {f.text} order by po.ofid is null,po.ofid
        """
    ), connection, {**f.parameters})
    return Response(response)

def OrdensFabricoOpen(request, format=None):
    filter = request.data.get("filter")
    connection = connections["default"].cursor()
    f = Filters(filter)
    f.where(False,"and")
    f.add(f'(po.was_in_production = :was_in_production)',lambda v:(v!=None) )
    f.add(f'(po.id = :id)',lambda v:(v!=None) )
    f.value("and")
    response = db.executeSimpleList(lambda: (
        f"""
            select esquema,po.id,po.ofid,po.op,pt.cliente_nome ,pt.prf_cod ,pt.order_cod ,pt.item_cod ,pt.id draft_id,  t1.artigo_des, po.bobines_por_palete, po.was_in_production, po.`status` ofabrico_status
            from planeamento_ordemproducao po 
            left join producao_currentsettings pc on pc.agg_of_id = po.agg_of_id_id
            left join JSON_TABLE (pc.paletizacao,"$[*]"COLUMNS ( of_id INT PATH "$.of_id", esquema JSON PATH "$") ) t on t.of_id=po.id
            left join JSON_TABLE (pc.ofs,"$[*]"COLUMNS ( of_id INT PATH "$.of_id", artigo_des VARCHAR(200) PATH "$.artigo_des") ) t1 on t1.of_id=po.id
            left join producao_tempordemfabrico pt on pt.id=po.draft_ordem_id 
            where po.ativa = 1 and po.stock=0 {f.text} order by po.ofid is null,po.ofid
        """
    ), connection, {**f.parameters})

    return Response(response)

def OrdensFabricoInProduction(request, format=None):
    filter = request.data.get("filter")
    connection = connections["default"].cursor()
    f = Filters(filter)
    f.where()
    f.add(f'(po.status in (1,2,3))',True )
    f.add(f'(po.id = :id)',lambda v:(v!=None) )
    f.value("and")
    response = db.executeSimpleList(lambda: (
        f"""
            select pc.id cs_id, pta.cod agg_cod, pta.id agg_id, po.id,po.ofid,po.op,pt.cliente_nome ,pt.prf_cod ,pt.order_cod ,pt.item_cod , t1.artigo_des, po.was_in_production, po.`status` ofabrico_status,
            case when pc.cortes is not null then pc.cortes->'$.id' else pta.cortes_id end cortes_id,
            case when pc.cortesordem is not null then pc.cortesordem->'$.id' else pta.cortesordem_id end cortesordem_id
            from planeamento_ordemproducao po 
            join producao_currentsettings pc on pc.agg_of_id = po.agg_of_id_id
            left join JSON_TABLE (pc.ofs,"$[*]"COLUMNS ( of_id INT PATH "$.of_id", artigo_des VARCHAR(200) PATH "$.artigo_des") ) t1 on t1.of_id=po.id
            left join producao_tempordemfabrico pt on pt.id=po.draft_ordem_id 
            left join producao_tempaggordemfabrico pta on pta.id=pt.agg_of_id 
            {f.text} order by pta.cod,po.ofid
        """
    ), connection, {**f.parameters})
    return Response(response)

def GetPaleteCompatibleOrdensFabricoOpen(request,format=None):
    cursor = connections["default"].cursor()
    filter = request.data.get("filter")
    f = Filters({"palete_id": filter['palete_id']})
    f.setParameters({}, False)
    f.where()
    f.add(f'pp.id = :palete_id', True)
    f.value("and")
    response = db.executeSimpleList(lambda: (
        f"""
            with palete as(
            select po.agg_of_id_id,pp.ordem_id id,pp.ordem_id_original,pp.largura_bobines,pp.num_bobines,pp.core_bobines,pa.cod artigo_cod
            from producao_palete pp 
            join planeamento_ordemproducao po on po.id=pp.ordem_id_original
            join producao_artigo pa on po.artigo_id=pa.id
            {f.text}
            )
            select t.* from (
            select pa.cod artigo_cod, po.id,po.ofid,po.agg_of_id_id,po.op,pt.cliente_nome ,pt.prf_cod ,pt.order_cod ,pt.item_cod , ofc.artigo_lar, ofc.artigo_core,x.item_numbobines
            from planeamento_ordemproducao po
            join producao_artigo pa on po.artigo_id=pa.id
            left join producao_currentsettings pc on pc.agg_of_id = po.agg_of_id_id
            left join producao_tempordemfabrico pt on pt.id=po.draft_ordem_id 
            join JSON_TABLE(pc.ofs,'$[*]' COLUMNS(of_id int path '$.of_id',artigo_cod varchar(30) path '$.artigo_cod',artigo_lar int path '$.artigo_lar',artigo_core int path '$.artigo_core')) ofc on ofc.of_id=po.id
            join JSON_TABLE(pc.paletizacao,'$[*]' COLUMNS(of_id int path '$.of_id',items text path '$.paletizacao')) p on po.id=p.of_id,
            JSON_TABLE(items->>'$.details','$[*]' COLUMNS(item_id int path '$.item_id',item_numbobines int path '$.item_numbobines')) x
            where x.item_id=2 and x.item_numbobines>0 and po.ativa = 1 #and po.completa = 0
            ) t
            join palete pp on pp.id<>t.id and pp.agg_of_id_id = t.agg_of_id_id and pp.artigo_cod=t.artigo_cod /*pp.largura_bobines = t.artigo_lar and pp.core_bobines  = t.artigo_core*/ and pp.num_bobines = t.item_numbobines
        """
    ), cursor, f.parameters)
    return Response(response)

def ClienteExists(request, format=None):
    cursor = connections["default"].cursor()
    filter = request.data.get("filter")
    f = Filters({"cod": filter['cliente_cod']})
    f.setParameters({}, False)
    f.where()
    f.add(f'cod = :cod', True)
    f.value("and")
    exists = db.exists("producao_cliente", f, cursor).exists
    return Response({"exists":exists})

def TempOrdemFabricoGet(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'tof.id = :temp_ofabrico',lambda v:(v!=None))
    f.add(f'tof.agg_of_id = :agg_of_id',lambda v:(v!=None))
    f.value()

    f2 = filterMulti(request.data['filter'], {}, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""tof.*,tagg.*, tof.id id, tagg.id aggid,
                pa.cod artigo_cod,
                pa.id artigo_id,pa.des artigo_des, pa.nw1 artigo_nw1, pa.nw2 artigo_nw2,pa.lar artigo_width,
                pa.formu artigo_formula,pa.diam_ref artigo_diam, pa.core artigo_core,
                pa.gsm artigo_gram, pa.gtin artigo_gtin, pa.thickness artigo_thickness,
                CASE WHEN pac.produto is not null and pac.produto<>'' THEN pac.produto ELSE prod.produto_cod END produto_cod,
                CASE WHEN pac.produto is not null and pac.produto<>'' THEN pac.produto ELSE prod.produto_cod END produto_alt,
                pc.id cliente_id,
                (select JSON_ARRAYAGG(JSON_OBJECT('id',pd.id,'item_id',pd.item_id,'item_des',pd.item_des,'item_order',pd.item_order,'item_numbobines',item_numbobines,
                'item_paletesize',item_paletesize,'paletizacao_id',paletizacao_id)) x from producao_paletizacaodetails pd where tof.paletizacao_id=pd.paletizacao_id) paletizacao,
                ppz.filmeestiravel_bobines, ppz.filmeestiravel_exterior,ppz.cintas, ppz.ncintas
            """
    dql.columns=encloseColumn(cols,False)
    sql = lambda: (
        f"""  
            select {f'{dql.columns}'}
            from producao_tempordemfabrico tof
            join producao_tempaggordemfabrico tagg on tof.agg_of_id = tagg.id
            join producao_artigo pa on pa.cod=tof.item_cod
            JOIN producao_produtos prod on pa.produto_id=prod.id
            left join producao_paletizacao ppz on ppz.id=tof.paletizacao_id
            left join producao_cliente pc on pc.cod=tof.cliente_cod
            left join producao_artigocliente pac on pac.artigo_id=pa.id and pac.cliente_id=pc.id
            {f.text} {f2["text"]}
            {dql.sort} {dql.limit}
        """
    )
    print(sql)
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    try:
        response = db.executeSimpleList(sql, connection, parameters)
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def GetCortes(request, format=None):
    #A ordem que são executados os if's é muito importante!!!!
    cursor = connections["default"].cursor()
    filter = request.data['filter']
    try:
        response = _getCortes(filter)
        if response==None:
            return Response({"status": "success", "data":None})
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def _getCortes(filter):
    cursor = connections["default"].cursor()
    f = Filters(filter)
    f.setParameters({}, False)
    f.where()
    if ("audit_cs_id" in filter):
        f.add(f'id = :audit_cs_id',True)
    elif ("cs_id" in filter):
        f.add(f'id = :cs_id',True)
    elif ("agg_of_id" in filter):
        f.add(f'pn.id = :agg_of_id',True)
    elif ("cortesordem_id" in filter):
        f.add(f'pco.id = :cortesordem_id',True)
    f.value()
    if ("audit_cs_id" in filter):
        sql = lambda: (f"""select cortes,cortesordem from audit_currentsettings {f.text}""")
    elif ("cs_id" in filter):
        sql = lambda: (f"""select cortes,cortesordem from producao_currentsettings {f.text}""")
    elif ("agg_of_id" in filter):
        sql = lambda: (f"""
            select JSON_OBJECT('id',pc.id,'created_date',pc.created_date,'updated_date',pc.updated_date,
           'largura_cod',pc.largura_cod,'largura_json',pc.largura_json,'largura_util',pc.largura_util) cortes,
           JSON_OBJECT('id',pco.id,'created_date',pco.created_date,'updated_date',pco.updated_date,
           'designacao',pco.designacao,'versao',pco.versao,'largura_ordem',pco.largura_ordem,'cortes_id',pco.cortes_id,'ordem_cod',pco.ordem_cod) cortesordem
            from producao_tempaggordemfabrico pn 
            join producao_cortes pc on pc.id=pn.cortes_id 
            join producao_cortesordem pco on pco.id=pn.cortesordem_id 
            {f.text}
        """)
    elif ("cortesordem_id" in filter):
        sql = lambda: (f"""
            select JSON_OBJECT('id',pc.id,'created_date',pc.created_date,'updated_date',pc.updated_date,
           'largura_cod',pc.largura_cod,'largura_json',pc.largura_json,'largura_util',pc.largura_util) cortes,
           JSON_OBJECT('id',pco.id,'created_date',pco.created_date,'updated_date',pco.updated_date,
           'designacao',pco.designacao,'versao',pco.versao,'largura_ordem',pco.largura_ordem,'cortes_id',pco.cortes_id,'ordem_cod',pco.ordem_cod) cortesordem
            from producao_cortes pc
            join producao_cortesordem pco on pco.cortes_id=pc.id 
            {f.text}
        """)
    else:    
        return None
    return db.executeSimpleList(sql, cursor, f.parameters)


def GetNonwovens(request, format=None):
    #A ordem que são executados os if's é muito importante!!!!
    cursor = connections["default"].cursor()
    filter = request.data['filter']
    try:
        response = _getNonwovens(filter)
        if response==None:
            return Response({"status": "success", "data":None})
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def _getNonwovens(filter):
    cursor = connections["default"].cursor()
    f = Filters(filter)
    f.setParameters({}, False)
    f.where()
    if ("audit_cs_id" in filter):
        f.add(f'id = :audit_cs_id',True)
    elif ("cs_id" in filter):
        f.add(f'id = :cs_id',True)
    elif ("nonwovens_id" in filter):
        f.add(f'pn.id = :nonwovens_id',True)
    f.value()
    if ("audit_cs_id" in filter):
        sql = lambda: (f"""select nonwovens from audit_currentsettings {f.text}""")
    elif ("cs_id" in filter):
        sql = lambda: (f"""select nonwovens from producao_currentsettings {f.text}""")
    elif ("nonwovens_id" in filter):
        sql = lambda: (f"""
            select JSON_OBJECT('id',id,'designacao',designacao,'versao',versao,'created_date',created_date,'updated_date',updated_date,
            'nw_cod_sup',nw_cod_sup,'nw_des_sup',nw_des_sup,'nw_cod_inf',nw_cod_inf,'nw_des_inf',nw_des_inf,'produto_id',produto_id) 
            from producao_artigononwovens pn {f.text}
        """)
    else:    
        return None
    return db.executeSimpleList(sql, cursor, f.parameters)


def SaveNonwovens(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    data.pop("method", None)
    data = {
        **data,
        "designacao": f"""{datetime.now().strftime("%Y%m%d")}""" if data.get("designacao") is None else data.get("designacao"),
        "produto_id": data.get("produto_id").get("id") if type(data.get("produto_id")) is dict else data.get("produto_id"),
    }

    def _updateNonwovens(nonwovens_id,data,versao,cursor):
        dml = db.dml(TypeDml.UPDATE, {
            'designacao': data.get("designacao"),
            'versao': f'versao={versao}',
            
            'nw_cod_inf': data.get('nw_cod_inf'),
            'nw_des_inf': data.get('nw_des_inf'),
            'nw_cod_sup': data.get('nw_cod_sup'),
            'nw_des_sup': data.get('nw_des_sup'),
            'produto_id': data.get('produto_id'),
            
            "created_date": datetime.now(),
            "updated_date": datetime.now()
        }, "producao_artigononwovens",{"id":Filters.getNumeric(nonwovens_id)},None,None,['versao'])
        db.execute(dml.statement, cursor, dml.parameters)

    def _insertNonwovens(data,versao,cursor):
        dml = db.dml(TypeDml.INSERT, {
            'versao': f'{versao}',
            'designacao': data.get("designacao"),
            'nw_cod_inf': data.get('nw_cod_inf'),
            'nw_des_inf': data.get('nw_des_inf'),
            'nw_cod_sup': data.get('nw_cod_sup'),
            'nw_des_sup': data.get('nw_des_sup'),
            'produto_id': data.get('produto_id'),
            "created_date": datetime.now(),
            "updated_date": datetime.now()
        }, "producao_artigononwovens",None,None,False,['versao'])
        db.execute(dml.statement, cursor, dml.parameters)
        return cursor.lastrowid

    try:
        with connections["default"].cursor() as cursor:
            #A ordem com que são executados os if's são muito importantes!!!!!!
            if "nw_plan" in data:
                nw_plan = data.get("nw_plan")
                if filter.get("cs_id") is not None:
                    if nw_plan is None:
                        print("TODO")
                        # dml = db.dml(TypeDml.UPDATE, {'nw_plan_id': None,"type_op":"nw_plan_none"}, "producao_currentsettings",{"id":Filters.getNumeric(filter.get("cs_id"))},None,None)
                        # db.execute(dml.statement, cursor, dml.parameters)
                        # return Response({"status": "success", "title": "Nonwovens planeada desassociados com Sucesso!"})
                    elif "id" in nw_plan:
                        print("TODO")
                        # #Update only if the id of nonwovens is on nw_plan
                        # _nw = _getFormulacao({"nonwovens_id":nw_plan.get("id")})
                        # if _nw.get("rows") and  len(_nw.get("rows"))>0:
                        #     _nw = {**json.loads(_nw.get("rows")[0].get("formulacao")),"plan_id":formulacao_plan.get("plan_id")}
                        #     return updateCurrentSettings(filter.get("cs_id"),"formulacao_formulation_change",_formulacao,request.user.id,cursor)
                        # else:
                        #     return Response({"status": "error", "title": "Não foi encontrada a formulação associada ao plano selecionado!"})
                else:
                    print("TODO")
                    # if formulacao_plan is None:
                    #     dml = db.dml(TypeDml.UPDATE, {'formulacao_plan_id': None}, "producao_tempaggordemfabrico",{"id":Filters.getNumeric(filter.get("agg_of_id"))},None,None)
                    #     db.execute(dml.statement, cursor, dml.parameters)
                    #     return Response({"status": "success", "title": "Formulação planeada desassociada com Sucesso!"})
                    # elif "id" in formulacao_plan:
                    #     #Update only if the id of formulacao is on formulacao_plan
                    #     dml = db.dml(TypeDml.UPDATE, {'formulacao_plan_id': formulacao_plan.get("plan_id"), "formulacao_id":formulacao_plan.get("id")}, "producao_tempaggordemfabrico",{"id":Filters.getNumeric(filter.get("agg_of_id"))},None,None)
                    #     db.execute(dml.statement, cursor, dml.parameters)
                    #     return Response({"status": "success", "title": "Formulação atribuída com Sucesso!"})
            elif filter.get("new") is not None:
                _id = _insertNonwovens(data,1,cursor)
                return Response({"status": "success", "id":_id, "title": "Nonwovens registados com Sucesso!", "subTitle":f'Nonwovens {data.get("designacao")} [v1]'})
            elif filter.get("cs_id") is not None:
                print("current settings")
                print(filter)
                print(data)
                return updateCurrentSettings(filter.get("cs_id"),data.get("type"),data,request.user.id,cursor)
            elif filter.get("nonwovens_id") is not None:
                print("formulacao....")
                exists = checkNonwovens(data,filter.get("nonwovens_id"),cursor)
                inuse = checkNonwovensIsInUse(filter.get("nonwovens_id"),filter.get("agg_of_id"),cursor)
                versao = getNonwovensVersao(data,filter.get("nonwovens_id"),cursor)
                if (exists==1 and inuse==1) or exists==0:
                    _id = _insertNonwovens(data,versao,cursor)
                    return Response({"status": "success", "id":_id, "title": "Nonwovens registados com Sucesso!", "subTitle":f'Nonwovens {data.get("designacao")} [v{versao}]'})
                else:
                    _updateNonwovens(filter.get("nonwovens_id"),data,versao,cursor)
                    return Response({"status": "success", "title": "Nonwovens alterados com Sucesso!", "subTitle":f'Nonwovens {data.get("designacao")} [v{versao}]'})
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})




def GetFormulacao(request, format=None):
    #A ordem que são executados os if's é muito importante!!!!
    cursor = connections["default"].cursor()
    filter = request.data['filter']
    try:
        response = _getFormulacao(filter)
        if response==None:
            return Response({"status": "success", "data":None})
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def _getFormulacao(filter):
    cursor = connections["default"].cursor()
    f = Filters(filter)
    f.setParameters({}, False)
    f.where()
    if ("audit_cs_id" in filter):
        f.add(f'id = :audit_cs_id',True)
    elif ("cs_id" in filter):
        f.add(f'id = :cs_id',True)
    elif ("formulacao_id" in filter):
        f.add(f'pfo.id = :formulacao_id',True)
    f.value()
    if ("audit_cs_id" in filter):
        sql = lambda: (f"""select formulacaov2 formulacao from audit_currentsettings {f.text}""")
    elif ("cs_id" in filter):
        sql = lambda: (f"""select formulacaov2 formulacao from producao_currentsettings {f.text}""")
    elif ("formulacao_id" in filter):
        sql = lambda: (f"""
            SELECT            
            JSON_OBJECT('cliente_cod', pfo.cliente_cod,'cliente_nome', pfo.cliente_nome,'created_date', pfo.created_date,'designacao', pfo.designacao,'extr0', 
            pfo.extr0,'extr0_val', pfo.extr0_val,'extr1', pfo.extr1,'extr1_val', pfo.extr1_val,'extr2', pfo.extr2,'extr2_val', 
            pfo.extr2_val,'extr3', pfo.extr3,'extr3_val', pfo.extr3_val,'extr4', pfo.extr4,'extr4_val', pfo.extr4_val,'id', 
            pfo.id,'produto_id', pfo.produto_id,'updated_date', pfo.updated_date,'versao', pfo.versao,'group_name',pfo.group_name,'subgroup_name',pfo.subgroup_name,
            'reference',pfo.reference,'artigo_id',pfo.artigo_id,'model',2,'joinbc',pfo.joinbc,
            'items',(
            SELECT JSON_ARRAYAGG(t) FROM (
            select 
            JSON_OBJECT('arranque', pfomp.arranque,'densidade', pfomp.densidade,'extrusora', 
            pfomp.extrusora,'formulacao_id', pfomp.formulacao_id,'id', pfomp.id,'mangueira', pfomp.mangueira,'matprima_cod', 
            pfomp.matprima_cod,'matprima_des', pfomp.matprima_des,'tolerancia', pfomp.tolerancia,'vglobal', pfomp.vglobal
            ) t
            FROM producao_formulacaomateriasprimas pfomp where pfomp.formulacao_id = pfo.id AND pfomp.extrusora<>'BC'
            UNION
            select 
            JSON_OBJECT('arranque', pfomp.arranque,'densidade', pfomp.densidade,'extrusora', 
            'B','formulacao_id', pfomp.formulacao_id,'id', pfomp.id,'mangueira', pfomp.mangueira,'matprima_cod', 
            pfomp.matprima_cod,'matprima_des', pfomp.matprima_des,'tolerancia', pfomp.tolerancia,'vglobal', pfomp.vglobal
            ) t
            FROM producao_formulacaomateriasprimas pfomp where pfomp.formulacao_id = pfo.id AND pfomp.extrusora='BC'
            UNION
            select 
            JSON_OBJECT('arranque', pfomp.arranque,'densidade', pfomp.densidade,'extrusora', 
            'C','formulacao_id', pfomp.formulacao_id,'id', pfomp.id,'mangueira', pfomp.mangueira,'matprima_cod', 
            pfomp.matprima_cod,'matprima_des', pfomp.matprima_des,'tolerancia', pfomp.tolerancia,'vglobal', pfomp.vglobal
            ) t
            FROM producao_formulacaomateriasprimas pfomp where pfomp.formulacao_id = pfo.id AND pfomp.extrusora='BC'
                ) t
            )) formulacao
            from producao_formulacao pfo {f.text}
        """)
    else:    
        return None
        #sql = lambda: (f"""select formulacao from (
        #    select id,MAX(id) over (partition by ac.agg_of_id) maxid,formulacaov2 formulacao from audit_currentsettings ac where contextid = (select id from producao_currentsettings cs where status=3)
        #) t where id=maxid""")    
    return db.executeSimpleList(sql, cursor, f.parameters)

def ArtigosSpecsAvailableList(request, format=None):
    connection = connections["default"].cursor()    
    f = Filters({**request.data['filter']})
    f.setParameters({
        "valid": {"value": lambda v: Filters.getNumeric(1), "field": lambda k, v: f'pf.{k}'},
        "status": {"value": lambda v: Filters.getNumeric(1), "field": lambda k, v: f'pf.{k}'},
        "artigo_id": {"value": lambda v: Filters.getNumeric(v.get('fartigo_id')), "field": lambda k, v: f'pf.{k}'},
        "cliente_cod": {"value": lambda v: Filters.getNumeric(v.get('fcliente_cod')), "field": lambda k, v: f'pf.{k}'},
        "designacao": {"value": lambda v: Filters.getUpper(v.get('fdesignacao')), "field": lambda k, v: f'pf.{k}'},
        "cliente_nome": {"value": lambda v: Filters.getUpper(v.get('fcliente_nome')), "field": lambda k, v: f'upper(pf.{k})'},
        "metodo_designacao": {"value": lambda v: Filters.getUpper(v.get('fmetodo_designacao')), "field": lambda k, v: f'upper(pf.{k})'},
        "reference": {"value": lambda v: Filters.getNumeric(v.get('freference')), "field": lambda k, v: f'pf.{k}'},
        **rangeP(f.filterData.get('fdata_created'), 'pf.created_date', lambda k, v: f'{k}'),
        **rangeP(f.filterData.get('fdata_updated'), 'pf.updated_date', lambda k, v: f'{k}')
    }, True)
    f.where()
    f.auto()
    f.value("and")
    print(request.data['filter'])
    print(f.text)

    f2 = filterMulti(request.data['filter'], {
        # 'fmulti_artigo': {"keys": ['"ITMREF_0"', '"ITMDES1_0"'], "table": 'ITM.'}
    }, False, "and" if f.hasFilters else "and" ,False)

    parameters = {**f.parameters, **f2['parameters']}
    dql = db.dql(request.data, False,False)
    cols = f'''pf.*,pa.cod,pa.des'''
    sql = lambda p, c, s: (
        f"""
            SELECT {c(f'{cols}')} 
            FROM producao_lab_artigospecs pf
            JOIN producao_cliente pc ON pc.cod=pf.cliente_cod
            JOIN producao_artigo pa ON pa.id=pf.artigo_id
            {f.text} {f2["text"]}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}  
        """
    )

    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    response = db.executeList(sql, connection, parameters, [])
    return Response(response)  

def ArtigosSpecsPlanList(request, format=None):
    connection = connections["default"].cursor()
    filter = request.data['filter']
    f = Filters(filter)
    f.setParameters({}, False)
    f.where()
    f.add(f'pap.draft_ordem_id = :of_id',True)
    f.value()

    dql = db.dql(request.data, False)
    sql = lambda: (f"""
            select 
            pap.id,pap.idx,pap.observacoes,pap.lab_artigospecs_id,
            pas.designacao,pas.reference,pas.lab_metodo_id,pas.cliente_nome,pas.cliente_cod,pas.artigo_id,pas.metodo_designacao,pas.aging,pas.owner
            from producao_artigospecs_plan pap
            join producao_lab_artigospecs pas on pas.id = pap.lab_artigospecs_id    
            {f.text}
        order by pap.idx
    """)
    try:
        response = db.executeSimpleList(sql, connection, f.parameters)
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def SaveArtigosSpecsPlan(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    
    def checkOrdemFabrico(of_id,cursor):
        f = Filters({"of_id": of_id})
        f.where()
        f.add(f'agg_of_id = (select agg_of_id from producao_tempordemfabrico pt where id = :of_id)', True )
        f.add(f'`status` = 9', True )
        f.value("and")
        exists = db.exists("producao_currentsettings", f, cursor).exists
        return exists

    def _deleteSpecsPlan(of_id,cursor):
        dml = db.dml(TypeDml.DELETE, None,'producao_artigospecs_plan',{"draft_ordem_id":Filters.getNumeric(of_id)},None,False)
        db.execute(dml.statement, cursor, dml.parameters)
    
    def _getCurrentSettings(temp_ofabrico,cursor):
        f = Filters({"id":temp_ofabrico})
        f.where()
        f.add(f'id = :id',True )
        f.value("and")
        rows = db.executeSimpleList(lambda: (f'SELECT id FROM producao_currentsettings pc where agg_of_id = (select agg_of_id from producao_tempordemfabrico {f.text})'), cursor, f.parameters).get("rows")
        if rows is not None and len(rows)>0:
            return rows[0]["id"]
        return None
    
    try:
        with connections["default"].cursor() as cursor:
            isClosed = checkOrdemFabrico(filter.get("of_id"),cursor)
            if (not isClosed):
                if len(data.get("rows"))==0:
                    return Response({"status": "error", "title": "Tem de ter pelo menos uma especificação selecionada!"})
                else:
                    _deleteSpecsPlan(filter.get("of_id"),cursor)
                    for idx, v in enumerate(data.get("rows")):
                            dml = db.dml(TypeDml.INSERT, {"lab_artigospecs_id":v.get("lab_artigospecs_id"),"draft_ordem_id":filter.get("of_id"),"observacoes":v.get("observacoes"),"idx":v.get("idx"),"t_stamp":datetime.today(), "user_id":request.user.id}, "producao_artigospecs_plan",None,None,False)
                            db.execute(dml.statement, cursor, dml.parameters)
                    cs_id = _getCurrentSettings(filter.get("of_id"),cursor)
                    if cs_id is not None:
                        return updateCurrentSettings(cs_id,"artigospecs_plan",None,request.user.id,cursor)
                return Response({"status": "success", "title": "As especificações foram registadas com sucesso!"})
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})

def GetAttachements(request, format=None):
    connection = connections["default"].cursor()
    filter = request.data['filter']
    f = Filters(filter)
    f.setParameters({}, False)
    f.where()
    f.add(f'pa.of_id = :draft_id',lambda v:(v!=None))
    f.add(f'pt2.agg_of_id = :aggid',lambda v:(v!=None))
    f.value()
    f2 = Filters(filter)
    f2.setParameters({}, False)
    f2.where()
    f2.add(f'po.draft_ordem_id = :draft_id',lambda v:(v!=None))
    f2.add(f'po.agg_of_id_id = :aggid',lambda v:(v!=None))
    f2.value()
    sql = lambda: (f"""
        select pa.*,pt2.of_id of_cod, po.ativa
        from producao_attachments pa
        join producao_tempordemfabrico pt2 on pt2.id=pa.of_id
        left join planeamento_ordemproducao po on po.draft_ordem_id = pt2.id
        {f.text}
        union
        select null id, 'Resumo de Produção' tipo_doc,res_prod `path`, draft_ordem_id of_cod,po.`timestamp` created_date,ofid of_cod, po.ativa from planeamento_ordemproducao po {f2.text} and (res_prod is not null and res_prod<>'')
        union
        select null id, 'Ordem de Fabrico' tipo_doc,`of` `path`, draft_ordem_id of_cod,po.`timestamp` created_date,ofid of_cod, po.ativa from planeamento_ordemproducao po {f2.text} and (`of` is not null and `of`<>'')
        union
        select null id, 'Ficha Técnica' tipo_doc,ficha_tecnica `path`, draft_ordem_id of_cod,po.`timestamp` created_date,ofid, po.ativa of_cod from planeamento_ordemproducao po {f2.text} and (ficha_tecnica is not null and ficha_tecnica<>'')
        union
        select null id, 'Ficha de Processo' tipo_doc,ficha_processo `path`, draft_ordem_id of_cod,po.`timestamp` created_date,ofid of_cod, po.ativa from planeamento_ordemproducao po {f2.text} and (ficha_processo is not null and ficha_processo<>'')
        union 
        select null id, 'Orientação Qualidade' tipo_doc,ori_qua `path`, draft_ordem_id of_cod,po.`timestamp` created_date,ofid of_cod, po.ativa from planeamento_ordemproducao po {f2.text} and (ori_qua is not null and ori_qua<>'')
        union 
        select null id, 'Packing List' tipo_doc,pack_list `path`, draft_ordem_id of_cod,po.`timestamp` created_date,ofid of_cod, po.ativa from planeamento_ordemproducao po {f2.text} and (pack_list is not null and pack_list<>'')
    """)
    try:
        response = db.executeSimpleList(sql, connection, {**f.parameters,**f2.parameters})
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def CoresPlanList(request, format=None):
    connection = connections["default"].cursor()
    filter = request.data['filter']
    f = Filters(filter)
    f.setParameters({}, False)
    f.where()
    f.add(f'draft_ordem_id = :of_id',True)
    f.value()

    dql = db.dql(request.data, False)
    sql = lambda: (f"""
        select * from producao_cores pcp
        {f.text}
        order by idx
    """)
    try:
        response = db.executeSimpleList(sql, connection, f.parameters)
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def SaveCoresPlan(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    
    def checkOrdemFabrico(of_id,cursor):
        f = Filters({"of_id": of_id})
        f.where()
        f.add(f'agg_of_id = (select agg_of_id from producao_tempordemfabrico pt where id = :of_id)', True )
        f.add(f'`status` = 9', True )
        f.value("and")
        exists = db.exists("producao_currentsettings", f, cursor).exists
        return exists

    def _deleteCoresPlan(of_id,cursor):
        dml = db.dml(TypeDml.DELETE, None,'producao_cores',{"draft_ordem_id":Filters.getNumeric(of_id)},None,False)
        db.execute(dml.statement, cursor, dml.parameters)
    
    def _getCurrentSettings(temp_ofabrico,cursor):
        f = Filters({"id":temp_ofabrico})
        f.where()
        f.add(f'id = :id',True )
        f.value("and")
        rows = db.executeSimpleList(lambda: (f'SELECT id FROM producao_currentsettings pc where agg_of_id = (select agg_of_id from producao_tempordemfabrico {f.text})'), cursor, f.parameters).get("rows")
        if rows is not None and len(rows)>0:
            return rows[0]["id"]
        return None
    
    try:
        with connections["default"].cursor() as cursor:
            isClosed = checkOrdemFabrico(filter.get("of_id"),cursor)
            if (not isClosed):
                if len(data.get("rows"))==0:
                     return Response({"status": "error", "title": "Tem de ter pelo menos um core selecionado!"})
                else:
                    _deleteCoresPlan(filter.get("of_id"),cursor)
                    for idx, v in enumerate(data.get("rows")):
                            dml = db.dml(TypeDml.INSERT, {"core_cod":v.get("core_cod"),"core_des":v.get("core_des"),"draft_ordem_id":filter.get("of_id"),"observacoes":v.get("observacoes"),"idx":v.get("idx"),"t_stamp":datetime.today(), "user_id":request.user.id}, "producao_cores",None,None,False)
                            db.execute(dml.statement, cursor, dml.parameters)
                    cs_id = _getCurrentSettings(filter.get("of_id"),cursor)
                    if cs_id is not None:
                        return updateCurrentSettings(cs_id,"cores_plan",None,request.user.id,cursor)
                return Response({"status": "success", "title": "O plano de Cores foi registado com sucesso!"})
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})

def StockCutOptimizer(request, format=None):
    data = request.data.get("parameters")
    try:
        if "child_rolls" not in data or "parent_rolls" not in data:
            raise Exception("Erro nos parametros de entrada!")
        child_rolls =  data["child_rolls"]   #[[324, 120],[88, 150],[33, 75]]
        parent_rolls = data["parent_rolls"] #[[10, 2100]] # 10 doesn't matter, itls not used at the moment
        max_cutters = data["max_cutters"]
        consumed_big_rolls = StockCutter1D(child_rolls, parent_rolls, output_json=False, large_model=True, max_cutters=max_cutters)
        rolls = []
        rolls={}
        for idx, roll in enumerate(consumed_big_rolls):
            hsh = hashlib.md5(json.dumps(roll[1], sort_keys=True).encode()).hexdigest()[ 0 : 16 ]
            if hsh in rolls:
                rolls[hsh]["n"]+=1
            else:
                rolls[hsh]={"cuts":roll[1],"cuts_count":dict(Counter(roll[1]).items()),"n":1,"largura_util":sum(roll[1])}        
        return Response(list(rolls.values()))
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})

def CortesOrdemLookup(request, format=None):
    #conn = connections[connGatewayName].cursor()
    cols = ['co.*,c.largura_json,c.largura_util']
    f = Filters(request.data['filter'])
    if "cortesOrdemId" in request.data['filter']:
        f.setParameters({"id": {"value": lambda v: v.get('cortesOrdemId')}}, True)
    else:
        f.setParameters({"cortes": {"value": lambda v: hashlib.md5(json.dumps(v.get('cortes')).encode('utf-8')).hexdigest()[ 0 : 16 ] if v.get("cortes") else None}}, False)
    f.where()
    if "cortesOrdemId" in request.data['filter']:
        f.add(f'co.id = :id', lambda v:(v!=None))
    else:
        f.add(f'co.cortes_id = :cortes_id', lambda v:(v!=None))
        f.add(f'c.largura_cod = :cortes', lambda v:(v!=None))
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
                join producao_cortes c on c.id=co.cortes_id
                {f.text}
                {dql.sort}
            """
        ), cursor, parameters)
        return Response(response)

def CortesPlanList(request, format=None):
    connection = connections["default"].cursor()
    filter = request.data['filter']
    f = Filters(filter)
    f.setParameters({}, False)
    f.where()
    f.add(f'agg_of_id = :agg_of_id',True)
    f.value()
    print(request.data['filter'])
    dql = db.dql(request.data, False)
    sql = ""
    sql = lambda: (f"""
        select pcp.id plan_id,pcp.idx,pcp.start,pcp.iterations,pcp.observacoes,pc.largura_json cortes,pc.largura_util,pco.id, pco.versao, pco.largura_ordem cortes_ordem,pco.designacao
        from producao_cortes_plan pcp 
        join producao_cortesordem pco on pco.id=pcp.cortesordem_id
        join producao_cortes pc on pc.id=pco.cortes_id
        {f.text}
        order by pcp.idx
    """)
    try:
        response = db.executeSimpleList(sql, connection, f.parameters)
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def GetCortesGeneration(request, format=None):
    cursor = connections["default"].cursor()
    filter = request.data['filter']

    try:
        cursor.execute("CALL list_estadoproducao_summary(%s,%s)", [filter.get("agg_of_id"),None])
        results = fetchall(cursor)
        print(results)
        df = pd.DataFrame(results)
        paletes_stock_df = df[df['current_stock'] == 1].groupby(['id','largura', 'bobines_por_palete'])['current_num_paletes'].sum().reset_index()
        paletes_stock_df.rename(columns={'current_num_paletes': 'paletes_stock'}, inplace=True)
        paletes_stock_df=paletes_stock_df[['largura', 'bobines_por_palete','paletes_stock']]


        rows_df = df.drop_duplicates(subset=['gid','largura', 'bobines_por_palete'])
        rows_df['paletes'] = rows_df.groupby(['largura', 'bobines_por_palete'])['num_paletes'].transform('sum')
        #rows_df.loc[:, 'paletes'] = rows_df['paletes']
        rows_df['bobines_palete'] = rows_df.groupby(['largura', 'bobines_por_palete'])['bobines_por_palete'].transform('sum')
        #rows_df.loc[:, 'bobines_palete'] = rows_df['bobines_palete']
        rows_df = rows_df.drop_duplicates(subset=['largura', 'bobines_por_palete'])
        rows_df = rows_df[['largura','bobines_por_palete', 'bobines_palete', 'paletes']]

        if not paletes_stock_df.empty and not rows_df.empty:
            result_left = paletes_stock_df.merge(rows_df, on=['largura', 'bobines_por_palete'], how='left').fillna(0)
            result_right = rows_df.merge(paletes_stock_df, on=['largura', 'bobines_por_palete'], how='right').fillna(0)
            # Combine the results using a logical OR operation
            result_df = result_left.combine_first(result_right)
            #result_df = pd.merge(paletes_stock_df, rows_df, on=['largura', 'bobines_por_palete'], how='left').fillna({'paletes_stock': 0})
            #result_df = pd.merge(paletes_stock_df, rows_df, on=['largura', 'bobines_por_palete'])
            result_df = rows_df.merge(paletes_stock_df, on=['largura', 'bobines_por_palete'], how='left').fillna(0)
        elif not paletes_stock_df.empty and rows_df.empty:
            result_df = paletes_stock_df
        else:
            rows_df['paletes_stock'] = 0
            result_df = rows_df
        result_df["paletes_para_stock"] = 0
        result_df['bobines_total'] = result_df.apply(lambda row: row['bobines_por_palete'] * row['paletes'], axis=1)
        result_list = result_df.to_dict('records')
        return Response(result_list)
            
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})

def SaveCortesOrdem(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    
    def _insertCortesOrdem(data, cursor):
        id = None
        f = Filters({"ordem_cod": data.get("ordem_cod"),"cortes_id": data.get("cortes_id")})
        f.where()
        f.add(f'ordem_cod = :ordem_cod', True )
        f.add(f'cortes_id = :cortes_id', True )
        f.value("and")
        row = db.executeSimpleList(lambda: (f"""select id from producao_cortesordem {f.text} limit 1"""), cursor, f.parameters)["rows"]
        if row and len(row)>0:
            id = row[0]["id"]

        fields = {
            **data,
            "versao":f"""(SELECT IFNULL(MAX(versao),0)+1 AS mx FROM producao_cortesordem co where co.cortes_id={data.get("cortes_id")})""",
            "created_date": datetime.now(),
            "updated_date": datetime.now()
        }
        if not id:
            dml = db.dml(TypeDml.INSERT,fields,"producao_cortesordem",None,None,False,["versao"])
            db.execute(dml.statement, cursor, dml.parameters)
            return cursor.lastrowid
        return id
    
    def _insertCortes(data, cursor):
        id = None
        
        f = Filters({"largura_cod": data.get("largura_cod")})
        f.where()
        f.add(f'largura_cod = :largura_cod', True )
        f.value("and")
        row = db.executeSimpleList(lambda: (f"""select id from producao_cortes {f.text} limit 1"""), cursor, f.parameters)["rows"]
        if row and len(row)>0:
            id = row[0]["id"]
        fields = {
            **data,
            "created_date": datetime.now(),
            "updated_date": datetime.now()
        }
        if not id:
            dml = db.dml(TypeDml.INSERT,fields,"producao_cortes",None,None,False)
            db.execute(dml.statement, cursor, dml.parameters)
            return cursor.lastrowid
        return id    
    try:
        with connections["default"].cursor() as cursor:
            _cortes = json.dumps(json.loads(data.get("cortes")), ensure_ascii=False)
            _cortesordem = '["' + '","'.join(map(str, json.loads(data.get("cortes_ordem")))) + '"]'
            hash_cortes = hashlib.md5(_cortes.encode('utf-8')).hexdigest()[ 0 : 16 ] if data.get("cortes") else None
            hash_cortesordem = hashlib.md5(_cortesordem.encode('utf-8')).hexdigest()[ 0 : 16 ] if data.get("cortes_ordem") else None
            _cortes_id = _insertCortes({"largura_cod":hash_cortes,"largura_json":_cortes,"largura_util":data.get("largura_util")},cursor)
            _cortesordem_id = _insertCortesOrdem({"designacao":datetime.now().strftime("%Y-%m-%d %H:%M:%S"),"largura_ordem":_cortesordem,"ordem_cod": hash_cortesordem,"cortes_id":_cortes_id},cursor)
            if data.get("cs_id") is not None and _cortes_id and _cortesordem_id:
                t = updateCurrentSettings(data.get("cs_id"),data.get("type"),{
                    "cortes_id":_cortes_id,
                    "cortesordem_id":_cortesordem_id
                },request.user.id,cursor)
                if t.data.get("status") == "error":
                    return t
            return Response({"status": "success", "id":_cortesordem_id, "title": "Os Cortes foram registados com sucesso!"})
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})


def SaveCortesPlan(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    
    def checkOrdemFabrico(agg_of_id,cursor):
        f = Filters({"agg_of_id": agg_of_id})
        f.where()
        f.add(f'agg_of_id = :agg_of_id', True )
        f.add(f'`status` = 9', True )
        f.value("and")
        exists = db.exists("producao_currentsettings", f, cursor).exists
        return exists
    
    def checkCortes(agg_of_id,cursor):
        f = Filters({"agg_of_id": agg_of_id})
        f.where()
        f.add(f'id = :agg_of_id', True )
        f.add(f'cortes_id is not null', True )
        f.add(f'cortesordem_id is not null', True )
        f.value("and")
        exists = db.exists("producao_tempaggordemfabrico", f, cursor).exists
        return exists

    def _deleteCortesPlan(agg_of_id,cursor):
        dml = db.dml(TypeDml.DELETE, None,'producao_cortes_plan',{"agg_of_id":Filters.getNumeric(agg_of_id)},None,False)
        db.execute(dml.statement, cursor, dml.parameters)
    
    def _insertCortesOrdem(data, cursor):
        id = None
        
        f = Filters({"ordem_cod": data.get("ordem_cod"),"cortes_id": data.get("cortes_id")})
        f.where()
        f.add(f'ordem_cod = :ordem_cod', True )
        f.add(f'cortes_id = :cortes_id', True )
        f.value("and")
        row = db.executeSimpleList(lambda: (f"""select id from producao_cortesordem {f.text} limit 1"""), cursor, f.parameters)["rows"]
        if row and len(row)>0:
            id = row[0]["id"]

        fields = {
            **data,
            "versao":f"""(SELECT IFNULL(MAX(versao),0)+1 AS mx FROM producao_cortesordem co where co.cortes_id={data.get("cortes_id")})""",
            "created_date": datetime.now(),
            "updated_date": datetime.now()
        }
        if not id:
            dml = db.dml(TypeDml.INSERT,fields,"producao_cortesordem",None,None,False,["versao"])
            db.execute(dml.statement, cursor, dml.parameters)
            return cursor.lastrowid
        return id
    
    def _insertCortes(data, cursor):
        id = None
        
        f = Filters({"largura_cod": data.get("largura_cod")})
        f.where()
        f.add(f'largura_cod = :largura_cod', True )
        f.value("and")
        row = db.executeSimpleList(lambda: (f"""select id from producao_cortes {f.text} limit 1"""), cursor, f.parameters)["rows"]
        if row and len(row)>0:
            id = row[0]["id"]
        fields = {
            **data,
            "created_date": datetime.now(),
            "updated_date": datetime.now()
        }
        if not id:
            dml = db.dml(TypeDml.INSERT,fields,"producao_cortes",None,None,False)
            db.execute(dml.statement, cursor, dml.parameters)
            return cursor.lastrowid
        return id

    try:
        with connections["default"].cursor() as cursor:
            isClosed = checkOrdemFabrico(filter.get("agg_of_id"),cursor)
            if (not isClosed):
                _deleteCortesPlan(filter.get("agg_of_id"),cursor)
                for idx, v in enumerate(data.get("rows")):
                    _cortes = json.dumps(json.loads(v.get("cortes")), ensure_ascii=False)
                    _cortesordem = '["' + '","'.join(map(str, json.loads(v.get("cortes_ordem")))) + '"]'
                    hash_cortes = hashlib.md5(_cortes.encode('utf-8')).hexdigest()[ 0 : 16 ] if v.get("cortes") else None
                    hash_cortesordem = hashlib.md5(_cortesordem.encode('utf-8')).hexdigest()[ 0 : 16 ] if v.get("cortes_ordem") else None
                    _cortes_id = _insertCortes({"largura_cod":hash_cortes,"largura_json":_cortes,"largura_util":v.get("largura_util")},cursor)
                    _cortesordem_id = _insertCortesOrdem({"designacao":datetime.now().strftime("%Y-%m-%d %H:%M:%S"),"largura_ordem":_cortesordem,"ordem_cod": hash_cortesordem,"cortes_id":_cortes_id},cursor)
                    if ("plan_id" in v):
                        dml = db.dml(TypeDml.INSERT, {"id":v.get("plan_id"),"idx":v.get("idx"),"agg_of_id":filter.get("agg_of_id"),"cortesordem_id":_cortesordem_id,"start":v.get("start"),"iterations":v.get("iterations"),"observacoes":v.get("observacoes"),"t_stamp":datetime.today(), "user_id":request.user.id}, "producao_cortes_plan",None,None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                    else:
                        dml = db.dml(TypeDml.INSERT, {"idx":v.get("idx"),"agg_of_id":filter.get("agg_of_id"),"cortesordem_id":_cortesordem_id,"start":v.get("start"),"iterations":v.get("iterations"),"observacoes":v.get("observacoes"),"t_stamp":datetime.today(), "user_id":request.user.id}, "producao_cortes_plan",None,None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                    if (v.get("idx")==1):
                        _id = cursor.lastrowid
                        hasCortes = checkCortes(filter.get("agg_of_id"),cursor)
                        if not hasCortes and _id:
                            dml = db.dml(TypeDml.UPDATE, {"cortes_id":_cortes_id,"cortesordem_id":_cortesordem_id, "cortes_plan_id":_id}, "producao_tempaggordemfabrico",{"id":Filters.getNumeric(filter.get("agg_of_id"))},None,None)
                            db.execute(dml.statement, cursor, dml.parameters)
            return Response({"status": "success", "title": "O plano de Cortes foi registado com sucesso!"})
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})

def SaveCortes(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")

    def _getCortes(cortesOrdemId,cursor):
        f = Filters({"id":cortesOrdemId})
        f.where()
        f.add(f'pco.id = :id',True )
        f.value("and")
        rows = db.executeSimpleList(lambda: (f"""
            SELECT 
            pco.id,pco.cortes_id,
            JSON_OBJECT('created_date', pc.created_date,'id', pc.id,'largura_cod', pc.largura_cod,'largura_json', pc.largura_json,'updated_date', pc.updated_date
            ) cortes,
            JSON_OBJECT('cortes_id', pco.cortes_id,'created_date', pco.created_date,'designacao', pco.designacao,'id', pco.id,'largura_ordem', pco.largura_ordem,'ordem_cod', 
            pco.ordem_cod,'updated_date', pco.updated_date,'versao', pco.versao
            ) cortesordem
            FROM producao_cortesordem pco join producao_cortes pc on pc.id=pco.cortes_id {f.text}
        """), cursor, f.parameters).get("rows")
        if rows is not None and len(rows)>0:
            return rows[0]
        return None
    
    try:
        with connections["default"].cursor() as cursor:
            #A ordem com que são executados os if's são muito importantes!!!!!!
            _plan_id = data.get("cortes_plan").get("plan_id") if data.get("cortes_plan") is not None and data.get("cortes_plan").get("plan_id") is not None else None
            _cortesordem_id = filter.get("cortesordem_id")
            _cortes = _getCortes(_cortesordem_id,cursor)
            if filter.get("cs_id") is not None:
                if _plan_id is None:
                    dml = db.dml(TypeDml.UPDATE, {'cortes_plan_id': None,"type_op":"cortes_plan_none","cortes":_cortes.get("cortes"),"cortesordem":_cortes.get("cortesordem")}, "producao_currentsettings",{"id":Filters.getNumeric(filter.get("cs_id"))},None,None)
                    db.execute(dml.statement, cursor, dml.parameters)
                    return Response({"status": "success", "title": "Cortes atualizados com Sucesso!"})
                elif _cortesordem_id:
                    dml = db.dml(TypeDml.UPDATE, {'cortes_plan_id': _plan_id,"type_op":"cortes_plan","cortes":_cortes.get("cortes"),"cortesordem":_cortes.get("cortesordem")}, "producao_currentsettings",{"id":Filters.getNumeric(filter.get("cs_id"))},None,None)
                    db.execute(dml.statement, cursor, dml.parameters)
                    return Response({"status": "success", "title": "Cortes atualizados com Sucesso!"})
            elif filter.get("agg_of_id") is not None:
                if _plan_id is None:
                    dml = db.dml(TypeDml.UPDATE, {'cortes_plan_id':None,"cortes_id":_cortes.get("cortes_id"),"cortesordem_id":_cortes.get("id")}, "producao_tempaggordemfabrico",{"id":Filters.getNumeric(filter.get("agg_of_id"))},None,None)
                    db.execute(dml.statement, cursor, dml.parameters)
                    return Response({"status": "success", "title": "Cortes atualizados com Sucesso!"})
                elif _cortesordem_id:
                    dml = db.dml(TypeDml.UPDATE, {'cortes_plan_id': _plan_id,"cortes_id":_cortes.get("cortes_id"),"cortesordem_id":_cortes.get("id")}, "producao_tempaggordemfabrico",{"id":Filters.getNumeric(filter.get("agg_of_id"))},None,None)
                    db.execute(dml.statement, cursor, dml.parameters)
                    return Response({"status": "success", "title": "Cortes atualizados com Sucesso!"})
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})

def NwPlanList(request, format=None):
    connection = connections["default"].cursor()
    filter = request.data['filter']
    f = Filters(filter)
    f.setParameters({}, False)
    f.where()
    f.add(f'agg_of_id = :agg_of_id',True)
    f.value()

    dql = db.dql(request.data, False)
    sql = lambda: (f"""
        select pnp.id plan_id,pnp.idx,pnp.observacoes,pn.* 
        from producao_nw_plan pnp 
        join producao_artigononwovens pn on pn.id=pnp.nw_id
        {f.text}
        order by pnp.idx
    """)
    try:
        response = db.executeSimpleList(sql, connection, f.parameters)
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def SaveNwsPlan(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    
    def checkOrdemFabrico(agg_of_id,cursor):
        f = Filters({"agg_of_id": agg_of_id})
        f.where()
        f.add(f'agg_of_id = :agg_of_id', True )
        f.add(f'`status` = 9', True )
        f.value("and")
        exists = db.exists("producao_currentsettings", f, cursor).exists
        return exists
    
    def checkFormulacao(agg_of_id,cursor):
        f = Filters({"agg_of_id": agg_of_id})
        f.where()
        f.add(f'id = :agg_of_id', True )
        f.add(f'formulacao_id is not null', True )
        f.value("and")
        exists = db.exists("producao_tempaggordemfabrico", f, cursor).exists
        return exists

    def _getExistingNws(agg_of_id,rows,cursor):
        f = Filters({"agg_of_id": agg_of_id})
        f.where()
        f.add(f'pt.agg_of_id = :agg_of_id', True )
        f.value("and")
        rows = db.executeSimpleList(lambda: (f"""
            WITH tmp as(
                select produto_id from producao_tempordemfabrico pt {f.text} limit 1
            )
            SELECT an.*
            FROM producao_artigononwovens an 
            join tmp t on t.produto_id = an.produto_id
            where {" or ".join(f"(an.nw_cod_sup='{item['nw_cod_sup']}' and an.nw_cod_inf='{item['nw_cod_inf']}')" for item in rows)}
        """), cursor, f.parameters).get("rows")
        if rows is not None and len(rows)>0:
            return rows
        return None

    def _deleteNwsPlan(agg_of_id,cursor):
        dml = db.dml(TypeDml.DELETE, None,'producao_nw_plan',{"agg_of_id":Filters.getNumeric(agg_of_id)},None,False)
        db.execute(dml.statement, cursor, dml.parameters)
    
    # def _addNwsPlan(agg_of_id,cursor):
    #     dta = {
    #     'agg_of_id':agg_id,
    #     'formulacao_id': formulacao_id,
    #     'idx': f"(select IFNULL(max(idx),0)+1 from producao_formulacao_plan pfp where agg_of_id={agg_id})",
    #     'user_id':request.user.id,
    #     't_stamp':datetime.now()
    #     }
    #     dml = db.dml(TypeDml.INSERT, dta, "producao_formulacao_plan",None,None,False,["idx"])
    #     db.execute(dml.statement, cursor, dml.parameters)
    #     lastid = cursor.lastrowid
    #     if plan_id==0:
    #         dml = db.dml(TypeDml.UPDATE, {
    #         'formulacao_plan_id': lastid
    #         }, "producao_tempaggordemfabrico",{"id":Filters.getNumeric(agg_id)},None,None,[])
    #         db.execute(dml.statement, cursor, dml.parameters)

    def _addNwsCombination(agg_id,row,cursor):
        dta = {
            "designacao": row.get("designacao"),
            "versao": f"""(
                SELECT IFNULL(max(versao),0)+1 versao
                FROM producao_artigononwovens an
                where (an.nw_cod_sup='{row.get("nw_cod_sup")}' and an.nw_cod_inf='{row.get("nw_cod_inf")}') and 
                produto_id = (select produto_id from producao_tempordemfabrico pt where agg_of_id = {agg_id} and agg_of_id = agg_ofid_original))
            """,
            'produto_id': f"(select produto_id from producao_tempordemfabrico pt where agg_of_id = {agg_id} and agg_of_id = agg_ofid_original)",
            "nw_cod_inf":row.get("nw_cod_inf"),
            "nw_des_inf":row.get("nw_des_inf"),
            "nw_cod_sup":row.get("nw_cod_sup"),
            "nw_des_sup":row.get("nw_des_sup"),
            #'user_id':request.user.id,
            'created_date':datetime.now(),
            'updated_date':datetime.now()
        }
        dml = db.dml(TypeDml.INSERT, dta, "producao_artigononwovens",None,None,False,["versao","produto_id"])
        db.execute(dml.statement, cursor, dml.parameters)
        lastid = cursor.lastrowid
        return lastid
    
    try:
        with connections["default"].cursor() as cursor:
            isClosed = checkOrdemFabrico(filter.get("agg_of_id"),cursor)
            print(isClosed)
            if (not isClosed):
                _deleteNwsPlan(filter.get("agg_of_id"),cursor)
                nws = _getExistingNws(filter.get("agg_of_id"),data.get("rows"),cursor)
                for idx, v in enumerate(data.get("rows")):
                    match = next((item for item in nws if item['nw_cod_inf'] == v['nw_cod_inf'] and item['nw_cod_sup'] == v['nw_cod_sup']), None)
                    nws_id = None
                    if match:
                        nws_id = match.get("id")
                        if v.get("designacao") and match.get("designacao") != v.get("designacao"):
                            nws_id = _addNwsCombination(filter.get("agg_of_id"),v,cursor)
                    else:
                        if not v.get("designacao"):
                            v["designacao"] = f"NW{datetime.now().strftime('%Y%m%d_%H%M')}"
                        nws_id = _addNwsCombination(filter.get("agg_of_id"),v,cursor)
                    if ("plan_id" in v):
                        dml = db.dml(TypeDml.INSERT, {"id":v.get("plan_id"),"nw_id":nws_id,"agg_of_id":filter.get("agg_of_id"),"observacoes":v.get("observacoes"),"idx":v.get("idx"),"t_stamp":datetime.today(), "user_id":request.user.id}, "producao_nw_plan",None,None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                    else:
                        dml = db.dml(TypeDml.INSERT, {"nw_id":nws_id,"agg_of_id":filter.get("agg_of_id"),"observacoes":v.get("observacoes"),"idx":v.get("idx"),"t_stamp":datetime.today(), "user_id":request.user.id}, "producao_nw_plan",None,None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
            #         if (v.get("idx")==1):
            #             _id = cursor.lastrowid
            #             hasFormulacao = checkFormulacao(filter.get("agg_of_id"),cursor)
            #             if not hasFormulacao and _id:
            #                 dml = db.dml(TypeDml.UPDATE, {"formulacao_id":v.get("id"),"formulacao_plan_id":_id}, "producao_tempaggordemfabrico",{"id":Filters.getNumeric(filter.get("agg_of_id"))},None,None)
            #                 db.execute(dml.statement, cursor, dml.parameters)
            return Response({"status": "success", "title": "O plano de Nonwovens foi registado com sucesso!"})
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})

def PaletizacoesList(request, format=None):
    connection = connections["default"].cursor()    
    f = Filters({**request.data['filter']})
    f.setParameters({
        #"group_name": {"value": lambda v: Filters.getUpper(v.get('fgroup')), "field": lambda k, v: f'pf.{k}'},
        #"subgroup_name": {"value": lambda v: Filters.getUpper(v.get('fsubgroup')), "field": lambda k, v: f'pf.{k}'},
        "designacao": {"value": lambda v: Filters.getUpper(v.get('fdesignacao')), "field": lambda k, v: f'pp.{k}'},
        #"produto_cod": {"value": lambda v: Filters.getUpper(v.get('fproduto')), "field": lambda k, v: f'upper(pp.{k})'},
        "cliente_nome": {"value": lambda v: Filters.getUpper(v.get('fcliente')), "field": lambda k, v: f'upper(pp.{k})'},
        "versao": {"value": lambda v: Filters.getNumeric(v.get('fversao')), "field": lambda k, v: f'{k}'},
        #"reference": {"value": lambda v: Filters.getNumeric(v.get('freference')), "field": lambda k, v: f'pf.{k}'},
        #**rangeP(f.filterData.get('fdata_created'), 'pf.created_date', lambda k, v: f'{k}'),
        #**rangeP(f.filterData.get('fdata_updated'), 'pf.updated_date', lambda k, v: f'{k}')
    }, True)
    f.where()
    f.add(f"pp2.item_id in (2)",True)
    f.auto()
    f.value("and")

    def filterMultiSelect(data,name):
        dt = {str(i + 1): elem for i, elem in enumerate(data.split(","))} if data is not None else {}
        f = Filters(dt)
        for k,v in dt.items():
            f.add(f"JSON_CONTAINS({name}, :{k})",True)
        f.where()
        f.value("and")
        return f

    f2 = filterMultiSelect(request.data.get("filter").get('fbobines'),'bobines')

    f3 = Filters({**request.data.get("filter")})
    f3.setParameters({
       "empilhadas": {"value": lambda v: Filters.getNumeric(v.get('fempilhadas')), "field": lambda k, v: f'JSON_LENGTH(bobines)'}
    }, True)
    f3.where(False, "and" if f2.hasFilters else "where")
    f3.auto()
    f3.value("and")

    #f2 = filterMulti(request.data['filter'], {
    #    # 'fmulti_artigo': {"keys": ['"ITMREF_0"', '"ITMDES1_0"'], "table": 'ITM.'}
    #}, False, "and" if f.hasFilters else "and" ,False)

    parameters = {**f.parameters, **f2.parameters, **f3.parameters}
    dql = db.dql(request.data, False,False)
    print("LISTING PALETIZACOES")
    print(request.data)
    cols = f'''t.*'''
    sql = lambda p, c, s: (
        f"""
            select {c(f'{cols}')} from (
                select distinct pp.*,json_arrayagg(item_numbobines) over (partition by pp.id) bobines,
                pa.cod,pa.des
                from producao_paletizacao pp 
                join producao_paletizacaodetails pp2 on pp.id=pp2.paletizacao_id 
                LEFT JOIN producao_artigo pa ON pa.cod=pp.artigo_cod
                {f.text}
            ) t
            {f2.text} {f3.text}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}  
        """
    )
    print(f2.text)
    print(f2.parameters)
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    response = db.executeList(sql, connection, parameters, [])
    return Response(response) 

def SavePaletizacao(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    data.pop("method", None)

    def _getArtigo(artigo_id,artigo_cod):
        if artigo_id:
            cursor = connections["default"].cursor()
            sql = lambda: (f"""select * from producao_artigo where id = {artigo_id}""")
            rows = db.executeSimpleList(sql, cursor, {}).get("rows")
            if rows is not None and len(rows)>0:
                return {"artigo_cod":rows[0].get("cod"),"artigo_des":rows[0].get("des")}
            return {"artigo_cod":None,"artigo_des":None}
        elif artigo_cod:
            cursor = connections[connGatewayName].cursor()
            sql = lambda: (f"""select * from "SAGE-PROD"."ITMSALES" i where "ITMREF_0" = '{artigo_cod}'""")
            rows = dbgw.executeSimpleList(sql, cursor, {}).get("rows")
            if rows is not None and len(rows)>0:
                return {"artigo_cod":rows[0].get("ITMREF_0"),"artigo_des":rows[0].get("ITMDES1_0")}
            return {"artigo_cod":None,"artigo_des":None}
    
    def _getCliente(cliente_cod):
        if cliente_cod:
            cursor = connections[connGatewayName].cursor()
            sql = lambda: (f"""select "BPCNUM_0", "BPCNAM" from mv_clientes_sage b where "BPCNUM_0" = '{cliente_cod}'""")
            rows = dbgw.executeSimpleList(sql, cursor, {}).get("rows")
            if rows is not None and len(rows)>0:
                return {"cliente_cod":rows[0].get("BPCNUM_0"),"cliente_nome":rows[0].get("BPCNAM")}
            return {"cliente_cod":None,"cliente_nome":None}

    def _updatePaletizacao(paletizacao_id,data,versao,cursor):
        dml = db.dml(TypeDml.UPDATE, {
            "cliente_cod":data.get("cliente_cod"),
            "artigo_cod":data.get("artigo_cod"),
            "contentor_id":data.get("contentor_id"),
            "filmeestiravel_bobines":data.get("filmeestiravel_bobines"),
            "filmeestiravel_exterior":data.get("filmeestiravel_exterior"),
            "cintas":data.get("cintas"),
            "ncintas":data.get("ncintas"),
            "paletes_sobrepostas":data.get("paletes_sobrepostas"),
            "npaletes":data.get("npaletes"),
            "palete_maxaltura":data.get("palete_maxaltura"),
            "netiquetas_bobine":data.get("netiquetas_bobine"),
            "netiquetas_lote":data.get("netiquetas_lote"),
            "netiquetas_final":data.get("netiquetas_final"),
            "designacao":data.get("designacao"),
            "cintas_palete":data.get("cintas_palete"),
            "cliente_nome":data.get("cliente_nome"),
            "folha_identificativa":data.get("folha_identificativa"),
            'versao': f'versao={versao}',
        }, "producao_paletizacao",{"id":Filters.getNumeric(paletizacao_id)},None,None,['versao'])
        db.execute(dml.statement, cursor, dml.parameters)

    def _insertPaletizacao(data,versao,cursor):
        dml = db.dml(TypeDml.INSERT, {
            "cliente_cod":data.get("cliente_cod"),
            "artigo_cod":data.get("artigo_cod"),
            "contentor_id":data.get("contentor_id"),
            "filmeestiravel_bobines":data.get("filmeestiravel_bobines"),
            "filmeestiravel_exterior":data.get("filmeestiravel_exterior"),
            "cintas":data.get("cintas"),
            "ncintas":data.get("ncintas"),
            "paletes_sobrepostas":data.get("paletes_sobrepostas"),
            "npaletes":data.get("npaletes"),
            "palete_maxaltura":data.get("palete_maxaltura"),
            "netiquetas_bobine":data.get("netiquetas_bobine"),
            "netiquetas_lote":data.get("netiquetas_lote"),
            "netiquetas_final":data.get("netiquetas_final"),
            "designacao":data.get("designacao"),
            "cintas_palete":data.get("cintas_palete"),
            "cliente_nome":data.get("cliente_nome"),
            "folha_identificativa":data.get("folha_identificativa"),
            "versao":f"{versao}"
        }, "producao_paletizacao",None,None,False,['versao'])
        db.execute(dml.statement, cursor, dml.parameters)
        return cursor.lastrowid

    def _insertPaletizacaoDetails(paletizacao_id,cursor):
        for idx, v in enumerate(data.get("details")):
            v.pop("rowid",None)
            v.pop("rowvalid",None)
            v.pop("rowadded",None)
            v.pop("id", None)
            v.pop("paletizacao_id", None)
            dml = db.dml(TypeDml.INSERT, {**v, 'paletizacao_id':paletizacao_id}, "producao_paletizacaodetails",None,None,False)
            db.execute(dml.statement, cursor, dml.parameters)
    
    def _deletePaletizacaoDetails(paletizacao_id,cursor):
        dml = db.dml(TypeDml.DELETE, None,'producao_paletizacaodetails',{"paletizacao_id":Filters.getNumeric(paletizacao_id)},None,False)
        db.execute(dml.statement, cursor, dml.parameters)
    try:
        with connections["default"].cursor() as cursor:
            
            #A ordem com que são executados os if's são muito importantes!!!!!!
            artigo = {"artigo_cod":None,"artigo_des":None}
            if data.get("artigo_id") is not None and isinstance(data.get("artigo_id"), int):
                artigo = _getArtigo(data.get("artigo_id"),None)
            elif data.get("artigo_id") is not None and isinstance(data.get("artigo_id"), dict):
                artigo = _getArtigo(None,data.get("artigo_id").get("cod"))
            elif data.get("artigo_cod") is not None:
                artigo = _getArtigo(None,data.get("artigo_cod"))

            cliente = {"cliente_cod":None,"cliente_nome":None}
            if data.get("cliente") is not None and isinstance(data.get("cliente"), dict):
                cliente = _getCliente(data.get("cliente").get("BPCNUM_0"))
            elif data.get("cliente_cod") is not None:
                cliente = _getCliente(data.get("cliente_cod"))
            

            data.pop("cliente",None)
            data.pop("artigo_id",None)
            data = {
                **data,**cliente,**artigo,
                "designacao": f"""{cliente.get("cliente_cod")}_{artigo.get("artigo_cod")}""" if data.get("designacao") is None else data.get("designacao")
            }
            #print(filter)
            if filter.get("new") is not None:
                _id = None
                _id = _insertPaletizacao(data,1,cursor)
                _insertPaletizacaoDetails(_id,cursor)
                return Response({"status": "success", "id":_id, "title": "O esquema de Paletização foi Registado com Sucesso!", "subTitle":f'Esquema {data.get("designacao")} [v1]'})
            elif filter.get("cs_id") is not None:
                print("current settings")
                #return updateCurrentSettings(filter.get("cs_id"),data.get("type"),data,request.user.id,cursor)
            elif filter.get("paletizacao_id") is not None:
                print("paletização....")
                
                exists = checkPaletizacao(data,filter.get("paletizacao_id"),cursor)
                inuse = checkPaletizacaoIsInUse(filter.get("paletizacao_id"),filter.get("of_id"),cursor)
                versao = getPaletizacaoVersao(data,filter.get("paletizacao_id"),cursor)
                if (exists==1 and inuse==1) or exists==0:
                    _id = _insertPaletizacao(data,versao,cursor)
                    _insertPaletizacaoDetails(_id,cursor)
                    return Response({"status": "success", "id":_id, "title": "O Esquema de Paletização foi registado com Sucesso!", "subTitle":f'Esquema {data.get("designacao")} [v{versao}]'})
                else:
                    _updatePaletizacao(filter.get("paletizacao_id"),data,versao,cursor)
                    _deletePaletizacaoDetails(filter.get("paletizacao_id"),cursor)
                    _insertPaletizacaoDetails(filter.get("paletizacao_id"),cursor)
                    return Response({"status": "success", "id":filter.get("paletizacao_id"), "title": "O Esquema de Paletização foi alterado com Sucesso!", "subTitle":f'Esquema {data.get("designacao")} [v{versao}]'})
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})


def FormulacaoPlanList(request, format=None):
    connection = connections["default"].cursor()
    filter = request.data['filter']
    f = Filters(filter)
    f.setParameters({}, False)
    f.where()
    f.add(f'agg_of_id = :agg_of_id',True)
    f.value()

    dql = db.dql(request.data, False)
    sql = lambda: (f"""
        select pfp.id plan_id,pfp.idx,pfp.observacoes,pf.* 
        from producao_formulacao_plan pfp 
        join producao_formulacao pf on pf.id=pfp.formulacao_id        
        {f.text}
        order by pfp.idx
    """)
    try:
        response = db.executeSimpleList(sql, connection, f.parameters)
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def SaveFormulacaoPlan(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    
    def checkOrdemFabrico(agg_of_id,cursor):
        f = Filters({"agg_of_id": agg_of_id})
        f.where()
        f.add(f'agg_of_id = :agg_of_id', True )
        f.add(f'`status` = 9', True )
        f.value("and")
        exists = db.exists("producao_currentsettings", f, cursor).exists
        return exists
    
    def checkFormulacao(agg_of_id,cursor):
        f = Filters({"agg_of_id": agg_of_id})
        f.where()
        f.add(f'id = :agg_of_id', True )
        f.add(f'formulacao_id is not null', True )
        f.value("and")
        exists = db.exists("producao_tempaggordemfabrico", f, cursor).exists
        return exists

    def _deleteFormulacaoPlan(agg_of_id,cursor):
        dml = db.dml(TypeDml.DELETE, None,'producao_formulacao_plan',{"agg_of_id":Filters.getNumeric(agg_of_id)},None,False)
        db.execute(dml.statement, cursor, dml.parameters)
    
    try:
        with connections["default"].cursor() as cursor:
            isClosed = checkOrdemFabrico(filter.get("agg_of_id"),cursor)
            if (not isClosed):
                _deleteFormulacaoPlan(filter.get("agg_of_id"),cursor)
                for idx, v in enumerate(data.get("rows")):
                    if ("plan_id" in v):
                        dml = db.dml(TypeDml.INSERT, {"id":v.get("plan_id"),"formulacao_id":v.get("id"),"agg_of_id":filter.get("agg_of_id"),"observacoes":v.get("observacoes"),"idx":v.get("idx"),"t_stamp":datetime.today(), "user_id":request.user.id}, "producao_formulacao_plan",None,None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                    else:
                        dml = db.dml(TypeDml.INSERT, {"formulacao_id":v.get("id"),"agg_of_id":filter.get("agg_of_id"),"observacoes":v.get("observacoes"),"idx":v.get("idx"),"t_stamp":datetime.today(), "user_id":request.user.id}, "producao_formulacao_plan",None,None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                    if (v.get("idx")==1):
                        _id = cursor.lastrowid
                        hasFormulacao = checkFormulacao(filter.get("agg_of_id"),cursor)
                        if not hasFormulacao and _id:
                            dml = db.dml(TypeDml.UPDATE, {"formulacao_id":v.get("id"),"formulacao_plan_id":_id}, "producao_tempaggordemfabrico",{"id":Filters.getNumeric(filter.get("agg_of_id"))},None,None)
                            db.execute(dml.statement, cursor, dml.parameters)
            return Response({"status": "success", "title": "O plano de formulações foi registado com sucesso!"})
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})

def FormulacoesAvailableList(request, format=None):
    connection = connections["default"].cursor()    
    f = Filters({**request.data['filter']})
    f.setParameters({
        "group_name": {"value": lambda v: Filters.getUpper(v.get('fgroup')), "field": lambda k, v: f'pf.{k}'},
        "subgroup_name": {"value": lambda v: Filters.getUpper(v.get('fsubgroup')), "field": lambda k, v: f'pf.{k}'},
        "designacao": {"value": lambda v: Filters.getUpper(v.get('fdesignacao')), "field": lambda k, v: f'pf.{k}'},
        "produto_cod": {"value": lambda v: Filters.getUpper(v.get('fproduto')), "field": lambda k, v: f'upper(pp.{k})'},
        "produto_id": {"value": lambda v: Filters.getNumeric(v.get('fproduto_id')), "field": lambda k, v: f'pf.{k}'},
        "cliente_nome": {"value": lambda v: Filters.getUpper(v.get('fcliente')), "field": lambda k, v: f'upper(pf.{k})'},
        "reference": {"value": lambda v: Filters.getNumeric(v.get('freference')), "field": lambda k, v: f'pf.{k}'},
        **rangeP(f.filterData.get('fdata_created'), 'pf.created_date', lambda k, v: f'{k}'),
        **rangeP(f.filterData.get('fdata_updated'), 'pf.updated_date', lambda k, v: f'{k}')
    }, True)
    f.where()
    f.auto()
    f.value("and")

    f2 = filterMulti(request.data['filter'], {
        # 'fmulti_artigo': {"keys": ['"ITMREF_0"', '"ITMDES1_0"'], "table": 'ITM.'}
    }, False, "and" if f.hasFilters else "and" ,False)

    parameters = {**f.parameters, **f2['parameters']}
    dql = db.dql(request.data, False,False)
    cols = f'''pf.*,pp.produto_cod,pa.cod,pa.des'''
    sql = lambda p, c, s: (
        f"""
            SELECT {c(f'{cols}')} 
            FROM producao_formulacao pf
            LEFT JOIN producao_produtos pp ON pp.id=pf.produto_id
            LEFT JOIN producao_artigo pa ON pa.id=pf.artigo_id
            {f.text} {f2["text"]}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}  
        """
    )

    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    response = db.executeList(sql, connection, parameters, [])
    return Response(response)   

def ListFormulacoes(request, format=None):
    connection = connections["default"].cursor()    
    f = Filters({**request.data['filter']})
    f.setParameters({
        "group_name": {"value": lambda v: Filters.getUpper(v.get('fgroup')), "field": lambda k, v: f'pf.{k}'},
        "subgroup_name": {"value": lambda v: Filters.getUpper(v.get('fsubgroup')), "field": lambda k, v: f'pf.{k}'},
        "designacao": {"value": lambda v: Filters.getUpper(v.get('fdesignacao')), "field": lambda k, v: f'pf.{k}'},
        "produto_cod": {"value": lambda v: Filters.getUpper(v.get('fproduto')), "field": lambda k, v: f'upper(pp.{k})'},
        "cliente_nome": {"value": lambda v: Filters.getUpper(v.get('fcliente')), "field": lambda k, v: f'upper(pf.{k})'},
        "reference": {"value": lambda v: Filters.getNumeric(v.get('freference')), "field": lambda k, v: f'pf.{k}'},
        "versao": {"value": lambda v: Filters.getNumeric(v.get('fversao')), "field": lambda k, v: f'pf.{k}'},
        **rangeP(f.filterData.get('fdata_created'), 'pf.created_date', lambda k, v: f'{k}'),
        **rangeP(f.filterData.get('fdata_updated'), 'pf.updated_date', lambda k, v: f'{k}')
    }, True)
    f.where()
    f.auto()
    f.value("and")

    f2 = filterMulti(request.data['filter'], {
        # 'fmulti_artigo': {"keys": ['"ITMREF_0"', '"ITMDES1_0"'], "table": 'ITM.'}
    }, False, "and" if f.hasFilters else "and" ,False)

    parameters = {**f.parameters, **f2['parameters']}
    dql = db.dql(request.data, False,False)
    print("LISTING FORMULACOES")
    print(request.data)
    cols = f'''pf.*,pp.produto_cod,pa.cod,pa.des'''
    sql = lambda p, c, s: (
        f"""
            SELECT {c(f'{cols}')} 
            FROM producao_formulacao pf
            LEFT JOIN producao_produtos pp ON pp.id=pf.produto_id
            LEFT JOIN producao_artigo pa ON pa.id=pf.artigo_id
            {f.text} {f2["text"]}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}  
        """
    )

    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    response = db.executeList(sql, connection, parameters, [])
    return Response(response)   

def FormulacaoGroupsLookup(request, format=None):
    conn = connections["default"].cursor()
    cols = ['group_name']
    f = Filters(request.data['filter'])
    f.setParameters({"group_name":{"value": lambda v: v.get('group_name'), "field": lambda k, v: f'{k}'}}, True)
    f.auto()
    f.where()
    f.value("and")    

    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    response = db.executeSimpleList(lambda: (
        f"""
            select 
            distinct {dql.columns}
            from producao_formulacao
            {f.text}
            {dql.sort}
            {dql.limit}
        """
    ), conn, f.parameters)

    return Response(response)

def FormulacaoSubGroupsLookup(request, format=None):
    conn = connections["default"].cursor()
    cols = ['subgroup_name']
    f = Filters(request.data['filter'])
    f.setParameters({"subgroup_name":{"value": lambda v: v.get('subgroup_name'), "field": lambda k, v: f'{k}'}}, True)
    f.auto()
    f.where()
    f.value("and")    

    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    response = db.executeSimpleList(lambda: (
        f"""
            select 
            distinct {dql.columns}
            from producao_formulacao
            {f.text}
            {dql.sort}
            {dql.limit}
        """
    ), conn, f.parameters)

    return Response(response)

def UpdateFormulacaoReference(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    data = {"reference": data.get("reference") if data.get("reference") is not None else 0}
    try:
        with connections["default"].cursor() as cursor:
            dml = db.dml(TypeDml.UPDATE, data, "producao_formulacao",{"id":Filters.getNumeric(filter.get("formulacao_id"))},None,None)
            db.execute(dml.statement, cursor, dml.parameters)
            return Response({"status": "success", "title": "Formulação atualizada com sucesso!"})
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})

def SaveFormulacao(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    data.pop("method", None)
    data = {
        **data,
        "designacao": f"""{datetime.now().strftime("%Y%m%d")}""" if data.get("designacao") is None else data.get("designacao"),
        "group_name": data.get("group_name"),
        "subgroup_name": data.get("subgroup_name"),
        "produto_id": data.get("produto_id").get("id") if type(data.get("produto_id")) is dict else data.get("produto_id"),
        "artigo_id": data.get("artigo_id").get("id") if type(data.get("artigo_id")) is dict else data.get("artigo_id")
    }

    def _updateFormulacao(formulacao_id,data,versao,cursor):
        dml = db.dml(TypeDml.UPDATE, {
            'produto_id': data.get("produto_id"),
            'designacao': data.get("designacao"),
            'cliente_cod': data.get("cliente_cod"),
            'cliente_nome': data.get("cliente_nome"),
            "group_name":data.get("group_name"),
            "subgroup_name":data.get("subgroup_name"),
            "artigo_id":data.get("artigo_id"),
            "reference":data.get("reference"),
            'versao': f'versao={versao}',
            'extr0': data.get('extr0'),
            'extr1': data.get('extr1'),
            'extr2': data.get('extr2'),
            'extr3': data.get('extr3'),
            'extr4': data.get('extr4'),
            'extr0_val': data.get('extr0_val'),
            'extr1_val': data.get('extr1_val'),
            'extr2_val': data.get('extr2_val'),
            'extr3_val': data.get('extr3_val'),
            'extr4_val': data.get('extr4_val'),
            'joinbc': ifNull(data.get('joinbc'),1),
            "created_date": datetime.now(),
            "updated_date": datetime.now()
        }, "producao_formulacao",{"id":Filters.getNumeric(formulacao_id)},None,None,['versao'])
        db.execute(dml.statement, cursor, dml.parameters)

    def _insertFormulacao(data,versao,cursor):
        dml = db.dml(TypeDml.INSERT, {
            'produto_id': data.get("produto_id"),
            'designacao': data.get("designacao"),
            'cliente_cod': data.get("cliente_cod"),
            'cliente_nome': data.get("cliente_nome"),
            "group_name":data.get("group_name"),
            "subgroup_name":data.get("subgroup_name"),
            "artigo_id":data.get("artigo_id"),
            "reference":data.get("reference"),
            'versao': f'{versao}',
            'extr0': data.get('extr0'),
            'extr1': data.get('extr1'),
            'extr2': data.get('extr2'),
            'extr3': data.get('extr3'),
            'extr4': data.get('extr4'),
            'extr0_val': data.get('extr0_val'),
            'extr1_val': data.get('extr1_val'),
            'extr2_val': data.get('extr2_val'),
            'extr3_val': data.get('extr3_val'),
            'extr4_val': data.get('extr4_val'),
            'joinbc': ifNull(data.get('joinbc'),1),
            "created_date": datetime.now(),
            "updated_date": datetime.now()
        }, "producao_formulacao",None,None,False,['versao'])
        db.execute(dml.statement, cursor, dml.parameters)
        return cursor.lastrowid

    def _insertFormulacaoItems(formulacao_id,cursor):
        for idx, v in enumerate(data.get("items")):
            v.pop("rowid",None)
            v.pop("rowvalid",None)
            v.pop("rowadded",None)
            v.pop("id", None)
            dml = db.dml(TypeDml.INSERT, {**v, 'formulacao_id':formulacao_id}, "producao_formulacaomateriasprimas",None,None,False)
            db.execute(dml.statement, cursor, dml.parameters)
    
    def _deleteFormulacaoItems(formulacao_id,cursor):
        dml = db.dml(TypeDml.DELETE, None,'producao_formulacaomateriasprimas',{"formulacao_id":Filters.getNumeric(formulacao_id)},None,False)
        db.execute(dml.statement, cursor, dml.parameters)
    try:
        with connections["default"].cursor() as cursor:
            #A ordem com que são executados os if's são muito importantes!!!!!!
            if "formulacao_plan" in data:
                formulacao_plan = data.get("formulacao_plan")
                if filter.get("cs_id") is not None:
                    if formulacao_plan is None:
                        dml = db.dml(TypeDml.UPDATE, {'formulacao_plan_id': None,"type_op":"formulacao_plan_none"}, "producao_currentsettings",{"id":Filters.getNumeric(filter.get("cs_id"))},None,None)
                        db.execute(dml.statement, cursor, dml.parameters)
                        return Response({"status": "success", "title": "Formulação planeada desassociada com Sucesso!"})
                    elif "id" in formulacao_plan:
                        #Update only if the id of formulacao is on formulacao_plan
                        _formulacao = _getFormulacao({"formulacao_id":formulacao_plan.get("id")})
                        if _formulacao.get("rows") and  len(_formulacao.get("rows"))>0:
                            _formulacao = {**json.loads(_formulacao.get("rows")[0].get("formulacao")),"plan_id":formulacao_plan.get("plan_id")}
                            return updateCurrentSettings(filter.get("cs_id"),"formulacao_formulation_change",_formulacao,request.user.id,cursor)
                        else:
                            return Response({"status": "error", "title": "Não foi encontrada a formulação associada ao plano selecionado!"})
                else:
                    if formulacao_plan is None:
                        dml = db.dml(TypeDml.UPDATE, {'formulacao_plan_id': None}, "producao_tempaggordemfabrico",{"id":Filters.getNumeric(filter.get("agg_of_id"))},None,None)
                        db.execute(dml.statement, cursor, dml.parameters)
                        return Response({"status": "success", "title": "Formulação planeada desassociada com Sucesso!"})
                    elif "id" in formulacao_plan:
                        #Update only if the id of formulacao is on formulacao_plan
                        dml = db.dml(TypeDml.UPDATE, {'formulacao_plan_id': formulacao_plan.get("plan_id"), "formulacao_id":formulacao_plan.get("id")}, "producao_tempaggordemfabrico",{"id":Filters.getNumeric(filter.get("agg_of_id"))},None,None)
                        db.execute(dml.statement, cursor, dml.parameters)
                        return Response({"status": "success", "title": "Formulação atribuída com Sucesso!"})
            elif filter.get("new") is not None:
                _id = _insertFormulacao(data,1,cursor)
                _insertFormulacaoItems(_id,cursor)
                return Response({"status": "success", "id":_id, "title": "A Formulação foi Registada com Sucesso!", "subTitle":f'Formulação {data.get("designacao")} [v1]'})
            elif filter.get("cs_id") is not None:
                print("current settings")
                print(filter)
                print(data.get("type"))
                return updateCurrentSettings(filter.get("cs_id"),data.get("type"),data,request.user.id,cursor)
            elif filter.get("formulacao_id") is not None:
                print("formulacao....")
                exists = checkFormulacao(data,filter.get("formulacao_id"),cursor)
                inuse = checkFormulacaoIsInUse(filter.get("formulacao_id"),filter.get("agg_of_id"),cursor)
                versao = getFormulacaoVersao(data,filter.get("formulacao_id"),cursor)
                if (exists==1 and inuse==1) or exists==0:
                    _id = _insertFormulacao(data,versao,cursor)
                    _insertFormulacaoItems(_id,cursor)
                    return Response({"status": "success", "id":_id, "title": "A Formulação foi Registada com Sucesso!", "subTitle":f'Formulação {data.get("designacao")} [v{versao}]'})
                else:
                    _updateFormulacao(filter.get("formulacao_id"),data,versao,cursor)
                    _deleteFormulacaoItems(filter.get("formulacao_id"),cursor)
                    _insertFormulacaoItems(filter.get("formulacao_id"),cursor)
                    return Response({"status": "success", "title": "A Formulação foi alterada com Sucesso!", "subTitle":f'Formulação {data.get("designacao")} [v{versao}]'})
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})

def SetOrdemFabricoFormulacao(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    
    def _isAggInElaboration(aggid,cursor):
        f = Filters({"id": aggid})
        f.where(False,"and")
        f.add(f'pt.id = :id', lambda v:(v!=None) )
        f.value("and")
        row = db.executeSimpleList(lambda: (
        f"""
            select pt.id, pt.cod,pt.status,pt2.of_id, pt2.cliente_nome 
            from producao_tempaggordemfabrico pt
            join producao_tempordemfabrico pt2 on pt2.agg_of_id = pt.id
            where pt.status=0 and not exists(select 1 from producao_artigodetails pa where pa.cod=pt2.of_id) {f.text}
            order by pt.cod ASC, pt2.of_id ASC 
            limit 1
        """
        ), cursor, f.parameters)["rows"]
        if row and len(row)>0:
            return row[0]
        return None
    
    def _updateAgg(agg_id,formulacao_id,cursor):
        dml = db.dml(TypeDml.UPDATE, {
            'formulacao_id': formulacao_id
        }, "producao_tempaggordemfabrico",{"id":Filters.getNumeric(agg_id)},None,None,[])
        db.execute(dml.statement, cursor, dml.parameters)
    
    def _checkPlan(agg_id,cursor):
        f = Filters({"id": agg_id})
        f.where()
        f.add(f'pf.id = :id', True )
        f.add(f'pf.formulacao_plan_id is not null', True )
        f.value("and")
        exists = db.exists("producao_tempaggordemfabrico pf", f, cursor).exists
        return exists
    
    def _addPlan(agg_id,formulacao_id,cursor):
        plan_id = _checkPlan(agg_id,cursor)
        dta = {
        'agg_of_id':agg_id,
        'formulacao_id': formulacao_id,
        'idx': f"(select IFNULL(max(idx),0)+1 from producao_formulacao_plan pfp where agg_of_id={agg_id})",
        'user_id':request.user.id,
        't_stamp':datetime.now()
        }
        dml = db.dml(TypeDml.INSERT, dta, "producao_formulacao_plan",None,None,False,["idx"])
        db.execute(dml.statement, cursor, dml.parameters)
        lastid = cursor.lastrowid
        if plan_id==0:
            dml = db.dml(TypeDml.UPDATE, {
            'formulacao_plan_id': lastid
            }, "producao_tempaggordemfabrico",{"id":Filters.getNumeric(agg_id)},None,None,[])
            db.execute(dml.statement, cursor, dml.parameters)

    try:
        with connections["default"].cursor() as cursor:
            row = _isAggInElaboration(filter.get("aggid"),cursor)
            if row is None:
                return Response({"status": "error", "title": "Não é possível associar a formulação à ordem de fabrico selecionada! Só é possível no estado 'Em elaboração'."})
            _updateAgg(filter.get("aggid"),data.get("formulacao_id"),cursor)
            _addPlan(filter.get("aggid"),data.get("formulacao_id"),cursor)
            return Response({"status": "success", "title": "A Formulação foi Associada com Sucesso!"})
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})

# def GetPaletizacao(request, format=None):
#     connection = connections["default"].cursor()
#     filter = request.data['filter']

#     f = Filters(filter)
#     f.setParameters({}, False)
#     f.where()
#     f.add(f'po.id = :id',True)
#     f.value()

#     dql = db.dql(request.data, False)
#     sql = lambda: (f"""
#         select pa.paletizacao,pl.designacao 
#         from planeamento_ordemproducao po
#         join producao_currentsettings pc on pc.agg_of_id =po.agg_of_id_id
#         JOIN JSON_TABLE(JSON_EXTRACT(fix_json(pc.paletizacao),'$'),'$[*]' COLUMNS(of_id INT PATH '$.of_id',	details JSON PATH '$.paletizacao')) pa on pa.of_id=po.id
#         JOIN producao_paletizacao pl on pl.id=pa.paletizacao->>'$.id'
#         {f.text}
#     """)   
#     try:
#         response = db.executeSimpleList(sql, connection, f.parameters)
#     except Error as error:
#         print(str(error))
#         return Response({"status": "error", "title": str(error)})
#     return Response(response)












def _getPaletizacao(filter):
    cursor = connections["default"].cursor()
    f = Filters(filter)
    f.setParameters({}, False)
    f.where()
    if ("audit_cs_id" in filter):
        f.add(f'id = :audit_cs_id',True)
    elif ("cs_id" in filter):
        f.add(f'id = :cs_id',True)
    elif ("paletizacao_id" in filter):
        f.add(f'ppz.id = :paletizacao_id',True)
    elif ("id" in filter):
        f.add(f'ppz.id = :id',True)
    elif ("of_id" in filter):
        f.add(f'tof.id = :of_id',True)
    elif ("po_id" in filter):
        f.add(f'po.id = :po_id',True)
    
    f.value()
    if ("audit_cs_id" in filter):
        sql = lambda: (f"""select paletizacao from audit_currentsettings {f.text}""")
    elif ("cs_id" in filter):
        sql = lambda: (f"""select paletizacao from producao_currentsettings {f.text}""")
    elif ("paletizacao_id" in filter or "id" in filter or "of_id" in filter or "po_id" in filter):
       cgw = connections[connGatewayName].cursor()
       sql=lambda: (f"""
            with tof AS(
            select tof.id, tof.of_id,tof.core_cod,tof.core_des,tof.item_id,tof.item_cod,tof.order_cod,tof.cliente_nome,tof.cliente_cod,
            tof.linear_meters,tof.n_paletes,tof.n_paletes_total,tof.qty_encomenda,tof.sqm_bobine, tof.paletizacao_id,tof.emendas_id,tof.agg_of_id
            from
            {sgpAlias}.producao_tempordemfabrico tof
            --where
            --not exists (select 1 from {sgpAlias}.planeamento_ordemproducao po where po.draft_ordem_id=tof.id )
            )
            select t.* from (
            SELECT
            (select json_agg(pd) x from {sgpAlias}.producao_paletizacaodetails pd where pd.paletizacao_id=ppz.id) details,
            ppz.*,
            pa.id artigo_id
            from {sgpAlias}.producao_paletizacao ppz
            left join tof on ppz.id=tof.paletizacao_id
            left join {sgpAlias}.producao_tempaggordemfabrico tofa on tofa.id=tof.agg_of_id --and tofa.status = 0
            left join {sgpAlias}.producao_emendas pe on pe.id=tof.emendas_id
            left join {sgpAlias}.producao_artigo pa on pa.cod=ppz.artigo_cod
            {f.text}
            ) t
       """)
    #    sql = lambda: (f"""
    #         with tof AS(
    #         select tof.id, tof.of_id,tof.core_cod,tof.core_des,tof.item_id,tof.item_cod,tof.order_cod,tof.cliente_nome,tof.cliente_cod,
    #         tof.linear_meters,tof.n_paletes,tof.n_paletes_total,tof.qty_encomenda,tof.sqm_bobine, tof.paletizacao_id,tof.emendas_id,tof.agg_of_id
    #         from
    #         {sgpAlias}.producao_tempordemfabrico tof
    #         --where 
    #         --not exists (select 1 from {sgpAlias}.planeamento_ordemproducao po where po.draft_ordem_id=tof.id )
    #         )
    #         select t.* from (
    #         SELECT
    #         (select json_agg(pd) x from {sgpAlias}.producao_paletizacaodetails pd where tof.paletizacao_id=pd.paletizacao_id) details,
    #         ppz.*,
    #         pa.id artigo_id
    #         from tof
    #         join {sgpAlias}.producao_tempaggordemfabrico tofa on tofa.id=tof.agg_of_id --and tofa.status = 0
    #         left join {sgpAlias}.producao_paletizacao ppz on ppz.id=tof.paletizacao_id
    #         left join {sgpAlias}.producao_emendas pe on pe.id=tof.emendas_id
    #         left join {sgpAlias}.producao_artigo pa on pa.cod=ppz.artigo_cod
    #         {f.text}
    #         ) t
    #     """)
       return dbgw.executeSimpleList(sql, cgw, f.parameters)
    else:    
        return None
        #sql = lambda: (f"""select formulacao from (
        #    select id,MAX(id) over (partition by ac.agg_of_id) maxid,formulacaov2 formulacao from audit_currentsettings ac where contextid = (select id from producao_currentsettings cs where status=3)
        #) t where id=maxid""")    
    return db.executeSimpleList(sql, cursor, f.parameters)

def GetPaletizacao(request, format=None):
    #A ordem que são executados os if's é muito importante!!!!
    cursor = connections["default"].cursor()
    filter = request.data['filter']
    try:
        response = _getPaletizacao(filter)
        if response==None:
            return Response({"status": "success", "data":None})
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)


def GetPaletesStock(request, format=None):
    connection = connections[connGatewayName].cursor()
    filter = request.data['filter']
    f = Filters(filter)
    f.setParameters({
        "ordem_id": {"value": lambda v: Filters.getNumeric(v.get('fordem_id')), "field": lambda k, v: f'sgppl.{k}'},
        **rangeP(f.filterData.get('fdata'), 'timestamp', lambda k, v: f'DATE(timestamp)'),
        "nome": {"value": lambda v: Filters.getUpper(v.get('flote')), "field": lambda k, v: f'sgppl.{k}'}
    }, True)
    f.where(False,"and")
    f.auto()
    f.value()

    dql = dbgw.dql(request.data, False)
    cols = f"""sgppl.id,sgppl."timestamp",sgppl.data_pal,sgppl.nome,sgppl.num,sgppl.estado,sgppl.area,sgppl.comp_total,
        sgppl.num_bobines,sgppl.diametro,sgppl.peso_bruto,sgppl.peso_palete,sgppl.peso_liquido,sgppl.cliente_id,
        sgppl.retrabalhada,sgppl.stock,sgppl.carga_id,sgppl.num_palete_carga,sgppl.destino,sgppl.ordem_id,sgppl.ordem_original,
        sgppl.ordem_original_stock,sgppl.num_palete_ordem,sgppl.draft_ordem_id,sgppl.ordem_id_original,sgppl.area_real,
        sgppl.comp_real,sgppl.diam_avg,sgppl.diam_max,sgppl.diam_min,sgppl.nbobines_real, sgppl.ofid_original, sgppl.ofid, sgppl.disabled,
        sgppl.cliente_nome,sgppl.artigo,sgppl.destinos,sgppl.nbobines_emendas,sgppl.destinos_has_obs"""
    sql = lambda: (f"""
        select
        {cols}
        FROM mv_paletes sgppl
        LEFT JOIN {mv_ofabrico_list} mol on mol.ofabrico=sgppl.ofid
        WHERE sgppl.ordem_id_original <> sgppl.ordem_id {f.text}
        {dql.sort}
    """)
    try:
        response = dbgw.executeSimpleList(sql, connection, f.parameters)
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def ChangeStatus(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with connections["default"].cursor() as cursor:
            return changeStatus(filter.get("cs_id"),"status",data,request.user.id,cursor)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})

def chekPrfStatus(ofid,cursor):
    f = Filters({"id": ofid})
    f.where()
    f.add(f'id = :id', True )
    f.value("and")
    response = db.executeSimpleList(lambda: (f"""        
        select ativa from planeamento_ordemproducao po {f.text} and agg_of_id_id is not null
    """), cursor, f.parameters)
    if len(response["rows"])>0:
        return response["rows"][0]["ativa"]
    return None

def OpenPrf(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
   
    def checkOpenPrfs(cursor):
        response = db.executeSimpleList(lambda: (f"""        
            select count(*) cnt from planeamento_ordemproducao po where ativa=1 and `status` <>3 and agg_of_id_id is not null
        """), cursor, {})
        if len(response["rows"])>0:
            return response["rows"][0]["cnt"]
        return 0

    try:
        with connections["default"].cursor() as cursor:
            _n = checkOpenPrfs(cursor)
            if _n >3:
                raise Exception("Não é possível abrir a Prf! Existem mais de 3 Prf's abertas!")
            _status = chekPrfStatus(data.get("ofid"),cursor)
            if _status == 1:
                raise Exception("A Prf já se encontra aberta!")
            dml = db.dml(TypeDml.UPDATE, {"fim":None,"ativa":1,"completa":0}, "planeamento_ordemproducao",{"id":Filters.getNumeric(data.get("ofid"))},None,None)
            db.execute(dml.statement, cursor, dml.parameters)
            updateMaterializedView()
            return Response({"status": "success", "title": "Prf aberta com sucesso!"})
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})

def ClosePrf(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    
    # def checkOrdemFabrico(agg_of_id,cursor):
    #     f = Filters({"agg_of_id": agg_of_id})
    #     f.where()
    #     f.add(f'agg_of_id = :agg_of_id', True )
    #     f.add(f'`status` = 9', True )
    #     f.value("and")
    #     exists = db.exists("producao_currentsettings", f, cursor).exists
    #     return exists

    def getPrf(ofid,cursor):
        f = Filters({"id": ofid})
        f.where()
        f.add(f'id = :id', True )
        f.value("and")
        response = db.executeSimpleList(lambda: (f"""        
            select ativa,num_paletes_produzidas,num_paletes_produzir,num_paletes_stock_in,num_paletes_stock,was_in_production from planeamento_ordemproducao po {f.text} and agg_of_id_id is not null
        """), cursor, f.parameters)
        if len(response["rows"])>0:
            return response["rows"][0]
        return None

    try:
        with connections["default"].cursor() as cursor:
            _prf = getPrf(data.get("ofid"),cursor)
            if not _prf:
                raise Exception("A Prf não existe!")
            if _prf.get("ativa")==0:
                raise Exception("A Prf não não pode ser fechada!")
            if _prf.get("was_in_production")==1 and (_prf.get("num_paletes_produzidas") < _prf.get("num_paletes_produzir") or _prf.get("num_paletes_stock_in") < _prf.get("num_paletes_stock")):
                raise Exception("Número de paletes da Prf insuficiente!")
            dml = db.dml(TypeDml.UPDATE, {
                "fim": datetime.now(),
                "num_paletes_total":_prf.get("num_paletes_produzidas") + _prf.get("num_paletes_stock_in"),
                "num_paletes_stock":_prf.get("num_paletes_stock_in"),
                "num_paletes_produzir":_prf.get("num_paletes_produzidas"),
                "ativa":0,
                "completa": 0 if (_prf.get("num_paletes_produzidas") < _prf.get("num_paletes_produzir") or _prf.get("num_paletes_stock_in") < _prf.get("num_paletes_stock")) else 1
                }, "planeamento_ordemproducao",{"id":Filters.getNumeric(data.get("ofid"))},None,None)
            db.execute(dml.statement, cursor, dml.parameters)
            updateMaterializedView()
            return Response({"status": "success", "title": "Prf fechada com sucesso!"})
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)}) 

def RevertToElaboration(request, format=None):
    data = request.data.get("parameters")
    try:
        with connections["default"].cursor() as cursor:
            args = [data.get("aggid")]
            cursor.callproc('of_to_elaboration',args)
            updateMaterializedView()
            return Response({"status": "success","title":"Ordem de fabrico revertida com sucesso." })
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def Ungroup(request, format=None):
    data = request.data.get("parameters")
    try:
        with connections["default"].cursor() as cursor:
            args = [data.get("temp_ofabrico")]
            cursor.callproc('ungroup_of',args)
            updateMaterializedView()
            return Response({"status": "success","title":"Ordem de fabrico desagregada com sucesso." })
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def DeleteElaborationData(request, format=None):
    data = request.data.get("parameters")
    try:
        with connections["default"].cursor() as cursor:
            args = [data.get("temp_ofabrico")]
            cursor.callproc('delete_of_elaboration_data',args)
            updateMaterializedView()
            return Response({"status": "success","title":"Ordem de fabrico apagada com sucesso." })
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def ResyncOrderQtys(request, format=None):
    data = request.data.get("parameters")

    def getCurrentSettings(temp_ofabrico):
        f = Filters({"id":temp_ofabrico})
        f.where()
        f.add(f'id = :id',True )
        f.value("and")
        rows = db.executeSimpleList(lambda: (f'SELECT id,ofs FROM producao_currentsettings pc where agg_of_id = (select agg_of_id from producao_tempordemfabrico {f.text})'), cursor, f.parameters).get("rows")
        if rows is not None and len(rows)>0:
            return rows[0]
        
    def getPaletizacaoId(temp_ofabrico):
        f = Filters({"id":temp_ofabrico})
        f.where()
        f.add(f'id = :id',True )
        f.value("and")
        rows = db.executeSimpleList(lambda: (f"""select paletizacao_id from producao_tempordemfabrico {f.text}"""), cursor, f.parameters).get("rows")
        if rows is not None and len(rows)>0:
            return rows[0].get("paletizacao_id")

    try:
        with connections["default"].cursor() as cursor:
            _cp = json.loads(db.executeSimpleList(lambda: (f"""select fcompute_linearmeters('{json.dumps({"artigo_diam":data.get("item_diam"),"artigo_thickness":data.get("item_thickness"),"artigo_lar":data.get("item_width"),"qty_encomenda":data.get("qty_prevista"),"artigo_core":data.get("item_core")}, ensure_ascii=False)}') c"""), cursor, {}).get("rows")[0].get("c"))
            _paletizacao_id = getPaletizacaoId(data.get("temp_ofabrico"))
            _current_settings = getCurrentSettings(data.get("temp_ofabrico"))
            if _current_settings:
                _ofs = json.loads(_current_settings.get("ofs"))
                for item in _ofs:
                    if item['of_id'] == data.get("temp_ofabrico"):
                        item['qty_encomenda'] = data.get("qty_prevista")
                        item['linear_meters'] = _cp.get("linear_meters")
                        item['n_voltas'] = _cp.get("n_voltas")
                        item['sqm_bobine'] = _cp.get("sqm_bobine")
                dml = db.dml(TypeDml.UPDATE, {"type_op":"resync_qtys", "ofs":json.dumps(_ofs, ensure_ascii=False)}, "producao_currentsettings",{"id":Filters.getNumeric(_current_settings.get("id"))},None,None)
                db.execute(dml.statement, cursor, dml.parameters)
            _npaletes = None
            if _paletizacao_id:
                _npaletes = db.executeSimpleList(lambda: (f"""select fcompute_paletizacao(JSON_MERGE_PATCH(JSON_OBJECT("paletizacao_id",{_paletizacao_id}),'{json.dumps(_cp, ensure_ascii=False)}')) n_paletes"""), cursor, {}).get("rows")[0].get("n_paletes")
                _npaletes = json.loads(_npaletes)
                _npaletes = {
                    "total": _npaletes[0]['total'],
                    "items": [item['items'] for item in _npaletes]
                }
            dml = db.dml(TypeDml.UPDATE, {
                "qty_encomenda": data.get("qty_prevista"),
                "linear_meters": _cp.get("linear_meters"),
                "n_voltas": _cp.get("n_voltas"),
                "sqm_bobine": _cp.get("sqm_bobine"),
                "n_paletes":json.dumps(_npaletes, ensure_ascii=False)
            }, "producao_tempordemfabrico",{"id":Filters.getNumeric(data.get("temp_ofabrico"))},None,None)
            db.execute(dml.statement, cursor, dml.parameters)
            updateMaterializedView()
            return Response({"status": "success","title":"Quantidades de encomenda na ordem de fabrico sincronizada com sucesso." })
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

#region ESTADO PRODUCAO

def GetEstadoProducao(request, format=None):
    cursor = connections["default"].cursor()
    # filter = request.data['filter']
    # f = Filters(filter)
    # f.setParameters({}, True)
    # f.where(False,"and")
    # f.auto()
    # f.value()

    # dql = db.dql(request.data, False)
    # cols = f"""*"""
    # sql = lambda: (f"""
    #     select
    #     {cols}
    #     FROM mv_paletes sgppl
    #     LEFT JOIN mv_ofabrico_list mol on mol.ofabrico=sgppl.ofid
    #     WHERE sgppl.ordem_id_original <> sgppl.ordem_id {f.text}
    #     {dql.sort}
    # """)
    calls = [
        {"key":"params","st":"CALL list_estadoproducao_params(%s)","array":False},
        {"key":"defeitos","st":"CALL list_estadoproducao_defeitos(%s,%s)","array":True},
        {"key":"bobinagens","st":"CALL list_estadoproducao_bobinagens(%s,%s)","array":False},
        {"key":"rows","st":"CALL list_estadoproducao_summary(%s,%s)","array":True},
        {"key":"bobines","st":"CALL list_estadoproducao_bobines(%s,%s)","array":True},
        {"key":"bobines_nopalete","st":"CALL list_estadoproducao_nopalete(%s,%s)","array":True},
        {"key":"paletes","st":"CALL list_estadoproducao_paletes(%s,%s,%s)","array":True},
        {"key":"bobines_retrabalhadas","st":"CALL list_estadoproducao_retrabalhadas(%s,%s)","array":True},
        {"key":"current","st":"CALL list_estadoproducao_current(%s)","array":False}
    ]
    results={}
    print(request.data.get("filter"))
    try:
        for item in calls:
            if item.get("key") in ["params","current"]:
                cursor.execute(item.get("st"), [request.data.get("filter").get("agg_of_id")])
            elif item.get("key") in ["rows"]:
                cursor.execute(item.get("st"), [request.data.get("filter").get("agg_of_id"),request.data.get("filter").get("ordem_id")])
            elif item.get("key") in ["paletes"]:
                cursor.execute(item.get("st"), [request.data.get("filter").get("agg_of_id"),request.data.get("filter").get("ordem_id"),1])
            else:
                cursor.execute(item.get("st"), [request.data.get("filter").get("agg_of_id"),request.data.get("filter").get("ordem_id")])
            results[item.get("key")] = fetchall(cursor) if item.get("array") else fetchone(cursor)
        response = {"status": "success", "rows": results}
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def GetOrdemFabricoSettings(request, format=None):
    cursor = connections["default"].cursor()
    calls = [{"key":"settings","st":"CALL ordemfabrico_settings(%s,%s,%s)","array":False}]
    results={}
    try:
        for item in calls:
            if item.get("key") in ["settings"]:
                print([request.data.get("filter").get("agg_of_id"),request.data.get("filter").get("ordem_id"),request.data.get("filter").get("draft_ordem_id")])
                cursor.execute(item.get("st"), [request.data.get("filter").get("agg_of_id"),request.data.get("filter").get("ordem_id"),request.data.get("filter").get("draft_ordem_id")])
                #results[item.get("key")] = fetchall(cursor) if item.get("array") else fetchone(cursor)
                results = fetchall(cursor) if item.get("array") else fetchone(cursor)
        response = {"status": "success", "rows": results}
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

#endregion

#region INTERNAL METHODS


def getFormulacaoVersao(data,formulacao_id,cursor):
    f = Filters({
        "group": data.get("group_name"),
        "subgroup": data.get("subgroup_name"),
        "produto": data.get("produto_id"),
        "artigo": data.get("artigo_id")
    })
    f.where()
    f.add(f'pf.group_name {f.nullValue("group","=:group")}',True )
    f.add(f'pf.subgroup_name {f.nullValue("subgroup","=:subgroup")}',True )
    f.add(f'pf.produto_id {f.nullValue("produto","=:produto")}',True )
    f.add(f'pf.artigo_id {f.nullValue("artigo","=:artigo")}',True )
    f.value("and")
    rows = db.executeSimpleList(lambda: (f'SELECT IFNULL(MAX(versao),0)+1 AS mx FROM producao_formulacao pf {f.text}'), cursor, f.parameters).get("rows")
    if rows is not None and len(rows)>0:
        return rows[0].get("mx")
    return 1

def checkFormulacao(data,formulacao_id,cursor):
    f = Filters({
        "id": formulacao_id,
        # "des": data.get("designacao"),
        "group": data.get("group_name"),
        "subgroup": data.get("subgroup_name"),
        "produto": data.get("produto_id"),
        "artigo": data.get("artigo_id")
    })
    f.where()
    f.add(f'pf.id = :id', lambda v:(v!=None) )
    # f.add(f'pf.designacao = :des',True )
    f.add(f'pf.group_name {f.nullValue("group","=:group")}',True )
    f.add(f'pf.subgroup_name {f.nullValue("subgroup","=:subgroup")}',True )
    f.add(f'pf.produto_id {f.nullValue("produto","=:produto")}',True )
    f.add(f'pf.artigo_id {f.nullValue("artigo","=:artigo")}',True )
    f.value("and")
    exists = db.exists("producao_formulacao pf", f, cursor).exists
    return exists

def checkFormulacaoIsInUse(formulacao_id,agg_of_id,cursor):
    f = Filters({"id": formulacao_id,"agg_id":agg_of_id})
    f.where()
    f.add(f't.formulacao_id = :id', True )
    if agg_of_id:
         f.add(f't.id <> :agg_id', True )
    f.value("and")
    exists1 = db.exists("producao_tempaggordemfabrico t", f, cursor).exists
    if agg_of_id:
        f.remove(1)
        f.add(f't.agg_of_id <> :agg_id', True )
        f.value("and")
    exists2 = db.exists("producao_formulacao_plan t", f, cursor).exists
    return exists1 and exists2




def getNonwovensVersao(data,nonwovens_id,cursor):
    f = Filters({
        "produto": data.get("produto_id")
    })
    f.where()
    f.add(f'pf.produto_id {f.nullValue("produto","=:produto")}',True )
    f.value("and")
    rows = db.executeSimpleList(lambda: (f'SELECT IFNULL(MAX(versao),0)+1 AS mx FROM producao_artigononwovens pf {f.text}'), cursor, f.parameters).get("rows")
    if rows is not None and len(rows)>0:
        return rows[0].get("mx")
    return 1

def checkNonwovens(data,nonwovens_id,cursor):
    f = Filters({
        "id": nonwovens_id,
        "produto": data.get("produto_id"),
    })
    f.where()
    f.add(f'pf.id = :id', lambda v:(v!=None) )
    f.add(f'pf.produto_id {f.nullValue("produto","=:produto")}',True )
    f.value("and")
    exists = db.exists("producao_artigononwovens pf", f, cursor).exists
    return exists

def checkNonwovensIsInUse(nonwovens_id,agg_of_id,cursor):
    f = Filters({"id": nonwovens_id,"agg_id":agg_of_id})
    f.where()
    f.add(f't.nonwovens_id = :id', True )
    if agg_of_id:
         f.add(f't.id <> :agg_id', True )
    f.value("and")
    exists1 = db.exists("producao_tempaggordemfabrico t", f, cursor).exists
    # if agg_of_id:
    #     f.remove(1)
    #     f.add(f't.agg_of_id <> :agg_id', True )
    #     f.value("and")
    # exists2 = db.exists("producao_formulacao_plan t", f, cursor).exists
    return exists1 # and exists2










def getPaletizacaoVersao(data,paletizacao_id,cursor):
    f = Filters({
        "cliente": data.get("cliente_cod"),
        "artigo": data.get("artigo_cod")
    })
    f.where()
    f.add(f'pf.artigo_cod {f.nullValue("artigo","=:artigo")}',True )
    f.add(f'pf.cliente_cod {f.nullValue("cliente","=:cliente")}',True )
    f.value("and")
    rows = db.executeSimpleList(lambda: (f'SELECT IFNULL(MAX(versao),0)+1 AS mx FROM producao_paletizacao pf {f.text}'), cursor, f.parameters).get("rows")
    if rows is not None and len(rows)>0:
        return rows[0].get("mx")
    return 1

def checkPaletizacao(data,paletizacao_id,cursor):
    f = Filters({
        "id": paletizacao_id,
        "artigo": data.get("artigo_cod"),
        "cliente": data.get("cliente_cod")
    })
    f.where()
    f.add(f'pf.id = :id', lambda v:(v!=None) )
    # f.add(f'pf.designacao = :des',True )
    f.add(f'pf.cliente_cod {f.nullValue("cliente","=:cliente")}',True )
    f.add(f'pf.artigo_cod {f.nullValue("artigo","=:artigo")}',True )
    f.value("and")
    exists = db.exists("producao_paletizacao pf", f, cursor).exists
    return exists

def checkPaletizacaoIsInUse(paletizacao_id,of_id,cursor):
    f = Filters({"id": paletizacao_id,"of_id":of_id})
    f.where()
    f.add(f't.paletizacao_id = :id', True )
    if of_id:
         f.add(f't.id <> :of_id', True )
    f.value("and")
    exists1 = db.exists("producao_tempordemfabrico t", f, cursor).exists
    return exists1

def checkAgg(ofabrico_id,ofabrico_cod,cursor):
    if ofabrico_id is None:
        f = Filters({"cod": ofabrico_cod})
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
        f = Filters({"id": ofabrico_id})
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
        return {"status":"success"}
        if (status==None):
            return {"status": "error", "title": "Erro ao Guardar a Ordem de Fabrico!","subTitle":"Não existe Ordem de Produção Agregada."}
        elif (status==0):
            return {"status":"success"}
        else:
            return {"status": "error", "title": "Erro ao Guardar a Ordem de Fabrico!","subTitle":"O planeamento da Ordem de Fabrico Já se encontra Fechado."}

def computeLinearMeters(data):
    artigo = data["artigo"] if "artigo" in data else data
    if artigo is not None:
        t = (float(artigo['artigo_thickness'])/1000)
        D1 = float(artigo['artigo_diam'] if "artigo_diam" in artigo else artigo["artigo_diam_ref"])
        d1 = float(artigo['artigo_core']) * 25.4
        l = (( math.pi * ( (D1/2)**2 - (d1/2)**2 ) ) / t) / 1000
        nvoltas = (D1 - d1) / ( 2 * t )
        return {
            "qty_encomenda":artigo['qty_item'] if 'qty_item' in artigo else data['qty_item'] if "qty_item" in data else artigo["qty_encomenda"],
            "linear_meters":l,
            "n_voltas":nvoltas,
            "sqm_bobine":(l*float(artigo['artigo_width'] if "artigo_width" in artigo else artigo["artigo_lar"]))/1000
        }
    return None

def addProduto(produto_cod,cursor):
        if produto_cod is not None:       
            f = Filters({"produto_cod": produto_cod.lower().strip() })
            f.where()
            f.add(f'lower(produto_cod) = :produto_cod', True)
            f.value("and")
            produtoId = db.executeSimpleList(lambda: (f'SELECT id from producao_produtos {f.text}'), cursor, f.parameters)['rows']
            if len(produtoId)>0:
                return produtoId[0]['id']
            dml = db.dml(TypeDml.INSERT, {"produto_cod":produto_cod.strip()}, "producao_produtos",None,None,False)
            db.execute(dml.statement, cursor, dml.parameters)
            return cursor.lastrowid
        return None

def addArtigo(data,main_gtin,produto_id,cursor):
        if data.get("artigo_cod") is not None and produto_id is not None:
            f = Filters({"cod": data.get("artigo_cod")})
            f.where()
            f.add(f'cod = :cod', True)
            f.value("and")
            artigoId = db.executeSimpleList(lambda: (f'SELECT id from producao_artigo {f.text}'), cursor, f.parameters)['rows']

            dta = {
            'cod': data.get('artigo_cod'),
            'des': data.get('artigo_nome'),
            'tipo': "Produto Final",
            'core': data.get('artigo_core'),
            'diam_ref': data.get('artigo_diam'),
            'formu': data.get('artigo_formu'),
            'gsm': data.get('artigo_gram'),
            'lar': data.get('artigo_width'),
            'nw1': data.get('artigo_nw1'),
            'produto': data.get('produto_cod'),
            'produto_id': produto_id,
            'thickness': data.get('artigo_thickness'),
            'nw2': data.get('artigo_nw2')
            }
            dml = None
            if len(artigoId)>0:
                dml = db.dml(TypeDml.UPDATE, dta, "producao_artigo",{"id":artigoId[0]["id"]},None,None)
                db.execute(dml.statement, cursor, dml.parameters)
                return artigoId[0]["id"]
            else:
                if data.get("artigo_gtin"):
                    dta["gtin"] = data.get("artigo_gtin")
                else:
                    dta["gtin"] = computeGtin(cursor,main_gtin)
                dml = db.dml(TypeDml.INSERT, dta, "producao_artigo",None,None)
                db.execute(dml.statement, cursor, dml.parameters)
                return cursor.lastrowid
        else:
            return None

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

def getAgg(ofabrico_id, artigo_cod, cursor):
    if ofabrico_id is not None:
        return None
    f = Filters({"id": ofabrico_id, "item_cod": artigo_cod})
    f.setParameters({}, False)
    f.where()
    f.add(f'id = :id', True)
    f.add(f'item_cod = :item_cod', True)
    f.value("and")   
    rows = db.executeSimpleList(lambda: (f'SELECT agg_of_id,agg_ofid_original FROM producao_tempordemfabrico {f.text}'), cursor, f.parameters)['rows']
    return rows[0] if len(rows)>0 else None

def addTempAggOrdemFabrico(start_date,end_date, ids, cursor):
    dta = {
        'status': 0,
        'start_prev_date':datetime.now().strftime("%Y-%m-%d %H:%M:%S") if start_date is None else start_date,
        'end_prev_date':datetime.now().strftime("%Y-%m-%d %H:%M:%S") if end_date is None else end_date
    }
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
    return None

def addTempOrdemFabrico(data,agg_id,typeofabrico,cliente_id,artigo_id,produto_id, cp, cursor):
    dta = {
        'aggregated':0,
        'agg_of_id': agg_id,
        'agg_ofid_original': agg_id,
        'of_id': data.get('ofabrico_cod'),
        'order_cod': data.get('iorder'),
        'prf_cod':data.get('prf'),
        'item_cod': data.get('artigo_cod'),
        'certificacoes': data.get('artigo_certificacoes'),
        'item_id': artigo_id,
        'produto_id': produto_id,
        'typeofabrico':typeofabrico,
        'qty_encomenda': cp.get('qty_encomenda'),
        'linear_meters': cp.get("linear_meters"),
        'n_voltas': cp.get("n_voltas"),
        'sqm_bobine': cp.get("sqm_bobine")
    }
    if cliente_id is not None:
        dta["cliente_cod"]=data.get("cliente_cod")
        dta["cliente_nome"]=data.get("cliente_nome")
    dml = db.dml(TypeDml.INSERT, dta, "producao_tempordemfabrico",None,None,False)
    dml.statement = f"""{dml.statement} ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)"""
    db.execute(dml.statement, cursor, dml.parameters)
    return cursor.lastrowid

def addCliente(data,cursor):
    if data.get("cliente_cod") is not None:
        f = Filters({"cod": data.get("cliente_cod")})
        f.where()
        f.add(f'cod = :cod', True)
        f.value("and")
        clienteId = db.executeSimpleList(lambda: (f'SELECT id,limsup,liminf from producao_cliente {f.text}'), cursor, f.parameters)['rows'] 
        if len(clienteId)>0:
            v = None
            if Decimal(data.get("artigo_diam"))<clienteId[0]["liminf"]:
                v={"liminf":data.get("artigo_diam")}
            if Decimal(data.get("artigo_diam"))>clienteId[0]["limsup"]:
                v={"limsup":data.get("artigo_diam")}
            if v is not None:
                dml = db.dml(TypeDml.UPDATE, v, "producao_cliente",{"id":clienteId[0]["id"]},None,None)
                db.execute(dml.statement, cursor, dml.parameters)
            return clienteId[0]["id"]
        dta = {
            'cod': data.get('cliente_cod'),
            'nome': data.get('cliente_nome'),
            'name': data.get('cliente_nome'),
            'abv': data.get('cliente_abv').upper(),
            "liminf":data.get("artigo_diam"),
            "limsup":data.get("artigo_diam"),
            "diam_ref":data.get("artigo_diam"),
            '`timestamp`':datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        dml = None
        dml = db.dml(TypeDml.INSERT, dta, "producao_cliente",None,None)
        db.execute(dml.statement, cursor, dml.parameters)
        return cursor.lastrowid
    else:
        return None

def addArtigoCliente(artigo_id,cliente_id,user_id,cursor):
    f = Filters({"artigo_id": artigo_id,"cliente_id": cliente_id})
    f.setParameters({}, False)
    f.where()
    f.add(f'artigo_id = :artigo_id', True)
    f.add(f'cliente_id = :cliente_id', True)
    f.value("and")
    exists = db.exists("producao_artigocliente", f, cursor).exists
    if not exists:
        dta = {
            'artigo_id': artigo_id,
            'cliente_id': cliente_id,
            'user_id':user_id,
            '`timestamp`':datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        dml = None
        dml = db.dml(TypeDml.INSERT, dta, "producao_artigocliente",None,None)
        db.execute(dml.statement, cursor, dml.parameters)

def getEncomendaSage(cod):
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

def addEncomenda(order_cod,cliente_id,user_id,cursor):
    row = getEncomendaSage(order_cod)
    if row is not None:
        dta={
            "timestamp": datetime.now(),
            "data":datetime.now(),
            "eef":row["SOHNUM_0"],
            "prf":row["PRFNUM_0"],
            "sqm":row["sqm"],
            "estado":'A',
            "num_cargas":0,
            "num_cargas_actual":0,
            "num_paletes":row["num_paletes"],
            "num_paletes_actual":0,
            "data_encomenda":row["ORDDAT_0"],
            "data_expedicao":row["SHIDAT_0"],
            "data_prevista_expedicao":row["EXTDLVDAT_0"],
            "data_solicitada":row["DEMDLVDAT_0"],
            "prazo":0,
            "user_id":user_id,
            "cliente_id":cliente_id
        }
        dml = db.dml(TypeDml.INSERT, dta, "producao_encomenda")
        dml.statement = f"{dml.statement} ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(`id`)"
        db.execute(dml.statement, cursor, dml.parameters)
        return cursor.lastrowid

#endregion

def Validar(request, format=None):
    connection = connections["default"].cursor()
    data = request.data['parameters']
    values = data['values']
    print(data)
    print(values)
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                aggStatus = checkAgg(data.get("ofabrico_id"),data.get("ofabrico_cod"),cursor) #ofabrico_cod or ofabrico_id
                if (aggStatus["status"]=="error"):
                    return Response(aggStatus)
                cp = computeLinearMeters({"artigo":values})
                produto_id = data.get("produto_id") if data.get("produto_id") is not None else addProduto(values.get("produto_cod"),cursor)
                if (produto_id is None):
                    raise Exception("O Produto não existe/não se encontra registado!")
                artigo_id = data.get("artigo_id") if data.get("artigo_id") is not None else addArtigo({**values, "artigo_cod":data.get("artigo_cod"),"artigo_nome":data.get("artigo_nome")}, data.get('main_gtin'), produto_id,cursor)
                cliente_id = addCliente({"cliente_cod":data.get("cliente_cod"),"cliente_nome":data.get("cliente_nome"),**values},cursor)
                if (artigo_id is None):
                    raise Exception("O artigo não existe/não se encontra registado!")
                if (cliente_id is not None):
                    addArtigoCliente(artigo_id,cliente_id,request.user.id,cursor)
                    order_id = addEncomenda(data.get("iorder"),cliente_id,request.user.id,cursor)
                ids = getAgg(data.get("ofabrico_id"),data.get("artigo_cod"),cursor)
                agg_id = addTempAggOrdemFabrico(data.get("start_date"),data.get("end_date"),ids,cursor)
                if (agg_id is None):
                    raise Exception("A ordem de fabrico não foi registada!")
                id = addTempOrdemFabrico(data,agg_id,values.get('typeofabrico'),cliente_id,artigo_id,produto_id,cp,cursor)
                updateMaterializedView()
        return Response({"status": "success", "success":f"""Ordem de fabrico validada com sucesso!"""})
    except Error as error:
        print(error)
        return Response({"status": "error", "title": str(error)})

def Ignorar(request, format=None):
    connection = connections["default"].cursor()
    data = request.data['parameters']
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                dml = db.dml(TypeDml.INSERT, {"cod":data.get("ofabrico_cod"),"ignorar":1}, "producao_ordemfabricodetails",None,None,False)
                dml.statement = f"""{dml.statement} ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)"""
                db.execute(dml.statement, cursor, dml.parameters)
                return cursor.lastrowid
                return Response({"status": "success", "success":f"""Ordem de fabrico ignorada com sucesso!"""})
    except Error as error:
        return Response({"status": "error", "title": str(error)})

def SaveProdutoAlt(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")    
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                if data.get("produto_alt"):
                    dml = db.dml(TypeDml.UPDATE, {"produto":data.get("produto_alt")}, "producao_artigocliente", {'artigo_id': f'=={filter.get("artigo_id")}','cliente_id': f'=={filter.get("cliente_id")}'}, None, False)
                    db.execute(dml.statement, cursor, dml.parameters)
                else:
                    return Response({"status": "error", "title": f"Não é possível alterar a designação do Produto no artigo!"})
        return Response({"status": "success", "id": None, "title": f"A designação do Produto foi alterada com Sucesso!", "subTitle": ''})
    except Error:
        return Response({"status": "error", "title": f"Erro ao Alterar a Designação do Produto no Artigo!"})







#region CHECKLISTS


def _checkArtigoCliente(artigo_id,cliente_cod, cursor):
        f = Filters({"cliente_cod":cliente_cod,"artigo_id":artigo_id})
        f.where(False,"and")
        f.add(f'pc.cod = :cliente_cod', True)
        f.add(f'pac.artigo_id = :artigo_id', True)
        f.value()
        response = db.executeSimpleList(lambda: (f"""        
            select count(*) cnt
            from producao_artigocliente pac
            join producao_cliente pc on pc.id=pac.cliente_id
            {f.text}        
        """), cursor, f.parameters)
        if len(response["rows"])>0:
            return response["rows"][0]["cnt"]
        return None
def _checkTaskItems(id, cursor):
        f = Filters({"id":id})
        f.where()
        f.add(f'(checklist_task_id = :id)', True)
        f.value("and")
        response = db.executeSimpleList(lambda: (f"""select count(*) cnt from ofabrico_checklist_items {f.text}"""), cursor, f.parameters)
        return response["rows"][0].get("cnt")
def _checkListStatus(id, cursor):
    f = Filters({"id":id})
    f.where()
    f.add(f'(tsk.id = :id)', True)
    f.value("and")
    response = db.executeSimpleList(lambda: (f"""select lst.status 
    from ofabrico_checklist lst
    join ofabrico_checklist_tasks tsk on lst.id=tsk.checklist_id
    {f.text}"""), cursor, f.parameters)
    return response["rows"][0].get("status")
def _checkTasks(id, cursor):
    f = Filters({"id":id})
    f.where()
    f.add(f'(checklist_id = :id)', True)
    f.value("and")
    response = db.executeSimpleList(lambda: (f"""select count(*) cnt from ofabrico_checklist_tasks {f.text}"""), cursor, f.parameters)
    return response["rows"][0].get("cnt")

def AvailableAggLookup(request,format):
    connection = connections["default"].cursor()
    
    if "idSelector" in request.data['filter']:
        f = Filters(request.data['filter'])
        f.setParameters({}, False)
        f.where()
        f.add(f'tagg.id = :idSelector', True)
        f.value()
        try:
            response = db.executeSimpleList(lambda: (f"""
                select tagg.id,tagg.cod,pc.status
                FROM producao_tempaggordemfabrico tagg
                LEFT JOIN producao_currentsettings pc on pc.agg_of_id=tagg.id
                {f.text}
            """), connection, f.parameters)
        except Error as error:
            print(str(error))
            return Response({"status": "error", "title": str(error)})
        return Response(response)

    
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where(False,"and")
    f.value("or")

    f2 = filterMulti(request.data['filter'], {}, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""*"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda: (f"""

        SELECT {f'{dql.columns}'} FROM (
            select tagg.id,tof.id ofid,tagg.cod,pc.status, tof.of_id,tof.order_cod,tof.prf_cod,tof.cliente_nome,tof.item_cod,prod.produto_cod 
            from producao_tempordemfabrico tof
            join producao_tempaggordemfabrico tagg on tof.agg_of_id = tagg.id
            join producao_artigo pa on pa.cod=tof.item_cod
            JOIN producao_produtos prod on pa.produto_id=prod.id
            JOIN producao_currentsettings pc on pc.agg_of_id =tagg.id
            WHERE pc.status not in (9)
            union
            select tagg.id,tof.id ofid,tagg.cod,0 status, tof.of_id,tof.order_cod,tof.prf_cod,tof.cliente_nome,tof.item_cod,prod.produto_cod
            from producao_tempordemfabrico tof
            join producao_tempaggordemfabrico tagg on tof.agg_of_id = tagg.id
            join producao_artigo pa on pa.cod=tof.item_cod
            JOIN producao_produtos prod on pa.produto_id=prod.id
            WHERE tagg.status = 0 and not exists (select 1 from producao_ordemfabricodetails po where po.cod=tof.of_id)
        ) t
        {dql.sort} {dql.limit}
    """)
    try:
        response = db.executeSimpleList(sql, connection, parameters)
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def CheckLists(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'] if "filter" in request.data else {})

    f.setParameters({
        "nome": {"value": lambda v: v.get('fnome').upper() if v.get('fnome') else None, "field": lambda k, v: f'chk.{k}'},
        "status": {"value": lambda v: v.get('fstatus'), "field": lambda k, v: f'chk.{k}'},
        "obs": {"value": lambda v: v.get('fobs').upper() if v.get('fobs') else None, "field": lambda k, v: f'lower(chk.{k})'},
        "cod": {"value": lambda v: v.get('fagg').upper() if v.get('fagg') else None, "field": lambda k, v: f'tagg.{k}'},
        **rangeP(f.filterData.get('fdata'), '`timestamp`', lambda k, v: f'DATE(`timestamp`)')
    }, True)
    f.where(False,"and")
    f.auto()
    f.value()
    f2 = filterMulti(request.data['filter'] if "filter" in request.data else {}, {}, False, "and" if f.hasFilters else "where" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""chk.*,tagg.cod agg_cod"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""
            select {c(f'{dql.columns}')} 
            from ofabrico_checklist chk
            join producao_tempaggordemfabrico tagg on chk.agg_of_id=tagg.id
            {f.text} {f2["text"]}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    try:
        response = db.executeList(sql, connection, parameters,[],None,None)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def ChecklistLookup(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({"id": {"value": lambda v: v.get('checklist_id'), "field": lambda k, v: f'{k}'}}, True)
    f.where()
    f.auto()
    f.value()

    ftasks = Filters(request.data['filter'])
    ftasks.setParameters({"checklist_id": {"value": lambda v: v.get('checklist_id'), "field": lambda k, v: f'{k}'}}, True)
    ftasks.where()
    ftasks.auto()
    ftasks.value()

    f2 = filterMulti(request.data['filter'], {
        # 'fartigo': {"keys": ['artigo_cod', 'artigo_des'], "table": 't.'}
    }, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""*"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda: (f"""select {f'{dql.columns}'} from ofabrico_checklist {f.text} {f2["text"]} {dql.sort} {dql.limit}""")
    sqltasks = lambda: (f"""select {f'{dql.columns}'} from ofabrico_checklist_tasks {ftasks.text} {dql.sort}""")
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    try:
        response = db.executeSimpleList(sql, connection, parameters)
        responseTasks = db.executeSimpleList(sqltasks, connection, ftasks.parameters)
        response["tasks"] = responseTasks
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def newChecklist(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")   
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                dml = db.dml(TypeDml.INSERT, {
                    'nome':f"""(select n from (select CONCAT('CHK-',DATE_FORMAT(NOW(), "%%Y%%m%%d"),'-', LPAD(IFNULL(max(num),0)+1,4,'0')) n from ofabrico_checklist where DATE(`timestamp`)=DATE(NOW())) t)""",
                    '`timestamp`':f"NOW()",
                    "user_id":request.user.id,
                    "obs":data.get("obs"),
                    "status":data.get("status"),
                    "agg_of_id":data.get("agg").get("id"),
                    'num':f"(select n from (select IFNULL(max(num),0)+1 n from ofabrico_checklist where DATE(`timestamp`)=DATE(NOW())) t)"
                }, "ofabrico_checklist", None, None, False,["nome","`timestamp`","num"])
                db.execute(dml.statement, cursor, dml.parameters)
                lastid = cursor.lastrowid
        return Response({"status": "success", "id": lastid, "title": f"Checklist criada com sucesso!", "subTitle": ''})
    except Error as error:
        return Response({"status": "error", "title": str(error)})

def updateChecklist(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")   
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                dml = db.dml(TypeDml.UPDATE, {
                    "obs":data.get("obs"),
                    "status":data.get("status")
                }, "ofabrico_checklist", {"id":f"""=={data.get("id")}"""}, None, False,[])
                db.execute(dml.statement, cursor, dml.parameters)
                lastid = cursor.lastrowid
        return Response({"status": "success", "id": lastid, "title": f"Checklist alterada com sucesso!", "subTitle": ''})
    except Error as error:
        return Response({"status": "error", "title": str(error)})

def newTaskTrocaEtiquetas(request,format=None):
    cod="TRE"
    _type=1
    data = request.data.get("parameters").get("values").get("parameters")
    other_data = request.data.get("parameters").get("values")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                chk01 = _checkArtigoCliente(data.get("artigo").get("id"),data.get("cliente").get("BPCNUM_0"),cursor)
                if datetime.strptime(data.get("data_imputacao"), '%Y-%m-%d').date()>datetime.today().date():
                    return Response({"status": "error", "title": f"A data de imputação não pode ser maior que a data atual!"})                
                if chk01 == 0:
                    return Response({"status": "error", "title": f"O artigo e cliente não estão associados!"})
                dml = db.dml(TypeDml.INSERT, {
                    "parameters":json.dumps(data, ensure_ascii=False),
                    "checklist_id":other_data.get("checklist_id"),
                    "runtype":other_data.get("runtype"),
                    "appliesto":other_data.get("appliesto"),
                    "mode":other_data.get("mode"),
                    "`timestamp`":datetime.today(),
                    "status":other_data.get("status"),
                    "subtype":other_data.get("subtype") if other_data.get("subtype") is not None else "1",
                    "type":_type,
                    "user_id":request.user.id,
                    "nome":f"""(SELECT CONCAT('TRE-',YEAR(CURRENT_DATE()),LPAD(MONTH(CURRENT_DATE()),2,'0'),LPAD(DAY(CURRENT_DATE()),2,'0'),'-',LPAD(n,3,'0')) FROM (SELECT COUNT(*)+1 n FROM ofabrico_checklist_tasks oct where oct.type=1 and YEAR(`timestamp`)=YEAR(CURRENT_DATE())) t)"""
                }, "ofabrico_checklist_tasks", None, None, False,["nome"])
                print(dml.statement)
                print(dml.parameters)
                db.execute(dml.statement, cursor, dml.parameters)
        return Response({"status": "success", "id":None, "title": f"Tarefa criada com sucesso!", "subTitle": ''})
    except Error as error:
        return Response({"status": "error", "title": str(error)})

def updateTaskTrocaEtiquetas(request,format=None):
    data = request.data.get("parameters").get("values").get("parameters")
    other_data = request.data.get("parameters").get("values")
    filter = request.data.get("filter")
    if filter.get("id") is None:
        return Response({"status": "error", "title": f"O id da tarefa não é válido!"})
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                chk = _checkTaskItems(filter.get("id"),cursor)
                if chk > 0:
                    return Response({"status": "error", "title": f"A tarefa já tem items associados!"})
                chk = _checkListStatus(filter.get("id"),cursor)
                if chk == 9:
                    return Response({"status": "error", "title": f"A Lista de tarefas já se encontra finalizada!"})
                if datetime.strptime(data.get("data_imputacao"), '%Y-%m-%d').date()>datetime.today().date():
                    return Response({"status": "error", "title": f"A data de imputação não pode ser maior que a data atual!"})
                chk = _checkArtigoCliente(data.get("artigo").get("id"),data.get("cliente").get("BPCNUM_0"),cursor)                    
                if chk == 0:
                    return Response({"status": "error", "title": f"O artigo e cliente não estão associados!"})
                dml = db.dml(TypeDml.UPDATE, {
                    "parameters":json.dumps(data, ensure_ascii=False),
                    "runtype":other_data.get("runtype"),
                    "appliesto":other_data.get("appliesto"),
                    "mode":other_data.get("mode"),
                    "status":other_data.get("status"),
                    "subtype":other_data.get("subtype") if other_data.get("subtype") is not None else "1",
                    "user_id":request.user.id,
                }, "ofabrico_checklist_tasks", {"id":f"""=={filter.get("id")}"""}, None, False,[])
                db.execute(dml.statement, cursor, dml.parameters)
        return Response({"status": "success", "id":None, "title": f"Tarefa alterada com sucesso!", "subTitle": ''})
    except Error as error:
        return Response({"status": "error", "title": str(error)})

def TasksAvailableLookup(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where(False,"and")
    f.add(f"""(ct.`type` = :type1 and ct.parameters->'$.artigo.lar'= :lar and CAST(ct.parameters->'$.artigo.core' AS UNSIGNED) = :core)""", True)
    #f.add(f"""(ct.`type` = :type1 and ct.parameters->'$.artigo.cod'<> :artigo_cod and ct.parameters->'$.artigo.lar'= :lar and CAST(ct.parameters->'$.artigo.core' AS UNSIGNED) = :core)""", True)
    f.value("or")

    f2 = filterMulti(request.data['filter'], {
        # 'fartigo': {"keys": ['artigo_cod', 'artigo_des'], "table": 't.'}
    }, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""*"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda: (f"""
        SELECT {f'{dql.columns}'} 
        FROM ofabrico_checklist cl
        JOIN ofabrico_checklist_tasks ct on cl.id=ct.checklist_id
        where cl.`status`=1 and ct.`status`=1 and
        not exists(
            select 1 
            from ofabrico_checklist_items t_oci  
            join ofabrico_checklist_tasks t_ct on t_oci.checklist_task_id=t_ct.id
            where t_oci.bobine_id={request.data['filter'].get("bobine_id")} and t_ct.type=%(type1)s and t_ct.status=1
        )
        {f.text} {f2["text"]} {dql.sort} {dql.limit}
    """)
    print(f"""
        SELECT {f'{dql.columns}'} 
        FROM ofabrico_checklist cl
        JOIN ofabrico_checklist_tasks ct on cl.id=ct.checklist_id
        where cl.`status`=1 and
        not exists(
            select 1 
            from ofabrico_checklist_items t_oci  
            join ofabrico_checklist_tasks t_ct on t_oci.checklist_task_id=t_ct.id
            where t_oci.bobine_id={request.data['filter'].get("bobine_id")} and t_ct.type=%(type1)s
        )
        {f.text} {f2["text"]} {dql.sort} {dql.limit}
    """)
    print(parameters)
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    try:
        response = db.executeSimpleList(sql, connection, parameters)
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def ChecklistItemsLookup(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({"checklist_id": {"value": lambda v: v.get('checklist_id'), "field": lambda k, v: f'oci.{k}'}}, True)
    f.where()
    f.auto()
    f.value()

    f2 = filterMulti(request.data['filter'], {
        # 'fartigo': {"keys": ['artigo_cod', 'artigo_des'], "table": 't.'}
    }, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""oci.*,oct.type,oct.subtype,oct.agg_of_id,oct.of_id,oct.parameters"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""select {c(f'{dql.columns}')} 
        from ofabrico_checklist_items oci
        join ofabrico_checklist_tasks oct on oct.id=oci.checklist_task_id        
        {f.text} {f2["text"]} {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}"""
    )
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    try:
        response = db.executeList(sql, connection, parameters,[],None,None)
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def DeleteTask(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")

    def delete(id,cursor):
        dml = db.dml(TypeDml.DELETE,None,"ofabrico_checklist_tasks",{"id":f'=={id}',"status":f'!==9'},None,False)
        db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                chk = _checkListStatus(filter.get("id"),cursor)
                if chk == 9:
                    return Response({"status": "error", "title": f"A Lista de tarefas já se encontra finalizada!"})
                exists = _checkTaskItems(filter.get("id"),cursor)
                if exists==0:
                    delete(filter.get("id"),cursor)
                else:
                    return Response({"status": "error", "title": f"Não é possível eliminar a tarefa!"})     
        return Response({"status": "success", "title": "Tarefa eliminada com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def DeleteChecklist(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")

    def delete(id,cursor):
        dml = db.dml(TypeDml.DELETE,None,"ofabrico_checklist",{"id":f'=={id}',"status":f'!==9'},None,False)
        db.execute(dml.statement, cursor, dml.parameters)
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                exists = _checkTasks(filter.get("id"),cursor)
                if exists==0:
                    delete(filter.get("id"),cursor)
                else:
                    return Response({"status": "error", "title": f"Não é possível eliminar a lista!"})     
        return Response({"status": "success", "title": "Lista eliminada com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

#endregion