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
from producao.api.exports import export,sqlCols
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

def updateMaterializedView(mv):
    conngw = connections[connGatewayName]
    cgw = conngw.cursor()
    cgw.execute(f"REFRESH MATERIALIZED VIEW public.{mv};")
    conngw.commit()

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








def inProduction(data,cursor):
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
        if len(response["rows"])>0:
            return response["rows"][0]
        return None


@api_view(['POST'])
@renderer_classes([JSONRenderer])
#@authentication_classes([SessionAuthentication])
#@permission_classes([IsAuthenticated])
def PaletesSql(request, format=None):
    if "parameters" in request.data and "method" in request.data["parameters"]:
        method=request.data["parameters"]["method"]
        func = globals()[method]
        response = func(request, format)
        return response
    return Response({})

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
    

def PaletesListV2(request, format=None):
    connection = connections["default"].cursor()
    r = PostData(request)
    def fn(self,group,name,param,parsed,mask,gmask):
        if name=="defeitos":
            l = "and" if "&" in param.get("logic") else "or"
            o = "<>" if param.get("logic").startswith("!") else "="
            return [f' {l} '.join(f'{f}{o}1' for f in param.get("value"))]
        if name=="estado" and param.get("logic") not in ["|","!|","",None]:
            for i in range(len(parsed)):
                if i % 2 == 0:
                    parsed[i] = f"""EXISTS (SELECT 1 FROM producao_bobine tpb where tpb.palete_id = sgppl.id and {parsed[i]})"""
            self.setGroup("t3",f"""({"".join(parsed)})""")
            return True
    pf = ParsedFilters(r.filter,{"t1":"and","t2":""},r.apiversion,None,None,fn)
    pf.setGroup("t2","" if not pf.hasFilters("t2") else f"""and EXISTS (SELECT 1 FROM producao_bobine tpb join producao_artigo pa on pa.id=tpb.artigo_id where tpb.palete_id = sgppl.id and {pf.group("t2")})""")
    pf.setGroup("t3","" if not pf.hasFilters("t3") else f"""and {pf.group("t3")}""")
   
    parameters = {**pf.parameters}
    dql = db.dql(request.data, False,False)
    cols = f"""sgppl.id, sgppl.`timestamp`, sgppl.data_pal, sgppl.nome, sgppl.num, sgppl.estado, sgppl.area,
            sgppl.comp_total,sgppl.num_bobines,sgppl.diametro,sgppl.peso_bruto,sgppl.peso_palete, sgppl.peso_liquido,
            sgppl.cliente_id, sgppl.retrabalhada,sgppl.stock, sgppl.carga_id, sgppl.num_palete_carga, sgppl.destino,
            sgppl.ordem_id, sgppl.ordem_original, sgppl.ordem_original_stock, sgppl.num_palete_ordem,
            sgppl.draft_ordem_id,sgppl.ordem_id_original, sgppl.area_real, sgppl.comp_real,
            sgppl.diam_avg, sgppl.diam_max, sgppl.diam_min,sgppl.nbobines_real, sgppl.disabled,
            sgppl.artigo, sgppl.destinos, sgppl.nbobines_emendas,sgppl.destinos_has_obs,sgppl.nbobines_sem_destino,
            (select count(*) from producao_bobine mb where mb.palete_id=sgppl.id and date(mb.timestamp) < DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH)) n_bobines_expired,
            sgppl.nok_estados, sgppl.nok, sgppl.lvl, pcarga.id carga_id, pcarga.carga,pcarga.eef carga_eef,pcarga.prf carga_prf,pcarga.cliente carga_cliente, po1.ofid AS ofid_original, po2.ofid, po1.op AS op_original,
            po2.op, pc.cod AS cliente_cod, pc.name AS cliente_nome, pc.limsup AS cliente_limsup, pc.liminf AS cliente_liminf,
            pc.diam_ref AS cliente_diamref,pt.prf_cod prf,pt.order_cod iorder"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""  
            SELECT {c(f'{dql.columns}')}
            FROM producao_palete sgppl
            [#MARK-REPORT-01#]
            LEFT JOIN producao_carga pcarga ON pcarga.id = sgppl.carga_id
            LEFT JOIN producao_cliente pc ON pc.id = sgppl.cliente_id
            LEFT JOIN planeamento_ordemproducao po1 ON po1.id = sgppl.ordem_id_original
            LEFT JOIN planeamento_ordemproducao po2 ON po2.id = sgppl.ordem_id
            LEFT JOIN producao_tempordemfabrico pt ON pt.id = po2.draft_ordem_id
            WHERE sgppl.nbobines_real>0 and sgppl.disabled=0
            {pf.group()} {pf.group('t2')} {pf.group('t3')}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in r.data):
        dql.limit=f"""limit {r.data.get("limit")}"""
        dql.paging=""
        if request.data["parameters"].get("export") == "PaletesDetailed_01":
            cols = {
                "sgppl.nome": {"title": "Palete Nome"}, 
                "pb.nome":{"title": "Bobine"},
                "pa.cod": {"title": "Artigo Cod."},
                "pa.des": {"title": "Artigo"},
                "pb.posicao_palete":{"title": "Posição"},
                "pb.lar":{"title": "Bobine Largura"},
                "pb.comp_actual":{"title": "Bobine Comp."},
                "pb.estado":{"title": "Bobine Estado"},
                "pb.destino":{"title": "Bobine Destino"},
                "sgppl.timestamp": {"title": "Palete Data"}, 
                "sgppl.nbobines_real": {"title": "Bobines"}, 
                "sgppl.nbobines_emendas": {"title": "Emendas"}, 
                "sgppl.nbobines_sem_destino": {"title": "Sem Destino"},
                "sgppl.area_real":{"title": "Palete Área"},
                "sgppl.comp_real":{"title": "Palete Comp."},
                "sgppl.peso_bruto":{"title": "Palete Peso B."},
                "sgppl.peso_liquido":{"title": "Palete Peso L."},
                "sgppl.diam_min":{"title": "Palete Diam. Min."},
                "sgppl.diam_max":{"title": "Palete Diam. Max."},
                "sgppl.diam_avg":{"title": "Palete Diam. Médio"},
                "pc.nome":{"title": "Palete Cliente","field":"cliente_nome"},
                "po2.ofid":{"title": "Ordem Fabrico"},
                "pt.prf_cod":{"title": "PRF"},
                "pt.order_cod":{"title": "Encomenda"},
            }
            _sql=sql(lambda v:v,lambda v:sqlCols(cols),lambda v:f"{v},pb.posicao_palete" if v is not None else "order by pb.posicao_palete")
            _sql = _sql.replace("[#MARK-REPORT-01#]",f"""
                JOIN producao_bobine pb on pb.palete_id=sgppl.id and pb.recycle=0 and pb.comp_actual>0
                left JOIN producao_artigo pa on pa.id=pb.artigo_id
            """)
            r.data["cols"]=cols
        else:
            _sql=sql
        return export(_sql, db_parameters=parameters, parameters=r.data,conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    try:
        response = db.executeList(sql, connection, parameters,[],None,None,r.norun)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)


def PaletesListV2x(request, format=None):
    connection = connections["default"].cursor()
    r = PostData(request)
    pf = ParsedFilters(r.filter,"and",r.apiversion)
    f = Filters(r.filter)
    f.setParameters({
        **rangeP(f.filterData.get('fdata'), 'sgppl.timestamp', lambda k, v: f'DATE(sgppl.timestamp)'),
    #    **rangeP(f.filterData.get('fdatain'), 'in_t', lambda k, v: f'DATE(in_t)'),
    #    **rangeP(f.filterData.get('fdataout'), 'out_t', lambda k, v: f'DATE(out_t)'),
    #    "diff": {"value": lambda v: '>0' if "fdataout" in v and v.get("fdataout") is not None else None, "field": lambda k, v: f'TIMESTAMPDIFF(second,in_t,out_t)'},
        "nome": {"value": lambda v: v.get('flote').lower() if v.get('flote') is not None else None, "field": lambda k, v: f'lower(sgppl.{k})'},
        "carga": {"value": lambda v: v.get('fcarganome').lower() if v.get('fcarganome') is not None else None, "field": lambda k, v: f'lower(pcarga.{k})'},
        "nbobines_real": {"value": lambda v: Filters.getNumeric(v.get('fnbobinesreal')), "field": lambda k, v: f'sgppl.{k}'},
        "nbobines_emendas": {"value": lambda v: Filters.getNumeric(v.get('fnbobines_emendas')), "field": lambda k, v: f'sgppl.{k}'},
        "nbobines_sem_destino": {"value": lambda v: Filters.getNumeric(v.get('fnbobines_sem_destino')), "field": lambda k, v: f'sgppl.{k}'},
        "lar": {"value": lambda v: Filters.getNumeric(v.get('flargura')), "field": lambda k, v: f"j->>'$.{k}'"},
        "area_real": {"value": lambda v: Filters.getNumeric(v.get('farea')), "field": lambda k, v: f'sgppl.{k}'},
        "comp_real": {"value": lambda v: Filters.getNumeric(v.get('fcomp')), "field": lambda k, v: f'sgppl.{k}'},
        "mes": {"value": lambda v: Filters.getNumeric(v.get('fmes')), "field": lambda k, v: f'mv.{k}'},
        "disabled": {"value": lambda v: Filters.getNumeric(v.get('fdisabled')), "field": lambda k, v: f'sgppl.{k}'},
        "ano": {"value": lambda v: Filters.getNumeric(v.get('fano')), "field": lambda k, v: f'mv.{k}'},
        "diam_avg": {"value": lambda v: Filters.getNumeric(v.get('fdiam_avg')), "field": lambda k, v: f'sgppl.{k}'},
        "diam_max": {"value": lambda v: Filters.getNumeric(v.get('fdiam_max')), "field": lambda k, v: f'sgppl.{k}'},
        "diam_min": {"value": lambda v: Filters.getNumeric(v.get('fdiam_min')), "field": lambda k, v: f'sgppl.{k}'},
        "destino": {"value": lambda v: v.get('fdestinoold').lower() if v.get('fdestinoold') is not None else None, "field": lambda k, v: f'lower(sgppl.{k})'},
        "peso_bruto": {"value": lambda v: Filters.getNumeric(v.get('fpeso_bruto')), "field": lambda k, v: f'sgppl.{k}'},
        "peso_liquido": {"value": lambda v: Filters.getNumeric(v.get('fpeso_liquido')), "field": lambda k, v: f'sgppl.{k}'},
        "carga_id": {"value": lambda v: v.get('fcarga'), "field": lambda k, v: f'sgppl.{k}'},
        "nok":{"value": lambda v: Filters.getNumeric(v.get('fnok')), "field": lambda k, v: f'{k}'},
        "nok_estados":{"value": lambda v: Filters.getNumeric(v.get('fnok_estados')), "field": lambda k, v: f'{k}'},
        "cliente_nome": {"value": lambda v: v.get('fcliente').lower() if v.get('fcliente') is not None else None, "field": lambda k, v: f'lower(sgppl."{k}")'},
        "ofid": {"value": lambda v: v.get('fof').upper() if v.get('fof') is not None else None, "field": lambda k, v: f'sgppl."{k}"'},
        "prf_cod": {"value": lambda v: v.get('fprf').lower() if v.get('fprf') is not None else None, "field": lambda k, v: f'lower(pt.{k})'},
        "order_cod": {"value": lambda v: v.get('forder').lower() if v.get('forder') is not None else None, "field": lambda k, v: f'lower(pt.{k})'}
    }, True)
    f.where(False,"and")
    f.auto()
    f.value()
    fartigo = filterMulti(r.filter, {
        'fartigo': {"keys": ["'$.cod'", "'$.des'"], "table": 'j->>'},
    }, False, "and" if f.hasFilters else "and" ,False)

    def filterMultiSelectJson(data,name,field,alias):
        f = Filters(data)
        fP = {}
        if name in data:
            dt = [o['value'] for o in data[name]]       
            value = 'in:' + ','.join(f"{w}" for w in dt)
            fP['estado'] = {"key": field, "value": value, "field": lambda k, v: f"{alias}->>'$.{k}'"}
        f.setParameters({**fP}, True)
        f.auto()
        f.where(False, "and")
        f.value()
        return f
    festados = filterMultiSelectJson(r.filter,'festados','estado','j')

    fbobinemulti = filterMulti(r.filter, {
        'flotenw': {"keys": ['lotenwinf', 'lotenwsup'], "table": 'mb.'},
        'ftiponw': {"keys": ['tiponwinf', 'tiponwsup'], "table": 'mb.'},
        'fbobine': {"keys": ['nome'], "table": 'mb.'},
    }, False, "and" if f.hasFilters else "and" ,False)
    # fbobine = Filters(request.data['filter'])
    # fbobine.setParameters({"bobinenome": {"value": lambda v: v.get('fbobine'), "field": lambda k, v: f'nome'}}, True)
    # fbobine.where()
    # fbobine.auto()
    # fbobine.value()
    fbobinemulti["text"] = f"""and exists (select 1 from producao_bobine mb where mb.palete_id=sgppl.id and mb.recycle=0 and mb.comp_actual>0 {fbobinemulti["text"].lstrip("where (").rstrip(")")}))""" if fbobinemulti["hasFilters"] else ""


    fbobinedestinos = Filters(r.filter)
    fbobinedestinos.setParameters({
        "destino_cli": {"value": lambda v: v.get('fdestino').lower() if v.get('fdestino') is not None else None, "field": lambda k, v: f"lower(d->'$.cliente'->>'$.BPCNAM_0')"},
        "destino_lar": {"value": lambda v: Filters.getNumeric(v.get('fdestino_lar')), "field": lambda k, v: f"d->>'$.largura'"},
        "destino_reg": {"value": lambda v: Filters.getNumeric(v.get('fdestino_reg')), "field": lambda k, v: f"mb.destinos->>'$.regranular'"},
        "destino_estado": {"value": lambda v: Filters.getNumeric(v.get('fdestino_estado')), "field": lambda k, v: f"mb.destinos->'$.estado'->>'$.value'"}
    }, True)
    fbobinedestinos.where(False,"and")
    fbobinedestinos.auto()
    fbobinedestinos.value()
    fbobinedestinos.text = f"""and exists 
    exists (select 1 from producao_bobine mb,
    json_table(mb.destinos->'$.destinos',"$[*]"columns(obs text path "$.obs",cliente JSON path "$.cliente",largura int path "$.largura")) d 
    WHERE mb.palete_id=sgppl.id and mb.recycle=0 and mb.comp_actual>0 and mb.destinos is not null {fbobinedestinos.text}
    limit 1)""" if fbobinedestinos.hasFilters else ""

    fartigompmulti = filterMulti(r.filter, {
        'fartigo_mp': {"keys": ['matprima_cod', 'matprima_des'], "table": 'mcg.'},
        'flote_mp': {"keys": ['n_lote'], "table": 'mcg.'},
    }, False, "and" if f.hasFilters else "and" ,False)

    fartigompmulti["text"] = f""" and exists (select 1 from producao_bobine mb join consumos_granulado mcg on mcg.ig_id = mb.ig_id where mb.palete_id=sgppl.id and mb.recycle=0 and mb.comp_actual>0 {fartigompmulti["text"].lstrip("where (").rstrip(")")}) limit 1) """ if fartigompmulti["hasFilters"] else ""

    parameters = {**f.parameters, **fartigo['parameters'], **festados.parameters, **fbobinemulti["parameters"], **fartigompmulti["parameters"],**fbobinedestinos.parameters,**pf.parameters}
    dql = db.dql(request.data, False,False)
    cols = f"""sgppl.id, sgppl.`timestamp`, sgppl.data_pal, sgppl.nome, sgppl.num, sgppl.estado, sgppl.area,
            sgppl.comp_total,sgppl.num_bobines,sgppl.diametro,sgppl.peso_bruto,sgppl.peso_palete, sgppl.peso_liquido,
            sgppl.cliente_id, sgppl.retrabalhada,sgppl.stock, sgppl.carga_id, sgppl.num_palete_carga, sgppl.destino,
            sgppl.ordem_id, sgppl.ordem_original, sgppl.ordem_original_stock, sgppl.num_palete_ordem,
            sgppl.draft_ordem_id,sgppl.ordem_id_original, sgppl.area_real, sgppl.comp_real,
            sgppl.diam_avg, sgppl.diam_max, sgppl.diam_min,sgppl.nbobines_real, sgppl.disabled,
            sgppl.artigo, sgppl.destinos, sgppl.nbobines_emendas,sgppl.destinos_has_obs,sgppl.nbobines_sem_destino,
            sgppl.nok_estados, sgppl.nok, sgppl.lvl, pcarga.id carga_id, pcarga.carga,pcarga.eef carga_eef,pcarga.prf carga_prf,pcarga.cliente carga_cliente, po1.ofid AS ofid_original, po2.ofid, po1.op AS op_original,
            po2.op, pc.cod AS cliente_cod, pc.name AS cliente_nome, pc.limsup AS cliente_limsup, pc.liminf AS cliente_liminf,
            pc.diam_ref AS cliente_diamref,pt.prf_cod prf,pt.order_cod iorder"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""  
            SELECT {c(f'{dql.columns}')}
            FROM producao_palete sgppl
            [#MARK-REPORT-01#]
            LEFT JOIN producao_carga pcarga ON pcarga.id = sgppl.carga_id
            LEFT JOIN producao_cliente pc ON pc.id = sgppl.cliente_id
            LEFT JOIN planeamento_ordemproducao po1 ON po1.id = sgppl.ordem_id_original
            LEFT JOIN planeamento_ordemproducao po2 ON po2.id = sgppl.ordem_id
            LEFT JOIN producao_tempordemfabrico pt ON pt.id = po2.draft_ordem_id
            WHERE sgppl.nbobines_real>0 and sgppl.disabled=0
            {pf.group()}
            {f.text} {fartigo["text"]} {festados.text} {fbobinemulti["text"]} {fartigompmulti["text"]} {fbobinedestinos.text}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in r.data):
        dql.limit=f"""limit {r.data.get("limit")}"""
        dql.paging=""
        return export(sql, db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    try:
        response = db.executeList(sql, connection, parameters,[],None,None,r.norun)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)


