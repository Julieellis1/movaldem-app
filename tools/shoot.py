#!/usr/bin/env python3
"""Screenshot the Movaldem app screens via CDP. One foreground run:
launches headless Chromium, captures each route, kills the browser."""
import socket, base64, json, os, sys, time, urllib.request, subprocess, signal

PORT = 9229
APP = "file:///home/hatch/workspace/movaldem-app/app/index.html"
SHOT_DIR = os.path.expanduser("~/workspace/movaldem-app/shots")
os.makedirs(SHOT_DIR, exist_ok=True)
USER_DIR = "/tmp/movapp-shot-profile"
CHROME = "/opt/meta-chromium/chrome"

ROUTES = [
    ("splash", "#/splash", False),
    ("home", "#/home", True),
    ("events", "#/events", True),
    ("quiz", "#/quiz", True),
    ("quizplay", "#/quiz/play", True),
    ("gallery", "#/gallery", True),
]

def get_ws_url():
    for _ in range(60):
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/list", timeout=3) as r:
                targets = json.loads(r.read().decode())
            for t in targets:
                if t.get("type") == "page" and "index.html" in t.get("url", "") and "webSocketDebuggerUrl" in t:
                    return t["webSocketDebuggerUrl"]
        except Exception:
            pass
        time.sleep(1)
    raise RuntimeError("no debuggable app page")

class WS:
    def __init__(self, url):
        hostport, path = url[5:].split("/", 1)
        host, port = hostport.split(":")
        self.s = socket.create_connection((host, int(port)), timeout=30)
        key = base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((
            f"GET /{path} HTTP/1.1\r\nHost: {hostport}\r\nUpgrade: websocket\r\n"
            f"Connection: Upgrade\r\nSec-WebSocket-Key: {key}\r\n"
            f"Sec-WebSocket-Version: 13\r\n\r\n").encode())
        data = b""
        while b"\r\n\r\n" not in data:
            data += self.s.recv(4096)
        if b"101" not in data.split(b"\r\n")[0]:
            raise RuntimeError("WS handshake failed")
        self.buf = b""
        self.msg_id = 0
    def send(self, method, params=None):
        self.msg_id += 1
        payload = json.dumps({"id": self.msg_id, "method": method, "params": params or {}})
        body = payload.encode()
        # client-to-server frames MUST be masked (RFC 6455)
        mask_key = os.urandom(4)
        masked = bytes(b ^ mask_key[i % 4] for i, b in enumerate(body))
        n = len(masked)
        frame = bytes([0x81])
        if n < 126:
            frame += bytes([0x80 | n])
        elif n < 65536:
            frame += bytes([0x80 | 126]) + n.to_bytes(2, "big")
        else:
            frame += bytes([0x80 | 127]) + n.to_bytes(8, "big")
        frame += mask_key + masked
        self.s.sendall(frame)
        return self.msg_id
    def recv_msg(self, want_id, timeout=25):
        end = time.time() + timeout
        while time.time() < end:
            # ensure we have a full frame header
            while len(self.buf) < 2 and time.time() < end:
                chunk = self.s.recv(65536)
                if not chunk:
                    raise RuntimeError("socket closed")
                self.buf += chunk
            if len(self.buf) < 2:
                continue
            opcode = self.buf[0] & 0x0F
            ln = self.buf[1] & 0x7F
            idx = 2
            if ln == 126:
                while len(self.buf) < 4 and time.time() < end:
                    self.buf += self.s.recv(65536)
                ln = int.from_bytes(self.buf[2:4], "big"); idx = 4
            elif ln == 127:
                while len(self.buf) < 10 and time.time() < end:
                    self.buf += self.s.recv(65536)
                ln = int.from_bytes(self.buf[2:10], "big"); idx = 10
            while len(self.buf) < idx + ln and time.time() < end:
                chunk = self.s.recv(65536)
                if not chunk:
                    raise RuntimeError("socket closed")
                self.buf += chunk
            if len(self.buf) < idx + ln:
                continue
            payload = self.buf[idx:idx + ln]
            self.buf = self.buf[idx + ln:]
            if opcode == 0x8:
                raise RuntimeError("ws closed by peer")
            if opcode != 0x1:
                continue
            try:
                msg = json.loads(payload.decode())
            except Exception:
                continue
            if msg.get("id") == want_id:
                if "error" in msg:
                    raise RuntimeError("CDP error: " + json.dumps(msg["error"]))
                return msg
        raise RuntimeError("timeout waiting for response")

    def evaluate(self, expr):
        mid = self.send("Runtime.evaluate", {"expression": expr, "awaitPromise": True})
        return self.recv_msg(mid)

def main():
    proc = subprocess.Popen([
        CHROME, "--headless=new", f"--remote-debugging-port={PORT}",
        "--user-data-dir=" + USER_DIR, "--no-sandbox",
        "--window-size=414,900", "--hide-scrollbars",
        APP + "#/splash",
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        ws = WS(get_ws_url())
        # wait for fonts/render; first shot is the splash (no session yet)
        time.sleep(4)
        mid = ws.send("Page.captureScreenshot", {"format": "png"})
        res = ws.recv_msg(mid)
        out = os.path.join(SHOT_DIR, "splash.png")
        with open(out, "wb") as f:
            f.write(base64.b64decode(res["result"]["data"]))
        print("saved", out, flush=True)
        # seed a demo session, then walk the tabs
        ws.evaluate("localStorage.setItem('movaldem.session', JSON.stringify({name:'Sarah Member',email:'sarah@example.com',username:'sarah@example.com'}))")
        for name, route, preview in ROUTES[1:]:
            ws.evaluate(f"location.hash='{route}'")
            time.sleep(2.5)
            mid = ws.send("Page.captureScreenshot", {"format": "png"})
            res = ws.recv_msg(mid)
            out = os.path.join(SHOT_DIR, name + ".png")
            with open(out, "wb") as f:
                f.write(base64.b64decode(res["result"]["data"]))
            print("saved", out, flush=True)
    finally:
        proc.terminate()
        try: proc.wait(timeout=8)
        except Exception: proc.kill()

if __name__ == "__main__":
    main()
