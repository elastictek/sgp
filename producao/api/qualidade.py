import base64
from operator import eq
from pyexpat import features
import re
import csv
import itertools
import io
from typing import List
from wsgiref.util import FileWrapper
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView
from rest_framework.views import APIView
from django.http import Http404, request
from rest_framework.response import Response
from django.http.response import HttpResponse
from django.http import FileResponse
from producao.models import Artigo, Palete, Bobine, Emenda, Bobinagem, Cliente, Encomenda, Carga
from support.postdata import PostData
from .serializers import ArtigoDetailSerializer, PaleteStockSerializer, PaleteListSerializer, PaleteDetailSerializer, CargaListSerializer, PaletesCargaSerializer, CargasEncomendaSerializer, CargaDetailSerializer, BobineSerializer, EncomendaListSerializer, BobinagemCreateSerializer, BobinesDmSerializer, BobinesPaleteDmSerializer, EmendaSerializer, EmendaCreateSerializer, BobinagemListSerializer, BobineListAllSerializer, ClienteSerializer, BobinagemBobinesSerializer, PaleteDmSerializer
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import status
import mimetypes
from datetime import datetime, timedelta
import numpy as np
# import cups
import os, tempfile

from pyodbc import Cursor, Error, connect, lowercase
from datetime import datetime
from django.http.response import JsonResponse
from rest_framework.decorators import api_view, authentication_classes, permission_classes, renderer_classes
from django.db import connections, transaction
from support.database import ParsedFilters, encloseColumn, Filters, DBSql, TypeDml, fetchall, Check
from support.myUtils import  excludeDictKeys, ifNull, timestamp,try_float

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
from producao.api.exports import export

connGatewayName = "postgres"
connMssqlName = "sqlserver"
dbgw = DBSql(connections[connGatewayName].alias)
db = DBSql(connections["default"].alias)
dbmssql = DBSql(connections[connMssqlName].alias)

types_mapper = {"tração":"traction","desgrudar":"peel","gramagem":"gramagem"}
modes_mapper = {"simples":"simples","controle":"controle","cíclico":"cíclico"}
header_mapper = {'Nome do ensaio':"nome_ensaio", 'Modo de ensaio':"modo_ensaio", 'Tipo de ensaio':"tipo_ensaio", 'Título1':"titulo", 'Comentário1':"comentario", 'Palavra-chave':"password", 
                'Nome do produto':"produto", 'Nome do arquivo do ensaio':"filename_ensaio", 'Nome do arquivo do método':"filename_metodo", 'Data do relatório':"data_report", 'Data do ensaio':"data_ensaio", 
                'Velocidade':"velocidade", 'Placa':"placa", 'Lote No:':"lote", "Sub-Lote No:":"sublote", 'Contador cíclico':"contador_ciclico"}

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

api_keys = {
    '98866c51710e34795b3888336e6d43b66d31d9a1d2646b92a0aabacb0293b2d6': 'generic'
}

def is_valid_key(api_key):
    if api_key is None:
        return False
    return api_key in api_keys

def get_user_role(api_key):
    return api_keys.get(api_key)



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


#region TEST SECTION

def _getLabMetodobyArtigoSpecs(id,valid,status,cursor):
    f = Filters({
        "id": id,
        "valid": valid,
        "status":status
    })
    f.where()
    f.add(f'las.id {f.nullValue("id","=:id")}',True )
    f.add(f'las.valid {f.nullValue("valid","=:valid")}',True )
    f.add(f'las.`status` {f.nullValue("status","=:status")}',True )
    f.value("and")
    response = db.executeSimpleList(lambda: (
        f"""
            SELECT lm.*,las.id lab_artigospecs_id   
            from producao_lab_artigospecs las
            join producao_lab_metodos lm on lm.id=las.lab_metodo_id
            {f.text}
        """
    ), cursor, f.parameters)
    return response

def _getLabArtigoSpecsParameters(id,cursor):
    f = Filters({
        "id": id
    })
    f.where()
    f.add(f'las.lab_artigospecs_id {f.nullValue("id","=:id")}',True )
    f.value("and")
    response = db.executeSimpleList(lambda: (
        f"""
            SELECT las.*  
            from producao_lab_artigospecs_parameters las
            {f.text}
        """
    ), cursor, f.parameters)
    return response

def replace(arr, dictionary):
    counts = {}
    output_arr = []
    for elem in arr:
        if elem in dictionary:
            if elem not in counts:
                counts[elem] = 0
            value = dictionary[elem]
            if counts[elem] > 0:
                value += str(counts[elem])
            output_arr.append(value)
            counts[elem] += 1
        else:
            output_arr.append(elem)
    return output_arr

