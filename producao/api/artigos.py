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

# def export(sql, db_parameters, parameters,conn_name):
#     if ("export" in parameters and parameters["export"] is not None):
#         dbparams={}
#         for key, value in db_parameters.items():
#             if f"%({key})s" not in sql: 
#                 continue
#             dbparams[key] = value
#             sql = sql.replace(f"%({key})s",f":{key}")
#         hash = base64.b64encode(hmac.new(bytes("SA;PA#Jct\"#f.+%UxT[vf5B)XW`mssr$" , 'utf-8'), msg = bytes(sql , 'utf-8'), digestmod = hashlib.sha256).hexdigest().upper().encode()).decode()
#         req = {
            
#             "conn-name":conn_name,
#             "sql":sql,
#             "hash":hash,
#             "data":dbparams,
#             **parameters
#         }
#         wService = "runxlslist" if parameters["export"] == "clean-excel" else "runlist"
#         fstream = requests.post(f'http://192.168.0.16:8080/ReportsGW/{wService}', json=req)

#         if (fstream.status_code==200):
#             resp =  HttpResponse(fstream.content, content_type=fstream.headers["Content-Type"])
#             if (parameters["export"] == "pdf"):
#                 resp['Content-Disposition'] = "inline; filename=list.pdf"
#             elif (parameters["export"] == "excel"):
#                 resp['Content-Disposition'] = "inline; filename=list.xlsx"
#             elif (parameters["export"] == "word"):
#                 resp['Content-Disposition'] = "inline; filename=list.docx"
#             if (parameters["export"] == "csv"):
#                 resp['Content-Disposition'] = "inline; filename=list.csv"
#             return resp

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
    


def ArtigosSageLookup(request, format=None):
    connection = connections[connGatewayName].cursor()
    r = PostData(request)
    pf = ParsedFilters(r.filter,"where",r.apiversion)

    # _filter = {} if r.apiversion=="4" else r.filter
    # f = Filters(_filter)
    # f.setParameters({}, False)
    # f.where()
    # f.value()

    # f2 = filterMulti(_filter, {
    #     'fartigo': {"keys": ['cod', 'des'], "table": ''}
    # }, False, "and" if f.hasFilters else "where" ,False)
    # parameters = {**f.parameters, **f2['parameters'],**pf.parameters}
    sageAlias = dbgw.dbAlias.get("sage")
    parameters = {**pf.parameters}
    dql = dbgw.dql(request.data, False)
    cols = f""""ITMREF_0","ITMDES1_0","TSICOD_0","TSICOD_1","TSICOD_2","TSICOD_3","TSICOD_4","STU_0",pa.gtin,pa.lar """
    dql.columns=encloseColumn(cols,False)
    sql = lambda: (f"""
        select {f'{dql.columns}'} 
        from {sageAlias}."ITMMASTER" as itm 
        left join "SGP-PROD".producao_artigo pa on pa.cod=itm."ITMREF_0"
        {pf.group()} {dql.sort} {dql.limit}
    """)
    if ("export" in r.data):
        dql.limit=f"""limit {r.data.get("limit")}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=r.data,conn_name=AppSettings.reportConn["gw"],dbi=dbgw,conn=connection)
    try:
        response = db.executeSimpleList(sql, connection, parameters,[],r.norun)
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def ArtigosLookup(request, format=None):
    connection = connections["default"].cursor()
    r = PostData(request)
    pf = ParsedFilters(r.filter,"where",r.apiversion)

    _filter = {} if r.apiversion=="4" else r.filter
    f = Filters(_filter)
    f.setParameters({}, False)
    f.where()
    f.value()

    f2 = filterMulti(_filter, {
        'fartigo': {"keys": ['cod', 'des'], "table": ''}
    }, False, "and" if f.hasFilters else "where" ,False)
    parameters = {**f.parameters, **f2['parameters'],**pf.parameters}

    dql = db.dql(request.data, False)
    cols = f"""*"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda: (f"""select {f'{dql.columns}'} from producao_artigo {pf.group()} {f.text} {f2["text"]} {dql.sort} {dql.limit}""")
    if ("export" in r.data):
        dql.limit=f"""limit {r.data.get("limit")}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=r.data,conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    try:
        response = db.executeSimpleList(sql, connection, parameters,[],r.norun)
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def ArtigosCompativeisGroupsLookup(request, format=None):
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
            from group_artigos
            {f.text}
            {dql.sort}
            {dql.limit}
        """
    ), conn, f.parameters)

    return Response(response)

def ArtigosSpecsParametersUnitLookup(request, format=None):
    conn = connections["default"].cursor()
    cols = ['unit']
    f = Filters(request.data['filter'])
    f.setParameters({"unit":{"value": lambda v: Filters.getUpper(v.get("unit")), "field": lambda k, v: f'upper({k})'}}, True)
    f.auto()
    f.where()
    f.value("and")    

    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    response = db.executeSimpleList(lambda: (
        f"""
            select 
            distinct {dql.columns}
            from producao_artigospecsparams
            {f.text}
            {dql.sort}
            {dql.limit}
        """
    ), conn, f.parameters)

    return Response(response)

def NewArtigosSpecsParameter(request, format=None):
    data = request.data.get("parameters").get("data")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                dml = db.dml(TypeDml.INSERT, {**data, "t_stamp":datetime.now(),"user_id":request.user.id}, "producao_artigospecsparams",None,None,False)
                print(dml.statement)
                print(dml.parameters)
                db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo criado com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao criar registo! {str(error)}"})

def UpdateArtigosSpecsParameter(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                if "rows" in data:
                    for idx, item in enumerate(data.get("rows")):
                        id = item.get("id")
                        del item["id"]
                        del item["rowvalid"]
                        del item["t_stamp"]
                        dml = db.dml(TypeDml.UPDATE,{**item, "t_stamp_updated":datetime.now(),"user_id":request.user.id},"producao_artigospecsparams",{"id":Filters.getNumeric(id)},None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo(s) alterado(s) com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao alterar registo(s)! {str(error)}"})

def ListArtigosSpecsParameters(request, format=None):
    connection = connections["default"].cursor()    
    f = Filters({**request.data['filter']})
    f.setParameters({
        "designacao": {"value": lambda v: Filters.getUpper(v.get('fdes')), "field": lambda k, v: f'upper({k})'},
        # "produto_cod": {"value": lambda v: v.get('fproduto'), "field": lambda k, v: f'pp.{k}'},
        # "core": {"value": lambda v: v.get('fcore'), "field": lambda k, v: f'pa.{k}'},
        # "lar": {"value": lambda v: v.get('flar'), "field": lambda k, v: f'pa.{k}'},
        # "des": {"value": lambda v: v.get('fdes'), "field": lambda k, v: f'pa.{k}'},
        # "cod": {"value": lambda v: v.get('fcod'), "field": lambda k, v: f'pa.{k}'},
        # "gsm": {"value": lambda v: v.get('fgsm'), "field": lambda k, v: f'pa.{k}'}
    }, True)
    f.where()
    f.auto()
    f.value("and")

    f2 = filterMulti(request.data['filter'], {
        # 'fmulti_artigo': {"keys": ['"ITMREF_0"', '"ITMDES1_0"'], "table": 'ITM.'}
    }, False, "and" if f.hasFilters else "where" ,False)
    parameters = {**f.parameters, **f2['parameters']}
    dql = db.dql(request.data, False,False)

    cols = f"""*"""
    sql = lambda p, c, s: (
        f"""
            SELECT {c(f'{cols}')} 
            FROM producao_artigospecsparams asp
            {f.text} {f2["text"]}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}  
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    response = db.executeList(sql, connection, parameters, [])
    return Response(response)

