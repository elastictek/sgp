import base64
from operator import eq
from pyexpat import features
import re
from typing import List
from wsgiref.util import FileWrapper
from rest_framework.views import APIView
from django.http import Http404, request
from rest_framework.response import Response
from django.http.response import HttpResponse
from django.http import FileResponse
from rest_framework import status
import mimetypes
from datetime import datetime, timedelta
import pandas as pd
# import cups
import os, tempfile
from collections import Counter
from requests.auth import HTTPBasicAuth

from pyodbc import Cursor, Error, connect, lowercase
from datetime import datetime
from django.http.response import JsonResponse
from rest_framework.decorators import api_view, authentication_classes, permission_classes, renderer_classes
from django.db import connections, transaction
from support.database import encloseColumn, Filters, DBSql, TypeDml, fetchall,fetchone, Check
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
from producao.api.currentsettings import checkCurrentSettings,updateCurrentSettings,changeStatus


connGatewayName = "postgres"
connMssqlName = "sqlserver"
dbgw = DBSql(connections[connGatewayName].alias)
sgpAlias = dbgw.dbAlias.get("sgp")
sageAlias = dbgw.dbAlias.get("sage")
db = DBSql(connections["default"].alias)
dbmssql = DBSql(connections[connMssqlName].alias)
mv_ofabrico_list = "mv_ofabrico_listv2"

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

def soapEnvelope(lang,pool,requestCfg,publicName,body):
   envelope = f"""<?xml version=\"1.0\" encoding=\"utf-8\"?>
<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wss="http://www.adonix.com/WSS">
   <soapenv:Header/>
   <soapenv:Body>
      <wss:run soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <callContext xsi:type="wss:CAdxCallContext">
            <codeLang xsi:type="xsd:string">{lang}</codeLang>
            <poolAlias xsi:type="xsd:string">{pool}</poolAlias>
            <poolId xsi:type="xsd:string"></poolId>
            <requestConfig xsi:type="xsd:string">{requestCfg}</requestConfig>
         </callContext>
         <publicName xsi:type="xsd:string">{publicName}</publicName>
         <inputXml xsi:type="xsd:string">
         <![CDATA[<?xml version="1.0" encoding="UTF-8"?>
         <PARAM>
            {body}
		</PARAM>
         ]]>
         </inputXml>
      </wss:run>
   </soapenv:Body>
</soapenv:Envelope>
"""
   return envelope


