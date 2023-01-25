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
from producao.api.exports import export

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
    f.where(False,"and")
    f.auto()
    f.value()

    f2 = filterMulti(request.data['filter'], {
        'fartigo': {"keys": ['artigo_cod', 'artigo_des'], "table": 'lgl.'}
    }, False, "and" if f.hasFilters else "and" ,False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)
    cols = f"""distinct pb.id, pb.nome,pb.estado,pb.posicao_palete, lgl.artigo_cod ,lgl.artigo_des, lgl.n_lote ,lgl.t_stamp ,lgl.t_stamp_out ,lgl.t_stamp_closed """
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""  
            SELECT {c(f'{dql.columns}')}
            FROM producao_bobine pb 
            JOIN sistema.lotesdosers_ig ldi on pb.ig_id=ldi.ig_id and ldi.arranque>0
            JOIN lotesdoserslinha ldl ON ldl.id=ldi.ldl_id
            JOIN lotesgranuladolinha lgl ON lgl.id=ldl.loteslinha_id and lgl.type_mov=1
            where pb.comp_actual>0 and pb.recycle=0 {f.text} {f2["text"]}
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


def BobinesOriginaisList(request,format=None):
    connection = connections["default"].cursor()
    f = Filters(request.data['filter'])
    f.setParameters({
        "palete_id": {"value": lambda v: v.get('palete_id'), "field": lambda k, v: f'ppb.{k}'},
        "nome": {"value": lambda v: v.get('fbobine'), "field": lambda k, v: f'ppb.{k}'}
    }, True)
    f.where(False,"and")
    f.auto()
    f.value()

    f2 = filterMulti(request.data['filter'], {
        #'fartigo': {"keys": ['artigo_cod', 'artigo_des'], "table": 'lgl.'}
    }, False, "and" if f.hasFilters else "where" ,False)
    parameters = {**f.parameters}
 
    dql = db.dql(request.data, False)
    cols = f"""
            row_number() over() rowid,
            root,root_estado,emenda,emenda_lvl1,emenda_lvl2,emenda_lvl3,emenda_lvl4,
            bobine bobine0,comp0,largura0,plt.nome palete0, tb1.estado estado0,
            original_lvl1, comp1 comp1_original, (comp1 - metros) comp1_atual, metros metros_cons,largura1,estado1,plt1.nome palete1,
            original_lvl2, comp2 comp2_original, (comp2 - metros_lvl1) comp2_atual, metros_lvl1 metros_cons_lvl1,largura2,estado2,plt2.nome palete2,
            original_lvl3, comp3 comp3_original, (comp3 - metros_lvl2) comp3_atual, metros_lvl2 metros_cons_lvl2,largura3,estado3,plt3.nome palete3,
            original_lvl4, comp4 comp4_original, (comp4 - metros_lvl3) comp4_atual, metros_lvl3 metros_cons_lvl3,largura4,estado4,plt4.nome palete4,
            original_lvl5, comp5 comp5_original, (comp5 - metros_lvl4) comp5_atual, metros_lvl4 metros_cons_lvl4,largura5,estado5,plt5.nome palete5,
            b1,b2,b3,b4,b5,
            plt.id palete_id0, plt1.id palete_id1, plt2.id palete_id2, plt3.id palete_id3, plt4.id palete_id4, plt5.id palete_id5,
            #nextl1,nextl2,nextl3,nextl4,nextl5,
            #N1,N2,N3,N4,N5,
            nretrabalhos
    """
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
        f"""  
            select 
            
            {c(f'{dql.columns}')}
                        
            FROM (
            select
            palete_id,bobine, original_lvl1, original_lvl2, original_lvl3, original_lvl4, original_lvl5,
            IFNULL(original_lvl5, IFNULL(original_lvl4, IFNULL(original_lvl3, IFNULL(original_lvl2, original_lvl1)))) root,
            IFNULL(estado5, IFNULL(estado4, IFNULL(estado3, IFNULL(estado2, estado1)))) root_estado

            ,case when (original_lvl5 is not null) THEN 5
            ELSE (case when (original_lvl4 is not null) THEN 4
            ELSE (case when (original_lvl3 is not null) THEN 3
            ELSE (case when (original_lvl2 is not null) THEN 2
            ELSE (case when (original_lvl1 is not null) THEN 1
            ELSE 0 END) END) END) END) END nretrabalhos,

            (select SUM(metros) from producao_emenda where bobine_id=b5 and bobinagem_id=bm4) metros_lvl4,
            (select SUM(metros) from producao_emenda where bobine_id=b4 and bobinagem_id=bm3) metros_lvl3,
            (select SUM(metros) from producao_emenda where bobine_id=b3 and bobinagem_id=bm2) metros_lvl2,
            (select SUM(metros) from producao_emenda where bobine_id=b2 and bobinagem_id=bm1) metros_lvl1,
            (select SUM(metros) from producao_emenda where bobine_id=b1 and bobinagem_id=bm0) metros,

            (select JSON_ARRAYAGG(JSON_OBJECT(original_lvl5,metros,'e',emenda)) from producao_emenda where bobine_id=b5 and bobinagem_id=bm4) emenda_lvl4,
            (select JSON_ARRAYAGG(JSON_OBJECT(original_lvl4,metros,'e',emenda)) from producao_emenda where bobine_id=b4 and bobinagem_id=bm3) emenda_lvl3,
            (select JSON_ARRAYAGG(JSON_OBJECT(original_lvl3,metros,'e',emenda)) from producao_emenda where bobine_id=b3 and bobinagem_id=bm2) emenda_lvl2,
            (select JSON_ARRAYAGG(JSON_OBJECT(original_lvl2,metros,'e',emenda)) from producao_emenda where bobine_id=b2 and bobinagem_id=bm1) emenda_lvl1,
            (select JSON_ARRAYAGG(JSON_OBJECT(original_lvl1,metros,'e',emenda)) from producao_emenda where bobine_id=b1 and bobinagem_id=bm0) emenda
            ,comp0,comp1,comp2,comp3,comp4,comp5
            ,b1,b2,b3,b4,b5
            ,largura0,largura1,largura2,largura3,largura4,largura5
            ,palete_id1,palete_id2,palete_id3,palete_id4,palete_id5,
            estado,estado1,estado2,estado3,estado4,estado5
            from (
            select distinct pb0.palete_id,pb0.nome bobine, pb.nome original_lvl1, pb2.nome original_lvl2, pb3.nome original_lvl3, pb4.nome original_lvl4, pb5.nome original_lvl5 ,  

            pb0.bobinagem_id bm0,pb0.id b0, case when pb0.comp=0 then pbm0.comp else pb0.comp end comp0,
            pb.bobinagem_id bm1,pb.id b1, case when pb.comp=0 then pbm.comp else pb.comp end comp1,
            pb2.bobinagem_id bm2,pb2.id b2, case when pb2.comp=0 then pbm2.comp else pb2.comp end comp2,
            pb3.bobinagem_id bm3,pb3.id b3, case when pb3.comp=0 then pbm3.comp else pb3.comp end comp3,
            pb4.bobinagem_id bm4,pb4.id b4, case when pb4.comp=0 then pbm4.comp else pb4.comp end comp4,
            pb5.bobinagem_id bm5,pb5.id b5, case when pb5.comp=0 then pbm5.comp else pb5.comp end comp5

            ,l0.largura largura0,l.largura largura1,l2.largura largura2, l3.largura largura3,l4.largura largura4,l5.largura largura5,

            pb.palete_id palete_id1,pb2.palete_id palete_id2,pb3.palete_id palete_id3,pb4.palete_id palete_id4,pb5.palete_id palete_id5,
			pb0.estado, pb.estado estado1,pb2.estado estado2,pb3.estado estado3,pb4.estado estado4,pb5.estado estado5

            FROM producao_bobine pb0
            JOIN producao_bobinagem pbm0 on pb0.bobinagem_id = pbm0.id
            JOIN producao_largura l0 on l0.id = pb0.largura_id

            /*NÍVEL 1*/
            join producao_emenda pem on pem.bobinagem_id = pb0.bobinagem_id
            left join producao_bobine pb on pem.bobine_id = pb.id
            left join producao_bobinagem pbm on pb.bobinagem_id = pbm.id
            left join producao_largura l on l.id = pb.largura_id
            /**/

            /*NÍVEL 2*/
            left join producao_emenda pem2 on pem2.bobinagem_id = pb.bobinagem_id     

            left join producao_bobine pb2 on pem2.bobine_id = pb2.id
            left join producao_bobinagem pbm2 on pb2.bobinagem_id = pbm2.id
            left join producao_largura l2 on l2.id = pb2.largura_id
            /**/

            /*NÍVEL 3*/
            left join producao_emenda pem3 on pem3.bobinagem_id = pb2.bobinagem_id    

            left join producao_bobine pb3 on pem3.bobine_id = pb3.id
            left join producao_bobinagem pbm3 on pb3.bobinagem_id = pbm3.id
            left join producao_largura l3 on l3.id = pb3.largura_id
            /**/

            /*NÍVEL 4*/
            left join producao_emenda pem4 on pem4.bobinagem_id = pb3.bobinagem_id    

            left join producao_bobine pb4 on pem4.bobine_id = pb4.id
            left join producao_bobinagem pbm4 on pb4.bobinagem_id = pbm4.id
            left join producao_largura l4 on l4.id = pb4.largura_id
            /**/

            /*NÍVEL 5*/
            left join producao_emenda pem5 on pem5.bobinagem_id = pb4.bobinagem_id    

            left join producao_bobine pb5 on pem5.bobine_id = pb5.id
            left join producao_bobinagem pbm5 on pb5.bobinagem_id = pbm5.id
            left join producao_largura l5 on l5.id = pb5.largura_id
            /**/
             WHERE (pb0.nome in (
             
                select ppb.nome from producao_bobine ppb where ppb.recycle=0 and comp_actual>0 {f.text} 

             
             ) )

            ) tb0 LIMIT 5000) tb1
            LEFT JOIN producao_palete plt on tb1.palete_id=plt.id
            LEFT JOIN producao_palete plt1 on tb1.palete_id1=plt1.id
            LEFT JOIN producao_palete plt2 on tb1.palete_id2=plt2.id
            LEFT JOIN producao_palete plt3 on tb1.palete_id3=plt3.id
            LEFT JOIN producao_palete plt4 on tb1.palete_id4=plt4.id
            LEFT JOIN producao_palete plt5 on tb1.palete_id5=plt5.id
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


