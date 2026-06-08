import http.server
import json
import os

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/log_error':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                error_info = json.loads(post_data.decode('utf-8'))
                print("ERROR FROM BROWSER:", error_info, flush=True)
                with open("browser_errors.txt", "a", encoding="utf-8") as f:
                    f.write(json.dumps(error_info, indent=2) + "\n")
            except Exception as e:
                print("Failed to log error:", e, flush=True)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    port = 8085
    server_address = ('', port)
    httpd = http.server.HTTPServer(server_address, CustomHandler)
    print(f"Starting custom server on port {port}...", flush=True)
    httpd.serve_forever()
