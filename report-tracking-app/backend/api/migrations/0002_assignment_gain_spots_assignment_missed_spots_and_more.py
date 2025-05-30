# Generated by Django 5.2 on 2025-05-07 20:22

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='assignment',
            name='gain_spots',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='assignment',
            name='missed_spots',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='assignment',
            name='monitoring_period',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assignments', to='api.monitoringperiod'),
        ),
        migrations.AddField(
            model_name='assignment',
            name='planned_spots',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='assignment',
            name='status',
            field=models.CharField(choices=[('WIP', 'Work In Progress'), ('SUBMITTED', 'Submitted'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')], default='WIP', max_length=16),
        ),
        migrations.AddField(
            model_name='assignment',
            name='submitted_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='assignment',
            name='transmitted_spots',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
    ]
