import React, { useState, useCallback } from 'react';
import { Upload, MapPin, Clock, ArrowRight, ShieldCheck, ChevronDown, Zap, AlertTriangle } from 'lucide-react';
import { sanitizeText, validateFile, validateDescription, MAX_DESCRIPTION_LENGTH } from '../utils/security';

const DEMO_SCENARIOS = [
  {
    id: 'nike-bag',
    emoji: '🎒',
    label: 'Nike Backpack',
    sublabel: 'Lost Item · 94% match',
    color: '#00e676',
    colorBg: 'rgba(0,230,118,0.08)',
    colorBorder: 'rgba(0,230,118,0.25)',
    data: {
      type: 'Lost Item',
      title: 'Black Nike Backpack',
      description: 'Black Nike backpack found near security gate. Contains a notebook and a laptop with red keychain.',
      lastSeen: 'Section 104, Gate B',
      time: '20 mins ago',
      reporterName: 'Carlos Mendez',
    }
  },
  {
    id: 'lost-child',
    emoji: '👧',
    label: 'Lost Child — Maya',
    sublabel: 'Lost Child · 96% match',
    color: '#818cf8',
    colorBg: 'rgba(129,140,248,0.08)',
    colorBorder: 'rgba(129,140,248,0.25)',
    data: {
      type: 'Lost Child',
      title: 'Maya',
      description: '15-year old teenage girl with long dark brown wavy hair, wearing a grey t-shirt with pink collar trim. Separated near Gate A entrance.',
      lastSeen: 'Gate A, Entrance Plaza',
      time: '45 mins ago',
      reporterName: 'Elena Rostova (Guardian)',
    }
  },
  {
    id: 'separated-group',
    emoji: '👥',
    label: 'Separated Group',
    sublabel: 'Separated · Custom flow',
    color: '#fb923c',
    colorBg: 'rgba(251,146,60,0.08)',
    colorBorder: 'rgba(251,146,60,0.25)',
    data: {
      type: 'Separated Group',
      title: '3 Mexican Fans',
      description: 'Three Mexican fans wearing green jerseys separated from their group near Block C. One male, approx 30s, wearing a sombrero hat.',
      lastSeen: 'Block C, South Stand',
      time: '15 mins ago',
      reporterName: 'Steward #7 — Yusuf',
    }
  }
];

import { locales } from '../utils/uiTranslations';

