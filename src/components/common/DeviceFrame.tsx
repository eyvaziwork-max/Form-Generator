import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, Maximize2 } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
  defaultMode?: 'desktop' | 'tablet' | 'mobile';
  title?: string;
  onClose?: () => void;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  defaultMode = 'desktop',
  title = 'پیش‌نمایش تعاملی فرم',
  onClose,
}) => {
  const [mode, setMode] = useState<'desktop' | 'tablet' | 'mobile'>(defaultMode);

  const getWidthClass = () => {
    switch (mode) {
      case 'mobile':
        return 'w-full max-w-[390px]';
      case 'tablet':
        return 'w-full max-w-[768px]';
      case 'desktop':
      default:
        return 'w-full max-w-4xl';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Device Bar */}
      <div className="bg-white dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{title}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
            (قابلیت تست تکمیل و ارسال زنده فرم)
          </span>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            onClick={() => setMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              mode === 'desktop'
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="حالت دسکتاپ (عرض کامل)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">دسکتاپ</span>
          </button>
          <button
            onClick={() => setMode('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              mode === 'tablet'
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="حالت تبلت (عرض ۷۶۸ پیکسل)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تبلت</span>
          </button>
          <button
            onClick={() => setMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              mode === 'mobile'
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="حالت موبایل (عرض ۳۹۰ پیکسل)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">موبایل</span>
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 px-2 py-1 text-xs font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            بستن پیش‌نمایش
          </button>
        )}
      </div>

      {/* Device Viewport Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-start justify-center bg-slate-200/50 dark:bg-slate-950/70">
        <div
          className={`transition-all duration-300 ${getWidthClass()} ${
            mode === 'mobile'
              ? 'border-8 border-slate-800 dark:border-slate-700 rounded-[2.5rem] shadow-2xl bg-white dark:bg-slate-900 overflow-hidden my-4'
              : mode === 'tablet'
              ? 'border-6 border-slate-700 dark:border-slate-600 rounded-3xl shadow-xl bg-white dark:bg-slate-900 overflow-hidden my-4'
              : 'bg-white dark:bg-slate-900 rounded-2xl shadow-lg dark:border dark:border-slate-800 my-2'
          }`}
        >
          {/* Mobile Bezel speaker Notch */}
          {mode === 'mobile' && (
            <div className="bg-slate-800 dark:bg-slate-700 h-6 flex items-center justify-center">
              <div className="w-20 h-3 bg-slate-900 dark:bg-slate-800 rounded-full"></div>
            </div>
          )}

          <div className="p-4 sm:p-8">{children}</div>

          {/* Mobile Home indicator */}
          {mode === 'mobile' && (
            <div className="bg-white dark:bg-slate-900 pb-3 pt-1 flex justify-center">
              <div className="w-28 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
