import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Globe, GraduationCap, CheckCircle2, ShieldCheck, FileCheck } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

export const AuthLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useThemeStore();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Left Visual Branding Panel */}
      <div className="lg:w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle Background Geometric Accents */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <GraduationCap className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">{t('common.appName')}</h1>
              <p className="text-xs text-indigo-200">Management & Progress Evaluation System</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title={t('common.language')}
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>{i18n.language.toUpperCase()}</span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-colors"
              title={t('common.theme')}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-300" />}
            </button>
          </div>
        </div>

        {/* Hero Banner Content */}
        <div className="relative z-10 my-auto py-12 space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" /> Enterprise Academic Platform
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Streamlining Internship Workflows & Performance Evaluation
          </h2>

          <p className="text-sm text-indigo-200/90 leading-relaxed">
            Connect Students, Colleges, and Industry Partners in one unified portal with real-time request tracking, automated acceptance letter validation, dynamic report submissions, and multi-tier evaluations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-medium text-indigo-100">Role-Based Access Control</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-medium text-indigo-100">Dynamic Custom Reports</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-6 border-t border-white/10 text-xs text-indigo-300/80 flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} Summer Training System</span>
          <span>v1.0.0</span>
        </div>
      </div>

      {/* Right Form Content Panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
