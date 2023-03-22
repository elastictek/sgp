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
    


def OrdensFabricoOpen(request, format=None):
    connection = connections["default"].cursor()
    response = db.executeSimpleList(lambda: (
        f"""
            select esquema,po.id,po.ofid,po.op,pt.cliente_nome ,pt.prf_cod ,pt.order_cod ,pt.item_cod , po.bobines_por_palete
            from planeamento_ordemproducao po 
            left join producao_currentsettings pc on pc.agg_of_id = po.agg_of_id_id
            left join JSON_TABLE (pc.paletizacao,"$[*]"COLUMNS ( of_id INT PATH "$.of_id", esquema JSON PATH "$") ) t on t.of_id=po.id
            left join producao_tempordemfabrico pt on pt.id=po.draft_ordem_id 
            where po.ativa = 1 and po.completa = 0 order by po.ofid is null,po.ofid
        """
    ), connection, {})
    return Response(response)

def ClienteExists(request, format=None):
    cursor = connections["default"].cursor()
    filter = request.data.get("filter")
    f = Filters({"cod": filter['cliente_cod']})
    f.setParameters({}, False)
    f.where()
    f.add(f'cod = :cod', True)
    f.value("and")
    exists = db.exists("producao_cliente", f, cursor).exists
    return Response({"exists":exists})

