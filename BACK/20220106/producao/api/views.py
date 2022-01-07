from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView
from rest_framework.views import APIView
from django.http import Http404
from rest_framework.response import Response
from producao.models import Artigo, Palete, Bobine, Emenda, Bobinagem, Cliente, Encomenda, Carga
from .serializers import ArtigoDetailSerializer, PaleteStockSerializer, PaleteListSerializer, PaleteDetailSerializer, CargaListSerializer, PaletesCargaSerializer, CargasEncomendaSerializer, CargaDetailSerializer, BobineSerializer, EncomendaListSerializer, BobinagemCreateSerializer, BobinesDmSerializer, BobinesPaleteDmSerializer, EmendaSerializer, EmendaCreateSerializer, BobinagemListSerializer, BobineListAllSerializer, ClienteSerializer, BobinagemBobinesSerializer, PaleteDmSerializer
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import status


from pyodbc import Cursor
from datetime import datetime
from django.http.response import JsonResponse
from rest_framework.decorators import api_view, authentication_classes, permission_classes, renderer_classes
from django.db import connections, transaction
from support.database import encloseColumn, Filters, DBSql, TypeDml, fetchall, Check

from rest_framework.renderers import JSONRenderer
from rest_framework.utils import encoders, json
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated

import time





#NEW API METHODS
connName = "postgres"
db = DBSql(connections[connName].alias)

# def disable(v):
#     return ''


# def enable(v):
#     return v


# def disableCols(v):
#     return 'count(*)'


# def executeList(sql, connection, parameters, ignore=[], customDisableCols=None):
#     with connection.cursor() as cursor:
#         print(f'SQL--> {sql(enable,enable)}')
#         print(f'PARAMS--> {parameters}')
#         cursor.execute(sql(enable, enable), parameters)
#         rows = fetchall(cursor, ignore)
#         cursor.execute(sql(
#             disable, disableCols if customDisableCols is None else customDisableCols), parameters)
#         count = cursor.fetchone()[0]
#     return {"rows": rows, "total": count}


# def executeSimpleList(sql, connection, parameters, ignore=[]):
#     with connection.cursor() as cursor:
#         print(f'SIMPLE LIST SQL--> {sql()}')
#         print(f'PARAMS--> {parameters}')
#         cursor.execute(sql(), parameters)
#         rows = fetchall(cursor, ignore)
#     return {"rows": rows}


# def execute(sql, connection, parameters, returning=False):
#     with connection.cursor() as cursor:
#         print(f'EXECUTE--> {sql}')
#         print(f'PARAMS--> {parameters}')
#         cursor.execute(sql, parameters)
#         if returning:
#             ret = cursor.fetchone()[0]
#             return ret
#         return


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
                table = f'"{mainValue.get("table")}".' if (mainValue.get(
                    "table") and encloseColumns) else mainValue.get("table", '')
                field = f'{table}"{key}"' if encloseColumns else f'{table}{key}'
                sp[key] = {"value": data.get(
                    mainKey).lower(), "field": f'lower({field})'}
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


