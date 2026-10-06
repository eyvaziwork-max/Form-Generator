import React from 'react';
import {
  FileText,
  CheckCircle2,
  Inbox,
  Calendar,
  TrendingUp,
  Plus,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Clock,
  Activity,
  Layers,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import { Form, DashboardStats, AuditLog } from '../../types/form';

interface DashboardViewProps {
  stats: DashboardStats;
  forms: Form[];
  logs: AuditLog[];
  onOpenCreateForm: () => void;
  onSelectFormForBuilder: (formId: string) => void;
  onSelectFormForResponses: (formId: string) => void;
  onOpenPublicForm: (formId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  forms,
  logs,
  onOpenCreateForm,
  onSelectFormForBuilder,
  onSelectFormForResponses,
  onOpenPublicForm,
}) => {
  // Max count for chart scale
  const maxChartCount = Math.max(...stats.recentResponsesChart.map((c) => c.count), 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              سامانه هوشمند مدیریت فرم و نظرسنجی
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              پیشخوان مدیریت فرم‌ساز
            </h1>
            <p className="text-indigo-200/90 text-sm sm:text-base mt-2 leading-relaxed">
              فرم‌های خود را با کشیدن و رها کردن فیلدها بسازید، اعتبارسنجی را مشخص کنید و پاسخ‌های کاربران و دانشجویان را به‌صورت لحظه‌ای دریافت و تحلیل نمایید.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreateForm}
              className="flex items-center gap-2 bg-white text-indigo-900 hover:bg-indigo-50 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all text-sm"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              ساخت فرم جدید
            </button>
            {forms[0] && (
              <button
                onClick={() => onOpenPublicForm(forms[0].id)}
                className="flex items-center gap-2 bg-indigo-700/60 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl border border-indigo-500/30 transition-all text-sm backdrop-blur-md"
              >
                <ExternalLink className="w-4 h-4" />
                مشاهده فرم دانشجویان
              </button>
            )}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Forms */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">کل فرم‌ها</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{stats.totalForms}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">فرم فعال و پیش‌نویس</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{stats.activeForms} فرم در وضعیت فعال</span>
          </div>
        </div>

        {/* Total Responses */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">کل پاسخ‌های دریافتی</span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{stats.totalResponses}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">رکورد ثبت‌شده</span>
          </div>
          <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>اطلاعات کامل در دیتابیس</span>
          </div>
        </div>

        {/* Today's Responses */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">پاسخ‌های امروز</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">{stats.todayResponses}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">ثبت در ۲۴ ساعت گذشته</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            در این هفته: {stats.thisWeekResponses} پاسخ
          </div>
        </div>

        {/* Average Fields */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">میانگین فیلدها</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{stats.averageFieldsPerForm}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">فیلد در هر فرم</span>
          </div>
          <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 font-medium">
            پشتیبانی از بیش از ۲۰ نوع فیلد
          </div>
        </div>
      </div>

      {/* Main Content Area: Chart & Recent Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Responses Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">نمودار ثبت پاسخ‌ها در روزهای اخیر</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">توزیع زمانی مشارکت کاربران در فرم‌ها</p>
              </div>
            </div>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full font-medium">
              ۷ روز گذشته
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="flex-1 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800 min-h-[180px]">
            {stats.recentResponsesChart.map((item, index) => {
              const heightPercent = Math.max((item.count / maxChartCount) * 100, 10);
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.count}
                  </span>
                  <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden h-32 flex items-end p-0.5">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 dark:from-indigo-500 dark:to-indigo-300 rounded-t-md group-hover:from-indigo-700 group-hover:to-indigo-500 transition-all duration-300"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-full">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <span>تاریخ ثبت (شمسی)</span>
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              تعداد رکوردهای ورودی
            </span>
          </div>
        </div>

        {/* Security & Audit Logs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">گزارش امنیت و لاگ‌ها</h3>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">رویدادهای اخیر</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[260px] pr-1">
            {logs.slice(0, 6).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{log.action}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{log.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forms Table Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">لیست فرم‌های فعال سیستم</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">برای مشاهده فیلدها یا پاسخ‌ها روی هر ردیف کلیک کنید</p>
          </div>
          <button
            onClick={onOpenCreateForm}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            افزودن فرم جدید
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-6 font-semibold">عنوان فرم</th>
                <th className="py-3 px-6 font-semibold text-center">تعداد فیلدها</th>
                <th className="py-3 px-6 font-semibold text-center">تعداد پاسخ‌ها</th>
                <th className="py-3 px-6 font-semibold text-center">وضعیت</th>
                <th className="py-3 px-6 font-semibold">عملیات سریع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {forms.map((form) => (
                <tr key={form.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900 dark:text-white">{form.title}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-sm mt-0.5">
                      {form.description || 'بدون توضیحات'}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {form.fields.length} فیلد
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300">
                      {form.responseCount} پاسخ
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        form.status === 'active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          form.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {form.status === 'active' ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectFormForBuilder(form.id)}
                        className="px-3 py-1.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition-colors"
                      >
                        ویرایش فیلدها
                      </button>
                      <button
                        onClick={() => onSelectFormForResponses(form.id)}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        مشاهده پاسخ‌ها
                      </button>
                      <button
                        onClick={() => onOpenPublicForm(form.id)}
                        title="مشاهده فرم عمومی"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
