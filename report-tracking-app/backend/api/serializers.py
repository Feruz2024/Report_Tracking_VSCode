from rest_framework import serializers
from .models import Notification, Message
from django.contrib.auth.models import User
from .models import Client, Station, Campaign, MonitoringPeriod, MediaAnalystProfile, Assignment

# --- Notification Serializer ---
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'link', 'read', 'timestamp', 'deadline_date']
        read_only_fields = ['id', 'timestamp']

# --- Message Serializer ---
class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SlugRelatedField(slug_field='username', read_only=True) # Display username for sender
    sender_id = serializers.IntegerField(source='sender.id', read_only=True) # Added sender_id
    recipient = serializers.PrimaryKeyRelatedField(queryset=User.objects.all()) # Expect recipient ID on write
    # recipient_username = serializers.SlugRelatedField(source='recipient.username', slug_field='username', read_only=True) # Optional: if you need recipient username on read

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_id', 'recipient', 'context', 'content', 'timestamp'] # Added sender_id to fields
        read_only_fields = ['id', 'timestamp', 'sender', 'sender_id'] # Sender and sender_id are set by the backend or derived

    def create(self, validated_data):
        # Sender is set in the view's perform_create method
        return Message.objects.create(**validated_data)

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = '__all__'

class CampaignSerializer(serializers.ModelSerializer):
    stations = serializers.PrimaryKeyRelatedField(queryset=Station.objects.all(), many=True, required=False) # Made not required by default
    client_name = serializers.CharField(source='client.name', read_only=True)

    class Meta:
        model = Campaign
        fields = ['id', 'client', 'client_name', 'name', 'description', 'stations', 'created_at', 'status']

class AccountantCampaignSummarySerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    anticipated_campaign_completion_date = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = ['id', 'name', 'client_name', 'status', 'created_at', 'anticipated_campaign_completion_date']

    def get_anticipated_campaign_completion_date(self, obj):
        latest_monitoring_period = MonitoringPeriod.objects.filter(campaign=obj).order_by('-authentication_end').first()
        if latest_monitoring_period:
            return latest_monitoring_period.authentication_end
        return None

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
    analyst_user = serializers.SerializerMethodField()

    def get_analyst_user(self, obj):
        if obj.analyst and obj.analyst.user:
            return obj.analyst.user.username
        return None

    class Meta:
        model = Assignment
        fields = '__all__'
        extra_fields = ['analyst_user']

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['analyst_user'] = self.get_analyst_user(instance)
        return rep

    def validate(self, data):
        planned = data.get('planned_spots')
        missed = data.get('missed_spots')
        transmitted = data.get('transmitted_spots')
        if planned is not None and missed is not None and transmitted is not None:
            if planned != missed + transmitted:
                raise serializers.ValidationError("Planned spots must equal missed spots + transmitted spots.")
        return data
