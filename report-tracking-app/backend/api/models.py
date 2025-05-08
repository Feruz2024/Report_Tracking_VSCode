from django.db import models
from django.contrib.auth.models import User

class Client(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Station(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Campaign(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='campaigns')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    stations = models.ManyToManyField('Station', related_name='campaigns', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

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
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # Additional fields for analysts can be added here

    def __str__(self):
        return self.user.username

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
