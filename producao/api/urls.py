from django.conf.urls import url, include
from django.contrib import admin
#from producao.api.views import ArtigoListAPIView, ClienteListAPIView, ArtigoDetailAPIView, PaleteListStockAPIView, PaleteListAPIView, CargaListAPIView, PaleteListHistoricoAPIView, BobinagemListHistoricoAPIView, CargaPaletesAPIView, StockListAPIView, BobineListDmAPIView, CargaDetailAPIView, EncomendaCargaAPIView, CargaDetailSerializer, EncomendaListAPIView, BobinagemListDmAPIView, BobinagemCreateDmAPIView, BobineListAPIView, PaleteDetailAPIView, BobineList, EmendaListAPIView, EmendaCreateAPIView, PaleteDmBobinesAPIView, BobinagemListAPIView, BobineDetailAPIView, BobineListAllAPIView,ClienteDetailAPIView,BobinesBobinagemAPIView,PaleteDmAPIView
from producao.api import views 
app_name="producao" 

urlpatterns = [
    
    url(r'^palete/$', views.PaleteListAPIView.as_view(), name='palete-list'),
    url(r'^palete/historico/$', views.PaleteListHistoricoAPIView.as_view(), name='palete-list-historico'),
    url(r'^bobine/$', views.BobineListAPIView.as_view(), name='bobine-list'),
    url(r'^bobinelist/$', views.BobineListAllAPIView.as_view(), name='bobine-list2'),
    url(r'^bobinagem/$', views.BobinagemListAPIView.as_view(), name='bobinagem-list'),
    url(r'^bobinagem/historico/$', views.BobinagemListHistoricoAPIView.as_view(), name='bobinagem-list-historico'),
    url(r'^emenda/$', views.EmendaListAPIView.as_view(), name='emenda-list'),
    url(r'^emenda/create/$', views.EmendaCreateAPIView.as_view(), name='emenda-create'),
    url(r'^palete/(?P<pk>\d+)/$', views.PaleteDetailAPIView.as_view(), name='palete-detail'),
    url(r'^bobine/(?P<pk>\d+)/$', views.BobineDetailAPIView.as_view(), name='bobine-list2'),
    url(r'^cliente/(?P<pk>\d+)/$', views.ClienteDetailAPIView.as_view(), name='cliente'),
    url(r'^bobinagem/(?P<pk>\d+)/$', views.BobinesBobinagemAPIView.as_view(), name='cliente'),
    url(r'^palete/dm/$', views.PaleteDmAPIView.as_view(), name='paletes_dm'),
    url(r'^palete/dm/(?P<pk>\d+)$', views.PaleteDmBobinesAPIView.as_view(), name='paletes_dm_bobines'),
    url(r'^bobine/dm/$', views.BobineListDmAPIView.as_view(), name='bobines-dm'),
    url(r'^bobinagem/dm/$', views.BobinagemCreateDmAPIView.as_view(), name='bobineagem-create-dm'),
    url(r'^bobinagem/list/dm/$', views.BobinagemListDmAPIView.as_view(), name='bobinagem-list-dm'),
    url(r'^encomenda/$', views.EncomendaListAPIView.as_view(), name='encomenda-list'),
    url(r'^encomenda/(?P<pk>\d+)/$', views.EncomendaCargaAPIView.as_view(), name='encomenda-cargas-list'),
    url(r'^carga/$', views.CargaListAPIView.as_view(), name='carga-list'),
    url(r'^carga/(?P<pk>\d+)/$', views.CargaDetailAPIView.as_view(), name='carga-detail'),
    url(r'^carga/paletes/(?P<pk>\d+)/$', views.CargaPaletesAPIView.as_view(), name='carga-paletes-list'),
    url(r'^stock/$', views.StockListAPIView.as_view(), name='stock-list'),
    url(r'^palete/stock/$', views.PaleteListStockAPIView.as_view(), name='palete-stock-list'),
    url(r'^artigo/(?P<pk>\d+)/$', views.ArtigoDetailAPIView.as_view(), name='artigo-detail'),
    url(r'^artigos/$', views.ArtigoListAPIView.as_view(), name='artigos'),
    url(r'^clientes/$', views.ClienteListAPIView.as_view(), name='clientes'),
    
    
    url(r'^sellorders/$', views.SellOrdersList),
    
    url(r'^sellorderslookup/$', views.SellOrdersLookup),
    url(r'^sellitemslookup/$', views.SellItemsLookup),
    url(r'^sellorderitemsList/$', views.SellOrderItemsList),
    url(r'^newordemfabrico/$', views.NewOrdemFabrico),
    url(r'^ofartigoslist/$', views.OFArtigosList),
    url(r'^ofartigoslist/$', views.OFArtigosList),
    url(r'^ofabricolist/$', views.OFabricoList),
    url(r'^setofabricostatus/$', views.SetOrdemFabricoStatus),
    url(r'^sellitemsdetailsget/$', views.SellItemsDetailsGet),
    url(r'^materiasprimasget/$', views.MateriasPrimasGet),
    url(r'^materiasprimaslookup/$', views.MateriasPrimasLookup),
    url(r'^bomlookup/$', views.BomLookup),
    
    #Clientes
    url(r'^sellcustomerslookup/$', views.SellCustomersLookup),
    #End Clientes
    #Paletizações
    url(r'^paletizacaoget/$', views.PaletizacaoGet),
    url(r'^newpaletizacaoschema/$', views.NewPaletizacaoSchema),
    url(r'^paletizacoeslookup/$', views.PaletizacoesLookup),
    url(r'^paletizacaodetailsget/$', views.PaletizacaoDetailsGet),
    #End Paletizações
    #Formulações
    url(r'^formulacoeslookup/$', views.FormulacoesLookup),
    url(r'^newformulacao/$', views.NewFormulacao),
    url(r'^formulacaomateriasprimasget/$', views.FormulacaoMateriasPrimasGet),
    #End Formulações
    #Gamas Operatórias
    url(r'^gamasoperatoriaslookup/$', views.GamasOperatoriasLookup),
    url(r'^newgamaoperatoria/$', views.NewGamaOperatoria),
    url(r'^gamaoperatoriaitemsget/$', views.GamaOperatoriaItemsGet),
    #End Gamas Operatórias
    #Artigo Specs
    url(r'^artigosspecslookup/$', views.ArtigosSpecsLookup),
    url(r'^newartigospecs/$', views.NewArtigoSpecs),
    url(r'^artigospecsitemsget/$', views.ArtigoSpecsItemsGet),
    #End Artigo Specs
    #Nonwovens
    url(r'^nonwovenslookup/$', views.NonwovensLookup),
    url(r'^newartigononwovens/$', views.NewArtigoNonwovens),
    #url(r'^newartigospecs/$', views.NewArtigoSpecs),
    #url(r'^artigospecsitemsget/$', views.ArtigoSpecsItemsGet),
    #End Nonwovens
    #Cortes
    url(r'^artigostempagglookup/$', views.ArtigosTempAggLookup),
    url(r'^cortesget/$', views.CortesGet),
    url(r'^newcortes/$', views.NewCortes),
    url(r'^clearcortes/$', views.ClearCortes),
    url(r'^updatecortesordem/$', views.UpdateCortesOrdem),
    url(r'^cortesordemlookup/$', views.CortesOrdemLookup),
    #End Cortes
    #Paletes Stock
    url(r'^paletesstocklookup/$', views.PaletesStockLookup),
    url(r'^paletesstockget/$', views.PaletesStockGet),
    url(r'^savepaletesstock/$', views.SavePaletesStock),    
    #End Paletes Stock
    #Nonwovens
    url(r'^emendaslookup/$', views.EmendasLookup),
    #End Nonwovens
    #OF Attachments/Uploads
    url(r'^ofattachmentsget/$', views.OfAttachmentsGet),
    url(r'^ofattachmentschange/$', views.OfAttachmentsChange),
    url(r'^ofupload/$', views.OfUpload),
    #End OF Uploads

    url(r'^savetempordemfabrico/$', views.SaveTempOrdemFabrico),    
    url(r'^savetempagg/$', views.SaveTempAgg),    
    url(r'^tempofabricoget/$', views.TempOFabricoGet),
    url(r'^tempaggofabricolookup/$', views.TempAggOFabricoLookup),
    url(r'^ignorarordemfabrico/$', views.IgnorarOrdemFabrico),

    url(r'^downloadfile/$', views.download_file),
    
    
    #url(r'^tempaggofabricoitemsget/$', views.TempAggOFabricoItemsGet),





    url(r'^nonwovenlookup/$', views.NonWovenLookup)

    
    
    
    
    
]