import django_filters
from django_filters import rest_framework as filters

from cornerlunch.utils import get_query

from mealorders.models import (
    Dish, Menu, EmployeeOrder
)


class NumberInFilter(django_filters.BaseInFilter, django_filters.NumberFilter):
    pass


class DishFilter(filters.FilterSet):
    q = django_filters.CharFilter(method='q_filter', label='q')

    class Meta:
        model = Dish
        fields = ('q', )

    def q_filter(self, queryset, name, value):
        query = get_query(
            value,
            ["name", "description"]
        )

        return queryset.filter(query)


class MenuFilter(filters.FilterSet):
    dishes_in = NumberInFilter(field_name='dishes__pk', label='Dishes', lookup_expr='in')

    class Meta:
        models = Menu
        fields = ('date', 'dishes_in')


class EmployeeOrderFilter(filters.FilterSet):
    q = django_filters.CharFilter(method='q_filter', label='q')

    class Meta:
        model = EmployeeOrder
        fields = ('q', 'menu')

    def q_filter(self, queryset, name, value):
        query = get_query(
            value,
            ["full_name", "email"]
        )

        return queryset.filter(query)
