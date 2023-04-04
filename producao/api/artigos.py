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
from decimal import Decimal

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
    
def ArtigosLookup(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.value()

    f2 = filterMulti(request.data['filter'], {
        'fartigo': {"keys": ['cod', 'des'], "table": ''}
    }, False, "and" if f.hasFilters else "where" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""*"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda: (f"""select {f'{dql.columns}'} from producao_artigo {f.text} {f2["text"]} {dql.sort} {dql.limit}""")
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
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    response = db.executeList(sql, connection, parameters, [])
    return Response(response)

def ClientesLookup(request, format=None):
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
       response["rows"].append({"BPCNUM_0":'0',"BPCNAM_0":"Elastictek"})
       response["rows"].append({"BPCNUM_0":'1',"BPCNAM_0":"Industrialização"})
       response["rows"].append({"BPCNUM_0":'2',"BPCNAM_0":"Regranular"})
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