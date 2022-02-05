from django.urls import re_path, include
from django.contrib import admin
from producao.api.views import PaleteListStockAPIView, PaleteListAPIView, CargaListAPIView, PaleteListHistoricoAPIView, BobinagemListHistoricoAPIView, CargaPaletesAPIView, StockListAPIView, BobineListDmAPIView, CargaDetailAPIView, EncomendaCargaAPIView, CargaDetailSerializer, EncomendaListAPIView, BobinagemListDmAPIView, BobinagemCreateDmAPIView, BobineListAPIView, PaleteDetailAPIView, BobineList, EmendaListAPIView, EmendaCreateAPIView, PaleteDmBobinesAPIView, BobinagemListAPIView, BobineDetailAPIView, BobineListAllAPIView,ClienteDetailAPIView,BobinesBobinagemAPIView,PaleteDmAPIView
from planeamento.api.views import OrdemListAPIView, OrdemDetailAPIView

app_name="planeamento" 

urlpatterns = [
    
    re_path(r'^palete/$', PaleteListAPIView.as_view(), name='palete-list'),
    re_path(r'^palete/historico/$', PaleteListHistoricoAPIView.as_view(), name='palete-list-historico'),
    re_path(r'^bobine/$', BobineListAPIView.as_view(), name='bobine-list'),
    re_path(r'^bobinelist/$', BobineListAllAPIView.as_view(), name='bobine-list2'),
    re_path(r'^bobinagem/$', BobinagemListAPIView.as_view(), name='bobinagem-list'),
    re_path(r'^bobinagem/historico/$', BobinagemListHistoricoAPIView.as_view(), name='bobinagem-list-historico'),
    re_path(r'^emenda/$', EmendaListAPIView.as_view(), name='emenda-list'),
    re_path(r'^emenda/create/$', EmendaCreateAPIView.as_view(), name='emenda-create'),
    re_path(r'^palete/(?P<pk>\d+)/$', PaleteDetailAPIView.as_view(), name='palete-detail'),
    re_path(r'^bobine/(?P<pk>\d+)/$', BobineDetailAPIView.as_view(), name='bobine-list2'),
    re_path(r'^cliente/(?P<pk>\d+)/$', ClienteDetailAPIView.as_view(), name='cliente'),
    re_path(r'^bobinagem/(?P<pk>\d+)/$', BobinesBobinagemAPIView.as_view(), name='cliente'),
    re_path(r'^palete/dm/$', PaleteDmAPIView.as_view(), name='paletes_dm'),
    re_path(r'^palete/dm/(?P<pk>\d+)$', PaleteDmBobinesAPIView.as_view(), name='paletes_dm_bobines'),
    re_path(r'^bobine/dm/$', BobineListDmAPIView.as_view(), name='bobines-dm'),
    re_path(r'^bobinagem/dm/$', BobinagemCreateDmAPIView.as_view(), name='bobineagem-create-dm'),
    re_path(r'^bobinagem/list/dm/$', BobinagemListDmAPIView.as_view(), name='bobinagem-list-dm'),
    re_path(r'^encomenda/$', EncomendaListAPIView.as_view(), name='encomenda-list'),
    re_path(r'^encomenda/(?P<pk>\d+)/$', EncomendaCargaAPIView.as_view(), name='encomenda-cargas-list'),
    re_path(r'^carga/$', CargaListAPIView.as_view(), name='carga-list'),
    re_path(r'^carga/(?P<pk>\d+)/$', CargaDetailAPIView.as_view(), name='carga-detail'),
    re_path(r'^carga/paletes/(?P<pk>\d+)/$', CargaPaletesAPIView.as_view(), name='carga-paletes-list'),
    re_path(r'^stock/$', StockListAPIView.as_view(), name='stock-list'),
    re_path(r'^palete/stock/$', PaleteListStockAPIView.as_view(), name='palete-stock-list'),
    re_path(r'^ordem/$', OrdemListAPIView.as_view(), name='ordem-list'),
    re_path(r'^ordem/(?P<pk>\d+)/$', OrdemDetailAPIView.as_view(), name='ordem-detail-list'),
          
    
    
]