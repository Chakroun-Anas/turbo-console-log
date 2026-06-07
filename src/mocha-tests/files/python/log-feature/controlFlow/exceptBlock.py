def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError as error:
        return str(error)
