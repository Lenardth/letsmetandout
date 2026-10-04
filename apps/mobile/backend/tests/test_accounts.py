"""Account/API integration checks against an isolated temporary database."""
import json
import os
from pathlib import Path
import socket
import sqlite3
import subprocess
import sys
import tempfile
import time
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen


class AccountsTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.directory = tempfile.TemporaryDirectory()
        cls.db = Path(cls.directory.name) / 'accounts.db'
        cls.log = tempfile.TemporaryFile(mode='w+')
        with socket.socket() as sock:
            sock.bind(('127.0.0.1', 0))
            port = sock.getsockname()[1]
        cls.url = f'http://127.0.0.1:{port}'
        env = dict(os.environ, DEBUG='true', DATABASE_URL=f'sqlite:///{cls.db}', SECRET_KEY='isolated-test-secret')
        cls.server = subprocess.Popen([sys.executable, '-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', str(port)], cwd=Path(__file__).resolve().parents[1], env=env, stdout=cls.log, stderr=cls.log)
        for _ in range(300):
            try:
                with urlopen(cls.url + '/health', timeout=1):
                    return
            except OSError:
                if cls.server.poll() is not None:
                    break
                time.sleep(.1)
        cls.server.terminate()
        cls.server.wait(timeout=10)
        cls.log.seek(0)
        output = cls.log.read()
        cls.log.close()
        cls.directory.cleanup()
        raise RuntimeError('Test API did not start: ' + output)

    @classmethod
    def tearDownClass(cls):
        cls.server.terminate()
        cls.server.wait(timeout=10)
        cls.log.close()
        cls.directory.cleanup()

    def request(self, path, body=None, token=None, method=None):
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = 'Bearer ' + token
        request = Request(self.url + '/api/v1' + path, data=json.dumps(body).encode() if body is not None else None, headers=headers, method=method)
        try:
            with urlopen(request, timeout=10) as response:
                return response.status, json.load(response)
        except HTTPError as error:
            return error.code, json.load(error)

    def test_real_account_flow(self):
        self.assertIn(self.request('/discover/users')[0], (401, 403))
        payload = dict(first_name='Account', last_name='Test', email='account@example.com', phone='+27821234567', password='test-pass-123', city='Cape Town', province='Western Cape', bio='Integration fixture', interests=['Books', 'Walking'], terms_accepted=True, privacy_accepted=True, safety_guidelines_accepted=True)
        status, profile = self.request('/auth/register', payload)
        self.assertEqual(status, 201, profile)
        self.assertEqual(profile['interests'], ['Books', 'Walking'])
        self.assertNotIn('password_hash', profile)
        self.assertEqual(self.request('/auth/register', payload)[0], 400)
        self.assertEqual(self.request('/auth/register', dict(payload, email='second@example.com'))[0], 400)
        self.assertEqual(self.request('/auth/login', dict(email=payload['email'], password='wrong'))[0], 401)
        status, session = self.request('/auth/login', dict(email=payload['email'], password=payload['password']))
        self.assertEqual(status, 200, session)
        token = session['access_token']
        self.assertEqual(self.request('/auth/me', token=token)[1]['id'], profile['id'])
        self.assertEqual(self.request('/discover/users', token=token)[1], [])
        self.assertEqual(self.request('/users/me', {'bio': 'Updated bio'}, token, 'PUT')[1]['bio'], 'Updated bio')
        self.assertEqual(self.request('/users/me', {'city': ''}, token, 'PUT')[0], 422)
        self.assertEqual(self.request('/users/' + str(profile['id']), token=token)[0], 200)
        self.assertNotIn('email', self.request('/users/' + str(profile['id']), token=token)[1])
        for path in ['/groups', '/plans', '/bookings', '/stores', '/wallet/summary']:
            self.assertEqual(self.request(path, token=token)[0], 200)
        with sqlite3.connect(self.db) as db:
            db.execute('CREATE TABLE wallet_transactions (id INTEGER PRIMARY KEY, user_id INTEGER, amount REAL, created_at TEXT)')
            db.execute('CREATE TABLE bookings (id INTEGER PRIMARY KEY, user_id INTEGER, title TEXT)')
            db.executemany('INSERT INTO wallet_transactions (user_id, amount, created_at) VALUES (?, ?, ?)', [(profile['id'], 10, '2026-10-04')] * 25 + [(999, 9000, '2026-10-04')])
            db.executemany('INSERT INTO bookings (user_id, title) VALUES (?, ?)', [(profile['id'], 'Own booking'), (999, 'Someone else')])
        wallet = self.request('/wallet/summary?user_id=999', token=token)[1]
        self.assertEqual(wallet['balance'], 250)
        self.assertEqual(len(wallet['transactions']), 20)
        self.assertEqual(self.request('/bookings', token=token)[1][0]['title'], 'Own booking')
        self.assertEqual(len(self.request('/bookings', token=token)[1]), 1)
        with sqlite3.connect(self.db) as db:
            db.execute('UPDATE users SET city = NULL WHERE id = ?', (profile['id'],))
        self.assertEqual(self.request('/discover/users', token=token)[0], 403)
        self.assertEqual(self.request('/users/me', {'city': 'Durban', 'province': 'KwaZulu-Natal'}, token, 'PUT')[0], 200)
        self.assertEqual(self.request('/discover/users', token=token)[0], 200)
        self.assertEqual(self.request('/auth/me', token='invalid')[0], 401)
        self.assertEqual(self.request('/auth/register', dict(payload, email='incomplete@example.com', phone='+27821234568', city=''))[0], 422)


if __name__ == '__main__':
    unittest.main()
