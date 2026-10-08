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
  Check,
  AlertTriangle,
  Info,
  ShieldCheck,
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
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
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

  // Evaluate conditional logic rule
  const isFieldVisible = (field: FormField): boolean => {
    if (!field.active) return false;
    if (field.type === 'hidden') return false; // hidden fields not rendered in public UI
    if (!field.conditionalLogic || !field.conditionalLogic.enabled) return true;

    const { action, rules } = field.conditionalLogic;
    if (!rules || rules.length === 0) return true;

    const allRulesMet = rules.every((rule: ConditionalRule) => {
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

  /**
   * Real-time Validation Engine:
   * Determines validity and whether an error message should be actively displayed.
   */
  const validateSingleField = (
    field: FormField,
    val: any,
    mode: 'change' | 'blur' | 'submit'
  ): { isValid: boolean; error?: string; showImmediateError: boolean } => {
    const result = validateFieldValue(field, val);
    const strVal = val !== undefined && val !== null ? String(val).trim() : '';
    const normalized = normalizePersianNumbers(strVal);
    const isCurrentlyTouched = !!touched[field.name] || mode === 'blur' || mode === 'submit';

    if (result.isValid) {
      return { isValid: true, showImmediateError: false };
    }

    // If blurred or submitted, always show error
    if (isCurrentlyTouched) {
      return { isValid: false, error: result.error, showImmediateError: true };
    }

    // In real-time 'change' mode, determine if the error should be displayed immediately:
    if (mode === 'change') {
      // 1. If this field already had an error displayed, update it live
      if (errors[field.name]) {
        return { isValid: false, error: result.error, showImmediateError: true };
      }

      // 2. Format-specific live error triggers:
      if (field.type === 'phone') {
        // Show live error if user has typed 11+ digits or typed non-09 start
        if (normalized.length >= 11 || (normalized.length >= 2 && !normalized.startsWith('09'))) {
          return { isValid: false, error: result.error, showImmediateError: true };
        }
      } else if (field.type === 'national_id') {
        // Show live error if user reached 10 digits
        if (normalized.length >= 10) {
          return { isValid: false, error: result.error, showImmediateError: true };
        }
      } else if (field.type === 'email') {
        // Show live error if user entered '@' and domain part is malformed
        if (strVal.includes('@') && strVal.length > 5 && strVal.includes('.')) {
          return { isValid: false, error: result.error, showImmediateError: true };
        }
      } else if (field.type === 'student_id') {
        // Show live error if user typed non-digits
        if (/[^\d]/.test(normalized)) {
          return { isValid: false, error: result.error, showImmediateError: true };
        }
        if (normalized.length > 14) {
          return { isValid: false, error: result.error, showImmediateError: true };
        }
      } else if (field.maxLength && strVal.length > field.maxLength) {
        return { isValid: false, error: result.error, showImmediateError: true };
      } else if (
        field.type === 'select' ||
        field.type === 'radio' ||
        field.type === 'checkbox' ||
        field.type === 'multiselect'
      ) {
        return { isValid: false, error: result.error, showImmediateError: true };
      }
    }

    return { isValid: false, error: result.error, showImmediateError: false };
  };

  // Handle value change with Real-time Validation
  const handleInputChange = (field: FormField, val: any) => {
    const updated = { ...values, [field.name]: val };
    setValues(updated);
    setDirty((prev) => ({ ...prev, [field.name]: true }));

    // Run Real-Time Validation
    const check = validateSingleField(field, val, 'change');

    if (check.isValid) {
      // Clear error immediately in real time
      setErrors((prev) => {
        if (!prev[field.name]) return prev;
        const next = { ...prev };
        delete next[field.name];
        return next;
      });
    } else if (check.showImmediateError && check.error) {
      // Display error immediately in real time
      setErrors((prev) => ({ ...prev, [field.name]: check.error! }));
    } else {
      // Clear error if field was corrected but not yet in full trigger
      if (errors[field.name] && !touched[field.name]) {
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
    const check = validateSingleField(field, values[field.name], 'blur');

    if (!check.isValid && check.error) {
      setErrors((prev) => ({ ...prev, [field.name]: check.error! }));
    } else {
      setErrors((prev) => {
        if (!prev[field.name]) return prev;
        const next = { ...prev };
        delete next[field.name];
        return next;
      });
    }
  };

  // Active interactive fields
  const activeInteractiveFields = form.fields.filter(
    (f) => f.active && f.type !== 'static_text' && f.type !== 'divider' && f.type !== 'hidden'
  );

  const visibleInteractiveFields = activeInteractiveFields.filter((f) => isFieldVisible(f));
  const requiredVisibleFields = visibleInteractiveFields.filter((f) => f.required);

  // Real-time counts
  const filledCount = visibleInteractiveFields.filter((f) => {
    const val = values[f.name];
    return val !== undefined && val !== null && String(val).trim() !== '';
  }).length;

  const validFieldsCount = visibleInteractiveFields.filter((f) => {
    const val = values[f.name];
    const strVal = val !== undefined && val !== null ? String(val).trim() : '';
    const hasValue = strVal !== '' && (!Array.isArray(val) || val.length > 0);
    return hasValue && !errors[f.name] && validateFieldValue(f, val).isValid;
  }).length;

  const completedRequiredCount = requiredVisibleFields.filter((f) => {
    const val = values[f.name];
    const strVal = val !== undefined && val !== null ? String(val).trim() : '';
    const hasValue = strVal !== '' && (!Array.isArray(val) || val.length > 0);
    return hasValue && !errors[f.name] && validateFieldValue(f, val).isValid;
  }).length;

  const activeErrorsCount = Object.keys(errors).filter((key) => {
    const f = form.fields.find((field) => field.name === key);
    return f && isFieldVisible(f);
  }).length;

  const progressPercent =
    visibleInteractiveFields.length > 0
      ? Math.round((filledCount / visibleInteractiveFields.length) * 100)
      : 0;

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all visible interactive fields as touched and validate
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};

    visibleInteractiveFields.forEach((f) => {
      newTouched[f.name] = true;
      const result = validateFieldValue(f, values[f.name]);
      if (!result.isValid && result.error) {
        newErrors[f.name] = result.error;
      }
    });

    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Find first errored field and scroll to it smoothly
      const firstErrorField = visibleInteractiveFields.find((f) => newErrors[f.name]);
      if (firstErrorField) {
        const el = document.getElementById(`field-container-${firstErrorField.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    const res = await onSubmit(values);
    if (!res.success && res.errors) {
      setErrors(res.errors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Progress Bar & Real-time Completion Status */}
      {visibleInteractiveFields.length > 1 && (
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <span>پیشرفت تکمیل فرم:</span>
              <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                {progressPercent}٪
              </strong>
            </span>
            <span className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <Check className="w-3.5 h-3.5" />
                <span>{validFieldsCount} فیلد معتبر</span>
              </span>
              {requiredVisibleFields.length > 0 && (
                <span>
                  ({completedRequiredCount} از {requiredVisibleFields.length} فیلد الزامی)
                </span>
              )}
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                activeErrorsCount > 0
                  ? 'bg-amber-500'
                  : progressPercent === 100
                  ? 'bg-emerald-500'
                  : 'bg-indigo-600 dark:bg-indigo-500'
              }`}
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
          const hasError = !!error;
          const val = values[field.name];
          const strVal = val !== undefined && val !== null ? String(val).trim() : '';
          const hasValue = strVal !== '' && (!Array.isArray(val) || val.length > 0);
          const isTouchedOrDirty = !!touched[field.name] || !!dirty[field.name];
          const isValid = !hasError && hasValue && isTouchedOrDirty && validateFieldValue(field, val).isValid;

          // Normalized characters count
          const normalizedStr = normalizePersianNumbers(strVal);

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
              id={`field-container-${field.id}`}
              className={`space-y-1.5 transition-all p-3 sm:p-3.5 rounded-2xl border ${
                hasError
                  ? 'border-rose-300 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/20 shadow-xs shadow-rose-100 dark:shadow-none'
                  : isValid
                  ? 'border-emerald-300/80 dark:border-emerald-800/60 bg-emerald-50/15 dark:bg-emerald-950/15'
                  : 'border-transparent bg-transparent'
              } ${field.cssClass || ''}`}
            >
              {/* Field Label & Status Header */}
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor={`input-${field.id}`}
                  className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"
                >
                  <span>{field.label}</span>
                  {field.required && (
                    <span className="text-rose-500 font-black text-sm" title="تکمیل این فیلد الزامی است">
                      *
                    </span>
                  )}
                </label>

                <div className="flex items-center gap-2">
                  {/* Real-Time Valid Status Badge */}
                  {isValid && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 animate-in fade-in">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>معتبر</span>
                    </span>
                  )}

                  {/* Real-Time Error Badge */}
                  {hasError && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100/90 dark:bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-700 animate-in fade-in">
                      <AlertCircle className="w-3 h-3" />
                      <span>نیاز به اصلاح</span>
                    </span>
                  )}

                  {field.description && !hasError && !isValid && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
                      {field.description}
                    </span>
                  )}
                </div>
              </div>

              {/* Render Field Input Control */}
              <div className="relative">
                {/* Textarea */}
                {field.type === 'textarea' && (
                  <div className="relative">
                    <textarea
                      id={`input-${field.id}`}
                      rows={3}
                      placeholder={field.placeholder || ''}
                      value={values[field.name] || ''}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      onBlur={() => handleInputBlur(field)}
                      aria-invalid={hasError}
                      className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 transition-all leading-relaxed ${
                        hasError
                          ? 'border-rose-400 dark:border-rose-600 ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/30'
                          : isValid
                          ? 'border-emerald-400 dark:border-emerald-600 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
                      }`}
                    />
                    {field.maxLength && (
                      <span className="absolute left-3 bottom-2.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-white/90 dark:bg-slate-800/90 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        {strVal.length} / {field.maxLength}
                      </span>
                    )}
                  </div>
                )}

                {/* Dropdown / Select */}
                {field.type === 'select' && (
                  <div className="relative">
                    <select
                      id={`input-${field.id}`}
                      value={values[field.name] || ''}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      onBlur={() => handleInputBlur(field)}
                      aria-invalid={hasError}
                      className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 transition-all cursor-pointer ${
                        hasError
                          ? 'border-rose-400 dark:border-rose-600 ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/30'
                          : isValid
                          ? 'border-emerald-400 dark:border-emerald-600 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/30'
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
                  </div>
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
                      id={`input-${field.id}`}
                      checked={!!values[field.name]}
                      onChange={(e) => handleInputChange(field, e.target.checked)}
                      onBlur={() => handleInputBlur(field)}
                      className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-0"
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
                            className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-0"
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
                  <div
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                      hasError
                        ? 'border-rose-400 bg-rose-50/30 dark:bg-rose-950/30'
                        : isValid
                        ? 'border-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/20'
                        : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/60'
                    }`}
                  >
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

                {/* Standard Inputs: text, fullname, phone, student_id, national_id, email, number, date, time, datetime, password */}
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
                      id={`input-${field.id}`}
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
                      aria-invalid={hasError}
                      dir={
                        field.type === 'phone' ||
                        field.type === 'student_id' ||
                        field.type === 'email' ||
                        field.type === 'number'
                          ? 'ltr'
                          : 'rtl'
                      }
                      className={`w-full py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 transition-all ${
                        field.type === 'phone' ? 'pl-14 pr-10 font-mono tracking-wider' : 'px-4'
                      } ${field.type === 'student_id' || field.type === 'national_id' ? 'font-mono pr-10' : ''} ${
                        field.type === 'email' ? 'font-mono pr-10' : ''
                      } ${field.type === 'password' ? 'pl-11 pr-10' : ''} ${
                        field.type === 'text' || field.type === 'fullname' ? 'pl-10 pr-4' : ''
                      } ${
                        hasError
                          ? 'border-rose-400 dark:border-rose-600 ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/30 focus:border-rose-500'
                          : isValid
                          ? 'border-emerald-400 dark:border-emerald-600 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/30 focus:border-emerald-500'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
                      }`}
                    />

                    {/* Phone prefix label */}
                    {field.type === 'phone' && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500 font-mono select-none">
                        +۹۸
                      </span>
                    )}

                    {/* Password toggle button */}
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
                        title={showPassword[field.id] ? 'مخفی‌سازی رمز' : 'نمایش رمز'}
                      >
                        {showPassword[field.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    {/* Status icon inside input: LTR fields on right side, RTL fields on left side */}
                    {(field.type === 'phone' ||
                      field.type === 'student_id' ||
                      field.type === 'national_id' ||
                      field.type === 'email' ||
                      field.type === 'number' ||
                      field.type === 'password') && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        {hasError && (
                          <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 animate-in zoom-in-75 duration-150" />
                        )}
                        {isValid && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 animate-in zoom-in-75 duration-150" />
                        )}
                      </div>
                    )}

                    {(field.type === 'text' || field.type === 'fullname') && (
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        {hasError && (
                          <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 animate-in zoom-in-75 duration-150" />
                        )}
                        {isValid && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 animate-in zoom-in-75 duration-150" />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Real-Time Live Validation Status & Error Messages */}
              {hasError ? (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 mt-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{error}</span>
                </div>
              ) : (
                /* Live Real-Time Helper Text while user is typing */
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                  {/* Phone Helper */}
                  {field.type === 'phone' && (
                    <>
                      <span>{isValid ? 'شماره همراه معتبر و تأیید شد.' : 'فرمت صحیح: ۰۹XXXXXXXXX'}</span>
                      <span className="font-mono">{normalizedStr.length} / ۱۱ رقم</span>
                    </>
                  )}

                  {/* National ID Helper */}
                  {field.type === 'national_id' && (
                    <>
                      <span>{isValid ? 'کد ملی ۱۰ رقمی با الگوریتم کنترل تایید شد.' : '۱۰ رقم عددی مطابق کارت ملی'}</span>
                      <span className="font-mono">{normalizedStr.length} / ۱۰ رقم</span>
                    </>
                  )}

                  {/* Student ID Helper */}
                  {field.type === 'student_id' && (
                    <>
                      <span>{isValid ? 'شماره دانشجویی معتبر است.' : 'فقط اعداد مجاز (بین ۵ الی ۱۴ رقم)'}</span>
                      <span className="font-mono">{normalizedStr.length} رقم</span>
                    </>
                  )}

                  {/* Email Helper */}
                  {field.type === 'email' && (
                    <>
                      <span>{isValid ? 'فرمت آدرس ایمیل تایید گردید.' : 'نمونه: username@domain.com'}</span>
                    </>
                  )}

                  {/* Length Constraints Helper */}
                  {(field.minLength || field.maxLength) &&
                    field.type !== 'phone' &&
                    field.type !== 'national_id' &&
                    field.type !== 'student_id' && (
                      <>
                        <span>
                          {field.minLength && strVal.length < field.minLength
                            ? `حداقل ${field.minLength} کاراکتر (تاکنون ${strVal.length})`
                            : 'طول ورودی مجاز'}
                        </span>
                        {field.maxLength && (
                          <span className="font-mono">
                            {strVal.length} / {field.maxLength}
                          </span>
                        )}
                      </>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Real-time Pre-Submission Validation Health Summary Bar */}
      <div className="pt-2">
        {activeErrorsCount > 0 ? (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/70 text-xs text-rose-900 dark:text-rose-200 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>
                  {activeErrorsCount === 1
                    ? '۱ فیلد نیاز به بررسی و اصلاح دارد:'
                    : `${activeErrorsCount} فیلد نیاز به بررسی و اصلاح دارند:`}
                </span>
              </div>
              <span className="text-[11px] bg-rose-200/80 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded-full font-bold">
                خطای اعتبارسنجی زنده
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
              پیش از ثبت نهایی، لطفاً مقادیر نامعتبر یا فیلدهای اجباری بالا را اصلاح فرمایید تا فرم ارسال گردد.
            </p>
          </div>
        ) : progressPercent === 100 || (requiredVisibleFields.length > 0 && completedRequiredCount === requiredVisibleFields.length) ? (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-bold">
                تمامی فیلدهای الزامی با موفقیت تکمیل و اعتبارسنجی شدند.
              </span>
            </div>
            <span className="text-[11px] bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
              آماده ثبت نهایی
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                اعتبارسنجی بلادرنگ فعال است — اطلاعات با وارد کردن هر کاراکتر بررسی می‌شوند.
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {completedRequiredCount} / {requiredVisibleFields.length} الزامی
            </span>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
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