def range(data, key, field):
    ret = {}
    if data is None:
        return ret
    for i, v in enumerate(data):
        ret[f'{key}_{i}'] = {"key": key, "value": v, "field": field}

    print(f'PRINT RANGE --> {data}')
    return ret


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SellOrdersList(request, format=None):
    connection = connections[connName].cursor()
    def statusFilter(v):
        if v == 'all':
            return None
        elif v == 'notcreated':
            return 'isnull'
        elif v == 'inpreparation':
            return '==0'
        elif v == 'inprogress':
            return '==1'
        elif v == 'finished':
            return '==99'
        return None
    groupByOrder = request.data["parameters"].get('groupByOrder')

    f = Filters(request.data['filter'])
    f.setParameters({
        **range(f.filterData.get('forderdate'), 'ORDDAT_0', lambda k, v: f'"enc"."{k}"'),
        **range(f.filterData.get('SHIDAT_0'), 'SHIDAT_0', lambda k, v: f'"enc"."{k}"'),
        "LASDLVNUM_0": {"value": lambda v: v.get('LASDLVNUM_0').lower() if v.get('LASDLVNUM_0') is not None else None, "field": lambda k, v: f'lower("enc"."{k}")'},
        "status": {"value": lambda v: statusFilter(v.get('ofstatus')), "field": lambda k, v: f'"of"."{k}"'}
    }, True)
    f.where()
    f.auto()
    f.value()

    f2 = filterMulti(request.data['filter'], {
        'fmulti_customer': {"keys": ['BPCORD_0', 'BPCNAM_0'], "table": 'enc'},
        'fmulti_order': {"keys": ['SOHNUM_0', 'PRFNUM_0'], "table": 'enc'},
        'fmulti_item': {"keys": ['ITMREF_0', 'ITMDES1_0'], "table": 'itm'}
    }, False, "and" if f.hasFilters else False)
    parameters = {**f.parameters, **f2['parameters']}

    dql = db.dql(request.data, False)

    if groupByOrder == True:
        dql.columns = encloseColumn(['enc.ROWID', 'enc.SOHNUM_0', 'enc.ORDDAT_0', 'enc.DEMDLVDAT_0', 'enc.SHIDAT_0', 'enc.PRFNUM_0', 'enc.CUSORDREF_0', 'enc.DAYLTI_0',
                                    'enc.LASDLVDAT_0', 'enc.LASDLVNUM_0', 'enc.LASINVDAT_0', 'enc.LASINVNUM_0', 'enc.DSPTOTQTY_0', 'enc.DSPTOTVOL_0', 'enc.DSPTOTWEI_0',
                                     'enc.DSPVOU_0', 'enc.DSPWEU_0',
                                     'enc.BPCORD_0', 'enc.BPCNAM_0', 'enc.CREUSR_0', 'enc.CREDAT_0', 'enc.CREDATTIM_0', 'enc.UPDUSR_0', 'enc.UPDDAT_0', 'enc.UPDDATTIM_0'])

        response = db.executeList(lambda p, c: (
            f"""
            SELECT {c(f'distinct(enc."SOHNUM_0") "key", {dql.columns}')} 
            FROM "SAGE"."SORDER" as enc
            JOIN "SAGE"."SORDERQ" as enclin on enc."SOHNUM_0" = enclin."SOHNUM_0"
            JOIN "SAGE"."ITMMASTER" as itm on enclin."ITMREF_0" = itm."ITMREF_0"
            {f.text} {f2['text']}
            {p(dql.sort)} {p(dql.paging)}
            """
        ), connection, parameters, ["AUUID_0", "ROWID"], lambda v: 'count(distinct(enc."SOHNUM_0"))')
    else:
        #dql.columns = encloseColumn(['enc.ROWID', 'itm.ITMREF_0', 'itm.ITMDES1_0', 'enc.SOHNUM_0', 'enclin.SOPLIN_0', 'enc.ORDDAT_0', 'enc.DEMDLVDAT_0', 'enc.SHIDAT_0', 'enc.PRFNUM_0', 'enc.CUSORDREF_0', 'enc.DAYLTI_0',
        #                            'enc.LASDLVDAT_0', 'enc.LASDLVNUM_0', 'enc.LASINVDAT_0', 'enc.LASINVNUM_0', 'enc.DSPTOTQTY_0', 'enc.DSPTOTVOL_0', 'enc.DSPTOTWEI_0',
        #                             'enc.DSPVOU_0', 'enc.DSPWEU_0',
        #                             'enc.BPCORD_0', 'enc.BPCNAM_0', 'enc.CREUSR_0', 'enc.CREDAT_0', 'enc.CREDATTIM_0', 'enc.UPDUSR_0', 'enc.UPDDAT_0', 'enc.UPDDATTIM_0',
        #                             'ofa.ordemfabrico_id', 'of.status',
        #                             'sgpitm.id', 'sgpitm.nw1', 'sgpitm.nw2', 'sgpitm.lar', 'sgpitm.formu', 'sgpitm.diam_ref', 'sgpitm.core', 'sgpitm.gsm', 'sgpitm.gtin'
        #                             ])

        dql.columns = encloseColumn(['enc.ROWID', 'itm.ITMREF_0', 'itm.ITMDES1_0', 'enc.SOHNUM_0', 'enclin.SOPLIN_0', 'enc.ORDDAT_0', 'enc.DEMDLVDAT_0', 'enc.SHIDAT_0', 'enc.PRFNUM_0', 'enc.CUSORDREF_0', 'enc.DAYLTI_0',
                                    'enc.LASDLVDAT_0', 'enc.LASDLVNUM_0', 'enc.LASINVDAT_0', 'enc.LASINVNUM_0', 'enc.DSPTOTQTY_0', 'enc.DSPTOTVOL_0', 'enc.DSPTOTWEI_0',
                                     'enc.DSPVOU_0', 'enc.DSPWEU_0',
                                     'enc.BPCORD_0', 'enc.BPCNAM_0', 'enc.CREUSR_0', 'enc.CREDAT_0', 'enc.CREDATTIM_0', 'enc.UPDUSR_0', 'enc.UPDDAT_0', 'enc.UPDDATTIM_0'
                                     ])

        response = db.executeList(lambda p, c: (
            f"""
            SELECT {c(f'{dql.columns}')} 
            FROM "SAGE-PROD"."SORDER" as enc
            JOIN "SAGE-PROD"."SORDERQ" as enclin on enc."SOHNUM_0" = enclin."SOHNUM_0"
            JOIN "SAGE-PROD"."ITMMASTER" as itm on enclin."ITMREF_0" = itm."ITMREF_0"
            --LEFT JOIN producao_artigodetails as sgpitm on sgpitm.cod = itm."ITMREF_0"
            --LEFT JOIN planeamento_ordemfabricoartigos as ofa on ofa.encomenda_num = enclin."SOHNUM_0" and ofa.artigo_cod = itm."ITMREF_0"
            --LEFT JOIN planeamento_ordemfabrico as "of" on "of".id = ofa.ordemfabrico_id
            {f.text} {f2['text']}
            {p(dql.sort)} {p(dql.paging)}
            """
        ), connection, parameters, ["AUUID_0", "ROWID"])

    return Response(response)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SellOrderItemsList(request, format=None):
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add('enclin."SOHNUM_0" = :SOHNUM_0', True)
    f.value()
    parameters = {**f.parameters}

    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(['enclin.SOHNUM_0', 'enclin.SDHNUM_0', 'enclin.ITMREF_0', 'enclin.ORIQTY_0',
                                'enclin.QTY_0', 'itm.ITMDES1_0', 'itm.TSICOD_2', 'itm.TSICOD_3', 'itm.TSICOD_0', 'itm.TSICOD_1'])

    response = db.executeSimpleList(lambda: (
        f"""
         SELECT {dql.columns} 
         FROM "SAGE"."SORDERQ" as enclin
         JOIN "SAGE"."ITMMASTER" as itm on enclin."ITMREF_0" = itm."ITMREF_0"
         {f.text}
         {dql.sort}
         """
    ), connection, parameters, [])
    return Response(response)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SellCustomersLookup(request, format=None):
    cols = ['BPCNUM_0', 'BPCNAM_0']
    f = filterMulti(request.data['filter'], {
                    'fmulti_customer': {"keys": cols}})
    parameters = {**f['parameters']}

    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols)

    response = db.executeSimpleList(lambda: (
        f'SELECT {dql.columns} FROM "SAGE"."BPCUSTOMER" {f["text"]} {dql.sort} {dql.limit}'
    ), connection, parameters)
    return Response(response)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SellOrdersLookup(request, format=None):
    cols = ['SOHNUM_0', 'PRFNUM_0']
    f = filterMulti(request.data['filter'], {'fmulti_order': {"keys": cols}})
    parameters = {**f['parameters']}

    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols)

    response = db.executeSimpleList(lambda: (
        f'SELECT {dql.columns} FROM "SAGE"."SORDER" {f["text"]} {dql.sort} {dql.limit}'
    ), connection, parameters)
    return Response(response)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def SellItemsLookup(request, format=None):
    cols = ['ITMREF_0', 'ITMDES1_0']
    f = filterMulti(request.data['filter'], {'fmulti_item': {"keys": cols}})
    parameters = {**f['parameters']}

    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols)

    response = db.executeSimpleList(lambda: (
        f'SELECT {dql.columns} FROM "SAGE"."ITMMASTER" {f["text"]} {dql.sort} {dql.limit}'
    ), connection, parameters)
    return Response(response)


