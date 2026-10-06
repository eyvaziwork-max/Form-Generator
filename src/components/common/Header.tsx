import React from 'react';
import {
  Layers,
  LayoutDashboard,
  FileSpreadsheet,
  Hammer,
  ExternalLink,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { Form } from '../../types/form';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  currentTab: 'dashboard' | 'forms' | 'builder' | 'responses' | 'public';
  setCurrentTab: (tab: 'dashboard' | 'forms' | 'builder' | 'responses' | 'public') => void;
  forms: Form[];
  selectedFormId: string;
  setSelectedFormId: (id: string) => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  forms,
  selectedFormId,
  setSelectedFormId,
  onResetData,
}) => {
  const currentForm = forms.find((f) => f.id === selectedFormId);
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">فرم‌ساز پرو</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                  سازمانی
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">سامانه جامع طراحی فرم و مدیریت پاسخ‌ها</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              پیشخوان
            </button>

            <button
              onClick={() => setCurrentTab('forms')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'forms'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              مدیریت فرم‌ها
            </button>

            <button
              onClick={() => setCurrentTab('builder')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'builder'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Hammer className="w-4 h-4" />
              طراحی فرم (Builder)
            </button>

            <button
              onClick={() => setCurrentTab('responses')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'responses'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              پاسخ‌ها و گزارش‌ها
            </button>
          </nav>

          {/* Form Quick Switcher & Public Portal Action */}
          <div className="flex items-center gap-2">
            {forms.length > 0 && (
              <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs">
                <span className="text-slate-500 dark:text-slate-400">فرم فعال:</span>
                <select
                  value={selectedFormId}
                  onChange={(e) => setSelectedFormId(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer max-w-[140px] truncate"
                >
                  {forms.map((f) => (
                    <option key={f.id} value={f.id} className="dark:bg-slate-800 dark:text-slate-200">
                      {f.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200/70 dark:border-slate-700/70"
              title={isDark ? 'تغییر به حالت روز (روشن)' : 'تغییر به حالت شب (تاریک)'}
              aria-label="تغییر تم"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 animate-in spin-in-180 duration-200" />
              )}
            </button>

            {/* Public Form View Button */}
            <button
              onClick={() => setCurrentTab('public')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                currentTab === 'public'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-950'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50'
              }`}
              title="مشاهده فرم نهایی ثبت اطلاعات دانشجویان"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">فرم عمومی</span>
              <span className="sm:hidden">فرم</span>
            </button>

            {/* Reset sample seed button */}
            <button
              onClick={onResetData}
              title="بازنشانی داده‌های نمونه سیستم به حالت اولیه"
              className="p-2 text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-2 mr-1">
              <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                مدیر
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center gap-1 py-1 ${
              currentTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            پیشخوان
          </button>
          <button
            onClick={() => setCurrentTab('forms')}
            className={`flex flex-col items-center gap-1 py-1 ${
              currentTab === 'forms' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Layers className="w-4 h-4" />
            فرم‌ها
          </button>
          <button
            onClick={() => setCurrentTab('builder')}
            className={`flex flex-col items-center gap-1 py-1 ${
              currentTab === 'builder' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Hammer className="w-4 h-4" />
            فرم‌ساز
          </button>
          <button
            onClick={() => setCurrentTab('responses')}
            className={`flex flex-col items-center gap-1 py-1 ${
              currentTab === 'responses' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            پاسخ‌ها
          </button>
        </div>
      </div>
    </header>
  );
};

