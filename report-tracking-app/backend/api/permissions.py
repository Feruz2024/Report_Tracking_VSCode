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
