from django.contrib import admin

# Register your models here.
# from .models import User
from .models import Order
from .models import Driver

# admin.site.register(User)
admin.site.register(Order)
admin.site.register(Driver)