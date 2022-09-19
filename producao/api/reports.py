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

connGatewayName = "postgres"
dbgw = DBSql(connections[connGatewayName].alias)
db = DBSql(connections["default"].alias)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def Reciclado(request, format=None):
    cols = ['*']
    f = Filters(request.data['filter'])
    f.setParameters({
         "date": {"value": lambda v: v.get('date'), "field": lambda k, v: f'{k}', "none":False },
    }, True)
    f.where()
    f.value("and")
    parameters = {**f.parameters}

    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    with connections["default"].cursor() as cursor:
        p = "%(date)s" if "date" in parameters else "NOW()"
        l = "<=" if "date" in parameters else "<"
        response = db.executeSimpleList(lambda: (
            f"""
                WITH RECURSIVE cte (dt) AS
                    ( SELECT DATE({p} - INTERVAL 4 WEEK) dt
                    UNION ALL
                    SELECT DATE_ADD(dt, INTERVAL 1 DAY) FROM cte WHERE DATE_ADD(dt, INTERVAL 1 DAY) {l} {p}
                    ),
                    DAYS AS (
                    select t.ano,t.nweek,t.dt
                    from (SELECT min(DATE_FORMAT(dt, '%%x%%v')) over () minw, DATE_FORMAT(dt, '%%x%%v') w, YEAR(dt) ano, WEEKOFYEAR(dt) nweek, dt FROM cte) t 
                    where t.minw<>w
                    ),
                    RECICLADO AS (
                    select 
                    distinct t.ano,t.nweek,t.dt,
                    IFNULL(sum(peso) over (partition by t.dt),0) day_peso,
                    IFNULL(sum(peso) over (partition by t.nweek,t.ano),0) week_peso
                    from DAYS t 
                    left join sistema.producao_reciclado R on DATE(R.timestamp)=t.dt
                    ),
                    CONSUMORAW AS (
                    select 
                    distinct t.ano,t.nweek,t.dt,
                    IFNULL(sum(consumo) over (partition by t.dt),0) day_consumo,
                    IFNULL(sum(consumo) over (partition by t.nweek,t.ano),0) week_consumo
                    from DAYS t
                    left join (SELECT
                    entrada dt,
                    ((CASE WHEN artigo = 'R00000000000001' THEN peso ELSE 0 END)-CASE WHEN artigo = 'R00000000000001' THEN resto ELSE 0 END) consumo        
                    FROM sistema.producao_consumoraw
                    WHERE saida IS NOT NULL) CR on DATE(CR.dt)=t.dt
                    )
                    SELECT 
                    R.*,
                    CR.day_consumo,CR.week_consumo,
                    R.day_peso - CR.day_consumo day_resultado,
                    R.week_peso - CR.week_consumo week_resultado
                    FROM RECICLADO R
                    JOIN CONSUMORAW CR ON CR.dt = R.dt
                    ORDER BY R.dt
            """
        ), cursor, parameters)
        return Response(response)