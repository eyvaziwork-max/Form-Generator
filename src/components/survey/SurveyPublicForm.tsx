import React, { useState, useMemo, useEffect } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  ShieldCheck,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Send,
  Star,
  Sparkles,
  ArrowRight,
  Check,
  FileCheck2,
} from 'lucide-react';
import { Survey, OrganizationalUnit } from '../../types/survey';

interface SurveyPublicFormProps {
  survey: Survey;
  units: OrganizationalUnit[];
  defaultUnitId?: string;
  onBackToDashboard?: () => void;
  onSubmitResponse: (data: {
    unitId: string;
    answers: Record<string, any>;
    respondent?: { personnelCode?: string; fullName?: string; jobTitle?: string };
  }) => Promise<{ success: boolean; trackingCode?: string; message: string }>;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SurveyPublicForm: React.FC<SurveyPublicFormProps> = ({
  survey,
  units,
  defaultUnitId,
  onBackToDashboard,
  onSubmitResponse,
  onShowToast,
}) => {
  // Candidate Units that are assigned to this survey
  const allowedUnits = useMemo(() => {
    return units.filter(
      (u) =>
        survey.assignedUnitIds.includes(u.id) ||
        survey.assignedUnitIds.includes('unit-hosp-01') ||
        survey.assignedUnitIds.length === 0
    );
  }, [units, survey]);

  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    defaultUnitId || (allowedUnits.find((u) => u.id === 'unit-icu-01')?.id || allowedUnits[0]?.id || '')
  );

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [personnelCode, setPersonnelCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('کارشناس پرستاری');
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState<{
    trackingCode: string;
    message: string;
  } | null>(null);

  const DRAFT_STORAGE_KEY = `survey_draft_${survey.id}`;

  // Restore draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.answers === 'object' && Object.keys(parsed.answers).length > 0) {
          setAnswers(parsed.answers);
          if (parsed.unitId && !defaultUnitId) setSelectedUnitId(parsed.unitId);
          if (parsed.personnelCode) setPersonnelCode(parsed.personnelCode);
          if (parsed.fullName) setFullName(parsed.fullName);
          setHasRestoredDraft(true);
        }
      }
    } catch {
      // ignore
    }
  }, [survey.id, defaultUnitId]);

  // Autosave draft to localStorage
  useEffect(() => {
    if (Object.keys(answers).length > 0 && !submittedReceipt) {
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            answers,
            unitId: selectedUnitId,
            personnelCode,
            fullName,
            savedAt: new Date().toISOString(),
          })
        );
      } catch {
        // ignore
      }
    }
  }, [answers, selectedUnitId, personnelCode, fullName, survey.id, submittedReceipt]);

  const currentSection = survey.sections[activeSectionIndex] || survey.sections[0];

  const evalRuleCondition = (triggerVal: any, operator: string, ruleVal: any): boolean => {
    switch (operator) {
      case 'equals':
        return triggerVal !== undefined && String(triggerVal) === String(ruleVal);
      case 'not_equals':
        return triggerVal !== undefined && String(triggerVal) !== String(ruleVal);
      case 'contains':
        return (
          triggerVal !== undefined &&
          String(triggerVal).toLowerCase().includes(String(ruleVal).toLowerCase())
        );
      case 'greater_than':
        return triggerVal !== undefined && Number(triggerVal) > Number(ruleVal);
      case 'less_than':
        return triggerVal !== undefined && Number(triggerVal) < Number(ruleVal);
      case 'is_empty':
        return (
          triggerVal === undefined ||
          triggerVal === '' ||
          (Array.isArray(triggerVal) && triggerVal.length === 0)
        );
      case 'is_not_empty':
        return (
          triggerVal !== undefined &&
          triggerVal !== '' &&
          (!Array.isArray(triggerVal) || triggerVal.length > 0)
        );
      default:
        return triggerVal !== undefined && String(triggerVal) === String(ruleVal);
    }
  };

  // Evaluate conditional visibility for questions
  const isQuestionVisible = (qId: string) => {
    // Check if any rules affect this question
    for (const q of survey.questions) {
      if (!q.rules) continue;
      for (const rule of q.rules) {
        const triggerVal = answers[rule.triggerQuestionId];
        const isTriggerMet = evalRuleCondition(triggerVal, rule.operator, rule.value);

        // Direct target match
        if (rule.targetQuestionId === qId) {
          if (isTriggerMet) {
            if (rule.action === 'show') return true;
            if (rule.action === 'hide') return false;
          } else if (rule.elseAction) {
            if (rule.elseAction === 'show') return true;
            if (rule.elseAction === 'hide') return false;
          }
        }

        // Else target match
        if (rule.elseTargetQuestionId === qId && !isTriggerMet) {
          if (rule.elseAction === 'show') return true;
          if (rule.elseAction === 'hide') return false;
        }
      }
    }
    return true;
  };

  const currentSectionQuestions = useMemo(() => {
    if (!currentSection) return [];
    return survey.questions
      .filter((q) => q.sectionId === currentSection.id)
      .filter((q) => isQuestionVisible(q.id));
  }, [currentSection, survey.questions, answers]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNextSection = () => {
    // Validate required questions in current section
    const missing = currentSectionQuestions.find(
      (q) =>
        q.required &&
        (answers[q.id] === undefined ||
          answers[q.id] === '' ||
          (Array.isArray(answers[q.id]) && answers[q.id].length === 0))
    );

    if (missing) {
      onShowToast(`لطفاً به سؤال «${missing.title}» پاسخ دهید.`, 'error');
      return;
    }

    // Check if any question rule in current section triggers jump_to_section
    for (const q of currentSectionQuestions) {
      if (!q.rules) continue;
      for (const rule of q.rules) {
        const triggerVal = answers[q.id];
        if (evalRuleCondition(triggerVal, rule.operator, rule.value)) {
          if (rule.action === 'jump_to_section' && rule.targetSectionId) {
            const targetIdx = survey.sections.findIndex((s) => s.id === rule.targetSectionId);
            if (targetIdx !== -1) {
              setActiveSectionIndex(targetIdx);
              window.scrollTo({ top: 0, behavior: 'smooth' });
              return;
            }
          }
        }
      }
    }

    if (activeSectionIndex < survey.sections.length - 1) {
      setActiveSectionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevSection = () => {
    if (activeSectionIndex > 0) {
      setActiveSectionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId) {
      onShowToast('لطفاً واحد سازمانی خود را انتخاب فرمایید.', 'error');
      return;
    }

    // Check all required questions across all sections
    for (const q of survey.questions) {
      if (q.required && isQuestionVisible(q.id)) {
        const val = answers[q.id];
        if (val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
          onShowToast(`لطفاً سؤال الزامی «${q.title}» را تکمیل فرمایید.`, 'error');
          return;
        }
      }
    }

    setIsSubmitting(true);
    const respondentData =
      survey.anonymityMode !== 'anonymous'
        ? {
            personnelCode: personnelCode || undefined,
            fullName: fullName || undefined,
            jobTitle: jobTitle || undefined,
          }
        : undefined;

    const res = await onSubmitResponse({
      unitId: selectedUnitId,
      answers,
      respondent: respondentData,
    });

    setIsSubmitting(false);

    if (res.success && res.trackingCode) {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // ignore
      }
      setSubmittedReceipt({
        trackingCode: res.trackingCode,
        message: res.message,
      });
      onShowToast('پاسخ نظرسنجی با موفقیت ثبت شد.', 'success');
    } else {
      onShowToast(res.message || 'خطا در ثبت پاسخ نظرسنجی', 'error');
    }
  };

  // Render Inactive / Paused Survey Screen
  if (survey.status !== 'active') {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900/60 text-center space-y-4 shadow-sm animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">
          این نظرسنجی در حال حاضر غیرفعال یا متوقف شده است
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
          نظرسنجی «{survey.title}» موقتاً در وضعیت {survey.status === 'paused' ? 'متوقف‌شده' : 'پیش‌نویس'} قرار دارد و امکان ثبت پاسخ جدید برای آن وجود ندارد.
        </p>
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            بازگشت به پنل
          </button>
        )}
      </div>
    );
  }

  // Render Submitted Receipt Screen
  if (submittedReceipt) {
    const unitObj = units.find((u) => u.id === selectedUnitId);

    const handleCopyTracking = () => {
      navigator.clipboard.writeText(submittedReceipt.trackingCode);
      setCopiedTracking(true);
      onShowToast('کد پیگیری در حافظه کپی شد.', 'success');
      setTimeout(() => setCopiedTracking(false), 2500);
    };

    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in zoom-in-95 duration-200">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200/90 dark:border-slate-800 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              پاسخ شما با موفقیت در سامانه ثبت شد
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {submittedReceipt.message}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 max-w-md mx-auto space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">کد پیگیری نظرسنجی:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm tracking-wider">
                  {submittedReceipt.trackingCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyTracking}
                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors cursor-pointer"
                  title="کپی کد رهگیری"
                >
                  {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ClipboardCheck className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">بخش و واحد منتسب:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {unitObj ? unitObj.name : 'واحد سازمانی'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">سطح محرمانگی:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {survey.anonymityMode === 'anonymous' ? 'ناشناس' : 'محرمانه سازمانی'}
              </span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                بازگشت به پنل مدیریت
              </button>
            )}
            <button
              onClick={() => {
                setSubmittedReceipt(null);
                setAnswers({});
                setActiveSectionIndex(0);
              }}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              ثبت پاسخ جدید
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedUnitObj = units.find((u) => u.id === selectedUnitId);
  const progressPercent = Math.round(((activeSectionIndex + 1) / survey.sections.length) * 100);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20">
      {/* Questionnaire Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4">
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>بازگشت به پنل</span>
          </button>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {survey.code}
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>نظرسنجی محرمانه و محافظت‌شده</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
            {survey.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {survey.description}
          </p>
        </div>

        {/* Unit Selector Bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-bold text-slate-700 dark:text-slate-300">
              بخش یا واحد سازمانی منتسب:
            </span>
          </div>

          {defaultUnitId ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{selectedUnitObj ? selectedUnitObj.name : 'واحد تخصیص‌یافته'}</span>
              <span className="text-[10px] text-indigo-500 font-mono">({selectedUnitObj?.code || defaultUnitId})</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-200/50 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                تخصیص اختصاصی پیوند
              </span>
            </div>
          ) : (
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              {allowedUnits.map((u) => (
                <option key={u.id} value={u.id} className="dark:bg-slate-800">
                  {u.name} ({u.code})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Restored Draft Banner */}
        {hasRestoredDraft && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>پیش‌نویس ذخیره‌شده قبلی شما به صورت خودکار بازیابی گردید.</span>
            </div>
            <button
              type="button"
              onClick={() => setHasRestoredDraft(false)}
              className="text-blue-500 hover:text-blue-700 font-bold text-[11px] cursor-pointer"
            >
              متوجه شدم
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <div className="pt-2 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>
              محور {activeSectionIndex + 1} از {survey.sections.length}: <strong>{currentSection?.title}</strong>
            </span>
            <span>{progressPercent}٪ تکمیل شده</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active Section Questions */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base sm:text-lg font-black text-indigo-700 dark:text-indigo-400">
              {currentSection?.title}
            </h3>
            {currentSection?.description && (
              <p className="text-xs text-slate-400 mt-1">{currentSection.description}</p>
            )}
          </div>

          {/* Question List */}
          <div className="space-y-6">
            {currentSectionQuestions.map((question, qIdx) => {
              const currentVal = answers[question.id];

              return (
                <div
                  key={question.id}
                  className="space-y-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-150"
                >
                  <div>
                    <label className="font-extrabold text-sm text-slate-900 dark:text-white flex items-start gap-1.5">
                      <span className="text-indigo-600 font-mono text-xs mt-0.5">#{qIdx + 1}</span>
                      <span>{question.title}</span>
                      {question.required && <span className="text-rose-500">*</span>}
                    </label>
                    {question.description && (
                      <p className="text-xs text-slate-400 mt-1">{question.description}</p>
                    )}
                  </div>

                  {/* Input Types */}
                  {/* 1. Likert Scale */}
                  {question.type === 'likert' && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                      {question.options?.map((opt) => {
                        const isSelected = String(currentVal) === String(opt.value);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleAnswerChange(question.id, opt.value)}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 font-bold'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                            }`}
                          >
                            <span className="text-xs block font-bold">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 2. Star Rating */}
                  {question.type === 'star_rating' && (
                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((starNum) => {
                        const isFilled = (currentVal || 0) >= starNum;
                        return (
                          <button
                            key={starNum}
                            type="button"
                            onClick={() => handleAnswerChange(question.id, starNum)}
                            className="p-1 rounded-lg transition-transform hover:scale-110 cursor-pointer"
                          >
                            <Star
                              className={`w-7 h-7 ${
                                isFilled
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          </button>
                        );
                      })}
                      {currentVal && (
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 mr-2">
                          ({currentVal} ستاره از ۵)
                        </span>
                      )}
                    </div>
                  )}

                  {/* 3. NPS Scale (0 to 10) */}
                  {question.type === 'nps' && (
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
                          const isSelected = currentVal === n;
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => handleAnswerChange(question.id, n)}
                              className={`py-2 rounded-xl border text-center font-mono font-bold text-xs transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-black scale-105'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                              }`}
                            >
                              {n}
                            </button>
                          );
                        })}
                      </div>
                      {question.npsLabels && (
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 px-1">
                          <span>{question.npsLabels.low}</span>
                          <span>{question.npsLabels.high}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. Yes / No */}
                  {question.type === 'yes_no' && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {question.options?.map((opt) => {
                        const isSelected = currentVal === opt.value;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleAnswerChange(question.id, opt.value)}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-bold'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                            }`}
                          >
                            <span className="text-xs font-bold">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 5. Single Choice */}
                  {question.type === 'single_choice' && (
                    <div className="space-y-1.5 pt-1">
                      {question.options?.map((opt) => {
                        const isSelected = currentVal === opt.value;
                        return (
                          <label
                            key={opt.id}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-bold'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={question.id}
                              value={opt.value}
                              checked={isSelected}
                              onChange={() => handleAnswerChange(question.id, opt.value)}
                              className="w-4 h-4 text-indigo-600"
                            />
                            <span>{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* 6. Multiple Choice */}
                  {question.type === 'multi_choice' && (
                    <div className="space-y-1.5 pt-1">
                      {question.options?.map((opt) => {
                        const arr = Array.isArray(currentVal) ? currentVal : [];
                        const isChecked = arr.includes(opt.value);
                        return (
                          <label
                            key={opt.id}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-bold'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const nextArr = e.target.checked
                                  ? [...arr, opt.value]
                                  : arr.filter((x: any) => x !== opt.value);
                                handleAnswerChange(question.id, nextArr);
                              }}
                              className="w-4 h-4 text-indigo-600 rounded-sm"
                            />
                            <span>{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* 7. Long Text / Textarea */}
                  {question.type === 'long_text' && (
                    <textarea
                      rows={3}
                      placeholder={question.placeholder || 'پاسخ یا نظر خود را بنویسید...'}
                      value={currentVal || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-indigo-500"
                    />
                  )}

                  {/* 8. Short Text */}
                  {question.type === 'short_text' && (
                    <input
                      type="text"
                      placeholder={question.placeholder || 'پاسخ کوتاه...'}
                      value={currentVal || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-indigo-500"
                    />
                  )}

                  {/* 9. Rating 1 to 5 */}
                  {question.type === 'rating_5' && (
                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((num) => {
                        const isSelected = currentVal === num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleAnswerChange(question.id, num)}
                            className={`w-11 h-11 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-black scale-105'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 10. Rating 1 to 10 */}
                  {question.type === 'rating_10' && (
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                        const isSelected = currentVal === num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleAnswerChange(question.id, num)}
                            className={`py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-black scale-105'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 11. Dropdown Select */}
                  {question.type === 'dropdown' && (
                    <select
                      value={currentVal || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">-- لطفاً یک مورد را انتخاب کنید --</option>
                      {question.options?.map((opt) => (
                        <option key={opt.id} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* 12. Date Picker */}
                  {question.type === 'date' && (
                    <input
                      type="date"
                      value={currentVal || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-full sm:w-64 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-indigo-500"
                    />
                  )}

                  {/* 13. Number Input */}
                  {question.type === 'number' && (
                    <input
                      type="number"
                      placeholder={question.placeholder || 'عدد مورد نظر را وارد نمایید...'}
                      value={currentVal || ''}
                      min={question.min}
                      max={question.max}
                      onChange={(e) => handleAnswerChange(question.id, Number(e.target.value))}
                      className="w-full sm:w-64 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  )}

                  {/* 14. Matrix Question */}
                  {question.type === 'matrix' && (
                    <div className="overflow-x-auto pt-1">
                      <table className="w-full text-xs text-center border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                            <th className="p-2 text-right font-medium text-slate-500">معیار / سوال</th>
                            {(question.matrixColumns || question.options || [
                              { id: 'c1', label: 'خیلی کم', value: '1' },
                              { id: 'c2', label: 'کم', value: '2' },
                              { id: 'c3', label: 'متوسط', value: '3' },
                              { id: 'c4', label: 'زیاد', value: '4' },
                              { id: 'c5', label: 'خیلی زیاد', value: '5' },
                            ]).map((col) => (
                              <th key={col.id} className="p-2 font-medium text-slate-600 dark:text-slate-300">
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {(question.matrixRows || [
                            { id: 'r1', label: 'تجهیزات و ملزومات' },
                            { id: 'r2', label: 'پشتیبانی مدیریت' },
                            { id: 'r3', label: 'محیط فیزیکی و ایمنی' },
                          ]).map((row) => {
                            const matrixAnswers = currentVal || {};
                            const rowVal = matrixAnswers[row.id];
                            const cols = question.matrixColumns || question.options || [
                              { id: 'c1', label: 'خیلی کم', value: '1' },
                              { id: 'c2', label: 'کم', value: '2' },
                              { id: 'c3', label: 'متوسط', value: '3' },
                              { id: 'c4', label: 'زیاد', value: '4' },
                              { id: 'c5', label: 'خیلی زیاد', value: '5' },
                            ];
                            return (
                              <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                <td className="p-2.5 text-right font-semibold text-slate-800 dark:text-slate-200">
                                  {row.label}
                                </td>
                                {cols.map((col) => {
                                  const isChecked = rowVal === col.value;
                                  return (
                                    <td key={col.id} className="p-2">
                                      <input
                                        type="radio"
                                        name={`${question.id}_${row.id}`}
                                        checked={isChecked}
                                        onChange={() =>
                                          handleAnswerChange(question.id, {
                                            ...matrixAnswers,
                                            [row.id]: col.value,
                                          })
                                        }
                                        className="w-4 h-4 text-indigo-600 cursor-pointer"
                                      />
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 15. Ranking Question */}
                  {question.type === 'ranking' && (
                    <div className="space-y-2 pt-1">
                      <p className="text-[11px] text-slate-400">
                        ترتیب اولویت‌ها (برای جابه‌جایی روی موارد کلیک کنید):
                      </p>
                      <div className="space-y-1.5">
                        {(Array.isArray(currentVal) ? currentVal : (question.options || []).map((o) => o.label)).map(
                          (item: string, rankIdx: number, allItems: string[]) => (
                            <div
                              key={item}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                                  {rankIdx + 1}
                                </span>
                                <span className="font-medium text-slate-800 dark:text-slate-200">{item}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {rankIdx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...allItems];
                                      [next[rankIdx - 1], next[rankIdx]] = [next[rankIdx], next[rankIdx - 1]];
                                      handleAnswerChange(question.id, next);
                                    }}
                                    className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                                    title="بالاتر"
                                  >
                                    ▲
                                  </button>
                                )}
                                {rankIdx < allItems.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...allItems];
                                      [next[rankIdx + 1], next[rankIdx]] = [next[rankIdx], next[rankIdx + 1]];
                                      handleAnswerChange(question.id, next);
                                    }}
                                    className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                                    title="پایین‌تر"
                                  >
                                    ▼
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* 16. Image Choice */}
                  {question.type === 'image_choice' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                      {(question.options || [
                        { id: 'img-1', label: 'گزینه الف', value: 'opt_a' },
                        { id: 'img-2', label: 'گزینه ب', value: 'opt_b' },
                      ]).map((opt) => {
                        const isSelected = currentVal === opt.value;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleAnswerChange(question.id, opt.value)}
                            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer space-y-2 ${
                              isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 shadow-md font-bold'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                            }`}
                          >
                            <div className="w-full h-20 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                              🖼️
                            </div>
                            <span className="text-xs block font-bold">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 17. File Upload */}
                  {question.type === 'file_upload' && (
                    <div className="pt-1">
                      <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 rounded-2xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 transition-colors">
                        <span className="text-xl mb-1">📎</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {currentVal ? `فایل انتخاب شد: ${currentVal}` : 'برای بارگذاری فایل کلیک کنید'}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">فرمت‌های مجاز: PDF, PNG, JPG (حداکثر ۱۰ مگابایت)</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleAnswerChange(question.id, e.target.files[0].name);
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}

                  {/* 18. Info Block */}
                  {question.type === 'info_block' && (
                    <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs leading-relaxed">
                      ℹ️ {question.description || 'لطفاً پیش از ادامه، توضیحات این بخش را به دقت مطالعه فرمایید.'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons between Sections */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {activeSectionIndex > 0 ? (
            <button
              type="button"
              onClick={handlePrevSection}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>محور قبلی</span>
            </button>
          ) : (
            <div />
          )}

          {activeSectionIndex < survey.sections.length - 1 ? (
            <button
              type="button"
              onClick={handleNextSection}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <span>محور بعدی</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'در حال ثبت...' : 'ارسال نهایی پاسخ‌ها'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
