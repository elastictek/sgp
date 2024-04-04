import datetime
from email.policy import default
import re
import itertools
from django.utils.connection import ConnectionProxy
from django.views.generic import base
from support.typedb import TypeDB
from sistema.settings.appSettings import AppSettings
from enum import Enum

class TypeDml(Enum):
    INSERT = 1,
    UPDATE = 2,
    DELETE = 3

PATTERN = f'(^==|^=|^!===|^!==|^!=|^>=|^<=|^>|^<|^between:|btw:|^in:|^!between:|!btw:|^!in:|isnull|!isnull|^@:)(.*)'

def replace(regex, s, data):
    "Repçace in a filter every pattern like :name by db named parameter in the pattern %(name)s"
    newstring = ''
    values = {}
    start = 0
    for value in re.finditer(regex, s):
        end, newstart = value.span()
        newstring += s[start:end]
        if value.group(1) in data:
            values[value.group(1)] = data.get(value.group(1), None)
            rep = f"""%({value.group(1)})s"""
            newstring += rep
        else:
            newstring += value.group(0)
        start = newstart
    newstring += s[start:]
    return {"filter": newstring, "values": values if len(values) > 1 else None if len(list(values.values()))==0 else list(values.values())[0]}


def find(lst, exclude=[]):
    return [i for i, v in enumerate(lst) if v in exclude]


def fetchall(cursor, exclude=[]):
    "Return all rows from a cursor as dict"
    columns = [col[0] for col in cursor.description]
    if len(exclude) > 0:
        excludeIdxs = find(columns, exclude)
        columns = [v for i, v in enumerate(columns) if i not in excludeIdxs]
        return [
            dict(
                zip(columns, [v for i, v in enumerate(row) if i not in excludeIdxs]))
            for row in cursor.fetchall()
        ]
    else:
        return [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]

def fetchone(cursor, exclude=[]):
    "Return row from a cursor as dict"
    columns = [col[0] for col in cursor.description]
    if len(exclude) > 0:
        excludeIdxs = find(columns, exclude)
        columns = [v for i, v in enumerate(columns) if i not in excludeIdxs]
        row = cursor.fetchone()
        return dict(zip(columns, [v for i, v in enumerate(row) if i not in excludeIdxs]))        
    else:
        row = cursor.fetchone()
        if (row):
            return dict(zip(columns, row))
        return {}    

def encloseColumn(col, enclose=True, join=True, ignore=[], colSeparator='.', listSeparator=', '):
    if not col:
        return '' if join else []
    if enclose:
        if isinstance(col, list):
            if join:
                return listSeparator.join(colSeparator.join((f'"{wx}"' if wx not in ignore else wx) for wx in w.split(colSeparator)) for w in col)
            else:
                return [colSeparator.join((f'"{wx}"' if wx not in ignore else wx) for wx in w.split(colSeparator)) for w in col]
        else:
            if join:
                return colSeparator.join((f'"{w}"' if w not in ignore else w) for w in col.split(colSeparator))
            else:
                return [(f'"{w}"' if w not in ignore else w) for w in col.split(colSeparator)]
    else:
        return col if not isinstance(col, list) or not join else listSeparator.join(col)


def DBSql(alias):
    type = AppSettings.typeDB.get(alias)
    if type == TypeDB.POSTGRES:
        return PostgresSql(type,alias)
    elif type == TypeDB.MYSQL:
        return MySqlSql(type,alias)
    elif type == TypeDB.SQLSERVER:
        return SqlServerSql(type,alias)


