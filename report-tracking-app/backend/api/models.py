from django.db import models
from django.contrib.auth.models import User, Group

# Accountant and Manager profile models
class AccountantProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # Add accountant-specific fields here if needed
    def __str__(self):
        return f"Accountant: {self.user.username}"

class ManagerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # Add manager-specific fields here if needed
    def __str__(self):
        return f"Manager: {self.user.username}"

class Client(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    contract_signed_date = models.DateField(null=True, blank=True)
    contract_start = models.DateField(null=True, blank=True)
    contract_end = models.DateField(null=True, blank=True)
    contract_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    contacts = models.JSONField(default=list, blank=True)  # List of {type, name, email, phone}

    def __str__(self):
        return self.name

class Station(models.Model):

    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    frequency = models.CharField(max_length=100, blank=True)
    type = models.CharField(max_length=20, choices=[('radio', 'Radio'), ('tv', 'TV')], blank=True)
    contacts = models.JSONField(default=list, blank=True)  # List of {type, name, email, phone}
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Campaign(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='campaigns')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    stations = models.ManyToManyField('Station', related_name='campaigns', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # Campaign status for dashboard filtering
    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("COMPLETED", "Completed"),
        ("CLOSED", "Closed"),
    ]
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="ACTIVE")

    def __str__(self):
        return f"{self.name} ({self.client.name})"

class MonitoringPeriod(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='monitoring_periods')
    # Monitoring/reconciliation period
    monitoring_start = models.DateField()
    monitoring_end = models.DateField()
    # Station authentication period
    authentication_start = models.DateField()
    authentication_end = models.DateField()

    def __str__(self):
        return f"{self.campaign.name}: {self.monitoring_start} to {self.monitoring_end} (Auth: {self.authentication_start} to {self.authentication_end})"

class MediaAnalystProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='analyst_profile')
    # Additional fields for analysts can be added here

    def __str__(self):
        return self.user.username


from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth.models import User as AuthUser

class Assignment(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='assignments')
    station = models.ForeignKey(Station, on_delete=models.SET_NULL, null=True, blank=True, related_name='assignments')
    analyst = models.ForeignKey(MediaAnalystProfile, on_delete=models.CASCADE, related_name='assignments')
    monitoring_period = models.ForeignKey('MonitoringPeriod', on_delete=models.SET_NULL, null=True, blank=True, related_name='assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)

    # Reconciliation summary fields
    planned_spots = models.PositiveIntegerField(null=True, blank=True)
    missed_spots = models.PositiveIntegerField(null=True, blank=True)
    transmitted_spots = models.PositiveIntegerField(null=True, blank=True)
    gain_spots = models.PositiveIntegerField(null=True, blank=True)

    STATUS_CHOICES = [
        ("WIP", "Work In Progress"),
        ("SUBMITTED", "Submitted"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    ]
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="WIP")
    submitted_at = models.DateTimeField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    memo = models.TextField(blank=True)
    # Comment added by manager upon approval/rejection
    manager_comment = models.TextField(blank=True, null=True)
    analyst_report_shared = models.BooleanField(default=False)
    authenticated_accepted = models.BooleanField(default=False)
    station_report_shared = models.BooleanField(default=False)

    def clean(self):
        # Only validate if all fields are present
        if self.planned_spots is not None and self.missed_spots is not None and self.transmitted_spots is not None:
            if self.planned_spots != self.missed_spots + self.transmitted_spots:
                from django.core.exceptions import ValidationError
                raise ValidationError("Planned spots must equal missed spots + transmitted spots.")

    def __str__(self):
        s = f"{self.analyst.user.username} assigned to {self.campaign}"
        if self.station:
            s += f" / Station: {self.station}"
        if self.monitoring_period:
            s += f" / Period: {self.monitoring_period}"
        return s



# --- Notification and Messaging Models ---

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    link = models.URLField(blank=True, null=True)
    read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    deadline_date = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:40]}"

@receiver(pre_save, sender=Assignment)
def assignment_pre_save(sender, instance, **kwargs):
    # Cache old status before saving
    if instance.pk:
        try:
            old = sender.objects.get(pk=instance.pk)
            instance._old_status = old.status
        except sender.DoesNotExist:
            instance._old_status = None

