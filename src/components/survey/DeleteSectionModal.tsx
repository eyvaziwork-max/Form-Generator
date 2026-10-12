import React, { useState } from 'react';
import { AlertTriangle, X, ArrowLeft, Trash2, Layers } from 'lucide-react';
import { SurveyTopicSection } from '../../types/survey';

interface DeleteSectionModalProps {
  isOpen: boolean;
  section: SurveyTopicSection | null;
  otherSections: SurveyTopicSection[];
  questionCount: number;
  onClose: () => void;
  onConfirmDelete: (secId: string, transferQuestionsToSectionId?: string | null) => void;
}

export const DeleteSectionModal: React.FC<DeleteSectionModalProps> = ({
  isOpen,
  section,
  otherSections,
  questionCount,
  onClose,
  onConfirmDelete,
}) => {
  const [actionChoice, setActionChoice] = useState<'transfer' | 'delete_all'>('transfer');
  const [targetSectionId, setTargetSectionId] = useState<string>(
    otherSections[0]?.id || ''
  );

  if (!isOpen || !section) return null;

  const handleConfirm = () => {
    if (questionCount > 0 && actionChoice === 'transfer') {
      onConfirmDelete(section.id, targetSectionId || null);
    } else {
      onConfirmDelete(section.id, null);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              حذف محور موضوعی: {section.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {questionCount > 0 ? (
          <div className="space-y-3">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              این محور موضوعی در حال حاضر شامل <strong className="text-indigo-600 dark:text-indigo-400">{questionCount} سؤال</strong> می‌باشد. برای جلوگیری از حذف ناخواسته اطلاعات، لطفاً نحوه رسیدگی به سؤالات را مشخص کنید:
            </p>

            <div className="space-y-2">
              {otherSections.length > 0 && (
                <label className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                  actionChoice === 'transfer'
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 font-bold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="deleteChoice"
                    checked={actionChoice === 'transfer'}
                    onChange={() => setActionChoice('transfer')}
                    className="mt-0.5 text-indigo-600"
                  />
                  <div className="space-y-1">
                    <span className="text-slate-900 dark:text-white block font-bold">
                      انتقال سؤالات به یک محور موضوعی دیگر (پیشنهادی)
                    </span>
                    {actionChoice === 'transfer' && (
                      <div className="pt-1">
                        <select
                          value={targetSectionId}
                          onChange={(e) => setTargetSectionId(e.target.value)}
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-hidden"
                        >
                          {otherSections.map((s) => (
                            <option key={s.id} value={s.id}>
                              انتقال به: {s.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </label>
              )}

              <label className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                actionChoice === 'delete_all'
                  ? 'bg-rose-50/80 dark:bg-rose-950/60 border-rose-500 font-bold'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}>
                <input
                  type="radio"
                  name="deleteChoice"
                  checked={actionChoice === 'delete_all'}
                  onChange={() => setActionChoice('delete_all')}
                  className="mt-0.5 text-rose-600"
                />
                <div className="space-y-0.5">
                  <span className="text-rose-700 dark:text-rose-300 block font-bold">
                    حذف تمام سؤالات این محور همراه با موضوع
                  </span>
                  <span className="text-[11px] text-slate-400 block leading-tight">
                    تمامی {questionCount} سؤال زیرمجموعه این موضوع به طور کامل حذف خواهند شد.
                  </span>
                </div>
              </label>
            </div>
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            این محور فاقد سؤال است و بدون تغییر در سایر داده‌ها حذف خواهد شد. آیا مطمئن هستید؟
          </p>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 cursor-pointer"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
          >
            تأیید و اجرای عملیات
          </button>
        </div>
      </div>
    </div>
  );
};
