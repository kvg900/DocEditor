import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Copy, Settings, Check, AlertCircle } from 'lucide-react';
import './AISummarizer.css';

// Provider configurations
const PROVIDERS = {
  huggingface: { name: 'Hugging Face (BART)', keyStore: 'inksynk-hf-key' },
  openai: { name: 'OpenAI (GPT-4o-mini)', keyStore: 'inksynk-openai-key' },
  gemini: { name: 'Google Gemini (Flash)', keyStore: 'inksynk-gemini-key' },
};

const AISummarizer = ({ isOpen, onClose, editor }) => {
  const [provider, setProvider] = useState('huggingface');
  const [apiKey, setApiKey] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(true);
  const [copied, setCopied] = useState(false);

  // Load API key when provider changes
  useEffect(() => {
    const savedKey = localStorage.getItem(PROVIDERS[provider].keyStore);
    if (savedKey) {
      setApiKey(savedKey);
      setShowSettings(false);
    } else {
      setApiKey('');
      setShowSettings(true);
    }
  }, [provider]);

  // Save API key
  const saveKey = (val) => {
    setApiKey(val);
    if (val.trim()) {
      localStorage.setItem(PROVIDERS[provider].keyStore, val.trim());
    } else {
      localStorage.removeItem(PROVIDERS[provider].keyStore);
    }
  };

  const generateSummary = async () => {
    if (!editor) return;
    const text = editor.getText();
    if (!text || text.trim().length < 50) {
      setError('Not enough text to summarize. Please write something first!');
      return;
    }
    if (!apiKey) {
      setError('Please enter your API key first.');
      setShowSettings(true);
      return;
    }

    setLoading(true);
    setError(null);
    setSummary('');

    try {
      if (provider === 'huggingface') {
        const res = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inputs: text })
        });
        if (!res.ok) throw new Error('Hugging Face API error. Check your token.');
        const data = await res.json();
        setSummary(data[0]?.summary_text || 'Unable to generate summary.');
      } 
      else if (provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: 'Summarize the following text concisely.' }, { role: 'user', content: text }]
          })
        });
        if (!res.ok) throw new Error('OpenAI API error. Check your API key.');
        const data = await res.json();
        setSummary(data.choices[0]?.message?.content || 'Unable to generate summary.');
      }
      else if (provider === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `Summarize the following text concisely:\n\n${text}` }] }] })
        });
        if (!res.ok) throw new Error('Gemini API error. Check your API key.');
        const data = await res.json();
        setSummary(data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate summary.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during summarization.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ai-panel-backdrop"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="ai-panel"
          >
            <div className="ai-header">
              <div className="ai-title-group">
                <div className="ai-icon-container">
                  <Sparkles size={18} className="ai-icon" />
                </div>
                <h2>AI Summarizer</h2>
              </div>
              <button className="ai-close-btn" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className="ai-body">
              <div className="ai-toolbar">
                <button 
                  className={`ai-settings-toggle ${showSettings ? 'active' : ''}`}
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings size={14} />
                  Configure AI
                </button>
              </div>

              <AnimatePresence>
                {showSettings && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ai-settings-card"
                  >
                    <label className="ai-label">AI Provider</label>
                    <select 
                      value={provider} 
                      onChange={(e) => setProvider(e.target.value)}
                      className="ai-select"
                    >
                      {Object.entries(PROVIDERS).map(([key, config]) => (
                        <option key={key} value={key}>{config.name}</option>
                      ))}
                    </select>

                    <label className="ai-label">API Key (Stored Locally)</label>
                    <input 
                      type="password"
                      placeholder={`Enter your ${PROVIDERS[provider].name} key`}
                      value={apiKey}
                      onChange={(e) => saveKey(e.target.value)}
                      className="ai-input"
                    />
                    <p className="ai-help-text">
                      Your key is securely stored in your browser's localStorage and only sent to the provider.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="ai-error">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <div className="ai-action-area">
                <button 
                  className="ai-primary-btn" 
                  onClick={generateSummary}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="ai-spinner" />
                      Summarizing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate Summary
                    </>
                  )}
                </button>
              </div>

              {summary && (
                <div className="ai-result">
                  <div className="ai-result-header">
                    <h3>Summary</h3>
                    <button 
                      className="ai-copy-btn" 
                      onClick={copyToClipboard}
                      title="Copy to clipboard"
                    >
                      {copied ? <Check size={14} className="copied-icon" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="ai-result-content">
                    {summary}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AISummarizer;