@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def NewOrdemFabrico(request, format=None):
    data = request.data.get("parameters")

    def checkIfExistsRelationArtigos(data, cursor):
        idx = 0
        fp = {}
        for k, v in data.items():
            fp[f'SOHNUM_0_{idx}'] = v["SOHNUM_0"]
            fp[f'ITMREF_0_{idx}'] = v["ITMREF_0"]
            idx += 1
        f = Filters(fp)
        f.setParameters({}, False)
        f.where()
        for idx, v in enumerate(data.keys()):
            f.add(
                f'(encomenda_num = :SOHNUM_0_{idx} and artigo_cod = :ITMREF_0_{idx})', True)
            f.value("or")
        return db.exists("planeamento_ordemfabricoartigos", f, cursor)

    def upsertArtigos(data, cursor):
        for k, v in data.items():
            if (v["new"] or v["changed"]):
                dml = db.dml(TypeDml.INSERT, {
                    "cod": v['ITMREF_0'],
                    "core": v['core'],
                    "diam_ref": v['diam'],
                    "lar": v['width'],
                    "gsm": v['gram']
                }, "producao_artigodetails")
                dml.statement = f"""
                    {dml.statement} 
                    ON CONFLICT (cod) DO UPDATE SET 
                    core = EXCLUDED.core,
                    diam_ref = EXCLUDED.diam_ref,
                    lar = EXCLUDED.lar,
                    gsm = EXCLUDED.gsm
                """
                db.execute(dml.statement, cursor, dml.parameters)

    def insertOrdemFabrico(data, cursor):
        dml = db.dml(TypeDml.INSERT, {
            "created": datetime.now(),
            "updated": datetime.now(),
            "user_create_id": request.user.id,
            "status": 0
        }, "planeamento_ordemfabrico", "id")
        id = db.execute(dml.statement, cursor, dml.parameters, True)
        return id

    def relationOrdemFabrico(id, data, cursor):
        for k, v in data.items():
            dml = db.dml(TypeDml.INSERT, {
                "encomenda_num": v['SOHNUM_0'],
                "artigo_cod": v['ITMREF_0'],
                "cliente_cod": v['BPCORD_0'],
                "ordemfabrico_id": id,
                "created": datetime.now(),
                "updated": datetime.now(),
                "user_create_id": request.user.id
            }, "planeamento_ordemfabricoartigos")
            db.execute(dml.statement, cursor, dml.parameters)

    with connection.cursor() as cursor:
        exists = checkIfExistsRelationArtigos(data, cursor).exists
        if not exists:
            upsertArtigos(data, cursor)
            id = insertOrdemFabrico(data, cursor)
            relationOrdemFabrico(id, data, cursor)
            return Response({"status": "success", "id":id, "title": "A Ordem de Fabrico foi Criada com Sucesso!", "subTitle":f'Número da Ordem de Fabrico {id}'})
    return Response({"status": "error", "title": "Alguns artigos selecionados já se encontram associados a uma ordem de Fabrico!"})

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def OFArtigosList(request, format=None):
    cols = ['ofa.id as ofaid','itm."ITMDES1_0"','enclin."ORIQTY_0"', 'enc."BPCNAM_0"', 'itmd.*']
    f = Filters(request.data['filter'])
    f.setParameters({}, False)
    f.where()
    f.add(f'"of".id = :id', True)
    f.value("and")
    parameters = {**f.parameters}

    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    response = db.executeSimpleList(lambda: (
        f"""
            SELECT {dql.columns} 
            FROM planeamento_ordemfabrico as "of"
            JOIN planeamento_ordemfabricoartigos as ofa on ofa.ordemfabrico_id = "of".id
            JOIN producao_artigodetails as itmd on ofa.artigo_cod = itmd.cod
            JOIN "SAGE"."ITMMASTER" as itm on itmd.cod = itm."ITMREF_0"
            JOIN "SAGE"."SORDER" as enc on enc."SOHNUM_0" = ofa.encomenda_num
            JOIN "SAGE"."SORDERQ" as enclin on ofa.encomenda_num = enclin."SOHNUM_0" and ofa.artigo_cod = enclin."ITMREF_0" 
            {f.text} 
            {dql.sort}
        """
    ), connection, parameters)
    return Response(response)





