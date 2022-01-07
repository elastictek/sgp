from support.typedb import TypeDB

class AppSettings:
    "Identify the type of DB in the form alias:TypeDB"
    typeDB = {
        "postgres": TypeDB.POSTGRES,
        "default": TypeDB.MYSQL
    }