def PaletesList(request, format=None):
    connection = connections[connGatewayName].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({
        **rangeP(f.filterData.get('fdata'), 'timestamp', lambda k, v: f'DATE(timestamp)'),
    #    **rangeP(f.filterData.get('fdatain'), 'in_t', lambda k, v: f'DATE(in_t)'),
    #    **rangeP(f.filterData.get('fdataout'), 'out_t', lambda k, v: f'DATE(out_t)'),
    #    "diff": {"value": lambda v: '>0' if "fdataout" in v and v.get("fdataout") is not None else None, "field": lambda k, v: f'TIMESTAMPDIFF(second,in_t,out_t)'},
        "nome": {"value": lambda v: v.get('flote').lower() if v.get('flote') is not None else None, "field": lambda k, v: f'lower(sgppl.{k})'},
        "carga": {"value": lambda v: v.get('fcarganome').lower() if v.get('fcarganome') is not None else None, "field": lambda k, v: f'lower(sgppl.{k})'},
        "nbobines_real": {"value": lambda v: Filters.getNumeric(v.get('fnbobinesreal')), "field": lambda k, v: f'sgppl.{k}'},
        "nbobines_emendas": {"value": lambda v: Filters.getNumeric(v.get('fnbobines_emendas')), "field": lambda k, v: f'sgppl.{k}'},
        "nbobines_sem_destino": {"value": lambda v: Filters.getNumeric(v.get('fnbobines_sem_destino')), "field": lambda k, v: f'sgppl.{k}'},
        "lar": {"value": lambda v: Filters.getNumeric(v.get('flargura')), "field": lambda k, v: f"j->>'{k}'"},
        "area_real": {"value": lambda v: Filters.getNumeric(v.get('farea')), "field": lambda k, v: f'sgppl.{k}'},
        "comp_real": {"value": lambda v: Filters.getNumeric(v.get('fcomp')), "field": lambda k, v: f'sgppl.{k}'},
        "mes": {"value": lambda v: Filters.getNumeric(v.get('fmes')), "field": lambda k, v: f'mv.{k}'},
        "disabled": {"value": lambda v: Filters.getNumeric(v.get('fdisabled')), "field": lambda k, v: f'sgppl.{k}'},
        "ano": {"value": lambda v: Filters.getNumeric(v.get('fano')), "field": lambda k, v: f'mv.{k}'},
        "diam_avg": {"value": lambda v: Filters.getNumeric(v.get('fdiam_avg')), "field": lambda k, v: f'sgppl.{k}'},
        "diam_max": {"value": lambda v: Filters.getNumeric(v.get('fdiam_max')), "field": lambda k, v: f'sgppl.{k}'},
        "diam_min": {"value": lambda v: Filters.getNumeric(v.get('fdiam_min')), "field": lambda k, v: f'sgppl.{k}'},
        "destino": {"value": lambda v: v.get('fdestinoold').lower() if v.get('fdestinoold') is not None else None, "field": lambda k, v: f'lower(sgppl.{k})'},
        "peso_bruto": {"value": lambda v: Filters.getNumeric(v.get('fpeso_bruto')), "field": lambda k, v: f'sgppl.{k}'},
        "peso_liquido": {"value": lambda v: Filters.getNumeric(v.get('fpeso_liquido')), "field": lambda k, v: f'sgppl.{k}'},
        "carga_id": {"value": lambda v: v.get('fcarga'), "field": lambda k, v: f'sgppl.{k}'},
        "nok":{"value": lambda v: Filters.getNumeric(v.get('fnok')), "field": lambda k, v: f'{k}'},
        "nok_estados":{"value": lambda v: Filters.getNumeric(v.get('fnok_estados')), "field": lambda k, v: f'{k}'},
        "cliente_nome": {"value": lambda v: v.get('fcliente').lower() if v.get('fcliente') is not None else None, "field": lambda k, v: f'lower(sgppl."{k}")'},
        "ofid": {"value": lambda v: v.get('fof').upper() if v.get('fof') is not None else None, "field": lambda k, v: f'sgppl."{k}"'},
        "ISSDHNUM_0": {"value": lambda v: v.get('fdispatched'), "field": lambda k, v: f' mv."SDHNUM_0"'},
        "SDHNUM_0": {"value": lambda v: v.get('fsdh').lower() if v.get('fsdh') is not None else None, "field": lambda k, v: f'lower(mv."SDHNUM_0")'},
        "BPCNAM_0": {"value": lambda v: v.get('fclienteexp').lower() if v.get('fclienteexp') is not None else None, "field": lambda k, v: f'lower(mv."{k}")'},
        "EECICT_0": {"value": lambda v: v.get('feec').lower() if v.get('feec') is not None else None, "field": lambda k, v: f'lower(mv."{k}")'},
       
        "matricula": {"value": lambda v: v.get('fmatricula').lower() if v.get('fmatricula') is not None else None, "field": lambda k, v: f'lower(mol.{k})'},
        "matricula_reboque": {"value": lambda v: v.get('fmatricula_reboque').lower() if v.get('fmatricula_reboque') is not None else None, "field": lambda k, v: f'lower(mol.{k})'},
        "prf": {"value": lambda v: v.get('fprf').lower() if v.get('fprf') is not None else None, "field": lambda k, v: f'lower(mol.{k})'},
        "iorder": {"value": lambda v: v.get('forder').lower() if v.get('forder') is not None else None, "field": lambda k, v: f'lower(mol.{k})'},


       #mv."BPCNAM_0",mv."ITMREF_0",mv."ITMDES1_0",mv."EECICT_0"

    #    "fof": {"value": lambda v: v.get('fof')},
    #    "vcr_num": {"value": lambda v: v.get('fvcr')},
    #    "qty_lote": {"value": lambda v: v.get('fqty'), "field": lambda k, v: f'{k}'},
    #    "qty_reminder": {"value": lambda v: v.get('fqty_reminder'), "field": lambda k, v: f'{k}'},
    #    "type_mov": {"value": lambda v: v.get('ftype_mov'), "field": lambda k, v: f'{k}'}
    }, True)
    f.where(False,"and")
    f.auto()
    f.value()

    fartigo = filterMulti(request.data['filter'], {
        'fartigo': {"keys": ["'cod'", "'des'"], "table": 'j->>'},
        'fartigoexp': {"keys": ['"ITMREF_0"', '"ITMDES1_0"'], "table": 'mv.'},
    }, False, "and" if f.hasFilters else "and" ,False)

    def filterMultiSelectJson(data,name,field,alias):
        f = Filters(data)
        fP = {}
        if name in data:
            dt = [o['value'] for o in data[name]]       
            value = 'in:' + ','.join(f"{w}" for w in dt)
            fP['estado'] = {"key": field, "value": value, "field": lambda k, v: f"{alias}->>'{k}'"}
        f.setParameters({**fP}, True)
        f.auto()
        f.where(False, "and")
        f.value()
        return f
    festados = filterMultiSelectJson(request.data['filter'],'festados','estado','j')

    fbobinemulti = filterMulti(request.data['filter'], {
        'flotenw': {"keys": ['lotenwinf', 'lotenwsup'], "table": 'mb.'},
        'ftiponw': {"keys": ['tiponwinf', 'tiponwsup'], "table": 'mb.'},
        'fbobine': {"keys": ['nome'], "table": 'mb.'},
    }, False, "and" if f.hasFilters else "and" ,False)
    # fbobine = Filters(request.data['filter'])
    # fbobine.setParameters({"bobinenome": {"value": lambda v: v.get('fbobine'), "field": lambda k, v: f'nome'}}, True)
    # fbobine.where()
    # fbobine.auto()
    # fbobine.value()
    fbobinemulti["text"] = f"""and exists (select 1 from mv_bobines mb where mb.palete_id=sgppl.id and mb.recycle=0 and mb.comp_actual>0 {fbobinemulti["text"].lstrip("where (").rstrip(")")}))""" if fbobinemulti["hasFilters"] else ""


    fbobinedestinos = Filters(request.data['filter'])
    fbobinedestinos.setParameters({
        "destino_cli": {"value": lambda v: v.get('fdestino').lower() if v.get('fdestino') is not None else None, "field": lambda k, v: f"lower(d->'cliente'->>'BPCNAM_0')"},
        "destino_lar": {"value": lambda v: Filters.getNumeric(v.get('fdestino_lar')), "field": lambda k, v: f"(d->>'largura')::int"},
        "destino_reg": {"value": lambda v: Filters.getNumeric(v.get('fdestino_reg')), "field": lambda k, v: f"(mb.destinos->>'regranular')::int"},
        "destino_estado": {"value": lambda v: Filters.getNumeric(v.get('fdestino_estado')), "field": lambda k, v: f"mb.destinos->'estado'->>'value'"}
    }, True)
    fbobinedestinos.where(False,"and")
    fbobinedestinos.auto()
    fbobinedestinos.value()
    fbobinedestinos.text = f"""and exists (
        SELECT 1
        FROM mv_bobines mb, json_array_elements((mb.destinos::json->>'destinos')::json) d
        WHERE mb.palete_id=sgppl.id and mb.recycle=0 and mb.comp_actual>0 and mb.destinos is not null {fbobinedestinos.text}
        limit 1
    )""" if fbobinedestinos.hasFilters else ""

    fartigompmulti = filterMulti(request.data['filter'], {
        'fartigo_mp': {"keys": ['matprima_cod', 'matprima_des'], "table": 'mcg.'},
        'flote_mp': {"keys": ['n_lote'], "table": 'mcg.'},
    }, False, "and" if f.hasFilters else "and" ,False)
    # fbobine = Filters(request.data['filter'])
    # fbobine.setParameters({"bobinenome": {"value": lambda v: v.get('fbobine'), "field": lambda k, v: f'nome'}}, True)
    # fbobine.where()
    # fbobine.auto()
    # fbobine.value()
    fartigompmulti["text"] = f""" and exists (select 1 from mv_bobines mb join mv_consumo_granulado mcg on mcg.ig_id = mb.ig_id where mb.palete_id=sgppl.id and mb.recycle=0 and mb.comp_actual>0 {fartigompmulti["text"].lstrip("where (").rstrip(")")}) limit 1) """ if fartigompmulti["hasFilters"] else ""
    #fartigompmulti["text"] = f"""and exists (select 1 from mv_bobines mb where mb.palete_id=sgppl.id {fartigompmulti["text"].lstrip("where (").rstrip(")")}))""" if fartigompmulti["hasFilters"] else ""



    parameters = {**f.parameters, **fartigo['parameters'], **festados.parameters, **fbobinemulti["parameters"], **fartigompmulti["parameters"],**fbobinedestinos.parameters}
    dql = dbgw.dql(request.data, False,False)
    cols = f"""*"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""  
            select {c(f'{dql.columns}')} from ( select 
                distinct on (sgppl.id) id, mv.STOCK_LOC,mv.STOCK_LOT,mv.STOCK_ITMREF,mv.STOCK_QTYPCU,mv."SDHNUM_0",mv."BPCNAM_0",mv."ITMREF_0",mv."ITMDES1_0",mv."EECICT_0",mv."IPTDAT_0",mv."VCRNUM_0",
                mv."VCRNUMORI_0",mv.mes,mv.ano,mv."BPRNUM_0",mv."VCRLINORI_0",mv."VCRSEQORI_0",
                sgppl."timestamp",sgppl.data_pal,sgppl.nome,sgppl.num,sgppl.estado,sgppl.area,sgppl.comp_total,
                sgppl.num_bobines,sgppl.diametro,sgppl.peso_bruto,sgppl.peso_palete,sgppl.peso_liquido,sgppl.cliente_id,
                sgppl.retrabalhada,sgppl.stock,sgppl.carga_id,sgppl.num_palete_carga,sgppl.destino,sgppl.ordem_id,sgppl.ordem_original,
                sgppl.ordem_original_stock,sgppl.num_palete_ordem,sgppl.draft_ordem_id,sgppl.ordem_id_original,sgppl.area_real,
                sgppl.comp_real,sgppl.diam_avg,sgppl.diam_max,sgppl.diam_min,sgppl.nbobines_real, sgppl.ofid_original, sgppl.ofid, sgppl.disabled,
                sgppl.cliente_nome,sgppl.artigo,sgppl.destinos,sgppl.nbobines_emendas,sgppl.destinos_has_obs,sgppl.nbobines_sem_destino,sgppl.nok,sgppl.nok_estados,sgppl.lvl,
                mol.prf,mol.data_encomenda,mol.item,mol.iorder,mol.matricula,mol.matricula_reboque,mol.modo_exp
            FROM mv_paletes sgppl
            LEFT JOIN mv_ofabrico_list mol on mol.ofabrico=sgppl.ofid
            LEFT JOIN mv_pacabado_status mv on mv."LOT_0" = sgppl.nome
            {"cross join lateral json_array_elements ( sgppl.artigo ) as j" if fartigo["hasFilters"] or festados.hasFilters else ""}
            WHERE nbobines_real>0 and (disabled=0 or mv."SDHNUM_0" is not null)
            {f.text} {fartigo["text"]} {festados.text} {fbobinemulti["text"]} {fartigompmulti["text"]} {fbobinedestinos.text}
            ) t
            [#MARK-REPORT-01#]
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql, db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["gw"],dbi=dbgw,conn=connection)
    try:
        response = dbgw.executeList(sql, connection, parameters,[],None,None)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def PaletesLookup(request, format=None):
    connection = connections[connGatewayName].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({
    #    **rangeP(f.filterData.get('fdata'), 't_stamp', lambda k, v: f'DATE(t_stamp)'),
    #    **rangeP(f.filterData.get('fdatain'), 'in_t', lambda k, v: f'DATE(in_t)'),
    #    **rangeP(f.filterData.get('fdataout'), 'out_t', lambda k, v: f'DATE(out_t)'),
    #    "diff": {"value": lambda v: '>0' if "fdataout" in v and v.get("fdataout") is not None else None, "field": lambda k, v: f'TIMESTAMPDIFF(second,in_t,out_t)'},
    #    "n_lote": {"value": lambda v: v.get('flote'), "field": lambda k, v: f'{k}'},
    "id": {"value": lambda v: v.get('palete_id')},
    "nbobines_real": {"value": lambda v: '>0'},
    #    "vcr_num": {"value": lambda v: v.get('fvcr')},
    #    "qty_lote": {"value": lambda v: v.get('fqty'), "field": lambda k, v: f'{k}'},
    #    "qty_reminder": {"value": lambda v: v.get('fqty_reminder'), "field": lambda k, v: f'{k}'},
    #    "type_mov": {"value": lambda v: v.get('ftype_mov'), "field": lambda k, v: f'{k}'}
    }, True)
    f.where()
    f.auto()
    f.value()

    f2 = filterMulti(request.data['filter'], {
        # 'fartigo': {"keys": ['artigo_cod', 'artigo_des'], "table": 't.'}
    }, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = dbgw.dql(request.data, False)
    cols = f"""sgppl.*,mv."SDHNUM_0",mv."BPCNAM_0",mv."EECICT_0",mv."IPTDAT_0" """
    dql.columns=encloseColumn(cols,False)
    sql = lambda: (
        f"""  
            select
                {f'{dql.columns}'}
            FROM mv_paletes sgppl
            LEFT JOIN mv_pacabado_status mv on mv."LOT_0" = sgppl.nome
            {f.text} {f2["text"]}
            {dql.sort} {dql.limit}
        """
    )
    print(f"""  
            select
                {f'{dql.columns}'}
            FROM mv_paletes sgppl
            LEFT JOIN mv_pacabado_status mv on mv."LOT_0" = sgppl.nome
            {f.text} {f2["text"]}
            {dql.sort} {dql.limit}
        """)
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["gw"],dbi=dbgw,conn=connection)
    try:
        response = dbgw.executeSimpleList(sql, connection, parameters)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)


def PaletesHistoryList(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({
    #    **rangeP(f.filterData.get('fdata'), 't_stamp', lambda k, v: f'DATE(t_stamp)'),
    #    **rangeP(f.filterData.get('fdatain'), 'in_t', lambda k, v: f'DATE(in_t)'),
    #    **rangeP(f.filterData.get('fdataout'), 'out_t', lambda k, v: f'DATE(out_t)'),
    #    "diff": {"value": lambda v: '>0' if "fdataout" in v and v.get("fdataout") is not None else None, "field": lambda k, v: f'TIMESTAMPDIFF(second,in_t,out_t)'},
        "id": {"value": lambda v: f"=={v.get('palete_id')}", "field": lambda k, v: f'{k}'},
    #    "fof": {"value": lambda v: v.get('fof')},
    #    "vcr_num": {"value": lambda v: v.get('fvcr')},
    #    "qty_lote": {"value": lambda v: v.get('fqty'), "field": lambda k, v: f'{k}'},
    #    "qty_reminder": {"value": lambda v: v.get('fqty_reminder'), "field": lambda k, v: f'{k}'},
    #    "type_mov": {"value": lambda v: v.get('ftype_mov'), "field": lambda k, v: f'{k}'}
    }, True)
    f.where()
    f.auto()
    f.value()

    f2 = filterMulti(request.data['filter'], {
        # 'fartigo': {"keys": ['artigo_cod', 'artigo_des'], "table": 't.'}
    }, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""t.*,pc.name cliente_nome,po1.ofid ofid_original,po2.ofid ofid"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""  
            select
                {c(f'{dql.columns}')}
            FROM (

                select * from audit_producao_palete pp {f.text}
                union
                select null,null,null,pp.* from producao_palete pp {f.text}

            ) t
            LEFT JOIN producao_carga pcarga ON pcarga.id = t.carga_id
            LEFT JOIN producao_cliente pc ON pc.id = t.cliente_id
            LEFT JOIN planeamento_ordemproducao po1 ON po1.id = t.ordem_id_original
            LEFT JOIN planeamento_ordemproducao po2 ON po2.id = t.ordem_id
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    try:
        response = db.executeList(sql, connection, parameters,[],None,None)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def PaletizacaoLookup(request, format=None):
    connection = connections["default"].cursor()
    _filter = {}
    cols=""
    if request.data['filter'].get("paletizacao_id"):
        _filter={"id":request.data['filter'].get("paletizacao_id")}
        cols=f"""
            pp.*,
            (select JSON_ARRAYAGG(JSON_OBJECT('id',pd.id,'item_id',pd.item_id,'item_size',pd.item_size,'item_des',pd.item_des,'item_order',pd.item_order,'item_numbobines',item_numbobines,
            'item_paletesize',item_paletesize,'item_cintas',item_cintas, 'paletizacao_id',paletizacao_id))
            from producao_paletizacaodetails pd where pd.paletizacao_id=pp.id order by pd.item_order) details 
        """
        _sqlTxt = f"""from producao_paletizacao pp"""
    elif request.data['filter'].get("of_id"):
        _filter={"id":request.data['filter'].get("of_id")}
        cols = f"""p.esquema->'$.paletizacao' paletizacao"""
        _sqlTxt = f"""
        from planeamento_ordemproducao pp 
        join producao_tempaggordemfabrico pt on pt.id=pp.agg_of_id_id
        join producao_currentsettings pc on pc.agg_of_id = pp.agg_of_id_id
        JOIN JSON_TABLE(pc.paletizacao,"$[*]" COLUMNS ( of_id INT PATH "$.of_id", esquema JSON PATH "$")) p on p.of_id=pp.id
        """
    elif request.data['filter'].get("palete_id"):
        _filter={"id":request.data['filter'].get("palete_id")}
        cols = f"""pp.paletizacao"""
        _sqlTxt = f"""FROM producao_palete pp"""

    f = Filters(_filter)
    f.setParameters({"id": {"value": lambda v: v.get('id'),"field": lambda k, v: f'pp.{k}'}}, True)    
    f.where()
    f.auto()
    f.value()  

    parameters={**f.parameters}
    dql = db.dql(request.data, False)
    dql.columns=encloseColumn(cols,False)
    sql = lambda: (
        f"""  
            select {f'{dql.columns}'} {_sqlTxt}
            {f.text}
            {dql.sort} {dql.limit}
        """
    )
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    try:
        response = db.executeSimpleList(sql, connection, parameters)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)




# def StockAvailableList(request, format=None):
#     connection = connections["default"].cursor()
#     f = Filters(request.data['filter'])

#     f.setParameters({
#     #    **rangeP(f.filterData.get('fdata'), 't_stamp', lambda k, v: f'DATE(t_stamp)'),
#     #    **rangeP(f.filterData.get('fdatain'), 'in_t', lambda k, v: f'DATE(in_t)'),
#     #    **rangeP(f.filterData.get('fdataout'), 'out_t', lambda k, v: f'DATE(out_t)'),
#     #    "diff": {"value": lambda v: '>0' if "fdataout" in v and v.get("fdataout") is not None else None, "field": lambda k, v: f'TIMESTAMPDIFF(second,in_t,out_t)'},
#     #    "n_lote": {"value": lambda v: v.get('flote'), "field": lambda k, v: f'{k}'},
#     #    "fof": {"value": lambda v: v.get('fof')},
#     #    "vcr_num": {"value": lambda v: v.get('fvcr')},
#     #    "qty_lote": {"value": lambda v: v.get('fqty'), "field": lambda k, v: f'{k}'},
#     #    "qty_reminder": {"value": lambda v: v.get('fqty_reminder'), "field": lambda k, v: f'{k}'},
#     #    "type_mov": {"value": lambda v: v.get('ftype_mov'), "field": lambda k, v: f'{k}'}
#     }, True)
#     f.where(False,"and")
#     f.auto()
#     f.value()

#     f2 = filterMulti(request.data['filter'], {
#         # 'fartigo': {"keys": ['artigo_cod', 'artigo_des'], "table": 't.'}
#     }, False, "and" if f.hasFilters else "and" ,False)
#     parameters = {**f.parameters, **f2['parameters']}

#     dql = db.dql(request.data, False)
#     cols = f"""*"""
#     dql.columns=encloseColumn(cols,False)
#     sql = lambda p, c, s: (
#         f"""
#             select
#                 {c(f'{dql.columns}')}
#             from produto_stock_disponivel
#         """
#     )
#     if ("export" in request.data["parameters"]):
#         dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
#         dql.paging=""
#         return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
#     try:
#         response = db.executeList(sql, connection, parameters,[],None,None)
#     except Exception as error:
#         print(str(error))
#         return Response({"status": "error", "title": str(error)})
#     return Response(response)

