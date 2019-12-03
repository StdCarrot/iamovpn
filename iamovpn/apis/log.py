# -*- coding: utf-8 -*
import dateutil.parser
from flask import request
from flask_restplus import Namespace, Resource, fields, abort
from models import Log
from .secure import need_session
from IPy import IP
import config
import database as db

api = Namespace('log')


def make_nullable(cls):
    schema_type = ['null']
    if isinstance(cls.__schema_type__, list):
        schema_type += cls.__schema_type__
    else:
        schema_type.append(cls.__schema_type__)

    class NullableField(cls):
        __schema_type__ = schema_type
        __schema_example__ = ' '.join(['nullable', cls.__schema_example__ or ''])

    return NullableField


@api.route('')
@api.response(401, 'Unauthorized')
@api.response(403, 'Forbidden')
class LogsApi(Resource):
    log_find_parser = api.parser()
    log_find_parser.add_argument('keyword', type=str, location='args',
                                 help='Keyword: type, user_id, remote_ip, local_ip, agent')
    log_find_parser.add_argument('offset', type=int, help='Page offset', location='args', default=0)
    log_find_parser.add_argument('length', type=int, help='Page length', location='args',  default=20)

    log_model = api.model(
        'Log',
        {
            'log_type': fields.String(description='Remote IP', enum=('login', 'connect', 'disconnect'), required=True),
            'connect_time': make_nullable(fields.DateTime)(description='Connected time', required=True),
            'remote_ip': fields.String(description='Remote IP', required=True),
            'remote_port': fields.Integer(description='Remote port', required=True),
            'local_ip': make_nullable(fields.String)(description='Local IP', required=True),
            'user_id': fields.String(description='User ID', required=True),
            'agent': make_nullable(fields.String)(description='Client agent', required=True),
            'authorized': fields.Boolean(description='User authorized', required=True),
            'connected': fields.Boolean(description='Now connected', required=True),
            'in_bytes': make_nullable(fields.Integer)(description='In bytes from client', required=True),
            'out_bytes': make_nullable(fields.Integer)(description='Out bytes to client', required=True),
            'duration': make_nullable(fields.Integer)(description='Connection duration as seconds', required=True)
        }
    )

    @need_session(admin=True)
    @api.expect(log_find_parser)
    @api.doc(security='cookieAuth')
    def get(self):
        args = self.log_find_parser.parse_args()
        if args['length'] > 500:
            abort(400, '"length" must be <= 100')

        logs, count = Log.find(**args)
        return {
            'state': 'success',
            'logs': [log.dict for log in logs],
            'count': count
        }

    @need_session(api_key=True)
    @api.expect(log_model)
    @api.doc(security='apikey')
    def post(self):
        data = request.json
        self.log_model.validate(data)

        for k in ['remote_ip', 'local_ip']:
            try:
                IP(data.get(k) or '0.0.0.0')
            except ValueError:
                abort(400, '{} is invalid IP'.format(data[k]))

        data['connect_time'] = dateutil.parser.parse(data['connect_time']) if data['connect_time'] else None

        data = {
            k: data[k]
            for k in self.log_model.keys()
        }
        log = Log(**data)
        db.session.add(log)
        db.session.commit()
        return {
            'state': 'success',
            'log': log.dict
        }