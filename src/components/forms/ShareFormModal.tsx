import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Code2,
  ShieldCheck,
  Eye,
  Globe,
  Lock,
  Smartphone,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import { Form } from '../../types/form';

interface ShareFormModalProps {
  isOpen: boolean;
  form: Form | null;
  onClose: () => void;
  onOpenUserView: (formId: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ShareFormModal: React.FC<ShareFormModalProps> = ({
  isOpen,
  form,
  onClose,
  onOpenUserView,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'embed'>('link');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (!isOpen || !form) return null;

  // Construct direct public user link (User Only - No Admin Panel)
  const origin = window.location.origin;
  const publicUserUrl = `${origin}/?form=${form.slug || form.id}&view=user`;
  const embedCode = `<iframe\n  src="${publicUserUrl}"\n  width="100%"\n  height="750"\n  frameborder="0"\n  style="border: 0; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);"\n  allowfullscreen\n></iframe>`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(publicUserUrl);
      setCopiedLink(true);
      onShowToast('لینک اختصاصی کاربر کپی شد. آماده ارسال به مخاطبان.', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyEmbed = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      onShowToast('کد HTML امبد (Iframe) در کلیپ‌بورد کپی شد.', 'success');
      setTimeout(() => setCopiedEmbed(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                اشتراک‌گذاری و لینک اختصاصی کاربر
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                فرم: <span className="font-bold text-slate-700 dark:text-slate-300">«{form.title}»</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Isolation Callout */}
        <div className="my-4 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3 text-xs leading-relaxed">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-slate-700 dark:text-slate-300">
            <span className="font-extrabold text-emerald-800 dark:text-emerald-300 block mb-0.5">
              تفکیک کامل نمای کاربر از پنل ادمین (Admin Isolation)
            </span>
            کاربرانی که این لینک را باز می‌کنند، <strong className="text-emerald-900 dark:text-emerald-200">فقط فرم و دکمه ثبت پاسخ</strong> را مشاهده خواهند کرد و به هیچ‌یک از بخش‌های مدیریت، ویرایشگر یا گزارش‌ها دسترسی نخواهند داشت.
          </div>
        </div>

        {/* Tabs: Direct Link vs Iframe Embed */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'link'
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>لینک مستقیم کاربر (URL)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('embed')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'embed'
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>کد جاگذاری در وب‌سایت (iFrame)</span>
          </button>
        </div>

        {/* Tab 1: Direct Link */}
        {activeTab === 'link' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                آدرس مستقیم فرم برای ارسال به مخاطبان (پیامک، واتساپ، ایمیل):
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    readOnly
                    value={publicUserUrl}
                    className="w-full pl-3 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-mono text-left focus:outline-hidden"
                    dir="ltr"
                  />
                </div>

                <button
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    copiedLink
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>کپی شد!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>کپی لینک</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Test Link Buttons */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Smartphone className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>می‌توانید پیش از ارسال، نمای دقیق کاربر را خودتان تست کنید:</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenUserView(form.id);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>مشاهده فرم مثل کاربر</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Embed Code */}
        {activeTab === 'embed' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                کد HTML جهت قرار دادن در وردپرس یا صفحات وب سایت:
              </label>
              <div className="relative">
                <textarea
                  readOnly
                  rows={4}
                  value={embedCode}
                  className="w-full p-3 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-xl border border-slate-700 focus:outline-hidden leading-relaxed text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              onClick={handleCopyEmbed}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                copiedEmbed
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              }`}
            >
              {copiedEmbed ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>کد امبد در کلیپ‌بورد کپی شد!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>کپی کد جاگذاری (Iframe)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <Lock className="w-3.5 h-3.5" />
            <span>پروتکل امن SSL و سازگار با انواع موبایل و تبلت</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
