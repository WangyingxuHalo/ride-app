from django.urls import path, include

import rideapp.views

urlpatterns = [
    path('login', rideapp.views.user_login),
    path('register', rideapp.views.user_register),
    path('home', rideapp.views.home),
    path('logout', rideapp.views.logout),
    path('user', rideapp.views.user_page),
    path('driver', rideapp.views.driver_page),
    path('driver/confirm', rideapp.views.confirm_ride),
    path('driver/edit', rideapp.views.edit_driver_info),
    path('driver/register', rideapp.views.driver_register),
    path('driver/search',rideapp.views.search_ride),
    path('driver/history',rideapp.views.search_driver_history_order),
    path('driver/info', rideapp.views.get_driver_info),
    path('driver/complete', rideapp.views.complete_ride),
    path('user/request', rideapp.views.request_ride),
    path('user/history',rideapp.views.search_user_history_order),
    path('user/share', rideapp.views.search_open_ride_for_sharer),
    path('user/join', rideapp.views.join_ride),
    path('user/cancel', rideapp.views.cancel_ride),
    path('user/edit', rideapp.views.edit_ride)
]