class BaseSql:
    def __init__(self,typeDB):
        self.id = itertools.count()
        self.encloseColumns = True
        self.typeDB = typeDB
        self.markPattern = r'\[#MARK-[A-Z]+-\d+#\]'

    class Dql:
        def __init__(self) -> None:
            self.sort = ""
            self.paging = ""
            self.limit = 0
            self.pageSize = 10
            self.currentPage = 0
            self.columns = '*'

    class Dml:
        def __init__(self) -> None:
            self.columns = []
            self.tags = []
            self.statement = ''
            self.filter = ''
            self.parameters = {}

    class Count:
        def __init__(self) -> None:
            self.statement = ''
            self.parameters = {}
            self.filter = ''
            self.count = 0

    class Exists:
        def __init__(self) -> None:
            self.statement = ''
            self.parameters = {}
            self.filter = ''
            self.exists = False
    
    class Get:
        def __init__(self) -> None:
            self.statement = ''
            self.parameters = {}
            self.filter = ''
            self.rows = False

    class Rows:
        def __init__(self) -> None:
            self.statement = ''
            self.parameters = {}
            self.filter = ''
            self.rows = False
    
    @property
    def encloseColumns(self):
        return self.__encloseColumns

    @encloseColumns.setter
    def encloseColumns(self, encloseColumns):
        self.__encloseColumns = encloseColumns
    
    def __computeSort(self, dictData):
        sort = {"column": None, "field": None, "direction": "ASC", "options": "", **dictData}
        tbl = f"{sort['table']}." if sort.get('table') else ''
        column = encloseColumn(f"{tbl}{sort.get('column')}", self.encloseColumns) if sort.get(
            'column') is not None else encloseColumn(f"{tbl}{sort.get('field')}", self.encloseColumns)
        if column:
            return f"""{column} {sort["direction"]} {sort.get('options')}"""
        return ""

    def __getSort(self, data={},defaultSort=[]):
        if "sort" in data and len(data["sort"])>0:
            sortData = data.get('sort')
        elif len(defaultSort)>0:
            sortData=defaultSort
        else:
            return ""

        if isinstance(sortData, list):
            if len(sortData) > 0:
                sort = ", ".join(
                    list(map(lambda v: self.__computeSort(v), sortData)))
                return f"""ORDER BY {sort}""" if sort else ""
        elif isinstance(sortData, dict):
            sort = self.__computeSort(sortData)
            return f"""ORDER BY {sort}""" if sort else ""
        return ""


    def disable(self,v):
        return ''


    def enable(self,v):
        return v


    def disableCols(self,v):
        return 'count(*)'
    
    def computeSequencial(self,sql,parameters):
        if self.typeDB==TypeDB.SQLSERVER:
            sqParameters=[]
            def replaceParams(m):
                if m.group(0)[2:-2] in parameters:
                    sqParameters.append(parameters[m.group(0)[2:-2]])
                    return rep[re.escape(m.group(0))]

            rep = dict((re.escape(f"%({k})s"), "%s") for k, v in parameters.items()) 
            pattern = re.compile("|".join(rep.keys()))
            text = pattern.sub(replaceParams, sql)
            return {"sql":re.sub(self.markPattern,'',text),"parameters":sqParameters}
        return {"sql":re.sub(self.markPattern,'',sql),"parameters":parameters}

    def executeList(self, sql, connOrCursor, parameters, ignore=[], customDisableCols=None,countSql=None, norun= None,fakeTotal=False):
        if isinstance(connOrCursor,ConnectionProxy):
            with connOrCursor.cursor() as cursor:
                execSql = self.computeSequencial(sql(self.enable, self.enable,self.enable), parameters)
                #print("1-###########################################################################")
                #print(f'SQL--> {execSql["sql"]}')
                #print(f'PARAMS--> {execSql["parameters"]}')
                #print("###########################################################################")
                if (not norun):
                    cursor.execute(execSql["sql"],execSql["parameters"])
                    rows = fetchall(cursor, ignore)
                if (countSql is None):
                     if (not norun):
                        execSql = self.computeSequencial(sql(self.disable, self.disableCols if customDisableCols is None else customDisableCols,self.disable), parameters)
                        cursor.execute(execSql["sql"],execSql["parameters"])
                        count = cursor.fetchone()[0]
                else:
                    if (not norun):
                        execSql = self.computeSequencial(countSql, parameters)
                        cursor.execute(execSql["sql"],execSql["parameters"])
                        count = cursor.fetchone()[0]
        else:
            if (connOrCursor):
                print("DB init success")
            else:
                print("DB init fail")
            execSql = self.computeSequencial(sql(self.enable, self.enable,self.enable), parameters)
            #print("2-###########################################################################")
            #print(f'SQL--> {execSql["sql"]}')
            #print(f'PARAMS--> {execSql["parameters"]}')
            #print("###########################################################################")
            if (not norun):
                connOrCursor.execute(execSql["sql"],execSql["parameters"])
                rows = fetchall(connOrCursor, ignore)
            if (countSql is None):
                if (not norun):
                    execSql = self.computeSequencial(sql(self.disable, self.disableCols if customDisableCols is None else customDisableCols,self.disable), parameters)
                    connOrCursor.execute(execSql["sql"],execSql["parameters"])
                    count = connOrCursor.fetchone()[0]
            else:
                if (not norun):
                    execSql = self.computeSequencial(countSql, parameters)
                    connOrCursor.execute(execSql["sql"],execSql["parameters"])
                    count = connOrCursor.fetchone()[0]
        if (norun):
            return {"sql":execSql["sql"].replace("%%","%"),"parameters":execSql["parameters"]}
        
        return {"rows": rows, "total": count, "faketotal":fakeTotal}

    def executeSimpleList(self, sql, connOrCursor, parameters, ignore=[],norun = None):
        if isinstance(connOrCursor,ConnectionProxy):
            with connOrCursor.cursor() as cursor:
                execSql = self.computeSequencial(sql() if callable(sql) else sql, parameters)
                # print("1-###########################################################################")
                # print(f'SQL--> {execSql["sql"]}')
                # print(f'PARAMS--> {execSql["parameters"]}')
                # print("###########################################################################")
                if (not norun):
                    cursor.execute(execSql["sql"],execSql["parameters"])
                    rows = fetchall(cursor, ignore)
        else:
            execSql = self.computeSequencial(sql() if callable(sql) else sql, parameters)
            #print("2-###########################################################################")
            #print(f'SQL--> {execSql["sql"]}')
            #print(f'PARAMS--> {execSql["parameters"]}')
            #print("###########################################################################")
            if (not norun):
                connOrCursor.execute(execSql["sql"],execSql["parameters"])
                rows = fetchall(connOrCursor, ignore)
        if (norun):
            return {"sql":execSql["sql"],"parameters":execSql["parameters"]}
        return {"rows": rows}


    def execute(self, sql, connOrCursor, parameters, returning=False):
        if isinstance(connOrCursor,ConnectionProxy):
            with connOrCursor.cursor() as cursor:
                print(f'EXECUTE--> {sql}')
                print(f'PARAMS--> {parameters}')
                execSql = self.computeSequencial(sql() if callable(sql) else sql, parameters)
                cursor.execute(execSql["sql"],execSql["parameters"])
                if returning:
                    ret = cursor.fetchone()[0]
                    return ret
        else:
            print(f'EXECUTE--> {sql}')
            print(f'PARAMS--> {parameters}')
            execSql = self.computeSequencial(sql() if callable(sql) else sql, parameters)
            print(execSql["sql"])
            print(execSql["parameters"])
            connOrCursor.execute(execSql["sql"],execSql["parameters"])
            if returning:
                ret = connOrCursor.fetchone()[0]
                return ret
        return

