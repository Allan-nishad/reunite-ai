import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, ShieldAlert, CheckCircle2, Upload, MapPin, 
  Terminal, Search, Filter, AlertTriangle, Compass,
  FolderOpen, User, Check, Play, Loader2, Sparkles, ChevronRight, Clock
} from 'lucide-react';
import MatchDetails from './MatchDetails';
import { sampleMatchResult } from '../data/mockData';

export default function Console({ 
  incidents, 
  setIncidents, 
  foundItems, 
  setFoundItems, 
  aiLogs, 
  setAiLogs 
}) {
  const [filterType, setFilterType] = useState('All'); // All, Lost Item, Lost Child, Separated Group
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [showMatchResult, setShowMatchResult] = useState(false);
  const [activeMatchData, setActiveMatchData] = useState(null);
  const [showUnclaimedResult, setShowUnclaimedResult] = useState(false);
  const [activeUnclaimedItem, setActiveUnclaimedItem] = useState(null);

  // Found Form State
  const [foundDesc, setFoundDesc] = useState('');
  const [foundLoc, setFoundLoc] = useState('');
  const [foundFile, setFoundFile] = useState(null);
  const [foundPreview, setFoundPreview] = useState(null);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simLogs, setSimLogs] = useState([]);
  const simInterval = useRef(null);

  // Ticker Auto-scroll / update
  const [liveLogs, setLiveLogs] = useState(aiLogs);
  const logContainerRef = useRef(null);

  // Add random dynamic AI activity log every 10 seconds to make dashboard feel "alive"
  useEffect(() => {
    const mockLogsPool = [
      { message: "🤖 Running visual scan on Gate A security cameras...", type: "process" },
      { message: "🤖 Comparing active report INC-299 with Stadium CCTV logs...", type: "process" },
      { message: "🤖 Target child (Yellow shirt) match probability 65% at Concourse 3", type: "info" },
      { message: "✔ Device proximity check complete for Gate 4 BLE Beacons", type: "success" },
      { message: "🤖 Scanning local found items catalog for matching wallets...", type: "process" },
      { message: "✔ AI Match suggested: Red Wallet matched with INC-288 (91%)", type: "success" },
      { message: "🤖 Incident alert routed to volunteer staff at Fan Zone B", type: "info" }
    ];

    const interval = setInterval(() => {
      const randomLog = mockLogsPool[Math.floor(Math.random() * mockLogsPool.length)];
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setLiveLogs(prev => [
        {
          id: Date.now(),
          message: randomLog.message,
          time: timeStr,
          type: randomLog.type
        },
        ...prev
      ]);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // Sync back liveLogs when parent logs change
  useEffect(() => {
    setLiveLogs(prev => {
      // Keep user-created logs first and unique
      const combined = [...aiLogs, ...prev];
      const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      return unique;
    });
  }, [aiLogs]);

  // Statistics calculation
  const stats = {
    open: incidents.filter(i => i.status !== 'Resolved').length,
    resolved: incidents.filter(i => i.status === 'Resolved').length,
    matching: incidents.filter(i => i.status === 'Matching').length,
  };

  const filteredIncidents = incidents.filter(incident => {
    if (filterType === 'All') return true;
    return incident.type === filterType;
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoundFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoundPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerMatchSimulation = (itemDescription, foundLocation) => {
    setIsSimulating(true);
    setSimStep(0);
    setSimLogs([]);

    const steps = [
      { text: "Analyzing image upload & metadata...", time: 600 },
      { text: "Extracting semantic attributes & visual tags...", time: 1300 },
      { text: "Cross-referencing with active missing reports...", time: 2000 },
      { text: "Calculating overall matching vector scores...", time: 2700 },
      { text: "AI Recommendations Generated.", time: 3200 }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setSimStep(idx + 1);
        setSimLogs(prev => [...prev, step.text]);

        // When the simulation finishes (last step)
        if (idx === steps.length - 1) {
          setTimeout(() => {
            setIsSimulating(false);
            
            // Check keywords to determine which incident we match
            const descLower = itemDescription.toLowerCase();
            let matchedInc = null;
            let customMatchData = null;

            // 1. Explicit selection by user
            if (selectedIncidentId) {
              matchedInc = incidents.find(i => i.id === selectedIncidentId);
            }
            // 2. Auto-match using simple 3-category logic
            else {
              // Simple category detection — checks the found description only
              const getCategory = (text) => {
                const t = text.toLowerCase();
                if (/\b(boy|girl|man|woman|child|person|human|teenager|kid|maya|son|daughter|guy|lady|fan|people|group)\b/.test(t)) return 'person';
                if (/\b(backpack|bag|pack|rucksack|suitcase|briefcase|jacket|coat|puffer)\b/.test(t)) return 'bag';
                if (/\b(passport|wallet|document|id card|pass|licence|license|certificate)\b/.test(t)) return 'document';
                return null;
              };

              const foundCategory = getCategory(descLower);

              if (foundCategory) {
                // Only match incidents in the SAME category — no cross-category ever
                matchedInc = incidents.find(inc => {
                  if (inc.status === 'Resolved') return false;
                  const incIsChild = inc.type === 'Lost Child' || inc.type === 'Separated Group';
                  const incText = (inc.title + ' ' + inc.description).toLowerCase();
                  const incCategory = getCategory(incText) || (incIsChild ? 'person' : null);
                  return incCategory === foundCategory;
                });
              }

              // Preset fallback — only fires when same category, no match found above
              if (!matchedInc) {
                if (foundCategory === 'bag' && (descLower.includes('backpack') || descLower.includes('nike'))) {
                  matchedInc = incidents.find(i => i.id === 'INC-302' && i.status !== 'Resolved');
                } else if (foundCategory === 'bag' && (descLower.includes('jacket') || descLower.includes('coat'))) {
                  matchedInc = incidents.find(i => i.id === 'INC-303' && i.status !== 'Resolved');
                } else if (foundCategory === 'document') {
                  matchedInc = incidents.find(i => i.id === 'INC-301' && i.status !== 'Resolved');
                } else if (foundCategory === 'person' && (descLower.includes('maya') || descLower.includes('girl') || descLower.includes('teenager'))) {
                  matchedInc = incidents.find(i => i.id === 'INC-299' && i.status !== 'Resolved');
                }
              }
            }

            if (matchedInc) {
              // Check case types to apply appropriate explanations
              const isBackpackCase = matchedInc.id === 'INC-302' || descLower.includes('backpack') || descLower.includes('nike');
              const isPassportCase = matchedInc.id === 'INC-301' || descLower.includes('passport') || descLower.includes('german');
              // Maya case: only if explicitly female keywords AND no male keywords
              const isChildCase = matchedInc.id === 'INC-299' && (descLower.includes('maya') || descLower.includes('girl') || descLower.includes('teenager')) && !descLower.includes('boy') && !descLower.includes('man');

              if (isBackpackCase) {
                customMatchData = {
                  ...sampleMatchResult,
                  incidentId: matchedInc.id,
                  foundImageUrl: foundPreview || "/mock_backpack.png",
                  reasons: [
                    { text: "Same backpack brand and type (Nike Utility)", status: "match" },
                    { text: "White Nike logo detected on the center pouch", status: "match" },
                    { text: "Red custom keychain matches description", status: "match" },
                    { text: "Similar content profiles (notebook and laptop)", status: "match" },
                    { text: `Found location (${foundLocation || 'VIP Desk'}) differs from last seen (${matchedInc.lastSeen}), which is expected because found items are often moved to volunteers or the Lost & Found desk.`, status: "warning" }
                  ]
                };
              } else if (isPassportCase) {
                customMatchData = {
                  ...sampleMatchResult,
                  incidentId: matchedInc.id,
                  confidence: 98,
                  foundImageUrl: foundPreview || "/mock_passport.png",
                  reasons: [
                    { text: "Direct document match: German Passport", status: "match" },
                    { text: "Country match: Germany / Federal Republic of Germany", status: "match" },
                    { text: `Visual name verification matches owner record`, status: "match" },
                    { text: `Found location matches closely with VIP Lounge area.`, status: "match" }
                  ],
                  verificationQuestions: [
                    "What is the date of birth on the passport?",
                    "Can you confirm the passport number prefix?",
                    "Is there any other card inside the leather holder?"
                  ],
                  timeline: [
                    { time: matchedInc.reportedAt || "8:02 PM", event: `Lost Report Created (${matchedInc.id})` },
                    { time: "8:25 PM", event: "Volunteer Uploaded Document" },
                    { time: "8:25 PM", event: "Optical Character Recognition Complete" },
                    { time: "8:26 PM", event: "Semantic Database Match Confirmed" },
                    { time: "Pending", event: "Awaiting Passport Verification" }
                  ]
                };
              } else if (isChildCase) {
                customMatchData = {
                  incidentId: matchedInc.id,
                  foundItemId: `FND-${Math.floor(100 + Math.random() * 900)}`,
                  confidence: 96,
                  foundImageUrl: foundPreview || "/mock_girl.jpg",
                  reasons: [
                    { text: "Facial similarity matches reported photograph template", status: "match" },
                    { text: "Shirt style matches (grey shirt with pink collar trim)", status: "match" },
                    { text: "Physical features match (long dark wavy brown hair)", status: "match" },
                    { text: `Found location matches Gate A vicinity where child was separated.`, status: "match" }
                  ],
                  timeline: [
                    { time: matchedInc.reportedAt || "7:42 PM", event: `Lost Child Report Logged (${matchedInc.id})` },
                    { time: "Just now", event: "Steward spotted child and logged photo" },
                    { time: "Just now", event: "Biometric Facial Tag verification Complete" },
                    { time: "Just now", event: "Proximity match confirmed (96% Confidence)" },
                    { time: "Pending", event: "Awaiting Guardian identity verification" }
                  ],
                  verificationQuestions: [
                    "What is the name of your guardian/parent?",
                    "Do you know the guardian's contact number?",
                    "Can you verify the child's birth date or ticket seat number?"
                  ],
                  actions: [
                    { text: "Notify Security Hub and dispatch steward", status: "done" },
                    { text: "Verify parent/guardian ID matches ticket database", status: "pending" },
                    { text: "Reunite family and log check-out signature", status: "pending" }
                  ],
                  estimatedResolutionTime: "3 minutes"
                };
              } else {
                // Generates dynamic match results for custom files & images uploaded by the user!
                customMatchData = {
                  incidentId: matchedInc.id,
                  foundItemId: `FND-${Math.floor(100 + Math.random() * 900)}`,
                  confidence: 91,
                  foundImageUrl: foundPreview || getDefaultImage(matchedInc), // Use uploaded custom photo!
                  reasons: [
                    { text: `Image similarity profile match (detected shape overlap)`, status: "match" },
                    { text: `Semantic match: description aligns with "${matchedInc.title}"`, status: "match" },
                    { text: `Found location (${foundLocation || 'Info desk'}) matches proximity for last seen (${matchedInc.lastSeen})`, status: "match" },
                    { text: `Timeline correlation: item retrieved shortly after incident was registered`, status: "match" }
                  ],
                  timeline: [
                    { time: matchedInc.reportedAt || "Just now", event: `Lost Report Created (${matchedInc.id})` },
                    { time: "Just now", event: "Volunteer Logged Discovery File" },
                    { time: "Just now", event: "Semantic Similarity Score Calculated" },
                    { time: "Pending", event: "Awaiting Hostess Sign-off" }
                  ],
                  verificationQuestions: [
                    `Ask reporter to confirm details about: "${matchedInc.title}"`,
                    `Can the reporter describe any markings, scratches, or content not mentioned in the description?`
                  ],
                  actions: [
                    { text: "Notify Volunteer at Gate Info Desk", status: "done" },
                    { text: "Verify Owner Identity and details", status: "pending" },
                    { text: "Return Item and document signature", status: "pending" }
                  ],
                  estimatedResolutionTime: "3 minutes"
                };
              }
            }

            if (matchedInc) {
              setSelectedIncidentId(matchedInc.id);
              setActiveMatchData(customMatchData);
              setShowMatchResult(true);

              // Update the incident status in real-time to "Matching" and save image!
              setIncidents(prev => 
                prev.map(i => i.id === matchedInc.id ? { ...i, status: 'Matching', imageUrl: i.imageUrl || foundPreview } : i)
              );

              // Add logs
              const now = new Date();
              const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const newSuccessLog = {
                id: Date.now(),
                message: `✔ Match identified: ${matchedInc.title} with Found Item (Confidence: ${customMatchData.confidence}%)`,
                time: timeStr,
                type: 'success'
              };
              setAiLogs(prev => [newSuccessLog, ...prev]);
            } else {
              // No immediate matches: create a new status called Awaiting Owner Report
              const now = new Date();
              const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              // Generate title from first three words
              const generatedTitle = itemDescription.split(/\s+/).slice(0, 3).join(" ") || "Unclaimed Item";

              const newFoundItem = {
                id: `FND-${Math.floor(109 + Math.random() * 900)}`,
                title: generatedTitle,
                description: itemDescription,
                foundLocation: foundLocation || "Stadium Grounds",
                timeFound: "Just now",
                reportedAt: timeStr,
                imageUrl: foundPreview,
                status: "Awaiting Owner Report"
              };
              
              setFoundItems(prev => [newFoundItem, ...prev]);
              
              const infoLog = {
                id: Date.now(),
                message: `🤖 Found item logged. Status: Awaiting Owner Report (${generatedTitle})`,
                time: timeStr,
                type: 'info'
              };
              setAiLogs(prev => [infoLog, ...prev]);
              
              setActiveUnclaimedItem(newFoundItem);
              setShowUnclaimedResult(true);
            }

            // Reset found form fields
            setFoundDesc('');
            setFoundLoc('');
            setFoundFile(null);
            setFoundPreview(null);
          }, 600);
        }
      }, step.time);
    });
  };

  const handleFoundSubmit = (e) => {
    e.preventDefault();
    if (!foundDesc) return;
    triggerMatchSimulation(foundDesc, foundLoc);
  };

  const handleResolveIncident = (id) => {
    setIncidents(prev => 
      prev.map(inc => inc.id === id ? { ...inc, status: 'Resolved' } : inc)
    );
    setShowMatchResult(false);
    setSelectedIncidentId(null);
    setActiveMatchData(null);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const log = {
      id: Date.now(),
      message: `🟢 Incident ${id} resolved and closed.`,
      time: timeStr,
      type: 'success'
    };
    setAiLogs(prev => [log, ...prev]);
  };

  const handleIncidentSelect = (incident) => {
    setSelectedIncidentId(incident.id);
    if (incident.status === 'Matching') {
      const descLower = incident.title.toLowerCase() + " " + incident.description.toLowerCase();
      let matchedData = null;

      // Handle retroactive matches
      if (incident.retroactiveMatchId) {
        const matchingFoundItem = foundItems.find(f => f.id === incident.retroactiveMatchId);
        matchedData = {
          incidentId: incident.id,
          foundItemId: incident.retroactiveMatchId,
          confidence: 94,
          foundImageUrl: (foundItems.find(f => f.id === incident.retroactiveMatchId)?.imageUrl) || incident.imageUrl || getDefaultImage(incident),
          reasons: [
            { text: `Semantic AI match: Found "${matchingFoundItem?.title || 'item'}" aligns with reported "${incident.title}"`, status: "match" },
            { text: `Description analysis: "${matchingFoundItem?.description}" matches characteristics`, status: "match" },
            { text: `Found location (${matchingFoundItem?.foundLocation || 'Stadium Grounds'}) matches proximity for last seen (${incident.lastSeen})`, status: "match" },
            { text: `Retroactive AI check: linked with unclaimed entry #${incident.retroactiveMatchId}`, status: "match" }
          ],
          timeline: [
            { time: matchingFoundItem?.timeFound || "Just now", event: `Discovered & Logged as Unclaimed (${incident.retroactiveMatchId})` },
            { time: "Pending", event: "No matching report in system, stored to database" },
            { time: incident.reportedAt || "Just now", event: `Missing Incident Reported (${incident.id})` },
            { time: "Just now", event: `AI scanned unclaimed files & retroactively linked to #${incident.retroactiveMatchId}` },
            { time: "Pending", event: "Awaiting Operator verification" }
          ],
          verificationQuestions: [
            `Verify the reporter details for "${incident.title}" against the logged found item "${matchingFoundItem?.title}".`,
            `Ask if they can confirm details matching: "${matchingFoundItem?.description}".`
          ],
          actions: [
            { text: `Notify Volunteer who turned in unclaimed #${incident.retroactiveMatchId}`, status: "done" },
            { text: "Verify matching credentials and ticket registration", status: "pending" },
            { text: "Reunite child/party and log safety checklist", status: "pending" }
          ],
          estimatedResolutionTime: "3 minutes"
        };
      } else if (descLower.includes('backpack') || descLower.includes('nike')) {
        matchedData = sampleMatchResult;
      } else if (descLower.includes('passport') || descLower.includes('german')) {
        matchedData = {
          ...sampleMatchResult,
          incidentId: "INC-301",
          confidence: 98,
          reasons: [
            { text: "Direct document match: Passport", status: "match" },
            { text: "Country match: Germany / Federal Republic of Germany", status: "match" },
            { text: "Visual name verification confirms 'Klaus Schmidt'", status: "match" },
            { text: `Found location matches closely with VIP Lounge area.`, status: "match" }
          ],
          verificationQuestions: [
            "What is the date of birth on the passport?",
            "Can you confirm the passport number prefix?",
            "Is there any other card inside the leather holder?"
          ],
          timeline: [
            { time: "8:02 PM", event: "Lost Report Created (INC-301)" },
            { time: "8:25 PM", event: "Volunteer Uploaded Document (FND-102)" },
            { time: "8:25 PM", event: "Optical Character Recognition Complete" },
            { time: "8:26 PM", event: "Semantic Database Match Confirmed" },
            { time: "Pending", event: "Awaiting Passport Verification" }
          ]
        };
      } else if (descLower.includes('maya') || descLower.includes('girl') || descLower.includes('teenager')) {
        matchedData = {
          incidentId: incident.id,
          foundItemId: `FND-${Math.floor(100 + Math.random() * 900)}`,
          confidence: 96,
          foundImageUrl: incident.imageUrl || "/mock_girl.jpg",
          reasons: [
            { text: "Facial similarity matches reported photograph template", status: "match" },
            { text: "Shirt style matches (grey shirt with pink collar trim)", status: "match" },
            { text: "Physical features match (long dark wavy brown hair)", status: "match" },
            { text: `Found location matches Gate A vicinity where child was separated.`, status: "match" }
          ],
          timeline: [
            { time: incident.reportedAt || "7:42 PM", event: `Lost Child Report Logged (${incident.id})` },
            { time: "Just now", event: "Steward spotted child and logged photo" },
            { time: "Just now", event: "Biometric Facial Tag verification Complete" },
            { time: "Just now", event: "Proximity match confirmed (96% Confidence)" },
            { time: "Pending", event: "Awaiting Guardian identity verification" }
          ],
          verificationQuestions: [
            "What is the name of your guardian/parent?",
            "Do you know the guardian's contact number?",
            "Can you verify the child's birth date or ticket seat number?"
          ],
          actions: [
            { text: "Notify Security Hub and dispatch steward", status: "done" },
            { text: "Verify parent/guardian ID matches ticket database", status: "pending" },
            { text: "Reunite family and log check-out signature", status: "pending" }
          ],
          estimatedResolutionTime: "3 minutes"
        };
      }

      if (!matchedData) {
        // Fallback for custom incidents that are already in "Matching" status
        matchedData = {
          incidentId: incident.id,
          foundItemId: `FND-${Math.floor(100 + Math.random() * 900)}`,
          confidence: 91,
          foundImageUrl: incident.imageUrl || getDefaultImage(incident),
          reasons: [
            { text: `Image similarity profile match (detected shape overlap)`, status: "match" },
            { text: `Semantic match: description aligns with "${incident.title}"`, status: "match" },
            { text: `Found location matches last seen (${incident.lastSeen}) vicinity`, status: "match" },
            { text: `System verification: matching tags successfully parsed`, status: "match" }
          ],
          timeline: [
            { time: incident.reportedAt || "Just now", event: `Lost Incident Registered (${incident.id})` },
            { time: "10 mins ago", event: "Volunteer logged matching discovered description" },
            { time: "5 mins ago", event: "AI verified similarity profiles" },
            { time: "Pending", event: "Awaiting Operator return confirmation" }
          ],
          verificationQuestions: [
            `Ask reporter to confirm details about: "${incident.title}"`,
            `Can the reporter describe any markings, scratches, or content not mentioned in the description?`
          ],
          actions: [
            { text: "Notify Volunteer at Gate Info Desk", status: "done" },
            { text: "Verify Owner Identity and details", status: "pending" },
            { text: "Return Item and document signature", status: "pending" }
          ],
          estimatedResolutionTime: "3 minutes"
        };
      }

      if (matchedData) {
        setActiveMatchData(matchedData);
        setShowMatchResult(true);
      } else {
        setShowMatchResult(false);
      }
    } else {
      setShowMatchResult(false);
    }
  };

  const handleBackToForm = () => {
    setShowMatchResult(false);
    setSelectedIncidentId(null);
    setActiveMatchData(null);
    setShowUnclaimedResult(false);
    setActiveUnclaimedItem(null);
  };

  const getDefaultImage = (inc) => {
    if (!inc) return "/mock_backpack.png";
    const text = ((inc.title || "") + " " + (inc.description || "")).toLowerCase();
    const isPerson = text.includes("boy") || text.includes("girl") || text.includes("child") || text.includes("teenager") || text.includes("person") || text.includes("human") || text.includes("man") || text.includes("guy") || inc.type === 'Lost Child' || inc.type === 'Separated Group';
    const isDoc = text.includes("passport") || text.includes("document") || text.includes("id") || text.includes("card") || text.includes("wallet");
    
    if (isPerson) return "/mock_girl.jpg";
    if (isDoc) return "/mock_passport.png";
    return "/mock_backpack.png";
  };

  const getItemInfo = (item) => {
    const desc = (item.description || "").toLowerCase();
    const title = (item.title || "").toLowerCase();
    const isPerson = desc.includes("girl") || desc.includes("boy") || desc.includes("child") || desc.includes("teenager") || desc.includes("person") || desc.includes("maya") || title.includes("girl") || title.includes("boy") || title.includes("child") || title.includes("teenager") || title.includes("person") || title.includes("maya");
    const isGroup = desc.includes("group") || desc.includes("fans") || desc.includes("people") || desc.includes("friends") || title.includes("group") || title.includes("fans") || title.includes("people") || title.includes("friends");

    if (isPerson) {
      return { icon: "👤", tag: "👤 Found Person", colorClass: "bg-teal-500/10 text-teal-400 border-teal-500/20" };
    }
    if (isGroup) {
      return { icon: "👥", tag: "👥 Found Group", colorClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" };
    }
    return { icon: "📦", tag: "📦 Found Item", colorClass: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-6 sm:px-6 lg:px-8 flex-1 flex flex-col gap-6 animate-slide-up">
      
      {/* Top Console Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        <div className="glass-panel border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center relative">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Open Incidents</span>
            <p className="font-heading text-xl sm:text-3xl font-black text-slate-200 mt-1">{stats.open}</p>
          </div>
          <div className="hidden sm:block p-2 rounded-xl bg-slate-800 text-slate-400">
            <FolderOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center relative">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Matched Today</span>
            <p className="font-heading text-xl sm:text-3xl font-black text-brand-green mt-1">{stats.resolved}</p>
          </div>
          <div className="hidden sm:block p-2 rounded-xl bg-brand-green/10 text-brand-green">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center relative">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Match</span>
            <p className="font-heading text-xl sm:text-3xl font-black text-amber-400 mt-1">{stats.matching}</p>
          </div>
          <div className="hidden sm:block p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Activity className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Live AI Activity Feed Ticker */}
      <div className="glass-panel border-white/5 rounded-2xl p-3 flex items-center gap-3 overflow-hidden h-14 relative bg-brand-dark/30">
        <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/5 font-heading text-xs font-black text-brand-green tracking-wide">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          AI ACTIVITY FEED
        </div>
        <div className="w-[1px] h-6 bg-white/10 flex-shrink-0"></div>
        
        {/* Sliding Logs viewport */}
        <div className="flex-1 overflow-hidden h-full relative" ref={logContainerRef}>
          <div className="absolute inset-y-0 left-0 right-0 flex flex-col transition-all duration-500" style={{ transform: 'translateY(0px)' }}>
            {liveLogs.length > 0 ? (
              <div className="flex items-center gap-3 py-2 text-xs">
                <span className="text-[10px] text-slate-500 bg-brand-blue border border-white/5 px-1.5 py-0.5 rounded font-mono">
                  {liveLogs[0].time}
                </span>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  liveLogs[0].type === 'success' ? 'bg-brand-green' : liveLogs[0].type === 'process' ? 'bg-blue-400' : 'bg-slate-400'
                }`}></span>
                <span className="text-slate-300 font-medium truncate">
                  {liveLogs[0].message}
                </span>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-2">Waiting for operations...</div>
            )}
          </div>
        </div>

        {/* Display secondary logs stack indicator */}
        {liveLogs.length > 1 && (
          <div className="flex-shrink-0 text-[10px] text-slate-500 pr-2">
            +{liveLogs.length - 1} logs
          </div>
        )}
      </div>

      {/* Bottom Main Workspace (Two columns: List and details) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        
        {/* Left Column: Active Incidents List (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-panel border-white/5 rounded-3xl p-4 flex-1 flex flex-col overflow-hidden max-h-[385px]">
            {/* List Header / Filters */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-heading text-sm font-bold text-white tracking-wide">
                  Active Incidents List
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filter</span>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1.5 border-b border-white/5 pb-3">
                {['All', 'Lost Item', 'Lost Child', 'Separated Group'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                      filterType === type 
                        ? 'bg-brand-green text-brand-dark' 
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {type === 'All' ? 'Show All' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((incident) => {
                  const isSelected = selectedIncidentId === incident.id;
                  
                  // Status colors mapping
                  const statusColors = {
                    Pending: { text: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", indicator: "bg-rose-400" },
                    Matching: { text: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", indicator: "bg-amber-400" },
                    Resolved: { text: "text-brand-green", bg: "bg-brand-emerald/10 border-brand-emerald/20", indicator: "bg-brand-green" },
                  };

                  const colorInfo = statusColors[incident.status] || statusColors.Pending;

                  return (
                    <div
                      key={incident.id}
                      onClick={() => handleIncidentSelect(incident)}
                      className={`rounded-2xl p-3.5 border text-left cursor-pointer transition-all duration-300 ${
                        isSelected 
                          ? 'bg-brand-blue-light/60 border-brand-green/45 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]' 
                          : 'bg-brand-blue/30 border-white/5 hover:border-white/15 hover:bg-brand-blue/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        {/* Type & status tag */}
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${colorInfo.bg} ${colorInfo.text} border`}>
                            {incident.type}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">#{incident.id}</span>
                        </div>
                        {/* Time tag */}
                        <span className="text-[10px] text-slate-400">{incident.time}</span>
                      </div>

                      <h5 className="font-heading text-sm font-bold text-white mb-1 leading-snug">
                        {incident.title}
                      </h5>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {incident.description}
                      </p>

                      <div className="flex justify-between items-center border-t border-white/5 pt-2 text-[10px] text-slate-500">
                        <span>Area: <strong className="text-slate-300 font-medium">{incident.lastSeen}</strong></span>
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${colorInfo.indicator} ${incident.status !== 'Resolved' ? 'animate-pulse' : ''}`}></span>
                          <span className="font-bold tracking-wide uppercase">{incident.status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Empty state list
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="rounded-2xl bg-white/5 border border-white/5 p-4 mb-4 text-slate-400">
                    <Compass className="h-8 w-8 stroke-[1.2]" />
                  </div>
                  <h5 className="font-heading text-sm font-bold text-white mb-1">No Active Incidents</h5>
                  <p className="text-[11px] text-slate-400 max-w-[240px] leading-relaxed">
                    Stadium operations are running smoothly. Report an incident to begin.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Unclaimed Found Items (Awaiting Owner Reports) */}
          <div className="glass-panel border-white/5 rounded-3xl p-4 flex-initial flex flex-col overflow-hidden max-h-[250px]">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
              <h4 className="font-heading text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
                </span>
                Awaiting Owner Reports
              </h4>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                {foundItems.filter(item => item.status === "Awaiting Owner Report").length} items
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {foundItems.filter(item => item.status === "Awaiting Owner Report").length > 0 ? (
                foundItems.filter(item => item.status === "Awaiting Owner Report").map((item) => {
                  const info = getItemInfo(item);
                  return (
                    <div
                      key={item.id}
                      className="bg-brand-blue/30 border border-white/5 rounded-2xl p-3 text-left relative"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md border ${info.colorClass}`}>
                          {info.tag}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">#{item.id}</span>
                      </div>
                      <h5 className="font-heading text-xs font-bold text-white mb-0.5 leading-snug">
                        {item.title || "Unclaimed Entry"}
                      </h5>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mb-2">
                        {item.description}
                      </p>
                      <div className="flex justify-between items-center text-[9px] text-slate-500 border-t border-white/5 pt-1.5">
                        <span>Found: <strong className="text-slate-300 font-medium">{item.foundLocation}</strong></span>
                        <span className="text-[9px] text-slate-400 font-medium">{item.timeFound}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-[11px] text-slate-500 font-medium leading-relaxed">
                  No unclaimed found items. All logged items have active owner matches!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Form / AI Matches View (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          {isSimulating ? (
            // Simulation screen
            <div className="glass-panel border-brand-green/20 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center justify-center flex-1 min-h-[400px]">
              <div className="relative mb-6">
                <Loader2 className="h-16 w-16 text-brand-green animate-spin stroke-[1.5]" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-brand-emerald" />
              </div>
              <h4 className="font-heading text-lg font-bold text-white mb-2">
                Running Real-Time AI Match
              </h4>
              <p className="text-xs text-brand-green font-bold tracking-widest uppercase mb-6">
                Analyzing Incident Databases
              </p>

              {/* Step checklist */}
              <div className="w-full max-w-xs text-left text-xs bg-brand-dark/50 rounded-2xl p-4 border border-white/5 space-y-3 font-mono">
                {[
                  "Analyzing image upload & metadata...",
                  "Extracting semantic attributes & visual tags...",
                  "Cross-referencing with active missing reports...",
                  "Calculating overall matching vector scores...",
                  "AI Recommendations Generated."
                ].map((stepText, idx) => {
                  const stepNum = idx + 1;
                  const isDone = simStep > stepNum;
                  const isActive = simStep === stepNum;
                  const isPending = simStep < stepNum;

                  return (
                    <div key={idx} className="flex items-center justify-between">
                      <span className={`${isDone ? 'text-brand-green' : isActive ? 'text-white font-bold' : 'text-slate-500'}`}>
                        {stepNum}. {stepText}
                      </span>
                      {isDone ? (
                        <Check className="h-4 w-4 text-brand-green" />
                      ) : isActive ? (
                        <Loader2 className="h-4 w-4 text-brand-green animate-spin" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-700"></span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : showUnclaimedResult && activeUnclaimedItem ? (
            // Awaiting Owner Result View
            <div className="glass-panel border-blue-500/20 rounded-3xl p-6 sm:p-8 flex flex-col justify-between flex-1 shadow-lg relative animate-slide-up bg-gradient-to-b from-brand-blue/45 to-brand-dark">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
              <div className="flex-grow">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1.5 rounded-lg border border-blue-500/20">
                      Unclaimed Entry Logged
                    </span>
                    <h3 className="font-heading text-lg font-bold text-white mt-2">
                      No Immediate Match Found
                    </h3>
                  </div>
                  <button
                    onClick={handleBackToForm}
                    className="text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/5 cursor-pointer"
                  >
                    Close Result
                  </button>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-6">
                  <p className="text-xs sm:text-sm text-blue-300 leading-relaxed font-medium">
                    💡 "No matching incident exists yet. This item has been securely recorded and will be automatically matched if a future report is submitted."
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col p-3 rounded-2xl bg-brand-dark/40 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 mb-2">Item Attributes</span>
                    <div className="text-xs text-slate-300 space-y-2">
                      <div>Name/Type: <strong className="text-white">{activeUnclaimedItem.title}</strong></div>
                      <div>Details: <span className="text-slate-400 line-clamp-2">{activeUnclaimedItem.description}</span></div>
                    </div>
                  </div>

                  <div className="flex flex-col p-3 rounded-2xl bg-brand-dark/40 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 mb-2">Location & Time</span>
                    <div className="text-xs text-slate-300 space-y-2">
                      <div>Location Found: <strong className="text-white">{activeUnclaimedItem.foundLocation}</strong></div>
                      <div>Time Indexed: <span className="text-slate-400">{activeUnclaimedItem.timeFound}</span></div>
                    </div>
                  </div>
                </div>

                {/* Simulated AI Timeline */}
                <div className="glass-panel bg-brand-dark/35 border border-white/5 rounded-2xl p-4">
                  <h4 className="font-heading text-xs font-bold tracking-wider text-slate-300 mb-3 flex items-center gap-2 uppercase">
                    <Clock className="h-4 w-4 text-blue-400" />
                    AI Lifecycle Timeline
                  </h4>
                  <div className="relative pl-4 border-l border-white/10 space-y-3.5 text-xs text-slate-400">
                    <div className="relative">
                      <span className="absolute -left-[21.5px] top-1 h-2.5 w-2.5 rounded-full border-2 bg-brand-emerald border-brand-emerald"></span>
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-slate-300">Item Discovered & Logged</span>
                        <span className="text-[10px] text-slate-500 font-mono">Just now</span>
                      </div>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21.5px] top-1 h-2.5 w-2.5 rounded-full border-2 bg-brand-emerald border-brand-emerald"></span>
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-slate-300">No owner report exists</span>
                        <span className="text-[10px] text-slate-500 font-mono">Just now</span>
                      </div>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21.5px] top-1 h-2.5 w-2.5 rounded-full border-2 bg-blue-500 border-blue-500 animate-pulse"></span>
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-blue-400">Stored for future matching</span>
                        <span className="text-[10px] text-slate-500 font-mono">Awaiting Report</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBackToForm}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-blue-light/50 border border-white/5 hover:border-blue-400/30 px-5 py-3 text-xs sm:text-sm font-bold text-white transition-all cursor-pointer mt-6"
              >
                Log Another Discovered Item
              </button>
            </div>
          ) : showMatchResult && selectedIncidentId ? (
            // Explainable AI result
            <MatchDetails
              incident={incidents.find(i => i.id === selectedIncidentId)}
              matchData={activeMatchData}
              onResolve={handleResolveIncident}
              onBack={handleBackToForm}
            />
          ) : (
            // Found Item Form
            <div className="glass-panel border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col flex-1 shadow-lg">
              <div className="mb-6">
                <h4 className="font-heading text-lg font-bold text-white">Log Found Item</h4>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Upload visual data or descriptions of items retrieved by stadium hostesses or stewards.
                </p>
              </div>

              {/* One-Click Demo Shortcuts */}
              <div className="bg-brand-blue-light/25 border border-white/5 rounded-2xl p-3.5 mb-5 flex flex-col gap-2 bg-gradient-to-br from-brand-blue-light/30 to-brand-blue/10">
                <span className="text-[10px] uppercase font-black text-brand-green tracking-wider flex items-center gap-1.5 font-heading">
                  <Sparkles className="h-3.5 w-3.5 text-brand-green" />
                  One-Click Demo Shortcuts (For Hackathon Judges)
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFoundDesc("Black Nike backpack found near security gate. Contains a notebook and a laptop with red keychain.");
                      setFoundLoc("Section 104, Gate B");
                      setFoundPreview("/mock_backpack.png");
                      setFoundFile(new File([], "mock_backpack.png"));
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-brand-green/30 hover:bg-white/10 text-xs text-slate-300 font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    🎒 Pre-fill Nike Backpack
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFoundDesc("Dark brown leather wallet holding a German passport.");
                      setFoundLoc("VIP Reception Desk");
                      setFoundPreview("/mock_passport.png");
                      setFoundFile(new File([], "mock_passport.png"));
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-brand-green/30 hover:bg-white/10 text-xs text-slate-300 font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    📖 Pre-fill German Passport
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFoundDesc("Found teenage girl matching lost child Maya. Long dark wavy hair, grey t-shirt with pink trim. Located near Gate A.");
                      setFoundLoc("Gate A Info Desk");
                      setFoundPreview("/mock_girl.jpg");
                      setFoundFile(new File([], "mock_girl.jpg"));
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-brand-green/30 hover:bg-white/10 text-xs text-slate-300 font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    👧 Pre-fill Lost Child (Maya)
                  </button>
                </div>
              </div>

              <form onSubmit={handleFoundSubmit} className="space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Found Item Image Upload */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Upload Found Item Image
                    </label>
                    <div className="relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-5 bg-brand-dark/25 hover:border-white/20 transition-all">
                      {foundPreview ? (
                        <div className="flex flex-col items-center gap-3 w-full">
                          <img src={foundPreview} alt="Found Item" className="h-24 rounded-lg object-cover shadow-lg border border-white/10" />
                          <button
                            type="button"
                            onClick={() => { setFoundFile(null); setFoundPreview(null); }}
                            className="text-xs font-semibold text-rose-400 hover:text-rose-300 underline"
                          >
                            Remove image
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-7 w-7 text-slate-400 mb-2 stroke-[1.5]" />
                          <span className="text-xs text-slate-300 font-semibold mb-0.5">
                            Upload image of discovered item
                          </span>
                          <span className="text-[10px] text-slate-500">Volunteers will use standard phone cameras</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Found Item Description */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Item Description
                    </label>
                    <textarea
                      required
                      rows="3"
                      value={foundDesc}
                      onChange={(e) => setFoundDesc(e.target.value)}
                      placeholder="e.g. Black backpack found near Section 23 with laptops inside, or German passport holder under name Klaus"
                      className="w-full rounded-xl bg-brand-dark/60 border border-white/10 px-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-brand-green/50 focus:outline-none transition-all resize-none"
                    ></textarea>
                    <p className="text-[10px] text-slate-500 mt-1">
                      💡 Tip: Try writing <span className="text-slate-300 italic font-medium">"black backpack nike"</span> or <span className="text-slate-300 italic font-medium">"german passport"</span> to simulate active matches!
                    </p>
                  </div>

                  {/* Found Location */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Found Location
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        value={foundLoc}
                        onChange={(e) => setFoundLoc(e.target.value)}
                        placeholder="e.g. Food Plaza Seat F12, or Gate B Info Booth"
                        className="w-full rounded-xl bg-brand-dark/60 border border-white/10 pl-9 pr-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-brand-green/50 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-emerald to-brand-green py-3 text-sm font-bold text-brand-dark shadow-[0_4px_12px_rgba(0,230,118,0.25)] hover:brightness-110 active:scale-98 transition-all cursor-pointer mt-4"
                >
                  <Sparkles className="h-4 w-4 fill-brand-dark stroke-brand-dark" />
                  <span>Start AI Match Search</span>
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
