# DocFlow – Real-Time Collaborative Editor

DocFlow is a full-stack real-time collaborative writing platform designed to explore how shared state systems work in multi-user environments. It allows multiple users to edit the same document simultaneously while maintaining consistency across all clients using CRDTs (Conflict-free Replicated Data Types).

The editor is built using Yjs for synchronization, TipTap for rich text editing, and WebSockets for real-time communication. In addition to collaboration, the platform includes document management features and an AI-powered summarization tool to enhance usability.

---

## Overview

The goal of this project was to understand how real-time collaboration systems function beyond basic socket communication. Instead of relying on simple broadcast updates, the system uses Yjs to handle conflict resolution and merging of edits across multiple users without data loss.

The project also explores how AI features can be layered on top of interactive systems, rather than being used in isolation.

---

## Key Features

### Real-Time Collaboration

- Multiple users can edit the same document simultaneously
- Changes are reflected instantly across all connected clients
- Built using Yjs (CRDT) to ensure conflict-free updates

### Room-Based System

- Each document is associated with a unique room ID
- Users can join via shareable links
- Supports different visibility modes (public / unlisted / private)

### Presence and Awareness

- Displays active users in a document session
- Maintains user identity across a session
- Cursor/presence system implemented (basic level)

### Rich Text Editing

- Built with TipTap (ProseMirror)
- Supports formatting such as headings, lists, bold, italic, etc.

### Document Management

- Explore public rooms
- View previously accessed documents (local history)
- Access-controlled room entry

### Export Options

- Export document as PDF (via print flow)
- Export document as HTML

### AI Summarization

- Generate summaries of document content
- Supports multiple providers (Hugging Face, OpenAI, Gemini)
- Designed as an assistive feature within the editor workflow

### UI Features

- Light/Dark mode with persistent theme
- Responsive layout
- Basic animations for smoother interaction

---

## Tech Stack

### Frontend

- React (Vite)
- TipTap Editor (ProseMirror)
- Yjs (y-websocket, y-indexeddb)
- React Router

### Backend

- Node.js + Express
- WebSocket server (ws)
- MongoDB with Mongoose
- Yjs persistence (y-mongodb-provider)

### AI Integration

- Using Gemini-2.5 flash

---

## Architecture

The system is divided into two main parts:

### 1. Real-Time Collaboration Layer

- Each room corresponds to a shared Y.Doc
- Clients connect via WebSocket provider
- Updates are propagated and merged using CRDT logic
- Local persistence is handled using IndexedDB for resilience

### 2. Backend Layer

- Handles room creation, deletion, and access control
- Stores room metadata in MongoDB
- Persists Yjs document updates using MongoDB provider
- Provides API endpoint for summarization (Hugging Face)

---

## How Synchronization Works

When a user joins a room:

1. A shared Yjs document is initialized or loaded
2. The client connects to the WebSocket server
3. Changes made in the editor are converted into Yjs updates
4. Updates are broadcast to all connected clients
5. CRDT ensures that all changes are merged consistently without conflicts

This approach avoids issues like overwriting content or race conditions that occur in naive real-time implementations.

---

## Running Locally

### Start backend

```bash
node server.js
```
