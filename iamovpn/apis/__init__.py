# -*- coding: utf-8 -*-
from . import log, user, secure


def get_apis():
    return [module.api for module in [log, user, secure]]

