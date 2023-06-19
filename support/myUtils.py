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
