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

console.log('✅ Yjs persistence configured (MongoDB)');

// ---- WebSocket ----
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