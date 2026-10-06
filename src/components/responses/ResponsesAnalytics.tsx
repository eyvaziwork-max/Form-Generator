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
} from 'lucide-react';
import { Form, FormResponse } from '../../types/form';
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
];

export const ResponsesAnalytics: React.FC<ResponsesAnalyticsProps> = ({ form, responses }) => {
  const { isDark } = useTheme();

  // Find fields that have categorical/choice values or ratings
  const analyzableFields = useMemo(() => {
    return form.fields.filter((f) =>
      ['select', 'radio', 'multiselect', 'star_rating', 'checkbox'].includes(f.type)
    );
  }, [form]);

  const [selectedFieldId, setSelectedFieldId] = useState<string>(() => {
    return analyzableFields[0]?.id || '';
  });

  // Keep selectedFieldId in sync if form changes
  const activeSelectedField = useMemo(() => {
    return (
      analyzableFields.find((f) => f.id === selectedFieldId) ||
      analyzableFields[0] ||
      null
    );
  }, [analyzableFields, selectedFieldId]);

  // 1. Time trend data (Group responses by day or timestamp)
  const trendData = useMemo(() => {
    if (!responses.length) return [];

    // Sort responses chronologically
    const sorted = [...responses].sort(
      (a, b) => a.submittedAtTimestamp - b.submittedAtTimestamp
    );

    const countsByDate: Record<string, number> = {};

    sorted.forEach((r) => {
      // Extract date part from submittedAt (or format timestamp)
      const datePart = r.submittedAt
        ? r.submittedAt.split('ساعت')[0].trim()
        : 'نامشخص';
      countsByDate[datePart] = (countsByDate[datePart] || 0) + 1;
    });

    const entries = Object.entries(countsByDate).map(([date, count]) => ({
      date,
      count,
    }));

    // If only 1 entry exists, add a friendly visual baseline
    if (entries.length === 1) {
      return [
        { date: 'شروع دوره', count: 0 },
        { date: entries[0].date, count: entries[0].count },
      ];
    }

    return entries;
  }, [responses]);

  // 2. Distribution Data for selected categorical field
  const distributionData = useMemo(() => {
    if (!activeSelectedField || !responses.length) return [];

    const field = activeSelectedField;
    const counts: Record<string, { label: string; count: number }> = {};

    // Initialize with known options if defined
    if (field.options && field.options.length > 0) {
      field.options.forEach((opt) => {
        counts[opt.value] = { label: opt.label, count: 0 };
      });
    }

    // Tally responses
    responses.forEach((r) => {
      const val = r.values[field.name] ?? r.values[field.id];
      if (val === undefined || val === null || val === '') return;

      if (Array.isArray(val)) {
        val.forEach((item) => {
          const itemKey = String(item);
          const optionObj = field.options?.find((o) => o.value === itemKey);
          const label = optionObj?.label || itemKey;
          if (!counts[itemKey]) counts[itemKey] = { label, count: 0 };
          counts[itemKey].count += 1;
        });
      } else {
        const itemKey = String(val);
        const optionObj = field.options?.find((o) => o.value === itemKey);
        let label = optionObj?.label || itemKey;
        if (field.type === 'star_rating') {
          label = `${itemKey} ستاره ⭐`;
        } else if (field.type === 'checkbox') {
          label = val ? 'تیک خورده (بله)' : 'تیک نخورده (خیر)';
        }
        if (!counts[itemKey]) counts[itemKey] = { label, count: 0 };
        counts[itemKey].count += 1;
      }
    });

    const totalCount = Object.values(counts).reduce((acc, curr) => acc + curr.count, 0) || 1;

    return Object.entries(counts)
      .filter(([_, data]) => data.count > 0 || (field.options && field.options.length <= 6))
      .map(([key, data]) => ({
        key,
        name: data.label,
        count: data.count,
        percentage: Math.round((data.count / totalCount) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [activeSelectedField, responses]);

  // 3. Peak Submission Period / Hourly distribution
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

  // 4. Key metrics calculation
  const topChoice = distributionData[0];
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
          داده‌ای برای تحلیل آماری وجود ندارد
        </h4>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          به محض دریافت اولین پاسخ، نمودارهای تحلیلی و روند ثبت به صورت خودکار فعال خواهند شد.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Responses */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              کل پاسخ‌ها
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {responses.length}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            ۱۰۰٪ ذخیره موفق
          </span>
        </div>

        {/* Most Popular Option */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              محبوب‌ترین انتخاب
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white truncate">
            {topChoice ? topChoice.name : 'در حال ارزیابی'}
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
            {topChoice ? `${topChoice.percentage}٪ از شرکت‌کنندگان` : '—'}
          </span>
        </div>

        {/* Peak Submission Time */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              اوج ساعات مشارکت
            </span>
            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white truncate">
            {peakSlot?.slot || 'نامشخص'}
          </div>
          <span className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">
            {peakSlot ? `${peakSlot.count} رکورد ارسالی` : '—'}
          </span>
        </div>

        {/* Form Fields Analyzed */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              تعداد فیلدهای فرم
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {form.fields.length}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            {analyzableFields.length} فیلد آماری گزینه‌ای
          </span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Submission Trend (Recharts AreaChart) */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  روند زمانی ثبت پاسخ‌ها (Submission Trend)
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  تعداد پاسخ‌های ورودی در روزهای مختلف
                </p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full mt-2" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
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
                  formatter={(val: any) => [`${val} پاسخ ثبت‌شده`, 'تعداد']}
                  labelFormatter={(lbl) => `تاریخ: ${lbl}`}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSubmissions)"
                  dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Categorical Distribution (Recharts PieChart or BarChart) */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  توزیع گزینه‌ها (Response Distribution)
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  درصد و فراوانی پاسخ‌ها به تفکیک فیلد
                </p>
              </div>
            </div>

            {/* Field selector for distribution */}
            {analyzableFields.length > 1 && (
              <select
                value={activeSelectedField?.id}
                onChange={(e) => setSelectedFieldId(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-hidden cursor-pointer max-w-[200px] truncate"
              >
                {analyzableFields.map((f) => (
                  <option key={f.id} value={f.id} className="dark:bg-slate-800 dark:text-slate-200">
                    {f.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {distributionData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
              <PieChartIcon className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">
                برای این فیلد هنوز پاسخی انتخاب نشده است یا فیلد انتخابی فاقد گزینه است.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
              {/* Donut Chart */}
              <div className="h-56 w-full sm:w-1/2" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {distributionData.map((_, index) => (
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

              {/* Legends with percentages */}
              <div className="w-full sm:w-1/2 space-y-2 max-h-56 overflow-y-auto pr-1">
                {distributionData.map((item, index) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: PALETTE_COLORS[index % PALETTE_COLORS.length],
                        }}
                      />
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
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
          )}
        </div>
      </div>

      {/* Chart 3: Time Slot / Peak Activity (Recharts BarChart) */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                توزیع بر اساس ساعات ارسال (Submission Time Slots)
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                پایش زمان‌های بیشترین تمایل کاربران به تکمیل فرم
              </p>
            </div>
          </div>
        </div>

        <div className="h-56 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                formatter={(val: any) => [`${val} پاسخ`, 'تعداد']}
                labelFormatter={(lbl) => `بازه: ${lbl}`}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {hourlyData.map((_, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={PALETTE_COLORS[index % PALETTE_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
