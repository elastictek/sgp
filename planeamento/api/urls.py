from django.conf.urls import url, include
from django.contrib import admin
from producao.api.views import PaleteListStockAPIView, PaleteListAPIView, CargaListAPIView, PaleteListHistoricoAPIView, BobinagemListHistoricoAPIView, CargaPaletesAPIView, StockListAPIView, BobineListDmAPIView, CargaDetailAPIView, EncomendaCargaAPIView, CargaDetailSerializer, EncomendaListAPIView, BobinagemListDmAPIView, BobinagemCreateDmAPIView, BobineListAPIView, PaleteDetailAPIView, BobineList, EmendaListAPIView, EmendaCreateAPIView, PaleteDmBobinesAPIView, BobinagemListAPIView, BobineDetailAPIView, BobineListAllAPIView,ClienteDetailAPIView,BobinesBobinagemAPIView,PaleteDmAPIView
from planeamento.api.views import OrdemListAPIView, OrdemDetailAPIView

app_name="planeamento" 

urlpatterns = [
    
    url(r'^palete/$', PaleteListAPIView.as_view(), name='palete-list'),
    url(r'^palete/historico/$', PaleteListHistoricoAPIView.as_view(), name='palete-list-historico'),
    url(r'^bobine/$', BobineListAPIView.as_view(), name='bobine-list'),
    url(r'^bobinelist/$', BobineListAllAPIView.as_view(), name='bobine-list2'),
    url(r'^bobinagem/$', BobinagemListAPIView.as_view(), name='bobinagem-list'),
    url(r'^bobinagem/historico/$', BobinagemListHistoricoAPIView.as_view(), name='bobinagem-list-historico'),
    url(r'^emenda/$', EmendaListAPIView.as_view(), name='emenda-list'),
    url(r'^emenda/create/$', EmendaCreateAPIView.as_view(), name='emenda-create'),
    url(r'^palete/(?P<pk>\d+)/$', PaleteDetailAPIView.as_view(), name='palete-detail'),
    url(r'^bobine/(?P<pk>\d+)/$', BobineDetailAPIView.as_view(), name='bobine-list2'),
    url(r'^cliente/(?P<pk>\d+)/$', ClienteDetailAPIView.as_view(), name='cliente'),
    url(r'^bobinagem/(?P<pk>\d+)/$', BobinesBobinagemAPIView.as_view(), name='cliente'),
    url(r'^palete/dm/$', PaleteDmAPIView.as_view(), name='paletes_dm'),
    url(r'^palete/dm/(?P<pk>\d+)$', PaleteDmBobinesAPIView.as_view(), name='paletes_dm_bobines'),
    url(r'^bobine/dm/$', BobineListDmAPIView.as_view(), name='bobines-dm'),
    url(r'^bobinagem/dm/$', BobinagemCreateDmAPIView.as_view(), name='bobineagem-create-dm'),
    url(r'^bobinagem/list/dm/$', BobinagemListDmAPIView.as_view(), name='bobinagem-list-dm'),
    url(r'^encomenda/$', EncomendaListAPIView.as_view(), name='encomenda-list'),
    url(r'^encomenda/(?P<pk>\d+)/$', EncomendaCargaAPIView.as_view(), name='encomenda-cargas-list'),
    url(r'^carga/$', CargaListAPIView.as_view(), name='carga-list'),
    url(r'^carga/(?P<pk>\d+)/$', CargaDetailAPIView.as_view(), name='carga-detail'),
    url(r'^carga/paletes/(?P<pk>\d+)/$', CargaPaletesAPIView.as_view(), name='carga-paletes-list'),
    url(r'^stock/$', StockListAPIView.as_view(), name='stock-list'),
    url(r'^palete/stock/$', PaleteListStockAPIView.as_view(), name='palete-stock-list'),
    url(r'^ordem/$', OrdemListAPIView.as_view(), name='ordem-list'),
    url(r'^ordem/(?P<pk>\d+)/$', OrdemDetailAPIView.as_view(), name='ordem-detail-list'),
          
    
    
]