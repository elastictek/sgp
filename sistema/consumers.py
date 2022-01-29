from socket import timeout
from asgiref.sync import async_to_sync
from django.core.cache import cache
from channels.generic.websocket import WebsocketConsumer
import json
from django.db import connections
from support.database import encloseColumn, Filters, DBSql, TypeDml, fetchall, Check

connGatewayName = "postgres"
dbgw = DBSql(connections[connGatewayName].alias)

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