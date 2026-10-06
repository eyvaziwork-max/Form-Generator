import React, { useState } from 'react';
import {
  Save,
  Eye,
  Settings,
  Share2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
} from 'lucide-react';
import { Form, FormField, FormFieldType } from '../../types/form';
import { FieldPalette } from './FieldPalette';
import { FormCanvas } from './FormCanvas';
import { FieldProperties } from './FieldProperties';
import { AVAILABLE_FIELD_TYPES } from '../../constants/fieldTypes';

interface FormBuilderViewProps {
  form: Form;
  onSaveForm: (updatedForm: Form) => void;
  onOpenPreview: (form: Form) => void;
  onOpenSettings: (form: Form) => void;
  onOpenShare?: (form: Form) => void;
  onBackToForms: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const FormBuilderView: React.FC<FormBuilderViewProps> = ({
  form,
  onSaveForm,
  onOpenPreview,
  onOpenSettings,
  onOpenShare,
  onBackToForms,
  onShowToast,
}) => {
  const [currentForm, setCurrentForm] = useState<Form>(form);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    form.fields[0]?.id || null
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [mobileTab, setMobileTab] = useState<'palette' | 'canvas' | 'properties'>('canvas');

  // Handle Drag Start from Palette
  const handlePaletteDragStart = (e: React.DragEvent, type: FormFieldType) => {
    e.dataTransfer.setData('text/plain', type);
  };

  // Add field handler
  const handleAddField = (type: FormFieldType, targetIndex?: number) => {
    const fieldDef = AVAILABLE_FIELD_TYPES.find((f) => f.type === type);
    const id = `f-${Date.now()}`;
    const count = currentForm.fields.length + 1;

    let defaultOptions = undefined;
    if (type === 'select' || type === 'radio' || type === 'multiselect') {
      defaultOptions = [
        { id: `opt-1-${Date.now()}`, label: 'مهندسی کامپیوتر', value: 'computer' },
        { id: `opt-2-${Date.now()}`, label: 'مهندسی برق', value: 'electrical' },
        { id: `opt-3-${Date.now()}`, label: 'مدیریت بازرگانی', value: 'management' },
        { id: `opt-4-${Date.now()}`, label: 'حسابداری', value: 'accounting' },
      ];
    }

    const newField: FormField = {
      id,
      type,
      label: fieldDef?.defaultLabel || `فیلد ${count}`,
      name: `${type}_${count}`,
      placeholder: fieldDef?.defaultPlaceholder || '',
      description: fieldDef?.defaultDescription || '',
      required: false,
      active: true,
      order: targetIndex !== undefined ? targetIndex + 1 : count,
      options: defaultOptions,
    };

    const updatedFields = [...currentForm.fields];
    if (targetIndex !== undefined) {
      updatedFields.splice(targetIndex, 0, newField);
    } else {
      updatedFields.push(newField);
    }

    // Re-index orders
    const reordered = updatedFields.map((f, idx) => ({ ...f, order: idx + 1 }));

    setCurrentForm({
      ...currentForm,
      fields: reordered,
    });
    setSelectedFieldId(id);
    setHasUnsavedChanges(true);
    setMobileTab('canvas');
  };

  // Update fields array
  const handleUpdateFields = (fields: FormField[]) => {
    setCurrentForm({
      ...currentForm,
      fields,
    });
    setHasUnsavedChanges(true);
  };

  // Update single field properties
  const handleUpdateSingleField = (updatedField: FormField) => {
    const updated = currentForm.fields.map((f) =>
      f.id === updatedField.id ? updatedField : f
    );
    setCurrentForm({
      ...currentForm,
      fields: updated,
    });
    setHasUnsavedChanges(true);
  };

  // Save changes
  const handleSave = () => {
    onSaveForm(currentForm);
    setHasUnsavedChanges(false);
    onShowToast('تغییرات فرم با موفقیت در دیتابیس ذخیره شد.', 'success');
  };

  const selectedField = currentForm.fields.find((f) => f.id === selectedFieldId);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Form Builder Control Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToForms}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="بازگشت به لیست فرم‌ها"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{currentForm.title}</h2>
              {hasUnsavedChanges ? (
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                  تغییرات ذخیره‌نشده
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  ذخیره شده
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              محیط سه‌بخشی طراحی فرم (Drag & Drop Form Builder)
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center gap-2">
          {/* Share & User Link button */}
          {onOpenShare && (
            <button
              onClick={() => onOpenShare(currentForm)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800/60 rounded-xl transition-colors cursor-pointer"
              title="دریافت لینک اختصاصی کاربر و کد امبد"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">لینک کاربر</span>
            </button>
          )}

          {/* Settings button */}
          <button
            onClick={() => onOpenSettings(currentForm)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">تنظیمات فرم</span>
          </button>

          {/* Preview button */}
          <button
            onClick={() => onOpenPreview(currentForm)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/60 rounded-xl transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>پیش‌نمایش زنده</span>
          </button>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-950 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>ذخیره فرم</span>
          </button>
        </div>
      </div>

      {/* Mobile 3-column Switcher tabs */}
      <div className="flex lg:hidden bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold border border-slate-300/40 dark:border-slate-700/60">
        <button
          onClick={() => setMobileTab('palette')}
          className={`flex-1 py-1.5 text-center rounded-lg transition-all ${
            mobileTab === 'palette'
              ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          ۱. پالت فیلدها
        </button>
        <button
          onClick={() => setMobileTab('canvas')}
          className={`flex-1 py-1.5 text-center rounded-lg transition-all ${
            mobileTab === 'canvas'
              ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          ۲. فرم و فیلدها ({currentForm.fields.length})
        </button>
        <button
          onClick={() => setMobileTab('properties')}
          className={`flex-1 py-1.5 text-center rounded-lg transition-all ${
            mobileTab === 'properties'
              ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          ۳. تنظیمات فیلد
        </button>
      </div>

      {/* The 3-Column Studio Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Section 1: Sidebar (Field Palette) */}
        <div className={`w-full lg:w-auto ${mobileTab === 'palette' ? 'block' : 'hidden lg:block'}`}>
          <FieldPalette
            onAddField={(type) => handleAddField(type)}
            onDragStart={handlePaletteDragStart}
          />
        </div>

        {/* Section 2: Canvas (Drag & Drop Workspace) */}
        <div className={`w-full lg:flex-1 ${mobileTab === 'canvas' ? 'block' : 'hidden lg:block'}`}>
          <FormCanvas
            form={currentForm}
            selectedFieldId={selectedFieldId}
            onSelectField={(id) => {
              setSelectedFieldId(id);
              if (window.innerWidth < 1024) {
                setMobileTab('properties');
              }
            }}
            onUpdateFields={handleUpdateFields}
            onDropNewField={(type, targetIdx) => handleAddField(type, targetIdx)}
          />
        </div>

        {/* Section 3: Properties Panel */}
        <div className={`w-full lg:w-auto ${mobileTab === 'properties' ? 'block' : 'hidden lg:block'}`}>
          <FieldProperties
            field={selectedField}
            allFields={currentForm.fields}
            onUpdateField={handleUpdateSingleField}
          />
        </div>
      </div>
    </div>
  );
};
