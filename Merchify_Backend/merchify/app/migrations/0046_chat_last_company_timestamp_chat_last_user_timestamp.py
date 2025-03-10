# Generated by Django 5.1.4 on 2024-12-16 15:59

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0045_product_is_on_promotion_product_old_price'),
    ]

    operations = [
        migrations.AddField(
            model_name='chat',
            name='last_company_timestamp',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AddField(
            model_name='chat',
            name='last_user_timestamp',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