class PostgresSql(BaseSql):
    def __init__(self, typeDB,alias):
        super().__init__(typeDB)
        self.typeDB = typeDB
        self.dbAlias = AppSettings.dbAlias.get(alias)


    def columns(self, cols, enclose=True, join=True, ignore=['*', 'count(*)']):
        return encloseColumn(cols, enclose, join, ignore)

    def dql(self, data, computeColumns=True, encloseColumns=True, defaultSort=[]):
        "Compute query items: sort and pagination"
        ret = BaseSql.Dql()
        self.encloseColumns = encloseColumns
        ret.sort = self._BaseSql__getSort(data,defaultSort)
        pagination = {"limit": 0, "pageSize": 10, "currentPage": 0, "page": None,
                      "offset": 0, "enabled": False, **data.get('pagination', {})}
        ret.currentPage = pagination.get('currentPage') if pagination.get(
            'page') is None else pagination.get('page')
        limit, pageSize, offset, enabled = pagination.get('limit'), pagination.get(
            'pageSize'), pagination.get('offset'), pagination.get('enabled')
        if enabled:
            a = (0 if offset < 0 else offset) + \
                (((1 if ret.currentPage <= 0 else ret.currentPage) - 1) * pageSize)
            b = 1 if pageSize <= 0 else pageSize
            ret.paging = f"""LIMIT {b} OFFSET {a}"""
        if limit != 0:
            ret.limit = f"""LIMIT {limit}"""
        else:
            ret.limit = ''
        ret.pageSize = pageSize
        if computeColumns:
            ret.columns = self.columns(
                data.get('columns', ['*']), super().encloseColumns)
        return ret

    def dml(self, typeDml, data, table=None, filterParameters=None, returning=None, encloseColumns=True):
        "Compute insert/update/delete items and statement"
        ret = BaseSql.Dml()

        filter = None
        if filterParameters is not None:
            if isinstance(filterParameters,dict):
                filter = Filters(filterParameters)
                filter.where()
                filter.auto([], [], encloseColumns)
                ret.filter = filter.value('and').text
                ret.parameters = filter.parameters
            else:
                filter = filterParameters
                ret.filter = filterParameters.value('and').text
                ret.parameters = filterParameters.parameters

        if typeDml == TypeDml.DELETE:
            if filter is None:
                raise Exception("Filtro Não pode ser None!")

            if table is not None:
                if returning is None:
                    ret.statement = f'DELETE FROM {table} {filter.text}'
                else:
                    ret.statement = f'DELETE FROM {table} {filter.text} returning {returning}'
            return ret
        #d = data.get('data', {})
        ks = list(data.keys())
        ret.columns = self.columns(ks, encloseColumns, False)
        if typeDml == TypeDml.INSERT:
            for i, c in enumerate(ks):
                ret.tags.append(f'%({c})s')
                ret.parameters[c] = data.get(c)
            if table is not None:
                _cols = f'({",".join(ret.columns)})' if len(ret.columns)>0 else ''
                _values = f'VALUES({",".join(ret.tags)})' if len(ret.columns)>0 else 'DEFAULT VALUES'
                if returning is None:
                    ret.statement = f'INSERT INTO {table}{_cols} {_values}'
                else:
                    ret.statement = f'INSERT INTO {table}{_cols} {_values} returning {returning}'
        elif typeDml == TypeDml.UPDATE:
            if filter is None:
                raise Exception("Filtro Não pode ser None!")
            for i, c in enumerate(ks):
                ret.tags.append(f'{ret.columns[i]} = %({c})s')
                ret.parameters[c] = data.get(c)
            ret.filter = filter.text
            if table is not None:
                if returning is None:
                    ret.statement = f'UPDATE {table} SET {",".join(ret.tags)} {filter.text}'
                else:
                    ret.statement = f'UPDATE {table} SET {",".join(ret.tags)} {filter.text} returning {returning}'
        return ret

    def count(self, table, p={}, connOrCursor=None, encloseColumns=True):
        ret = BaseSql.Count()
        f = Filters(p)
        f.where()
        f.auto([], [], encloseColumns)
        ret.filter = f.value('and').text
        ret.parameters = f.parameters
        ret.statement = f'SELECT count(*) as "count" FROM {table} {f.text}'
        if connOrCursor is not None:
            if isinstance(connOrCursor,ConnectionProxy):
                with connOrCursor.cursor() as cursor:
                    cursor.execute(ret.statement, ret.parameters)
                    ret.count = cursor.fetchone()[0]
            else:
                connOrCursor.execute(ret.statement, ret.parameters)
                ret.count = connOrCursor.fetchone()[0]
        return ret

    def exists(self, table, p={}, connOrCursor=None, encloseColumns=True):
        if isinstance(p,dict):
            ret = BaseSql.Exists()
            f = Filters(p)
            f.where()
            f.auto([], [], encloseColumns)
            ret.filter = f.value('and').text
            ret.parameters = f.parameters
            ret.statement = f'SELECT EXISTS (SELECT 1 FROM {table} {f.text})'
        else:
            ret = BaseSql.Exists()
            ret.filter = p.text
            ret.parameters = p.parameters
            ret.statement = f'SELECT EXISTS (SELECT 1 FROM {table} {p.text})'

        if connOrCursor is not None:
            if isinstance(connOrCursor,ConnectionProxy):
                with connOrCursor.cursor() as cursor:
                    cursor.execute(ret.statement, ret.parameters)
                    ret.exists = cursor.fetchone()[0]
            else:
                connOrCursor.execute(ret.statement, ret.parameters)
                ret.exists = connOrCursor.fetchone()[0]
        return ret

    def get(self,columns, table, p={}, connOrCursor=None, encloseColumns=False):
        if isinstance(p,dict):
            ret = BaseSql.Get()
            f = Filters(p)
            f.where()
            f.auto([], [], encloseColumns)
            ret.filter = f.value('and').text
            ret.parameters = f.parameters
            ret.statement = f'SELECT {columns} FROM {table} {f.text}'
        else:
            ret = BaseSql.Get()
            ret.filter = p.text
            ret.parameters = p.parameters
            ret.statement = f'SELECT {columns} FROM {table} {p.text}'
        if connOrCursor is not None:
            if isinstance(connOrCursor,ConnectionProxy):
                with connOrCursor.cursor() as cursor:
                    cursor.execute(ret.statement, ret.parameters)
                    ret.rows = fetchall(cursor)
            else:
                connOrCursor.execute(ret.statement, ret.parameters)
                ret.rows = fetchall(connOrCursor)
        return ret

    def limit(self, table, p={}, limit=1, connOrCursor=None, encloseColumns=True):
        if isinstance(p,dict):
            ret = BaseSql.Rows()
            f = Filters(p)
            f.where()
            f.auto([], [], encloseColumns)
            ret.filter = f.value('and').text
            ret.parameters = f.parameters
            ret.statement = f'select * from {table} {f.text} limit {limit}'
        else:
            ret = BaseSql.Rows()
            ret.filter = p.text
            ret.parameters = p.parameters
            ret.statement = f'select * from {table} {p.text} limit {limit}'

        if connOrCursor is not None:
            if isinstance(connOrCursor,ConnectionProxy):
                with connOrCursor.cursor() as cursor:
                    cursor.execute(ret.statement, ret.parameters)
                    ret.rows = fetchall(cursor)
            else:
                connOrCursor.execute(ret.statement, ret.parameters)
                ret.rows = fetchall(connOrCursor)
        return ret


