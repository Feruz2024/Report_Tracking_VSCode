import logging
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User, Group
from django.db.models import Q
from .models import Client, Station, Campaign, MonitoringPeriod, MediaAnalystProfile, Assignment, Notification, Message
from .serializers import (
    ClientSerializer, StationSerializer, CampaignSerializer,
    MonitoringPeriodSerializer, MediaAnalystProfileSerializer, AssignmentSerializer,
    NotificationSerializer, MessageSerializer, AccountantCampaignSummarySerializer
)
from .serializers_user import UserSerializer
from .permissions import IsAdminOrManagerForEntities, IsAccountant, CanInteractWithMessages

logger = logging.getLogger(__name__)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrManagerForEntities]  # Only Admins (is_superuser or 'Admins' group) can create users
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

    @action(detail=False, methods=['get'], url_path='threads')
    def threads(self, request):
        """
        Returns a list of message threads for the current user.
        Each thread is a unique (other user, context_id) pair.
        """
        user = request.user
        # Get all messages involving the user
        messages = Message.objects.filter(Q(sender=user) | Q(recipient=user))
        threads = {}
        for msg in messages:
            # Identify the other participant
            if msg.sender == user:
                other = msg.recipient
            else:
                other = msg.sender
            context_id = msg.context or 'dashboard'
            key = f"{other.id}:{context_id}"
            # Only keep the latest message per thread
            if key not in threads or msg.timestamp > threads[key]['lastTimestamp']:
                threads[key] = {
                    'id': key,
                    'recipientId': other.id,
                    'recipientName': other.username,
                    'contextId': context_id,
                    'title': other.username,
                    'lastTimestamp': msg.timestamp,
                }
        # Sort threads by last message timestamp descending
        thread_list = sorted(threads.values(), key=lambda t: t['lastTimestamp'], reverse=True)
        for t in thread_list:
            t.pop('lastTimestamp', None)
        return Response(thread_list)
    queryset = Message.objects.all().order_by('-timestamp') # Default ordering
    serializer_class = MessageSerializer
    permission_classes = [CanInteractWithMessages]

    def get_queryset(self):
        user = self.request.user
        
        context_id = self.request.query_params.get('context_id')
        user_messages_param = self.request.query_params.get('user_messages')
        participants_filter_param = self.request.query_params.get('participants_filter')
        view_type = self.request.query_params.get('view_type')

        # participants_filter is for fetching a specific thread between two users
        if participants_filter_param:
            try:
                id1_str, id2_str = participants_filter_param.split(',')
                p_id1 = int(id1_str)
                p_id2 = int(id2_str)
                
                # Security check: ensure the current user is part of the conversation or is staff/admin
                if not (user.id == p_id1 or user.id == p_id2 or user.is_staff):
                    return Message.objects.none() # Or raise PermissionDenied

                queryset = Message.objects.filter(
                    (Q(sender_id=p_id1) & Q(recipient_id=p_id2)) |
                    (Q(sender_id=p_id2) & Q(recipient_id=p_id1))
                )
                if context_id:
                    queryset = queryset.filter(context_id=context_id)
                return queryset.order_by('timestamp').distinct() # Ascending for threads
            except (ValueError, IndexError):
                return Message.objects.none() # Invalid format

        # user_messages is for fetching all messages involving a specific user (sender or recipient)
        if user_messages_param:
            try:
                user_id_for_filter = int(user_messages_param)
                # Security: ensure the requesting user is asking for their own messages,
                # unless they are an admin or have special permissions.
                if user_id_for_filter != user.id and not user.is_staff:
                    return Message.objects.none() # Or raise PermissionDenied

                queryset = Message.objects.filter(Q(sender_id=user_id_for_filter) | Q(recipient_id=user_id_for_filter))
                if context_id: # Apply context_id if provided
                    queryset = queryset.filter(context_id=context_id)
                # Uses default ViewSet ordering (-timestamp) or can be specified here
                return queryset.order_by('-timestamp').distinct() 
            except ValueError:
                return Message.objects.none() # Invalid user_id format

        # view_type=inbox: messages *to* the current user (legacy or specific use)
        if view_type == 'inbox':
            queryset = Message.objects.filter(recipient=user)
            if context_id:
                queryset = queryset.filter(context_id=context_id)
            return queryset.order_by('-timestamp').distinct()

        # Default behavior: Show messages involving the current user (sender or recipient)
        # This is the fallback if no other specific filters matched.
        queryset = Message.objects.filter(Q(sender=user) | Q(recipient=user))
        if context_id:
            queryset = queryset.filter(context_id=context_id)
        
        # Uses default ViewSet ordering (-timestamp)
        return queryset.distinct()

    def perform_create(self, serializer):
        # Automatically set the sender to the current user
        serializer.save(sender=self.request.user)

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    from .permissions import IsAdminOrManagerForEntities
    permission_classes = [IsAdminOrManagerForEntities]  # Admins and Managers can create/edit/delete; all can view

