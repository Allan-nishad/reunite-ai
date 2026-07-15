import React from 'react';
import { Activity, Clock, ShieldAlert, CheckCircle2, ChevronRight, Brain, Eye, HelpCircle } from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
  const metrics = [
    {
      label: "Total Active Incidents",
      value: "42",
      subtext: "Reported this matchday",
      icon: ShieldAlert,
      color: "from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400"
    },
    {
      label: "Resolved Cases",
      value: "31",
      subtext: "Reunited successfully",
      icon: CheckCircle2,
      color: "from-brand-emerald/20 to-brand-green/5 border-brand-emerald/30 text-brand-green"
    },
    {
      label: "Pending Verification",
      value: "11",
      subtext: "Requires volunteer sign-off",
      icon: Activity,
      color: "from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400"
    },
    {
      label: "Average Match Time",
      value: "18 sec",
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
          FIFA World Cup Operations Suite
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
            <span>Report Incident</span>
            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => setActiveTab('console')}
            className="flex items-center gap-2 rounded-xl bg-brand-blue-light/50 border border-white/10 hover:border-brand-green/30 hover:bg-brand-blue-light/80 px-6 py-3.5 text-sm font-bold text-white shadow-lg active:scale-98 transition-all duration-200 cursor-pointer"
          >
            <span>Operations Console</span>
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
            Real-time feed
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
