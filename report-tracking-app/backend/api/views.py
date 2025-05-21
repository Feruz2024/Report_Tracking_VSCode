
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from django.contrib.auth.models import User
from django.db.models import Q
from .models import Client, Station, Campaign, MonitoringPeriod, MediaAnalystProfile, Assignment, Notification, Message
from .serializers import (
    ClientSerializer, StationSerializer, CampaignSerializer,
    MonitoringPeriodSerializer, MediaAnalystProfileSerializer, AssignmentSerializer,
    NotificationSerializer, MessageSerializer
)
class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(user=user).order_by('-timestamp')
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read for the current user."""
        Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({'marked_all_read': True}, status=200)

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def get_queryset(self):
        user = self.request.user
        # Filter to messages where user is sender or recipient
        qs = Message.objects.filter(Q(sender=user) | Q(recipient=user))
        # Optionally filter by context query param
        context = self.request.query_params.get('context')
        if context:
            qs = qs.filter(context=context)
        return qs.order_by('-timestamp')
    def perform_create(self, serializer):
        # Automatically set the sender to the current user
        serializer.save(sender=self.request.user)

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.all()
    serializer_class = StationSerializer

class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer

class MonitoringPeriodViewSet(viewsets.ModelViewSet):
    queryset = MonitoringPeriod.objects.all()
    serializer_class = MonitoringPeriodSerializer

class MediaAnalystProfileViewSet(viewsets.ModelViewSet):
    queryset = MediaAnalystProfile.objects.all()
    serializer_class = MediaAnalystProfileSerializer

    def create(self, request, *args, **kwargs):
        # Expecting {"username": ..., "password": ...}
        username = request.data.get("username")
        password = request.data.get("password")
        if not username or not password:
            return Response({"error": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=username, password=password)
        analyst = MediaAnalystProfile.objects.create(user=user)
        serializer = self.get_serializer(analyst)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer

    @action(detail=False, methods=["post"], url_path="bulk_create")
    def bulk_create(self, request):
        """
        Create multiple assignments for one analyst/campaign, each for a different station.
        Expects: {campaign, analyst, stations: [id, ...], due_date, memo}
        """
        campaign = request.data.get("campaign")
        analyst = request.data.get("analyst")
        stations = request.data.get("stations", [])
        due_date = request.data.get("due_date")
        memo = request.data.get("memo", "")
        if not (campaign and analyst and stations and isinstance(stations, list)):
            return Response({"error": "campaign, analyst, and stations[] required"}, status=400)
        created = []
        errors = []
        for st_id in stations:
            data = {
                "campaign": campaign,
                "analyst": analyst,
                "station": st_id,
                "due_date": due_date,
                "memo": memo,
            }
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                serializer.save()
                created.append(serializer.data)
            else:
                errors.append({"station": st_id, "errors": serializer.errors})
        if errors:
            return Response({"created": created, "errors": errors}, status=207)
        return Response(created, status=201)
