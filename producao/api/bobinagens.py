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
from producao.api.exports import export

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

# def export(sql, db_parameters, parameters,conn_name):
#     if ("export" in parameters and parameters["export"] is not None):
#         dbparams={}
#         for key, value in db_parameters.items():
#             if f"%({key})s" not in sql: 
#                 continue
#             dbparams[key] = value
#             sql = sql.replace(f"%({key})s",f":{key}")
#         hash = base64.b64encode(hmac.new(bytes("SA;PA#Jct\"#f.+%UxT[vf5B)XW`mssr$" , 'utf-8'), msg = bytes(sql , 'utf-8'), digestmod = hashlib.sha256).hexdigest().upper().encode()).decode()
#         req = {
            
#             "conn-name":conn_name,
#             "sql":sql,
#             "hash":hash,
#             "data":dbparams,
#             **parameters
#         }
#         wService = "runxlslist" if parameters["export"] == "clean-excel" else "runlist"
#         fstream = requests.post(f'http://192.168.0.16:8080/ReportsGW/{wService}', json=req)

#         if (fstream.status_code==200):
#             resp =  HttpResponse(fstream.content, content_type=fstream.headers["Content-Type"])
#             if (parameters["export"] == "pdf"):
#                 resp['Content-Disposition'] = "inline; filename=list.pdf"
#             elif (parameters["export"] == "excel"):
#                 resp['Content-Disposition'] = "inline; filename=list.xlsx"
#             elif (parameters["export"] == "word"):
#                 resp['Content-Disposition'] = "inline; filename=list.docx"
#             if (parameters["export"] == "csv"):
#                 resp['Content-Disposition'] = "inline; filename=list.csv"
#             return resp


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
                _last["manual"] = 1
                dml = db.dml(TypeDml.INSERT, _last, "ig_bobinagens",None,None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo criado com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao criar registo! {str(error)}"})


def BobinagensList(request, format=None):
    connection = connections["default"].cursor()
    feature = request.data['parameters']['feature'] if 'feature' in request.data['parameters'] else None
    typeList = request.data['parameters']['typelist'] if 'typelist' in request.data['parameters'] else 'A'
    f = Filters(request.data['filter'])
    f.setParameters({
        **rangeP(f.filterData.get('fdata'), 'data', lambda k, v: f'DATE(pbm.{k})'),
        **rangeP(f.filterData.get('ftime'), ['inico','fim'], lambda k, v: f'TIME(pbm.{k})', lambda k, v: f'TIMEDIFF(TIME(pbm.{k[1]}),TIME(pbm.{k[0]}))'),
        "_nome": {"value": lambda v: "2%", "field": lambda k, v: f'pbm.nome'},
        "nome": {"value": lambda v: v.get('fbobinagem'), "field": lambda k, v: f'pbm.{k}'},
        "duracao": {"value": lambda v: v.get('fduracao'), "field": lambda k, v: f'(TIME_TO_SEC(pbm.{k})/60)'},
        "area": {"value": lambda v: v.get('farea'), "field": lambda k, v: f'pbm.{k}'},
        "diam": {"value": lambda v: v.get('fdiam'), "field": lambda k, v: f'pbm.{k}'},
        "comp": {"value": lambda v: v.get('fcomp'), "field": lambda k, v: f'pbm.{k}'},
        "valid": {"value": lambda v: f"=={v.get('valid')}" if v.get("valid") is not None and v.get("valid") != "-1" else None, "field": lambda k, v: f'pbm.{k}'},
        "type": {"value": lambda v: f"=={v.get('agg_of_id')}" if (v.get("type")=="1" and v.get('agg_of_id') is not None) else None, "field": lambda k, v: f'acs.agg_of_id'},
    }, True)
    f.where()
    f.auto()
    f.value()

    f2 = filterMulti(request.data['filter'], {}, False if f.hasFilters else True, "and",False)
    
    f3 = Filters(request.data['filter'])
    f3.setParameters({
        "core": {"value": lambda v: v.get('fcore'), "field": lambda k, v: f'pb.{k}'}
    }, True)
    f3.where(False,"and")
    f3.auto()
    f3.value()

    def filterDefeitosMultiSelect(data,name,relname):
        f = Filters(data)
        frel = "and"
        value = "==1"
        if relname in data:
            if data[relname]=="ou":
                frel = "or"
            if data[relname]=="!ou":
                frel = "or"
                value = "!==1"
            if data[relname]=="!e":
                frel = "and"
                value = "!==1"
        
        fP = {}
        if name in data:
            dt = [o['value'] for o in data[name]]
            for v in dt:
                fP[v] = {"key": v, "value": value, "field": lambda k, v: f'tpb.{k}'}
        f.setParameters({**fP}, True)
        f.auto()
        f.where(False, "and")
        f.value(frel)
        return f

    def filterMultiSelect(data,name,field):
        f = Filters(data)
        fP = {}
        if name in data:
            dt = [o['value'] for o in data[name]]
        
            value = 'in:' + ','.join(f"{w}" for w in dt)
            fP['estado'] = {"key": field, "value": value, "field": lambda k, v: f'tpb.{k}'}
        f.setParameters({**fP}, True)
        f.auto()
        f.where(False, "and")
        f.value()
        return f

    fdefeitos = filterDefeitosMultiSelect(request.data['filter'],'fdefeitos','freldefeitos')
    festados = filterMultiSelect(request.data['filter'],'festados','estado')
    
    f4 = Filters(request.data['filter'])
    f4.setParameters({
        "cliente": {"value": lambda v: Filters.getLower(v.get('fcliente')), "field": lambda k, v: f'lower(tpb.{k})'},
        "destino": {"value": lambda v: Filters.getLower(v.get('fdestino')), "field": lambda k, v: f'lower(tpb.{k})'}
    }, True)
    f4.where(False, "and")
    f4.auto()
    f4.value("and")

    f5 = Filters(request.data['filter'])
    f5.setParameters({
        "of_id": {"value": lambda v: v.get('fofabrico'), "field": lambda k, v: f'tof.{k}'}
    }, True)
    f5.where(False, "and")
    f5.auto()
    f5.value("and")

    parameters = {**f.parameters, **f2['parameters'],**f3.parameters, **fdefeitos.parameters, **festados.parameters, **f4.parameters, **f5.parameters}

    dql = db.dql(request.data, False)
    cols = f"""pbm.*,JSON_ARRAYAGG(JSON_OBJECT('id',pb.id,'lar',pb.lar,'cliente',pb.cliente,'estado',pb.estado,'nome',pb.nome)) bobines,sum(pb.lar) largura,pb.core"""
    dql.columns=encloseColumn(cols,False)

    w = "where" if f.text=='' and f2["text"] == '' else 'and'
    fText01 = f'{w} EXISTS (SELECT 1 FROM producao_bobine tpb where tpb.bobinagem_id = pbm.id {festados.text} {fdefeitos.text} {f4.text} )' if festados.hasFilters or fdefeitos.hasFilters or f4.hasFilters else ''
    w = "where" if w=="where" and fText01=='' else "and"
    fText02 = f'''{w} EXISTS (
                    SELECT 1 FROM 
                    producao_tempaggordemfabrico aof 
                    join producao_tempordemfabrico tof on tof.agg_of_id=acs.agg_of_id
                    WHERE aof.id=acs.agg_of_id {f5.text}
                )''' if f5.hasFilters else ''

    sql = lambda p, c, s: (
        f""" 
            SELECT
            {c(f'{dql.columns}')}
            from(
                select pbm.*
                {f''',(SELECT GROUP_CONCAT(ld.doser) FROM lotesdosers ld where ld.ig_bobinagem_id=pbm.ig_bobinagem_id and (ld.n_lote is null or ld.qty_to_consume<>ld.qty_consumed)) no_lotes_dosers,
                (select count(*) FROM lotesdosers ld where ld.ig_bobinagem_id=pbm.ig_bobinagem_id and (ld.n_lote is null or ld.qty_to_consume<>ld.qty_consumed)) no_lotes
                ''' if feature=='fixconsumos' else ''}
                {f''',ROUND(pbc.A1,2) A1,ROUND(pbc.A2,2) A2,ROUND(pbc.A3,2) A3,ROUND(pbc.A4,2) A4,ROUND(pbc.A5,2) A5,ROUND(pbc.A6,2) A6,
                      ROUND(pbc.B1,2) B1,ROUND(pbc.B2,2) B2,ROUND(pbc.B3,2) B3,ROUND(pbc.B4,2) B4,ROUND(pbc.B5,2) B5,ROUND(pbc.B6,2) B6,
                      ROUND(pbc.C1,2) C1,ROUND(pbc.C2,2) C2,ROUND(pbc.C3,2) C3,ROUND(pbc.C4,2) C4,ROUND(pbc.C5,2) C5,ROUND(pbc.C6,2) C6''' if typeList=='B' else '' }
                ,JSON_EXTRACT(acs.ofs, '$[*].of_cod') ofs
                ,JSON_EXTRACT(acs.ofs, '$[*].cliente_nome') clientes
                ,JSON_EXTRACT(acs.ofs, '$[*].order_cod') orders,
                acs.agg_of_id
                FROM producao_bobinagem pbm
                left join audit_currentsettings acs on acs.id=pbm.audit_current_settings_id
                {'LEFT JOIN producao_bobinagemconsumos pbc ON pbc.bobinagem_id=pbm.id' if typeList=='B' else '' }
                {f.text} {f2["text"]}
                {fText01}
                {fText02}
                {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
            ) pbm
            join producao_bobine pb on pb.bobinagem_id = pbm.id
            where 1=1 {f3.text}
            {f' and no_lotes>0' if feature=='fixconsumos' else ''}
            group by pbm.id,pb.core {',A1,A2,A3,A4,A5,A6,B1,B2,B3,B4,B5,B6,C1,C2,C3,C4,C5,C6' if typeList=='B' else '' } 
            {s(dql.sort)}
        """
    )
    # sqlCount = f""" 
    #         SELECT count(*) FROM (
    #             SELECT
    #             pbm.id 
    #             {f''',(select count(*) FROM lotesdosers ld where ld.ig_bobinagem_id=pbm.ig_bobinagem_id and (ld.n_lote is null or ld.qty_to_consume<>ld.qty_consumed)) no_lotes''' if feature=='fixconsumos' else ''}
    #             FROM producao_bobinagem pbm
    #             left join audit_currentsettings acs on acs.id=pbm.audit_current_settings_id
    #             {f.text} {f2["text"]}
    #             {fText01}
    #             {fText02}
    #         ) t
    #         join producao_bobine pb on pb.bobinagem_id = t.id
    #         where 1=1 {f3.text}
    #         {f' and no_lotes>0' if feature=='fixconsumos' else ''}
    #     """

    if ("export" in request.data["parameters"]):
        for x in range(0, 30):
            request.data["parameters"]['cols'][f'{x+1}']={"title":f'{x+1}',"width":6}
        dql.limit=f"""limit {request.data["parameters"]["limit"]}"""
        dql.paging=""
        tmpsql = sql(lambda v:'',lambda v:v,lambda v:v)
        if typeList=='A':
            tmpsql = f"""SELECT t.*,
                concat(t.bobines->>'$[0].estado','\\n',t.bobines->>'$[0].lar') as '1',concat(t.bobines->>'$[1].estado','\\n',t.bobines->>'$[1].lar') as '2',
                concat(t.bobines->>'$[2].estado','\\n',t.bobines->>'$[2].lar') as '3',concat(t.bobines->>'$[3].estado','\\n',t.bobines->>'$[3].lar') as '4',
                concat(t.bobines->>'$[4].estado','\\n',t.bobines->>'$[4].lar') as '5',concat(t.bobines->>'$[5].estado','\\n',t.bobines->>'$[5].lar') as '6',
                concat(t.bobines->>'$[6].estado','\\n',t.bobines->>'$[6].lar') as '7',concat(t.bobines->>'$[7].estado','\\n',t.bobines->>'$[7].lar') as '8',
                concat(t.bobines->>'$[8].estado','\\n',t.bobines->>'$[8].lar') as '9',concat(t.bobines->>'$[9].estado','\\n',t.bobines->>'$[9].lar') as '10',

                concat(t.bobines->>'$[10].estado','\\n',t.bobines->>'$[10].lar') as '11',concat(t.bobines->>'$[11].estado','\\n',t.bobines->>'$[11].lar') as '12',
                concat(t.bobines->>'$[12].estado','\\n',t.bobines->>'$[12].lar') as '13',concat(t.bobines->>'$[13].estado','\\n',t.bobines->>'$[13].lar') as '14',
                concat(t.bobines->>'$[14].estado','\\n',t.bobines->>'$[14].lar') as '15',concat(t.bobines->>'$[15].estado','\\n',t.bobines->>'$[15].lar') as '16',
                concat(t.bobines->>'$[16].estado','\\n',t.bobines->>'$[16].lar') as '17',concat(t.bobines->>'$[17].estado','\\n',t.bobines->>'$[17].lar') as '18',
                concat(t.bobines->>'$[18].estado','\\n',t.bobines->>'$[18].lar') as '19',concat(t.bobines->>'$[19].estado','\\n',t.bobines->>'$[19].lar') as '20',

                concat(t.bobines->>'$[20].estado','\\n',t.bobines->>'$[20].lar') as '21',concat(t.bobines->>'$[21].estado','\\n',t.bobines->>'$[21].lar') as '22',
                concat(t.bobines->>'$[22].estado','\\n',t.bobines->>'$[22].lar') as '23',concat(t.bobines->>'$[23].estado','\\n',t.bobines->>'$[23].lar') as '24',
                concat(t.bobines->>'$[24].estado','\\n',t.bobines->>'$[24].lar') as '25',concat(t.bobines->>'$[25].estado','\\n',t.bobines->>'$[25].lar') as '26',
                concat(t.bobines->>'$[26].estado','\\n',t.bobines->>'$[26].lar') as '27',concat(t.bobines->>'$[27].estado','\\n',t.bobines->>'$[27].lar') as '28',
                concat(t.bobines->>'$[28].estado','\\n',t.bobines->>'$[28].lar') as '29',concat(t.bobines->>'$[29].estado','\\n',t.bobines->>'$[29].lar') as '30'
                from (
                {tmpsql} 
                ) t"""
        return export(tmpsql, db_parameters=parameters, parameters=request.data["parameters"],conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    response = db.executeList(sql, connection, parameters, [],None,f"select {dql.currentPage*dql.pageSize+1}")
    return Response(response)

def Validar(request, format=None):
    data = request.data.get("parameters").get("rows")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                try:
                    #rows = [{prop: d.get(prop) for prop in ["id","comp","comp_emenda","estado","troca_nw","l_real","lar","vcr_num_inf","vcr_num_sup","bobinagem_id"]} for d in data]
                    args = (json.dumps(data, ensure_ascii=False),request.data.get("parameters").get("lar_bruta"),request.user.id,0)
                    cursor.callproc('validate_bobinagemv2',args)
                except Exception as error:
                    return Response({"status": "error", "title": str(error)})
                return Response({"status": "success", "title": "Bobinagem validada com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao validar a bobinagem! {str(error)}"})


def FixBobinagem(request, format=None):
    data = request.data.get("parameters")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                try:
                    args = [data.get("values").get("id"),data.get("values").get("comp"),data.get("values").get("diam"),data.get("values").get("largura_bruta"),data.get("values").get("comp_emenda"),data.get("values").get("troca_nw"),json.dumps(data.get("values").get("lote_nwsup"), ensure_ascii=False),json.dumps(data.get("values").get("lote_nwinf"), ensure_ascii=False),data.get("values").get("nwsup"),data.get("values").get("nwinf"), request.user.id]
                    print(args)
                    cursor.callproc('fix_bobinagem',args)
                except Exception as error:
                    return Response({"status": "error", "title": str(error)})
                return Response({"status": "success", "title": "Bobinagem atualizada com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao atualizar a bobinagem! {str(error)}"})

def BobinagemLookup(request, format=None):
    connection = connections["default"].cursor()
    data = request.data.get("parameters")
    f = Filters(request.data['filter'])
    f.setParameters({
        "id": {"value": lambda v: Filters.getNumeric(v.get('fid')), "field": lambda k, v: f'pbm.{k}'},
    }, True)
    f.where()
    f.auto()
    f.value()

    f2 = Filters(request.data['filter'])
    f2.setParameters({
        "bobinagem_id": {"value": lambda v: Filters.getNumeric(v.get('fid')), "field": lambda k, v: f'b.{k}'},
    }, True)
    f2.where()
    f2.auto()
    f2.value()

    parameters={**f.parameters,**f2.parameters}

    dql = db.dql(request.data, False)
    cols = f"""pbm.*,pbm.comp_par comp_emenda,t.largura_bobinagem,t.troca_nw{",(select count(*) from producao_bobine pb join producao_palete pp on pp.id=pb.palete_id and pp.nome not like 'DM%' where pb.bobinagem_id=pbm.id) nbobines_in_paletes" if data.get("checkBobinesInFinalPalete")==True else ""} """
    dql.columns=encloseColumn(cols,False)
    sql = lambda: (
        f"""  
            select 
            {f'{dql.columns}'}
            from producao_bobinagem pbm
            join (select b.*,sum(b.lar) over () largura_bobinagem from producao_bobine b {f2.text} limit 1) t on t.bobinagem_id=pbm.id
            {f.text}
            limit 1
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

# def stepNav(data,lop,fixedFilter):
#     if data.get("stepNavigation"):
#         sn = data.get("stepNavigation")
#         f_data = {k: v for d in sn.get("values") for k, v in d.items()}
#         navparameters = {}
#         navfilters = []   
#         for idx, x in enumerate(sn.get("values")):
#             fs = Filters(f_data)
#             for i in range(0, idx+1):
#                 op="="
#                 if i<=idx:
#                     op = "<" if sn.get("stepDir") == -1 else ">"
#                 fs.add(f'{list(sn.get("values")[i].keys())[0]} {op} :{list(sn.get("values")[i].keys())[0]}',True)
#             fs.where(False, "" if idx==0 else "or")
#             fs.value()
#             navfilters.append(fs.text)
#             navparameters={**navparameters,**fs.parameters}

#         for idx, x in enumerate(sn.get("sort")):
#             sort = []
#             # if sn.get("stepDir") == -1:
#             for x in sn.get("sort"):
#                 sort.append({
#                     **x,
#                     "direction":"ASC" if x.get("direction") == "DESC" else "DESC",
#                     "dir":1 if x.get("dir") == -1 else -1
#                 })
#             # else:
#             #     sort = sn.get("sort")
#                 print("SORTTTT")
#                 print(sort)
#         mainFilter = f'({"or".join(navfilters)})'
#         if fixedFilter:
#             mainFilter = f"{fixedFilter.text} and {mainFilter}" if mainFilter else fixedFilter.text
#             navparameters={**navparameters,**fs.parameters}
#         mainFilter = f"{lop} ({mainFilter})"
#         return {"enabled":True, "sort":sort,"filters":navfilters,"parameters":navparameters,"filter":mainFilter}
#     return {"enabled":False, "sort":None,"filters":None,"parameters":{},"filter":""}

# def GetBobinagem(request, format=None):
#     #A ordem que são executados os if's é muito importante!!!!
#     cursor = connections["default"].cursor()
#     print("RRWwwwww")
#     print(request.data)
#     filter = request.data['filter']
#     sort = request.data.get("sort")
#     parameters = request.data.get("parameters")
#     try:
#         response = _getBobinagem(filter,sort,parameters)
#         if response==None:
#             return Response({"status": "success", "data":None})
#     except Error as error:
#         print(str(error))
#         return Response({"status": "error", "title": str(error)})
#     return Response(response)

# def _getBobinagem(filter,sort="",data={}):
#     cursor = connections["default"].cursor()
#     f = Filters(filter)
#     f.setParameters({
#         "nome":{"value": lambda v: v.get('fnome'), "field": lambda k, v: f'{k}'},
#     }, True)
#     f.auto()
#     f.where()
#     f.value()
      
#     step_data = stepNav(data,"and" if f.hasFilters else "where",None)
#     print(step_data)
#     parameters = {**f.parameters,**step_data.get("parameters")}
#     print("aaaaabaaaaaa")
#     if step_data.get("enabled"):
#         dql = db.dql({"sort":step_data.get("sort")}, False)
#         sort = dql.sort
#     sql=lambda: (f"""
#         select * from producao_bobinagem {f.text} {step_data.get("filter")} {sort} limit 1
#     """)
#     print("xiiiiiiiiii")
#     print(f"""
#         select * from producao_bobinagem {f.text} {step_data.get("filter")} {sort} limit 1
#     """)
#     print(parameters)

#     return db.executeSimpleList(sql, cursor, parameters)




def BobinagensLookup(request, format=None):
    connection = connections["default"].cursor()
    data = request.data.get('parameters')
    
    f = Filters(request.data['filter'])
    f.setParameters({
    #    **rangeP(f.filterData.get('fdata'), 't_stamp', lambda k, v: f'DATE(t_stamp)'),
    #    **rangeP(f.filterData.get('fdatain'), 'in_t', lambda k, v: f'DATE(in_t)'),
    #    **rangeP(f.filterData.get('fdataout'), 'out_t', lambda k, v: f'DATE(out_t)'),
    #    "diff": {"value": lambda v: '>0' if "fdataout" in v and v.get("fdataout") is not None else None, "field": lambda k, v: f'TIMESTAMPDIFF(second,in_t,out_t)'},
        "id": {"value": lambda v: Filters.getNumeric(v.get('bobinagem_id')), "field": lambda k, v: f'pbm.{k}'},
    #"id": {"value": lambda v: v.get('palete_id')},
    #"nbobines_real": {"value": lambda v: '>0'},
    #    "vcr_num": {"value": lambda v: v.get('fvcr')},
    #    "qty_lote": {"value": lambda v: v.get('fqty'), "field": lambda k, v: f'{k}'},
    #    "qty_reminder": {"value": lambda v: v.get('fqty_reminder'), "field": lambda k, v: f'{k}'},
    #    "type_mov": {"value": lambda v: v.get('ftype_mov'), "field": lambda k, v: f'{k}'}
    }, True)
    f.where()
    f.auto()
    f.value()

    fid = Filters(request.data['filter'])
    fid.setParameters({
        "bobinagem_id": {"value": lambda v: Filters.getNumeric(v.get('bobinagem_id')), "field": lambda k, v: f'pb.{k}'},
    }, True)
    fid.where()
    fid.auto()
    fid.value()

    # f2 = filterMulti(request.data['filter'], {
    #     # 'fartigo': {"keys": ['artigo_cod', 'artigo_des'], "table": 't.'}
    # }, False, "and" if f.hasFilters else "and" ,False)

    parameters = {**f.parameters}

    dql = db.dql(request.data, False)

    cols = f"""
            lnw0.artigo_cod nwcodinf,
            lnw1.artigo_cod nwcodsup,
            lnw0.artigo_des nwdesinf,
            lnw1.artigo_des nwdessup,
            lnw0.n_lote nwloteinf,
            lnw1.n_lote nwlotesup,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',of_id,'of_cod',of_cod,'op',CONCAT(cliente_nome,' L',artigo_lar,' LINHA ',order_cod))) FROM JSON_TABLE(acs.ofs,"$[*]" COLUMNS(of_id INT PATH "$.of_id",of_cod VARCHAR(30) PATH "$.of_cod",order_cod VARCHAR(40) PATH "$.order_cod",cliente_nome VARCHAR(200) PATH "$.cliente_nome",artigo_lar int PATH "$.artigo_lar")) tx) ofs,
            pbm.*,
                CASE WHEN acs.id is not null THEN acs.produto_cod ELSE pf.produto END as produto_cod,
                acs.cortes->>'$.largura_json' cortes,
            (
            select JSON_ARRAYAGG(v) from (
            select JSON_OBJECT("id",pa.id,"cod",pa.cod,"des",pa.des,"core",pa.core,"lar",pa.lar,"estado",pb.estado) v
            from producao_bobine pb join producao_artigo pa on pa.id=pb.artigo_id 
            where (pb.bobinagem_id = pbm.id)
            GROUP BY pa.id, pa.cod, pa.des, pa.core, pa.lar, pb.estado
            ) t
            ) artigo
    """
    dql.columns=encloseColumn(cols,False)
    sql = lambda: (
        f"""  
            select 
            {f'{dql.columns}'}
            from producao_bobinagem pbm
            LEFT JOIN audit_currentsettings acs on acs.id=pbm.audit_current_settings_id
            LEFT JOIN producao_perfil pf on pf.id=pbm.perfil_id
            LEFT JOIN lotesnwlinha lnw0 on lnw0.vcr_num=pbm.vcr_num_inf
            LEFT JOIN lotesnwlinha lnw1 on lnw1.vcr_num=pbm.vcr_num_sup
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

def BobinagensHistoryList(request, format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({
    #    **rangeP(f.filterData.get('fdata'), 't_stamp', lambda k, v: f'DATE(t_stamp)'),
    #    **rangeP(f.filterData.get('fdatain'), 'in_t', lambda k, v: f'DATE(in_t)'),
    #    **rangeP(f.filterData.get('fdataout'), 'out_t', lambda k, v: f'DATE(out_t)'),
    #    "diff": {"value": lambda v: '>0' if "fdataout" in v and v.get("fdataout") is not None else None, "field": lambda k, v: f'TIMESTAMPDIFF(second,in_t,out_t)'},
        "id": {"value": lambda v: f"=={v.get('bobinagem_id')}", "field": lambda k, v: f'{k}'},
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
    cols = f"""t.*
    #,pc.name cliente_nome,po1.ofid ofid_original,po2.ofid ofid
    """
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""  
            select
                {c(f'{dql.columns}')}
            FROM (

                select * from audit_producao_bobinagem pbm {f.text}
                union
                select null,null,null,pbm.* from producao_bobinagem pbm {f.text}

            ) t
            #LEFT JOIN producao_carga pcarga ON pcarga.id = t.carga_id
            #LEFT JOIN producao_cliente pc ON pc.id = t.cliente_id
            #LEFT JOIN planeamento_ordemproducao po1 ON po1.id = t.ordem_id_original
            #LEFT JOIN planeamento_ordemproducao po2 ON po2.id = t.ordem_id
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}
        """
    )
    print(f"""  
            select
                {f'{dql.columns}'}
            FROM (

                select * from audit_producao_bobinagem pbm {f.text}
                union
                select null,null,null,pbm.* from producao_bobinagem pbm {f.text}

            ) t
            #LEFT JOIN producao_carga pcarga ON pcarga.id = t.carga_id
            #LEFT JOIN producao_cliente pc ON pc.id = t.cliente_id
            #LEFT JOIN planeamento_ordemproducao po1 ON po1.id = t.ordem_id_original
            #LEFT JOIN planeamento_ordemproducao po2 ON po2.id = t.ordem_id
            {dql.sort} {dql.paging} {dql.limit}
        """)
    print(parameters)
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

def DeleteBobinagem(request, format=None):
    data = request.data.get("parameters")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                args = [data.get("ig_id"),data.get("id")]
                cursor.callproc('delete_bobinagem_from_ig',args)
        return Response({"status": "success", "title": "Bobinagem eliminada com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def NewBobinagem(request, format=None):
    data = request.data.get("parameters")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                if "ig_id" not in data:
                    return Response({"status": "error", "title":"Tem de indicar o Evento de linha!"})
                args = [data.get("ig_id"),data.get("acs_id")]
                print(args)
                cursor.callproc('create_bobinagem_from_ig_v3',args)
                row = cursor.fetchone()
        return Response({"status": "success", "title": "Bobinagem criada com sucesso!","bobinagem":{"id":row[0],"nome":row[1]}})
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