def DoTest(request, format=None):
    data = request.data.get("parameters")
    _file = data.get("file")
    _specification = data.get("specification")
    filter = request.data.get("filter")
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                metodo = _getLabMetodobyArtigoSpecs(_specification,1,1,cursor)
                parameters = _getLabArtigoSpecsParameters(_specification,cursor)
                specs = {d['parameter_nome']: {**d,"values":json.loads(d.get("values"))} for d in parameters.get("rows")}
                if len(metodo.get("rows"))==0:
                    Response({"status": "error", "title": f"As especificações não se encontram válidas ou não existem!"})     
                return Response(LoadTrapeziumTestFile(_file,metodo,specs,request.user.id))

    except Exception as error:
        return Response({"status": "error", "title": f"Erro executar o teste selecionado! {str(error)}"})

def mapper(row,block,counter):
    v = f"[{block}][{counter}]"    
    if v=="[0][0]":
        map = {'Nome do ensaio':"nome_ensaio", 'Modo de ensaio':"modo_ensaio", 'Tipo de ensaio':"tipo_ensaio", 'Título1':"titulo", 'Comentário1':"comentario", 'Palavra-chave':"password", 
         'Nome do produto':"produto", 'Nome do arquivo do ensaio':"filename_ensaio", 'Nome do arquivo do método':"filename_metodo", 'Data do relatório':"data_report", 'Data do ensaio':"data_ensaio", 
         'Velocidade':"velocidade", 'Placa':"placa", 'Lote No:':"lote", "Sub-Lote No:":"sublote", 'Contador cíclico':"contador_ciclico"}
        return replace(row,map)
    elif v=="[1][0]":
        return row
    elif v=="[2][0]":
        return row
    
def incrementCounter(counter,block):
    v = 0 if counter.get(block) is None else counter.get(block) + 1
    counter[block] = v

def append_dict(ret,keys, row):
    for i, key in enumerate(keys):
        k = key.lower()
        if (k not in ret):
            ret[k] = {}
        if i < len(row):
            ret[k].update(row[i])

def _getBobinagemData(file,cursor):
        pattern = r"\d{8}-\d{2}" # pattern for "YYYYMMDD-NN"
        match = re.search(pattern, file)
        if match:
            value_found = match.group()
            return db.executeSimpleList(lambda: (f"""select pbm.id,pbm.nome,pb.id bobine_id,pb.nome bobine_nome from producao_bobinagem pbm join producao_bobine pb on pb.bobinagem_id=pbm.id where pbm.nome = '{value_found}'"""), cursor, {})["rows"]
        return None


def extract_first_numeric(s):
    match = re.search(r'\d+', s)
    return int(match.group()) if match else None

def starts_with_numeric(s):
    # Check if the first character is a digit
    return s and s[0].isdigit()

def compute_bobine(s,bdata):
    match = re.search(r'\d+',s)
    if match:
        number = match.group().zfill(2) #Bobine Number
        bobine_nome = f"""{bdata[0].get("nome")}-{number}"""
        bobine = next((r for r in bdata if r['bobine_nome'] == bobine_nome), None)
        if bobine is None:
            return False
        return bobine
    else:
        return False

def LoadTrapeziumTestFile(file,metodo,specs,user_id):
    cursor = connections["default"].cursor()
    with cursor:
        try:
            bdata = _getBobinagemData(file,cursor)
            if bdata is None or len(bdata)==0:
                return {"status": "error", "title": "A bobinagem a que se refere o teste não existe!", "subTitle":None}
            storage = FileSystemStorage()
            csv_file = storage.open(f'lab-test-tmp/{file}', 'r')
            csv_reader = csv.reader(csv_file)

            block = 0
            _block_lines_counter = 0
            _cycle_counter = 0
            
            _header=[]
            _duplicates=[]

            tblHeader = {}
            tblblock1 = {}
            tblparameters = []
            tbldata = {}
            print("READING")
            for row in csv_reader:
                if not row:
                    _header= []
                    block = block + 1
                    _block_lines_counter = 0
                elif (block==0):
                    blockHeader(row,bdata,tblHeader,_duplicates)
                    _block_lines_counter = _block_lines_counter + 1
                elif (block==1):
                    if _block_lines_counter>=2 and _block_lines_counter<=3:
                        _header.append(row)
                    elif _block_lines_counter>3:
                        block1(_header,row,bdata,tblblock1)
                    _block_lines_counter = _block_lines_counter + 1
                elif (block==2):
                    if _block_lines_counter == 0:
                        if not tblHeader or "modo_ensaio" not in tblHeader or "tipo_ensaio" not in tblHeader:
                            raise ValueError(f"""Erro de cabeçalho no ficheiro submetido""")
                        filtered_specs = {key: value for key, value in specs.items() if value.get('parameter_type') == value.get('parameter_type') and value.get('parameter_mode') == tblHeader.get("modo_ensaio")}
                        blockParameters(row,filtered_specs,tblparameters)
                    elif _block_lines_counter == 1:
                        a=1
                        #PARAMETER DESCRIPTION
                    elif _block_lines_counter == 2:
                        a=1
                        #PARAMETER UNITS
                    else:
                        if starts_with_numeric(row[0]):
                            _cycle_counter = _cycle_counter + 1
                            block2(tblparameters,row,_cycle_counter,bdata,tbldata)
                    _block_lines_counter = _block_lines_counter + 1
            
            if not tblHeader or "modo_ensaio" not in tblHeader or "tipo_ensaio" not in tblHeader:
                raise ValueError(f"""Erro de cabeçalho no ficheiro submetido""")
            else:
                results=[]
                resultsAllCycles=[]
                if tblHeader.get("modo_ensaio") == "cíclico":
                    compute_ciclico(tbldata,tblparameters,results,resultsAllCycles,tblHeader)
                if tblHeader.get("modo_ensaio") == "simples":
                    compute_simples(tbldata,tblparameters,results,tblHeader)
                

                print(tblHeader)
                print(tblblock1)
                print(results)
                print(resultsAllCycles)
            csv_file.close()
            return {"status": "success", "title": "Teste executado com sucesso!", "subTitle":None}
        except Exception as error:
            print(error)
            return {"status": "error", "title": f"Erro executar o teste selecionado! {str(error)}"}

