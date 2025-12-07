#!/usr/bin/env python3
import argparse
import http.server
import os
import socketserver
import subprocess
import json
from functools import partial

DATA_DIR = os.environ.get('DATA_DIR', os.getcwd())
MISSIONS_FILE = os.path.join(DATA_DIR, 'missions.json')
SETTINGS_FILE = os.path.join(DATA_DIR, 'config.json')

class QuietSimpleHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def _send_json(self, code: int, payload: str = '{"ok":true}'):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(payload.encode('utf-8'))

    def _read_body(self):
        content_len = int(self.headers.get('Content-Length', 0))
        return self.rfile.read(content_len)

    def do_GET(self):
        if self.path == '/api/missions':
            try:
                with open(MISSIONS_FILE, 'r') as f:
                    self._send_json(200, f.read())
            except FileNotFoundError:
                self._send_json(200, '[]') # Return empty list if no missions yet
            except Exception as e:
                self._send_json(500, f'{{"ok":false, "error":"{str(e)}"}}')
        
        elif self.path == '/api/settings':
            try:
                with open(SETTINGS_FILE, 'r') as f:
                    self._send_json(200, f.read())
            except FileNotFoundError:
                self._send_json(200, '{}') # Return empty object if no settings yet
            except Exception as e:
                self._send_json(500, f'{{"ok":false, "error":"{str(e)}"}}')

        else:
            # Fallback to serving files
            return http.server.SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        if self.path == '/api/missions':
            try:
                body = self._read_body()
                # Basic validation
                json.loads(body)
                with open(MISSIONS_FILE, 'w') as f:
                    f.write(body.decode('utf-8'))
                self._send_json(200, '{"ok":true, "message":"missions saved"}')
            except Exception as e:
                self._send_json(500, f'{{"ok":false, "error":"{str(e)}"}}')

        elif self.path == '/api/settings':
            try:
                body = self._read_body()
                # Basic validation
                json.loads(body)
                with open(SETTINGS_FILE, 'w') as f:
                    f.write(body.decode('utf-8'))
                self._send_json(200, '{"ok":true, "message":"settings saved"}')
            except Exception as e:
                self._send_json(500, f'{{"ok":false, "error":"{str(e)}"}}')

        elif self.path.startswith('/__exit'):
            try:
                subprocess.run(['pkill', 'chromium-browser'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                subprocess.run(['pkill', '-f', 'chromium'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            except Exception:
                pass
            try:
                self._send_json(200, '{"ok":true, "message":"exiting"}')
            finally:
                os._exit(0)
        else:
            self.send_error(404)

def main():
    parser = argparse.ArgumentParser(description='Simple static file server for the kiosk (localhost only).')
    parser.add_argument('--port', type=int, default=int(os.environ.get('PORT', '8080')))
    parser.add_argument('--dir', default=os.environ.get('SERVE_DIR', os.getcwd()))
    args = parser.parse_args()

    # Ensure data files exist
    if not os.path.exists(MISSIONS_FILE):
        with open(MISSIONS_FILE, 'w') as f:
            f.write('[]')
    if not os.path.exists(SETTINGS_FILE):
        with open(SETTINGS_FILE, 'w') as f:
            f.write('{}')

    os.chdir(args.dir)
    handler = partial(QuietSimpleHTTPRequestHandler, directory=args.dir)
    with socketserver.TCPServer(('127.0.0.1', args.port), handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass

if __name__ == '__main__':
    main()
