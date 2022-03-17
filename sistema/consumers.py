import os
import sys
import django


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sistema.settings")
django.setup()

from socket import timeout
from threading import Timer
from asgiref.sync import async_to_sync
from django.core.cache import cache
from channels.generic.websocket import WebsocketConsumer
import channels.layers
import json
import random
from django.db import connections
from support.database import encloseColumn, Filters, DBSql, TypeDml, fetchall, Check

connGatewayName = "postgres"
dbgw = DBSql(connections[connGatewayName].alias)
db = DBSql(connections["default"].alias)

def executeAlerts():
    group_name = 'broadcast'
    channel_layer = channels.layers.get_channel_layer()
    val = random.randint(100000, 999999)
    print(f"{val}")

    with connections["default"].cursor() as cursor:
        rows = db.executeSimpleList(lambda: (f'SELECT * FROM producao_bobinagem pbm where valid = 0'), cursor, {})['rows']

    async_to_sync(channel_layer.group_send)(group_name,{
        'type': "getAlerts", "data":json.dumps(rows,default=str), "other":val
    })
    #self.send(text_data=json.dumps({"val":val},default=str))
    Timer(5,executeAlerts).start()
executeAlerts()

class RealTimeAlerts(WebsocketConsumer):

    room_group_name = 'broadcast'

    #def initAlerts(self,data):
    #    pass
        #self.executeAlerts()
    
   # def executeAlerts(self):
   #     self.getNewBobinagens({})
        #Timer(5,self.executeAlerts).start()

    def getAlerts(self, data):
        #val = random.randint(100000, 999999)
        #print(f"{val} - {self.channel_name}")
        
        #lotePicked = data['value']
        #cs = data['cs']
        #lotes = cache.get(f'lotes-{cs}')
        #code = [d for d in lotes if d['LOT_0'] == lotePicked]
        self.send(text_data=json.dumps(data,default=str))

    commands = {
        #'getBobinagens':getNewBobinagens,
        #'initAlerts':initAlerts
    }

    def connect(self):
        print(self.scope['user'])
        async_to_sync(self.channel_layer.group_add)(self.room_group_name,self.channel_name)
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(self.room_group_name,self.channel_name)

    def receive(self, text_data):
        dt = json.loads(text_data)
        self.commands[dt['cmd']](self, dt)

class LotesPickConsumer(WebsocketConsumer):

    def getLote(self, data):
        lotePicked = data['value']
        cs = data['cs']
        lotes = cache.get(f'lotes-{cs}')
        code = [d for d in lotes if d['LOT_0'] == lotePicked]
        self.send(text_data=json.dumps(code,default=str))
    
    def loadMatPrimas(self, data):
        matPrimas = data['value']
        cs=data['cs']   
        connection = connections[connGatewayName].cursor()
        rows = dbgw.executeSimpleList(lambda:(f"""		
            SELECT ST."ITMREF_0", ST."UPDDATTIM_0",ST."LOT_0", ST."QTYPCU_0", ST."PCUORI_0",ST."LOC_0"
            FROM "SAGE-PROD"."STOCK" ST Where ST."STOFCY_0" = 'E01' and "LOC_0"='BUFFER' 
            and "ITMREF_0" in (
            {matPrimas}
            )
            ORDER BY ST."UPDDATTIM_0" DESC
         """),connection,{})['rows']
        
        if len(rows)>0:
            print(f'gggggggg--{rows}')
            cache.set(f'lotes-{cs}',rows,timeout=None)
        self.send(text_data=json.dumps({"status":"success"}))

    commands = {
        'loadmatprimas':loadMatPrimas,
        'pick':getLote
    }

    def connect(self):
        #print(f'CONNECT----{self.scope}')
        # self.room_name = 'room'
        # self.room_group_name = 'chat_%s' % self.room_name

        # # Join room group
        # async_to_sync(self.channel_layer.group_add)(
        #     self.room_group_name,
        #     self.channel_name
        # )
        self.accept()

    def disconnect(self, close_code):
        pass
        # leave group room
        # async_to_sync(self.channel_layer.group_discard)(
        #     self.room_group_name,
        #     self.channel_name
        # )

    def receive(self, text_data):
        dt = json.loads(text_data)
        self.commands[dt['cmd']](self, dt)