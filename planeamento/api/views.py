from planeamento.models import OrdemProducao
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView
from rest_framework.views import APIView
from django.http import Http404
from rest_framework.response import Response
from producao.models import Palete, Bobine, Emenda, Bobinagem, Cliente, Encomenda, Carga
from .serializers import OrdemSerializer
from django.contrib.auth.mixins import LoginRequiredMixin



class OrdemListAPIView(LoginRequiredMixin, ListAPIView):
    queryset = OrdemProducao.objects.all()
    serializer_class = OrdemSerializer

class OrdemDetailAPIView(LoginRequiredMixin, RetrieveAPIView):
    queryset = OrdemProducao.objects.all()
    serializer_class = OrdemSerializer

# class PaleteListHistoricoAPIView(LoginRequiredMixin, ListAPIView):
#     queryset = Palete.objects.all().order_by('-data_pal', '-num')
#     serializer_class = PaleteListSerializer


# class ClienteDetailAPIView(LoginRequiredMixin, RetrieveAPIView):
#     queryset = Cliente.objects.all()
#     serializer_class = ClienteSerializer

# class BobineDetailAPIView(LoginRequiredMixin, RetrieveAPIView):
#     queryset = Bobine.objects.all()
#     serializer_class = BobineSerializer

# class BobineListAPIView(LoginRequiredMixin, ListAPIView):
#     queryset = Bobine.objects.filter()
#     serializer_class = BobineSerializer

# class BobineListAllAPIView(LoginRequiredMixin, ListAPIView):
#     queryset = Bobine.objects.filter()
#     serializer_class = BobineListAllSerializer

# class BobineList(LoginRequiredMixin, APIView):
    
#     def get(self, request, pk, format=None):
#         bobine = Bobine.objects.filter(palete=pk)
#         serializer = BobineSerializer(bobine, many=True)
#         return Response(serializer.data)
        

# class EmendaListAPIView(LoginRequiredMixin, ListAPIView):
#     queryset = Emenda.objects.all()
#     serializer_class = EmendaSerializer


# class EmendaCreateAPIView(LoginRequiredMixin, CreateAPIView):
#     queryset = Emenda.objects.all()
#     serializer_class = EmendaCreateSerializer

# class BobinagemListAPIView(LoginRequiredMixin, ListAPIView):
#     queryset = Bobinagem.objects.all().order_by('-data', '-fim')[:200]
#     serializer_class = BobinagemListSerializer

# class BobinagemListHistoricoAPIView(LoginRequiredMixin, ListAPIView):
#     queryset = Bobinagem.objects.all().order_by('-data', '-fim')
#     serializer_class = BobinagemListSerializer

# class BobinesBobinagemAPIView(LoginRequiredMixin, APIView):
    
#     def get(self, request, pk, format=None):
#         bobinagem = Bobinagem.objects.get(pk=pk)
#         bobine = Bobine.objects.filter(bobinagem=bobinagem)
#         serializer = BobinagemBobinesSerializer(bobine, many=True)
#         return Response(serializer.data)

# class PaleteDmAPIView(LoginRequiredMixin, ListAPIView):
#     queryset = Palete.objects.filter(estado='DM')
#     serializer_class = PaleteDmSerializer
    
# class PaleteDmBobinesAPIView(LoginRequiredMixin, APIView):
#     def get(self, request, pk, format=None):
#         palete = Palete.objects.get(pk=pk)
#         bobines = Bobine.objects.filter(palete=palete).order_by('posicao_palete')
#         serializer = BobinesPaleteDmSerializer(bobines, many=True)
#         return Response(serializer.data)



# class BobineListDmAPIView(LoginRequiredMixin, ListAPIView):
#     queryset = Bobine.objects.filter(estado='DM')
#     serializer_class = BobinesDmSerializer

# class BobinagemCreateDmAPIView(LoginRequiredMixin, CreateAPIView):
#     queryset = Bobinagem.objects.all()
#     serializer_class = BobinagemCreateSerializer

# class BobinagemListDmAPIView(LoginRequiredMixin, ListAPIView):
#     queryset = Bobinagem.objects.filter(perfil__retrabalho=True)
#     serializer_class = BobinagemListSerializer

# class EncomendaListAPIView(LoginRequiredMixin, ListAPIView):
#     queryset = Encomenda.objects.filter()
#     serializer_class = EncomendaListSerializer

# class CargaListAPIView(LoginRequiredMixin, ListAPIView):
#     queryset = Carga.objects.filter()
#     serializer_class = CargaListSerializer

# class CargaDetailAPIView(LoginRequiredMixin, RetrieveAPIView):
#     queryset = Carga.objects.all()
#     serializer_class = CargaDetailSerializer

# class EncomendaCargaAPIView(LoginRequiredMixin, APIView):
#     def get(self, request, pk, format=None):
#         enc = Encomenda.objects.get(pk=pk)
#         cargas = Carga.objects.filter(enc=enc)
#         serializer = CargasEncomendaSerializer(cargas, many=True)
#         return Response(serializer.data)

# class CargaPaletesAPIView(LoginRequiredMixin, APIView):
#     def get(self, request, pk, format=None):
#         carga = Carga.objects.get(pk=pk)
#         paletes = Palete.objects.filter(carga=carga).order_by('num_palete_carga')
#         serializer = PaletesCargaSerializer(paletes, many=True)
#         return Response(serializer.data)

# class StockListAPIView(LoginRequiredMixin, ListAPIView):
#     queryset = Palete.objects.filter(stock=True)
#     serializer_class = PaleteListSerializer
    
   