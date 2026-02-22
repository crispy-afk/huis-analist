import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LanguageContext';
import AIExplanation from '../components/AIExplanation';

function fmt(n) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

const MUNICIPALITIES = [
  'Amsterdam','Rotterdam','Den Haag','Utrecht','Eindhoven','Groningen',
  'Tilburg','Almere','Breda','Nijmegen','Enschede','Haarlem','Arnhem',
  'Zaanstad','Amersfoort','Apeldoorn','Hoofddorp','Maastricht','Leiden','Dordrecht',
];

export default function Taxes() {
  const { t } = useLang();
  const [form, setForm] = useState({ housePrice: '350000', municipality: 'Amsterdam' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function calculate() {
    setLoading(true);
    try {
      const res = await fetch('/.netlify/functions/property-taxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setData(await res.json());
    } catch {}
    setLoading(false);
  }

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/" className="back-link">← Home</Link>
        <h1>{t.taxesPage.title}</h1>
      </div>

      <div className="card">
        <h3>🧾 Invoer</h3>
        <div className="form-row">
          <div className="form-group">
            <label>{t.taxesPage.housePrice} (€)</label>
            <input type="number" value={form.housePrice} onChange={e => setForm(f => ({ ...f, housePrice: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>{t.taxesPage.municipality}</label>
            <select value={form.municipality} onChange={e => setForm(f => ({ ...f, municipality: e.target.value }))}>
              {MUNICIPALITIES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <button className="btn-primary" onClick={calculate} disabled={loading}>
          {loading ? t.common.loading : t.common.analyze}
        </button>
      </div>

      {data && (
        <div className="animate-in">
          <div className="card">
            <h3>💰 Eenmalige Kosten bij Aankoop</h3>
            <table className="data-table">
              <tbody>
                <tr><td>{t.taxesPage.transferTax}</td><td style={{ fontWeight: 600 }}>{fmt(data.transferTax)}</td></tr>
                <tr><td>{t.taxesPage.notaryCosts}</td><td style={{ fontWeight: 600 }}>{fmt(data.notaryCosts)}</td></tr>
                <tr><td>{t.taxesPage.mortgageCosts}</td><td style={{ fontWeight: 600 }}>{fmt(data.mortgageCosts)}</td></tr>
                <tr><td>Makelaarscourtage (optioneel)</td><td style={{ fontWeight: 600 }}>{fmt(data.agentFee)}</td></tr>
                <tr style={{ background: 'var(--cream-dark)' }}>
                  <td style={{ fontWeight: 700 }}>Totaal kosten koper (k.k.)</td>
                  <td style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent)' }}>{fmt(data.totalOneTime)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3>📅 Jaarlijkse Kosten</h3>
            <table className="data-table">
              <tbody>
                <tr><td>{t.taxesPage.propertyTax} (OZB)</td><td style={{ fontWeight: 600 }}>{fmt(data.ozb)}</td></tr>
                <tr><td>VvE bijdrage (bij appartement)</td><td style={{ fontWeight: 600 }}>{fmt(data.vve)}</td></tr>
                <tr><td>Opstalverzekering</td><td style={{ fontWeight: 600 }}>{fmt(data.insurance)}</td></tr>
                <tr style={{ background: 'var(--cream-dark)' }}>
                  <td style={{ fontWeight: 700 }}>Totaal per jaar</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{fmt(data.totalAnnual)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="sources-row">
            <span className="source-badge">📊 CBS Belastingdienst 2024</span>
            <span className="source-badge">🗺️ Gemeentelijke tarieven</span>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <AIExplanation context="property-taxes" data={{ ...data, ...form }} />
          </div>
        </div>
      )}
    </div>
  );
}
