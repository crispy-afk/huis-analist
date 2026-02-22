import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useLang } from '../contexts/LanguageContext';

function fmt(n) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

export default function History() {
  const { t } = useLang();
  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/.netlify/functions/price-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      setData(await res.json());
    } catch {}
    setLoading(false);
  }

  const pctChange = data
    ? ((data.chartData[data.chartData.length - 1]?.price - data.chartData[0]?.price) / data.chartData[0]?.price * 100).toFixed(1)
    : 0;

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/" className="back-link">← Home</Link>
        <h1>{t.historyPage.title}</h1>
      </div>

      <div className="card">
        <div className="form-group">
          <label>{t.common.postalCode} / Funda URL</label>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && analyze()}
            placeholder="bv. 1011AB Amsterdam"
          />
        </div>
        <button className="btn-primary" onClick={analyze} disabled={loading}>
          {loading ? t.common.loading : t.common.analyze}
        </button>
      </div>

      {data && (
        <div className="animate-in">
          <div className="metrics-grid">
            <div className="metric">
              <span className="metric-value">{fmt(data.chartData[data.chartData.length - 1]?.price)}</span>
              <span className="metric-label">Huidig gem. prijs</span>
            </div>
            <div className="metric">
              <span className="metric-value" style={{ color: pctChange >= 0 ? '#2e7d32' : '#c62828' }}>
                {pctChange >= 0 ? '+' : ''}{pctChange}%
              </span>
              <span className="metric-label">5-jaar wijziging</span>
            </div>
            <div className="metric">
              <span className="metric-value">{data.totalTransactions}</span>
              <span className="metric-label">{t.historyPage.transactions}</span>
            </div>
          </div>

          <div className="card">
            <h3>📈 Prijsontwikkeling — {data.location}</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={data.chartData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => `€${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => fmt(v)} labelFormatter={l => `Kwartaal: ${l}`} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#1a1a2e"
                    strokeWidth={2.5}
                    dot={{ fill: '#1a1a2e', r: 3 }}
                    activeDot={{ r: 6 }}
                    name={t.historyPage.averagePrice}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="sources-row">
            <span className="source-badge">📊 CBS Eigenwoningmarkt</span>
            <span className="source-badge">🗺️ Kadaster transacties</span>
          </div>
        </div>
      )}
    </div>
  );
}
