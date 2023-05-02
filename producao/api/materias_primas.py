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
    

def GetGranuladoInLine(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])

    f.setParameters({}, True)
    f.where(False,"and")
    f.auto()
    f.value()
    parameters = {**f.parameters}
    dql = db.dql(request.data, False)
    cols = f"""ROW_NUMBER() OVER () id,t.cuba,IL.vcr_num,IFNULL(IL.artigo_cod,t.matprima_cod) artigo_cod ,t.arranque,IL.n_lote,IL.t_stamp,IL.qty_lote,IL.qty_reminder,
            IFNULL(IL.artigo_des,t.matprima_des) artigo_des,group_concat(distinct t.doser order by t.doser) dosers,IL.mp_group,IL.max_in"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""
            with INLINE AS(
            select t.artigo_des,t.vcr_num, ld.*,t.qty_lote,t.qty_reminder,t.mp_group ,t.densidade ,t.max_in from(
            select 
            LAST_VALUE(lg.id) OVER (PARTITION BY vcr_num ORDER BY lg.t_stamp RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) last_entry,
            lg.*,gm.`group` mp_group ,gm.densidade ,gm.max_in 
            from lotesgranuladolinha lg
            left join group_materiasprimas gm on gm.artigo_cod =lg.artigo_cod 
            )t
            join lotesdoserslinha ld on ld.loteslinha_id=t.id
            where t.id=t.last_entry and  date(t.t_stamp)>='2022-09-26' and t.type_mov=1 and ld.type_mov=1
            ),
            FORMULACAO AS(
            select formulacaov2
            from producao_currentsettings cs
            where status=3
            ),
            FORMULACAO_DOSERS AS(
            SELECT doser,matprima_cod, arranque,cuba,matprima_des
            FROM FORMULACAO F,
            JSON_TABLE(F.formulacaov2->'$.items',"$[*]"COLUMNS(cuba VARCHAR(3) PATH "$.cuba",doser VARCHAR(3) PATH "$.doseador",matprima_des VARCHAR(200) PATH "$.matprima_des",matprima_cod VARCHAR(200) PATH "$.matprima_cod",arranque DECIMAL PATH "$.arranque")) frm
            WHERE doser is not null and arranque>0
            )
            select
             {c(f'{dql.columns}')}
            FROM (
            SELECT IFNULL(FR.cuba,IL.group_id) cuba,IFNULL(FR.matprima_cod,IL.artigo_cod) matprima_cod,IL.n_lote,IL.t_stamp,IL.qty_lote,IL.qty_reminder,IFNULL(FR.matprima_des,IL.artigo_des) matprima_des,IFNULL(FR.doser,IL.doser) doser,/*group_concat(FR.doser) dosers,*/IL.mp_group
            ,COALESCE(FR.arranque, MIN(FR.arranque) OVER (PARTITION BY IFNULL(FR.cuba,IL.group_id), IFNULL(FR.doser,IL.doser), IL.mp_group)) AS arranque,
            (CASE WHEN COALESCE(FR.arranque, MIN(FR.arranque) OVER (PARTITION BY IFNULL(FR.cuba,IL.group_id), IFNULL(FR.doser,IL.doser), IL.mp_group)) is null THEN 0 ELSE 1 END) formulation
            FROM INLINE IL
            LEFT JOIN FORMULACAO_DOSERS FR ON IL.artigo_cod=FR.matprima_cod AND IL.doser=FR.doser
            UNION
            SELECT IFNULL(FR.cuba,IL.group_id) cuba,IFNULL(FR.matprima_cod,IL.artigo_cod) matprima_cod,IL.n_lote,IL.t_stamp,IL.qty_lote,IL.qty_reminder,IFNULL(FR.matprima_des,IL.artigo_des) matprima_des,IFNULL(FR.doser,IL.doser) doser,/*group_concat(FR.doser) dosers,*/IL.mp_group
            ,COALESCE(FR.arranque, MIN(FR.arranque) OVER (PARTITION BY IFNULL(FR.cuba,IL.group_id), IFNULL(FR.doser,IL.doser), IL.mp_group)) AS arranque,
            (CASE WHEN COALESCE(FR.arranque, MIN(FR.arranque) OVER (PARTITION BY IFNULL(FR.cuba,IL.group_id), IFNULL(FR.doser,IL.doser), IL.mp_group)) is null THEN 0 ELSE 1 END) formulation
            FROM FORMULACAO_DOSERS FR
            LEFT JOIN INLINE IL ON IL.artigo_cod=FR.matprima_cod AND IL.doser=FR.doser
            WHERE IL.id is null
            ) t
            LEFT JOIN INLINE IL ON (IL.artigo_cod=t.matprima_cod or IL.mp_group=t.mp_group) AND IL.doser=t.doser
            group by t.formulation, t.cuba,IFNULL(IL.artigo_cod,t.matprima_cod),IL.vcr_num,IL.mp_group,IL.max_in,t.arranque,IL.n_lote,IL.t_stamp,IL.qty_lote,IL.qty_reminder,IFNULL(IL.artigo_des,t.matprima_des)
            {s(dql.sort)}
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    try:
        response = db.executeList(sql, connection, parameters)
    except Exception as error:
        print(error)
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def GetGranuladoLoteQuantity(request, format=None):
    conngw = connections[connGatewayName].cursor()
    sageAlias = dbgw.dbAlias.get("sage")
    sgpAlias = dbgw.dbAlias.get("sgp")
    values = request.data['filter'].get("value")
    rows = dbgw.executeSimpleList(lambda:(f"""
        SELECT * FROM(
        SELECT
            ST."ROWID" lote_id,ST."CREDATTIM_0",ST."ITMREF_0",ST."LOT_0",ST."LOC_0",ST."VCRNUM_0",mprima."ITMDES1_0" artigo_des,
            LAST_VALUE(ST."QTYPCU_0") OVER (PARTITION BY ST."ITMREF_0",ST."LOT_0",ST."VCRNUM_0" ORDER BY ST."ROWID" RANGE BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) "QTYPCU_0",
            --SUM (ST."QTYPCU_0") OVER (PARTITION BY ST."ITMREF_0",ST."LOT_0",ST."VCRNUM_0") QTY_SUM,
            ST."PCU_0",mprima."ITMDES1_0"
            FROM {sageAlias}."STOCK" STK
            JOIN {sageAlias}."STOJOU" ST ON ST."ITMREF_0"=STK."ITMREF_0" AND ST."LOT_0"=STK."LOT_0" AND ST."LOC_0"=STK."LOC_0"
            JOIN {sageAlias}."ITMMASTER" mprima on ST."ITMREF_0"= mprima."ITMREF_0"
            WHERE ST."VCRNUM_0"='{values[4]}'
        ) t
        where ("QTYPCU_0" > 0)
        and "LOC_0" in ('BUFFER')
        AND NOT EXISTS (SELECT 1 FROM {sgpAlias}.lotesgranuladolinha ll where ll.vcr_num = "VCRNUM_0")
    """),conngw,{})["rows"]
    if len(rows)>0:            
        conn = connections["default"].cursor()
        rowsx = db.executeSimpleList(lambda:(f"""select id from lotesgranuladolinha where n_lote = '{values[1]}' and artigo_cod='{values[0]}' and vcr_num='{values[4]}'"""),conn,{})['rows']
        if len(rowsx)>0:
            return Response({"status": "error", "title": "O lote de Granulado já foi registado!", "subTitle":f'{None}',"row":{"qty_lote":values[2],"unit":values[3], "n_lote":values[1]}})
        obs = values[5] if len(values)>5 else ''
        return Response({"status": "success","row":{"lote_id":rows[0]["lote_id"],"obs":obs, "artigo_des":rows[0]["artigo_des"], "artigo_cod":values[0], "qty_lote":values[2], "vcr_num":values[4], "unit":values[3], "n_lote":values[1] }})
    else:
        return Response({"status": "error", "title": "O lote de Granulado não se enconta em buffer!", "subTitle":f'{None}',"row":{"qty_lote":0, "unit":values[3], "n_lote":values[1]}})

def AddGranuladoToLine(request, format=None):
    filter = request.data['filter']
    try:
        with connections["default"].cursor() as cursor:
            filter["t_stamp"]=datetime.now()
            args = (filter["t_stamp"], filter["artigo_cod"], filter["artigo_des"], filter["vcr_num"], filter["n_lote"], filter["qty_lote"], filter["lote_id"],filter["group_id"] if "group_id" in filter and filter["group_id"] is not None else None,request.user.id,0)
            cursor.callproc('add_granulado_to_line',args)
            return Response({"status": "success","title":"Entrada de Granulado efetuada com sucesso." })
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def RemoveGranuladoFromLine(request, format=None):
    filter = request.data['filter']
    try:
        with connections["default"].cursor() as cursor:
            filter["t_stamp"]=datetime.now()
            args = (filter["t_stamp"],filter["vcr_num"],filter["qty_reminder"] if "qty_reminder" in filter else 0,filter["obs"] if "obs" in filter else None,request.user.id, 0)
            cursor.callproc('output_granulado_from_line',args)
            return Response({"status": "success","title":"Saída de Granulado efetuada com sucesso." })
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def MateriasPrimasLookup(request, format=None):
    conn = connections[connGatewayName].cursor()
    cols = ['mprima."ITMREF_0"','mprima."ITMDES1_0"','mprima."ZFAMILIA_0"','mprima."ZSUBFAMILIA_0"','mprima."STU_0"', 'mprima."SAUSTUCOE_0"','mprima."TSICOD_3"']
    
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.value("and")
    
    f2 = filterMulti(request.data['filter'], {
        'fmulti_artigo': {"keys": ['"ITMREF_0"', '"ITMDES1_0"'], "table": 'mprima.'}
    }, False, "and" if f.hasFilters else "where" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    qty = None if "qty" not in request.data['parameters'] else request.data['parameters']['qty']
    typ = None if "type" not in request.data['parameters'] else request.data['parameters']['type']
    cfilter = ""
    if typ=='nonwovens':
        cfilter = f"""LOWER("ITMDES1_0") LIKE 'nonwo%%' AND LOWER("ITMDES1_0") LIKE '%%gsm%%' AND ("ACCCOD_0" = 'PT_MATPRIM')"""
    elif typ=='cores':
        core = int(int(request.data['parameters']['core']) * 25.4)
        largura = str(request.data['parameters']['largura'])[:-1]
        #cfilter = f"""LOWER("ITMDES1_0") LIKE 'core%%%% {core}%%x%%x{largura}_ mm%%' AND ("ACCCOD_0" = 'PT_EMBALAG')"""
        cfilter = f"""LOWER("ITMDES1_0") LIKE 'core%%%% {core}%%x%%x%%_%%mm%%' AND ("ACCCOD_0" = 'PT_EMBALAG')"""
    elif typ == 'all':
        cfilter=''
    else:
        cfilter = f"""(LOWER("ITMDES1_0") NOT LIKE 'nonwo%%' AND LOWER("ITMDES1_0") NOT LIKE 'core%%') AND ("ACCCOD_0" = 'PT_MATPRIM')"""

    if cfilter != "":
        cfilter = f"and ({cfilter})" if f.hasFilters or f2["hasFilters"] else f"where ({cfilter})"

    dql = dbgw.dql(request.data, False)
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")
    if qty is None:
        dql.columns = encloseColumn(cols,False)
        response = dbgw.executeSimpleList(lambda: (
            f"""
                select 
                {dql.columns}
                from {sageAlias}."ITMMASTER" mprima
                {f.text} {f2["text"]} {cfilter}
                {dql.sort}
                {dql.limit}
            """
        ), conn, parameters)
    else:
        cols.append('ST."QTYPCU_0"')
        dql.columns = encloseColumn(cols,False)
        response = dbgw.executeSimpleList(lambda: (
            f"""                
                select
                {dql.columns}
                from {sageAlias}."ITMMASTER" mprima
                join (
                SELECT "ITMREF_0","QTYPCU_0" FROM (
                SELECT "ITMREF_0","QTYPCU_0","ROWID", MAX("ROWID") OVER (PARTITION BY ST."ITMREF_0") MX FROM {sageAlias}."STOJOU" ST 
                WHERE "VCRTYP_0"=6 AND "QTYPCU_0">0 ORDER BY "CREDATTIM_0"
                ) tt where tt."ROWID"=MX
                ) ST on mprima."ITMREF_0"=ST."ITMREF_0"
                {f.text} {f2["text"]} {cfilter}
                {dql.sort}
                {dql.limit}
            """
        ), conn, parameters)




    return Response(response)





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
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def MateriasPrimasList(request, format=None):
    connection = connections[connMssqlName].cursor()    
    #connection = connections[connGatewayName].cursor()    
    type = int(request.data['filter']['type'] if 'type' in request.data['filter'] else -1)
    loc = request.data['filter']['loc'] if 'loc' in request.data['filter'] and request.data['filter']['loc']!="-1" else None
    lookup = request.data["parameters"]["lookup"] if "parameters" in request.data and "lookup" in request.data["parameters"] else False
    f = Filters(request.data['filter'])
    f.setParameters({
        # "picked": {"value": lambda v: None if "fpicked" not in v or v.get("fpicked")=="ALL" else f'=={v.get("fpicked")}' , "field": lambda k, v: f'{k}'},
        "ITMREF_0": {"value": lambda v: v.get('fitm'), "field": lambda k, v: f'ST."{k}"'},
        "VCRNUM_0": {"value": lambda v: v.get('fvcr'), "field": lambda k, v: f'ST."{k}"'},
        "LOT_0": {"value": lambda v: v.get('flote'), "field": lambda k, v: f'ST."{k}"'},
        "LOC_0": {"value": lambda v: v.get('floc'), "field": lambda k, v: f'ST."{k}"'},
        "QTYPCU_0": {"value": lambda v: v.get('fqty_lote'), "field": lambda k, v: f'"{k}"'},
        **rangeP(f.filterData.get('fdate'), 't_stamp', lambda k, v: f'CONVERT(date, ST."CREDATTIM_0")')
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
        dt = [o['value'] for o in v if o["value"] is not None]
        if len(dt) > 0:
            value = None if len(v)==0 else 'in:' + ','.join(f"{w}" for w in dt)
            fP[field] = {"key": field, "value": value, "field": lambda k, v: f'{k}'}
        f.setParameters({**fP}, True)
        f.auto()
        f.where(False, hasFilters)
        f.value()
        return f
    #flocation = filterLocationMultiSelect(request.data['filter'],'fmulti_location','"LOC_0"',"and" if f.hasFilters or f2["hasFilters"] else "and")
    flocation = filterLocationMultiSelect({"loc":[{"value":loc}]},'loc','"LOC_0"',"and" if f.hasFilters or f2["hasFilters"] else "and")

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

    cols = f"""*"""
    sql = lambda p, c, s: (
        f"""
            SELECT {c(f'{cols}')} FROM(
            SELECT DISTINCT ST."ROWID",ST."CREDATTIM_0",ST."ITMREF_0",ST."LOT_0",ST."LOC_0",ST."VCRNUM_0",    
            SUM(ST.QTYPCU_0) OVER (PARTITION BY ST."ITMREF_0",ST."LOT_0",ST."VCRNUM_0",ST."LOC_0") QTY_SUM,    
            LAST_VALUE(ST.QTYPCU_0) OVER (PARTITION BY ST."ITMREF_0",ST."LOT_0",ST."VCRNUM_0" ORDER BY ST.ROWID RANGE BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) QTYPCU_0,
            ST."PCU_0",mprima."ITMDES1_0",mprima."TSICOD_3"
            --FROM ELASTICTEK.STOCK STK
            FROM ELASTICTEK.STOJOU ST --ON ST.ITMREF_0=STK.ITMREF_0 AND ST.LOT_0=STK.LOT_0 AND ST.LOC_0=STK.LOC_0
            JOIN ELASTICTEK.ITMMASTER mprima on ST."ITMREF_0"= mprima."ITMREF_0"
            --LEFT JOIN (select * from openquery([SGP-PROD], 'select distinct vcr_num from lotesgranuladolinha')) GRN on GRN.vcr_num=ST."VCRNUM_0"
            WHERE ST.VCRTYP_0 NOT IN (28)
            {typeFilter}
            {f.text} {f2["text"]}
            ) t
            where (QTYPCU_0 > 0 AND QTY_SUM>0)
            {flocation.text}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )

    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sage"])
    if lookup:
        response = dbmssql.executeSimpleList(sql(lambda v:v,lambda v:v,lambda v:v), connection, parameters, [])
    else:
        response = dbmssql.executeList(sql, connection, parameters, [])
    return Response(response)






