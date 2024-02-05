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
connMssqlName = "sqlserver"
dbgw = DBSql(connections[connGatewayName].alias)
db = DBSql(connections["default"].alias)
dbmssql = DBSql(connections[connMssqlName].alias)


def authUser(user):
    groups = user.groups.all().values_list('name',flat=True)
    items = {}
    isAdmin=False
    grps = list(groups)
    grps.append("all#100")
    for idx, v in enumerate(grps):
        key = ""
        grp = v.split("#")
        if grp == ["admin"]:
            isAdmin=True
            continue
        elif len(grp)==2:
            key=grp[0]
            permission_value=grp[1]
        else:
            if (v.startswith("Logistica")):
                key = "logistica"
            elif (v.startswith("Produção")):
                key = "producao"
            elif (v.startswith("Qualidade")):
                key = "qualidade"
            permission_value = 100 if v.endswith("Operador") or v.endswith("Tecnico") else 200
        if key in items:
            if items[key]<int(permission_value):
                items[key] = int(permission_value)
        else:
            items[key] = int(permission_value)
    
    #print("FIXED PERMISSION!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    turno = {"enabled":False}
    if hasattr(user, 'turno'):
        turno["dep"] = user.turno.dep
        turno["turno"] = user.turno.turno
        turno["enabled"] = True
    #return {'turno': {'enabled': False}, 'groups': ['producao#100','all#100'], 'items': {'producao': 100}, 'isAdmin': False}
    return {"turno":turno,"groups":grps,"items":items,"isAdmin":isAdmin}

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def GetAuthUser(request, format=None):
    user = request.user
    au = authUser(user)
    return Response({"isAuthenticated":user.is_authenticated, "user":user.username, "name":f"{user.first_name} {user.last_name}", "turno":{**au["turno"]} ,"groups":au["groups"], "permissions":au["items"], "isAdmin":au["isAdmin"]})
