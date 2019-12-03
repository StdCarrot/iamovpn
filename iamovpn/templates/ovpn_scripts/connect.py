#!/usr/bin/python3
# -*- coding: utf-8 -*-
import os
from datetime import datetime
import util

util.log(
    log_type='connect',
    connect_time=datetime.fromtimestamp(int(os.environ['time_unix'])).isoformat(),
    remote_ip=os.environ['trusted_ip'],
    remote_port=int(os.environ['trusted_port']),
    local_ip=os.environ['ifconfig_pool_remote_ip'],
    user_id=os.environ['username'],
    agent=os.environ.get('IV_GUI_VER') or '',
    authorized=True,
    connected=True
)
