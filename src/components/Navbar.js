import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../contexts/LanguageContext';

export default function Navbar() {
  const { lang, setLang, t } = useLang();
  const location = useLocation();

  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">
        🏠 Huis<span>Analist</span>
      </Link>
      <ul className="nav-links">
        <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>{t.nav.home}</Link></li>
        <li><Link to="/finder" className={location.pathname === '/finder' ? 'active' : ''}>{t.nav.finder}</Link></li>
        <li><Link to="/rent-buy" className={location.pathname === '/rent-buy' ? 'active' : ''}>{t.nav.rentBuy}</Link></li>
        <li><Link to="/taxes" className={location.pathname === '/taxes' ? 'active' : ''}>{t.nav.taxes}</Link></li>
        <li><Link to="/neighborhood" className={location.pathname === '/neighborhood' ? 'active' : ''}>{t.nav.neighborhood}</Link></li>
        <li><Link to="/history" className={location.pathname === '/history' ? 'active' : ''}>{t.nav.history}</Link></li>
        <li><Link to="/cheapest" className={location.pathname === '/cheapest' ? 'active' : ''}>{t.nav.cheapest}</Link></li>
        <li><Link to="/expensive" className={location.pathname === '/expensive' ? 'active' : ''}>{t.nav.expensive}</Link></li>
      </ul>
      <div className="lang-toggle">
        <button className={`lang-btn${lang === 'nl' ? ' active' : ''}`} onClick={() => setLang('nl')}>NL</button>
        <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
      </div>
    </nav>
  );
}
