from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import MediaAnalystProfile, AccountantProfile, ManagerProfile


@receiver(post_save, sender=User)
def create_user_profiles(sender, instance, created, **kwargs):
    if created:
        MediaAnalystProfile.objects.get_or_create(user=instance)
        # Create AccountantProfile if user is in Accountant group
        if instance.groups.filter(name='Accountant').exists():
            AccountantProfile.objects.get_or_create(user=instance)
        # Create ManagerProfile if user is in Manager group
        if instance.groups.filter(name='Manager').exists():
            ManagerProfile.objects.get_or_create(user=instance)
