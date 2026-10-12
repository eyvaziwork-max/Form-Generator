import React, { useState, useEffect } from 'react';
import {
  X,
  Split,
  Plus,
  Trash2,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  FileQuestion,
  CornerDownLeft,
  GitBranch,
} from 'lucide-react';
import {
  SurveyQuestion,
  SurveyTopicSection,
  SurveyConditionalRule,
  ConditionalOperator,
  ConditionalAction,
} from '../../types/survey';

interface ConditionalLogicModalProps {
  isOpen: boolean;
  question: SurveyQuestion | null;
  allQuestions: SurveyQuestion[];
  allSections: SurveyTopicSection[];
  onClose: () => void;
  onSaveRules: (questionId: string, rules: SurveyConditionalRule[]) => void;
}

const OPERATOR_LABELS: Record<ConditionalOperator, string> = {
  equals: 'برابر است با (=)',
  not_equals: 'برابر نیست با (≠)',
  contains: 'شامل می‌شود (متن)',
  greater_than: 'بزرگتر از (>)',
  less_than: 'کوچکتر از (<)',
  is_empty: 'خالی باشد (بدون پاسخ)',
  is_not_empty: 'پر شده باشد (پاسخ داده شده)',
};

const ACTION_LABELS: Record<ConditionalAction, { label: string; icon: string; targetType: 'question' | 'section' | 'none' }> = {
  show: { label: 'نمایش سؤال (Show)', icon: '👁️', targetType: 'question' },
  hide: { label: 'مخفی‌سازی سؤال (Hide)', icon: '🙈', targetType: 'question' },
  require: { label: 'اجباری کردن پاسخ (Make Required)', icon: '⚠️', targetType: 'question' },
  jump_to_question: { label: 'پرش مستقیم به سؤال (Jump to Question)', icon: '⏩', targetType: 'question' },
  jump_to_section: { label: 'پرش مستقیم به موضوع/بخش (Jump to Section)', icon: '📑', targetType: 'section' },
  end_survey: { label: 'پایان نظرسنجی و ثبت پاسخ‌ها (End Survey)', icon: '🏁', targetType: 'none' },
};

const ELSE_ACTION_LABELS: Record<string, { label: string; icon: string; targetType: 'question' | 'section' | 'none' }> = {
  none: { label: 'ادامه عادی نظرسنجی (بدون عملیات)', icon: '➡️', targetType: 'none' },
  hide: { label: 'مخفی‌سازی سؤال هدف (Hide Question)', icon: '🙈', targetType: 'question' },
  show: { label: 'نمایش سؤال هدف (Show Question)', icon: '👁️', targetType: 'question' },
  jump_to_section: { label: 'پرش به موضوع دیگر (Jump to Section)', icon: '📑', targetType: 'section' },
};

