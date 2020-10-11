import pytest
import pendulum

from django.db import IntegrityError

from mealorders.models import (
    SlackSetting, Dish, Menu, EmployeeOrder, DishOrder
)


@pytest.mark.django_db
class TestModels:
    def test_slacksetting_model(self):
        token = "a96b4918-d45a-4b8e-85e4-7ba08dd24e65"
        channel_id = "C01234567"
        channel_name = "channelname"

        slack_setting = SlackSetting(
            token=token,
            channel_id=channel_id,
            channel_name=channel_name
        )
        slack_setting.save()

        assert slack_setting.token == token
        assert slack_setting.channel_id == channel_id
        assert slack_setting.channel_name == channel_name
        assert slack_setting.created
        assert slack_setting.updated
        assert str(slack_setting) == channel_name

    def test_dish_model(self):
        name = "Pastel de choclo"
        description = "Incluye Ensalada y Postre"
        dish = Dish(
            name=name,
            description=description
        )
        dish.save()

        assert dish.name == name
        assert dish.description == description
        assert dish.created
        assert dish.updated
        assert str(dish) == name

    def test_menu_model(self):
        dishes = Dish.objects.bulk_create([
            Dish(name="Plato A"),
            Dish(name="Plato B"),
            Dish(name="Plato C"),
            Dish(name="Plato D"),
        ])
        date = pendulum.now().date()

        menu = Menu(date=date)
        menu.save()
        menu.dishes.add(*dishes)

        assert menu.date == date
        assert menu.dishes.count() == 4
        assert not menu.reminder_sent
        assert menu.last_reminder is None
        assert menu.created
        assert menu.updated
        assert menu.pdate.date() == date
        assert str(menu) == date.format("L")

        with pytest.raises(IntegrityError):
            Menu.objects.create(date=date)

    def test_employeeorder_model(self):
        date = pendulum.now().date()
        menu = Menu.objects.create(date=date)
        full_name = "Danny Boscan"
        email = "dannyboscan@gmail.com"
        observations = "ninguna"

        employee_order = EmployeeOrder(
            menu=menu,
            full_name=full_name,
            email=email,
            observations=observations,
        )
        employee_order.save()

        assert employee_order.menu_id == menu.id
        assert employee_order.full_name == full_name
        assert employee_order.email == email
        assert employee_order.observations == observations
        assert employee_order.created
        assert employee_order.updated
        assert str(employee_order) == f"{full_name} - {email}"

    def test_dishorder_model(self):
        date = pendulum.now().date()
        dish = Dish.objects.create(name="Plato A")
        menu = Menu.objects.create(date=date)
        menu.dishes.add(dish)
        employee_order = EmployeeOrder.objects.create(
            menu=menu,
            full_name="Danny Boscan",
            email="dannyboscan@gmail.com",
            observations="ninguna"
        )

        dish_order = DishOrder(
            employee_order=employee_order,
            dish=dish
        )
        dish_order.save()

        assert dish_order.employee_order_id == employee_order.id
        assert dish_order.dish_id == dish.id
        assert dish_order.quantity == 1
        assert str(dish_order) == dish.name
