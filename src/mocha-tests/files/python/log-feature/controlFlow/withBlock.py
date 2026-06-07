def read_file(path):
    with open(path) as handle:
        content = handle.read()
        return content
