# -*- coding: utf-8 -*-
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker, configure_mappers
from sqlalchemy.ext.declarative import declarative_base
import config

Base = declarative_base()
session = None
engine = None


def connect():
    global session
    global engine
    engine = create_engine(config['db_url'])
    session = scoped_session(sessionmaker(autocommit=False,
                                          autoflush=False,
                                          bind=engine))
    Base.query = session.query_property()


def create_all():
    import models
    configure_mappers()
    Base.metadata.create_all(bind=engine)
    session.commit()


def drop_all():
    import models
    configure_mappers()
    Base.metadata.drop_all(bind=engine)
    session.commit()
