import requests
import random
import time


def tongji():
    url = 'https://hm.baidu.com/hm.js?46f61b50a7dd539a4d07f70efc11f93f'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
        'Referer': 'https://tj.nz.lu',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9'
    }
    r = requests.get(url, headers=headers)
    # print(r.text)


def tongji_sec():
    url = 'https://hm.baidu.com/hm.gif'
    params = {
        'cc': '0',
        'ck': '1',
        'cl': '24-bit',
        'ds': '1440x900',
        'vl': '372',
        'ep': '%s,%s' % (random.randint(2000, 3000), random.randint(100, 200)),
        'et': '3',
        'fl': '',
        'ja': '',
        'ln': 'zh-cn',
        'lo': '0',
        'lt': int(time.time() / 1000),
        'rnd': random.randint(1000000000, 9999999999),
        'si': '46f61b50a7dd539a4d07f70efc11f93f',
        'su': 'https://tj.nz.lu',
        'v': '1.2.30',
        'lv': '3',
        'sn': int(time.time() / 1000) % 65535,
        'u': 'tj.nz.lu'
    }
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
        'Referer': 'https://tj.nz.lu',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9'
    }
    r = requests.get(url, params=params, headers=headers)
    print(r.text)


if __name__ == '__main__':
    tongji()
    tongji_sec()
    print('上报百度统计成功')
