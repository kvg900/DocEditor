require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const Y = require('yjs');
const { setupWSConnection, setPersistence } = require('y-websocket/bin/utils');
const { MongodbPersistence } = require('y-mongodb-provider');
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

// ---- Yjs Persistence (MongoDB) ----
const mdb = new MongodbPersistence(process.env.MONGO_URI, {
  collectionName: 'yjs-documents',
  flushSize: 100,
  multipleCollections: false,
});

setPersistence({
  bindState: async (docName, ydoc) => {
    const persistedYdoc = await mdb.getYDoc(docName);
    const persistedState = Y.encodeStateAsUpdate(persistedYdoc);
    Y.applyUpdate(ydoc, persistedState);
    ydoc.on('update', async (update) => {
      await mdb.storeUpdate(docName, update);
    });
    console.log(`📄 Loaded persisted doc: ${docName}`);
  },
  writeState: async (docName, ydoc) => {
    await mdb.flushDocument(docName);
    console.log(`💾 Flushed doc to MongoDB: ${docName}`);
  },
});

// Store mdb in app.locals for access in routes
app.locals.mdb = mdb;

console.log('✅ Yjs persistence configured (MongoDB)');

// ---- WebSocket ----
const server = createServer(app);
const wss = new WebSocketServer({ server });

const Room = require('./models/Room');
const url = require('url');

wss.on('connection', async (ws, req) => {
  const { query } = url.parse(req.url, true);
  const { roomId, clientId } = query;

  if (!roomId) {
    console.log('❌ Connection rejected: No roomId provided');
    ws.close(4000, 'roomId is required');
    return;
  }

  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      console.log(`❌ Connection rejected: Room ${roomId} not found`);
      ws.close(4001, 'Room not found');
      return;
    }

    // Access Control Logic
    if (room.visibility === 'private' && room.createdBy !== clientId) {
      console.log(`❌ Connection rejected: Access denied to private room ${roomId}`);
      ws.close(4003, 'Access denied');
      return;
    }

    // If unlisted or public, or owner of private room, allow connection
    setupWSConnection(ws, req);
  } catch (err) {
    console.error('WebSocket connection error:', err);
    ws.close(1011, 'Internal server error');
  }
});

// ---- Start ----
const port = process.env.PORT || 1234;

connectDB().then(() => {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});