Real-Time Collaborative Editor with AI Summarization

This project is a real-time collaborative text editor where multiple users can work on the same document simultaneously. It is built using Yjs (CRDT), TipTap, and WebSockets to handle synchronization between users.

Alongside real-time editing, the editor includes a basic AI summarization feature that can generate a summary of the document content.

Features
Real-time collaborative editing across multiple users
Shared document state using Yjs (CRDT)
Room-based sessions for collaboration
WebSocket-based communication
AI-based text summarization
Rich text editing using TipTap
Tech Stack
Frontend: React, TipTap
Backend: Node.js, WebSockets
Synchronization: Yjs (CRDT)
AI: API-based summarization (Hugging Face or similar)
How it works

Each document is associated with a room ID. Users joining the same room share a common Yjs document.

Changes made by any user are propagated through the WebSocket server and merged using CRDT, ensuring that all users see a consistent state without conflicts.

The summarization feature takes the current document content and returns a condensed version using an external AI API.

Running locally
Start the backend server
Start the frontend
Open the same URL in two tabs:
http://localhost:5173/doc/test123

Editing in one tab should reflect in the other in real time.

Limitations
No persistent storage (documents reset when server restarts)
Cursor/presence handling is not fully stable
Basic error handling
What I learned

This project was mainly an exploration of real-time systems and shared state management.
I worked with CRDTs (Yjs), WebSockets, and handled issues related to synchronization and multi-user editing.

It also gave me a chance to experiment with integrating an AI feature into an interactive system.

Future improvements
Add persistence using a database
Improve presence and cursor handling
Better UI/UX for collaboration
Add user authentication
Extend AI features beyond summarization
Note

This project was built as a learning exercise to explore real-time collaboration and system design concepts.
