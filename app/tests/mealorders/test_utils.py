import pytest
import pendulum
from mealorders.models import (
    Dish, Menu
)
from mealorders.slack.menu_message import MenuMessage


@pytest.mark.django_db
def test_slack_menu_message():
    dishes = Dish.objects.bulk_create([
        Dish(name="Pastel de choclo, Ensalada y Postre"),
        Dish(name="Arroz con nugget de pollo, Ensalada y Postre"),
        Dish(name="Arroz con hamburguesa, Ensalada y Postre"),
        Dish(name="Ensalada premium de pollo y Postre"),
    ])
    menu = Menu.objects.create(date=pendulum.now().date())
    menu.dishes.add(*dishes)
    channel = "#general"
    mmessage = MenuMessage(menu, channel)
    message = mmessage.get_message()

    assert message['channel'] == channel
    assert len(message['blocks']) > menu.dishes.count()
