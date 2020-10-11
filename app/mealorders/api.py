import pendulum

from cornerlunch.settings import DEBUG
from rest_framework import viewsets, mixins
from rest_framework.permissions import DjangoModelPermissions, AllowAny
from rest_framework.exceptions import ValidationError

from cornerlunch.settings import ORDER_LIMIT_HOUR

from mealorders.filters import (
    DishFilter, MenuFilter, EmployeeOrderFilter
)
from mealorders.models import (
    SlackSetting, Dish, Menu, EmployeeOrder
)
from mealorders.serializers import (
    SlackSettingSerializer, DishSerializer, MenuSerializer,
    EmployeeOrderSerializer
)


class BaseDjangoModelPermissions(DjangoModelPermissions):
    perms_map = {
        'GET': ['%(app_label)s.view_%(model_name)s', '%(app_label)s.admin_%(model_name)s'],
        'OPTIONS': [],
        'HEAD': [],
        'POST': ['%(app_label)s.add_%(model_name)s', '%(app_label)s.admin_%(model_name)s'],
        'PUT': ['%(app_label)s.change_%(model_name)s', '%(app_label)s.admin_%(model_name)s'],
        'PATCH': ['%(app_label)s.change_%(model_name)s', '%(app_label)s.admin_%(model_name)s'],
        'DELETE': ['%(app_label)s.delete_%(model_name)s', '%(app_label)s.admin_%(model_name)s'],
    }

    def has_permission(self, request, view):
        if getattr(view, '_ignore_model_permissions', False):
            return True

        if not request.user or (
           not request.user.is_authenticated and self.authenticated_users_only):
            return False

        queryset = self._queryset(view)
        perms = self.get_required_permissions(request.method, queryset.model)

        return any(request.user.has_perm(perm) for perm in perms)


class SlackSettingViewSet(viewsets.ModelViewSet):
    serializer_class = SlackSettingSerializer
    permission_classes = (BaseDjangoModelPermissions, )
    queryset = SlackSetting.objects.all()


class DishViewSet(viewsets.ModelViewSet):
    serializer_class = DishSerializer
    permission_classes = (BaseDjangoModelPermissions, )
    queryset = Dish.objects.all()
    filterset_class = DishFilter


class MenuViewSet(viewsets.ModelViewSet):
    serializer_class = MenuSerializer
    permission_classes = (BaseDjangoModelPermissions, )
    filterset_class = MenuFilter

    def get_queryset(self):
        queryset = Menu.objects.prefetch_related(
            'dishes'
        ).all()

        return queryset


class EmployeeOrderViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeOrderSerializer
    filterset_class = EmployeeOrderFilter

    def get_queryset(self):
        queryset = EmployeeOrder.objects.select_related(
            'menu'
        ).prefetch_related(
            'dishes__dish'
        ).all()

        return queryset


class MenuReadOnlyViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = MenuSerializer
    permission_classes = (AllowAny, )
    queryset = Menu.objects.prefetch_related('dishes').all()


class EmployeeMenuOrderViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = EmployeeOrderSerializer
    permission_classes = (AllowAny, )
    queryset = EmployeeOrder.objects.select_related('menu').prefetch_related('dishes').all()

    def perform_create(self, serializer):
        if DEBUG:
            serializer.save()
        else:
            menu = serializer.validated_data.get('menu')

            limit_datetime = pendulum.now().at(int(ORDER_LIMIT_HOUR), 0, 0)
            if menu.pdate == limit_datetime.date() and pendulum.now() <= limit_datetime:
                serializer.save()
            else:
                raise ValidationError(detail="Orders are not accepted after 11:00")
