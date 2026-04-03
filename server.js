import http from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils.js';

const app = express();

// Optional health check
app.get('/', (_req, res) => {
  res.send('Yjs WebSocket server is running');
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req);
});

const port = process.env.PORT || 1234;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});