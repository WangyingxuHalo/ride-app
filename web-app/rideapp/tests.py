from django.test import TestCase
from datetime import datetime
from .models import Order, MyUser as User, Shared_info, Driver
from django.db.models import Q
from .views import email_notify
# Create your tests here.
class UnitTestCase(TestCase):
    def setUp(self):
        return
    def test_order(self):
        User.objects.create(username="userA", password="a123456", email="yingxu.wang@duke.edu")
        User.objects.create(username="userB", password="a123456", email="ct265@duke.edu")
        User.objects.create(username="driverA", password="a123456", email="597076427@qq.com", is_driver=True)
        user1 = User.objects.get(username="userA")
        user2 = User.objects.get(username="userB")
        user3 = User.objects.get(username="driverA")
        Driver.objects.create(user=user3,name="driverA",plate_num="AA101", max_capacity=8)
        driver1 = Driver.objects.get(user=user3)
        
        Order.objects.create(owner=user1, driver=driver1, status="CLOSE", destination="California", arr_date_time=datetime(2022, 12, 1, 12, 55, 59), passengers_num=3,vehicle_type="Toyota")
        Order.objects.create(owner=user2, destination="California", arr_date_time=datetime(2022, 12, 1, 13, 55, 59), passengers_num=3,vehicle_type="Toyota")
        Order.objects.create(owner=user1, destination="New York", arr_date_time=datetime(2022, 12, 1, 14, 55, 59), passengers_num=3,vehicle_type="Toyota")
        Order.objects.create(owner=user2, destination="New York", arr_date_time=datetime(2022, 12, 1, 15, 55, 59), passengers_num=3,vehicle_type="Toyota")

        # opened_orders = Order.objects.filter(status__icontains="OPEN")
        # for order in opened_orders:
        #     print(str(order))
        
        Shared_info.objects.create(sharer=user2, order_id=Order.objects.get(pk=1), passengers_num=1)
        print(User.objects.filter(username="userC").count())
        ride_list = Order.objects.filter(Q(owner=user1) | Q(shared_info__sharer=user2)).distinct().values()
        
        
        email_notify(Order.objects.get(pk=1))
        # self.assertEqual(len(opened_orders),3)
        