class MySqlSql(BaseSql):
    def __init__(self, typeDB,alias):
        super().__init__(typeDB)
        self.typeDB = typeDB
        self.dbAlias = AppSettings.dbAlias.get(alias)

    def columns(self, cols, enclose=False, join=True, ignore=['*', 'count(*)']):
        return encloseColumn(cols, enclose, join, ignore)

    def dql(self, data, computeColumns=True, encloseColumns=False, defaultSort=[]):
        "Compute query items: sort and pagination"
        ret = BaseSql.Dql()
        self.encloseColumns = encloseColumns
        ret.sort = self._BaseSql__getSort(data,defaultSort)
        pagination = {"limit": 0, "pageSize": 10, "currentPage": 0, "page": None, "offset": 0, "enabled": False, **data.get('pagination', {})}
        ret.currentPage = pagination.get('currentPage') if pagination.get('page') is None else pagination.get('page')
        limit, pageSize, offset, enabled = pagination.get('limit'), pagination.get('pageSize'), pagination.get('offset'), pagination.get('enabled')
        if enabled:
            a = (0 if offset < 0 else offset) + \
                (((1 if ret.currentPage <= 0 else ret.currentPage) - 1) * pageSize)
            b = 1 if pageSize <= 0 else pageSize
            ret.paging = f"""LIMIT {b} OFFSET {a}"""
        if limit != 0:
            ret.limit = f"""LIMIT {limit}"""
        else:
            ret.limit = ''
        
        ret.pageSize = pageSize
        if computeColumns:
            ret.columns = self.columns(
                data.get('columns', ['*']), super().encloseColumns)
        return ret
    
    def dml(self, typeDml, data, table=None, filterParameters=None, returning=None, encloseColumns=False, ignoreKeys=[]):
        "Compute insert/update/delete items and statement"
        ret = BaseSql.Dml()

        filter = None
        if filterParameters is not None:
            if isinstance(filterParameters,dict):
                filter = Filters(filterParameters)
                filter.where()
                filter.auto([], [], encloseColumns)
                ret.filter = filter.value('and').text
                ret.parameters = filter.parameters
            else:
                filter = filterParameters
                ret.filter = filterParameters.value('and').text
                ret.parameters = filterParameters.parameters

        if typeDml == TypeDml.DELETE:
            if filter is None:
                raise Exception("Filtro Não pode ser None!")

            if table is not None:
                if returning is None:
                    ret.statement = f'DELETE FROM {table} {filter.text}'
                else:
                    ret.statement = f'DELETE FROM {table} {filter.text}'
            return ret
        #d = data.get('data', {})
        ks = list(data.keys())
        ret.columns = self.columns(ks, encloseColumns, False)
        if typeDml == TypeDml.INSERT:
            for i, c in enumerate(ks):
                if (c in ignoreKeys):
                    ret.tags.append(data.get(c))
                else:
                    ret.tags.append(f'%({c})s')
                    ret.parameters[c] = data.get(c)
            if table is not None:
                _cols = f'({",".join(ret.columns)})' if len(ret.columns)>0 else ''
                _values = f'VALUES({",".join(ret.tags)})' if len(ret.columns)>0 else 'DEFAULT VALUES'
                if returning is None:
                    ret.statement = f'INSERT INTO {table}{_cols} {_values}'
                else:
                    ret.statement = f'INSERT INTO {table}{_cols} {_values} returning {returning}'
        elif typeDml == TypeDml.UPDATE:
            if filter is None:
                raise Exception("Filtro Não pode ser None!")
            for i, c in enumerate(ks):
                if (c in ignoreKeys):
                    ret.tags.append(data.get(c))
                else:
                    ret.tags.append(f'{ret.columns[i]} = %({c})s')
                    ret.parameters[c] = data.get(c)
            ret.filter = filter.text
            if table is not None:
                if returning is None:
                    ret.statement = f'UPDATE {table} SET {",".join(ret.tags)} {filter.text}'
                else:
                    ret.statement = f'UPDATE {table} SET {",".join(ret.tags)} {filter.text} returning {returning}'
        return ret

    def count(self, table, p={}, connOrCursor=None, encloseColumns=False):
        ret = BaseSql.Count()
        f = Filters(p)
        f.where()
        f.auto([], [], encloseColumns)
        ret.filter = f.value('and').text
        ret.parameters = f.parameters
        ret.statement = f'SELECT count(*) as "count" FROM {table} {f.text}'
        if connOrCursor is not None:
            if isinstance(connOrCursor,ConnectionProxy):
                with connOrCursor.cursor() as cursor:
                    cursor.execute(ret.statement, ret.parameters)
                    ret.count = cursor.fetchone()[0]
            else:
                connOrCursor.execute(ret.statement, ret.parameters)
                ret.count = connOrCursor.fetchone()[0]
        return ret

    def exists(self, table, p={}, connOrCursor=None, encloseColumns=False):
        if isinstance(p,dict):
            ret = BaseSql.Exists()
            f = Filters(p)
            f.where()
            f.auto([], [], encloseColumns)
            ret.filter = f.value('and').text
            ret.parameters = f.parameters
            ret.statement = f'SELECT EXISTS (SELECT 1 FROM {table} {f.text})'
        else:
            ret = BaseSql.Exists()
            ret.filter = p.text
            ret.parameters = p.parameters
            ret.statement = f'SELECT EXISTS (SELECT 1 FROM {table} {p.text})'
            print(ret.statement)
            print(ret.parameters)
        if connOrCursor is not None:
            if isinstance(connOrCursor,ConnectionProxy):
                with connOrCursor.cursor() as cursor:
                    cursor.execute(ret.statement, ret.parameters)
                    ret.exists = cursor.fetchone()[0]
            else:
                connOrCursor.execute(ret.statement, ret.parameters)
                ret.exists = connOrCursor.fetchone()[0]
        return ret

    def get(self,columns, table, p={}, connOrCursor=None, encloseColumns=False):
        if isinstance(p,dict):
            ret = BaseSql.Get()
            f = Filters(p)
            f.where()
            f.auto([], [], encloseColumns)
            ret.filter = f.value('and').text
            ret.parameters = f.parameters
            ret.statement = f'SELECT {columns} FROM {table} {f.text}'
        else:
            ret = BaseSql.Get()
            ret.filter = p.text
            ret.parameters = p.parameters
            ret.statement = f'SELECT {columns} FROM {table} {p.text}'
        if connOrCursor is not None:
            if isinstance(connOrCursor,ConnectionProxy):
                with connOrCursor.cursor() as cursor:
                    cursor.execute(ret.statement, ret.parameters)
                    ret.rows = fetchall(cursor)
            else:
                connOrCursor.execute(ret.statement, ret.parameters)
                ret.rows = fetchall(connOrCursor)
        return ret

    def limit(self, table, p={}, limit=1, connOrCursor=None, encloseColumns=True):
        if isinstance(p,dict):
            ret = BaseSql.Rows()
            f = Filters(p)
            f.where()
            f.auto([], [], encloseColumns)
            ret.filter = f.value('and').text
            ret.parameters = f.parameters
            ret.statement = f'select * from {table} {f.text} limit {limit}'
        else:
            ret = BaseSql.Rows()
            ret.filter = p.text
            ret.parameters = p.parameters
            ret.statement = f'select * from {table} {p.text} limit {limit}'

        if connOrCursor is not None:
            if isinstance(connOrCursor,ConnectionProxy):
                with connOrCursor.cursor() as cursor:
                    cursor.execute(ret.statement, ret.parameters)
                    ret.rows = fetchall(cursor)
            else:
                connOrCursor.execute(ret.statement, ret.parameters)
                ret.rows = fetchall(connOrCursor)
        return ret

