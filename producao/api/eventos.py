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
from support.database import encloseColumn, Filters, DBSql, TypeDml, fetchall, Check, ParsedFilters
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

def updateMaterializedView(mv):
    conngw = connections[connGatewayName]
    cgw = conngw.cursor()
    cgw.execute(f"REFRESH MATERIALIZED VIEW public.{mv};")
    conngw.commit()

def GetEventosWithoutBobinagem(request,format=None):
    connection = connections["default"].cursor()
    r = PostData(request)
    pf = ParsedFilters(r.filter,"and",r.apiversion)
    dql = db.dql(request.data, False,False)
    parameters = {**pf.parameters}  

    try:
        response = db.executeSimpleList(lambda: (
            f"""
                select * 
                from ig_bobinagens ib
                where ib.t_stamp > DATE_SUB(NOW(), INTERVAL 4 MONTH) and ib.`type` = 1 and not exists (select 1 from producao_bobinagem pb where pb.ig_bobinagem_id is not null and pb.ig_bobinagem_id=ib.id)
                {pf.group()}
                order by ib.id desc
            """
        ), connection, {**parameters},[],r.norun)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def GetAuditCurrentSettingsRange(request,format=None):
    connection = connections["default"].cursor()
    r = PostData(request)
    pf = ParsedFilters(r.filter,"where",r.apiversion)
    dql = db.dql(request.data, False,False)
    parameters = {**pf.parameters}  
    try:
        response = db.executeSimpleList(lambda: (
            f"""
                select 
                acs.type_op,acs.agg_of_id,pta.cod agg_cod,
                acs.id acs_id,pc.status ofabrico_status,
                acs.`timestamp`, cc.cortes,cco.cortesordem,
                (select JSON_ARRAYAGG(json_object(
                "of_id",t.of_id,"of_cod",t.of_cod,
                "cliente_nome",t.cliente_nome,"cliente_cod",t.cliente_cod,
                "prf_cod",t.prf_cod,"order_cod",t.order_cod ,
                "artigo_cod",t.artigo_cod ,"artigo_des", t.artigo_des
                ))
                from JSON_TABLE (aco.ofs,"$[*]"COLUMNS ( 
                    of_id INT PATH "$.of_id", 
                    of_cod VARCHAR(30) PATH "$.of_cod", 
                    artigo_cod VARCHAR(50) PATH "$.artigo_cod",
                    artigo_des VARCHAR(200) PATH "$.artigo_des",
                    cliente_cod VARCHAR(50) PATH "$.cliente_cod",
                    cliente_nome VARCHAR(250) PATH "$.cliente_nome",
                    order_cod VARCHAR(50) PATH "$.order_cod",
                    prf_cod VARCHAR(50) PATH "$.prf_cod"
                )) t ) ofs
                from audit_current_settings acs
                join producao_currentsettings pc on pc.id=acs.contextid
                join audit_current_ofs aco on aco.id = acs._ofs 
                join audit_current_cortes cc on cc.id = acs._cortes
                join audit_current_cortesordem cco on cco.id = acs._cortesordem
                left join producao_tempaggordemfabrico pta on pta.id=acs.agg_of_id
                {pf.group()} {"and" if pf.hasFilters() else "where"} cc.cortes is not null and cco.cortesordem is not null
                order by acs.`timestamp` desc
            """
        ), connection, parameters,[],r.norun)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def IgnoreEvent(request, format=None):
    r = PostData(request)
    def _update(id,cursor):
        values={"`ignore`":1}
        dml = db.dml(TypeDml.UPDATE, values, "ig_bobinagens", {"id":Filters.getNumeric(id,"isnull")}, None, False,[])
        print(dml.statement)
        print(dml.parameters)
        db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                _update(r.filter.get("id"),cursor)
        return Response({"status": "success", "title": "Evento alterado com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})