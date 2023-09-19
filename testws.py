
import requests
from requests.auth import HTTPBasicAuth
from zeep.transports import Transport

url = "http://sage.elastictek.local:8134/soap-generic/syracuse/collaboration/syracuse/CAdxWebServiceXmlCC"
#wsdl_url = "http://sage.elastictek.local:8134/soap-wsdl/syracuse/collaboration/syracuse/CAdxWebServiceXmlCC?wsdl"
username = "admin"
password = "#ElasticTek#2022#3"
http_auth = HTTPBasicAuth(username, password)

lang = "ENG"
pool = "ELASTICTEK"
requestCfg = "adxwss.trace.on=on&adxwss.beautify=true&adxwss.optreturn=XML"
publicName = "WS_MKI"

gp = {
    "MFGFCY":"E01",
    "UOMCPLQTY":1,
    "UOM":"M2",
    "UOMSTUCOE":1,
    "PM3":0,
    "PM4":0,
    "PCUSTUCOE":1,
    "PCU":"M2",
    "LOC":"ARM",
    "STA":"A"
}

headers = {
    'Content-Type': 'text/xml; charset=utf-8','SOAPAction': '""'
}
payload = f"""<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wss="http://www.adonix.com/WSS">
   <soapenv:Header/>
   <soapenv:Body>
      <wss:run soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">     
         <callContext xsi:type="wss:CAdxCallContext">
            <codeLang xsi:type="xsd:string">ENG</codeLang>
            <poolAlias xsi:type="xsd:string">ELASTICTEK</poolAlias>
            <poolId xsi:type="xsd:string"></poolId>
            <requestConfig xsi:type="xsd:string">adxwss.trace.on=on&adxwss.beautify=true&adxwss.optreturn=XML</requestConfig>
         </callContext>
         <publicName xsi:type="xsd:string">WS_MKI</publicName>
         <inputXml xsi:type="xsd:string">
         <![CDATA[<?xml version="1.0" encoding="UTF-8"?>
         <PARAM>
            "
                    <GRP ID="GRP1">
                        <FLD NAME="MFGFCY">E01</FLD>
                        <FLD NAME="MFGNUM">OFF-E0123/00348</FLD>
                        <FLD NAME="ITMREF">EEEEFTACPAAR000051</FLD>
                        <FLD NAME="UOMCPLQTY">1</FLD>
                        <FLD NAME="UOM">M2</FLD>
                        <FLD NAME="UOMSTUCOE">1</FLD>
                        <FLD NAME="MFGTRKNUM"></FLD>
                        <FLD NAME="PM1">20230918</FLD>
                        <FLD NAME="PM2"></FLD>
                        <FLD NAME="PM3">0</FLD>
                        <FLD NAME="PM4">0</FLD>
                    </GRP>

                    <TAB ID="GRP2" SIZE="1">

                        <LIN NUM="1">
                            <FLD NAME="PCU">M2</FLD>
                            <FLD NAME="QTYPCU">5382</FLD>
                            <FLD NAME="PCUSTUCOE">1</FLD>
                            <FLD NAME="LOC">ARM</FLD>
                            <FLD NAME="STA">A</FLD>
                            <FLD NAME="LOT">P6912-2023</FLD>
                            <FLD NAME="SLO"></FLD>
                            <FLD NAME="PALNUM"></FLD>
                            <FLD NAME="CTRNUM"></FLD>
                        </LIN>

                    </TAB>
                    <GRP ID="GRP3">
                        <FLD NAME="SHLDAT"></FLD>
                    </GRP>

                </PARAM>
         ]]>
         </inputXml>
      </wss:run>
   </soapenv:Body>
</soapenv:Envelope>
"""
# POST request
response = requests.post(url, headers=headers, data=payload, auth=http_auth)

print(response.status_code)
print(response.json())