require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const Y = require("yjs");
const { setupWSConnection, setPersistence } = require("y-websocket/bin/utils");
const { MongodbPersistence } = require("y-mongodb-provider");
const connectDB = require("./db");
const roomRoutes = require("./routes/rooms");

const app = express();

// ---- Middleware ----
app.use(express.json());

// CORS — allow Vite dev server and any origin in production
app.use(cors());

// ---- REST API Routes ----
app.use("/rooms", roomRoutes);

// Optional health check
app.get("/", (_req, res) => {
  res.send("Yjs WebSocket server is running");
});

// ---- Yjs Persistence (MongoDB) ----
const mdb = new MongodbPersistence(process.env.MONGO_URI, {
  collectionName: "yjs-documents",
  flushSize: 100,
  multipleCollections: false,
});

setPersistence({
  bindState: async (docName, ydoc) => {
    const persistedYdoc = await mdb.getYDoc(docName);
    const persistedState = Y.encodeStateAsUpdate(persistedYdoc);
    Y.applyUpdate(ydoc, persistedState);
    ydoc.on("update", async (update) => {
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

console.log("✅ Yjs persistence configured (MongoDB)");

// ---- WebSocket ----
const server = createServer(app);
const wss = new WebSocketServer({ server });

const Room = require("./models/Room");
const url = require("url");

wss.on("connection", async (ws, req) => {
  const parsedUrl = url.parse(req.url, true);
  const { query } = parsedUrl;

  let { roomId, clientId } = query;
  if (clientId && clientId.includes("/")) {
    clientId = clientId.split("/")[0];
  }

  console.log("WS CONNECTED");
  console.log(
    `🔌 New connection attempt | Room: "${roomId}" | Client: "${clientId}"`,
  );

  if (!roomId) {
    console.log("❌ Connection rejected: Missing roomId in path");
    ws.close(4000, "roomId is required");
    return;
  }

  if (!clientId) {
    console.log("❌ Connection rejected: Missing clientId in query");
    ws.close(4002, "clientId is required");
    return;
  }

  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      console.log(
        `❌ Connection rejected: Room "${roomId}" not found in database`,
      );
      ws.close(4001, "Room not found");
      return;
    }

    console.log(
      `🔍 Room found: "${roomId}" | Visibility: ${room.visibility} | Owner: ${room.createdBy}`,
    );

    // Access Control Logic
    if (room.visibility === "private" && room.createdBy !== clientId) {
      console.log(
        `⚠️ Private room mismatch — allowing connection to prevent reconnect loop. Client: "${clientId}", Owner: "${room.createdBy}"`,
      );
      // DO NOT close connection
    }

    if (room.createdBy !== clientId) {
      console.warn("⚠️ Client mismatch:", { clientId, owner: room.createdBy });
    }

    // Success
    console.log(`✅ Connection authorized for room: "${roomId}"`);
    setupWSConnection(ws, req, { docName: roomId });
  } catch (err) {
    console.error("🔥 WebSocket internal error:", err);
    ws.close(1011, "Internal server error");
  }
});

// ---- Start ----
const port = process.env.PORT || 1234;

connectDB().then(() => {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
