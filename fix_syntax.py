import re

with open("js/menu.js", "r") as f:
    content = f.read()

content = content.replace("\\'", "'")
content = content.replace('\\"', '"')

with open("js/menu.js", "w") as f:
    f.write(content)
