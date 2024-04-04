from django import forms

class LoginForm(forms.Form):
    OPTIONS = [
        ('/app/picking/main', 'Painel de Controlo'),
        ('/app/ofabrico/ordensfabricolist', 'Ordens de fabrico'),
        ('/app/producao/widgetestadoproducao', 'Produção linha 1'),
        ('/app/paletes/paleteslist', 'Paletes'),
        ('/app/bobinagens/reellings', 'Bobinagens'),
        ('/app/bobines/bobineslist', 'Bobines')
    ]

    username = forms.CharField(max_length=100, label='Username')
    password = forms.CharField(widget=forms.PasswordInput(), label='Password')
    option = forms.ChoiceField(choices=OPTIONS, label='Select an option')

class LogoutForm(forms.Form):
    pass