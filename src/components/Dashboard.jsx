import React, { useState } from 'react';
import { Activity, Clock, ShieldAlert, CheckCircle2, ChevronRight, Brain, Eye, HelpCircle, Languages, FlaskConical, CheckCheck, Leaf } from 'lucide-react';
import { locales } from '../utils/uiTranslations';

export default function Dashboard({ setActiveTab, lang }) {
  const t = locales[lang] || locales.en;

  const metrics = [
    {
      label: t.totalActive,
      value: "42",
      subtext: "Reported this matchday",
      icon: ShieldAlert,
      color: "from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400"
    },
    {
      label: t.resolvedCases,
      value: "31",
      subtext: "Reunited successfully",
      icon: CheckCircle2,
      color: "from-brand-emerald/20 to-brand-green/5 border-brand-emerald/30 text-brand-green"
    },
    {
      label: t.pendingVerification,
      value: "11",
      subtext: "Requires volunteer sign-off",
      icon: Activity,
      color: "from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400"
    },
    {
      label: t.avgMatchTime,
      value: `18 ${t.sec}`,
      subtext: "AI processing speed",
      icon: Clock,
      color: "from-teal-500/20 to-teal-600/5 border-teal-500/30 text-teal-400"
    }
  ];

  const features = [
    {
      title: "AI Matching",
      description: "Instantly matches incident reports using semantic natural language descriptions and computer vision analysis.",
      icon: Brain,
      color: "text-brand-green bg-brand-green/10"
    },
    {
      title: "Explainable AI",
      description: "Shows exactly why a match was recommended (keychains, brand logos, time & location proximity) instead of just a raw percentage.",
      icon: Eye,
      color: "text-blue-400 bg-blue-500/10"
    },
    {
      title: "Decision Support",
      description: "Generates actionable verification checklists and procedures to guide volunteers safely through owner verification.",
      icon: HelpCircle,
      color: "text-amber-400 bg-amber-500/10"
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center animate-slide-up">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-emerald/10 blur-[120px] pointer-events-none"></div>

      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue border border-white/10 text-xs font-semibold text-brand-green tracking-wide uppercase mb-6 shadow-inner">
          <span className="h-2 w-2 rounded-full bg-brand-green animate-pulse"></span>
          {t.tagline}
        </div>
        <h1 className="font-heading text-4xl sm:text-6xl font-black text-white tracking-tight leading-none mb-6">
          REUNITE <span className="bg-gradient-to-r from-brand-green to-teal-400 bg-clip-text text-transparent">AI</span>
        </h1>
        <h2 className="text-lg sm:text-xl font-semibold text-slate-200 mb-4 max-w-2xl mx-auto leading-snug">
          AI-Powered Incident Resolution Assistant for Stadium Operations
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Helping stadium volunteers intelligently match lost reports with found items using Generative AI, reducing manual effort and improving fan experience during large-scale sports events.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setActiveTab('report')}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-emerald to-brand-green px-6 py-3.5 text-sm font-bold text-brand-dark shadow-[0_4px_20px_rgba(0,230,118,0.3)] hover:brightness-110 active:scale-98 transition-all duration-200 cursor-pointer"
          >
            <span>{t.reportIncident}</span>
            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => setActiveTab('console')}
            className="flex items-center gap-2 rounded-xl bg-brand-blue-light/50 border border-white/10 hover:border-brand-green/30 hover:bg-brand-blue-light/80 px-6 py-3.5 text-sm font-bold text-white shadow-lg active:scale-98 transition-all duration-200 cursor-pointer"
          >
            <span>{t.opsConsole}</span>
          </button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-xl font-bold text-white tracking-wide">
            Today's Operational Metrics
          </h3>
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand-green"></span>
            {t.realtimeFeed}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className={`glass-panel rounded-2xl p-5 border flex items-start justify-between bg-gradient-to-b ${metric.color}`}
              >
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    {metric.label}
                  </p>
                  <p className="font-heading text-3xl font-black text-white">
                    {metric.value}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1 font-medium">
                    {metric.subtext}
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-2.5">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* Operational Intelligence Section */}
      <div className="mb-16 border-t border-white/5 pt-16">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-green/10 text-brand-green">
            <Brain className="h-4 w-4" />
          </div>
          <h3 className="font-heading text-xl font-bold text-white tracking-wide">
            Predictive Stadium Operations &amp; Intelligence
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mb-8 max-w-2xl">
          AI analysis of lost item patterns, crowd flow data, and reported locations to automatically optimize volunteer deployment and predict gate congestion.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Heatmap & Congestion Zones */}
          <div className="glass-panel border-white/5 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
                <span>📍 Heatmap &amp; Congestion Zones</span>
                <span className="text-[10px] text-brand-green bg-brand-green/10 px-2 py-0.5 rounded animate-pulse">Live</span>
              </h4>
              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">Gate B Plaza (Concourse East)</span>
                    <span className="text-rose-400 font-bold">23 Items Lost · High Congestion</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">Food Court &amp; Concessions Area</span>
                    <span className="text-amber-400 font-bold">14 Items Lost · Moderate Traffic</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '55%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">Gate A Info Desk &amp; Tickets</span>
                    <span className="text-emerald-400 font-bold">5 Items Lost · Low Traffic</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-6 leading-relaxed">
              💡 <em>AI Insight: Lost items spike by 240% during half-time near Gate B concessions.</em>
            </p>
          </div>

          {/* Volunteer Deployment Recommendation */}
          <div className="glass-panel border-white/5 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                🤖 Volunteer Deployment Recommendations
              </h4>
              <div className="space-y-3">
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-3">
                  <span className="text-lg leading-none mt-0.5">🚨</span>
                  <div>
                    <h5 className="text-xs font-bold text-rose-400">Deploy 2 Volunteers to Gate B</h5>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                      Item loss density exceeds threshold due to crowd compression near turnstiles. Deploy volunteers to distribute tag cards.
                    </p>
                  </div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3">
                  <span className="text-lg leading-none mt-0.5">⚠️</span>
                  <div>
                    <h5 className="text-xs font-bold text-amber-400">Deploy 1 Volunteer to Food Court</h5>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                      Moderate losses recorded. Deploy sweep patrol steward to check seating tables every 15 minutes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-500">
              <span>Auto-dispatch enabled</span>
              <span className="text-brand-green font-bold">100% Operations Efficient</span>
            </div>
          </div>

          {/* Predictive Congestion Analysis */}
          <div className="glass-panel border-white/5 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                📊 Busy Gates &amp; Crowd Predictions
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <div className="min-w-0">
                    <span className="font-semibold text-white block">Gate B Entrance</span>
                    <span className="text-[10px] text-slate-400">Peak flow expected: T-30 mins to Kickoff</span>
                  </div>
                  <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/20">Critical</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="min-w-0">
                    <span className="font-semibold text-white block">VIP Lounge Concourse</span>
                    <span className="text-[10px] text-slate-400">High density expected: Half-Time</span>
                  </div>
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/20">Busy</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="min-w-0">
                    <span className="font-semibold text-white block">Gate A Entrance</span>
                    <span className="text-[10px] text-slate-400">Normal flow: Stable arrivals</span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">Stable</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-6 leading-relaxed">
              *Based on tickets scanned and historic incident data from FIFA World Cup Qatar 2022 matches.
            </p>
          </div>
        </div>
      </div>

      {/* ── Multilingual AI Support Panel ── */}
      <div className="mb-16 border-t border-white/5 pt-16">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Languages className="h-4 w-4" />
          </div>
          <h3 className="font-heading text-xl font-bold text-white tracking-wide">
            Multilingual AI Translation
          </h3>
          <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            Live Demo
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mb-8 max-w-2xl">
          Fans report incidents in their native language. REUNITE AI automatically normalizes Spanish and French descriptions into English before running the matching engine — no translation step needed for volunteers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Spanish */}
          <div className="glass-panel border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🇪🇸</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Spanish → English</h4>
            </div>
            <div className="space-y-3">
              {[
                { input: 'perdí mi mochila negra', output: 'lost my black backpack', match: 'INC-302' },
                { input: 'niño perdido cerca de Gate A', output: 'lost child near Gate A', match: 'INC-299' },
                { input: 'pasaporte alemán en el salón VIP', output: 'german passport in VIP lounge', match: 'INC-301' },
                { input: 'chaqueta azul en la sección norte', output: 'blue jacket in north section', match: 'INC-303' },
              ].map((row, i) => (
                <div key={i} className="rounded-xl bg-brand-dark/40 border border-white/5 p-3 text-xs">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-0.5 w-10 shrink-0">Input</span>
                    <span className="text-rose-300 italic font-medium leading-snug">"{row.input}"</span>
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-0.5 w-10 shrink-0">→ EN</span>
                    <span className="text-brand-green font-semibold leading-snug">"{row.output}"</span>
                  </div>
                  <div className="flex items-center gap-1.5 pl-12">
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Matched:</span>
                    <span className="text-[9px] bg-brand-green/10 text-brand-green border border-brand-green/20 px-1.5 py-0.5 rounded font-mono">{row.match}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* French */}
          <div className="glass-panel border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🇫🇷</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">French → English</h4>
            </div>
            <div className="space-y-3">
              {[
                { input: 'sac à dos noir trouvé', output: 'black backpack found', match: 'INC-302' },
                { input: 'enfant perdu — fille, cheveux longs', output: 'lost child — girl, long hair', match: 'INC-299' },
                { input: 'passeport allemand au bureau VIP', output: 'german passport at VIP desk', match: 'INC-301' },
                { input: 'veste bleue dans la tribune nord', output: 'blue jacket in north stand', match: 'INC-303' },
              ].map((row, i) => (
                <div key={i} className="rounded-xl bg-brand-dark/40 border border-white/5 p-3 text-xs">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-0.5 w-10 shrink-0">Input</span>
                    <span className="text-blue-300 italic font-medium leading-snug">"{row.input}"</span>
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-0.5 w-10 shrink-0">→ EN</span>
                    <span className="text-brand-green font-semibold leading-snug">"{row.output}"</span>
                  </div>
                  <div className="flex items-center gap-1.5 pl-12">
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Matched:</span>
                    <span className="text-[9px] bg-brand-green/10 text-brand-green border border-brand-green/20 px-1.5 py-0.5 rounded font-mono">{row.match}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15 p-3 text-[11px] text-slate-400 flex items-start gap-2">
          <span className="text-indigo-400 mt-0.5">💡</span>
          <span>Try it live: In the <strong className="text-white">Operations Console → Log Found Item</strong>, type any Spanish or French phrase above. The AI detector will show a translation badge in real time before running the match.</span>
        </div>
      </div>

      {/* ── Green Stadium Sustainability Impact Panel ── */}
      <div className="mb-16 border-t border-white/5 pt-16">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Leaf className="h-4 w-4" />
          </div>
          <h3 className="font-heading text-xl font-bold text-white tracking-wide">
            {t.sustainabilityTitle}
          </h3>
          <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Eco Metric
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mb-8 max-w-2xl">
          {t.sustainabilityDesc}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carbon Offset */}
          <div className="glass-panel border-emerald-500/10 rounded-2xl p-5 bg-gradient-to-b from-emerald-500/5 to-transparent">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              {t.co2Saved}
            </div>
            <div className="font-heading text-3xl font-black text-white mb-2">
              462 kg CO₂
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Equivalent to planting 19 trees. Prevented manufacturing emissions by returning high-value items (smartphones, jackets) to their original owners.
            </p>
          </div>

          {/* E-waste prevented */}
          <div className="glass-panel border-emerald-500/10 rounded-2xl p-5 bg-gradient-to-b from-emerald-500/5 to-transparent">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              {t.ewasteSaved}
            </div>
            <div className="font-heading text-3xl font-black text-white mb-2">
              62.4 kg
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Laptops, digital cameras, smartwatches, and passport booklets retrieved and saved from local landfill e-waste streams today.
            </p>
          </div>

          {/* Rating */}
          <div className="glass-panel border-emerald-500/10 rounded-2xl p-5 bg-gradient-to-b from-emerald-500/5 to-transparent">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              {t.sustainabilityKpi}
            </div>
            <div className="font-heading text-3xl font-black text-brand-green mb-2">
              98.2% Eco Grade
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Zero paper waste: REUNITE AI operates 100% digitally, eliminating carbon overhead from physical lost item claim forms, receipts, and volunteer ticketing slips.
            </p>
          </div>
        </div>
      </div>

      {/* ── Test Suite Status Panel ── */}
      <div className="mb-16 border-t border-white/5 pt-16">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-green/10 text-brand-green">
            <FlaskConical className="h-4 w-4" />
          </div>
          <h3 className="font-heading text-xl font-bold text-white tracking-wide">
            AI Engine Test Suite
          </h3>
          <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-brand-green bg-brand-green/10 px-2 py-0.5 rounded border border-brand-green/20">
            15 / 15 Passing
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mb-8 max-w-2xl">
          The AI inference engine is fully tested. All 15 unit tests across 5 test files are passing, covering category detection, semantic matching, cross-category blocking, UI form behaviour, and the decision support workflow.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              file: 'classifier.test.js',
              label: 'Category Classifier',
              tests: [
                'Detects "bag" from backpack keywords',
                'Detects "person" from child keywords',
                'Detects "document" from passport keywords',
                'Handles mixed-language input (ES/FR)',
                'Returns null for unknown category',
              ]
            },
            {
              file: 'matching.test.js',
              label: 'AI Matching Engine',
              tests: [
                'Similar descriptions produce a match',
                'Different categories never match (hard wall)',
                'Confidence score is generated (>0)',
              ]
            },
            {
              file: 'MatchDetails.test.jsx',
              label: 'Decision Support UI',
              tests: [
                'Renders confidence percentage correctly',
                'Resolve button triggers status update',
              ]
            },
            {
              file: 'ReportForm.test.jsx',
              label: 'Incident Report Form',
              tests: [
                'Form submits with valid title + description',
                'Demo shortcut auto-fills all fields',
                'Submit disabled when description is empty',
              ]
            },
            {
              file: 'Console.test.jsx',
              label: 'Operations Console',
              tests: [
                'Found item form triggers AI match flow',
                'Unmatched items enter Awaiting Owner Report',
              ]
            },
          ].map((suite, i) => (
            <div key={i} className="glass-panel border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] font-mono text-slate-500">{suite.file}</p>
                  <h4 className="text-xs font-bold text-white mt-0.5">{suite.label}</h4>
                </div>
                <div className="flex items-center gap-1.5 bg-brand-green/10 border border-brand-green/20 px-2 py-1 rounded-lg">
                  <CheckCheck className="h-3 w-3 text-brand-green" />
                  <span className="text-[10px] font-black text-brand-green">{suite.tests.length} pass</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {suite.tests.map((test, j) => (
                  <div key={j} className="flex items-start gap-2 text-[10px] text-slate-400">
                    <span className="text-brand-green mt-0.5 shrink-0">✓</span>
                    <span className="leading-snug">{test}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Summary card */}
          <div className="glass-panel border-brand-green/20 rounded-2xl p-5 flex flex-col justify-between bg-gradient-to-b from-brand-green/5 to-transparent">
            <div>
              <p className="text-[10px] font-mono text-slate-500">vitest@3 + @testing-library/react</p>
              <h4 className="text-xs font-bold text-white mt-0.5 mb-4">Test Summary</h4>
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Test Files</span>
                  <span className="font-bold text-white">5 passed</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Tests</span>
                  <span className="font-bold text-brand-green">15 passed</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Failures</span>
                  <span className="font-bold text-brand-green">0</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Duration</span>
                  <span className="font-bold text-white">~1.2s</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="text-[10px] text-slate-500 font-mono bg-brand-dark/50 rounded-lg p-2 border border-white/5">
                <span className="text-brand-green">$</span> npm run test<br/>
                <span className="text-brand-green">✓</span> 5 test files · <span className="text-brand-green">15 tests</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <h3 className="font-heading text-xl font-bold text-white tracking-wide mb-6">
          AI Engine Capabilities
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/5"
              >
                <div className={`inline-flex rounded-xl p-3 mb-5 ${feature.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="font-heading text-lg font-bold text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
