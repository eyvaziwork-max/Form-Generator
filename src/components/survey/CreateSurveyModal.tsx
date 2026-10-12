import React, { useState } from 'react';
import {
  X,
  Plus,
  Layers,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  Survey,
  OrganizationalUnit,
  SurveyAllocationMode,
  SurveyAnonymityMode,
} from '../../types/survey';

interface CreateSurveyModalProps {
  isOpen: boolean;
  units: OrganizationalUnit[];
  onClose: () => void;
  onCreate: (data: Partial<Survey>) => Promise<boolean>;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CreateSurveyModal: React.FC<CreateSurveyModalProps> = ({
  isOpen,
  units,
  onClose,
  onCreate,
  onShowToast,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState(`SRV-${Math.floor(100 + Math.random() * 900)}`);
  const [allocationMode, setAllocationMode] = useState<SurveyAllocationMode>('shared_segmented');
  const [anonymityMode, setAnonymityMode] = useState<SurveyAnonymityMode>('anonymous');
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>(['unit-hosp-01']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onShowToast('عنوان نظرسنجی الزامی است', 'error');
      return;
    }

    setIsSubmitting(true);
    const newSurvey: Partial<Survey> = {
      title: title.trim(),
      description: description.trim(),
      code: code.trim(),
      slug: code.toLowerCase(),
      version: 1,
      status: 'active',
      allocationMode,
      anonymityMode,
      assignedUnitIds: selectedUnitIds,
      minAnonymousGroupSize: 3,
      targetAudience: 'unit_staff',
      periods: [
        {
          id: `p-${Date.now()}`,
          surveyId: '',
          name: 'پاییز ۱۴۰۵',
          code: '1405-Q3',
          startDate: '1405/07/01',
          endDate: '1405/09/30',
          isActive: true,
          isClosed: false,
          responseCount: 0,
        },
      ],
      sections: [
        { id: `sec-1-${Date.now()}`, surveyId: '', title: 'رضایت شغلی و انگیزش', order: 1 },
        { id: `sec-2-${Date.now()}`, surveyId: '', title: 'کیفیت مدیریت و پشتیبانی', order: 2 },
        { id: `sec-3-${Date.now()}`, surveyId: '', title: 'تجهیزات و شرایط محیط کار', order: 3 },
      ],
      questions: [
        {
          id: `q-1-${Date.now()}`,
          sectionId: `sec-1-${Date.now()}`,
          type: 'likert',
          title: 'میزان رضایت کلی شما از شرایط کاری و محیط بخش',
          required: true,
          order: 1,
          options: [
            { id: 'opt-1', label: 'کاملاً ناراضی', value: '1', score: 20 },
            { id: 'opt-2', label: 'ناراضی', value: '2', score: 40 },
            { id: 'opt-3', label: 'تا حدودی', value: '3', score: 60 },
            { id: 'opt-4', label: 'راضی', value: '4', score: 80 },
            { id: 'opt-5', label: 'بسیار راضی', value: '5', score: 100 },
          ],
        },
        {
          id: `q-2-${Date.now()}`,
          sectionId: `sec-1-${Date.now()}`,
          type: 'nps',
          title: 'چقدر تمایل دارید این بخش را برای کار به سایر همکاران پیشنهاد دهید؟ (NPS)',
          required: true,
          order: 2,
          npsLabels: { low: 'اصلاً توصیه نمی‌کنم (۰)', high: 'قطعاً توصیه می‌کنم (۱۰)' },
        },
        {
          id: `q-3-${Date.now()}`,
          sectionId: `sec-2-${Date.now()}`,
          type: 'star_rating',
          title: 'امتیاز شما به پاسخگویی و همکاری مسئولین واحد',
          required: false,
          order: 3,
        },
      ],
    };

    const ok = await onCreate(newSurvey);
    setIsSubmitting(false);
    if (ok) {
      onShowToast('نظرسنجی جدید با موفقیت ایجاد شد.', 'success');
      onClose();
    }
  };

  const toggleUnit = (uId: string) => {
    setSelectedUnitIds((prev) =>
      prev.includes(uId) ? prev.filter((id) => id !== uId) : [...prev, uId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                تعریف نظرسنجی جدید سازمانی
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ایجاد پرسشنامه و تخصیص به واحدهای سازمانی
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              عنوان نظرسنجی <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: ارزیابی رضایت پرسنل پرستاری از تجهیزات و محیط کار"
              required
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              توضیحات و هدف نظرسنجی
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیح کوتاه در مورد هدف از اجرای این پرسشنامه..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                کد شناسایی فرم
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                سطح محرمانگی هویت
              </label>
              <select
                value={anonymityMode}
                onChange={(e) => setAnonymityMode(e.target.value as SurveyAnonymityMode)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="anonymous">ناشناس کامل (بی‌نام و نشان)</option>
                <option value="confidential">محرمانه سازمانی (عدم افشا به سرپرست)</option>
                <option value="identified">ثبت هویت پرسنلی</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              شیوه تخصیص به شاخه‌های سازمانی
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {
                  id: 'shared_segmented',
                  title: 'نظرسنجی مشترک با تفکیک واحد',
                  desc: 'یک فرم مشترک، گزارش مجزا برای هر بخش',
                },
                {
                  id: 'respondent_selection',
                  title: 'انتخاب واحد توسط کاربر',
                  desc: 'پاسخ‌دهنده واحد خود را انتخاب می‌کند',
                },
                {
                  id: 'independent',
                  title: 'نظرسنجی اختصاصی مستقل',
                  desc: 'مخصوص یک بخش معین با سوالات اختصاصی',
                },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setAllocationMode(mode.id as SurveyAllocationMode)}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                    allocationMode === mode.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="block font-bold text-slate-900 dark:text-white mb-0.5">
                    {mode.title}
                  </span>
                  <span className="text-[10px] text-slate-400 block leading-tight">{mode.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              واحدهای مجاز سازمانی (تخصیص یافته)
            </label>
            <div className="max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              {units.map((u) => {
                const checked = selectedUnitIds.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className="flex items-center gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleUnit(u.id)}
                      className="w-4 h-4 text-indigo-600 rounded-sm"
                    />
                    <span className="text-slate-800 dark:text-slate-200">{u.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono mr-auto">({u.code})</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 font-medium"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'در حال ایجاد...' : 'ایجاد و ذخیره نظرسنجی'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
