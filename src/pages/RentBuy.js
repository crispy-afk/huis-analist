import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useLang } from '../contexts/LanguageContext';
import AIExplanation from '../components/AIExplanation';

function fmt(n) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

export default function RentBuy() {
  const { t } = useLang();
  const [form, setForm] = useState({
    housePrice: '350000',
    mortgageRate: '4.2',
    rentPrice: '1500',
    years: '10',
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function calculate() {
    setLoading(true);
    try {
      const res = await fetch('/.netlify/functions/rental-vs-buy', {
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
        <h1>{t.rentBuyPage.title}</h1>
      </div>

      <div className="card">
        <h3>⚖️ Invoer</h3>
        <div className="form-row">
          <div className="form-group">
            <label>{t.rentBuyPage.housePrice} (€)</label>
            <input type="number" value={form.housePrice} onChange={e => set('housePrice', e.target.value)} />
          </div>
          <div className="form-group">
            <label>{t.rentBuyPage.mortgageRate}</label>
            <input type="number" step="0.1" value={form.mortgageRate} onChange={e => set('mortgageRate', e.target.value)} />
          </div>
          <div className="form-group">
            <label>{t.rentBuyPage.rentPrice} (€)</label>
            <input type="number" value={form.rentPrice} onChange={e => set('rentPrice', e.target.value)} />
          </div>
          <div className="form-group">
            <label>{t.rentBuyPage.years}</label>
            <input type="number" value={form.years} onChange={e => set('years', e.target.value)} />
          </div>
        </div>
        <button className="btn-primary" onClick={calculate} disabled={loading}>
          {loading ? t.common.loading : t.common.analyze}
        </button>
      </div>

      {data && (
        <div className="animate-in">
          <div className={`recommendation ${data.recommendation}`}>
            <h4>{data.recommendation === 'buy' ? `✅ ${t.rentBuyPage.buyRecommended}` : `🔄 ${t.rentBuyPage.rentRecommended}`}</h4>
            <p>
              {data.recommendation === 'buy' ? 'Kopen' : 'Huren'} is <strong>{fmt(Math.abs(data.savings))}</strong> {t.rentBuyPage.cheaper} over {form.years} jaar.
            </p>
          </div>

          <div className="card">
            <h3>📊 Kostenvergelijking</h3>
            <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="metric">
                <span className="metric-value">{fmt(data.totalCostBuy)}</span>
                <span className="metric-label">{t.rentBuyPage.totalCostBuy}</span>
              </div>
              <div className="metric">
                <span className="metric-value">{fmt(data.totalCostRent)}</span>
                <span className="metric-label">{t.rentBuyPage.totalCostRent}</span>
              </div>
              <div className="metric">
                <span className="metric-value">{fmt(data.monthlyMortgage)}</span>
                <span className="metric-label">{t.rentBuyPage.monthlyMortgage}</span>
              </div>
            </div>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.chartData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={v => `€${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={v => fmt(v)} />
                  <Legend />
                  <Bar dataKey="kopen" name="Kopen" fill="#1a1a2e" radius={[4,4,0,0]} />
                  <Bar dataKey="huren" name="Huren" fill="#c8552a" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <AIExplanation context="rent-vs-buy" data={{ ...data, ...form }} />
        </div>
      )}
    </div>
  );
}
