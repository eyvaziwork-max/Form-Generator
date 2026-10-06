import React, { useState, useEffect } from 'react';
import {
  Star,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Send,
  Loader2,
  FileCheck,
} from 'lucide-react';
import { Form, FormField, ConditionalRule } from '../../types/form';
import { validateFieldValue, normalizePersianNumbers } from '../../services/validation';

interface FormRendererProps {
  form: Form;
  onSubmit: (values: Record<string, any>) => Promise<{ success: boolean; message?: string; errors?: Record<string, string> }>;
  isSubmitting?: boolean;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  form,
  onSubmit,
  isSubmitting = false,
}) => {
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  // Initialize default values
  useEffect(() => {
    const initial: Record<string, any> = {};
    form.fields.forEach((f) => {
      if (f.defaultValue !== undefined && f.defaultValue !== '') {
        initial[f.name] = f.defaultValue;
      } else if (f.type === 'multiselect') {
        initial[f.name] = [];
      } else if (f.type === 'checkbox') {
        initial[f.name] = false;
      } else if (f.type === 'star_rating') {
        initial[f.name] = f.defaultValue || 0;
      }
    });
    setValues(initial);
  }, [form]);

  // Handle value change
  const handleInputChange = (field: FormField, val: any) => {
    const updated = { ...values, [field.name]: val };
    setValues(updated);

    // Validate on change if touched
    if (touched[field.name]) {
      const result = validateFieldValue(field, val);
      if (!result.isValid && result.error) {
        setErrors((prev) => ({ ...prev, [field.name]: result.error! }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field.name];
          return next;
        });
      }
    }
  };

  // Handle blur
  const handleInputBlur = (field: FormField) => {
    setTouched((prev) => ({ ...prev, [field.name]: true }));
    const result = validateFieldValue(field, values[field.name]);
    if (!result.isValid && result.error) {
      setErrors((prev) => ({ ...prev, [field.name]: result.error! }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field.name];
        return next;
      });
    }
  };

  // Evaluate conditional logic rule
  const isFieldVisible = (field: FormField): boolean => {
    if (!field.active) return false;
    if (field.type === 'hidden') return false; // hidden fields not rendered in public UI
    if (!field.conditionalLogic || !field.conditionalLogic.enabled) return true;

    const { action, rules } = field.conditionalLogic;
    if (!rules || rules.length === 0) return true;

    // Check all rules
    const allRulesMet = rules.every((rule: ConditionalRule) => {
      // Find trigger field
      const triggerField = form.fields.find((f) => f.id === rule.fieldId);
      if (!triggerField) return true;

      const triggerVal = values[triggerField.name];
      const strTrigger = triggerVal !== undefined && triggerVal !== null ? String(triggerVal).trim() : '';
      const strTarget = String(rule.value).trim();

      switch (rule.operator) {
        case 'equals':
          return strTrigger === strTarget;
        case 'not_equals':
          return strTrigger !== strTarget;
        case 'contains':
          return strTrigger.includes(strTarget);
        case 'is_empty':
          return !strTrigger;
        case 'is_not_empty':
          return !!strTrigger;
        default:
          return true;
      }
    });

    return action === 'show' ? allRulesMet : !allRulesMet;
  };

  // Calculate completion progress
  const activeInteractiveFields = form.fields.filter(
    (f) => f.active && f.type !== 'static_text' && f.type !== 'divider' && f.type !== 'hidden'
  );
  const filledCount = activeInteractiveFields.filter((f) => {
    const val = values[f.name];
    return val !== undefined && val !== null && String(val).trim() !== '';
  }).length;
  const progressPercent =
    activeInteractiveFields.length > 0
      ? Math.round((filledCount / activeInteractiveFields.length) * 100)
      : 0;

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched and validate
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};

    activeInteractiveFields.forEach((f) => {
      newTouched[f.name] = true;
      if (isFieldVisible(f)) {
        const result = validateFieldValue(f, values[f.name]);
        if (!result.isValid && result.error) {
          newErrors[f.name] = result.error;
        }
      }
    });

    setTouched(newTouched);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const res = await onSubmit(values);
    if (!res.success && res.errors) {
      setErrors(res.errors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Bar */}
      {activeInteractiveFields.length > 1 && (
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            <span>پیشرفت تکمیل فرم</span>
            <span className="text-indigo-600 dark:text-indigo-400">{progressPercent}٪</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Fields List */}
      <div className="space-y-5">
        {form.fields.map((field) => {
          if (!isFieldVisible(field)) return null;

          const error = errors[field.name];
          const hasError = !!error && touched[field.name];

          // Structural Types: Static Text & Divider
          if (field.type === 'divider') {
            return (
              <div key={field.id} className="py-2">
                <hr className="border-t-2 border-slate-200 dark:border-slate-800" />
              </div>
            );
          }

          if (field.type === 'static_text') {
            return (
              <div
                key={field.id}
                className="p-4 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/80 rounded-2xl text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 leading-relaxed"
              >
                {field.description || field.label}
              </div>
            );
          }

          return (
            <div
              key={field.id}
              className={`space-y-1.5 transition-all ${field.cssClass || ''}`}
            >
              {/* Field Label & Required marker */}
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-900 dark:text-white">
                  {field.label}
                  {field.required && (
                    <span className="text-rose-500 mr-1" title="تکمیل این فیلد الزامی است">
                      *
                    </span>
                  )}
                </label>

                {field.description && (
                  <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
                    {field.description}
                  </span>
                )}
              </div>

              {/* Render Field Input Control */}
              <div className="relative">
                {/* Textarea */}
                {field.type === 'textarea' && (
                  <textarea
                    rows={3}
                    placeholder={field.placeholder || ''}
                    value={values[field.name] || ''}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    onBlur={() => handleInputBlur(field)}
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 transition-all leading-relaxed ${
                      hasError
                        ? 'border-rose-400 dark:border-rose-700 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/30'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
                    }`}
                  />
                )}

                {/* Dropdown / Select */}
                {field.type === 'select' && (
                  <select
                    value={values[field.name] || ''}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    onBlur={() => handleInputBlur(field)}
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 transition-all cursor-pointer ${
                      hasError
                        ? 'border-rose-400 dark:border-rose-700 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/30'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
                    }`}
                  >
                    <option value="" className="dark:bg-slate-800 dark:text-slate-400">
                      {field.placeholder || '-- لطفاً یک گزینه را انتخاب فرمایید --'}
                    </option>
                    {field.options?.map((opt) => (
                      <option key={opt.id} value={opt.value} className="dark:bg-slate-800 dark:text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {/* Radio Group */}
                {field.type === 'radio' && (
                  <div className="space-y-2.5 pt-1">
                    {field.options?.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          values[field.name] === opt.value
                            ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-bold'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={field.name}
                          value={opt.value}
                          checked={values[field.name] === opt.value}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          onBlur={() => handleInputBlur(field)}
                          className="w-4 h-4 text-indigo-600 focus:ring-0"
                        />
                        <span className="text-sm">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Checkbox Single */}
                {field.type === 'checkbox' && (
                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      values[field.name]
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!values[field.name]}
                      onChange={(e) => handleInputChange(field, e.target.checked)}
                      onBlur={() => handleInputBlur(field)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                    />
                    <span className="text-sm font-medium">{field.label}</span>
                  </label>
                )}

                {/* Multi-select / Checkbox Group */}
                {field.type === 'multiselect' && (
                  <div className="space-y-2 pt-1">
                    {field.options?.map((opt) => {
                      const currentSelected = Array.isArray(values[field.name])
                        ? values[field.name]
                        : [];
                      const isChecked = currentSelected.includes(opt.value);
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-semibold'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const updatedList = e.target.checked
                                ? [...currentSelected, opt.value]
                                : currentSelected.filter((v: string) => v !== opt.value);
                              handleInputChange(field, updatedList);
                            }}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                          />
                          <span className="text-sm">{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Star Rating */}
                {field.type === 'star_rating' && (
                  <div className="flex items-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => handleInputChange(field, star)}
                        onMouseEnter={() => {}}
                        className="p-1 transition-transform hover:scale-110 focus:outline-hidden cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            (values[field.name] || 0) >= star
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 mr-2">
                      {values[field.name] ? `${values[field.name]} از ۵ ستاره` : 'امتیاز دهید'}
                    </span>
                  </div>
                )}

                {/* File & Image Upload Mock */}
                {(field.type === 'file' || field.type === 'image') && (
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 transition-all cursor-pointer">
                    <input
                      type="file"
                      id={`file-${field.id}`}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleInputChange(field, file.name);
                        }
                      }}
                    />
                    <label htmlFor={`file-${field.id}`} className="cursor-pointer">
                      <UploadCloud className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mx-auto mb-2" />
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
                        {values[field.name]
                          ? `فایل انتخاب شده: ${values[field.name]}`
                          : 'انتخاب فایل یا رها کردن در این قسمت'}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">
                        {field.description || 'حداکثر حجم مجاز ۵ مگابایت'}
                      </span>
                    </label>
                  </div>
                )}

                {/* Standard Inputs: text, fullname, phone, student_id, email, number, date, time, password */}
                {[
                  'text',
                  'fullname',
                  'phone',
                  'student_id',
                  'national_id',
                  'email',
                  'number',
                  'date',
                  'time',
                  'datetime',
                  'password',
                ].includes(field.type) && (
                  <div className="relative">
                    <input
                      type={
                        field.type === 'password'
                          ? showPassword[field.id]
                            ? 'text'
                            : 'password'
                          : field.type === 'number'
                          ? 'number'
                          : field.type === 'date'
                          ? 'date'
                          : field.type === 'time'
                          ? 'time'
                          : field.type === 'datetime'
                          ? 'datetime-local'
                          : 'text'
                      }
                      placeholder={field.placeholder || ''}
                      value={values[field.name] || ''}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      onBlur={() => handleInputBlur(field)}
                      dir={
                        field.type === 'phone' ||
                        field.type === 'student_id' ||
                        field.type === 'email' ||
                        field.type === 'number'
                          ? 'ltr'
                          : 'rtl'
                      }
                      className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 transition-all ${
                        field.type === 'phone' ? 'pl-14 font-mono tracking-wider' : ''
                      } ${
                        field.type === 'student_id' ? 'font-mono' : ''
                      } ${
                        hasError
                          ? 'border-rose-400 dark:border-rose-700 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/30'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
                      }`}
                    />

                    {/* Phone prefix label */}
                    {field.type === 'phone' && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500 font-mono select-none">
                        +۹۸
                      </span>
                    )}

                    {/* Password toggle */}
                    {field.type === 'password' && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => ({
                            ...prev,
                            [field.id]: !prev[field.id],
                          }))
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer"
                      >
                        {showPassword[field.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Error Message with Icon */}
              {hasError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium mt-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white font-bold text-base shadow-lg shadow-indigo-200 dark:shadow-indigo-950 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>در حال اعتبارسنجی و ثبت اطلاعات...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>ثبت و ارسال نهایی فرم</span>
            </>
          )}
        </button>
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-2">
          اطلاعات شما با کدگذاری امنیتی در دیتابیس سامانه ذخیره می‌گردد.
        </p>
      </div>
    </form>
  );
};
