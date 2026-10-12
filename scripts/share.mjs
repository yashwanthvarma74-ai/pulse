// One address for the whole app, so a single tunnel can put it on the internet.
//
//   node scripts/share.mjs            listens on :8080
//
// "/ws" goes to the API (WebSocket), everything else to the web app, which proxies "/api" itself.
import http from 'node:http';
import net from 'node:net';

const PORT = Number(process.env.SHARE_PORT ?? 8080);
const WEB = { host: '127.0.0.1', port: Number(process.env.WEB_PORT ?? 3200) };
const API = { host: '127.0.0.1', port: Number(process.env.API_PORT ?? 4201) };

const target = (url = '') => (url === '/ws' || url.startsWith('/ws?') ? API : WEB);

const server = http.createServer((req, res) => {
  const upstream = http.request(
    { ...target(req.url), path: req.url, method: req.method, headers: req.headers },
    (answer) => {
      res.writeHead(answer.statusCode ?? 502, answer.headers);
      answer.pipe(res);
    },
  );
  upstream.on('error', () => {
    res.writeHead(502).end('The app is not running.');
  });
  req.pipe(upstream);
});

// WebSocket upgrades are copied byte for byte to the API
server.on('upgrade', (req, socket, head) => {
  const upstream = net.connect(target(req.url), () => {
    const headers = Object.entries(req.headers).map(([key, value]) => `${key}: ${value}`);
    upstream.write(`${req.method} ${req.url} HTTP/1.1\r\n${headers.join('\r\n')}\r\n\r\n`);
    upstream.write(head);
    socket.pipe(upstream).pipe(socket);
  });
  upstream.on('error', () => socket.destroy());
  socket.on('error', () => upstream.destroy());
});

server.listen(PORT, () => console.log(`Everything is on http://localhost:${PORT}`));
