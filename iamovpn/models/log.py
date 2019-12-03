# -*- coding: utf-8 -*-
import database as db
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Boolean, Text, BigInteger, Integer, or_
from sqlalchemy.ext.hybrid import hybrid_property as property

from .utils import get_orders


class Log(db.Base):
    __tablename__ = 'log'

    # Fields
    uid = Column(Text, primary_key=True)
    created = Column(DateTime(timezone=False))
    updated = Column(DateTime(timezone=False))
    _log_type = Column('log_type', Text)
    connect_time = Column(DateTime(timezone=False))
    remote_ip = Column(Text)
    remote_port = Column(Integer)
    local_ip = Column(Text)
    user_id = Column(Text, index=True)
    agent = Column(Text)
    authorized = Column(Boolean)
    connected = Column(Boolean)
    in_bytes = Column(BigInteger)
    out_bytes = Column(BigInteger)
    duration = Column(BigInteger)

    def __init__(self, log_type, connect_time, remote_ip, remote_port, local_ip, user_id,
                 agent, authorized, connected, in_bytes, out_bytes, duration):
        self.uid = str(uuid.uuid4())
        self.created = datetime.now()
        self.updated = self.created
        self.log_type = log_type
        self.connect_time = connect_time
        self.remote_ip = remote_ip
        self.remote_port = remote_port
        self.local_ip = local_ip
        self.agent = agent
        self.user_id = user_id
        self.authorized = authorized
        self.connected = connected
        self.in_bytes = in_bytes
        self.out_bytes = out_bytes
        self.duration = duration

    def __eq__(self, other):
        if other is None or not isinstance(other, self.__class__):
            return False
        for attr in ['uid', 'ip', 'port', 'user_id', 'connect_time']:
            if getattr(self, attr) != getattr(other, attr, None):
                return False
        return True

    def __repr__(self):
        return '<Log %r(%r)>' % (str(self.uid), str(self.user_id))

    @property
    def log_type(self):
        return self._log_type

    @log_type.setter
    def log_type(self, v):
        if v not in ('login', 'connect', 'disconnect'):
            raise ValueError
        self._log_type = v

    @property
    def dict(self):
        return {
            'uid': self.uid,
            'log_type': self.log_type,
            'connect_time': self.connect_time.isoformat()
            if isinstance(self.connect_time, datetime) else self.connect_time,
            'created': self.created.isoformat(),
            'updated': self.updated.isoformat(),
            'remote_ip': self.remote_ip,
            'remote_port': self.remote_port,
            'local_ip': self.local_ip,
            'agent': self.agent,
            'user_id': self.user_id,
            'authorized': self.authorized,
            'connected': self.connected,
            'in_bytes': self.in_bytes,
            'out_bytes': self.out_bytes,
            'duration': self.duration
        }

    @staticmethod
    def find(keyword=None, user_id=None, remote_ip=None, remote_port=None, local_ip=None, agent=None,
             order_by=('created_desc', ), offset=0, length=25):
        query = Log.query

        if keyword:
            keyword = '%{}%'.format(keyword)
            query = query \
                .filter(or_(
                    Log.log_type.ilike(keyword),
                    Log.user_id.ilike(keyword),
                    Log.remote_ip.ilike(keyword),
                    Log.local_ip.ilike(keyword),
                    Log.agent.ilike(keyword)
                ))
        if agent:
            query = query.filter(Log.agent.ilike('%{0}%'.format(agent)))
        if user_id:
            query = query.filter(Log.user_id == user_id)
        if remote_ip:
            query = query.filter(Log.remote_ip.like('%{0}%'.format(remote_ip)))
        if remote_port:
            query = query.filter(Log.port == remote_port)
        if local_ip:
            query = query.filter(Log.remote_ip.like('%{0}%'.format(local_ip)))

        return query.order_by(*get_orders(Log, order_by)).offset(offset).limit(length).all(), query.count()
