from django import forms

class LoginForm(forms.Form):
    OPTIONS = [
        ('1', 'Option 1'),
        ('2', 'Option 2'),
        ('3', 'Option 3'),
    ]

    username = forms.CharField(max_length=100, label='Username')
    password = forms.CharField(widget=forms.PasswordInput(), label='Password')
    option = forms.ChoiceField(choices=OPTIONS, label='Select an option')

class LogoutForm(forms.Form):
    pass