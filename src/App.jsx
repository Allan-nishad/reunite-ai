import React, { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ReportForm from './components/ReportForm';
import Console from './components/Console';
import { initialIncidents, initialFoundItems, initialAiLogs } from './data/mockData';
import { getCategory, buildCategoryIndex } from './utils/classifier';
import { translateInput } from './utils/translator';
import { sanitizeText } from './utils/security';

function App() {
  const [activeTab, setActiveTab]       = useState('dashboard');
  const [incidents, setIncidents]       = useState(initialIncidents);
  const [foundItems, setFoundItems]     = useState(initialFoundItems);
  const [aiLogs, setAiLogs]             = useState(initialAiLogs);
  const [showDemoBanner, setShowDemoBanner] = useState(true);
  const [lang, setLang]                 = useState('en'); // Global UI Language: 'en' | 'es' | 'fr'

  // ── Performance: build found-item category index with useMemo ────────────
  // Only rebuilds when foundItems changes, not on every render.
  const foundItemIndex = useMemo(
    () => buildCategoryIndex(foundItems.filter(f => f.status === 'Awaiting Owner Report')),
    [foundItems]
  );

  // ── Retroactive Match Handler ─────────────────────────────────────────────
  // Called when a fan submits a new incident report.
  // Immediately scans the foundItemIndex for any existing unclaimed items
  // that match the new report's category.
  const handleAddIncident = (newIncident) => {
    // Sanitize all user text before processing
    const sanitizedTitle       = sanitizeText(newIncident.title);
    const sanitizedDescription = sanitizeText(newIncident.description);
    const incidentText         = sanitizedTitle + ' ' + sanitizedDescription;

    // Translate non-English input to English for unified matching
    const { text: translatedText, lang: detected } = translateInput(incidentText);

    // Attach translation notice if non-English
    if (detected !== 'en') {
      newIncident.translationNotice = `Translated from ${detected === 'es' ? 'Spanish' : 'French'}: "${translatedText}"`;
      newIncident.language = detected;
    }

    // Classify the new incident
    const incCategory = getCategory(translatedText, newIncident.type);

    // Index lookup — only scan same-category found items
    const candidates = incCategory ? (foundItemIndex[incCategory] || []) : [];

    let matchedFoundItem = null;
    candidates.forEach(item => {
      const itemText     = ((item.title || '') + ' ' + item.description).toLowerCase();
      const itemCategory = getCategory(itemText, item.type);
      if (incCategory && itemCategory && incCategory === itemCategory) {
        matchedFoundItem = item;
      }
    });

    if (matchedFoundItem) {
      // Retroactive match found — link the two records
      newIncident.status              = 'Matching';
      newIncident.retroactiveMatchId  = matchedFoundItem.id;
      newIncident.retroactiveFoundTime = matchedFoundItem.timeFound;
      newIncident.retroactiveFoundLoc  = matchedFoundItem.foundLocation;

      setFoundItems(prev =>
        prev.map(item =>
          item.id === matchedFoundItem.id
            ? { ...item, status: 'Matched', matchedIncidentId: newIncident.id }
            : item
        )
      );

      setIncidents(prev => [newIncident, ...prev]);

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAiLogs(prev => [
        {
          id:      Date.now() + 1,
          message: `✔ AI Retroactive Match: New report #${newIncident.id} linked to unclaimed #${matchedFoundItem.id} (94% confidence)`,
          time:    timeStr,
          type:    'success',
        },
        {
          id:      Date.now(),
          message: `🤖 Report logged: ${sanitizedTitle} (#${newIncident.id})`,
          time:    timeStr,
          type:    'info',
        },
        ...prev,
      ]);
    } else {
      setIncidents(prev => [newIncident, ...prev]);

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAiLogs(prev => [
        {
          id:      Date.now(),
          message: `🤖 Report logged: ${sanitizedTitle} (#${newIncident.id}) — scanning for matches...`,
          time:    timeStr,
          type:    'info',
        },
        ...prev,
      ]);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-brand-dark">

      {/* ── Demo Mode Notice Banner ── */}
      {showDemoBanner && (
        <div
          role="banner"
          aria-label="Demo mode notice"
          style={{
            background:   'linear-gradient(90deg, rgba(14,22,45,0.97) 0%, rgba(10,18,38,0.98) 100%)',
            borderBottom: '1px solid rgba(251,191,36,0.2)',
            borderTop:    '2px solid rgba(251,191,36,0.5)',
          }}
          className="w-full px-4 py-2.5 flex items-center justify-between gap-3 z-50 relative"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-base shrink-0" aria-hidden="true">⚠️</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-amber-400">Demo Mode — No API Keys or Backend Required.</span>
              {' '}All matching runs client-side in the browser.{' '}
              <span className="text-amber-300 font-semibold">Use the ⚡ Demo Shortcuts on the Report Incident page</span>
              {' '}to see the full AI matching flow instantly.
            </p>
          </div>
          <button
            onClick={() => setShowDemoBanner(false)}
            aria-label="Dismiss demo mode notice"
            style={{ background: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.3)' }}
            className="shrink-0 rounded-lg border px-3 py-1 text-[11px] font-bold text-amber-400 hover:bg-amber-400/20 transition-all cursor-pointer"
          >
            Got it ✕
          </button>
        </div>
      )}

      {/* ── Sticky Header Nav ── */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} setLang={setLang} />

      {/* ── Main Content Area ── */}
      <main className="flex-grow flex flex-col justify-start relative" id="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard setActiveTab={setActiveTab} lang={lang} />
        )}
        {activeTab === 'report' && (
          <ReportForm onAddIncident={handleAddIncident} setActiveTab={setActiveTab} lang={lang} />
        )}
        {activeTab === 'console' && (
          <Console
            incidents={incidents}
            setIncidents={setIncidents}
            foundItems={foundItems}
            setFoundItems={setFoundItems}
            aiLogs={aiLogs}
            setAiLogs={setAiLogs}
            lang={lang}
          />
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="w-full border-t border-white/5 bg-brand-dark py-6 text-center text-xs text-slate-500 font-medium">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 REUNITE AI — AI-Powered Incident Resolution Platform. Mock Stadium Operations Suite.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-semibold">
              Built by <span className="text-brand-green font-bold">Allan</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="hover:text-brand-green cursor-pointer transition-colors">Privacy Protocol</span>
            <span className="text-slate-700">|</span>
            <span className="hover:text-brand-green cursor-pointer transition-colors">System Diagnostics</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

