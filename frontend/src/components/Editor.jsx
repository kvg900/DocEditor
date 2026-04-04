import React, { useMemo, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import Toolbar from './Toolbar';
import { API_BASE, getWsUrl } from '../utils/network';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Users, Wifi, WifiOff } from 'lucide-react';
import './Editor.css';

// ---- Identity & Helpers ----

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F0B27A', '#82E0AA',
];

const NAMES = [
  'Cosmic Panda', 'Neon Tiger', 'Pixel Fox', 'Quantum Bear',
  'Lunar Wolf', 'Solar Eagle', 'Cyber Owl', 'Astro Cat',
  'Nebula Hawk', 'Plasma Deer', 'Vortex Lynx', 'Aurora Bat',
];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getUserName = () => {
  return localStorage.getItem('collab-editor-username') || getRandomItem(NAMES);
};

// ---- Editor Component ----

const Editor = ({ roomName, clientId }) => {
  const [users, setUsers] = useState([]);
  const [connectionState, setConnectionState] = useState('connecting');
  const [synced, setSynced] = useState(false);

  const userName = useMemo(() => getUserName(), []);
  const userColor = useMemo(() => getRandomItem(COLORS), []);

  const { ydoc, provider, indexeddbProvider } = useMemo(() => {
    const ydoc = new Y.Doc();
    const wsUrl = getWsUrl(API_BASE, roomName, clientId);
    const provider = new WebsocketProvider(wsUrl, "", ydoc);
    const indexeddbProvider = new IndexeddbPersistence(roomName, ydoc);
    
    // Listen for sync event to hide loader
    provider.on('sync', isSynced => {
      if (isSynced) setSynced(true);
    });

    return { ydoc, provider, indexeddbProvider };
  }, [roomName, clientId]);

  useEffect(() => {
    const awareness = provider.awareness;
    const handleStatus = ({ status }) => setConnectionState(status);

    awareness.setLocalStateField('user', {
      name: userName,
      color: userColor,
    });

    const updateUsers = () => {
      const states = Array.from(awareness.getStates().values());
      setUsers(states.filter((state) => state.user).map((state) => state.user));
    };

    awareness.on('change', updateUsers);
    provider.on('status', handleStatus);
    updateUsers();

    return () => {
      awareness.off('change', updateUsers);
      provider.off('status', handleStatus);
      provider.disconnect();
      indexeddbProvider.destroy();
      ydoc.destroy();
    };
  }, [provider, indexeddbProvider, ydoc, userName, userColor]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      Underline,
      Collaboration.configure({ document: ydoc }),
      CollaborationCursor.configure({
        provider: provider,
        user: { name: userName, color: userColor },
      }),
    ],
  });

  return (
    <>
      <AnimatePresence>
        {!synced && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="connection-overlay"
          >
            <div className="landing-logo-container glass mb-8" style={{ padding: '2rem' }}>
              <Sparkles className="w-12 h-12 text-purple-500" />
            </div>
            <div className="spinner mb-4" />
            <p className="connection-text">Preparing your workspace…</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="editor-view">
        <Toolbar editor={editor} roomName={roomName} />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: synced ? 1 : 0, y: synced ? 0 : 20 }}
          className="editor-card"
        >
          <EditorContent editor={editor} />
        </motion.div>

        {/* Floating Status Bar */}
        <div className="editor-status-bar glass">
          <div className="status-indicator">
            <span className={`status-dot ${connectionState}`} title={connectionState} />
            <span className="opacity-60">
              {connectionState === 'connected' 
                ? `${users.length} ${users.length === 1 ? 'person' : 'people'} editing` 
                : 'Syncing...'}
            </span>
          </div>


          <div className="flex items-center gap-2">
            <div className="users-list">
              {users.slice(0, 5).map((user, index) => (
                <div
                  key={index}
                  className="user-badge"
                  style={{ backgroundColor: user.color }}
                  title={user.name}
                >
                  {user.name[0]}
                </div>
              ))}
              {users.length > 5 && (
                <div className="user-badge" style={{ backgroundColor: '#333' }}>
                  +{users.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Editor;

