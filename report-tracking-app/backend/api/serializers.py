from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Client, Station, Campaign, MonitoringPeriod, MediaAnalystProfile, Assignment

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = '__all__'

class CampaignSerializer(serializers.ModelSerializer):
    stations = serializers.PrimaryKeyRelatedField(queryset=Station.objects.all(), many=True, required=False)
    stations = serializers.PrimaryKeyRelatedField(queryset=Station.objects.all(), many=True)
    class Meta:
        model = Campaign
        fields = '__all__'

class MonitoringPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonitoringPeriod
        fields = '__all__'

class MediaAnalystProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    class Meta:
        model = MediaAnalystProfile
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'

    def validate(self, data):
        planned = data.get('planned_spots')
        missed = data.get('missed_spots')
        transmitted = data.get('transmitted_spots')
        if planned is not None and missed is not None and transmitted is not None:
            if planned != missed + transmitted:
                raise serializers.ValidationError("Planned spots must equal missed spots + transmitted spots.")
        return data
