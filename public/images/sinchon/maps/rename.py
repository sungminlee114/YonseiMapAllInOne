import os
from os import path

cur_path = os.getcwd()

paths = []
for root, dirs, files in os.walk(cur_path):
    for file in files:
        if(file.endswith(".png")):
            paths.append(os.path.join(root, file))

print(paths)

def is_float(n):
    try:
        float(n)
    except ValueError:
        return False
    else:
        return True

for filePath in paths:
    dir, file = os.path.split(filePath)
    name = file[:-4]
    # print(name, is_float(name))
    if(is_float(name)):
        name +='F'
        os.rename(filePath, os.path.join(dir,name+'.png'))
    
    # print(os.path.join(dir,name+'.png'))
