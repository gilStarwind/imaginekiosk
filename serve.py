#!/usr/bin/env python3
import argparse
import http.server
import os
import socketserver
from functools import partial

class QuietSimpleHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    # Reduce noisy console logging
    def log_message(self, format, *args):
        pass

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