def ListArtigosCompativeis(request, format=None):
    connection = connections["default"].cursor()    
    f = Filters({**request.data['filter']})
    f.setParameters({
        "group": {"value": lambda v: v.get('fgroup'), "field": lambda k, v: f'ga.{k}'},
        "produto_cod": {"value": lambda v: v.get('fproduto'), "field": lambda k, v: f'pp.{k}'},
        "core": {"value": lambda v: v.get('fcore'), "field": lambda k, v: f'pa.{k}'},
        "lar": {"value": lambda v: v.get('flar'), "field": lambda k, v: f'pa.{k}'},
        "des": {"value": lambda v: v.get('fdes'), "field": lambda k, v: f'pa.{k}'},
        "cod": {"value": lambda v: v.get('fcod'), "field": lambda k, v: f'pa.{k}'},
        "gsm": {"value": lambda v: v.get('fgsm'), "field": lambda k, v: f'pa.{k}'}
    }, True)
    f.where()
    f.auto()
    f.value("and")

    f2 = filterMulti(request.data['filter'], {
        # 'fmulti_artigo': {"keys": ['"ITMREF_0"', '"ITMDES1_0"'], "table": 'ITM.'}
    }, False, "and" if f.hasFilters else "where" ,False)
    parameters = {**f.parameters, **f2['parameters']}
    dql = db.dql(request.data, False,False)

    cols = f"""ga.*,pa.*,pp.produto_cod"""
    sql = lambda p, c, s: (
        f"""
            SELECT {c(f'{cols}')} 
            FROM producao_artigo pa
            LEFT JOIN group_artigos ga ON pa.id=ga.artigo_id
            LEFT JOIN producao_produtos pp ON pp.id=pa.produto_id
            {f.text} {f2["text"]}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}  
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    response = db.executeList(sql, connection, parameters, [])
    return Response(response)

def UpdateArtigosCompativeis(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                if "rows" in data:
                    for idx, item in enumerate(data.get("rows")):
                        if item.get("group") is None:
                            dml = db.dml(TypeDml.DELETE,None,"group_artigos",{"artigo_id":f'=={item.get("artigo_id")}'},None,False)
                            db.execute(dml.statement, cursor, dml.parameters)
                        else:
                            item["`group`"] = item.get("group")
                            del item["group"]
                            dml = db.dml(TypeDml.INSERT, {**item, "t_stamp":datetime.now(),"user_id":request.user.id}, "group_artigos",None,None,False)
                            dml.statement = f"""
                                {dml.statement}
                                ON DUPLICATE KEY UPDATE 
                                    artigo_id=VALUES(artigo_id),
                                    `group`=VALUES(`group`),
                                    t_stamp=VALUES(t_stamp),
                                    user_id=VALUES(user_id)
                                """
                            db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo(s) alterado(s) com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao alterar registo(s)! {str(error)}"})

def ListVolumeProduzidoArtigos(request, format=None):
    connection = connections["default"].cursor()    
    f = Filters({**request.data['filter']})
    f.setParameters({
        **rangeP(f.filterData.get('fdata'), 'pb2.data', lambda k, v: f'{k}'),
        # "group": {"value": lambda v: v.get('fgroup'), "field": lambda k, v: f'ga.{k}'},
        # "produto_cod": {"value": lambda v: v.get('fproduto'), "field": lambda k, v: f'pp.{k}'},
        # "core": {"value": lambda v: v.get('fcore'), "field": lambda k, v: f'pa.{k}'},
        # "lar": {"value": lambda v: v.get('flar'), "field": lambda k, v: f'pa.{k}'},
        # "des": {"value": lambda v: v.get('fdes'), "field": lambda k, v: f'pa.{k}'},
        # "cod": {"value": lambda v: v.get('fcod'), "field": lambda k, v: f'pa.{k}'},
        # "gsm": {"value": lambda v: v.get('fgsm'), "field": lambda k, v: f'pa.{k}'}
    }, True)
    f.where()
    f.auto()
    f.add("pb.ig_id is not null",True)
    f.value("and")

    f2 = filterMulti(request.data['filter'], {
        # 'fmulti_artigo': {"keys": ['"ITMREF_0"', '"ITMDES1_0"'], "table": 'ITM.'}
    }, False, "and" if f.hasFilters else "where" ,False)
    parameters = {**f.parameters, **f2['parameters']}
    dql = db.dql(request.data, False,False)

    cols = f"""*"""
    sql = lambda p, c, s: (
        f"""
            SELECT {c(f'{cols}')} FROM(
            SELECT pb.artigo_id,pa.cod, pa.des,IFNULL(pp.produto_cod,pa.produto) produto, sum(pb2.comp*(pb.lar/1000)) area  
            from producao_bobine pb
            join producao_bobinagem pb2 on pb2.id=pb.bobinagem_id
            join producao_artigo pa on pa.id=pb.artigo_id
            left join producao_produtos pp on pp.id=pa.produto_id
            {f.text}
            group by artigo_id
            ) t
            {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    response = db.executeList(sql, connection, parameters, [])
    return Response(response)

def ClientesLookup(request, format=None):
    cols = ['*']
    r = PostData(request)
    pf = ParsedFilters(r.filter,"where",r.apiversion)

    _filter = {} if r.apiversion=="4" else r.filter
    f = filterMulti(_filter, {'fmulti_customer': {"keys": ["BPCNUM_0","BPCNAM_0"]}})
    parameters = {**f['parameters'],**pf.parameters}

    dql = dbgw.dql(request.data, False)
    sgpAlias = dbgw.dbAlias.get("sgp")
    sageAlias = dbgw.dbAlias.get("sage")
    #dql.columns = encloseColumn(cols)
    with connections[connGatewayName].cursor() as cursor:
        if dql.paging:
            sql = lambda p, c, s: (
                f"""
                    SELECT {c(dql.columns)} 
                    FROM mv_clientes_sage
                    {pf.group()}
                    {f["text"]}
                    {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}  
                """
            )
            response = db.executeList(sql, cursor, parameters, [])
        else:
            response = dbgw.executeSimpleList(lambda: (
                f'SELECT {dql.columns} FROM mv_clientes_sage {f["text"]} {dql.sort} {dql.limit}'
            ), cursor, parameters)
            response["rows"].append({"BPCNUM_0":'0',"BPCNAM_0":"Elastictek"})
            response["rows"].append({"BPCNUM_0":'1',"BPCNAM_0":"Industrialização"})
            response["rows"].append({"BPCNUM_0":'2',"BPCNAM_0":"Regranular"})
            response["rows"].append({"BPCNUM_0":'3',"BPCNAM_0":"Sem alternativa"})
        return Response(response)

def ProdutosLookup(request, format=None):
    cols = ['id','produto_cod']
    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    if "idSelector" in request.data['filter']:
        f = Filters(request.data['filter'])
        f.setParameters({}, False)
        f.where()
        f.add(f'id = :idSelector', True)
        f.value()
        try:
            with connections["default"].cursor() as cursor:
                response = db.executeSimpleList(lambda: (f"""SELECT {dql.columns} FROM producao_produtos {f.text}"""), cursor, f.parameters)
        except Error as error:
            print(str(error))
            return Response({"status": "error", "title": str(error)})
        return Response(response)

    
    f = filterMulti(request.data['filter'], {'fcod': {"keys": ["produto_cod"]}},True,False,False)
    parameters = {**f['parameters']}
    with connections["default"].cursor() as cursor:
       response = db.executeSimpleList(lambda: (
         f'SELECT {dql.columns} FROM producao_produtos {f["text"]} {dql.sort} {dql.limit}'
       ), cursor, parameters)
       return Response(response)

# def GetQuarters(request, format=None):
#     with connections["default"].cursor() as cursor:
#        response = db.executeSimpleList(lambda: (f"""
#         with last_period as(    
#         SELECT y,q,doc_version 
#         FROM producao_saleprices sp 
#         order by y desc,q desc, doc_version limit 1
#         )
#         select t.*,IF(last_q<>current_q or last_y<>current_y,0,1) valid,IF(last_q<>current_q or last_y<>current_y,current_q,last_q) valid_q,IF(last_q<>current_q or last_y<>current_y,current_y,last_y) valid_y  from (
#         SELECT 
#         QUARTER(NOW()) current_q, YEAR(NOW()) current_y, IF(QUARTER(NOW()) < 4,QUARTER(NOW()) + 1,1) next_q,IF(QUARTER(NOW()) = 4,YEAR(NOW()) + 1,YEAR(NOW())) next_y,
#         (select q from last_period) last_q,(select y from last_period) last_y
#         ) t
#        """), cursor, {})       
#        return Response(response.get("rows")[0])



# def GetOpenQuarter(request, format=None):
#     with connections["default"].cursor() as cursor:
#        response = db.executeSimpleList(lambda: (f"""
#         WITH QY AS(SELECT q,y from producao_saleprices where `status`=0 order by id desc limit 1)
#         SELECT IFNULL((SELECT q from QY),QUARTER(NOW())) q,IFNULL((SELECT y from QY),YEAR(NOW())) y
#        """), cursor, {})       
#        return Response(response.get("rows")[0])

def _getDoc(id,cursor):
    r = db.executeSimpleList(lambda: (f"""select * from producao_saleprices_doc where id={id}"""), cursor, {})
    if len(r["rows"])>0:
        return r["rows"][0]
    return False

def _getRow(id,cursor):
    r = db.executeSimpleList(lambda: (f"""select * from producao_saleprices where id={id}"""), cursor, {})
    if len(r["rows"])>0:
        return r["rows"][0]
    return False

def _getClosedDoc(cursor):
    r = db.executeSimpleList(lambda: (f"""select * from producao_saleprices_doc where doc_status = 2 limit 1"""), cursor, {})
    if len(r["rows"])>0:
        return r["rows"][0]
    return False

def _getInRevisionDoc(cursor):
    r = db.executeSimpleList(lambda: (f"""select * from producao_saleprices_doc where doc_status = 1 limit 1"""), cursor, {})
    if len(r["rows"])>0:
        return r["rows"][0]
    return False

def _getLastDocs(cursor):
    r = db.executeSimpleList(lambda: (f"""select * from producao_saleprices_doc where doc_status in (0,2)"""), cursor, {})
    if len(r["rows"])>0:
        return r["rows"]
    return []

def _areDocsInElaboration(cursor):
    r = db.executeSimpleList(lambda: (f"""select * from producao_saleprices_doc where doc_status = 0 limit 1"""), cursor, {})
    return r["rows"][0] if len(r["rows"])>0 else False

def _checkCurrentQuarter(qdate,cursor):
    current_date = date.today()
    quarter_start = date(current_date.year, (current_date.month - 1) // 3 * 3 + 1, 1)
    if isinstance(qdate, str):
        return False if datetime.strptime(qdate, "%Y-%m-%d").date() < quarter_start else True
    return False if qdate < quarter_start else True   

def _getDocVersion(cursor):
    response = db.executeSimpleList(lambda: (f"""SELECT IFNULL(max(doc_version),0)+1 doc_version from producao_saleprices_doc"""), cursor, {})
    if len(response["rows"])>0:
        return response["rows"][0]["doc_version"]
    return 1


def GetLastDocs(request, format=None):
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                return Response({"status": "success", "data": _getLastDocs(cursor)})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro! {str(error)}"})    

def NewSalePricesDoc(request, format=None):
    data = request.data.get("parameters")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                _exists = _areDocsInElaboration(cursor)
                _isvalid = _checkCurrentQuarter(data.get("qdate"),cursor)
                if _exists:
                    raise Exception("Existe um documento em elaboração!")
                if not _isvalid:
                    raise Exception(f"O período Q{data.get('q')} {data.get('y')} não é valido!")
                _doc_version = _getDocVersion(cursor)
                dml = db.dml(TypeDml.INSERT, {
                    "doc_status":0,
                    "q":data.get("q"), 
                    "y":data.get("y"), 
                    "qdate":data.get("qdate"), 
                    "doc_version":_doc_version,
                    "t_stamp":datetime.now(),
                    "user_id":request.user.id
                }, "producao_saleprices_doc",None,None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                doc_id = cursor.lastrowid
                if "copyFrom" in data and doc_id:
                    dml = db.dml(TypeDml.INSERT, {}, "producao_saleprices",None,None,False)
                    statement = f"""
                        insert into producao_saleprices (cliente_cod, cliente_nome, pais_cod, pais_des, incoterm, cond_pag_cod, cond_pag_des, produto, gsm, gsm_des, quotation_exw, sqm, quotation_final, status, t_stamp, 
                        t_stamp_approved, user_id, user_id_approved, t_stamp_update, user_id_update, doc_id)
                        select 
                        cliente_cod, cliente_nome, pais_cod, pais_des, incoterm, cond_pag_cod, cond_pag_des, produto, gsm, gsm_des, quotation_exw, sqm, quotation_final, 0 status, now() t_stamp, null t_stamp_approved, {request.user.id} user_id, 
                        null user_id_approved,null t_stamp_update, null user_id_update, {doc_id} doc_id
                        from producao_saleprices ps where doc_id = (select id from producao_saleprices_doc psd where psd.y={data.get("copyFrom").get("y")} and psd.q={data.get("copyFrom").get("q")} and doc_status=2)
                   """
                    db.execute(statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Documento criado com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao criar documento! {str(error)}"})

def CloseSalePricesDoc(request, format=None):
    data = request.data.get("parameters")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                _exists = _areDocsInElaboration(cursor)
                if not _exists:
                    raise Exception("O documento não se encontra em elaboração!")
                if _exists.get("y")!=data.get("y") or _exists.get("q")!=data.get("q") or _exists.get("id")!=data.get("doc_id"):
                    raise Exception("O documento não é válido para alteração de estado!")
                _closedDoc = _getClosedDoc(cursor)
                if _closedDoc:
                    #Colocar em obsoleto Documento anterior em que doc_status=2 (Fechado)
                    dml = db.dml(TypeDml.UPDATE,{"doc_status":-1,"user_id_update":request.user.id,"t_stamp_update":datetime.now()},"producao_saleprices_doc",{"id":Filters.getNumeric(_closedDoc.get("id"))},None,False)
                    db.execute(dml.statement, cursor, dml.parameters)
                    #Colocar as linhas como obsoleto (apenas as que se encontravam aprovadas.)
                    dml = db.dml(TypeDml.UPDATE,{"status":-1,"user_id_update":request.user.id,"t_stamp_update":datetime.now()},"producao_saleprices",{"doc_id":Filters.getNumeric(_closedDoc.get("id")),"status":2},None,False)
                    db.execute(dml.statement, cursor, dml.parameters)
                dml = db.dml(TypeDml.UPDATE,{"doc_status":2,"user_id_closed":request.user.id,"t_stamp_closed":datetime.now(),"user_id_update":request.user.id,"t_stamp_update":datetime.now()},"producao_saleprices_doc",{"id":Filters.getNumeric(_exists.get("id"))},None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Documento fechado com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao fechar documento! {str(error)}"})

def NewSalePricesRevision(request, format=None):
    data = request.data.get("parameters")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:

                _exists = _getInRevisionDoc(cursor)
                _isvalid = _checkCurrentQuarter(data.get("qdate"),cursor)
                if _exists:
                    raise Exception("Existe um documento em revisão de preços!")
                if not _isvalid:
                    raise Exception(f"O período Q{data.get('q')} {data.get('y')} não é valido!")
                _closed = _getClosedDoc(cursor)
                if _closed.get("y")!=data.get("y") or _closed.get("q")!=data.get("q") or _closed.get("id")!=data.get("doc_id"):
                    raise Exception("O documento não é válido para revisão de preços!")
                #Colocar o documento que se encontra em doc_status=2 (Fechado) em estado de revisão doc_status=1 (Em revisão)
                dml = db.dml(TypeDml.UPDATE,{"doc_status":1,"user_id_update":request.user.id,"t_stamp_update":datetime.now(),"user_id_inrevision":request.user.id,"t_stamp_inrevision":datetime.now()},"producao_saleprices_doc",{"id":Filters.getNumeric(_closed.get("id"))},None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                _doc_version = _getDocVersion(cursor)
                dml = db.dml(TypeDml.INSERT, {
                    "doc_status":0,
                    "q":_closed.get("q"), 
                    "y":_closed.get("y"), 
                    "qdate":_closed.get("qdate"), 
                    "doc_version":_doc_version,
                    "t_stamp":datetime.now(),
                    "user_id":request.user.id
                }, "producao_saleprices_doc",None,None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                doc_id = cursor.lastrowid
                dml = db.dml(TypeDml.INSERT, {}, "producao_saleprices",None,None,False)
                statement = f"""
                    insert into producao_saleprices (cliente_cod, cliente_nome, pais_cod, pais_des, incoterm, cond_pag_cod, cond_pag_des, produto, gsm, gsm_des, quotation_exw, sqm, quotation_final, status, t_stamp, 
                    t_stamp_approved, user_id, user_id_approved,t_stamp_update, user_id_update, doc_id)
                    select 
                    cliente_cod, cliente_nome, pais_cod, pais_des, incoterm, cond_pag_cod, cond_pag_des, produto, gsm, gsm_des, quotation_exw, sqm, quotation_final, 0 status, now() t_stamp, null t_stamp_approved, {request.user.id} user_id, 
                    null user_id_approved,null t_stamp_update, null user_id_update, {doc_id} doc_id
                    from producao_saleprices ps where doc_id = (select id from producao_saleprices_doc psd where psd.id={_closed.get("id")})
                """
                db.execute(statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Documento de revisão de preços criado com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao criar documento de revisão de preços! {str(error)}"})

def DeleteSalePricesRow(request, format=None):
    data = request.data.get("parameters")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                _row = _getRow(data.get("id"),cursor)
                if not _row:
                    raise Exception("A linha não existe!")
                if _row.get("status")!=0:
                    raise Exception("O estado da linha não se encontra em elaboração!")
                _doc = _getDoc(_row.get("doc_id"),cursor)
                if _doc.get("doc_status")!=0:
                    raise Exception("O estado do documento não se encontra em elaboração!")
                #Colocar como obsoleto a linha "sibling - irmã" (status) que se encontra em doc_status in (1,2) (em Revisão ou Fechado) e status=2 (aprovado)
                dml = db.dml(TypeDml.UPDATE,{"sp.status":-1,"sp.user_id_update":request.user.id,"sp.t_stamp_update":datetime.now()},"producao_saleprices",{
                    "sp.cliente_cod":Filters.getNumeric(_row.get("cliente_cod")),
                    "sp.produto":f'=={_row.get("produto")}',
                    "sp.gsm_des":f'=={_row.get("gsm_des")}',
                    "sp.status":Filters.getNumeric(2),
                    "sp.status":"in:1,2", #em revisão ou fechado
                    "d.doc_status":"in:1,2" #em revisão ou fechado
                },None,False)
                statement = f"""
                    update producao_saleprices sp
                    join producao_saleprices_doc d on d.id = sp.doc_id
                    set {",".join(dml.tags)}
                    {dml.filter}
                """
                db.execute(statement, cursor, dml.parameters)
                dml = db.dml(TypeDml.DELETE,None,"producao_saleprices",{"id":Filters.getNumeric(_row.get("id")),"status":Filters.getNumeric(0)},None,False)
                db.execute(dml.statement, cursor, dml.parameters)
        return Response({"status": "success", "title": "Linha eliminada com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao eliminar linha! {str(error)}"})

def UpdateSalePricesRows(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                if "rows" in data:
                    for idx, item in enumerate(data.get("rows")):
                        id = item.get("id")
                        _original_cliente_cod = item.get("original_cliente_cod")
                        _original_produto = item.get("original_produto")
                        _original_gsm_des = item.get("original_gsm_des")
                        item = delKeys(item,["id","rowvalid","t_stamp","original_cliente_cod","original_produto","original_gsm_des","q","y","qdate","doc_version","doc_status","bdelete"])
                        #Colocar como obsoleto a linha "sibling - irmã" (status) que se encontra em doc_status in 1,2 (em revisão ou Fechado) 
                        #e status=2 (aprovado), apenas se o novo status=2 (aprovado)
                        #com o original e com o updated
                        if (_original_cliente_cod!=item.get("cliente_cod")) or (_original_produto!=item.get("produto")) or (_original_gsm_des!=item.get("gsm_des")):
                            dml = db.dml(TypeDml.UPDATE,{"sp.status":-1,"sp.user_id_update":request.user.id,"sp.t_stamp_update":datetime.now()},"producao_saleprices",{"sp.cliente_cod":Filters.getNumeric(_original_cliente_cod),"sp.produto":f'=={_original_produto}',"sp.gsm_des":f'=={_original_gsm_des}',"sp.status":"in:1,2","d.doc_status":"in:1,2"},None,False)
                            statement = f"""
                                update producao_saleprices sp
                                join producao_saleprices_doc d on d.id = sp.doc_id
                                set {",".join(dml.tags)}
                                {dml.filter}
                            """
                            db.execute(statement, cursor, dml.parameters)
                            print("-----------------------------------------------original")
                            print(statement)
                            print(dml.parameters)
                        if item.get("status") == 2:
                            dml = db.dml(TypeDml.UPDATE,{"sp.status":-1,"sp.user_id_update":request.user.id,"sp.t_stamp_update":datetime.now()},"producao_saleprices",{"sp.cliente_cod":Filters.getNumeric(item.get("cliente_cod")),"sp.produto":f'=={item.get("produto")}',"sp.gsm_des":f'=={item.get("gsm_des")}',"sp.status":"in:1,2","d.doc_status":"in:1,2"},None,False)
                            statement = f"""
                                update producao_saleprices sp
                                join producao_saleprices_doc d on d.id = sp.doc_id
                                set {",".join(dml.tags)}
                                {dml.filter}
                            """
                            db.execute(statement, cursor, dml.parameters)
                            print("-----------------------------------------------approved")
                            print(statement)
                            print(dml.parameters)
                        dml = db.dml(TypeDml.UPDATE,{**item, "t_stamp":datetime.now(),"user_id":request.user.id},"producao_saleprices",{"id":Filters.getNumeric(id),"status":Filters.getNumeric(0)},None,False)
                        print("-----------------------------------------------current")
                        print(dml.statement)
                        print(dml.parameters)
                        db.execute(dml.statement, cursor, dml.parameters)

                return Response({"status": "success", "title": "Registo(s) alterado(s) com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao alterar registo(s)! {str(error)}"})

def NewSalePricesRows(request, format=None):
    data = request.data.get("parameters").get("data")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                _exists = _areDocsInElaboration(cursor)
                if not _exists:
                    raise Exception("Não existe nenhum documento em elaboração!")
                _isvalid = _checkCurrentQuarter(_exists.get("qdate"),cursor)
                if not _isvalid:
                    raise Exception(f"O período Q{_exists.get('q')} {_exists.get('y')} não é valido!")
                if data.get("doc_id")!=_exists.get("id"):
                    raise Exception("O documento não é válido!")
                item = delKeys(data,["id","rowvalid","t_stamp","rowadded","bdelete","doc_version","q","y","doc_status","qdate","original_cliente_cod","original_produto","original_gsm_des"])

                #Colocar como obsoleto a linha "sibling - irmã" (status) que se encontra em doc_status in (1,2) (em Revisão ou Fechado) e status=2 (aprovado)
                dml = db.dml(TypeDml.UPDATE,{"sp.status":-1,"sp.user_id_update":request.user.id,"sp.t_stamp_update":datetime.now()},"producao_saleprices",{
                    "sp.cliente_cod":Filters.getNumeric(_exists.get("cliente_cod")),
                    "sp.produto":f'=={_exists.get("produto")}',
                    "sp.gsm_des":f'=={_exists.get("gsm_des")}',
                    "sp.status":Filters.getNumeric(2),
                    "sp.status":"in:1,2", #em revisão ou fechado
                    "d.doc_status":"in:1,2" #em revisão ou fechado
                },None,False)
                statement = f"""
                    update producao_saleprices sp
                    join producao_saleprices_doc d on d.id = sp.doc_id
                    set {",".join(dml.tags)}
                    {dml.filter}
                """
                db.execute(statement, cursor, dml.parameters)
                #Adiciona a linha com status=0 (em elaboração)
                dml = db.dml(TypeDml.INSERT, {**item, "status":0,"t_stamp":datetime.now(),"user_id":request.user.id}, "producao_saleprices",None,None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo criado com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao criar registo! {str(error)}"})








def ListSalePrices(request, format=None):
    connection = connections["default"].cursor()
    f = Filters({**request.data['filter']})
    f.setParameters({
        #**rangeP(f.filterData.get('fdata'), 'pb2.data', lambda k, v: f'{k}'),
        # "group": {"value": lambda v: v.get('fgroup'), "field": lambda k, v: f'ga.{k}'},
        # "produto_cod": {"value": lambda v: v.get('fproduto'), "field": lambda k, v: f'pp.{k}'},
        # "core": {"value": lambda v: v.get('fcore'), "field": lambda k, v: f'pa.{k}'},
        "doc_status": {"value": lambda v: Filters.getNumeric(v.get('fdocstatus')), "field": lambda k, v: f'spd.{k}'},
        "y": {"value": lambda v: Filters.getNumeric(v.get('fy')), "field": lambda k, v: f'spd.{k}'},
        "q": {"value": lambda v: Filters.getNumeric(v.get('fq')), "field": lambda k, v: f'spd.{k}'},
        # "cod": {"value": lambda v: v.get('fcod'), "field": lambda k, v: f'pa.{k}'},
        # "gsm": {"value": lambda v: v.get('fgsm'), "field": lambda k, v: f'pa.{k}'}
    }, True)
    f.where()
    f.auto()
    #f.add("pb.ig_id is not null",True)
    f.value("and")

    f2 = filterMulti(request.data['filter'], {
        # 'fmulti_artigo': {"keys": ['"ITMREF_0"', '"ITMDES1_0"'], "table": 'ITM.'}
    }, False, "and" if f.hasFilters else "where" ,False)
    parameters = {**f.parameters, **f2['parameters']}
    dql = db.dql(request.data, False,False)

    cols = f"""sp.*,spd.q,spd.y,spd.qdate,spd.doc_version,spd.doc_status"""
    sql = lambda p, c, s: (
        f"""
            SELECT {c(f'{cols}')} 
            FROM producao_saleprices sp
            JOIN producao_saleprices_doc spd on sp.doc_id = spd.id
            {f.text}
            {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    response = db.executeList(sql, connection, parameters, [])
    return Response(response)


































# def getDocVersion(q,y, cursor):
#     response = db.executeSimpleList(lambda: (f"""        
#         select IF(mx_quarter>0,mx_quarter,mx+1) doc_version from (
#         select IFNULL((select max(doc_version) from producao_saleprices sp where q=2 and y=2023),0) mx_quarter,IFNULL((select max(doc_version) from producao_saleprices sp),0) mx
#         ) t       
#     """), cursor, {})
#     if len(response["rows"])>0:
#         return response["rows"][0]["doc_version"]
#     return None

# def setObsoleteSalePrices(cliente_cod,produto,cursor):
#     dml = db.dml(TypeDml.UPDATE,{"doc_status":-1,"status":-1},"producao_saleprices",{"cliente_cod":Filters.getNumeric(cliente_cod),"produto":f"=={produto}","doc_status":Filters.getNumeric(0,0,"!==")},None,False)
#     #db.execute(dml.statement, cursor, dml.parameters)

# def docInElaboration(doc_version, cursor):
#     response = db.executeSimpleList(lambda: (f"""        
#     select count(*) cnt from producao_saleprices where doc_version={doc_version} and doc_status = 0
#     """), cursor, {})
#     return True if response["rows"][0].get("cnt")>0 else False

# def CloseDocSalePrices(request, format=None):
#     data = request.data.get("parameters")
#     filter = request.data.get("filter")

#     def hasLinesOpened(doc_version, cursor):
#         response = db.executeSimpleList(lambda: (f"""        
#         select count(*) cnt from producao_saleprices where doc_version={doc_version} and status in (0,1)
#         """), cursor, {})
#         return True if response["rows"][0].get("cnt")>0 else False

#     try:
#         with transaction.atomic():
#             with connections["default"].cursor() as cursor:
#                 if docInElaboration(data.get("doc_version"), cursor) == True  and hasLinesOpened(data.get("doc_version"), cursor)==False:
#                     dml = db.dml(TypeDml.UPDATE,{"doc_status":2},"producao_saleprices",{"doc_version":Filters.getNumeric(data.get("doc_version"))},None,False)
#                 else:
#                     raise Exception("O Documento não pode ser fechado!")
#                 return Response({"status": "success", "title": "Registo(s) alterado(s) com sucesso!", "subTitle":None})
#     except Exception as error:
#         return Response({"status": "error", "title": f"Erro ao alterar registo(s)! {str(error)}"})



# def checkNewRevision(q,y, cursor):
#     response = db.executeSimpleList(lambda: (f"""        
#         select cntrevision,IF(current_quarter>q,0,1) valid,q from (
#         select 
#         (select count(*) cntrevision from producao_saleprices sp where sp.doc_status=1) cntrevision,
#         (MAKEDATE(YEAR(CURDATE()), 1) + INTERVAL (QUARTER(CURDATE()) - 1) * 3 MONTH) current_quarter,
#         (select MAX(qdate) from producao_saleprices sp where sp.q={q} and sp.y={y}) q
#         ) t
#     """), cursor, {})
#     if len(response["rows"])>0:
#         return response["rows"][0]
#     return None

# def newSalePricesRevision(request, format=None):
#     data = request.data.get("parameters")
#     filter = request.data.get("filter")
#     try:
#         with transaction.atomic():
#             with connections["default"].cursor() as cursor:
#                 #CONDITIONS
#                 #Se o período atual for inferior ou igual - OK
#                 #Se não existir nenhuma revisão em curso  - OK
#                 #Se o documento em causa estiver Closed (doc_status=2)
#                 v = checkNewRevision(data.get("q"),data.get("y"),cursor)
#                 if v.get("cntrevision")>0:
#                     raise Exception("Existem revisões de preço em curso!")
#                 if v.get("valid")==0:
#                     raise Exception("O período para revisão de preço já não se encontra válido!")
#                 dml = db.dml(TypeDml.UPDATE,{"doc_status":1},"producao_saleprices",{"doc_status":">=0","q":Filters.getNumeric(data.get("q")),"y":Filters.getNumeric(data.get("y"))},None,False)
#                 db.execute(dml.statement, cursor, dml.parameters)
#                 dml = db.dml(TypeDml.INSERT, {}, "producao_saleprices",None,None,False)
#                 statement = f"""
#                     insert into producao_saleprices (cliente_cod, cliente_nome, pais_cod, pais_des, incoterm, cond_pag_cod, cond_pag_des, produto, gsm, gsm_des, 
#                     quotation_exw, sqm, quotation_final, q, y, status, t_stamp, t_stamp_approved, user_id, user_id_approved, 
#                     t_stamp_inrevision, user_id_inrevision, doc_version, doc_status, qdate)
#                     select * from (
#                         with mx_version as(
#                         select max(doc_version) mx from producao_saleprices where q={data.get("q")} and y={data.get("y")}
#                         )
#                         select cliente_cod, cliente_nome, pais_cod, pais_des, incoterm, cond_pag_cod, cond_pag_des, produto, gsm, gsm_des, 
#                         quotation_exw, sqm, quotation_final, q, y, 0 status, now() t_stamp, null t_stamp_approved, user_id, null user_id_approved, 
#                         now() t_stamp_inrevision, user_id_inrevision, (select IFNULL(max(doc_version),0)+1 from producao_saleprices) doc_version, 0 doc_status, qdate 
#                         from producao_saleprices sp
#                         join mx_version mv on mv.mx=sp.doc_version
#                         where sp.q={data.get("q")} and sp.y={data.get("y")}
#                     ) t
#                 """
#                 db.execute(statement, cursor, dml.parameters)
#                 return Response({"status": "success", "title": "Registo(s) alterado(s) com sucesso!", "subTitle":None})
#     except Exception as error:
#         return Response({"status": "error", "title": f"Erro ao alterar registo(s)! {str(error)}"})

















def SalesPriceProdutosLookup(request, format=None):
    cols = f"""*"""
    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    # if "idSelector" in request.data['filter']:
    #     f = Filters(request.data['filter'])
    #     f.setParameters({}, False)
    #     f.where()
    #     f.add(f'id = :idSelector', True)
    #     f.value()
    #     try:
    #         with connections["default"].cursor() as cursor:
    #             response = db.executeSimpleList(lambda: (f"""SELECT {dql.columns} FROM producao_produtos {f.text}"""), cursor, f.parameters)
    #     except Error as error:
    #         print(str(error))
    #         return Response({"status": "error", "title": str(error)})
    #     return Response(response)

    
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'pc.cod = :cliente_cod', True)
    f.value()
    f1 = Filters(request.data['filter'])
    f1.setParameters({}, False)
    f1.where()
    f1.value()
    parameters = {**f.parameters,**f1.parameters}
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                select {dql.columns} from (
                    select distinct pa.formu,pa.gsm, CONCAT(pa.gsm,' ',pa.formu) gsm_des, IF(pa.des like '%%ELA-ACE%%','ELA-ACE',IF(pa.des like '%%ELA-CARDED%%','ELA-CARDED',IF(pa.des like '%%ELA-SPUN%%','ELA-SPUN','ELA-TBS'))) produto
                    from producao_artigocliente pac 
                    join producao_artigo pa on pac.artigo_id =pa.id
                    join producao_cliente pc on pc.id =pac.cliente_id
                    {f.text}
                ) t
                {f1.text}
                {dql.sort} {dql.limit}
            """
        ), cursor, parameters)
        
        return Response(response)




# def NewSalePrices(request, format=None):
#     data = request.data.get("parameters").get("data")
#     try:
#         with transaction.atomic():
#             with connections["default"].cursor() as cursor:
#                 doc_version = getDocVersion(data.get("q"),data.get("y"),cursor)
#                 dml = db.dml(TypeDml.INSERT, {**data, "status":0,
#                     "qdate":f"""(SELECT MAKEDATE({data.get("y")}, 1) + INTERVAL (({data.get("q")} - 1) * 3) MONTH)""", 
#                     "doc_version":doc_version,
#                     "t_stamp":datetime.now(),"user_id":request.user.id
#                 }, "producao_saleprices",None,None,False,["qdate"])
#                 print(dml.statement)
#                 db.execute(dml.statement, cursor, dml.parameters)
#                 return Response({"status": "success", "title": "Registo criado com sucesso!", "subTitle":None})
#     except Exception as error:
#         return Response({"status": "error", "title": f"Erro ao criar registo! {str(error)}"})



