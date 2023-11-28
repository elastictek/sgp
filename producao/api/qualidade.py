import base64
from operator import eq
from pyexpat import features
import re
import csv
import itertools
import io
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
from support.myUtils import  ifNull,try_float

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

def checkArtigosSpecsPlan(id,type,cursor):
    #Check if specifications are in use...
    if type is None:
        f = Filters({"id": id})
        f.where()
        f.add(f'pap.lab_artigospecs_id = :id', True )
        f.value("and")
        exists = db.exists("producao_artigospecs_plan pap", f, cursor).exists
        return exists
    if type == "lab_metodo_id":
        f = Filters({"id": id})
        f.where()
        f.add(f'lab_metodo_id = :id', lambda v:(v!=None) )
        f.value("and")
        row = db.executeSimpleList(lambda: (
        f"""
            select id from producao_artigospecs_plan pap where lab_artigospecs_id in (
                select id from producao_lab_artigospecs pla {f.text}
            ) limit 1
        """
        ), cursor, f.parameters)["rows"]
        if row and len(row)>0:
            return True
        return False
    if type == "parameter_id":
        f = Filters({"id": id})
        f.where()
        f.add(f'parameter_id = :id', lambda v:(v!=None) )
        f.value("and")
        row = db.executeSimpleList(lambda: (
        f"""
            select id from producao_artigospecs_plan pap where lab_artigospecs_id in (
            select id from producao_lab_artigospecs pla where pla.lab_metodo_id in (
                select id from producao_lab_metodos plm2 where id in (select lab_metodo_id from producao_lab_metodoparameters plm)
            )
            ) limit 1
        """
        ), cursor, f.parameters)["rows"]
        if row and len(row)>0:
            return True
        return False
    return False

def LabParametersUnitLookup(request, format=None):
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
            from producao_lab_parameters
            {f.text}
            {dql.sort}
            {dql.limit}
        """
    ), conn, f.parameters)

    return Response(response)

def NewLabParameter(request, format=None):
    data = request.data.get("parameters").get("data")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                dml = db.dml(TypeDml.INSERT, {**data, "t_stamp":datetime.now(),"user_id":request.user.id}, "producao_lab_parameters",None,None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo criado com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao criar registo! {str(error)}"})

def NewLabBulkParameter(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    itm={}
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                if "rows" in data:
                    for idx, item in enumerate(data.get("rows")):
                        # id = item.get("id")
                        if "id" in item:
                            del item["id"]
                        if "rowvalid" in item:
                            del item["rowvalid"]
                        if "rowadded" in item:
                            del item["rowadded"]
                        itm=item
                        dml = db.dml(TypeDml.INSERT,{**item, "t_stamp":datetime.now(),"user_id":request.user.id},"producao_lab_parameters",None,None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo(s) carregado(s) com sucesso!", "subTitle":None})
    except Exception as error:
        print(f"""Erro ao carregar registo(s)! {itm.get("designacao")} {str(error)} """)
        return Response({"status": "error", "title": f"""Erro ao carregar registo(s)! {itm.get("designacao")} {str(error)} """})

#ok
def UpdateLabParameter(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                if "rows" in data:
                    for idx, item in enumerate(data.get("rows")):
                        id = item.get("id")
                        if "id" in item:
                            del item["id"]
                        if "rowvalid" in item:
                            del item["rowvalid"]
                        if "rowadded" in item:
                            del item["rowadded"]
                        if "t_stamp" in item:
                            del item["t_stamp"]
                        dml = db.dml(TypeDml.UPDATE,{**item, "t_stamp_update":datetime.now(),"user_id":request.user.id},"producao_lab_parameters",{"id":Filters.getNumeric(id,"isnull")},None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo(s) alterado(s) com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao alterar registo(s)! {str(error)}"})

def ListLabParameters(request, format=None):
    connection = connections["default"].cursor()    
    f = Filters({**request.data['filter']})
    f.setParameters({
        "designacao": {"value": lambda v: Filters.getUpper(v.get('fdes')), "field": lambda k, v: f'upper({k})'},
        "status": {"value": lambda v: Filters.getNumeric(v.get("status")), "field": lambda k, v: f'{k}'}
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
            FROM producao_lab_parameters asp
            {f.text} {f2["text"]}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}  
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    response = db.executeList(sql, connection, parameters, [])
    return Response(response)

#ok
def DeleteLabParameter(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                inuse = checkArtigosSpecsPlan(filter.get("id"),"parameter_id",cursor)      
                if inuse:
                    return Response({"status": "error", "title": f"A especificação de artigo encontra-se em uso!"})     
                dml = db.dml(TypeDml.DELETE,None,"producao_lab_parameters",{"id":Filters.getNumeric(filter.get("id"),"isnull")},None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo eliminado com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao eliminar registo! {str(error)}"})

def ListLabMetodos(request, format=None):
    connection = connections["default"].cursor()    
    f = Filters({**request.data['filter']})
    f.setParameters({
        "designacao": {"value": lambda v: Filters.getUpper(v.get('fdes')), "field": lambda k, v: f'upper({k})'},
        # "cod": {"value": lambda v: Filters.getUpper(v.get('fartigo_cod')), "field": lambda k, v: f'upper(pa.{k})'},
        # "des": {"value": lambda v: Filters.getUpper(v.get('fartigo_des')), "field": lambda k, v: f'upper(pa.{k})'},
        #"cliente_nome": {"value": lambda v: Filters.getUpper(v.get('fcliente')), "field": lambda k, v: f'upper({k})'},
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

    cols = f"""plm.*"""
    sql = lambda p, c, s: (
        f"""
            SELECT {c(f'{cols}')} 
            FROM producao_lab_metodos plm
            #LEFT JOIN producao_artigo pa on pa.id=plm.artigo_id
            {f.text} {f2["text"]}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}  
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    response = db.executeList(sql, connection, parameters, [])
    return Response(response)

