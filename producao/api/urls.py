from django.urls import re_path, include
from django.contrib import admin
#from producao.api.views import ArtigoListAPIView, ClienteListAPIView, ArtigoDetailAPIView, PaleteListStockAPIView, PaleteListAPIView, CargaListAPIView, PaleteListHistoricoAPIView, BobinagemListHistoricoAPIView, CargaPaletesAPIView, StockListAPIView, BobineListDmAPIView, CargaDetailAPIView, EncomendaCargaAPIView, CargaDetailSerializer, EncomendaListAPIView, BobinagemListDmAPIView, BobinagemCreateDmAPIView, BobineListAPIView, PaleteDetailAPIView, BobineList, EmendaListAPIView, EmendaCreateAPIView, PaleteDmBobinesAPIView, BobinagemListAPIView, BobineDetailAPIView, BobineListAllAPIView,ClienteDetailAPIView,BobinesBobinagemAPIView,PaleteDmAPIView
from producao.api import views 
app_name="producao" 

urlpatterns = [
    
    re_path(r'^palete/$', views.PaleteListAPIView.as_view(), name='palete-list'),
    re_path(r'^palete/historico/$', views.PaleteListHistoricoAPIView.as_view(), name='palete-list-historico'),
    re_path(r'^bobine/$', views.BobineListAPIView.as_view(), name='bobine-list'),
    re_path(r'^bobinelist/$', views.BobineListAllAPIView.as_view(), name='bobine-list2'),
    re_path(r'^bobinagem/$', views.BobinagemListAPIView.as_view(), name='bobinagem-list'),
    re_path(r'^bobinagem/historico/$', views.BobinagemListHistoricoAPIView.as_view(), name='bobinagem-list-historico'),
    re_path(r'^emenda/$', views.EmendaListAPIView.as_view(), name='emenda-list'),
    re_path(r'^emenda/create/$', views.EmendaCreateAPIView.as_view(), name='emenda-create'),
    re_path(r'^palete/(?P<pk>\d+)/$', views.PaleteDetailAPIView.as_view(), name='palete-detail'),
    re_path(r'^bobine/(?P<pk>\d+)/$', views.BobineDetailAPIView.as_view(), name='bobine-list2'),
    re_path(r'^cliente/(?P<pk>\d+)/$', views.ClienteDetailAPIView.as_view(), name='cliente'),
    re_path(r'^bobinagem/(?P<pk>\d+)/$', views.BobinesBobinagemAPIView.as_view(), name='cliente'),
    re_path(r'^palete/dm/$', views.PaleteDmAPIView.as_view(), name='paletes_dm'),
    re_path(r'^palete/dm/(?P<pk>\d+)$', views.PaleteDmBobinesAPIView.as_view(), name='paletes_dm_bobines'),
    re_path(r'^bobine/dm/$', views.BobineListDmAPIView.as_view(), name='bobines-dm'),
    re_path(r'^bobinagem/dm/$', views.BobinagemCreateDmAPIView.as_view(), name='bobineagem-create-dm'),
    re_path(r'^bobinagem/list/dm/$', views.BobinagemListDmAPIView.as_view(), name='bobinagem-list-dm'),
    re_path(r'^encomenda/$', views.EncomendaListAPIView.as_view(), name='encomenda-list'),
    re_path(r'^encomenda/(?P<pk>\d+)/$', views.EncomendaCargaAPIView.as_view(), name='encomenda-cargas-list'),
    re_path(r'^carga/$', views.CargaListAPIView.as_view(), name='carga-list'),
    re_path(r'^carga/(?P<pk>\d+)/$', views.CargaDetailAPIView.as_view(), name='carga-detail'),
    re_path(r'^carga/paletes/(?P<pk>\d+)/$', views.CargaPaletesAPIView.as_view(), name='carga-paletes-list'),
    re_path(r'^stock/$', views.StockListAPIView.as_view(), name='stock-list'),
    re_path(r'^palete/stock/$', views.PaleteListStockAPIView.as_view(), name='palete-stock-list'),
    re_path(r'^artigo/(?P<pk>\d+)/$', views.ArtigoDetailAPIView.as_view(), name='artigo-detail'),
    re_path(r'^artigos/$', views.ArtigoListAPIView.as_view(), name='artigos'),
    re_path(r'^clientes/$', views.ClienteListAPIView.as_view(), name='clientes'),
    
    
    re_path(r'^sellorders/$', views.SellOrdersList),
    
    re_path(r'^sellorderslookup/$', views.SellOrdersLookup),
    re_path(r'^sellitemslookup/$', views.SellItemsLookup),
    re_path(r'^sellorderitemsList/$', views.SellOrderItemsList),
    re_path(r'^newordemfabrico/$', views.NewOrdemFabrico),
    re_path(r'^ofartigoslist/$', views.OFArtigosList),
    re_path(r'^ofartigoslist/$', views.OFArtigosList),
    re_path(r'^ofabricolist/$', views.OFabricoList),
    re_path(r'^setofabricostatus/$', views.SetOrdemFabricoStatus),
    re_path(r'^sellitemsdetailsget/$', views.SellItemsDetailsGet),
    re_path(r'^materiasprimasget/$', views.MateriasPrimasGet),
    re_path(r'^materiasprimaslookup/$', views.MateriasPrimasLookup),
    re_path(r'^bomlookup/$', views.BomLookup),
    
    #Clientes
    re_path(r'^sellcustomerslookup/$', views.SellCustomersLookup),
    #End Clientes
    #Paletizações
    re_path(r'^paletizacaoget/$', views.PaletizacaoGet),
    re_path(r'^newpaletizacaoschema/$', views.NewPaletizacaoSchema),
    re_path(r'^paletizacoeslookup/$', views.PaletizacoesLookup),
    re_path(r'^paletizacaodetailsget/$', views.PaletizacaoDetailsGet),
    #End Paletizações
    #Formulações
    re_path(r'^formulacoeslookup/$', views.FormulacoesLookup),
    re_path(r'^newformulacao/$', views.NewFormulacao),
    re_path(r'^formulacaomateriasprimasget/$', views.FormulacaoMateriasPrimasGet),
    #End Formulações
    #Gamas Operatórias
    re_path(r'^gamasoperatoriaslookup/$', views.GamasOperatoriasLookup),
    re_path(r'^newgamaoperatoria/$', views.NewGamaOperatoria),
    re_path(r'^gamaoperatoriaitemsget/$', views.GamaOperatoriaItemsGet),
    #End Gamas Operatórias
    #Artigo Specs
    re_path(r'^artigosspecslookup/$', views.ArtigosSpecsLookup),
    re_path(r'^newartigospecs/$', views.NewArtigoSpecs),
    re_path(r'^artigospecsitemsget/$', views.ArtigoSpecsItemsGet),
    #End Artigo Specs
    #Nonwovens
    re_path(r'^nonwovenslookup/$', views.NonwovensLookup),
    re_path(r'^newartigononwovens/$', views.NewArtigoNonwovens),
    #re_path(r'^newartigospecs/$', views.NewArtigoSpecs),
    #re_path(r'^artigospecsitemsget/$', views.ArtigoSpecsItemsGet),
    #End Nonwovens
    #Cortes
    re_path(r'^artigostempagglookup/$', views.ArtigosTempAggLookup),
    re_path(r'^cortesget/$', views.CortesGet),
    re_path(r'^newcortes/$', views.NewCortes),
    re_path(r'^clearcortes/$', views.ClearCortes),
    re_path(r'^updatecortesordem/$', views.UpdateCortesOrdem),
    re_path(r'^cortesordemlookup/$', views.CortesOrdemLookup),
    #End Cortes
    #Paletes Stock
    re_path(r'^paletesstocklookup/$', views.PaletesStockLookup),
    re_path(r'^paletesstockget/$', views.PaletesStockGet),
    re_path(r'^savepaletesstock/$', views.SavePaletesStock),    
    #End Paletes Stock
    #Nonwovens
    re_path(r'^emendaslookup/$', views.EmendasLookup),
    #End Nonwovens
    #OF Attachments/Uploads
    re_path(r'^ofattachmentsget/$', views.OfAttachmentsGet),
    re_path(r'^ofattachmentschange/$', views.OfAttachmentsChange),
    re_path(r'^ofupload/$', views.OfUpload),
    #End OF Uploads

    re_path(r'^savetempordemfabrico/$', views.SaveTempOrdemFabrico),    
    re_path(r'^savetempagg/$', views.SaveTempAgg),    
    re_path(r'^tempofabricoget/$', views.TempOFabricoGet),
    re_path(r'^tempaggofabricolookup/$', views.TempAggOFabricoLookup),
    re_path(r'^ignorarordemfabrico/$', views.IgnorarOrdemFabrico),

    re_path(r'^downloadfile/$', views.download_file),
    
    #CURRENT SETTINGS
    re_path(r'^currentsettingsget/$', views.CurrentSettingsGet),
    re_path(r'^loteslookup/$', views.LotesLookup),
    re_path(r'^updatecurrentsettings/$', views.UpdateCurrentSettings),
    re_path(r'^changecurrsettings/$', views.changeCurrSettingsStatus),
    #END CURRENT SETTINGS

    #BOBINAGENS
    re_path(r'^validarbobinagenslist/$', views.ValidarBobinagensList),
    #BOBINAGENS

    #re_path(r'^tempaggofabricoitemsget/$', views.TempAggOFabricoItemsGet),





    re_path(r'^nonwovenlookup/$', views.NonWovenLookup)

    
    
    
    
    
]