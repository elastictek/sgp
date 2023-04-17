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
from collections import Counter
from producao.api.stock_cutter_1d import StockCutter1D



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
tipoemendas = { "1": "Fita Preta", "2": "Fita metálica e Fita Preta","3": "Fita metálica" }


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
    
def checkCurrentSettings(id,status,cursor):
    f = Filters({
        "id": id
    })
    f.where()
    f.add(f'pc.id = :id', lambda v:(v!=None) )
    f.add(f'pc.`status` in ({",".join(status)})',True )
    f.value("and")
    exists = db.exists("producao_currentsettings pc", f, cursor).exists
    return exists

def getCurrentSettingsId():
    with connections["default"].cursor() as cursor:
        return db.executeSimpleList(lambda: (f"""		
                SELECT acs.id,acs.agg_of_id 
                from producao_currentsettings cs
                join audit_currentsettings acs on cs.id=acs.contextid
                where cs.status=3
                order by acs.id desc
                limit 1
            """), cursor, {})['rows']

def updateCurrentSettings(id,type,data,user_id,cursor):
    try:
        with cursor:
            args = (id,data,type,user_id,0)
            print(args)
            #cursor.callproc('update_currentsettings',args)
        return Response({"status": "success", "id":id, "title": f'Definições atualizadas com sucesso', "subTitle":f""})
    except Exception as error:
        return Response({"status": "error", "id":id, "title": str(error), "subTitle":str(error)})











