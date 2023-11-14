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
import subprocess
from datetime import datetime, timedelta, timezone
from support.myUtils import download_file_stream
#TO UNCOMMENT ON PRODUCTION
try:
    import cups
except ModuleNotFoundError:
    # Error handling
    pass
###########################
import os, tempfile
import pytz

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

reportServer = AppSettings.reportServer["default"]

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


def ExportFile(request, format=None):
    p = request.data["parameters"]
    req = {**p}
    fstream = requests.post(f'{reportServer}/run', json=req)
    if (fstream.status_code==200):
        resp =  HttpResponse(fstream.content, content_type=fstream.headers["Content-Type"])
        if (p["export"] == "pdf"):
            resp['Content-Disposition'] = "inline; filename=list.pdf"
        elif (p["export"] == "excel"):
            resp['Content-Disposition'] = "inline; filename=list.xlsx"
        elif (p["export"] == "word"):
            resp['Content-Disposition'] = "inline; filename=list.docx"
        return resp

def PrintNwsEtiquetas(request,format=None):
    #Canon_iR-ADV_C3720_UFR_II
    data = request.data["parameters"]
    tmp = tempfile.NamedTemporaryFile()
    tstamp = datetime.now()
    fstream = requests.post(f'{reportServer}/run', json={
        "config":"default",
        "conn-name":"MYSQL-SGP",
        "name":data.get("name"),
        "path":data.get("path"),
        "export":"pdf",
        "data":{      
            "tstamp":tstamp.strftime("%Y-%m-%d %H:%M:%S"),
            "ids":data.get("ids")
        }
    })
    try:
        if "download" in data:
            return download_file_stream(fstream,"ETIQUETA-NW","application/pdf")
        else:
            print(tmp.name)
            tmp.write(fstream.content)
            #TO UNCOMMENT ON PRODUCTION
            #conn = cups.Connection()
            #conn.printFile(request.data["parameters"]["impressora"],tmp.name,"",{"copies":str(data["num_copias"])})
            for i in range(0, data["num_copias"]):
                subprocess.run(['lp', '-n', str(1), '-d', request.data["parameters"]["impressora"], tmp.name])
            # ###########################
    except Exception as error:
          print("error----> print")
          print(error)
          return Response({"status": "error", "id":None, "title": f'Erro ao imprimir Etiqueta!', "subTitle":error})
    finally:
        #TO UNCOMMENT ON PRODUCTION
        tmp.close()
        ###########################
        print("PRINT OK")
        #os.unlink(tmp.name)
    return Response({"status": "success", "id":None, "title": f'Etiqueta Impressa com Sucesso!', "subTitle":None})

def PrintPaleteEtiqueta(request,format=None):
    #Canon_iR-ADV_C3720_UFR_II
    data = request.data["parameters"]
    tmp = tempfile.NamedTemporaryFile()
    tstamp = datetime.now()
    fstream = requests.post(f'{reportServer}/run', json={
        "config":"default",
        "conn-name":"MYSQL-SGP",
        "name":data.get("name"),
        "path":data.get("path"),
        "export":"pdf",
        "data":{      
            "tstamp":tstamp.strftime("%Y-%m-%d %H:%M:%S"),
            "palete_id":data.get("id"),
            "user":data.get("user")
        }
    })
    try:
        if "download" in data:
            return download_file_stream(fstream,f"""PALETE-{data.get("palete_nome")}""","application/pdf")
        else:
            print(tmp.name)
            tmp.write(fstream.content)
            #TO UNCOMMENT ON PRODUCTION
            #conn = cups.Connection()
            #conn.printFile(request.data["parameters"]["impressora"],tmp.name,"",{"copies":str(data["num_copias"])}) 
            for i in range(0, data["num_copias"]):
                subprocess.run(['lp', '-n', str(1), '-d', request.data["parameters"]["impressora"], tmp.name])
            # ###########################
    except Exception as error:
          print("error----> print")
          print(error)
          return Response({"status": "error", "id":None, "title": f'Erro ao imprimir Etiqueta!', "subTitle":error})
    finally:
        #TO UNCOMMENT ON PRODUCTION
        tmp.close()
        ###########################
        print("PRINT OK")
        #os.unlink(tmp.name)
    return Response({"status": "success", "id":None, "title": f'Etiqueta Impressa com Sucesso!', "subTitle":None})