class SqlServerSql(BaseSql):
    def __init__(self, typeDB,alias):
        super().__init__(typeDB)
        self.typeDB = typeDB
        self.dbAlias = AppSettings.dbAlias.get(alias)
    
    def columns(self, cols, enclose=False, join=True, ignore=['*', 'count(*)']):
        return encloseColumn(cols, enclose, join, ignore)

    def dql(self, data, computeColumns=True, encloseColumns=False, defaultSort=[]):
        "Compute query items: sort and pagination"
        ret = BaseSql.Dql()
        self.encloseColumns = encloseColumns
        ret.sort = self._BaseSql__getSort(data,defaultSort)
        pagination = {"limit": 0, "pageSize": 10, "currentPage": 0, "page": None, "offset": 0, "enabled": False, **data.get('pagination', {})}
        ret.currentPage = pagination.get('currentPage') if pagination.get('page') is None else pagination.get('page')
        limit, pageSize, offset, enabled = pagination.get('limit'), pagination.get('pageSize'), pagination.get('offset'), pagination.get('enabled')
        if enabled:
            a = (0 if offset < 0 else offset) + \
                (((1 if ret.currentPage <= 0 else ret.currentPage) - 1) * pageSize)
            b = 1 if pageSize <= 0 else pageSize
            ret.paging = f"""
                OFFSET {a} ROWS 
                FETCH NEXT {b} ROWS ONLY
            """
        if limit != 0:
            ret.limit = f"""
                OFFSET 0 ROWS 
                FETCH FIRST {limit} ROWS ONLY
            """
        else:
            ret.limit = ''
        ret.pageSize = pageSize
        if computeColumns:
            ret.columns = self.columns(
                data.get('columns', ['*']), super().encloseColumns)
        return ret

    def dml(self, typeDml, data, table=None, filterParameters=None, returning=None, encloseColumns=False, ignoreKeys=[]):
        "Compute insert/update/delete items and statement"
        ret = BaseSql.Dml()
        return None
        filter = None
        if filterParameters is not None:
            if isinstance(filterParameters,dict):
                filter = Filters(filterParameters)
                filter.where()
                filter.auto([], [], encloseColumns)
                ret.filter = filter.value('and').text
                ret.parameters = filter.parameters
            else:
                filter = filterParameters
                ret.filter = filterParameters.value('and').text
                ret.parameters = filterParameters.parameters

        if typeDml == TypeDml.DELETE:
            if filter is None:
                raise Exception("Filtro Não pode ser None!")

            if table is not None:
                if returning is None:
                    ret.statement = f'DELETE FROM {table} {filter.text}'
                else:
                    ret.statement = f'DELETE FROM {table} {filter.text}'
            return ret
        #d = data.get('data', {})
        ks = list(data.keys())
        ret.columns = self.columns(ks, encloseColumns, False)
        if typeDml == TypeDml.INSERT:
            for i, c in enumerate(ks):
                if (c in ignoreKeys):
                    ret.tags.append(data.get(c))
                else:
                    ret.tags.append(f'%({c})s')
                    ret.parameters[c] = data.get(c)
            if table is not None:
                _cols = f'({",".join(ret.columns)})' if len(ret.columns)>0 else ''
                _values = f'VALUES({",".join(ret.tags)})' if len(ret.columns)>0 else 'DEFAULT VALUES'
                if returning is None:
                    ret.statement = f'INSERT INTO {table}{_cols} {_values}'
                else:
                    ret.statement = f'INSERT INTO {table}{_cols} {_values} returning {returning}'
        elif typeDml == TypeDml.UPDATE:
            if filter is None:
                raise Exception("Filtro Não pode ser None!")
            for i, c in enumerate(ks):
                ret.tags.append(f'{ret.columns[i]} = %({c})s')
                ret.parameters[c] = data.get(c)
            ret.filter = filter.text
            if table is not None:
                if returning is None:
                    ret.statement = f'UPDATE {table} SET {",".join(ret.tags)} {filter.text}'
                else:
                    ret.statement = f'UPDATE {table} SET {",".join(ret.tags)} {filter.text} returning {returning}'
        return ret

    def count(self, table, p={}, connOrCursor=None, encloseColumns=False):
        ret = BaseSql.Count()
        f = Filters(p)
        f.where()
        f.auto([], [], encloseColumns)
        ret.filter = f.value('and').text
        ret.parameters = f.parameters
        ret.statement = f'SELECT count(*) as "count" FROM {table} {f.text}'
        if connOrCursor is not None:
            if isinstance(connOrCursor,ConnectionProxy):
                with connOrCursor.cursor() as cursor:
                    cursor.execute(ret.statement, ret.parameters)
                    ret.count = cursor.fetchone()[0]
            else:
                connOrCursor.execute(ret.statement, ret.parameters)
                ret.count = connOrCursor.fetchone()[0]
        return ret

    def exists(self, table, p={}, connOrCursor=None, encloseColumns=False):
        if isinstance(p,dict):
            ret = BaseSql.Exists()
            f = Filters(p)
            f.where()
            f.auto([], [], encloseColumns)
            ret.filter = f.value('and').text
            ret.parameters = f.parameters
            ret.statement = f'SELECT EXISTS (SELECT 1 FROM {table} {f.text})'
        else:
            ret = BaseSql.Exists()
            ret.filter = p.text
            ret.parameters = p.parameters
            ret.statement = f'SELECT EXISTS (SELECT 1 FROM {table} {p.text})'
        print(ret.statement)
        if connOrCursor is not None:
            if isinstance(connOrCursor,ConnectionProxy):
                with connOrCursor.cursor() as cursor:
                    cursor.execute(ret.statement, ret.parameters)
                    ret.exists = cursor.fetchone()[0]
            else:
                connOrCursor.execute(ret.statement, ret.parameters)
                ret.exists = connOrCursor.fetchone()[0]
        return ret
    
    def get(self,columns, table, p={}, connOrCursor=None, encloseColumns=False):
        if isinstance(p,dict):
            ret = BaseSql.Get()
            f = Filters(p)
            f.where()
            f.auto([], [], encloseColumns)
            ret.filter = f.value('and').text
            ret.parameters = f.parameters
            ret.statement = f'SELECT {columns} FROM {table} {f.text}'
        else:
            ret = BaseSql.Get()
            ret.filter = p.text
            ret.parameters = p.parameters
            ret.statement = f'SELECT {columns} FROM {table} {p.text}'
        if connOrCursor is not None:
            if isinstance(connOrCursor,ConnectionProxy):
                with connOrCursor.cursor() as cursor:
                    cursor.execute(ret.statement, ret.parameters)
                    ret.rows = fetchall(cursor)
            else:
                connOrCursor.execute(ret.statement, ret.parameters)
                ret.rows = fetchall(connOrCursor)
        return ret

    def limit(self, table, p={}, limit=1, connOrCursor=None, encloseColumns=True):
        if isinstance(p,dict):
            ret = BaseSql.Rows()
            f = Filters(p)
            f.where()
            f.auto([], [], encloseColumns)
            ret.filter = f.value('and').text
            ret.parameters = f.parameters
            ret.statement = f'select * from {table} {f.text} OFFSET 0 ROWS FETCH FIRST {limit} ROWS ONLY'
        else:
            ret = BaseSql.Rows()
            ret.filter = p.text
            ret.parameters = p.parameters
            ret.statement = f'select * from {table} {p.text} OFFSET 0 ROWS FETCH FIRST {limit} ROWS ONLY'

        if connOrCursor is not None:
            if isinstance(connOrCursor,ConnectionProxy):
                with connOrCursor.cursor() as cursor:
                    cursor.execute(ret.statement, ret.parameters)
                    ret.rows = fetchall(cursor)
            else:
                connOrCursor.execute(ret.statement, ret.parameters)
                ret.rows = fetchall(connOrCursor)
        return ret

