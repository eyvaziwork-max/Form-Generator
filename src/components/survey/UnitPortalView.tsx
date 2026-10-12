import React, { useState, useEffect } from 'react';
import {
  Building2,
  FolderTree,
  ClipboardCheck,
  CheckCircle2,
  Calendar,
  Users,
  ShieldCheck,
  EyeOff,
  ArrowRight,
  ExternalLink,
  QrCode,
  Sparkles,
  AlertCircle,
  Clock,
  ChevronLeft,
} from 'lucide-react';
import { OrganizationalUnit, Survey } from '../../types/survey';
import { surveyService } from '../../services/surveyService';
import { QRCodeManager } from './QRCodeManager';

interface UnitPortalViewProps {
  unitIdOrCode: string;
  onSelectSurvey: (surveyId: string, unitId: string) => void;
  onOpenShareModal?: (unit: OrganizationalUnit) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onBackToMain?: () => void;
}

export const UnitPortalView: React.FC<UnitPortalViewProps> = ({
  unitIdOrCode,
  onSelectSurvey,
  onOpenShareModal,
  onShowToast,
  onBackToMain,
}) => {
  const [unit, setUnit] = useState<OrganizationalUnit | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showInlineQr, setShowInlineQr] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadUnitData = async () => {
      try {
        const res = await surveyService.getUnitSurveys(unitIdOrCode);
        if (res && isMounted) {
          setUnit(res.unit);
          setSurveys(res.surveys);
        } else {
          // Fallback: search in getUnits
          const allUnits = await surveyService.getUnits();
          const found = allUnits.find(
            (u) =>
              u.id === unitIdOrCode ||
              u.code.toLowerCase() === unitIdOrCode.toLowerCase()
          );
          if (found && isMounted) {
            setUnit(found);
            const allSurveys = await surveyService.getSurveys({ status: 'active' });
            const matching = allSurveys.filter(
              (s) =>
                s.assignedUnitIds.includes(found.id) ||
                s.assignedUnitIds.includes('unit-hosp-01') ||
                s.assignedUnitIds.length === 0
            );
            setSurveys(matching);
          }
        }
      } catch (err) {
        console.error('Error loading unit portal data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadUnitData();
    return () => {
      isMounted = false;
    };
  }, [unitIdOrCode]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
          در حال بارگذاری پرتال واحد سازمانی...
        </p>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-base font-black text-slate-900 dark:text-white">
          واحد سازمانی مورد نظر یافت نشد
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          ممکن است کد یا شناسه واردشده در پیوند اشتباه باشد یا بخش مورد نظر از سیستم خارج شده باشد.
        </p>
        {onBackToMain && (
          <button
            onClick={onBackToMain}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            بازگشت به فهرست نظرسنجی‌ها
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Back button (if available) */}
      {onBackToMain && (
        <button
          onClick={onBackToMain}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به پرتال اصلی</span>
        </button>
      )}

      {/* Unit Department Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-mono text-[11px] font-bold border border-indigo-400/30">
                کد بخش: {unit.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[11px] border border-emerald-400/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>پرتال رسمی معتبر</span>
              </span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                پرتال نظرسنجی و ارزیابی {unit.name}
              </h1>
              <p className="text-xs text-indigo-200/90 mt-1 max-w-xl leading-relaxed">
                {unit.description ||
                  'سامانه اختصاصی دریافت بازخورد، سنجش کیفیت خدمات و ارزیابی عملکرد این بخش'}
              </p>
            </div>

            {/* Department stats row */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-indigo-100">
              {unit.managerName && (
                <div className="flex items-center gap-1.5">
                  <span className="text-indigo-300">مسئول بخش:</span>
                  <strong className="text-white font-bold">{unit.managerName}</strong>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-300" />
                <span>ظرفیت پرسنل: <strong>{unit.staffCount} نفر</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>نظرسنجی‌های فعال: <strong>{surveys.length} فرم</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons for Department */}
          <div className="shrink-0 self-start md:self-center flex items-center gap-2">
            <button
              onClick={() => setShowInlineQr(!showInlineQr)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs backdrop-blur-xs border border-white/20 transition-all cursor-pointer shadow-xs"
              title="مشاهده بارکد و دریافت فایل چاپ SVG اختصاصی این بخش"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>{showInlineQr ? 'بستن بارکد' : 'بارکد و فایل چاپ SVG'}</span>
            </button>

            {onOpenShareModal && (
              <button
                onClick={() => onOpenShareModal(unit)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-xs border border-white/20 transition-all cursor-pointer"
                title="تنظیمات اشتراک‌گذاری و پوستر کامل"
              >
                <span>پوستر و استند</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline QRCodeManager section */}
      {showInlineQr && (
        <div className="animate-in fade-in zoom-in-95 duration-150">
          <QRCodeManager
            url={
              typeof window !== 'undefined'
                ? `${window.location.origin}/?unit=${unit.id}&tab=surveys`
                : `https://survey.example.com/?unit=${unit.id}`
            }
            title={`بارکد اختصاصی ${unit.name}`}
            subtitle={`کد واحد: ${unit.code} • اسکن سریع با گوشی هوشمند`}
            size={220}
            downloadFileName={`unit-${unit.code.toLowerCase()}-print-qr`}
            showDownloadButtons={true}
            showUrlControls={true}
            onShowToast={onShowToast}
          />
        </div>
      )}

      {/* Surveys List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              نظرسنجی‌های فعال و در حال اجرای این بخش
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            پاسخ‌ها به صورت خودکار به واحد «{unit.name}» ثبت خواهند شد
          </span>
        </div>

        {surveys.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
              در حال حاضر نظرسنجی فعالی برای این واحد ثبت نشده است
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              لطفاً در زمان شروع دوره بعدی ارزیابی یا با اطلاع‌رسانی مدیریت مراجعه فرمایید.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {surveys.map((srv) => {
              const currentPeriod =
                srv.periods.find((p) => p.id === srv.currentPeriodId) || srv.periods[0];

              return (
                <div
                  key={srv.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                          {srv.code}
                        </span>

                        {srv.anonymityMode === 'anonymous' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <EyeOff className="w-3 h-3" />
                            <span>کاملاً ناشناس</span>
                          </span>
                        ) : srv.anonymityMode === 'confidential' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                            <ShieldCheck className="w-3 h-3" />
                            <span>اطلاعات محرمانه</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                            <Users className="w-3 h-3" />
                            <span>شناسنامه‌دار پرسنلی</span>
                          </span>
                        )}

                        <span className="text-[11px] text-slate-500 font-medium">
                          دوره: <strong>{currentPeriod?.name || 'پاییز ۱۴۰۵'}</strong>
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {srv.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {srv.description}
                      </p>
                    </div>

                    {/* Start Survey CTA Button */}
                    <button
                      onClick={() => onSelectSurvey(srv.id, unit.id)}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
                    >
                      <span>شروع پاسخ‌دهی</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Survey quick specs footer */}
                  <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>زمان تقریبی: <strong>۳ الی ۵ دقیقه</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{srv.sections.length} محور موضوعی ({srv.questions.length} سؤال)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>ذخیره‌سازی امن و ثبت فوری کد پیگیری</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
