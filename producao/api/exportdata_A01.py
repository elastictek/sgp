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
from support.database import encloseColumn, Filters, DBSql, TypeDml, fetchall, Check, fetchone
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
mv_ofabrico_list = "mv_ofabrico_listv2"

api_keys = {
    '98866c51710e34795b3888336e6d43b66d31d9a1d2646b92a0aabacb0293b2d6': 'generic'
}

def is_valid_key(api_key):
    if api_key is None:
        return False
    return api_key in api_keys

def get_user_role(api_key):
    return api_keys.get(api_key)



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
                ret[f'{"" if pName is None else pName}{key[i]}_{i}'] = {"key": key[i], "value": v, "field": field}
            else:
                hasNone = True
        if hasNone == False and len(data)==2 and fieldDiff is not None:
            ret[f'{"" if pName is None else pName}{key[0]}_{key[1]}'] = {"key": key, "value": ">=0", "field": fieldDiff}
    else:    
        _data = data
        if isinstance(_data, str):
            _data= _data.split(",")
        _data = [value for value in _data if value]            
        for i, v in enumerate(_data):
            if v is not None:
                if (len(_data))==1:
                    v=Filters.getValue(v,None,"==")
                elif (len(_data))>1 and i==0:
                    v=Filters.getValue(v,None,">=")
                else:
                    v=Filters.getValue(v,None,"<=")
                ret[f'{"" if pName is None else pName}{key}_{i}'] = {"key": key, "value": v, "field": field}
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
def SqlK(request, format=None):
    if "parameters" in request.data and "method" in request.data["parameters"]:
        
        api_key = request.data["parameters"].get('appKey')

        if not api_key or not is_valid_key(api_key):
            return Response({'error': 'Invalid key'}, status=401)
        user_role = get_user_role(api_key)
        
        request.data["parameters"]["source"] = "external"
        method=request.data["parameters"]["method"]
        func = globals()[method]
        response = func(request, format)
        return response
    return Response({})