def trim_outer_quotes(input_string):
    # Use a regular expression to match the first and last quote characters
    match = re.match(r"^(['\"])(.*)(\1)$", input_string)
    
    # If there is a match, return the content between the quotes; otherwise, return the original string
    return match.group(2) if match else input_string

def _computeCase(field,params):
    if (params.get("case") == "i" and params.get("type") in ["input","string","text"]):
        return f"lower({field})"
    return field

class ParsedFilters:
    def __init__(self,filterData={},prefix="where",apiversion=None,processGroups=None,mask=None,fn=None) -> None:
        self.fn = fn
        self.betweenfilters = "and"
        self.groupHasFilters = {}
        self.parameters = {}
        self.filterData = {**filterData}
        self.groups = {}
        self.prefix= {"t1":prefix} if not isinstance(prefix, dict) else prefix
        if apiversion=="4":
            print("API VERSION --4--")
            self.compute(processGroups,mask)

    def _getPrefix(self,_group):
        if isinstance(self.prefix, dict):
             if _group in self.prefix:
                return self.prefix.get(_group)
             else:
                return "where"
        return self.prefix
    
    def getProperty(self,filterName,prop,group=None):
        if filterName in self.filterData:
            if group is not None:
                    if group in self.filterData.get(filterName):
                        return self.filterData.get(filterName).get(group).get(prop)
                    else:
                        return None
            else:
                return self.filterData.get(filterName).get(prop)
        return None
    def setProperty(self,filterName,prop,group,value):
        if filterName in self.filterData:
            if group:
                if group in self.filterData.get(filterName).get("groups"):
                    self.filterData[filterName]["groups"][group][prop]=value
            else:
                self.filterData[filterName][prop]=value
    
    def setProperties(self,filterName,group,value):
        if filterName in self.filterData:
            if group:
                if group in self.filterData.get(filterName).get("groups"):
                    self.filterData[filterName]["groups"][group] = {**self.filterData[filterName]["groups"][group],**value}
            else:
                self.filterData[filterName]={**self.filterData[filterName],**value}
    
    def log(self,str="t1"):
        print(self.group(str))
        print(self.parameters)

    def hasFilters(self,name=None):
        r=False
        if name is None:
            r = any(value for value in self.groupHasFilters.values())
        elif isinstance(name, list):
            r = any(self.groupHasFilters[key] for key in name if key in self.groupHasFilters and self.groupHasFilters[key])
        else:
            r = self.groupHasFilters.get(name) 
        return True if r==True else False
    
    def compute(self,processGroups=None,mask=None):
        _grouped = {}
        for value in self.filterData.values():
            _groups = value.get('groups', {})
            for group_name, group_info in _groups.items():
                key = f"{value['name']}_{group_name}"
                if group_name not in _grouped:
                    _grouped[group_name] = {}
                _grouped[group_name][key] = {"name":value['name'],**group_info}

        if processGroups is None:
            self.groupHasFilters={}
        else:
            self.groupHasFilters = {key: value for key, value in self.groupHasFilters.items() if key not in processGroups}
        for group_name, _p in _grouped.items():
            if processGroups is not None and group_name not in processGroups:
                continue
            _fgrp_txt = []
            self.groupHasFilters[group_name]=False
            for _name, _param in _p.items():
                _name = _param.get("name") if "name" in _param else _name
                _ftxt = []
                for idx, el in enumerate(_param.get("parsed")):
                    _pn = f"f.{_name}.{idx}" #Parameter Name   
                    _alias = _param.get("mask").format(k=_param.get("alias")) if _param.get("mask") else _computeCase(_param.get("alias"),_param) if _param.get("alias") else _computeCase(_name,_param)
                    #_parameters[_pn] = {"value": lambda v: el if el is not None else None, "field": lambda k, v: _alias}
                    if el in ["and","or"]:
                        _ftxt.append(f" {el} ")
                        continue
                    if el in ["(",")"]:
                        _ftxt.append(f" {el} ")
                        continue
                    if (el.startswith(":")):
                        el = el.replace(":","",1)
                        if (el==""):
                            continue
                        _ftxt.append(f"""({trim_outer_quotes(el).replace("%","%%")})""")
                        continue
                    if (el.startswith("@:")):
                        el = trim_outer_quotes(el.replace("@:","",1))
                        pattern = r'\{([^{}]+)\}(.+)'
                        match = re.match(pattern, el)
                        if match:
                            _pn = match.group(1)
                            _alias = match.group(1)
                            el = match.group(2)
                        else:
                            continue
                    _fp = FiltersParser({_pn:el},{_pn:_alias},_param)
                    _ftxt.append(f"""({_fp.get("filters")[0]})""")
                    self.parameters = {**self.parameters,**_fp.get("parameters")}
               
                gmask = _param.get("gmask")
                retfn=None
                if self.fn and callable(self.fn):
                    retfn = self.fn(self,group_name,_name,_param,_ftxt,mask,gmask)
                    if isinstance(retfn, list):
                         _ftxt=retfn   
                if retfn!=True:
                    if len(_fgrp_txt)>0:
                        _fgrp_txt.append(f" {self.betweenfilters} ")
                    _fgrp_txt.append(f"""({"".join(_ftxt)})""")
                    if mask is None:
                        self.groups[group_name]=f""" {"" if gmask else self._getPrefix(group_name)} ({"".join(_fgrp_txt)})"""
                        if (gmask):
                            self.groups[group_name] = f"""{self._getPrefix(group_name)} {gmask.replace("{_}",self.groups[group_name])}"""
                    else:
                        self.groups[group_name]=f""" {"" if gmask else self._getPrefix(group_name)} ({mask.replace("$[v]","".join(_fgrp_txt))})"""
                        if (gmask):
                            self.groups[group_name] = f"""{self._getPrefix(group_name)} {gmask.replace("{_}",self.groups[group_name])}"""
                    if self.groups[group_name] is not None and self.groups[group_name].strip()!="":
                        self.groupHasFilters[group_name]=True
 
    def group(self,name="t1"):
        return self.groups.get(name) if self.groups.get(name) is not None else ""
    

    def setGroup(self,name,value):
        self.groupHasFilters[name]=False
        if value is not None and value.strip()!="":
            self.groupHasFilters[name]=True
        self.groups[name]=value

