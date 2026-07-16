import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Activity, ShieldAlert, CheckCircle2, Upload, MapPin,
  AlertTriangle, Compass, FolderOpen, Check, Loader2,
  Sparkles, Clock, Languages, Cpu, Wifi, WifiOff,
} from 'lucide-react';
import MatchDetails from './MatchDetails';
import { sampleMatchResult } from '../data/mockData';
import { getCategory, buildCategoryIndex } from '../utils/classifier';
import { translateInput, getLangLabel, getLangFlag } from '../utils/translator';
import { sanitizeText, validateFile, validateDescription, MAX_DESCRIPTION_LENGTH } from '../utils/security';
import { getMatchAssessment } from '../services/atomesus';

// ─────────────────────────────────────────────────────────────────────────────

import { locales } from '../utils/uiTranslations';

export default function Console({
  incidents, setIncidents,
  foundItems, setFoundItems,
  aiLogs, setAiLogs,
  lang,
}) {
  const t = locales[lang] || locales.en;

  const [filterType, setFilterType]         = useState('All');
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [showMatchResult, setShowMatchResult]       = useState(false);
  const [activeMatchData, setActiveMatchData]       = useState(null);
  const [showUnclaimedResult, setShowUnclaimedResult] = useState(false);
  const [activeUnclaimedItem, setActiveUnclaimedItem] = useState(null);

  // Found form state
  const [foundDesc, setFoundDesc]       = useState('');
  const [foundLoc, setFoundLoc]         = useState('');
  const [foundFile, setFoundFile]       = useState(null);
  const [foundPreview, setFoundPreview] = useState(null);
  const [fileError, setFileError]       = useState('');
  const [descError, setDescError]       = useState('');

  // Language detection
  const [detectedLang, setDetectedLang] = useState(null);

  // Simulation / AI loading state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep]           = useState(0);
  const [simLogs, setSimLogs]           = useState([]);
  const [aiSource, setAiSource]         = useState(null); // 'ai' | 'local' | 'cached'

  // Live logs
  const [liveLogs, setLiveLogs]         = useState(aiLogs);
  const logContainerRef                 = useRef(null);

  // ── Performance: build category indexes with useMemo ─────────────────────
  const incidentIndex = useMemo(
    () => buildCategoryIndex(incidents.filter(i => i.status !== 'Resolved')),
    [incidents]
  );

  // ── Live AI activity ticker ───────────────────────────────────────────────
  useEffect(() => {
    const pool = [
      { message: '🤖 Running visual scan on Gate A security cameras...', type: 'process' },
      { message: '🤖 Comparing active report INC-299 with Stadium CCTV logs...', type: 'process' },
      { message: '🤖 Target child (Yellow shirt) match probability 65% at Concourse 3', type: 'info' },
      { message: '✔ Device proximity check complete for Gate 4 BLE Beacons', type: 'success' },
      { message: '🤖 Scanning local found items catalog for matching wallets...', type: 'process' },
      { message: '✔ AI Match suggested: Red Wallet matched with INC-288 (91%)', type: 'success' },
      { message: '🤖 Incident alert routed to volunteer staff at Fan Zone B', type: 'info' },
    ];
    const interval = setInterval(() => {
      const log   = pool[Math.floor(Math.random() * pool.length)];
      const time  = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLiveLogs(prev => [{ id: Date.now(), message: log.message, time, type: log.type }, ...prev]);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Sync parent aiLogs into liveLogs
  useEffect(() => {
    setLiveLogs(prev => {
      const combined = [...aiLogs, ...prev];
      return combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    });
  }, [aiLogs]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    open:     incidents.filter(i => i.status !== 'Resolved').length,
    resolved: incidents.filter(i => i.status === 'Resolved').length,
    matching: incidents.filter(i => i.status === 'Matching').length,
  }), [incidents]);

  const filteredIncidents = useMemo(() =>
    filterType === 'All' ? incidents : incidents.filter(i => i.type === filterType),
    [incidents, filterType]
  );

  // ── File handling with security validation ────────────────────────────────
  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setFileError(validation.error);
      setFoundFile(null);
      setFoundPreview(null);
      return;
    }

    setFileError('');
    setFoundFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFoundPreview(reader.result);
    reader.readAsDataURL(file);
  }, []);

  // ── Live language detection ───────────────────────────────────────────────
  const detectLang = useCallback((text) => {
    if (!text || text.trim().length < 4) { setDetectedLang(null); return; }
    const { lang, text: translated } = translateInput(text);
    if (lang !== 'en') {
      setDetectedLang({ lang, flag: getLangFlag(lang), label: getLangLabel(lang), translated });
    } else {
      setDetectedLang(null);
    }
  }, []);

  const handleDescChange = useCallback((e) => {
    const val = e.target.value;
    setFoundDesc(val);
    setDescError('');
    detectLang(val);
  }, [detectLang]);

  // ── Default image helper ──────────────────────────────────────────────────
  const getDefaultImage = useCallback((inc) => {
    if (!inc) return '/mock_backpack.png';
    const text = ((inc.title || '') + ' ' + (inc.description || '')).toLowerCase();
    if (/girl|child|teenager|person|human|man|guy|maya/.test(text) || inc.type === 'Lost Child' || inc.type === 'Separated Group')
      return '/mock_girl.jpg';
    if (/passport|document|id|card|wallet/.test(text)) return '/mock_passport.png';
    return '/mock_backpack.png';
  }, []);

  const getItemInfo = useCallback((item) => {
    const t = ((item.title || '') + ' ' + (item.description || '')).toLowerCase();
    if (/girl|boy|child|teenager|person|maya/.test(t)) return { tag: '👤 Found Person', colorClass: 'bg-teal-500/10 text-teal-400 border-teal-500/20' };
    if (/group|fans|people|friends/.test(t))           return { tag: '👥 Found Group',  colorClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
    return { tag: '📦 Found Item', colorClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
  }, []);

  // ── AI match simulation with real Atomesus call ───────────────────────────
  const triggerMatchSimulation = useCallback(async (itemDescription, foundLocation) => {
    // Validate before starting
    const descValidation = validateDescription(itemDescription);
    if (!descValidation.valid) {
      setDescError(descValidation.error);
      return;
    }

    setIsSimulating(true);
    setSimStep(0);
    setSimLogs([]);
    setAiSource(null);

    const animSteps = [
      { text: 'Analyzing image upload & metadata...',            ms: 600  },
      { text: 'Extracting semantic attributes & visual tags...', ms: 1300 },
      { text: 'Cross-referencing active missing reports...',     ms: 2000 },
      { text: 'Calculating vector similarity scores...',         ms: 2700 },
      { text: 'Generating AI reasoning...',                      ms: 3200 },
    ];

    // Run animation steps
    animSteps.forEach(({ text, ms }, idx) => {
      setTimeout(() => {
        setSimStep(idx + 1);
        setSimLogs(prev => [...prev, text]);
      }, ms);
    });

    // After animation: run real AI
    setTimeout(async () => {
      const sanitizedDesc = sanitizeText(itemDescription);
      const { text: translatedDesc } = translateInput(sanitizedDesc);
      const foundCategory = getCategory(translatedDesc, null);

      // Find the best matching incident from index
      let matchedInc = null;
      if (selectedIncidentId) {
        matchedInc = incidents.find(i => i.id === selectedIncidentId);
      } else if (foundCategory) {
        const candidates = incidentIndex[foundCategory] || [];
        matchedInc = candidates.find(inc => {
          const incText     = ((inc.title || '') + ' ' + (inc.description || '')).toLowerCase();
          const incCategory = getCategory(incText, inc.type);
          return incCategory === foundCategory;
        });
      }

      // Keyword fallbacks for demo scenarios
      const descLower = translatedDesc.toLowerCase();
      if (!matchedInc) {
        if (foundCategory === 'bag' && (descLower.includes('backpack') || descLower.includes('nike')))
          matchedInc = incidents.find(i => i.id === 'INC-302' && i.status !== 'Resolved');
        else if (foundCategory === 'bag' && (descLower.includes('jacket') || descLower.includes('coat')))
          matchedInc = incidents.find(i => i.id === 'INC-303' && i.status !== 'Resolved');
        else if (foundCategory === 'document')
          matchedInc = incidents.find(i => i.id === 'INC-301' && i.status !== 'Resolved');
        else if (foundCategory === 'person' && /maya|girl|teenager/.test(descLower))
          matchedInc = incidents.find(i => i.id === 'INC-299' && i.status !== 'Resolved');
      }

      if (matchedInc) {
        // ── Call Atomesus AI for real reasoning ──────────────────────────
        const lostReport = {
          category:    foundCategory,
          title:       matchedInc.title,
          description: matchedInc.description,
          lastSeen:    matchedInc.lastSeen,
        };
        const foundReport = {
          category:      foundCategory,
          description:   sanitizedDesc,
          foundLocation: foundLocation || 'Stadium Grounds',
        };

        const assessment = await getMatchAssessment(lostReport, foundReport);
        setAiSource(assessment.source);

        // Build reasons from AI assessment
        const aiReasons = assessment.reasoning.map(r => ({
          text: r.replace(/^✓\s*/, ''),
          status: 'match',
        }));

        // Append location warning if locations differ
        if (foundLocation && matchedInc.lastSeen && !descLower.includes(matchedInc.lastSeen.toLowerCase())) {
          aiReasons.push({
            text:   `Found location (${foundLocation}) differs from last seen (${matchedInc.lastSeen}) — expected as items are often moved to info desks`,
            status: 'warning',
          });
        }

        // Build custom match data
        const customMatchData = {
          ...sampleMatchResult,
          incidentId:   matchedInc.id,
          confidence:   assessment.confidence || sampleMatchResult.confidence,
          foundImageUrl: foundPreview || getDefaultImage(matchedInc),
          reasons:      aiReasons.length ? aiReasons : sampleMatchResult.reasons,
          aiSource:     assessment.source,
          timeline:     sampleMatchResult.timeline,
          verificationQuestions: assessment.verificationQuestions || sampleMatchResult.verificationQuestions,
          actions:      sampleMatchResult.actions,
          estimatedResolutionTime: sampleMatchResult.estimatedResolutionTime,
        };

        setIsSimulating(false);
        setSelectedIncidentId(matchedInc.id);
        setActiveMatchData(customMatchData);
        setShowMatchResult(true);

        setIncidents(prev =>
          prev.map(i => i.id === matchedInc.id ? { ...i, status: 'Matching', imageUrl: i.imageUrl || foundPreview } : i)
        );

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setAiLogs(prev => [{
          id:      Date.now(),
          message: `✔ ${assessment.source === 'ai' ? '[AI]' : '[Local]'} Match: ${matchedInc.title} (${assessment.confidence}% confidence)`,
          time:    timeStr,
          type:    'success',
        }, ...prev]);

      } else {
        setIsSimulating(false);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const generatedTitle = sanitizedDesc.split(/\s+/).slice(0, 3).join(' ') || 'Unclaimed Item';
        const newFoundItem = {
          id:           `FND-${Math.floor(109 + Math.random() * 900)}`,
          title:        generatedTitle,
          description:  sanitizedDesc,
          foundLocation: foundLocation || 'Stadium Grounds',
          timeFound:    'Just now',
          reportedAt:   timeStr,
          imageUrl:     foundPreview,
          status:       'Awaiting Owner Report',
        };

        setFoundItems(prev => [newFoundItem, ...prev]);
        setAiLogs(prev => [{
          id:      Date.now(),
          message: `🤖 Found item logged. Status: Awaiting Owner Report (${generatedTitle})`,
          time:    timeStr,
          type:    'info',
        }, ...prev]);
        setActiveUnclaimedItem(newFoundItem);
        setShowUnclaimedResult(true);
      }

      // Reset form
      setFoundDesc('');
      setFoundLoc('');
      setFoundFile(null);
      setFoundPreview(null);
      setDetectedLang(null);

    }, 3800);
  }, [incidents, incidentIndex, selectedIncidentId, foundPreview, getDefaultImage]);

  const handleFoundSubmit = useCallback((e) => {
    e.preventDefault();
    const validation = validateDescription(foundDesc);
    if (!validation.valid) { setDescError(validation.error); return; }
    triggerMatchSimulation(foundDesc, foundLoc);
  }, [foundDesc, foundLoc, triggerMatchSimulation]);

  const handleResolveIncident = useCallback((id) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'Resolved' } : inc));
    setShowMatchResult(false);
    setSelectedIncidentId(null);
    setActiveMatchData(null);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAiLogs(prev => [{ id: Date.now(), message: `🟢 Incident ${id} resolved and closed.`, time: timeStr, type: 'success' }, ...prev]);
  }, []);

  const handleIncidentSelect = useCallback((incident) => {
    setSelectedIncidentId(incident.id);
    if (incident.status !== 'Matching') { setShowMatchResult(false); return; }

    const descLower = (incident.title + ' ' + incident.description).toLowerCase();
    let matchedData = null;

    if (incident.retroactiveMatchId) {
      const mfi = foundItems.find(f => f.id === incident.retroactiveMatchId);
      matchedData = {
        incidentId:   incident.id,
        foundItemId:  incident.retroactiveMatchId,
        confidence:   94,
        foundImageUrl: mfi?.imageUrl || incident.imageUrl || getDefaultImage(incident),
        aiSource:     'local',
        reasons: [
          { text: `Same Category: "${mfi?.title || 'item'}" aligns with "${incident.title}"`, status: 'match' },
          { text: `Similar Description: "${mfi?.description}"`, status: 'match' },
          { text: `Location proximity: ${mfi?.foundLocation || 'Stadium'} → ${incident.lastSeen}`, status: 'match' },
          { text: `Timestamp match: linked via retroactive catalog scan`, status: 'match' },
        ],
        timeline: [
          { time: mfi?.timeFound || 'Earlier', event: `Discovered & Logged Unclaimed (${incident.retroactiveMatchId})` },
          { time: 'Pending', event: 'No matching report — stored to index' },
          { time: incident.reportedAt || 'Just now', event: `Missing Report Logged (${incident.id})` },
          { time: 'Just now', event: `AI retroactively linked to #${incident.retroactiveMatchId}` },
          { time: 'Pending', event: 'Awaiting operator verification' },
        ],
        verificationQuestions: [
          `Confirm details for "${incident.title}" against logged found item "${mfi?.title}".`,
          `Ask if the reporter can confirm: "${mfi?.description}".`,
        ],
        actions: [
          { text: `Notify volunteer who turned in #${incident.retroactiveMatchId}`, status: 'done' },
          { text: 'Verify credentials and ticket registration', status: 'pending' },
          { text: 'Reunite and log safety checklist', status: 'pending' },
        ],
        estimatedResolutionTime: '3 minutes',
      };
    } else if (descLower.includes('backpack') || descLower.includes('nike')) {
      matchedData = sampleMatchResult;
    } else if (descLower.includes('passport') || descLower.includes('german')) {
      matchedData = {
        ...sampleMatchResult, incidentId: 'INC-301', confidence: 98, aiSource: 'local',
        reasons: [
          { text: 'Same Document: German Passport', status: 'match' },
          { text: 'Country match: Germany / Federal Republic of Germany', status: 'match' },
          { text: "Name verification matches owner record ('Klaus Schmidt')", status: 'match' },
          { text: 'Location proximity: VIP Lounge area', status: 'match' },
        ],
      };
    } else if (/maya|girl|teenager/.test(descLower)) {
      matchedData = {
        incidentId:   incident.id,
        foundItemId:  `FND-${Math.floor(100 + Math.random() * 900)}`,
        confidence:   96,
        aiSource:     'local',
        foundImageUrl: incident.imageUrl || '/mock_girl.jpg',
        reasons: [
          { text: 'Biometric check: matches reported photograph template', status: 'match' },
          { text: 'Clothing match: grey shirt with pink collar trim', status: 'match' },
          { text: 'Physical features: long dark wavy brown hair', status: 'match' },
          { text: 'Location proximity: Gate A vicinity', status: 'match' },
        ],
        timeline: [
          { time: incident.reportedAt || '7:42 PM', event: `Lost Child Report Logged (${incident.id})` },
          { time: 'Just now', event: 'Steward spotted child and logged photo' },
          { time: 'Just now', event: 'Biometric verification complete' },
          { time: 'Pending', event: 'Awaiting guardian identity verification' },
        ],
        verificationQuestions: [
          "What is the name of the guardian/parent?",
          "Do you know the guardian's contact number?",
          "Can you verify the child's birth date or ticket seat number?",
        ],
        actions: [
          { text: 'Notify Security Hub and dispatch steward', status: 'done' },
          { text: 'Verify parent/guardian ID against ticket database', status: 'pending' },
          { text: 'Reunite family and log check-out signature', status: 'pending' },
        ],
        estimatedResolutionTime: '3 minutes',
      };
    } else {
      matchedData = {
        incidentId:   incident.id,
        foundItemId:  `FND-${Math.floor(100 + Math.random() * 900)}`,
        confidence:   91,
        aiSource:     'local',
        foundImageUrl: incident.imageUrl || getDefaultImage(incident),
        reasons: [
          { text: `Category confirmed: description aligns with "${incident.title}"`, status: 'match' },
          { text: 'Visual shape overlap similarity confirmed', status: 'match' },
          { text: `Location proximity: near ${incident.lastSeen || 'Stadium Plaza'}`, status: 'match' },
          { text: 'Timestamp window: matching tags parsed', status: 'match' },
        ],
        timeline: [
          { time: incident.reportedAt || 'Just now', event: `Incident Registered (${incident.id})` },
          { time: '10 mins ago', event: 'Volunteer logged matching discovery' },
          { time: '5 mins ago', event: 'AI verified similarity profiles' },
          { time: 'Pending', event: 'Awaiting operator confirmation' },
        ],
        verificationQuestions: [
          `Confirm details about: "${incident.title}"`,
          'Can the reporter describe any unique markings not in the description?',
        ],
        actions: [
          { text: 'Notify Volunteer at Gate Info Desk', status: 'done' },
          { text: 'Verify owner identity and details', status: 'pending' },
          { text: 'Return item and document signature', status: 'pending' },
        ],
        estimatedResolutionTime: '3 minutes',
      };
    }

    setActiveMatchData(matchedData);
    setShowMatchResult(true);
  }, [foundItems, incidents, getDefaultImage]);

  const handleBackToForm = useCallback(() => {
    setShowMatchResult(false);
    setSelectedIncidentId(null);
    setActiveMatchData(null);
    setShowUnclaimedResult(false);
    setActiveUnclaimedItem(null);
  }, []);

  // Status color map
  const STATUS_COLORS = {
    Pending:  { text: 'text-rose-400',       bg: 'bg-rose-500/10 border-rose-500/20',     indicator: 'bg-rose-400' },
    Matching: { text: 'text-amber-400',      bg: 'bg-amber-500/10 border-amber-500/20',   indicator: 'bg-amber-400' },
    Resolved: { text: 'text-brand-green',    bg: 'bg-brand-emerald/10 border-brand-emerald/20', indicator: 'bg-brand-green' },
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-6 sm:px-6 lg:px-8 flex-1 flex flex-col gap-6 animate-slide-up">

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-3 md:gap-6" role="region" aria-label="Incident statistics">
        {[
          { label: 'Open Incidents', value: stats.open,     color: 'text-slate-200',  icon: FolderOpen,    iconColor: 'text-slate-400' },
          { label: 'Matched Today', value: stats.resolved,  color: 'text-brand-green', icon: CheckCircle2, iconColor: 'text-brand-green' },
          { label: 'Pending Match', value: stats.matching,  color: 'text-amber-400',  icon: Activity,      iconColor: 'text-amber-400' },
        ].map(({ label, value, color, icon: Icon, iconColor }) => (
          <div key={label} className="glass-panel border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center"
            role="status" aria-label={`${label}: ${value}`}>
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
              <p className={`font-heading text-xl sm:text-3xl font-black ${color} mt-1`}>{value}</p>
            </div>
            <div className={`hidden sm:block p-2 rounded-xl bg-white/5 ${iconColor}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Live AI Activity Feed ── */}
      <div
        className="glass-panel border-white/5 rounded-2xl p-3 flex items-center gap-3 overflow-hidden h-14 relative bg-brand-dark/30"
        aria-live="polite"
        aria-label="Live AI activity feed"
        aria-atomic="false"
      >
        <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/5 font-heading text-xs font-black text-brand-green tracking-wide">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
          AI ACTIVITY FEED
        </div>
        <div className="w-[1px] h-6 bg-white/10 flex-shrink-0" />
        <div className="flex-1 overflow-hidden h-full relative" ref={logContainerRef}>
          {liveLogs.length > 0 ? (
            <div className="flex items-center gap-3 py-2 text-xs h-full">
              <span className="text-[10px] text-slate-500 bg-brand-blue border border-white/5 px-1.5 py-0.5 rounded font-mono shrink-0">
                {liveLogs[0].time}
              </span>
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                liveLogs[0].type === 'success' ? 'bg-brand-green' : liveLogs[0].type === 'process' ? 'bg-blue-400' : 'bg-slate-400'
              }`} aria-hidden="true" />
              <span className="text-slate-300 font-medium truncate">{liveLogs[0].message}</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-2">Waiting for operations...</div>
          )}
        </div>
        {liveLogs.length > 1 && (
          <div className="flex-shrink-0 text-[10px] text-slate-500 pr-2" aria-label={`${liveLogs.length - 1} additional log entries`}>
            +{liveLogs.length - 1} logs
          </div>
        )}
      </div>

      {/* ── Main Workspace ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">

        {/* Left Column: Incident List + Awaiting Items */}
        <div className="lg:col-span-5 flex flex-col gap-4">

          {/* Active Incidents List */}
          <div className="glass-panel border-white/5 rounded-3xl p-4 flex-1 flex flex-col overflow-hidden max-h-[385px]">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading text-sm font-bold text-white tracking-wide">{t.activeIncidents}</h2>
              </div>
              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1.5 border-b border-white/5 pb-3" role="group" aria-label="Filter incidents by type">
                {['All', 'Lost Item', 'Lost Child', 'Separated Group'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    aria-pressed={filterType === type}
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

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1" role="list" aria-label="Incident list">
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map(incident => {
                  const isSelected = selectedIncidentId === incident.id;
                  const colorInfo  = STATUS_COLORS[incident.status] || STATUS_COLORS.Pending;
                  return (
                    <div
                      key={incident.id}
                      role="listitem"
                      onClick={() => handleIncidentSelect(incident)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleIncidentSelect(incident)}
                      tabIndex={0}
                      aria-selected={isSelected}
                      aria-label={`${incident.type}: ${incident.title}, status ${incident.status}`}
                      className={`rounded-2xl p-3.5 border text-left cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-green/50 ${
                        isSelected
                          ? 'bg-brand-blue-light/60 border-brand-green/45'
                          : 'bg-brand-blue/30 border-white/5 hover:border-white/15 hover:bg-brand-blue/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${colorInfo.bg} ${colorInfo.text} border`}>
                            {incident.type}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">#{incident.id}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{incident.time}</span>
                      </div>
                      <h3 className="font-heading text-sm font-bold text-white mb-1 leading-snug">{incident.title}</h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">{incident.description}</p>
                      <div className="flex justify-between items-center border-t border-white/5 pt-2 text-[10px] text-slate-500">
                        <span>Area: <strong className="text-slate-300 font-medium">{incident.lastSeen}</strong></span>
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${colorInfo.indicator} ${incident.status !== 'Resolved' ? 'animate-pulse' : ''}`} aria-hidden="true" />
                          <span className="font-bold tracking-wide uppercase">{incident.status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center" role="status">
                  <div className="rounded-2xl bg-white/5 border border-white/5 p-4 mb-4 text-slate-400">
                    <Compass className="h-8 w-8 stroke-[1.2]" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-white mb-1">No Active Incidents</h3>
                  <p className="text-[11px] text-slate-400 max-w-[240px] leading-relaxed">
                    Stadium operations are running smoothly. Report an incident to begin.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Awaiting Owner Reports */}
          <div className="glass-panel border-white/5 rounded-3xl p-4 flex-initial flex flex-col overflow-hidden max-h-[250px]">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
              <h2 className="font-heading text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
                </span>
                {t.unclaimedItems}
              </h2>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono"
                aria-label={`${foundItems.filter(i => i.status === 'Awaiting Owner Report').length} items awaiting owner`}>
                {foundItems.filter(i => i.status === 'Awaiting Owner Report').length} items
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1" role="list" aria-label="Unclaimed found items">
              {foundItems.filter(i => i.status === 'Awaiting Owner Report').length > 0 ? (
                foundItems.filter(i => i.status === 'Awaiting Owner Report').map(item => {
                  const info = getItemInfo(item);
                  return (
                    <div key={item.id} role="listitem" className="bg-brand-blue/30 border border-white/5 rounded-2xl p-3">
                      <div className="flex justify-between items-start mb-1.5">
                        <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md border ${info.colorClass}`}>
                          {info.tag}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">#{item.id}</span>
                      </div>
                      <h3 className="font-heading text-xs font-bold text-white mb-0.5">{item.title || 'Unclaimed Entry'}</h3>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mb-2">{item.description}</p>
                      <div className="flex justify-between text-[9px] text-slate-500 border-t border-white/5 pt-1.5">
                        <span>Found: <strong className="text-slate-300">{item.foundLocation}</strong></span>
                        <span>{item.timeFound}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-[11px] text-slate-500 font-medium" role="status">
                  No unclaimed items. All logged items have active owner matches!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Form / Simulation / Match Result */}
        <div className="lg:col-span-7 flex flex-col">

          {/* Simulation loading screen */}
          {isSimulating ? (
            <div
              className="glass-panel border-brand-green/20 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center justify-center flex-1 min-h-[400px]"
              role="status"
              aria-busy="true"
              aria-label="AI matching in progress"
              aria-live="polite"
            >
              <div className="relative mb-6">
                <Loader2 className="h-16 w-16 text-brand-green animate-spin stroke-[1.5]" aria-hidden="true" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-brand-emerald" aria-hidden="true" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white mb-2">Running Real-Time AI Match</h3>
              <p className="text-xs text-brand-green font-bold tracking-widest uppercase mb-6">
                {import.meta.env.VITE_ATOMESUS_API_KEY ? 'Querying Atomesus AI...' : 'Analyzing Incident Databases'}
              </p>
              <div className="w-full max-w-xs text-left text-xs bg-brand-dark/50 rounded-2xl p-4 border border-white/5 space-y-3 font-mono">
                {[
                  'Analyzing image upload & metadata...',
                  'Extracting semantic attributes & visual tags...',
                  'Cross-referencing active missing reports...',
                  'Calculating vector similarity scores...',
                  'Generating AI reasoning...',
                ].map((stepText, idx) => {
                  const isDone = simStep > idx + 1;
                  const isActive = simStep === idx + 1;
                  return (
                    <div key={idx} className="flex items-center justify-between">
                      <span className={isDone ? 'text-brand-green' : isActive ? 'text-white font-bold' : 'text-slate-500'}>
                        {idx + 1}. {stepText}
                      </span>
                      {isDone   ? <Check className="h-4 w-4 text-brand-green" aria-hidden="true" /> :
                       isActive ? <Loader2 className="h-4 w-4 text-brand-green animate-spin" aria-hidden="true" /> :
                                  <span className="h-2 w-2 rounded-full bg-slate-700" aria-hidden="true" />}
                    </div>
                  );
                })}
              </div>
            </div>

          ) : showUnclaimedResult && activeUnclaimedItem ? (
            /* Awaiting Owner Result */
            <div className="glass-panel border-blue-500/20 rounded-3xl p-6 sm:p-8 flex flex-col justify-between flex-1 shadow-lg relative animate-slide-up bg-gradient-to-b from-brand-blue/45 to-brand-dark"
              role="region" aria-label="Unclaimed item logged result">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1.5 rounded-lg border border-blue-500/20">
                      Unclaimed Entry Logged
                    </span>
                    <h3 className="font-heading text-lg font-bold text-white mt-2">No Immediate Match Found</h3>
                  </div>
                  <button onClick={handleBackToForm} aria-label="Close result" className="text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/5 cursor-pointer">
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
                      <div>Name: <strong className="text-white">{activeUnclaimedItem.title}</strong></div>
                      <div>Details: <span className="text-slate-400 line-clamp-2">{activeUnclaimedItem.description}</span></div>
                    </div>
                  </div>
                  <div className="flex flex-col p-3 rounded-2xl bg-brand-dark/40 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 mb-2">Location & Time</span>
                    <div className="text-xs text-slate-300 space-y-2">
                      <div>Found: <strong className="text-white">{activeUnclaimedItem.foundLocation}</strong></div>
                      <div>Indexed: <span className="text-slate-400">{activeUnclaimedItem.timeFound}</span></div>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={handleBackToForm} aria-label="Log another discovered item"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-blue-light/50 border border-white/5 hover:border-blue-400/30 px-5 py-3 text-xs sm:text-sm font-bold text-white transition-all cursor-pointer mt-6">
                Log Another Discovered Item
              </button>
            </div>

          ) : showMatchResult && selectedIncidentId ? (
            <MatchDetails
              incident={incidents.find(i => i.id === selectedIncidentId)}
              matchData={activeMatchData}
              onResolve={handleResolveIncident}
              onBack={handleBackToForm}
            />

          ) : (
            /* Log Found Item Form */
            <div className="glass-panel border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col flex-1 shadow-lg">
              <div className="mb-6">
                <h2 className="font-heading text-lg font-bold text-white">{t.logFound}</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {t.logFoundDesc}
                </p>
              </div>

              {/* Demo Shortcuts */}
              <div className="bg-brand-blue-light/25 border border-white/5 rounded-2xl p-3.5 mb-5 flex flex-col gap-2 bg-gradient-to-br from-brand-blue-light/30 to-brand-blue/10">
                <span className="text-[10px] uppercase font-black text-brand-green tracking-wider flex items-center gap-1.5 font-heading">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  One-Click Demo Shortcuts (For Hackathon Judges)
                </span>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Demo scenario shortcuts">
                  {[
                    { label: '🎒 Pre-fill Nike Backpack', desc: 'Black Nike backpack found near security gate. Contains a notebook and a laptop with red keychain.', loc: 'Section 104, Gate B', preview: '/mock_backpack.png' },
                    { label: '📖 Pre-fill German Passport', desc: 'Dark brown leather wallet holding a German passport.', loc: 'VIP Reception Desk', preview: '/mock_passport.png' },
                    { label: '👧 Pre-fill Lost Child (Maya)', desc: 'Found teenage girl matching lost child Maya. Long dark wavy hair, grey t-shirt with pink trim. Located near Gate A.', loc: 'Gate A Info Desk', preview: '/mock_girl.jpg' },
                  ].map(({ label, desc, loc, preview }) => (
                    <button key={label} type="button"
                      onClick={() => { setFoundDesc(desc); setFoundLoc(loc); setFoundPreview(preview); setFoundFile(new File([], preview.split('/').pop())); setDescError(''); }}
                      aria-label={`Pre-fill form: ${label}`}
                      className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-brand-green/30 hover:bg-white/10 text-xs text-slate-300 font-medium transition-all cursor-pointer">
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleFoundSubmit} className="space-y-5 flex-1 flex flex-col justify-between" noValidate>
                <div className="space-y-4">

                  {/* Image Upload */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2" htmlFor="found-image-upload">
                      Upload Found Item Image
                    </label>
                    <div className="relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-5 bg-brand-dark/25 hover:border-white/20 transition-all">
                      {foundPreview ? (
                        <div className="flex flex-col items-center gap-3 w-full">
                          <img src={foundPreview} alt="Found item preview" className="h-24 rounded-lg object-cover shadow-lg border border-white/10" />
                          <button type="button" aria-label="Remove uploaded image"
                            onClick={() => { setFoundFile(null); setFoundPreview(null); setFileError(''); }}
                            className="text-xs font-semibold text-rose-400 hover:text-rose-300 underline cursor-pointer">
                            Remove image
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-7 w-7 text-slate-400 mb-2 stroke-[1.5]" aria-hidden="true" />
                          <span className="text-xs text-slate-300 font-semibold mb-0.5">Upload image of discovered item</span>
                          <span className="text-[10px] text-slate-500">JPEG, PNG, WebP — max 5 MB</span>
                          <input id="found-image-upload" type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            aria-describedby={fileError ? 'file-error' : undefined} />
                        </>
                      )}
                    </div>
                    {fileError && (
                      <p id="file-error" role="alert" className="text-[10px] text-rose-400 mt-1.5 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" /> {fileError}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2" htmlFor="found-desc">
                      {t.itemDesc} <span aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="found-desc"
                      required
                      aria-required="true"
                      aria-describedby={descError ? 'desc-error' : 'desc-hint'}
                      aria-invalid={!!descError}
                      rows={3}
                      value={foundDesc}
                      onChange={handleDescChange}
                      maxLength={MAX_DESCRIPTION_LENGTH}
                      placeholder="e.g. Black Nike backpack near Section 23 with laptop inside, or German passport holder"
                      className={`w-full rounded-xl bg-brand-dark/60 border px-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all resize-none ${
                        descError ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-brand-green/50'
                      }`}
                    />

                    {/* Live language detection badge */}
                    {detectedLang ? (
                      <div className="mt-2 rounded-xl border border-indigo-500/25 bg-indigo-500/8 p-3 flex items-start gap-2.5 animate-slide-up"
                        role="status" aria-live="polite" aria-label={`${detectedLang.label} detected, auto-translating to English`}>
                        <Languages className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-base leading-none" aria-hidden="true">{detectedLang.flag}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{detectedLang.label} Detected</span>
                            <span className="text-[9px] text-slate-500 font-mono ml-auto">Auto-translating →</span>
                          </div>
                          <p className="text-[11px] text-brand-green font-medium leading-snug truncate">"{detectedLang.translated}"</p>
                          <p className="text-[9px] text-slate-500 mt-0.5">AI will match using this English translation.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center mt-1">
                        <p id="desc-hint" className="text-[10px] text-slate-500">
                          💡 Try: <span className="text-slate-300 italic">"mochila negra"</span> (ES) or <span className="text-slate-300 italic">"sac à dos noir"</span> (FR) for live translation
                        </p>
                        <span className="text-[10px] text-slate-600 font-mono">{foundDesc.length}/{MAX_DESCRIPTION_LENGTH}</span>
                      </div>
                    )}
                    {descError && (
                      <p id="desc-error" role="alert" className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" /> {descError}
                      </p>
                    )}
                  </div>

                  {/* Found Location */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2" htmlFor="found-loc">
                      {t.foundLoc}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute inset-y-0 left-3 h-4 w-4 text-slate-400 my-auto" aria-hidden="true" />
                      <input
                        id="found-loc"
                        type="text"
                        value={foundLoc}
                        onChange={e => setFoundLoc(e.target.value)}
                        placeholder="e.g. Food Plaza Seat F12, or Gate B Info Booth"
                        className="w-full rounded-xl bg-brand-dark/60 border border-white/10 pl-9 pr-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-brand-green/50 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* AI Source indicator */}
                {aiSource && (
                  <div className={`flex items-center gap-2 text-[10px] font-medium px-3 py-2 rounded-lg border ${
                    aiSource === 'ai' || aiSource === 'cached'
                      ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20'
                      : 'text-slate-400 bg-white/5 border-white/10'
                  }`} role="status">
                    {aiSource === 'ai' || aiSource === 'cached'
                      ? <><Cpu className="h-3 w-3" aria-hidden="true" /> AI-Generated reasoning via Atomesus</>
                      : <><WifiOff className="h-3 w-3" aria-hidden="true" /> Local inference engine (add API key for AI)</>
                    }
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={isSimulating}
                  aria-label="Start AI match search for found item"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-emerald to-brand-green py-3 text-sm font-bold text-brand-dark shadow-[0_4px_12px_rgba(0,230,118,0.25)] hover:brightness-110 active:scale-98 transition-all cursor-pointer mt-4 disabled:opacity-60 disabled:cursor-not-allowed">
                  <Sparkles className="h-4 w-4 fill-brand-dark stroke-brand-dark" aria-hidden="true" />
                  <span>{t.startSearch}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
