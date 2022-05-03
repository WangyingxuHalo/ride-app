# Create your views here.
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.core.paginator import Paginator
from .models import MyUser as User
from .models import Driver, Order, Shared_info
from django.contrib import auth
from datetime import datetime
from django.db.models import Q
import json
from django.core import serializers 
from django.forms.models import model_to_dict
from .emails import send_email_to
# For logging
import logging
logger = logging.getLogger('log')

# Create your views here.
maximum_capacity = 8

def user_login(request):
    if request.method == "GET":
        return render(request, 'rideapp/login.html')
    elif request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = auth.authenticate(username=username, password=password)
        if user is not None:
            auth.login(request, user)
            return redirect('/rideapp/home', {'user', user})
        else:
            return render(request, 'rideapp/login.html', {
                'login_error' : 'username or password incorrect'
            })

def user_register(request):
    if request.method == "GET":
        return render(request, 'rideapp/register.html')
    elif request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        email = request.POST.get("email")
        count = User.objects.filter(username=username).count()
        if count == 0:
            user = User.objects.create_user(username, email, password)
            auth.login(request, user)
            return redirect('/rideapp/home', {'user', user})
        else:
            return render(request, 'rideapp/register.html', {
                'regis_error': 'already have the username'
            })


def home(request):
    if request.user.is_authenticated:
        return render(request, 'rideapp/home.html')
    else:
        return redirect('/rideapp/login')

def logout(request):
    if request.user.is_authenticated:
        auth.logout(request)
    return redirect('/rideapp/login')

def user_page(request):
    if request.user.is_authenticated:
        return render(request, 'rideapp/user.html')
    else:
        return redirect('/rideapp/login')

def driver_page(request):
    if request.user.is_authenticated:
        if User.objects.filter(username=request.user.username, is_driver=True).count() == 1:
            return render(request, 'rideapp/driver.html')
        else:
            return render(request, 'rideapp/driver_register.html')
    return redirect('/rideapp/login')

def driver_register(request):
    logger.info("Driver successfully registered for " + request.user.username)
    user = User.objects.get(username=request.user.username)
    name = request.POST.get('name')
    vehicle = request.POST.get('vehicle')
    platenum = request.POST.get("platenum")
    maxcap = request.POST.get("maxcap")
    otherinfo = request.POST.get("info")
    Driver.objects.create(user=user, name=name, vehicle_type=vehicle, plate_num=platenum, max_capacity=maxcap, other_info=otherinfo)
    user.is_driver = True
    user.save()
    return redirect('/rideapp/driver')

def get_order_capacity(order:dict):
    order_obj = Order.objects.get(order_id=order["order_id"])
    shared_infos = Shared_info.objects.filter(order_id=order_obj,is_valid=True)
    total_capacity = 0
    for shared_info in shared_infos:
        total_capacity += shared_info.passengers_num
    # owner's total # + sharers' total #
    logger.info("owner's total + sharers' total = " + str(order["passengers_num"] + total_capacity))
    return order["passengers_num"] + total_capacity

def email_notify(order):
    emails = [[order.driver.user.email, ["driver", order.driver.user.username]], [order.owner.email,["owner", order.owner.username]]]
    shared_infos = Shared_info.objects.filter(order_id=order, is_valid=True)
    capacity = get_order_capacity(model_to_dict(order))
    for shared_info in shared_infos:
        emails.append([shared_info.sharer.email, ["sharer",shared_info.sharer.username]])
    subject_str = f'Your order #%s has been conformed!' % str(order.order_id)
    logger.info("Ready to send email" + str(emails))
    for email, name in emails:
        if len(email) == 0:
            continue
        content_str = f'''Dear %s %s, 

your order has been conformed and cannot be editted 
    
Arrival Time: %s  
Total Passenger Number: %s 
Destination: %s  
Vehicle Type: %s  

From:  
RideApp Team''' % (name[0], name[1], order.arr_date_time.strftime("%c"), str(capacity), order.destination, order.vehicle_type)
        send_email_to([email],subject_str,content_str)
    
def confirm_ride(request):
    if request.user.is_authenticated == False:
        return redirect('/rideapp/login')
    req = json.loads(request.body.decode('utf-8'))
    order_id = req["order_id"]
    user = User.objects.get(username=request.user.username)
    driver = Driver.objects.get(user=user)
    logger.info("User confirms oder with id " + str(order_id))
    order = Order.objects.get(order_id=order_id)
    if order.status == "OPEN" and get_order_capacity(model_to_dict(order)) <= driver.max_capacity and order.arr_date_time >= datetime.now() and order.owner!=user:
        order.status = "CONFIRMED"
        order.driver = Driver.objects.get(user=User.objects.get(username=request.user.username))
        order.save()
        email_notify(order)
        return JsonResponse({"status":"Success"},status=200)
    else:
        return JsonResponse({"status":"Failure"},status=200)

