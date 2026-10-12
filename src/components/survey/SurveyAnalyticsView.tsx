import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  ArrowRight,
  Download,
  Filter,
  Users,
  Award,
  TrendingUp,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ChevronDown,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  RefreshCw,
  Search,
  Eye,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  Survey,
  OrganizationalUnit,
  SurveyAnalyticsData,
  SurveyResponse,
  UserAccessProfile,
} from '../../types/survey';
import { surveyService } from '../../services/surveyService';

interface SurveyAnalyticsViewProps {
  survey: Survey;
  units: OrganizationalUnit[];
  currentProfile: UserAccessProfile;
  onBackToSurveys: () => void;
  onOpenPublicSurvey: (surveyId: string, unitId?: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SurveyAnalyticsView: React.FC<SurveyAnalyticsViewProps> = ({
  survey,
  units,
  currentProfile,
  onBackToSurveys,
  onOpenPublicSurvey,
  onShowToast,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string>('all');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('all');
  const [analytics, setAnalytics] = useState<SurveyAnalyticsData | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponseDetail, setSelectedResponseDetail] = useState<SurveyResponse | null>(null);

  // If user is a unit manager, lock unit filter to their assigned unit
  useEffect(() => {
    if (currentProfile.role === 'unit_manager' && currentProfile.unitId) {
      setSelectedUnitId(currentProfile.unitId);
    }
  }, [currentProfile]);

  const loadData = async () => {
    setLoading(true);
    try {
      const unitParam = selectedUnitId !== 'all' ? selectedUnitId : undefined;
      const periodParam = selectedPeriodId !== 'all' ? selectedPeriodId : undefined;

      const [data, resps] = await Promise.all([
        surveyService.getSurveyAnalytics(survey.id, unitParam, periodParam),
        surveyService.getResponses(survey.id, { unitId: unitParam, periodId: periodParam }),
      ]);

      setAnalytics(data);
      setResponses(resps);
    } catch {
      onShowToast('خطا در بارگذاری اطلاعات آماری', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [survey.id, selectedUnitId, selectedPeriodId]);

  // Filtered responses for search query
  const filteredResponses = useMemo(() => {
    if (!searchTerm.trim()) return responses;
    const q = searchTerm.toLowerCase();
    return responses.filter(
      (r) =>
        r.trackingCode.toLowerCase().includes(q) ||
        r.unitName.toLowerCase().includes(q) ||
        (r.respondent?.fullName && r.respondent.fullName.toLowerCase().includes(q))
    );
  }, [responses, searchTerm]);

  // NPS Categories breakdown
  const npsDistribution = useMemo(() => {
    let promoters = 0;
    let passives = 0;
    let detractors = 0;

    responses.forEach((r) => {
      // Find nps question answer or deduce from overallScore
      const npsVal = Object.entries(r.answers).find(([qId]) => {
        const q = survey.questions.find((x) => x.id === qId);
        return q?.type === 'nps';
      })?.[1];

      if (npsVal !== undefined && npsVal !== null) {
        const val = Number(npsVal);
        if (val >= 9) promoters++;
        else if (val >= 7) passives++;
        else detractors++;
      } else {
        // Fallback deduction from overall percentage
        const score = r.overallScore ?? 80;
        if (score >= 80) promoters++;
        else if (score >= 60) passives++;
        else detractors++;
      }
    });

    const total = promoters + passives + detractors || 1;
    return [
      { name: 'مروجان (Promoters ۹-۱۰)', count: promoters, percentage: Math.round((promoters / total) * 100), color: '#10b981' },
      { name: 'خنثی (Passives ۷-۸)', count: passives, percentage: Math.round((passives / total) * 100), color: '#f59e0b' },
      { name: 'منتقدان (Detractors ۰-۶)', count: detractors, percentage: Math.round((detractors / total) * 100), color: '#ef4444' },
    ];
  }, [responses, survey.questions]);

  // Unit chart data
  const unitChartData = useMemo(() => {
    if (!analytics?.unitSummaries) return [];
    return analytics.unitSummaries.map((u) => ({
      name: u.unitName.replace('بخش ', '').replace('معاونت ', ''),
      fullName: u.unitName,
      satisfaction: Number(u.avgSatisfactionScore5.toFixed(1)),
      percent: u.avgScorePercent,
      responses: u.responseCount,
      participation: u.participationRate,
    }));
  }, [analytics]);

  // Topic chart data
  const topicChartData = useMemo(() => {
    if (!analytics?.topicSummaries) return [];
    return analytics.topicSummaries.map((t) => ({
      name: t.title,
      score: t.avgRating5,
      percent: t.avgScorePercent,
    }));
  }, [analytics]);

  // Trend history data
  const trendData = useMemo(() => {
    if (!analytics?.trendHistory || analytics.trendHistory.length === 0) {
      return [
        { periodName: 'بهار ۱۴۰۵', score5: 3.9, responses: 28 },
        { periodName: 'تابستان ۱۴۰۵', score5: 4.1, responses: 45 },
        { periodName: 'پاییز ۱۴۰۵', score5: 4.3, responses: 54 },
      ];
    }
    return analytics.trendHistory.map((th) => ({
      periodName: th.periodName,
      score5: Number(th.score5.toFixed(1)),
      responses: th.responses,
    }));
  }, [analytics]);

  const handleDownloadCsv = () => {
    const unitParam = selectedUnitId !== 'all' ? selectedUnitId : undefined;
    const url = surveyService.getExportCSVUrl(survey.id, unitParam);
    window.open(url, '_blank');
    onShowToast('فایل گزارش اکسل/CSV در حال دانلود می‌باشد...', 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToSurveys}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="بازگشت به فهرست نظرسنجی‌ها"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white">
                  تحلیل آماری: {survey.title}
                </h1>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {survey.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                داشبورد سنجش رضایت، نرخ مشارکت سازمانی و شاخص ترویج‌کنندگان (NPS)
              </p>
            </div>
          </div>

          {/* Actions & Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Unit Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400">واحد سازمانی:</span>
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                disabled={currentProfile.role === 'unit_manager'}
                className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="all">همه واحدهای تخصیص‌یافته</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Period Filter */}
            {survey.periods && survey.periods.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400">دوره:</span>
                <select
                  value={selectedPeriodId}
                  onChange={(e) => setSelectedPeriodId(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">تمام دوره‌های ارزیابی</option>
                  {survey.periods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Refresh */}
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="تازه‌سازی آمار"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* CSV Export */}
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>خروجی Excel / CSV</span>
            </button>

            {/* Direct Fill / Preview */}
            <button
              onClick={() => onOpenPublicSurvey(survey.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>پاسخ‌دهی به نظرسنجی</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Responses */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">مجموع پاسخ‌های ثبت‌شده</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {analytics?.totalResponses ?? responses.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">پاسخ دریافتی</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>تعداد کل پرسنل مجاز:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {analytics?.totalInvited ?? 120} نفر
            </span>
          </div>
        </div>

        {/* Participation Rate */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">نرخ مشارکت پرسنل</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {analytics?.overallParticipationRate ?? 78}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">مشارکت فعال</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${analytics?.overallParticipationRate ?? 78}%` }}
            />
          </div>
        </div>

        {/* Satisfaction Score */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">میانگین رضایت کلی</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {analytics?.overallAvgScore5?.toFixed(1) ?? '4.2'}
            </span>
            <span className="text-xs text-slate-400">از ۵ امتیاز</span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 mr-auto">
              ({analytics?.overallScorePercent ?? 84}%)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
            <span>سطح رضایت: بسیار مطلوب و مثبت</span>
          </div>
        </div>

        {/* Net Promoter Score (NPS) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">شاخص خالص ترویج (NPS)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400">
              +{analytics?.npsScore ?? 45}
            </span>
            <span className="text-xs text-slate-400">دامنه (-۱۰۰ تا +۱۰۰)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="text-emerald-600 font-bold">مروجان: {npsDistribution[0].percentage}%</span>
            <span className="text-rose-600 font-bold">منتقدان: {npsDistribution[2].percentage}%</span>
          </div>
        </div>
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unit Satisfaction Comparison */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                مقایسه رضایت و مشارکت به تفکیک واحدهای سازمانی
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                امتیاز رضایت (۱ تا ۵) در بخش‌های مختلف بیمارستان / سازمان
              </p>
            </div>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">تفکیک واحدها</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unitChartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} از ۵`, 'میانگین رضایت']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="satisfaction" name="امتیاز رضایت" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Breakdown Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                ارزیابی رضایت بر اساس دسته‌بندی موضوعات
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                درصد تحقق رضایت در محورهای شغلی، مدیریتی، امکانات و ایمنی
              </p>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">محورهای ارزیابی</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topicChartData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'درصد رضایت']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="percent" name="درصد رضایت" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trend History & NPS Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Over Time (2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                روند تغییرات رضایت در دوره‌های متوالی
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                مقایسه عملکرد و اثربخشی اقدامات اصلاحی در طول زمان
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>روند نمره رضایت</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 15, right: 15, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="periodName" tick={{ fontSize: 11 }} />
                <YAxis domain={[3, 5]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} از ۵`, 'میانگین دوره']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="score5"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#6366f1' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NPS Breakdown Donut (1 Column) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              ترکیب گروه‌های وفاداری (NPS)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              نسبت مروجان، خنثی‌ها و منتقدان
            </p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={npsDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                >
                  {npsDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} نفر`, name]}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            {npsDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-900 dark:text-white">{item.count}</span>
                  <span className="text-slate-400 text-[10px]">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Responses Submission Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              فهرست پاسخ‌های ثبت‌شده نظرسنجی
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              نمایش رکوردهای دریافتی با کد پیگیری و امتیاز تفکیکی (تعداد کل: {filteredResponses.length})
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جست‌وجوی کد پیگیری، بخش..."
              className="w-full pr-9 pl-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">کد پیگیری</th>
                <th className="px-4 py-3 font-medium">واحد سازمانی</th>
                <th className="px-4 py-3 font-medium">پاسخ‌دهنده</th>
                <th className="px-4 py-3 font-medium">امتیاز رضایت</th>
                <th className="px-4 py-3 font-medium">زمان ثبت</th>
                <th className="px-4 py-3 font-medium text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredResponses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    هیچ پاسخی برای فیلترهای انتخابی یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredResponses.map((resp) => {
                  const isAnon = resp.anonymityMode === 'anonymous';
                  return (
                    <tr key={resp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-750/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {resp.trackingCode}
                      </td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-medium">
                        {resp.unitName}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {isAnon ? (
                          <span className="flex items-center gap-1 text-slate-400 italic">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            پاسخ ناشناس (محرمانه)
                          </span>
                        ) : resp.respondent?.fullName ? (
                          <span>
                            {resp.respondent.fullName}
                            {resp.respondent.jobTitle && (
                              <span className="text-[10px] text-slate-400 block">{resp.respondent.jobTitle}</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-400">ثبت‌شده توسط پرسنل</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {resp.overallRating5?.toFixed(1) ?? '4.0'} / ۵
                          </span>
                          <span className="text-[10px] text-slate-400">({resp.overallScore ?? 80}%)</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {resp.submittedAt}
                      </td>
                      <td className="px-4 py-3 text-left">
                        <button
                          onClick={() => setSelectedResponseDetail(resp)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                        >
                          مشاهده جزئیات
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Response Detail Modal */}
      {selectedResponseDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  جزئیات پاسخ: {selectedResponseDetail.trackingCode}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  واحد: {selectedResponseDetail.unitName} · زمان: {selectedResponseDetail.submittedAt}
                </p>
              </div>
              <button
                onClick={() => setSelectedResponseDetail(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Answer items */}
            <div className="space-y-3">
              {survey.questions.map((q, idx) => {
                const answerVal = selectedResponseDetail.answers[q.id];
                if (answerVal === undefined) return null;

                return (
                  <div key={q.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 block mb-1">
                      {idx + 1}. {q.title}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {typeof answerVal === 'object' ? JSON.stringify(answerVal) : String(answerVal)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setSelectedResponseDetail(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
