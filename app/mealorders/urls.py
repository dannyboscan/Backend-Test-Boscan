from django.urls import path, include

from mealorders import api

from rest_framework.routers import DefaultRouter, SimpleRouter
from cornerlunch.settings import DEBUG

if DEBUG:
    router = DefaultRouter()
else:
    router = SimpleRouter()

app_name = "melaorders"

router.register(r'slack-seting', api.SlackSettingViewSet, 'api_slack_setting')
router.register(r'dishes', api.DishViewSet, 'api_dishes')
router.register(r'menus', api.MenuViewSet, 'api_menus')
router.register(r'orders', api.EmployeeOrderViewSet, 'api_orders')
router.register(r'menu-order', api.MenuReadOnlyViewSet, 'api_menu_order')
router.register(r'employee-order', api.EmployeeMenuOrderViewSet, 'api_employee_order')

urlpatterns = [
    path('api/', include(router.urls)),
]
