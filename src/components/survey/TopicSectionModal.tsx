import React, { useState, useEffect } from 'react';
import { X, Layers, Sliders, CheckCircle2 } from 'lucide-react';
import { SurveyTopicSection } from '../../types/survey';

interface TopicSectionModalProps {
  isOpen: boolean;
  section: SurveyTopicSection | null; // null if creating new
  surveyId: string;
  existingCount: number;
  onClose: () => void;
  onSave: (section: SurveyTopicSection) => void;
}

export const TopicSectionModal: React.FC<TopicSectionModalProps> = ({
  isOpen,
  section,
  surveyId,
  existingCount,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState<number>(1.0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (section) {
      setTitle(section.title);
      setDescription(section.description || '');
      setWeight(section.weight ?? 1.0);
      setError('');
    } else {
      setTitle('');
      setDescription('');
      setWeight(1.0);
      setError('');
    }
  }, [section, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('عنوان موضوع الزامی است.');
      return;
    }

    const payload: SurveyTopicSection = {
      id: section?.id || `sec-${Date.now()}`,
      surveyId: section?.surveyId || surveyId,
      title: title.trim(),
      description: description.trim(),
      weight: Number(weight) || 1.0,
      order: section?.order || existingCount + 1,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {section ? 'ویرایش محور موضوعی نظرسنجی' : 'افزودن محور موضوعی جدید'}
              </h3>
              <p className="text-xs text-slate-400">
                دسته‌بندی موضوعی سؤالات جهت تحلیل تفکیکی و ارزیابی رضایت
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              عنوان محور موضوعی <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="مثال: کیفیت مدیریت و عملکرد سرپرستار، تجهیزات و امکانات، رضایت شغلی..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              توضیحات و راهنمای این بخش (اختیاری)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات مربوط به سؤالات و اهداف این محور موضوعی..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                ضریب وزنی در محاسبه امتیاز کل رضایت (Weight)
              </label>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                {weight.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>وزن کم (۰.۵)</span>
              <span>وزن استاندارد (۱.۰)</span>
              <span>وزن بسیار بالا (۳.۰)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              محورهایی با ضریب وزنی بالاتر، تأثیر بیشتری در نمره نهایی شاخص رضایت سازمانی خواهند داشت.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              {section ? 'ذخیره تغییرات' : 'افزودن محور'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
