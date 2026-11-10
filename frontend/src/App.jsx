import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import AuthorityDashboard from './pages/AuthorityDashboard';
import CitizenDashboard from './pages/CitizenDashboard';
import ModelExplainability from './pages/ModelExplainability';
import AboutResearch from './pages/AboutResearch';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Dual Portals */}
        <Route path="/authority/*" element={<AuthorityDashboard />} />
        <Route path="/citizen/*" element={<CitizenDashboard />} />

        {/* Explainability & Research */}
        <Route path="/research/explainability" element={<ModelExplainability />} />
        <Route path="/about" element={<AboutResearch />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