def compute_ciclico(tbldata,tblparameters,results,allresults,tblHeader):
    transposed_lists = list(map(list, zip(*tbldata.values())))
    num_cycles = len(transposed_lists)
    num_bobines = len(transposed_lists[0])
    num_parameters = len(transposed_lists[0][0])
    for ncycle in range(num_cycles):
        for nparameter in range(num_parameters):
            min=None
            max=None
            sum=0
            cols=[]
            for nbobine in range(num_bobines):
                v = transposed_lists[ncycle][nbobine][nparameter] if transposed_lists[ncycle][nbobine][nparameter] is not None else 0
                sum = sum + v
                min = v if min is None or min > v else min
                max = v if max is None or max < v else max
            _status_tds = 1 if try_float(tblparameters[nparameter].get("targets")[0]) <= (sum / num_bobines) <= try_float(tblparameters[nparameter].get("targets")[1]) else 0
            _status_target = 1 if try_float(tblparameters[nparameter].get("targets")[2]) <= (sum / num_bobines) <= try_float(tblparameters[nparameter].get("targets")[3]) else 0
            cols.append({
                "id":tblparameters[nparameter].get("id"),
                "param":tblparameters[nparameter].get("name"),
                "cycles":tblparameters[nparameter].get("cycles"),
                "cycle":ncycle+1,
                "targets":tblparameters[nparameter].get("targets"),
                "status_tds": _status_tds,
                "status_target": _status_target,
                "avg": round(sum / num_bobines,tblparameters[nparameter].get("precision")),
                "min": round(min,tblparameters[nparameter].get("precision")),
                "max": round(max,tblparameters[nparameter].get("precision")),
                "std": round(np.std(list(filter(lambda x: x is not None, transposed_lists[ncycle][nbobine])),ddof=1),tblparameters[nparameter].get("precision")) if len(list(filter(lambda x: x is not None, transposed_lists[ncycle][nbobine])))>=2 else None
            })
            if (ncycle+1) in [int(num) for num in tblparameters[nparameter].get("cycles").split(",")]:
                if tblparameters[nparameter].get("decisive") == 1 and tblHeader["status"] == 1 and _status_tds == 0:
                    tblHeader["status"] = 0
                results.append(cols)
            allresults.append(cols)

def compute_simples(tbldata,tblparameters,results,tblHeader):
    transposed_lists = [inner_list[0] for inner_list in tbldata.values()]
    num_bobines = len(transposed_lists)
    num_parameters = len(transposed_lists[0])
    std_dev = np.std(np.array(transposed_lists), axis=0, ddof=1)
    for nparameter in range(num_parameters):
        min=None
        max=None
        sum=0
        cols=[]
        for nbobine in range(num_bobines):
            v = transposed_lists[nbobine][nparameter] if transposed_lists[nbobine][nparameter] is not None else 0
            sum = sum + v
            min = v if min is None or min > v else min
            max = v if max is None or max < v else max
        _status_tds = 1 if try_float(tblparameters[nparameter].get("targets")[0]) <= (sum / num_bobines) <= try_float(tblparameters[nparameter].get("targets")[1]) else 0
        _status_target = 1 if try_float(tblparameters[nparameter].get("targets")[2]) <= (sum / num_bobines) <= try_float(tblparameters[nparameter].get("targets")[3]) else 0
        cols.append({
            "id":tblparameters[nparameter].get("id"),
            "param":tblparameters[nparameter].get("name"),
            "targets":tblparameters[nparameter].get("targets"),
            "status_tds": _status_tds,
            "status_target":_status_target,
            "avg": round(sum / num_bobines,tblparameters[nparameter].get("precision")),
            "min": round(min,tblparameters[nparameter].get("precision")),
            "max": round(max,tblparameters[nparameter].get("precision")),
            "std": round(std_dev[nparameter],tblparameters[nparameter].get("precision")) if num_bobines>=2 else None
        })
        if tblparameters[nparameter].get("decisive") == 1 and tblHeader["status"] == 1 and _status_tds == 0:
            tblHeader["status"] = 0

        results.append(cols)