#region ADD RECICLADO TO SAGE WORK ORDER PRODUCTION REPORTING
def SyncRecicladoProductionReport(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")

    gp = {
        "MFGFCY":"E01",
        "UOMCPLQTY":1,
        "UOM":"KG",
        "UOMSTUCOE":1,
        "PM3":0,
        "PM4":0,
        "PCUSTUCOE":1,
        "PCU":"KG",
        "LOC":"ARM",
        "STA":"A",
        "ITMREF":"R00000000000001"
    }

    def getRecicladoToReport(cursor):
        f = Filters({})
        f.where()
        rows = db.executeSimpleList(lambda: (f"""
            select 
                distinct 
                t.id,
                t.data,
                t.data_rec,
                t.lote,
                t.of_id,
                po.ofid ofabrico,
                count(*) over (partition by t.lote,t.of_id) n_bobinagens,
                count(*) over (partition by t.lote) n_bobinagens_total,
                sum(t.area) over (partition by t.lote,t.of_id) area,
                sum(t.area) over (partition by t.lote) area_total,
                round(t.peso*round((sum(t.area) over (partition by t.lote,t.of_id) * 1) / (sum(t.area) over (partition by t.lote)),8),2) peso,
                t.peso peso_total
            from (
                select 
                distinct sum(pb2.area) over (partition by pr.id,(case when pb.ordem_id <> pp.ordem_id then pp.ordem_id else pb.ordem_id end)) area,
                date(pr.`timestamp_edit`) `data`,
                DATE_FORMAT(pr.`timestamp_edit`, '%%Y%%m%%d') data_rec,
                pr.peso,pr.tara,
                pr.id,pr.lote, case when pb.ordem_id <> pp.ordem_id then pp.ordem_id else pb.ordem_id end of_id	
                from producao_bobine pb 
                join producao_bobinagem pb2 on pb2.id=pb.bobinagem_id
                join producao_palete pp on pb.palete_id =pp.id
                join producao_reciclado pr on pr.status=1 and pb.`timestamp`>=pr.`timestamp` and pb.`timestamp` <=pr.timestamp_edit
                where (pr.reported is null or pr.reported=0) and agg_of_id is not null
            ) t
            join planeamento_ordemproducao po on po.id=t.of_id
        """), cursor, f.parameters).get("rows")
        if rows is not None and len(rows)>0:
            return rows
        return None
    


    def updateReport(id,cursor):
        print("reportingggg")
        print(id)
        dml = db.dml(TypeDml.UPDATE, {"reported":1}, "producao_reciclado",{"id":Filters.getNumeric(id)},None,None)
        db.execute(dml.statement, cursor, dml.parameters)
        

    def _sendSAGE(body):
        http_auth = HTTPBasicAuth(AppSettings.soapSage.get("username"), AppSettings.soapSage.get("password"))
        envelope = soapEnvelope(AppSettings.soapSage.get("lang"),AppSettings.soapSage.get("pool"),AppSettings.soapSage.get("requestCfg"),"WS_MKI",body)
        # POST request
        response = None
        try:
            response = requests.post(AppSettings.soapSage.get("url"), headers=AppSettings.soapSage.get("headers"), data=envelope, auth=http_auth)
            if response:
                return [response.status_code,response.json()]
        except Exception as error:
            return str(error)

    try:
        calls = {}
        with connections["default"].cursor() as cursor:
            reciclado = getRecicladoToReport(cursor)
            if not reciclado or len(reciclado)==0:
                return Response({"status": "error", "title": "Não foram encontrados lotes de reciclado a reportar!"})
            else:
                for idx, v in enumerate(reciclado):
                    key = f"""{v.get("data")}-{v.get("of_id")}"""
                    if not key in calls:
                        calls[key] = {"bodyh":"","bodyd":[]}
                        calls[key]["bodyh"] = f"""
                        <GRP ID="GRP1">
                            <FLD NAME="MFGFCY">{ifNull(data.get("fcy"),gp.get("MFGFCY"))}</FLD>
                            <FLD NAME="MFGNUM">{v.get("ofabrico")}</FLD>
                            <FLD NAME="ITMREF">{gp.get("ITMREF")}</FLD>
                            <FLD NAME="UOMCPLQTY">{gp.get("UOMCPLQTY")}</FLD>
                            <FLD NAME="UOM">{gp.get("UOM")}</FLD>
                            <FLD NAME="UOMSTUCOE">{gp.get("UOMSTUCOE")}</FLD>
                            <FLD NAME="MFGTRKNUM"></FLD>
                            <FLD NAME="PM1">{v.get("data_rec")}</FLD>
                            <FLD NAME="PM2"></FLD>
                            <FLD NAME="PM3">{gp.get("PM3")}</FLD>
                            <FLD NAME="PM4">{gp.get("PM4")}</FLD>
                        </GRP>
                        """
                    calls[key]["bodyd"].append(f"""
                    <LIN NUM="{len(calls[key]["bodyd"])+1}">
                        <FLD NAME="PCU">{gp.get("PCU")}</FLD>
                        <FLD NAME="QTYPCU">{v.get("peso")}</FLD>
                        <FLD NAME="PCUSTUCOE">{gp.get("PCUSTUCOE")}</FLD>
                        <FLD NAME="LOC">{ifNull(data.get("loc"),gp.get("LOC"))}</FLD>
                        <FLD NAME="STA">{ifNull(data.get("sta"),gp.get("STA"))}</FLD>
                        <FLD NAME="LOT">{v.get("lote")}</FLD>
                        <FLD NAME="SLO"></FLD>
                        <FLD NAME="PALNUM"></FLD>
                        <FLD NAME="CTRNUM"></FLD>
                    </LIN>
                    """)
                    calls[key]["id"] = v.get("id")
                report = []
                for key, value in calls.items():
                    body = value.get("bodyh")
                    body += f"""
                    <TAB ID="GRP2" SIZE="{len(value.get("bodyd"))}">
                    """
                    body+="".join(value.get("bodyd"))
                    body += f"""
                    </TAB>
                    <GRP ID="GRP3">
                        <FLD NAME="SHLDAT"></FLD>
                    </GRP>
                    """
                    status = None
                    if data.get("run") == 1:
                        status = _sendSAGE(body)
                        print("REQUEST")
                        print(body)
                        print("------------------------------------------------")
                        print(status)
                    #if status and isinstance(status, list):
                    #    if status[0] == 200:
                    #if status:
                    updateReport(value.get("id"),cursor)
                        #report.append(status[1])
                        #print(status[0])
                        #print(status[1])
                
                if data.get("run") == 1:
                    return Response({"status": "success", "title": "Sincronização do relatório de produção efetuada com Sucesso!", "report":json.dumps(report,default=str), "calls":json.dumps(calls,default=str)})
                else:
                    return Response({"status": "success", "title": "Simulação de reporte do relatório de produção efetuada com Sucesso!", "calls":json.dumps(calls,default=str)})
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})


