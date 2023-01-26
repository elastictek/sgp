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
    if "parameters" in request.data and "method" in request.data["parameters"]:
        method=request.data["parameters"]["method"]
        func = globals()[method]
        response = func(request, format)
        return response
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

def computePaletizacao(cp,data,cursor):
    paletizacao = None
    if paletizacao is None:
        if "paletizacao_id" in data and data["paletizacao_id"] is not None:
            rows = db.executeSimpleList(lambda: (f"""
                select  pp.npaletes,ppd.* 
                from producao_paletizacao pp
                left join producao_paletizacaodetails ppd on pp.id=ppd.paletizacao_id and ppd.item_id=2
                where pp.id={data['paletizacao_id']}
            """), cursor, {})['rows']
            if len(rows)>0:
                paletizacao=rows
        else:
            computed = {}
            if ("ofabrico_id" not in data):
                return computed
            rows = db.executeSimpleList(lambda: (f"""
                select pp.npaletes, ppd.* 
                from producao_tempordemfabrico tof
                left join producao_paletizacao pp on pp.id=tof.paletizacao_id
                left join producao_paletizacaodetails ppd on pp.id=ppd.paletizacao_id and ppd.item_id=2
                where tof.id='{data['ofabrico_id']}'
            """), cursor, {})['rows']
            if len(rows)>0:
                paletizacao=rows
    sqm_paletes_total = 0
    nitems = 0
    items = []
    computed = {}
    if paletizacao is not None:
        for pitem in paletizacao:
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
                "sqm_contentor":sqm_paletes_total*paletizacao[0]["npaletes"],
                "n_paletes":(cp["qty_encomenda"]/sqm_paletes_total)*nitems
            }
            computed["items"] = items
    return computed

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
            print(dml.statement)
            print(dml.parameters)
            #db.execute(dml.statement, cursor, dml.parameters)
            #return cursor.lastrowid
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
                #db.execute(dml.statement, cursor, dml.parameters)
                return artigoId[0]["id"]
            else:
                if data.get("artigo_gtin"):
                    dta["gtin"] = data.get("artigo_gtin")
                else:
                    dta["gtin"] = computeGtin(cursor,main_gtin)
                dml = db.dml(TypeDml.INSERT, dta, "producao_artigo",None,None)
                #db.execute(dml.statement, cursor, dml.parameters)
                #return cursor.lastrowid
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