def normalize_string(s):
    # Remove non-alphanumeric characters and convert to lowercase
    return re.sub(r'[^a-zA-Z0-9]', '#', s.lower()) + "#"

def is_substring(normalized_substring, normalized_string):
    # Check if the normalized substring is a substring of the normalized string
    return normalized_substring in normalized_string

def blockHeader(row,bdata,tblHeader,_duplicates):
    _keys = []
    _fix = 0
    if len(tblHeader.keys())>0:
        _keys = list(tblHeader.keys())
    for idx,p in enumerate(row):
        if len(_keys)==0:
            if header_mapper.get(p) is not None:
                if header_mapper.get(p) in tblHeader:
                    _duplicates.append(idx)
                else:
                    tblHeader[header_mapper.get(p)] = None
            else:
                tblHeader[f"_{p}"] = None
        else:
            if idx not in _duplicates:
                _k = _keys[idx-_fix]
                if _k == "modo_ensaio":
                    _v = modes_mapper.get(p.lower())
                elif _k == "tipo_ensaio":
                    _v = types_mapper.get(p.lower())
                elif _k == "data_ensaio" or _k == "data_report":
                    _v = datetime.strptime(p,'%d/%m/%Y').strftime('%Y-%m-%d')
                else:
                    _v = p
                tblHeader[_k] = _v
            else:
                _fix = _fix + 1
    if len(_keys)>0:
        tblHeader["status"] = 1

def blockParameters(row,specs,tblparameters):
    if (len(specs.keys())==0):
        raise ValueError(f"""Os parâmetros definidos não correspondem ao ficheiro de resultados submetido!""")
    _specs_params = [{
        "name":el, "normalized" : normalize_string(el), "id":specs[el]["id"], "cycles":specs[el]["cycles"], "functions":specs[el]["functions"], 
        "targets":specs[el]["values"], "precision":specs[el]["value_precision"],"required": specs[el]["required"], "decisive": specs[el]["decisive"]
    } for el in specs.keys()]
    for idx,p in enumerate(row):
        if idx>0:
            base_param = normalize_string(p)
            _sp = None
            for sp in _specs_params:
                if is_substring(base_param,sp["normalized"]):
                    _sp=sp
                    break
                elif is_substring(sp["normalized"],base_param):
                    _sp=sp
                    break
            tblparameters.append(_sp)
    if len(tblparameters)!= len(row)-1:
        raise ValueError(f"""Os parâmetros definidos não correspondem ao ficheiro de resultados submetido!""")

def block2(tblparameters,row,cycle_counter,bdata,tbldata):
    _bobine = None
    _bobine = compute_bobine(row[0],bdata)
    if _bobine is not None:
        _values=[]
        for idx,val in enumerate(row):
            if idx>0:
                if _bobine.get("bobine_nome") not in tbldata:
                     tbldata[_bobine.get("bobine_nome")]=[]
                _values.append(try_float(val.replace(",", ".")))
                # print(f"""{tblparameters[idx-1]} -- {_bobine["bobine_nome"]}""")
                # a=1
        tbldata[_bobine.get("bobine_nome")].append(_values)

def block1(header,row,bdata,tblblock1):
    _bobine = compute_bobine(row[0],bdata)
    if _bobine is not None:
        for idx,val in enumerate(row):
            if idx>0:
                if _bobine.get("bobine_nome") not in tblblock1:
                    tblblock1[_bobine.get("bobine_nome")]={}
                tblblock1[_bobine.get("bobine_nome")][header[0][idx]] = {"value":try_float(val.replace(",", ".")), "unit": header[1][idx] if idx < len(header[1]) else None }