class Filters:
    def __init__(self, filterData={}):
        self.paramsSet = {}
        self.paramsSetValues = {}
        self.paramsSetFields = {}
        self.clause = {"value": '', "enabled": False,
                       "force": False, "clause": ''}
        self.filterData = {**filterData}
        self.__filters = []
        self.autoParamsSet = {}
        self.__autoFilters = []
        self.text = ''
        self.length = 0
        self.hasFilters = False
        self.parameters = {}
        self.definedParameters = {}

    def where(self, force=False, override=False):
        self.clause['enabled'] = True
        self.clause['force'] = force
        self.clause['value'] = override if override is not False else 'where'
        return self

    def having(self, force=False, override=False):
        self.clause['enabled'] = True
        self.clause['force'] = force
        self.clause['value'] = override if override is not False else 'having'
        return self

    def on(self, force=False, override=False):
        self.clause['enabled'] = True
        self.clause['force'] = force
        self.clause['value'] = override if override is not False else 'on'
        return self

    def land(self, force=False):
        self.clause['enabled'] = True
        self.clause['force'] = force
        self.clause['value'] = 'and'
        return self

    def lor(self, force=False):
        self.clause['enabled'] = True
        self.clause['force'] = force
        self.clause['value'] = 'or'
        return self

    def setParameters(self, parameters={}, clearData=False):
        for key, value in parameters.items():
            val = None
            k = value['key'] if 'key' in value else key
            fld = k
            none = value['none'] if 'none' in value else True
            if callable(value['value']):
                val = value['value'](self.filterData)
            else:
                val = value['value']
            if none==True or val is not None:
                if 'field' in value:
                    if callable(value['field']):
                        fld = value['field'](k, self.filterData)
                    else:
                        fld = value['field']
                self.paramsSet[key] = {"value": val, "field": fld}
                self.paramsSetValues[key] = val
                self.paramsSetFields[key] = fld
        if (clearData):
            self.filterData.clear()
        return self

    def add(self, filter, test):
        if not filter:
            return None
        f = replace(r'(?<!:):([a-zA-Z0-9_]+)', filter,
                    {**self.filterData, **self.paramsSetValues})
        if callable(test):
            if test(f['values']):
                self.__filters.append(f['filter'])
        else:
            if test:
                self.__filters.append(f['filter'])
        return self
    
    def remove(self,index):
        if not filter:
            return None
        self.__filters.pop(index)

    def auto(self, exclude=[], include=[], encloseColumns=True, typedb=TypeDB.MYSQL):
        baseData = {**self.filterData, **self.paramsSetValues}
        nData = {}
        if len(include) > 0:
            nData = {k: v for k, v in baseData.items() if k in include}
        elif len(exclude) > 0:
            nData = {k: v for k, v in baseData.items() if k not in exclude}
        else:
            nData=baseData
        a = FiltersParser(nData, self.paramsSetFields,{}, encloseColumns, typedb)
        self.__autoFilters.extend(a['filters'])
        self.autoParamsSet.update(a['parameters'])

    def value(self, op="and"):
        f = []
        f.extend(self.__autoFilters)
        f.extend(self.__filters)

        if self.clause['enabled'] and (len(f) > 0 or self.clause['force']):
            self.clause['clause'] = f""" {self.clause['value']} """
        __filter = f"""({f" {op} ".join(f)})""" if (len(f) > 0) else ''
        __params = {}
        for key, value in self.autoParamsSet.items():
            __params[key] = value
        for key, value in self.paramsSetValues.items():
            __params[key] = value
        for key, value in self.filterData.items():
            if key not in self.paramsSetValues:
                __params[key] = value

        self.text = f"""{self.clause['clause']}{__filter}"""
        self.parameters = __params
        self.length = len(f)
        self.hasFilters = len(f) > 0
        self.definedParameters = self.paramsSetValues

        return self

    def fParam(name):
        return f"%({name})s"

    def nullValue(self,key,dbparam,removeEmpty=True):
        val = self.autoParamsSet.get(key)
        val = self.paramsSetValues.get(key) if key in self.paramsSetValues else val
        if key in self.filterData:
            val = self.filterData.get(key) if key not in self.paramsSetValues else val
        if val is None or val == '':
            return "is null"
        else:
            return dbparam

    def getNumeric(value,isNone=None,compare=None):
        if value is None and compare is None: 
            if isNone:
                return isNone
            else:
                return None
        if value is None and compare is not None:
            if isNone is not None:
                value=isNone
            else:
                return None
        result = re.match(PATTERN, str(value), re.IGNORECASE)
        if not result:
            if compare is not None:
                return f"{compare}{value}"
            return f"=={value}"
        else:
            return value
    def getUpper(value):
        if value is None: return None
        return value.upper()
    def getLower(value):
        if value is None: return None
        return value.lower()
    def getValue(value,isNone=None,compare=None):
        if value is None and compare is None: 
            if isNone:
                return isNone
            else:
                return None
        if value is None and compare is not None:
            if isNone is not None:
                value=isNone
            else:
                return None
        result = re.match(PATTERN, str(value), re.IGNORECASE)
        if not result:
            if compare is not None:
                return f"{compare}{value}"
            return f"{value}"
        else:
            return value


    def ParsedFilters(data):
        #======================================================================
        _groups = {}
        _fparams = {}
        for key, value in data.items():
            if value.get("group") not in _groups:
                _p = {k:v for k, v in data.items() if 'group' in v and v.get("group") == value.get("group")}
                _data = {}
                _fgrp_txt = []
                _groups[value.get("group")] = ""
                for _name, _param in _p.items():
                    _ftxt = []
                    for idx, el in enumerate(_param.get("parsed")):
                        _pn = f"f.{_name}.{idx}" #Parameter Name
                        _alias = _param.get("mask").format(k=_param.get("alias")) if _param.get("mask") else _param.get("alias")
                        #_parameters[_pn] = {"value": lambda v: el if el is not None else None, "field": lambda k, v: _alias}
                        if el in ["and","or"]:
                            _ftxt.append(f" {el} ")
                            continue
                        if el in ["(",")"]:
                            _ftxt.append(f" {el} ")
                            continue
                        if (el.startswith(":")):
                            el = el.replace(":","",1)
                            if (el==""):
                                continue
                            _ftxt.append(f"""({el.strip('"')})""")
                            continue
                        if (el.startswith("@:")):
                            el = el.replace("@:","",1).strip('"')
                            pattern = r'\{([^{}]+)\}(.+)'
                            match = re.match(pattern, el)
                            if match:
                                _pn = match.group(1)
                                _alias = match.group(1)
                                el = match.group(2)
                            else:
                                continue
                        _fp = FiltersParser({_pn:el},{_pn:_alias},_param)
                        _ftxt.append(f"""({_fp.get("filters")[0]})""")
                        _fparams = {**_fparams,**_fp.get("parameters")}
                        #print(f'parsed----{_fp.get("filters")[0]} {_fp.get("parameters")}')
                        #_data[_pn] = el
                        
                    if len(_fgrp_txt)>0:
                        _fgrp_txt.append(" and ")    
                    _fgrp_txt.append(f"""({"".join(_ftxt)})""")
                _mainPrefix = "and"
                _groups[value.get("group")]=f""" {_mainPrefix} ({"".join(_fgrp_txt)})"""
                #groups[value.get("group")] = Filters({key: v.get("parsed") for key, v in request.data.get("filter").items() if 'group' in v and v.get("group") == value.get("group")})
        #======================================================================

