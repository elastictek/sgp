from django.urls import re_path, include
from django.contrib import admin
#from producao.api.views import ArtigoListAPIView, ClienteListAPIView, ArtigoDetailAPIView, PaleteListStockAPIView, PaleteListAPIView, CargaListAPIView, PaleteListHistoricoAPIView, BobinagemListHistoricoAPIView, CargaPaletesAPIView, StockListAPIView, BobineListDmAPIView, CargaDetailAPIView, EncomendaCargaAPIView, CargaDetailSerializer, EncomendaListAPIView, BobinagemListDmAPIView, BobinagemCreateDmAPIView, BobineListAPIView, PaleteDetailAPIView, BobineList, EmendaListAPIView, EmendaCreateAPIView, PaleteDmBobinesAPIView, BobinagemListAPIView, BobineDetailAPIView, BobineListAllAPIView,ClienteDetailAPIView,BobinesBobinagemAPIView,PaleteDmAPIView
from producao.api import views 
from producao.api import reports
from producao.api import materias_primas
from producao.api import currentsettings
from producao.api import print
from producao.api import auth_users
from producao.api import devolucoes
from producao.api import bobinagens
from producao.api import bobines
from producao.api import paletes
from producao.api import ordens_fabrico
from producao.api import app_permissions
from producao.api import artigos
from producao.api import qualidade
from producao.api import eventos
from producao.api import cargas
from producao.api import sage
from producao.api import reciclado
from producao.api import trocaetiquetas
from producao.api import exportdata_A01
from producao.models.models_api import CurrentSettings
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
    re_path(r'^bomlookup/$', views.BomLookup),
    
     re_path(r'^getauthuser/$', auth_users.GetAuthUser),
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
    #End Cortes
    #Cargas
    re_path(r'^cargaslookup/$', views.CargasLookup),
    #End Cargas
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
    re_path(r'^saveprodutoalt/$', views.SaveProdutoAlt),
    

    re_path(r'^downloadfile/$', views.download_file),
    
    re_path(r'^loteslookup/$', views.LotesLookup),

    #BOBINAGENS
    re_path(r'^validarbobinagenslist/$', views.ValidarBobinagensList), #to remove
    re_path(r'^validarbobineslist/$', views.ValidarBobinesList),
    re_path(r'^validarbobinagem/$', views.ValidarBobinagem),
    re_path(r'^fixsimulatorlist/$', views.FixSimulatorList),
    re_path(r'^bobineslist/$', views.BobinesList),

    re_path(r'^updatebobinagem/$', bobinagens.UpdateBobinagem),
    re_path(r'^deletebobinagem/$', bobinagens.DeleteBobinagem),
    re_path(r'^missedlineloglist/$', bobinagens.MissedLineLogList),
    re_path(r'^createbobinagem/$',bobinagens.CreateBobinagem),
    re_path(r'^bobinesbyaggbystatuslist/$',bobinagens.BobinesByAggByStatusList),
    
    
    
    
    #BOBINAGENS

    #PICAGEM LOTES
    
    
    re_path(r'^nwlistlookup/$', materias_primas.NWListLookup),
    re_path(r'^nwlist/$', materias_primas.NWList),
    re_path(r'^deletenw/$', materias_primas.DeleteNW),
    re_path(r'^savenwitems/$', materias_primas.SaveNWItems),
    re_path(r'^updatenw/$', materias_primas.UpdateNW),
    re_path(r'^listmpalternativas/$', materias_primas.ListMPAlternativas),
    re_path(r'^savempalternativas/$', materias_primas.SaveMPAlternativas),
    
    re_path(r'^materiasprimaslookup/$', materias_primas.MPrimasLookup),
    re_path(r'^listmpgroupslookup/$', materias_primas.ListMPGroupsLookup),
    re_path(r'^getmpalternativas/$', materias_primas.GetMPAlternativas),
    
    
    
    
    re_path(r'^recicladolist/$', views.RecicladoList),
    re_path(r'^recicladoloteslist/$', views.RecicladoLotesList),
    re_path(r'^saverecicladoitems/$', views.SaveRecicladoItems),
    re_path(r'^pesarreciclado/$', views.PesarReciclado),
    re_path(r'^deleterecicladoitem/$', views.DeleteRecicladoItem),
    re_path(r'^updatereciclado/$', views.UpdateReciclado),
    re_path(r'^recicladolookup/$', views.RecicladoLookup),
    re_path(r'^newlotereciclado/$', views.NewLoteReciclado),
    re_path(r'^produtogranuladolookup/$', views.ProdutoGranuladoLookup),

    re_path(r'^pick/$', views.Pick),
    re_path(r'^pickmanual/$', views.PickManual),
    re_path(r'^saidamp/$', views.SaidaMP),
    re_path(r'^saidadoser/$', views.SaidaDoser),
    re_path(r'^consumptionneedloglist/$', views.ConsumptionNeedLogList),
    re_path(r'^rectifybobinagem/$', views.RectifyBobinagem),
    re_path(r'^lotesavailable/$', views.LotesAvailable),
    re_path(r'^getconsumosbobinagenslookup/$', views.GetConsumosBobinagensLookup),
    
    
    
    re_path(r'^consumogranuladolist/$', materias_primas.ConsumoGranuladoList),
    re_path(r'^granuladobufferlinelist/$', materias_primas.GranuladoBufferLineList),
    re_path(r'^granuladolistinline/$', materias_primas.GranuladoListInLine),
    re_path(r'^granuladolist/$', materias_primas.GranuladoList),
    re_path(r'^savegranuladoitems/$', materias_primas.SaveGranuladoItems),
    re_path(r'^granuladolistlookup/$', materias_primas.GranuladoListLookup),
    re_path(r'^updategranulado/$', materias_primas.UpdateGranulado),
    re_path(r'^deletegranulado/$', materias_primas.DeleteGranulado),
    re_path(r'^updateconsumos/$', materias_primas.UpdateConsumos),
    #PICAGEM LOTES

    #DEVOLUCOES
    re_path(r'^devolucoeslist/$', devolucoes.DevolucoesList),

    #DEVOLUCOES

    #MATERIAS-PRIMAS
    #re_path(r'^stocklist/$', views.StockList),
    re_path(r'^stocklistbuffer/$', materias_primas.MateriasPrimasList),
    #re_path(r'^stocklistbyigbobinagem/$', views.StockListByIgBobinagem),
    re_path(r'^mpginout/$', views.MPGranuladoIO),
    re_path(r'^pickmp/$', views.PickMP),
    re_path(r'^printmpbuffer/$', print.PrintMPBuffer),
    re_path(r'^printreciclado/$', print.PrintReciclado),
    
    
    #MATERIAS-PRIMAS

    #CURRENTSETTINGS
    re_path(r'^estadoproducao/$', currentsettings.EstadoProducao),
    re_path(r'^eventosproducao/$', currentsettings.EventosProducao),
    re_path(r'^auditcurrentsettingsget/$', currentsettings.AuditCurrentSettingsGet),
    re_path(r'^currentsettingsget/$', currentsettings.CurrentSettingsGet),
    re_path(r'^updatecurrentsettings/$', currentsettings.UpdateCurrentSettings),
    re_path(r'^changecurrsettings/$', currentsettings.ChangeCurrSettingsStatus),
    re_path(r'^currentsettingsinproductionget/$', currentsettings.CurrentSettingsInProductionGet),
    #CURRENTSETTINGS


    #REPORTS
    re_path(r'^ofabricotimelinelist',views.OFabricoTimeLineList),
    re_path(r'^lineloglist/$',views.LineLogList),
    #re_path(r'^stockloglist/$',views.StockLogList),
    #re_path(r'^createbobinagem/$',views.CreateBobinagem),
    re_path(r'^bobinesoriginaislist/$',views.BobinesOriginaisList),
    re_path(r'^expedicoestempolist/$',views.ExpedicoesTempoList),
    
    #REPORTS
    re_path(r'^exportfile/$',views.ExportFile),
    re_path(r'^report/reciclado/$',reports.Reciclado),
    #re_path(r'^tempaggofabricoitemsget/$', views.TempAggOFabricoItemsGet),

    re_path(r'^createpalete/$', views.CreatePalete),



    re_path(r'^nonwovenlookup/$', views.NonWovenLookup),

    

    #LAYOUTS
    re_path(r'^savelayout/$', views.SaveLayout),
    re_path(r'^loadlayout/$', views.LoadLayout),
    
    #LAYOUTS

    #PALETES
    re_path(r'^paletes/paletessql/$',paletes.PaletesSql),
    #re_path(r'^paletes/stockavailablelist/$',paletes.StockAvailableList),
    #re_path(r'^paletes/paletesstocklist/$',paletes.PaletesStockList),
    re_path(r'^paletes/allowedofchanges/$',paletes.AllowedOFChanges),
    
    #END PALETES

    re_path(r'^paletes/sql/$',paletes.Sql),
    re_path(r'^permissions/sql/$',app_permissions.Sql),
    re_path(r'^bobines/sql/$',bobines.Sql),
    re_path(r'^bobinagens/sql/$',bobinagens.Sql),
    re_path(r'^ordensfabrico/sql/$',ordens_fabrico.Sql),
    re_path(r'^artigos/sql/$',artigos.Sql),
    re_path(r'^cargas/sql/$',cargas.Sql),
    re_path(r'^print/sql/$',print.Sql),
    re_path(r'^sage/sql/$',sage.Sql),
    re_path(r'^eventos/sql/$',eventos.Sql),
    re_path(r'^reciclado/sql/$',reciclado.Sql),
    re_path(r'^currentsettings/sql/$',currentsettings.Sql),
    re_path(r'^materiasprimas/sql/$',materias_primas.Sql),
    re_path(r'^qualidade/sql/$',qualidade.Sql),
    re_path(r'^trocaetiquetas/sql/$',trocaetiquetas.Sql),
    re_path(r'^qualidade/loadlabparametersbyfile/$',qualidade.LoadLabParametersByFile),
    
    re_path(r'^exportdataA01/call/$',exportdata_A01.SqlK),
    re_path(r'^print/call/$',print.SqlK),
    re_path(r'^qualidade/call/$',qualidade.SqlK),

    re_path(r'^printetiqueta/$',print.PrintEtiqueta)
    

    
    
]