def PrintMPBufferEtiqueta(request,format=None):
    #Canon_iR-ADV_C3720_UFR_II
    tmp = tempfile.NamedTemporaryFile()
    print(tmp)
    print(tmp.name)

    #UTC TO LISBON TIME
    tzutc = pytz.timezone('UTC')
    tz = pytz.timezone('Europe/Lisbon')
    cdate = datetime.fromisoformat(request.data["parameters"]["CREDATTIM_0"])
    utc_time = tzutc.localize(cdate)
    ###################
    fstream = requests.post(f'{reportServer}/run', json={
        "config":"default",
        "conn-name":"MYSQL-SGP",
        "name":"ETIQUETAS-BUFFER",
        "path":"ETIQUETAS/MP-BUFFER",
        "export":"pdf",
        "data":{      
            "artigo_cod":request.data["parameters"]["ITMREF_0"],
            "n_lote":request.data["parameters"]["LOT_0"],
            "artigo_des":request.data["parameters"]["ITMDES1_0"],
            "unit":request.data["parameters"]["PCU_0"],
            "qty":float(request.data["parameters"]["QTYPCU_0"]),
            "vcr_num":request.data["parameters"]["VCRNUM_0"],
            "loc":request.data["parameters"]["LOC_0"],
            "obs":request.data["parameters"]["obs"] if "obs" in request.data["parameters"] else None,
            "data_buffer":utc_time.astimezone(tz).strftime("%Y-%m-%d %H:%M:%S")            
        }
    })
    try:
        if "download" in request.data["parameters"]:
            return download_file_stream(fstream,f"""MP-{request.data["parameters"].get("LOT_0")}""","application/pdf")
        else:
            print(tmp.name)
            tmp.write(fstream.content)
            #TO UNCOMMENT ON PRODUCTION
            #conn = cups.Connection()
            #conn.printFile(request.data["parameters"]["impressora"],tmp.name,"",{"copies":str(request.data["parameters"]["num_copias"])}) 
            for i in range(0, request.data["parameters"]["num_copias"]):
                subprocess.run(['lp', '-n', str(1), '-d', request.data["parameters"]["impressora"], tmp.name])
            ###########################
    except Exception as error:
          print("error----> print")
          print(error)
          return Response({"status": "error", "id":None, "title": f'Erro ao imprimir Etiqueta!', "subTitle":error})
    finally:
        #TO UNCOMMENT ON PRODUCTION
        tmp.close()
        ###########################
        print("PRINT OK")
        #os.unlink(tmp.name)
    return Response({"status": "success", "id":None, "title": f'Etiqueta Impressa com Sucesso!', "subTitle":None})


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def PrintMPBuffer(request,format=None):
    #Canon_iR-ADV_C3720_UFR_II
    tmp = tempfile.NamedTemporaryFile()
    print(tmp)
    print(tmp.name)

    #UTC TO LISBON TIME
    tzutc = pytz.timezone('UTC')
    tz = pytz.timezone('Europe/Lisbon')
    cdate = datetime.fromisoformat(request.data["parameters"]["CREDATTIM_0"])
    utc_time = tzutc.localize(cdate)
    ###################

    fstream = requests.post(f'{reportServer}/run', json={
        "config":"default",
        "conn-name":"MYSQL-SGP",
        "name":"ETIQUETAS-BUFFER",
        "path":"ETIQUETAS/MP-BUFFER",
        "export":"pdf",
        "data":{      
            "artigo_cod":request.data["parameters"]["ITMREF_0"],
            "n_lote":request.data["parameters"]["LOT_0"],
            "artigo_des":request.data["parameters"]["ITMDES1_0"],
            "unit":request.data["parameters"]["PCU_0"],
            "qty":float(request.data["parameters"]["QTYPCU_0"]),
            "vcr_num":request.data["parameters"]["VCRNUM_0"],
            "loc":request.data["parameters"]["LOC_0"],
            "obs":request.data["parameters"]["obs"] if "obs" in request.data["parameters"] else None,
            "data_buffer":utc_time.astimezone(tz).strftime("%Y-%m-%d %H:%M:%S")            
        }
    })
    try:
        print(tmp.name)
        tmp.write(fstream.content)
        #TO UNCOMMENT ON PRODUCTION
        #conn = cups.Connection()
        #conn.printFile(request.data["parameters"]["impressora"],tmp.name,"",request.data["parameters"]["num_copias"])
        for i in range(0, request.data["parameters"]["num_copias"]):
            subprocess.run(['lp', '-n', str(1), '-d', request.data["parameters"]["impressora"], tmp.name])
        ###########################
    except Exception as error:
          print("error----> print")
          print(error)
          return Response({"status": "error", "id":None, "title": f'Erro ao imprimir Etiqueta!', "subTitle":error})
    finally:
        #TO UNCOMMENT ON PRODUCTION
        tmp.close()
        ###########################
        print("PRINT OK")
        #os.unlink(tmp.name)
    return Response({"status": "success", "id":None, "title": f'Etiqueta Impressa com Sucesso!', "subTitle":None})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def PrintEtiqueta(request, format=None):
    conn = connections["default"].cursor()
    data = request.data.get("parameters")

    def getEtiquetasBobinagem(data,cursor):
        f = Filters({"bobinagem_id": data["bobinagem"]["id"]})
        f.where()
        f.add(f'bobinagem_id = :bobinagem_id', True)
        f.value("and")        
        rows = db.executeSimpleList(lambda: (f'SELECT * FROM producao_etiquetaretrabalho {f.text} order by bobine asc'), cursor, f.parameters)['rows']
        if len(rows)>0:
            return rows
        return None
    def getEtiquetaBobine(data,cursor):
        f = Filters({"bobine": data["bobine"]["nome"]})
        f.where()
        f.add(f'bobine = :bobine', True)
        f.value("and")        
        rows = db.executeSimpleList(lambda: (f'SELECT * FROM producao_etiquetaretrabalho {f.text} limit 1'), cursor, f.parameters)['rows']
        if len(rows)>0:
            return rows
        return None
    def getEtiquetasPalete(data,cursor):
        f = Filters({"palete_id": data["palete"]["id"]})
        f.where()
        f.add(f'pb.palete_id = :palete_id', True)
        f.value("and")
        rows = db.executeSimpleList(lambda: (f'SELECT * FROM producao_etiquetaretrabalho er where er.bobine in (select nome from producao_bobine pb {f.text})'), cursor, f.parameters)['rows']
        if len(rows)>0:
            return rows
        return None        

    try:
        with conn as cursor:
            if data["type"] == "bobine":
                etiqueta = getEtiquetaBobine(data,cursor)
                if etiqueta is None:
                    Response({"status": "error", "title": f'Erro ao imprimir etiqueta! Etiqueta não está criada.', "subTitle":None})
                else:
                    dta={"impressora":data["impressora"], "num_copias":data["num_copias"], "estado_impressao":1}
                    dml = db.dml(TypeDml.UPDATE,dta,"producao_etiquetaretrabalho",{"id":f'=={etiqueta[0]["id"]}'},None,False)
                    db.execute(dml.statement, cursor, dml.parameters)
            if data["type"] == "bobinagem":
                etiquetas = getEtiquetasBobinagem(data,cursor)
                if etiquetas is None:
                    Response({"status": "error", "title": f'Erro ao imprimir etiquetas! Etiquetas não estão criadas.', "subTitle":None})
                else:
                    for idx,v in enumerate(etiquetas):
                        dta={"impressora":data["impressora"], "num_copias":data["num_copias"] +1 if data["lab"] == 1 and idx==0 else data["num_copias"], "estado_impressao":1}
                        dml = db.dml(TypeDml.UPDATE,dta,"producao_etiquetaretrabalho",{"id":f'=={v["id"]}'},None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
            if data["type"] == "palete":
                etiquetas = getEtiquetasPalete(data,cursor)
                if etiquetas is None:
                    Response({"status": "error", "title": f'Erro ao imprimir etiquetas! Etiquetas não estão criadas.', "subTitle":None})
                else:
                    for v in etiquetas:
                        dta={"impressora":data["impressora"], "num_copias":data["num_copias"], "estado_impressao":1}
                        dml = db.dml(TypeDml.UPDATE,dta,"producao_etiquetaretrabalho",{"id":f'=={v["id"]}'},None,False)
                        db.execute(dml.statement, cursor, dml.parameters)
            if data["type"] == "reciclado":
                if "id" not in data["reciclado"]:
                    raise Exception(f'Erro ao imprimir etiquetas')
                dml = db.dml(TypeDml.DELETE, None,'producao_etiquetareciclado',{"reciclado_id":f'=={ data["reciclado"]["id"]}'},None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                dta = {
                    "inicio":data["reciclado"]["timestamp"],"fim":data["reciclado"]["timestamp_edit"],
                    "lote":data["reciclado"]["lote"],"produto_granulado":data["reciclado"]["produto_granulado"],
                    "peso":data["reciclado"]["peso"],"reciclado_id":data["reciclado"]["id"],
                    "user_id":request.user.id,"impressora":data["impressora"],"num_copias":data["num_copias"], "estado_impressao":1
                }
                dml = db.dml(TypeDml.INSERT,dta,"producao_etiquetareciclado",None,None,False)
                db.execute(dml.statement, cursor, dml.parameters)
        return Response({"status": "success", "title": f'Etiqueta(s) imprimidas com sucesso', "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f'Erro ao imprimir etiquetas', "subTitle":str(error)})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def PrintReciclado(request,format=None):
    #Canon_iR-ADV_C3720_UFR_II
    print(request.data["parameters"]["impressora"])
    print(request.data["parameters"]["num_copias"])
    tmp = tempfile.NamedTemporaryFile()
    print(tmp)
    print(tmp.name)
    fstream = requests.post(f'{reportServer}/run', json={
        "config":"default",
        "conn-name":"MYSQL-SGP",
        "name":"ETIQUETAS-RECICLADO",
        "path":"ETIQUETAS/MP-RECICLADO",
        "export":"pdf",
        "data":{      
            "artigo_cod":request.data["parameters"]["artigo_cod"],
            "n_lote":request.data["parameters"]["n_lote"],
            "artigo_des":request.data["parameters"]["artigo_des"],
            "unit":request.data["parameters"]["unit"],
            "qty":float(request.data["parameters"]["qty"]),
            "inicio":request.data["parameters"]["inicio"],
            "fim":request.data["parameters"]["fim"],
            "tara":request.data["parameters"]["tara"],
            "produto":request.data["parameters"]["produto"]
        }
    })
    try:
        print(tmp.name)
        tmp.write(fstream.content)
        print(tmp.name)
        #TO UNCOMMENT ON PRODUCTION
        #conn = cups.Connection()
        #conn.printFile(request.data["parameters"]["impressora"],tmp.name,"",{"copies":str(request.data["parameters"]["num_copias"])})
        for i in range(0, request.data["parameters"]["num_copias"]):
            subprocess.run(['lp', '-n', str(1), '-d', request.data["parameters"]["impressora"], tmp.name])
        ###########################
    except Exception as error:
          print("error----> print")
          print(error)
          return Response({"status": "error", "id":None, "title": f'Erro ao imprimir Etiqueta!', "subTitle":error})
    finally:
        #TO UNCOMMENT ON PRODUCTION
        tmp.close()
        ###########################
        print("PRINT OK")
        #os.unlink(tmp.name)
    return Response({"status": "success", "id":None, "title": f'Etiqueta Impressa com Sucesso!', "subTitle":None})