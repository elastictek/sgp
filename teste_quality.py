import csv
import os
import re
from support.myUtils import try_float
from support.database import ParsedFilters, encloseColumn, Filters, DBSql, TypeDml, fetchall, Check
import mysql.connector

parameters_patterns = [
    re.compile(r'(\b\d+)(st|nd|rd|th)\b', re.IGNORECASE),  # Matches 1st, 2nd, 3rd, etc. (case-insensitive)
    re.compile(r'(\b(?:ciclo|cycle|ciclico)\s*)(\d+)', re.IGNORECASE),  # Matches ciclo, cycle, or ciclico followed by a number (case-insensitive)
    re.compile(r'(\d+)(?:ciclo|cycle|ciclico)\b', re.IGNORECASE),  # Matches a number followed by ciclo, cycle, or ciclico (case-insensitive)
    re.compile(r'(1|2|3)\s*(?:ciclo|cycle|ciclico)', re.IGNORECASE)  # Matches 1 ciclo, 2 ciclo, 3 ciclo, etc. (case-insensitive)
]

data_mapper = {"tração":"traction","desgrudar":"peel","gramagem":"gramagem","simples":"simples","controle":"controle","cíclico":"ciclico"}
header_mapper = {'Nome do ensaio':"nome_ensaio", 'Modo de ensaio':"modo_ensaio", 'Tipo de ensaio':"tipo_ensaio", 'Título1':"titulo", 'Comentário1':"comentario", 'Palavra-chave':"password", 
                'Nome do produto':"produto", 'Nome do arquivo do ensaio':"filename_ensaio", 'Nome do arquivo do método':"filename_metodo", 'Data do relatório':"data_report", 'Data do ensaio':"data_ensaio", 
                'Velocidade':"velocidade", 'Placa':"placa", 'Lote No:':"lote", "Sub-Lote No:":"sublote", 'Contador cíclico':"contador_ciclico"}

def _mapper(string,map):
    for key, value in map.items():
        string =  re.sub(key, value, string, flags=re.IGNORECASE)
    return string



class LabTestFile:
    def __init__(self, file_path,conn,db):
        self.file_name = os.path.basename(file_path)
        self.file_path=file_path
        self.blocks=[]
        self.read_blocks()
        self.mode=self._getValue(0,0,"modo_ensaio")
        self.type=self._getValue(0,0,"tipo_ensaio")
        self.parameters=self._getParameters()
        self.bobines=self._getBobinagemData()

    def _getValue(self,block,row,key):
        idx = self.blocks[block].get("header").index(key)
        return self.blocks[block].get("data")[row][idx]
    
    def _getBobinagemData(self):
        _bobines=[]
        pattern = r"\d{8}-\d{2}" # pattern for "YYYYMMDD-NN"
        match_filename = re.search(pattern, self.file_name)
        match_nome_ensaio = re.search(pattern, self._getValue(0,0,"nome_ensaio"))
        if match_filename.group()!=match_nome_ensaio.group():
            raise ValueError(f"A bobinagem do nome do ficheiro {match_filename.group()} não corresponse ao ensaio {match_nome_ensaio.group()}!")
        if match_filename:
            value_found = match_nome_ensaio.group()
            _bobines = db.executeSimpleList(lambda: (f"""select pbm.id,pbm.nome,pb.id bobine_id,pb.nome bobine_nome from producao_bobinagem pbm join producao_bobine pb on pb.bobinagem_id=pbm.id where pbm.nome = '{value_found}'"""), cursor, {})["rows"]
            if len(_bobines)==0:
                raise ValueError(f"A bobinagem do {match_nome_ensaio.group()} não existe!")
        return _bobines

    def _getParameters(self):
        parameters=[]
        _header = self.blocks[3].get("header")[1:]
        _designacao = self.blocks[3].get("data")[0][1:]
        _unit = self.blocks[3].get("data")[1][1:]
        for idx,h in enumerate(_header):
            ciclico = False
            ciclo = None
            p=h
            for pattern in parameters_patterns:
                _s = pattern.search(h)
                if _s:
                    ciclico = True
                    _match = re.search(r'\d+', _s.group(0))
                    if _match:
                        ciclo = int(_match.group())
                    p = pattern.sub("", h)
                    continue
            parameters.append({"name":p.lower(),"ciclico":ciclico,"ciclo":ciclo,"unit":_unit[idx],"designacao":_designacao[idx] if _designacao[idx] else h,"header":h})
        return parameters

    def read_blocks(self):
        with open(self.file_path, newline='') as csvfile:
            reader = csv.reader(csvfile)
            # Skip empty lines
            #lines = [line for line in reader if line]
            self.blocks = []
            current_block = {'n':None,'header': [], 'data': []}
            # Define keywords to identify the beginning of each block
            block_keywords = ['Nome do ensaio', 'Placa:', 'Nome']
            nblock=1
            lastblock=0
            for line in reader:
                if not line:
                    nblock+=1
                    continue
                if any(keyword in line for keyword in block_keywords):
                    if lastblock==nblock:
                        nblock+=1
                    lastblock=nblock
                    if current_block['header']:
                        self.blocks.append(current_block.copy())
                    current_block = {'n':nblock,'header': [_mapper(string,header_mapper) for string in line], 'data': []}
                else:
                    # Add data to the current block
                    if nblock==1:
                        current_block['data'].append([_mapper(string,data_mapper) for string in line])
                    else:
                        current_block['data'].append(line)
            # Save the last block
            if current_block['header']:
                self.blocks.append(current_block.copy())

        self.mode=self._getValue(0,0,"modo_ensaio")
        self.type=self._getValue(0,0,"tipo_ensaio")





db_config = {
    'user': 'root',
    'password': 'Inf0rmat1caETek@',
    'host': '192.168.0.16',
    'database':"sistema"
}
conn = mysql.connector.connect(**db_config)


# Example usage
file_path = f'lab-test-tmp/g grerte20230330-10.csv'
db = DBSql("default")
cursor = conn.cursor()
lf = LabTestFile(file_path,cursor,db)
print(lf.parameters)
#lf.loadLabParameters()
# blocks = _read_blocks(file_path)

# loadLabParameters(blocks)



# blocks[3].get("header").pop(0)
# blocks[3].get("data")[0].pop(0)
# blocks[3].get("data")[1].pop(0)

# print("HEADER")
# print(blocks[3].get("header"))
# print("DESIGNACAO")
# print(blocks[3].get("data")[0])
# print("UNIT")
# print(blocks[3].get("data")[1])

# print([try_float(element.replace(",", ".")) if index != 0 else element for index, element in enumerate(blocks[3].get("data")[2])])
# print([try_float(element.replace(",", ".")) if index != 0 else element for index, element in enumerate(blocks[3].get("data")[3])])
# print([try_float(element.replace(",", ".")) if index != 0 else element for index, element in enumerate(blocks[3].get("data")[4])])



# Print the dictionaries
#for i, block in enumerate(blocks, start=1):
#    print(f"Block {i}:")
#    print(block)
#    print()