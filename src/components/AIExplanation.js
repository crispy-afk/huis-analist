import React, { useState } from 'react';
import { useLang } from '../contexts/LanguageContext';

export default function AIExplanation({ context, data }) {
  const { lang, t } = useLang();
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch('/.netlify/functions/claude-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, data, lang }),
      });
      const json = await res.json();
      setExplanation(json.explanation || t.common.error);
    } catch {
      setExplanation(t.common.error);
    }
    setLoading(false);
  }

  return (
    <div>
      {!explanation && !loading && (
        <button className="btn-secondary" onClick={generate}>
          💬 {t.common.generateExplanation}
        </button>
      )}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}></div>
          {t.common.loading}
        </div>
      )}
      {explanation && (
        <div className="ai-box animate-in">
          <div className="ai-box-header">
            <span className="ai-badge">AI</span>
            <h4>{t.common.aiExplanation}</h4>
          </div>
          <p>{explanation}</p>
        </div>
      )}
    </div>
  );
}
