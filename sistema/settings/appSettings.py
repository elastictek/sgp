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
            "sgp":f'"SGP-PROD"'
        },
        "postgres":{
            "sgp":f'"SGP-PROD"',
            "sage":f'"SAGE-PROD"'
        }
    }
    reportConn = {
        "sage":"MSSQL-SAGE",
        "sgp":"MYSQL-SGP-PROD",
        "gw":"PG-SGP-GW"
    }
    materializedViews = {
        "MV_OFABRICO_LIST":f'MV_OFABRICO_LIST',
        "MV_OFABRICO_LISTV2":f'MV_OFABRICO_LISTV2'
    },
    soapSage = {
        "headers" : {'Content-Type': 'text/xml; charset=utf-8','SOAPAction': '""'},
        "url" : "http://sage.elastictek.local:8134/soap-generic/syracuse/collaboration/syracuse/CAdxWebServiceXmlCC",
        "wsdl_url" : "http://sage.elastictek.local:8134/soap-wsdl/syracuse/collaboration/syracuse/CAdxWebServiceXmlCC?wsdl",
        "username" : "admin",
        "password" : "#ElasticTek#2022#3",
        "lang" : "ENG",
        "pool" : "ELASTICTEK",
        "requestCfg" : "adxwss.trace.on=on&adxwss.beautify=true&adxwss.optreturn=XML"
    }

