# -*- coding: utf-8 -*-
import database as db
from datetime import datetime
from functools import wraps
from flask import session, g, abort, request
from flask_restplus import Resource, abort, Namespace, fields
from models import User
import config

api = Namespace('secure')


def user_setter():
    if 'user_uid' in session and session['user_uid']:
        g.user = User.query\
            .filter(User.uid == session['user_uid'])\
            .filter(User.active.is_(True))\
            .first()
        if g.user is None:
            session.clear()
            raise abort(404)
        return True
    return False


def check_session():
    if 'user_uid' not in session:
        return False
    else:
        return user_setter()


def need_session(admin=False, api_key=None):
    def deco(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if api_key:
                if request.headers.get('X-API-Key') not in (config.get('api_keys') or []):
                    abort(401)
            else:
                if not check_session():
                    abort(401)

                if admin and not g.user.admin:
                    abort(403)

            return func(*args, **kwargs)
        return wrapper
    return deco


@api.route('/login')
@api.response(401, 'Unauthorized')
class LoginApi(Resource):
    login_model = api.model(
        'Login',
        {
            'id': fields.String(description='User ID', min_length=4, required=True),
            'password': fields.String(description='User password', min_length=4, required=True)
        }
    )

    @api.expect(login_model)
    def post(self):
        data = request.json
        self.login_model.validate(data)

        user = User.query\
            .filter(User.id == data['id'])\
            .filter(User.active.is_(True))\
            .first()
        if user and user.is_valid_password(data['password']):
            session['user_uid'] = user.uid
            return {'state': 'success', 'user': user.dict}

        session.clear()
        abort(401)

    def delete(self):
        session.pop('user_uid')
        return {
            'state': 'success'
        }


@api.route('/password')
@api.response(401, 'Unauthorized')
class PasswordChange(Resource):
    password_model = api.model(
        'ChangePassword',
        {
            'old': fields.String(title='Old password', required=True),
            'new': fields.String(title='New password', required=True)
        }
    )

    @need_session(admin=False)
    @api.expect(password_model)
    @api.doc(security='cookieAuth')
    def put(self):
        data = request.json
        self.password_model.validate(data)

        if not g.user.is_valid_password(data['old']):
            abort(401, 'Old password is wrong.')

        if len(data['new']) < 6:
            abort(400, 'New password is too short.')

        g.user.password = data['new']
        g.user.updated = datetime.now()
        db.session.commit()

        return {'state': 'success'}