@receiver(post_save, sender=Assignment)
def assignment_post_save(sender, instance, created, **kwargs):
    # Import here to avoid circular
    from .models import Notification
    # New assignment: notify analyst
    if created and instance.analyst and instance.analyst.user:
        # Notify analyst of new assignment with link to it
        Notification.objects.create(
            user=instance.analyst.user,
            message=f"New assignment: Campaign {instance.campaign.name}",
            link=f"/assignments?assignmentId={instance.id}",
            deadline_date=instance.due_date
        )
        # If assignment is already overdue at creation, send overdue notice
        if instance.status == 'WIP' and instance.due_date and instance.due_date < timezone.now().date():
            Notification.objects.create(
                user=instance.analyst.user,
                message=f"Assignment overdue for campaign {instance.campaign.name}",
                link=f"/assignments?assignmentId={instance.id}",
                deadline_date=instance.due_date
            )
    else:
        old_status = getattr(instance, '_old_status', None)
        new_status = instance.status
        # Status changed
        if new_status != old_status:
            # Submitted: notify managers
            if new_status == 'SUBMITTED':
                # Auto-set submitted_at timestamp if not already set
                if not instance.submitted_at:
                    # Use sender to avoid direct model import
                    sender.objects.filter(pk=instance.pk).update(submitted_at=timezone.now())
                # Notify all staff managers with link to review
                managers = AuthUser.objects.filter(is_staff=True)
                for mgr in managers:
                    Notification.objects.create(
                        user=mgr,
                        message=f"Assignment submitted by {instance.analyst.user.username} for campaign {instance.campaign.name}",
                        link=f"/assignments?assignmentId={instance.id}",
                        deadline_date=instance.due_date
                    )
            # Approved: notify analyst
            if new_status == 'APPROVED':
                # Notify analyst of approval
                Notification.objects.create(
                    user=instance.analyst.user,
                    message=f"Your assignment for campaign {instance.campaign.name} has been approved",
                    link=f"/assignments?assignmentId={instance.id}" 
                )
            # Rejected: notify analyst
            if new_status == 'REJECTED':
                # Notify analyst of rejection
                Notification.objects.create(
                    user=instance.analyst.user,
                    message=f"Your assignment for campaign {instance.campaign.name} has been rejected",
                    link=f"/assignments?assignmentId={instance.id}" 
                )
                # Reset status to WIP after rejection
                sender.objects.filter(pk=instance.pk).update(status='WIP')
        # Overdue check: if still WIP and past due
        # Overdue check: if still WIP and past due, send only one overdue notification per save
        if instance.status == 'WIP' and instance.due_date and instance.due_date < timezone.now().date():
            Notification.objects.create(
                user=instance.analyst.user,
                message=f"Assignment overdue for campaign {instance.campaign.name}",
                link=f"/assignments?assignmentId={instance.id}",
                deadline_date=instance.due_date
            )

@receiver(pre_save, sender=Campaign)
def campaign_pre_save(sender, instance, **kwargs):
    # Cache old status before saving
    if instance.pk:
        try:
            old = sender.objects.get(pk=instance.pk)
            instance._old_status = old.status
        except sender.DoesNotExist:
            instance._old_status = None

@receiver(post_save, sender=Campaign)
def campaign_post_save(sender, instance, created, **kwargs):
    # Import here to avoid circular import issues if Notification is in the same file
    # from .models import Notification # Already imported if Notification model is above
    
    old_status = getattr(instance, '_old_status', None)
    new_status = instance.status

    # Notify accountants if campaign status changes to "CLOSED"
    if new_status == "CLOSED" and old_status != "CLOSED":
        try:
            accountant_group = Group.objects.get(name='Accountant')
            accountant_users = User.objects.filter(groups=accountant_group)
            for user_accountant in accountant_users:
                Notification.objects.create(
                    user=user_accountant,
                    message=f"Campaign '{instance.name}' has been closed and is ready for payment processing.",
                    link=f"/campaigns/{instance.id}" # Or a link to a specific accountant view
                )
        except Group.DoesNotExist:
            print("ERROR: Accountant group not found. Cannot send campaign closure notifications to accountants.")
        except Exception as e:
            print(f"ERROR: Could not send notification to accountants: {e}")

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    context = models.CharField(max_length=255, blank=True, help_text="Context (e.g., campaign/task id)")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender.username} to {self.recipient.username} at {self.timestamp}"