def checkLabMetodo(data,cursor):
    f = Filters({
        # "artigo_id": data.get("artigo_id"),
        # "cliente_cod": data.get("cliente_cod"),
        "designacao": data.get("designacao"),
        "aging": data.get("aging"),
        "owner": data.get("owner")
    })
    f.where()
    # f.add(f'artigo_id {f.nullValue("artigo_id","=:artigo_id")}',True )
    # f.add(f'cliente_cod {f.nullValue("cliente_cod","=:cliente_cod")}',True )
    f.add(f'designacao {f.nullValue("designacao","=:designacao")}',True ),
    f.add(f'aging {f.nullValue("aging","=:aging")}',True ),
    f.add(f'owner {f.nullValue("owner","=:owner")}',True )
    f.value("and")
    exists = db.exists("producao_lab_metodos", f, cursor).exists
    return exists

def NewLabMetodo(request, format=None):
    data = request.data.get("parameters").get("data")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                exists= checkLabMetodo(data,cursor)
                if exists==0:
                    dml = db.dml(TypeDml.INSERT, {**data, "t_stamp":datetime.now(),"user_id":request.user.id}, "producao_lab_metodos",None,None,False)
                    db.execute(dml.statement, cursor, dml.parameters)
                    return Response({"status": "success", "title": "Registo criado com sucesso!", "subTitle":None})
                else:
                    return Response({"status": "error", "title": "Já existe um método definido com as mesmas condições!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao criar registo! {str(error)}"})

