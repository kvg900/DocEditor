import React from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  Copy,
  Check,
  ChevronLeft,
  Zap,
  Download,
  FileText,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import './Toolbar.css';

const Toolbar = ({ editor, roomName, onToggleAI }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = React.useState(false);

  if (!editor) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/doc/${roomName}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHTML = () => {
    const html = `<div class="tiptap">${editor.getHTML()}</div>`;
    // Basic wrapper to include styling locally if opened in browser
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${roomName}</title><style>body{font-family:sans-serif;max-width:800px;margin:2rem auto;padding:1rem;} .tiptap h1{font-size:2rem} .tiptap p{line-height:1.6} .tiptap pre{background:#f3f4f6;padding:1rem;border-radius:4px;}</style></head><body>${html}</body></html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notebook-${roomName}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  const handleDownloadPDF = () => {
    setShowDownloadMenu(false);
    // Give state time to update and hide the menu before opening print dialog
    setTimeout(() => window.print(), 50);
  };

  return (
    <div className="toolbar-container">
      {/* Left: Logo + Back */}
      <div className="toolbar-left">
        <Link to="/" className="toolbar-brand" id="toolbar-home-link">
          <div className="toolbar-logo">
            <Zap className="toolbar-logo-icon" />
          </div>
          <span className="toolbar-brand-name">InkSynk</span>
        </Link>

        <div className="toolbar-sep" />

        <span className="toolbar-room-id" title={roomName} id="toolbar-room-id">
          {roomName.length > 12 ? `${roomName.substring(0, 12)}…` : roomName}
        </span>

        <button
          className="toolbar-action-btn"
          onClick={handleCopyLink}
          title="Copy invite link"
          id="toolbar-copy-link"
        >
          {copied ? (
            <Check className="toolbar-action-icon copied" />
          ) : (
            <Copy className="toolbar-action-icon" />
          )}
        </button>
      </div>

      {/* Center: Formatting */}
      <div className="toolbar-center" id="toolbar-formatting">
        <div className="toolbar-group">
          <button
            className={`tb ${editor.isActive('bold') ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
            id="tb-bold"
          >
            <Bold className="tb-icon" />
          </button>

          <button
            className={`tb ${editor.isActive('italic') ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
            id="tb-italic"
          >
            <Italic className="tb-icon" />
          </button>

          <button
            className={`tb ${editor.isActive('underline') ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
            id="tb-underline"
          >
            <UnderlineIcon className="tb-icon" />
          </button>
        </div>

        <div className="tb-divider" />

        <div className="toolbar-group">
          <button
            className={`tb ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1"
            id="tb-h1"
          >
            <Heading1 className="tb-icon" />
          </button>

          <button
            className={`tb ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
            id="tb-h2"
          >
            <Heading2 className="tb-icon" />
          </button>

          <button
            className={`tb ${editor.isActive('bulletList') ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
            id="tb-list"
          >
            <List className="tb-icon" />
          </button>
        </div>

        <div className="tb-divider" />

        {/* Right: AI & Download Actions */}
        <div className="toolbar-group">
          <button
            className="tb ai-button"
            onClick={onToggleAI}
            title="AI Summarizer"
            id="tb-ai"
            style={{ color: 'hsl(var(--accent))' }}
          >
            <Sparkles className="tb-icon" />
          </button>
        </div>

        <div className="tb-divider" />

        <div className="toolbar-group relative-group">
          <button
            className="tb"
            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
            title="Download"
            id="tb-download"
          >
            <Download className="tb-icon" />
          </button>
          
          {showDownloadMenu && (
            <div className="toolbar-dropdown">
              <button className="toolbar-dropdown-item" onClick={handleDownloadPDF}>
                <FileText className="dropdown-icon" />
                Save as PDF
              </button>
              <button className="toolbar-dropdown-item" onClick={handleDownloadHTML}>
                <FileCode className="dropdown-icon" />
                Export HTML
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
