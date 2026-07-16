import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2, UserCheck, Clock, ListChecks, Check, ShieldAlert, CameraOff, Cpu, WifiOff } from 'lucide-react';


export default function MatchDetails({ incident, matchData, onResolve, onBack }) {
  if (!incident) return null;
  const [radialOffset, setRadialOffset] = useState(251.2); // (2 * PI * r) where r=40 is 251.2
  const [activeActions, setActiveActions] = useState({
    notified: false,
    verified: false,
    returned: false,
  });

  const confidence = matchData?.confidence || 94;
  const reasons = matchData?.reasons || [];
  const timeline = matchData?.timeline || [];
  const verificationQuestions = matchData?.verificationQuestions || [];
  const actions = matchData?.actions || [];
  const estimatedResolutionTime = matchData?.estimatedResolutionTime || "4 minutes";

  useEffect(() => {
    // Animate the confidence progress circle on mount
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (confidence / 100) * circumference;
    const timer = setTimeout(() => {
      setRadialOffset(offset);
    }, 200);
    return () => clearTimeout(timer);
  }, [confidence]);

  const handleActionClick = (type) => {
    setActiveActions(prev => {
      const updated = { ...prev, [type]: !prev[type] };
      // If returned is checked, let's trigger the resolve callback after a short delay
      if (type === 'returned' && updated.returned) {
        setTimeout(() => {
          onResolve(incident.id);
        }, 1000);
      }
      return updated;
    });
  };

  return (
    <div className="glass-panel border-brand-green/30 rounded-3xl p-5 sm:p-6 shadow-2xl relative animate-slide-up flex flex-col h-full overflow-y-auto"
      role="region" aria-label={`AI match result for ${incident.title}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-green bg-brand-green/10 px-2 py-0.5 rounded">
              AI Match Result
            </span>
            {/* AI Source Badge */}
            {matchData?.aiSource === 'ai' || matchData?.aiSource === 'cached' ? (
              <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1">
                <Cpu className="h-2.5 w-2.5" aria-hidden="true" /> AI-Generated
              </span>
            ) : (
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10 flex items-center gap-1">
                <WifiOff className="h-2.5 w-2.5" aria-hidden="true" /> Local Engine
              </span>
            )}
          </div>
          <h3 className="font-heading text-lg font-bold text-white mt-1">Potential Match Found</h3>
        </div>
        <button
          onClick={onBack}
          aria-label="Reset to found item form"
          className="text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/5 cursor-pointer">
          Reset View
        </button>
      </div>

      {/* Hero match summary: Confidence and Basic Information */}
      <div className="flex flex-col sm:flex-row items-center gap-5 bg-brand-blue-light/35 border border-white/5 rounded-2xl p-4 mb-5">
        {/* Radial progress for confidence */}
        <div className="relative flex items-center justify-center h-24 w-24 flex-shrink-0"
          role="meter" aria-label={`Match confidence: ${confidence} percent`}
          aria-valuenow={confidence} aria-valuemin={0} aria-valuemax={100}>
          <svg className="w-20 h-20">
            {/* Background circle */}
            <circle
              className="text-slate-700/60"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
              r="34"
              cx="40"
              cy="40"
            />
            {/* Active circle */}
            <circle
              className="text-brand-green progress-ring__circle"
              strokeWidth="6"
              strokeDasharray={213.6} /* 2 * PI * 34 = 213.6 */
              strokeDashoffset={213.6 - (confidence / 100) * 213.6}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="34"
              cx="40"
              cy="40"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="font-heading text-xl font-black text-white">{confidence}%</span>
            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Confidence</span>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="text-xs font-semibold text-slate-400">Comparing Incident File:</div>
          <div className="font-heading text-md font-bold text-white mb-1">{incident.title}</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-center sm:justify-start gap-1">
            <span>Last Seen: <strong className="text-white">{incident.lastSeen}</strong></span>
            <span className="text-slate-600">•</span>
            <span>Reported: <strong className="text-white">{incident.time}</strong></span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Image Visual Match */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="flex flex-col items-center p-3 rounded-2xl bg-brand-dark/40 border border-white/5">
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-2">Reported Photo</span>
          {incident.imageUrl ? (
            <img 
              src={incident.imageUrl} 
              alt="Reported item" 
              className="h-28 sm:h-36 w-full object-cover rounded-xl border border-white/10 shadow-inner" 
            />
          ) : (
            <div className="h-28 sm:h-36 w-full flex flex-col items-center justify-center rounded-xl bg-white/5 border border-dashed border-white/10 text-slate-500">
              <CameraOff className="h-6 w-6 mb-1.5" />
              <span className="text-[10px]">No image reported</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center p-3 rounded-2xl bg-brand-dark/40 border border-white/5">
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-2">Found Photo</span>
          {matchData?.foundImageUrl ? (
            <img 
              src={matchData.foundImageUrl} 
              alt="Found item" 
              className="h-28 sm:h-36 w-full object-cover rounded-xl border border-white/10 shadow-inner" 
            />
          ) : (
            <div className="h-28 sm:h-36 w-full flex flex-col items-center justify-center rounded-xl bg-white/5 border border-dashed border-white/10 text-slate-500">
              <CameraOff className="h-6 w-6 mb-1.5" />
              <span className="text-[10px]">No image logged</span>
            </div>
          )}
        </div>
      </div>

      {/* Details Grid (Two columns on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 mb-6">

        
        {/* Left Column: AI Reasoning (Explainable AI) & Match Timeline */}
        <div className="space-y-5">
          {/* Explainable AI Details */}
          <div className="glass-panel bg-brand-dark/35 border border-white/5 rounded-2xl p-4">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-brand-green" />
              AI Visual & Semantic Reasoning
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-xs">
              {reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  {reason.status === 'match' ? (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-brand-green mt-0.5">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 mt-0.5 animate-pulse">
                      <AlertTriangle className="h-3 w-3" />
                    </span>
                  )}
                  <span className={reason.status === 'match' ? 'text-slate-300' : 'text-amber-300 font-medium'}>
                    {reason.text.replace(/^✓\s*/, '')}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Matching Timeline */}
          <div className="glass-panel bg-brand-dark/35 border border-white/5 rounded-2xl p-4">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              AI Incident Timeline
            </h4>
            <div className="relative pl-4 border-l border-white/10 space-y-3.5 text-xs">
              {timeline.map((step, idx) => {
                const isPending = step.time === 'Pending';
                return (
                  <div key={idx} className="relative">
                    <span className={`absolute -left-[21.5px] top-1 h-2.5 w-2.5 rounded-full border-2 ${
                      isPending 
                        ? 'bg-brand-dark border-amber-400 animate-pulse' 
                        : 'bg-brand-emerald border-brand-emerald'
                    }`}></span>
                    <div className="flex justify-between items-start">
                      <span className={`font-semibold ${isPending ? 'text-amber-400' : 'text-slate-300'}`}>
                        {step.event}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">{step.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Suggested Verification & Decision Support Recommendations */}
        <div className="space-y-5">
          {/* Suggested Verification Questions */}
          <div className="glass-panel bg-brand-dark/35 border border-white/5 rounded-2xl p-4">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-brand-green" />
              Suggested Owner Verification
            </h4>
            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
              Verify matching credentials by asking the claiming party the following details:
            </p>
            <ul className="space-y-2 text-xs text-slate-300 bg-brand-dark/40 rounded-xl p-3 border border-white/5">
              {verificationQuestions.map((q, idx) => (
                <li key={idx} className="flex gap-2 items-start">
                  <span className="text-brand-green font-bold">•</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Decision Support Box */}
          <div className="glass-panel bg-gradient-to-br from-brand-emerald/10 to-teal-500/5 border border-brand-green/20 rounded-2xl p-4">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-brand-green mb-2.5 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Decision Support recommendation
            </h4>
            <div className="space-y-3.5 mb-4 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Estimated Match Resolution Time:</span>
                <strong className="text-brand-green font-heading">{estimatedResolutionTime}</strong>
              </div>
              <div className="space-y-2 border-t border-white/5 pt-3">
                <button
                  onClick={() => handleActionClick('notified')}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 border transition-all text-left ${
                    activeActions.notified
                      ? 'bg-brand-emerald/20 border-brand-emerald text-white'
                      : 'bg-brand-dark/40 border-white/10 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <span className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center ${
                      activeActions.notified ? 'bg-brand-green border-brand-green text-brand-dark' : 'border-slate-500'
                    }`}>
                      {activeActions.notified && <Check className="h-3 w-3 stroke-[3]" />}
                    </span>
                    Notify Volunteer Desk at Zone
                  </span>
                  <span className="text-[10px] text-slate-500">Auto-sent</span>
                </button>

                <button
                  onClick={() => handleActionClick('verified')}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 border transition-all text-left ${
                    activeActions.verified
                      ? 'bg-brand-emerald/20 border-brand-emerald text-white'
                      : 'bg-brand-dark/40 border-white/10 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <span className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center ${
                      activeActions.verified ? 'bg-brand-green border-brand-green text-brand-dark' : 'border-slate-500'
                    }`}>
                      {activeActions.verified && <Check className="h-3 w-3 stroke-[3]" />}
                    </span>
                    Verify ownership checklist
                  </span>
                  <span className="text-[10px] text-slate-500">Vol. Sign-off</span>
                </button>
              </div>
            </div>

            {/* Resolve/Return button */}
            <button
              onClick={() => handleActionClick('returned')}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                activeActions.returned
                  ? 'bg-brand-green/20 text-brand-green border border-brand-green/30'
                  : 'bg-brand-green text-brand-dark shadow-[0_4px_12px_rgba(0,230,118,0.25)] hover:brightness-110 active:scale-98 font-black'
              }`}
            >
              <UserCheck className="h-4.5 w-4.5 stroke-[2]" />
              <span>{activeActions.returned ? 'Item Returned & Logged' : 'Confirm Return & Resolve'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