def _apply_vmask(vmask,field,value,op=None,opNot=None):
    _op=op
    if op=='===':
        _op=''
    elif op=="==":
        _op = "=" if not opNot else "<>"
    elif op=='=':
        _op = "like" if not opNot else "not like"
    elif op is None:
        _op=''
    return vmask.format(k=field,v=value,l=_op) if vmask else value
def _apply_wildcards(value,wildcards=True):
    if (wildcards):
        return value
    return value.replace('%', '').replace('_', '')

def FiltersParser(data, fields={},options={}, encloseColumns=True, typedb=TypeDB.MYSQL):
    filters, parameters = [], {}
    for key, f in data.items():
        if f == None:
            continue
        result = re.match(PATTERN, str(f), re.IGNORECASE)
        if any(fields):
            field = fields[key]
        else:
            field = encloseColumn(key, encloseColumns)
        opNot = result.group(1).startswith('!') if result else False
        op = (result.group(1) if not opNot else result.group(1)[1:]) if result else '='
        value = result.group(2) if result else f
        # if op == '@:':
        #     filters.append(f'{field}'.replace("[f]",f'%(auto_{key})s'))
        #     parameters[f'auto_{key}'] = value
        # el
        if (options and "assign" in options and not options.get("assign")):
            filters.append(_apply_vmask(options.get("vmask"),field,f'%(auto_{key})s',op,opNot))
            parameters[f'auto_{key}'] = _apply_wildcards(value,options.get("wildcards"))
        elif op == '===':
            if typedb==TypeDB.MYSQL:
                filters.append(f"""{("" if not opNot else "not")} {field} <=> {_apply_vmask(options.get("vmask"),field,f'%(auto_{key})s')}""")
            elif  typedb==TypeDB.POSTGRES:
                filters.append(f"""{field} {("IS NOT DISTINCT FROM" if not opNot else "IS DISTINCT FROM")} {_apply_vmask(options.get("vmask"),field,f'%(auto_{key})s')}""")
            else:
                filters.append(f"""{field} {("=" if not opNot else "<>")} {_apply_vmask(options.get("vmask"),field,f'%(auto_{key})s')}""")
            parameters[f'auto_{key}'] = value
        elif op == '==':
            filters.append(f"""{field} {("=" if not opNot else "<>")} {_apply_vmask(options.get("vmask"),field,f'%(auto_{key})s')}""")
            parameters[f'auto_{key}'] = value
        elif op == '=':
            filters.append(f"""{field} {("like" if not opNot else "not like")} {_apply_vmask(options.get("vmask"),field,f'%(auto_{key})s')}""")
            parameters[f'auto_{key}'] = value
        elif op == '>=':
            filters.append(f"""{field} >= {_apply_vmask(options.get("vmask"),field,f'%(auto_{key})s')}""")
            parameters[f'auto_{key}'] = value
        elif op == '<=':
            filters.append(f"""{field} <= {_apply_vmask(options.get("vmask"),field,f'%(auto_{key})s')}""")
            parameters[f'auto_{key}'] = value
        elif op == '>':
            filters.append(f"""{field} > {_apply_vmask(options.get("vmask"),field,f'%(auto_{key})s')}""")
            parameters[f'auto_{key}'] = value
        elif op == '<':
            filters.append(f"""{field} < {_apply_vmask(options.get("vmask"),field,f'%(auto_{key})s')}""")
            parameters[f'auto_{key}'] = value
        elif op.lower() in ['between:', 'btw:']:
            v = value.split(',')
            min = v[0].strip(' ') if v[0].strip(' ') != '' else None
            max = (v[1].strip(' ') if v[1].strip(' ') !=
                   '' else None) if len(v) == 2 else None
            if min and max:
                filters.append(
                    f"""({field} {("between" if not opNot else "not between")}  {_apply_vmask(options.get("vmask"),field,f'%(auto_{key}_min)s')} and {_apply_vmask(options.get("vmask"),field,f'%(auto_{key}_max)s')})""")
                parameters[f'auto_{key}_min'] = min
                parameters[f'auto_{key}_max'] = max
            elif min:
                filters.append(f"""({field} {(">=" if not opNot else "<")} {_apply_vmask(options.get("vmask"),field,f'%(auto_{key})s')})""")
                parameters[f'auto_{key}'] = min
            elif max:
                filters.append(f"""({field} {("<=" if not opNot else ">")} {_apply_vmask(options.get("vmask"),field,f'%(auto_{key})s')})""")
                parameters[f'auto_{key}'] = max
        elif op.lower() == 'in:':
            v = value.split(',')
            p = []
            for i, item in enumerate(v):
                p.append(f'%(auto_{key}_{i})s')
                parameters[f'auto_{key}_{i}'] = item
            filters.append(
                f'({field} {("in" if not opNot else "not in")} ({",".join(p)}))')
        elif op.lower() == 'isnull':
            filters.append(
                f'({field} {(_apply_vmask(options.get("vmask"),field,"is NULL") if not opNot else _apply_vmask(options.get("vmask"),field,"is not NULL"))})')
    return {"filters": filters, "parameters": parameters}


class Check:
    def NullEmpty(v):
        if isinstance(v, dict):
            return True if all(v.values()) else False
        elif v:
            return True
        return False
