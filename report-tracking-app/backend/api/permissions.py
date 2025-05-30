from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrManagerForEntities(BasePermission):
    """
    Allow Admins and Managers to create/edit/delete clients, campaigns, stations, assignments.
    Only Admins can create users.
    All authenticated users can view (SAFE_METHODS).
    """
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        # Allow safe methods for all authenticated users
        if request.method in SAFE_METHODS:
            return True
        # For user creation, only Admins (is_superuser or in 'Admins' group)
        if hasattr(view, 'basename') and view.basename == 'user':
            return user.is_superuser or user.groups.filter(name='Admins').exists()
        # For clients, campaigns, stations, assignments: Admins or Managers
        if hasattr(view, 'basename') and view.basename in ['client', 'campaign', 'station', 'assignment']:
            return (
                user.is_superuser or
                user.groups.filter(name='Admins').exists() or
                user.groups.filter(name='Managers').exists()
            )
        return False


class IsAccountant(BasePermission):
    """
    Custom permission to only allow users in the 'Accountants' group.
    """
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and user.groups.filter(name='Accountants').exists()

class CanInteractWithMessages(BasePermission):
    """
    Custom permission to only allow authenticated users to interact with messages.
    The view's get_queryset method should handle filtering messages
    to only those involving the user.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


# --- Custom permission for assignment PATCH by analyst ---
class CanUpdateOwnAssignmentOrAdminManager(BasePermission):
    """
    Allow PATCH/PUT for assigned analyst on their own assignment.
    Allow full access for Admins/Managers.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        # Admins/Managers always allowed
        if user.is_superuser or user.groups.filter(name__in=["Admins", "Managers"]).exists():
            return True
        # PATCH/PUT allowed for assigned analyst
        if request.method in ["PATCH", "PUT"]:
            analyst_profile = getattr(user, "analyst_profile", None)
            return analyst_profile and obj.analyst_id == analyst_profile.id
        # SAFE_METHODS (GET, HEAD, OPTIONS) allowed for authenticated
        if request.method in SAFE_METHODS:
            return user.is_authenticated
        return False