def PaletesStockAvailableList(request, format=None):
    _c = connections[connGatewayName]
    connection = _c.cursor()
    f = Filters(request.data['filter'] if "filter" in request.data else {})
    f.setParameters({
         "nome": {"value": lambda v: v.get('flote'), "field": lambda k, v: f'sgppl.{k}'},
         "carga_id": {"value": lambda v: "isnull", "field": lambda k, v: f'sgppl.{k}'},
         "ordem_id": {"value": lambda v: Filters.getNumeric(v.get('ordem_id'),v.get('ordem_id'),"!==="), "field": lambda k, v: f'sgppl.{k}'},
         "disabled": {"value": lambda v: Filters.getNumeric(0), "field": lambda k, v: f'sgppl.{k}'},
         #"cliente_cod": {"value": lambda v: Filters.getNumeric(v.get('cliente_cod')), "field": lambda k, v: f'sgppl.{k}'},
         "SDHNUM_0": {"value": lambda v: "isnull", "field": lambda k, v: f'mv."{k}"'},
         "artigo_cod": {"value": lambda v: f"=={v.get('artigo_cod')}", "field": lambda k, v: f"j->>'cod'"},
    }, True)
    f.where()
    f.auto([],[],True,DBSql(_c.alias).typeDB)
    f.add(f'sgppl.nbobines_real = sgppl.num_bobines', True)
    #f.add(f'sgppl.ordem_id = sgppl.ordem_id_original', True)
    f.value()

    f2 = filterMulti(request.data['filter'] if "filter" in request.data else {}, {
        # 'fartigo': {"keys": ['artigo_cod', 'artigo_des'], "table": 't.'}
    }, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = dbgw.dql(request.data, False)
    cols = f"""
            distinct on (sgppl.id) id, mv.STOCK_LOC,mv.STOCK_LOT,mv.STOCK_ITMREF,mv.STOCK_QTYPCU,mv."SDHNUM_0",mv."BPCNAM_0",mv."ITMREF_0",mv."ITMDES1_0",mv."EECICT_0",mv."IPTDAT_0",mv."VCRNUM_0",
            mv."VCRNUMORI_0",mv.mes,mv.ano,mv."BPRNUM_0",mv."VCRLINORI_0",mv."VCRSEQORI_0",
            sgppl."timestamp",sgppl.data_pal,sgppl.nome,sgppl.num,sgppl.estado,sgppl.area,sgppl.comp_total,
            sgppl.num_bobines,sgppl.diametro,sgppl.peso_bruto,sgppl.peso_palete,sgppl.peso_liquido,sgppl.cliente_id,
            sgppl.cliente_cod,
            sgppl.retrabalhada,sgppl.stock,sgppl.carga_id,sgppl.num_palete_carga,sgppl.destino,sgppl.ordem_id,sgppl.ordem_original,
            sgppl.ordem_original_stock,sgppl.num_palete_ordem,sgppl.draft_ordem_id,sgppl.ordem_id_original,sgppl.area_real,
            sgppl.comp_real,sgppl.diam_avg,sgppl.diam_max,sgppl.diam_min,sgppl.nbobines_real, sgppl.ofid_original, sgppl.ofid, sgppl.disabled,
            sgppl.cliente_nome,sgppl.artigo,sgppl.destinos,sgppl.nbobines_emendas,sgppl.destinos_has_obs,
            case when (select 1 from mv_bobines mb where mb.palete_id=sgppl.id and mb.date_expired=1 limit 1) isnull then 0 else 1 END has_bobines_expired
            --,mol.prf,mol.data_encomenda,mol.item,mol.iorder,mol.matricula,mol.matricula_reboque,mol.modo_exp
    """
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""
            select {c(f'{dql.columns}')}
            FROM mv_paletes sgppl
            --LEFT JOIN mv_ofabrico_list mol on mol.ofabrico=sgppl.ofid
            LEFT JOIN mv_pacabado_status mv on mv."LOT_0" = sgppl.nome
            cross join lateral json_array_elements ( sgppl.artigo ) as j
            {f.text}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    print(

f"""
            select {f'{dql.columns}'}
            FROM mv_paletes sgppl
            --JOIN (select 1 from mv_bobines mb where mb.date_expired=1 limit 1) 
            --LEFT JOIN mv_ofabrico_list mol on mol.ofabrico=sgppl.ofid
            LEFT JOIN mv_pacabado_status mv on mv."LOT_0" = sgppl.nome
            cross join lateral json_array_elements ( sgppl.artigo ) as j
            {f.text}
            {dql.sort} {dql.paging} {dql.limit}
        """

    )
    print(parameters)
    if ("export" in request.data["parameters"]):
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        return export(sql(lambda v:v,lambda v:v,lambda v:v), db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["gw"],dbi=dbgw,conn=connection)
    try:
        response = dbgw.executeList(sql, connection, parameters,[],None,None)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def AllowedOFChanges(request, format=None):
    f = Filters({**request.data['filter'],"status":3})
    f.setParameters({
        "agg_of_id_id": {"value": lambda v: v.get('agg_of_id'), "field": lambda k, v: f'{k}'},
    }, True)
    f.where()
    f.auto()
    #f.add(f'cs.status = :cs_status', lambda v:(v!=None))
    f.add(f'`status` = :status', lambda v:(v!=None))
    f.value("and")
    parameters = {**f.parameters}
    
    dql = db.dql(request.data, False)
    with connections["default"].cursor() as cursor:
        response = db.executeSimpleList(lambda: (
            f"""
                SELECT * from planeamento_ordemproducao
                {f.text}
                {dql.sort} {dql.limit}
            """
        ), cursor, parameters)
        return Response(response)

def changePaleteOrdemFabrico(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")
    
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                args = [filter.get("palete_id"), data.get("ordem_id"),request.user.id]
                cursor.callproc('change_palete_ordemfabrico',args)
        return Response({"status": "success", "title":f"""Palete/Ordem atualizada com sucesso!"""})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def UpdateDestinos(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")

    def checkPalete01(id, cursor):
        f = Filters({"id":id})
        f.where()
        f.add(f'id = :id', True)
        f.add(f'carga_id is null',True)
        f.value("and")
        response = db.executeSimpleList(lambda: (f"""select id from producao_palete {f.text} limit 1"""), cursor, f.parameters)
        if len(response["rows"])>0:
            return response["rows"][0]
        return None

    def checkPalete02(id, cursor):
        connection = connections[connGatewayName].cursor()
        f = Filters({"id":id})
        f.where()
        f.add(f'id = :id', True)
        f.value("and")
        response = dbgw.executeSimpleList(lambda: (f"""
        SELECT sgppl.id
        FROM mv_paletes sgppl
        LEFT JOIN mv_pacabado_status mv on mv."LOT_0" = sgppl.nome
        {f.text} and sgppl.nbobines_real>0 and disabled=0 and mv."SDHNUM_0" is null
        """), connection, f.parameters)
        if len(response["rows"])>0:
            return response["rows"][0]
        return None

    destinos_has_obs = 0
    if data["values"]["destinos"]:
        for v in data["values"]["destinos"]["destinos"]:
            if v["obs"]:
                destinos_has_obs += 1
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                chk01 = checkPalete01(filter["palete_id"],cursor)
                chk02 = checkPalete02(filter["palete_id"],cursor)
                if chk01 is None or chk02 is None:
                    return Response({"status": "error", "title": f"Não é possível alterar destinos! A palete já tem carga associada ou é palete final."})
                ids_d = ','.join(str(x) for x in data["rowsDestinos"])
                ids_o = ','.join(str(x) for x in data["rowsObs"]) 
                ids_po = ','.join(str(x) for x in data["rowsPropObs"])                    
 
                if data["values"]["destinos"]:
                    dml = db.dml(TypeDml.UPDATE,{
                        "estado":data["values"].get("destinos").get("estado").get("value"),
                        "destinos":json.dumps(data["values"]["destinos"]),
                        "destino":data["values"]["destinoTxt"],
                        "destinos_has_obs":destinos_has_obs
                        }, "producao_bobine",{"id":f'in:{ids_d}'},None,False)
                    db.execute(dml.statement, cursor, dml.parameters)
                else:
                    dml = db.dml(TypeDml.UPDATE,{
                        "destino":data["values"]["destinoTxt"]
                    }, "producao_bobine",{"id":f'in:{ids_d}'},None,False)
                    db.execute(dml.statement, cursor, dml.parameters)

                dml = db.dml(TypeDml.UPDATE,{"obs":data["values"]["obs"]},"producao_bobine",{"id":f'in:{ids_o}'},None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                dml = db.dml(TypeDml.UPDATE,{"prop_obs":data["values"]["prop_obs"]},"producao_bobine",{"id":f'in:{ids_po}'},None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                args = (filter["palete_id"],None)
                cursor.callproc('update_palete',args)

        return Response({"status": "success", "success":f"""Registos atualizados com sucesso!"""})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})


def AddPaletesStock(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                args = [data.get("ordem_id"),json.dumps(data.get("rows"), ensure_ascii=False),request.user.id]
                cursor.callproc('add_paletes_stock',args)
        return Response({"status": "success", "success":f"""Registos atualizados com sucesso!"""})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def DeletePaletesStock(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                args = [data.get("ordem_id"),json.dumps(data.get("rows"), ensure_ascii=False),request.user.id]
                cursor.callproc('delete_paletes_stock',args)
        return Response({"status": "success", "title":f"""Registos atualizados com sucesso!"""})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})
    
def DeletePalete(request, format=None):
    data = request.data.get("parameters")
    try:
        def _checkPalete(palete_id):
            if not palete_id:
                return 0
            connection = connections[connGatewayName].cursor()
            f = Filters({"id":palete_id})
            f.where()
            f.add(f'sgppl.id = :id', True)
            f.value("and")
            response = dbgw.executeSimpleList(lambda: (f"""
            SELECT sgppl.id
            FROM mv_paletes sgppl
            LEFT JOIN mv_pacabado_status mv on mv."LOT_0" = sgppl.nome
            {f.text} and mv."SDHNUM_0" is null and sgppl.carga_id is null
            """), connection, f.parameters)
            if len(response["rows"])>0:
                return response["rows"][0]
            return None

        if _checkPalete(data.get("palete_id")) is None:
            return Response({"status": "error", "title": "A palete já foi expedida ou pertence a uma carga!"})
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                args = [data.get("palete_id")]
                cursor.callproc('delete_palete',args)
        return Response({"status": "success", "data":{}, "title":None})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def CreatePaleteLine(request, format=None):
    data = request.data.get("parameters")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                checkonly=0
                args = [data.get("action"), json.dumps(data.get("bobines"), ensure_ascii=False), data.get("id"), data.get("nbobines"),data.get("lvl"),data.get("pesobruto"),data.get("palete_id"),data.get("pesopalete"),checkonly,request.user.id]
                print(args)
                cursor.callproc('create_palete',args)
                row = cursor.fetchone()
                cursor.execute("select * from tmp_paletecheck_report;")
                report = fetchall(cursor)
                updateMaterializedView("mv_paletes")
        return Response({"status": "success", "data":report, "palete":{"id":row[0],"nome":row[1]}, "title":None})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})
       
def CheckBobinesPaleteLine(request, format=None):
    data = request.data.get("parameters")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                checkonly=1
                args = [data.get("action"),json.dumps(data.get("bobines"), ensure_ascii=False), data.get("id"), data.get("nbobines"),data.get("lvl"),None,data.get("palete_id"),None,checkonly,None]
                print(args)
                cursor.callproc('create_palete',args)
                cursor.execute("select * from tmp_paletecheck_report;")
                report = fetchall(cursor)
        return Response({"status": "success", "data":report, "title":None})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})
    
