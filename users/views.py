from django.contrib.auth import logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse, reverse_lazy
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.views import generic
from . import forms
from django.contrib.auth.models import User
from .forms import LoginForm
from django.shortcuts import render,redirect
from django.contrib.auth import authenticate, login

def LoginView(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            option = form.cleaned_data['option']

            # Authenticate the user
            user = authenticate(request, username=username, password=password)

            if user is not None:
                # Login the user
                login(request, user)
                return redirect("/app")
                #return render(request, 'success.html', {'option': option})
            #else:
            #    return render(request, 'failure.html')
    else:
        form = LoginForm()

    return render(request, 'login.html', {'form': form})

class LogoutView(LoginRequiredMixin, generic.FormView):
    form_class = forms.LogoutForm
    #template_name = 'users/logout.html'
    def form_valid(self, form):
        logout(self.request)
        return HttpResponseRedirect("/users/login")



