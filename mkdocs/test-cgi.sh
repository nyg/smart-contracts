#!/usr/bin/env sh

QUERY_STRING='p=%2F&t=Welcome%20-%20Notes&s=3440%2C1440%2C1&b=0&rnd=wc5ow' \
REMOTE_ADDR='1.1.1.1' \
HTTP_USER_AGENT='vscode' \
GOAT_KEY=abc \
GOAT_HOST=https://eo675tndws631wx.m.pipedream.net \
python docs/assets/count.py
