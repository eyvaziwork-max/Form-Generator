import React, { useState } from 'react';
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  BarChart3,
  Edit3,
  Copy,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  Users,
  Layers,
  Calendar,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Award,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { Survey, OrganizationalUnit, UserAccessProfile } from '../../types/survey';

interface SurveyListViewProps {
  surveys: Survey[];
  units: OrganizationalUnit[];
  currentProfile: UserAccessProfile;
  onSelectSurveyForBuilder: (surveyId: string) => void;
  onSelectSurveyForAnalytics: (surveyId: string) => void;
  onOpenPublicSurvey: (surveyId: string, unitId?: string) => void;
  onOpenCreateModal: () => void;
  onOpenShareModal?: (survey: Survey) => void;
  onCloneSurvey: (surveyId: string) => void;
  onToggleStatus: (surveyId: string, currentStatus: Survey['status']) => void;
  onDeleteSurvey: (surveyId: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SurveyListView: React.FC<SurveyListViewProps> = ({
  surveys,
  units,
  currentProfile,
  onSelectSurveyForBuilder,
  onSelectSurveyForAnalytics,
  onOpenPublicSurvey,
  onOpenCreateModal,
  onOpenShareModal,
  onCloneSurvey,
  onToggleStatus,
  onDeleteSurvey,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  const filteredSurveys = surveys.filter((s) => {
    if (selectedStatusFilter !== 'all' && s.status !== selectedStatusFilter) return false;

    // Filter by unit if specified
    if (selectedUnitFilter !== 'all') {
      const matchUnit = s.assignedUnitIds.includes(selectedUnitFilter) || s.assignedUnitIds.includes('unit-hosp-01');
      if (!matchUnit) return false;
    }

    // Role-based filtering for Unit Managers:
    if (currentProfile.role === 'unit_manager' && currentProfile.unitId) {
      const hasUnitAccess = s.assignedUnitIds.includes(currentProfile.unitId) || s.assignedUnitIds.includes('unit-hosp-01');
      if (!hasUnitAccess) return false;
    }

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
  });

  const getStatusBadge = (status: Survey['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            فعال و در حال اجرا
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            متوقف موقت
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            پیش‌نویس
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            بایگانی شده
          </span>
        );
    }
  };

  const getAllocationLabel = (mode: Survey['allocationMode']) => {
    switch (mode) {
      case 'shared_segmented':
        return 'مشترک (تفکیک به واحدها)';
      case 'independent':
        return 'مستقل برای هر بخش';
      default:
        return 'عمومی با انتخاب واحد';
    }
  };

  const getAnonymityLabel = (mode: Survey['anonymityMode']) => {
    switch (mode) {
      case 'anonymous':
        return { label: 'کاملاً ناشناس', icon: EyeOff, color: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300' };
      case 'confidential':
        return { label: 'محرمانه سازمانی', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' };
      default:
        return { label: 'شناسنامه‌دار', icon: Eye, color: 'text-slate-600 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                فهرست و مدیریت نظرسنجی‌های سازمانی
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تعریف پرسشنامه‌های سنجش رضایت، ارزیابی عملکرد و جمع‌آوری بازخورد واحدهای بالینی و ستادی
              </p>
            </div>
          </div>
        </div>

        {/* Create Survey Action */}
        {currentProfile.role !== 'respondent' && currentProfile.role !== 'analyst' && (
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ایجاد نظرسنجی جدید</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="جستجو در عنوان نظرسنجی، کد یا توضیحات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Unit Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-500 dark:text-slate-400">واحد سازمانی:</span>
            <select
              value={selectedUnitFilter}
              onChange={(e) => setSelectedUnitFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer max-w-[150px] truncate"
            >
              <option value="all">همه واحدها</option>
              {units.map((u) => (
                <option key={u.id} value={u.id} className="dark:bg-slate-800">
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-500 dark:text-slate-400">وضعیت:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="paused">متوقف</option>
              <option value="draft">پیش‌نویس</option>
            </select>
          </div>
        </div>
      </div>

      {/* Survey Cards Grid */}
      {filteredSurveys.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <ClipboardCheck className="w-8 h-8" />
          </div>
          <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-base">
            نظرسنجی مطابق با فیلتر یافت نشد
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
            می‌توانید فیلترهای جستجو را پاک کرده یا یک نظرسنجی جدید برای سازمان ایجاد فرمایید.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {filteredSurveys.map((survey) => {
            const anon = getAnonymityLabel(survey.anonymityMode);
            const AnonIcon = anon.icon;
            const currentPeriod = survey.periods.find((p) => p.id === survey.currentPeriodId) || survey.periods[0];

            return (
              <div
                key={survey.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-4"
              >
                {/* Header row of the card */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border border-slate-200/60 dark:border-slate-700/60">
                        {survey.code}
                      </span>
                      {getStatusBadge(survey.status)}
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${anon.color}`}>
                        <AnonIcon className="w-3.5 h-3.5" />
                        <span>{anon.label}</span>
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        نسخه {survey.version}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {survey.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {survey.description}
                    </p>
                  </div>

                  {/* Rating / Score summary badge */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      میانگین رضایت دوره:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        {survey.avgScore ? `${survey.avgScore}٪` : '۷۸٪'}
                      </span>
                      <span className="text-xs text-slate-400">(۳٫۹ از ۵)</span>
                    </div>
                  </div>
                </div>

                {/* Metadata Badges */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>شیوه تخصیص: <strong>{getAllocationLabel(survey.allocationMode)}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>دوره فعال: <strong className="text-indigo-600 dark:text-indigo-400">{currentPeriod?.name || 'دوره پاییز ۱۴۰۵'}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                    <span>پاسخ‌های ثبت‌شده: <strong>{survey.responseCount} پاسخ</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>تعداد محورها: <strong>{survey.sections.length} موضوع ({survey.questions.length} سؤال)</strong></span>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  {/* Left: Take survey or direct public link */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenPublicSurvey(survey.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                      title="مشاهده و پاسخ‌دهی به پرسشنامه به عنوان پرسنل یا کاربر"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>ورود و ثبت پاسخ</span>
                    </button>

                    <button
                      onClick={() => onSelectSurveyForAnalytics(survey.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200/80 dark:border-indigo-800 transition-all cursor-pointer"
                      title="داشبورد تحلیلی و مقایسه واحدهای سازمانی با نمودارها"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>داشبورد تحلیلی و مقایسه</span>
                    </button>

                    <button
                      onClick={() => onOpenShareModal?.(survey)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/70 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200/80 dark:border-purple-800 transition-all cursor-pointer"
                      title="تولید لینک اختصاصی، بارکد QR و پوستر چاپی این نظرسنجی"
                    >
                      <QrCode className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>لینک و QR Code</span>
                    </button>
                  </div>

                  {/* Right: Management Actions */}
                  <div className="flex items-center gap-1.5">
                    {/* Design survey questions */}
                    {currentProfile.role !== 'respondent' && currentProfile.role !== 'analyst' && (
                      <button
                        onClick={() => onSelectSurveyForBuilder(survey.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors cursor-pointer"
                        title="طراحی موضوعات و سؤالات نظرسنجی"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                        <span>طراحی سؤال‌ها</span>
                      </button>
                    )}

                    {/* Clone survey */}
                    {currentProfile.role !== 'respondent' && (
                      <button
                        onClick={() => onCloneSurvey(survey.id)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                        title="تکثیر و ساخت رونوشت جدید"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Toggle Status (Active / Pause) */}
                    {currentProfile.role === 'super_admin' && (
                      <button
                        onClick={() => onToggleStatus(survey.id, survey.status)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          survey.status === 'active'
                            ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60'
                            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                        }`}
                        title={survey.status === 'active' ? 'توقف موقت نظرسنجی' : 'فعال‌سازی نظرسنجی'}
                      >
                        {survey.status === 'active' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                      </button>
                    )}

                    {/* Delete */}
                    {currentProfile.role === 'super_admin' && (
                      <button
                        onClick={() => onDeleteSurvey(survey.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                        title="حذف نظرسنجی"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
