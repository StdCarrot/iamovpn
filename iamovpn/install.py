# -*- coding: utf-8 -*-
import os
import shutil
import wget
import subprocess
import netifaces
from IPy import IP
import database as db
from app import create_app
from models import User
from flask import render_template
from copy import deepcopy


def init_db():
    print('## Init database ##')
    db.connect()
    db.create_all()
    print('Done')


def install_ovpn_scripts(config, context):
    print('## Install openvpn callback script ##')
    context['api_host'] = '127.0.0.1' if '0.0.0.0' in config['host'] else config['host']
    context['api_port'] = config['port']
    context['api_key'] = config['api_keys'][0]

    os.makedirs(os.path.join(config['openvpn']['path'], 'scripts'), mode=0o755, exist_ok=True)
    for script_name in ['login.py', 'connect.py', 'disconnect.py', 'util.py']:
        script = render_template(os.path.join('ovpn_scripts', script_name), **context)
        script_path = os.path.join(config['openvpn']['path'], 'scripts', script_name)
        with open(script_path, 'w') as f:
            f.write(script)
        os.chmod(script_path, 0o755)
    print('Done\n')


def install_ovpn_config(config, context):
    print('## Install openvpn configuration files ##')
    ovpn_path = config['openvpn']['path']
    context = deepcopy(context)
    context.update(config['openvpn'])

    with open(os.path.join(ovpn_path, 'ca.crt')) as f:
        context['ca'] = f.read()
    with open(os.path.join(ovpn_path, 'ta.key')) as f:
        context['ta'] = f.read()

    server_conf = render_template('configurations/server.conf', **context)
    server_conf_path = os.path.join(ovpn_path, 'server.conf')
    with open(server_conf_path, 'w') as f:
        f.write(server_conf)
    os.chmod(server_conf_path, 0o600)
    print('Server configuration has saved as', server_conf_path)

    client_conf = render_template('configurations/client.ovpn', **context)
    client_conf_path = os.path.join(ovpn_path, 'client.ovpn')
    with open(client_conf_path, 'w') as f:
        f.write(client_conf)
    os.chmod(client_conf_path, 0o644)
    print('Client configuration has saved as', client_conf_path)
    print('Done\n')


def install_rsa_keys(config):
    print('## Generate and install rsa keys ##')
    ovpn_path = config['openvpn']['path']
    ez_rsa_tgz = os.path.join(ovpn_path, 'easy-rsa.tgz')
    ez_rsa_path = os.path.join(ovpn_path, 'easy-rsa')

    if os.path.exists(ez_rsa_path):
        print('easy-rsa found. skip download.')
    else:
        print('Download easy-rsa')
        wget.download(
            url='https://github.com/OpenVPN/easy-rsa/releases/download/v3.0.6/EasyRSA-unix-v3.0.6.tgz',
            out=os.path.join(ovpn_path, 'easy-rsa.tgz')
        )
        shutil.unpack_archive(ez_rsa_tgz, ovpn_path)
        shutil.move(
            os.path.join(ovpn_path, 'EasyRSA-v3.0.6'),
            ez_rsa_path
        )

    print('\nGenerate rsa keys')
    subprocess.call(['./easyrsa', 'init-pki'], cwd=ez_rsa_path)
    subprocess.call(['./easyrsa', 'build-ca', 'nopass'], cwd=ez_rsa_path)
    subprocess.call(['./easyrsa', 'gen-dh'], cwd=ez_rsa_path)
    subprocess.call(['./easyrsa', 'build-server-full', 'server', 'nopass'], cwd=ez_rsa_path)
    subprocess.call(['openvpn', '--genkey', '--secret', 'pki/ta.key'], cwd=ez_rsa_path)

    print('Install rsa keys')
    for fname in ['ca.crt', 'ta.key', 'issued/server.crt', 'private/server.key', 'dh.pem']:
        shutil.copy(
            os.path.join(ez_rsa_path, 'pki', fname),
            ovpn_path
        )
    print('Done\n')


def update_system_config(config):
    print('## Update system config')
    gws = netifaces.gateways()
    gw_dev = gws['default'][netifaces.AF_INET][1]
    vpn_net = str(IP('/'.join([config['openvpn']['network'], config['openvpn']['netmask']])))

    print('Set iptables')
    subprocess.call([
        'iptables',
        '-I', 'FORWARD',
        '-i', 'tun0',
        '-j', 'ACCEPT'])
    subprocess.call([
        'iptables',
        '-I', 'FORWARD',
        '-o', 'tun0',
        '-j', 'ACCEPT'])
    subprocess.call([
        'iptables',
        '-I', 'OUTPUT',
        '-o', 'tun0',
        '-j', 'ACCEPT'])
    subprocess.call([
        'iptables',
        '-A', 'FORWARD',
        '-i', 'tun0',
        '-o', gw_dev,
        '-j', 'ACCEPT'])
    subprocess.call([
        'iptables',
        '-t', 'nat',
        '-A', 'POSTROUTING',
        '-o', gw_dev,
        '-j', 'MASQUERADE'])
    subprocess.call([
        'iptables',
        '-t', 'nat',
        '-A', 'POSTROUTING',
        '-s', vpn_net,
        '-o', gw_dev,
        '-j', 'MASQUERADE'])
    subprocess.call([
        'iptables',
        '-t', 'nat',
        '-A', 'POSTROUTING',
        '-s', vpn_net,
        '-o', gw_dev,
        '-j', 'MASQUERADE'])

    print('Set ipv4forward')
    with open('/proc/sys/net/ipv4/ip_forward', 'w') as f:
        f.write('1')

    print('Set ipv4forward persistent')
    with open('/etc/sysctl.conf', 'a') as f:
        f.write('\nnet.ipv4.ip_forward = 1\n')

    print('Done\n')


def build_front(context):
    print('## Build web console')
    front_path = os.path.join(context['project_path'], 'iamovpn/views/front')
    subprocess.call(['npm', 'install'], cwd=front_path)
    subprocess.call(['npm', 'run', 'build'], cwd=front_path)
    print('Done\n')


def run(config):
    app = create_app(config)

    init_db()

    # Insert default admin
    if User.query.filter(User.id == 'admin').first() is None:
        db.session.add(
            User(
                'admin',
                'need2change',
                'Administrator',
                admin=True
            )
        )
        db.session.commit()

    install_rsa_keys(config)
    update_system_config(config)

    with app.app_context():
        context = {
            'venv': os.environ.get('VIRTUAL_ENV'),
            'config_path': config.path,
            'project_path': os.path.abspath(
                os.path.join(
                    os.path.dirname(os.path.abspath(__file__)),
                    '../'
                )
            )
        }
        install_ovpn_scripts(config, context)
        install_ovpn_config(config, context)
        build_front(context)

    print('Installation has been done.')
    print('Please enter below command when you start service')
    print('# systemctl restart openvpn@server')
    print('$ python3 iamovpn run standalone --config {}'.format(config.path))
