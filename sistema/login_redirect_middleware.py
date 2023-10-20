from django.shortcuts import redirect
from django.urls import reverse

class LoginRedirectMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Check if the user is authenticated and has a 'tp' attribute
        print(request.data)
        
        if request.user.is_authenticated: #and hasattr(request.user, 'tp'):
            return redirect("/app/this_middleware_is_not_in_use")
            # tp = request.user.tp
            # if tp == 1:
            #     return redirect(reverse('app_view_name'))
            # elif tp == 2:
            #     return redirect(reverse('test_view_name'))

        return response