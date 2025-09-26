#!/usr/bin/env python3
import argparse
import http.server
import os
import socketserver
from functools import partial
import subprocess

class QuietSimpleHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    # Reduce noisy console logging
    def log_message(self, format, *args):
        pass

    def _send_json(self, code: int, payload: str = '{"ok":true}'):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(payload.encode('utf-8'))

    def do_POST(self):
        # Minimal control endpoint to exit kiosk from Admin (localhost only)
        if self.path.startswith('/__exit'):
            try:
                # Try to close Chromium first (ignore errors)
                subprocess.run(['pkill', 'chromium-browser'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                subprocess.run(['pkill', '-f', 'chromium'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            except Exception:
                pass
            try:
                self._send_json(200, '{"ok":true, "message":"exiting"}')
            finally:
                # Terminate server process
                os._exit(0)
        else:
            super().do_POST()

def main():
    parser = argparse.ArgumentParser(description='Simple static file server for the kiosk (localhost only).')
    parser.add_argument('--port', type=int, default=int(os.environ.get('PORT', '8080')))
    parser.add_argument('--dir', default=os.environ.get('SERVE_DIR', os.getcwd()))
    args = parser.parse_args()

    os.chdir(args.dir)
    handler = partial(QuietSimpleHTTPRequestHandler, directory=args.dir)
    with socketserver.TCPServer(('127.0.0.1', args.port), handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass

if __name__ == '__main__':
    main()