#region NONWOVENS

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def NWListLookup(request, format=None):
    f = Filters(request.data['filter'])
    f.setParameters({
        "t_stamp": {"value": lambda v: v.get('t_stamp'), "field": lambda k, v: f'lnw.{k}'},
    }, True)
    f.where()
    f.auto()
    #f.add(f'cs.status = :cs_status', lambda v:(v!=None))
    f.add(f'lnw.n_lote like :n_lote', lambda v:(v!=None))
    f.add(f'lnw.`type` = :type', lambda v:(v!=None))
    f.add(f'lnw.closed = :closed', lambda v:(v!=None))
    f.add(f'lnw.status = :status', lambda v:(v!=None))
    f.add(f'lnw.queue = :queue', lambda v:(v!=None))
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                SELECT lnw.* 
                FROM lotesnwlinha lnw
                #join producao_currentsettings cs on cs.agg_of_id = lnw.agg_of_id
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
        **rangeP(f.filterData.get('fdataout'), 't_stamp_out', lambda k, v: f'DATE(lnw.{k})'),
        **rangeP(f.filterData.get('fdata_inuse'), 't_stamp_inuse', lambda k, v: f'DATE(lnw.{k})'),
        # **rangeP(f.filterData.get('ftime'), ['inico','fim'], lambda k, v: f'TIME(pbm.{k})', lambda k, v: f'TIMEDIFF(TIME(pbm.{k[1]}),TIME(pbm.{k[0]}))'),
        "status": {"value": lambda v: v.get('ftype_mov'), "field": lambda k, v: f'lnw.`{k}`'},
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
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    response = db.executeList(sql, connection, parameters)
    return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def DeleteNW(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                args = (filter["vcr_num"],filter["type_mov"],data["data"]["queue"] if "data" in data and "queue" in data["data"] else 0)
                cursor.callproc('delete_nw_from_line',args)
        return Response({"status": "success", "title": "Movimento(s) eliminado(s) com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SaveNWItems(request, format=None):
    data = request.data.get("parameters")
    def saveItems(data,cursor):
        if "rows" in data:
            #nws = json.loads(acs["nonwovens"])
            sorted_rows = sorted([d for d in data["rows"] if "notValid" in d and d['notValid']==1], key=lambda d: d['n'])
            for idx, item in enumerate(sorted_rows):
                args = (item["t_stamp"],item["artigo_cod"],item["artigo_des"],item["vcr_num"],item["n_lote"],item["qty_lote"],item["largura"],item["comp"],item["lote_id"],item["type"],0,request.user.id,0)
                cursor.callproc('add_nw_to_line',args)
                # if item["type"]==0 and nws["nw_cod_inf"]!=item["artigo_cod"]:
                #     raise ValueError(f"O artigo de Nonwoven Inferior {item['n_lote']} não corresponde ao definido na ordem de fabrico!")
                # if item["type"]==1 and nws["nw_cod_sup"]!=item["artigo_cod"]:
                #     raise ValueError(f"O artigo de Nonwoven Superior {item['n_lote']} não corresponde ao definido na ordem de fabrico!")
                # dml = db.dml(TypeDml.INSERT, {
                #     "lote_id":item["lote_id"], 
                #     "qty_lote":item["qty_lote"],
                #     "artigo_des":item["artigo_des"],
                #     "artigo_cod":item["artigo_cod"], 
                #     "type":item["type"], 
                #     "t_stamp":item["t_stamp"],
                #     "n_lote":item["n_lote"],
                #     "status":1,
                #     "vcr_num":item["vcr_num"],
                #     "largura":item["largura"],
                #     "comp":item["comp"],
                #     "qty_reminder":item["qty_reminder"],
                #     "qty_consumed":item["qty_consumed"],
                #     "audit_cs_id":acs["id"],
                #     "inuse":0,
                #     "queue":f"""(SELECT q FROM (SELECT ifnull(max(queue),0)+1 q FROM sistema.lotesnwlinha where status=1 and type={item["type"]}) t)""",
                #     "agg_of_id":acs["agg_of_id"],
                #     "user_id":request.user.id}, 
                #     "lotesnwlinha",None,None,False,["queue"])
                # dml.statement = f"""
                #     {dml.statement}
                #     ON DUPLICATE KEY UPDATE 
                #         status = VALUES(status),
                #         user_id = VALUES(user_id)
                # """
                # print(dml.statement)
                # print(dml.parameters)
                # db.execute(dml.statement, cursor, dml.parameters)
        elif "type" in data and data["type"]=="in":
            args = (data["data"]["t_stamp"],data["data"]["artigo_cod"],data["data"]["artigo_des"],data["data"]["vcr_num"],data["data"]["n_lote"],data["data"]["qty_lote"],int(data["data"]["largura"]),data["data"]["comp"],data["data"]["lote_id"],data["data"]["type"],data["data"]["queue"],request.user.id,0)
            cursor.callproc('add_nw_to_line',args)
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                saveItems(data,cursor)
                # acs = inProduction(data,cursor)
                # if acs is None:
                #     return Response({"status": "error", "title": "Não existe nenhuma ordem de fabrico a decorrer!"})
                # else:
                #     saveItems(data,cursor)
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

    errors = []
    success = []    
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                if "type" in data and data["type"]=="out":
                    args = (filter["t_stamp"],filter["vcr_num"],filter["qty_reminder"] if filter["qty_reminder"] is not None else 0 ,0)
                    cursor.callproc('output_nw_from_line',args)
                    #nwd = checkNW(filter["id"],cursor)
                    #if (nwd is not None):
                    #    dml = db.dml(TypeDml.UPDATE,{**data,"user_id":request.user.id},"lotesnwlinha",{"id":f'=={nwd["id"]}'},None,False)
                    #    db.execute(dml.statement, cursor, dml.parameters)
                    #    if "status" in data and data["status"]==0:
                    #        dml = db.dml(TypeDml.UPDATE,{"t_stamp_out":datetime.now(),"queue":"queue=(case when (ifnull(queue,0)-1) < 0 then 1 else (ifnull(queue,1)-1) end)","user_id":request.user.id},"lotesnwlinha",{"status":f'==1',"type":f'=={nwd["type"]}'},None,False,["queue"])
                    #        db.execute(dml.statement, cursor, dml.parameters)
                    #else:
                    #    return Response({"status": "error", "title": f"Não é possível alterar o estado do lote!", "subTitle":"O lote está fechado ou não existe!"})
                if ("type" in data and data["type"]=="close"):
                    args = (filter["vcr_num"] if "vcr_num" in filter else None, None,filter["t_stamp_out"] if "t_stamp_out" in filter else None)
                    cursor.callproc('close_nw_line',args)
                if ("type" in data and data["type"]=="queue"):
                    args = (filter["id"] if "id" in filter else None, data["mov"])
                    cursor.callproc('update_nw_queue',args)
                if ("type" in data and data["type"]=="datagrid"):
                    for idx,v in enumerate(data["rows"]):
                        exists = db.exists("lotesnwlinha", {"id":f"=={v['id']}","closed":0}, cursor).exists
                        if exists==0:
                            errors.append(f"""O lote de Nonwoven {v["n_lote"]} já se encontra fechado ou não tem movimento de saída!""")
                        else:
                            dml = db.dml(TypeDml.UPDATE,{"qty_out":v["qty_out"]},"lotesnwlinha",{"id":f'=={v["id"]}'},None,False)
                            db.execute(dml.statement, cursor, dml.parameters)
                    success.append(f"""Registos atualizados com sucesso!""")
        return Response({"status": "multi", "errors":errors, "success":success})
    except Error as error:
        return Response({"status": "error", "title": str(error)})

#endregion

#region GRANULADO

@api_view(['POST'])
@renderer_classes([JSONRenderer])
def GranuladoBufferLineList(request, format=None):
    connection = connections[connGatewayName].cursor()
    f = Filters(request.data['filter'])

    f.setParameters({
       **rangeP(f.filterData.get('fdata'), 't_stamp', lambda k, v: f'"CREDATTIM_0"::DATE'),
       "LOT_0": {"value": lambda v: v.get('flote'), "field": lambda k, v: f'"{k}"'},
       #"fof": {"value": lambda v: v.get('fof')},
       "VCRNUM_0": {"value": lambda v: v.get('fvcr'), "field": lambda k, v: f'"{k}"'},
       #"qty_lote": {"value": lambda v: v.get('fqty'), "field": lambda k, v: f'{k}'},
       #"qty_reminder": {"value": lambda v: v.get('fqty_reminder'), "field": lambda k, v: f'{k}'},
       #"type_mov": {"value": lambda v: v.get('ftype_mov'), "field": lambda k, v: f'{k}'}
    }, True)
    f.where(False,"and")
    f.auto()
    f.value()

    f2 = filterMulti(request.data['filter'], {
        'fartigo': {"keys": ['"ITMREF_0"', '"ITMDES1_0"']}
    }, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = dbgw.dql(request.data, False)
    cols = f"""tx."ITMDES1_0",tx."ITMREF_0",tx."LOT_0",tx.QTYPCU_0,tx."PCU_0",tx."VCRNUM_0",tx."CREDATTIM_0",cg.t_stamp,cg.t_stamp_out"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""
            SELECT {c(f'{dql.columns}')}
            FROM(
            SELECT
            ST."ROWID",ST."CREDATTIM_0",ST."ITMREF_0",ST."LOT_0",ST."LOC_0",ST."VCRNUM_0",
            SUM(ST."QTYPCU_0") OVER (PARTITION BY ST."ITMREF_0",ST."LOT_0",ST."VCRNUM_0",ST."LOC_0") QTY_SUM, 
            --LAST_VALUE(ST."QTYPCU_0") OVER (PARTITION BY ST."ITMREF_0",ST."LOT_0",ST."VCRNUM_0" ORDER BY ST."ROWID" RANGE BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) QTYPCU_0,
            ST."QTYPCU_0" QTYPCU_0,
            ST."PCU_0",mprima."ITMDES1_0"
            FROM "SAGE-PROD"."STOCK" STK
            JOIN "SAGE-PROD"."STOJOU" ST ON ST."ITMREF_0"=STK."ITMREF_0" AND ST."LOT_0"=STK."LOT_0" AND ST."LOC_0"=STK."LOC_0"
            JOIN "SAGE-PROD"."ITMMASTER" mprima on ST."ITMREF_0"= mprima."ITMREF_0"
            WHERE ST."VCRTYP_0" NOT IN (28)
            and ((LOWER(mprima."ITMDES1_0") NOT LIKE 'nonwo%%' AND LOWER(mprima."ITMDES1_0") NOT LIKE 'core%%') AND (mprima."ACCCOD_0" = 'PT_MATPRIM')) 
            and ST."LOC_0" in ('BUFFER')
            --AND STK.ITMREF_0='NNWSB0023000056' AND STK.LOT_0='E0120/00741'
            --AND ST."CREDATTIM_0">=now() - interval '2 month'
            ) tx
            LEFT JOIN mv_granuladolinha cg on cg.vcr_num=tx."VCRNUM_0" and cg.artigo_cod=tx."ITMREF_0" and cg.n_lote=tx."LOT_0"
            where (QTY_SUM > 0) --AND "ITMREF_0"='RVMAX0862000013'
            {f.text} {f2["text"]}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}            
        """
    )
    sqlCount = f""" 
            SELECT count(*)
            FROM(
            SELECT
            ST."ROWID",ST."CREDATTIM_0",ST."ITMREF_0",ST."LOT_0",ST."LOC_0",ST."VCRNUM_0",
            SUM(ST."QTYPCU_0") OVER (PARTITION BY ST."ITMREF_0",ST."LOT_0",ST."VCRNUM_0",ST."LOC_0") QTY_SUM, 
            --LAST_VALUE(ST."QTYPCU_0") OVER (PARTITION BY ST."ITMREF_0",ST."LOT_0",ST."VCRNUM_0" ORDER BY ST."ROWID" RANGE BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) QTYPCU_0,
            ST."QTYPCU_0" QTYPCU_0,
            ST."PCU_0",mprima."ITMDES1_0"
            FROM "SAGE-PROD"."STOCK" STK
            JOIN "SAGE-PROD"."STOJOU" ST ON ST."ITMREF_0"=STK."ITMREF_0" AND ST."LOT_0"=STK."LOT_0" AND ST."LOC_0"=STK."LOC_0"
            JOIN "SAGE-PROD"."ITMMASTER" mprima on ST."ITMREF_0"= mprima."ITMREF_0"
            WHERE ST."VCRTYP_0" NOT IN (28)
            and ((LOWER(mprima."ITMDES1_0") NOT LIKE 'nonwo%%' AND LOWER(mprima."ITMDES1_0") NOT LIKE 'core%%') AND (mprima."ACCCOD_0" = 'PT_MATPRIM')) 
            and ST."LOC_0" in ('BUFFER')
            --AND STK.ITMREF_0='NNWSB0023000056' AND STK.LOT_0='E0120/00741'
            --AND ST."CREDATTIM_0">=now() - interval '2 month'
            ) tx
            where (QTY_SUM > 0) --AND "ITMREF_0"='RVMAX0862000013'
            {f.text} {f2["text"]}
        """

    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["gw"])
    try:
        response = dbgw.executeList(sql, connection, parameters,[],None,sqlCount)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
def GranuladoListInLine(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])

    f.setParameters({
        #"type": {"value": lambda v: f"=={v.get('agg_of_id')}" if (v.get("type")=="1" and v.get('agg_of_id') is not None) else None, "field": lambda k, v: f'agg_of_id'},
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
    cols = f"""FR.cuba,FR.matprima_cod,FR.arranque,IL.n_lote,IL.t_stamp,IL.qty_lote,IL.qty_reminder,FR.matprima_des,group_concat(FR.doser) dosers"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""
                with INLINE AS(
                select ld.*,t.qty_lote,t.qty_reminder from(
                select 
                LAST_VALUE(id) OVER (PARTITION BY vcr_num ORDER BY t_stamp RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) last_entry,
                lg.*
                from lotesgranuladolinha lg
                )t
                join lotesdoserslinha ld on ld.loteslinha_id=t.id
                where t.id=t.last_entry and  date(t.t_stamp)>='2022-09-26' and t.type_mov=1 and ld.type_mov=1
                ),
                FORMULACAO AS(
                select formulacaov2
                from producao_currentsettings cs
                where status=3
                ),
                FORMULACAO_DOSERS AS(
                SELECT doser,matprima_cod, arranque,cuba,matprima_des
                FROM FORMULACAO F,
                JSON_TABLE(F.formulacaov2->'$.items',"$[*]"COLUMNS(cuba VARCHAR(3) PATH "$.cuba",doser VARCHAR(3) PATH "$.doseador",matprima_des VARCHAR(200) PATH "$.matprima_des",matprima_cod VARCHAR(200) PATH "$.matprima_cod",arranque DECIMAL PATH "$.arranque")) frm
                WHERE doser is not null and arranque>0
                )
                SELECT {c(f'{dql.columns}')} 
                FROM FORMULACAO_DOSERS FR
                LEFT JOIN INLINE IL ON IL.artigo_cod=FR.matprima_cod AND IL.doser=FR.doser
                group by FR.cuba,FR.matprima_cod,FR.arranque,IL.n_lote,IL.t_stamp,IL.qty_lote,IL.qty_reminder,FR.matprima_des
                {s(dql.sort)}
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    try:
        response = db.executeList(sql, connection, parameters)
    except Exception as error:
        print(error)
        return Response({"status": "error", "title": "Erro!"})
    return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
def GranuladoList(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])

    f.setParameters({
       **rangeP(f.filterData.get('fdata'), 't_stamp', lambda k, v: f'DATE(t_stamp)'),
       **rangeP(f.filterData.get('fdatain'), 'in_t', lambda k, v: f'DATE(in_t)'),
       **rangeP(f.filterData.get('fdataout'), 'out_t', lambda k, v: f'DATE(out_t)'),
       "diff": {"value": lambda v: '>0' if "fdataout" in v and v.get("fdataout") is not None else None, "field": lambda k, v: f'TIMESTAMPDIFF(second,in_t,out_t)'},
       "n_lote": {"value": lambda v: v.get('flote'), "field": lambda k, v: f'{k}'},
       "fof": {"value": lambda v: v.get('fof')},
       "vcr_num": {"value": lambda v: v.get('fvcr')},
       "qty_lote": {"value": lambda v: v.get('fqty'), "field": lambda k, v: f'{k}'},
       "qty_reminder": {"value": lambda v: v.get('fqty_reminder'), "field": lambda k, v: f'{k}'},
       "type_mov": {"value": lambda v: v.get('ftype_mov'), "field": lambda k, v: f'{k}'}
    }, True)
    f.where(False,"and")
    f.auto()
    f.value()

    f2 = filterMulti(request.data['filter'], {
        'fartigo': {"keys": ['artigo_cod', 'artigo_des'], "table": 't.'}
    }, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""t.*,acs.ofs ->> "$[*].of_cod" ofs,adiff.avgdiff,adiff.stddiff"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""
            with AVGDIFF AS (
                select artigo_cod,
                AVG(TIMESTAMPDIFF(second,in_t,out_t)) avgdiff,
                STDDEV(TIMESTAMPDIFF(second,in_t,out_t)) stddiff
                from (
                SELECT ll.artigo_cod,MIN(ll.t_stamp) in_t,MAX(ll.t_stamp) out_t
                FROM lotesgranuladolinha ll
                WHERE ll.`status`<>0 and ll.closed=1
                GROUP BY ll.artigo_cod,ll.n_lote,ll.vcr_num
                ) t
                where t.in_t<>t.out_t
                GROUP BY t.artigo_cod
            )
            select 
                {c(f'{dql.columns}')}
            from(
            select distinct 
            t.id,t.type_mov,t.artigo_cod,t.n_lote,t.qty_lote,t.vcr_num,t.artigo_des,t.in_t,t.out_t,TIMESTAMPDIFF(second,in_t,out_t) `diff`,t.max_order,t.t_stamp,t.group_id,t.loteslinha_id,t.agg_of_id,t.audit_cs_id,t.qty_reminder,t.closed
            ,(select GROUP_CONCAT(tld.doser) dosers from lotesdoserslinha tld where tld.loteslinha_id=t.loteslinha_id) dosers,t.obs
            from(
            select ll.id,ld.type_mov,ld.artigo_cod,ld.n_lote,ll.qty_lote,ll.vcr_num,ll.artigo_des,
            MIN(ll.t_stamp) OVER (PARTITION BY ll.artigo_cod,ll.n_lote,ll.vcr_num) in_t,
            MAX(ll.t_stamp) OVER (PARTITION BY ll.artigo_cod,ll.n_lote,ll.vcr_num) out_t,
            MAX(ld.t_stamp) OVER (PARTITION BY ld.artigo_cod,ld.n_lote,ld.loteslinha_id) max_order,
            ld.t_stamp,ld.group_id,ld.loteslinha_id, ld.agg_of_id, ld.audit_cs_id,ll.qty_reminder,ll.closed,ll.obs
            from lotesdoserslinha ld
            JOIN lotesgranuladolinha ll on ll.id=ld.loteslinha_id
            WHERE ld.type_mov in (0,1,2) AND ld.closed=0 AND ld.`status`<>0
            ) t
            where t_stamp = max_order
            {f.text} {f2["text"]}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
            ) t
            join audit_currentsettings acs on acs.id=t.audit_cs_id
            left join AVGDIFF adiff on adiff.artigo_cod=t.artigo_cod
        """
    )
    sqlCount = f""" 
           select 
            count(*)
            from(
            select distinct 
            t.id,t.type_mov,t.artigo_cod,t.n_lote,t.qty_lote,t.vcr_num,t.artigo_des,t.in_t,t.out_t,t.max_order,t.t_stamp,t.group_id,t.loteslinha_id,t.agg_of_id,t.audit_cs_id,t.qty_reminder,t.closed
            from(
            select ll.id,ld.type_mov,ld.artigo_cod,ld.n_lote,ll.qty_lote,ll.vcr_num,ll.artigo_des,
            ld.t_stamp,ld.group_id,ld.loteslinha_id, ld.agg_of_id, ld.audit_cs_id,ll.qty_reminder,ll.closed,
            MIN(ll.t_stamp) OVER (PARTITION BY ll.artigo_cod,ll.n_lote,ll.vcr_num) in_t,
            MAX(ll.t_stamp) OVER (PARTITION BY ll.artigo_cod,ll.n_lote,ll.vcr_num) out_t,
            MAX(ld.t_stamp) OVER (PARTITION BY ld.artigo_cod,ld.n_lote,ld.loteslinha_id) max_order
            from lotesdoserslinha ld
            JOIN lotesgranuladolinha ll on ll.id=ld.loteslinha_id
            WHERE ld.type_mov in (0,1,2) AND ld.closed=0 AND ld.`status`<>0
            ) t
            where t_stamp = max_order
            {f.text} {f2["text"]}
            ) t
        """

    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    try:
        response = db.executeList(sql, connection, parameters,[],None,sqlCount)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SaveGranuladoItems(request, format=None):
    data = request.data.get("parameters")
   
    def allowItem(item, cursor):
        f = Filters({"artigo_cod": item,"t_stamp":"2022-09-28 00:00:00"})
        f.where()
        f.add(f'`artigo_cod` = :artigo_cod', True)
        f.add(f't_stamp >= :t_stamp', True)
        f.value("and")
        response = db.executeSimpleList(lambda: (f"SELECT type_mov FROM lotesgranuladolinha {f.text} order by `order` desc limit 1"), cursor, f.parameters)
        if len(response["rows"])>0:
            return True if response["rows"][0]["type_mov"]==0 else False
        return True

    def saveItems(data,cursor):
        errors = []
        #nws = json.loads(acs["nonwovens"])
        for idx, item in enumerate([d for d in data["rows"] if "notValid" in d and d['notValid']==1]):
            #if item["type"]==0 and nws["nw_cod_inf"]!=item["artigo_cod"]:
            #    raise ValueError(f"O artigo de Nonwoven Inferior {item['n_lote']} não corresponde ao definido na ordem de fabrico!")
            #if item["type"]==1 and nws["nw_cod_sup"]!=item["artigo_cod"]:
            #    raise ValueError(f"O artigo de Nonwoven Superior {item['n_lote']} não corresponde ao definido na ordem de fabrico!")
            allow = allowItem(item["artigo_cod"],cursor)
            if allow==True:
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
            else:
                errors.append({"message":f"""Tem de efetuar a saída do artigo {item["artigo_cod"]} {item["artigo_des"]} antes de dar entrada em linha."""})
        return errors

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                acs = inProduction(data,cursor)
                if acs is None:
                    return Response({"status": "error", "title": "Não existe nenhuma ordem de fabrico a decorrer!"})
                else:
                    errors = saveItems(data,cursor)
                    return Response({"status": "success", "title": "Registos guardados com Sucesso!", "subTitle":f'{None}', "errors":errors})
    except Exception as error:
        print(error)
        return Response({"status": "error", "title": str(error)})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def GranuladoListLookup(request, format=None):
    f = Filters({**request.data['filter'],"t_stamp":"2022-09-28 00:00:00"})
    f.setParameters({}, False)
    f.where(True,"and")
    #f.add(f'cs.status = :cs_status', lambda v:(v!=None))
    f.add(f'll.type_mov = :type_mov', lambda v:(v!=None))
    f.add(f'll.t_stamp >= :t_stamp', True)
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                SELECT distinct ll.*
                FROM lotesgranuladolinha ll
                join lotesdoserslinha ld on ld.loteslinha_id=ll.id
                where (select type_mov from lotesgranuladolinha tll where tll.t_stamp>='2022-09-28 00:00:00' and tll.vcr_num=ll.vcr_num order by `order` desc limit 1)=1
                #join producao_currentsettings cs on cs.agg_of_id = ld.agg_of_id
                {f.text}
                {dql.sort} {dql.limit}
            """
        ), cursor, parameters)
        print(parameters)
        return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def UpdateGranulado(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")

    def checkGranulado(vcr_num, cursor):
        f = Filters({"status": -1,"vcr_num":vcr_num})
        f.where()
        f.add(f'status = :status', True)
        f.add(f'vcr_num = :vcr_num', True)
        f.value("and")
        response = db.executeSimpleList(lambda: (f"""
            select * from (
            select *,max(t_stamp) over () maxorder
            from lotesgranuladolinha
            {f.text}
            )t where t_stamp=maxorder and type_mov=1
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
                #and ldl.agg_of_id={data["agg_of_id"]}
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
                d["agg_of_id"]=data["agg_of_id"]
                d["`order`"]=data["linha_order"]
                d["loteslinha_id"]=data["linha_id"]
                dml = db.dml(TypeDml.INSERT, d,"lotesdoserslinha",None,None,False)
                db.execute(dml.statement, cursor, dml.parameters)

    def getCurrentSettingsData(data,cursor):
        f = Filters({"t_stamp":data["t_stamp"]})
        f.where()
        f.add(f'acs.`timestamp` <= :t_stamp', True)
        f.value("and")
        if data["type_mov"] == 1:      
            response = db.executeSimpleList(lambda: (f"""
                with TCURRENTID AS(
                    SELECT 
                    case when `status`<>3 THEN (SELECT t.id FROM audit_currentsettings t where t.id>acs.id and t.`status`=3 limit 1) ELSE acs.id END id
                    FROM audit_currentsettings acs 
                    {f.text}
                    order by acs.id desc
                    limit 1
                )
                SELECT acs.agg_of_id,acs.id FROM audit_currentsettings acs
                JOIN TCURRENTID t ON t.id=acs.id
            """), cursor, f.parameters)
        else:
            response = db.executeSimpleList(lambda: (f"""
               	SELECT acs.id,acs.agg_of_id
                FROM audit_currentsettings acs 
                {f.text}
                and acs.`status` in (1,3,9)
                order by acs.id desc
                limit 1
            """), cursor, f.parameters)
        if len(response["rows"])>0:
            return response["rows"][0]
        return None

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                if ("type" in data and data["type"]=="datagrid"):
                    errors = []
                    success = []
                    for v in data["rows"]:
                        try:
                            args = (v["vcr_num"],v["type_mov"],v["t_stamp"], v["qty_lote"] if v["type_mov"]==1 else v["qty_reminder"],v["obs"])
                            cursor.callproc('adjust_granulado_line',args)
                            if "vcr_num_original" in v and v["vcr_num_original"]!=v["vcr_num"]:
                                args = (v["vcr_num_original"],v["vcr_num"],v["n_lote"], v["qty_lote"])
                                cursor.callproc('change_nlote_granulado_line',args)
                            success.append(f"""O lote {v["n_lote"]} com o movimento {v["vcr_num"]} atualizado com sucesso!""")
                        except Exception as error:
                            errors.append(str(error))
                        



                        # exists = False
                        # if "vcr_num_original" in v and v["vcr_num_original"]!=v["vcr_num"]:
                        #     exists = db.exists("lotesgranuladolinha", {"vcr_num":f"=={v['vcr_num']}"}, cursor).exists
                        # if not exists:
                        #     tmov =v["type_mov"]
                        #     vcr_num = v["vcr_num_original"] if "vcr_num_original" in v else v ["vcr_num"]
                        #     rs = db.get("id,t_stamp,type_mov","lotesgranuladolinha",{"vcr_num":f"""=={vcr_num}""","closed":"==0"},cursor).rows
                        #     error_date=False
                        #     if (len(rs)>1):
                        #         _tstamp = [d["t_stamp"] for d in rs if d['type_mov'] != tmov]
                        #         if tmov==0:
                        #             if _tstamp[0] > datetime.strptime(v["t_stamp"], "%Y-%m-%d %H:%M:%S"):
                        #                 error_date= True
                        #         else:
                        #             if _tstamp[0] < datetime.strptime(v["t_stamp"], "%Y-%m-%d %H:%M:%S"):
                        #                 error_date= True
                        #     if not error_date:
                        #         ids = [str(d['id']) for d in rs if 'id' in d]
                        #         if len(ids)>0:
                        #             cs = getCurrentSettingsData(v,cursor)
                        #             del v['type_mov']
                        #             if "vcr_num_original" in v:
                        #                 del v['vcr_num_original']
                        #             dml = db.dml(TypeDml.UPDATE,{"t_stamp":v["t_stamp"],"agg_of_id":cs["agg_of_id"],"audit_cs_id":cs["id"]},"lotesdoserslinha",{"loteslinha_id":f'in:{",".join(ids)}',"type_mov":f'=={tmov}'},None,False)
                        #             db.execute(dml.statement, cursor, dml.parameters)
                        #             dml = db.dml(TypeDml.UPDATE,{"t_stamp":v["t_stamp"],"qty_reminder":v["qty_reminder"]},"lotesgranuladolinha",{"id":f'in:{",".join(ids)}',"type_mov":f'=={tmov}'},None,False)
                        #             db.execute(dml.statement, cursor, dml.parameters)
                        #             dml = db.dml(TypeDml.UPDATE,{"n_lote":v["n_lote"]},"lotesdoserslinha",{"loteslinha_id":f'in:{",".join(ids)}'},None,False)
                        #             db.execute(dml.statement, cursor, dml.parameters)
                        #             dml = db.dml(TypeDml.UPDATE,{"n_lote":v["n_lote"],"vcr_num":v["vcr_num"],"qty_lote":v["qty_lote"]},"lotesgranuladolinha",{"id":f'in:{",".join(ids)}'},None,False)
                        #             db.execute(dml.statement, cursor, dml.parameters)
                        #         else:
                        #             errors.append(f"""O lote {v["n_lote"]} com o movimento {v["vcr_num"]} não foi atualizado!""")
                        #         success.append(f"""O lote {v["n_lote"]} com o movimento {v["vcr_num"]} atualizado com sucesso!""")
                        #     else:
                        #         errors.append(f"""O lote {v["n_lote"]} com o movimento {v["vcr_num"]} não foi atualizado! Data de saída tem de ser maior que a data de entrada.""")
                        # else:
                        #     errors.append(f"""O lote {v["n_lote"]} com o movimento {v["vcr_num"]} já existe!""")
                    return Response({"status": "multi", "errors":errors, "success":success})
                if ("type" in data and data["type"]=="out"):
                    try:
                        args = (filter["t_stamp"],filter["vcr_num"],filter["qty_reminder"] if "qty_reminder" in filter else 0,filter["obs"] if "obs" in filter else None,request.user.id, 0)
                        cursor.callproc('output_granulado_from_line',args)
                    except Exception as error:
                        return Response({"status": "error", "title": str(error)})  


                    # exists = db.exists("lotesgranuladolinha",{"vcr_num":f'=={filter["vcr_num"]}',"type_mov":"==0"},cursor).exists
                    # if (not exists):
                    #     gr={**filter}
                    #     id = gr["id"]
                    #     del gr["id"]
                    #     gr["type_mov"]=0
                    #     gr["qty_reminder"]= gr["qty_reminder"] if "qty_reminder" in gr else 0
                    #     gr["user_id"]=request.user.id
                    #     acs = getCurrentSettingsData(gr,cursor)

                    #     dml = db.dml(TypeDml.UPDATE,{"t_stamp_out":gr["t_stamp"],"qty_out":gr["qty_reminder"]},"lotesgranuladolinha",{"vcr_num":f'=={filter["vcr_num"]}',"type_mov":"==1"},None,False)
                    #     db.execute(dml.statement, cursor, dml.parameters)
                        
                    #     dml = db.dml(TypeDml.INSERT, gr,"lotesgranuladolinha",None,None,False)
                    #     db.execute(dml.statement, cursor, dml.parameters)
                    #     lastid = cursor.lastrowid
                    #     linha_order = lastid*100000000
                    #     dml = db.dml(TypeDml.UPDATE,{"`order`":linha_order},"lotesgranuladolinha",{"id":f'=={lastid}'},None,False)
                    #     db.execute(dml.statement, cursor, dml.parameters)
                    #     updateDosers({"loteslinha_id":id,"agg_of_id":acs["agg_of_id"],"acs_id":acs["id"],"linha_order":linha_order,"linha_id":lastid},cursor)
                    # else:
                    #     return Response({"status": "error", "title": "Não é possível dar saída do lote! O lote já deu saída."})                    
                if ("type" in data and data["type"]=="in"):
                    try:
                        args = (filter["t_stamp"], filter["artigo_cod"], filter["artigo_des"], filter["vcr_num"], filter["n_lote"], filter["qty_lote"], filter["lote_id"],filter["group_id"] if "group_id" in filter else None,request.user.id,0)
                        cursor.callproc('add_granulado_to_line',args)
                        if (filter["saida_mp"]==1):
                            args = (filter["t_stamp_out"],filter["vcr_num"],filter["qty_reminder"] if "qty_reminder" in filter else 0, 0)
                            cursor.callproc('output_granulado_from_line',args) 
                    except Exception as error:
                        return Response({"status": "error", "title": str(error)})
                    
                    #exists = db.exists("lotesgranuladolinha",{"vcr_num":f'=={filter["vcr_num"]}'},cursor).exists
                    #if (not exists):
                    #    args = (filter["t_stamp"], filter["artigo_cod"], filter["artigo_des"], filter["vcr_num"], filter["n_lote"], filter["qty_lote"], filter["lote_id"])
                    #    cursor.callproc('add_granulado_to_line',args)
                    #    if (filter["saida_mp"]==1):
                    #        args = (filter["t_stamp_out"], filter["vcr_num"], filter["qty_reminder"])
                    #        cursor.callproc('remove_granulado_from_line',args)
                    #else:
                    #    return Response({"status": "error", "title": "O lote já deu entrada em linha."})  
                    #pass
                if ("type" in data and data["type"]=="close"):
                    try:
                        args = (filter["vcr_num"] if "vcr_num" in filter else None, None,filter["t_stamp_out"] if "t_stamp_out" in filter else None)
                        cursor.callproc('close_granulado_line',args)
                    except Exception as error:
                        return Response({"status": "error", "title": str(error)})
                    # if "vcr_num" in filter:
                    #     print(filter["id"])
                    #     print("IDDDDDDDDDDDDDD")
                    #     pass
                    # if "init_data" in filter and "end_data" in filter:
                    #     pass
                # else:                    
                #     acs = inProduction({},cursor)
                #     gr = checkGranulado(filter["vcr_num"],cursor)
                #     if (gr is not None and gr["type_mov"]==1):
                #         id =gr["id"]
                #         del gr["id"]
                #         del gr["t_stamp"]
                #         del gr["group"]
                #         del gr["order"]
                #         del gr["maxorder"]
                #         gr = {key: gr[key] for key in gr if key not in ["id", "t_stamp","group","order","maxorder"]}
                #         gr["type_mov"]=0
                #         gr["qty_reminder"]= filter["qty_reminder"] if "qty_reminder" in filter else 0
                #         gr["t_stamp"]: datetime.now()
                #         gr["user_id"]=request.user.id
                #         dml = db.dml(TypeDml.INSERT, gr,"lotesgranuladolinha",None,None,False)

                #         db.execute(dml.statement, cursor, dml.parameters)
                #         lastid = cursor.lastrowid
                #         linha_order = lastid*100000000
                #         dml = db.dml(TypeDml.UPDATE,{"`order`":linha_order},"lotesgranuladolinha",{"id":f'=={lastid}'},None,False)
                #         db.execute(dml.statement, cursor, dml.parameters)

                #         updateDosers({"loteslinha_id":id,"agg_of_id":acs["agg_of_id"],"acs_id":acs["id"],"linha_order":linha_order,"linha_id":lastid},cursor)
                #     else:
                #         return Response({"status": "error", "title": f"Não é possível alterar o estado do lote!", "subTitle":"O lote está fechado, já não está em linha ou não existe!"})
        return Response({"status": "success", "title": "Movimento(s) alterado(s) com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": "Erro ao alterar registo(s)!"})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def DeleteGranulado(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    def checkGranulado(vcr_num, cursor):
        f = Filters({"closed": 1,"vcr_num":vcr_num})
        f.where()
        f.add(f'(ll.closed = :closed or ld.closed = :closed)', True)
        f.add(f'vcr_num = :vcr_num', True)
        f.value("and")

        print(f"""select ll.id 
        from lotesgranuladolinha ll
        join lotesdoserslinha ld on ld.loteslinha_id=ll.id
        {f.text}""")

        response = db.executeSimpleList(lambda: (f"""select ll.id 
        from lotesgranuladolinha ll
        join lotesdoserslinha ld on ld.loteslinha_id=ll.id
        {f.text}"""), cursor, f.parameters)
        return len(response["rows"])

    def delete(vcr_num,cursor):
        dml = db.dml(TypeDml.DELETE,None,"lotesdoserslinha",{"vcr_num":f'=={vcr_num}'},None,False)
        dml.statement = f"""
                DELETE FROM lotesdoserslinha ld WHERE ld.closed=0 and ld.loteslinha_id in (
                    SELECT ll.id FROM lotesgranuladolinha ll WHERE ll.vcr_num=%(vcr_num)s) and closed = 0
                ) 
        """
        db.execute(dml.statement, cursor, dml.parameters)
        dml = db.dml(TypeDml.DELETE,None,"lotesgranuladolinha",{"closed":0,"vcr_num":f'=={vcr_num}'},None,False)
        db.execute(dml.statement, cursor, dml.parameters)
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                args = (filter["vcr_num"],filter["type_mov"])
                cursor.callproc('delete_granulado_from_line',args)
                
                #ln = checkGranulado(filter["vcr_num"],cursor)
                #if (ln==0):
                #   delete(filter["vcr_num"],cursor)
                #else:
                #    return Response({"status": "error", "title": f"Não é possível eliminar o movimento!"})     
        return Response({"status": "success", "title": "Movimento(s) eliminado(s) com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
def ConsumoGranuladoList(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])

    f.setParameters({
       **rangeP(f.filterData.get('fdatain'), 't_stamp_in', lambda k, v: f'DATE(t_stamp_in)'),
       **rangeP(f.filterData.get('fdataout'), 't_stamp_out', lambda k, v: f'DATE(t_stamp_out)'),
       "n_lote": {"value": lambda v: v.get('flote'), "field": lambda k, v: f'{k}'},
       "ofid": {"value": lambda v: v.get('fof'), "field": lambda k, v: f'{k}'},
       "qty_lote": {"value": lambda v: v.get('fqty'), "field": lambda k, v: f'{k}'},
       "qty": {"value": lambda v: v.get('fqty'), "field": lambda k, v: f'{k}'}
    }, True)
    f.where()
    f.auto()
    f.value("and")

    f2 = filterMulti(request.data['filter'], {
        'fartigo': {"keys": ['artigo_cod', 'artigo_des']}
    }, False, "and" if f.hasFilters else "where" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""mpg.*, sum(consumo_by_of) over (partition by ordem_id,type_mp,artigo_cod) consumo_of_artigo, sum(n_bobinagens) over (partition by ordem_id,type_mp,artigo_cod) nbob_of_artigo"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""
            select * from (
            select {c(f'{dql.columns}')} from consumos_mp mpg          
            ) t
            {f.text} {f2["text"]}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    sqlCount=f"""select count(*) from consumos_mp mpg {f.text} {f2["text"]}"""
    

    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    try:
        response = db.executeList(sql, connection, parameters,[],None,sqlCount)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)


#NÃO SEI O QUE É????
def updateLotesdosers_ig(ig_id):
    connection = connections["default"].cursor()
    #Get do timestamp e acs_id do ig da bobinagem
    #Eliminar as linhas lotesdosers_ig onde o ig=[ig_id]
    #Insert na tabela lotesdosers_ig, com o timestamp do ig atrás atribuído 



    
    # sql = lambda p, c, s: (
    #     f"""
    #             with INLINE AS(
    #             select ld.*,t.qty_lote,t.qty_reminder from(
    #             select 
    #             LAST_VALUE(id) OVER (PARTITION BY vcr_num ORDER BY t_stamp RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) last_entry,
    #             lg.*
    #             from lotesgranuladolinha lg
    #             )t
    #             join lotesdoserslinha ld on ld.loteslinha_id=t.id
    #             where t.id=t.last_entry and  date(t.t_stamp)>='2022-09-26' and t.type_mov=1 and ld.type_mov=1
    #             ),
    #             FORMULACAO AS(
    #             select formulacaov2
    #             from producao_currentsettings cs
    #             where status=3
    #             ),
    #             FORMULACAO_DOSERS AS(
    #             SELECT doser,matprima_cod, arranque,cuba,matprima_des
    #             FROM FORMULACAO F,
    #             JSON_TABLE(F.formulacaov2->'$.items',"$[*]"COLUMNS(cuba VARCHAR(3) PATH "$.cuba",doser VARCHAR(3) PATH "$.doseador",matprima_des VARCHAR(200) PATH "$.matprima_des",matprima_cod VARCHAR(200) PATH "$.matprima_cod",arranque DECIMAL PATH "$.arranque")) frm
    #             WHERE doser is not null and arranque>0
    #             )
    #             SELECT {c(f'{dql.columns}')} 
    #             FROM FORMULACAO_DOSERS FR
    #             LEFT JOIN INLINE IL ON IL.artigo_cod=FR.matprima_cod AND IL.doser=FR.doser
    #             group by FR.cuba,FR.matprima_cod,FR.arranque,IL.n_lote,IL.t_stamp,IL.qty_lote,IL.qty_reminder,FR.matprima_des
    #             {s(dql.sort)}
    #     """
    # )
    pass


#endregion

#region CONSUMOS


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def UpdateConsumos(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                if ("type" in data and data["type"]=="removeconsumos"):
                    try:
                        exists = db.exists("consumos_mp",{"DATE(t_stamp_out)":f'=={filter["t_stamp_out"]}'},cursor).exists
                        if exists==1:
                            dml = db.dml(TypeDml.DELETE,None,"consumos_mp",{"DATE(t_stamp_out)":f'=={filter["t_stamp_out"]}'},None,False)
                            db.execute(dml.statement, cursor, dml.parameters)
                        if "reopen" in filter and filter["reopen"]==1 and "t_stamp_out" in filter:
                             dml = db.dml(TypeDml.UPDATE,{"closed":0,"t_stamp_closed":None},"lotesgranuladolinha",{"DATE(t_stamp_out)":f'=={filter["t_stamp_out"]}',"closed":1},None,False)
                             db.execute(dml.statement, cursor, dml.parameters)
                             dml = db.dml(TypeDml.UPDATE,{"closed":0},"lotesgranuladolinha",{"DATE(t_stamp)":f'=={filter["t_stamp_out"]}',"closed":1,"type_mov":0},None,False)
                             db.execute(dml.statement, cursor, dml.parameters)
                             dml = db.dml(TypeDml.UPDATE,{"closed":0,"t_stamp_closed":None},"lotesnwlinha",{"DATE(t_stamp_out)":f'=={filter["t_stamp_out"]}',"closed":1},None,False)
                             db.execute(dml.statement, cursor, dml.parameters)
                    except Exception as error:
                        return Response({"status": "error", "title": str(error)})
                if ("type" in data and data["type"]=="processconsumos"):
                    try:
                        try:
                            if "granulado" in filter and filter["granulado"]==1:
                                args = (None, None,filter["t_stamp_out"] if "t_stamp_out" in filter else None)
                                cursor.callproc('close_granulado_line',args)
                            if "nonwovens" in filter and filter["nonwovens"]==1:
                                args = (None, None,filter["t_stamp_out"] if "t_stamp_out" in filter else None)
                                cursor.callproc('close_nw_line',args)
                        except Exception as error:
                            return Response({"status": "error", "title": str(error)})
                    except Exception as error:
                        return Response({"status": "error", "title": str(error)})
        return Response({"status": "success", "title": "Conusmo(s) alterado(s) com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": "Erro ao alterar registo(s)!"})



#endregion

#region MP ALTERNATIVAS

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def ListMPAlternativas(request, format=None):
    connection = connections[connGatewayName].cursor()    
    f = Filters({**request.data['filter']})
    f.setParameters({
        "group": {"value": lambda v: v.get('fgroup'), "field": lambda k, v: f'GMP.{k}'}
    }, True)
    f.where(False,"and")
    f.auto()
    f.value("and")

    f2 = filterMulti(request.data['filter'], {
        'fmulti_artigo': {"keys": ['"ITMREF_0"', '"ITMDES1_0"'], "table": 'ITM.'}
    }, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}
    
    parameters = {**f.parameters,**f2["parameters"]}
    dql = dbgw.dql(request.data, False,False)
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")

    cols = f'''ITM."ROWID",GMP.group,GMP.max_in,ITM."ITMREF_0",ITM."ITMDES1_0"'''
    sql = lambda p, c, s: (
        f"""
            SELECT {c(f'{cols}')} 
            FROM {sageAlias}."ITMMASTER" ITM
            LEFT JOIN {sgpAlias}.group_materiasprimas GMP ON GMP.artigo_cod=ITM."ITMREF_0"
            WHERE ((LOWER(ITM."ITMDES1_0") NOT LIKE 'nonwo%%' AND LOWER(ITM."ITMDES1_0") NOT LIKE 'core%%') AND (ITM."ACCCOD_0" = 'PT_MATPRIM'))
            {f.text} {f2["text"]}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}  
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
def SaveMPAlternativas(request, format=None):
    data = request.data.get("parameters")

    def saveItems(data,cursor):
        for idx, item in enumerate(data["rows"]):
            item["`group`"] = item["group"]
            item.pop('group', None) 
            dml = db.dml(TypeDml.INSERT, {**item,"user_id":request.user.id,"t_stamp":datetime.now()}, "group_materiasprimas",None,None,False)
            dml.statement = f"""
                    {dml.statement}
                    ON DUPLICATE KEY UPDATE 
                        artigo_cod=VALUES(artigo_cod),
                        user_id=VALUES(user_id),
                        t_stamp=VALUES(t_stamp),
                        max_in=VALUES(max_in),
                        `group`=VALUES(`group`)
            """
            db.execute(dml.statement, cursor, dml.parameters)
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                saveItems(data,cursor)
                return Response({"status": "success", "title": "Registos guardados com Sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "content": str(error)})


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def ListMPGroupsLookup(request, format=None):
    conn = connections["default"].cursor()
    cols = ['`group`']
    f = Filters(request.data['filter'])
    f.setParameters({"group":{"value": lambda v: v.get('group'), "field": lambda k, v: f'`{k}`'}}, True)
    f.auto()
    f.where()
    f.value("and")
    

    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    response = db.executeSimpleList(lambda: (
        f"""
            select 
            distinct {dql.columns}
            from group_materiasprimas
            {f.text}
            {dql.sort}
            {dql.limit}
        """
    ), conn, f.parameters)

    return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def GetMPAlternativas(request, format=None):
    conn = connections["default"].cursor()
    cols = ['*']
    
    artigos=""
    if "parameters" in request.data and "artigos" in request.data['parameters'] and len(request.data['parameters']['artigos'])>0:
        artigos = f"""in({','.join(f"'{w}'" for w in request.data['parameters']['artigos'])})"""
    else:
        return Response({"rows":[]})

    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    response = db.executeSimpleList(lambda: (
        f"""
            select {dql.columns} from group_materiasprimas where `group` in (
                SELECT `group` FROM group_materiasprimas gmp where gmp.artigo_cod {artigos}
            )
        """
    ), conn, {})
    print(response)
    return Response(response)

#endregion




@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def MPrimasLookup(request, format=None):
    conn = connections[connGatewayName].cursor()
    cols = ['mprima."ITMREF_0"','mprima."ITMDES1_0"','mprima."ZFAMILIA_0"','mprima."ZSUBFAMILIA_0"','mprima."STU_0"', 'mprima."SAUSTUCOE_0"','mprima."TSICOD_3"']
    
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.value("and")
    
    f2 = filterMulti(request.data['filter'], {
        'fmulti_artigo': {"keys": ['"ITMREF_0"', '"ITMDES1_0"'], "table": 'mprima.'}
    }, False, "and" if f.hasFilters else "where" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    qty = None if "qty" not in request.data['parameters'] else request.data['parameters']['qty']
    type = None if "type" not in request.data['parameters'] else request.data['parameters']['type']
    cfilter = ""
    if type=='nonwovens':
        cfilter = f"""LOWER("ITMDES1_0") LIKE 'nonwo%%' AND LOWER("ITMDES1_0") LIKE '%%gsm%%' AND ("ACCCOD_0" = 'PT_MATPRIM')"""
    elif type=='cores':
        print(request.data['parameters'])
        print("aaaaaaa")
        core = int(int(request.data['parameters']['core']) * 25.4)
        largura = str(request.data['parameters']['largura'])[:-1]
        #cfilter = f"""LOWER("ITMDES1_0") LIKE 'core%%%% {core}%%x%%x{largura}_ mm%%' AND ("ACCCOD_0" = 'PT_EMBALAG')"""
        cfilter = f"""LOWER("ITMDES1_0") LIKE 'core%%%% {core}%%x%%x%%_%%mm%%' AND ("ACCCOD_0" = 'PT_EMBALAG')"""
        print("largura")
        print(largura)
    elif type == 'all':
        cfilter=''
    else:
        cfilter = f"""(LOWER("ITMDES1_0") NOT LIKE 'nonwo%%' AND LOWER("ITMDES1_0") NOT LIKE 'core%%') AND ("ACCCOD_0" = 'PT_MATPRIM')"""

    if cfilter != "":
        cfilter = f"and ({cfilter})" if f.hasFilters or f2["hasFilters"] else f"where ({cfilter})"

    dql = dbgw.dql(request.data, False)
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")
    if qty is None:
        dql.columns = encloseColumn(cols,False)
        response = dbgw.executeSimpleList(lambda: (
            f"""
                select 
                {dql.columns}
                from {sageAlias}."ITMMASTER" mprima
                {f.text} {f2["text"]} {cfilter}
                {dql.sort}
                {dql.limit}
            """
        ), conn, parameters)
    else:
        cols.append('ST."QTYPCU_0"')
        dql.columns = encloseColumn(cols,False)
        response = dbgw.executeSimpleList(lambda: (
            f"""                
                select
                {dql.columns}
                from {sageAlias}."ITMMASTER" mprima
                join (
                SELECT "ITMREF_0","QTYPCU_0" FROM (
                SELECT "ITMREF_0","QTYPCU_0","ROWID", MAX("ROWID") OVER (PARTITION BY ST."ITMREF_0") MX FROM {sageAlias}."STOJOU" ST 
                WHERE "VCRTYP_0"=6 AND "QTYPCU_0">0 ORDER BY "CREDATTIM_0"
                ) tt where tt."ROWID"=MX
                ) ST on mprima."ITMREF_0"=ST."ITMREF_0"
                {f.text} {f2["text"]} {cfilter}
                {dql.sort}
                {dql.limit}
            """
        ), conn, parameters)




    return Response(response)
