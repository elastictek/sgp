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
        if len(response["rows"])>0:
            return response["rows"][0]
        return None


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def MateriasPrimasList(request, format=None):
    connection = connections[connMssqlName].cursor()    
    #connection = connections[connGatewayName].cursor()    
    type = int(request.data['filter']['type'] if 'type' in request.data['filter'] else -1)
    loc = request.data['filter']['loc'] if 'loc' in request.data['filter'] else -1
    f = Filters(request.data['filter'])
    f.setParameters({
        # "picked": {"value": lambda v: None if "fpicked" not in v or v.get("fpicked")=="ALL" else f'=={v.get("fpicked")}' , "field": lambda k, v: f'{k}'},
        "VCRNUM_0": {"value": lambda v: v.get('fvcr'), "field": lambda k, v: f'ST."{k}"'},
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
    dql = dbmssql.dql(request.data, False,False,[{"column":"CREDATTIM_0", "direction":"DESC"}])
    
    sgpAlias = dbmssql.dbAlias.get("sgp")
    sageAlias = dbmssql.dbAlias.get("sage")

    typeFilter=""
    if type==1:
        typeFilter = f""" and (LOWER(mprima."ITMDES1_0") LIKE 'nonwo%%' AND LOWER(mprima."ITMDES1_0") LIKE '%%gsm%%' AND (mprima."ACCCOD_0" = 'PT_MATPRIM')) """
    elif type==2:
        typeFilter = f""" and (LOWER(mprima."ITMDES1_0") LIKE 'core%%' AND (mprima."ACCCOD_0" = 'PT_EMBALAG')) """
    elif type==3:
        typeFilter = f""" and ((LOWER(mprima."ITMDES1_0") NOT LIKE 'nonwo%%' AND LOWER(mprima."ITMDES1_0") NOT LIKE 'core%%') AND (mprima."ACCCOD_0" = 'PT_MATPRIM')) """
    elif type==4:
        typeFilter = f""" and (ST."ITMREF_0" LIKE 'R000%%' and LOWER(mprima."ITMDES1_0") LIKE 'reciclado%%') """

    locFilter = f""" and "LOC_0" in ('{loc}') """ if loc!="-1" else ""

    cols = f'''*'''
    # sql = lambda p, c, s: (
    #     f"""

    #         SELECT {c(f'{cols}')} FROM(
    #             SELECT
    #             ST."ROWID",ST."CREDATTIM_0",ST."ITMREF_0",ST."LOT_0",ST."LOC_0",ST."VCRNUM_0",
    #             SUM (ST."QTYPCU_0") OVER (PARTITION BY ST."ITMREF_0",ST."LOT_0",ST."VCRNUM_0") QTY_SUM,
    #             ST."QTYPCU_0",ST."PCU_0",mprima."ITMDES1_0"
    #             FROM {sageAlias}."STOJOU" ST
    #             JOIN {sageAlias}."ITMMASTER" mprima on ST."ITMREF_0"= mprima."ITMREF_0"
    #             where 1=1
    #             {locFilter} 
    #             {typeFilter}
    #             {f.text} {f2["text"]} {flocation.text}
    #             --AND NOT EXISTS(SELECT 1 FROM "SGP-PROD".loteslinha ll WHERE ll.lote_id=ST."ROWID" AND ll.status<>0)

    #         ) t
    #         where (QTY_SUM > 0)
    #         {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
    #     """
    # )



    sql = lambda p, c, s: (
        f"""

        SELECT {c(f'{cols}')} FROM(
        SELECT
        ST."ROWID",ST."CREDATTIM_0",ST."ITMREF_0",ST."LOT_0",ST."LOC_0",ST."VCRNUM_0",
        SUM (ST."QTYPCU_0") OVER (PARTITION BY ST."ITMREF_0",ST."LOT_0",ST."VCRNUM_0") QTY_SUM,
        ST."QTYPCU_0",ST."PCU_0",mprima."ITMDES1_0"
        FROM ELASTICTEK.STOCK STK
        JOIN ELASTICTEK.STOJOU ST ON ST.ITMREF_0=STK.ITMREF_0 AND ST.LOT_0=STK.LOT_0 AND ST.LOC_0=STK.LOC_0
        JOIN ELASTICTEK.ITMMASTER mprima on ST."ITMREF_0"= mprima."ITMREF_0"
        WHERE 1=1 
        {typeFilter}
        {f.text} {f2["text"]}
        ) t
        where (QTY_SUM > 0)
        {flocation.text} {locFilter}
        {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}        
        """
    )

    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sage"])
    print("----------------------------")
    print("sql")
    response = dbmssql.executeList(sql, connection, parameters, [])
    return Response(response)


#region NONWOVENS

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def NWListLookup(request, format=None):
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'cs.status = :cs_status', lambda v:(v!=None))
    f.add(f'lnw.status = :status', lambda v:(v!=None))
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                SELECT lnw.* 
                FROM lotesnwlinha lnw
                join producao_currentsettings cs on cs.agg_of_id = lnw.agg_of_id
                {f.text}
                {dql.sort} {dql.limit}
            """
        ), cursor, parameters)
        return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def NWList(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({
        **rangeP(f.filterData.get('fdata'), 't_stamp', lambda k, v: f'DATE(lnw.{k})'),
        # **rangeP(f.filterData.get('ftime'), ['inico','fim'], lambda k, v: f'TIME(pbm.{k})', lambda k, v: f'TIMEDIFF(TIME(pbm.{k[1]}),TIME(pbm.{k[0]}))'),
        "n_lote": {"value": lambda v: v.get('flote'), "field": lambda k, v: f'lnw.{k}'},
        "fof": {"value": lambda v: v.get('fof')},
        "qty_lote": {"value": lambda v: v.get('fqty'), "field": lambda k, v: f'lnw.{k}'},
        "qty_reminder": {"value": lambda v: v.get('fqty_reminder'), "field": lambda k, v: f'lnw.{k}'},
        "qty_consumed": {"value": lambda v: v.get('fqty_consumed'), "field": lambda k, v: f'lnw.{k}'},
        "type": {"value": lambda v: v.get('ftype'), "field": lambda k, v: f'lnw.{k}'},
        "largura": {"value": lambda v: v.get('flargura'), "field": lambda k, v: f'lnw.{k}'},
        "comp": {"value": lambda v: v.get('fcomp'), "field": lambda k, v: f'lnw.{k}'},
        "type": {"value": lambda v: f"=={v.get('agg_of_id')}" if (v.get("type")=="1" and v.get('agg_of_id') is not None) else None, "field": lambda k, v: f'acs.agg_of_id'},
        # "duracao": {"value": lambda v: v.get('fduracao'), "field": lambda k, v: f'(TIME_TO_SEC(pbm.{k})/60)'},
        # "area": {"value": lambda v: v.get('farea'), "field": lambda k, v: f'pbm.{k}'},
        # "diam": {"value": lambda v: v.get('fdiam'), "field": lambda k, v: f'pbm.{k}'},
        # "core": {"value": lambda v: v.get('fcore'), "field": lambda k, v: f'pf.{k}'},
        # "comp": {"value": lambda v: v.get('fcomp'), "field": lambda k, v: f'pbm.{k}'},
        # "valid": {"value": lambda v: f"=={v.get('valid')}" if v.get("valid") is not None and v.get("valid") != "-1" else None, "field": lambda k, v: f'pbm.{k}'},
        # "type": {"value": lambda v: f"=={v.get('agg_of_id')}" if (v.get("type")=="1" and v.get('agg_of_id') is not None) else None, "field": lambda k, v: f'acs.agg_of_id'},
    }, True)
    f.where()
    f.auto(['fof'])
    f.add(f"JSON_SEARCH(acs.ofs, 'all', :fof, '', '$[*].of_cod') is not null", lambda v:(v!=None))
    f.value()

    f2 = filterMulti(request.data['filter'], {
        'fartigo': {"keys": ['artigo_cod', 'artigo_des'], "table":"lnw."}
    }, False, "and" if f.hasFilters else "where",False) 

        
    parameters = {**f.parameters,**f2["parameters"]}

    dql = db.dql(request.data, False)
    cols = f"""lnw.*,acs.ofs ->> "$[*].of_cod" ofs """
    dql.columns=encloseColumn(cols,False)

    sql = lambda p, c, s: (
        f""" 
           SELECT {c(f'{dql.columns}')}
            FROM lotesnwlinha lnw
            join audit_currentsettings acs on acs.id=lnw.audit_cs_id
           {f.text} {f2["text"]}
           {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    print("-----------------------------------------------------------")
    print(sql)
    print(parameters)
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    response = db.executeList(sql, connection, parameters)
    return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def DeleteNWItem(request, format=None):
    filter = request.data.get("filter")
    return Response({"status": "error", "title": "TODO"})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SaveNWItems(request, format=None):
    data = request.data.get("parameters")

    def saveItems(data,cursor):
        nws = json.loads(acs["nonwovens"])
        for idx, item in enumerate([d for d in data["rows"] if "notValid" in d and d['notValid']==1]):
            if item["type"]==0 and nws["nw_cod_inf"]!=item["artigo_cod"]:
                raise ValueError(f"O artigo de Nonwoven Inferior {item['n_lote']} não corresponde ao definido na ordem de fabrico!")
            if item["type"]==1 and nws["nw_cod_sup"]!=item["artigo_cod"]:
                raise ValueError(f"O artigo de Nonwoven Superior {item['n_lote']} não corresponde ao definido na ordem de fabrico!")
            dml = db.dml(TypeDml.INSERT, {
                "lote_id":item["lote_id"], 
                "qty_lote":item["qty_lote"],
                "artigo_des":item["artigo_des"],
                "artigo_cod":item["artigo_cod"], 
                "type":item["type"], 
                "t_stamp":item["t_stamp"],
                "n_lote":item["n_lote"],
                "status":1,
                "vcr_num":item["vcr_num"],
                "largura":item["largura"],
                "comp":item["comp"],
                "qty_reminder":item["qty_reminder"],
                "qty_consumed":item["qty_consumed"],
                "audit_cs_id":acs["id"],
                "inuse":0,
                "queue":f"""(SELECT q FROM (SELECT ifnull(max(queue),0)+1 q FROM sistema.lotesnwlinha where status=1 and type={item["type"]}) t)""",
                "agg_of_id":acs["agg_of_id"],
                "user_id":request.user.id}, 
                "lotesnwlinha",None,None,False,["queue"])
            dml.statement = f"""
                {dml.statement}
                ON DUPLICATE KEY UPDATE 
                    status = VALUES(status),
                    user_id = VALUES(user_id)
            """
            print(dml.statement)
            print(dml.parameters)
            db.execute(dml.statement, cursor, dml.parameters)
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                acs = inProduction(data,cursor)
                if acs is None:
                    return Response({"status": "error", "title": "Não existe nenhuma ordem de fabrico a decorrer!"})
                else:
                    saveItems(data,cursor)
                    return Response({"status": "success", "title": "Registos guardados com Sucesso!", "subTitle":f'{None}'})
    except Exception as error:

        return Response({"status": "error", "title": str(error)})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def UpdateNW(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    def checkNW(id, cursor):
        f = Filters({"status": 1,"id":id})
        f.where()
        f.add(f'status = :status', True)
        f.add(f'id = :id', True)
        f.value("and")
        response = db.executeSimpleList(lambda: (f"""
            select id, type 
            from lotesnwlinha
            {f.text} limit 1
        """), cursor, f.parameters)
        print(f.parameters)
        if len(response["rows"])>0:
            return response["rows"][0]
        return None
    
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                nwd = checkNW(filter["id"],cursor)
                if (nwd is not None):
                    dml = db.dml(TypeDml.UPDATE,{**data,"user_id":request.user.id},"lotesnwlinha",{"id":f'=={nwd["id"]}'},None,False)
                    db.execute(dml.statement, cursor, dml.parameters)
                    if "status" in data and data["status"]==0:
                        dml = db.dml(TypeDml.UPDATE,{"queue":"queue=(case when (ifnull(queue,0)-1) < 0 then 1 else (ifnull(queue,1)-1) end)","user_id":request.user.id},"lotesnwlinha",{"status":f'==1',"type":f'=={nwd["type"]}'},None,False,["queue"])
                        db.execute(dml.statement, cursor, dml.parameters)
                else:
                    return Response({"status": "error", "title": f"Não é possível alterar o estado do lote!", "subTitle":"O lote está fechado ou não existe!"})     
        return Response({"status": "success", "title": "Lote alterado Sucesso!", "subTitle":f'{None}'})
    except Error:
        return Response({"status": "error", "title": "Erro ao alterar lote!"})







#endregion

#region GRANULADO

@api_view(['POST'])
@renderer_classes([JSONRenderer])
def GranuladoList(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])

    f.setParameters({
        "type": {"value": lambda v: f"=={v.get('agg_of_id')}" if (v.get("type")=="1" and v.get('agg_of_id') is not None) else None, "field": lambda k, v: f'agg_of_id'},
       # **rangeP(f.filterData.get('forderdate'), 'ORDDAT_0', lambda k, v: f'"enc"."{k}"'),
       #**rangeP(f.filterData.get('SHIDAT_0'), 'SHIDAT_0', lambda k, v: f'"enc"."{k}"'),
       #"LASDLVNUM_0": {"value": lambda v: v.get('LASDLVNUM_0').lower() if v.get('LASDLVNUM_0') is not None else None, "field": lambda k, v: f'lower("enc"."{k}")'},
       #"status": {"value": lambda v: statusFilter(v.get('ofstatus')), "field": lambda k, v: f'"of"."{k}"'}
    }, True)
    f.where(False,"and")
    f.auto()
    f.value()
    parameters = {**f.parameters}
    dql = db.dql(request.data, False)
    cols = f"""t.*,acs.ofs ->> "$[*].of_cod" ofs"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""
            select 
                {c(f'{dql.columns}')}
            from(
            select distinct 
            t.type_mov,t.artigo_cod,t.n_lote,t.t_stamp,t.qty_lote,t.vcr_num,t.artigo_des,t.max_order,t.`order`,t.group_id,t.loteslinha_id,t.agg_of_id,t.audit_cs_id,t.qty_reminder
            ,(select GROUP_CONCAT(tld.doser) dosers from lotesdoserslinha tld where tld.loteslinha_id=t.loteslinha_id) dosers
            from(
            select ld.id,ld.type_mov,ld.artigo_cod,ld.n_lote,ld.t_stamp,ll.qty_lote,ll.vcr_num,ll.artigo_des,
            MAX(ld.`order`) OVER (PARTITION BY ld.artigo_cod,ld.n_lote,ld.loteslinha_id) max_order,
            ld.`order`,ld.group_id,ld.loteslinha_id, ld.agg_of_id, ld.audit_cs_id,ll.qty_reminder
            from lotesdoserslinha ld
            JOIN lotesgranuladolinha ll on ll.id=ld.loteslinha_id
            WHERE ld.type_mov in (0,1,2) AND ld.closed=0 AND ld.`status`<>0
            ) t
            where `order` = max_order
            {f.text}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
            ) t
            join audit_currentsettings acs on acs.id=t.audit_cs_id
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    try:
        response = db.executeList(sql, connection, parameters)
    except Exception as error:
        print(error)
        return Response({"status": "error", "title": "Erro ao remover lote!"})
    return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SaveGranuladoItems(request, format=None):
    data = request.data.get("parameters")
   
    def saveItems(data,cursor):
        #nws = json.loads(acs["nonwovens"])
        for idx, item in enumerate([d for d in data["rows"] if "notValid" in d and d['notValid']==1]):
            #if item["type"]==0 and nws["nw_cod_inf"]!=item["artigo_cod"]:
            #    raise ValueError(f"O artigo de Nonwoven Inferior {item['n_lote']} não corresponde ao definido na ordem de fabrico!")
            #if item["type"]==1 and nws["nw_cod_sup"]!=item["artigo_cod"]:
            #    raise ValueError(f"O artigo de Nonwoven Superior {item['n_lote']} não corresponde ao definido na ordem de fabrico!")

            dml = db.dml(TypeDml.INSERT, {
                 "lote_id":item["lote_id"], 
                 "qty_lote":item["qty_lote"],
                 "artigo_des":item["artigo_des"],
                 "artigo_cod":item["artigo_cod"], 
                 "type_mov":item["type_mov"], 
                 "t_stamp":item["t_stamp"],
                 "n_lote":item["n_lote"],
                 "status":-1,
                 "vcr_num":item["vcr_num"],
                 "qty_reminder":item["qty_reminder"],
                 "obs": item["obs"] if "obs" in item else "",
                 "user_id":request.user.id}, 
                 "lotesgranuladolinha",None,None,False)
            dml.statement = f"""
                {dml.statement}
                ON DUPLICATE KEY UPDATE 
                    status = VALUES(status),
                    user_id = VALUES(user_id)
            """
            print(dml.statement)
            print(dml.parameters)
            db.execute(dml.statement, cursor, dml.parameters)
            lastid = cursor.lastrowid
            linha_order = lastid*100000000
            reciclado = 0
            if item["artigo_cod"].startswith("R000"):
                reciclado = 1
            lote_id =  linha_order if reciclado==1 else item["lote_id"]
            dml = db.dml(TypeDml.UPDATE,{"`order`":linha_order,"lote_id":lote_id},"lotesgranuladolinha",{"id":f'=={lastid}'},None,False)
            db.execute(dml.statement, cursor, dml.parameters)

            #DOSERS ADD
            doser_order = linha_order
            for doser in item["dosers"].split(','):
                dml = db.dml(TypeDml.INSERT, {
                    "t_stamp":item["t_stamp"],
                    "doser":doser,
                    "`order`":doser_order,
                    "loteslinha_id":lastid,
                    "type_mov":item["type_mov"], 
                    "status":-1,
                    "artigo_cod":item["artigo_cod"],
                    "n_lote":item["n_lote"],
                    "lote_id":lote_id,
                    "group_id":item["group_id"],
                    "qty_consumed":0,
                    "audit_cs_id":acs["id"],
                    "agg_of_id":acs["agg_of_id"],
                    "closed":0,
                    "fixing":0,
                    "user_id":request.user.id
                    },"lotesdoserslinha",None,None,False)
                dml.statement = f"""
                    {dml.statement}
                    ON DUPLICATE KEY UPDATE 
                        status = VALUES(status),
                        user_id = VALUES(user_id)
                """
                db.execute(dml.statement, cursor, dml.parameters)
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                acs = inProduction(data,cursor)
                if acs is None:
                    return Response({"status": "error", "title": "Não existe nenhuma ordem de fabrico a decorrer!"})
                else:
                    saveItems(data,cursor)
                    return Response({"status": "success", "title": "Registos guardados com Sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        print("eeeeeeeeeeeeeeeeee")
        print(error)
        return Response({"status": "error", "title": str(error)})


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def GranuladoListLookup(request, format=None):
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'cs.status = :cs_status', lambda v:(v!=None))
    f.add(f'll.type_mov = :type_mov', lambda v:(v!=None))
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False)
    with connections["default"].cursor() as cursor:
        print(f"""
                SELECT distinct ll.*
                FROM lotesgranuladolinha ll
                join lotesdoserslinha ld on ld.loteslinha_id=ll.id
                join producao_currentsettings cs on cs.agg_of_id = ld.agg_of_id
                where (select type_mov from lotesgranuladolinha tll order by `order` desc limit 1)=1
                {f.text}
                {dql.sort} {dql.limit}
            """)
        response = db.executeSimpleList(lambda: (
            f"""
                SELECT distinct ll.*
                FROM lotesgranuladolinha ll
                join lotesdoserslinha ld on ld.loteslinha_id=ll.id
                join producao_currentsettings cs on cs.agg_of_id = ld.agg_of_id
                {f.text}
                {dql.sort} {dql.limit}
            """
        ), cursor, parameters)
        return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def UpdateGranulado(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    print(filter)
    print(data)
    def checkGranulado(vcr_num, cursor):
        f = Filters({"status": -1,"vcr_num":vcr_num})
        f.where()
        f.add(f'status = :status', True)
        f.add(f'vcr_num = :vcr_num', True)
        f.value("and")
        response = db.executeSimpleList(lambda: (f"""
            select * from (
            select *,max(`order`) over () maxorder
            from lotesgranuladolinha
            {f.text}
            )t where `order`=maxorder and type_mov=1 and 
            exists (select 1 from lotesdoserslinha ldl where ldl.agg_of_id={acs["agg_of_id"]} and ldl.loteslinha_id=t.id)
            limit 1
        """), cursor, f.parameters)
        if len(response["rows"])>0:
            return response["rows"][0]
        return None

    def updateDosers(data,cursor):
        ds = db.executeSimpleList(lambda:(
            f"""
                select * from (
                select 
                *,
                max(`order`) over (partition by doser) maxorder 
                from lotesdoserslinha ldl
                where loteslinha_id={data["loteslinha_id"]}
                and ldl.agg_of_id={data["agg_of_id"]}
                ) t
                where t.`order`=t.maxorder and t.type_mov=1
            """
        ),cursor,{})["rows"]
        if len(ds)>0:
            for doser in ds:
                d = {key: doser[key] for key in doser if key not in ["id", "t_stamp","group","order","maxorder"]}
                d["type_mov"]=0
                d["t_stamp"]: datetime.now()
                d["user_id"]=request.user.id
                d["`order`"]=data["linha_order"]
                d["loteslinha_id"]=data["linha_id"]
                dml = db.dml(TypeDml.INSERT, d,"lotesdoserslinha",None,None,False)
                db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                acs = inProduction({},cursor)
                gr = checkGranulado(filter["vcr_num"],cursor)
                if (gr is not None and gr["type_mov"]==1):
                    id =gr["id"]
                    del gr["id"]
                    del gr["t_stamp"]
                    del gr["group"]
                    del gr["order"]
                    del gr["maxorder"]
                    gr = {key: gr[key] for key in gr if key not in ["id", "t_stamp","group","order","maxorder"]}
                    gr["type_mov"]=0
                    gr["qty_reminder"]=filter["qty_reminder"]
                    gr["t_stamp"]: datetime.now()
                    gr["user_id"]=request.user.id
                    dml = db.dml(TypeDml.INSERT, gr,"lotesgranuladolinha",None,None,False)

                    db.execute(dml.statement, cursor, dml.parameters)
                    lastid = cursor.lastrowid
                    linha_order = lastid*100000000
                    dml = db.dml(TypeDml.UPDATE,{"`order`":linha_order},"lotesgranuladolinha",{"id":f'=={lastid}'},None,False)
                    db.execute(dml.statement, cursor, dml.parameters)

                    updateDosers({"loteslinha_id":id,"agg_of_id":acs["agg_of_id"],"acs_id":acs["id"],"linha_order":linha_order,"linha_id":lastid},cursor)
                else:
                    return Response({"status": "error", "title": f"Não é possível alterar o estado do lote!", "subTitle":"O lote está fechado, já não está em linha ou não existe!"})     
        return Response({"status": "success", "title": "Lote alterado Sucesso!", "subTitle":f'{None}'})
    except Error:
        return Response({"status": "error", "title": "Erro ao alterar lote!"})




#endregion
