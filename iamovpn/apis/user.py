# -*- coding: utf-8 -*-
import os
from copy import deepcopy
from flask import g, request
from flask_restplus import Resource, abort, fields
import database as db
from datetime import datetime
from models import User
from .secure import need_session
from flask_restplus import Namespace
import config

api = Namespace('user')

user_model = api.model(
    'User',
    {
        'id': fields.String(description="User id"),
        'name': fields.String(description="User name"),
        'admin': fields.Boolean(description="Is admin"),
        'active': fields.Boolean(description="Is not blocked")
    }
)

user_create_model = api.model(
    'UserCreate',
    dict({
        'password': fields.String(description="User password")
    }, **deepcopy(user_model))
)
for field in user_create_model.values():
    field.required = True


@api.route('')
@api.response(401, 'Unauthorized')
@api.response(403, 'Forbidden')
class UsersApi(Resource):
    user_find_parser = api.parser()
    user_find_parser.add_argument('keyword', type=str, help='Keyword: ID, name', location='args')
    user_find_parser.add_argument('offset', type=int, help='Page offset', location='args', default=0)
    user_find_parser.add_argument('length', type=int, help='Page length', location='args', default=20)

    @need_session(admin=True)
    @api.expect(user_find_parser)
    @api.doc(security='cookieAuth')
    def get(self):
        args = self.user_find_parser.parse_args()
        if args['length'] > 100:
            abort(400, '"length" must be <= 100')

        users, count = User.find(
            keyword=args.get('keyword'),
            offset=args['offset'],
            length=args['length']
        )

        return {
            'state': 'success',
            'users': [
                user.dict
                for user in users
            ],
            'count': count
        }

    @need_session(admin=True)
    @api.response(406, 'Invalid data')
    @api.response(409, 'ID exists')
    @api.expect(user_create_model)
    @api.doc(security='cookieAuth')
    def post(self):
        data = request.json
        user_create_model.validate(data)
        data = {
            k: data[k]
            for k in user_create_model.keys()
        }

        user = User.query.filter(User.id == data['id']).first()
        if user:
            abort(409, 'ID exists')

        data['id'] = data['id'].strip()
        if ' ' in data['id'] or '\t' in data['id']:
            abort(406, 'ID can not contain spaces')

        data['password'] = data['password'].strip()
        if len(data['password']) < 6:
            abort(406, 'Password too short. It must be longer than 5.')

        user = User(**data)
        db.session.add(user)
        db.session.commit()

        return {
            'state': 'success',
            'user': user.dict
        }


@api.route('/<string:uid>')
@api.response(401, 'Unauthorized')
@api.response(403, 'Forbidden')
@api.response(404, 'Not Found')
class UserApi(Resource):
    @need_session(admin=False)
    @api.doc(security='cookieAuth')
    def get(self, uid):
        if uid.lower() == 'me':
            return {
                'state': 'success',
                'user': g.user.dict
            }

        if g.user.uid != uid and not g.user.admin:
            abort(403)

        query = User.query.filter(User.uid == uid)
        if not g.user.admin:
            query = query.filter(User.active.is_(True))

        user = query.first()
        if user is None:
            abort(404, 'User not found')

        return {
            'state': 'success',
            'user': user.dict
        }

    @need_session(admin=False)
    @api.expect(user_model)
    @api.doc(security='cookieAuth')
    def put(self, uid):
        if uid.lower() == 'me':
            uid = g.user.uid

        if g.user.uid != uid and not g.user.admin:
            abort(403)

        query = User.query.filter(User.uid == uid)
        if not g.user.admin:
            query = query.filter(User.active.is_(True))

        user = query.first()
        if user is None:
            abort(404, 'User not found')

        data = request.json
        user_model.validate(data)
        data = {
            k: data[k]
            for k in data if k not in ('id', 'uid') and k in user_model
        }

        if data.get('admin') is not None and not g.user.admin:
            abort(403)

        if 'name' in data:
            data['name'] = data['name'].strip()

        for k, v in data.items():
            setattr(user, k, v)

        user.updated = datetime.now()
        db.session.commit()
        return {
            'state': 'success',
            'user': user.dict
        }


@api.route('/<string:uid>/password')
@api.response(401, 'Unauthorized')
@api.response(406, 'New password is not valid')
class UserPasswordChangeAPI(Resource):
    password_model = api.model(
        'Password',
        {
            'password': fields.String(description="New password", required=True)
        }
    )

    @need_session(admin=True)
    @api.expect(password_model)
    @api.doc(security='cookieAuth')
    def put(self, uid):
        data = request.json
        self.password_model.validate(data)

        if len(data['password']) < 6:
            abort(406, 'Password too short. It must be longer than 5.')

        user = User.query.filter(User.uid == uid).first()
        if user is None:
            abort(404, 'User not found')

        user.password = data['password']
        user.updated = datetime.now()
        db.session.commit()

        return {'state': 'success'}


@api.route('/config')
@api.response(401, 'Unauthorized')
class UserConfigAPI(Resource):

    @need_session(admin=False)
    @api.doc(security='cookieAuth')
    def get(self):
        ovpn_path = os.path.join(config['openvpn']['path'], 'client.ovpn')
        with open(ovpn_path, 'r') as f:
            return {
                'state': 'success',
                'config': f.read()
            }