def LoadTrapeziumTestFilex(file,metodo,specs,user_id):
    types_dict = {"traction":"tração","peel":"desgrudar"}
    modes_dict = {"simples":"simples","controle":"controle","cíclico":"cíclico"}

    cursor = connections["default"].cursor()
    with cursor:
        try:
            #print("PARAMETERSSSSSSSSS")
            #print(specs)
            #print("##################") 
            bdata = _getBobinagemData(file,cursor)
            if bdata is None:
                return {"status": "error", "title": "A bobinagem a que se refere o teste não existe!", "subTitle":None}
            storage = FileSystemStorage()
            csv_file = storage.open(f'lab-test-tmp/{file}', 'r')
            csv_reader = csv.reader(csv_file)

            block = 0
            counter={}
            
            keys=[]
            valuesheader={}
            values=[]
            grp={"value":0,"enabled":False,"ciclo":1}

            tblheader = {}
            tblspecs = []
            tbldata = []
            tblgroup = []
            for row in csv_reader:
                if not row:
                    valuesheader= {}
                    keys = []
                    values=[]
                    grp={"value":0,"enabled":False,"ciclo":1}
                    block = block + 1
                else:
                    if (block==0):
                        counter,block,keys,tblheader = block0(counter,block,row,keys,bdata)
                        if counter.get(block)==1:
                            file_mode = tblheader.get("modo_ensaio").lower()
                            file_type = tblheader.get("tipo_ensaio").lower()
                            print("----------------------------")
                            print(metodo.get("rows")[0].get("mode"))
                            print(metodo.get("rows")[0].get("type"))
                            
                            print(file_mode)
                            print(file_type)
                            if modes_dict.get(metodo.get("rows")[0].get("mode"))!=file_mode or types_dict.get(metodo.get("rows")[0].get("type"))!=file_type:
                                return {"status": "error", "title": f"O método não corresponde ao método do ficheiro de resultados!"}
                            if file_mode=="cíclico":
                                if int(tblheader.get("contador_ciclico"))!=int(metodo.get("rows")[0].get("ciclos")):
                                    return {"status": "error", "title": f"O nº de ciclos no método não corresponde ao nº de ciclos no método do ficheiro de resultados!"}
                        tblheader["errors"]=[]
                    elif (block==1):
                        counter,block,keys,valuesheader = block1(counter,block,row,keys,valuesheader,tblspecs,bdata)
                    elif (block==2):
                        counter,block,keys,valuesheader = block2(counter,block,grp,row,keys,valuesheader,tblheader,tbldata,tblgroup,bdata,specs)
            csv_file.close()
            with transaction.atomic():
                essay_id = _newEssayHeader(bdata,tblheader,metodo.get("rows")[0].get("lab_artigospecs_id"), user_id,cursor)
                _newEssayResults(tbldata,tblspecs,essay_id, user_id,cursor)
            #print(tblheader)
            print(tblspecs)
            #print(tbldata)
            #print(tblgroup)
            return {"status": "success", "title": "Teste executado com sucesso!", "subTitle":None}
        except Exception as error:
            print(error)
            return {"status": "error", "title": f"Erro executar o teste selecionado! {str(error)}"}

def _newEssayHeader(bdata,tblheader,lab_artigospecs_id,user_id,cursor):
    data = {**tblheader,
            "errors":json.dumps(tblheader.get("errors")), 
            "media":json.dumps(tblheader.get("media")),
            "desviopadrao":json.dumps(tblheader.get("desviopadrao")),
            "faixa":json.dumps(tblheader.get("faixa")),
            "bobinagem_id":bdata[0].get("id"), "lab_artigospecs_id":lab_artigospecs_id, "t_stamp":datetime.now(),"user_id":user_id}
    dml = db.dml(TypeDml.INSERT, data, "producao_lab_essaysheader",None,None,False)
    db.execute(dml.statement, cursor, dml.parameters)
    return cursor.lastrowid

def _newEssayResults(tbldata,tblspecs,essay_id,user_id,cursor):
    for row in tbldata:
        matching_items = [item for item in tblspecs if int(item.get("bobine_id")) == int(row.get("bobine_id"))]
        m={}
        if matching_items and len(matching_items)>0:
            m={**matching_items[0]}
            del m["bobine_id"]
            del m["bobine_nome"]
            del m["bobinagem_id"]
            del m["row_id"]
        i ={"bobine_id": row.get("bobine_id"),
            "bobine_nome":row.get("bobine_nome"),
            "bobinagem_id": row.get("bobinagem_id"),
            "row_id": row.get("row_id"),
            "within_range": row.get("range"),
            "within_target": row.get("target"),
            "grp": row.get("grp"),
            "ciclo": row.get("ciclo"),
            "errors": json.dumps(row.get("errors")),
            "essay_id": essay_id,
            "t_stamp": datetime.now(),"user_id":user_id
        }
        del row["bobine_id"]
        del row["bobine_nome"]
        del row["bobinagem_id"]
        del row["row_id"]
        del row["range"]
        del row["grp"]
        del row["ciclo"]
        del row["target"]
        del row["errors"]
        v = {**row,**m}
        k = list(v.keys())
        data = {**i,"results":json.dumps(v),"parameters":json.dumps(k)}
        dml = db.dml(TypeDml.INSERT, data, "producao_lab_essaysdata",None,None,False)
        db.execute(dml.statement, cursor, dml.parameters)
        id = cursor.lastrowid

def _block_header(counter,block,row,keys,bdata):
    tbl={}
    incrementCounter(counter,block)
    if (counter.get(block)==0):
        keys=mapper(row,block,counter.get(block))
        #print(keys)
    else:
        tbl = dict(zip(keys, row))
        tbl["data_report"] = datetime.strptime(tbl.get("data_report"),'%d/%m/%Y').strftime('%Y-%m-%d')
        tbl["data_ensaio"] = datetime.strptime(tbl.get("data_ensaio"),'%d/%m/%Y').strftime('%Y-%m-%d')
    return counter,block,keys,tbl





