from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Client, Campaign, Assignment, MediaAnalystProfile

class Command(BaseCommand):
    help = 'Delete all users except user with id 23, and remove all clients, campaigns, and assignments.'

    def handle(self, *args, **options):
        # Delete all assignments
        Assignment.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Deleted all assignments.'))

        # Delete all campaigns
        Campaign.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Deleted all campaigns.'))

        # Delete all clients
        Client.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Deleted all clients.'))

        # Delete all MediaAnalystProfiles except for user 23
        MediaAnalystProfile.objects.exclude(user_id=23).delete()
        self.stdout.write(self.style.SUCCESS('Deleted all MediaAnalystProfiles except for user 23.'))

        # Delete all users except user 23
        User.objects.exclude(id=23).delete()
        self.stdout.write(self.style.SUCCESS('Deleted all users except user 23.'))

        self.stdout.write(self.style.SUCCESS('Database cleanup complete.'))