def TempOrdemFabricoGet(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'tof.id = :temp_ofabrico',lambda v:(v!=None))
    f.add(f'tof.agg_of_id = :agg_of_id',lambda v:(v!=None))
    f.value()

    f2 = filterMulti(request.data['filter'], {}, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""tof.*,tagg.*, tof.id id, tagg.id aggid,
                pa.cod artigo_cod,
                pa.id artigo_id,pa.des artigo_des, pa.nw1 artigo_nw1, pa.nw2 artigo_nw2,pa.lar artigo_width,
                pa.formu artigo_formula,pa.diam_ref artigo_diam, pa.core artigo_core,
                pa.gsm artigo_gram, pa.gtin artigo_gtin, pa.thickness artigo_thickness,
                CASE WHEN pac.produto is not null and pac.produto<>'' THEN pac.produto ELSE prod.produto_cod END produto_cod,
                CASE WHEN pac.produto is not null and pac.produto<>'' THEN pac.produto ELSE prod.produto_cod END produto_alt,
                pc.id cliente_id,
                (select JSON_ARRAYAGG(JSON_OBJECT('id',pd.id,'item_id',pd.item_id,'item_des',pd.item_des,'item_order',pd.item_order,'item_numbobines',item_numbobines,
                'item_paletesize',item_paletesize,'paletizacao_id',paletizacao_id)) x from producao_paletizacaodetails pd where tof.paletizacao_id=pd.paletizacao_id) paletizacao,
                ppz.filmeestiravel_bobines, ppz.filmeestiravel_exterior,ppz.cintas, ppz.ncintas
            """
    dql.columns=encloseColumn(cols,False)
    sql = lambda: (
        f"""  
            select {f'{dql.columns}'}
            from producao_tempordemfabrico tof
            join producao_tempaggordemfabrico tagg on tof.agg_of_id = tagg.id
            join producao_artigo pa on pa.cod=tof.item_cod
            JOIN producao_produtos prod on pa.produto_id=prod.id
            left join producao_paletizacao ppz on ppz.id=tof.paletizacao_id
            left join producao_cliente pc on pc.cod=tof.cliente_cod
            left join producao_artigocliente pac on pac.artigo_id=pa.id and pac.cliente_id=pc.id
            {f.text} {f2["text"]}
            {dql.sort} {dql.limit}
        """
    )
    print(sql)
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



#region INTERNAL METHODS

def checkAgg(ofabrico_id,ofabrico_cod,cursor):
    if ofabrico_id is None:
        f = Filters({"cod": ofabrico_cod})
        f.setParameters({}, False)
        f.where()
        f.add(f'tof.of_id = :cod', True)
        f.value("and")   
        exists = db.exists("producao_tempordemfabrico tof", f, cursor).exists
        if (not exists):
            return {"status":"success"}
        else:
            return {"status": "error", "title": "Erro ao Guardar a Ordem de Fabrico!","subTitle":"A Ordem de Fabrico já se encontra Criada."}
    else:
        f = Filters({"id": ofabrico_id})
        f.setParameters({}, False)
        f.where()
        f.add(f'tof.id = :id', True)
        f.value("and")   
        rows = db.executeSimpleList(lambda: (f'''
                select toaf.status
                FROM producao_tempordemfabrico tof
                join producao_tempaggordemfabrico toaf on tof.agg_of_id=toaf.id
                {f.text}
        '''), cursor, f.parameters)['rows']
        status = rows[0]["status"] if len(rows)>0 else None
        return {"status":"success"}
        if (status==None):
            return {"status": "error", "title": "Erro ao Guardar a Ordem de Fabrico!","subTitle":"Não existe Ordem de Produção Agregada."}
        elif (status==0):
            return {"status":"success"}
        else:
            return {"status": "error", "title": "Erro ao Guardar a Ordem de Fabrico!","subTitle":"O planeamento da Ordem de Fabrico Já se encontra Fechado."}

def computeLinearMeters(data):
    artigo = data["artigo"] if "artigo" in data else data
    if artigo is not None:
        t = (float(artigo['artigo_thickness'])/1000)
        D1 = float(artigo['artigo_diam'] if "artigo_diam" in artigo else artigo["artigo_diam_ref"])
        d1 = float(artigo['artigo_core']) * 25.4
        l = (( math.pi * ( (D1/2)**2 - (d1/2)**2 ) ) / t) / 1000
        nvoltas = (D1 - d1) / ( 2 * t )
        return {
            "qty_encomenda":artigo['qty_item'] if 'qty_item' in artigo else data['qty_item'] if "qty_item" in data else artigo["qty_encomenda"],
            "linear_meters":l,
            "n_voltas":nvoltas,
            "sqm_bobine":(l*float(artigo['artigo_width'] if "artigo_width" in artigo else artigo["artigo_lar"]))/1000
        }
    return None

def addProduto(produto_cod,cursor):
        if produto_cod is not None:       
            f = Filters({"produto_cod": produto_cod.lower().strip() })
            f.where()
            f.add(f'lower(produto_cod) = :produto_cod', True)
            f.value("and")
            produtoId = db.executeSimpleList(lambda: (f'SELECT id from producao_produtos {f.text}'), cursor, f.parameters)['rows']
            if len(produtoId)>0:
                return produtoId[0]['id']
            dml = db.dml(TypeDml.INSERT, {"produto_cod":produto_cod.strip()}, "producao_produtos",None,None,False)
            db.execute(dml.statement, cursor, dml.parameters)
            return cursor.lastrowid
        return None

def addArtigo(data,main_gtin,produto_id,cursor):
        if data.get("artigo_cod") is not None and produto_id is not None:
            f = Filters({"cod": data.get("artigo_cod")})
            f.where()
            f.add(f'cod = :cod', True)
            f.value("and")
            artigoId = db.executeSimpleList(lambda: (f'SELECT id from producao_artigo {f.text}'), cursor, f.parameters)['rows']

            dta = {
            'cod': data.get('artigo_cod'),
            'des': data.get('artigo_nome'),
            'tipo': "Produto Final",
            'core': data.get('artigo_core'),
            'diam_ref': data.get('artigo_diam'),
            'formu': data.get('artigo_formu'),
            'gsm': data.get('artigo_gram'),
            'lar': data.get('artigo_width'),
            'nw1': data.get('artigo_nw1'),
            'produto': data.get('produto_cod'),
            'produto_id': produto_id,
            'thickness': data.get('artigo_thickness'),
            'nw2': data.get('artigo_nw2')
            }
            dml = None
            if len(artigoId)>0:
                dml = db.dml(TypeDml.UPDATE, dta, "producao_artigo",{"id":artigoId[0]["id"]},None,None)
                db.execute(dml.statement, cursor, dml.parameters)
                return artigoId[0]["id"]
            else:
                if data.get("artigo_gtin"):
                    dta["gtin"] = data.get("artigo_gtin")
                else:
                    dta["gtin"] = computeGtin(cursor,main_gtin)
                dml = db.dml(TypeDml.INSERT, dta, "producao_artigo",None,None)
                db.execute(dml.statement, cursor, dml.parameters)
                return cursor.lastrowid
        else:
            return None

def computeGtin(cursor,main_gtin):
    id = getMaxArtigoGtin(cursor,main_gtin)
    cod = main_gtin + str(int(id[:-1].replace(main_gtin,''))+1)
    total = 0
    for i,element in enumerate(cod[::-1]):
        if (i+1) % 2 == 0:
            total = total + int(element)
        else:
            total = total + (int(element) * 3)
    chk = (math.ceil(total / 10) * 10) - total
    return cod + str(chk)

def getMaxArtigoGtin(cursor,main_gtin):
    f = Filters({})
    f.where()
    f.value("and")   
    return db.executeSimpleList(lambda: (f"SELECT IFNULL(MAX(gtin),0) AS mx FROM producao_artigo f WHERE gtin like '{main_gtin}%%'"), cursor,{})['rows'][0]['mx']

def getAgg(ofabrico_id, artigo_cod, cursor):
    if ofabrico_id is not None:
        return None
    f = Filters({"id": ofabrico_id, "item_cod": artigo_cod})
    f.setParameters({}, False)
    f.where()
    f.add(f'id = :id', True)
    f.add(f'item_cod = :item_cod', True)
    f.value("and")   
    rows = db.executeSimpleList(lambda: (f'SELECT agg_of_id,agg_ofid_original FROM producao_tempordemfabrico {f.text}'), cursor, f.parameters)['rows']
    return rows[0] if len(rows)>0 else None

def addTempAggOrdemFabrico(start_date,end_date, ids, cursor):
    dta = {
        'status': 0,
        'start_prev_date':datetime.now().strftime("%Y-%m-%d %H:%M:%S") if start_date is None else start_date,
        'end_prev_date':datetime.now().strftime("%Y-%m-%d %H:%M:%S") if end_date is None else end_date
    }
    if ids is None:
        dml = db.dml(TypeDml.INSERT, dta, "producao_tempaggordemfabrico",None,None,False)
        tags = []
        for idx, val in enumerate(dml.columns):
            tags.append(f'{dml.tags[idx]} {val}')
        statement = f"""
            insert into producao_tempaggordemfabrico(year,cod,{",".join(dml.columns)})
            select * from (
                select YEAR(CURDATE()) year, CONCAT('AGG-OF-',LPAD(IFNULL(count(*),0)+1,4,'0'),'/',YEAR(CURDATE())) d, {",".join(tags)}
                from producao_tempaggordemfabrico where year=YEAR(CURDATE())
            ) t
        """
        db.execute(statement, cursor, dml.parameters)
        return cursor.lastrowid
    return None

def addTempOrdemFabrico(data,agg_id,typeofabrico,artigo_id,produto_id, cp, cursor):
    dta = {
        'aggregated':0,
        'agg_of_id': agg_id,
        'agg_ofid_original': agg_id,
        'of_id': data.get('ofabrico_cod'),
        'order_cod': data.get('iorder'),
        'prf_cod':data.get('prf'),
        'item_cod': data.get('artigo_cod'),
        'item_id': artigo_id,
        'produto_id': produto_id,
        'typeofabrico':typeofabrico,
        'qty_encomenda': cp.get('qty_encomenda'),
        'linear_meters': cp.get("linear_meters"),
        'n_voltas': cp.get("n_voltas"),
        'sqm_bobine': cp.get("sqm_bobine")
    }
    if cliente_id is not None:
        dta["cliente_cod"]=data.get("cliente_cod")
        dta["cliente_nome"]=data.get("cliente_nome")
    dml = db.dml(TypeDml.INSERT, dta, "producao_tempordemfabrico",None,None,False)
    dml.statement = f"""{dml.statement} ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)"""
    db.execute(dml.statement, cursor, dml.parameters)
    return cursor.lastrowid

def addCliente(data,cursor):
    if data.get("cliente_cod") is not None:
        f = Filters({"cod": data.get("cliente_cod")})
        f.where()
        f.add(f'cod = :cod', True)
        f.value("and")
        clienteId = db.executeSimpleList(lambda: (f'SELECT id,limsup,liminf from producao_cliente {f.text}'), cursor, f.parameters)['rows'] 
        if len(clienteId)>0:
            v = None
            if Decimal(data.get("artigo_diam"))<clienteId[0]["liminf"]:
                v={"liminf":data.get("artigo_diam")}
            if Decimal(data.get("artigo_diam"))>clienteId[0]["limsup"]:
                v={"limsup":data.get("artigo_diam")}
            if v is not None:
                dml = db.dml(TypeDml.UPDATE, v, "producao_cliente",{"id":clienteId[0]["id"]},None,None)
                db.execute(dml.statement, cursor, dml.parameters)
            return clienteId[0]["id"]
        dta = {
            'cod': data.get('cliente_cod'),
            'nome': data.get('cliente_nome'),
            'abv': data.get('cliente_abv').upper(),
            "liminf":data.get("artigo_diam"),
            "limsup":data.get("artigo_diam"),
            "diam_ref":data.get("artigo_diam"),
            '`timestamp`':datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        dml = None
        dml = db.dml(TypeDml.INSERT, dta, "producao_cliente",None,None)
        db.execute(dml.statement, cursor, dml.parameters)
        return cursor.lastrowid
    else:
        return None

def addArtigoCliente(artigo_id,cliente_id,user_id,cursor):
    f = Filters({"artigo_id": artigo_id,"cliente_id": cliente_id})
    f.setParameters({}, False)
    f.where()
    f.add(f'artigo_id = :artigo_id', True)
    f.add(f'cliente_id = :cliente_id', True)
    f.value("and")
    exists = db.exists("producao_artigocliente", f, cursor).exists
    if not exists:
        dta = {
            'artigo_id': artigo_id,
            'cliente_id': cliente_id,
            'user_id':user_id,
            '`timestamp`':datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        dml = None
        dml = db.dml(TypeDml.INSERT, dta, "producao_artigocliente",None,None)
        db.execute(dml.statement, cursor, dml.parameters)

def getEncomendaSage(cod):
    cols = []
    f = Filters({"cod": cod})
    f.setParameters({}, False)
    f.where()
    f.add(f'"enc"."SOHNUM_0" = :cod', True)
    f.value("and")
    sageAlias = dbgw.dbAlias.get("sage")
    with connections[connGatewayName].cursor() as cursor:
        rows = dbgw.executeSimpleList(lambda: (
          f'''            
            SELECT 
            tbl.*,
            round(sqm/5400)+1 as num_paletes
            FROM
            (
            SELECT 
            DISTINCT ON ("enc"."SOHNUM_0") "enc"."SOHNUM_0" ,"enc"."PRFNUM_0","enc"."ORDDAT_0","enc"."DEMDLVDAT_0", "enc"."SHIDAT_0", "enclin"."EXTDLVDAT_0",
            SUM("enclin"."QTY_0") OVER w as sqm
            FROM {sageAlias}."SORDER" as enc
            JOIN {sageAlias}."SORDERQ" as enclin on enc."SOHNUM_0" = enclin."SOHNUM_0" 
            JOIN {sageAlias}."ITMMASTER" as itm on enclin."ITMREF_0" = itm."ITMREF_0"  
            {f.text}
            WINDOW w AS (PARTITION BY "enc"."SOHNUM_0")
            ) tbl            
            '''
        ), cursor, f.parameters)['rows']
        return rows[0] if len(rows)>0 else None 

def addEncomenda(order_cod,cliente_id,user_id,cursor):
    row = getEncomendaSage(order_cod)
    if row is not None:
        dta={
            "timestamp": datetime.now(),
            "data":datetime.now(),
            "eef":row["SOHNUM_0"],
            "prf":row["PRFNUM_0"],
            "sqm":row["sqm"],
            "estado":'A',
            "num_cargas":0,
            "num_cargas_actual":0,
            "num_paletes":row["num_paletes"],
            "num_paletes_actual":0,
            "data_encomenda":row["ORDDAT_0"],
            "data_expedicao":row["SHIDAT_0"],
            "data_prevista_expedicao":row["EXTDLVDAT_0"],
            "data_solicitada":row["DEMDLVDAT_0"],
            "prazo":0,
            "user_id":user_id,
            "cliente_id":cliente_id
        }
        dml = db.dml(TypeDml.INSERT, dta, "producao_encomenda")
        dml.statement = f"{dml.statement} ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(`id`)"
        db.execute(dml.statement, cursor, dml.parameters)
        return cursor.lastrowid

#endregion

def Validar(request, format=None):
    connection = connections["default"].cursor()
    data = request.data['parameters']
    values = data['values']
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                aggStatus = checkAgg(data.get("ofabrico_id"),data.get("ofabrico_cod"),cursor) #ofabrico_cod or ofabrico_id
                if (aggStatus["status"]=="error"):
                    return Response(aggStatus)
                cp = computeLinearMeters({"artigo":values})
                produto_id = data.get("produto_id") if data.get("produto_id") is not None else addProduto(values.get("produto_cod"),cursor)
                if (produto_id is None):
                    raise Exception("O Produto não existe/não se encontra registado!")
                artigo_id = data.get("artigo_id") if data.get("artigo_id") is not None else addArtigo({**values, "artigo_cod":data.get("artigo_cod")}, data.get('main_gtin'), produto_id,cursor)
                cliente_id = addCliente({"cliente_cod":data.get("cliente_cod"),"cliente_nome":data.get("cliente_nome"),**values},cursor)
                if (artigo_id is None):
                    raise Exception("O artigo não existe/não se encontra registado!")
                if (cliente_id is not None):
                    addArtigoCliente(artigo_id,cliente_id,request.user.id,cursor)
                    order_id = addEncomenda(data.get("iorder"),cliente_id,request.user.id,cursor)
                ids = getAgg(data.get("ofabrico_id"),data.get("artigo_cod"),cursor)
                agg_id = addTempAggOrdemFabrico(data.get("start_date"),data.get("end_date"),ids,cursor)
                if (agg_id is None):
                    raise Exception("A ordem de fabrico não foi registada!")
                id = addTempOrdemFabrico(data,agg_id,values.get('typeofabrico'),cliente_id,produto_id,cp,cursor)
        return Response({"status": "success", "success":f"""Ordem de fabrico validada com sucesso!"""})
    except Error as error:
        print(error)
        return Response({"status": "error", "title": str(error)})

def Ignorar(request, format=None):
    connection = connections["default"].cursor()
    data = request.data['parameters']
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                dml = db.dml(TypeDml.INSERT, {"cod":data.get("ofabrico_cod"),"ignorar":1}, "producao_ordemfabricodetails",None,None,False)
                dml.statement = f"""{dml.statement} ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)"""
                db.execute(dml.statement, cursor, dml.parameters)
                return cursor.lastrowid
                return Response({"status": "success", "success":f"""Ordem de fabrico ignorada com sucesso!"""})
    except Error as error:
        return Response({"status": "error", "title": str(error)})

def SaveProdutoAlt(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")    
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                if data.get("produto_alt"):
                    dml = db.dml(TypeDml.UPDATE, {"produto":data.get("produto_alt")}, "producao_artigocliente", {'artigo_id': f'=={filter.get("artigo_id")}','cliente_id': f'=={filter.get("cliente_id")}'}, None, False)
                    db.execute(dml.statement, cursor, dml.parameters)
                else:
                    return Response({"status": "error", "title": f"Não é possível alterar a designação do Produto no artigo!"})
        return Response({"status": "success", "id": None, "title": f"A designação do Produto foi alterada com Sucesso!", "subTitle": ''})
    except Error:
        return Response({"status": "error", "title": f"Erro ao Alterar a Designação do Produto no Artigo!"})


#region CHECKLISTS


def _checkArtigoCliente(artigo_id,cliente_cod, cursor):
        f = Filters({"cliente_cod":cliente_cod,"artigo_id":artigo_id})
        f.where(False,"and")
        f.add(f'pc.cod = :cliente_cod', True)
        f.add(f'pac.artigo_id = :artigo_id', True)
        f.value()
        response = db.executeSimpleList(lambda: (f"""        
            select count(*) cnt
            from producao_artigocliente pac
            join producao_cliente pc on pc.id=pac.cliente_id
            {f.text}        
        """), cursor, f.parameters)
        if len(response["rows"])>0:
            return response["rows"][0]["cnt"]
        return None
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
    response = db.executeSimpleList(lambda: (f"""select lst.status 
    from ofabrico_checklist lst
    join ofabrico_checklist_tasks tsk on lst.id=tsk.checklist_id
    {f.text}"""), cursor, f.parameters)
    return response["rows"][0].get("status")
def _checkTasks(id, cursor):
    f = Filters({"id":id})
    f.where()
    f.add(f'(checklist_id = :id)', True)
    f.value("and")
    response = db.executeSimpleList(lambda: (f"""select count(*) cnt from ofabrico_checklist_tasks {f.text}"""), cursor, f.parameters)
    return response["rows"][0].get("cnt")

def AvailableAggLookup(request,format):
    connection = connections["default"].cursor()
    
    if "idSelector" in request.data['filter']:
        f = Filters(request.data['filter'])
        f.setParameters({}, False)
        f.where()
        f.add(f'tagg.id = :idSelector', True)
        f.value()
        try:
            response = db.executeSimpleList(lambda: (f"""
                select tagg.id,tagg.cod,pc.status
                FROM producao_tempaggordemfabrico tagg
                LEFT JOIN producao_currentsettings pc on pc.agg_of_id=tagg.id
                {f.text}
            """), connection, f.parameters)
        except Error as error:
            print(str(error))
            return Response({"status": "error", "title": str(error)})
        return Response(response)

    
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where(False,"and")
    f.value("or")

    f2 = filterMulti(request.data['filter'], {}, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""*"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda: (f"""

        SELECT {f'{dql.columns}'} FROM (
            select tagg.id,tof.id ofid,tagg.cod,pc.status, tof.of_id,tof.order_cod,tof.prf_cod,tof.cliente_nome,tof.item_cod,prod.produto_cod 
            from producao_tempordemfabrico tof
            join producao_tempaggordemfabrico tagg on tof.agg_of_id = tagg.id
            join producao_artigo pa on pa.cod=tof.item_cod
            JOIN producao_produtos prod on pa.produto_id=prod.id
            JOIN producao_currentsettings pc on pc.agg_of_id =tagg.id
            WHERE pc.status not in (9)
            union
            select tagg.id,tof.id ofid,tagg.cod,0 status, tof.of_id,tof.order_cod,tof.prf_cod,tof.cliente_nome,tof.item_cod,prod.produto_cod
            from producao_tempordemfabrico tof
            join producao_tempaggordemfabrico tagg on tof.agg_of_id = tagg.id
            join producao_artigo pa on pa.cod=tof.item_cod
            JOIN producao_produtos prod on pa.produto_id=prod.id
            WHERE tagg.status = 0 and not exists (select 1 from producao_ordemfabricodetails po where po.cod=tof.of_id)
        ) t
        {dql.sort} {dql.limit}
    """)
    try:
        response = db.executeSimpleList(sql, connection, parameters)
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def CheckLists(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'] if "filter" in request.data else {})

    f.setParameters({
        "nome": {"value": lambda v: v.get('fnome').upper() if v.get('fnome') else None, "field": lambda k, v: f'chk.{k}'},
        "status": {"value": lambda v: v.get('fstatus'), "field": lambda k, v: f'chk.{k}'},
        "obs": {"value": lambda v: v.get('fobs').upper() if v.get('fobs') else None, "field": lambda k, v: f'lower(chk.{k})'},
        "cod": {"value": lambda v: v.get('fagg').upper() if v.get('fagg') else None, "field": lambda k, v: f'tagg.{k}'},
        **rangeP(f.filterData.get('fdata'), '`timestamp`', lambda k, v: f'DATE(`timestamp`)')
    }, True)
    f.where(False,"and")
    f.auto()
    f.value()

    f2 = filterMulti(request.data['filter'] if "filter" in request.data else {}, {}, False, "and" if f.hasFilters else "where" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""chk.*,tagg.cod agg_cod"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""
            select {c(f'{dql.columns}')} 
            from ofabrico_checklist chk
            join producao_tempaggordemfabrico tagg on chk.agg_of_id=tagg.id
            {f.text} {f2["text"]}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    try:
        response = db.executeList(sql, connection, parameters,[],None,None)
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def ChecklistLookup(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({"id": {"value": lambda v: v.get('checklist_id'), "field": lambda k, v: f'{k}'}}, True)
    f.where()
    f.auto()
    f.value()

    ftasks = Filters(request.data['filter'])
    ftasks.setParameters({"checklist_id": {"value": lambda v: v.get('checklist_id'), "field": lambda k, v: f'{k}'}}, True)
    ftasks.where()
    ftasks.auto()
    ftasks.value()

    f2 = filterMulti(request.data['filter'], {
        # 'fartigo': {"keys": ['artigo_cod', 'artigo_des'], "table": 't.'}
    }, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""*"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda: (f"""select {f'{dql.columns}'} from ofabrico_checklist {f.text} {f2["text"]} {dql.sort} {dql.limit}""")
    sqltasks = lambda: (f"""select {f'{dql.columns}'} from ofabrico_checklist_tasks {ftasks.text} {dql.sort}""")
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    try:
        response = db.executeSimpleList(sql, connection, parameters)
        responseTasks = db.executeSimpleList(sqltasks, connection, ftasks.parameters)
        response["tasks"] = responseTasks
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def newChecklist(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")   
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                dml = db.dml(TypeDml.INSERT, {
                    'nome':f"""(select n from (select CONCAT('CHK-',DATE_FORMAT(NOW(), "%%Y%%m%%d"),'-', LPAD(IFNULL(max(num),0)+1,4,'0')) n from ofabrico_checklist where DATE(`timestamp`)=DATE(NOW())) t)""",
                    '`timestamp`':f"NOW()",
                    "user_id":request.user.id,
                    "obs":data.get("obs"),
                    "status":data.get("status"),
                    "agg_of_id":data.get("agg").get("id"),
                    'num':f"(select n from (select IFNULL(max(num),0)+1 n from ofabrico_checklist where DATE(`timestamp`)=DATE(NOW())) t)"
                }, "ofabrico_checklist", None, None, False,["nome","`timestamp`","num"])
                db.execute(dml.statement, cursor, dml.parameters)
                lastid = cursor.lastrowid
        return Response({"status": "success", "id": lastid, "title": f"Checklist criada com sucesso!", "subTitle": ''})
    except Error as error:
        return Response({"status": "error", "title": str(error)})

def updateChecklist(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")   
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                dml = db.dml(TypeDml.UPDATE, {
                    "obs":data.get("obs"),
                    "status":data.get("status")
                }, "ofabrico_checklist", {"id":f"""=={data.get("id")}"""}, None, False,[])
                db.execute(dml.statement, cursor, dml.parameters)
                lastid = cursor.lastrowid
        return Response({"status": "success", "id": lastid, "title": f"Checklist alterada com sucesso!", "subTitle": ''})
    except Error as error:
        return Response({"status": "error", "title": str(error)})

def newTaskTrocaEtiquetas(request,format=None):
    cod="TRE"
    _type=1
    data = request.data.get("parameters").get("values").get("parameters")
    other_data = request.data.get("parameters").get("values")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                chk01 = _checkArtigoCliente(data.get("artigo").get("id"),data.get("cliente").get("BPCNUM_0"),cursor)
                if datetime.strptime(data.get("data_imputacao"), '%Y-%m-%d').date()>datetime.today().date():
                    return Response({"status": "error", "title": f"A data de imputação não pode ser maior que a data atual!"})                
                if chk01 == 0:
                    return Response({"status": "error", "title": f"O artigo e cliente não estão associados!"})
                dml = db.dml(TypeDml.INSERT, {
                    "parameters":json.dumps(data, ensure_ascii=False),
                    "checklist_id":other_data.get("checklist_id"),
                    "runtype":other_data.get("runtype"),
                    "appliesto":other_data.get("appliesto"),
                    "mode":other_data.get("mode"),
                    "`timestamp`":datetime.today(),
                    "status":other_data.get("status"),
                    "subtype":other_data.get("subtype") if other_data.get("subtype") is not None else "1",
                    "type":_type,
                    "user_id":request.user.id,
                    "nome":f"""(SELECT CONCAT('TRE-',YEAR(CURRENT_DATE()),LPAD(MONTH(CURRENT_DATE()),2,'0'),LPAD(DAY(CURRENT_DATE()),2,'0'),'-',LPAD(n,3,'0')) FROM (SELECT COUNT(*)+1 n FROM ofabrico_checklist_tasks oct where oct.type=1 and YEAR(`timestamp`)=YEAR(CURRENT_DATE())) t)"""
                }, "ofabrico_checklist_tasks", None, None, False,["nome"])
                print(dml.statement)
                print(dml.parameters)
                db.execute(dml.statement, cursor, dml.parameters)
        return Response({"status": "success", "id":None, "title": f"Tarefa criada com sucesso!", "subTitle": ''})
    except Error as error:
        return Response({"status": "error", "title": str(error)})

def updateTaskTrocaEtiquetas(request,format=None):
    data = request.data.get("parameters").get("values").get("parameters")
    other_data = request.data.get("parameters").get("values")
    filter = request.data.get("filter")
    if filter.get("id") is None:
        return Response({"status": "error", "title": f"O id da tarefa não é válido!"})
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                chk = _checkTaskItems(filter.get("id"),cursor)
                if chk > 0:
                    return Response({"status": "error", "title": f"A tarefa já tem items associados!"})
                chk = _checkListStatus(filter.get("id"),cursor)
                if chk == 9:
                    return Response({"status": "error", "title": f"A Lista de tarefas já se encontra finalizada!"})
                if datetime.strptime(data.get("data_imputacao"), '%Y-%m-%d').date()>datetime.today().date():
                    return Response({"status": "error", "title": f"A data de imputação não pode ser maior que a data atual!"})
                chk = _checkArtigoCliente(data.get("artigo").get("id"),data.get("cliente").get("BPCNUM_0"),cursor)                    
                if chk == 0:
                    return Response({"status": "error", "title": f"O artigo e cliente não estão associados!"})
                dml = db.dml(TypeDml.UPDATE, {
                    "parameters":json.dumps(data, ensure_ascii=False),
                    "runtype":other_data.get("runtype"),
                    "appliesto":other_data.get("appliesto"),
                    "mode":other_data.get("mode"),
                    "status":other_data.get("status"),
                    "subtype":other_data.get("subtype") if other_data.get("subtype") is not None else "1",
                    "user_id":request.user.id,
                }, "ofabrico_checklist_tasks", {"id":f"""=={filter.get("id")}"""}, None, False,[])
                db.execute(dml.statement, cursor, dml.parameters)
        return Response({"status": "success", "id":None, "title": f"Tarefa alterada com sucesso!", "subTitle": ''})
    except Error as error:
        return Response({"status": "error", "title": str(error)})

def TasksAvailableLookup(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where(False,"and")
    f.add(f"""(ct.`type` = :type1 and ct.parameters->'$.artigo.lar'= :lar and CAST(ct.parameters->'$.artigo.core' AS UNSIGNED) = :core)""", True)
    #f.add(f"""(ct.`type` = :type1 and ct.parameters->'$.artigo.cod'<> :artigo_cod and ct.parameters->'$.artigo.lar'= :lar and CAST(ct.parameters->'$.artigo.core' AS UNSIGNED) = :core)""", True)
    f.value("or")

    f2 = filterMulti(request.data['filter'], {
        # 'fartigo': {"keys": ['artigo_cod', 'artigo_des'], "table": 't.'}
    }, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""*"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda: (f"""
        SELECT {f'{dql.columns}'} 
        FROM ofabrico_checklist cl
        JOIN ofabrico_checklist_tasks ct on cl.id=ct.checklist_id
        where cl.`status`=1 and
        not exists(
            select 1 
            from ofabrico_checklist_items t_oci  
            join ofabrico_checklist_tasks t_ct on t_oci.checklist_task_id=t_ct.id
            where t_oci.bobine_id={request.data['filter'].get("bobine_id")} and t_ct.type=%(type1)s
        )
        {f.text} {f2["text"]} {dql.sort} {dql.limit}
    """)
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

def ChecklistItemsLookup(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({"checklist_id": {"value": lambda v: v.get('checklist_id'), "field": lambda k, v: f'oci.{k}'}}, True)
    f.where()
    f.auto()
    f.value()

    f2 = filterMulti(request.data['filter'], {
        # 'fartigo': {"keys": ['artigo_cod', 'artigo_des'], "table": 't.'}
    }, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""oci.*,oct.type,oct.subtype,oct.agg_of_id,oct.of_id,oct.parameters"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""select {c(f'{dql.columns}')} 
        from ofabrico_checklist_items oci
        join ofabrico_checklist_tasks oct on oct.id=oci.checklist_task_id        
        {f.text} {f2["text"]} {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}"""
    )
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    try:
        response = db.executeList(sql, connection, parameters,[],None,None)
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def DeleteTask(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")

    def delete(id,cursor):
        dml = db.dml(TypeDml.DELETE,None,"ofabrico_checklist_tasks",{"id":f'=={id}',"status":f'!==9'},None,False)
        db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                chk = _checkListStatus(filter.get("id"),cursor)
                if chk == 9:
                    return Response({"status": "error", "title": f"A Lista de tarefas já se encontra finalizada!"})
                exists = _checkTaskItems(filter.get("id"),cursor)
                if exists==0:
                    delete(filter.get("id"),cursor)
                else:
                    return Response({"status": "error", "title": f"Não é possível eliminar a tarefa!"})     
        return Response({"status": "success", "title": "Tarefa eliminada com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def DeleteChecklist(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")

    def delete(id,cursor):
        dml = db.dml(TypeDml.DELETE,None,"ofabrico_checklist",{"id":f'=={id}',"status":f'!==9'},None,False)
        db.execute(dml.statement, cursor, dml.parameters)
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                exists = _checkTasks(filter.get("id"),cursor)
                if exists==0:
                    delete(filter.get("id"),cursor)
                else:
                    return Response({"status": "error", "title": f"Não é possível eliminar a lista!"})     
        return Response({"status": "success", "title": "Lista eliminada com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

#endregion