#END NEW API METHODS




class PaleteListAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Palete.objects.all().order_by('-data_pal', '-num')[:100]
    serializer_class = PaleteListSerializer

class PaleteListHistoricoAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Palete.objects.all().order_by('-data_pal', '-num')
    serializer_class = PaleteListSerializer

class PaleteDetailAPIView(LoginRequiredMixin, RetrieveAPIView):
    queryset = Palete.objects.all()
    serializer_class = PaleteDetailSerializer

class ClienteDetailAPIView(LoginRequiredMixin, RetrieveAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class BobineDetailAPIView(LoginRequiredMixin, RetrieveAPIView):
    queryset = Bobine.objects.all()
    serializer_class = BobineSerializer

class BobineListAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Bobine.objects.filter()
    serializer_class = BobineSerializer

class BobineListAllAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Bobine.objects.filter()
    serializer_class = BobineListAllSerializer

class BobineList(LoginRequiredMixin, APIView):
    
    def get(self, request, pk, format=None):
        bobine = Bobine.objects.filter(palete=pk)
        serializer = BobineSerializer(bobine, many=True)
        return Response(serializer.data)
        

class EmendaListAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Emenda.objects.all()
    serializer_class = EmendaSerializer


class EmendaCreateAPIView(LoginRequiredMixin, CreateAPIView):
    queryset = Emenda.objects.all()
    serializer_class = EmendaCreateSerializer

class BobinagemListAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Bobinagem.objects.all().order_by('-data', '-fim')[:200]
    serializer_class = BobinagemListSerializer

class BobinagemListHistoricoAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Bobinagem.objects.all().order_by('-data', '-fim')
    serializer_class = BobinagemListSerializer

class BobinesBobinagemAPIView(LoginRequiredMixin, APIView):
    
    def get(self, request, pk, format=None):
        bobinagem = Bobinagem.objects.get(pk=pk)
        bobine = Bobine.objects.filter(bobinagem=bobinagem)
        serializer = BobinagemBobinesSerializer(bobine, many=True)
        return Response(serializer.data)

class PaleteDmAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Palete.objects.filter(estado='DM')
    serializer_class = PaleteDmSerializer
    
class PaleteDmBobinesAPIView(LoginRequiredMixin, APIView):
    def get(self, request, pk, format=None):
        palete = Palete.objects.get(pk=pk)
        bobines = Bobine.objects.filter(palete=palete).order_by('posicao_palete')
        serializer = BobinesPaleteDmSerializer(bobines, many=True)
        return Response(serializer.data)



class BobineListDmAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Bobine.objects.filter(estado='DM')
    serializer_class = BobinesDmSerializer

class BobinagemCreateDmAPIView(LoginRequiredMixin, CreateAPIView):
    queryset = Bobinagem.objects.all()
    serializer_class = BobinagemCreateSerializer

class BobinagemListDmAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Bobinagem.objects.filter(perfil__retrabalho=True)
    serializer_class = BobinagemListSerializer

class EncomendaListAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Encomenda.objects.filter()
    serializer_class = EncomendaListSerializer

class CargaListAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Carga.objects.filter()
    serializer_class = CargaListSerializer

class CargaDetailAPIView(LoginRequiredMixin, RetrieveAPIView):
    queryset = Carga.objects.all()
    serializer_class = CargaDetailSerializer

class EncomendaCargaAPIView(LoginRequiredMixin, APIView):
    def get(self, request, pk, format=None):
        enc = Encomenda.objects.get(pk=pk)
        cargas = Carga.objects.filter(enc=enc)
        serializer = CargasEncomendaSerializer(cargas, many=True)
        return Response(serializer.data)

class CargaPaletesAPIView(LoginRequiredMixin, APIView):
    def get(self, request, pk, format=None):
        carga = Carga.objects.get(pk=pk)
        paletes = Palete.objects.filter(carga=carga).order_by('num_palete_carga')
        serializer = PaletesCargaSerializer(paletes, many=True)
        return Response(serializer.data)

class StockListAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Palete.objects.filter(stock=True)
    serializer_class = PaleteListSerializer

class PaleteListStockAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Palete.objects.filter(stock=True)
    serializer_class = PaleteStockSerializer

class ArtigoDetailAPIView(LoginRequiredMixin, RetrieveAPIView):
    queryset = Artigo.objects.all()
    serializer_class = ArtigoDetailSerializer
    
class ClienteListAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class ArtigoListAPIView(LoginRequiredMixin, ListAPIView):
    queryset = Artigo.objects.all()
    serializer_class = ArtigoDetailSerializer

