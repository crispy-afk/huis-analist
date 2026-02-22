import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LanguageContext';

const TOOLS = [
  { key: 'finder',       icon: '🔍', path: '/finder' },
  { key: 'rentBuy',      icon: '⚖️', path: '/rent-buy' },
  { key: 'taxes',        icon: '🧾', path: '/taxes' },
  { key: 'neighborhood', icon: '🏘️', path: '/neighborhood' },
  { key: 'history',      icon: '📈', path: '/history' },
  { key: 'cheapest',     icon: '💰', path: '/cheapest' },
  { key: 'expensive',    icon: '👑', path: '/expensive' },
];

export default function Home() {
  const { t } = useLang();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/finder?q=${encodeURIComponent(query)}`);
    }
  }

  return (
    <>
      <section className="hero">
        <div className="hero-pattern"></div>
        <div className="hero-content">
          <div className="hero-eyebrow">🇳🇱 Nederlandse Woningmarkt Analyse</div>
          <h1>{t.hero.title}</h1>
          <p>{t.hero.subtitle}</p>
          <form className="hero-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder={t.hero.placeholder}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button type="submit" className="btn-primary">{t.hero.cta}</button>
          </form>
        </div>
      </section>

      <section className="tools-section">
        <div className="section-header">
          <h2>Alle Tools</h2>
          <p>Alles wat u nodig heeft om een weloverwogen woningbeslissing te nemen</p>
        </div>
        <div className="tools-grid">
          {TOOLS.map(tool => (
            <Link key={tool.key} to={tool.path} className="tool-card">
              <span className="tool-icon">{tool.icon}</span>
              <h3>{t.tools[tool.key]}</h3>
              <p>{t.tools[`${tool.key}Desc`]}</p>
              <span className="arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="trust-section">
        <div className="trust-inner">
          <h2>{t.trust.title}</h2>
          <p>Alle data wordt opgehaald uit officiële, betrouwbare Nederlandse bronnen</p>
          <div className="trust-badges">
            <div className="trust-badge">
              <span className="badge-icon">📊</span>
              <div className="badge-name">{t.trust.cbs}</div>
              <div className="badge-desc">Woningstatistieken</div>
            </div>
            <div className="trust-badge">
              <span className="badge-icon">🗺️</span>
              <div className="badge-name">{t.trust.bag}</div>
              <div className="badge-desc">Officieel adressen & gebouwen</div>
            </div>
            <div className="trust-badge">
              <span className="badge-icon">🏡</span>
              <div className="badge-name">{t.trust.funda}</div>
              <div className="badge-desc">Actuele woningaanbod</div>
            </div>
            <div className="trust-badge">
              <span className="badge-icon">🌍</span>
              <div className="badge-name">{t.trust.osm}</div>
              <div className="badge-desc">Locatie & buurtdata</div>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <p>{t.footer.disclaimer}</p>
        <p style={{ marginTop: '0.5rem' }}>{t.footer.sources}</p>
        <p style={{ marginTop: '0.5rem' }}>© {new Date().getFullYear()} HuisAnalist — Niet gelieerd aan Funda, CBS of Kadaster</p>
      </footer>
    </>
  );
}
