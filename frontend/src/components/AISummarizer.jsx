import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Copy, Check, AlertCircle } from "lucide-react";
import "./AISummarizer.css";
import { generateSummary } from "../../../AISummarizerExperimental.js";

const AISummarizer = ({ isOpen, onClose, editor }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateSummary = async () => {
    if (!editor) {
      setError("Editor not available");
      return;
    }

    const text = editor.getText();

    if (!text || text.trim().length < 50) {
      setError(
        "Not enough text to summarize. Please write at least 50 characters.",
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSummary("");

    try {
      const { err, sum } = await generateSummary(text);

      if (err) {
        setError(err);
      } else if (sum) {
        setSummary(sum);
      } else {
        setError("No summary returned");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while generating summary.");
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ai-panel-backdrop"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
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
              {error && (
                <div className="ai-error">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <div className="ai-action-area">
                <button
                  className="ai-primary-btn"
                  onClick={handleGenerateSummary}
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
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="ai-result-content">{summary}</div>
                </div>
              )}

              {!summary && !error && !loading && (
                <div className="ai-placeholder">
                  <p>Click "Generate Summary" to summarize your document</p>
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
