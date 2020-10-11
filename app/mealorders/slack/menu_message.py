import pendulum
from cornerlunch.settings import ORDER_LIMIT_HOUR


class MenuMessage:
    HEAD_BLOCK = {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": (
                "Saludo! :wave::skin-tone-4:. Dejo el menú de hoy :takeout_box:\n\n"
                "Recuerden que tienen hasta las *%(hora)s* para realizar su pedido"
            ) % {
                "hora": pendulum.now().at(int(ORDER_LIMIT_HOUR), 0, 0).format("LT")
            }
        }
    }

    DIVIDER_BLOCK = {"type": "divider"}

    def __init__(self, menu, channel, *args, **kwargs):
        self.menu = menu
        self.channel = channel
        self.timestamp = ""

    def get_message(self):
        blocks = [
            self.HEAD_BLOCK,
            self.DIVIDER_BLOCK,
        ]

        for dish in self.menu.dishes.all():
            blocks.append(self.dish_block(dish))
            blocks.append(self.DIVIDER_BLOCK)

        blocks.append(self.link_block())

        return {
            "ts": self.timestamp,
            "channel": self.channel,
            "blocks": blocks
        }

    def dish_block(self, dish):
        description = f"\n>{dish.description}" if dish.description else ""

        return {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*{dish.name}*{description}"
            }
        }

    def link_block(self):
        return {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*<https://nora.cornershop.io/menu/{self.menu.id}/|Ingresa aquí para realizar tu pedido>*"
            }
        }
