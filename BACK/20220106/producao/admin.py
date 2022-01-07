from .models import *
from django.contrib import admin


# admin.site.register(Perfil)
admin.site.register(Largura)
# admin.site.register(Artigo)
admin.site.register(Emenda)
# admin.site.register(Cliente)
admin.site.register(EtiquetaRetrabalho)
admin.site.register(EtiquetaPalete)
admin.site.register(Encomenda)
admin.site.register(Carga)
admin.site.register(EtiquetaFinal)
admin.site.register(ConsumoNonwoven)
admin.site.register(Fornecedor)
admin.site.register(InventarioBobinesDM)
admin.site.register(InventarioPaletesCliente)
admin.site.register(ArtigoCliente)
admin.site.register(Rececao)
admin.site.register(ArtigoNW)
admin.site.register(EtiquetaNonwoven)
admin.site.register(Reciclado)
admin.site.register(ProdutoGranulado)
admin.site.register(MovimentoMP)
admin.site.register(EtiquetaReciclado)
admin.site.register(Turno)
admin.site.register(CoreLargura)
admin.site.register(PerfilEmbalamento)
admin.site.register(LinhaEncomenda)
admin.site.register(PaleteEmb)
admin.site.register(Filme)
admin.site.register(Cinta)
admin.site.register(Mdf)
admin.site.register(Core)
admin.site.register(Etiqueta)
admin.site.register(TipoEmenda)
admin.site.register(Embalamento)
admin.site.register(Transporte)
admin.site.register(TrasporteArtigoCliente)
admin.site.register(Especificacoes)



class BobinagemAdmin(admin.ModelAdmin):
    search_fields = ['nome']


class BobineAdmin(admin.ModelAdmin):
    search_fields = ['nome']


class PaleteAdmin(admin.ModelAdmin):
    search_fields = ['nome']


class ArtigoAdmin(admin.ModelAdmin):
    search_fields = ['des']


class PerfilAdmin(admin.ModelAdmin):
    search_fields = ['nome']
    readonly_fields = ['token']


class ClienteAdmin(admin.ModelAdmin):
    search_fields = ['nome']


class NonwovenAdmin(admin.ModelAdmin):
    search_fields = ['designacao']


admin.site.register(Bobinagem, BobinagemAdmin)
admin.site.register(Bobine, BobineAdmin)
admin.site.register(Palete, PaleteAdmin)
admin.site.register(Artigo, ArtigoAdmin)
admin.site.register(Perfil, PerfilAdmin)
admin.site.register(Cliente, ClienteAdmin)
admin.site.register(Nonwoven, NonwovenAdmin)
