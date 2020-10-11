import pytest
import pendulum

from mealorders.models import (
    Dish, Menu
)
from mealorders.serializers import (
    SlackSettingSerializer,
    DishSerializer,
    MenuSerializer,
    DishOrderSerializer,
    EmployeeOrderSerializer
)


def test_slacksetting_serializer():
    valid_data = {
        "token": "a96b4918-d45a-4b8e-85e4-7ba08dd24e65",
        "channel_id": "C01234567",
        "channel_name": "channelname"
    }

    serializer = SlackSettingSerializer(data=valid_data)
    assert serializer.is_valid()
    assert serializer.validated_data == valid_data
    assert serializer.data == valid_data
    assert serializer.errors == {}


def test_dish_serializer():
    valid_data = {
        "name": "Pastel de choclo",
        "description": "Incluye Ensalada y Postre"
    }

    serializer = DishSerializer(data=valid_data)
    assert serializer.is_valid()
    assert serializer.validated_data == valid_data
    assert serializer.data == valid_data
    assert serializer.errors == {}


@pytest.mark.django_db
def test_menu_serializer():
    date = pendulum.now().date()
    dish = Dish.objects.create(name="Plato A")
    valid_data = {
        "date": date,
        "reminder_sent": True,
        "dishes": [dish.pk]
    }

    serializer = MenuSerializer(data=valid_data)
    assert serializer.is_valid()
    assert serializer.errors == {}


@pytest.mark.django_db
def test_dishorder_serializer():
    dish = Dish.objects.create(name="Plato B")
    valid_data = {
        "dish": dish.pk
    }

    serializer = DishOrderSerializer(data=valid_data)
    assert serializer.is_valid()
    assert serializer.errors == {}


@pytest.mark.django_db
def test_employeeorder_serializer():
    date = pendulum.now().date()
    dish = Dish.objects.create(name="Plato C")
    menu = Menu.objects.create(date=date)
    menu.dishes.add(dish)

    valid_data = {
        "menu": menu.id,
        "full_name": "Danny Boscan",
        "email": "dannyboscan@gmail.com",
        "observations": "Sin tomate por favor",
        "dishes": [{"dish": dish.pk, "quantity": 1}]
    }

    serializer = EmployeeOrderSerializer(data=valid_data)
    assert serializer.is_valid()
    assert serializer.errors == {}
