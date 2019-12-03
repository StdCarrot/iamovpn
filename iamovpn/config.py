# -*- coding: utf-8 -*-
import sys
import os
import json


class ConfigModule(dict):
    default = {
        "db_url": "sqlite://./iamovpn.sqlite",
        "logging": {
            "level": "INFO"
        },
        "debug": False,
        "ovpn": {
            "path": "/etc/openvpn",
            "network": "172.16.0.0",
            "netmask": "255.255.0.0",
            "redirect_gateway": True,
            "routes": []
        }
    }

    def __init__(self):
        super().__init__()
        self.path = './config.json'
        self.update(ConfigModule.default)

    def load(self, path=None):
        if path:
            self.path = os.path.abspath(path)
        elif self.path is None:
            raise ValueError('Config path can not be None')
        with open(self.path, 'r') as config_file:
            self.update(json.load(config_file))

    def save(self, path=None):
        path = path or self.path
        with open(path, 'w') as config_file:
            json.dump(self, config_file, indent='  ', sort_keys=True)


sys.modules[__name__] = ConfigModule()