#ok
def UpdateLabMetodo(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                inuse = checkArtigosSpecsPlan(filter.get("id"),"lab_metodo_id",cursor)      
                if inuse:
                    return Response({"status": "error", "title": f"A especificação de artigo encontra-se em uso!"})
                if "rows" in data:
                    for idx, item in enumerate(data.get("rows")):
                        id = item.get("id")
                        del item["id"]
                        del item["rowvalid"]
                        del item["t_stamp"]
                        dml = db.dml(TypeDml.UPDATE,{**item, "t_stamp_update":datetime.now(),"user_id":request.user.id},"producao_lab_metodos",{"id":Filters.getNumeric(id,"isnull")},None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo(s) alterado(s) com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao alterar registo(s)! {str(error)}"})

#ok
def DeleteLabMetodo(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                inuse = checkArtigosSpecsPlan(filter.get("id"),"lab_metodo_id",cursor)      
                if inuse:
                    return Response({"status": "error", "title": f"A especificação de artigo encontra-se em uso!"})
                dml = db.dml(TypeDml.DELETE,None,"producao_lab_metodos",{"id":Filters.getNumeric(filter.get("id"),"isnull")},None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo eliminado com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao eliminar registo! {str(error)}"})

def ListLabMetodoParameters(request, format=None):
    connection = connections["default"].cursor()    
    f = Filters({**request.data['filter']})
    f.setParameters({
        "lab_metodo_id": {"value": lambda v: Filters.getNumeric(v.get('lab_metodo_id')), "field": lambda k, v: f'lmp.{k}'},
        #"designacao": {"value": lambda v: Filters.getUpper(v.get('fdes')), "field": lambda k, v: f'upper({k})'},
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

    cols = f"""lmp.*,p.id parameter_id,p.nvalues,p.unit,p.min_value,p.max_value,p.parameter_type,p.parameter_mode,p.value_precision,p.nome parameter_nome,p.designacao parameter_des,lm.designacao metodo_des"""
    sql = lambda p, c, s: (
        f"""
            SELECT {c(f'{cols}')}  
            from producao_lab_metodoparameters lmp
            join producao_lab_parameters p on p.id=lmp.parameter_id
            join producao_lab_metodos lm on lm.id=lmp.lab_metodo_id
            {f.text} {f2["text"]}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}  
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    response = db.executeList(sql, connection, parameters, [])
    return Response(response)

#ok
def DeleteLabMetodoParameter(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                inuse = checkArtigosSpecsPlan(filter.get("id"),"lab_metodo_id",cursor)      
                if inuse:
                    return Response({"status": "error", "title": f"A especificação de artigo encontra-se em uso!"})      
                dml = db.dml(TypeDml.DELETE,None,"producao_lab_metodoparameters",{"id":Filters.getNumeric(filter.get("id"),"isnull")},None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo eliminado com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao eliminar registo! {str(error)}"})

#ok
def UpdateLabMetodoParameters(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                inuse = checkArtigosSpecsPlan(filter.get("id"),"lab_metodo_id",cursor)      
                if inuse:
                    return Response({"status": "error", "title": f"A especificação de artigo encontra-se em uso!"})
                for idx, v in enumerate(data.get("rows")):
                    if v.get("rowadded")==1:
                        values ={"parameter_id":v.get("parameter_id"),"status":v.get("status"),"required":v.get("required"),"decisive":v.get("decisive"), "lab_metodo_id":filter.get("id"), "t_stamp":datetime.now(),"user_id":request.user.id}
                        dml = db.dml(TypeDml.INSERT, values, "producao_lab_metodoparameters",None,None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                    else:
                        values ={"parameter_id":v.get("parameter_id"),"status":v.get("status"),"required":v.get("required"),"decisive":v.get("decisive"), "lab_metodo_id":filter.get("id"), "t_stamp_update":datetime.now(),"user_id":request.user.id}
                        dml = db.dml(TypeDml.UPDATE, values, "producao_lab_metodoparameters",{"id":Filters.getNumeric(v.get("id"),"isnull")},None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Método alterado com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao alterar método! {str(error)}"})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def LoadLabMetodoParametersByFile(request, format=None):
    try:
        uploaded_file = request.FILES.get("file")
        csv_reader = csv.reader(io.TextIOWrapper(uploaded_file))
        block=0
        counter={}
        valuesheader= {}
        for row in csv_reader:
            if not row:
                keys = []
                values=[]
                block = block + 1
            else:
                if (block==2):
                    if row[0].lower() == "nome":
                        incrementCounter(counter,block)
                    if (counter.get(block)==0 and len(keys)==0) and row[0].lower() == "nome":
                        keys=mapper(row,block,counter.get(block))
                        valuesheader = {key.lower(): {} for key in keys[1:]}
                    if row[0].lower().startswith("unidade"):
                        incrementCounter(counter,block)
                        append_dict(valuesheader,keys[1:],[{"unit": x} for x in row[1:]])
                    elif row[0].lower().startswith("parâmetro"):
                        incrementCounter(counter,block)
                        append_dict(valuesheader,keys[1:],[{"designacao": x} for x in row[1:]])
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                new_list = [
                    {"nome": key, "designacao": value['designacao'], "unit": value['unit']} 
                    for key, value in valuesheader.items()
                ]
                return Response({"rows": new_list, "total": len(new_list)})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao carregar parâmetros! {str(error)}"})

def ListLabArtigosSpecs(request, format=None):
    connection = connections["default"].cursor()    
    f = Filters({**request.data['filter']})
    f.setParameters({
        #"lab_metodo_id": {"value": lambda v: Filters.getNumeric(v.get('lab_metodo_id')), "field": lambda k, v: f'lmp.{k}'},
        #"designacao": {"value": lambda v: Filters.getUpper(v.get('fdes')), "field": lambda k, v: f'upper({k})'},
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

    cols = f"""las.*,lm.designacao metodo_designacao,lm.owner,lm.aging,pa.cod,pa.des"""
    sql = lambda p, c, s: (
        f"""
            SELECT {c(f'{cols}')}  
            from producao_lab_artigospecs las
            join producao_lab_metodos lm on lm.id=las.lab_metodo_id
            join producao_artigo pa on pa.id=las.artigo_id
            {f.text} {f2["text"]}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}  
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    response = db.executeList(sql, connection, parameters, [])
    return Response(response)

def NewLabArtigoSpecs(request, format=None):
    data = request.data.get("parameters").get("data")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                if data.get("rowadded")==1:
                    values ={"aging":data.get("aging"),"owner":data.get("owner"),"metodo_designacao":data.get("metodo_designacao"),"artigo_id":data.get("artigo_id"),"cliente_cod":data.get("cliente_cod"),"cliente_nome":data.get("cliente_nome"), "lab_metodo_id":data.get("lab_metodo_id"),"obs":data.get("obs"),"`status`":data.get("status"),"reference":data.get("reference"),"designacao":data.get("designacao"), "t_stamp":datetime.now(),"user_id":request.user.id}
                    dml = db.dml(TypeDml.INSERT, values, "producao_lab_artigospecs",None,None,False)
                    db.execute(dml.statement, cursor, dml.parameters)
                    lastid = cursor.lastrowid
                    dml = db.dml(TypeDml.UPDATE, {}, "",{"lab_metodo_id":Filters.getNumeric(data.get("lab_metodo_id"),"isnull")},None,False)
                    dml.statement = f"""
                        insert into producao_lab_artigospecs_parameters (parameter_des,parameter_nome,`values`,unit,nvalues,min_value,max_value,value_precision,required,decisive,parameter_type,parameter_mode, lab_metodoparameter_id,lab_artigospecs_id,user_id,t_stamp)
                        select plp.designacao,plp.nome,null, plp.unit,plp.nvalues ,plp.min_value ,plp.max_value ,plp.value_precision,plm.required ,plm.decisive,plp.parameter_type,plp.parameter_mode ,plm.id ,{lastid} lab_artigospecs_id,{request.user.id},'{datetime.now()}'
                        from producao_lab_metodoparameters plm
                        join producao_lab_parameters plp on plp.id=plm.parameter_id
                        where lab_metodo_id=%(auto_lab_metodo_id)s
                    """
                    db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Especificação criada com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao criar especificação! {str(error)}"})

#ok
def UpdateLabArtigoSpecs(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                inuse = checkArtigosSpecsPlan(filter.get("id"),None,cursor)      
                if inuse:
                    return Response({"status": "error", "title": f"A especificação de artigo encontra-se em uso!"})
                if "rows" in data:
                    for idx, item in enumerate(data.get("rows")):
                        id = item.get("id")
                        values = {"designacao":item.get("designacao"), "status":item.get("status"), "obs":item.get("obs"),"reference":item.get("reference"),"artigo_id":item.get("artigo_id"),"cliente_cod":item.get("cliente_cod"),"cliente_nome":item.get("cliente_nome")}
                        dml = db.dml(TypeDml.UPDATE,{**values, "user_id":request.user.id,"t_stamp_update":datetime.now()},"producao_lab_artigospecs",{"id":Filters.getNumeric(id,"isnull")},None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo(s) alterado(s) com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao alterar registo(s)! {str(error)}"})

#ok
def DeleteLabArtigoSpecs(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                inuse = checkArtigosSpecsPlan(filter.get("id"),None,cursor)      
                if inuse:
                    return Response({"status": "error", "title": f"A especificação de artigo encontra-se em uso!"})
                dml = db.dml(TypeDml.DELETE,None,"producao_lab_artigospecs_parameters",{"lab_artigospecs_id":Filters.getNumeric(filter.get("id"),"isnull")},None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                dml = db.dml(TypeDml.DELETE,None,"producao_lab_artigospecs",{"id":Filters.getNumeric(filter.get("id"),"isnull")},None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo eliminado com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao eliminar registo! {str(error)}"})

def ListArtigoSpecsParameters(request, format=None):
    connection = connections["default"].cursor()    
    f = Filters({**request.data['filter']})
    f.setParameters({
        "lab_artigospecs_id": {"value": lambda v: Filters.getNumeric(v.get('lab_artigospecs_id')), "field": lambda k, v: f'{k}'},
        #"designacao": {"value": lambda v: Filters.getUpper(v.get('fdes')), "field": lambda k, v: f'upper({k})'},
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
    response = db.executeSimpleList(lambda: (
        f"""
            select {cols}
            from producao_lab_artigospecs_parameters
            {f.text}
            {dql.sort}
            {dql.limit}
        """
    ), connection, f.parameters)
    return Response(response)

#ok
def UpdateArtigoSpecsParameters(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                inuse = checkArtigosSpecsPlan(filter.get("id"),None,cursor)
                if inuse:
                    return Response({"status": "error", "title": f"A especificação de artigo encontra-se em uso!"})
                if "rows" in data:
                    for idx, item in enumerate(data.get("rows")):
                        if item.get("value1") is None or item.get("value2") is None or item.get("value3") is None or item.get("value4") is None:
                            v=None
                        else:
                            v = json.dumps([item.get("value1"),item.get("value2"),item.get("value3"),item.get("value4")])
                        values = {"`values`":v,"required":item.get("required"),"decisive":item.get("decisive"),"user_id":request.user.id,"t_stamp_update":datetime.now()}
                        dml = db.dml(TypeDml.UPDATE,values,"producao_lab_artigospecs_parameters",{"id":Filters.getNumeric(item.get("id"),"isnull")},None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                    dml = db.dml(TypeDml.UPDATE,{"valid":1, "user_id":request.user.id,"t_stamp_update":datetime.now()},"producao_lab_artigospecs",{"id":Filters.getNumeric(filter.get("id"),"isnull")},None,False)
                    db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo(s) alterado(s) com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao alterar registo(s)! {str(error)}"})

def CopyTo(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    print(data)
    print(filter)
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:        
                args = [filter.get("id"),request.user.id]
                cursor.callproc('copy_lab_artigospecs',args)
                return Response({"status": "success", "title": "Especificações copiadas com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao copiar especificações! {str(error)}"})

def ListLabBobinagensEssays(request, format=None):
    connection = connections["default"].cursor()    
    f = Filters({**request.data['filter']})
    f.setParameters({
        #"lab_metodo_id": {"value": lambda v: Filters.getNumeric(v.get('lab_metodo_id')), "field": lambda k, v: f'lmp.{k}'},
        "nome": {"value": lambda v: v.get('fbobinagem'), "field": lambda k, v: f'pbm.{k}'},
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

    # cols = f"""ple.*,pb.id bobinagem_id, pb.nome bobinagem_nome,ple2.tipo_ensaio,ple2.modo_ensaio,ple2.nome_ensaio,ple2.contador_ciclico,ple2.t_stamp,ple2.data_ensaio #,pb2.estado,pb2.destino """
    # sql = lambda p, c, s: (
    #     f"""
    #         SELECT {c(f'{cols}')}  
    #         from producao_bobinagem pb 
    #         left join producao_lab_essaysdata ple on ple.bobinagem_id = pb.id 
    #         left join producao_lab_essaysheader ple2 on ple2.id=ple.essay_id
             
    #         #join producao_bobine pb2 on pb2.id=ple.bobine_id 
    #         {f.text} {f2["text"]}
    #         order by pb.id desc
    #         {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}  
    #     """
    # )
    cols = f"""ROW_NUMBER() OVER() rowid, pleh.id,pleh.modo_ensaio,pleh.tipo_ensaio,pleh.contador_ciclico,pleh.data_ensaio,
               pbm.nome,pbm.tiponwsup,pbm.tiponwinf,
               t.cliente,pbmd.produtos,pbmd.estados,pbmd.bobines
            """
    sql = lambda p, c, s: (
        f"""
            select {c(f'{cols}')}
            from producao_bobinagem pbm
            left join producao_lab_essaysheader pleh on pleh.bobinagem_id=pbm.id
            join producao_bobinagem_data pbmd on pbm.id=pbmd.bobinagem_id,
            JSON_TABLE(pbmd.clientes,'$[*]' COLUMNS (cliente VARCHAR(150) PATH '$')) t
            {f.text} {f2["text"]}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}  
        """
    )

    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    response = db.executeList(sql, connection, parameters, [],None,f"select {dql.currentPage*dql.pageSize+1}")
    return Response(response)


#region TEST SECTION

def _getLabMetodobyArtigoSpecs(id,valid,status,cursor):
    f = Filters({
        "id": id,
        "valid": valid,
        "status":status
    })
    f.where()
    f.add(f'las.id {f.nullValue("id","=:id")}',True )
    f.add(f'las.valid {f.nullValue("valid","=:valid")}',True )
    f.add(f'las.`status` {f.nullValue("status","=:status")}',True )
    f.value("and")
    response = db.executeSimpleList(lambda: (
        f"""
            SELECT lm.*,las.id lab_artigospecs_id   
            from producao_lab_artigospecs las
            join producao_lab_metodos lm on lm.id=las.lab_metodo_id
            {f.text}
        """
    ), cursor, f.parameters)
    return response

def _getLabArtigoSpecsParameters(id,cursor):
    f = Filters({
        "id": id
    })
    f.where()
    f.add(f'las.lab_artigospecs_id {f.nullValue("id","=:id")}',True )
    f.value("and")
    response = db.executeSimpleList(lambda: (
        f"""
            SELECT las.*  
            from producao_lab_artigospecs_parameters las
            {f.text}
        """
    ), cursor, f.parameters)
    return response

def replace(arr, dictionary):
    counts = {}
    output_arr = []
    for elem in arr:
        if elem in dictionary:
            if elem not in counts:
                counts[elem] = 0
            value = dictionary[elem]
            if counts[elem] > 0:
                value += str(counts[elem])
            output_arr.append(value)
            counts[elem] += 1
        else:
            output_arr.append(elem)
    return output_arr

def DoTest(request, format=None):
    print("FIXEDDDD TO CHANGE COME FROM UI")
    data = request.data.get("parameters").get("data")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                metodo = _getLabMetodobyArtigoSpecs(filter.get("id"),1,1,cursor)
                parameters = _getLabArtigoSpecsParameters(filter.get("id"),cursor)
                specs = {d['parameter_nome']: {**d,"values":json.loads(d.get("values"))} for d in parameters.get("rows")}
                if len(metodo.get("rows"))==0:
                    Response({"status": "error", "title": f"As especificações não se encontram válidas ou não existem!"})     
                return Response(LoadTrapeziumTestFile("20230330-10.csv",metodo,specs,request.user.id))

    except Exception as error:
        return Response({"status": "error", "title": f"Erro executar o teste selecionado! {str(error)}"})

def mapper(row,block,counter):
    v = f"[{block}][{counter}]"    
    if v=="[0][0]":
        map = {'Nome do ensaio':"nome_ensaio", 'Modo de ensaio':"modo_ensaio", 'Tipo de ensaio':"tipo_ensaio", 'Título1':"titulo", 'Comentário1':"comentario", 'Palavra-chave':"password", 
         'Nome do produto':"produto", 'Nome do arquivo do ensaio':"filename_ensaio", 'Nome do arquivo do método':"filename_metodo", 'Data do relatório':"data_report", 'Data do ensaio':"data_ensaio", 
         'Velocidade':"velocidade", 'Placa':"placa", 'Lote No:':"lote", 'Contador cíclico':"contador_ciclico"}
        return replace(row,map)
    elif v=="[1][0]":
        return row
    elif v=="[2][0]":
        return row
    
def incrementCounter(counter,block):
    v = 0 if counter.get(block) is None else counter.get(block) + 1
    counter[block] = v

def append_dict(ret,keys, row):
    for i, key in enumerate(keys):
        k = key.lower()
        if (k not in ret):
            ret[k] = {}
        if i < len(row):
            ret[k].update(row[i])

def _getBobinagemData(file,cursor):
        pattern = r"\d{8}-\d{2}" # pattern for "YYYYMMDD-NN"
        match = re.search(pattern, file)
        if match:
            value_found = match.group()
            return db.executeSimpleList(lambda: (f"""select pbm.id,pbm.nome,pb.id bobine_id,pb.nome bobine_nome from producao_bobinagem pbm join producao_bobine pb on pb.bobinagem_id=pbm.id where pbm.nome = '{value_found}'"""), cursor, {})["rows"]
        return None


def LoadTrapeziumTestFile(file,metodo,specs,user_id):
    types_dict = {"traction":"tração","peel":"desgrudar"}
    modes_dict = {"simples":"simples","controle":"controle","cíclico":"cíclico"}

    cursor = connections["default"].cursor()
    with cursor:
        try:
            bdata = _getBobinagemData(file,cursor)
            print(bdata)
            if bdata is None:
                return {"status": "error", "title": "A bobinagem a que se refere o teste não existe!", "subTitle":None}
            storage = FileSystemStorage()
            csv_file = storage.open(f'lab-test-tmp/{file}', 'r')
            csv_reader = csv.reader(csv_file)

            block = 0
            counter={}
            
            keys=[]
            valuesheader={}
            values=[]
            grp={"value":0,"enabled":False,"ciclo":1}

            tblheader = {}
            tblspecs = []
            tbldata = []
            tblgroup = []
            print("READING")
            if tblheader:
                print("uuuuuuuuuuuuuuuuuuuuuuu")
            for row in csv_reader:
                if block!=0 and tblheader:
                    print("ok")
                if not row:
                    valuesheader= {}
                    keys = []
                    #values=[]
                    #grp={"value":0,"enabled":False,"ciclo":1}
                    block = block + 1
                elif (block==0):
                    counter,block,keys,tblheader = block_header(counter,block,row,keys,bdata)
                elif (block==1):
                    counter,block,keys,valuesheader = block1(counter,block,row,keys,valuesheader,tblspecs,bdata)
                elif (block==2):
                    print("")
                    #print("BLOCK2")
                    #print(row)
                #print(row)
            print("header")
            print(tblheader)
            print("specs")
            print(tblspecs)
            csv_file.close()
            return {"status": "success", "title": "Teste executado com sucesso!", "subTitle":None}
        except Exception as error:
            print(error)
            return {"status": "error", "title": f"Erro executar o teste selecionado! {str(error)}"}





def LoadTrapeziumTestFilex(file,metodo,specs,user_id):
    types_dict = {"traction":"tração","peel":"desgrudar"}
    modes_dict = {"simples":"simples","controle":"controle","cíclico":"cíclico"}

    cursor = connections["default"].cursor()
    with cursor:
        try:
            #print("PARAMETERSSSSSSSSS")
            #print(specs)
            #print("##################") 
            bdata = _getBobinagemData(file,cursor)
            if bdata is None:
                return {"status": "error", "title": "A bobinagem a que se refere o teste não existe!", "subTitle":None}
            storage = FileSystemStorage()
            csv_file = storage.open(f'lab-test-tmp/{file}', 'r')
            csv_reader = csv.reader(csv_file)

            block = 0
            counter={}
            
            keys=[]
            valuesheader={}
            values=[]
            grp={"value":0,"enabled":False,"ciclo":1}

            tblheader = {}
            tblspecs = []
            tbldata = []
            tblgroup = []
            for row in csv_reader:
                if not row:
                    valuesheader= {}
                    keys = []
                    values=[]
                    grp={"value":0,"enabled":False,"ciclo":1}
                    block = block + 1
                else:
                    if (block==0):
                        counter,block,keys,tblheader = block0(counter,block,row,keys,bdata)
                        if counter.get(block)==1:
                            file_mode = tblheader.get("modo_ensaio").lower()
                            file_type = tblheader.get("tipo_ensaio").lower()
                            print("----------------------------")
                            print(metodo.get("rows")[0].get("mode"))
                            print(metodo.get("rows")[0].get("type"))
                            
                            print(file_mode)
                            print(file_type)
                            if modes_dict.get(metodo.get("rows")[0].get("mode"))!=file_mode or types_dict.get(metodo.get("rows")[0].get("type"))!=file_type:
                                return {"status": "error", "title": f"O método não corresponde ao método do ficheiro de resultados!"}
                            if file_mode=="cíclico":
                                if int(tblheader.get("contador_ciclico"))!=int(metodo.get("rows")[0].get("ciclos")):
                                    return {"status": "error", "title": f"O nº de ciclos no método não corresponde ao nº de ciclos no método do ficheiro de resultados!"}
                        tblheader["errors"]=[]
                    elif (block==1):
                        counter,block,keys,valuesheader = block1(counter,block,row,keys,valuesheader,tblspecs,bdata)
                    elif (block==2):
                        counter,block,keys,valuesheader = block2(counter,block,grp,row,keys,valuesheader,tblheader,tbldata,tblgroup,bdata,specs)
            csv_file.close()
            with transaction.atomic():
                essay_id = _newEssayHeader(bdata,tblheader,metodo.get("rows")[0].get("lab_artigospecs_id"), user_id,cursor)
                _newEssayResults(tbldata,tblspecs,essay_id, user_id,cursor)
            #print(tblheader)
            print(tblspecs)
            #print(tbldata)
            #print(tblgroup)
            return {"status": "success", "title": "Teste executado com sucesso!", "subTitle":None}
        except Exception as error:
            print(error)
            return {"status": "error", "title": f"Erro executar o teste selecionado! {str(error)}"}

def _newEssayHeader(bdata,tblheader,lab_artigospecs_id,user_id,cursor):
    data = {**tblheader,
            "errors":json.dumps(tblheader.get("errors")), 
            "media":json.dumps(tblheader.get("media")),
            "desviopadrao":json.dumps(tblheader.get("desviopadrao")),
            "faixa":json.dumps(tblheader.get("faixa")),
            "bobinagem_id":bdata[0].get("id"), "lab_artigospecs_id":lab_artigospecs_id, "t_stamp":datetime.now(),"user_id":user_id}
    dml = db.dml(TypeDml.INSERT, data, "producao_lab_essaysheader",None,None,False)
    db.execute(dml.statement, cursor, dml.parameters)
    return cursor.lastrowid

def _newEssayResults(tbldata,tblspecs,essay_id,user_id,cursor):
    for row in tbldata:
        matching_items = [item for item in tblspecs if int(item.get("bobine_id")) == int(row.get("bobine_id"))]
        m={}
        if matching_items and len(matching_items)>0:
            m={**matching_items[0]}
            del m["bobine_id"]
            del m["bobine_nome"]
            del m["bobinagem_id"]
            del m["row_id"]
        i ={"bobine_id": row.get("bobine_id"),
            "bobine_nome":row.get("bobine_nome"),
            "bobinagem_id": row.get("bobinagem_id"),
            "row_id": row.get("row_id"),
            "within_range": row.get("range"),
            "within_target": row.get("target"),
            "grp": row.get("grp"),
            "ciclo": row.get("ciclo"),
            "errors": json.dumps(row.get("errors")),
            "essay_id": essay_id,
            "t_stamp": datetime.now(),"user_id":user_id
        }
        del row["bobine_id"]
        del row["bobine_nome"]
        del row["bobinagem_id"]
        del row["row_id"]
        del row["range"]
        del row["grp"]
        del row["ciclo"]
        del row["target"]
        del row["errors"]
        v = {**row,**m}
        k = list(v.keys())
        data = {**i,"results":json.dumps(v),"parameters":json.dumps(k)}
        dml = db.dml(TypeDml.INSERT, data, "producao_lab_essaysdata",None,None,False)
        db.execute(dml.statement, cursor, dml.parameters)
        id = cursor.lastrowid

def block_header(counter,block,row,keys,bdata):
    tbl={}
    incrementCounter(counter,block)
    if (counter.get(block)==0):
        keys=mapper(row,block,counter.get(block))
        #print(keys)
    else:
        tbl = dict(zip(keys, row))
        tbl["data_report"] = datetime.strptime(tbl.get("data_report"),'%d/%m/%Y').strftime('%Y-%m-%d')
        tbl["data_ensaio"] = datetime.strptime(tbl.get("data_ensaio"),'%d/%m/%Y').strftime('%Y-%m-%d')
    return counter,block,keys,tbl

def block1(counter,block,row,keys,valuesheader,tblspecs,bdata):
    if row[0].lower() == "nome":
        incrementCounter(counter,block)
    if (counter.get(block)==0 and len(keys)==0):
        keys=mapper(row,block,counter.get(block))
        valuesheader = {key.lower(): {} for key in keys[1:]}
    if row[0].lower().startswith("unidade"):
        incrementCounter(counter,block)
        append_dict(valuesheader,keys[1:],[{"unit": x} for x in row[1:]])
    elif (counter.get(block) is not None and row[0].lower() != "nome"):
        bobine_data = {**valuesheader}
        append_dict(bobine_data,keys[1:],[{"value": try_float(x.replace(",", "."))} for x in row[1:]])
        match = re.search(r'\d+', row[0])
        if match:
            number = match.group().zfill(2) #Bobine Number
            bobine_nome = f"""{bdata[0].get("nome")}-{number}"""
            bobine = next((r for r in bdata if r['bobine_nome'] == bobine_nome), None)
            if bobine is None:
                raise ValueError(f"""Não foi identificada a bobine na linha {row} bobinagem {bdata[0].get("nome")}""")
        else:
            raise ValueError(f"""Não foi identificada a bobine na linha {row} bobinagem {bdata[0].get("nome")}""")
        
        bobine_data["bobine_id"] = bobine.get("bobine_id")
        bobine_data["bobine_nome"] = bobine_nome
        bobine_data["bobinagem_id"] = bobine.get("id")
        bobine_data["row_id"] = row[0]
        tblspecs.append(bobine_data)
        incrementCounter(counter,block)
    return counter,block,keys,valuesheader

def _assignBobineData(bobine_data,group,tbldata):
    bobine_data["grp"]=group
    bobine_data["bobine_id"] = tbldata[-1].get("bobine_id")
    bobine_data["bobine_nome"] = tbldata[-1].get("bobine_nome")
    bobine_data["bobinagem_id"] = tbldata[-1].get("bobinagem_id")
    bobine_data["row_id"] = tbldata[-1].get("row_id")

def _checkSpecs(bobine_data,specs,tblheader):
    bobine_data["errors"]=[]
    for key in specs.keys():
        spec = specs.get(key)
        if key not in bobine_data:
            if spec.get("required")==1:
                tblheader["errors"].append({"id":spec.get("id"),"parameter":key,"designacao":spec.get("designacao"),"description":"É obrigatório testar o parâmetro","code":"E00"})
        else:
            if bobine_data.get(key).get("unit")!=spec.get("unit"):
                bobine_data["errors"].append({"description":f"""A unidade do ensaio não corresponde à unidade definida nas especificações {bobine_data.get(key).get("unit")} - {spec.get("unit")}""","code":"E01"})
            elif spec.get("values") is not None:
                values_spec = spec.get("values")
                unit_spec = spec.get("unit")
                value = bobine_data.get(key).get("value")
                unit = bobine_data.get(key).get("unit")
                if value is None:
                    bobine_data["range"]=None
                elif value>try_float(values_spec[1]):
                    bobine_data["range"] = 1
                elif value<try_float(values_spec[0]):    
                    bobine_data["range"] = -1
                else:
                    bobine_data["range"] = 0
                if value is None:
                    bobine_data["target"]=None
                elif value>try_float(values_spec[3]):
                    bobine_data["target"] = 1
                elif value<try_float(values_spec[2]):    
                    bobine_data["target"] = -1
                else:
                    bobine_data["target"] = 0

def block2(counter,block,grp,row,keys,valuesheader,tblheader,tbldata,tblgroup,bdata,specs):
    if row[0].lower() == "nome":
        incrementCounter(counter,block)
    if (counter.get(block)==0 and len(keys)==0) and row[0].lower() == "nome":
        keys=mapper(row,block,counter.get(block))
        valuesheader = {key.lower(): {} for key in keys[1:]}
    if row[0].lower().startswith("unidade"):
        incrementCounter(counter,block)
        append_dict(valuesheader,keys[1:],[{"unit": x} for x in row[1:]])
    elif row[0].lower().startswith("parâmetro"):
        incrementCounter(counter,block)
        append_dict(valuesheader,keys[1:],[{"designacao": x} for x in row[1:]])
    elif (counter.get(block) is not None and row[0].lower() != "nome"):
        bobine_data = {**valuesheader}
        append_dict(bobine_data,keys[1:],[{"value": try_float(x.replace(",", "."))} for x in row[1:]])
        if row[0].lower().startswith("média"):
            if grp.get("enabled")==False:
                grp["enabled"]=True
                grp["value"] = grp.get("value") + 1
                grp["ciclo"] =1
            _assignBobineData(bobine_data,counter.get(block),tbldata)
            tblgroup.append(bobine_data)
        elif row[0].lower().startswith("desviopadrão"):
            if grp.get("enabled")==False:
                grp["enabled"]=True
                grp["value"] = grp.get("value") + 1
                grp["ciclo"] =1
            _assignBobineData(bobine_data,counter.get(block),tbldata)
            tblgroup.append(bobine_data)
        elif row[0].lower().startswith("faixa"):
            if grp.get("enabled")==False:
                grp["enabled"]=True
                grp["value"] = grp.get("value") + 1
                grp["ciclo"] =1
            _assignBobineData(bobine_data,counter.get(block),tbldata)
            tblgroup.append(bobine_data)
        elif row[0].lower().startswith("totalmédia"):
            tblheader["media"]=bobine_data
        elif row[0].lower().startswith("totaldesviopadrão"):
            tblheader["desviopadrao"]=bobine_data
        elif row[0].lower().startswith("totalfaixa"):
            bobine_data["group"]=row[0].lower()
            tblheader["faixa"]=bobine_data
        else:
            match = re.search(r'\d+', row[0])
            if match:
                number = match.group().zfill(2) #Bobine Number
                bobine_nome = f"""{bdata[0].get("nome")}-{number}"""
                bobine = next((r for r in bdata if r['bobine_nome'] == bobine_nome), None)
                if bobine is None:
                    raise ValueError(f"""Não foi identificada a bobine na linha {row} bobinagem {bdata[0].get("nome")}""")
            else:
                raise ValueError(f"""Não foi identificada a bobine na linha {row} bobinagem {bdata[0].get("nome")}""")

            grp["enabled"]=False
            bobine_data["grp"] = grp.get("value")
            bobine_data["ciclo"] = grp.get("ciclo")
            bobine_data["bobine_id"] = bobine.get("bobine_id")
            bobine_data["bobine_nome"] = bobine_nome
            bobine_data["bobinagem_id"] = bobine.get("id")
            bobine_data["row_id"] = row[0]
            grp["ciclo"]=grp["ciclo"]+1
            _checkSpecs(bobine_data,specs,tblheader)
            tbldata.append(bobine_data)
        incrementCounter(counter,block)
    return counter,block,keys,valuesheader

#endregion