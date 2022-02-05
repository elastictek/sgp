from django.urls import re_path, include
from . import views
from .views import *

app_name="planeamento" 

urlpatterns = [
    re_path(r'^encomendas/$', encomendas_list, name='encomendas_list'),
    re_path(r'^ordemdeproducao/list/$', list_ordem, name='list_ordem'),
    re_path(r'^ordemdeproducao/list-retrabalho/$', list_ordem_retrabalho, name='list_ordem_retrabalho'),
    re_path(r'^ordemdeproducao/create/$', create_ordem, name='create_ordem'),
    re_path(r'^ordemdeproducao/edit/(?P<pk>\d+)/$', edit_ordem, name='edit_ordem'),
    re_path(r'^ordemdeproducao/delete/(?P<pk>\d+)/$', delete_ordem, name='delete_ordem'),
    re_path(r'^ordemdeproducao/create_dm/$', create_ordem_dm, name='create_ordem_dm'),
    re_path(r'^ordemdeproducao/details/(?P<pk>\d+)/$', details_ordem, name='details_ordem'),
    re_path(r'^ordemdeproducao/iniciar/(?P<pk>\d+)/$', ordem_iniciar, name='ordem_iniciar'),
    re_path(r'^ordemdeproducao/cancelar/(?P<pk>\d+)/$', ordem_cancelar, name='ordem_cancelar'),
    re_path(r'^ordemdeproducao/addstock/(?P<pk>\d+)/$', ordem_add_stock, name='ordem_add_stock'),
    re_path(r'^ordemdeproducao/inserir/(?P<pk_palete>\d+)/(?P<pk_ordem>\d+)/$', palete_inserir_ordem, name='palete_inserir_ordem'),
    re_path(r'^ordemdeproducao/remover/(?P<pk_palete>\d+)/(?P<pk_ordem>\d+)/$', palete_remover_ordem, name='palete_remover_ordem'),
    re_path(r'^ordemdeproducao/addpaletedm/(?P<pk>\d+)/$', add_paletes_retrabalho, name='add_paletes_retrabalho'),
    re_path(r'^ordemdeproducao/addpaletedm/(?P<pk_ordem>\d+)/(?P<pk_palete>\d+)/$', add_palete_retrabalho, name='add_palete_retrabalho'),
    re_path(r'^ordemdeproducao/addpaletedm/remove/(?P<pk>\d+)/$', remove_palete_retrabalho, name='remove_palete_retrabalho'),
    re_path(r'^ordemdeproducao/addpaletedm/submit/(?P<pk>\d+)/$', submit_paletes_para_retrabalho, name='submit_paletes_para_retrabalho'),
    re_path(r'^ordemdeproducao/addbobines/(?P<pk>\d+)/$', add_bobines_para_retrabalho, name='add_bobines_para_retrabalho'),
    re_path(r'^ordemdeproducao/status/(?P<pk>\d+)/(?P<pk_ordem>\d+)/$', change_status_bobine_retrabalho, name='change_status_bobine_retrabalho'),
    re_path(r'^ordemdeproducao/reset/(?P<pk_ordem>\d+)/$', reset_status_bobine_retrabalho, name='reset_status_bobine_retrabalho'),
    re_path(r'^ordemdeproducao/finalizar/(?P<pk>\d+)/$', finalizar_ordem_retrabalho_dm, name='finalizar_ordem_retrabalho_dm'),
    re_path(r'^ordemdeproducao/finalizarop/(?P<pk>\d+)/$', finalizar_ordem, name='finalizar_ordem'),
    re_path(r'^ordemdeproducao/reabirop/(?P<pk>\d+)/$', reabrir_ordem, name='reabrir_ordem'),
    re_path(r'^ajax/artigos-cliente/$', load_artigos, name='load_artigos'),
    re_path(r'^ajax/cliente-encomenda/$', load_encomendas, name='load_encomendas'),
    re_path(r'^ajax/cliente/$', load_cliente, name='load_cliente'),
]
  
  
    