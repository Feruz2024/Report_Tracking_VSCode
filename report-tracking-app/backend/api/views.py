
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from django.contrib.auth.models import User
from .models import Client, Station, Campaign, MonitoringPeriod, MediaAnalystProfile, Assignment
from .serializers import (
    ClientSerializer, StationSerializer, CampaignSerializer,
    MonitoringPeriodSerializer, MediaAnalystProfileSerializer, AssignmentSerializer
)

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
