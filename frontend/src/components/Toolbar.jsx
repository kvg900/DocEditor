import React from 'react';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Heading1, 
  Heading2, 
  List, 
  Copy,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Toolbar.css';

const Toolbar = ({ editor, roomName }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  if (!editor) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/doc/${roomName}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <div className="toolbar-wrapper glass">
      <button 
        className="toolbar-btn" 
        onClick={() => navigate('/dashboard')}
        title="Back to Dashboard"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          className={`toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
      </div>

      <div className="room-identity">
        <span className="room-id-badge" title={roomName}>
          {roomName.length > 10 ? `${roomName.substring(0, 10)}...` : roomName}
        </span>
        <button 
          className="copy-btn-mini" 
          onClick={handleCopyLink}
          title="Copy join link"
        >
          {copied ? <span style={{fontSize: '10px', color: '#10b981'}}>Copied!</span> : <Copy className="w-4 h-4" />}
        </button>

      </div>
    </div>
  );
};

export default Toolbar;

