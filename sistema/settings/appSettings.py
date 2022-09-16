from support.typedb import TypeDB

class AppSettings:
    "Identify the type of DB in the form alias:TypeDB"
    typeDB = {
        "sqlserver": TypeDB.SQLSERVER,
        "postgres": TypeDB.POSTGRES,
        "default": TypeDB.MYSQL
    }
    dbAlias = {
        "sqlserver":{
            "sgp":f'"SGP-DEV"'
        },
        "postgres":{
            "sgp":f'"SGP-DEV"',
            "sage":f'"SAGE-PROD"'
        }
    }
    reportConn = {
        "sage":"MSSQL-SAGE",
        "sgp":"MYSQL-SGP-DEV",
        "gw":"PG-SGP-GW"
    }
    materializedViews = {
        "MV_OFABRICO_LIST":f'MV_OFABRICO_LIST_DEV'
    }

