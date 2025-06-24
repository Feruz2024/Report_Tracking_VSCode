import datetime

def export_filename(data_type, fmt):
    date_str = datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    return f"{data_type}_export_{date_str}.{fmt}"
