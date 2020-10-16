import uuid
import pendulum
from django.db import models
from django.contrib.auth.models import AbstractUser


class ModelBase(models.Model):
    created = models.DateTimeField(
        'Created',
        auto_now_add=True,
        editable=False,
        help_text='The date and time this register was created.'
    )
    updated = models.DateTimeField(
        'Updated',
        auto_now=True,
        help_text='The date and time this register was updated.'
    )

    class Meta:
        abstract = True
        ordering = ['-created']


class CustomUser(AbstractUser, ModelBase):
    pass


class SlackSetting(ModelBase):
    token = models.CharField(
        "Bot User OAuth Access Token",
        max_length=64
    )
    channel_id = models.CharField(
        "Channel ID",
        max_length=12
    )
    channel_name = models.CharField(
        "Channel name",
        max_length=120
    )

    class Meta:
        ordering = ['-created']
        permissions = (
            ('admin_slacksetting', 'Admin Slack Setting'),
        )

    def __str__(self):
        return self.channel_name


class Dish(ModelBase):
    name = models.CharField(
        "Name",
        max_length=200
    )
    description = models.TextField(
        "Description",
        null=True,
        blank=True
    )

    class Meta:
        ordering = ['-created']
        permissions = (
            ('admin_dish', 'Admin Dishes'),
        )

    def __str__(self):
        return self.name


class Menu(ModelBase):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    dishes = models.ManyToManyField(
        Dish,
        verbose_name='Dishes',
        related_name='menus'
    )
    date = models.DateField(
        "Menu date",
        unique=True
    )
    reminder_sent = models.BooleanField(
        "Reminder sent",
        default=False
    )
    last_reminder = models.DateTimeField(
        "Last reminder",
        null=True,
        blank=True,
        help_text='Last time the reminder was sent'
    )

    class Meta:
        ordering = ['-date']
        permissions = (
            ('admin_menu', 'Admin Menus'),
        )

    @property
    def pdate(self):
        return pendulum.parse(str(self.date))

    def __str__(self):
        return self.pdate.format("L")


class EmployeeOrder(ModelBase):
    menu = models.ForeignKey(
        Menu,
        on_delete=models.CASCADE,
        verbose_name='Menu',
        related_name='orders'
    )
    full_name = models.CharField(
        "Full name",
        max_length=50
    )
    email = models.EmailField("Email")
    observations = models.TextField(
        "Observations",
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.full_name} - {self.email}"


class DishOrderManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().select_related(
            'dish'
        )


# This model it was created thinking in scalability, to allow employee order multiple dishes
class DishOrder(ModelBase):
    employee_order = models.ForeignKey(
        EmployeeOrder,
        on_delete=models.CASCADE,
        verbose_name='Employee order',
        related_name='dishes'
    )
    dish = models.ForeignKey(
        Dish,
        on_delete=models.PROTECT,
        verbose_name='Dish',
        related_name='dish_orders'
    )
    quantity = models.PositiveSmallIntegerField(
        "Quantity",
        default=1
    )

    objects = DishOrderManager()

    def __str__(self):
        return self.dish.name