def addTempAggOrdemFabrico(data, ids, cursor):
    dta = {
        'status': 0,
        'start_prev_date':datetime.now().strftime("%Y-%m-%d %H:%M:%S") if data.get("start_prev_date") is None else data.get("start_prev_date")
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

def addTempOrdemFabrico(data,aggid,produto_id, cp, cpp, cursor):
    dta = {
        'aggregated':0,
        'agg_of_id': aggid,
        'agg_ofid_original': aggid,
        'of_id': data['ofabrico_cod'],
        'order_cod': data['iorder'],
        'prf_cod':data['prf'],
        'item_cod': data['item'],
        'item_id': data['item_id'],
        'produto_id': data['produto_id'] if produto_id is None else produto_id
    }        
    onDuplicate = ""
    # if "formulacao_id" in data:
    #     dta["formulacao_id"] = data["formulacao_id"]
    #     onDuplicate+=",formulacao_id=VALUES(formulacao_id)"
    # if "gamaoperatoria_id" in data:
    #     dta["gamaoperatoria_id"] = data["gamaoperatoria_id"]
    #     onDuplicate+=",gamaoperatoria_id=VALUES(gamaoperatoria_id)"
    # if "artigospecs_id" in data:
    #     dta["artigospecs_id"] = data["artigospecs_id"]
    #     onDuplicate+=",artigospecs_id=VALUES(artigospecs_id)"
    if "cliente_cod" in data and data["cliente_cod"] is not None:
        dta["cliente_cod"]=data["cliente_cod"]
        dta["cliente_nome"]=data["cliente_nome"]
        onDuplicate+=",cliente_cod=VALUES(cliente_cod)"
        onDuplicate+=",cliente_nome=VALUES(cliente_nome)"                
            
    if "paletizacao_id" in data:
        dta["paletizacao_id"] = data["paletizacao_id"]
        onDuplicate+=",paletizacao_id=VALUES(paletizacao_id)"
    # if "nonwovens_id" in data:
    #     dta["nonwovens_id"] = data["nonwovens_id"]
    #     onDuplicate+=",nonwovens_id=VALUES(nonwovens_id)"
    artigo = data["artigo"] if "artigo" in data else data
    if artigo is not None:
        dta['qty_encomenda'] = cp['qty_encomenda'],
        dta['linear_meters'] = cp["linear_meters"],
        dta['n_voltas'] = cp["n_voltas"],
        dta['sqm_bobine'] = cp["sqm_bobine"]
        dta['n_paletes'] = json.dumps(cpp)
        onDuplicate+=",qty_encomenda=VALUES(qty_encomenda)"
        onDuplicate+=",linear_meters=VALUES(linear_meters)"
        onDuplicate+=",sqm_bobine=VALUES(sqm_bobine)"
        onDuplicate+=",qty_encomenda=VALUES(qty_encomenda)"
        onDuplicate+=",n_voltas=VALUES(n_voltas)"
        onDuplicate+=",n_paletes=VALUES(n_paletes)"

    dml = db.dml(TypeDml.INSERT, dta, "producao_tempordemfabrico",None,None,False)
    dml.statement = f"""
        {dml.statement}
        ON DUPLICATE KEY UPDATE 
            id = LAST_INSERT_ID(id),
            of_id=VALUES(of_id),
            agg_of_id=VALUES(agg_of_id),
            order_cod=VALUES(order_cod),
            prf_cod=VALUES(prf_cod),
            produto_id=VALUES(produto_id),
            item_cod=VALUES(item_cod),
            item_id=VALUES(item_id)
            {onDuplicate}
    """
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

def addEcomenda(data,cursor):
    return





def Validar(request, format=None):
    connection = connections["default"].cursor()
    data = request.data['parameters']
    values = data['values']
    f = Filters(request.data['filter'])
    print("VALIDADARRRRRRRRR")
    print(data)
    # def checkBobines(ids, cursor):
    #     response = db.executeSimpleList(lambda: (f"""        
    #         select count(*) cnt
    #         from producao_bobine pb
    #         left join producao_palete pp on pp.id=pb.palete_id 
    #         where pb.id in ({ids}) and (pp.carga_id is NOT NULL or pb.comp_actual =0 and pb.recycle > 0)        
    #     """), cursor, {})
    #     if len(response["rows"])>0:
    #         return response["rows"][0]["cnt"]
    #     return None

    # def checkExpedicaoSage(ids,cursor):
    #     connection = connections[connGatewayName].cursor()
    #     response = dbgw.executeSimpleList(lambda: (f"""
    #             select count(*) cnt
    #             from mv_bobines pb
    #             left join mv_paletes pp on pp.id=pb.palete_id
    #             LEFT JOIN mv_pacabado_status mv on mv."LOT_0" = pp.nome
    #             where pb.id in ({ids}) and mv."SDHNUM_0" is not null
    #     """), connection, {})
    #     if len(response["rows"])>0:
    #         return response["rows"][0]["cnt"]
    #     return None

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                aggStatus = checkAgg(data.get("ofabrico_id"),data.get("ofabrico_cod"),cursor) #ofabrico_cod or ofabrico_id
                if (aggStatus["status"]=="error"):
                    return Response(aggStatus)
                #cp = computeLinearMeters(data)
                #cpp = computePaletizacao(cp,data,cursor)
                produto_id = data.get("produto_id") if data.get("produto_id") is not None else addProduto(values.get("produto_cod"),cursor)
                artigo_id = data.get("artigo_id") if data.get("artigo_id") is not None else addArtigo({**values, "artigo_cod":data.get("artigo_cod")}, data.get('main_gtin'), produto_id,cursor)
                cliente_id = addCliente({"cliente_cod":data.get("cliente_cod"),"cliente_nome":data.get("cliente_nome"),**values},cursor)
                if (artigo_id is None):
                    raise Exception("O artigo não existe!")
                if (cliente_id is None):
                    raise Exception("O cliente não existe!")
                addArtigoCliente(artigo_id,cliente_id,request.user.id,cursor)
                ids = getAgg(data.get("ofabrico_id"),data.get("artigo_cod"),cursor)

                print("############VALIDAR###############")
                print(ids)
                print({**values, "artigo_cod":data.get("artigo_cod")})

                #
                #aggid = addTempAggOrdemFabrico(data,ids,cursor)
                #id = addTempOrdemFabrico(data,aggid,produto_id,cp, cpp, cursor)
                #sgpForProduction(data,aggid,request.user,cursor)
                
                # ids = ','.join(str(x["id"]) for x in data["rows"])                
                # chk01 = checkBobines(ids,cursor)
                # if chk01 > 0:
                #     return Response({"status": "error", "title": f"Não é possível alterar uma ou mais bobines. Verifique (Comprimento actual, se entrou em reciclado, ou se está numa carga... )"})
                # chk02 = checkExpedicaoSage(ids,cursor)
                # if chk02 > 0:
                #     return Response({"status": "error", "title": f"Não é possível alterar uma ou mais bobines. Verifique se já existe expedição."})

                # columns = defeitosCols["columns"]
                # columns_defeitos = defeitosCols["columns_defeitos"]
                # for v in data['rows']:
                #     b={}
                #     for x in columns_defeitos:
                #         if "defeitos" in v:
                #             if len(v["defeitos"])==0:
                #                 b[x]=0
                #             else:
                #                 for y in v["defeitos"]:
                #                     if ("key" in y and y["key"]==x) or ("value" in y and y["value"]==x):
                #                         b[x] = 1
                #                     elif x not in b:
                #                         b[x]=0
                #         else:
                #             b[x]=0
                #     bobine_values = {**{key: v[key] for key in v if key in columns}, **b} 
                #     bobine_values['ff_m_ini'] = bobine_values['ff_pos'][0]['min'] if bobine_values['ff_pos'] is not None and len(bobine_values['ff_pos'])>0 else None
                #     bobine_values['ff_m_fim'] = bobine_values['ff_pos'][0]['max'] if bobine_values['ff_pos'] is not None and len(bobine_values['ff_pos'])>0 else None
                #     bobine_values['fc_diam_ini'] = bobine_values['fc_pos'][0]['min'] if bobine_values['fc_pos'] is not None and len(bobine_values['fc_pos'])>0 else None
                #     bobine_values['fc_diam_fim'] = bobine_values['fc_pos'][0]['max'] if bobine_values['fc_pos'] is not None and len(bobine_values['fc_pos'])>0 else None
                #     bobine_values['fc_pos'] = json.dumps(bobine_values['fc_pos'], ensure_ascii=False) if bobine_values['fc_pos'] is not None else None
                #     bobine_values['ff_pos'] = json.dumps(bobine_values['ff_pos'], ensure_ascii=False) if bobine_values['ff_pos'] is not None else None
                #     bobine_values['furos_pos'] = json.dumps(bobine_values['furos_pos'], ensure_ascii=False) if bobine_values['furos_pos'] is not None else None
                #     bobine_values['buracos_pos'] = json.dumps(bobine_values['buracos_pos'], ensure_ascii=False) if bobine_values['buracos_pos'] is not None else None
                #     bobine_values['rugas_pos'] = json.dumps(bobine_values['rugas_pos'], ensure_ascii=False) if bobine_values['rugas_pos'] is not None else None
                #     bobine_values["ff"] = 1 if bobine_values['ff_pos'] is not None and len(bobine_values['ff_pos'])>0 else 0
                #     bobine_values["fc"] = 1 if bobine_values['fc_pos'] is not None and len(bobine_values['fc_pos'])>0 else 0
                #     bobine_values["furos"] = 1 if bobine_values['furos_pos'] is not None and len(bobine_values['furos_pos'])>0 else 0
                #     bobine_values["buraco"] = 1 if bobine_values['buracos_pos'] is not None and len(bobine_values['buracos_pos'])>0 else 0
                #     bobine_values["rugas"] = 1 if bobine_values['rugas_pos'] is not None and len(bobine_values['rugas_pos'])>0 else 0
                #     dml = db.dml(TypeDml.UPDATE, bobine_values, "producao_bobine", {'id': f'=={v["id"]}'}, None, False)
                #     db.execute(dml.statement, cursor, dml.parameters)
        return Response({"status": "success", "success":f"""Registos atualizados com sucesso!"""})
    except Exception as error:
        print(error)
        return Response({"status": "error", "title": str(error)})