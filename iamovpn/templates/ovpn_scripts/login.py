#!/usr/bin/python3
# -*- coding: utf-8 -*-
import os
import sys
import util

resp_code = util.login(os.environ['username'], os.environ['password'])

if resp_code == 200:
    resp_code = 0

if resp_code:
    util.log(
        log_type='login',
        connect_time=None,
        remote_ip=os.environ['untrusted_ip'],
        remote_port=int(os.environ['untrusted_port']),
        local_ip=None,
        user_id=os.environ['username'],
        agent=os.environ.get('IV_GUI_VER') or '',
        authorized=False,
        connected=False
    )
else:
    util.log(
        log_type='login',
        connect_time=None,
        remote_ip=os.environ['untrusted_ip'],
        remote_port=int(os.environ['untrusted_port']),
        local_ip=None,
        user_id=os.environ['username'],
        agent=os.environ.get('IV_GUI_VER') or '',
        authorized=True,
        connected=False
    )

sys.exit(resp_code)


