import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Users,
  Clock,
  Award,
  CheckCircle2,
  Percent,
  Star,
  Activity,
  ListOrdered,
  ChevronDown,
  BarChart2,
} from 'lucide-react';
import { Form, FormField, FormResponse } from '../../types/form';
import { useTheme } from '../../context/ThemeContext';

interface ResponsesAnalyticsProps {
  form: Form;
  responses: FormResponse[];
}

const PALETTE_COLORS = [
  '#4f46e5', // indigo
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#3b82f6', // blue
  '#f97316', // orange
  '#14b8a6', // teal
  '#6366f1', // indigo accent
];

export const ResponsesAnalytics: React.FC<ResponsesAnalyticsProps> = ({ form, responses }) => {
  const { isDark } = useTheme();

  // 1. All analyzable fields (excluding decorative ones)
  const allFields = useMemo(() => {
    return form.fields.filter(
      (f) => f.type !== 'static_text' && f.type !== 'divider' && f.type !== 'hidden'
    );
  }, [form]);

  // Priority to choice or rating fields, fallback to first field
  const [selectedFieldId, setSelectedFieldId] = useState<string>(() => {
    const choiceField = allFields.find((f) =>
      ['select', 'radio', 'multiselect', 'star_rating', 'checkbox'].includes(f.type)
    );
    return choiceField ? choiceField.id : allFields[0]?.id || '';
  });

  const [trendViewType, setTrendViewType] = useState<'daily' | 'cumulative'>('daily');
  const [distributionChartType, setDistributionChartType] = useState<'donut' | 'bar'>('donut');

  // Active selected field
  const activeSelectedField = useMemo(() => {
    return allFields.find((f) => f.id === selectedFieldId) || allFields[0] || null;
  }, [allFields, selectedFieldId]);

  // 2. Trend Data (Chronological daily & cumulative)
  const trendData = useMemo(() => {
    if (!responses.length) return [];

    const sorted = [...responses].sort(
      (a, b) => a.submittedAtTimestamp - b.submittedAtTimestamp
    );

    const countsByDate: Record<string, number> = {};

    sorted.forEach((r) => {
      let datePart = 'نامشخص';
      if (r.submittedAt) {
        datePart = r.submittedAt.split('ساعت')[0].trim();
      } else {
        datePart = new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(
          new Date(r.submittedAtTimestamp)
        );
      }
      countsByDate[datePart] = (countsByDate[datePart] || 0) + 1;
    });

    let runningTotal = 0;
    const entries = Object.entries(countsByDate).map(([date, count]) => {
      runningTotal += count;
      return {
        date,
        count,
        cumulative: runningTotal,
      };
    });

    if (entries.length === 1) {
      return [
        { date: 'آغاز دوره', count: 0, cumulative: 0 },
        entries[0],
      ];
    }

    return entries;
  }, [responses]);

  // 3. Peak Day and Stats
  const peakDayInfo = useMemo(() => {
    if (!trendData.length) return null;
    const validEntries = trendData.filter((e) => e.date !== 'آغاز دوره');
    if (!validEntries.length) return null;
    return [...validEntries].sort((a, b) => b.count - a.count)[0];
  }, [trendData]);

  // 4. Common Answers & Distribution for activeSelectedField
  const distributionResult = useMemo(() => {
    if (!activeSelectedField || !responses.length) {
      return { items: [], totalAnalyzed: 0, averageRating: null, isRating: false, isText: false };
    }

    const field = activeSelectedField;
    const isRating = field.type === 'star_rating';
    const isChoice = ['select', 'radio', 'multiselect', 'checkbox'].includes(field.type);
    const isText = !isRating && !isChoice;

    const counts: Record<string, { label: string; count: number }> = {};
    let ratingSum = 0;
    let ratingCount = 0;

    // Pre-populate predefined options for choice fields
    if (field.options && field.options.length > 0) {
      field.options.forEach((opt) => {
        counts[opt.value] = { label: opt.label, count: 0 };
      });
    }

    responses.forEach((r) => {
      const val = r.values[field.name] ?? r.values[field.id];
      if (val === undefined || val === null || val === '') return;

      if (Array.isArray(val)) {
        val.forEach((item) => {
          const itemKey = String(item).trim();
          const optionObj = field.options?.find((o) => o.value === itemKey);
          const label = optionObj?.label || itemKey;
          if (!counts[itemKey]) counts[itemKey] = { label, count: 0 };
          counts[itemKey].count += 1;
        });
      } else {
        const itemKey = String(val).trim();
        let label = itemKey;

        if (isRating) {
          const num = Number(val);
          if (!isNaN(num)) {
            ratingSum += num;
            ratingCount += 1;
          }
          label = `${itemKey} ستاره ⭐`;
        } else if (field.type === 'checkbox') {
          label = val ? 'تأیید شده (بله)' : 'تأیید نشده (خیر)';
        } else if (field.options) {
          const optionObj = field.options.find((o) => o.value === itemKey);
          if (optionObj) label = optionObj.label;
        } else if (field.type === 'student_id' && itemKey.length >= 3) {
          // Provide entrance year insight for student IDs (e.g. 401, 402, 400)
          const yearPrefix = itemKey.substring(0, 3);
          label = `${itemKey} (ورودی ۱۴${yearPrefix.slice(-2)})`;
        } else if (field.type === 'phone' && itemKey.length >= 4) {
          // Phone carrier prefix
          const prefix = itemKey.substring(0, 4);
          let carrier = '';
          if (['0910', '0911', '0912', '0913', '0914', '0915', '0916', '0917', '0918', '0919'].includes(prefix)) {
            carrier = 'همراه اول';
          } else if (['0930', '0933', '0935', '0936', '0937', '0938', '0939', '0901', '0902', '0903', '0905'].includes(prefix)) {
            carrier = 'ایرانسل';
          } else if (['0920', '0921', '0922'].includes(prefix)) {
            carrier = 'رایتل';
          }
          label = carrier ? `${itemKey} (${carrier})` : itemKey;
        }

        if (!counts[itemKey]) counts[itemKey] = { label, count: 0 };
        counts[itemKey].count += 1;
      }
    });

    const totalAnalyzed = Object.values(counts).reduce((acc, curr) => acc + curr.count, 0) || 1;
    const averageRating = ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : null;

    // Filter and sort items by frequency
    const items = Object.entries(counts)
      .filter(([_, data]) => data.count > 0 || (field.options && field.options.length <= 6))
      .map(([key, data]) => ({
        key,
        name: data.label,
        count: data.count,
        percentage: Math.round((data.count / totalAnalyzed) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    return {
      items,
      totalAnalyzed,
      averageRating,
      isRating,
      isText,
    };
  }, [activeSelectedField, responses]);

  // 5. Field Completion Rates Across Form (Recharts Horizontal BarChart)
  const completionRatesData = useMemo(() => {
    if (!responses.length || !allFields.length) return [];

    return allFields.map((field) => {
      const filledCount = responses.filter((r) => {
        const val = r.values[field.name] ?? r.values[field.id];
        if (val === undefined || val === null || val === '') return false;
        if (Array.isArray(val) && val.length === 0) return false;
        return true;
      }).length;

      const rate = Math.round((filledCount / responses.length) * 100);

      return {
        fieldId: field.id,
        name: field.label.length > 22 ? `${field.label.slice(0, 20)}...` : field.label,
        fullName: field.label,
        rate,
        filledCount,
        required: field.required,
      };
    });
  }, [allFields, responses]);

  // 6. Overall average completion percentage
  const overallCompletionRate = useMemo(() => {
    if (!completionRatesData.length) return 100;
    const sum = completionRatesData.reduce((acc, item) => acc + item.rate, 0);
    return Math.round(sum / completionRatesData.length);
  }, [completionRatesData]);

  // 7. Hourly Activity Data (Recharts BarChart)
  const hourlyData = useMemo(() => {
    if (!responses.length) return [];

    const hourSlots: Record<string, number> = {
      'صبح (۰۶-۱۲)': 0,
      'ظهر (۱۲-۱۶)': 0,
      'عصر (۱۶-۲۰)': 0,
      'شب (۲۰-۲۴)': 0,
      'بامداد (۰۰-۰۶)': 0,
    };

    responses.forEach((r) => {
      const d = new Date(r.submittedAtTimestamp);
      const h = d.getHours();
      if (h >= 6 && h < 12) hourSlots['صبح (۰۶-۱۲)'] += 1;
      else if (h >= 12 && h < 16) hourSlots['ظهر (۱۲-۱۶)'] += 1;
      else if (h >= 16 && h < 20) hourSlots['عصر (۱۶-۲۰)'] += 1;
      else if (h >= 20 && h < 24) hourSlots['شب (۲۰-۲۴)'] += 1;
      else hourSlots['بامداد (۰۰-۰۶)'] += 1;
    });

    return Object.entries(hourSlots).map(([slot, count]) => ({
      slot,
      count,
    }));
  }, [responses]);

  const topCommonAnswer = distributionResult.items[0];
  const peakSlot = [...hourlyData].sort((a, b) => b.count - a.count)[0];

  // Tooltip custom styling
  const tooltipContentStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderColor: isDark ? '#334155' : '#e2e8f0',
    borderRadius: '12px',
    color: isDark ? '#f8fafc' : '#0f172a',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
    fontFamily: 'Vazirmatn, system-ui',
    fontSize: '12px',
    padding: '8px 12px',
    direction: 'rtl' as const,
    textAlign: 'right' as const,
  };

  if (!responses.length) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-800/80">
          <BarChart3 className="w-7 h-7" />
        </div>
        <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
          هنوز پاسخی برای این فرم ثبت نشده است
        </h4>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
          به محض دریافت نخستین پاسخ از کاربران، کلیه نمودارهای تعاملی Recharts شامل روند زمانی ثبت، توزیع پاسخ‌های متداول، و نرخ تکمیل فیلدها به‌صورت زنده ترسیم می‌گردند.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Responses */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              کل پاسخ‌های دریافتی
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {responses.length}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ثبت معتبر در دیتابیس</span>
          </div>
        </div>

        {/* Form Completion Health Rate */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              نرخ میانگین تکمیل فیلدها
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {overallCompletionRate}٪
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span>در {allFields.length} فیلد طراحی‌شده</span>
          </div>
        </div>

        {/* Top Common Answer */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              پاسخ پرتکرار ({activeSelectedField?.label || 'فیلد'})
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-base font-bold text-slate-900 dark:text-white truncate">
            {topCommonAnswer ? topCommonAnswer.name : 'در حال ارزیابی'}
          </div>
          <div className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-bold">
            {topCommonAnswer ? `${topCommonAnswer.count} بار (${topCommonAnswer.percentage}٪)` : '—'}
          </div>
        </div>

        {/* Peak Submission Time Slot */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              پرترافیک‌ترین بازه زمانی
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-base font-bold text-slate-900 dark:text-white truncate">
            {peakSlot?.slot || 'نامشخص'}
          </div>
          <div className="mt-1 text-[11px] text-violet-600 dark:text-violet-400 font-medium">
            {peakSlot ? `${peakSlot.count} رکورد ثبت‌شده` : '—'}
          </div>
        </div>
      </div>

      {/* Primary Charts Row: Trend Chart & Common Answers Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Submission Trend Over Time (Recharts AreaChart / LineChart) */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    روند زمانی ثبت پاسخ‌ها (Submission Trends)
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    نمودار زمانی ارسال فرم در طول روزها و تاریخ‌ها
                  </p>
                </div>
              </div>

              {/* Daily vs Cumulative Toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setTrendViewType('daily')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    trendViewType === 'daily'
                      ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  روزانه
                </button>
                <button
                  onClick={() => setTrendViewType('cumulative')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    trendViewType === 'cumulative'
                      ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  تجمعی
                </button>
              </div>
            </div>

            {/* Quick Stat Pill */}
            {peakDayInfo && (
              <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60">
                  اوج ثبت: <strong>{peakDayInfo.count} پاسخ</strong> در تاریخ {peakDayInfo.date}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  میانگین: {Math.round((responses.length / (trendData.length || 1)) * 10) / 10} پاسخ در هر روز
                </span>
              </div>
            )}
          </div>

          {/* Recharts Area Chart */}
          <div className="h-64 sm:h-72 w-full mt-2" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="submissionAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="cumulativeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#334155' : '#f1f5f9'}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(val: any) => [
                    `${val} پاسخ`,
                    trendViewType === 'daily' ? 'ثبت روزانه' : 'مجموع تجمعی',
                  ]}
                  labelFormatter={(lbl) => `تاریخ: ${lbl}`}
                />
                {trendViewType === 'daily' ? (
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#submissionAreaGradient)"
                    dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                ) : (
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#cumulativeAreaGradient)"
                    dot={{ r: 4, fill: '#06b6d4', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Common Answers & Breakdown (Recharts Donut / BarChart) */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <PieChartIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    پاسخ‌های متداول و توزیع مقادیر (Common Answers)
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    تفکیک فراوانی، درصدها و انتخاب‌های شاخص کاربران
                  </p>
                </div>
              </div>

              {/* Toggle Chart Type */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setDistributionChartType('donut')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      distributionChartType === 'donut'
                        ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="نمودار دونات دایره‌ای"
                  >
                    دایره‌ای
                  </button>
                  <button
                    onClick={() => setDistributionChartType('bar')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      distributionChartType === 'bar'
                        ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="نمودار میله‌ای ستونی"
                  >
                    میله‌ای
                  </button>
                </div>
              </div>
            </div>

            {/* Field Selector Dropdown across ALL fields */}
            <div className="flex items-center gap-2 mb-4 bg-slate-50 dark:bg-slate-800/70 p-2 rounded-2xl border border-slate-200/70 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                تحلیل فیلد:
              </span>
              <select
                value={activeSelectedField?.id}
                onChange={(e) => setSelectedFieldId(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer truncate"
              >
                {allFields.map((f) => (
                  <option key={f.id} value={f.id} className="dark:bg-slate-800 dark:text-slate-200">
                    {f.label} ({f.type === 'select' || f.type === 'radio' ? 'گزینه‌ای' : f.type === 'star_rating' ? 'امتیاز' : 'متنی'})
                  </option>
                ))}
              </select>
            </div>

            {/* Special Star Rating Banner */}
            {distributionResult.isRating && distributionResult.averageRating && (
              <div className="mb-3 flex items-center justify-between p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs">
                <span className="text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  میانگین امتیاز کل ثبت‌شده:
                </span>
                <span className="font-mono text-base font-extrabold text-amber-700 dark:text-amber-300">
                  {distributionResult.averageRating} از ۵ ستاره
                </span>
              </div>
            )}
          </div>

          {/* Recharts Donut / Bar Rendering */}
          {distributionResult.items.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
              <PieChartIcon className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-xs">
                برای این فیلد مقداری در پاسخ‌ها یافت نشد.
              </p>
            </div>
          ) : distributionChartType === 'donut' ? (
            <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 mt-1">
              {/* Donut Chart with Recharts */}
              <div className="h-56 w-full sm:w-1/2" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionResult.items}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={76}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {distributionResult.items.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PALETTE_COLORS[index % PALETTE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipContentStyle}
                      formatter={(val: any, name: any) => [`${val} نفر`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends with percentages & counts */}
              <div className="w-full sm:w-1/2 space-y-2 max-h-56 overflow-y-auto pr-1">
                {distributionResult.items.map((item, index) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: PALETTE_COLORS[index % PALETTE_COLORS.length],
                        }}
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {item.count}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                        ({item.percentage}٪)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Bar Chart view for Options/Answers */
            <div className="h-56 sm:h-60 w-full mt-2" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionResult.items} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#334155' : '#f1f5f9'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                  />
                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    formatter={(val: any) => [`${val} نفر`, 'تعداد']}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {distributionResult.items.map((_, index) => (
                      <Cell
                        key={`bar-dist-${index}`}
                        fill={PALETTE_COLORS[index % PALETTE_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Charts Row: Field Completion Rates & Time Slots Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 3: Field Completion Health (Recharts Horizontal BarChart) */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  درصد تکمیل فیلدهای فرم (Completion Rate per Field)
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  ارزیابی میزان پاسخ‌گویی کاربران به هر یک از سوالات و فیلدها
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3 px-1">
              <span>فیلدهای دارای ستاره اجباری (*)</span>
              <span>میانگین کل فرم: <strong>{overallCompletionRate}٪</strong></span>
            </div>
          </div>

          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={completionRatesData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#334155' : '#f1f5f9'}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                  unit="٪"
                  axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                  tickLine={false}
                  width={90}
                  axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(val: any, _name: any, item: any) => [
                    `${val}٪ (${item?.payload?.filledCount} از ${responses.length} پاسخ)`,
                    'نرخ تکمیل',
                  ]}
                  labelFormatter={(_lbl, items) => {
                    const payload = items?.[0]?.payload;
                    return payload ? payload.fullName : '';
                  }}
                />
                <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
                  {completionRatesData.map((entry, index) => (
                    <Cell
                      key={`cell-rate-${index}`}
                      fill={
                        entry.rate >= 90
                          ? '#10b981'
                          : entry.rate >= 50
                          ? '#4f46e5'
                          : '#f59e0b'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Time Slot / Peak Activity (Recharts BarChart) */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  توزیع زمانی مشارکت کاربران (Submission Time Slots)
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  شناسایی ساعات اوج فعالیت کاربران در طول شبانه‌روز
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 px-1">
              بیشترین تعداد ارسال در بازه: <strong className="text-violet-600 dark:text-violet-400">{peakSlot?.slot}</strong>
            </p>
          </div>

          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#334155' : '#f1f5f9'}
                  vertical={false}
                />
                <XAxis
                  dataKey="slot"
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(val: any) => [`${val} پاسخ`, 'تعداد رکورد']}
                  labelFormatter={(lbl) => `بازه زمانی: ${lbl}`}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {hourlyData.map((_, index) => (
                    <Cell
                      key={`bar-hourly-${index}`}
                      fill={PALETTE_COLORS[(index + 3) % PALETTE_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
