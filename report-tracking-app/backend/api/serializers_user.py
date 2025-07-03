from rest_framework import serializers
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()


    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_superuser', 'is_active', 'full_name', 'role']

    def get_full_name(self, obj):
        # Use get_full_name() if available, else combine first_name and last_name, else fallback to username
        if hasattr(obj, 'get_full_name'):
            name = obj.get_full_name()
            if name:
                return name
        if obj.first_name or obj.last_name:
            return f"{obj.first_name} {obj.last_name}".strip()
        return obj.username

    def get_role(self, obj):
        # Return the user's primary group name, or 'admin' if superuser, or 'unknown'
        if obj.is_superuser:
            return 'admin'
        groups = obj.groups.values_list('name', flat=True)
        if groups:
            # Return the first group (or join if you want all)
            return groups[0]
        return 'unknown'
