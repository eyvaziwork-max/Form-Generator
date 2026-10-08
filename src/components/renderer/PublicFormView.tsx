import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock,
  Layers,
  GraduationCap,
  Sun,
  Moon,
  Mail,
} from 'lucide-react';
import { Form } from '../../types/form';
import { FormRenderer } from './FormRenderer';
import { formatToPersianDate } from '../../services/db';
import { useTheme } from '../../context/ThemeContext';

interface PublicFormViewProps {
  form: Form;
  onSubmit: (values: Record<string, any>) => Promise<{
    success: boolean;
    trackingCode?: string;
    message?: string;
    errors?: Record<string, string>;
    emailNotified?: boolean;
    notificationEmail?: string;
    webhookDispatched?: boolean;
    webhookUrl?: string;
  }>;
  onBackToDashboard: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  isUserOnlyMode?: boolean;
  onToggleUserOnlyMode?: () => void;
  onOpenAdminLogin?: () => void;
}

export const PublicFormView: React.FC<PublicFormViewProps> = ({
  form,
  onSubmit,
  onBackToDashboard,
  onShowToast,
  isUserOnlyMode = false,
  onToggleUserOnlyMode,
  onOpenAdminLogin,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [trackingCode, setTrackingCode] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [submittedValues, setSubmittedValues] = useState<Record<string, any>>({});
  const [submittedDate, setSubmittedDate] = useState<string>('');
  const [emailNotified, setEmailNotified] = useState<boolean>(false);
  const [notifiedEmail, setNotifiedEmail] = useState<string>('');

  const handleCopyUserLink = () => {
    const url = `${window.location.origin}/?form=${form.slug || form.id}&view=user`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      onShowToast('لینک اختصاصی کاربر در کلیپ‌بورد کپی شد.', 'success');
    }
  };

  const handleSubmit = async (values: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      const res = await onSubmit(values);
      if (res.success && res.trackingCode) {
        setSubmissionSuccess(true);
        setTrackingCode(res.trackingCode);
        setSuccessMessage(res.message || 'اطلاعات با موفقیت در سامانه ثبت شد.');
        setSubmittedValues(values);
        setSubmittedDate(formatToPersianDate(new Date()));
        if (res.emailNotified && res.notificationEmail) {
          setEmailNotified(true);
          setNotifiedEmail(res.notificationEmail);
        }
        onShowToast('اطلاعات با موفقیت ثبت شد!', 'success');
        return { success: true };
      } else {
        return { success: false, message: res.message, errors: res.errors };
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTrackingCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(trackingCode);
      onShowToast('کد پیگیری در کلیپ‌بورد کپی شد.', 'success');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleResetForNewSubmission = () => {
    setSubmissionSuccess(false);
    setTrackingCode('');
    setSubmittedValues({});
    setEmailNotified(false);
    setNotifiedEmail('');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      {/* Top Strip */}
      {isUserOnlyMode ? (
        /* PURE USER-ONLY TOP BAR (NO ADMIN CONTROLS) */
        <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate max-w-[200px] sm:max-w-xs">
              {form.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer"
              title={isDark ? 'تغییر به حالت روز (روشن)' : 'تغییر به حالت شب (تاریک)'}
              aria-label="تغییر تم"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">اتصال امن SSL</span>
            </div>
          </div>
        </div>
      ) : (
        /* ADMIN PREVIEW TOP BAR */
        <div className="max-w-3xl mx-auto mb-6 space-y-3">
          {/* Admin Preview Notification Alert Banner */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>پیش‌نمایش مدیر:</strong> کاربران عادی این نوار و دکمه بازگشت به پنل را نخواهند دید.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyUserLink}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>کپی لینک کاربر</span>
              </button>
              {onToggleUserOnlyMode && (
                <button
                  type="button"
                  onClick={onToggleUserOnlyMode}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>تست نمای خالص کاربر</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به پنل مدیریت</span>
            </button>

            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer"
                title={isDark ? 'تغییر به حالت روز (روشن)' : 'تغییر به حالت شب (تاریک)'}
                aria-label="تغییر تم"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>ارتباط امن SSL</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {submissionSuccess ? (
          /* SUCCESS SCREEN */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-10 animate-in zoom-in-95 duration-200 print:shadow-none print:border-none">
            <div className="text-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-100 dark:shadow-emerald-950">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                ثبت موفقیت‌آمیز
              </span>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-3">
                اطلاعات شما با موفقیت ثبت گردید
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                {successMessage}
              </p>

              {/* Tracking Code Box */}
              <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 inline-block w-full max-w-sm">
                <span className="text-xs text-slate-400 dark:text-slate-400 font-semibold block">
                  کد رهگیری اختصاصی شما:
                </span>
                <div className="flex items-center justify-center gap-3 mt-1.5">
                  <span className="font-mono text-xl sm:text-2xl font-black text-indigo-700 dark:text-indigo-400 tracking-wider">
                    {trackingCode}
                  </span>
                  <button
                    onClick={handleCopyTrackingCode}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600 cursor-pointer"
                    title="کپی کد رهگیری"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                  ثبت در تاریخ: {submittedDate}
                </span>
              </div>

              {/* Email Notification Confirmation Badge */}
              {emailNotified && notifiedEmail && (
                <div className="mb-6 p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center gap-2.5 text-xs text-indigo-950 dark:text-indigo-200">
                  <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>
                    خلاصه این ثبت به صندوق ایمیل مدیر (<strong className="font-mono text-indigo-600 dark:text-indigo-400">{notifiedEmail}</strong>) ارسال گردید.
                  </span>
                </div>
              )}

              {/* Submitted Summary Table */}
              <div className="text-right bg-slate-50/60 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 mb-6 text-xs space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-200 block mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">
                  خلاصه اطلاعات ثبت شده:
                </span>
                {Object.entries(submittedValues).map(([key, val]) => {
                  const field = form.fields.find((f) => f.name === key);
                  if (!field || field.type === 'static_text' || field.type === 'divider') return null;
                  return (
                    <div key={key} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60 last:border-none">
                      <span className="text-slate-500 dark:text-slate-400">{field.label}:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {Array.isArray(val) ? val.join('، ') : String(val)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 print:hidden">
                <button
                  onClick={handlePrintReceipt}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  چاپ رسید ثبت‌نام
                </button>

                {form.settings?.allowMultipleSubmissions !== false && (
                  <button
                    onClick={handleResetForNewSubmission}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 dark:shadow-indigo-950 transition-all cursor-pointer"
                  >
                    ثبت یک پاسخ دیگر
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* FORM FILLING SCREEN */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden">
            {/* Header Strip with Form's Theme Color */}
            <div
              className="h-3 w-full"
              style={{ backgroundColor: form.settings?.themeColor || '#4f46e5' }}
            />

            <div className="p-6 sm:p-10">
              {/* Form Hero */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800">
                    فرم رسمی
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {form.title}
                </h1>

                {form.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
                    {form.description}
                  </p>
                )}
              </div>

              {/* Active / Inactive check */}
              {form.status !== 'active' ? (
                <div className="p-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-center">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">این فرم در حال حاضر غیرفعال است</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    پذیرش پاسخ‌های جدید برای این فرم موقتاً متوقف شده است. لطفاً بعداً مراجعه نمایید.
                  </p>
                </div>
              ) : (
                /* The Live Form Engine */
                <FormRenderer
                  form={form}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </div>
        )}

        {/* Clean Security Footer */}
        <div className="mt-8 text-center space-y-2">
          <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>اطلاعات این فرم با پروتکل امن SSL ثبت و رمزنگاری می‌شود</span>
          </div>

          {/* Admin shortcut if in user-only mode for easy testing */}
          {isUserOnlyMode && onOpenAdminLogin && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="text-[11px] text-slate-400/80 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                title="ورود مدیر فرم‌ساز"
              >
                ورود به پنل مدیریت
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
