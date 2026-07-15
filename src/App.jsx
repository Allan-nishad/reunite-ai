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