export const ConditionalLogicModal: React.FC<ConditionalLogicModalProps> = ({
  isOpen,
  question,
  allQuestions,
  allSections,
  onClose,
  onSaveRules,
}) => {
  const [rules, setRules] = useState<SurveyConditionalRule[]>([]);

  useEffect(() => {
    if (question) {
      setRules(question.rules ? JSON.parse(JSON.stringify(question.rules)) : []);
    } else {
      setRules([]);
    }
  }, [question, isOpen]);

  if (!isOpen || !question) return null;

  // Other questions available as targets
  const otherQuestions = allQuestions.filter((q) => q.id !== question.id);

  // Available options for this question if it has predefined choices
  const triggerOptions = question.options || [];

  const handleAddRule = () => {
    const defaultTargetQ = otherQuestions[0]?.id;
    const defaultVal =
      triggerOptions.length > 0
        ? triggerOptions[0].value
        : question.type === 'yes_no'
        ? 'no'
        : question.type === 'nps'
        ? '6'
        : '';

    const newRule: SurveyConditionalRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      triggerQuestionId: question.id,
      operator: 'equals',
      value: defaultVal,
      action: 'show',
      targetQuestionId: defaultTargetQ,
      targetSectionId: allSections.find((s) => s.id !== question.sectionId)?.id || allSections[0]?.id,
      elseAction: 'hide',
      elseTargetQuestionId: defaultTargetQ,
    };

    setRules((prev) => [...prev, newRule]);
  };

  const handleUpdateRule = (ruleId: string, updates: Partial<SurveyConditionalRule>) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, ...updates } : r))
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  const handleSave = () => {
    onSaveRules(question.id, rules);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 text-xs max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                سازنده منطق شرطی و شاخه‌بندی (IF / THEN / ELSE Rule Builder)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تنظیم رفتارهای هوشمند شرطی (اگر/آنگاه/درغیر این‌صورت) برای هدایت پاسخ‌دهنده یا نمایش سؤالات وابسته
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Trigger Question Banner */}
        <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 flex items-start gap-3">
          <div className="p-1 rounded-lg bg-purple-100 dark:bg-purple-900/80 text-purple-700 dark:text-purple-300 font-bold shrink-0 text-[10px]">
            سؤال شرطی
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-slate-900 dark:text-white text-xs block">
              {question.title}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              قوانین زیر بر اساس پاسخی که کاربر به این سؤال ارائه می‌دهد اجرا خواهند شد.
            </span>
          </div>
        </div>

        {/* Rules List Container */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
              <span>قوانین شرطی تعریف‌شده</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-mono font-bold text-[11px]">
                {rules.length} قانون
              </span>
            </span>

            <button
              type="button"
              onClick={handleAddRule}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن قانون شرطی جدید (IF / THEN / ELSE)</span>
            </button>
          </div>

          {rules.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 dark:bg-slate-850 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <Split className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-slate-600 dark:text-slate-300 font-bold text-xs">
                هنوز هیچ قانون شرطی برای این سؤال تعریف نشده است.
              </p>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
                روی دکمه «افزودن قانون شرطی جدید» کلیک کنید تا بتوانید رفتار پاسخ‌دهی را به صورت پویا برنامه‌ریزی نمایید (مثلاً: اگر کاربر گزینه «خیر» را انتخاب کرد، سؤال علت نارضایتی نمایش داده شود).
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule, index) => {
                const actionInfo = ACTION_LABELS[rule.action] || { label: rule.action, icon: '⚡', targetType: 'question' };
                const elseActionKey = rule.elseAction || 'none';
                const elseActionInfo = ELSE_ACTION_LABELS[elseActionKey] || { label: elseActionKey, icon: '⚡', targetType: 'none' };
                const requiresValue = rule.operator !== 'is_empty' && rule.operator !== 'is_not_empty';

                const targetQuestionObj = allQuestions.find((q) => q.id === rule.targetQuestionId);
                const targetSectionObj = allSections.find((s) => s.id === rule.targetSectionId);

                return (
                  <div
                    key={rule.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-purple-300 dark:hover:border-purple-800 transition-all"
                  >
                    {/* Rule Top Bar */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-xl bg-purple-100 dark:bg-purple-900/80 text-purple-700 dark:text-purple-300 font-black flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        <span className="font-black text-sm text-slate-800 dark:text-slate-200">
                          قانون هوشمند شاخه‌بندی #{index + 1}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors cursor-pointer text-xs"
                        title="حذف این قانون"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف قانون</span>
                      </button>
                    </div>

                    {/* Visual Flow Summary Box */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 flex items-center gap-2 flex-wrap">
                      <span className="font-black text-purple-600 dark:text-purple-400">🔹 اگر (IF):</span>
                      <span>پاسخ {OPERATOR_LABELS[rule.operator]}</span>
                      {requiresValue && (
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 underline">
                          "{rule.value}"
                        </span>
                      )}
                      <span className="font-black text-emerald-600 dark:text-emerald-400">🟢 آنگاه (THEN):</span>
                      <span className="font-bold">
                        {actionInfo.label}
                        {actionInfo.targetType === 'question' && targetQuestionObj && ` ⬅️ «${targetQuestionObj.title}»`}
                        {actionInfo.targetType === 'section' && targetSectionObj && ` ⬅️ محور «${targetSectionObj.title}»`}
                      </span>
                      {elseActionKey !== 'none' && (
                        <>
                          <span className="font-black text-amber-600 dark:text-amber-400">🔶 در غیر این‌صورت (ELSE):</span>
                          <span className="font-bold">{elseActionInfo.label}</span>
                        </>
                      )}
                    </div>

                    {/* BLOCK 1: IF (شرط ورودی) */}
                    <div className="p-3.5 rounded-2xl bg-purple-50/40 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/60 space-y-2">
                      <div className="flex items-center gap-1.5 font-black text-purple-900 dark:text-purple-200 text-xs">
                        <span className="w-2 h-2 rounded-full bg-purple-600" />
                        <span>بلوک شرطی IF (اگر پاسخ این سؤال):</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium text-[11px]">
                            عملگر ارزیابی پاسخ:
                          </label>
                          <select
                            value={rule.operator}
                            onChange={(e) =>
                              handleUpdateRule(rule.id, { operator: e.target.value as ConditionalOperator })
                            }
                            className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden"
                          >
                            {Object.entries(OPERATOR_LABELS).map(([opKey, opLabel]) => (
                              <option key={opKey} value={opKey}>
                                {opLabel}
                              </option>
                            ))}
                          </select>
                        </div>

                        {requiresValue && (
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium text-[11px]">
                              مقدار یا گزینه مورد مقایسه:
                            </label>
                            {triggerOptions.length > 0 ? (
                              <select
                                value={String(rule.value)}
                                onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
                                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden text-indigo-600 dark:text-indigo-400"
                              >
                                {triggerOptions.map((opt) => (
                                  <option key={opt.id} value={opt.value}>
                                    {opt.label} ({opt.value})
                                  </option>
                                ))}
                              </select>
                            ) : question.type === 'yes_no' ? (
                              <select
                                value={String(rule.value)}
                                onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
                                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden text-indigo-600 dark:text-indigo-400"
                              >
                                <option value="yes">بله</option>
                                <option value="no">خیر</option>
                              </select>
                            ) : question.type === 'nps' ? (
                              <select
                                value={String(rule.value)}
                                onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
                                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden text-indigo-600 dark:text-indigo-400"
                              >
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                  <option key={num} value={String(num)}>
                                    امتیاز {num} {num <= 6 ? '(منتقد)' : num <= 8 ? '(خنثی)' : '(مروج)'}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={rule.value || ''}
                                onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
                                placeholder="مقدار شرطی را بنویسید..."
                                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium focus:outline-hidden"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* BLOCK 2: THEN (عملیات در صورت برقراری شرط) */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 space-y-2">
                      <div className="flex items-center gap-1.5 font-black text-emerald-900 dark:text-emerald-200 text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <span>بلوک عملیاتی THEN (آنگاه این کار را انجام بده):</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium text-[11px]">
                            عملیات اجرایی (Action):
                          </label>
                          <select
                            value={rule.action}
                            onChange={(e) =>
                              handleUpdateRule(rule.id, { action: e.target.value as ConditionalAction })
                            }
                            className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden"
                          >
                            {Object.entries(ACTION_LABELS).map(([actKey, actInfo]) => (
                              <option key={actKey} value={actKey}>
                                {actInfo.icon} {actInfo.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Target selection */}
                        {actionInfo.targetType === 'question' && (
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium text-[11px]">
                              سؤال هدف:
                            </label>
                            <select
                              value={rule.targetQuestionId || ''}
                              onChange={(e) =>
                                handleUpdateRule(rule.id, { targetQuestionId: e.target.value })
                              }
                              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden text-emerald-600 dark:text-emerald-400"
                            >
                              <option value="">-- انتخاب سؤال هدف --</option>
                              {otherQuestions.map((q, qIdx) => (
                                <option key={q.id} value={q.id}>
                                  #{qIdx + 1} - {q.title.length > 40 ? `${q.title.slice(0, 38)}...` : q.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {actionInfo.targetType === 'section' && (
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium text-[11px]">
                              محور موضوعی هدف برای پرش مستقیم:
                            </label>
                            <select
                              value={rule.targetSectionId || ''}
                              onChange={(e) =>
                                handleUpdateRule(rule.id, { targetSectionId: e.target.value })
                              }
                              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden text-emerald-600 dark:text-emerald-400"
                            >
                              <option value="">-- انتخاب محور موضوعی --</option>
                              {allSections.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* BLOCK 3: ELSE (عملیات در صورت عدم برقراری شرط) */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/60 space-y-2">
                      <div className="flex items-center gap-1.5 font-black text-amber-900 dark:text-amber-200 text-xs">
                        <span className="w-2 h-2 rounded-full bg-amber-600" />
                        <span>بلوک جایگزین ELSE (در غیر این‌صورت / Otherwise):</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium text-[11px]">
                            عملیات در حالت برعکس:
                          </label>
                          <select
                            value={rule.elseAction || 'none'}
                            onChange={(e) =>
                              handleUpdateRule(rule.id, {
                                elseAction: e.target.value as any,
                                elseTargetQuestionId: rule.targetQuestionId,
                              })
                            }
                            className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden"
                          >
                            {Object.entries(ELSE_ACTION_LABELS).map(([eKey, eInfo]) => (
                              <option key={eKey} value={eKey}>
                                {eInfo.icon} {eInfo.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {rule.elseAction === 'hide' || rule.elseAction === 'show' ? (
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium text-[11px]">
                              سؤال متأثر:
                            </label>
                            <select
                              value={rule.elseTargetQuestionId || rule.targetQuestionId || ''}
                              onChange={(e) =>
                                handleUpdateRule(rule.id, { elseTargetQuestionId: e.target.value })
                              }
                              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden text-amber-600 dark:text-amber-400"
                            >
                              <option value="">-- سؤال هدف --</option>
                              {otherQuestions.map((q, qIdx) => (
                                <option key={q.id} value={q.id}>
                                  #{qIdx + 1} - {q.title.length > 40 ? `${q.title.slice(0, 38)}...` : q.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : rule.elseAction === 'jump_to_section' ? (
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium text-[11px]">
                              محور موضوعی هدف:
                            </label>
                            <select
                              value={rule.elseTargetSectionId || ''}
                              onChange={(e) =>
                                handleUpdateRule(rule.id, { elseTargetSectionId: e.target.value })
                              }
                              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden text-amber-600 dark:text-amber-400"
                            >
                              <option value="">-- انتخاب محور موضوعی --</option>
                              {allSections.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 cursor-pointer font-medium"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black shadow-md shadow-purple-600/20 cursor-pointer"
          >
            تأیید و ذخیره تمام قوانین
          </button>
        </div>
      </div>
    </div>
  );
};
