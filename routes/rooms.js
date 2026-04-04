const express = require('express');
const { nanoid } = require('nanoid');
const Room = require('../models/Room');

const router = express.Router();

// POST /rooms — Create a new room
router.post('/', async (req, res) => {
  try {
    const { roomName, clientId, visibility } = req.body;

    if (!roomName || !roomName.trim()) {
      return res.status(400).json({ error: 'roomName is required' });
    }

    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }

    const roomId = nanoid(10); // 10-char unique ID

    const room = await Room.create({
      roomId,
      roomName: roomName.trim(),
      createdBy: clientId,
      visibility: visibility || 'private',
    });

    res.status(201).json({ roomId: room.roomId });
  } catch (err) {
    console.error('Error creating room:', err.message);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// GET /rooms — List filtered rooms (owned + public)
router.get('/', async (req, res) => {
  try {
    const clientId = req.query.clientId || req.headers['x-client-id'];

    // If no clientId, only show public rooms
    const query = clientId
      ? { $or: [{ createdBy: clientId }, { visibility: 'public' }] }
      : { visibility: 'public' };

    const rooms = await Room.find(query)
      .sort({ createdAt: -1 })
      .select('roomId roomName createdAt createdBy visibility -_id')
      .lean();

    res.json(rooms);
  } catch (err) {
    console.error('Error fetching rooms:', err.message);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// DELETE /rooms/:roomId — Delete room metadata and Yjs doc
router.delete('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const clientId = req.query.clientId || req.headers['x-client-id'];

    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required to verify ownership' });
    }

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Verify ownership
    if (room.createdBy !== clientId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this room' });
    }

    // Delete Room Metadata
    await Room.deleteOne({ roomId });

    // Clear Yjs Document State
    const mdb = req.app.locals.mdb;
    if (mdb) {
      await mdb.clearDocument(roomId);
      console.log(`🗑️ Cleared Yjs document state for room: ${roomId}`);
    }

    res.json({ message: 'Room and document data deleted successfully' });
  } catch (err) {
    console.error('Error deleting room:', err.message);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

// GET /rooms/:roomId/access — Check access before connecting
router.get('/:roomId/access', async (req, res) => {
  try {
    const { roomId } = req.params;
    const clientId = req.query.clientId || req.headers['x-client-id'];

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.json({ allowed: false, reason: 'not_found' });
    }

    // Access Control Logic
    if (room.visibility === 'private' && room.createdBy !== clientId) {
      return res.json({ allowed: false, reason: 'private' });
    }

    res.json({ allowed: true });
  } catch (err) {
    console.error('Error checking room access:', err.message);
    res.status(500).json({ error: 'Failed to check access' });
  }
});

module.exports = router;
