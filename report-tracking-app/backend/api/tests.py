from django.test import TestCase
from django.utils import timezone
from datetime import timedelta

from django.contrib.auth.models import User
from .models import Assignment, Notification, Campaign, MediaAnalystProfile, Client

from rest_framework.test import APIClient


class AssignmentNotificationTests(TestCase):
    def setUp(self):
        # Create manager and analyst users
        self.manager = User.objects.create_user(username='mgr', password='pass', is_staff=True)
        self.analyst_user = User.objects.create_user(username='analyst', password='pass')
        # Create analyst profile
        self.analyst = MediaAnalystProfile.objects.create(user=self.analyst_user)
        # Create a client and campaign
        self.client_obj = Client.objects.create(name='TestClient')
        self.campaign = Campaign.objects.create(name='TestCamp', client=self.client_obj)

    def test_new_assignment_notification(self):
        # Create assignment with future due_date
        due = timezone.now().date() + timedelta(days=2)
        a = Assignment.objects.create(
            campaign=self.campaign,
            analyst=self.analyst,
            due_date=due
        )
        # Analyst should have a 'New assignment' notification
        notes = Notification.objects.filter(user=self.analyst_user)
        self.assertTrue(notes.exists())
        self.assertIn('New assignment', notes.first().message)

    def test_status_change_notifications(self):
        # Create assignment
        a = Assignment.objects.create(
            campaign=self.campaign,
            analyst=self.analyst,
            due_date=timezone.now().date() + timedelta(days=1)
        )
        # Clear initial notifications
        Notification.objects.all().delete()
        # Submit assignment
        a.status = 'SUBMITTED'
        a.save()
        # Manager should be notified
        mgr_notes = Notification.objects.filter(user=self.manager)
        self.assertTrue(mgr_notes.filter(message__icontains='submitted').exists())
        # Clear
        Notification.objects.all().delete()
        # Approve assignment
        a.status = 'APPROVED'
        a.save()
        # Analyst should be notified of approval
        appr_notes = Notification.objects.filter(user=self.analyst_user)
        self.assertTrue(appr_notes.filter(message__icontains='approved').exists())

    def test_rejected_and_overdue_notifications(self):
        # Create overdue assignment
        past = timezone.now().date() - timedelta(days=1)
        a = Assignment.objects.create(
            campaign=self.campaign,
            analyst=self.analyst,
            due_date=past
        )
        # Analyst should receive overdue notice
        overdue = Notification.objects.filter(user=self.analyst_user, message__icontains='overdue')
        self.assertTrue(overdue.exists())
        # Clear
        Notification.objects.all().delete()
        # Reject assignment
        a.status = 'REJECTED'
        a.save()
        # Analyst should be notified of rejection
        rej = Notification.objects.filter(user=self.analyst_user, message__icontains='rejected')
        self.assertTrue(rej.exists())
        
class AssignmentManagerCommentTests(TestCase):
    """Test that manager_comment can be set via PATCH on AssignmentViewSet"""
    def setUp(self):
        # Create analyst and assignment
        self.analyst_user = User.objects.create_user(username='analyst2', password='pass')
        self.analyst = MediaAnalystProfile.objects.create(user=self.analyst_user)
        self.client_user = User.objects.create_user(username='manager2', password='pass')
        # Create client and campaign
        self.client_obj = Client.objects.create(name='ClientX')
        self.campaign = Campaign.objects.create(name='CampX', client=self.client_obj)
        # Create assignment
        self.assignment = Assignment.objects.create(
            campaign=self.campaign,
            analyst=self.analyst
        )
        self.api_client = APIClient()
        # Authenticate as manager to allow PATCH
        self.api_client.force_authenticate(user=self.client_user)

    def test_patch_manager_comment(self):
        url = f"/api/assignments/{self.assignment.id}/"
        data = {'manager_comment': 'Needs revision'}
        response = self.api_client.patch(url, data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assignment.refresh_from_db()
        self.assertEqual(self.assignment.manager_comment, 'Needs revision')
