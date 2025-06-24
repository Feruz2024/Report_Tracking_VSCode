import csv
import io
import json
from django.http import HttpResponse, JsonResponse
from .utils import export_filename
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from .models import Station, Client, Campaign, Assignment, MediaAnalystProfile
from django.contrib.auth.models import User
from .serializers import StationSerializer, ClientSerializer, CampaignSerializer, AssignmentSerializer

# --- SETTINGS DATA ---
@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_settings(request):
    # Example: export settings as JSON (extend as needed)
    settings_data = {
        'DATABASES': str(request.settings.DATABASES) if hasattr(request, 'settings') else 'hidden',
        # Add more system settings here
    }
    fmt = request.GET.get('format', 'json')
    filename = export_filename('settings', fmt)
    if fmt == 'csv':
        output = io.StringIO()
        writer = csv.writer(output)
        for k, v in settings_data.items():
            writer.writerow([k, v])
        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    else:
        response = HttpResponse(json.dumps(settings_data, indent=2), content_type='application/json')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

@api_view(['POST'])
@permission_classes([IsAdminUser])
def import_settings(request):
    # Example: import settings from JSON (stub, not recommended for DB config)
    # Implement as needed for safe settings
    return JsonResponse({'status': 'Settings import not implemented for safety.'}, status=400)

# --- MODULES & USER DATA ---
@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_entities(request):
    fmt = request.GET.get('format', 'json')
    models = [
        ('users', User, ['id', 'username', 'email', 'is_active']),
        ('stations', Station, StationSerializer),
        ('clients', Client, ClientSerializer),
        ('campaigns', Campaign, CampaignSerializer),
        ('assignments', Assignment, AssignmentSerializer),
        ('analysts', MediaAnalystProfile, ['id', 'user_id']),
    ]
    filename = export_filename('entities', fmt)
    if fmt == 'csv':
        output = io.StringIO()
        writer = csv.writer(output)
        for name, model, serializer in models:
            writer.writerow([f'[{name.upper()}]'])
            if isinstance(serializer, list):
                writer.writerow(serializer)
                for obj in model.objects.all():
                    writer.writerow([getattr(obj, f, '') for f in serializer])
            else:
                # Use DRF serializer for JSON fields
                fields = serializer.Meta.fields if hasattr(serializer.Meta, 'fields') else []
                writer.writerow(fields)
                for obj in model.objects.all():
                    row = serializer(obj).data
                    writer.writerow([row.get(f, '') for f in fields])
            writer.writerow([])
        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    else:
        # JSON export
        data = {}
        for name, model, serializer in models:
            if isinstance(serializer, list):
                data[name] = list(model.objects.values(*serializer))
            else:
                data[name] = serializer(model.objects.all(), many=True).data
        response = HttpResponse(json.dumps(data, indent=2), content_type='application/json')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

@api_view(['POST'])
@permission_classes([IsAdminUser])
def import_entities(request):
    # Accept JSON or CSV upload, parse and create/update records
    file = request.FILES.get('file')
    if not file:
        return JsonResponse({'error': 'No file uploaded.'}, status=400)
    fmt = file.name.split('.')[-1].lower()
    results = {}
    if fmt == 'json':
        try:
            data = json.load(file)
        except Exception as e:
            return JsonResponse({'error': f'Invalid JSON: {e}'}, status=400)
        # Import users
        if 'users' in data:
            for u in data['users']:
                User.objects.update_or_create(id=u['id'], defaults={
                    'username': u['username'],
                    'email': u.get('email', ''),
                    'is_active': u.get('is_active', True),
                })
            results['users'] = len(data['users'])
        # Import stations
        if 'stations' in data:
            for s in data['stations']:
                Station.objects.update_or_create(id=s['id'], defaults=s)
            results['stations'] = len(data['stations'])
        # Import clients
        if 'clients' in data:
            for c in data['clients']:
                Client.objects.update_or_create(id=c['id'], defaults=c)
            results['clients'] = len(data['clients'])
        # Import campaigns
        if 'campaigns' in data:
            for c in data['campaigns']:
                Campaign.objects.update_or_create(id=c['id'], defaults=c)
            results['campaigns'] = len(data['campaigns'])
        # Import assignments
        if 'assignments' in data:
            for a in data['assignments']:
                Assignment.objects.update_or_create(id=a['id'], defaults=a)
            results['assignments'] = len(data['assignments'])
        # Import analysts
        if 'analysts' in data:
            for a in data['analysts']:
                MediaAnalystProfile.objects.update_or_create(id=a['id'], defaults=a)
            results['analysts'] = len(data['analysts'])
        return JsonResponse({'imported': results})
    elif fmt == 'csv':
        # CSV import: expects format as exported (section headers)
        content = file.read().decode('utf-8')
        reader = csv.reader(io.StringIO(content))
        current = None
        headers = []
        count = 0
        for row in reader:
            if not row or row[0].startswith('['):
                if current and count:
                    results[current] = count
                current = row[0].strip('[]').lower() if row else None
                headers = []
                count = 0
                continue
            if not headers:
                headers = row
                continue
            if current == 'users':
                obj = dict(zip(headers, row))
                User.objects.update_or_create(id=obj['id'], defaults={
                    'username': obj['username'],
                    'email': obj.get('email', ''),
                    'is_active': obj.get('is_active', True),
                })
                count += 1
            elif current == 'stations':
                obj = dict(zip(headers, row))
                Station.objects.update_or_create(id=obj['id'], defaults=obj)
                count += 1
            elif current == 'clients':
                obj = dict(zip(headers, row))
                Client.objects.update_or_create(id=obj['id'], defaults=obj)
                count += 1
            elif current == 'campaigns':
                obj = dict(zip(headers, row))
                Campaign.objects.update_or_create(id=obj['id'], defaults=obj)
                count += 1
            elif current == 'assignments':
                obj = dict(zip(headers, row))
                Assignment.objects.update_or_create(id=obj['id'], defaults=obj)
                count += 1
            elif current == 'analysts':
                obj = dict(zip(headers, row))
                MediaAnalystProfile.objects.update_or_create(id=obj['id'], defaults=obj)
                count += 1
        if current and count:
            results[current] = count
        return JsonResponse({'imported': results})
    else:
        return JsonResponse({'error': 'Unsupported file type.'}, status=400)

# --- ANALYSIS DATA ---
@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_analysis(request):
    fmt = request.GET.get('format', 'json')
    # Example: campaign status summary
    campaigns = Campaign.objects.all()
    analysis = []
    for c in campaigns:
        assignments = Assignment.objects.filter(campaign=c)
        planned = sum(a.planned_spots or 0 for a in assignments)
        missed = sum(a.missed_spots or 0 for a in assignments)
        transmitted = sum(a.transmitted_spots or 0 for a in assignments)
        analysis.append({
            'campaign': c.name,
            'planned': planned,
            'missed': missed,
            'transmitted': transmitted,
            'share': f"{(transmitted / planned * 100) if planned else 0:.1f}%",
        })
    filename = export_filename('analysis', fmt)
    if fmt == 'csv':
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=['campaign', 'planned', 'missed', 'transmitted', 'share'])
        writer.writeheader()
        for row in analysis:
            writer.writerow(row)
        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    else:
        response = HttpResponse(json.dumps(analysis, indent=2), content_type='application/json')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

@api_view(['POST'])
@permission_classes([IsAdminUser])
def import_analysis(request):
    # Accept JSON or CSV upload, parse and store analysis snapshots (optional)
    # (Stub: implement as needed)
    return JsonResponse({'status': 'Import not implemented in this stub.'}, status=400)
