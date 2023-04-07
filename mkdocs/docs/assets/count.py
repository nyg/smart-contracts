#!/usr/bin/env python3

from json import dumps
from os import environ
from urllib.error import URLError, HTTPError
from urllib.parse import parse_qsl
from urllib.request import Request, urlopen

params = dict(parse_qsl(environ['QUERY_STRING']))

data = {
    'hits': [{
        'bot': int(params.get('b', 0)),
        'event': bool(params.get('e', False)),
        'ip': environ['REMOTE_ADDR'],
        'path': params.get('p'),
        'query': params.get('q'),
        'ref': params.get('r'),
        'size': params.get('s'),
        'title': params.get('t'),
        'user_agent': environ['HTTP_USER_AGENT']
    }],
    'no_sessions': True
}

headers = {
    'Content-type': 'application/json',
    'Authorization': 'Bearer {}'.format(environ['GOAT_KEY'])
}

try:
    res = urlopen(Request(environ['GOAT_HOST'], dumps(data).encode(), headers))
    status, reason = res.status, res.reason
except HTTPError as e:
    status, reason = e.code, e.reason
except URLError:
    status, reason = 500, 'Internal Server Error'

print('Content-Type: text/html')
print('Status: {} {}'.format(status, reason))
print()
