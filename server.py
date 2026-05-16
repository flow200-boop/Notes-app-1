import http.server
import socketserver
import json
import os

PORT = 8000
NOTES_FILE = 'notes.json'

# Ensure notes.json exists
if not os.path.exists(NOTES_FILE):
    with open(NOTES_FILE, 'w') as f:
        json.dump([], f)

class NotesHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/notes':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            with open(NOTES_FILE, 'r') as f:
                self.wfile.write(f.read().encode())
        else:
            return super().do_GET()

    def do_POST(self):
        if self.path == '/api/notes':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Write directly to notes.json
            with open(NOTES_FILE, 'w') as f:
                f.write(post_data.decode('utf-8'))
                
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success"}).encode())
        else:
            self.send_response(404)
            self.end_headers()

with socketserver.TCPServer(("", PORT), NotesHandler) as httpd:
    print(f"Notes App Server running at: http://localhost:{PORT}")
    print("Press Ctrl+C to stop.")
    httpd.serve_forever()
