from django.conf.urls import url, include
from . import views

app_name="users" 

urlpatterns = [
    
    url('^', include('django.contrib.auth.urls')),
    url(r'^logout-/$', views.LogoutView.as_view(), name='logout'),
]