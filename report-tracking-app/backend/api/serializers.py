from rest_framework import serializers
from .models import Notification, Message

# --- Notification Serializer ---
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'link', 'read', 'timestamp', 'deadline_date']
        read_only_fields = ['id', 'timestamp']

# --- Message Serializer ---
class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'context', 'content', 'timestamp']
        read_only_fields = ['id', 'timestamp']
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
    # Expose both username and user ID for frontend recipient selection
    user = serializers.StringRelatedField()
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    class Meta:
        model = MediaAnalystProfile
        # Include model PK, username, and user_id
        fields = ['id', 'user', 'user_id']

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