def _block1(counter,block,row,keys,valuesheader,tblspecs,bdata):
    if row[0].lower() == "nome":
        incrementCounter(counter,block)
    if (counter.get(block)==0 and len(keys)==0):
        keys=mapper(row,block,counter.get(block))
        valuesheader = {key.lower(): {} for key in keys[1:]}
    if row[0].lower().startswith("unidade"):
        incrementCounter(counter,block)
        append_dict(valuesheader,keys[1:],[{"unit": x} for x in row[1:]])
    elif (counter.get(block) is not None and row[0].lower() != "nome"):
        bobine_data = {**valuesheader}
        append_dict(bobine_data,keys[1:],[{"value": try_float(x.replace(",", "."))} for x in row[1:]])
        match = re.search(r'\d+', row[0])
        if match:
            number = match.group().zfill(2) #Bobine Number
            bobine_nome = f"""{bdata[0].get("nome")}-{number}"""
            bobine = next((r for r in bdata if r['bobine_nome'] == bobine_nome), None)
            if bobine is None:
                raise ValueError(f"""Não foi identificada a bobine na linha {row} bobinagem {bdata[0].get("nome")}""")
        else:
            raise ValueError(f"""Não foi identificada a bobine na linha {row} bobinagem {bdata[0].get("nome")}""")
        
        bobine_data["bobine_id"] = bobine.get("bobine_id")
        bobine_data["bobine_nome"] = bobine_nome
        bobine_data["bobinagem_id"] = bobine.get("id")
        bobine_data["row_id"] = row[0]
        tblspecs.append(bobine_data)
        incrementCounter(counter,block)
    return counter,block,keys,valuesheader

def _assignBobineData(bobine_data,group,tbldata):
    bobine_data["grp"]=group
    bobine_data["bobine_id"] = tbldata[-1].get("bobine_id")
    bobine_data["bobine_nome"] = tbldata[-1].get("bobine_nome")
    bobine_data["bobinagem_id"] = tbldata[-1].get("bobinagem_id")
    bobine_data["row_id"] = tbldata[-1].get("row_id")

def _checkSpecs(bobine_data,specs,tblheader):
    bobine_data["errors"]=[]
    for key in specs.keys():
        spec = specs.get(key)
        if key not in bobine_data:
            if spec.get("required")==1:
                tblheader["errors"].append({"id":spec.get("id"),"parameter":key,"designacao":spec.get("designacao"),"description":"É obrigatório testar o parâmetro","code":"E00"})
        else:
            if bobine_data.get(key).get("unit")!=spec.get("unit"):
                bobine_data["errors"].append({"description":f"""A unidade do ensaio não corresponde à unidade definida nas especificações {bobine_data.get(key).get("unit")} - {spec.get("unit")}""","code":"E01"})
            elif spec.get("values") is not None:
                values_spec = spec.get("values")
                unit_spec = spec.get("unit")
                value = bobine_data.get(key).get("value")
                unit = bobine_data.get(key).get("unit")
                if value is None:
                    bobine_data["range"]=None
                elif value>try_float(values_spec[1]):
                    bobine_data["range"] = 1
                elif value<try_float(values_spec[0]):    
                    bobine_data["range"] = -1
                else:
                    bobine_data["range"] = 0
                if value is None:
                    bobine_data["target"]=None
                elif value>try_float(values_spec[3]):
                    bobine_data["target"] = 1
                elif value<try_float(values_spec[2]):    
                    bobine_data["target"] = -1
                else:
                    bobine_data["target"] = 0

