import React from 'react';
import { X, Printer, Calendar, Clock, User, Shield, Hash, Smartphone, Trash2 } from 'lucide-react';
import { Form, FormResponse } from '../../types/form';

interface ResponseDetailModalProps {
  isOpen: boolean;
  response: FormResponse | null;
  form: Form | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const ResponseDetailModal: React.FC<ResponseDetailModalProps> = ({
  isOpen,
  response,
  form,
  onClose,
  onDelete,
}) => {
  if (!isOpen || !response || !form) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                جزئیات پاسخ دریافتی
              </span>
              <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                {response.trackingCode}
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">{form.title}</h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Meta Card */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">کد رهگیری:</span>
            <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400 text-sm mt-0.5 block">
              {response.trackingCode}
            </span>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">زمان ثبت در دیتابیس:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
              {response.submittedAt}
            </span>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">آدرس IP ثبت‌کننده:</span>
            <span className="font-mono text-slate-600 dark:text-slate-400 mt-0.5 block">
              {response.ipAddress || '192.168.1.100'}
            </span>
          </div>
        </div>

        {/* Submitted Values List */}
        <div className="space-y-3.5">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider">
            اطلاعات فیلدهای تکمیل‌شده:
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {form.fields
              .filter((f) => f.type !== 'static_text' && f.type !== 'divider')
              .map((field) => {
                const val = response.values[field.name] ?? response.values[field.id];
                const displayVal =
                  val === undefined || val === null || val === ''
                    ? '—'
                    : Array.isArray(val)
                    ? val.join('، ')
                    : typeof val === 'boolean'
                    ? val
                      ? 'بله'
                      : 'خیر'
                    : String(val);

                return (
                  <div
                    key={field.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-2xs"
                  >
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      {field.label}
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white block break-words">
                      {displayVal}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 print:hidden">
          <button
            type="button"
            onClick={() => {
              onDelete(response.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            حذف این پاسخ
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              چاپ گزارش
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
