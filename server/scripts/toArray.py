import os
import sys
import re
list = os.listdir("./")
pat = ": (\w+.+|\".+\")"
for i in list:
    if "yaml" not in i:
        continue
    print(i)
    f = open("./"+i, "r")
    f2 = open("./new"+i,"w")

    lines = f.readlines()
    for line in lines:
        if ("action:" in line or "param:" in line) :
            res = re.search(pat, line)
            if res:
                line = line.replace(res.group(1), "["+res.group(1)+"]")

        f2.write(line)
        print(line)
    f.close()
    f2.close()
