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
from support.myUtils import  ifNull,isDate,string_lists, int_lists

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
    '98866c51710e34795b3888336e6d43b66d31d9a1d2646b92a0aabacb0293b2d6': 'generic',
    '2175edd0e0409686ddfe997fe902befbcdb541c3187bf8c8bc72d7c328e11633': 'tecnico'
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

def ProducaoEstadoBobines(request, format=None):
    connection = connections["default"].cursor()
    _filter = request.data['filter'] if "filter" in request.data else {}
    _data = request.data['parameters'] if "parameters" in request.data else {}
    #FILTERS ALLOWED
    #nofilters  - current day rabge
    #fdata_inicio - date
    #fdata_fim - date
    #ftolerancia - tolerancia em horas
    
    #PARAMETERS
    #detailed
    
    if "detailed" not in _data or _data.get("detailed") is None:
        _data["detailed"]=False
    
    if "ftolerancia" not in _filter or _filter.get("ftolerancia") is None:
        _filter["ftolerancia"]=2
    if "fdata_inicio" not in _filter or _filter.get("fdata_inicio") is None or not isDate(_filter.get("fdata_inicio")):
        _filter["fdata_inicio"]=datetime.now().strftime("%Y-%m-%d")
    if "fdata_fim" not in _filter or _filter.get("fdata_fim") is None or not isDate(_filter.get("fdata_fim")):
        _filter["fdata_fim"]= _filter["fdata_inicio"]

    f = Filters(_filter)   
    f.setParameters({}, False)
    f.where()
    f.add(f':fdata_inicio', True)
    f.add(f':fdata_fim', True)
    f.add(f':ftolerancia', True)
    f.value()
  
    parameters = {**f.parameters}
    dql = db.dql(request.data, False,False)
    #%(fdata_inicio)s and %(fdata_fim)s
    
    sql_resumed = f"""
        SELECT 
        ld.`data`,
        ld.ofid,
        sum(ld.area_original) AREA_TOTAL,
        sum(ld.AREA_DM) AREA_DM,sum(ld.AREA_BA) AREA_BA,sum(ld.AREA_G) AREA_G,sum(ld.AREA_HOLD) AREA_HOLD,sum(ld.AREA_IND) AREA_IND,sum(ld.AREA_LAB) AREA_LAB,sum(ld.AREA_R) AREA_R,
        sum(ld.area_atual) AREA_ATUAL_TOTAL,
        sum(ld.AREA_ATUAL_DM) AREA_ATUAL_DM,sum(ld.AREA_ATUAL_BA) AREA_ATUAL_BA,sum(ld.AREA_ATUAL_G) AREA_ATUAL_G,sum(ld.AREA_ATUAL_HOLD) AREA_ATUAL_HOLD,sum(ld.AREA_ATUAL_IND) AREA_ATUAL_IND,sum(ld.AREA_ATUAL_LAB) AREA_ATUAL_LAB,sum(ld.AREA_ATUAL_R) AREA_ATUAL_R,
        
        SUM(CASE WHEN ld.recycle_atual=1 THEN 1 ELSE 0 END) COUNT_ATUAL_TOTAL_recycle,
        SUM(CASE WHEN ld.recycle_atual=1 THEN ld.area_atual ELSE 0 END) AREA_ATUAL_TOTAL_recycle,
        
        count(*) COUNT_TOTAL,
        sum(CASE WHEN ld.to_estado='DM' THEN 1 ELSE 0 END ) COUNT_DM,
        sum(CASE WHEN ld.to_estado='BA' THEN 1 ELSE 0 END) COUNT_BA,
        sum(CASE WHEN ld.to_estado='G' THEN 1 ELSE 0 END) COUNT_G,
        sum(CASE WHEN ld.to_estado='HOLD' THEN 1 ELSE 0 END) COUNT_HOLD,
        sum(CASE WHEN ld.to_estado='IND' THEN 1 ELSE 0 END) COUNT_IND,
        sum(CASE WHEN ld.to_estado='LAB' THEN 1 ELSE 0 END) COUNT_LAB,
        sum(CASE WHEN ld.to_estado='R' THEN 1 ELSE 0 END) COUNT_R,
            
        SUM(CASE WHEN ld.ndefeitos > 0 then ld.area_original else 0 end) AREA_TOTAL_defeitos,
        SUM(CASE WHEN ld.troca_nw = 1 then ld.area_original else 0 end) AREA_troca_nw,
        SUM(CASE WHEN ld.conica = 1 then ld.conica else 0 end) AREA_conica,
        SUM(CASE WHEN ld.descentrada = 1 then ld.area_original else 0 end) AREA_descentrada,
        SUM(CASE WHEN ld.presa = 1 then ld.area_original else 0 end) AREA_presa,
        SUM(CASE WHEN ld.diam_insuf = 1 then ld.area_original else 0 end) AREA_diam_insuf,
        SUM(CASE WHEN ld.furos = 1 then ld.area_original else 0 end) AREA_furos,
        SUM(CASE WHEN ld.outros = 1 then ld.area_original else 0 end) AREA_outros,
        SUM(CASE WHEN ld.buracos = 1 then ld.area_original else 0 end) AREA_buracos,
        SUM(CASE WHEN ld.nok = 1 then ld.area_original else 0 end) AREA_nok,
        SUM(CASE WHEN ld.carro_atras = 1 then ld.area_original else 0 end) AREA_carro_atras,
        SUM(CASE WHEN ld.falha_corte = 1 then ld.area_original else 0 end) AREA_falha_corte,
        SUM(CASE WHEN ld.falha_filme = 1 then ld.area_original else 0 end) AREA_falha_filme,
        SUM(CASE WHEN ld.falha_mp = 1 then ld.area_original else 0 end) AREA_falha_mp,
        SUM(CASE WHEN ld.lacou = 1 then ld.area_original else 0 end) AREA_lacou,
        SUM(CASE WHEN ld.nao_colou = 1 then ld.area_original else 0 end) AREA_nao_colou,
        SUM(CASE WHEN ld.sujidade = 1 then ld.area_original else 0 end) AREA_sujidade,
        SUM(CASE WHEN ld.sobretiragem = 1 then ld.area_original else 0 end) AREA_sobretiragem,
        SUM(CASE WHEN ld.gramagem = 1 then ld.area_original else 0 end) AREA_gramagem,
        SUM(CASE WHEN ld.rugas = 1 then ld.area_original else 0 end) AREA_rugas,
        SUM(CASE WHEN ld.troca_rapida = 1 then ld.area_original else 0 end) AREA_troca_rapida,
        SUM(CASE WHEN ld.prop = 1 then ld.area_original else 0 end) AREA_prop,
        
        SUM(CASE WHEN ld.conica = 1 then ld.conica/ld.ndefeitos else 0 end) AREAP_conica,
        SUM(CASE WHEN ld.descentrada = 1 then ld.area_original/ld.ndefeitos else 0 end) AREAP_descentrada,
        SUM(CASE WHEN ld.presa = 1 then ld.area_original/ld.ndefeitos else 0 end) AREAP_presa,
        SUM(CASE WHEN ld.diam_insuf = 1 then ld.area_original/ld.ndefeitos else 0 end) AREAP_diam_insuf,
        SUM(CASE WHEN ld.furos = 1 then ld.area_original/ld.ndefeitos else 0 end) AREAP_furos,
        SUM(CASE WHEN ld.outros = 1 then ld.area_original/ld.ndefeitos else 0 end) AREAP_outros,
        SUM(CASE WHEN ld.buracos = 1 then ld.area_original/ld.ndefeitos else 0 end) AREAP_buracos,
        SUM(CASE WHEN ld.nok = 1 then ld.area_original/ld.ndefeitos else 0 end) AREAP_nok,
        SUM(CASE WHEN ld.carro_atras = 1 then ld.area_original/ld.ndefeitos else 0 end) AREAP_carro_atras,
        SUM(CASE WHEN ld.falha_corte = 1 then ld.area_original/ld.ndefeitos else 0 end) AREAP_falha_corte,
        SUM(CASE WHEN ld.falha_filme = 1 then ld.area_original/ld.ndefeitos else 0 end) AREAP_falha_filme,
        SUM(CASE WHEN ld.falha_mp = 1 then ld.area_original/ld.ndefeitos else 0 end) AREAP_falha_mp,
        SUM(CASE WHEN ld.lacou = 1 then ld.area_original/ld.ndefeitos else 0 end) AREAP_lacou,
        SUM(CASE WHEN ld.nao_colou = 1 then ld.area_original/ld.ndefeitos else 0 end) AREAP_nao_colou,
        SUM(CASE WHEN ld.sujidade = 1 then ld.area_original/ld.ndefeitos else 0 end) AREAP_sujidade,
        SUM(CASE WHEN ld.sobretiragem = 1 then ld.area_original/ld.ndefeitos else 0 end) AREAP_sobretiragem,
        SUM(CASE WHEN ld.gramagem = 1 then ld.area_original/ld.ndefeitos else 0 end) AREAP_gramagem,
        SUM(CASE WHEN ld.rugas = 1 then ld.area_original/ld.ndefeitos else 0 end) AREAP_rugas,
        SUM(CASE WHEN ld.troca_rapida = 1 then ld.area_original/ld.ndefeitos else 0 end) AREAP_troca_rapida,
        SUM(CASE WHEN ld.prop = 1 then ld.area_original/ld.ndefeitos else 0 end) AREAP_prop,
        
        SUM(ld.ndefeitos) COUNT_TOTAL_defeitos,	SUM(ld.troca_nw) COUNT_troca_nw, SUM(ld.conica) COUNT_conica, SUM(ld.descentrada) COUNT_descentrada,
        SUM(ld.presa) COUNT_presa, SUM(ld.diam_insuf) COUNT_diam_insuf,	SUM(ld.furos) COUNT_furos, SUM(ld.outros) COUNT_outros,	SUM(ld.buracos) COUNT_buracos,
        SUM(ld.nok) COUNT_nok, SUM(ld.carro_atras) COUNT_carro_atras, SUM(ld.falha_corte) COUNT_falha_corte, SUM(ld.falha_filme) COUNT_falha_filme,
        SUM(ld.falha_mp) COUNT_falha_mp, SUM(ld.lacou) COUNT_lacou,	SUM(ld.nao_colou) COUNT_nao_colou, SUM(ld.sujidade) COUNT_sujidade,
        SUM(ld.sobretiragem) COUNT_sobretiragem, SUM(ld.gramagem) COUNT_gramagem, SUM(ld.rugas) COUNT_rugas, SUM(ld.troca_rapida) COUNT_troca_rapida, SUM(ld.prop) COUNT_prop,

        
        ld.cliente_nome,
        ld.item_cod,
        ld.artigo_des,
        ld.prf_cod,
        ld.order_cod
    FROM LIMIT_DATE ld
    group by ld.`data`,
        ld.ofid,
        ld.cliente_nome,
        ld.item_cod,
        ld.artigo_des,
        ld.prf_cod,
        ld.order_cod
    """
    
    sql_detailed = f"""
    SELECT * FROM LIMIT_DATE
    """
    
    sql_final = f"""
        WITH BASE AS (
            SELECT t.*,
                case when conica=1 then 1 else 0 end +	case when descentrada=1 then 1 else 0 end +	case when presa=1 then 1 else 0 end + case when diam_insuf=1 then 1 else 0 end + case when furos=1 then 1 else 0 end +
                case when outros=1 then 1 else 0 end + case when buracos=1 then 1 else 0 end + case when nok=1 then 1 else 0 end +	case when carro_atras=1 then 1 else 0 end +	case when falha_corte=1 then 1 else 0 end +
                case when falha_filme=1 then 1 else 0 end + case when falha_mp=1 then 1 else 0 end + case when lacou=1 then 1 else 0 end + case when nao_colou=1 then 1 else 0 end + case when sujidade=1 then 1 else 0 end +
                case when sobretiragem=1 then 1 else 0 end + case when gramagem=1 then 1 else 0 end + case when rugas=1 then 1 else 0 end + case when troca_rapida=1 then 1 else 0 end + 
                case when prop=1 then 1 else 0 end ndefeitos
            FROM (
                SELECT 
                t.rowid,
                t.id,t.ordem_id,t.ig_id,t.nome,t.`timestamp`,t.`data`,t.end_production,t.event_timestamp,t.estado_atual,t.recycle_atual,
                t.from_estado,IFNULL(apb.estado,t.estado_atual) to_estado,
                t.area_atual,
                IFNULL(round(apb.comp_actual*(apb.lar/1000),1),t.area) area,
                t.area_original,
                IFNULL(apb.troca_nw,t.troca_nw) troca_nw, IFNULL(apb.con,t.con) conica, IFNULL(apb.descen,t.descen) descentrada, IFNULL(apb.presa,t.presa) presa,
                IFNULL(apb.diam_insuf,t.diam_insuf) diam_insuf, IFNULL(apb.furos,t.furos) furos, IFNULL(apb.outros,t.outros) outros, IFNULL(apb.buraco,t.buraco) buracos, 
                IFNULL(apb.nok, t.nok) nok, IFNULL(apb.car,t.car) carro_atras, IFNULL(apb.fc,t.fc) falha_corte, IFNULL(apb.ff,t.ff) falha_filme, IFNULL(apb.fmp,t.fmp) falha_mp,
                IFNULL(apb.lac,t.lac) lacou, IFNULL(apb.ncore,t.ncore) nao_colou, IFNULL(apb.suj,t.suj) sujidade, IFNULL(apb.sbrt,t.sbrt) sobretiragem, 
                IFNULL(apb.esp, t.esp) gramagem, IFNULL(apb.rugas,t.rugas) rugas, IFNULL(apb.tr,t.tr) troca_rapida, IFNULL(apb.prop,t.prop) prop,IFNULL(apb.mpalete,t.mpalete) mpalete,
                IFNULL(apb.rasgo,t.rasgo) rasgo, 
                IFNULL(apb.rugas_pos, t.rugas_pos) rugas_pos, IFNULL(apb.buracos_pos,t.buracos_pos) buracos_pos, 
                IFNULL(apb.fc_pos,t.fc_pos) fc_pos, IFNULL(apb.ff_pos,t.ff_pos) ff_pos, IFNULL(apb.furos_pos, t.furos_pos) furos_pos, IFNULL(apb.prop_obs, t.prop_obs) prop_obs,
                IFNULL(apb.obs, t.obs) obs
                from (
                    select
                        ROW_NUMBER() over (order by apb.audit_timestamp) rowid,
                        pb.id,pb.ig_id,pb.nome,pb.ordem_id,
                        pb.`timestamp`,pbm.`data`,
                        IFNULL(pc.end_date,now()) end_production,
                        IFNULL(apb.audit_timestamp,pb.`timestamp`) event_timestamp,
                        pb.estado estado_atual,
                        pb.recycle recycle_atual,
                        round(pb.comp_actual*(pb.lar/1000),1) area_atual,
                        round(apb.comp_actual*(apb.lar/1000),1) area,
                        round(pbm.comp*(pb.lar/1000),1) area_original,
                        pb.troca_nw, pb.con, pb.descen, pb.presa,pb.diam_insuf, pb.furos, pb.outros, pb.buraco,pb.nok, pb.car, pb.fc, pb.ff,pb.fmp,
                        pb.lac, pb.ncore, pb.suj,pb.sbrt, pb.esp, pb.rugas, pb.tr, pb.prop , pb.mpalete, pb.rasgo,  pb.rugas_pos,pb.buracos_pos,pb.fc_pos,pb.ff_pos,
                        pb.furos_pos,pb.prop_obs,pb.obs,
                        apb.estado from_estado,
                        LEAD(apb.audit_id) over (partition by apb.id ORDER BY apb.audit_timestamp asc) next_audit_id
                    from producao_bobine pb
                    join producao_bobinagem pbm on pbm.id=pb.bobinagem_id
                    left join producao_currentsettings pc on pc.agg_of_id=pb.agg_of_id
                    left join audit_producao_bobine apb on apb.id=pb.id
                    where pb.ig_id is not null
                    and pb.`timestamp` between TIMESTAMP(%(fdata_inicio)s, '00:00:00') and TIMESTAMP(%(fdata_fim)s, '23:59:59')
                ) t
                left join audit_producao_bobine apb on apb.audit_id=t.next_audit_id
            ) t
        ),
        LIMIT_DATE AS(
            SELECT 
                po.ofid, t.nome,t.`timestamp`,t.`data`,t.end_production,t.event_timestamp,
                t.estado_atual,t.from_estado,t.to_estado,
                t.recycle_atual,
                t.area_atual,t.area,t.area_original,
                CASE WHEN t.to_estado='DM' THEN t.area_original ELSE 0 END AREA_DM,
                CASE WHEN t.to_estado='BA' THEN t.area_original ELSE 0 END AREA_BA,
                CASE WHEN t.to_estado='G' THEN t.area_original ELSE 0 END AREA_G,
                CASE WHEN t.to_estado='HOLD' THEN t.area_original ELSE 0 END AREA_HOLD,
                CASE WHEN t.to_estado='IND' THEN t.area_original ELSE 0 END AREA_IND,
                CASE WHEN t.to_estado='LAB' THEN t.area_original ELSE 0 END AREA_LAB,
                CASE WHEN t.to_estado='R' THEN t.area_original ELSE 0 END AREA_R,
                CASE WHEN t.to_estado='DM' THEN t.area_atual ELSE 0 END AREA_ATUAL_DM,
                CASE WHEN t.to_estado='BA' THEN t.area_atual ELSE 0 END AREA_ATUAL_BA,
                CASE WHEN t.to_estado='G' THEN t.area_atual ELSE 0 END AREA_ATUAL_G,
                CASE WHEN t.to_estado='HOLD' THEN t.area_atual ELSE 0 END AREA_ATUAL_HOLD,
                CASE WHEN t.to_estado='IND' THEN t.area_atual ELSE 0 END AREA_ATUAL_IND,
                CASE WHEN t.to_estado='LAB' THEN t.area_atual ELSE 0 END AREA_ATUAL_LAB,
                CASE WHEN t.to_estado='R' THEN t.area_atual ELSE 0 END AREA_ATUAL_R,
                t.troca_nw, t.conica, t.descentrada, t.presa, t.diam_insuf,	t.furos, t.outros, t.buracos,t.nok,t.carro_atras, t.falha_corte, 
                t.falha_filme,t.falha_mp,t.lacou, t.nao_colou, t.sujidade,t.sobretiragem, t.gramagem, t.rugas, t.troca_rapida, t.prop,t.rugas_pos,t.buracos_pos, t.fc_pos,
                t.ff_pos,t.furos_pos,t.prop_obs, t.obs,t.ndefeitos,
                pt.cliente_nome,pt.item_cod,pa.des artigo_des,pt.prf_cod,pt.order_cod
            FROM (
                select 
                    b.*,
                    min(b.rowid) over (partition by b.id) first_rowid,
                    max(b.rowid) over (partition by b.id) last_rowid
                from BASE b
                where
                b.event_timestamp<=DATE_ADD(b.end_production, INTERVAL %(ftolerancia)s HOUR)
            ) t 
            join planeamento_ordemproducao po on po.id=t.ordem_id
            join producao_tempordemfabrico pt on pt.id=po.draft_ordem_id
            join producao_artigo pa on pt.item_cod=pa.cod
            where t.last_rowid = t.rowid
        )
        {sql_resumed if not _data.get("detailed") else ""}
        {sql_detailed if _data.get("detailed") else ""}
        """
    
    sql = lambda : (
        f"""
        {sql_final}
        """
    )


    try:
        response = db.executeSimpleList(sql, connection, parameters,[])
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def ProducaoEstadosMovimentos(request, format=None):
    connection = connections["default"].cursor()
    _filter = request.data['filter'] if "filter" in request.data else {}
    _data = request.data['parameters'] if "parameters" in request.data else {}
    #FILTERS ALLOWED
    #nofilters  - current day rabge
    #fdata_inicio - date
    #fdata_fim - date
    #ftolerancia - tolerancia em horas
    
    #PARAMETERS
    #detailed
    
    if "detailed" not in _data or _data.get("detailed") is None:
        _data["detailed"]=False
    
    if "ftolerancia" not in _filter or _filter.get("ftolerancia") is None:
        _filter["ftolerancia"]=2
    if "fdata_inicio" not in _filter or _filter.get("fdata_inicio") is None or not isDate(_filter.get("fdata_inicio")):
        _filter["fdata_inicio"]=datetime.now().strftime("%Y-%m-%d")
    if "fdata_fim" not in _filter or _filter.get("fdata_fim") is None or not isDate(_filter.get("fdata_fim")):
        _filter["fdata_fim"]= _filter["fdata_inicio"]

    f = Filters(_filter)   
    f.setParameters({}, False)
    f.where()
    f.add(f':fdata_inicio', True)
    f.add(f':fdata_fim', True)
    f.add(f':ftolerancia', True)
    f.value()
  
    parameters = {**f.parameters}
    dql = db.dql(request.data, False,False)
    #%(fdata_inicio)s and %(fdata_fim)s
    resumed_01 = f"""select 
            t.`data`,
            t.ofid,
            #min_estado_diff
            
            IFNULL(sum(case when t.first_estado_to is not null THEN 1 END),0) first_to_count,
            IFNULL(sum(case when t.first_estado_to is not null THEN t.first_estado_area END),0) first_to_area,
            IFNULL(sum(case when t.first_estado_to='DM' THEN 1 END),0) first_to_DM_count,
            IFNULL(sum(case when t.first_estado_to='DM' THEN t.first_estado_area END),0) first_to_DM_area,
            IFNULL(sum(case when t.first_estado_to='BA' THEN 1 END),0) first_to_BA_count,
            IFNULL(sum(case when t.first_estado_to='BA' THEN t.first_estado_area END),0) first_to_BA_area,
            IFNULL(sum(case when t.first_estado_to='G' THEN 1 END),0) first_to_G_count,
            IFNULL(sum(case when t.first_estado_to='G' THEN t.first_estado_area END),0) first_to_G_area,
            IFNULL(sum(case when t.first_estado_to='HOLD' THEN 1 END),0) first_to_HOLD_count,
            IFNULL(sum(case when t.first_estado_to='HOLD' THEN t.first_estado_area END),0) first_to_HOLD_area,
            IFNULL(sum(case when t.first_estado_to='IND' THEN 1 END),0) first_to_IND_count,
            IFNULL(sum(case when t.first_estado_to='IND' THEN t.first_estado_area END),0) first_to_IND_area,
            IFNULL(sum(case when t.first_estado_to='LAB' THEN 1 END),0) first_to_LAB_count,
            IFNULL(sum(case when t.first_estado_to='LAB' THEN t.first_estado_area END),0) first_to_LAB_area,
            IFNULL(sum(case when t.first_estado_to='R' THEN 1 END),0) first_to_R_count,
            IFNULL(sum(case when t.first_estado_to='R' THEN t.first_estado_area END),0) first_to_R_area,
            IFNULL(sum(case when t.last_estado_to is not null THEN 1 END),0) last_to_count,
            IFNULL(sum(case when t.last_estado_to is not null THEN t.last_estado_area END),0) last_to_area,
            IFNULL(sum(case when t.last_estado_to='DM' THEN 1 END),0) last_to_DM_count,
            IFNULL(sum(case when t.last_estado_to='DM' THEN t.last_estado_area END),0) last_to_DM_area,
            IFNULL(sum(case when t.last_estado_to='BA' THEN 1 END),0) last_to_BA_count,
            IFNULL(sum(case when t.last_estado_to='BA' THEN t.last_estado_area END),0) last_to_BA_area,
            IFNULL(sum(case when t.last_estado_to='G' THEN 1 END),0) last_to_G_count,
            IFNULL(sum(case when t.last_estado_to='G' THEN t.last_estado_area END),0) last_to_G_area,
            IFNULL(sum(case when t.last_estado_to='HOLD' THEN 1 END),0) last_to_HOLD_count,
            IFNULL(sum(case when t.last_estado_to='HOLD' THEN t.last_estado_area END),0) last_to_HOLD_area,
            IFNULL(sum(case when t.last_estado_to='IND' THEN 1 END),0) last_to_IND_count,
            IFNULL(sum(case when t.last_estado_to='BIND' THEN t.last_estado_area END),0) last_to_IND_area,
            IFNULL(sum(case when t.last_estado_to='LAB' THEN 1 END),0) last_to_LAB_count,
            IFNULL(sum(case when t.last_estado_to='LAB' THEN t.last_estado_area END),0) last_to_LAB_area,
            IFNULL(sum(case when t.last_estado_to='R' THEN 1 END),0) last_to_R_count,
            IFNULL(sum(case when t.last_estado_to='R' THEN t.last_estado_area END),0) last_to_R_area,
            

            IFNULL(sum(case when t.first_from_hold='DM' THEN 1 END),0) first_from_hold_to_DM_count,
            IFNULL(sum(case when t.first_from_hold='DM' THEN t.first_from_hold_area END),0) first_from_hold_to_DM_area,
            IFNULL(sum(case when t.first_from_hold='BA' THEN 1 END),0) first_from_hold_to_BA_count,
            IFNULL(sum(case when t.first_from_hold='BA' THEN t.first_from_hold_area END),0) first_from_hold_to_BA_area,
            IFNULL(sum(case when t.first_from_hold='G' THEN 1 END),0) first_from_hold_to_G_count,
            IFNULL(sum(case when t.first_from_hold='G' THEN t.first_from_hold_area END),0) first_from_hold_to_G_area,
            IFNULL(sum(case when t.first_from_hold='IND' THEN 1 END),0) first_from_hold_to_IND_count,
            IFNULL(sum(case when t.first_from_hold='IND' THEN t.first_from_hold_area END),0) first_from_hold_to_IND_area,
            IFNULL(sum(case when t.first_from_hold='LAB' THEN 1 END),0) first_from_hold_to_LAB_count,
            IFNULL(sum(case when t.first_from_hold='LAB' THEN t.first_from_hold_area END),0) first_from_hold_to_LAB_area,
            IFNULL(sum(case when t.first_from_hold='R' THEN 1 END),0) first_from_hold_to_R_count,
            IFNULL(sum(case when t.first_from_hold='R' THEN t.first_from_hold_area END),0) first_from_hold_to_R_area,
            IFNULL(sum(case when t.last_from_hold='DM' THEN 1 END),0) last_from_hold_to_DM_count,
            IFNULL(sum(case when t.last_from_hold='DM' THEN t.last_from_hold_area END),0) last_from_hold_to_DM_area,
            IFNULL(sum(case when t.last_from_hold='BA' THEN 1 END),0) last_from_hold_to_BA_count,
            IFNULL(sum(case when t.last_from_hold='BA' THEN t.last_from_hold_area END),0) last_from_hold_to_BA_area,
            IFNULL(sum(case when t.last_from_hold='G' THEN 1 END),0) last_from_hold_to_G_count,
            IFNULL(sum(case when t.last_from_hold='G' THEN t.last_from_hold_area END),0) last_from_hold_to_G_area,
            IFNULL(sum(case when t.last_from_hold='IND' THEN 1 END),0) last_from_hold_to_IND_count,
            IFNULL(sum(case when t.last_from_hold='IND' THEN t.last_from_hold_area END),0) last_from_hold_to_IND_area,
            IFNULL(sum(case when t.last_from_hold='LAB' THEN 1 END),0) last_from_hold_to_LAB_count,
            IFNULL(sum(case when t.last_from_hold='LAB' THEN t.last_from_hold_area END),0) last_from_hold_to_LAB_area,
            IFNULL(sum(case when t.last_from_hold='R' THEN 1 END),0) last_from_hold_to_R_count,
            IFNULL(sum(case when t.last_from_hold='R' THEN t.last_from_hold_area END),0) last_from_hold_to_R_area,
            
            IFNULL(sum(case when t.first_to_hold='DM' THEN 1 END),0) first_from_DM_to_HOLD_count,
            IFNULL(sum(case when t.first_to_hold='DM' THEN t.first_to_hold_area END),0) first_from_DM_to_HOLD_area,
            IFNULL(sum(case when t.first_to_hold='BA' THEN 1 END),0) first_from_BA_to_HOLD_count,
            IFNULL(sum(case when t.first_to_hold='BA' THEN t.first_to_hold_area END),0) first_from_BA_to_HOLD_area,
            IFNULL(sum(case when t.first_to_hold='G' THEN 1 END),0) first_from_G_to_HOLD_count,
            IFNULL(sum(case when t.first_to_hold='G' THEN t.first_to_hold_area END),0) first_from_G_to_HOLD_area,
            IFNULL(sum(case when t.first_to_hold='IND' THEN 1 END),0) first_from_IND_to_HOLD_count,
            IFNULL(sum(case when t.first_to_hold='IND' THEN t.first_to_hold_area END),0) first_from_IND_to_HOLD_area,
            IFNULL(sum(case when t.first_to_hold='LAB' THEN 1 END),0) first_from_LAB_to_HOLD_count,
            IFNULL(sum(case when t.first_to_hold='LAB' THEN t.first_to_hold_area END),0) first_from_LAB_to_HOLD_area,
            IFNULL(sum(case when t.first_to_hold='R' THEN 1 END),0) first_from_R_to_HOLD_count,
            IFNULL(sum(case when t.first_to_hold='R' THEN t.first_to_hold_area END),0) first_from_R_to_HOLD_area,
            IFNULL(sum(case when t.last_to_hold='DM' THEN 1 END),0) last_from_DM_to_HOLD_count,
            IFNULL(sum(case when t.last_to_hold='DM' THEN t.last_to_hold_area END),0) last_from_DM_to_HOLD_area,
            IFNULL(sum(case when t.last_to_hold='BA' THEN 1 END),0) last_from_BA_to_HOLD_count,
            IFNULL(sum(case when t.last_to_hold='BA' THEN t.last_to_hold_area END),0) last_from_BA_to_HOLD_area,
            IFNULL(sum(case when t.last_to_hold='G' THEN 1 END),0) last_from_G_to_HOLD_count,
            IFNULL(sum(case when t.last_to_hold='G' THEN t.last_to_hold_area END),0) last_from_G_to_HOLD_area,
            IFNULL(sum(case when t.last_to_hold='IND' THEN 1 END),0) last_from_IND_to_HOLD_count,
            IFNULL(sum(case when t.last_to_hold='IND' THEN t.last_to_hold_area END),0) last_from_IND_to_HOLD_area,
            IFNULL(sum(case when t.last_to_hold='LAB' THEN 1 END),0) last_from_LAB_to_HOLD_count,
            IFNULL(sum(case when t.last_to_hold='LAB' THEN t.last_to_hold_area END),0) last_from_LAB_to_HOLD_area,
            IFNULL(sum(case when t.last_to_hold='R' THEN 1 END),0) last_from_R_to_HOLD_count,
            IFNULL(sum(case when t.last_to_hold='R' THEN t.last_to_hold_area END),0) last_from_R_to_HOLD_area

            /*IFNULL(sum(case when t.last_troca_nw=1 THEN 1 END),0) "last_troca_nw_count",
            IFNULL(sum(case when t.last_troca_nw=1 THEN t.last_estado_area END),0) "last_troca_nw_area",
            IFNULL(sum(case when t.last_conica=1 THEN 1 END),0) "last_conica_count",
            IFNULL(sum(case when t.last_conica=1 THEN t.last_estado_area END),0) "last_conica_area",
            IFNULL(sum(case when t.`Descentrada`=1 THEN 1 END),0) "Descentrada Count",
            IFNULL(sum(case when t.`Descentrada`=1 THEN t.last_estado_area END),0) "Descentrada Area",
            IFNULL(sum(case when t.`Presa`=1 THEN 1 END),0) "Presa Count",
            IFNULL(sum(case when t.`Presa`=1 THEN t.last_estado_area END),0) "Presa Area",
            IFNULL(sum(case when t.`Diâmetro Insuficiente`=1 THEN 1 END),0) "Diâmetro Insuficiente Count",
            IFNULL(sum(case when t.`Diâmetro Insuficiente`=1 THEN t.last_estado_area END),0) "Diâmetro Insuficiente Area",
            IFNULL(sum(case when t.`Furos`=1 THEN 1 END),0) "Furos Count",
            IFNULL(sum(case when t.`Furos`=1 THEN t.last_estado_area END),0) "Furos Area",
            IFNULL(sum(case when t.`Outros`=1 THEN 1 END),0) "Outros Count",
            IFNULL(sum(case when t.`Outros`=1 THEN t.last_estado_area END),0) "Outros Area",
            IFNULL(sum(case when t.`Buracos`=1 THEN 1 END),0) "Buracos Count",
            IFNULL(sum(case when t.`Buracos`=1 THEN t.last_estado_area END),0) "Buracos Area",
            IFNULL(sum(case when t.`Largura NOK`=1 THEN 1 END),0) "Largura NOK Count",
            IFNULL(sum(case when t.`Largura NOK`=1 THEN t.last_estado_area END),0) "Largura NOK Area",
            IFNULL(sum(case when t.`Carro Atrás`=1 THEN 1 END),0) "Carro Atrás Count",
            IFNULL(sum(case when t.`Carro Atrás`=1 THEN t.last_estado_area END),0) "Carro Atrás Area",
            IFNULL(sum(case when t.`Falha Corte`=1 THEN 1 END),0) "Falha Corte Count",
            IFNULL(sum(case when t.`Falha Corte`=1 THEN t.last_estado_area END),0) "Falha Corte Area",
            IFNULL(sum(case when t.`Falha Filme`=1 THEN 1 END),0) "Falha Filme Count",
            IFNULL(sum(case when t.`Falha Filme`=1 THEN t.last_estado_area END),0) "Falha Filme Area",
            IFNULL(sum(case when t.`Falha Matéria Prima`=1 THEN 1 END),0) "Falha Matéria Prima Count",
            IFNULL(sum(case when t.`Falha Matéria Prima`=1 THEN t.last_estado_area END),0) "Falha Matéria Prima Area",
            IFNULL(sum(case when t.`Laçou`=1 THEN 1 END),0) "Laçou Count",
            IFNULL(sum(case when t.`Laçou`=1 THEN t.last_estado_area END),0) "Laçou Area",
            IFNULL(sum(case when t.`Não Colou`=1 THEN 1 END),0) "Não Colou Count",
            IFNULL(sum(case when t.`Não Colou`=1 THEN t.last_estado_area END),0) "Não Colou Area",
            IFNULL(sum(case when t.`Sujidade`=1 THEN 1 END),0) "Sujidade Count",
            IFNULL(sum(case when t.`Sujidade`=1 THEN t.last_estado_area END),0) "Sujidade Area",
            IFNULL(sum(case when t.`Sobretiragem`=1 THEN 1 END),0) "Sobretiragem Count",
            IFNULL(sum(case when t.`Sobretiragem`=1 THEN t.last_estado_area END),0) "Sobretiragem Area",
            IFNULL(sum(case when t.`Gramagem`=1 THEN 1 END),0) "Gramagem Count",
            IFNULL(sum(case when t.`Gramagem`=1 THEN t.last_estado_area END),0) "Gramagem Area",
            IFNULL(sum(case when t.`Troca Rápida`=1 THEN 1 END),0) "Troca Rápida Count",
            IFNULL(sum(case when t.`Troca Rápida`=1 THEN t.last_estado_area END),0) "Troca Rápida Area",
            IFNULL(sum(case when t.`Propriedades`=1 THEN 1 END),0) "Propriedades Count",
            IFNULL(sum(case when t.`Propriedades`=1 THEN t.last_estado_area END),0) "Propriedades Area"*/
            
        from (""" if not _data.get("detailed") else ""
    
    resumed_02 = f""") t
    group by t.`data`,t.ofid""" if not _data.get("detailed") else ""
    
    
    
    sql = lambda : (
        f"""  
        WITH BASE AS(
            select 
                t.*,
                (sum(case when t.estado='HOLD' or (t.next_estado is null and t.estado_atual='HOLD') then 
                TIMESTAMPDIFF(SECOND, IFNULL(t.previous_audit_timestamp,t.audit_timestamp), case when t.next_estado is null then now() else t.audit_timestamp end) else 
                0 end) over (partition by t.id))/3600.0 duration_in_hold 
            from (
                select 
                    t.id,t.audit_id,t.estado_atual,t.`timestamp`,t.audit_timestamp,max_audit_id,
                        
                    t.troca_nw, t.con, t.descen, t.presa,t.diam_insuf, t.furos, t.outros, t.buraco,t.nok, t.car, t.fc, t.ff,t.fmp, 
                    t.lac, t.ncore, t.suj,t.sbrt, t.esp, t.rugas, t.tr, t.prop , t.mpalete, t.rasgo, t.rugas_pos,t.buracos_pos,t.fc_pos,t.ff_pos,
                    t.furos_pos,t.prop_obs,t.obs,
                    t.next_troca_nw,t.next_con, t.next_descen, t.next_presa, t.next_diam_insuf, 
                    t.next_furos, t.next_outros, t.next_buraco,t.next_nok,t.next_car, t.next_fc, 
                    t.next_ff,t.next_fmp,t.next_lac, t.next_ncore, t.next_suj,t.next_sbrt, t.next_esp, 
                    t.next_rugas, t.next_tr, t.next_prop, t.next_mpalete, t.next_rasgo, t.next_rugas_pos,t.next_buracos_pos,t.next_fc_pos,
                    t.next_ff_pos,t.next_furos_pos,t.next_prop_obs,t.next_obs,

                    #LEAD(t.audit_id) over (partition by t.id ORDER BY t.audit_timestamp asc) next_audit_id,
                    LAG(t.audit_timestamp) over (partition by t.id ORDER BY t.audit_timestamp asc) previous_audit_timestamp,
                    #t.prev_audit_timestamp,
                    t.estado,t.area, t.next_estado
                    /*FIRST STATE CHANGE*/
                    ,min(case when not t.estado<=>t.next_estado THEN t.audit_id END) over (partition by t.id) first_audit_id
                    #,min(case when not t.estado<=>t.next_estado THEN t.audit_timestamp END) over (partition by t.id) first_estado_ts
                    /*LAST STATE CHANGE*/
                    ,max(case when t.estado<>t.next_estado THEN t.audit_id END) over (partition by t.id) last_audit_id
                    #,max(case when t.estado<>t.next_estado THEN t.audit_timestamp END) over (partition by t.id) last_estado_ts
                    /*FIRST STATE CHANGE FROM HOLD TO...*/
                    ,min(case when not t.estado<=>t.next_estado AND t.estado = 'HOLD' then t.audit_id end) over (partition by t.id) min_from_hold_id
                    #,min(case when not t.estado<=>t.next_estado AND t.estado = 'HOLD' then t.audit_timestamp end) over (partition by t.id) min_from_hold_ts
                    /*LAST STATE CHANGE FROM HOLD TO...*/
                    ,max(case when t.estado<>t.next_estado and t.estado = 'HOLD' then t.audit_id end) over (partition by t.id) max_from_hold_id
                    #,max(case when t.estado<>t.next_estado and t.estado = 'HOLD' then t.audit_timestamp end) over (partition by t.id) max_from_hold_ts
                    /*FIRST STATE CHANGE TO HOLD...*/
                    ,min(case when not t.estado<=>t.next_estado AND t.next_estado = 'HOLD' then t.audit_id end) over (partition by t.id) min_to_hold_id
                    #,min(case when not t.estado<=>t.next_estado AND t.next_estado = 'HOLD' then t.audit_timestamp end) over (partition by t.id) min_to_hold_ts
                    /*LAST STATE CHANGE TO HOLD...*/
                    ,min(case when t.estado<>t.next_estado AND t.next_estado = 'HOLD' then t.audit_id end) over (partition by t.id) max_to_hold_id
                    #,min(case when t.estado<>t.next_estado AND t.next_estado = 'HOLD' then t.audit_timestamp end) over (partition by t.id) max_to_hold_ts
                    /*OTHER STATS*/
                    ,sum(case when (t.estado<>t.next_estado) or (t.estado<>t.estado_atual) then 1 else 0 end) over (partition by t.id) n_estado_changes
                    ,sum(case when ((t.estado<>t.next_estado) or (t.estado<>t.estado_atual)) and (ifnull(t.next_estado,t.estado_atual)='HOLD') then 1 else 0 end) over (partition by t.id) n_to_hold_changes
                    ,sum(case when ((t.estado<>t.next_estado) or (t.estado<>t.estado_atual)) and (t.estado='HOLD') then 1 else 0 end) over (partition by t.id) n_from_hold_changes        
                from (
                    select t.*,
                        #case when apb.estado is null then t.estado_atual else apb.estado end next_estado,
                        apb.estado next_estado,
                        apb.troca_nw next_troca_nw,	apb.con next_con, apb.descen next_descen, apb.presa next_presa, apb.diam_insuf next_diam_insuf, 
                        apb.furos next_furos, apb.outros next_outros, apb.buraco next_buraco,apb.nok next_nok,apb.car next_car, apb.fc next_fc, 
                        apb.ff next_ff,apb.fmp next_fmp,apb.lac next_lac, apb.ncore next_ncore, apb.suj next_suj,apb.sbrt next_sbrt, apb.esp next_esp, 
                        apb.rugas next_rugas, apb.tr next_tr, apb.prop next_prop,apb.mpalete next_mpalete, apb.rasgo next_rasgo,apb.rugas_pos next_rugas_pos,apb.buracos_pos next_buracos_pos,	apb.fc_pos next_fc_pos,
                        apb.ff_pos next_ff_pos,apb.furos_pos next_furos_pos,apb.prop_obs next_prop_obs,	apb.obs next_obs
                    from (
                        select 
                            pb.id,pb.ig_id,pb.nome,pb.`timestamp`,
                            apb.audit_id audit_id,
                            pb.estado estado_atual,
                            apb.estado,
                            apb.area,
                            apb.audit_timestamp,
            
                            apb.troca_nw, apb.con, apb.descen, apb.presa,apb.diam_insuf, apb.furos, apb.outros, apb.buraco,apb.nok, apb.car, apb.fc, apb.ff,apb.fmp, 
                            apb.lac, apb.ncore, apb.suj,apb.sbrt, apb.esp, apb.rugas, apb.tr, apb.prop , apb.mpalete, apb.rasgo, apb.rugas_pos,apb.buracos_pos,apb.fc_pos,apb.ff_pos,
                            apb.furos_pos,apb.prop_obs,apb.obs,
                            IFNULL(pc.end_date,pb.`timestamp`) end_timestamp,
                            max(apb.audit_id) over (partition by apb.id) max_audit_id,
                            #LAG(apb.audit_timestamp) over (partition by apb.id ORDER BY apb.audit_timestamp asc) prev_audit_timestamp,
                            #LEAD(apb.estado) over (partition by apb.id ORDER BY apb.audit_timestamp asc) next_estado,
                            LEAD(apb.audit_id) over (partition by apb.id ORDER BY apb.audit_timestamp asc) next_audit_id
                        from producao_bobine pb
                        left join producao_currentsettings pc on pc.agg_of_id=pb.agg_of_id
                        left join audit_producao_bobine apb on apb.id=pb.id
                        where pb.ig_id is not null
                        and date(pb.`timestamp`) between %(fdata_inicio)s and %(fdata_fim)s
                        #and apb.audit_timestamp <= '2023-12-13 23:59:59'
                        #and pb.nome = '20231213-33-11'
                        #and pb.audit_id 
                    ) t
                    left join audit_producao_bobine apb on apb.audit_id=t.next_audit_id
                ) t
                where /*t.audit_timestamp<='2023-12-08 08:37:08' and*/ t.audit_timestamp<=DATE_ADD(t.end_timestamp /*@_date_fim*//*t.`timestamp`*/, INTERVAL %(ftolerancia)s HOUR) and not t.estado <=> t.next_estado
        )t
        )
        {resumed_01}
        SELECT 
            distinct
            t.id
            ,apb.nome,apb.area,apb.comp_actual,apb.lar,apb.core,apb.ordem_id,apb.palete_id,apb.recycle,po.ofid
            
            ,case when a1.id is not null then ifnull(a1.next_troca_nw,0) else ifnull(t.troca_nw,0) end last_troca_nw
            ,case when a1.id is not null then ifnull(a1.next_con,0) else ifnull(t.con,0) end last_conica
            ,case when a1.id is not null then ifnull(a1.next_descen,0) else ifnull(t.descen,0) end last_descen
            ,case when a1.id is not null then ifnull(a1.next_presa,0) else ifnull(t.presa,0) end last_presa
            ,case when a1.id is not null then ifnull(a1.next_diam_insuf,0) else ifnull(t.diam_insuf,0) end last_diam_insuf
            ,case when a1.id is not null then ifnull(a1.next_furos,0) else ifnull(t.furos,0) end last_furos
            ,case when a1.id is not null then ifnull(a1.next_outros,0) else ifnull(t.outros,0) end last_outros
            ,case when a1.id is not null then ifnull(a1.next_buraco,0) else ifnull(t.buraco,0) end last_buracos
            ,case when a1.id is not null then ifnull(a1.next_nok,0) else ifnull(t.nok,0) end last_nok
            ,case when a1.id is not null then ifnull(a1.next_car,0) else ifnull(t.car,0) end last_car
            ,case when a1.id is not null then ifnull(a1.next_fc,0) else ifnull(t.fc,0) end last_falha_corte
            ,case when a1.id is not null then ifnull(a1.next_ff,0) else ifnull(t.ff,0) end last_falha_filme
            ,case when a1.id is not null then ifnull(a1.next_fmp,0) else ifnull(t.fmp,0) end last_falha_mprima
            ,case when a1.id is not null then ifnull(a1.next_lac,0) else ifnull(t.lac,0) end last_lacou
            ,case when a1.id is not null then ifnull(a1.next_ncore,0) else ifnull(t.ncore,0) end last_nao_colou
            ,case when a1.id is not null then ifnull(a1.next_suj,0) else ifnull(t.suj,0) end last_sujidade
            ,case when a1.id is not null then ifnull(a1.next_sbrt,0) else ifnull(t.sbrt,0) end last_sobretiragem
            ,case when a1.id is not null then ifnull(a1.next_esp,0) else ifnull(t.esp,0) end last_gramagem
            ,case when a1.id is not null then ifnull(a1.next_rugas,0) else ifnull(t.rugas,0) end last_rugas
            ,case when a1.id is not null then ifnull(a1.next_tr,0) else ifnull(t.tr,0) end last_troca_rapida
            ,case when a1.id is not null then ifnull(a1.next_prop,0) else ifnull(t.prop,0) end last_propriedades
            ,case when a1.id is not null then ifnull(a1.next_mpalete,0) else ifnull(t.mpalete,0) end last_mpalete
            ,case when a1.id is not null then ifnull(a1.next_rasgo,0) else ifnull(t.rasgo,0) end last_rasgo
            
            ,case when a1.id is not null then ifnull(a1.next_troca_nw,0) else ifnull(t.troca_nw,0) end +
            case when a1.id is not null then ifnull(a1.next_con,0) else ifnull(t.con,0) end +
            case when a1.id is not null then ifnull(a1.next_descen,0) else ifnull(t.descen,0) end +
            case when a1.id is not null then ifnull(a1.next_presa,0) else ifnull(t.presa,0) end +
            case when a1.id is not null then ifnull(a1.next_diam_insuf,0) else ifnull(t.diam_insuf,0) end +
            case when a1.id is not null then ifnull(a1.next_furos,0) else ifnull(t.furos,0) end +
            case when a1.id is not null then ifnull(a1.next_outros,0) else ifnull(t.outros,0) end +
            case when a1.id is not null then ifnull(a1.next_buraco,0) else ifnull(t.buraco,0) end +
            case when a1.id is not null then ifnull(a1.next_nok,0) else ifnull(t.nok,0) end +
            case when a1.id is not null then ifnull(a1.next_car,0) else ifnull(t.car,0) end +
            case when a1.id is not null then ifnull(a1.next_fc,0) else ifnull(t.fc,0) end +
            case when a1.id is not null then ifnull(a1.next_ff,0) else ifnull(t.ff,0) end +
            case when a1.id is not null then ifnull(a1.next_fmp,0) else ifnull(t.fmp,0) end +
            case when a1.id is not null then ifnull(a1.next_lac,0) else ifnull(t.lac,0) end +
            case when a1.id is not null then ifnull(a1.next_ncore,0) else ifnull(t.ncore,0) end +
            case when a1.id is not null then ifnull(a1.next_suj,0) else ifnull(t.suj,0) end +
            case when a1.id is not null then ifnull(a1.next_sbrt,0) else ifnull(t.sbrt,0) end +
            case when a1.id is not null then ifnull(a1.next_mpalete,0) else ifnull(t.mpalete,0) end +
            case when a1.id is not null then ifnull(a1.next_rasgo,0) else ifnull(t.rasgo,0) end +
            case when a1.id is not null then ifnull(a1.next_esp,0) else ifnull(t.esp,0) end +
            case when a1.id is not null then ifnull(a1.next_rugas,0) else ifnull(t.rugas,0) end +
            case when a1.id is not null then ifnull(a1.next_tr,0) else ifnull(t.tr,0) end +
            case when a1.id is not null then ifnull(a1.next_prop,0) else ifnull(t.prop,0) end last_ndefeitos

            ,pt.cliente_nome,pt.item_cod
            #,t.audit_id
            #,t.max_audit_id
            ,t.estado_atual
            ,date(t.`timestamp`) `data`
            ,t.`timestamp`
            ,t.n_estado_changes
            ,t.n_to_hold_changes
            ,t.n_from_hold_changes
            ,t.duration_in_hold
            #,t.audit_timestamp
            #,t.previous_audit_timestamp
            #,t.estado,t.next_estado
            #,a1.*
            ,'---------------FIRST FROM.ESTADO.TO-----------------' s0
            ,case when a0.id is not null then a0.estado else t.estado end first_estado_from
            ,case when a0.id is not null and a0.next_estado is not null then a0.next_estado else t.estado_atual end first_estado_to
            ,IFNULL(a0.previous_audit_timestamp,t.`timestamp`) first_estado_init_ts
            #IFNULL(IFNULL(a1.previous_audit_timestamp,a1.prev_audit_timestamp),t.`timestamp`) estado_atual_init_ts,
            ,case when a0.id is not null then a0.audit_timestamp else t.audit_timestamp end first_estado_ts
            ,TIMESTAMPDIFF(SECOND, IFNULL(a0.previous_audit_timestamp,t.`timestamp`),(case when a0.id then a0.audit_timestamp else t.audit_timestamp end)) / 3600.0 first_estado_diff
            ,case when a0.id is not null then a0.area else t.area end first_estado_area
            ,'---------------LAST FROM.ESTADO.TO-----------------' s1
            ,case when a1.id is not null then a1.estado else t.estado end last_estado_from
            ,case when a1.id is not null then a1.next_estado else t.estado_atual end last_estado_to
            ,IFNULL(a1.previous_audit_timestamp,t.`timestamp`) last_estado_init_ts
            #IFNULL(IFNULL(a1.previous_audit_timestamp,a1.prev_audit_timestamp),t.`timestamp`) estado_atual_init_ts,
            ,case when a1.id is not null then a1.audit_timestamp else t.audit_timestamp end last_estado_ts
            ,TIMESTAMPDIFF(SECOND, IFNULL(a1.previous_audit_timestamp,t.`timestamp`),(case when a1.id then a1.audit_timestamp else t.audit_timestamp end)) / 3600.0 last_estado_diff
            ,case when a1.id is not null then a1.area else t.area end last_estado_area
            ,'---------------FIRST.FROM.HOLD.TO-----------------' s2
            ,case when a2.id is not null then a2.next_estado end first_from_hold
            ,case when a2.id is not null and a2.next_estado is not null then IFNULL(a2.previous_audit_timestamp,t.`timestamp`) end first_from_hold_init_ts
            ,case when a2.id is not null and a2.next_estado is not null then a2.audit_timestamp end first_from_hold_ts
            ,case when a2.id is not null and a2.next_estado is not null then  TIMESTAMPDIFF(SECOND, IFNULL(a2.previous_audit_timestamp,t.`timestamp`), a2.audit_timestamp) / 3600.0 end first_from_hold_diff
            ,case when a2.id is not null and a2.next_estado is not null then a2.area end first_from_hold_area
            ,'---------------LAST.FROM.HOLD.TO-----------------' s3
            ,a3.next_estado last_from_hold, case when a3.id is not null then IFNULL(a3.previous_audit_timestamp,t.`timestamp`) end last_from_hold_init_ts 
            ,a3.audit_timestamp last_from_hold_ts 
            ,TIMESTAMPDIFF(SECOND, IFNULL(a3.previous_audit_timestamp,t.`timestamp`), a3.audit_timestamp) / 3600.0 last_from_hold_diff
            ,a3.area last_from_hold_area
            ,'---------------FIRST.TO.HOLD-----------------' s4
            ,a4.estado first_to_hold
            ,case when a4.id is not null then IFNULL(a4.previous_audit_timestamp,t.`timestamp`) end first_to_hold_init_ts
            ,a4.area first_to_hold_area
            ,TIMESTAMPDIFF(SECOND, IFNULL(a4.previous_audit_timestamp,t.`timestamp`), a4.audit_timestamp) / 3600.0 first_to_hold_diff
            ,'---------------LAST.TO.HOLD-----------------' s5
            ,a5.estado last_to_hold
            ,case when a5.id is not null then IFNULL(a5.previous_audit_timestamp,t.`timestamp`) end last_to_hold_init_ts
            ,a5.audit_timestamp last_to_hold_ts
            ,TIMESTAMPDIFF(SECOND, IFNULL(a5.previous_audit_timestamp,t.`timestamp`), a5.audit_timestamp) / 3600.0 last_to_hold_diff
            ,a5.area last_to_hold_area

        FROM BASE t
        join audit_producao_bobine apb on apb.audit_id = t.max_audit_id
        left join planeamento_ordemproducao po on po.id=apb.ordem_id
        left join producao_tempordemfabrico pt on pt.id=po.draft_ordem_id 
        left join BASE a0 on a0.audit_id=t.first_audit_id
        left join BASE a1 on a1.audit_id=t.last_audit_id
        left join BASE a2 on a2.audit_id=t.min_from_hold_id
        left join BASE a3 on a3.audit_id=t.max_from_hold_id
        left join BASE a4 on a4.audit_id=t.min_to_hold_id
        left join BASE a5 on a5.audit_id=t.max_to_hold_id
        #where t.n_to_hold_changes>0
        {resumed_02}
    """
    )
    try:
        response = db.executeSimpleList(sql, connection, parameters,[])
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)