@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def EstadoProducao(request, format=None):
    if "agg_of_id" in request.data['filter']:
        print(request.data['filter']["agg_of_id"])
        cs=[]
        cs.append({"agg_of_id":request.data['filter']["agg_of_id"]})
    else:    
        cs = getCurrentSettingsId()
    response={}
    if len(cs)>0:
        response["agg_of_id"]=cs[0]["agg_of_id"]
        with connections["default"].cursor() as cursor:
            rows = db.executeSimpleList(lambda: (f"""
            select distinct count(*) over () total_produzidas, count(*) over (partition by pb.estado) total_por_estado,pb.estado
            from producao_bobine pb
            join planeamento_ordemproducao op on op.id=pb.ordem_id
            where op.agg_of_id_id={cs[0]["agg_of_id"]}"""
            ), cursor, {})['rows']
            if len(rows)>0:
                response["bobines_produzidas"]=rows
            rows = db.executeSimpleList(lambda: (f"""
                select count(*) num_bobines 
                from producao_bobine pb
                join producao_palete pl on pb.palete_id=pl.id
                join planeamento_ordemproducao op on pl.ordem_id=op.id
                where op.agg_of_id_id={cs[0]["agg_of_id"]} and pb.estado='G'
            """
            ), cursor, {})['rows']
            if len(rows)>0:
                response["bobines_good"]=rows
            rows = db.executeSimpleList(lambda: (f"""
                with CNT_PALETES AS(
                    select *,sum(num_paletes_produzidas) over() num_paletes_produzidas_total from (
                    SELECT op.id, count(*) num_paletes_produzidas
                    FROM planeamento_ordemproducao op
                    left join producao_palete pl on pl.ordem_id=op.id
                    where op.agg_of_id_id={cs[0]["agg_of_id"]} and pl.num_bobines_act=pl.num_bobines
                    group by op.id
                    ) t
                )
                select
                of_id,of_cod,artigo_des,artigo_produto,cliente_nome,artigo_lar,
                cortes,cortesordem,
                t.num_paletes_a_produzir,
                sum(num_paletes_a_produzir) over () num_paletes_a_produzir_total,
                t.bobines_por_palete,
                t.num_bobines_a_produzir,
                sum(num_bobines_a_produzir) over () num_bobines_a_produzir_total,
                t.num_paletes_produzidas,
                max(t.num_paletes_produzidas_total) over() num_paletes_produzidas_total,
                num_paletes_stock_in,
                sum(num_paletes_stock_in) over () num_paletes_stock_total,
                t.num_paletes_produzidas + num_paletes_stock_in num_paletes,
                sum(t.num_paletes_produzidas + num_paletes_stock_in) over() num_paletes_total
                from (
                SELECT
                DISTINCT
                replace(replace(replace(replace(cs.cortes->'$.largura_json','\\"','"'),'\\[','['),'"{{','{{'),'}}"','}}') cortes,
                replace(replace(replace(replace(cs.cortesordem->'$.largura_ordem','\\"','"'),'\\[','['),'"{{','{{'),'}}"','}}') cortesordem,
                ofd.of_id,ofd.of_cod,ofd.artigo_des,ofd.artigo_produto,ofd.cliente_nome,ofd.artigo_lar,
                op.num_paletes_total num_paletes_a_produzir,
                op.num_paletes_total*op.bobines_por_palete num_bobines_a_produzir,
                op.num_paletes_stock_in,
                op.bobines_por_palete,
                IFNULL(CP.num_paletes_produzidas,0) num_paletes_produzidas,
                IFNULL(CP.num_paletes_produzidas_total,0) num_paletes_produzidas_total
                FROM planeamento_ordemproducao op
                JOIN producao_currentsettings cs on cs.agg_of_id=op.agg_of_id_id
                LEFT JOIN CNT_PALETES CP on CP.id=op.id
                left join producao_palete pl on pl.ordem_id=op.id and pl.num_bobines_act=pl.num_bobines
                left join JSON_TABLE(cs.ofs,'$[*]' COLUMNS(of_id INT PATH '$.of_id',of_cod VARCHAR(30) PATH '$.of_cod',artigo_des VARCHAR(100) PATH '$.artigo_des',cliente_nome VARCHAR(200) PATH '$.cliente_nome',artigo_produto VARCHAR(100) PATH '$.artigo_produto',artigo_lar INT PATH '$.artigo_lar' )) ofd on ofd.of_id=op.id
                where op.agg_of_id_id={cs[0]["agg_of_id"]}
                ) t                
                """
            ), cursor, {})['rows']
            if len(rows)>0:
                response["paletes_bobines"]=rows
            rows = db.executeSimpleList(lambda: (f"""
                        select 
                        round(avg(TIME_TO_SEC(pbm.duracao)/60) over ()) average, 
                        round(stddev(TIME_TO_SEC(pbm.duracao)/60) over ()) stddev,
                        round(min(TIME_TO_SEC(pbm.duracao)/60) over() ) min,
                        round(max(TIME_TO_SEC(pbm.duracao)/60) over() ) max,
                        round(TIME_TO_SEC(pbm.duracao)/60) last_bobinagem
                        from producao_bobinagem pbm
                        where pbm.id in (    
                            select 
                            distinct bobinagem_id
                            from producao_bobine pb
                            join planeamento_ordemproducao op on op.id=pb.ordem_id
                            where op.agg_of_id_id={cs[0]["agg_of_id"]} and pb.estado in ('G','HOLD')
                        )
                        order by `timestamp` desc
                        limit 1
            """
            ), cursor, {})['rows']
            if len(rows)>0:
                response["average_bobinagens"]=rows[0]
    print(response)
    return Response(response)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def EventosProducao(request, format=None):
    
    if "csid" in request.data['filter']:
   
        f = Filters(request.data['filter'])
        f.setParameters({"csid": {"value": lambda v: v.get('csid'), "field": lambda k, v: f'cs.id'}}, True)
        f.where()
        f.auto()
        f.value("and")
        parameters = {**f.parameters}
        
        dql = db.dql(request.data, False)
        with connections["default"].cursor() as cursor:
            response = db.executeSimpleList(lambda: (
                f"""
                    SELECT acs.id,acs.type_op,acs.timestamp
                    from producao_currentsettings cs
                    join audit_currentsettings acs on cs.id=acs.contextid
                    {f.text}
                    order by acs.timestamp asc
                """
            ), cursor, parameters)
    else:
        with connections["default"].cursor() as cursor:
            response = db.executeSimpleList(lambda: (
                f"""
                    SELECT acs.id,acs.type_op,acs.timestamp
                    from producao_currentsettings cs
                    join audit_currentsettings acs on cs.id=acs.contextid
                    where cs.status=3
                    order by acs.timestamp asc
                """
            ), cursor, {})
    
    return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def AuditCurrentSettingsGet(request, format=None):
    cols = ['''
        `id`,`gamaoperatoria`,`nonwovens`,`artigospecs`,`cortes`,`cortesordem`,`cores`,`paletizacao`,`emendas`,`ofs`,`paletesstock`,
        `status`,`observacoes`,`start_prev_date`,`end_prev_date`,`horas_previstas_producao`,`sentido_enrolamento`,`amostragem`,`type_op`,
        `timestamp`,`action`,`contextid`,`agg_of_id`,`user_id`,`gsm`,`produto_id`,`produto_cod`,`lotes`,`dosers`,`created`,`limites`,
        `ofs_ordem`,`end_date`,`start_date`,`ignore_audit`,`formulacaov2` formulacao
    ''']
    f = Filters(request.data['filter'])
    f.setParameters({
        "id": {"value": lambda v: v.get('acsid'), "field": lambda k, v: f'acs.{k}'},
    }, True)
    f.where()
    f.auto()
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                select 
                {dql.columns}
                from audit_currentsettings acs
                {f.text}
                limit 1
            """
        ), cursor, parameters)
        return Response(response)

def GetCurrentSettings(request, format=None):
    cols = ['''
        `id`,`gamaoperatoria`,`nonwovens`,`artigospecs`,`cortes`,`cortesordem`,`cores`,`paletizacao`,`emendas`,`ofs`,`paletesstock`,`status`,`observacoes`,
        `start_prev_date`,`end_prev_date`,`horas_previstas_producao`,`sentido_enrolamento`,`amostragem`,`agg_of_id`,`user_id`,`gsm`,`produto_id`,`produto_cod`,`lotes`,
        `type_op`,`dosers`,`created`,`limites`,`ofs_ordem`,`end_date`,`start_date`,`ignore_audit`,`formulacaov2` `formulacao`,
        IFNULL((select 1 from audit_currentsettings acs where acs.contextid=cs.id and acs.`status` in (3) limit 1),0) was_in_production
    ''']
    f = Filters(request.data['filter'])
    f.setParameters({
        "st": {"value": 3, "field": lambda k, v: f'{k}'},
    }, False)
    f.where()
    f.add(f'agg_of_id = :aggId', lambda v:(v!=None))
    f.add(f'status = :st',lambda v:"aggId" not in request.data['filter'])
    f.value("and")
    parameters = {**f.parameters}
    

    dql = db.dql(request.data, False, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                select 
                {dql.columns}
                from producao_currentsettings cs
                {f.text}
                {dql.sort}
            """
        ), cursor, parameters)
        return Response(response)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def CurrentSettingsGet(request, format=None):
    return GetCurrentSettings(request, format=None)

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def CurrentSettingsInProductionGet(request, format=None):
    with connections["default"].cursor() as cursor:
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
        return Response(response)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def UpdateCurrentSettings(request, format=None):
    data = request.data.get("parameters")
    def getCurrentSettings(data,cursor):
        f = Filters({"id": data["csid"],"status":9})
        f.where()
        f.add(f'id = :id', True)
        f.add(f'status <> :status', True)
        f.value("and")  
        rows = db.executeSimpleList(lambda: (f'SELECT * FROM producao_currentsettings {f.text}'), cursor, f.parameters)['rows']
        if len(rows)>0:
            return rows[0]
        return None

    def compPaletizacao(cp,paletizacao):
        
        sqm_paletes_total = 0
        nitems = 0
        items = []
        computed = {}
        if paletizacao is not None:
            for pitem in [d for d in paletizacao["details"] if 'item_numbobines' in d and d['item_numbobines'] is not None]:
                if pitem["id"] is not None:
                    nitems += 1
                    items.append({
                        "id":pitem["id"],
                        "num_bobines":pitem["item_numbobines"],
                        "sqm_palete":cp["sqm_bobine"]*pitem["item_numbobines"]
                    })
                    sqm_paletes_total += (cp["sqm_bobine"]*pitem["item_numbobines"])
            if nitems>0:
                computed["total"] = {
                    "sqm_paletes_total":sqm_paletes_total,
                    "sqm_contentor":sqm_paletes_total*paletizacao["npaletes"],
                    "n_paletes":(cp["qty_encomenda"]/sqm_paletes_total)*nitems
                }
                computed["items"] = items
        return computed
            

    try:
        with connections["default"].cursor() as cursor:
            cs = getCurrentSettings(request.data['filter'],cursor)
            if cs is None:
                return Response({"status": "error", "id":None, "title": f'Erro ao Alterar Ordem de Fabrico', "subTitle":"Não é possível alterar as Definições da Ordem (O estado atual não o permite!!)."})
    except Exception as error:
        return Response({"status": "error", "id":None, "title": f'Erro de Execução', "subTitle":str(error)})

    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'id = :csid', True)
    f.value("and")
    if data['type'].startswith('formulacao'):
        # ok=1
        # for v in data['formulacao']['items']:
        #     if "doseador_A" in v:
        #         pass
        #     elif  "doseador_B" in v or "doseador_C" in v:
        #         pass
        #     elif "doseador" in v:
        #         pass
        #     else:
        #         ok=0
        #         break
        # data["formulacao"]["valid"] = ok
        # dosers = []
        # for v in data["formulacao"]["items"]:
        #     if "doseador_A" in v:
        #         dosers.append({
        #             "nome":v["doseador_A"],
        #             "grupo":v["cuba_A"],
        #             "matprima_cod": v["matprima_cod"],
        #             "matprima_des": v["matprima_des"]
        #         })
        #     if "doseador_B" in v:
        #         dosers.append({
        #             "nome":v["doseador_B"],
        #             "grupo":v["cuba_BC"],
        #             "matprima_cod": v["matprima_cod"],
        #             "matprima_des": v["matprima_des"]
        #         })
        #     if "doseador_C" in v:
        #         dosers.append({
        #             "nome":v["doseador_C"],
        #             "grupo":v["cuba_BC"],
        #             "matprima_cod": v["matprima_cod"],
        #             "matprima_des": v["matprima_des"]
        #         })
        #     if "doseador" in v:
        #         dosers.append({
        #             "nome":v["doseador"],
        #             "grupo":v["cuba"],
        #             "matprima_cod": v["matprima_cod"],
        #             "matprima_des": v["matprima_des"]
        #     })
        # dta = {
        #     "dosers":json.dumps(dosers, ensure_ascii=False),
        #     "formulacaov2":json.dumps(data['formulacao'], ensure_ascii=False),
        #     "type_op":data['type']
        # }
        # dml = db.dml(TypeDml.UPDATE,dta,"producao_currentsettings",f,None,False)
        try:
            with connections["default"].cursor() as cursor:
                args = (request.data['filter']["csid"],json.dumps(data['formulacao']),data['type'],request.user.id,0)
                print("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
                print(args)
                cursor.callproc('update_currentsettings',args)
                #db.execute(dml.statement, cursor, dml.parameters)
            return Response({"status": "success", "id":request.data['filter']['csid'], "title": f'Definições Atuais Atualizadas com Sucesso', "subTitle":f""})
        except Exception as error:
            return Response({"status": "error", "id":request.data['filter']['csid'], "title": str(error), "subTitle":str(error)})
    if data['type'] == 'gamaoperatoria':
        # items = []
        # itms = collections.OrderedDict(sorted(data["gamaoperatoria"].items()))
        # for i in range(data["gamaoperatoria"]['nitems']):            
        #     key = itms[f'key-{i}']
        #     values = [ v for k,v in itms.items() if k.startswith(f'v{key}-')]
        #     items.append({
        #         "item_des":itms[f'des-{i}'], 
        #         "item_values":values, 
        #         "tolerancia":itms[f'tolerancia-{i}'],
        #         "gamaoperatoria_id":data["gamaoperatoria"]['id'],
        #         "item_key":key,
        #         "item_nvalues":len(values)
        #     })
        # dta = {
        #     "gamaoperatoria" : json.dumps({ 
        #         'id': data["gamaoperatoria"]['id'],
        #         'produto_id': data["gamaoperatoria"]["produto_id"],
        #         'designacao': data["gamaoperatoria"]["designacao"],
        #         'versao': data["gamaoperatoria"]["versao"],
        #         "created_date": data["gamaoperatoria"]["created_date"],
        #         "updated_date": data["gamaoperatoria"]["updated_date"],
        #         "items":items
        #     }, ensure_ascii=False),
        #     "type_op":"gamaoperatoria"
        # }
        # #dml = db.dml(TypeDml.UPDATE,dta,"producao_currentsettings",f,None,False)
        # print("GAMA OPERATORIA ---> ALTERAR")
        # print(json.dumps(data['gamaoperatoria']))
        # print(dta)
        try:
            with connections["default"].cursor() as cursor:
                args = (request.data['filter']["csid"],json.dumps(data['gamaoperatoria']),data['type'],request.user.id,0)
                cursor.callproc('update_currentsettings',args)
                #db.execute(dml.statement, cursor, dml.parameters)
            return Response({"status": "success", "id":request.data['filter']['csid'], "title": f'Definições Atuais Atualizadas com Sucesso', "subTitle":f""})
        except Exception as error:
            return Response({"status": "error", "id":request.data['filter']['csid'], "title": str(error), "subTitle":str(error)})
    if data['type'] == 'specs':
        # items = []
        # itms = collections.OrderedDict(sorted(data["specs"].items()))
        # for i in range(data["specs"]['nitems']):            
        #     key = itms[f'key-{i}']
        #     values = [ v for k,v in itms.items() if k.startswith(f'v{key}-')]
        #     items.append({
        #         "item_des":itms[f'des-{i}'], 
        #         "item_values":json.dumps(values),
        #         "artigospecs_id":data["specs"]['id'],
        #         "item_key":key,
        #         "item_nvalues":len(values)
        #     })
        # dta = {
        #     "artigospecs":json.dumps({ 
        #         'id': data["specs"]['id'],
        #         'produto_id': data["specs"]["produto_id"],
        #         'designacao': data["specs"]["designacao"],
        #         'versao': data["specs"]["versao"],
        #         'cliente_cod': data["specs"]["cliente_cod"],
        #         'cliente_nome': data["specs"]["cliente_nome"],
        #         "created_date": data["specs"]["created_date"],
        #         "updated_date": data["specs"]["updated_date"],
        #         "items":items
        #     }, ensure_ascii=False),
        #     "type_op":"specs"
        # }
        #dml = db.dml(TypeDml.UPDATE,dta,"producao_currentsettings",f,None,False)
        try:
            with connections["default"].cursor() as cursor:
                args = (request.data['filter']["csid"],json.dumps(data['specs']),data['type'],request.user.id,0)
                cursor.callproc('update_currentsettings',args)
                #pass
                #db.execute(dml.statement, cursor, dml.parameters)
            return Response({"status": "success", "id":request.data['filter']['csid'], "title": f'Definições Atuais Atualizadas com Sucesso', "subTitle":f""})
        except Exception as error:
            return Response({"status": "error", "id":request.data['filter']['csid'], "title": str(error), "subTitle":str(error)})
    if data['type'] == 'cortes':
        # dml = db.dml(TypeDml.UPDATE,{"cortes_id":data["cortes"]["cortes_id"],"cortesordem_id":data["cortes"]["cortesordem_id"]},"producao_currentsettings",f,None,False)
        # dml.statement = f"""        
        #         update 
        #         producao_currentsettings pcs
        #         JOIN (
        #         select 
        #         %(csid)s csid,
        #         (select 
        #         JSON_OBJECT('created_date', pc.created_date,'id', pc.id,'largura_cod', pc.largura_cod,'largura_json', pc.largura_json,'updated_date', pc.updated_date
        #         ) cortes
        #         FROM producao_cortes pc
        #         where pc.id=%(cortes_id)s) cortes,
        #         (select 
        #         JSON_OBJECT('cortes_id', pco.cortes_id,'created_date', pco.created_date,'designacao', pco.designacao,'id', pco.id,'largura_ordem', pco.largura_ordem,'ordem_cod', 
        #         pco.ordem_cod,'updated_date', pco.updated_date,'versao', pco.versao
        #         ) cortesordem
        #         FROM producao_cortesordem pco
        #         WHERE pco.id=%(cortesordem_id)s) cortesordem
        #         ) tbl
        #         on tbl.csid=pcs.id
        #         set
        #         pcs.cortes = tbl.cortes,
        #         pcs.cortesordem = tbl.cortesordem,
        #         pcs.type_op = 'cortes'     
        # """
        try:
            with connections["default"].cursor() as cursor:
                args = (request.data['filter']["csid"],json.dumps(data['cortes']),data['type'],request.user.id,0)
                cursor.callproc('update_currentsettings',args)
                #db.execute(dml.statement, cursor, dml.parameters)
            return Response({"status": "success", "id":request.data['filter']['csid'], "title": f'Definições Atuais Atualizadas com Sucesso', "subTitle":f""})
        except Exception as error:
            return Response({"status": "error", "id":request.data['filter']['csid'], "title": str(error), "subTitle":str(error)})
    if data['type'] == 'settings':
        try:
            print("SETTTTTTTTTTTTTTTIIINNGGGGS")
            print(json.dumps(data))
            with connections["default"].cursor() as cursor:
                emendas = json.loads(cs["emendas"])
                for idx,x in enumerate(emendas):
                    if x["of_id"]==data["ofabrico_cod"]:
                        print(x["emendas"])
                        emendas[idx]['emendas']=json.dumps({**json.loads(x["emendas"]),"maximo":data["maximo"],"tipo_emenda":data["tipo_emenda"],"emendas_rolo":data["nemendas_rolo"],"paletes_contentor":data["nemendas_paletescontentor"]})
                cores = json.loads(cs["cores"])
                for idx,x in enumerate(cores):
                    if x["of_id"]==data["ofabrico_cod"]:
                        cores[idx]['cores'][0] = {**x['cores'][0],"core_cod":data["core_cod"],"core_des":data["core_des"]}
                limites = json.loads(cs["limites"])
                for x in json.loads(cs["limites"]):
                    if x["of_id"]==data["ofabrico_cod"]:
                        limites[idx] = {**x}
                sentido_enrolamento= cs["sentido_enrolamento"]
                amostragem = cs["amostragem"]
                ofs = json.loads(cs["ofs"])
                for idx,x in enumerate(ofs):
                    if x["of_id"]==data["ofabrico_cod"]:
                        ofs[idx]['n_paletes_total']=data['n_paletes_total']
                        dataop = {
                            "largura": data['artigo_width'],
                            "core": data['artigo_core'] + '"',
                            "num_paletes_produzir":data['n_paletes_total'] - data['n_paletes_stock'],
                            "num_paletes_stock":data['n_paletes_stock'],
                            "num_paletes_total":data['n_paletes_total'],
                            "emendas":f"{data['nemendas_rolo']}/rolo (máximo {data['maximo']}% - {data['nemendas_paletescontentor']} paletes/contentor)",
                            "enrolamento":sentido_enrolamento,
                            "freq_amos":amostragem,
                            "user_id":request.user.id,
                            "tipo_emenda":tipoemendas[str(data["tipo_emenda"])],
                        }
                        ofabrico_cod = data["ofabrico_cod"]
                        # dml = db.dml(TypeDml.UPDATE,dataop,"planeamento_ordemproducao",{"id":f"=={ofabrico_cod}"},None,False)
                        # db.execute(dml.statement, cursor, dml.parameters)
                        # dml = db.dml(TypeDml.UPDATE,{
                        #     "emendas":json.dumps(emendas,ensure_ascii=False),
                        #     "cores":json.dumps(cores,ensure_ascii=False),
                        #     "limites":json.dumps(limites,ensure_ascii=False),
                        #     "ofs":json.dumps(ofs,ensure_ascii=False),
                        #     "sentido_enrolamento":sentido_enrolamento,
                        #     "amostragem":amostragem,
                        #     "type_op":"settings_of_change"
                        #     },"producao_currentsettings",{"id":f'=={request.data["filter"]["csid"]}'},None,False)
                        # db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "id":None, "title": f'Definições Atuais Atualizadas com Sucesso', "subTitle":f""})
            return Response({"status": "success", "id":request.data['filter']['csid'], "title": f'Definições Atuais Atualizadas com Sucesso', "subTitle":f""})
        except Exception as error:
            return Response({"status": "error", "id":None, "title": f'Definições Atuais', "subTitle":str(error)})
    if data['type'] == 'paletizacao':
        #paletizacoes = json.loads(cs["paletizacao"])
        #ofs = json.loads(cs["ofs"])
        #_paletizacao=data["paletizacao"]["paletizacao"]
        #for idx,x in enumerate(paletizacoes):
        #    if x["of_id"]==data["paletizacao"]["of_id"]:
        #        data["paletizacao"]["paletizacao"]=json.dumps(_paletizacao,ensure_ascii=False)
        #        paletizacoes[idx]= data["paletizacao"]
        ## for idx,x in enumerate(ofs):
        ##     if x["of_id"]==data["paletizacao"]["of_id"]:
        ##         cp = computeLinearMeters(data) #talvez não seja necessário
        ##         cpp = compPaletizacao(cp,_paletizacao) #talvez não seja necessário
        ##         p={}
        ##         if (len(cp.keys())>0):
        ##             p['qty_encomenda'] = cp['qty_encomenda'],
        ##             p['linear_meters'] = cp["linear_meters"],
        ##             p['n_voltas'] = cp["n_voltas"],
        ##             p['sqm_bobine'] = cp["sqm_bobine"]
        ##             p['n_paletes'] = json.dumps(cpp,ensure_ascii=False)
        ##         ofs[idx] = {**ofs[idx],**p}
        ##dta={"paletizacao":json.dumps(paletizacoes,ensure_ascii=False),"type_op":"paletizacao"}
        ##dml = db.dml(TypeDml.UPDATE,dta,"producao_currentsettings",f,None,False)
        try:
            with connections["default"].cursor() as cursor:
                args = (request.data['filter']["csid"],json.dumps(data["paletizacao"],ensure_ascii=False),data['type'],request.user.id,0)
                cursor.callproc('update_currentsettings',args)
                #db.execute(dml.statement, cursor, dml.parameters)
            return Response({"status": "success", "id":request.data['filter']['csid'], "title": f'Paletização Atual Atualizada com Sucesso', "subTitle":f""})
        except Exception as error:
            return Response({"status": "error", "id":request.data['filter']['csid'], "title": str(error), "subTitle":str(error)})
    if data['type'] == 'nonwovens':
        #dta = {
        #    "nonwovens" : json.dumps({**data["nonwovens"]}, ensure_ascii=False),
        #    "type_op":"nonwovens"
        #}
        #dml = db.dml(TypeDml.UPDATE,dta,"producao_currentsettings",f,None,False)
        try:
            with connections["default"].cursor() as cursor:
                args = (request.data['filter']["csid"],json.dumps(data["nonwovens"],ensure_ascii=False),data['type'],request.user.id,0)
                cursor.callproc('update_currentsettings',args)
                #db.execute(dml.statement, cursor, dml.parameters)
            return Response({"status": "success", "id":request.data['filter']['csid'], "title": f'Nonwovens Atualizados com Sucesso', "subTitle":f""})
        except Exception as error:
            return Response({"status": "error", "id":request.data['filter']['csid'], "title": str(error), "subTitle":str(error)})

        
@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def ChangeCurrSettingsStatus(request, format=None):
    data = request.data.get("parameters")
    def checkOfIsValid(id,data,cursor):
        f = Filters({"id": id})
        f.setParameters({}, False)
        f.where()
        f.add(f'id = :id', True)
        f.value("and")   
        return db.executeSimpleList(lambda: (f"""
            SELECT CASE WHEN 
            JSON_EXTRACT(formulacaov2, "$.valid")=1 AND 
            JSON_EXTRACT(cortes, "$.id") IS NOT NULL AND 
            JSON_EXTRACT(cortesordem, "$.id") IS NOT NULL 
            THEN 1 ELSE 0 END 
            valid
            FROM producao_currentsettings 
            {f.text}
        """), cursor, f.parameters)['rows'][0]['valid']

    def updateOP(id,data,cursor,status_str):
        dml = db.dml(TypeDml.UPDATE,{"id":id},"planeamento_ordemproducao",{},None,False)
        dml.statement = f"""
                update planeamento_ordemproducao op
                join (select t.ofid from
                (SELECT JSON_EXTRACT(ofs, "$[*].of_id") ofids FROM producao_currentsettings where id=%(id)s) ofs
                join JSON_TABLE(CAST(ofids as JSON), "$[*]" COLUMNS(ofid INT PATH "$")) t ON TRUE
                ) t on op.id=t.ofid
                set 
                {status_str}
        """
        db.execute(dml.statement, cursor, dml.parameters)

    def getLastOrder(ig_id,cursor):
        f = Filters({"id":ig_id})
        f.where(False,"and")
        f.add(f'ig_bobinagem_id = :id', True)
        f.value("and")  
        rows = db.executeSimpleList(lambda: (f'select IFNULL(max(`order`),0) n from lotesdosers where closed=0 and status<>0 {f.text}'), cursor, f.parameters)['rows']
        if len(rows)>0:
            return rows[0]
        return None

    try:
        with connections["default"].cursor() as cursor:
            if (data["status"]==3):
                print("Em producao")
                exists = db.exists("producao_currentsettings",{"status":3},cursor).exists
                if (exists==0):
                    #CHECK IF DOSERS AND CUTS ARE CORRECTLY DEFINED
                    if checkOfIsValid(data["id"],data,cursor)==1:
                        dta = {"status":3,"type_op":"status_inproduction"}
                        if (db.count("audit_currentsettings",{"status":3,"contexid":data["id"]}).count==0):
                            dta["start_date"]=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                        dml = db.dml(TypeDml.UPDATE, dta , "producao_currentsettings",{"id":f'=={data["id"]}'},None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                        updateOP(data["id"],data,cursor,f"`status`=3,ativa=1,completa=0,inicio='{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}'")
                        return Response({"status": "success", "id":0, "title": f'Ordem de Fabrico Iniciada!', "subTitle":f""})
                    else:
                        return Response({"status": "error", "id":0, "title": f'A formulação ou Posição dos Cortes não estão corretamente definidos !', "subTitle":""})
            elif (data["status"]==0):
                print("redo plan....")
                pass
            elif (data["status"]==1):
                exists = db.exists("producao_currentsettings",{"status":3},cursor).exists
                if (exists==1):
                        maxOrder = getLastOrder(data["ig_id"],cursor)
                        dml = db.dml(TypeDml.UPDATE, {"status":1,"type_op":"status_stopped"} , "producao_currentsettings",{"id":f'=={data["id"]}'},None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                        updateOP(data["id"],data,cursor,f"`status`=2,ativa=0,completa=0,fim='{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}'")
                        t_stamp = datetime.strptime(data["date"], "%Y-%m-%d %H:%M:%S") if data["last"] == False else datetime.now()
                        ld = {"doser":"X","status":-1,"t_stamp":t_stamp,"agg_of_id":data["agg_of_id"],"type_mov":"END","`order`":maxOrder["n"]+1,"closed":0}
                        dml = db.dml(TypeDml.INSERT, ld , "lotesdosers",None,None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                        return Response({"status": "success", "id":0, "title": f'Ordem de Fabrico Parada/Suspensa!', "subTitle":f""})
            elif (data["status"]==9):
                #FINALIZAR ORDEM DE FABRICO
                exists = db.exists("producao_currentsettings",{"status":"<9"},cursor).exists
                print("finish")
                print(exists)
                if (exists==1):
                        maxOrder = getLastOrder(data["ig_id"],cursor)
                        dml = db.dml(TypeDml.UPDATE, {"status":9,"type_op":"status_finished","end_date":datetime.now().strftime('%Y-%m-%d %H:%M:%S')} , "producao_currentsettings",{"id":f'=={data["id"]}'},None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                        updateOP(data["id"],data,cursor,f"`status`=9,ativa=0,completa=1,fim='{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}'")
                        t_stamp = datetime.strptime(data["date"], "%Y-%m-%d %H:%M:%S") if data["last"] == False else datetime.now()
                        ld = {"doser":"X","status":-1,"t_stamp":t_stamp,"agg_of_id":data["agg_of_id"],"type_mov":"END","`order`":maxOrder["n"]+1,"closed":0}
                        dml = db.dml(TypeDml.INSERT, ld , "lotesdosers",None,None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
                        return Response({"status": "success", "id":0, "title": f'Ordem de Fabrico Finalizada!', "subTitle":f""})
                pass
    except Exception as error:
        return Response({"status": "error", "id":0, "title": f'Erro ao alterar estado.', "subTitle":str(error)})
    return Response({"status": "error", "id":0, "title": f'Já existe uma Ordem de Fabrico em Curso!', "subTitle":""})



@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def StockCutOptimizer(request, format=None):
    data = request.data.get("parameters")
    try:
        if "child_rolls" not in data or "parent_rolls" not in data:
            raise Exception("Erro nos parametros de entrada!")
        child_rolls =  data["child_rolls"]   #[[324, 120],[88, 150],[33, 75]]
        parent_rolls = data["parent_rolls"] #[[10, 2100]] # 10 doesn't matter, itls not used at the moment
        max_cutters = data["max_cutters"]
        consumed_big_rolls = StockCutter1D(child_rolls, parent_rolls, output_json=False, large_model=True, max_cutters=max_cutters)
        rolls = []
        rolls={}
        for idx, roll in enumerate(consumed_big_rolls):
            hsh = hashlib.md5(json.dumps(roll[1], sort_keys=True).encode()).hexdigest()[ 0 : 16 ]
            if hsh in rolls:
                rolls[hsh]["n"]+=1
            else:
                rolls[hsh]={"cuts":roll[1],"cuts_count":dict(Counter(roll[1]).items()),"n":1,"largura_util":sum(roll[1])}        
        return Response(list(rolls.values()))
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response({"status": "error", "title": f'Erro Genérico', "subTitle":""})


