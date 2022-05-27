with open('/etc/hosts', 'a+') as f:
    if 'sentry.io' in open('/etc/hosts').read():
        print('已屏蔽')
    else:
        f.write('\n127.0.0.1 o1098464.ingest.sentry.io\n')
        print('屏蔽成功')

print(open('/etc/hosts').read())

import os

ql_dists = ['/ql/dist', '/ql/static/dist']
for dist in ql_dists:
    try:
        files = os.listdir(dist)
        filesraw = os.listdir(dist)
        for i in filesraw:
            if os.path.isdir(dist + '/' + i) or '.gz' in i:
                files.remove(i)
        js_sec = []
        jsd = []
        for i in files:
            with open(dist + '/' + i, 'r', encoding='utf-8') as f:
                ff = f.read()
                if 'sentry.io' in ff:
                    print(i, '文件中含有sentry.io')
                    js_sec.append(i)
                if 'cdn.jsdelivr.net' in ff:
                    print(i, '含有 cdn.jsdelivr.net')
                    jsd.append(i)
        for i in js_sec:
            f = open(dist + '/' + i, 'r', encoding='utf-8')
            file_content = f.read()
            f.close()
            f = open(dist + '/' + i, 'w', encoding='utf-8')
            f.write(file_content.replace('sentry.io', ''))
            f.close()
            print('屏蔽js成功', i)
        for i in jsd:
            f = open(dist + '/' + i, 'r', encoding='utf-8')
            file_content = f.read()
            f.close()
            f = open(dist + '/' + i, 'w', encoding='utf-8')
            f.write(file_content.replace('cdn.jsdelivr.net', 'fastly.jsdelivr.net'))
            f.close()
            print('成功尝试解决白屏问题（替换cdn）', i)
    except:
        pass
