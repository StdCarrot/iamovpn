# -*- coding: utf-8 -*-
import database as db
import bcrypt
import uuid
from datetime import datetime

from sqlalchemy import or_, Column, DateTime, Boolean, Text
from sqlalchemy.ext.hybrid import hybrid_property as property

import config
from .utils import get_orders


class User(db.Base):
    __tablename__ = 'user'

    # Fields
    uid = Column(Text, primary_key=True)
    created = Column(DateTime(timezone=False))
    updated = Column(DateTime(timezone=False))
    id = Column(Text, index=True, unique=True)
    _password = Column('password', Text)
    name = Column(Text)
    admin = Column(Boolean, default=False)
    active = Column(Boolean, default=True)

    def __init__(self, id, password, name, admin=False, active=True):
        self.uid = str(uuid.uuid4())
        self.created = datetime.now()
        self.updated = self.created
        self.id = id
        self.password = password
        self.name = name
        self.admin = admin
        self.active = active

    def __eq__(self, other):
        if other is None or not isinstance(other, self.__class__):
            return False
        for attr in ['uid', 'id']:
            if getattr(self, attr) != getattr(other, attr, None):
                return False
        return True

    def __repr__(self):
        return '<User %r(%r)>' % (str(self.name), str(self.id))

    @property
    def dict(self):
        return {
            'uid': self.uid,
            'created': self.created.isoformat(),
            'updated': self.updated.isoformat(),
            'id': self.id,
            'name': self.name,
            'admin': self.admin,
            'active': self.active
        }

    @property
    def password(self):
        return self._password

    @password.setter
    def password(self, passwd):
        self._password = bcrypt.hashpw((passwd + config['secret']).encode(), bcrypt.gensalt()).decode()

    def is_valid_password(self, passwd):
        return bcrypt.checkpw((passwd + config['secret']).encode(), self._password.encode())

    @staticmethod
    def find(keyword=None, admin=None, active=None, order_by=('updated_desc', ), offset=0, length=25):
        query = User.query

        if keyword:
            keyword = '%{0}%'.format(keyword)
            query = query.filter(or_(
                User.name.ilike(keyword),
                User.id.ilike(keyword)
            ))
        if admin is not None:
            query = query.filter(User.admin.is_(admin))
        if active is not None:
            query = query.filter(User.active.is_(active))

        return query.order_by(*get_orders(User, order_by)).offset(offset).limit(length).all(), query.count()
