import uuid
import json
import pendulum
import pytest
from django.urls import reverse
from django.core import serializers
from mealorders.models import (
    SlackSetting, Dish, Menu, EmployeeOrder, DishOrder
)


def test_add_slacksetting(admin_client):
    assert not SlackSetting.objects.exists()

    channel_id = "C01234567"

    res = admin_client.post(
        reverse("mealorders:api_slack_setting-list"),
        {
            "token": "a96b4918-d45a-4b8e-85e4-7ba08dd24e65",
            "channel_id": channel_id,
            "channel_name": "channelname"
        },
        content_type="application/json"
    )

    assert res.status_code == 201
    assert res.data["channel_id"] == channel_id
    assert SlackSetting.objects.exists()


def test_add_slacksetting_invalid_json(admin_client):
    assert not SlackSetting.objects.exists()

    res = admin_client.post(
        reverse("mealorders:api_slack_setting-list"),
        {},
        content_type="application/json"
    )

    assert res.status_code == 400
    assert not SlackSetting.objects.exists()


def test_get_single_salcksetting(admin_client):
    token = "a96b4918-d45a-4b8e-85e4-7ba08dd24e65"
    channel_id = "C01234567"
    channel_name = "channelname"

    slack_setting = SlackSetting.objects.create(
        token=token,
        channel_id=channel_id,
        channel_name=channel_name
    )

    res = admin_client.get(
        reverse("mealorders:api_slack_setting-detail", kwargs={'pk': slack_setting.pk})
    )

    assert res.status_code == 200
    assert res.data["token"] == token


def test_get_slack_setting_unauthorized(client, django_user_model):
    username = "username"
    password = "password"
    django_user_model.objects.create_user(username=username, password=password)
    client.login(username=username, password=password)
    res = client.get(
        reverse("mealorders:api_slack_setting-list")
    )

    assert res.status_code == 403


def test_get_channels(admin_client):
    res = admin_client.post(
        reverse("mealorders:api_slack_setting-channels"),
        {"token": "xoxb-1420668090691-1405724482855-RWdZwDjjmD22pFIfSgr4a3ma"}
    )

    assert res.status_code == 200
    assert res.data["ok"]


def test_get_channels_no_token(admin_client):
    res = admin_client.post(
        reverse("mealorders:api_slack_setting-channels")
    )

    assert res.status_code == 400


def test_get_channels_unauthorized(client, django_user_model):
    username = "username"
    password = "password"
    django_user_model.objects.create_user(username=username, password=password)
    client.login(username=username, password=password)
    res = client.post(
        reverse("mealorders:api_slack_setting-channels")
    )

    assert res.status_code == 403


def test_get_channels_invalid_token(admin_client):
    res = admin_client.post(
        reverse("mealorders:api_slack_setting-channels"),
        {"token": str(uuid.uuid4())}
    )

    print(res.data)
    assert res.status_code == 200
    assert not res.data["ok"]
    assert res.data["error"] == "invalid_auth"


def test_get_single_slacksetting_incorrect_id(admin_client):
    res = admin_client.get(
        reverse("mealorders:api_slack_setting-detail", kwargs={'pk': 0})
    )
    assert res.status_code == 404


def test_get_all_slacksetting(admin_client):
    res = admin_client.get(
        reverse("mealorders:api_slack_setting-list",)
    )
    assert res.status_code == 200


def test_get_all_dishes(admin_client):
    res = admin_client.get(
        reverse("mealorders:api_dishes-list")
    )
    assert res.status_code == 200


def test_delete_dish(admin_client):
    dish = Dish.objects.create(name="Pastel de choclo, Ensalada y Postre")
    res = admin_client.delete(
        reverse("mealorders:api_dishes-detail", kwargs={"pk": dish.pk})
    )

    assert res.status_code == 204
    assert not Dish.objects.filter(pk=dish.pk).exists()