def ConsumosGranuladoProducao(request, format=None):
    #Get the consumption of grainy mp in an aggregated production
    connection = connections["default"].cursor()
    _filter = request.data['filter'] if "filter" in request.data else {}
    _data = request.data['parameters'] if "parameters" in request.data else {}
    
    #FILTERS ALLOWED
    #nofilters  - current agg_of_id
    #fdata      - agg_of_id's in a range date
    #fprf       - agg_of_id's which the prf_cod belongs 
    #fof        - agg_of_id's which the of_cod belongs
    #forder     - agg_of_id's which the order_cod belongs   
    
    #PARAMETERS
    #bymp       - By raw-material TODO!!!!!

    f = Filters(_filter)
    _parameters = {}
    _filterkey=None
    if "fprf" in _filter and _filter.get("fprf") is not None:
        _filterkey="fprf"
        _parameters["prf_cod"]={"value": lambda v: Filters.getValue(Filters.getLower(v.get('fprf')),None,"==" if _data.get("source")=="external" else None), "field": lambda k, v: f'lower({k})'}
    elif "fof" in _filter and _filter.get("fof") is not None:
        _filterkey="fof"
        _parameters["of_id"]={"value": lambda v: Filters.getValue(Filters.getLower(v.get('fof')),None,"==" if _data.get("source")=="external" else None), "field": lambda k, v: f'lower({k})'}
    elif "forder" in _filter and _filter.get("forder") is not None:
        _filterkey="fof"
        _parameters["order_cod"]={"value": lambda v: Filters.getValue(Filters.getLower(v.get('forder')),None,"==" if _data.get("source")=="external" else None), "field": lambda k, v: f'lower({k})'}
    elif "fdata" in _filter and _filter.get("fdata") is not None:
        _filterkey="fdata"
        _parameters = {**rangeP(_filter.get("fdata"), 'date(`timestamp`)', lambda k, v: f'{k}',None,"data")}
    f.setParameters(_parameters, True)
    f.where()
    f.auto()
    f.value()

    _filter_part = ""
    if _filterkey in ["fprf","fof","forder"]:
        _filter_part = f"select agg_of_id from producao_tempordemfabrico pt {f.text}"
    elif _filterkey in ["fdata"]:
        _filter_part = f"	select distinct ti.agg_of_id from producao_bobinagem tbm join ig_bobinagens_data ti on ti.ig_id = tbm.ig_bobinagem_id {f.text}"
    else:
        _filter_part = f"select pc.agg_of_id from producao_currentsettings pc where `status`=3"

    parameters = {**f.parameters}
    dql = db.dql(request.data, False,False)
    cols = f"""DISTINCT t_stamp_in, t_stamp_out, artigo_cod,artigo_des, n_lote,vcr_num,qty_lote,qty_out,duration_mp_inline,round(sum_cons,2) sum_cons,round(sum(fixed_cons) over (partition by b.vcr_num),2) sum_fixed_cons,in_line"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda : (
        f"""  
            WITH DATE_RANGE AS(
                select
                ibd.agg_of_id base_agg_of_id,
                MIN(ib.inicio_ts) date_inicio,
                MAX(ib.fim_ts) date_fim				
                from ig_bobinagens_data ibd
                join ig_bobinagens ib on ibd.ig_id = ib.id
                where ibd.agg_of_id in ({_filter_part})
                group by ibd.agg_of_id
            ),
            MPS AS(
                SELECT 
                dr.*,
                llout.t_stamp t_stamp_in,IFNULL(lout.t_stamp,IFNULL(llout.t_stamp_out,NOW())) t_stamp_out,
                case when IFNULL(lout.t_stamp,IFNULL(llout.t_stamp_out,null)) is null THEN 1 else 0 end in_line,
                lin.group_id,lin.doser,
                llout.artigo_cod,llout.artigo_des,llout.n_lote,llout.vcr_num,llout.qty_lote,IFNULL(llout.qty_out,0) qty_out
                FROM DATE_RANGE dr
                join lotesdoserslinha lin on lin.type_mov =1 and lin.t_stamp < dr.date_fim
                left join lotesdoserslinha lout on lin.loteslinha_id = lout.loteslinha_id and lout.type_mov=0 and lin.group_id = lout.group_id and lin.doser =lout.doser
                left join lotesgranuladolinha llout on lin.loteslinha_id = llout.id and llout.type_mov=1
                /*ESTE FILTRO NÃO PERMITE QUE SEJA CONTABILIZADAS MATERIAS PRIMAS À MAIS DE 10 DIAS NA CUBA*/
                /*ISTO PERMITE QUE EVENTUAIS MATERIAS PRIMAS SEM SAÍDA CONTINUEM A ENTRAR NOS CONSUMOS*/
                where lin.t_stamp > DATE_SUB(dr.date_fim,INTERVAL 10 DAY) and 
                lin.t_stamp < dr.date_fim and 
                IFNULL(lout.t_stamp,IFNULL(llout.t_stamp_out,NOW()))>dr.date_inicio
            ),
            BOBINAGENS AS(
                SELECT 
                    mps.*, 
                    ib.id ig_id,ib.inicio_ts,ib.fim_ts,
                    pb.nome,pb.`timestamp`,
                    ibd.agg_of_id,ibd.audit_cs_id,
                    ibd.avg_Qnet_PV capacity,
                    TIMESTAMPDIFF(MINUTE, GREATEST(ib.inicio_ts, mps.t_stamp_in), LEAST(ib.fim_ts, mps.t_stamp_out)) AS duration_consumption,
                    TIMESTAMPDIFF(MINUTE,mps.t_stamp_in,mps.t_stamp_out) duration_mp_inline,
                    JSON_OBJECT(
                    'Qnet_PV',ibd.avg_Qnet_PV,
                    'A1_P',ibd.AVG_A1_P,'A2_P',ibd.AVG_A2_P,'A3_P',ibd.AVG_A3_P,'A4_P',ibd.AVG_A4_P,'A5_P',ibd.AVG_A5_P,'A6_P',ibd.AVG_A6_P,
                    'B1_P',ibd.AVG_B1_P,'B2_P',ibd.AVG_B2_P,'B3_P',ibd.AVG_B3_P,'B4_P',ibd.AVG_B4_P,'B5_P',ibd.AVG_B5_P,'B6_P',ibd.AVG_B6_P,
                    'C1_P',ibd.AVG_C1_P,'C2_P',ibd.AVG_C2_P,'C3_P',ibd.AVG_C3_P,'C4_P',ibd.AVG_C4_P,'C5_P',ibd.AVG_C5_P,'C6_P',ibd.AVG_C6_P,
                    'A_PERC_SP',ibd.A_PERC_SP,'B_PERC_SP',ibd.B_PERC_SP,'C_PERC_SP',ibd.C_PERC_SP
                    ) capacities,
                    calculate_consumption(mps.doser,
                    JSON_OBJECT(
                    'Qnet_PV',ibd.avg_Qnet_PV,
                    'A1_P',ibd.AVG_A1_P,'A2_P',ibd.AVG_A2_P,'A3_P',ibd.AVG_A3_P,'A4_P',ibd.AVG_A4_P,'A5_P',ibd.AVG_A5_P,'A6_P',ibd.AVG_A6_P,
                    'B1_P',ibd.AVG_B1_P,'B2_P',ibd.AVG_B2_P,'B3_P',ibd.AVG_B3_P,'B4_P',ibd.AVG_B4_P,'B5_P',ibd.AVG_B5_P,'B6_P',ibd.AVG_B6_P,
                    'C1_P',ibd.AVG_C1_P,'C2_P',ibd.AVG_C2_P,'C3_P',ibd.AVG_C3_P,'C4_P',ibd.AVG_C4_P,'C5_P',ibd.AVG_C5_P,'C6_P',ibd.AVG_C6_P,
                    'A_PERC_SP',ibd.A_PERC_SP,'B_PERC_SP',ibd.B_PERC_SP,'C_PERC_SP',ibd.C_PERC_SP
                    )
                    ,ib.inicio_ts,ib.fim_ts,mps.t_stamp_in,mps.t_stamp_out,null) cons
                    #COUNT(*) over (partition by ibd.agg_of_id) n_bobinagens_of
                from MPS mps
                JOIN ig_bobinagens ib on ib.inicio_ts <=mps.t_stamp_out and ib.fim_ts >=mps.t_stamp_in
                join ig_bobinagens_data ibd on ibd.ig_id =ib.id
                join producao_bobinagem pb on pb.ig_bobinagem_id = ib.id
            )
            select 
            {f'{dql.columns}'}    
            from(
            SELECT 
                t_stamp_in,case when in_line then null else t_stamp_out end t_stamp_out,in_line, artigo_cod,artigo_des,n_lote,vcr_num,qty_lote,qty_out,duration_mp_inline,
                sum(b.cons) over (partition by b.vcr_num) sum_cons,
                CASE WHEN sum(cons) over (partition by b.vcr_num) > (qty_lote-qty_out) or in_line=0 then 
                    (b.cons*(qty_lote-qty_out))/sum(cons) over (partition by b.vcr_num)
                else 
                    b.cons 
                end fixed_cons		
            FROM BOBINAGENS b
            ) b
       """
    )

    try:
        response = db.executeSimpleList(sql, connection, parameters,[])
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def ConsumosGranuladoOF(request, format=None):
    #Get the consumption of grainy mp in an aggregated production
    connection = connections["default"].cursor()
    _filter = request.data['filter'] if "filter" in request.data else {}
    _data = request.data['parameters'] if "parameters" in request.data else {}
    
    #FILTERS ALLOWED
    #nofilters  - current agg_of_id
    #fdata      - agg_of_id's in a range date
    #fprf       - agg_of_id's which the prf_cod belongs 
    #fof        - agg_of_id's which the of_cod belongs
    #forder     - agg_of_id's which the order_cod belongs   
    
    #PARAMETERS
    #bymp       - By raw-material TODO!!!!!

    f = Filters(_filter)
    _parameters = {}
    _filterkey=None
    if "fprf" in _filter and _filter.get("fprf") is not None:
        _filterkey="fprf"
        _parameters["prf_cod"]={"value": lambda v: Filters.getValue(Filters.getLower(v.get('fprf')),None,"==" if _data.get("source")=="external" else None), "field": lambda k, v: f'lower({k})'}
    elif "fof" in _filter and _filter.get("fof") is not None:
        _filterkey="fof"
        _parameters["of_id"]={"value": lambda v: Filters.getValue(Filters.getLower(v.get('fof')),None,"==" if _data.get("source")=="external" else None), "field": lambda k, v: f'lower({k})'}
    elif "forder" in _filter and _filter.get("forder") is not None:
        _filterkey="fof"
        _parameters["order_cod"]={"value": lambda v: Filters.getValue(Filters.getLower(v.get('forder')),None,"==" if _data.get("source")=="external" else None), "field": lambda k, v: f'lower({k})'}
    elif "fdata" in _filter and _filter.get("fdata") is not None:
        _filterkey="fdata"
        _parameters = {**rangeP(_filter.get("fdata"), 'date(`timestamp`)', lambda k, v: f'{k}',None,"data")}
    f.setParameters(_parameters, True)
    f.where()
    f.auto()
    f.value()

    _filter_part = ""
    if _filterkey in ["fprf","fof","forder"]:
        _filter_part = f"select agg_of_id from producao_tempordemfabrico pt {f.text}"
    elif _filterkey in ["fdata"]:
        _filter_part = f"	select distinct ti.agg_of_id from producao_bobinagem tbm join ig_bobinagens_data ti on ti.ig_id = tbm.ig_bobinagem_id {f.text}"
    else:
        _filter_part = f"select pc.agg_of_id from producao_currentsettings pc where `status`=3"

    parameters = {**f.parameters}
    dql = db.dql(request.data, False,False)
    
    sql_temporary_table = lambda : (
        f"""  
            CREATE TEMPORARY table TMP_MPS_CONSUMPTIONS AS
            SELECT * FROM (
            WITH DATE_RANGE AS(
                select
                ibd.agg_of_id base_agg_of_id,
                MIN(ib.inicio_ts) date_inicio,
                MAX(ib.fim_ts) date_fim
                from ig_bobinagens_data ibd
                join ig_bobinagens ib on ib.`type`= 1 and ibd.ig_id = ib.id
                where ibd.agg_of_id in ({_filter_part})
                group by ibd.agg_of_id
            ),
            MPS AS(
                SELECT 
                dr.*,
                llout.t_stamp t_stamp_in,IFNULL(lout.t_stamp,IFNULL(llout.t_stamp_out,NOW())) t_stamp_out,
                case when IFNULL(lout.t_stamp,IFNULL(llout.t_stamp_out,null)) is null THEN 1 else 0 end in_line,
                lin.group_id,lin.doser,
                llout.artigo_cod,llout.artigo_des,llout.n_lote,llout.vcr_num,llout.qty_lote,IFNULL(llout.qty_out,0) qty_out
                FROM DATE_RANGE dr
                join lotesdoserslinha lin on lin.type_mov =1 and lin.t_stamp < dr.date_fim
                left join lotesdoserslinha lout on lin.loteslinha_id = lout.loteslinha_id and lout.type_mov=0 and lin.group_id = lout.group_id and lin.doser =lout.doser
                left join lotesgranuladolinha llout on lin.loteslinha_id = llout.id and llout.type_mov=1
                /*ESTE FILTRO NÃO PERMITE QUE SEJA CONTABILIZADAS MATERIAS PRIMAS À MAIS DE 10 DIAS NA CUBA*/
                /*ISTO PERMITE QUE EVENTUAIS MATERIAS PRIMAS SEM SAÍDA CONTINUEM A ENTRAR NOS CONSUMOS*/
                where lin.t_stamp > DATE_SUB(dr.date_fim,INTERVAL 10 DAY) and 
                lin.t_stamp < dr.date_fim and 
                IFNULL(lout.t_stamp,IFNULL(llout.t_stamp_out,NOW()))>dr.date_inicio
            ),
            BOBINAGENS AS(
                SELECT 
                    mps.*, 
                    ib.id ig_id,ib.inicio_ts,ib.fim_ts,
                    pbm.id bobinagem_id, pbm.nome,pbm.`timestamp`,pf.largura_bobinagem,
                    ibd.agg_of_id,ibd.audit_cs_id,
                    ibd.avg_Qnet_PV capacity,
                    TIMESTAMPDIFF(MINUTE, GREATEST(ib.inicio_ts, mps.t_stamp_in), LEAST(ib.fim_ts, mps.t_stamp_out)) AS duration_consumption,
                    TIMESTAMPDIFF(MINUTE,mps.t_stamp_in,mps.t_stamp_out) duration_mp_inline,
                    calculate_consumption(mps.doser,
                    JSON_OBJECT(
                    'Qnet_PV',ibd.avg_Qnet_PV,
                    'A1_P',ibd.AVG_A1_P,'A2_P',ibd.AVG_A2_P,'A3_P',ibd.AVG_A3_P,'A4_P',ibd.AVG_A4_P,'A5_P',ibd.AVG_A5_P,'A6_P',ibd.AVG_A6_P,
                    'B1_P',ibd.AVG_B1_P,'B2_P',ibd.AVG_B2_P,'B3_P',ibd.AVG_B3_P,'B4_P',ibd.AVG_B4_P,'B5_P',ibd.AVG_B5_P,'B6_P',ibd.AVG_B6_P,
                    'C1_P',ibd.AVG_C1_P,'C2_P',ibd.AVG_C2_P,'C3_P',ibd.AVG_C3_P,'C4_P',ibd.AVG_C4_P,'C5_P',ibd.AVG_C5_P,'C6_P',ibd.AVG_C6_P,
                    'A_PERC_SP',ibd.A_PERC_SP,'B_PERC_SP',ibd.B_PERC_SP,'C_PERC_SP',ibd.C_PERC_SP
                    )
                    ,ib.inicio_ts,ib.fim_ts,mps.t_stamp_in,mps.t_stamp_out,null) cons,
                    pb.lar,pb.ordem_id,po.ofid,
                    chk.id id_chk,
                    IFNULL(chk.qty_lote,(mps.qty_lote-mps.qty_out)) qty_lote_net
                    #COUNT(*) over (partition by ibd.agg_of_id) n_bobinagens_of
                from MPS mps
                JOIN ig_bobinagens ib on ib.inicio_ts <=mps.t_stamp_out and ib.fim_ts >=mps.t_stamp_in
                
                LEFT JOIN (SELECT t.id,t.qty_lote,t.vcr,
                    DATE_ADD(lag(t.t_stamp) over (partition by t.vcr order by t_stamp), INTERVAL 1 SECOND) t_stamp_previous,
                    CASE WHEN lead(t.t_stamp) over (partition by t.vcr order by t_stamp) is null then NOW() else t_stamp end t_stamp
                    from lotesgranulado_checkpoint t
                ) chk on mps.vcr_num = chk.vcr and ib.fim_ts BETWEEN IFNULL(chk.t_stamp_previous,ib.fim_ts) AND chk.t_stamp
                
                join ig_bobinagens_data ibd on ibd.ig_id =ib.id
                join producao_bobinagem pbm on pbm.ig_bobinagem_id = ib.id
                join producao_bobine pb on pb.bobinagem_id=pbm.id
                join planeamento_ordemproducao po on po.id=pb.ordem_id
                JOIN producao_perfil pf on pbm.perfil_id = pf.id
            )
            SELECT * FROM BOBINAGENS
            ) T
        """)
    sql = lambda : (
        f"""  
            select 		
                distinct c.ofid,c.base_agg_of_id,c.date_inicio,c.date_fim,c.t_stamp_in,c.t_stamp_out,c.in_line,c.artigo_cod,c.artigo_des,c.n_lote,c.vcr_num,
                c.agg_of_id
                ,c.duration_mp_inline,
                c.qty_lote,c.qty_out,
                round(c.sum_cons_ordem,2) sum_cons_ordem,
                round(sum(c.cons_bobine) over (partition by c.vcr_num),2) sum_cons,
                round(sum(c.fixed_ordem_cons) over (partition by c.ordem_id,c.vcr_num),2) sum_fixed_ordem_cons,
                round(sum(c.fixed_ordem_cons) over (partition by c.vcr_num),2) sum_fixed_cons,
                round(sum(c.fixed_ordem_cons_chk) over (partition by c.ordem_id,c.vcr_num),2) sum_fixed_ordem_cons_chk,
                round(sum(c.fixed_ordem_cons_chk) over (partition by c.vcr_num),2) sum_fixed_cons_chk
            from(
                select bm.*,
                    CASE WHEN bm.sum_cons_bobine > bm.qty_lote or bm.in_line=0 then 
                        ((bm.cons_bobine)*bm.qty_lote)/bm.sum_cons_bobine
                    else 
                        (bm.lar*bm.cons)/bm.largura_bobinagem 
                    end fixed_ordem_cons,
                    CASE WHEN sum_cons_bobine_check > bm.qty_lote_net or bm.in_line=0 then 
                        (bm.cons_bobine*bm.qty_lote_net)/sum_cons_bobine_check
                    else 
                        bm.cons_bobine
                    end fixed_ordem_cons_chk
                from (
                    SELECT
                        bm.lar,bm.cons,bm.base_agg_of_id,bm.date_inicio,bm.date_fim,bm.t_stamp_in,case when bm.in_line then null else bm.t_stamp_out end t_stamp_out,
                        bm.inicio_ts,bm.fim_ts,bm.in_line,bm.artigo_cod, bm.artigo_des,bm.n_lote,bm.vcr_num,
                        bm.qty_out,bm.ig_id,bm.bobinagem_id,bm.nome,bm.agg_of_id,bm.audit_cs_id
                        ,bm.capacity,bm.duration_consumption,bm.duration_mp_inline,
                        bm.ordem_id,bm.ofid,
                        bm.largura_bobinagem,
                        bm.qty_lote,bm.qty_lote_net,
                        ((bm.lar*bm.cons)/bm.largura_bobinagem) cons_bobine,
                        sum(bm.cons) over (partition by bm.vcr_num) sum_cons,
                        sum((bm.lar*bm.cons)/bm.largura_bobinagem) over (partition by bm.ordem_id,bm.vcr_num) sum_cons_ordem,
                        sum((bm.lar*bm.cons)/bm.largura_bobinagem) over (partition by bm.vcr_num) sum_cons_bobine,
                        sum((bm.lar*bm.cons)/bm.largura_bobinagem) over (partition by bm.vcr_num,bm.id_chk) sum_cons_bobine_check
                    FROM TMP_MPS_CONSUMPTIONS bm
                ) bm
            ) c
        """)
    try:
        db.execute("DROP TEMPORARY table IF EXISTS TMP_MPS_CONSUMPTIONS", connection, parameters,[])
        db.execute(sql_temporary_table, connection, parameters,[])
        response = db.executeSimpleList(sql, connection, parameters,[])
        db.execute("DROP TEMPORARY table IF EXISTS TMP_MPS_CONSUMPTIONS", connection, parameters,[])
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def EstadoProducao(request, format=None):
    cursor = connections["default"].cursor()
    # filter = request.data['filter']
    # f = Filters(filter)
    # f.setParameters({}, True)
    # f.where(False,"and")
    # f.auto()
    # f.value()

    # dql = db.dql(request.data, False)
    # cols = f"""*"""
    # sql = lambda: (f"""
    #     select
    #     {cols}
    #     FROM mv_paletes sgppl
    #     LEFT JOIN mv_ofabrico_list mol on mol.ofabrico=sgppl.ofid
    #     WHERE sgppl.ordem_id_original <> sgppl.ordem_id {f.text}
    #     {dql.sort}
    # """)
    calls = [
        {"key":"params","st":"CALL list_estadoproducao_params(%s)","array":False},
        {"key":"defeitos","st":"CALL list_estadoproducao_defeitos(%s,%s)","array":True},
        {"key":"bobinagens","st":"CALL list_estadoproducao_bobinagens(%s,%s)","array":False},
        {"key":"rows","st":"CALL list_estadoproducao_summary(%s,%s)","array":True},
        {"key":"bobines","st":"CALL list_estadoproducao_bobines(%s,%s)","array":True},
        {"key":"bobines_nopalete","st":"CALL list_estadoproducao_nopalete(%s,%s)","array":True},
        {"key":"paletes","st":"CALL list_estadoproducao_paletes(%s,%s,%s)","array":True},
        {"key":"bobines_retrabalhadas","st":"CALL list_estadoproducao_retrabalhadas(%s,%s)","array":True}
        #{"key":"current","st":"CALL list_estadoproducao_current(%s)","array":False}
    ]
    results={}
    print(request.data.get("filter"))
    request.data["filter"]["agg_of_id"] = 533
    try:
        for item in calls:
            if item.get("key") in ["params","current"]:
                cursor.execute(item.get("st"), [request.data.get("filter").get("agg_of_id")])
            elif item.get("key") in ["rows"]:
                cursor.execute(item.get("st"), [request.data.get("filter").get("agg_of_id"),None])
            elif item.get("key") in ["paletes"]:
                cursor.execute(item.get("st"), [request.data.get("filter").get("agg_of_id"),None,0])
            else:
                cursor.execute(item.get("st"), [request.data.get("filter").get("agg_of_id"),None])
            results[item.get("key")] = fetchall(cursor) if item.get("array") else fetchone(cursor)
        response = {"status": "success", "rows": results}
    except Error as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)


