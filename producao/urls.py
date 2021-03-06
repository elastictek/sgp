from django.urls import re_path, include
from . import views
from .views import *
from .funcs import *

app_name="producao" 

urlpatterns = [
    
    re_path(r'^$', producao_home, name='producao_home'),
    re_path(r'^planeamento/$', planeamento_home, name='planeamento_home'),
    re_path(r'^dadosbase/$', dadosbase, name='dadosbase'),
    re_path(r'^bobinagem/$', bobinagem_list, name='bobinagens'),
    re_path(r'^bobinagem/list/$', bobinagem_list_v3, name='bobinagem_list_v3'),
    re_path(r'^bobinagem/historico/$', bobinagem_list_all_historico, name='bobinagem_list_all_historico'),
    re_path(r'^bobinagem/create/$', create_bobinagem, name='bobinagem_create'),
    re_path(r'^bobinagem/larguras-reais/(?P<pk>\d+)/$', bobines_larguras_reais, name='bobines_larguras_reais'),
    re_path(r'^bobinagem/(?P<pk>\d+)/$', bobinagem_status, name='bobinestatus'),
    re_path(r'^bobinagem/update/(?P<pk>\d+)/', BobinagemUpdate.as_view(), name='bobinagemupdate'),
    re_path(r'^bobinagem/delete/(?P<pk>\d+)/', bobinagem_delete, name='bobinagem_delete'),
    re_path(r'^bobinagem/(?P<operation>.+)/(?P<pk>\d+)/', classificacao_bobines_all, name='classificacao_bobines_all'),
    re_path(r'^bobinagem/(?P<pk>\d+)/classificacao/', bobinagem_classificacao, name='bobinagem_classificacao'),
    re_path(r'^bobinagem/(?P<pk>\d+)/edit/', bobinagem_edit, name='bobinagem_edit'),
    re_path(r'^bobine/(?P<pk>\d+)/', update_bobine, name='bobineupdate'),
    re_path(r'^bobine/details/(?P<pk>\d+)/', bobine_details, name='bobine_details'),
    re_path(r'^bobine/details/edit/(?P<pk>\d+)/', bobine_edit, name='bobine_edit'),
    re_path(r'^palete/$', pelete_list, name='paletes'),
    re_path(r'^paletelist/$', palete_list_all, name='palete_list_all'),
    re_path(r'^paletelist/historico/$', palete_list_all_historico, name='palete_list_all_historico'),
    re_path(r'^palete/retrabalho/$', palete_retrabalho, name='paletes_retrabalho'),
    re_path(r'^palete/create/$', create_palete, name='palete_create'),
    re_path(r'^palete/createretrabalho/$', create_palete_retrabalho, name='palete_create_retrabalho'),
    re_path(r'^palete/(?P<pk>\d+)/$', add_bobine_palete, name='addbobinepalete'),
    re_path(r'^palete/delete/(?P<pk>\d+)/$', palete_delete, name='palete_delete'),
    re_path(r'^palete/(?P<pk>\d+)/(?P<e>\d+)/$', add_bobine_palete_erro, name='addbobinepaleteerro'),
    re_path(r'^palete/(?P<pk>\d+)/picagem/$', picagem, name='picagem'),
    re_path(r'^palete/details/(?P<pk>\d+)/$', palete_details, name='palete_details'),
    re_path(r'^palete/(?P<operation>.+)/(?P<pk_bobine>\d+)/(?P<pk_palete>\d+)/$', palete_change, name='paletebobine'),
    re_path(r'^retrabalho/$', bobinagem_retrabalho_list_v2, name='bobinagem_retrabalho_list_v2'),
    re_path(r'^retrabalho/retrabalhar/$', retrabalho, name='retrabalho'),
    re_path(r'^retrabalho/filter/(?P<pk>\d+)/$', picagem_retrabalho, name='retrabalho_filter'),
    re_path(r'^retrabalho/filter/(?P<pk_bobinagem>\d+)/(?P<pk_bobine>\d+)/$', destruir_bobine, name='destruir_bobine'),
    re_path(r'^retrabalho/filter/picagem/(?P<pk>\d+)/$', picagem_retrabalho_add, name='picagem_retrabalho_add'),
    re_path(r'^retrabalho/filter/delete/(?P<pk>\d+)/', emenda_delete, name='emenda_delete'),
    re_path(r'^retrabalho/create/$', create_bobinagem_retrabalho, name='create_bobinagem_retrabalho'),
    re_path(r'^retrabalho/dm/(?P<pk>\d+)/$', retrabalho_dm, name='retrabalho_dm'),
    re_path(r'^retrabalho/validate/dm/(?P<pk>\d+)/(?P<id_bobines>[\w\-]+)/(?P<metros>[\w\-]+)/(?P<recycle>[\w\-]+)/$', validate_bobinagem_dm, name='validate_bobinagem_dm'),
    re_path(r'^retrabalho/filter/finalizar/(?P<pk>\d+)/$', bobinagem_retrabalho_finalizar, name='finalizar_retrabalho'),
    re_path(r'^retrabalho/refazer/(?P<pk>\d+)/$', refazer_bobinagem_dm, name='refazer_bobinagem_dm'),    
    re_path(r'^clientes/$', cliente_home, name='clientes'),
    re_path(r'^clientes/create/$', ClienteCreateView.as_view(), name='cliente_create'),
    re_path(r'^relatorio/linha/$', relatorio_diario, name='relatorio_diario'),
    re_path(r'^relatorio/$', relatorio_home, name='relatorio_home'),
    re_path(r'^relatorio/consumos/$', relatorio_consumos, name='relatorio_consumos'),
    re_path(r'^relatorio/paletes/$', relatorio_paletes, name='relatorio_paletes'),
    re_path(r'^etiqueta/retrabalho/(?P<pk>\d+)/$', etiqueta_retrabalho, name='etiqueta_retrabalho'),
    re_path(r'^etiqueta/palete/(?P<pk>\d+)/$', etiqueta_palete, name='etiqueta_palete'),
    re_path(r'^etiqueta/palete/(?P<pk>\d+)/reabrir/$', reabrir_palete, name='reabrir_palete'),
    re_path(r'^palete/(?P<pk>\d+)/ordenar/$', ordenar_bobines, name='ordenar_bobines'),
    re_path(r'^palete/(?P<pk>\d+)/(?P<operation>.+)/$', ordenar_bobines_op, name='ordenar_bobines_op'),
    re_path(r'^palete/validate/(?P<pk>\d+)/(?P<id_bobines>[\w\-]+)/$', palete_confirmation, name='palete_confirmation'),
    re_path(r'^palete/reabrir/(?P<pk>\d+)/$', palete_rabrir, name='palete_rabrir'),
    re_path(r'^palete/dm/(?P<pk>\d+)/$', palete_picagem_dm, name='palete_picagem_dm'),
    re_path(r'^palete/validate/dm/(?P<pk>\d+)/(?P<id_bobines>[\w\-]+)/$', validate_palete_dm, name='validate_palete_dm'),   
    re_path(r'^encomenda/$', encomenda_list, name='encomenda_list'),
    re_path(r'^encomenda/create/$', encomenda_create, name='encomenda_create'),
    re_path(r'^encomenda/(?P<pk>\d+)/', encomenda_detail, name='encomenda_detail'),
    re_path(r'^encomenda/edit/(?P<pk>\d+)/', encomenda_edit, name='encomenda_edit'),
    re_path(r'^carga/$', carga_list, name='carga_list'),
    re_path(r'^carga/completa/$', carga_list_completa, name='carga_list_completa'),
    re_path(r'^carga/detail/(?P<pk>\d+)/$', carga_detail, name='carga_detail'),
    re_path(r'^carga/create/$', carga_create, name='carga_create'),
    re_path(r'^carga/imprimiretiquetapalete/(?P<pk>\d+)/$', carga_etiqueta_palete, name='carga_etiqueta_palete'),
    re_path(r'^carga/carregar/(?P<pk>\d+)/$', carga_carregar, name='carga_carregar'),
    re_path(r'^carga/reabir/(?P<pk>\d+)/$', carga_reabir, name='carga_reabir'),
    re_path(r'^carga/carregar/add/(?P<pk_carga>\d+)/(?P<pk_palete>\d+)/$', add_palete_carga, name='add_palete_carga'),
    re_path(r'^carga/carregar/remove/(?P<pk_carga>\d+)/(?P<pk_palete>\d+)/$', remove_palete_carga, name='remove_palete_carga'),
    re_path(r'^carga/expedir/(?P<pk>\d+)/$', carga_expedir, name='carga_expedir'),
    re_path(r'^carga/finalizar/(?P<pk>\d+)/$', finalizar_carga, name='finalizar_carga'),
    re_path(r'^armazem/$', armazem_home, name='armazem_home'),
    re_path(r'^palete/selecao/$', palete_selecao, name='palete_selecao'),
    re_path(r'^palete/pesagem/(?P<pk>\d+)/$', palete_pesagem, name='palete_pesagem'),
    re_path(r'^palete/armazem/(?P<pk>\d+)/$', palete_details_armazem, name='palete_details_armazem'),
    re_path(r'^stock/$', stock_list, name='stock_list'),
    re_path(r'^stock/palete/add/(?P<pk>\d+)/$', stock_add_to_carga, name='stock_add_to_carga'),
    re_path(r'^qualidade/$', qualidade_home, name='qualidade_home'),
    re_path(r'^qualidade/acd/$', acompanhamento_diario, name='acompanhamento_diario'),
    re_path(r'^retrabalho/(?P<pk>\d+)/$', retrabalho_v2, name='retrabalho_v2'),
    re_path(r'^retrabalho/confirmacao/(?P<pk>\d+)/(?P<b1>\d+)/(?P<m1>\d+)/(?P<b2>\w+)/(?P<m2>\w+)/(?P<b3>\w+)/(?P<m3>\w+)/$', retrabalho_confirmacao, name='retrabalho_confirmacao'),
    re_path(r'^palete/picagem/(?P<pk>\d+)/$', palete_picagem_v3, name='palete_picagem_v3'),    
    re_path(r'^listadebobines/(?P<pk>\d+)/$', classificacao_bobines_v2, name='classificacao_bobines_v2'),   
    re_path(r'^perfil/list/$', perfil_list_v2, name='perfil_list_v2'),    
    re_path(r'^perfil/details/(?P<pk>\d+)/$', perfil_details_v2, name='perfil_details_v2'),    
    re_path(r'^perfil/create/linha/$', perfil_create_linha_v2, name='perfil_create_linha_v2'),    
    re_path(r'^perfil/create/dm/$', perfil_create_dm_v2, name='perfil_create_dm_v2'),    
    re_path(r'^perfil/larguras/(?P<pk>\d+)/$', perfil_larguras_v2, name='perfil_larguras_v2'),
    re_path(r'^perfil/larguras/edit/(?P<pk>\d+)/$', perfil_edit_larguras_v2, name='perfil_edit_larguras_v2'),
    re_path(r'^perfil/larguras/cancel/(?P<pk>\d+)/$', cancel_insert_larguras, name='cancel_insert_larguras'),
    re_path(r'^perfil/delete/(?P<pk>\d+)/$', perfil_delete_v2, name='perfil_delete_v2'),
    re_path(r'^inventario/dm/list/$', inventario_bobines_list, name='inventario_bobines_list'),
    re_path(r'^inventario/dm/insert/$', inventario_bobines_dm_insert, name='inventario_bobines_dm_insert'),
    re_path(r'^inventario/dm/delete/(?P<pk>\d+)/$', inventario_bobines_dm_remover, name='inventario_bobines_dm_remover'),
    re_path(r'^inventario/paletescliente/list/$', inventario_paletes_cliente_list, name='inventario_paletes_cliente_list'),
    re_path(r'^inventario/paletescliente/insert/$', inventario_palete_cliente_insert, name='inventario_palete_cliente_insert'),
    re_path(r'^cliente/details/(?P<pk>\d+)/$', cliente_details, name='cliente_details'),
    re_path(r'^cliente/details/(?P<pk_cliente>\d+)/(?P<pk_artigo>\d+)/remove/$', cliente_remover_artigo, name='cliente_remover_artigo'),
    re_path(r'^cliente/details/(?P<pk>\d+)/add/$', cliente_add_artigo, name='cliente_add_artigo'),
    re_path(r'^ajax/artigos-cliente/$', load_artigos_cliente, name='load_artigos_cliente'),
    re_path(r'^fornecedores/list/$', fornecedor_list, name='fornecedor_list'),
    re_path(r'^fornecedores/details/(?P<pk>\d+)/$', fornecedor_details, name='fornecedor_details'),
    re_path(r'^fornecedores/create/$', fornecedor_create, name='fornecedor_create'),
    re_path(r'^fornecedores/edit/(?P<pk>\d+)/$', fornecedor_edit, name='fornecedor_edit'),
    re_path(r'^fornecedores/delete/(?P<pk>\d+)/$', fornecedor_delete, name='fornecedor_delete'),
    re_path(r'^rececoes/list/$', rececao_list, name='rececao_list'),
    re_path(r'^rececoes/details/(?P<pk>\d+)/$', rececao_details, name='rececao_details'),
    re_path(r'^rececoes/create/$', rececao_create, name='rececao_create'),
    re_path(r'^artigonw/list/$', artigonw_list, name='artigonw_list'),
    re_path(r'^artigonw/create/$', artigonw_create, name='artigonw_create'),
    re_path(r'^artigonw/edit/(?P<pk>\d+)/$', artigonw_edit, name='artigonw_edit'),
    re_path(r'^artigonw/delete/(?P<pk>\d+)/$', artigonw_delete, name='artigonw_delete'),
    re_path(r'^rececoes/insertnw/(?P<pk>\d+)/$', rececao_insert_nw, name='rececao_insert_nw'),
    re_path(r'^rececoes/close/(?P<pk>\d+)/$', rececao_close, name='rececao_close'),
    re_path(r'^rececoes/open/(?P<pk>\d+)/$', rececao_open, name='rececao_open'),
    re_path(r'^rececoes/imprimiretiquetanonwoven/(?P<pk>\d+)/$', carga_etiqueta_nonwoven, name='carga_etiqueta_nonwoven'),
    re_path(r'^rececoes/imprimiretiquetanonwovenrececao/(?P<pk>\d+)/$', carga_etiqueta_nonwoven_rececao, name='carga_etiqueta_nonwoven_rececao'),
    re_path(r'^artigonw/details/(?P<pk>\d+)/$', artigonw_details, name='artigonw_details'),
    # re_path(r'^atualizar/$', atualizar_movimentos, name='atualizar_movimentos'),
    re_path(r'^reciclado/$', reciclado_home, name='reciclado_home'),
    re_path(r'^produtogranulado/list/$', produto_granulado_list, name='produto_granulado_list'),
    re_path(r'^reciclado/list/$', reciclado_list, name='reciclado_list'),
    re_path(r'^movimentos/list/$', movimentos_list, name='movimentos_list'),
    re_path(r'^produtogranulado/create/$', produto_granulado_create, name='produto_granulado_create'),
    re_path(r'^reciclado/create/$', reciclado_create, name='reciclado_create'),
    re_path(r'^movimentos/create/$', movimento_create, name='movimento_create'),
    re_path(r'^reciclado/edit/(?P<pk>\d+)/$', reciclado_edit, name='reciclado_edit'),
    re_path(r'^reciclado/details/(?P<pk>\d+)/$', reciclado_details, name='reciclado_details'),
    re_path(r'^bobinagem/exportbobines/$', export_bobine_to_excel, name='export_bobine_to_excel'),
    re_path(r'^carga/calendario/$', calendario_expedicoes, name='calendario_expedicoes'),
    re_path(r'^carga/packinglist/(?P<pk>\d+)/$', carga_packinglist_details, name='carga_packinglist_details'),
    re_path(r'^palete/pesagemdm/(?P<pk>\d+)/$', palete_pesagem_dm, name='palete_pesagem_dm'),
    re_path(r'^atualizar/$', sql_connect, name='sql_connect'),
    re_path(r'^ajax/perfis/$', load_perfis, name='load_perfis'),
    re_path(r'^artigos/$', artigos_list, name='artigos_list'),
    re_path(r'^paletesemb/$', paletes_emb_list, name='paletes_emb_list'),
    re_path(r'^artigos/create/$', artigo_create, name='artigo_create'),
    re_path(r'^paletesemb/create/$', paletes_emb_create, name='paletes_emb_create'),
    re_path(r'^dadosbase/embalamento/$', embalamento_home, name='embalamento_home'),
    re_path(r'^filmes/$', filmes_list, name='filmes_list'),
    re_path(r'^filmes/create/$', filme_create, name='filme_create'),
    re_path(r'^cintas/$', cintas_list, name='cintas_list'),
    re_path(r'^cintas/create/$', cinta_create, name='cinta_create'),
    re_path(r'^cores/$', cores_list, name='cores_list'),
    re_path(r'^cores/create/$', core_create, name='core_create'),
    re_path(r'^mdfs/$', mdfs_list, name='mdfs_list'),
    re_path(r'^mdfs/create/$', mdf_create, name='mdf_create'),
    re_path(r'^cartao/$', cartao_list, name='cartao_list'),
    re_path(r'^cartao/create/$', cartao_create, name='cartao_create'),
    re_path(r'^transportes/$', transportes_list, name='transportes_list'),
    re_path(r'^transportes/create/$', transporte_create, name='transporte_create'),
    re_path(r'^transportes/artgiocliente/(?P<pk_artigo>\d+)/(?P<pk_cliente>\d+)/$', transportes_artigo_cliente, name='transportes_artigo_cliente'),
    re_path(r'^especificacoes/(?P<pk_artigo>\d+)/(?P<pk_cliente>\d+)/$', especificacoes_artigo_cliente, name='especificacoes_artigo_cliente'),
    re_path(r'^especificacoes/details/(?P<pk>\d+)/$', especificacoes_details, name='especificacoes_details'),
    re_path(r'^transportes/artgiocliente/add/(?P<pk>\d+)/$', transportes_artigo_cliente_add, name='transportes_artigo_cliente_add'),
    re_path(r'^especificacoes/add/(?P<pk>\d+)/$', especificacoes_artigo_cliente_add, name='especificacoes_artigo_cliente_add'),
    re_path(r'^bobinagem/destinos/$', atribuir_destinos, name='atribuir_destinos'),
    re_path(r'^export_packing_list_carga_excel/(?P<pk>\d+)/$', export_packing_list_carga_excel, name='export_packing_list_carga_excel'),
    re_path(r'^export_bobines_originais/$', export_bobines_originais, name='export_bobines_originais'),
    
    
    
]