import React, { useState } from 'react';
import {
  X,
  Settings,
  Check,
  Shield,
  Calendar,
  Palette,
  Bell,
  Mail,
  Sliders,
  Send,
  Eye,
  CheckCircle2,
  Sparkles,
  Info,
  Webhook,
  Code2,
  Globe,
  RefreshCw,
  AlertCircle,
  Loader2,
  Copy,
  Terminal,
} from 'lucide-react';
import { Form, FormSettings } from '../../types/form';
import { dbService } from '../../services/db';

interface FormSettingsModalProps {
  isOpen: boolean;
  form: Form | null;
  onClose: () => void;
  onSave: (formId: string, updatedSettings: Partial<Form>) => void;
}

export const FormSettingsModal: React.FC<FormSettingsModalProps> = ({
  isOpen,
  form,
  onClose,
  onSave,
}) => {
  if (!isOpen || !form) return null;

  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'webhook'>('general');

  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description);
  const [status, setStatus] = useState<'active' | 'inactive'>(form.status);
  const [successMessage, setSuccessMessage] = useState(
    form.settings?.successMessage || 'اطلاعات با موفقیت ثبت گردید.'
  );
  const [maxResponses, setMaxResponses] = useState<string>(
    form.settings?.maxResponses ? String(form.settings.maxResponses) : ''
  );
  const [enableCaptcha, setEnableCaptcha] = useState(form.settings?.enableCaptcha || false);
  const [allowMultipleSubmissions, setAllowMultipleSubmissions] = useState(
    form.settings?.allowMultipleSubmissions !== false
  );
  const [themeColor, setThemeColor] = useState(form.settings?.themeColor || '#4f46e5');

  // Email Notification States
  const [emailNotificationEnabled, setEmailNotificationEnabled] = useState(
    form.settings?.emailNotificationEnabled || false
  );
  const [notificationEmail, setNotificationEmail] = useState(
    form.settings?.notificationEmail || ''
  );
  const [emailSubjectTemplate, setEmailSubjectTemplate] = useState(
    form.settings?.emailSubjectTemplate || 'ثبت پاسخ جدید در فرم {form_title} (کد: {tracking_code})'
  );
  const [includeSubmissionSummary, setIncludeSubmissionSummary] = useState(
    form.settings?.includeSubmissionSummary !== false
  );

  const [testEmailSent, setTestEmailSent] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  // Webhook Integration States
  const [webhookEnabled, setWebhookEnabled] = useState(
    form.settings?.webhookEnabled || false
  );
  const [webhookUrl, setWebhookUrl] = useState(
    form.settings?.webhookUrl || ''
  );
  const [webhookSecret, setWebhookSecret] = useState(
    form.settings?.webhookSecret || ''
  );
  const [webhookIncludeMetadata, setWebhookIncludeMetadata] = useState(
    form.settings?.webhookIncludeMetadata !== false
  );
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<{
    success: boolean;
    status?: number;
    statusText?: string;
    durationMs?: number;
    error?: string;
    responsePreview?: string;
  } | null>(null);
  const [showWebhookPayloadPreview, setShowWebhookPayloadPreview] = useState(false);
  const [copiedWebhookPayload, setCopiedWebhookPayload] = useState(false);

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim() || !webhookUrl.trim().startsWith('http')) {
      alert('لطفاً آدرس معتبر وب‌هوک (شروع با http:// یا https://) وارد فرمایید.');
      return;
    }

    setIsTestingWebhook(true);
    setWebhookTestResult(null);

    try {
      const samplePayload = dbService.generateWebhookPayloadPreview(form);
      const res = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl.trim(),
          secret: webhookSecret.trim(),
          payload: samplePayload,
        }),
      });

      const data = await res.json();
      setWebhookTestResult(data);
    } catch (err: any) {
      setWebhookTestResult({
        success: false,
        error: err.message || 'خطا در ارتباط با سرور تست وب‌هوک.',
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleCopyWebhookPayload = () => {
    const payload = dbService.generateWebhookPayloadPreview(form);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopiedWebhookPayload(true);
      setTimeout(() => setCopiedWebhookPayload(false), 2500);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const newSettings: FormSettings = {
      title,
      description,
      slug: form.slug,
      status,
      successMessage,
      maxResponses: maxResponses ? parseInt(maxResponses, 10) : null,
      enableCaptcha,
      allowMultipleSubmissions,
      themeColor,
      emailNotificationEnabled,
      notificationEmail: notificationEmail.trim(),
      emailSubjectTemplate: emailSubjectTemplate.trim(),
      includeSubmissionSummary,
      webhookEnabled,
      webhookUrl: webhookUrl.trim(),
      webhookSecret: webhookSecret.trim(),
      webhookIncludeMetadata,
    };

    onSave(form.id, {
      title,
      description,
      status,
      settings: newSettings,
    });
    onClose();
  };

  const handleSendTestEmail = () => {
    if (!notificationEmail) {
      alert('لطفاً ابتدا آدرس ایمیل دریافت‌کننده را وارد فرمایید.');
      return;
    }
    setTestEmailSent(true);
    setTimeout(() => {
      setTestEmailSent(false);
    }, 4000);
  };

  const themeColors = [
    { label: 'نیلی سازمانی', value: '#4f46e5' },
    { label: 'زمردی تیره', value: '#059669' },
    { label: 'آبی اقیانوسی', value: '#0284c7' },
    { label: 'بنفش رویال', value: '#7c3aed' },
    { label: 'عنبر گرم', value: '#d97706' },
    { label: 'زرشکی شیک', value: '#e11d48' },
  ];

  // Dummy sample fields for live email preview
  const previewFields = form.fields
    .filter((f) => f.type !== 'divider' && f.type !== 'static_text' && f.type !== 'hidden')
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">تنظیمات پیشرفته فرم</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                پیکربندی وضعیت، محدودیت‌ها و اطلاع‌رسانی خودکار ایمیلی
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-4 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span className="truncate">تنظیمات عمومی</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span className="truncate">اعلان ایمیلی</span>
            {emailNotificationEnabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('webhook')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'webhook'
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Webhook className="w-4 h-4" />
            <span className="truncate">ارسال به وب‌هوک (Webhook)</span>
            {webhookEnabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900" />
            )}
          </button>
        </div>

        {/* Content Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto mt-5 space-y-5 pr-1">
          {activeTab === 'general' && (
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">عنوان فرم</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">توضیحات</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Success message */}
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  پیام موفقیت‌آمیز پس از ثبت پاسخ
                </label>
                <textarea
                  rows={2}
                  value={successMessage}
                  onChange={(e) => setSuccessMessage(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <div>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">وضعیت پذیرش پاسخ‌ها</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    در صورت غیرفعال بودن، کاربران امکان تکمیل فرم را نخواهند داشت.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStatus(status === 'active' ? 'inactive' : 'active')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    status === 'active' ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      status === 'active' ? '-translate-x-6' : '-translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Max Responses Limit */}
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  محدودیت تعداد کل پاسخ‌ها (اختیاری)
                </label>
                <input
                  type="number"
                  placeholder="مثال: 500 (برای نامحدود خالی بگذارید)"
                  value={maxResponses}
                  onChange={(e) => setMaxResponses(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Anti-spam & Multiple Submissions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">امکان ثبت چندباره پاسخ</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">آیا کاربر بتواند بعد از ثبت، مجدداً فرم را ارسال کند؟</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowMultipleSubmissions}
                    onChange={(e) => setAllowMultipleSubmissions(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">فعال‌سازی کد امنیتی (Captcha)</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">جلوگیری از ارسال ربات‌ها و اسپم خودکار</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableCaptcha}
                    onChange={(e) => setEnableCaptcha(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Theme Color Picker */}
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">رنگ تم و شناسه بصری فرم</label>
                <div className="flex items-center gap-3">
                  {themeColors.map((color) => (
                    <button
                      type="button"
                      key={color.value}
                      onClick={() => setThemeColor(color.value)}
                      style={{ backgroundColor: color.value }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        themeColor === color.value ? 'ring-4 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={color.label}
                    >
                      {themeColor === color.value && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {/* Notification Master Toggle */}
              <div className="flex items-center justify-between p-4 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">
                      فعال‌سازی اطلاع‌رسانی ایمیلی
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ارسال خودکار خلاصه پاسخ به صندوق ایمیل مدیر بلافاصله پس از ثبت
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEmailNotificationEnabled(!emailNotificationEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    emailNotificationEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailNotificationEnabled ? '-translate-x-6' : '-translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {emailNotificationEnabled ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Recipient Email */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      آدرس ایمیل دریافت‌کننده اطلاع‌رسانی
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required={emailNotificationEnabled}
                        placeholder="مثال: admin@university.ac.ir یا manager@company.com"
                        value={notificationEmail}
                        onChange={(e) => setNotificationEmail(e.target.value)}
                        className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dir-ltr text-right"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      می‌توانید چند ایمیل را با کاما (,) از هم جدا کنید.
                    </p>
                  </div>

                  {/* Subject Template */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      الگوی عنوان ایمیل (Subject)
                    </label>
                    <input
                      type="text"
                      value={emailSubjectTemplate}
                      onChange={(e) => setEmailSubjectTemplate(e.target.value)}
                      placeholder="مثال: ثبت پاسخ جدید در فرم {form_title} (کد: {tracking_code})"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">متغیرهای پویا:</span>
                      <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400">
                        {'{form_title}'}
                      </code>
                      <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400">
                        {'{tracking_code}'}
                      </code>
                    </div>
                  </div>

                  {/* Include Summary Checkbox */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                    <div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
                        درج جدول خلاصه فیلدها و پاسخ‌های ثبت‌شده
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        مشاهده فوری مقادیر پر شده توسط کاربر در متن ایمیل بدون نیاز به ورود به پنل
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeSubmissionSummary}
                      onChange={(e) => setIncludeSubmissionSummary(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>

                  {/* Actions: Send Test & View Preview */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEmailPreview(!showEmailPreview)}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{showEmailPreview ? 'بستن پیش‌نمایش ایمیل' : 'مشاهده پیش‌نمایش قالب ایمیل'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendTestEmail}
                      className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>ارسال ایمیل آزمایشی</span>
                    </button>
                  </div>

                  {/* Test Email Sent Toast Confirmation */}
                  {testEmailSent && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>
                        ایمیل آزمایشی با موفقیت برای <strong>{notificationEmail}</strong> شبیه‌سازی و ارسال گردید.
                      </span>
                    </div>
                  )}

                  {/* Live Rendered Email Template Preview */}
                  {showEmailPreview && (
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in text-xs font-sans">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <div className="space-y-1">
                          <p className="text-slate-500 dark:text-slate-400">
                            به: <span className="font-mono text-slate-800 dark:text-slate-200">{notificationEmail || 'admin@example.com'}</span>
                          </p>
                          <p className="font-bold text-slate-900 dark:text-white">
                            موضوع:{' '}
                            {emailSubjectTemplate
                              .replace('{form_title}', form.title)
                              .replace('{tracking_code}', 'TRK-982143')}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                          پیش‌نمایش HTML
                        </span>
                      </div>

                      {/* Mock Email Body */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                              {form.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              یک پاسخ جدید در فرم شما ثبت شد.
                            </p>
                          </div>
                          <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-700 dark:text-slate-300">
                            TRK-982143
                          </span>
                        </div>

                        {includeSubmissionSummary && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                              خلاصه داده‌های ثبت‌شده:
                            </span>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden text-[11px]">
                              {previewFields.map((field) => (
                                <div key={field.id} className="flex justify-between p-2 bg-slate-50/50 dark:bg-slate-800/40">
                                  <span className="text-slate-500 dark:text-slate-400">{field.label}:</span>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {field.type === 'phone' ? '09123456789' : 'نمونه اطلاعات ثبت‌شده'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 text-[10px] text-slate-400 text-center border-t border-slate-100 dark:border-slate-800">
                          این پیام به صورت خودکار توسط سامانه فرم‌ساز هوشمند ارسال شده است.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    با فعال‌سازی این قابلیت، پس از هر بار ثبت اطلاعات توسط کاربران، خلاصه‌ای از پاسخ به همراه کد پیگیری و جزییات فیلدها به ایمیل شما ارسال خواهد شد.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'webhook' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Webhook Callout Banner */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Webhook className="w-5 h-5" />
                </div>
                <div className="flex-1 text-xs leading-relaxed">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mb-1">
                    ارسال داده‌های فرم به وب‌هوک (HTTP POST Webhook)
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    با فعال‌سازی این قابلیت، به محض ثبت پاسخ توسط هر کاربر، یک درخواست <strong>HTTP POST</strong> به همراه محتوای کامل فیلدها و متادیتا در قالب <strong>JSON</strong> به سرور، CRM یا سامانه‌های اتوماسیون شما (Zapier, Make, n8n) مخابره می‌شود.
                  </p>
                </div>
              </div>

              {/* Webhook Enable Switch */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block">
                    فعال‌سازی ارسال وب‌هوک (Webhook Active)
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                    ارسال آنی پاسخ‌های جدید به نقطه پایانی (Endpoint) مشخص‌شده
                  </span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={webhookEnabled}
                    onChange={(e) => setWebhookEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {webhookEnabled ? (
                <div className="space-y-4 pt-1">
                  {/* Webhook URL Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      آدرس وب‌هوک (Endpoint URL) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Globe className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        required={webhookEnabled}
                        placeholder="https://api.yourdomain.com/api/webhooks/form-response"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-xs font-mono text-left focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        dir="ltr"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                      درخواست با متد HTTP POST و هدر <code>Content-Type: application/json</code> ارسال می‌شود.
                    </span>
                  </div>

                  {/* Webhook Secret Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      کلید امنیتی یا توکن احراز هویت (Webhook Secret / Bearer Token - اختیاری)
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="sec_live_9841... یا توکن اختصاصی شما"
                        value={webhookSecret}
                        onChange={(e) => setWebhookSecret(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-xs font-mono text-left focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        dir="ltr"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                      در هدرهای <code>X-Webhook-Secret</code> و <code>Authorization: Bearer</code> جهت بررسی اصالت منبع ارسال خواهد شد.
                    </span>
                  </div>

                  {/* Include Metadata Switch */}
                  <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={webhookIncludeMetadata}
                      onChange={(e) => setWebhookIncludeMetadata(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 dark:border-slate-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        ارسال متادیتا همراه با پاسخ
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        شامل کد رهگیری یکتا، IP فرستنده، زمان دقیق ثبت (شمسی و Timestamp) و مشخصات فرم
                      </span>
                    </div>
                  </label>

                  {/* Test Webhook Section */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          بررسی صحت اتصال به وب‌هوک
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          ارسال یک درخواست آزمایشی POST برای سنجش سلامت سرور مقصد
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleTestWebhook}
                        disabled={isTestingWebhook || !webhookUrl.trim()}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
                      >
                        {isTestingWebhook ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>در حال ارسال تست...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>ارسال درخواست آزمایشی</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Test Result Display */}
                    {webhookTestResult && (
                      <div
                        className={`p-3 rounded-xl border text-xs animate-in fade-in space-y-1.5 ${
                          webhookTestResult.success
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold">
                            {webhookTestResult.success ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                            )}
                            <span>
                              {webhookTestResult.success
                                ? 'اتصال موفقیت‌آمیز بود'
                                : 'خطا در برقراری ارتباط با وب‌هوک'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            {webhookTestResult.status && (
                              <span className="px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-800/80 font-bold">
                                HTTP {webhookTestResult.status} {webhookTestResult.statusText}
                              </span>
                            )}
                            {webhookTestResult.durationMs !== undefined && (
                              <span className="text-[10px] opacity-80">
                                {webhookTestResult.durationMs}ms
                              </span>
                            )}
                          </div>
                        </div>

                        {webhookTestResult.error && (
                          <p className="text-[11px] leading-relaxed opacity-90">
                            علت خطا: {webhookTestResult.error}
                          </p>
                        )}

                        {webhookTestResult.responsePreview && (
                          <div className="mt-1 pt-1 border-t border-black/10 dark:border-white/10 text-[10px] font-mono truncate" dir="ltr">
                            پاسخ سرور: {webhookTestResult.responsePreview}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Live JSON Payload Preview Accordion */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowWebhookPayloadPreview(!showWebhookPayloadPreview)}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-indigo-500" />
                        <span>مشاهده نمونه ساختار داده‌های ارسالی (JSON Payload Preview)</span>
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400 text-[11px]">
                        {showWebhookPayloadPreview ? 'بستن پیش‌نمایش' : 'مشاهده ساختار'}
                      </span>
                    </button>

                    {showWebhookPayloadPreview && (
                      <div className="p-3.5 bg-slate-900 border-t border-slate-800 text-left space-y-2 animate-in fade-in" dir="ltr">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <span className="text-[11px] font-mono text-slate-400">
                            POST application/json
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyWebhookPayload}
                            className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 font-mono transition-colors cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedWebhookPayload ? 'کپی شد!' : 'Copy JSON'}</span>
                          </button>
                        </div>
                        <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-56 leading-relaxed p-1">
                          {JSON.stringify(dbService.generateWebhookPayloadPreview(form), null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
                  <Webhook className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    قابلیت ارسال وب‌هوک در این فرم غیرفعال است.
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    برای اتصال فرم به سیستم‌های خارجی (اتوماسیون‌ها، Zapier، وب‌سرویس‌های اختصاصی یا پیام‌رسان‌ها)، سوییچ بالا را فعال نمایید.
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-950 transition-all cursor-pointer"
            >
              ذخیره تنظیمات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

