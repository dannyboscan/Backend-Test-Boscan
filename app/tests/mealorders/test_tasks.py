import pytest
import pendulum
import uuid
from django.core.exceptions import ValidationError
from mealorders.models import (
    Menu, SlackSetting
)
from mealorders.tasks import send_slack_reminder


@pytest.mark.django_db
def test_send_slack_reminder_invalid_menu():
    with pytest.raises(ValidationError) as error:
        send_slack_reminder(str(uuid.uuid4()))

    assert "No menu" in str(error.value)


@pytest.mark.django_db
def test_send_slack_reminder_invalid_setting():
    menu = Menu.objects.create(date=pendulum.now().date())

    with pytest.raises(ValidationError) as error:
        send_slack_reminder(menu.id)

    assert "No Slack setting" in str(error.value)


@pytest.mark.django_db
def test_send_slack_reminder_invilid_token():
    channel_id = "#general"
    SlackSetting.objects.create(
        token="a96b4918-d45a-4b8e-85e4-7ba08dd24e65",
        channel_id=channel_id,
        channel_name=channel_id
    )
    menu = Menu.objects.create(date=pendulum.now().date())

    assert send_slack_reminder(menu.id) is None
