import mimetypes
from datetime import datetime, timedelta, timezone
from django.http import FileResponse

def ifNull(var, val):
  if var is None:
    return val
  return var

def extract_first_numeric_value(string):
    numeric_value = ''
    for char in string:
        if char.isdigit():
            numeric_value += char
        elif numeric_value:
            break
    return int(numeric_value) if numeric_value else None

def try_float(value):
    try:
        return float(value)
    except ValueError:
        return None


def delKeys(d, keys):
    return {k: v for k, v in d.items() if k not in keys}

def download_file_stream(stream,prefix,mime_type):
    dt = datetime.now().strftime("%Y%m%d-%H%M%S")
    filename = f'{prefix}_{dt}'
    response =  FileResponse(stream, content_type=mime_type)
    # print("uuuuuuuuuuu")
    # print(response)
    # with open("c:\\PESSOAL\\teste.pdf", 'wb') as file:
    #     for chunk in response.streaming_content:
    #         file.write(chunk)
    # # Set the HTTP header for sending to browser
    response['Content-Disposition'] = "inline; filename=%s" % filename
    return response