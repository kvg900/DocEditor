/**
 * Toolbar Component
 *
 * Renders formatting buttons (Bold, Italic, Underline) for the TipTap editor.
 * Each button reads the editor's active state to show whether the format
 * is currently applied at the cursor position.
 */

import React from 'react';

const Toolbar = ({ editor }) => {
  // Don't render if the editor isn't ready yet
  if (!editor) return null;

  return (
    <div className="toolbar">
      {/* Bold toggle — Ctrl+B / Cmd+B */}
      <button
        className={`toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >
        B
      </button>

      {/* Italic toggle — Ctrl+I / Cmd+I */}
      <button
        className={`toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </button>

      {/* Underline toggle — Ctrl+U / Cmd+U */}
      <button
        className={`toolbar-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline (Ctrl+U)"
      >
        <u>U</u>
      </button>

      {/* Visual separator */}
      <div className="toolbar-divider" />

      {/* Heading 1 toggle */}
      <button
        className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Heading 1"
      >
        H1
      </button>

      {/* Heading 2 toggle */}
      <button
        className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        H2
      </button>

      {/* Visual separator */}
      <div className="toolbar-divider" />

      {/* Bullet list toggle */}
      <button
        className={`toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        •
      </button>
    </div>
  );
};

export default Toolbar;
