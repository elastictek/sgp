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
from support.database import encloseColumn, Filters,ParsedFilters,  DBSql, TypeDml, fetchall, Check
from support.myUtils import  ifNull, includeDictKeys

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
from producao.api.exports import export
from support.postdata import PostData

connGatewayName = "postgres"
connMssqlName = "sqlserver"
dbgw = DBSql(connections[connGatewayName].alias)
db = DBSql(connections["default"].alias)
dbmssql = DBSql(connections[connMssqlName].alias)

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
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response({})
    
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
    response = db.executeSimpleList(lambda: (f"""
        select tsk.status from ofabrico_checklist_tasks tsk {f.text}"""), cursor, f.parameters)
    return response["rows"][0].get("status")

def TodoTasksList(request, format=None):
    connection = connections["default"].cursor()
    r = PostData(request)
    pf = ParsedFilters(r.filter,"where",r.apiversion)   
    dql = db.dql(request.data, False,False)
    parameters = {**pf.parameters}

    dql.columns=encloseColumn(f"*",False)
    sql = lambda p, c, s: (
        f"""  
            select {c(f'{dql.columns}')} from ofabrico_checklist_tasks
            {pf.group()}
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

def TasksExecutedList(request, format=None):
    connection = connections["default"].cursor()
    r = PostData(request)
    pf = ParsedFilters(r.filter,"where",r.apiversion)   
    dql = db.dql(request.data, False,False)
    parameters = {**pf.parameters}

    cols=f"""
        te.id,ot.`type`,ot.subtype,ot.nome, te.task_id, te.`timestamp`, te.bobine_id ,te.bobine_nome, te.bobine_original_id, te.bobine_original_nome,
        pb1.lar,pb1.core,pa1.cod ,pa1.des,
        pc1.nome cliente,
        pa2.cod cod_original,pa2.des des_original,
        pc2.nome cliente_original
    """
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""  
            select 
            {c(f'{dql.columns}')}
            from temp_troca_etiqueta te 
            join ofabrico_checklist_tasks ot on te.task_id =ot.id 
            join producao_bobine pb1 on pb1.id=te.bobine_id
            join producao_artigo pa1 on pa1.id=te.artigo_id
            join producao_cliente pc1 on pc1.id=te.cliente_id
            join producao_artigo pa2 on pa2.id=te.artigo_original_id
            join producao_cliente pc2 on pc2.id=te.cliente_original_id
            {pf.group()}
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

def TasksList(request, format=None):
    connection = connections["default"].cursor()
    r = PostData(request)
    pf = ParsedFilters(r.filter,"where",r.apiversion)   
    dql = db.dql(request.data, False,False)
    parameters = {**pf.parameters}

    cols=f"""
        ot.*
    """
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""  
            select 
            {c(f'{dql.columns}')}
            from ofabrico_checklist_tasks ot
            {pf.group()}
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


def NewTask(request, format=None):
    data = request.data.get("parameters") if request.data.get("parameters") is not None else {}
    def insert(data,cursor):
        values = {
            "timestamp":datetime.now().strftime("%Y-%m-%d %H:%M:%S"), 
            "user_id":request.user.id,
            "nome":f"""(SELECT CONCAT('TRE-',YEAR(CURRENT_DATE()),LPAD(MONTH(CURRENT_DATE()),2,'0'),LPAD(DAY(CURRENT_DATE()),2,'0'),'-',LPAD(n,3,'0')) FROM (SELECT COUNT(*)+1 n FROM ofabrico_checklist_tasks oct where oct.type=1 and YEAR(`timestamp`)=YEAR(CURRENT_DATE())) t)""",
            **includeDictKeys(data,["type","subtype","status","runtype","appliesto","mode","parameters","cliente","obs"])
        }
        print(values)
        dml = db.dml(TypeDml.INSERT, {**values,"parameters":json.dumps(values.get("parameters"))}, "ofabrico_checklist_tasks", None, None, False,["nome"])
        db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                for i, v in enumerate(data.get("rows")):
                    insert(v,cursor)
        return Response({"status": "success", "title": "Tarefa(s) registada(s) com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def UpdateTasks(request, format=None):
    data = request.data.get("parameters") if request.data.get("parameters") is not None else {}
    def update(id,data,cursor):
        values = includeDictKeys(data,["subtype","obs","parameters"])
        dml = db.dml(TypeDml.UPDATE,{**values,"parameters":json.dumps(values.get("parameters"))},"ofabrico_checklist_tasks",{"id":f'=={id}',"status":f'!==9'},None,False)
        db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                errors = [] 
                for i, v in enumerate(data.get("rows")):
                    chk = _checkTaskItems(v.get("id"),cursor)
                    if chk > 0:
                        errors.append(v.get("nome"))
                    else:
                        update(v.get("id"),v,cursor)
                if len(errors) == len(data.get("rows")):
                    return Response({"status": "error", "title": f"Erro ao atualizar a(s) tarefa(s). Já foram executadas trocas de etiquetas! "})
                if len(errors) < len(data.get("rows")):
                    return Response({"status": "success", "title": f"Algumas tarefas não foram atualizadas! {','.join(errors)} "})
        return Response({"status": "success", "title": "Tarefa(s) atualizada(s) com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})    

def OpenTask(request, format=None):
    data = request.data.get("parameters") if request.data.get("parameters") is not None else {}
    def open(id,cursor):
        dml = db.dml(TypeDml.UPDATE,{"status":1},"ofabrico_checklist_tasks",{"id":f'=={id}',"status":f'!==1'},None,False)
        db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                chk = _checkListStatus(data.get("id"),cursor)
                if chk == 1:
                    return Response({"status": "error", "title": f"A tarefa já se encontra aberta!"})
                open(data.get("id"),cursor)
        return Response({"status": "success", "title": "Tarefa Aberta com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def CloseTask(request, format=None):
    data = request.data.get("parameters") if request.data.get("parameters") is not None else {}
    def close(id,cursor):
        dml = db.dml(TypeDml.UPDATE,{"status":9},"ofabrico_checklist_tasks",{"id":f'=={id}',"status":f'!==9'},None,False)
        db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                chk = _checkListStatus(data.get("id"),cursor)
                if chk == 9:
                    return Response({"status": "error", "title": f"A tarefa já se encontra finalizada!"})
                close(data.get("id"),cursor)
        return Response({"status": "success", "title": "Tarefa Finalizada com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def DeleteTask(request, format=None):
    data = request.data.get("parameters") if request.data.get("parameters") is not None else {}
    def delete(id,cursor):
        dml = db.dml(TypeDml.DELETE,None,"ofabrico_checklist_tasks",{"id":f'=={id}'},None,False)
        db.execute(dml.statement, cursor, dml.parameters)
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                chk = _checkTaskItems(data.get("id"),cursor)
                if chk > 0:
                    return Response({"status": "error", "title": f"O item não pode ser eliminado. A tarefa já foi executada pelo menos uma vez!"})
                delete(data.get("id"),cursor)
        return Response({"status": "success", "title": "Tarefa eliminada com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})