def update_order_status():
    orders = Order.objects.filter(Q(status="OPEN") | Q(status="CONFIRMED"), arr_date_time__lte=datetime.now())
    for order in orders:
        logger.info(f"Update order status with id %s since it's out-of-date"%order.order_id)
        order.status = "CLOSED"
        order.save()

def request_ride(request):
    logger.info("Request A Ride with info: " + request.body.decode('utf-8'))
    if request.user.is_authenticated == False:
        return redirect('/rideapp/login')
    req = json.loads(request.body.decode('utf-8'))
    dest = req['destination']
    arr_date = req['arrival_date']
    arr_time = req['arrival_time']
    request_datetime = datetime.strptime(arr_date+' '+arr_time, "%Y-%m-%d %H:%M")
    num_people = req['num_people']
    vehicle = None if req['vehicle'] == "" else req['vehicle']
    can_be_shared = req['share']
    user = User.objects.get(username=request.user.username)
    Order.objects.create(owner=user, destination=dest, arr_date_time=request_datetime, passengers_num=num_people, vehicle_type=vehicle, can_be_shared=can_be_shared)
    data = {
        'status': 'success',
        'error_msg': 'no error'
    }
    return JsonResponse(data, status=200)

def search_user_history_order(request):
    logger.info("Request User Ride list by user " + request.user.username)
    update_order_status()
    if request.user.is_authenticated == False:
        return redirect('/rideapp/login')
    user = User.objects.get(username = request.user.username)
    orders = Order.objects.filter(Q(owner=user) | (Q(shared_info__sharer=user, shared_info__is_valid=True))).distinct().order_by('arr_date_time').values()
    ret_json = {"history":[],"future":[]}
    for order in orders:
        if order['owner_id'] == user.id:
            order['role'] = 'owner'
        else:
            order['role'] = 'sharer'
        if order['status'] != "OPEN":
            ret_json["history"].append(order)
        else:
            ret_json["future"].append(order)
    
    return JsonResponse(ret_json, status=200)
    

def search_ride(request):
    if request.user.is_authenticated:
        update_order_status()
        user = User.objects.get(username=request.user.username)
        driver = Driver.objects.get(user=user)
        orders = Order.objects.filter(vehicle_type__icontains=driver.vehicle_type, passengers_num__lte=driver.max_capacity, arr_date_time__gte=datetime.now(), status="OPEN").exclude(owner=user)
        ret_json = {"content":[]}
        for order in orders:
            if get_order_capacity(model_to_dict(order)) <=driver.max_capacity and Shared_info.objects.filter(order_id=order,sharer=user).count() == 0:
                ret_json["content"].append(model_to_dict(order))
        return JsonResponse(ret_json, status=200)
    else:
        return redirect('/rideapp/login')
    

def search_driver_history_order(request):
    logger.info("Request Driver Ride list by driver " + request.user.username)
    if request.user.is_authenticated == False:
        return redirect('/rideapp/login')
    update_order_status()
    user = User.objects.get(username = request.user.username)
    driver = Driver.objects.get(user=user)
    orders = Order.objects.filter(driver=driver).order_by('arr_date_time').values()
    ret_json = {"history":[],"future":[]}
    for order in orders:
        if order['status'] != "CONFIRMED":
            ret_json["history"].append(order)
        else:
            ret_json["future"].append(order)
    return JsonResponse(ret_json, status=200)

def get_driver_info(request):
    logger.info("Get driver info by driver " + request.user.username)
    if request.user.is_authenticated == False:
        return redirect('/rideapp/login')
    user = User.objects.get(username = request.user.username)
    ret_json = Driver.objects.filter(user=user).values()[0]
    return JsonResponse(ret_json, status=200)

def edit_driver_info(request):
    logger.info("Edit driver info by driver " + request.body.decode('utf-8'))
    if request.user.is_authenticated == False:
        return redirect('/rideapp/login')
    req = json.loads(request.body.decode('utf-8'))
    name = req['name']
    vehicle = req['vehicle']
    plate_num = req['plate_num']
    num_people = req['num_people']
    user = User.objects.get(username = request.user.username)
    driver = Driver.objects.get(user=user)
    driver.name = name
    driver.vehicle_type = vehicle
    driver.plate_num = plate_num
    driver.max_capacity = num_people
    driver.save()
    return JsonResponse({}, status=200)

