import React from 'react';
import {
  GripVertical,
  Edit3,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Star,
  UploadCloud,
  CheckCircle,
  EyeOff,
  AlertCircle,
  Check,
} from 'lucide-react';
import { FormField } from '../../types/form';

interface FieldPreviewItemProps {
  field: FormField;
  isSelected: boolean;
  index: number;
  totalFields: number;
  onSelect: () => void;
  onDuplicate: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onMoveUp: (e: React.MouseEvent) => void;
  onMoveDown: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const FieldPreviewItem: React.FC<FieldPreviewItemProps> = ({
  field,
  isSelected,
  index,
  totalFields,
  onSelect,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  // Render dummy control preview according to field type
  const renderControlPreview = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            disabled
            rows={2}
            placeholder={field.placeholder || 'متن چندخطی...'}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-xl px-3 py-2 text-xs cursor-not-allowed resize-none"
          />
        );

      case 'select':
        return (
          <select
            disabled
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-xl px-3 py-2 text-xs cursor-not-allowed"
          >
            <option>
              {field.placeholder || '-- لطفاً یک گزینه را انتخاب کنید --'}
            </option>
            {field.options?.map((opt) => (
              <option key={opt.id} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2 mt-1">
            {(field.options && field.options.length > 0
              ? field.options
              : [
                  { id: '1', label: 'گزینه اول', value: '1' },
                  { id: '2', label: 'گزینه دوم', value: '2' },
                ]
            ).map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                <input
                  type="radio"
                  disabled
                  name={`preview-${field.id}`}
                  className="text-indigo-600 focus:ring-0"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 mt-1 cursor-pointer">
            <input
              type="checkbox"
              disabled
              className="rounded text-indigo-600 focus:ring-0"
            />
            <span className="font-medium">{field.label}</span>
          </label>
        );

      case 'multiselect':
        return (
          <div className="space-y-2 mt-1">
            {(field.options && field.options.length > 0
              ? field.options
              : [
                  { id: '1', label: 'مورد اول', value: '1' },
                  { id: '2', label: 'مورد دوم', value: '2' },
                ]
            ).map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                <input
                  type="checkbox"
                  disabled
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'star_rating':
        return (
          <div className="flex items-center gap-1.5 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-5 h-5 text-amber-400 fill-amber-300 cursor-pointer"
              />
            ))}
            <span className="text-xs text-slate-400 dark:text-slate-500 mr-2">
              (امتیاز از ۱ تا ۵ ستاره)
            </span>
          </div>
        );

      case 'file':
      case 'image':
        return (
          <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center gap-1.5">
            <UploadCloud className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              کلیک برای انتخاب فایل یا کشیدن به این قسمت
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {field.description || 'حداکثر حجم مجاز: ۵ مگابایت'}
            </span>
          </div>
        );

      case 'divider':
        return (
          <div className="my-2 border-t-2 border-slate-200 dark:border-slate-800 relative flex items-center justify-center">
            <span className="bg-white dark:bg-slate-900 px-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              خط جداکننده
            </span>
          </div>
        );

      case 'static_text':
        return (
          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
            {field.description ||
              'این بخش شامل توضیحات متنی یا راهنما برای کاربر است.'}
          </div>
        );

      case 'hidden':
        return (
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <EyeOff className="w-4 h-4 text-slate-400" />
            <span>فیلد مخفی سیستمی ({field.name}) - در فرم نهایی دیده نمی‌شود</span>
          </div>
        );

      default:
        // Text, fullname, phone, student_id, email, number, date, time, password
        return (
          <div className="relative">
            <input
              type={
                field.type === 'password'
                  ? 'password'
                  : field.type === 'number'
                  ? 'number'
                  : 'text'
              }
              disabled
              placeholder={field.placeholder || 'مقدار را وارد کنید...'}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-xl px-3 py-2 text-xs cursor-not-allowed"
            />
            {field.type === 'phone' && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                +۹۸
              </span>
            )}
          </div>
        );
    }
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onSelect}
      className={`relative group bg-white dark:bg-slate-900 rounded-2xl border p-4.5 transition-all cursor-pointer ${
        isSelected
          ? 'border-indigo-600 dark:border-indigo-500 ring-4 ring-indigo-500/10 dark:ring-indigo-500/20 shadow-md'
          : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xs'
      }`}
    >
      {/* Top Field Bar: Drag Handle, Label & Technical Name, and Actions */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <div
            className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            title="برای جابه‌جایی درگ کنید"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {field.label}
              </span>
              {field.required && (
                <span className="text-rose-500 font-bold" title="فیلد اجباری">*</span>
              )}
              {field.required && (
                <span className="text-[10px] px-1.5 py-0.2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded font-semibold border border-rose-100 dark:border-rose-900">
                  اجباری
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono block">
              نام فنی: {field.name}
            </span>
          </div>
        </div>

        {/* Floating/Integrated Field Toolbar */}
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 group-hover:bg-slate-100/90 dark:group-hover:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors">
          {/* Move Up */}
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            title="انتقال به بالا"
            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 rounded transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {/* Move Down */}
          <button
            type="button"
            disabled={index === totalFields - 1}
            onClick={onMoveDown}
            title="انتقال به پایین"
            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 rounded transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3 bg-slate-300 dark:bg-slate-700 mx-0.5" />

          {/* Edit (Select) */}
          <button
            type="button"
            onClick={onSelect}
            title="ویرایش تنظیمات فیلد"
            className={`p-1 rounded transition-colors ${
              isSelected
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={onDuplicate}
            title="کپی کردن فیلد"
            className="p-1 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onDelete}
            title="حذف فیلد"
            className="p-1 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Control Input Element Preview */}
      <div className="mt-2">{renderControlPreview()}</div>

      {/* Description or Hint */}
      {field.description && field.type !== 'static_text' && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">{field.description}</p>
      )}

      {/* Conditional logic badge */}
      {field.conditionalLogic?.enabled && (
        <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded-md border border-violet-100 dark:border-violet-900 font-medium">
          <span>دارای شرط نمایش</span>
        </div>
      )}
    </div>
  );
};
