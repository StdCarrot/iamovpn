# -*- coding: utf-8 -*-
"""IAM OVPN
Usage:
    iamovpn install [--config <config_path>]
    iamovpn run standalone [--config <config_path>]
    iamovpn run user_auth [--config <config_path>]
    iamovpn run user_connect [--config <config_path>]
    iamovpn run user_disconnect [--config <config_path>]

Options:
    -h, --help              Show this screen
    --config <config_path>  Specify config.json file [default: ./config.json]
"""

from docopt import docopt
import logging
import config
import install
import app

args = docopt(__doc__)
config.load(args['--config'])
logging.basicConfig(level=getattr(logging, config['logging']['level']))


if args.get('install'):
    install.run(config)

elif args.get('run') and args.get('standalone'):
    app.run(config)