def search_open_ride_for_sharer(request):
    logger.info("Search Open Ride by Sharer" + request.body.decode('utf-8'))
    if request.user.is_authenticated == False:
        return redirect('/rideapp/login')
    update_order_status()
    req = json.loads(request.body.decode('utf-8'))
    dest = req['destination']
    earliest_date = req['earliest_date']
    earliest_time = req['earliest_time']
    earliest_datetime = datetime.strptime(earliest_date+' '+earliest_time, "%Y-%m-%d %H:%M")
    latest_date = req['latest_date']
    latest_time = req['latest_time']
    latest_datetime = datetime.strptime(latest_date+' '+latest_time, "%Y-%m-%d %H:%M")
    num_people = int(req['num_people'])
    user = User.objects.get(username=request.user.username)
    orders = Order.objects.filter(status="OPEN", can_be_shared=True, arr_date_time__range=[earliest_datetime, latest_datetime], destination__icontains=dest).exclude(owner=user)
    ret_json = {"content":[]}
    for order in orders:
        total_capacity = get_order_capacity(model_to_dict(order))
        if total_capacity + num_people <= maximum_capacity and (Shared_info.objects.filter(order_id=order,sharer=user).count() == 0):
            ret_json["content"].append(model_to_dict(order))
    return JsonResponse(ret_json, status=200)
        
    
def join_ride(request):
    if request.user.is_authenticated is False:
        return redirect('/rideapp/login')
    logger.info("join ride by the request from user " + request.user.username + ": " + request.body.decode('utf-8'))
    update_order_status()
    req = json.loads(request.body.decode('utf-8'))
    order = Order.objects.get(order_id=int(req['order_id']))
    user = User.objects.get(username=request.user.username)
    number_of_sharers = int(req["number_of_sharers"])
    if order.status == "OPEN" and get_order_capacity(model_to_dict(order)) + number_of_sharers <= maximum_capacity and order.owner != user:
        Shared_info.objects.create(sharer=user, order_id=order, passengers_num=number_of_sharers)
        return JsonResponse({"status":"Success"}, status=200)
    else:
        return JsonResponse({"status":"Failure"}, status=200)
    
def cancel_ride(request):
    if request.user.is_authenticated is False:
        return redirect('/rideapp/login')
    req = json.loads(request.body.decode('utf-8'))
    order_id = int(req['order_id'])
    order = Order.objects.get(order_id=order_id)
    user = User.objects.get(username=request.user.username)
    if order.owner == user:
        order.status = "CANCELLED"
        order.save()
    else:
        shared_info = Shared_info.objects.get(sharer=user, order_id=order)
        shared_info.is_valid = False
        shared_info.save()
    return JsonResponse({"status":"Success"}, status=200)

def edit_ride(request):
    if request.user.is_authenticated is False:
        return redirect('/rideapp/login')
    req = json.loads(request.body.decode('utf-8'))
    order = Order.objects.get(order_id=int(req['order_id']))
    user = User.objects.get(username=request.user.username)
    total_cap = get_order_capacity(model_to_dict(order))
    new_number_passengers = int(req['num_people'])
    if order.owner == user:
        total_cap -= order.passengers_num
        if total_cap + new_number_passengers > maximum_capacity:
            return JsonResponse({"status":"failure","error_msg":f"You should have %s passengers at most"%(maximum_capacity-total_cap)}, status=200)
        else:
            order.destination = req['destination']
            order.arr_date_time = datetime.strptime(req['arrival_date']+' '+req['arrival_time'], "%Y-%m-%d %H:%M")
            order.vehicle_type = req['vehicle']
            order.passengers_num = new_number_passengers
            order.save()
    else:
        shared_info = Shared_info.objects.get(order_id=order,sharer=user)
        total_cap -= shared_info.passengers_num
        if total_cap + new_number_passengers > maximum_capacity:
            return JsonResponse({"status":"failure","error_msg":f"You should have %s passengers at most"%(maximum_capacity-total_cap)}, status=200)
        else:
            shared_info.passengers_num = new_number_passengers
            shared_info.save()
    return JsonResponse({"status":"Success"}, status=200)
            
def complete_ride(request):
    if request.user.is_authenticated is False:
        return redirect('/rideapp/login')
    req = json.loads(request.body.decode('utf-8'))
    order = Order.objects.get(order_id=int(req['order_id']))
    order.status = "CLOSED"
    order.save()
    return JsonResponse({"status":"Success"}, status=200)