#endregion

#region ADD PALETES TO SAGE WORK ORDER PRODUCTION REPORTING
def SyncProdutoAcabadoProductionReport(request, format=None):
    data = request.data.get("parameters")
    filter = request.data.get("filter")

    gp = {
        "MFGFCY":"E01",
        "UOMCPLQTY":1,
        "UOM":"M2",
        "UOMSTUCOE":1,
        "PM3":0,
        "PM4":0,
        "PCUSTUCOE":1,
        "PCU":"M2",
        "LOC":"ARM",
        "STA":"A"
    }
    
    def checkOrdemFabrico(of_id,cursor):
        f = Filters({"of_id": of_id})
        f.where()
        f.add(f'agg_of_id = (select agg_of_id from producao_tempordemfabrico pt where id = :of_id)', True )
        #f.add(f'`status` = 9', True )
        f.value("and")
        exists = db.exists("producao_currentsettings", f, cursor).exists
        return exists

    # def getNotReportedPaletesOrdem(op_id,cursor):
    #      f = Filters({"id":op_id})
    #      f.where()
    #      f.add(f'(reported is null or reported=0) and ordem_id = :id',True )
    #      f.value("and")
    #      rows = db.executeSimpleList(lambda: (f'''
    #         SELECT nome,area 
    #         FROM producao_palete {f.text}
    #     '''), cursor, f.parameters).get("rows")
    #      if rows is not None and len(rows)>0:
    #          return rows
    #      return None
    
    def getPaletesOrdem(op_id,ip_date,cursor):
         f = Filters({"id":op_id,"ipdate":ip_date})
         f.where()
         f.add(f'pp.nok = 0 and pp.ordem_id = :id',True )
         f.value("and")
         print("bbbbb")
         rows = db.executeSimpleList(lambda: (f"""
            SELECT pp.nome,
            CASE WHEN pp.artigo->>'$[0].cod' = 'EEEEFTACPAAR000061' THEN 
				CASE WHEN pef.area is null then pp.peso_liquido/(pa.gsm/1000) else pef.peso_liquido/(pef.gsm/1000) end
			ELSE 
				CASE WHEN pef.area IS NULL THEN pp.area ELSE pef.area end
            end area,
            DATE_FORMAT(pp.data_pal, '%%Y%%m%%d') data_pal,
            DATE_FORMAT(pp.data_pal, '%%Y-%%m-%%d') data
            FROM producao_palete pp
            left join producao_etiquetafinal pef ON pp.id = pef.palete_id and pef.activa=1
            left join producao_artigo pa on pa.cod = pp.artigo->>'$[0].cod'
            {f.text}
            order by pp.data_pal,pp.timestamp
        """), cursor, f.parameters).get("rows")
         print(f"""
            SELECT pp.nome,
            CASE WHEN pp.artigo->>'$[0].cod' = 'EEEEFTACPAAR000061' THEN 
				CASE WHEN pef.area is null then pp.peso_liquido/(pa.gsm/1000) else pef.peso_liquido/(pef.gsm/1000) end
			ELSE 
				CASE WHEN pef.area IS NULL THEN pp.area ELSE pef.area end
            end area,
            DATE_FORMAT(pp.data_pal, '%%Y%%m%%d') data_pal,
            DATE_FORMAT(pp.data_pal, '%%Y-%%m-%%d') data
            FROM producao_palete pp
            left join producao_etiquetafinal pef ON pp.id = pef.palete_id and pef.activa=1
            left join producao_artigo pa on pa.cod = pp.artigo->>'$[0].cod'
            {f.text}
            order by pp.data_pal,pp.timestamp
        """)
         print(f.parameters)
         if rows is not None and len(rows)>0:
             return rows
         return None
    
    def getReportedPaletes(paletes_list,cursor):
         rows = dbmssql.executeSimpleList(lambda: (f'''
            select s.LOT_0 
            from ELASTICTEK.STOJOU s 
            WHERE s.LOT_0 in ({paletes_list}) AND s.VCRTYP_0 = 15  
            GROUP BY s.LOT_0
            having SUM(s.QTYPCU_0)>0
        '''), cursor, {}).get("rows")
         if rows is not None and len(rows)>0:
             return rows
         return None

    def updateReport(op_id,data_palete,cursor):
        dml = db.dml(TypeDml.UPDATE, {"reported":1}, "producao_palete",{"ordem_id":Filters.getNumeric(op_id),"data_pal":f"=={data_palete}"},None,None)
        db.execute(dml.statement, cursor, dml.parameters)
        #dml = db.dml(TypeDml.UPDATE, {"reported_paletes":1}, "planeamento_ordemproducao",{"id":Filters.getNumeric(op_id)},None,None)
        #db.execute(dml.statement, cursor, dml.parameters)

    def _sendSAGE(body):
        http_auth = HTTPBasicAuth(AppSettings.soapSage.get("username"), AppSettings.soapSage.get("password"))
        envelope = soapEnvelope(AppSettings.soapSage.get("lang"),AppSettings.soapSage.get("pool"),AppSettings.soapSage.get("requestCfg"),"WS_MKI",body)
        # POST request
        response = None
        try:
            response = requests.post(AppSettings.soapSage.get("url"), headers=AppSettings.soapSage.get("headers"), data=envelope, auth=http_auth)
            if response:
                return [response.status_code,response.json()]
        except Exception as error:
            return str(error)

    try:
        calls = {}
        to_report = {}
        with connections["default"].cursor() as cursor:
            checkordem = checkOrdemFabrico(data.get("temp_ofabrico"),cursor)
            if (checkordem):
                paletes_ordem = getPaletesOrdem(data.get("ofabrico_sgp"),data.get("ip_date"),cursor)
                if paletes_ordem and len(paletes_ordem)>0:
                    pstr = ','.join(f"'{item['nome']}'" for item in paletes_ordem)
                    with connections[connMssqlName].cursor() as cgw:
                        reported_paletes = getReportedPaletes(pstr,cgw)
                    if reported_paletes is None:
                        reported_paletes = []
                    else:
                        reported_paletes = [item['LOT_0'] for item in reported_paletes if 'LOT_0' in item]

                    #paletes = paletes_ordem
                    paletes = [item for item in paletes_ordem if item['nome'] not in reported_paletes]
                    print("Eeeeeeeeeee")
                    if not paletes and len(paletes)==0:
                        return Response({"status": "error", "title": "Não foram encontradas paletes a reportar!"})
                    else:
                        for idx, v in enumerate(paletes):
                            if not v.get("data") in calls:
                                to_report[v.get("data")]={"h":{
                                    "FCY":ifNull(data.get("fcy"),gp.get("MFGFCY")),
                                    "MFG":data.get("ofabrico"),
                                    "ITM":data.get("item"),
                                    "QTY":gp.get("UOMCPLQTY")
                                }}
                                calls[v.get("data")] = {"bodyh":"","bodyd":[]}
                                calls[v.get("data")]["bodyh"] = f"""
                                <GRP ID="GRP1">
                                    <FLD NAME="MFGFCY">{ifNull(data.get("fcy"),gp.get("MFGFCY"))}</FLD>
                                    <FLD NAME="MFGNUM">{data.get("ofabrico")}</FLD>
                                    <FLD NAME="ITMREF">{data.get("item")}</FLD>
                                    <FLD NAME="UOMCPLQTY">{gp.get("UOMCPLQTY")}</FLD>
                                    <FLD NAME="UOM">{gp.get("UOM")}</FLD>
                                    <FLD NAME="UOMSTUCOE">{gp.get("UOMSTUCOE")}</FLD>
                                    <FLD NAME="MFGTRKNUM"></FLD>
                                    <FLD NAME="PM1">{v.get("data_pal")}</FLD>
                                    <FLD NAME="PM2"></FLD>
                                    <FLD NAME="PM3">{gp.get("PM3")}</FLD>
                                    <FLD NAME="PM4">{gp.get("PM4")}</FLD>
                                </GRP>
                                """
                            calls[v.get("data")]["bodyd"].append(f"""
                            <LIN NUM="{len(calls[v.get("data")]["bodyd"])+1}">
                                <FLD NAME="PCU">{gp.get("PCU")}</FLD>
                                <FLD NAME="QTYPCU">{v.get("area")}</FLD>
                                <FLD NAME="PCUSTUCOE">{gp.get("PCUSTUCOE")}</FLD>
                                <FLD NAME="LOC">{ifNull(data.get("loc"),gp.get("LOC"))}</FLD>
                                <FLD NAME="STA">{ifNull(data.get("sta"),gp.get("STA"))}</FLD>
                                <FLD NAME="LOT">{v.get("nome")}</FLD>
                                <FLD NAME="SLO"></FLD>
                                <FLD NAME="PALNUM"></FLD>
                                <FLD NAME="CTRNUM"></FLD>
                            </LIN>
                            """)
                        report = []
                        for key, value in calls.items():
                            body = value.get("bodyh")
                            body += f"""
                            <TAB ID="GRP2" SIZE="{len(value.get("bodyd"))}">
                            """
                            body+="".join(value.get("bodyd"))
                            body += f"""
                            </TAB>
                            <GRP ID="GRP3">
                                <FLD NAME="SHLDAT"></FLD>
                            </GRP>
                            """
                            status = None
                            if data.get("run") == 1:
                                status = _sendSAGE(body)
                                print("REQUEST")
                                print(body)
                                print("------------------------------------------------")
                                print(status)
                            if status and isinstance(status, list):
                                if status[0] == 200:
                                    updateReport(data.get("ofabrico_sgp"),key,cursor)
                                report.append(status[1])
                                print(status[0])
                                print(status[1])
                        
                        if data.get("run") == 1:
                            return Response({"status": "success", "title": "Sincronização do relatório de produção efetuada com Sucesso!", "report":json.dumps(report,default=str), "calls":json.dumps(calls,default=str)})
                        else:
                            return Response({"status": "success", "title": "Simulação de reporte do relatório de produção efetuada com Sucesso!", "calls":json.dumps(calls,default=str)})
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})



#endregion