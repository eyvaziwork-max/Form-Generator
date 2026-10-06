import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  ListPlus,
  Trash2,
  Plus,
  ShieldAlert,
  GitBranch,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { FormField, Form, FieldOption, ConditionalRule } from '../../types/form';

interface FieldPropertiesProps {
  field: FormField | undefined;
  allFields: FormField[];
  onUpdateField: (updatedField: FormField) => void;
}

export const FieldProperties: React.FC<FieldPropertiesProps> = ({
  field,
  allFields,
  onUpdateField,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'validation' | 'options' | 'logic'>('general');

  if (!field) {
    return (
      <div className="w-full lg:w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 flex flex-col items-center justify-center text-center h-[750px] shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3">
          <Sliders className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">هیچ فیلدی انتخاب نشده است</h4>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[200px]">
          روی یکی از فیلدهای موجود در بخش Canvas کلیک کنید تا تنظیمات آن را مشاهده و ویرایش نمایید.
        </p>
      </div>
    );
  }

  const handleChange = (key: keyof FormField, value: any) => {
    onUpdateField({
      ...field,
      [key]: value,
    });
  };

  // Options Handlers (for select, radio, multiselect)
  const hasOptions =
    field.type === 'select' ||
    field.type === 'radio' ||
    field.type === 'multiselect' ||
    field.type === 'checkbox';

  const handleAddOption = () => {
    const currentOptions = field.options || [];
    const newOption: FieldOption = {
      id: `opt-${Date.now()}`,
      label: `گزینه ${currentOptions.length + 1}`,
      value: `option_${currentOptions.length + 1}`,
    };
    handleChange('options', [...currentOptions, newOption]);
  };

  const handleUpdateOption = (index: number, key: 'label' | 'value', value: string) => {
    const currentOptions = [...(field.options || [])];
    currentOptions[index] = {
      ...currentOptions[index],
      [key]: value,
    };
    handleChange('options', currentOptions);
  };

  const handleDeleteOption = (index: number) => {
    const currentOptions = [...(field.options || [])];
    currentOptions.splice(index, 1);
    handleChange('options', currentOptions);
  };

  // Conditional Logic Handlers
  const otherFields = allFields.filter((f) => f.id !== field.id && f.type !== 'static_text' && f.type !== 'divider');

  const handleToggleConditionalLogic = (enabled: boolean) => {
    const currentLogic = field.conditionalLogic || {
      enabled: false,
      action: 'show',
      rules: [],
    };
    handleChange('conditionalLogic', {
      ...currentLogic,
      enabled,
      rules:
        currentLogic.rules.length > 0
          ? currentLogic.rules
          : otherFields[0]
          ? [
              {
                fieldId: otherFields[0].id,
                operator: 'equals',
                value: 'yes',
              },
            ]
          : [],
    });
  };

  const handleUpdateRule = (index: number, key: keyof ConditionalRule, value: any) => {
    const rules = [...(field.conditionalLogic?.rules || [])];
    rules[index] = { ...rules[index], [key]: value };
    handleChange('conditionalLogic', {
      ...(field.conditionalLogic || { enabled: true, action: 'show', rules: [] }),
      rules,
    });
  };

  return (
    <div className="w-full lg:w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 flex flex-col h-[750px] shrink-0">
      {/* Properties Header */}
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-slate-900 dark:text-white text-sm">تنظیمات فیلد</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {field.type}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
          {field.label} ({field.name})
        </p>

        {/* Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold mt-3">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-1 text-center rounded-lg transition-all ${
              activeTab === 'general' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            عمومی
          </button>
          <button
            onClick={() => setActiveTab('validation')}
            className={`flex-1 py-1 text-center rounded-lg transition-all ${
              activeTab === 'validation' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            اعتبارسنجی
          </button>
          {hasOptions && (
            <button
              onClick={() => setActiveTab('options')}
              className={`flex-1 py-1 text-center rounded-lg transition-all ${
                activeTab === 'options' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              گزینه‌ها
            </button>
          )}
          <button
            onClick={() => setActiveTab('logic')}
            className={`flex-1 py-1 text-center rounded-lg transition-all ${
              activeTab === 'logic' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            شرط
          </button>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="flex-1 overflow-y-auto pt-3 pr-1 space-y-4">
        {activeTab === 'general' && (
          <div className="space-y-3.5">
            {/* Field Label */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                عنوان فیلد (Label) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => handleChange('label', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs focus:outline-hidden focus:border-indigo-500 font-bold"
              />
            </div>

            {/* Technical Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                نام فنی فیلد (Technical Name)
              </label>
              <input
                type="text"
                value={field.name}
                onChange={(e) => handleChange('name', e.target.value.replace(/\s+/g, '_'))}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs font-mono focus:outline-hidden focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                برای ذخیره در دیتابیس و خروجی اکسل (انگلیسی بدون فاصله)
              </span>
            </div>

            {/* Placeholder */}
            {field.type !== 'static_text' && field.type !== 'divider' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  متن راهنما (Placeholder)
                </label>
                <input
                  type="text"
                  value={field.placeholder || ''}
                  onChange={(e) => handleChange('placeholder', e.target.value)}
                  placeholder="متن کم‌رنگ داخل کادر..."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            )}

            {/* Description / Help text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                توضیحات و راهنما (Hint)
              </label>
              <textarea
                rows={2}
                value={field.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="توضیحاتی که زیر فیلد نمایش داده می‌شود..."
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500 leading-relaxed"
              />
            </div>

            {/* Default Value */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                مقدار پیش‌فرض (Default Value)
              </label>
              <input
                type="text"
                value={field.defaultValue !== undefined ? String(field.defaultValue) : ''}
                onChange={(e) => handleChange('defaultValue', e.target.value)}
                placeholder="مقدار از پیش پر شده"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            {/* Switches: Required and Active */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">فیلد الزامی (Required)</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">کاربر بدون تکمیل این فیلد نمی‌تواند ثبت کند</span>
                </div>
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => handleChange('required', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">فیلد فعال است</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">در صورت غیرفعال بودن مخفی می‌شود</span>
                </div>
                <input
                  type="checkbox"
                  checked={field.active}
                  onChange={(e) => handleChange('active', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                />
              </label>
            </div>

            {/* Custom CSS Class */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                کلاس CSS سفارشی (اختیاری)
              </label>
              <input
                type="text"
                value={field.cssClass || ''}
                onChange={(e) => handleChange('cssClass', e.target.value)}
                placeholder="مثلاً: col-span-2 font-mono"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs font-mono focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {activeTab === 'validation' && (
          <div className="space-y-3.5">
            {/* Length validation */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  حداقل طول کاراکتر
                </label>
                <input
                  type="number"
                  value={field.minLength !== undefined ? field.minLength : ''}
                  onChange={(e) =>
                    handleChange('minLength', e.target.value ? parseInt(e.target.value, 10) : undefined)
                  }
                  placeholder="مثال: ۲"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  حداکثر طول کاراکتر
                </label>
                <input
                  type="number"
                  value={field.maxLength !== undefined ? field.maxLength : ''}
                  onChange={(e) =>
                    handleChange('maxLength', e.target.value ? parseInt(e.target.value, 10) : undefined)
                  }
                  placeholder="مثال: ۱۰۰"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Numeric Min/Max */}
            {field.type === 'number' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    حداقل مقدار عددی
                  </label>
                  <input
                    type="number"
                    value={field.minValue !== undefined ? field.minValue : ''}
                    onChange={(e) =>
                      handleChange('minValue', e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    حداکثر مقدار عددی
                  </label>
                  <input
                    type="number"
                    value={field.maxValue !== undefined ? field.maxValue : ''}
                    onChange={(e) =>
                      handleChange('maxValue', e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs"
                  />
                </div>
              </div>
            )}

            {/* Regex Pattern */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الگوی Regex (عبارت باقاعده)
              </label>
              <input
                type="text"
                value={field.regexPattern || ''}
                onChange={(e) => handleChange('regexPattern', e.target.value)}
                placeholder="مثال: ^09[0-9]{9}$"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs font-mono focus:outline-hidden focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                برای اعتبارسنجی دقیق قالب ورودی
              </span>
            </div>

            {/* Custom Error Message */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                پیام خطای اختصاصی فارسی
              </label>
              <textarea
                rows={2}
                value={field.customErrorMessage || ''}
                onChange={(e) => handleChange('customErrorMessage', e.target.value)}
                placeholder="متنی که در صورت عدم تطابق به کاربر نمایش داده می‌شود..."
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500 leading-relaxed"
              />
            </div>
          </div>
        )}

        {activeTab === 'options' && hasOptions && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">لیست گزینه‌های فیلد</span>
              <button
                type="button"
                onClick={handleAddOption}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                افزودن گزینه
              </button>
            </div>

            {(!field.options || field.options.length === 0) ? (
              <div className="p-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center text-xs text-slate-400 dark:text-slate-500">
                هیچ گزینه‌ای تعریف نشده است. روی «افزودن گزینه» کلیک کنید.
              </div>
            ) : (
              <div className="space-y-2">
                {field.options.map((opt, idx) => (
                  <div
                    key={opt.id || idx}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">گزینه #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteOption(idx)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">عنوان (Label)</span>
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => handleUpdateOption(idx, 'label', e.target.value)}
                          className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">مقدار (Value)</span>
                        <input
                          type="text"
                          value={opt.value}
                          onChange={(e) => handleUpdateOption(idx, 'value', e.target.value)}
                          className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'logic' && (
          <div className="space-y-3.5">
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">فعال‌سازی منطق شرطی</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  نمایش یا مخفی کردن این فیلد وابسته به پاسخ فیلد دیگر
                </span>
              </div>
              <input
                type="checkbox"
                checked={field.conditionalLogic?.enabled || false}
                onChange={(e) => handleToggleConditionalLogic(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
              />
            </label>

            {field.conditionalLogic?.enabled && (
              <div className="p-3 bg-violet-50/50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/60 rounded-xl space-y-3 text-xs">
                <div className="flex items-center gap-1.5 text-violet-900 dark:text-violet-300 font-bold text-xs">
                  <GitBranch className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  قانون شرطی:
                </div>

                <div>
                  <span className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">اقدام:</span>
                  <select
                    value={field.conditionalLogic.action}
                    onChange={(e) =>
                      handleChange('conditionalLogic', {
                        ...field.conditionalLogic,
                        action: e.target.value as 'show' | 'hide',
                      })
                    }
                    className="w-full p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs"
                  >
                    <option value="show">این فیلد را نمایش بده (Show)</option>
                    <option value="hide">این فیلد را مخفی کن (Hide)</option>
                  </select>
                </div>

                {field.conditionalLogic.rules.map((rule, rIdx) => (
                  <div key={rIdx} className="space-y-2 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-violet-100 dark:border-violet-900/40">
                    <div>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">اگر فیلد:</span>
                      <select
                        value={rule.fieldId}
                        onChange={(e) => handleUpdateRule(rIdx, 'fieldId', e.target.value)}
                        className="w-full p-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded text-xs"
                      >
                        {otherFields.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label} ({f.name})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">شرط:</span>
                        <select
                          value={rule.operator}
                          onChange={(e) => handleUpdateRule(rIdx, 'operator', e.target.value)}
                          className="w-full p-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded text-xs"
                        >
                          <option value="equals">برابر باشد با</option>
                          <option value="not_equals">مخالف باشد با</option>
                          <option value="contains">شامل باشد</option>
                          <option value="is_empty">خالی باشد</option>
                        </select>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">مقدار هدف:</span>
                        <input
                          type="text"
                          value={rule.value}
                          onChange={(e) => handleUpdateRule(rIdx, 'value', e.target.value)}
                          placeholder="مثلاً: yes یا ۴۰۱"
                          className="w-full p-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
