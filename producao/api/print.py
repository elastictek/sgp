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
#import cups
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

connGatewayName = "postgres"
connMssqlName = "sqlserver"
dbgw = DBSql(connections[connGatewayName].alias)
db = DBSql(connections["default"].alias)
dbmssql = DBSql(connections[connMssqlName].alias)



@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def PrintMPBuffer(request,format=None):
    #Canon_iR-ADV_C3720_UFR_II
    tmp = tempfile.NamedTemporaryFile()
    print(tmp)
    print(tmp.name)
    fstream = requests.post('http://192.168.0.16:8080/ReportsGW/run', json={
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
            "obs":request.data["parameters"]["obs"] if "obs" in request.data["parameters"] else None 
        }
    })
    try:
        print(tmp.name)
        tmp.write(fstream.content)
        #conn = cups.Connection()
        #conn.printFile(request.data["parameters"]["impressora"],tmp.name,"",{}) 
        print("###########################")
    except Exception as error:
          print("error----> print")
          print(error)
          return Response({"status": "error", "id":None, "title": f'Erro ao imprimir Etiqueta!', "subTitle":error})
    finally:
        pass
        #tmp.close()
        #os.unlink(tmp.name)
    
    #p = request.data["parameters"]
    #req = {**p}
    #conn = cups.Connection()
    #conn.printFile(printer_name,'/home/pi/Desktop/a.pdf',"",{}) 
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
        rows = db.executeSimpleList(lambda: (f'SELECT * FROM producao_etiquetaretrabalho {f.text}'), cursor, f.parameters)['rows']
        if len(rows)>0:
            return rows
        return None        

    try:
        with conn as cursor:
            if data["type"] == "bobinagem":
                etiquetas = getEtiquetasBobinagem(data,cursor)
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
                    "inicio":data["reciclado"]["timestamp"],"fim":data["reciclado"]["timestamp"],
                    "lote":data["reciclado"]["lote"],"produto_granulado":data["reciclado"]["produto_granulado"],
                    "peso":data["reciclado"]["peso"],"reciclado_id":data["reciclado"]["id"],
                    "user_id":request.user.id,"impressora":data["impressora"],"num_copias":data["num_copias"], "estado_impressao":1
                }
                dml = db.dml(TypeDml.INSERT,dta,"producao_etiquetareciclado",None,None,False)
                db.execute(dml.statement, cursor, dml.parameters)
        return Response({"status": "success", "title": f'Etiqueta(s) imprimidas com sucesso', "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f'Erro ao imprimir etiquetas', "subTitle":str(error)})




#endregion
