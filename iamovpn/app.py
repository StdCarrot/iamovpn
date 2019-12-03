# -*- coding: utf-8 -*-
import uuid
from flask import Flask, Blueprint
from flask_restplus import Api
from flask_cors import CORS
import database as db
import logging
import apis
import views.index


def create_app(config):
    app = Flask(__name__, template_folder='templates', static_folder=None)
    app.debug = config.get('debug') or False
    app.secret_key = config.get('secret') or 'DANGEROUS SECURE'
    db.connect()
    config['api_keys'] = (config.get('api_keys') or []) + [str(uuid.uuid5(uuid.NAMESPACE_DNS, app.secret_key))]

    def teardown(exception=None):
        db.session.remove()
        return exception

    def exception_handler(exception):
        db.session.rollback()
        return exception

    blueprint = Blueprint('api', 'api', url_prefix='/api')
    api = Api(
        blueprint,
        endpoint='api',
        authorizations={
            'apikey': {
                'type': 'apiKey',
                'in': 'header',
                'name': 'X-API-Key'
            },
            'cookieAuth': {
                'type': 'apiKey',
                'in': 'cookie',
                'name': 'session',
            }
        }
    )
    for a in apis.get_apis():
        api.add_namespace(a)

    app.teardown_request(teardown)
    app.register_error_handler(Exception, exception_handler)
    app.register_blueprint(blueprint)
    app.register_blueprint(views.index.app)
    app.url_map.strict_slashes = False

    if config['debug']:
        logging.info(app.url_map)
        cors = CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    return app


def run(config):
    app = create_app(config)
    app.run(config['host'], config['port'], debug=config['debug'])
