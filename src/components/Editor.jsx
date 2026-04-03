/**
 * Editor Component
 *
 * The core collaborative editor. This component:
 * 1. Creates a Yjs document (Y.Doc) for CRDT-based conflict-free editing
 * 2. Connects to a y-websocket server for real-time sync
 * 3. Initializes TipTap with Collaboration + CollaborationCursor extensions
 * 4. Assigns each user a random name and color for presence awareness
 *
 * [ADDED] Accepts `roomName` prop for dynamic room-based collaboration
 * [ADDED] y-indexeddb for local persistence across refreshes
 * [ADDED] Custom user name via prompt + localStorage
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';  // [ADDED] local persistence
import Toolbar from './Toolbar';

// ---- Random User Identity ----

/** A palette of distinct colors for user cursors */
const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F0B27A', '#82E0AA',
];

/** Fun placeholder names assigned randomly to each user session */
const NAMES = [
  'Cosmic Panda', 'Neon Tiger', 'Pixel Fox', 'Quantum Bear',
  'Lunar Wolf', 'Solar Eagle', 'Cyber Owl', 'Astro Cat',
  'Nebula Hawk', 'Plasma Deer', 'Vortex Lynx', 'Aurora Bat',
];

/**
 * Picks a random item from the given array.
 * Used to assign each tab/user a unique color and name.
 */
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---- [ADDED] Custom User Name via localStorage ----

/**
 * Get the user's display name from localStorage.
 * The join screen sets this before the editor loads.
 * Falls back to a random fun name if somehow missing.
 */
const getUserName = () => {
  return localStorage.getItem('collab-editor-username') || getRandomItem(NAMES);
};

// ---- [CHANGED] Editor now accepts roomName prop ----

const Editor = ({ roomName }) => {
  // Track connected users from the awareness protocol
  const [users, setUsers] = useState([]);

  /**
   * useMemo ensures the Yjs document and WebSocket provider
   * are created only once per component lifecycle.
   *
   * - Y.Doc: The shared CRDT document that handles merge conflicts
   * - WebsocketProvider: Connects to the y-websocket server at ws://localhost:1234
   *   and syncs the Y.Doc across all connected clients
   * - [CHANGED] Room name now comes from the roomName prop (URL-based)
   * - [ADDED] IndexeddbPersistence for local offline persistence
   */
  // [CHANGED] Use custom name from localStorage instead of random name
  const userName = useMemo(() => getUserName(), []);
  const userColor = useMemo(() => getRandomItem(COLORS), []);

  const { ydoc, provider, indexeddbProvider } = useMemo(() => {
    const ydoc = new Y.Doc();

    // [CHANGED] Use dynamic roomName from URL instead of hardcoded string
    const provider = new WebsocketProvider(
      'wss://collaborative-editor-9djr.onrender.com', // y-websocket server URL
      roomName,                       // [CHANGED] Dynamic room name from URL
      ydoc
    );

    // [ADDED] Persist document locally in IndexedDB, keyed by room name
    const indexeddbProvider = new IndexeddbPersistence(roomName, ydoc);

    return { ydoc, provider, indexeddbProvider };
  }, [roomName]);

  /**
   * Set the local user identity on the awareness protocol and
   * listen for awareness changes (users joining/leaving/moving cursor).
   */
  useEffect(() => {
    const awareness = provider.awareness;

    // Explicitly set this tab's unique identity on the awareness protocol
    // This ensures each tab broadcasts its own distinct name + color
    awareness.setLocalStateField('user', {
      name: userName,
      color: userColor,
    });

    const updateUsers = () => {
      const states = Array.from(awareness.getStates().values());
      // Filter out entries without a user property
      setUsers(states.filter((state) => state.user).map((state) => state.user));
    };

    // Listen for changes in the awareness protocol
    awareness.on('change', updateUsers);

    // Initial read
    updateUsers();

    // Cleanup: disconnect provider & destroy doc on unmount
    return () => {
      awareness.off('change', updateUsers);
      provider.disconnect();
      indexeddbProvider.destroy();  // [ADDED] clean up IndexedDB provider
      ydoc.destroy();
    };
  }, [provider, indexeddbProvider, ydoc, userName, userColor]);

  /**
   * Initialize the TipTap editor with all extensions:
   *
   * - StarterKit: Core features (paragraphs, headings, bold, italic, lists, etc.)
   *   We disable the built-in history because Yjs has its own undo manager.
   *
   * - Underline: Adds Ctrl+U / Cmd+U support
   *
   * - Collaboration: Binds TipTap's ProseMirror document to a Yjs XML fragment,
   *   enabling conflict-free collaborative editing via CRDTs.
   *
   * - CollaborationCursor: Shows each user's cursor position and name label
   *   using the awareness protocol from y-websocket.
   */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Yjs handles undo/redo — disable ProseMirror's history
      }),
      Underline,
      Collaboration.configure({
        document: ydoc, // Bind to our shared Yjs document
      }),
      CollaborationCursor.configure({
        provider: provider, // Awareness provider for cursor sync
        user: {
          name: userName,
          color: userColor,
        },
      }),
    ],
  });

  return (
    <div className="editor-container">
      {/* Formatting toolbar */}
      <Toolbar editor={editor} />

      {/* The actual editable area rendered by TipTap */}
      <EditorContent editor={editor} />

      {/* Status bar showing connection state and online users */}
      <div className="status-bar">
        <span className="status-dot" />
        <span>Connected as <strong>{userName}</strong></span>

        {/* Display avatars for all connected users */}
        <div className="connected-users">
          {users.map((user, index) => (
            <div
              key={index}
              className="user-avatar"
              style={{ backgroundColor: user.color }}
              title={user.name}
            >
              {/* Show initials (first letter of each word) */}
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Editor;
