from rest_framework import serializers

from django.db.transaction import atomic

from mealorders.models import (
    SlackSetting, Dish, Menu, DishOrder, EmployeeOrder
)


class SlackSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SlackSetting
        fields = "__all__"


class DishSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dish
        fields = ('id', 'name', 'description')


class MenuSerializer(serializers.ModelSerializer):
    dishes_data = DishSerializer(source="dishes", many=True, read_only=True)

    class Meta:
        model = Menu
        fields = (
            'id', 'dishes', 'dishes_data', 'date', 'reminder_sent', 'last_reminder'
        )
        read_only_fields = ('last_reminder', )


class DishOrderSerializer(serializers.ModelSerializer):
    dish_data = DishSerializer(source="dish", read_only=True)

    class Meta:
        model = DishOrder
        fields = ('id', 'dish', 'dish_data', 'quantity')


class EmployeeOrderSerializer(serializers.ModelSerializer):
    dishes = DishOrderSerializer(many=True)

    class Meta:
        model = EmployeeOrder
        fields = (
            'id', 'menu', 'full_name', 'email', 'observations', 'dishes'
        )

    @atomic
    def create(self, validated_data):
        dishes_data = validated_data.pop('dishes')
        employee_order = EmployeeOrder.objects.create(**validated_data)
        dishes = list()
        for dish in dishes_data:
            dishes.append(DishOrder(employee_order=employee_order, **dish))

        if dishes:
            DishOrder.objects.bulk_create(dishes)

        return employee_order
