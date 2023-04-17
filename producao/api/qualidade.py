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
                print(dml.statement)
                print(dml.parameters)
                db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo criado com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao criar registo! {str(error)}"})

def UpdateLabParameter(request, format=None):
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
                        dml = db.dml(TypeDml.UPDATE,{**item, "t_stamp_updated":datetime.now(),"user_id":request.user.id},"producao_lab_parameters",{"id":Filters.getNumeric(id,"isnull")},None,False)
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

def DeleteLabParameter(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:        
                dml = db.dml(TypeDml.DELETE,None,"producao_lab_parameters",{"id":Filters.getNumeric(filter.get("id"),"isnull")},None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo eliminado com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao eleminar registo! {str(error)}"})

def ListLabMetodos(request, format=None):
    connection = connections["default"].cursor()    
    f = Filters({**request.data['filter']})
    f.setParameters({
        "designacao": {"value": lambda v: Filters.getUpper(v.get('fdes')), "field": lambda k, v: f'upper({k})'},
        "cod": {"value": lambda v: Filters.getUpper(v.get('fartigo_cod')), "field": lambda k, v: f'upper(pa.{k})'},
        "des": {"value": lambda v: Filters.getUpper(v.get('fartigo_des')), "field": lambda k, v: f'upper(pa.{k})'},
        "cliente_nome": {"value": lambda v: Filters.getUpper(v.get('fcliente')), "field": lambda k, v: f'upper({k})'},
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

    cols = f"""plm.*,pa.cod,pa.des"""
    sql = lambda p, c, s: (
        f"""
            SELECT {c(f'{cols}')} 
            FROM producao_lab_metodos plm
            LEFT JOIN producao_artigo pa on pa.id=plm.artigo_id
            {f.text} {f2["text"]}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}  
        """
    )
    print(f"""
           SELECT {f'{cols}'} 
            FROM producao_lab_metodos plm
            LEFT JOIN producao_artigo pa on pa.id=plm.artigo_id
            {f.text} {f2["text"]}
            {dql.sort} {dql.paging} {dql.limit}  
    """)
    print("xxxxxxxxxxxxxxxx")
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    response = db.executeList(sql, connection, parameters, [])
    return Response(response)

def checkLabMetodo(data,cursor):
    f = Filters({
        "artigo_id": data.get("artigo_id"),
        "cliente_cod": data.get("cliente_cod"),
        "designacao": data.get("designacao"),
        "owner": data.get("owner")
    })
    f.where()
    f.add(f'artigo_id {f.nullValue("artigo_id","=:artigo_id")}',True )
    f.add(f'cliente_cod {f.nullValue("cliente_cod","=:cliente_cod")}',True )
    f.add(f'designacao {f.nullValue("designacao","=:designacao")}',True ),
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

def UpdateLabMetodo(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                if "rows" in data:
                    for idx, item in enumerate(data.get("rows")):
                        id = item.get("id")
                        del item["id"]
                        del item["cod"]
                        del item["des"]
                        del item["rowvalid"]
                        del item["t_stamp"]
                        dml = db.dml(TypeDml.UPDATE,{**item, "t_stamp_updated":datetime.now(),"user_id":request.user.id},"producao_lab_metodos",{"id":Filters.getNumeric(id,"isnull")},None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo(s) alterado(s) com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao alterar registo(s)! {str(error)}"})

def DeleteLabMetodo(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:        
                dml = db.dml(TypeDml.DELETE,None,"producao_lab_metodos",{"id":Filters.getNumeric(filter.get("id"),"isnull")},None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo eliminado com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao eleminar registo! {str(error)}"})

def ListLabMetodosParameters(request, format=None):
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

    cols = f"""lmp.*,p.id parametro_id,p.nvalues,p.unit,p.min_value,p.max_value,p.value_precision,p.designacao parametro_des,lm.designacao metodo_des"""
    sql = lambda p, c, s: (
        f"""
            SELECT {c(f'{cols}')}  
            from producao_lab_metodosparameters lmp
            join producao_lab_parameters p on p.id=lmp.parametro_id
            join producao_lab_metodos lm on lm.id=lmp.lab_metodo_id
            {f.text} {f2["text"]}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}  
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    response = db.executeList(sql, connection, parameters, [])
    return Response(response)

def DeleteLabMetodoParameter(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:        
                dml = db.dml(TypeDml.DELETE,None,"producao_lab_metodosparameters",{"id":Filters.getNumeric(filter.get("id"),"isnull")},None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo eliminado com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao eleminar registo! {str(error)}"})

def UpdateLabMetodoParameters(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                for idx, v in enumerate(data.get("rows")):
                    if v.get("rowadded")==1:
                        values ={"parametro_id":v.get("parametro_id"),"status":v.get("status"),"required":v.get("required"), "lab_metodo_id":filter.get("id"), "t_stamp":datetime.now(),"user_id":request.user.id}
                        dml = db.dml(TypeDml.INSERT, values, "producao_lab_metodosparameters",None,None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                    else:
                        values ={"parametro_id":v.get("parametro_id"),"status":v.get("status"),"required":v.get("required"), "lab_metodo_id":filter.get("id"), "t_stamp":datetime.now(),"user_id":request.user.id}
                        dml = db.dml(TypeDml.UPDATE, values, "producao_lab_metodosparameters",{"id":Filters.getNumeric(v.get("id"),"isnull")},None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Método alterado com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao alterar método! {str(error)}"})

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

    cols = f"""las.*,lm.designacao metodo_designacao,lm.cliente_nome,lm.owner,pa.cod,pa.des"""
    sql = lambda p, c, s: (
        f"""
            SELECT {c(f'{cols}')}  
            from producao_lab_artigospecs las
            join producao_lab_metodos lm on lm.id=las.lab_metodo_id
            join producao_artigo pa on pa.id=lm.artigo_id
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
                    values ={"lab_metodo_id":data.get("lab_metodo_id"),"obs":data.get("obs"),"`status`":data.get("status"),"reference":data.get("reference"),"designacao":data.get("designacao"), "t_stamp":datetime.now(),"user_id":request.user.id}
                    dml = db.dml(TypeDml.INSERT, values, "producao_lab_artigospecs",None,None,False)
                    print(dml.statement)
                    print(dml.parameters)
                    db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Especificação criada com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao criar especificação! {str(error)}"})

def UpdateLabArtigoSpecs(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                if "rows" in data:
                    for idx, item in enumerate(data.get("rows")):
                        id = item.get("id")
                        values = {"designacao":item.get("designacao"), "status":item.get("status"), "obs":item.get("obs"),"reference":item.get("reference")}
                        dml = db.dml(TypeDml.UPDATE,{**values, "user_id":request.user.id},"producao_lab_artigospecs",{"id":Filters.getNumeric(id,"isnull")},None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo(s) alterado(s) com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao alterar registo(s)! {str(error)}"})