def ConsumosGranuladoProducao(request, format=None):
    #Get the consumption of grainy mp in an aggregated production
    connection = connections["default"].cursor()
    _filter = request.data['filter'] if "filter" in request.data else {}
    _data = request.data['parameters'] if "parameters" in request.data else {}
    print(_filter)
    #FILTERS ALLOWED
    #nofilters  - current agg_of_id
    #fdata      - agg_of_id's in a range date
    #fprf       - agg_of_id's which the prf_cod belongs 
    #fof        - agg_of_id's which the of_cod belongs
    #forder     - agg_of_id's which the order_cod belongs   
    
    #PARAMETERS
    #baseproduction

    f = Filters(_filter)
    _parameters = {}
    _filterkey=None
    if "fprf" in _filter and _filter.get("fprf") is not None:
        if (not _filter.get("fprf").lower().startswith("prf")):
            return Response({"rows":[]})
        _filterkey="fprf"
        _parameters["prf_cod"]={"value": lambda v: Filters.getValue(Filters.getLower(v.get('fprf')),None,"==" if _data.get("source")=="external" else None), "field": lambda k, v: f'lower({k})'}
    elif "fof" in _filter and _filter.get("fof") is not None:
        if (not _filter.get("fof").lower().startswith("off")):
            return Response({"rows":[]})
        _filterkey="fof"
        _parameters["of_id"]={"value": lambda v: Filters.getValue(Filters.getLower(v.get('fof')),None,"==" if _data.get("source")=="external" else None), "field": lambda k, v: f'lower({k})'}
    elif "forder" in _filter and _filter.get("forder") is not None:
        if (not _filter.get("forder").lower().startswith("eef")):
            return Response({"rows":[]})
        _filterkey="forder"
        _parameters["order_cod"]={"value": lambda v: Filters.getValue(Filters.getLower(v.get('forder')),None,"==" if _data.get("source")=="external" else None), "field": lambda k, v: f'lower({k})'}
    elif "fdata" in _filter and _filter.get("fdata") is not None:
        if (not isDate(_filter.get("fdata"))):
            return Response({"rows":[]})
        _filterkey="fdata"
        _parameters = {**rangeP(_filter.get("fdata"), 'date(`timestamp`)', lambda k, v: f'{k}',None,"data")}
    f.setParameters(_parameters, True)
    f.where()
    f.auto()
    f.value()

    _filter_part = ""
    if _filterkey in ["fprf","fof","forder"]:
        _filter_part = f"select agg_of_id from producao_tempordemfabrico pt {f.text} limit 1"
    elif _filterkey in ["fdata"]:
        _filter_part = f"select ti.agg_of_id from producao_bobinagem tbm join ig_bobinagens_data ti on ti.ig_id = tbm.ig_bobinagem_id {f.text} limit 1"
    else:
        _filter_part = f"select pc.agg_of_id from producao_currentsettings pc where `status`=3 limit 1"

    parameters = {**f.parameters}
    dql = db.dql(request.data, False,False)
    sql = lambda : (
        f"""  
            WITH DATE_RANGE AS(
                select
                ibd.agg_of_id base_agg_of_id,
                MIN(ib.inicio_ts) date_inicio,
                MAX(ib.fim_ts) date_fim				
                from ig_bobinagens_data ibd
                join ig_bobinagens ib on ibd.ig_id = ib.id
                where ibd.agg_of_id = ({_filter_part})
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
                    ibd.agg_of_id,pt2.cod,
                    ibd.avg_Qnet_PV capacity,
                    ifnull(lc0.id,ifnull(lc1.id,0)) id_chk,
                    IFNULL(ifnull(lc0.qty_lote,(lc1.qty_lote-IFNULL(mps.qty_out,0)*lc1.`last`)),(mps.qty_lote-IFNULL(mps.qty_out,0))) qty_lote_net,
                    count(*) over (partition by pb.id,mps.group_id,mps.doser) shared,
                    #TIMESTAMPDIFF(MINUTE, GREATEST(ib.inicio_ts, mps.t_stamp_in), LEAST(ib.fim_ts, mps.t_stamp_out)) AS duration_consumption,
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
                JOIN ig_bobinagens ib on ib.fim_ts >=mps.t_stamp_in and ib.inicio_ts <=mps.t_stamp_out
                join ig_bobinagens_data ibd on ibd.ig_id =ib.id
                JOIN producao_tempaggordemfabrico pt2 on pt2.id=ibd.agg_of_id
                join producao_bobinagem pb on pb.ig_bobinagem_id = ib.id
                left join lotesgranulado_checkpoint lc0 on lc0.reg=0 and lc0.vcr=mps.vcr_num and lc0.t_stamp >= ib.fim_ts
                left join lotesgranulado_checkpoint lc1 on lc1.reg=1 and lc1.vcr=mps.vcr_num and ib.fim_ts BETWEEN DATE_ADD(lc1.t_stamp, INTERVAL 1 SECOND) AND NOW()
            )
            select		
				distinct cod,t_stamp_in, t_stamp_out,in_line,duration_mp_inline, artigo_cod,artigo_des,n_lote,vcr_num,qty_lote,qty_out,
	            sum_cons_lote,
	            sum_cons_lote_agg,
	            round(sum(fixed_cons) over (partition by b.vcr_num),2) sum_fixed_cons_lote
            from(
            SELECT 
                cod,agg_of_id,base_agg_of_id,t_stamp_in,case when in_line then null else t_stamp_out end t_stamp_out,in_line,duration_mp_inline, artigo_cod,artigo_des,n_lote,vcr_num,qty_lote,qty_out,
                round(sum(cons/shared) over (partition by b.vcr_num),2) sum_cons_lote,
                round(sum(cons/shared) over (partition by b.agg_of_id,b.vcr_num),2) sum_cons_lote_agg,
                CASE WHEN sum(cons/shared) over (partition by b.vcr_num) > (qty_lote_net) or in_line=0 then 
                    ((b.cons/shared)*(qty_lote_net))/sum(cons/shared) over (partition by b.vcr_num)
                else 
                    cons/shared 
                end fixed_cons		
            FROM BOBINAGENS b
            ) b
            {"where b.base_agg_of_id=b.agg_of_id" if _filter.get("baseproduction")==1 else ""}
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
    #no filters like in:,>:,<=:,==:,... allowed
    #nofilters  - current agg_of_id
    #fdata      - agg_of_id of a date
    #fprf       - agg_of_id which the prf_cod belongs 
    #fof        - agg_of_id which the of_cod belongs
    #forder     - agg_of_id which the order_cod belongs   
    #PARAMETERS
    #baseproduction

    f = Filters(_filter)
    _parameters = {}
    _filterkey=None
    if "fprf" in _filter and _filter.get("fprf") is not None:
        if (not _filter.get("fprf").lower().startswith("prf")):
            return Response({"rows":[]})
        _filterkey="fprf"
        _parameters["prf_cod"]={"value": lambda v: Filters.getValue(Filters.getLower(v.get('fprf')),None,"==" if _data.get("source")=="external" else None), "field": lambda k, v: f'lower({k})'}
    elif "fof" in _filter and _filter.get("fof") is not None:
        if (not _filter.get("fof").lower().startswith("off")):
            return Response({"rows":[]})
        _filterkey="fof"
        _parameters["of_id"]={"value": lambda v: Filters.getValue(Filters.getLower(v.get('fof')),None,"==" if _data.get("source")=="external" else None), "field": lambda k, v: f'lower({k})'}
    elif "forder" in _filter and _filter.get("forder") is not None:
        if (not _filter.get("forder").lower().startswith("eef")):
            return Response({"rows":[]})
        _filterkey="forder"
        _parameters["order_cod"]={"value": lambda v: Filters.getValue(Filters.getLower(v.get('forder')),None,"==" if _data.get("source")=="external" else None), "field": lambda k, v: f'lower({k})'}
    elif "fdata" in _filter and _filter.get("fdata") is not None:
        if (not isDate(_filter.get("fdata"))):
            return Response({"rows":[]})
        _filterkey="fdata"
        _parameters = {**rangeP(_filter.get("fdata"), 'date(`timestamp`)', lambda k, v: f'{k}',None,"data")}
    f.setParameters(_parameters, True)
    f.where()
    f.auto()
    f.value()

    _filter_part = ""
    if _filterkey in ["fprf","fof","forder"]:
        _filter_part = f"select agg_of_id from producao_tempordemfabrico pt {f.text} limit 1"
    elif _filterkey in ["fdata"]:
        _filter_part = f"select ti.agg_of_id from producao_bobinagem tbm join ig_bobinagens_data ti on ti.ig_id = tbm.ig_bobinagem_id {f.text} limit 1"
    else:
        _filter_part = f"select pc.agg_of_id from producao_currentsettings pc where `status`=3"
    parameters = {**f.parameters}
    dql = db.dql(request.data, False,False)
    
    sql = lambda : (
        f"""
        	WITH DATE_RANGE AS(
            select
            ibd.agg_of_id base_agg_of_id,
            MIN(ib.inicio_ts) date_inicio,
            MAX(ib.fim_ts) date_fim
            from ig_bobinagens_data ibd
            join ig_bobinagens ib on ib.`type`= 1 and ibd.ig_id = ib.id
            where ibd.agg_of_id = ({_filter_part})
            group by ibd.agg_of_id
        ),
        MPS AS(
            SELECT 
            distinct dr.*,
            llout.t_stamp t_stamp_in,IFNULL(lout.t_stamp,IFNULL(llout.t_stamp_out,NOW())) t_stamp_out,
            case when IFNULL(lout.t_stamp,IFNULL(llout.t_stamp_out,null)) is null THEN 1 else 0 end in_line,
            lin.group_id,lin.doser,
            llout.artigo_cod,llout.n_lote,llout.vcr_num,llout.qty_lote,IFNULL(llout.qty_out,0) qty_out,
            ib.inicio_ts,ib.fim_ts,ibd.agg_of_id,po.id ordem_id, po.ofid,
            ib.id ig_id,pbm.id bobinagem_id,pbm.nome,pb.lar,
            count(*) over (partition by pb.id,group_id,lin.doser) shared,
            count(*) over (partition by pbm.id,pb.ordem_id,lin.group_id,lin.doser,llout.vcr_num) nbobines,
            sum(pb.lar) over (partition by pbm.id,lin.group_id,lin.doser,llout.vcr_num) largura_bobinagem,
            ibd.avg_Qnet_PV,
            ibd.AVG_A1_P,ibd.AVG_A2_P,ibd.AVG_A3_P,ibd.AVG_A4_P,ibd.AVG_A5_P,ibd.AVG_A6_P,
            ibd.AVG_B1_P,ibd.AVG_B2_P,ibd.AVG_B3_P,ibd.AVG_B4_P,ibd.AVG_B5_P,ibd.AVG_B6_P,
            ibd.AVG_C1_P,ibd.AVG_C2_P,ibd.AVG_C3_P,ibd.AVG_C4_P,ibd.AVG_C5_P,ibd.AVG_C6_P,
            ibd.A_PERC_SP,ibd.B_PERC_SP,ibd.C_PERC_SP,
            ibd.avg_Qnet_PV capacity,
            #TIMESTAMPDIFF(MINUTE, GREATEST(ib.inicio_ts, llout.t_stamp), LEAST(ib.fim_ts, IFNULL(lout.t_stamp,IFNULL(llout.t_stamp_out,NOW())))) AS duration_consumption,
            TIMESTAMPDIFF(MINUTE,llout.t_stamp,IFNULL(lout.t_stamp,IFNULL(llout.t_stamp_out,NOW()))) duration_mp_inline
            FROM DATE_RANGE dr
            join lotesdoserslinha lin on lin.type_mov =1 and lin.t_stamp < dr.date_fim
            left join lotesdoserslinha lout on lin.loteslinha_id = lout.loteslinha_id and lout.type_mov=0 and lin.group_id = lout.group_id and lin.doser =lout.doser
            left join lotesgranuladolinha llout on lin.loteslinha_id = llout.id and llout.type_mov=1
            JOIN ig_bobinagens ib on ib.inicio_ts <=IFNULL(lout.t_stamp,IFNULL(llout.t_stamp_out,NOW())) and ib.fim_ts >=llout.t_stamp
            join producao_bobinagem pbm on pbm.ig_bobinagem_id = ib.id
            join producao_bobine pb on pb.bobinagem_id=pbm.id
            join planeamento_ordemproducao po on po.id=pb.ordem_id
            join ig_bobinagens_data ibd on ibd.ig_id =ib.id		
            /*ESTE FILTRO NÃO PERMITE QUE SEJA CONTABILIZADAS MATERIAS PRIMAS À MAIS DE 10 DIAS NA CUBA*/
            /*ISTO PERMITE QUE EVENTUAIS MATERIAS PRIMAS SEM SAÍDA CONTINUEM A ENTRAR NOS CONSUMOS*/
            where lin.t_stamp > DATE_SUB(dr.date_fim,INTERVAL 10 DAY) and 
            lin.t_stamp < dr.date_fim and 
            IFNULL(lout.t_stamp,IFNULL(llout.t_stamp_out,NOW()))>dr.date_inicio
        ),
        BOBINAGENS AS(
            select mps.*,
            ifnull(lc0.id,ifnull(lc1.id,0)) id_chk,
            IFNULL(ifnull(lc0.qty_lote,(lc1.qty_lote-IFNULL(mps.qty_out,0)*lc1.`last`)),(mps.qty_lote-IFNULL(mps.qty_out,0))) qty_lote_net,
            calculate_consumption(mps.doser,
                    JSON_OBJECT(
                    'Qnet_PV',mps.avg_Qnet_PV,
                    'A1_P',mps.AVG_A1_P,'A2_P',mps.AVG_A2_P,'A3_P',mps.AVG_A3_P,'A4_P',mps.AVG_A4_P,'A5_P',mps.AVG_A5_P,'A6_P',mps.AVG_A6_P,
                    'B1_P',mps.AVG_B1_P,'B2_P',mps.AVG_B2_P,'B3_P',mps.AVG_B3_P,'B4_P',mps.AVG_B4_P,'B5_P',mps.AVG_B5_P,'B6_P',mps.AVG_B6_P,
                    'C1_P',mps.AVG_C1_P,'C2_P',mps.AVG_C2_P,'C3_P',mps.AVG_C3_P,'C4_P',mps.AVG_C4_P,'C5_P',mps.AVG_C5_P,'C6_P',mps.AVG_C6_P,
                    'A_PERC_SP',mps.A_PERC_SP,'B_PERC_SP',mps.B_PERC_SP,'C_PERC_SP',mps.C_PERC_SP
                    )
                    ,mps.inicio_ts,mps.fim_ts,mps.t_stamp_in,mps.t_stamp_out,null)/mps.shared cons
            from MPS mps
            left join lotesgranulado_checkpoint lc0 on lc0.reg=0 and lc0.vcr=mps.vcr_num and lc0.t_stamp >= mps.fim_ts
            left join lotesgranulado_checkpoint lc1 on lc1.reg=1 and lc1.vcr=mps.vcr_num and mps.fim_ts BETWEEN DATE_ADD(lc1.t_stamp, INTERVAL 1 SECOND) AND NOW()
            #LEFT JOIN (SELECT t.id,t.qty_lote,t.vcr,
            #	DATE_ADD(lag(t.t_stamp) over (partition by t.vcr order by t_stamp), INTERVAL 1 SECOND) t_stamp_previous,
            #	CASE WHEN lead(t.t_stamp) over (partition by t.vcr order by t_stamp) is null then NOW() else t_stamp end t_stamp
            #	from lotesgranulado_checkpoint t
            #) chk on mps.vcr_num = chk.vcr and mps.fim_ts BETWEEN IFNULL(chk.t_stamp_previous,mps.fim_ts) AND chk.t_stamp
        )
        select 		
            distinct
            c.ofid,c.lar,
            c.date_inicio_of,c.date_fim_of,c.t_stamp_in,c.t_stamp_out,c.in_line,
            /*sum(c.duration_consumption) over (partition by c.vcr_num) duration_consumption,*/
            c.duration_mp_inline,
            c.artigo_cod,c.n_lote,c.vcr_num,
            c.qty_lote,c.qty_out,(c.qty_lote-IFNULL(c.qty_out,0)) qty_lote_net,
            sum_cons_lote,sum_cons_lote_of,
            round(sum(c.fixed_ordem_cons) over (partition by c.vcr_num),2) sum_cons_lote_fixed,
            round(sum(c.fixed_ordem_cons) over (partition by c.ordem_id,c.vcr_num),2) sum_cons_lote_of_fixed
        from(	
            select distinct
            bm.ordem_id,bm.ofid,bm.lar,
            bm.date_inicio_of,bm.date_fim_of,bm.t_stamp_in,bm.t_stamp_out,bm.in_line,
            /*sum(bm.duration_consumption) over (partition by bm.vcr_num) duration_consumption,*/
            bm.duration_mp_inline,
            bm.artigo_cod,bm.n_lote,bm.vcr_num,
            round(sum_cons_lote,2) sum_cons_lote,round(sum_cons_lote_of,2) sum_cons_lote_of,
            bm.qty_lote,bm.qty_out,(bm.qty_lote-IFNULL(bm.qty_out,0)) qty_lote_net,
                    CASE WHEN sum_cons_lote > bm.qty_lote_net or bm.in_line=0 then 
                        (bm.cons_lote_bobinagem_of*bm.qty_lote_net)/sum_cons_lote
                    else 
                        bm.cons_lote_bobinagem_of
                    end fixed_ordem_cons
            from(
                select 
                        bm.ordem_id,bm.ofid,bm.ig_id,bm.bobinagem_id,bm.nome,
                        bm.lar,bm.base_agg_of_id,bm.agg_of_id,
                        bm.date_inicio date_inicio_of,bm.date_fim date_fim_of,bm.t_stamp_in,case when bm.in_line then null else bm.t_stamp_out end t_stamp_out,
                        bm.inicio_ts,bm.fim_ts,bm.in_line,
                        bm.capacity,
                        #bm.duration_consumption,
                        bm.duration_mp_inline,
                        
                        bm.artigo_cod,bm.n_lote,bm.vcr_num,
                        bm.qty_lote,bm.qty_out,bm.qty_lote_net,
                        bm.largura_bobinagem,
                        bm.nbobines /*Número de bobines de uma bobinagem de uma determinada ordem de fabrico*/,
                        bm.cons /*Consumo da bobinagem*/,
                        ((bm.lar*bm.cons)/bm.largura_bobinagem) cons_lote_bobine, /*Consumo da bobine de uma determinada ordem de fabrico na bobinagem*/
                        ((bm.lar*bm.cons)*bm.nbobines)/bm.largura_bobinagem cons_lote_bobinagem_of, /*Consumo das bobines de uma determinada ordem de fabrico na bobinagem*/
                    
                        #sum(((bm.lar*bm.cons)*bm.nbobines)/bm.largura_bobinagem) over (partition by bm.vcr_num) sum_cons_lote, /*Consumo do lote*/
                        #sum(((bm.lar*bm.cons)*bm.nbobines)/bm.largura_bobinagem) over (partition by bm.ordem_id,bm.vcr_num) sum_cons_lote_of /*Consumo do lote na ordem de fabrico*/,
                        sum(((bm.lar*bm.cons)*bm.nbobines)/bm.largura_bobinagem) over (partition by bm.vcr_num,bm.id_chk) sum_cons_lote /*Consumo do lote com checkpoint*/,
                        sum(((bm.lar*bm.cons)*bm.nbobines)/bm.largura_bobinagem) over (partition by bm.ordem_id,bm.vcr_num,bm.id_chk) sum_cons_lote_of /*Consumo do lote na ordem de fabrico com checkpoint*/
                    from BOBINAGENS bm
            ) bm
            {"where bm.base_agg_of_id=bm.agg_of_id" if _filter.get("baseproduction")==1 else ""}
            ) c
        """)
    print(sql())
    print(parameters)
    try:
        response = db.executeSimpleList(sql, connection, parameters,[])
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def ConsumosGranuladoDiario(request, format=None):
    #Get the consumption of grainy mp by days
    connection = connections["default"].cursor()
    _filter = request.data['filter'] if "filter" in request.data else {}
    _data = request.data['parameters'] if "parameters" in request.data else {}
    #FILTERS ALLOWED
    #nofilters  - current day
    #fdata      - agg_of_id's in a range date
    
    if "fdata_inicio" not in _filter or _filter.get("fdata_inicio") is None or not isDate(_filter.get("fdata_inicio")):
        _filter["fdata_inicio"]=datetime.now().strftime("%Y-%m-%d")
    if "fdata_fim" not in _filter or _filter.get("fdata_fim") is None or not isDate(_filter.get("fdata_fim")):
        _filter["fdata_fim"]= _filter["fdata_inicio"]

    f = Filters(_filter)   
    f.setParameters({}, False)
    f.where()
    f.add(f':fdata_inicio', True)
    f.add(f':fdata_fim', True)
    f.value()
  
    parameters = {**f.parameters}
    dql = db.dql(request.data, False,False)
    sql = lambda : (
        f"""  
            WITH BASE AS(	
                select 
                    pbm.id,pbm.nome,pbm.`data`,
                    lin.group_id,lin.doser,
                    IFNULL(llout.artigo_cod,llout_0.artigo_cod) artigo_cod, 
                    IFNULL(llout.artigo_des,llout_0.artigo_des) artigo_des, 
                    IFNULL(llout.vcr_num,llout_0.vcr_num) vcr_num, 
                    IFNULL(llout.n_lote,llout_0.n_lote) n_lote, 
                    IFNULL(llout.qty_lote,llout_0.qty_lote) qty_lote,
                    IFNULL(llout.qty_out,IFNULL(llout_0.qty_out,0)) qty_out,
                    count(*) over (partition by pbm.id,lin.group_id,lin.doser) shared,
                    case when IFNULL(lout.t_stamp,IFNULL(llout.t_stamp_out,llout_0.t_stamp)) is null THEN 1 else 0 end in_line,
                    lin.t_stamp t_in,
                    IFNULL(lout.t_stamp,IFNULL(llout.t_stamp_out,llout_0.t_stamp)) t_out,
                    calculate_consumption_v2(lin.doser,
                    JSON_OBJECT(
                    'Qnet_PV',ibd.avg_Qnet_PV,
                    'A1_P',ibd.AVG_A1_P,'A2_P',ibd.AVG_A2_P,'A3_P',ibd.AVG_A3_P,'A4_P',ibd.AVG_A4_P,'A5_P',ibd.AVG_A5_P,'A6_P',ibd.AVG_A6_P,
                    'B1_P',ibd.AVG_B1_P,'B2_P',ibd.AVG_B2_P,'B3_P',ibd.AVG_B3_P,'B4_P',ibd.AVG_B4_P,'B5_P',ibd.AVG_B5_P,'B6_P',ibd.AVG_B6_P,
                    'C1_P',ibd.AVG_C1_P,'C2_P',ibd.AVG_C2_P,'C3_P',ibd.AVG_C3_P,'C4_P',ibd.AVG_C4_P,'C5_P',ibd.AVG_C5_P,'C6_P',ibd.AVG_C6_P,
                    
                    'A1_S',ibd.A1_S,'A2_S',ibd.A2_S,'A3_S',ibd.A3_S,'A4_S',ibd.A4_S,'A5_S',ibd.A5_S,'A6_S',ibd.A6_S,
                    'B1_S',ibd.B1_S,'B2_S',ibd.B2_S,'B3_S',ibd.B3_S,'B4_S',ibd.B4_S,'B5_S',ibd.B5_S,'B6_S',ibd.B6_S,
                    'C1_S',ibd.C1_S,'C2_S',ibd.C2_S,'C3_S',ibd.C3_S,'C4_S',ibd.C4_S,'C5_S',ibd.C5_S,'C6_S',ibd.C6_S,

                    'A_PERC_SP',ibd.A_PERC_SP,'B_PERC_SP',ibd.B_PERC_SP,'C_PERC_SP',ibd.C_PERC_SP,
                    'A_PERC_PV',ibd.avg_A_PERC_PV,'B_PERC_PV',ibd.avg_B_PERC_PV,'C_PERC_PV',ibd.avg_C_PERC_PV
                    )
                    ,ib.inicio_ts,ib.fim_ts,lin.t_stamp,IFNULL(lout.t_stamp,IFNULL(llout.t_stamp_out,llout_0.t_stamp)),null,1) calc_cons,
                    ibd.avg_grammage,ibd.avg_spess_MIS,ibd.avg_density,ibd.avg_line_speed,ibd.avg_Qnet_PV
                    
                from lotesdoserslinha lin 
                left join lotesdoserslinha lout on lin.loteslinha_id = lout.loteslinha_id and lout.type_mov=0 and lin.group_id = lout.group_id and lin.doser =lout.doser
                left join lotesgranuladolinha llout on lin.loteslinha_id = llout.id and llout.type_mov=1
                left join lotesgranuladolinha llout_0 on lin.loteslinha_id = llout_0.id and llout_0.type_mov=0
                join producao_bobinagem pbm on pbm.ig_bobinagem_id <>0 and (pbm.`timestamp` between lin.t_stamp and IFNULL(lout.t_stamp,IFNULL(llout.t_stamp_out,IFNULL(llout_0.t_stamp,TIMESTAMP(%(fdata_fim)s, '23:59:59')))))
                join ig_bobinagens ib on ib.id = pbm.ig_bobinagem_id
                join ig_bobinagens_data ibd on ibd.ig_id = pbm.ig_bobinagem_id
                where
                (%(fdata_inicio)s <= date(IFNULL(lout.t_stamp,IFNULL(llout.t_stamp_out,IFNULL(llout_0.t_stamp,TIMESTAMP(%(fdata_fim)s, '23:59:59'))))) AND %(fdata_fim)s >= date(lin.t_stamp)) and
                (date(pbm.`timestamp`) BETWEEN %(fdata_inicio)s and %(fdata_fim)s)
                )
                SELECT 
                    t.`data`,
                    t.artigo_cod,t.artigo_des,t.extrusora,t.perc_extruder,t.perc_set,t.perc_real,
                    t.cons,
                    round(sum(t.cons) over (partition by t.`data`,t.artigo_cod),2) cons_artigo_data,
                    round(sum(t.cons) over (partition by t.`data`),2) cons_data,
                    t.avg_grammage,t.avg_spess_MIS,t.avg_density,t.avg_line_speed,t.avg_Qnet_PV,
                    t.avg_grammage_BA,t.avg_spess_MIS_BA,t.avg_density_BA,t.avg_line_speed_BA,t.avg_Qnet_PV_BA,
                    t.produtos,
                    t.clientes 
                FROM (
                    SELECT 
                        b.`data`,
                        b.artigo_cod,
                        b.artigo_des,
                        b.calc_cons->>'$.extruder' extrusora,
                        b.calc_cons->>'$.perc_extruder' perc_extruder,
                        b.calc_cons->>'$.perc_set' perc_set,
                        round(avg(b.calc_cons->>'$.perc_real'),2) perc_real,
                        round(sum((b.calc_cons->>'$.cons')/b.shared),2) cons,
                        round(avg(case when pbd.bobines->>'$[0].estado'<>'BA' then b.avg_grammage END),2) avg_grammage,
                        round(avg(case when pbd.bobines->>'$[0].estado'<>'BA' then b.avg_spess_MIS END),2) avg_spess_MIS,
                        round(avg(case when pbd.bobines->>'$[0].estado'<>'BA' then b.avg_density END),2) avg_density,
                        round(avg(case when pbd.bobines->>'$[0].estado'<>'BA' then b.avg_line_speed END),2) avg_line_speed,
                        round(avg(case when pbd.bobines->>'$[0].estado'<>'BA' then b.avg_Qnet_PV END),2) avg_Qnet_PV,
                        
                        round(avg(b.avg_grammage),2) avg_grammage_BA,
                        round(avg(b.avg_spess_MIS),2) avg_spess_MIS_BA,
                        round(avg(b.avg_density),2) avg_density_BA,
                        round(avg(b.avg_line_speed),2) avg_line_speed_BA,
                        round(avg(b.avg_Qnet_PV),2) avg_Qnet_PV_BA,
                        
                        pbd.produtos,
                        pbd.clientes 
                    FROM BASE b
                    join producao_bobinagem_data pbd on pbd.bobinagem_id=b.id
                    group by b.`data`,b.artigo_cod,b.artigo_des,b.calc_cons->>'$.extruder',b.calc_cons->>'$.perc_extruder',b.calc_cons->>'$.perc_set',pbd.produtos,	pbd.clientes
                ) t
       """
    )
    try:
        response = db.executeSimpleList(sql, connection, parameters,[])
        print("eee")
        print(response)
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

def BobinagensData(request, format=None):
    connection = connections["default"].cursor()
    _filter = request.data['filter'] if "filter" in request.data else {}
    _data = request.data['parameters'] if "parameters" in request.data else {}
    
    #FILTERS ALLOWED
    #nofilters  - current agg_of_id
    #fdata      - agg_of_id's in a range date
    #fprf       - agg_of_id's which the prf_cod belongs 
    #fof        - agg_of_id's which the of_cod belongs
    #forder     - agg_of_id's which the order_cod belongs   
    
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
    sql = lambda : (
        f"""  
            select 
            
            pbm.nome,pbm.num_emendas,pbm.timestamp,pbm.data,pbm.num_bobinagem,pbm.comp,
            pbm.tiponwsup,pbm.tiponwinf,pbm.lotenwsup,pbm.lotenwinf,pbm.nwsup,pbm.nwinf,
            pbm.comp_par,pbm.comp_cli,pbm.desper,pbm.diam,pbm.area,pbm.inico,pbm.fim,pbm.duracao,
            pbm.largura_bruta,pbm.vcr_num_inf,pbm.vcr_num_sup,

            ibd.spess_MIS,ibd.spess_PV,ibd.winder_speed,ibd.grammage,ibd.calandra_inf_temp,ibd.density,ibd.line_speed,ibd.colata_temp,ibd.diametro_bobine,ibd.metros_bobine,ibd.calandra_inf_set_temp,ibd.Qnet_PV,ibd.Qnet_SP,ibd.avg_spess_MIS,
            ibd.min_spess_MIS,ibd.max_spess_MIS,ibd.std_spess_MIS,ibd.avg_spess_PV,ibd.min_spess_PV,ibd.max_spess_PV,ibd.std_spess_PV,ibd.avg_winder_speed,ibd.min_winder_speed,ibd.max_winder_speed,ibd.std_winder_speed,ibd.avg_grammage,ibd.min_grammage,ibd.max_grammage,
            ibd.std_grammage,ibd.avg_calandra_inf_temp,ibd.min_calandra_inf_temp,ibd.max_calandra_inf_temp,ibd.std_calandra_inf_temp,ibd.avg_calandra_inf_set_temp,ibd.min_calandra_inf_set_temp,ibd.max_calandra_inf_set_temp,ibd.std_calandra_inf_set_temp,
            ibd.avg_density,ibd.min_density,ibd.max_density,ibd.std_density,ibd.avg_line_speed,ibd.min_line_speed,ibd.max_line_speed,ibd.std_line_speed,ibd.avg_colata_temp,ibd.min_colata_temp,ibd.max_colata_temp,ibd.std_colata_temp,ibd.avg_Qnet_PV,ibd.min_Qnet_PV,ibd.max_Qnet_PV,
            ibd.std_Qnet_PV,ibd.avg_Qnet_SP,ibd.min_Qnet_SP,ibd.max_Qnet_SP,ibd.std_Qnet_SP,
            ibd.A_PV,ibd.A_SP,ibd.B_PV,ibd.B_SP,ibd.C_PV,ibd.C_SP,ibd.D_A,ibd.D_B,ibd.D_C,
            ibd.AVG_A_PV,ibd.AVG_A_SP,
            ibd.AVG_B_PV,ibd.AVG_B_SP,
            ibd.AVG_C_PV,ibd.AVG_C_SP,
            ibd.MIN_A_PV,ibd.MIN_A_SP,
            ibd.MIN_B_PV,ibd.MIN_B_SP,
            ibd.MIN_C_PV,ibd.MIN_C_SP,
            ibd.MAX_A_PV,ibd.MAX_A_SP,
            ibd.MAX_B_PV,ibd.MAX_B_SP,
            ibd.MAX_C_PV,ibd.MAX_C_SP,
            ibd.AVG_D_A,ibd.AVG_D_B,ibd.AVG_D_C,
            ibd.MIN_D_A,ibd.MIN_D_B,ibd.MIN_D_C,
            ibd.MAX_D_A,ibd.MAX_D_B,ibd.MAX_D_C,
            ibd.A_PERC_SP,ibd.B_PERC_SP,ibd.C_PERC_SP,
            ibd.energy_cons,ibd.PB_LO_PV,ibd.PB_LA_PV,ibd.PB_LO_SP,ibd.PB_LA_SP,ibd.min_energy_cons,ibd.min_PB_LO_PV,ibd.min_PB_LA_PV,ibd.min_PB_LO_SP,ibd.min_PB_LA_SP,ibd.max_energy_cons,ibd.max_PB_LO_PV,ibd.max_PB_LA_PV,ibd.max_PB_LO_SP,ibd.max_PB_LA_SP,
            ibd.std_energy_cons,ibd.std_PB_LO_PV,ibd.std_PB_LA_PV,ibd.std_PB_LO_SP,ibd.std_PB_LA_SP,ibd.avg_energy_cons,ibd.avg_PB_LO_PV,ibd.avg_PB_LA_PV,ibd.avg_PB_LO_SP,ibd.avg_PB_LA_SP,
            
            CASE WHEN (select b.id from producao_bobine b where b.bobinagem_id=pbm.id and b.estado='BA' LIMIT 1) IS NULL THEN 0 ELSE 1 END isba
            from producao_bobinagem pbm 
            join ig_bobinagens_data ibd on ibd.ig_id=pbm.ig_bobinagem_id
            where ibd.agg_of_id in ({_filter_part})
       """
    )

    try:
        response = db.executeSimpleList(sql, connection, parameters,[])
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)    

def VolumeProduzidoArtigos(request, format=None):
    connection = connections["default"].cursor()
    _filter = request.data['filter'] if "filter" in request.data else {}
    _data = request.data['parameters'] if "parameters" in request.data else {}  
    
    _parameters = {}
    if "fdata" in _filter and _filter.get("fdata") is not None:
        _parameters = {**rangeP(f.filterData.get('fdata'), 'pb2.data', lambda k, v: f'{k}')}
    elif ("fmes" in _filter and _filter.get("fmes") is not None) or ("fano" in _filter and _filter.get("fano") is not None):
        _filter["fano"] = datetime.now().year if _filter.get("fano") is None or not _filter.get("fano") else _filter.get("fano")
        _filter["fmes"] = datetime.now().month if _filter.get("fmes") is None or not _filter.get("fmes") else _filter.get("fmes")
        _parameters["ano"]={"value": lambda v: Filters.getNumeric(v.get("fano"),None,"==" if _data.get("source")=="external" else None), "field": lambda k, v: f'YEAR(pb2.data)'}
        _parameters["mes"]={"value": lambda v: Filters.getNumeric(v.get("fmes"),None,"==" if _data.get("source")=="external" else None), "field": lambda k, v: f'MONTH(pb2.data)'}

    f = Filters(_filter)
    f.setParameters(_parameters, True)
    f.where()
    f.auto()
    f.add("pb.ig_id is not null",True)
    f.value("and")

    parameters = {**f.parameters}
    dql = db.dql(request.data, False,False)

    cols = f"""*"""
    sql = lambda : (
        f"""
            SELECT {f'{cols}'} FROM(
            SELECT pa.cod, pa.des,IFNULL(pp.produto_cod,pa.produto) produto, sum(pb2.comp*(pb.lar/1000)) area  
            from producao_bobine pb
            join producao_bobinagem pb2 on pb2.id=pb.bobinagem_id
            join producao_artigo pa on pa.id=pb.artigo_id
            left join producao_produtos pp on pp.id=pa.produto_id
            {f.text}
            group by artigo_id
            ) t
            {dql.limit}
        """
    )
    response = db.executeSimpleList(sql, connection, parameters,[])
    return Response(response)

def ProduzidoRetrabalho(request, format=None):
    connection = connections["default"].cursor()
    _filter = request.data['filter'] if "filter" in request.data else {}
    _data = request.data['parameters'] if "parameters" in request.data else {}  
    
    _parameters = {}
    if "fdata" in _filter and _filter.get("fdata") is not None:
        _parameters = {**rangeP(f.filterData.get('fdata'), 'pbmo.data', lambda k, v: f'{k}')}
    elif ("fmes" in _filter and _filter.get("fmes") is not None) or ("fano" in _filter and _filter.get("fano") is not None):
        _filter["fano"] = datetime.now().year if _filter.get("fano") is None or not _filter.get("fano") else _filter.get("fano")
        _filter["fmes"] = datetime.now().month if _filter.get("fmes") is None or not _filter.get("fmes") else _filter.get("fmes")
        _parameters["ano"]={"value": lambda v: Filters.getNumeric(v.get("fano"),None,"==" if _data.get("source")=="external" else None), "field": lambda k, v: f'YEAR(pbmo.data)'}
        _parameters["mes"]={"value": lambda v: Filters.getNumeric(v.get("fmes"),None,"==" if _data.get("source")=="external" else None), "field": lambda k, v: f'MONTH(pbmo.data)'}

    f = Filters(_filter)
    f.setParameters(_parameters, True)
    f.where()
    f.auto()
    f.value("and")

    parameters = {**f.parameters}
    dql = db.dql(request.data, False,False)

    sql = lambda : (
        f"""
            WITH BOBINAGENS AS(
                select distinct pbo.id,pbo.nome, IF(pbo.recycle or pbo.comp_actual=0,pbo.comp,sum(pe.metros) over (partition by pbo.id)) metros_consumidos,pbo.comp,
                IF(pbo.recycle or pbo.comp_actual=0,0,pbo.comp_actual) comp_atual,pbo.lar/1000 lar,pbo.artigo_id,pa.cod,pa.des
                from producao_bobinagem pbmo
                join producao_bobine pbo on pbmo.id=pbo.bobinagem_id
                join producao_emenda pe on pe.bobine_id=pbo.id
                join producao_bobinagem pbm on pbm.id=pe.bobinagem_id
                join producao_bobine pb on pb.bobinagem_id=pbm.id
                join producao_artigo pa on pa.id=pbo.artigo_id
                {f.text}
            ),LINHA_RETRABALHO AS(
                select cod,des,sum(metros_consumidos * lar) area,1 linha FROM BOBINAGENS b
                WHERE 
                (nome like '2%%') AND
                NOT EXISTS (
                    SELECT	1 FROM temp_troca_etiqueta tte where tte.bobine_nome = nome and reverted =0 and deleted = 0
                )
                group by artigo_id
            ),RETRABALHO AS(
                select cod,des,sum(metros_consumidos * lar) area,0 linha FROM BOBINAGENS b
                WHERE 
                (nome like '3%%' or nome like '4%%') AND
                NOT EXISTS (
                    SELECT	1 FROM temp_troca_etiqueta tte where tte.bobine_nome = nome and reverted =0 and deleted = 0
                )
                group by artigo_id
            )
            SELECT * FROM LINHA_RETRABALHO
            UNION 
            SELECT * FROM RETRABALHO
        """
    )
    response = db.executeSimpleList(sql, connection, parameters,[])
    return Response(response)

def ProduzidoLinha(request, format=None):
    connection = connections["default"].cursor()
    _filter = request.data['filter'] if "filter" in request.data else {}
    _data = request.data['parameters'] if "parameters" in request.data else {}  
    
    _parameters = {}
    if "fdata" in _filter and _filter.get("fdata") is not None:
        _parameters = {**rangeP(f.filterData.get('fdata'), 'pb2.data', lambda k, v: f'{k}')}
    elif ("fmes" in _filter and _filter.get("fmes") is not None) or ("fano" in _filter and _filter.get("fano") is not None):
        _filter["fano"] = datetime.now().year if _filter.get("fano") is None or not _filter.get("fano") else _filter.get("fano")
        _filter["fmes"] = datetime.now().month if _filter.get("fmes") is None or not _filter.get("fmes") else _filter.get("fmes")
        _parameters["ano"]={"value": lambda v: Filters.getNumeric(v.get("fano"),None,"==" if _data.get("source")=="external" else None), "field": lambda k, v: f'YEAR(pb2.data)'}
        _parameters["mes"]={"value": lambda v: Filters.getNumeric(v.get("fmes"),None,"==" if _data.get("source")=="external" else None), "field": lambda k, v: f'MONTH(pb2.data)'}

    f = Filters(_filter)
    f.setParameters(_parameters, True)
    f.where(False,"and")
    f.auto()
    f.value("and")

    parameters = {**f.parameters}
    dql = db.dql(request.data, False,False)

    sql = lambda : (
        f"""
            SELECT * FROM(
                SELECT pa.cod, pa.des,IFNULL(pp.produto_cod,pa.produto) produto,pb.estado, sum(pb2.comp*(pb.lar/1000)) area  
                from producao_bobine pb
                join producao_bobinagem pb2 on pb2.id=pb.bobinagem_id
                join producao_artigo pa on pa.id=pb.artigo_id
                left join producao_produtos pp on pp.id=pa.produto_id
                where pb.ig_id is not null {f.text}
                group by pb.artigo_id,pb.estado
            ) t
        """
    )
    response = db.executeSimpleList(sql, connection, parameters,[])
    return Response(response)

def Expedicoes(request, format=None):
    connection = connections[connGatewayName].cursor()
    _filter = request.data['filter'] if "filter" in request.data else {}
    _data = request.data['parameters'] if "parameters" in request.data else {}  
    
    _filter["fano"] = datetime.now().year if _filter.get("fano") is None or not _filter.get("fano") else _filter.get("fano")
    _filter["fmes"] = datetime.now().month if _filter.get("fmes") is None or not _filter.get("fmes") else _filter.get("fmes")

    f = Filters(_filter)
    f.setParameters({
        "mes": {"value": lambda v: v.get('fmes'), "field": lambda k, v: k},
        "ano": {"value": lambda v: v.get('fano'), "field": lambda k, v: k}
    }, True)
    f.where()
    f.add(f'mes = :mes::int', lambda v: v is not None)
    f.add(f'ano = :ano::int', lambda v: v is not None)
    f.value("and")

    parameters = {**f.parameters}
    dql = db.dql(request.data, False,False)
    sql = lambda : (
        f"""
            SELECT * FROM (
            with DELIVERY AS(
                    SELECT 
                    ST.*,SQ."DEMDLVDAT_0",
                    DATE_PART('day', ST."IPTDAT_0"::timestamp - ST.data_bobine::timestamp) diff
                    FROM mv_expedicoes ST
                    JOIN "SAGE-PROD"."SORDERQ" SQ ON SQ."SOHNUM_0" = ST.encomenda AND SQ."SOPLIN_0" = ST."VCRLINORI_0" AND SQ."SOQSEQ_0" = ST."VCRSEQORI_0" AND SQ."ITMREF_0" = ST."ITMREF_0"
                    {f.text}
                    {dql.limit}
                )
                select 
                DELIVERY.*,
                ROUND((AVG(diff) OVER (PARTITION BY expedicao))::numeric,1) avg_expedicao,
                ROUND((MIN(diff) OVER (PARTITION BY expedicao))::numeric,1) min_expedicao,
                ROUND((MAX(diff) OVER (PARTITION BY expedicao))::numeric,1) max_expedicao,
                ROUND((AVG(diff) OVER (PARTITION BY encomenda))::numeric,1) avg_encomenda,
                ROUND((MIN(diff) OVER (PARTITION BY encomenda))::numeric,1) min_encomenda,
                ROUND((MAX(diff) OVER (PARTITION BY encomenda))::numeric,1) max_encomenda,
                ROUND((AVG(diff) OVER (PARTITION BY "LOT_0"))::numeric,1) avg_palete,
                ROUND((MIN(diff) OVER (PARTITION BY "LOT_0"))::numeric,1) min_palete,
                ROUND((MAX(diff) OVER (PARTITION BY "LOT_0"))::numeric,1) max_palete,
                ROUND((AVG(diff) OVER (PARTITION BY ano,mes))::numeric,1) avg_mesano,
                ROUND((MIN(diff) OVER (PARTITION BY ano,mes))::numeric,1) min_mesano,
                ROUND((MAX(diff) OVER (PARTITION BY ano,mes))::numeric,1) max_mesano
                from DELIVERY
                ) t
        """
    )
    response = db.executeSimpleList(sql, connection, parameters,[])
    return Response(response)

def ExpedicoesPesoCargas(request, format=None):
    connection = connections[connGatewayName].cursor()
    _filter = request.data['filter'] if "filter" in request.data else {}
    _data = request.data['parameters'] if "parameters" in request.data else {}  
    
    _filter["fano"] = datetime.now().year if _filter.get("fano") is None or not _filter.get("fano") else _filter.get("fano")
    _filter["fmes"] = None if _filter.get("fmes") is None or not _filter.get("fmes") else _filter.get("fmes")

    f = Filters(_filter)
    f.setParameters({
        "mes": {"value": lambda v: v.get('fmes'), "field": lambda k, v: k},
        "ano": {"value": lambda v: v.get('fano'), "field": lambda k, v: k}
    }, True)
    f.where()
    f.add(f'EXTRACT(MONTH FROM sd."SHIDAT_0") = :mes::int', lambda v: v is not None)
    f.add(f'EXTRACT(YEAR FROM sd."SHIDAT_0") = :ano::int', lambda v: v is not None)
    f.value("and")

    parameters = {**f.parameters}
    dql = db.dql(request.data, False,False)
    sql = lambda : (
        f"""
            select distinct carga,"data expedição","data entrega",cliente,"cod. país",país,"peso bruto","Modo Expedição","area",case when floor("area"/110000)=0 then 1 else floor("area"/110000) end ncargas from (
            select 
            sd."SDHNUM_0" carga,
            sd."SHIDAT_0" "data expedição",
            sd."DLVDAT_0" "data entrega",
            sd."BPINAM_0" cliente,
            sd."BPICRY_0" "cod. país",
            sd."BPICRYNAM_0" "país",
            sd."GROWEI_0" "peso bruto",
            case when sd."MDL_0" = '1' then 'Marítimo' 
            else 
            case when sd."MDL_0" = '3' then 'Rodoviário' 
            else 
            case when sd."MDL_0" = '4' then 'Aéreo' 
            else 
            'Ferroviário'
            END
            END
            end "Modo Expedição",
            SUM("QTY_0") over (partition by sdd."SDHNUM_0") "area"
            from "SAGE-PROD"."SDELIVERY" sd
            join "SAGE-PROD"."SDELIVERYD" sdd on sd."SDHNUM_0" = sdd."SDHNUM_0"
            {f.text}
            ) t
        """
    )
    response = db.executeSimpleList(sql, connection, parameters,[])
    return Response(response)

def TempoResidenciaBobines(request, format=None):
    connection = connections[connGatewayName].cursor()
    _filter = request.data['filter'] if "filter" in request.data else {}
    _data = request.data['parameters'] if "parameters" in request.data else {}  
    _detailed = 1 if _data.get("detailed") == 1 else 0
    
    _filter["fprazo"] = 6 if _filter.get("fprazo") is None or not _filter.get("fprazo") else _filter.get("fprazo")
    _filter["fmes"] = None if _filter.get("fmes") is None or not _filter.get("fmes") else _filter.get("fmes")
    if _filter.get("fmes") is not None:
        _filter["fano"] = datetime.now().year if _filter.get("fano") is None or not _filter.get("fano") else _filter.get("fano")
    else:
        _filter["fano"] = None if _filter.get("fano") is None or not _filter.get("fano") else _filter.get("fano")

    f = Filters(_filter)
    f.setParameters({
        "mes": {"value": lambda v: v.get('fmes'), "field": lambda k, v: k},
        "ano": {"value": lambda v: v.get('fano'), "field": lambda k, v: k},
        "prazo": {"value": lambda v: v.get('fprazo'), "field": lambda k, v: k}
    }, True)
    f.where(False,"and")
    f.add(f'EXTRACT(MONTH FROM pb."timestamp") = :mes::int', lambda v: v is not None)
    f.add(f'EXTRACT(YEAR FROM pb."timestamp") = :ano::int', lambda v: v is not None)
    f.add(f"""pb."timestamp" <= current_date - interval ':prazo months'""", lambda v: v is not None)
    f.value("and")

    parameters = {**f.parameters}
    if _detailed == 0:
        sql = lambda : (
            f"""
                select 
                EXTRACT(YEAR FROM pb."timestamp") ano,
                case when pp.retrabalhada = 1 then 'DM' else 'FINAL' end palete,
                round(avg(EXTRACT(DAY FROM NOW() - pb."timestamp")),0) avg_days,
                min(EXTRACT(DAY FROM NOW() - pb."timestamp")) min_days,
                max(EXTRACT(DAY FROM NOW() - pb."timestamp")) max_days,
                round(STDDEV(EXTRACT(DAY FROM NOW() - pb."timestamp")),0) std_days,
                sum(pb."area") "area",
                STRING_AGG(distinct pb.estado, ', ') estados,
                count(*) nbobines,

                count(case when pb.estado='G' then 1 end) AS "G",
                count(case when pb.estado='DM' then 1 end) AS "DM",
                count(case when pb.estado='IND' then 1 end) AS "IND",
                count(case when pb.estado='R' then 1 end) AS "R",
                count(case when pb.estado='LAB' then 1 end) AS "LAB",
                count(case when pb.estado='HOLD' then 1 end) AS "HOLD",

                sum(con) conicas,
                sum(descen) descentradas,
                sum(presa) presas,
                sum(diam_insuf) "Diâmetro Insuficiente",
                sum(presa) presas,
                sum(case when ff_pos IS NULL OR json_array_length(ff_pos) = 0 then 0 else 1 end) "Falha Filme",
                sum(case when fc_pos IS NULL OR json_array_length(fc_pos) = 0 then 0 else 1 end) "Falha Corte",
                sum(case when furos_pos IS NULL OR json_array_length(furos_pos) = 0 then 0 else 1 end) "Furos",
                sum(case when buracos_pos IS NULL OR json_array_length(buracos_pos) = 0 then 0 else 1 end) "Buracos",
                sum(case when rugas_pos IS NULL OR json_array_length(rugas_pos) = 0 then 0 else 1 end) "Rugas",

                sum(pb.nok) "Largura NOK",
                sum(car) "Carro Atrás",
                sum(fmp) "Falha Matéria Prima",
                sum(lac) "Laçou",
                sum(ncore) "Não Colou",
                sum(suj) "Sujidade",
                sum(sbrt) "Sobretiragem",
                sum(esp) "Gramagem",
                sum(tr) "Troca Rápida",
                sum(prop) "Propriedades",
                sum(mpalete) "Marcas de Palete",
                sum(rasgo) "Rasgo",
                sum(outros) outros

                from mv_paletes pp
                join mv_bobines pb on pb.palete_id = pp.id
                where 
                pp.carga_id is null 
                and pp.disabled=0
                and pb.comp_actual > 0
                and not exists (select 1 from mv_expedicoes ex where ex."LOT_0"=pp.nome)
                {f.text}
                group by EXTRACT(YEAR FROM pb."timestamp"),pp.retrabalhada
            """
        )
    else:
        sql = lambda:(
            f"""
           select 
            EXTRACT(YEAR FROM pb."timestamp") ano,
            case when pp.retrabalhada = 1 then 'DM' else 'FINAL' end palete,
            pp.nome palete,
            pb.nome bobine,
            pb.posicao_palete,
			pb.estado,
            round(EXTRACT(DAY FROM NOW() - pb."timestamp")) ndays,
            pb."area",
            pb.comp_actual comp,
            con conica,
            descen descentrada,
            presa presa,
            diam_insuf "Diâmetro Insuficiente",
            presa,
            case when ff_pos IS NULL OR json_array_length(ff_pos) = 0 then 0 else 1 end "Falha Filme",
            case when fc_pos IS NULL OR json_array_length(fc_pos) = 0 then 0 else 1 end "Falha Corte",
            case when furos_pos IS NULL OR json_array_length(furos_pos) = 0 then 0 else 1 end "Furos",
            case when buracos_pos IS NULL OR json_array_length(buracos_pos) = 0 then 0 else 1 end "Buracos",
            case when rugas_pos IS NULL OR json_array_length(rugas_pos) = 0 then 0 else 1 end "Rugas",

            pb.nok "Largura NOK",
            car "Carro Atrás",
            fmp "Falha Matéria Prima",
            lac "Laçou",
            ncore "Não Colou",
            suj "Sujidade",
            sbrt "Sobretiragem",
            esp "Gramagem",
            tr "Troca Rápida",
            prop "Propriedades",
            mpalete "Marcas de Palete",
            rasgo "Rasgo",
            outros

            from mv_paletes pp
            join mv_bobines pb on pb.palete_id = pp.id
            where 
            pp.carga_id is null 
            and pp.nbobines_real >0
            and pp.disabled=0
            and pb.comp_actual > 0
            and not exists (select 1 from mv_expedicoes ex where ex."LOT_0"=pp.nome)
            {f.text}
            """
        )
    response = db.executeSimpleList(sql, connection, parameters,[])
    return Response(response)

def _bobinesOriginais(_filter,_data):
    connection = connections["default"].cursor()
    _parameters = {}
    if "fdata" in _filter and _filter.get("fdata") is not None:
        _parameters = {**rangeP(_filter.get('fdata'), 'data', lambda k, v: f'pbm0.{k}')}
    fs=""
    fbi=""
    if _filter.get("fbobinesid") is not None:
        fbi = f"""pb0.id in ({int_lists(_filter.get("fbobinesid"))})"""
    fbs=""
    if _filter.get("fbobines") is not None:
        fbs = f"""pb0.nome in ({string_lists(_filter.get("fbobines"))})"""
    fbms=""
    if _filter.get("fbobinagens") is not None:
        fbms = f"""pb0.bobinagem_id in ( select id from producao_bobinagem where nome in ({string_lists(_filter.get("fbobinagens"))}) )"""
    fps=""
    if _filter.get("fpaletes") is not None:
        fps = f"""pb0.palete_id in ( select id from producao_palete where nome in ({string_lists(_filter.get("fpaletes"))}) )"""
    if fbs=="" and fbms=="" and fps=="" and fbi=="" and _filter.get("fdata") is None:
        _parameters = {**rangeP(datetime.now().strftime('%Y-%m-%d'), 'data', lambda k, v: f'pbm0.{k}')}
    else:
        fs = ' or '.join(x for x in [fbi,fbs,fbms,fps] if x)
        if _parameters == {}:
            fs = f'WHERE ({fs})' if fs else ''

    f = Filters(_filter)
    f.setParameters(_parameters, True)
    f.where()
    f.auto()
    f.value("and")

    if _parameters != {}:
        fs=f"{f.text} {f'AND ({fs})' if fs else ''}"
    
    parameters = {**f.parameters}

    sql = lambda : (
        f"""
            select

            row_number() over() rowid,
            root,root_estado,emenda,emenda_lvl1,emenda_lvl2,emenda_lvl3,emenda_lvl4,
            pbm.nwsup,pbm.lotenwsup,pbm.tiponwsup,pbm.nwinf,pbm.lotenwinf,pbm.tiponwinf,

            bobine bobine0,comp0,largura0,plt.nome palete0, tb1.estado estado0,
            original_lvl1, comp1 comp1_original, (comp1 - metros) comp1_atual, metros metros_cons,largura1,estado1,plt1.nome palete1,
            original_lvl2, comp2 comp2_original, (comp2 - metros_lvl1) comp2_atual, metros_lvl1 metros_cons_lvl1,largura2,estado2,plt2.nome palete2,
            original_lvl3, comp3 comp3_original, (comp3 - metros_lvl2) comp3_atual, metros_lvl2 metros_cons_lvl2,largura3,estado3,plt3.nome palete3,
            original_lvl4, comp4 comp4_original, (comp4 - metros_lvl3) comp4_atual, metros_lvl3 metros_cons_lvl3,largura4,estado4,plt4.nome palete4,
            original_lvl5, comp5 comp5_original, (comp5 - metros_lvl4) comp5_atual, metros_lvl4 metros_cons_lvl4,largura5,estado5,plt5.nome palete5,



            b1,b2,b3,b4,b5,
            #nextl1,nextl2,nextl3,nextl4,nextl5,
            #N1,N2,N3,N4,N5,
            nretrabalhos
            #,(
            #SUM(N1) OVER (PARTITION BY bobine) +
            #SUM(N2) OVER (PARTITION BY bobine,original_lvl1) +
            #SUM(N3) OVER (PARTITION BY bobine,original_lvl1,original_lvl2) +
            #SUM(N4) OVER (PARTITION BY bobine,original_lvl1,original_lvl2,original_lvl3) +
            #SUM(N5) OVER (PARTITION BY bobine,original_lvl1,original_lvl2,original_lvl3,original_lvl4)
            #) ST

            FROM (
            select
            palete_id,           
            bobine, original_lvl1, original_lvl2, original_lvl3, original_lvl4,
            original_lvl5,
            IFNULL(original_lvl5, IFNULL(original_lvl4, IFNULL(original_lvl3, IFNULL(original_lvl2, original_lvl1)))) root,
            IFNULL(original_id_lvl5, IFNULL(original_id_lvl4, IFNULL(original_id_lvl3, IFNULL(original_id_lvl2, original_id_lvl1)))) root_id,
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
            select distinct pb0.palete_id,
            pb0.id bobine_id, pb.id original_id_lvl1,pb2.id original_id_lvl2,pb3.id original_id_lvl3, pb4.id original_id_lvl4, pb5.id original_id_lvl5,
            pb0.nome bobine, pb.nome original_lvl1,     

            pb2.nome original_lvl2,
            pb3.nome original_lvl3, pb4.nome original_lvl4, pb5.nome original_lvl5 ,  

            pb0.bobinagem_id bm0,pb0.id b0, case when pb0.comp=0 then pbm0.comp else pb0.comp end comp0,
            pb.bobinagem_id bm1,pb.id b1, case when pb.comp=0 then pbm.comp else pb.comp end comp1,
            pb2.bobinagem_id bm2,pb2.id b2, case when pb2.comp=0 then pbm2.comp else pb2.comp end comp2,
            pb3.bobinagem_id bm3,pb3.id b3, case when pb3.comp=0 then pbm3.comp else pb3.comp end comp3,
            pb4.bobinagem_id bm4,pb4.id b4, case when pb4.comp=0 then pbm4.comp else pb4.comp end comp4,
            pb5.bobinagem_id bm5,pb5.id b5, case when pb5.comp=0 then pbm5.comp else pb5.comp end comp5

            ,l0.largura largura0,l.largura largura1,l2.largura largura2,
            l3.largura largura3,l4.largura largura4,l5.largura largura5,

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
             {fs}

            ) tb0 LIMIT 50000) tb1
            left join producao_bobine pb on pb.id=root_id
            left join producao_bobinagem pbm on pbm.id=pb.bobinagem_id
            LEFT JOIN producao_palete plt on tb1.palete_id=plt.id
            LEFT JOIN producao_palete plt1 on tb1.palete_id1=plt1.id
            LEFT JOIN producao_palete plt2 on tb1.palete_id2=plt2.id
            LEFT JOIN producao_palete plt3 on tb1.palete_id3=plt3.id
            LEFT JOIN producao_palete plt4 on tb1.palete_id4=plt4.id
            LEFT JOIN producao_palete plt5 on tb1.palete_id5=plt5.id
            
        """
    )
    response = db.executeSimpleList(sql, connection, parameters,[])
    return Response(response)

def BobinesOriginais(request, format=None):
    _filter = request.data['filter'] if "filter" in request.data else {}
    _data = request.data['parameters'] if "parameters" in request.data else {}  
    return _bobinesOriginais(_filter,_data)        
    

def BobinesComOrigem(request, format=None):
    connection = connections["default"].cursor()
    _filter = request.data['filter'] if "filter" in request.data else {}
    _data = request.data['parameters'] if "parameters" in request.data else {}  
        
    _parameters = {}
    if "fdata" in _filter and _filter.get("fdata") is not None:
        _parameters = {**rangeP(_filter.get('fdata'), '`timestamp`', lambda k, v: f'date(pb.{k})')}
    fs=""
    fbs=""
    if _filter.get("fbobines") is not None:
        fbs = f"""pb.nome in ({string_lists(_filter.get("fbobines"))})"""
    fbms=""
    if _filter.get("fbobinagens") is not None:
        fbms = f"""pb.bobinagem_id in ( select id from producao_bobinagem where nome in ({string_lists(_filter.get("fbobinagens"))}) )"""
    fps=""
    if _filter.get("fpaletes") is not None:
        fps = f"""pb.palete_id in ( select id from producao_palete where nome in ({string_lists(_filter.get("fpaletes"))}) )"""
    if fbs=="" and fbms=="" and fps=="" and _filter.get("fdata") is None:
        _parameters = {**rangeP(datetime.now().strftime('%Y-%m-%d'), '`timestamp`', lambda k, v: f'date(pb.{k})')}
    else:
        fs = ' or '.join(x for x in [fbs,fbms,fps] if x)
        if _parameters == {}:
            fs = f'AND ({fs})' if fs else ''    

    f = Filters(_filter)
    f.setParameters(_parameters, True)
    f.where(False,"and")
    f.auto()
    f.value("and")

    if _parameters != {}:
        fs=f"{f.text} {f'AND ({fs})' if fs else ''}"
    
    parameters = {**f.parameters}
    dql = db.dql(request.data, False,False)

    sql = lambda : (
        f"""
            select 

            distinct IFNULL(pbl5.id, IFNULL(pbl4.id, IFNULL(pbl3.id, IFNULL(pbl4.id, pbl1.id)))) bobine_final

            from producao_bobine as pb
            left join sistema.producao_emenda peml1 on peml1.bobine_id=pb.id
            left join sistema.producao_bobinagem pbml1 on peml1.bobinagem_id = pbml1.id
            left join sistema.producao_bobine pbl1 on pbml1.id = pbl1.bobinagem_id

            left join sistema.producao_emenda peml2 on peml2.bobine_id=pbl1.id
            left join sistema.producao_bobinagem pbml2 on peml2.bobinagem_id = pbml2.id
            left join sistema.producao_bobine pbl2 on pbml2.id = pbl2.bobinagem_id

            left join sistema.producao_emenda peml3 on peml3.bobine_id=pbl2.id
            left join sistema.producao_bobinagem pbml3 on peml3.bobinagem_id = pbml3.id
            left join sistema.producao_bobine pbl3 on pbml3.id = pbl3.bobinagem_id

            left join sistema.producao_emenda peml4 on peml4.bobine_id=pbl3.id
            left join sistema.producao_bobinagem pbml4 on peml4.bobinagem_id = pbml4.id
            left join sistema.producao_bobine pbl4 on pbml4.id = pbl4.bobinagem_id

            left join sistema.producao_emenda peml5 on peml5.bobine_id=pbl4.id
            left join sistema.producao_bobinagem pbml5 on peml5.bobinagem_id = pbml5.id
            left join sistema.producao_bobine pbl5 on pbml5.id = pbl5.bobinagem_id
            where 
            pbl1.nome is not null
            {fs}
        """
    )
    response = db.executeSimpleList(sql, connection, parameters,[])
    bobines_id = ",".join(str(d['bobine_final']) for d in response["rows"])
    return _bobinesOriginais({"fbobinesid":bobines_id},{})

def _paletesList(_filter,_data):
    connection = connections["default"].cursor()
    _parameters = {}
    if "fdata" in _filter and _filter.get("fdata") is not None:
        _parameters = {**rangeP(_filter.get('fdata'), 'data_pal', lambda k, v: f'sgppl.{k}')}
    fs=""
    fbi=""
    if _filter.get("fbobinesid") is not None:
        fbi = f"""sgppl.id in (select palete_id from producao_bobine pb where pb.id in ({int_lists(_filter.get("fbobinesid"))}))"""
    fbs=""
    if _filter.get("fbobines") is not None:
        fbs = f"""sgppl.id in (select palete_id from producao_bobine pb where pb.nome in ({string_lists(_filter.get("fbobines"))}))"""
    fbms=""
    if _filter.get("fbobinagens") is not None:
        fbms = f"""sgppl.id in (select distinct pb.palete_id from producao_bobine pb where pb.bobinagem_id in(select pbm.id from producao_bobinagem pbm where pbm.nome in ({string_lists(_filter.get("fbobinagens"))})))"""
    fps=""
    if _filter.get("fpaletes") is not None:
        fps = f"""sgppl.nome in ({string_lists(_filter.get("fpaletes"))})"""
    if fbs=="" and fbms=="" and fps=="" and fbi=="" and _filter.get("fdata") is None:
        _parameters = {**rangeP(datetime.now().strftime('%Y-%m-%d'), 'data_pal', lambda k, v: f'sgppl.{k}')}
    else:
        fs = ' or '.join(x for x in [fbi,fbs,fbms,fps] if x)
        if _parameters == {}:
            fs = f'and ({fs})' if fs else ''

    f = Filters(_filter)
    f.setParameters(_parameters, True)
    f.where(False,"and")
    f.auto()
    f.value("and")

    if _parameters != {}:
        fs=f"{f.text} {f'and ({fs})' if fs else ''}"
    
    parameters = {**f.parameters}

    sql = lambda : (
        f"""
            SELECT 
            distinct 
            sgppl.nome,pa.cod artigo_cod,pa.des artigo_des, pb.estado artigo_estado,#artigos.*,
            sgppl.`timestamp`, sgppl.data_pal, sgppl.area_real area_palete, sum(pb.comp_actual*(pb.lar/1000)) over (partition by pb.palete_id,pb.artigo_id,pb.estado) area,
            sgppl.nbobines_real num_bobines, sgppl.nbobines_emendas,sgppl.nbobines_sem_destino,
            sgppl.comp_real comp,sgppl.diam_avg, sgppl.diam_max, sgppl.diam_min,
            sgppl.peso_bruto,sgppl.peso_palete, sgppl.peso_liquido,
            sgppl.retrabalhada,sgppl.stock, sgppl.num_palete_carga, sgppl.destino,sgppl.destinos,
            sgppl.nok_estados, sgppl.nok, sgppl.lvl, pcarga.carga, po1.ofid AS ofid_original, po2.ofid, po1.op AS op_original,
            po2.op, pc.cod AS cliente_cod, pc.name AS cliente_nome, pc.limsup AS cliente_limsup, pc.liminf AS cliente_liminf,
            pc.diam_ref AS cliente_diamref,pt.prf_cod prf,pt.order_cod iorder
            FROM producao_palete sgppl
            join producao_bobine pb on pb.palete_id = sgppl.id and pb.recycle=0 and pb.comp_actual>0
            join producao_artigo pa on pa.id=pb.artigo_id
            LEFT JOIN producao_carga pcarga ON pcarga.id = sgppl.carga_id
            LEFT JOIN producao_cliente pc ON pc.id = sgppl.cliente_id
            LEFT JOIN planeamento_ordemproducao po1 ON po1.id = sgppl.ordem_id_original
            LEFT JOIN planeamento_ordemproducao po2 ON po2.id = sgppl.ordem_id
            LEFT JOIN producao_tempordemfabrico pt ON pt.id = po2.draft_ordem_id
            #json_table(sgppl.artigo,'$[*]'columns(artigo_cod VARCHAR(30) PATH "$.cod",artigo_estado VARCHAR(10) PATH "$.estado", artigo_des VARCHAR(200) PATH "$.des")) artigos
            WHERE sgppl.nbobines_real>0 and sgppl.disabled=0 
            {fs}          
        """
    )
    response = db.executeSimpleList(sql, connection, parameters,[])
    return Response(response)

def PaletesList(request, format=None):
    _filter = request.data['filter'] if "filter" in request.data else {}
    _data = request.data['parameters'] if "parameters" in request.data else {}  
    return _paletesList(_filter,_data)    

def _bobinesList(_filter,_data):
    connection = connections["default"].cursor()
    _parameters = {}
    if "fdata" in _filter and _filter.get("fdata") is not None:
        _parameters = {**rangeP(_filter.get('fdata'), '`timestamp`', lambda k, v: f'date(pb.{k})')}
    fs=""
    fbi=""
    if _filter.get("fbobinesid") is not None:
        fbi = f"""pb.id in ({int_lists(_filter.get("fbobinesid"))})"""
    fbs=""
    if _filter.get("fbobines") is not None:
        fbs = f"""pb.nome in ({string_lists(_filter.get("fbobines"))})"""
    fbms=""
    if _filter.get("fbobinagens") is not None:
        fbms = f"""pb.bobinagem_id in(select pbm.id from producao_bobinagem pbm where pbm.nome in ({string_lists(_filter.get("fbobinagens"))}))"""
    fps=""
    if _filter.get("fpaletes") is not None:
        fps = f"""sgppl.nome in ({string_lists(_filter.get("fpaletes"))})"""
    if fbs=="" and fbms=="" and fps=="" and fbi=="" and _filter.get("fdata") is None:
        _parameters = {**rangeP(datetime.now().strftime('%Y-%m-%d'), '`timestamp`', lambda k, v: f'date(pb.{k})')}
    else:
        fs = ' or '.join(x for x in [fbi,fbs,fbms,fps] if x)
        if _parameters == {}:
            fs = f'and ({fs})' if fs else ''

    f = Filters(_filter)
    f.setParameters(_parameters, True)
    f.where(False,"and")
    f.auto()
    f.value("and")

    if _parameters != {}:
        fs=f"{f.text} {f'and ({fs})' if fs else ''}"
    
    parameters = {**f.parameters}

    sql = lambda : (
        f"""
            SELECT 
            pb.nome,pb.posicao_palete,sgppl.nome palete_nome,pb.`timestamp`,pb.comp_actual*(pb.lar/1000) area,pb.comp_actual,pb.estado,pb.designacao_prod,pb.lar,pb.core,pb.recycle,pb.destino,
            pa.cod artigo_cod,pa.des artigo_des,
            #artigos.*,
            sgppl.`timestamp` palete_timestamp, sgppl.data_pal, sgppl.area_real area_palete,
            sgppl.nbobines_real num_bobines, sgppl.nbobines_emendas,sgppl.nbobines_sem_destino,
            sgppl.comp_real comp_palete,sgppl.diam_avg, sgppl.diam_max, sgppl.diam_min,
            sgppl.peso_bruto,sgppl.peso_palete, sgppl.peso_liquido,
            sgppl.retrabalhada,sgppl.stock, sgppl.num_palete_carga, sgppl.destino,sgppl.destinos,
            sgppl.nok_estados, sgppl.nok, sgppl.lvl, pcarga.carga, po1.ofid AS ofid_original, po2.ofid, po1.op AS op_original,
            po2.op, pc.cod AS cliente_cod, pc.name AS cliente_nome, pc.limsup AS cliente_limsup, pc.liminf AS cliente_liminf,
            pc.diam_ref AS cliente_diamref,pt.prf_cod prf,pt.order_cod iorder
            FROM producao_bobine pb
            join producao_artigo pa on pa.id = pb.artigo_id
            LEFT JOIN producao_palete sgppl ON sgppl.id=pb.palete_id
            LEFT JOIN producao_carga pcarga ON pcarga.id = sgppl.carga_id
            LEFT JOIN producao_cliente pc ON pc.id = sgppl.cliente_id
            LEFT JOIN planeamento_ordemproducao po1 ON po1.id = sgppl.ordem_id_original
            LEFT JOIN planeamento_ordemproducao po2 ON po2.id = sgppl.ordem_id
            LEFT JOIN producao_tempordemfabrico pt ON pt.id = po2.draft_ordem_id
            WHERE pb.recycle=0 and pb.comp_actual>0 and sgppl.nbobines_real>0 and sgppl.disabled=0 
            {fs}          
        """
    )
    response = db.executeSimpleList(sql, connection, parameters,[])
    return Response(response)

def BobinesList(request, format=None):
    _filter = request.data['filter'] if "filter" in request.data else {}
    _data = request.data['parameters'] if "parameters" in request.data else {}  
    return _bobinesList(_filter,_data)    

def PaletesListx(request, format=None):
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
    try:
        response = db.executeSimpleList(sql, connection, parameters,[])
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)