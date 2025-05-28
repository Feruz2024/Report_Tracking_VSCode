from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    ClientViewSet,
    StationViewSet,
    CampaignViewSet,
    MonitoringPeriodViewSet,
    MediaAnalystProfileViewSet,
    AssignmentViewSet,
    NotificationViewSet,
    MessageViewSet,
    register,
    CustomAuthToken,
    AccountantCampaignViewSet, # Added AccountantCampaignViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'stations', StationViewSet, basename='station')
router.register(r'campaigns', CampaignViewSet, basename='campaign')
router.register(r'monitoring-periods', MonitoringPeriodViewSet)
router.register(r'analysts', MediaAnalystProfileViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'accountant-campaigns', AccountantCampaignViewSet, basename='accountant-campaign') # Added accountant-campaigns route

from django.urls import path

urlpatterns = [
    path('register/', register, name='api_register'),
    path('auth/token/', CustomAuthToken.as_view(), name='api_token_auth'),
]
urlpatterns += router.urls
