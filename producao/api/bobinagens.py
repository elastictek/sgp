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
from producao.api.currentsettings import getCurrentSettingsId

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

def LastIgBobinagemReelingExchangeLookup(request, format=None):
    return Response(_lastIgBobinagemReelingExchangeLookup())

def _lastIgBobinagemReelingExchangeLookup():
    conn = connections["default"].cursor()    
    response = db.executeSimpleList(lambda: (
        f"""
            select * from ig_bobinagens where `type`=1 order by id desc limit 1
        """
    ), conn, {})
    return response

def NewManualEvent(request, format=None):
    data = request.data.get("parameters").get("values")
    print(data)
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                _current = getCurrentSettingsId()[0]
                _last = _lastIgBobinagemReelingExchangeLookup().get("rows")[0]
                del _last["id"]
                _last["n_trocas"] = _last["n_trocas"] + 1
                _last["diametro_calculado"] = data.get("diametro")
                _last["diametro"] = data.get("diametro")
                _last["peso"] = data.get("peso")
                _last["metros"] = data.get("comprimento")
                _last["metros_evento_estado"] = data.get("comprimento")
                _last["nw_inf"] = data.get("nw_inf")
                _last["nw_sup"] = data.get("nw_sup")
                _last["nw_inf_evento_estado"] = data.get("nw_inf")
                _last["nw_sup_evento_estado"] = data.get("nw_sup")
                _last["inicio_ts"] = data.get("date_init")
                _last["fim_ts"] = data.get("date_end")
                _last["t_stamp"] = datetime.now()
                _last["audit_cs_id"]=_current.get("id")
                dml = db.dml(TypeDml.INSERT, _last, "ig_bobinagens",None,None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo criado com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao criar registo! {str(error)}"})


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def UpdateBobinagem(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    def checkBobinagem(id, cursor):
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
                for idx,v in enumerate(data["rows"]):
                    delta = datetime.now()-datetime.strptime(v["timestamp"], '%Y-%m-%d %H:%M:%S')
                    if delta.days>=3:
                        errors.append(f"""A bobinagem {v["nome"]} Não pode ser alterada!""")
                    if ("largura_bruta" in v["values_changed"]):
                        if v["largura_bruta"]<v["largura"]:
                            errors.append(f"""Na bobinagem {v["nome"]} a largura bruta tem de ser maior que a largura definida!""")
                        #Verificar as aparas
                        f = Filters({"lote":f'=={v["nome"]}',"source":"==bobinagem"})
                        f.setParameters({
                            "lote": {"value": lambda v: v.get('lote'), "field": lambda k, v: f'prl.{k}'},
                            "source": {"value": lambda v: v.get('source'), "field": lambda k, v: f'prl.`{k}`'}
                        }, True)
                        f.where()
                        f.auto()
                        f.value("and")
                        parameters = {**f.parameters}
                        dql = db.dql(request.data, False)
                        exists = db.executeSimpleList(lambda: (f"""SELECT pr.`status`,prl.id from producao_reciclado pr join producao_recicladolotes prl on prl.reciclado_id=pr.id {f.text} {dql.sort} limit 1"""), cursor, parameters)["rows"]
                        if len(exists)>0:
                            #Atualizar as aparas já existirem, atualizar os m2
                            if exists[0]["status"]==0:
                                qtd_apara = ((v["largura_bruta"]-v["largura"])/1000)*v["comp"] 
                                dml = db.dml(TypeDml.UPDATE,{"qtd":qtd_apara},"producao_recicladolotes",{"id":f'=={exists[0]["id"]}'},None,False)
                                db.execute(dml.statement, cursor, dml.parameters)
                            else:
                                errors.append(f"""Na bobinagem {v["nome"]} não é possível alterar a largura bruta, porque o lote de reciclado já se encontra fechado!""")
                    if (len(errors)==0):
                        if ("lotenwinf" in v["values_changed"]):
                            exists = db.exists("lotesnwlinha", {"n_lote":f"=={v['lotenwinf']}","t_stamp":f"<={v['timestamp']}","closed":0}, cursor).exists
                            if exists==0:
                                errors.append(f"""Na bobinagem {v["nome"]} O lote de Nonwoven Inferior já se encontra fechado!""")
                    if (len(errors)==0):
                        if ("lotenwsup" in v["values_changed"]):
                            exists = db.exists("lotesnwlinha", {"n_lote":f"=={v['lotenwsup']}","t_stamp":f"<={v['timestamp']}","closed":0}, cursor).exists
                            if exists==0:
                                errors.append(f"""Na bobinagem {v["nome"]} O lote de Nonwoven Superior já se encontra fechado!""")
                    if (len(errors)==0):
                            comp_cli = round(v["comp"] if (v["comp_par"]==0 or (v["comp"] - v["comp_par"])<=(v["comp_par"]*0.05)) else v["comp_par"]*1.05,2)
                            desper = round(0 if (v["comp_par"]==0 or (v["comp"] - v["comp_par"])<=(v["comp_par"]*0.05)) else ((v["comp"] - (v["comp_par"]*1.05))/1000)*v["largura"],2)
                            dml = db.dml(TypeDml.UPDATE,{"comp_cli":comp_cli,"desper":desper,"comp_par":v["comp_par"],"diam":v["diam"],"largura_bruta":v["largura_bruta"],"lotenwinf":v["lotenwinf"],"lotenwsup":v["lotenwsup"],"tiponwinf":v["tiponwinf"],"tiponwsup":v["tiponwsup"]},"producao_bobinagem",{"id":f'=={v["id"]}'},None,False)
                            db.execute(dml.statement, cursor, dml.parameters)
                            dml = db.dml(TypeDml.UPDATE,{"diam":v["diam"],"lotenwinf":v["lotenwinf"],"lotenwsup":v["lotenwsup"]},"producao_bobine",{"bobinagem_id":f'=={v["id"]}'},None,False)
                            db.execute(dml.statement, cursor, dml.parameters)
                            
                            if desper>0:
                                dml = db.dml(TypeDml.UPDATE,{"comp_total":comp_cli},"producao_etiquetaretrabalho",{"bobinagem_id":f'=={v["id"]}'},None,False)
                                db.execute(dml.statement, cursor, dml.parameters)
                            
                            success.append(f"""Bobinagem {v["nome"]} atualizada com sucesso!""")
        return Response({"status": "multi", "errors":errors, "success":success})
    except Error as error:
        return Response({"status": "error", "title": str(error)})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def CreateBobinagem(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                if "ig_bobinagem" not in data:
                    return Response({"status": "error", "title":"error"})
                args = (data["ig_bobinagem"])
                cursor.callproc('create_bobinagem_from_ig_v2',args)
        return Response({"status": "success", "title": "Bobinagem criada com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def DeleteBobinagem(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                args = (data["id"],data["ig_bobinagem"] if "ig_bobinagem" in data else 0,0)
                cursor.callproc('delete_bobinagem',args)
        return Response({"status": "success", "title": "Bobinagem eliminada com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def MissedLineLogList(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])

    f.setParameters({}, True)
    f.where()
    f.auto()
    f.value("and")
    parameters = {**f.parameters}

    dql = db.dql(request.data, False)
    sql = lambda p, c, s: (
        f"""select * from ig_bobinagens ig where `type`=1 and not exists(select * from producao_bobinagem pbm where pbm.ig_bobinagem_id=ig.id) and t_stamp>'2022-09-20 13:48:44'"""
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    try:
        response = db.executeSimpleList(sql(lambda v:v,lambda v:v,lambda v:v), connection, parameters, [])
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def BobinesByAggByStatusList(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'pb.estado = :estado', True)
    f.add(f'op.agg_of_id_id = :agg_of_id', True)
    f.value("and")
    parameters = {**f.parameters}

    dql = db.dql(request.data, False)
    sql = lambda p, c, s: (
        f"""
        select pb.id,pb.nome,pb.palete_id,pl.nome palete_nome
        from producao_bobine pb
        left join producao_palete pl on pl.id=pb.palete_id
        join planeamento_ordemproducao op on op.id=pb.ordem_id
        {f.text}
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    try:
        response = db.executeSimpleList(sql(lambda v:v,lambda v:v,lambda v:v), connection, parameters, [])
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)



