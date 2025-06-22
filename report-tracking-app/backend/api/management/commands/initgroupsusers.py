from django.contrib.auth.models import Group, User
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Create initial user groups and users with passwords.'

    def handle(self, *args, **options):
        # Define groups
        groups = ['Admins', 'Managers', 'Analysts', 'Accountants']
        for group_name in groups:
            Group.objects.get_or_create(name=group_name)
        self.stdout.write(self.style.SUCCESS('Groups created.'))

        # Define users and their groups
        users = [
            {'username': 'admin', 'password': 'adminpass', 'email': 'admin@example.com', 'groups': ['Admins'], 'is_superuser': True, 'is_staff': True},
            {'username': 'MihretChuni', 'password': 'analystpass1', 'email': 'mihretchuni@example.com', 'groups': ['Analysts']},
            {'username': 'MihretDesalegn', 'password': 'analystpass2', 'email': 'mihretdesalegn@example.com', 'groups': ['Analysts']},
            {'username': 'BethelhemGirma', 'password': 'analystpass3', 'email': 'bethelhemgirma@example.com', 'groups': ['Analysts']},
            {'username': 'SelamAhmed', 'password': 'managerpass', 'email': 'selamahmed@example.com', 'groups': ['Managers']},
        ]
        for user_info in users:
            user, created = User.objects.get_or_create(username=user_info['username'], defaults={
                'email': user_info['email'],
                'is_superuser': user_info.get('is_superuser', False),
                'is_staff': user_info.get('is_staff', False),
            })
            if created:
                user.set_password(user_info['password'])
                user.save()
            for group_name in user_info['groups']:
                group = Group.objects.get(name=group_name)
                user.groups.add(group)
        self.stdout.write(self.style.SUCCESS('Users created and assigned to groups.'))