def PaletesList(request, format=None):
    connection = connections["default"].cursor()
    _filter = request.data['filter'] if "filter" in request.data else {}
    f = Filters(_filter)
    print(_filter)
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
        "cliente_nome": {"value": lambda v: v.get('fcliente').lower() if v.get('fcliente') is not None else None, "field": lambda k, v: f'lower(sgppl.{k})'},
        "ofid": {"value": lambda v: v.get('fof').upper() if v.get('fof') is not None else None, "field": lambda k, v: f'po2.{k}'},
        "prf_cod": {"value": lambda v: v.get('fprf').lower() if v.get('fprf') is not None else None, "field": lambda k, v: f'lower(pt.{k})'},
        "order_cod": {"value": lambda v: v.get('forder').lower() if v.get('forder') is not None else None, "field": lambda k, v: f'lower(pt.{k})'}
    }, True)
    f.where(False,"and")
    f.auto()
    f.value()

    fartigo = filterMulti(_filter, {
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
    festados = filterMultiSelectJson(_filter,'festados','estado','j')

    fbobinemulti = filterMulti(_filter, {
        'flotenw': {"keys": ['lotenwinf', 'lotenwsup'], "table": 'mb.'},
        'ftiponw': {"keys": ['tiponwinf', 'tiponwsup'], "table": 'mb.'},
        'fbobine': {"keys": ['nome'], "table": 'mb.'},
    }, False, "and" if f.hasFilters else "and" ,False)
    # fbobine = Filters(_filter)
    # fbobine.setParameters({"bobinenome": {"value": lambda v: v.get('fbobine'), "field": lambda k, v: f'nome'}}, True)
    # fbobine.where()
    # fbobine.auto()
    # fbobine.value()
    fbobinemulti["text"] = f"""and exists (select 1 from producao_bobine mb where mb.palete_id=sgppl.id and mb.recycle=0 and mb.comp_actual>0 {fbobinemulti["text"].lstrip("where (").rstrip(")")}))""" if fbobinemulti["hasFilters"] else ""


    fbobinedestinos = Filters(_filter)
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

    fartigompmulti = filterMulti(_filter, {
        'fartigo_mp': {"keys": ['matprima_cod', 'matprima_des'], "table": 'mcg.'},
        'flote_mp': {"keys": ['n_lote'], "table": 'mcg.'},
    }, False, "and" if f.hasFilters else "and" ,False)

    fartigompmulti["text"] = f""" and exists (select 1 from producao_bobine mb join consumos_granulado mcg on mcg.ig_id = mb.ig_id where mb.palete_id=sgppl.id and mb.recycle=0 and mb.comp_actual>0 {fartigompmulti["text"].lstrip("where (").rstrip(")")}) limit 1) """ if fartigompmulti["hasFilters"] else ""

    parameters = {**f.parameters, **fartigo['parameters'], **festados.parameters, **fbobinemulti["parameters"], **fartigompmulti["parameters"],**fbobinedestinos.parameters}
    dql = db.dql(request.data, False,False)
    cols = f"""sgppl.id, sgppl.`timestamp`, sgppl.data_pal, sgppl.nome, sgppl.num, sgppl.estado, sgppl.area,
            sgppl.comp_total,sgppl.num_bobines,sgppl.diametro,sgppl.peso_bruto,sgppl.peso_palete, sgppl.peso_liquido,
            sgppl.cliente_id, sgppl.retrabalhada,sgppl.stock, sgppl.carga_id, sgppl.num_palete_carga, sgppl.destino,
            sgppl.ordem_id, sgppl.ordem_original, sgppl.ordem_original_stock, sgppl.num_palete_ordem,
            sgppl.draft_ordem_id,sgppl.ordem_id_original, sgppl.area_real, sgppl.comp_real,
            sgppl.diam_avg, sgppl.diam_max, sgppl.diam_min,sgppl.nbobines_real, sgppl.disabled,
            sgppl.artigo, sgppl.destinos, sgppl.nbobines_emendas,sgppl.destinos_has_obs,sgppl.nbobines_sem_destino,
            sgppl.nok_estados, sgppl.nok, sgppl.lvl, pcarga.carga, po1.ofid AS ofid_original, po2.ofid, po1.op AS op_original,
            po2.op, pc.cod AS cliente_cod, pc.name AS cliente_nome, pc.limsup AS cliente_limsup, pc.liminf AS cliente_liminf,
            pc.diam_ref AS cliente_diamref,pt.prf_cod prf,pt.order_cod iorder"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda : (
        f"""  
            SELECT {f'{dql.columns}'}
            FROM producao_palete sgppl
            LEFT JOIN producao_carga pcarga ON pcarga.id = sgppl.carga_id
            LEFT JOIN producao_cliente pc ON pc.id = sgppl.cliente_id
            LEFT JOIN planeamento_ordemproducao po1 ON po1.id = sgppl.ordem_id_original
            LEFT JOIN planeamento_ordemproducao po2 ON po2.id = sgppl.ordem_id
            LEFT JOIN producao_tempordemfabrico pt ON pt.id = po2.draft_ordem_id
            WHERE sgppl.nbobines_real>0 and sgppl.disabled=0
            {f.text} {fartigo["text"]} {festados.text} {fbobinemulti["text"]} {fartigompmulti["text"]} {fbobinedestinos.text}
            {dql.sort} {dql.limit}
        """
    )
    print(
        f"""  
            SELECT {f'{dql.columns}'}
            FROM producao_palete sgppl
            LEFT JOIN producao_carga pcarga ON pcarga.id = sgppl.carga_id
            LEFT JOIN producao_cliente pc ON pc.id = sgppl.cliente_id
            LEFT JOIN planeamento_ordemproducao po1 ON po1.id = sgppl.ordem_id_original
            LEFT JOIN planeamento_ordemproducao po2 ON po2.id = sgppl.ordem_id
            LEFT JOIN producao_tempordemfabrico pt ON pt.id = po2.draft_ordem_id
            WHERE sgppl.nbobines_real>0 and sgppl.disabled=0
            {f.text} {fartigo["text"]} {festados.text} {fbobinemulti["text"]} {fartigompmulti["text"]} {fbobinedestinos.text}
            {dql.sort} {dql.limit}
        """
    )
    print(parameters)
    try:
        response = db.executeSimpleList(sql, connection, parameters,[])
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

