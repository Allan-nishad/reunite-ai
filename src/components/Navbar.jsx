import React from 'react';
import { Activity, Shield, ShieldAlert, LayoutDashboard, FileSpreadsheet, PlusCircle } from 'lucide-react';
import { locales } from '../utils/uiTranslations';

export default function Navbar({ activeTab, setActiveTab, lang, setLang }) {
  const t = locales[lang] || locales.en;

  const tabs = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'report', label: t.reportIncident, icon: PlusCircle },
    { id: 'console', label: t.opsConsole, icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-brand-dark/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-emerald to-brand-green text-brand-dark shadow-[0_0_15px_rgba(0,230,118,0.3)]">
            <Shield className="h-5.5 w-5.5 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-green"></span>
            </span>
          </div>
          <div>
            <span className="font-heading text-lg font-bold tracking-wider text-white">
              REUNITE <span className="text-brand-green">AI</span>
            </span>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold leading-none">
              {t.tagline}
            </div>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex space-x-1 sm:space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'text-brand-green bg-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-brand-green to-brand-emerald"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Side: Language switch + Operations Badge */}
        <div className="flex items-center gap-3">
          {/* Language Selector flags */}
          <div className="flex items-center gap-1.5 bg-white/5 rounded-lg border border-white/5 p-1" role="group" aria-label="Select UI Language">
            {[
              { code: 'en', flag: '🇬🇧', label: 'English' },
              { code: 'es', flag: '🇪🇸', label: 'Español' },
              { code: 'fr', flag: '🇫🇷', label: 'Français' },
            ].map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                title={l.label}
                aria-label={`Switch UI language to ${l.label}`}
                className={`w-7 h-7 rounded flex items-center justify-center text-sm transition-all cursor-pointer hover:bg-white/5 ${
                  lang === l.code ? 'bg-brand-green/20 border border-brand-green/30 scale-105' : 'opacity-60 border border-transparent'
                }`}
              >
                {l.flag}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <div className="h-9 w-[1px] bg-white/10"></div>
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-300">Stadia Hub B</span>
              <span className="text-[10px] text-brand-green font-medium flex items-center justify-end gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse"></span>
                Live Operational Mode
              </span>
            </div>
            <div className="h-9 w-[1px] bg-white/10"></div>
            <div className="flex h-9 items-center gap-2 rounded-lg bg-brand-blue border border-white/5 px-3">
              <span className="text-xs font-bold text-slate-300 font-heading">L&F Desk #4</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