def _block2(counter,block,grp,row,keys,valuesheader,tblheader,tbldata,tblgroup,bdata,specs):
    if row[0].lower() == "nome":
        incrementCounter(counter,block)
    if (counter.get(block)==0 and len(keys)==0) and row[0].lower() == "nome":
        keys=mapper(row,block,counter.get(block))
        valuesheader = {key.lower(): {} for key in keys[1:]}
    if row[0].lower().startswith("unidade"):
        incrementCounter(counter,block)
        append_dict(valuesheader,keys[1:],[{"unit": x} for x in row[1:]])
    elif row[0].lower().startswith("parâmetro"):
        incrementCounter(counter,block)
        append_dict(valuesheader,keys[1:],[{"designacao": x} for x in row[1:]])
    elif (counter.get(block) is not None and row[0].lower() != "nome"):
        bobine_data = {**valuesheader}
        append_dict(bobine_data,keys[1:],[{"value": try_float(x.replace(",", "."))} for x in row[1:]])
        if row[0].lower().startswith("média"):
            if grp.get("enabled")==False:
                grp["enabled"]=True
                grp["value"] = grp.get("value") + 1
                grp["ciclo"] =1
            _assignBobineData(bobine_data,counter.get(block),tbldata)
            tblgroup.append(bobine_data)
        elif row[0].lower().startswith("desviopadrão"):
            if grp.get("enabled")==False:
                grp["enabled"]=True
                grp["value"] = grp.get("value") + 1
                grp["ciclo"] =1
            _assignBobineData(bobine_data,counter.get(block),tbldata)
            tblgroup.append(bobine_data)
        elif row[0].lower().startswith("faixa"):
            if grp.get("enabled")==False:
                grp["enabled"]=True
                grp["value"] = grp.get("value") + 1
                grp["ciclo"] =1
            _assignBobineData(bobine_data,counter.get(block),tbldata)
            tblgroup.append(bobine_data)
        elif row[0].lower().startswith("totalmédia"):
            tblheader["media"]=bobine_data
        elif row[0].lower().startswith("totaldesviopadrão"):
            tblheader["desviopadrao"]=bobine_data
        elif row[0].lower().startswith("totalfaixa"):
            bobine_data["group"]=row[0].lower()
            tblheader["faixa"]=bobine_data
        else:
            match = re.search(r'\d+', row[0])
            if match:
                number = match.group().zfill(2) #Bobine Number
                bobine_nome = f"""{bdata[0].get("nome")}-{number}"""
                bobine = next((r for r in bdata if r['bobine_nome'] == bobine_nome), None)
                if bobine is None:
                    raise ValueError(f"""Não foi identificada a bobine na linha {row} bobinagem {bdata[0].get("nome")}""")
            else:
                raise ValueError(f"""Não foi identificada a bobine na linha {row} bobinagem {bdata[0].get("nome")}""")

            grp["enabled"]=False
            bobine_data["grp"] = grp.get("value")
            bobine_data["ciclo"] = grp.get("ciclo")
            bobine_data["bobine_id"] = bobine.get("bobine_id")
            bobine_data["bobine_nome"] = bobine_nome
            bobine_data["bobinagem_id"] = bobine.get("id")
            bobine_data["row_id"] = row[0]
            grp["ciclo"]=grp["ciclo"]+1
            _checkSpecs(bobine_data,specs,tblheader)
            tbldata.append(bobine_data)
        incrementCounter(counter,block)
    return counter,block,keys,valuesheader

#endregion







#NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN

@api_view(['POST'])
@renderer_classes([JSONRenderer])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def LoadLabParametersByFile(request, format=None):
    try:
        uploaded_file = request.FILES.get("file")
        csv_reader = csv.reader(io.TextIOWrapper(uploaded_file))
        block = 0
        _block_lines_counter = 0
        _cycle_counter = 0
        
        _header=[]
        _duplicates=[]

        tblHeader = {}
        tblblock1 = {}
        tblparameters = []
        tbldata = {}
        print("READING")
        for row in csv_reader:
            if not row:
                _header= []
                block = block + 1
                _block_lines_counter = 0
            elif (block==0):
                print("block0")
                print(row)
                blockHeader(row,None,tblHeader,_duplicates)
                _block_lines_counter = _block_lines_counter + 1
            elif (block==1):
                print("block1")
                print(row)
                #if _block_lines_counter>=2 and _block_lines_counter<=3:
                #    _header.append(row)
                #elif _block_lines_counter>3:
                #    block1(_header,row,bdata,tblblock1)
                _block_lines_counter = _block_lines_counter + 1
            elif (block==2):
                print("blovk2")
                print(row)
                if _block_lines_counter == 0:
                    print("####")
                    if not tblHeader or "modo_ensaio" not in tblHeader or "tipo_ensaio" not in tblHeader:
                        raise ValueError(f"""Erro de cabeçalho no ficheiro submetido""")
                #    filtered_specs = {key: value for key, value in specs.items() if value.get('parameter_type') == value.get('parameter_type') and value.get('parameter_mode') == tblHeader.get("modo_ensaio")}
                #    blockParameters(row,filtered_specs,tblparameters)
                elif _block_lines_counter == 1:
                    a=1
                    #PARAMETER DESCRIPTION
                elif _block_lines_counter == 2:
                    a=1
                    #PARAMETER UNITS
                #else:
                #    if starts_with_numeric(row[0]):
                #        _cycle_counter = _cycle_counter + 1
                #        block2(tblparameters,row,_cycle_counter,bdata,tbldata)
                _block_lines_counter = _block_lines_counter + 1
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao carregar parâmetros! {str(error)}"})            
        
        
        
        
        #block=0
        #counter={}
        #valuesheader= {}
    #     for row in csv_reader:
    #         if not row:
    #             keys = []
    #             values=[]
    #             block = block + 1
    #         else:
    #             if (block==2):
    #                 if row[0].lower() == "nome":
    #                     incrementCounter(counter,block)
    #                 if (counter.get(block)==0 and len(keys)==0) and row[0].lower() == "nome":
    #                     keys=mapper(row,block,counter.get(block))
    #                     valuesheader = {key.lower(): {} for key in keys[1:]}
    #                 if row[0].lower().startswith("unidade"):
    #                     incrementCounter(counter,block)
    #                     append_dict(valuesheader,keys[1:],[{"unit": x} for x in row[1:]])
    #                 elif row[0].lower().startswith("parâmetro"):
    #                     incrementCounter(counter,block)
    #                     append_dict(valuesheader,keys[1:],[{"designacao": x} for x in row[1:]])
    #     with transaction.atomic():
    #         with connections["default"].cursor() as cursor:
    #             new_list = [
    #                 {"nome": key, "designacao": value['designacao'], "unit": value['unit']} 
    #                 for key, value in valuesheader.items()
    #             ]
    #             return Response({"rows": new_list, "total": len(new_list)})
    # except Exception as error:
    #     return Response({"status": "error", "title": f"Erro ao carregar parâmetros! {str(error)}"})


