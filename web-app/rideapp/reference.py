from django.db import models
from datetime import datetime
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _

# user account models
class MyUser(AbstractUser):
    Is_driver = models.BooleanField(default=False)

class STATES(models.Model):
    ALABAMA = 'AL'
    ALASKA = 'AK'
    AMERICAN_SAMOA = 'AS'
    ARIZONA = 'AZ'
    ARKANSAS = 'AR'
    CALIFORNIA = 'CA'
    COLORADO = 'CO'
    CONNECTICUT = 'CT'
    DELAWARE = 'DE'
    DISTRICT_OF_COLUMBIA = 'DC'
    FEDERATED_STATES_OF_MICRONESIA = 'FM'
    FLORIDA = 'FL'
    GEORGIA = 'GA'
    GUAM = 'GU'
    HAWAII = 'HI'
    IDAHO = 'ID'
    ILLINOIS = 'IL'
    INDIANA = 'IN'
    IOWA = 'IA'
    KANSAS = 'KS'
    KENTUCKY = 'KY'
    LOUISIANA = 'LA'
    MAINE = 'ME'
    MARSHALL_ISLANDS = 'MH'
    MARYLAND = 'MD'
    MASSACHUSETTS = 'MA'
    MICHIGAN = 'MI'
    MINNESOTA = 'MN'
    MISSISSIPPI = 'MS'
    MISSOURI = 'MO'
    MONTANA = 'MT'
    NEBRASKA = 'NE'
    NEVADA = 'NV'
    NEW_HAMPSHIRE = 'NH'
    NEW_JERSEY = 'NJ'
    NEW_MEXICO = 'NM'
    NEW_YORK = 'NY'
    NORTH_CAROLINA = 'NC'
    NORTH_DAKOTA = 'ND'
    NORTHERN_MARIANA_ISLANDS = 'MP'
    OHIO = 'OH'
    OKLAHOMA = 'OK'
    OREGON = 'OR'
    PALAU = 'PW'
    PENNSYLVANIA = 'PA'
    PUERTO_RICO = 'PR'
    RHODE_ISLAND = 'RI'
    SOUTH_CAROLINA = 'SC'
    SOUTH_DAKOTA = 'SD'
    TENNESSEE = 'TN'
    TEXAS = 'TX'
    UTAH = 'UT'
    VERMONT = 'VT'
    VIRGIN_ISLANDS = 'VI'
    VIRGINIA = 'VA'
    WASHINGTON = 'WA'
    WEST_VIRGINIA = 'WV'
    WISCONSIN = 'WI'
    WYOMING = 'WY'
    STATES_CHOICES = [
        (ALABAMA, 'Alabama'),
        (ALASKA, 'Alaska'),
        (AMERICAN_SAMOA, 'American Samoa'),
        (ARIZONA, 'Arizona'),
        (ARKANSAS, 'Arkansas'),
        (CALIFORNIA, 'California'),
        (COLORADO, 'Colorado'),
        (CONNECTICUT, 'Connecticut'),
        (DELAWARE, 'Delaware'),
        (DISTRICT_OF_COLUMBIA, 'District of Columbia'),
        (FEDERATED_STATES_OF_MICRONESIA, 'Federated States of Micronesia'),
        (FLORIDA, 'Florida'),
        (GEORGIA, 'Georgia'),
        (GUAM, 'Guam'),
        (HAWAII, 'Hawaii'),
        (IDAHO, 'Idaho'),
        (ILLINOIS, 'Illinois'),
        (INDIANA, 'Indiana'),
        (IOWA, 'Iowa'),
        (KANSAS, 'Kansas'),
        (KENTUCKY, 'Kentucky'),
        (LOUISIANA, 'Louisiana'),
        (MAINE, 'Maine'),
        (MARSHALL_ISLANDS, 'Marshall Islands'),
        (MARYLAND, 'Maryland'),
        (MASSACHUSETTS, 'Massachusetts'),
        (MICHIGAN, 'Michigan'),
        (MINNESOTA, 'Minnesota'),
        (MISSISSIPPI, 'Mississippi'),
        (MISSOURI, 'Missouri'),
        (MONTANA, 'Montana'),
        (NEBRASKA, 'Nebraska'),
        (NEVADA, 'Nevada'),
        (NEW_HAMPSHIRE, 'New Hampshire'),
        (NEW_JERSEY, 'New Jersey'),
        (NEW_MEXICO, 'New Mexico'),
        (NEW_YORK, 'New York'),
        (NORTH_CAROLINA, 'North Carolina'),
        (NORTH_DAKOTA, 'North Dakota'),
        (NORTHERN_MARIANA_ISLANDS, 'Northern Mariana Islands'),
        (OHIO, 'Ohio'),
        (OKLAHOMA, 'Oklahoma'),
        (OREGON, 'Oregon'),
        (PALAU, 'Palau'),
        (PENNSYLVANIA, 'Pennsylvania'),
        (PUERTO_RICO, 'Puerto Rico'),
        (RHODE_ISLAND, 'Rhode Island'),
        (SOUTH_CAROLINA, 'South Carolina'),
        (SOUTH_DAKOTA, 'South Dakota'),
        (TENNESSEE, 'Tennessee'),
        (TEXAS, 'Texas'),
        (UTAH, 'Utah'),
        (VERMONT, 'Vermont'),
        (VIRGIN_ISLANDS, 'Virgin Islands'),
        (VIRGINIA, 'Virginia'),
        (WASHINGTON, 'Washington'),
        (WEST_VIRGINIA, 'West Virginia'),
        (WISCONSIN, 'Wisconsin'),
        (WYOMING, 'Wyoming'),
    ]

