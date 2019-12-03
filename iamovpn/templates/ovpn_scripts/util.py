# -*- coding: utf-8 -*-
from urllib import request, parse, error
import json

api_host = 'http://{{ api_host }}:{{ api_port }}/'
api_key = '{{ api_key }}'


def login(id_, password):
    data = json.dumps({
        'id': id_,
        'password': password
    }).encode()
    req = request.Request(
        url=parse.urljoin(api_host, '/api/secure/login'),
        data=data,
        method='POST',
        headers={'Content-Type': 'application/json'}
    )
    try:
        resp = request.urlopen(req)
        status = resp.getcode()
    except error.HTTPError as e:
        status = e.getcode()

    return status


def log(log_type, connect_time, remote_ip, remote_port, local_ip, user_id, agent, authorized, connected,
        in_bytes=None, out_bytes=None, duration=None):
    data = json.dumps({
        'log_type': log_type,
        'connect_time': connect_time,
        'remote_ip': remote_ip,
        'remote_port': remote_port,
        'local_ip': local_ip,
        'user_id': user_id,
        'agent': agent,
        'authorized': authorized,
        'connected': connected,
        'in_bytes': in_bytes,
        'out_bytes': out_bytes,
        'duration': duration
    }).encode()
    headers = {
        'Content-Type': 'application/json',
        'X-API-Key': api_key
    }

    req = request.Request(
        url=parse.urljoin(api_host, '/api/log'),
        data=data,
        method='POST',
        headers=headers
    )
    try:
        resp = request.urlopen(req)
        status = resp.getcode()
    except error.HTTPError as e:
        status = e.getcode()

    return status