def LabParametersUnitLookup(request, format=None):
    conn = connections["default"].cursor()
    cols = ['unit']
    r = PostData(request)
    f = Filters(r.filter)
    f.setParameters({"unit":{"value": lambda v: Filters.getUpper(v.get("unit")), "field": lambda k, v: f'upper({k})'}}, True)
    f.auto()
    f.where()
    f.value("and")    

    dql = db.dql(request.data, False)
    dql.columns = encloseColumn(cols,False)
    response = db.executeSimpleList(lambda: (
        f"""
            select 
            distinct {dql.columns}
            from producao_lab_parameters
            {f.text}
            {dql.sort}
            {dql.limit}
        """
    ), conn, f.parameters)

    return Response(response)

def _checkParameterInUse(parameter_id,cursor):
    f = Filters({"parameter_id": parameter_id})
    f.where()
    f.add(f'parameter_id = :parameter_id', True)
    f.value("and")
    return db.exists("producao_lab_metodoparameters", f, cursor).exists

def ListLabParameters(request, format=None):
    connection = connections["default"].cursor()
    r = PostData(request)
    pf = ParsedFilters(r.filter,"where",r.apiversion)   
    dql = db.dql(request.data, False,False)
    parameters = {**pf.parameters}

    cols=f"""*"""
    dql.columns=encloseColumn(cols,False)
    sql = lambda p, c, s: (
         f"""
            SELECT {c(f'{cols}')} 
            FROM producao_lab_parameters asp
            {pf.group()}
            {s(dql.sort)} {p(dql.paging)} {p(dql.limit)}  
        """
    )

    if ("export" in r.data):
        dql.limit=f"""limit {r.data.get("limit")}"""
        dql.paging=""
        return export(sql, db_parameters=parameters, parameters=r.data,conn_name=AppSettings.reportConn["sgp"],dbi=db,conn=connection)
    try:
        response = db.executeList(sql, connection, parameters,[],None,None,r.norun)
    except Exception as error:
        print(str(error))
        return Response({"status": "error", "title": str(error)})
    return Response(response)

def DeleteLabParameter(request, format=None):
    r = PostData(request)
    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                inuse = _checkParameterInUse(r.filter.get("id"),cursor)      
                if inuse:
                    return Response({"status": "error", "title": f"O parâmetro encontra-se em uso!"})     
                dml = db.dml(TypeDml.DELETE,None,"producao_lab_parameters",{"id":Filters.getNumeric(r.filter.get("id"),"isnull")},None,False)
                db.execute(dml.statement, cursor, dml.parameters)
                return Response({"status": "success", "title": "Registo eliminado com sucesso!", "subTitle":None})
    except Exception as error:
        return Response({"status": "error", "title": f"Erro ao eliminar registo! {str(error)}"})

def NewLabParameter(request, format=None):
    r = PostData(request)
    def insert(data,cursor):
        values={
            **excludeDictKeys(data,["id","rowadded","rowvalid","versao"]),
            "t_stamp":timestamp(),
            "user_id":request.user.id,
            "status":1,
            "nvalues":4,
            "versao":f"(select count(*) + 1 v from producao_lab_parameters t where lower(t.nome)=lower({Filters.fParam('nome')}))"     
        }
        dml = db.dml(TypeDml.INSERT, values, "producao_lab_parameters", None, None, False,["versao"])
        db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                for i, v in enumerate(r.data.get("rows")):
                    insert(v,cursor)
        return Response({"status": "success", "title": "Registo(s) inserido(s) com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})

def UpdateLabParameter(request, format=None):
    r = PostData(request)
    def update(data,id,cursor):
        values={
            **excludeDictKeys(data,["id","rowadded","rowvalid","versao","t_stamp"]),
            "t_stamp_update":timestamp(),
            "user_id":request.user.id,
            "versao":f"versao=(select count(*) + 1 v from ( select * from producao_lab_parameters t where lower(t.nome)=lower({Filters.fParam('nome')}) ) t )"
        }
        dml = db.dml(TypeDml.UPDATE, values, "producao_lab_parameters", {"id":Filters.getNumeric(id,"isnull")}, None, False,["versao"])
        db.execute(dml.statement, cursor, dml.parameters)

    try:
        with transaction.atomic():
            with connections["default"].cursor() as cursor:
                for i, v in enumerate(r.data.get("rows")):
                    update(v,v.get("id"),cursor)
        return Response({"status": "success", "title": "Registo(s) alterado(s) com sucesso!", "subTitle":f'{None}'})
    except Exception as error:
        return Response({"status": "error", "title": str(error)})