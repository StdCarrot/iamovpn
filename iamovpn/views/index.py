import os.path
import json
from flask import Blueprint, render_template
import config

view_path = os.path.abspath(os.path.dirname(__file__))
app = Blueprint(
    'view.index',
    __name__,
    template_folder=os.path.join(view_path, 'templates'),
    static_folder=os.path.join(view_path, 'front/build/static')
)
_assets = None
_manifest = None


def get_assets():
    global _assets
    if _assets is None or len(_assets) == 0:
        asset_manifest_path = os.path.join(view_path, 'front/build/asset-manifest.json')
        if not os.path.exists(asset_manifest_path):
            raise RuntimeError('You MUST build front page before using views')
        _assets = {'js': {}, 'css': {}}
        with open(asset_manifest_path, 'r') as f:
            for asset in json.load(f)['entrypoints']:
                if asset.endswith('.js'):
                    if 'runtime' in asset:
                        _assets['js']['runtime'] = asset
                    elif 'main' in asset:
                        _assets['js']['main'] = asset
                    else:
                        _assets['js']['bundle'] = asset
                elif asset.endswith('.css'):
                    if 'main' in asset:
                        _assets['css']['main'] = asset
                    else:
                        _assets['css']['bundle'] = asset

    return _assets


@app.route('/')
@app.route('/my')
@app.route('/login')
@app.route('/dashboard')
def index():
    context = get_assets()
    context.update({
        'host': config['openvpn']['host'] if '0.0.0.0' in config['host'] else config['host'],
        'port': config['port']
    })
    return render_template('index.html', **context)
