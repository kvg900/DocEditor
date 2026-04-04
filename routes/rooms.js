const express = require('express');
const { nanoid } = require('nanoid');
const Room = require('../models/Room');

const router = express.Router();

// POST /rooms — Create a new room
router.post('/', async (req, res) => {
  try {
    const { roomName } = req.body;

    if (!roomName || !roomName.trim()) {
      return res.status(400).json({ error: 'roomName is required' });
    }

    const roomId = nanoid(10); // 10-char unique ID

    const room = await Room.create({
      roomId,
      roomName: roomName.trim(),
    });

    res.status(201).json({ roomId: room.roomId });
  } catch (err) {
    console.error('Error creating room:', err.message);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// GET /rooms — List all rooms (newest first)
router.get('/', async (_req, res) => {
  try {
    const rooms = await Room.find()
      .sort({ createdAt: -1 })
      .select('roomId roomName createdAt -_id')
      .lean();

    res.json(rooms);
  } catch (err) {
    console.error('Error fetching rooms:', err.message);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

module.exports = router;