export default function ReportForm({ onAddIncident, setActiveTab, lang }) {
  const t = locales[lang] || locales.en;

  const [formData, setFormData] = useState({
    type: 'Lost Item',
    title: '',
    description: '',
    lastSeen: '',
    time: '',
    image: null,
    reporterName: '',
  });

  const [submittedIncident, setSubmittedIncident] = useState(null);
  const [dragActive, setDragActive]               = useState(false);
  const [imagePreview, setImagePreview]           = useState(null);
  const [activeDemo, setActiveDemo]               = useState(null);
  const [fileError, setFileError]                 = useState('');
  const [descError, setDescError]                 = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0] || (e.dataTransfer && e.dataTransfer.files?.[0]);
    if (!file) return;
    const validation = validateFile(file);
    if (!validation.valid) { setFileError(validation.error); return; }
    setFileError('');
    setFormData(prev => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }, []);

  const handleDemoClick = (scenario) => {
    setActiveDemo(scenario.id);
    setFormData({ ...scenario.data, image: null });
    setImagePreview(null);

    // Short delay so judges see the fields fill in, then auto-submit
    setTimeout(() => {
      const newId = `INC-${Math.floor(100 + Math.random() * 900)}`;
      const newIncident = {
        id: newId,
        type: scenario.data.type,
        title: scenario.data.title,
        description: scenario.data.description,
        lastSeen: scenario.data.lastSeen || 'Not specified',
        time: scenario.data.time || 'Just now',
        reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: scenario.data.type === 'Lost Item' ? 'Matching' : 'Pending',
        imageUrl: scenario.id === 'lost-child' ? '/mock_girl.jpg' : null,
        priority: scenario.data.type === 'Lost Child' ? 'High' : 'Medium',
        reporterName: scenario.data.reporterName,
      };
      onAddIncident(newIncident);
      setSubmittedIncident(newIncident);
      setActiveDemo(null);
    }, 900);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const descVal = validateDescription(formData.description);
    if (!formData.title || formData.title.trim().length < 3) return;
    if (!descVal.valid) { setDescError(descVal.error); return; }
    setDescError('');
    const newId = `INC-${Math.floor(100 + Math.random() * 900)}`;
    const newIncident = {
      id:           newId,
      type:         formData.type,
      title:        sanitizeText(formData.title),
      description:  sanitizeText(formData.description),
      lastSeen:     sanitizeText(formData.lastSeen) || 'Not specified',
      time:         formData.time || 'Just now',
      reportedAt:   new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status:       formData.type === 'Lost Item' ? 'Matching' : 'Pending',
      imageUrl:     imagePreview,
      priority:     formData.type === 'Lost Child' ? 'High' : 'Medium',
      reporterName: sanitizeText(formData.reporterName) || 'Stadium Fan',
    };
    onAddIncident(newIncident);
    setSubmittedIncident(newIncident);
  };

  const handleReset = () => {
    setFormData({ type: 'Lost Item', title: '', description: '', lastSeen: '', time: '', image: null, reporterName: '' });
    setImagePreview(null);
    setSubmittedIncident(null);
    setActiveDemo(null);
    setFileError('');
    setDescError('');
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 animate-slide-up flex-1 flex flex-col justify-center">
      {submittedIncident ? (
        /* ── Success Card ── */
        <div role="alert" aria-live="assertive" className="glass-panel border-brand-green/30 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-emerald to-brand-green" />
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green glow-green">
            <ShieldCheck className="h-8 w-8 stroke-[2]" />
          </div>
          <h2 className="font-heading text-2xl font-black text-white mb-2">Incident Successfully Logged</h2>
          <p className="text-xs text-brand-green font-bold tracking-widest uppercase mb-6">
            Incident ID: {submittedIncident.id}
          </p>
          <div className="glass-panel bg-brand-dark/45 border border-white/5 rounded-2xl p-5 mb-8 text-left text-xs sm:text-sm space-y-3">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Incident Type:</span>
              <span className="font-bold text-white">{submittedIncident.type}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Subject:</span>
              <span className="font-bold text-white">{submittedIncident.title}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Last Seen:</span>
              <span className="font-bold text-white">{submittedIncident.lastSeen}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Initial Status:</span>
              <span className={`font-bold flex items-center gap-1.5 ${submittedIncident.status === 'Matching' ? 'text-amber-400' : 'text-rose-400'}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${submittedIncident.status === 'Matching' ? 'bg-amber-400' : 'bg-rose-400'} animate-pulse`} />
                {submittedIncident.status}
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-8">
            The AI engine is currently scanning found item databases and matching visual attributes.
            Volunteers in Stadium Control have been alerted.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('console')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-emerald to-brand-green px-5 py-3 text-sm font-bold text-brand-dark shadow-[0_4px_15px_rgba(0,230,118,0.2)] hover:brightness-110 active:scale-98 transition-all cursor-pointer"
            >
              <span>Open Operations Console</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-brand-blue-light/45 border border-white/5 hover:bg-brand-blue-light/70 px-5 py-3 text-sm font-bold text-white transition-all cursor-pointer"
            >
              <span>Report Another</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ── One-Click Demo Shortcuts ── */}
          <div
            className="mb-5 rounded-2xl border p-4"
            style={{ borderColor: 'rgba(251,191,36,0.2)', background: 'linear-gradient(135deg, rgba(251,191,36,0.06) 0%, rgba(251,146,60,0.04) 100%)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-amber-400/20">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">One-Click Demo</span>
              <span className="ml-auto text-[10px] text-slate-500 font-medium italic">For Hackathon Judges</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DEMO_SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleDemoClick(s)}
                  disabled={activeDemo !== null}
                  style={{
                    borderColor: activeDemo === s.id ? s.color : s.colorBorder,
                    background: activeDemo === s.id ? s.colorBg : 'rgba(15,23,42,0.55)',
                    boxShadow: activeDemo === s.id ? `0 0 12px ${s.color}30` : 'none',
                  }}
                  className="relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 hover:brightness-125 active:scale-95 cursor-pointer disabled:cursor-wait overflow-hidden"
                >
                  {activeDemo === s.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse pointer-events-none" />
                  )}
                  <span className="text-xl leading-none">{s.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{s.label}</p>
                    <p className="text-[10px] mt-0.5 font-semibold" style={{ color: s.color }}>{s.sublabel}</p>
                  </div>
                  {activeDemo === s.id ? (
                    <div className="ml-auto shrink-0">
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    </div>
                  ) : (
                    <ArrowRight className="ml-auto shrink-0 h-3.5 w-3.5 text-slate-500 group-hover:text-white transition-colors" />
                  )}
                </button>
              ))}
            </div>

            <p className="text-[10px] text-slate-500 mt-2.5 text-center leading-relaxed">
              Click any scenario → form auto-fills &amp; submits → switch to <span className="text-slate-400 font-semibold">Operations Console</span> to see the live AI match
            </p>
          </div>

          {/* ── Main Report Form ── */}
          <div className="glass-panel rounded-3xl border border-white/5 shadow-xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-blue-light" />
            <div className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-white">Report Stadium Incident</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Create an incident file to activate the AI Matching Engine.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Incident Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Incident Type</label>
                <div className="relative">
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-xl bg-brand-dark/60 border border-white/10 px-4 py-3 text-sm text-white focus:border-brand-green/50 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Lost Item">Lost Item</option>
                    <option value="Lost Child">Lost Child</option>
                    <option value="Separated Group">Separated Group</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                    <ChevronDown className="h-4.5 w-4.5" />
                  </div>
                </div>
              </div>

              {/* Reporter Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Reporter / Contact Name</label>
                <input
                  type="text"
                  name="reporterName"
                  value={formData.reporterName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe (or Seat details)"
                  className="w-full rounded-xl bg-brand-dark/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-green/50 focus:outline-none transition-all"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Subject / Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={formData.type === 'Lost Item' ? 'e.g. Black Nike Backpack' : formData.type === 'Lost Child' ? 'e.g. 7-year old boy Mateo' : 'e.g. 3 Mexican Fans'}
                  className="w-full rounded-xl bg-brand-dark/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-green/50 focus:outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2" htmlFor="report-description">Detailed Description <span aria-hidden="true">*</span></label>
                <textarea
                  id="report-description"
                  name="description"
                  required
                  aria-required="true"
                  aria-describedby={descError ? 'desc-error-report' : 'desc-hint-report'}
                  aria-invalid={!!descError}
                  rows="3"
                  value={formData.description}
                  onChange={(e) => { handleChange(e); setDescError(''); }}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  placeholder="Provide physical features, brand markings, color, size, wearing clothing, contents, language spoken, etc."
                  className={`w-full rounded-xl bg-brand-dark/60 border px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all resize-none ${descError ? 'border-rose-500/50' : 'border-white/10 focus:border-brand-green/50'}`}
                />
                <div className="flex justify-between items-center mt-1">
                  <span id="desc-hint-report" className="text-[10px] text-slate-500">Provide as much detail as possible to improve AI matching accuracy.</span>
                  <span className="text-[10px] text-slate-600 font-mono">{formData.description.length}/{MAX_DESCRIPTION_LENGTH}</span>
                </div>
                {descError && (
                  <p id="desc-error-report" role="alert" className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" aria-hidden="true" /> {descError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Last Seen */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Last Seen Location</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      name="lastSeen"
                      value={formData.lastSeen}
                      onChange={handleChange}
                      placeholder="e.g. Gate 4, East Food Court"
                      className="w-full rounded-xl bg-brand-dark/60 border border-white/10 pl-9 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-green/50 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Approximate Time</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Clock className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      placeholder="e.g. 10 mins ago, 8:15 PM"
                      className="w-full rounded-xl bg-brand-dark/60 border border-white/10 pl-9 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-green/50 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Upload Incident Image (Optional)</label>
                <div
                  className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all ${
                    dragActive ? 'border-brand-green bg-brand-green/5' : 'border-white/10 hover:border-white/20'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => { e.preventDefault(); setDragActive(false); handleImageChange({ target: { files: e.dataTransfer.files } }); }}
                >
                  {imagePreview ? (
                    <div className="flex flex-col items-center gap-3 w-full">
                      <img src={imagePreview} alt="Incident image preview" className="h-28 rounded-lg object-cover shadow-lg border border-white/10" />
                      <button type="button" aria-label="Remove uploaded image" onClick={() => { setImagePreview(null); setFileError(''); }} className="text-xs font-semibold text-rose-400 hover:text-rose-300 underline">
                        Remove image
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-slate-400 mb-2 stroke-[1.5]" aria-hidden="true" />
                      <span className="text-xs text-slate-300 font-semibold mb-1">
                        Drag &amp; drop or <span className="text-brand-green underline cursor-pointer">browse</span>
                      </span>
                      <span className="text-[10px] text-slate-500">JPEG, PNG, WebP — max 5 MB</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleImageChange}
                        aria-label="Upload incident image"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    </>
                  )}
                </div>
                {fileError && (
                  <p role="alert" className="text-[10px] text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" aria-hidden="true" /> {fileError}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-emerald to-brand-green py-3.5 text-sm font-bold text-brand-dark shadow-[0_4px_15px_rgba(0,230,118,0.2)] hover:brightness-110 active:scale-98 transition-all cursor-pointer"
              >
                <span>Submit Report</span>
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
