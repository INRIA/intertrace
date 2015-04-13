from fabric.api import env, local, lcd
from fabric.colors import red, green
from fabric.decorators import task, runs_once
from fabric.operations import prompt
from fabric.utils import abort
from zipfile import ZipFile

import datetime
import fileinput
import importlib
import os
import random
import re
import subprocess
import sys
import time

PROJ_ROOT = os.path.dirname(env.real_fabfile)
env.project_name = 'intertrace'
env.python = 'python' if 'VIRTUAL_ENV' in os.environ else './bin/python'

@task
def setup():
    """
    Set up a local development environment

    This command must be run with Fabric installed globally (not inside a
    virtual environment)
    """
    if os.getenv('VIRTUAL_ENV') or hasattr(sys, 'real_prefix'):
        abort(red('Deactivate any virtual environments before continuing.'))
    make_settings()
    make_virtual_env()
    collect_static()
    print ('\nDevelopment environment successfully created.\n' +
           'Create a mysql database, enter its information into ' +
           'intertrace/settings.py, and run `fab migrate` to finish.')

@task
def test():
    "Run the test suite locally."
    with lcd(PROJ_ROOT):
        local('{python} manage.py test'.format(**env))

@task
def migrate():
    "Sync db tables and run migrations"

    new_installation = len(get_db_tables()) == 0

    with lcd(PROJ_ROOT):
        local('{python} manage.py migrate'.format(**env))
    if new_installation:
        print('\nDatabase synced.\n'+
              'run `fab create_superuser` to create a superuser and project.')

@task
def create_superuser():
    username = prompt('Username: ', validate=str)
    if username:
        local('{python} manage.py createsuperuser --username {username}'.format(
            username=username, **env))

@task
def runserver():
    "Run the development server"
    with lcd(PROJ_ROOT):
        local('{python} manage.py runserver --traceback'.format(**env))

@task
@runs_once
def make_settings():
    """
    Generate a local settings file.

    Without any arguments, this file will go in editorsnotes/settings_local.py.
    If the function is passed an argument that defines env.hosts, this file will
    be placed in the deploy directory with the name settings-{host}.py
    """
    to_create = ['intertrace/settings.py']

    for settings_file in to_create:
        secret_key = generate_secret_key()
        with lcd(PROJ_ROOT):
            for line in fileinput.input(settings_file, inplace=True):
                print line.replace("SECRET_KEY = ''",
                                   "SECRET_KEY = '{}'".format(secret_key)),

def get_db_tables():
    tables = local('{python} manage.py inspectdb | '
                   'grep "db_table =" || true'.format(**env), capture=True)
    return tables or []

def make_virtual_env():
    "Make a virtual environment for local dev use"
    with lcd(PROJ_ROOT):
        local('virtualenv .')
        local('./bin/pip install -r requirements.txt')

def collect_static():
    with lcd(PROJ_ROOT):
        local('{python} manage.py collectstatic --noinput -v0 --traceback'.format(**env))

def generate_secret_key():
    SECRET_CHARS = 'abcdefghijklmnopqrstuvwxyz1234567890-=!@#$$%^&&*()_+'
    return ''.join([random.choice(SECRET_CHARS) for i in range(50)])
