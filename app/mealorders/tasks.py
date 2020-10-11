import pendulum

from django.core.exceptions import ValidationError
from celery import shared_task
from slack import WebClient
from slack.errors import SlackApiError

from mealorders.slack.menu_message import MenuMessage
from mealorders.models import (
    SlackSetting, Menu
)


@shared_task(name='send_slack_reminder')
def send_slack_reminder(menu_id):
    date = pendulum.now().date()
    menu = Menu.objects.prefetch_related(
        'dishes'
    ).filter(
        id=menu_id, date=date
    ).first()

    if not menu:
        raise ValidationError(detail="No menu found for today")

    slack_setting = SlackSetting.objects.first()

    if not slack_setting:
        raise ValidationError(detail="No Slack setting found")

    mmessage = MenuMessage(menu, slack_setting.channel_id)
    message = mmessage.get_message()

    slack_client = WebClient(token=slack_setting.token)
    try:
        slack_client.chat_postMessage(**message)
    except SlackApiError as e:
        assert e.response["error"]
    finally:
        menu.reminder_sent = True
        menu.last_reminder = pendulum.now()
        menu.save()