def test_delete_dish_protected(admin_client):
    dish = Dish.objects.create(name="Pastel de choclo, Ensalada y Postre")
    menu = Menu.objects.create(date=pendulum.now().date())
    menu.dishes.add(dish)

    employee_order = EmployeeOrder.objects.create(
        menu=menu,
        full_name="Danny Boscan",
        email="dannyboscan@gmail.com"
    )
    DishOrder.objects.create(
        employee_order=employee_order,
        dish=dish
    )

    res = admin_client.delete(
        reverse("mealorders:api_dishes-detail", kwargs={"pk": dish.pk})
    )

    assert res.status_code == 400


def test_get_filtered_dishes(admin_client):
    Dish.objects.bulk_create([
        Dish(name="Pastel de choclo, Ensalada y Postre"),
        Dish(name="Arroz con nugget de pollo, Ensalada y Postre"),
        Dish(name="Arroz con hamburguesa, Ensalada y Postre"),
        Dish(name="Ensalada premium de pollo y Postre"),
    ])

    res = admin_client.get(
        f"{reverse('mealorders:api_dishes-list',)}?q=arroz con"
    )
    assert res.status_code == 200
    assert res.data['count'] == 2


def test_get_all_menu(admin_client):
    res = admin_client.get(
        reverse("mealorders:api_menus-list",)
    )
    assert res.status_code == 200


def test_create_menu(admin_client):
    dishes = Dish.objects.bulk_create([
        Dish(name="Pastel de choclo, Ensalada y Postre"),
        Dish(name="Arroz con nugget de pollo, Ensalada y Postre"),
        Dish(name="Arroz con hamburguesa, Ensalada y Postre"),
        Dish(name="Ensalada premium de pollo y Postre"),
    ])

    res = admin_client.post(
        reverse("mealorders:api_menus-list"),
        {
            "dishes": [d.id for d in dishes],
            "date": pendulum.now().subtract(days=1).format("YYYY-MM-DD"),
            "reminder_sent": True
        }
    )

    assert res.status_code == 201
    assert len(res.data['dishes']) == len(dishes)
    assert not res.data['reminder_sent']


def test_menu_send_reminder_unauthorized(client, django_user_model):
    username = "username"
    password = "password"
    django_user_model.objects.create_user(username=username, password=password)
    client.login(username=username, password=password)
    res = client.post(
        reverse("mealorders:api_menus-send-reminder", kwargs={"pk": str(uuid.uuid4)})
    )

    assert res.status_code == 403


def test_menu_send_reminder(admin_client):
    menu = Menu.objects.create(date=pendulum.now().date())

    res = admin_client.post(
        reverse("mealorders:api_menus-send-reminder", kwargs={"pk": menu.id})
    )

    assert res.status_code == 200
    assert res.data["ok"]


def test_menu_send_reminder_invalid(admin_client):
    menu = Menu.objects.create(date=pendulum.now().add(days=1).date())

    res = admin_client.post(
        reverse("mealorders:api_menus-send-reminder", kwargs={"pk": menu.id})
    )

    assert res.status_code == 200
    assert not res.data["ok"]


def test_get_all_menuorder(admin_client):
    res = admin_client.get(
        reverse("mealorders:api_orders-list",)
    )
    assert res.status_code == 200


@pytest.mark.django_db
def test_place_order(client):
    assert not EmployeeOrder.objects.exists()

    dishes = Dish.objects.bulk_create([
        Dish(name="Arroz con nugget de pollo, Ensalada y Postre"),
        Dish(name="Arroz con hamburguesa, Ensalada y Postre"),
    ])

    menu = Menu.objects.create(date=pendulum.now().date())
    menu.dishes.add(*dishes)

    res = client.post(
        reverse("mealorders:api_employee_order-list"),
        json.dumps({
            "menu": menu.id,
            "full_name": "nombre",
            "email": "correo@example.com",
            "dishes": [{
                "dish": dishes[0].id,
                "quantity": 1
            }]
        }, cls=serializers.json.DjangoJSONEncoder),
        content_type='application/json'
    )

    assert res.status_code == 201
    assert EmployeeOrder.objects.exists()
