import mimetypes
import re
from datetime import datetime, timedelta, timezone
from django.http import FileResponse

def string_lists(input_string):
    # Split the input string based on newline characters, commas, and semicolons
    strs = [v.strip("'\" ") for v in re.split(r'[\n,;]', input_string) if v.strip("'\" ")]

    # Format each date string with single quotes
    formatted_strs = [f"'{v}'" for v in strs]

    # Join the formatted dates into a single string
    result_string = ','.join(formatted_strs)
    return result_string

def int_lists(input_string):
    # Split the input string based on newline characters, commas, and semicolons
    strs = [v.strip("'\" ") for v in re.split(r'[\n,;]', input_string) if v.strip("'\" ")]

    # Format each date string with single quotes
    formatted_strs = [f"{v}" for v in strs]

    # Join the formatted dates into a single string
    result_string = ','.join(formatted_strs)
    return result_string

def isDate(date_string, date_format='%Y-%m-%d'):
    try:
        datetime.strptime(date_string, date_format)
        return True
    except ValueError:
        return False

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
    #with open("c:\\PESSOAL\\teste.pdf", 'wb') as file:
    #    for chunk in response.streaming_content:
    #        file.write(chunk)
    # # Set the HTTP header for sending to browser
    response['Content-Disposition'] = "inline; filename=%s" % filename
    return response

def append_line_after(search_line, insert_line, text):
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if search_line in line:
            lines.insert(i + 1, insert_line)
            break
    return '\n'.join(lines)