class Driver_Info(models.Model):
    Driver_info_id = models.AutoField(primary_key=True, db_column='DRIVER_INFO_ID')
    User           = models.OneToOneField(MyUser, on_delete=models.CASCADE, default=None)
    Plate_number   = models.CharField(max_length=10, db_column='PLATE_NUMBER')
    Plate_state    = models.CharField(default='NC', max_length=2, validators=[RegexValidator(regex='[A-Z]{2}', message='Length has to be 2', code='nomatch')], choices=STATES.STATES_CHOICES, db_column='PLATE_STATE')
    #Vehicle_type   = models.ForeignKey(Vehicle_types, on_delete=models.SET_NULL, to_field='Vehicle_type_id', null=True)
    Vehicle_type   = models.CharField(max_length=128, null=True)
    Capacity       = models.IntegerField(default=4, db_column='CAPACITY')
    Is_on_duty     = models.BooleanField(default=True, db_column='IS_ON_DUTY')
    Created_at     = models.DateTimeField(default=datetime.now, db_column='CREATED_AT')
    Updated_at     = models.DateTimeField(default=datetime.now, db_column='UPDATED_AT')
    Special_info   = models.CharField(max_length=512, default='')

class STATUS(models.IntegerChoices):
    OPEN      = 0, 'OPEN'
    CONFIRMED = 1, 'CONFIRMED'
    COMPETE   = 2, 'COMPETE'
    CANCELED  = 3, 'CANCELED'

class Transactions(models.Model):
    Transaction_id  = models.AutoField(primary_key=True, db_column='TRANSACTION_ID')
    Owner           = models.ForeignKey(MyUser, related_name='owner', on_delete=models.CASCADE,  null=True)
    Driver          = models.ForeignKey(MyUser, related_name='driver', on_delete=models.CASCADE, null=True)
    Destination     = models.CharField(max_length=512, db_column='DESTINATION')
    Start_time      = models.DateTimeField(db_column='START_TIME')
    Arrival_time    = models.DateTimeField(db_column='ARRIVAL_TIME')
    Passenger_num   = models.IntegerField(db_column='PASSENGER_NUM')
    # Vehicle_type  = models.ForeignKey(Vehicle_types, on_delete=models.SET_NULL, to_field='Vehicle_type_id', null=True)
    Vehicle_type    = models.CharField(max_length=128, null=True)
    Can_share       = models.BooleanField(default=False, db_column='CAN_SHARE')
    Status          = models.IntegerField(choices=STATUS.choices, default=STATUS.OPEN)
    Created_at      = models.DateTimeField(default=datetime.now, db_column='CREATED_AT')
    Updated_at      = models.DateTimeField(default=datetime.now, db_column='UPDATED_AT')
    Special_request = models.CharField(max_length=512, default='')

class Share_info(models.Model):
    Share_info_id   = models.AutoField(primary_key=True, db_column='SHARE_INFO_ID')
    Sharer          = models.ForeignKey(MyUser, on_delete=models.CASCADE, null=True)
    Transaction_id  = models.ForeignKey(Transactions, on_delete=models.SET_NULL, to_field='Transaction_id', null=True)
    Passenger_num   = models.IntegerField(db_column='PASSENGER_NUM')
    # Status          = models.IntegerField(choices=STATUS.choices, default=STATUS.OPEN)
    Created_at      = models.DateTimeField(default=datetime.now, db_column='CREATED_AT')
    Updated_at      = models.DateTimeField(default=datetime.now, db_column='UPDATED_AT')