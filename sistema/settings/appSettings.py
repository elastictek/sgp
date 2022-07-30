from support.typedb import TypeDB

class AppSettings:
    "Identify the type of DB in the form alias:TypeDB"
    typeDB = {
        "postgres": TypeDB.POSTGRES,
        "default": TypeDB.MYSQL
    }
    dbAlias = {
        "postgres":{
            "sgp":f'"SGP-DEV"',
            "sage":f'"SAGE-PROD"'
        }
    }
    reportConn = {
        "sgp":"MYSQL-SGP-PROD",
        "gw":"PG-SGP-GW"
    }
    materializedViews = {
        "MV_OFABRICO_LIST":f'MV_OFABRICO_LIST_DEV'
    }

