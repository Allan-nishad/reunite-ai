import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ReportForm from './components/ReportForm';
import Console from './components/Console';
import { initialIncidents, initialFoundItems, initialAiLogs } from './data/mockData';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [incidents, setIncidents] = useState(initialIncidents);
  const [foundItems, setFoundItems] = useState(initialFoundItems);
  const [aiLogs, setAiLogs] = useState(initialAiLogs);
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  // Callback to append user reports to the active list
  const handleAddIncident = (newIncident) => {
    let matchedFoundItem = null;
    
    // Scan found items for retroactive matches using simple 3-category logic
    const getCategory = (text, incType) => {
      const t = text.toLowerCase();
      if (/\b(boy|girl|man|woman|child|person|human|teenager|kid|maya|son|daughter|guy|lady|fan|people|group)\b/.test(t)) return 'person';
      if (/\b(backpack|bag|pack|rucksack|suitcase|briefcase|jacket|coat|puffer)\b/.test(t)) return 'bag';
      if (/\b(passport|wallet|document|id card|pass|licence|license|certificate)\b/.test(t)) return 'document';
      if (incType === 'Lost Child' || incType === 'Separated Group') return 'person';
      return null;
    };

    const incidentText = (newIncident.title + ' ' + newIncident.description).toLowerCase();
    const incConcept = getCategory(incidentText, newIncident.type);

    foundItems.forEach(item => {
      if (item.status === 'Awaiting Owner Report') {
        const itemText = ((item.title || '') + ' ' + item.description).toLowerCase();
        const itemConcept = getCategory(itemText, item.type);

        // Only match if SAME category — no cross-category ever
        if (incConcept && itemConcept && incConcept === itemConcept) {
          matchedFoundItem = item;
        }
      }
    });

    if (matchedFoundItem) {
      // Establish the match!
      newIncident.status = "Matching";
      newIncident.retroactiveMatchId = matchedFoundItem.id;
      newIncident.retroactiveFoundTime = matchedFoundItem.timeFound;
      newIncident.retroactiveFoundLoc = matchedFoundItem.foundLocation;

      setFoundItems(prev => prev.map(item => 
        item.id === matchedFoundItem.id 
          ? { ...item, status: "Matched", matchedIncidentId: newIncident.id } 
          : item
      ));

      setIncidents(prev => [newIncident, ...prev]);

      const logInfo = {
        id: Date.now(),
        message: `🤖 Report logged: ${newIncident.title} (Incident #${newIncident.id})`,
        time: newIncident.reportedAt,
        type: 'info'
      };
      
      const logMatch = {
        id: Date.now() + 1,
        message: `✔ AI Retroactive Match: New report #${newIncident.id} matched with unclaimed #${matchedFoundItem.id} (94% confidence)`,
        time: newIncident.reportedAt,
        type: 'success'
      };

      setAiLogs(prev => [logMatch, logInfo, ...prev]);
    } else {
      setIncidents(prev => [newIncident, ...prev]);

      const log = {
        id: Date.now(),
        message: `🤖 Report logged: ${newIncident.title} (Incident #${newIncident.id})`,
        time: newIncident.reportedAt,
        type: 'info'
      };
      setAiLogs(prev => [log, ...prev]);
    }
  };


  return (
    <div className="flex min-h-screen flex-col bg-brand-dark">
      {/* Demo Mode Notice Banner */}
      {showDemoBanner && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(14,22,45,0.97) 0%, rgba(10,18,38,0.98) 100%)',
            borderBottom: '1px solid rgba(251,191,36,0.2)',
            borderTop: '2px solid rgba(251,191,36,0.5)'
          }}
          className="w-full px-4 py-2.5 flex items-center justify-between gap-3 z-50 relative"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-base shrink-0">⚠️</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-amber-400">Demo Mode — No API Keys or Backend.</span>
              {' '}This is a hackathon prototype · All matching runs client-side in the browser.
              {' '}<span className="text-amber-300 font-semibold">Use the ⚡ Demo Shortcuts on the Report Incident page</span>
              {' '}to see the full AI matching flow instantly.
            </p>
          </div>
          <button
            onClick={() => setShowDemoBanner(false)}
            style={{ background: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.3)' }}
            className="shrink-0 rounded-lg border px-3 py-1 text-[11px] font-bold text-amber-400 hover:bg-amber-400/20 transition-all cursor-pointer"
          >
            Got it ✕
          </button>
        </div>
      )}

      {/* Sticky Header Nav */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col justify-start relative">
        {activeTab === 'dashboard' && (
          <Dashboard setActiveTab={setActiveTab} />
        )}
        {activeTab === 'report' && (
          <ReportForm onAddIncident={handleAddIncident} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'console' && (
          <Console 
            incidents={incidents} 
            setIncidents={setIncidents}
            foundItems={foundItems}
            setFoundItems={setFoundItems}
            aiLogs={aiLogs}
            setAiLogs={setAiLogs}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-brand-dark py-6 text-center text-xs text-slate-500 font-medium">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 REUNITE AI — AI-Powered Incident Resolution Platform. Mock Stadium Operations Suite.</p>
          <div className="flex gap-4">
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