def CheckBobinesPalete(request, format=None):
    r = PostData(request)
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                args = [r.data.get("type"),r.data.get("nBobines"),r.data.get("ordem_id"),r.data.get("lvl"),r.data.get("paleteRef"),json.dumps(r.data.get("bobines"), ensure_ascii=False),r.data.get("palete_redo_id")]
                print(args)
                cursor.callproc('check_bobines_palete',args)
                report = fetchall(cursor)
        return Response({"status": "success", "title": "Palete validada com sucesso!", "report":report, "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def CreatePalete(request, format=None):
    r = PostData(request)
    try:
        #with transaction.atomic():
        with connections["default"].cursor() as cursor:
            args = [
                r.data.get("type"),r.data.get("nBobines"),r.data.get("ordem_id"),r.data.get("lvl"),r.data.get("paleteRef"),
                json.dumps(r.data.get("bobines"), ensure_ascii=False),
                r.data.get("palete_redo_id")
            ]
            cursor.callproc('check_bobines_palete',args)
            report = fetchall(cursor)
        with connections["default"].cursor() as cursor:
            if len(report)>0 and report[0].get("ok")==1:
                schemabobines = ",".join(str(num) for num in r.data.get("schemaBobines"))
                args = [
                    r.data.get("type"),r.data.get("nBobines"),r.data.get("ordem_id"),r.data.get("lvl"),r.data.get("paleteRef"),
                    json.dumps(r.data.get("bobines"), ensure_ascii=False),r.data.get("pesoBruto"),r.data.get("paletePeso"),
                    r.data.get("paletizacao_id"),schemabobines, r.data.get("palete_redo_id"),r.userId
                ]
                print(args)
                cursor.callproc('create_other_palete',args)
                palete = fetchall(cursor)
        return Response({"status": "success", "title": "Palete criada com sucesso!", "report":report,"palete":palete, "subTitle":f'{None}'})
    except Exception as error:
        print(error)
        return Response({"status": "error", "title": str(error)})