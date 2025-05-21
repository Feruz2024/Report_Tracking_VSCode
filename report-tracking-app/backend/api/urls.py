from rest_framework.routers import DefaultRouter
from .views import (
    ClientViewSet, StationViewSet, CampaignViewSet,
    MonitoringPeriodViewSet, MediaAnalystProfileViewSet, AssignmentViewSet,
    NotificationViewSet, MessageViewSet
)


router = DefaultRouter()
router.register(r'clients', ClientViewSet)
router.register(r'stations', StationViewSet)
router.register(r'campaigns', CampaignViewSet)
router.register(r'monitoring-periods', MonitoringPeriodViewSet)
router.register(r'analysts', MediaAnalystProfileViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = router.urls
