from django import forms

class LoginForm(forms.Form):
    OPTIONS = [
        ('/app/producao/widgetestadoproducao', 'Produção linha 1'),
        ('/app/picking/main', 'PDA'),
        ('/app/ofabrico/ordensfabricolist', 'Ordens de fabrico'),
        ('/app', 'Dashboards'),
    ]

    username = forms.CharField(max_length=100, label='Username')
    password = forms.CharField(widget=forms.PasswordInput(), label='Password')
    option = forms.ChoiceField(choices=OPTIONS, label='Select an option')

class LogoutForm(forms.Form):
    pass