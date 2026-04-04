import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

// NOTE: StrictMode intentionally removed.
// React 18 StrictMode double-mounts components in dev, which destroys
// the Yjs Y.Doc and WebsocketProvider during cleanup, then the remount
// reuses the same destroyed objects from useMemo — breaking real-time sync.
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

