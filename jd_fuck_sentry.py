with open('/etc/hosts','a+') as f:
    hosts=f.read()
    if '127.0.0.1 o1098464.ingest.sentry.io' in f:
        print('已屏蔽')
    else:
        f.write('\n127.0.0.1 o1098464.ingest.sentry.io\n')
        print('屏蔽成功')

print(open('/etc/hosts').read())