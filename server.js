require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { setupWSConnection } = require('y-websocket/bin/utils');
const connectDB = require('./db');
const roomRoutes = require('./routes/rooms');

const app = express();

// ---- Middleware ----
app.use(express.json());

// CORS — allow Vite dev server and any origin in production
app.use(cors());

// ---- REST API Routes ----
app.use('/rooms', roomRoutes);

// Optional health check
app.get('/', (_req, res) => {
  res.send('Yjs WebSocket server is running');
});

// ---- WebSocket (UNCHANGED) ----
const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req);
});

// ---- Start ----
const port = process.env.PORT || 1234;

connectDB().then(() => {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});