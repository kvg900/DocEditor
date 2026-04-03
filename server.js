const express = require('express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { setupWSConnection } = require('y-websocket/bin/utils');

const app = express();

// Optional health check
app.get('/', (_req, res) => {
  res.send('Yjs WebSocket server is running');
});

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req);
});

const port = process.env.PORT || 1234;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});