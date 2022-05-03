from django.db import models
from django.contrib.auth.models import User
from datetime import datetime
# Create your models here.


class MyUser(User):
    is_driver = models.BooleanField(default=False)

    def __str__(self):
        return self.username

class Driver(models.Model):
    driver_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(MyUser, related_name='user',on_delete=models.CASCADE, null=True)
    name = models.TextField()
    vehicle_type = models.TextField()
    plate_num = models.TextField()
    max_capacity = models.IntegerField()
    other_info = models.TextField()
    created_time = models.DateTimeField(default=datetime.now)
    updated_time = models.DateTimeField(auto_now=True)


class Order(models.Model):
    order_id = models.AutoField(primary_key=True)
    owner = models.ForeignKey(
        MyUser, on_delete=models.CASCADE, null=True)
    driver = models.ForeignKey(
        Driver, default=None, on_delete=models.CASCADE, null=True)
    destination = models.TextField(max_length=512, null=True)
    arr_date_time = models.DateTimeField(auto_now=False)
    passengers_num = models.IntegerField()
    vehicle_type = models.TextField(max_length=128, null=True)
    other_request = models.TextField()
    status = models.TextField(default="OPEN") #OPEN, CANCELLED, CLOSE, CONFIRMED
    can_be_shared = models.BooleanField(default=False)
    created_time = models.DateTimeField(default=datetime.now)
    updated_time = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "order_id:{}\nowner_name:{}\ndestination:{}\narr_date_time:{}\nstatus:{}\n".format(self.order_id, str(self.owner), self.destination, self.arr_date_time.strftime("%m/%d/%Y, %H:%M:%S"),self.status)

class Shared_info(models.Model):
    shared_info_id = models.AutoField(primary_key=True)
    sharer = models.ForeignKey(MyUser, on_delete=models.CASCADE, null=True)
    order_id = models.ForeignKey(Order, on_delete=models.CASCADE, null=True)
    created_time = models.DateTimeField(default=datetime.now)
    updated_time = models.DateTimeField(auto_now=True)
    passengers_num = models.IntegerField()
    is_valid = models.BooleanField(default=True)