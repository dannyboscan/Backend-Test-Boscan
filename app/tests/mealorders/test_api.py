import pytest

from django.urls import reverse

from mealorders.models import (
    SlackSetting
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


def get_single_slacksetting_incorrect_id(admin_client):
    res = admin_client.get(
        reverse("mealorders:api_slack_setting-detail", kwargs={'pk': 0})
    )
    assert res.status_code == 404
