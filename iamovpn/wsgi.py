from app import create_app
import config

config.load('./config.json')
app = create_app(config)