class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.all()
    serializer_class = StationSerializer
    from .permissions import IsAdminOrManagerForEntities
    permission_classes = [IsAdminOrManagerForEntities]  # Admins and Managers can create/edit/delete; all can view

class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
    permission_classes = [IsAdminOrManagerForEntities]  # Admins and Managers can create/edit/delete; all can view

class AccountantCampaignViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A read-only viewset for Accountants to see a summary of ACTIVE and CLOSED campaigns.
    """
    serializer_class = AccountantCampaignSummarySerializer
    permission_classes = [IsAccountant] # Only Accountants can access

    def get_queryset(self):
        # Filter for campaigns that are either ACTIVE or CLOSED
        return Campaign.objects.filter(Q(status='ACTIVE') | Q(status='CLOSED')).select_related('client').order_by('-created_at')

class MonitoringPeriodViewSet(viewsets.ModelViewSet):
    queryset = MonitoringPeriod.objects.all()
    serializer_class = MonitoringPeriodSerializer

class MediaAnalystProfileViewSet(viewsets.ModelViewSet):
    queryset = MediaAnalystProfile.objects.all()
    serializer_class = MediaAnalystProfileSerializer

    def create(self, request, *args, **kwargs):
        # Expecting {"username": ..., "password": ..."}
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
    from .permissions import IsAdminOrManagerForEntities
    permission_classes = [IsAdminOrManagerForEntities]  # Admins and Managers can create/edit/delete; all can view
    serializer_class = AssignmentSerializer
    # permission_classes = [permissions.IsAuthenticated] # Add appropriate permissions

    def get_queryset(self):
        user = self.request.user
        print(f"[AssignmentViewSet] User: {user.username} (ID: {user.id}), Staff: {user.is_staff}, Superuser: {user.is_superuser}")


        # Allow Admins and Managers (by group) to see all assignments
        if (
            user.is_staff or user.is_superuser or
            user.groups.filter(name='Admins').exists() or
            user.groups.filter(name='Managers').exists()
        ):
            print("[AssignmentViewSet] User is staff, superuser, admin, or manager. Querying all assignments.")
            all_assignments = Assignment.objects.all()
            print(f"[AssignmentViewSet] Found {all_assignments.count()} total assignments in DB via Assignment.objects.all().")
            return all_assignments.order_by('-assigned_at')

        # Check for analyst profile and role if user is not staff/superuser

        analyst_profile = getattr(user, 'analyst_profile', None)
        print(f"[AssignmentViewSet] analyst_profile: {analyst_profile}")

        if analyst_profile:
            print(f"[AssignmentViewSet] User {user.username} is an analyst. Querying their assignments.")
            user_assignments = Assignment.objects.filter(analyst=analyst_profile)
            print(f"[AssignmentViewSet] Found {user_assignments.count()} assignments for analyst {user.username}.")
            return user_assignments.order_by('-assigned_at')

        print(f"[AssignmentViewSet] User {user.username} is not staff, superuser, or designated analyst. Returning no assignments.")
        return Assignment.objects.none() # Or return all if that's desired for other roles

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

@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    role = request.data.get('role')  # No default, must be provided
    print(f"[REGISTER] Creating user: {username}, role received: {role}")

    if not username or not password:
        return Response({'error': 'Username and password required.'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)


    user = User.objects.create_user(username=username, password=password)
    actual_role = None

    # Assign user to the correct group (must be provided)
    if role:
        try:
            group = Group.objects.get(name=role)
            user.groups.add(group)
            actual_role = role
            print(f"[REGISTER] User {username} added to group: {role}")
        except Group.DoesNotExist:
            print(f"ERROR: {role} group not found during user registration.")
    else:
        print(f"[REGISTER] ERROR: No role provided for user {username}")
        return Response({'error': 'Role is required and must be one of: Analysts, Managers, Accountants.'}, status=status.HTTP_400_BAD_REQUEST)

    # The signal will create the correct profile based on group membership

    token, _ = Token.objects.get_or_create(user=user)

    # Normalize role for frontend UI
    normalized_role = None
    if user.is_superuser or user.groups.filter(name='Admins').exists():
        normalized_role = 'admin'
    elif user.groups.filter(name='Managers').exists():
        normalized_role = 'manager'
    elif user.groups.filter(name='Accountants').exists():
        normalized_role = 'accountant'
    elif user.groups.filter(name='Analysts').exists():
        normalized_role = 'analyst'
    else:
        normalized_role = 'analyst'  # fallback

    return Response({'token': token.key, 'username': user.username, 'role': normalized_role}, status=status.HTTP_201_CREATED)

from rest_framework.authtoken.views import ObtainAuthToken
class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        # Normalize role for frontend UI
        if user.is_superuser or user.groups.filter(name='Admins').exists():
            role = 'admin'
        elif user.groups.filter(name='Managers').exists():
            role = 'manager'
        elif user.groups.filter(name='Accountants').exists():
            role = 'accountant'
        elif user.groups.filter(name='Analysts').exists():
            role = 'analyst'
        else:
            role = 'analyst'  # fallback
        return Response({'token': token.key, 'username': user.username, 'role': role, 'user_id': user.id})
