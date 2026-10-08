import React, { useState } from 'react';
import {
  FileCode2,
  ExternalLink,
  Download,
  Copy,
  Check,
  Sparkles,
  Server,
  Layers,
  Send,
  BarChart3,
  Terminal,
  ShieldCheck,
  RefreshCw,
  Webhook,
  Code2,
  Globe,
} from 'lucide-react';

interface ApiDocsViewProps {
  onOpenPublicForm?: () => void;
}

export const ApiDocsView: React.FC<ApiDocsViewProps> = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeLang, setActiveLang] = useState<'curl' | 'javascript' | 'python'>('curl');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [iframeKey, setIframeKey] = useState<number>(1);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/api/forms',
      title: 'فهرست فرم‌ها',
      description: 'دریافت تمامی فرم‌های سامانه به همراه تعداد پاسخ‌های دریافتی و وضعیت.',
      tag: 'forms',
    },
    {
      method: 'POST',
      path: '/api/forms',
      title: 'ایجاد فرم جدید',
      description: 'تعریف فرم جدید با تنظیمات و فیلدهای اختصاصی.',
      tag: 'forms',
    },
    {
      method: 'GET',
      path: '/api/forms/{id}',
      title: 'مشخصات فرم با شناسه یا اسلاگ',
      description: 'واکشی ساختار و فیلدهای فرم جهت ویرایش یا مشاهده.',
      tag: 'forms',
    },
    {
      method: 'PUT',
      path: '/api/forms/{id}',
      title: 'به‌روزرسانی فرم',
      description: 'ویرایش عنوان، توضیحات، اسلاگ، تنظیمات اعلان و فیلدها.',
      tag: 'forms',
    },
    {
      method: 'DELETE',
      path: '/api/forms/{id}',
      title: 'حذف فرم',
      description: 'حذف فرم و تمامی پاسخ‌های ثبت‌شده آن.',
      tag: 'forms',
    },
    {
      method: 'POST',
      path: '/api/forms/{id}/clone',
      title: 'شبیه‌سازی فرم',
      description: 'تکثیر فرم و ایجاد یک نسخه مستقل جدید.',
      tag: 'forms',
    },
    {
      method: 'GET',
      path: '/api/public/forms/{slugOrId}',
      title: 'دریافت فرم عمومی',
      description: 'اسکیما و اعتبارسنجی‌های فرم برای نمایش به کاربر نهایی.',
      tag: 'public',
    },
    {
      method: 'POST',
      path: '/api/public/forms/{slugOrId}/submit',
      title: 'ثبت پاسخ در فرم عمومی',
      description: 'ارسال مقادیر فرم توسط کاربر، صدور کد پیگیری TRK و ارسال وب‌هوک.',
      tag: 'public',
    },
    {
      method: 'GET',
      path: '/api/public/tracking/{trackingCode}',
      title: 'استعلام با کد پیگیری',
      description: 'پیگیری و بررسی وضعیت پاسخ ثبت‌شده با کد پیگیری ۶ رقمی.',
      tag: 'public',
    },
    {
      method: 'GET',
      path: '/api/responses',
      title: 'لیست پاسخ‌ها',
      description: 'دریافت کلیه پاسخ‌های کاربران با امکان فیلتر بر اساس شناسه فرم.',
      tag: 'responses',
    },
    {
      method: 'GET',
      path: '/api/forms/{id}/export/csv',
      title: 'خروجی اکسل (CSV UTF-8)',
      description: 'دانلود فایل اکسل پاسخ‌های فرم با کدگذاری صحیح برای زبان فارسی.',
      tag: 'responses',
    },
    {
      method: 'GET',
      path: '/api/stats',
      title: 'شاخص‌های کلیدی داشبورد',
      description: 'تعداد کل فرم‌ها، پاسخ‌ها، نرخ رشد و نمودار فعالیت ۷ روز گذشته.',
      tag: 'analytics',
    },
    {
      method: 'POST',
      path: '/api/generate-form',
      title: 'تولید فرم با هوش مصنوعی',
      description: 'تولید خودکار اسکیما و فیلدهای فرم از روی پرامپت فارسی با مدل‌های Gemini.',
      tag: 'ai',
    },
    {
      method: 'POST',
      path: '/api/webhook/test',
      title: 'تست اتصال وب‌هوک',
      description: 'ارسال پینگ آزمایشی جهت راستی‌آزمایی نشانی وب‌هوک مقصد.',
      tag: 'webhooks',
    },
  ];

  const filteredEndpoints = selectedTag === 'all'
    ? endpoints
    : endpoints.filter((e) => e.tag === selectedTag);

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'POST':
        return 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'PUT':
        return 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'DELETE':
        return 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  const sampleCodes = {
    curl: `# 1. ثبت پاسخ در فرم دانشجویان
curl -X POST "http://localhost:3000/api/public/forms/student-registration/submit" \\
  -H "Content-Type: application/json" \\
  -d '{
    "values": {
      "first_name": "علی",
      "last_name": "احمدی",
      "student_id": "40114021",
      "phone": "09123456789"
    }
  }'

# 2. استعلام وضعیت با کد پیگیری
curl -X GET "http://localhost:3000/api/public/tracking/TRK-491024"

# 3. دریافت لیست فرم‌ها
curl -X GET "http://localhost:3000/api/forms"`,

    javascript: `// ثبت پاسخ جدید با Fetch API در جاوااسکریپت یا ری‌اکت
const submitForm = async () => {
  const response = await fetch('/api/public/forms/student-registration/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      values: {
        first_name: 'سارا',
        last_name: 'کریمی',
        student_id: '40219988',
        phone: '09351234567',
      },
    }),
  });

  const result = await response.json();
  if (result.success) {
    console.log('کد پیگیری دریافت شد:', result.trackingCode);
  }
};`,

    python: `import requests

# ارسال درخواست ثبت پاسخ به فرم‌ساز
url = "http://localhost:3000/api/public/forms/student-registration/submit"
payload = {
    "values": {
        "first_name": "محمد",
        "last_name": "رضایی",
        "student_id": "40012345",
        "phone": "09121112233"
    }
}

response = requests.post(url, json=payload)
data = response.json()

if data.get("success"):
    print(f"کد رهگیری: {data.get('trackingCode')}")
else:
    print(f"خطا: {data.get('message')}")`,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>مستندات کامل تعاملی و استاندارد Swagger & OpenAPI 3.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              وب‌سرویس‌ها و APIهای جامع سامانه فرم‌ساز
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              تمامی قابلیت‌های سیستم فرم‌ساز پرو شامل مدیریت فرم‌ها و فیلدها، ثبت پاسخ‌های عمومی، رهگیری با کد پیگیری، خروجی اکسل، آمار تحلیلی، هوش مصنوعی Gemini و وب‌هوک‌ها از طریق معماری RESTful در دسترس برنامه‌نویسان و سرویس‌های بیرونی قرار دارند.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <a
              href="/swagger"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-102"
            >
              <ExternalLink className="w-4 h-4" />
              <span>محیط تعاملی Swagger UI</span>
            </a>

            <a
              href="/api/openapi.json"
              target="_blank"
              rel="noreferrer"
              download="openapi.json"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>دانلود OpenAPI JSON</span>
            </a>
          </div>
        </div>

        {/* Quick KPI badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-xs text-slate-400">تعداد کل اندپوینت‌ها</span>
            <div className="text-lg font-bold text-white mt-1">۱۸+ متد REST</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-xs text-slate-400">نسخه استاندارد</span>
            <div className="text-lg font-bold text-indigo-400 mt-1">OpenAPI 3.0.3</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-xs text-slate-400">فرمت‌های خروجی</span>
            <div className="text-lg font-bold text-emerald-400 mt-1">JSON & CSV (BOM)</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-xs text-slate-400">امکان تست زنده</span>
            <div className="text-lg font-bold text-amber-400 mt-1">Try It Out فعال</div>
          </div>
        </div>
      </div>

      {/* Embedded Live Interactive Swagger UI Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                کنسول تعاملی Swagger UI
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Live Test Ready
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                در این بخش می‌توانید کلیه APIها را مستقیماً آزمایش کرده (Try it out) و پاسخ‌های سرور را زنده مشاهده نمایید.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIframeKey((prev) => prev + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
              title="بارگذاری مجدد Swagger UI"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تازه‌سازی</span>
            </button>
            <a
              href="/swagger"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>باز کردن تمام صفحه</span>
            </a>
          </div>
        </div>

        {/* Embedded Iframe to Swagger UI */}
        <div className="w-full h-[650px] bg-slate-50 dark:bg-slate-950 relative">
          <iframe
            key={iframeKey}
            src="/swagger"
            title="Swagger UI API Explorer"
            className="w-full h-full border-none"
          />
        </div>
      </div>

      {/* Endpoints Quick Reference Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              فهرست سریع مسیرهای API
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              راهنمای خلاصه متدها و مسیرهای دسترسی به خدمات وب‌سرویس
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            {[
              { id: 'all', label: 'همه' },
              { id: 'forms', label: 'فرم‌ها' },
              { id: 'public', label: 'عمومی' },
              { id: 'responses', label: 'پاسخ‌ها' },
              { id: 'analytics', label: 'آمار' },
              { id: 'ai', label: 'هوش مصنوعی' },
              { id: 'webhooks', label: 'وب‌هوک' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTag(t.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedTag === t.id
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          {filteredEndpoints.map((ep, idx) => (
            <div
              key={idx}
              className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border ${getMethodBadgeClass(
                      ep.method
                    )}`}
                  >
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100 dir-ltr text-left">
                    {ep.path}
                  </code>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-2">
                    {ep.title}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {ep.description}
                </p>
              </div>

              <button
                onClick={() => handleCopy(`curl -X ${ep.method} "http://localhost:3000${ep.path}"`, idx)}
                className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200/80 dark:border-slate-700"
                title="کپی دستور cURL"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">کپی شد</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی cURL</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Code Examples Playground */}
      <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">نمونه کدهای آماده اتصال</h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveLang('curl')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeLang === 'curl' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              cURL (Bash)
            </button>
            <button
              onClick={() => setActiveLang('javascript')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeLang === 'javascript' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              JavaScript / Fetch
            </button>
            <button
              onClick={() => setActiveLang('python')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeLang === 'python' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Python (Requests)
            </button>
          </div>
        </div>

        <div className="relative">
          <pre className="p-4 sm:p-5 rounded-2xl bg-slate-950 font-mono text-xs sm:text-sm text-indigo-200 overflow-x-auto leading-relaxed border border-slate-800/80 dir-ltr text-left">
            <code>{sampleCodes[activeLang]}</code>
          </pre>
          <button
            onClick={() => handleCopy(sampleCodes[activeLang], 999)}
            className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title="کپی کد"
          >
            {copiedIndex === 999 ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
