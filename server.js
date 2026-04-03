import express from 'express';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import yWebsocketUtils from 'y-websocket/bin/utils';

const { setupWSConnection } = yWebsocketUtils;

const app = express();

app.get('/', (_request, response) => {
  response.status(200).send('ok');
});

const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', setupWSConnection);

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

const port = Number.parseInt(process.env.PORT ?? '1234', 10);

server.listen(port, () => {
  console.log(`y-websocket server listening on port ${port}`);
});
