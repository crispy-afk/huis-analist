import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Finder from './pages/Finder';
import RentBuy from './pages/RentBuy';
import Taxes from './pages/Taxes';
import Neighborhood from './pages/Neighborhood';
import History from './pages/History';
import { Cheapest, Expensive } from './pages/Nearby';
import './index.css';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/finder"       element={<Finder />} />
          <Route path="/rent-buy"     element={<RentBuy />} />
          <Route path="/taxes"        element={<Taxes />} />
          <Route path="/neighborhood" element={<Neighborhood />} />
          <Route path="/history"      element={<History />} />
          <Route path="/cheapest"     element={<Cheapest />} />
          <Route path="/expensive"    element={<Expensive />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
