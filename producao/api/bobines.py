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

defeitosCols = {
"columns" : ['estado', 'l_real', 'fc_diam_fim', 'fc_diam_ini', 'ff_m_fim', 'ff_m_ini','prop_obs', 'buracos_pos', 'rugas_pos', 'fc_pos', 'ff_pos', 'furos_pos','obs'],
"columns_defeitos" : ['con', 'descen', 'presa', 'diam_insuf', 'furos', 'esp', 'troca_nw', 'outros', 'buraco', 'nok', 'rugas', 'tr','car', 'fc', 'ff', 'fmp', 'lac', 'ncore', 'prop', 'sbrt', 'suj','prop']
}


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
    if "parameters" in request.data and "method" in request.data["parameters"]:
        method=request.data["parameters"]["method"]
        func = globals()[method]
        response = func(request, format)
        return response
    return Response({})

def UpdateDefeitos(request, format=None):
    connection = connections["default"].cursor()
    data = request.data['parameters']
    f = Filters(request.data['filter'])
    def checkBobines(ids, cursor):
        response = db.executeSimpleList(lambda: (f"""        
            select count(*) cnt
            from producao_bobine pb
            left join producao_palete pp on pp.id=pb.palete_id 
            where pb.id in ({ids}) and (pp.carga_id is NOT NULL or pb.comp_actual =0 and pb.recycle > 0)        
        """), cursor, {})
        if len(response["rows"])>0:
            return response["rows"][0]["cnt"]
        return None

    def checkExpedicaoSage(ids,cursor):
        connection = connections[connGatewayName].cursor()
        response = dbgw.executeSimpleList(lambda: (f"""
                select count(*) cnt
                from mv_bobines pb
                left join mv_paletes pp on pp.id=pb.palete_id
                LEFT JOIN mv_pacabado_status mv on mv."LOT_0" = pp.nome
                where pb.id in ({ids}) and mv."SDHNUM_0" is not null
        """), connection, {})
        if len(response["rows"])>0:
            return response["rows"][0]["cnt"]
        return None

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                ids = ','.join(str(x["id"]) for x in data["rows"])                
                chk01 = checkBobines(ids,cursor)
                if chk01 > 0:
                    return Response({"status": "error", "title": f"Não é possível alterar uma ou mais bobines. Verifique (Comprimento actual, se entrou em reciclado, ou se está numa carga... )"})
                chk02 = checkExpedicaoSage(ids,cursor)
                if chk02 > 0:
                    return Response({"status": "error", "title": f"Não é possível alterar uma ou mais bobines. Verifique se já existe expedição."})

                columns = defeitosCols["columns"]
                columns_defeitos = defeitosCols["columns_defeitos"]
                for v in data['rows']:
                    b={}
                    for x in columns_defeitos:
                        if "defeitos" in v:
                            if len(v["defeitos"])==0:
                                b[x]=0
                            else:
                                for y in v["defeitos"]:
                                    if ("key" in y and y["key"]==x) or ("value" in y and y["value"]==x):
                                        b[x] = 1
                                    elif x not in b:
                                        b[x]=0
                        else:
                            b[x]=0
                    bobine_values = {**{key: v[key] for key in v if key in columns}, **b} 
                    bobine_values['ff_m_ini'] = bobine_values['ff_pos'][0]['min'] if bobine_values['ff_pos'] is not None and len(bobine_values['ff_pos'])>0 else None
                    bobine_values['ff_m_fim'] = bobine_values['ff_pos'][0]['max'] if bobine_values['ff_pos'] is not None and len(bobine_values['ff_pos'])>0 else None
                    bobine_values['fc_diam_ini'] = bobine_values['fc_pos'][0]['min'] if bobine_values['fc_pos'] is not None and len(bobine_values['fc_pos'])>0 else None
                    bobine_values['fc_diam_fim'] = bobine_values['fc_pos'][0]['max'] if bobine_values['fc_pos'] is not None and len(bobine_values['fc_pos'])>0 else None
                    bobine_values['fc_pos'] = json.dumps(bobine_values['fc_pos'], ensure_ascii=False) if bobine_values['fc_pos'] is not None else None
                    bobine_values['ff_pos'] = json.dumps(bobine_values['ff_pos'], ensure_ascii=False) if bobine_values['ff_pos'] is not None else None
                    bobine_values['furos_pos'] = json.dumps(bobine_values['furos_pos'], ensure_ascii=False) if bobine_values['furos_pos'] is not None else None
                    bobine_values['buracos_pos'] = json.dumps(bobine_values['buracos_pos'], ensure_ascii=False) if bobine_values['buracos_pos'] is not None else None
                    bobine_values['rugas_pos'] = json.dumps(bobine_values['rugas_pos'], ensure_ascii=False) if bobine_values['rugas_pos'] is not None else None
                    bobine_values["ff"] = 1 if bobine_values['ff_pos'] is not None and len(bobine_values['ff_pos'])>0 else 0
                    bobine_values["fc"] = 1 if bobine_values['fc_pos'] is not None and len(bobine_values['fc_pos'])>0 else 0
                    bobine_values["furos"] = 1 if bobine_values['furos_pos'] is not None and len(bobine_values['furos_pos'])>0 else 0
                    bobine_values["buraco"] = 1 if bobine_values['buracos_pos'] is not None and len(bobine_values['buracos_pos'])>0 else 0
                    bobine_values["rugas"] = 1 if bobine_values['rugas_pos'] is not None and len(bobine_values['rugas_pos'])>0 else 0
                    dml = db.dml(TypeDml.UPDATE, bobine_values, "producao_bobine", {'id': f'=={v["id"]}'}, None, False)
                    db.execute(dml.statement, cursor, dml.parameters)
        return Response({"status": "success", "success":f"""Registos atualizados com sucesso!"""})
    except Error as error:
        return Response({"status": "error", "title": str(error)})
    
    
    print(f)
    print(request.data)
    print("oiiiiiiiiiii")


def BobinesGranuladoMPList(request,format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({
        "palete_id": {"value": lambda v: v.get('palete_id'), "field": lambda k, v: f'pb.{k}'},
        "nome": {"value": lambda v: v.get('fbobine'), "field": lambda k, v: f'pb.{k}'},
        "n_lote": {"value": lambda v: v.get('flote'), "field": lambda k, v: f'lgl.{k}'}
    }, True)
    f.where()
    f.auto()
    f.value()

    f2 = filterMulti(request.data['filter'], {
        'fartigo': {"keys": ['artigo_cod', 'artigo_des'], "table": 'lgl.'}
    }, False, "and" if f.hasFilters else "where" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""distinct pb.id bobine_id, pb.nome,pb.estado,pb.posicao_palete, lgl.artigo_cod ,lgl.artigo_des, lgl.n_lote ,lgl.t_stamp ,lgl.t_stamp_out ,lgl.t_stamp_closed """
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""  
            SELECT {c(f'{dql.columns}')}
            FROM producao_bobine pb 
            JOIN sistema.lotesdosers_ig ldi on pb.ig_id=ldi.ig_id and ldi.arranque>0
            JOIN lotesdoserslinha ldl ON ldl.id=ldi.ldl_id
            JOIN lotesgranuladolinha lgl ON lgl.id=ldl.loteslinha_id and lgl.type_mov=1
            {f.text} {f2["text"]}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in request.data["parameters"]):
        return export(sql(lambda v:'',lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"])
    try:
        response = db.executeList(sql, connection, parameters,[],None,None)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)


