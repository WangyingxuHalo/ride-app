# Generated by Django 4.0.1 on 2022-01-29 23:11

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rideapp', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='driver',
            name='created_time',
            field=models.DateTimeField(default=datetime.datetime.now),
        ),
        migrations.AlterField(
            model_name='order',
            name='created_time',
            field=models.DateTimeField(default=datetime.datetime.now),
        ),
        migrations.AlterField(
            model_name='shared_info',
            name='created_time',
            field=models.DateTimeField(default=datetime.datetime.now),
        ),
    ]