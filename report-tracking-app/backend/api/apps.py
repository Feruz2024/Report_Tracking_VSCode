from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        from django.db.models.signals import post_save
        from .models import Assignment, Message, Notification
        # Assignment status notification
        def assignment_status_notification(sender, instance, created, **kwargs):
            if not created and instance.status in ["SUBMITTED", "APPROVED", "REJECTED"]:
                user = instance.analyst.user
                msg = f"Assignment '{instance}' status changed to {instance.get_status_display()}"
                Notification.objects.create(user=user, message=msg)
        post_save.connect(assignment_status_notification, sender=Assignment, dispatch_uid='assignment_status_notification')

        # Import and register analyst profile signal
        import api.signals
