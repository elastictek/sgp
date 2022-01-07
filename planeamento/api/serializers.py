from planeamento.models import OrdemProducao
from rest_framework.serializers import ModelSerializer, PrimaryKeyRelatedField
from producao.models import Palete, Bobine, Largura, Perfil, Emenda, Bobinagem, Cliente, Encomenda, Carga, Encomenda


class OrdemSerializer(ModelSerializer):
       
    class Meta:
        model = OrdemProducao
        fields = [
            'id',
            'core',
            'largura',
            'palete_por_palete',
            'bobines_por_palete',
            'bobines_por_palete_inf'                       
        ]