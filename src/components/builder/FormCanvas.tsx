import React, { useState } from 'react';
import { Plus, Sparkles, Layers, ArrowDown, Eye, CheckCircle2 } from 'lucide-react';
import { Form, FormField, FormFieldType } from '../../types/form';
import { FieldPreviewItem } from './FieldPreviewItem';

interface FormCanvasProps {
  form: Form;
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  onUpdateFields: (fields: FormField[]) => void;
  onDropNewField: (type: FormFieldType, targetIndex?: number) => void;
}

export const FormCanvas: React.FC<FormCanvasProps> = ({
  form,
  selectedFieldId,
  onSelectField,
  onUpdateFields,
  onDropNewField,
}) => {
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Field Reordering Handlers
  const handleItemDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fieldType = e.dataTransfer.getData('text/plain') as FormFieldType;

    if (fieldType && !draggedItemIndex && draggedItemIndex !== 0) {
      // It's a new field dragged from the palette!
      const targetIdx = dragOverIndex !== null ? dragOverIndex : form.fields.length;
      onDropNewField(fieldType, targetIdx);
    } else if (draggedItemIndex !== null && dragOverIndex !== null && draggedItemIndex !== dragOverIndex) {
      // Reordering existing fields
      const updated = [...form.fields];
      const [movedItem] = updated.splice(draggedItemIndex, 1);
      updated.splice(dragOverIndex, 0, movedItem);

      // Re-assign order numbers
      const reordered = updated.map((f, idx) => ({ ...f, order: idx + 1 }));
      onUpdateFields(reordered);
    }

    setDraggedItemIndex(null);
    setDragOverIndex(null);
  };

  // Duplicate Field
  const handleDuplicateField = (field: FormField, e: React.MouseEvent) => {
    e.stopPropagation();
    const newField: FormField = {
      ...JSON.parse(JSON.stringify(field)),
      id: `f-${Date.now()}`,
      name: `${field.name}_copy`,
      label: `${field.label} (کپی)`,
      order: field.order + 1,
    };

    const targetIdx = form.fields.findIndex((f) => f.id === field.id);
    const updated = [...form.fields];
    updated.splice(targetIdx + 1, 0, newField);
    onUpdateFields(updated.map((f, i) => ({ ...f, order: i + 1 })));
    onSelectField(newField.id);
  };

  // Delete Field
  const handleDeleteField = (fieldId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = form.fields.filter((f) => f.id !== fieldId);
    onUpdateFields(updated.map((f, i) => ({ ...f, order: i + 1 })));
    if (selectedFieldId === fieldId) {
      onSelectField(updated[0]?.id || '');
    }
  };

  // Move Up
  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === 0) return;
    const updated = [...form.fields];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onUpdateFields(updated.map((f, i) => ({ ...f, order: i + 1 })));
  };

  // Move Down
  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index >= form.fields.length - 1) return;
    const updated = [...form.fields];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onUpdateFields(updated.map((f, i) => ({ ...f, order: i + 1 })));
  };

  return (
    <div
      onDragOver={handleCanvasDragOver}
      onDrop={handleCanvasDrop}
      className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col h-[750px] overflow-hidden"
    >
      {/* Top Canvas Header Banner */}
      <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 dark:text-white text-base">{form.title}</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
              بخش دوم - میز کار طراحی (Canvas)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            تعداد فیلدها: {form.fields.length} مورد | برای ویرایش تنظیمات روی هر فیلد کلیک کنید
          </p>
        </div>

        <div className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:block">
          فیلدها را بکشید و رها کنید (Drag & Drop)
        </div>
      </div>

      {/* Canvas Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-100/40 dark:bg-slate-950/60">
        {form.fields.length === 0 ? (
          /* Empty Canvas State */
          <div className="h-full min-h-[300px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center text-center bg-white/70 dark:bg-slate-900/60">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Layers className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">این فرم هنوز فیلدی ندارد</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
              از پالت سمت راست فیلدهای مورد نظر خود (متن، شماره موبایل، دانشجو و...) را به این قسمت بکشید یا کلیک کنید.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onDropNewField('text')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                + افزودن فیلد متنی
              </button>
              <button
                type="button"
                onClick={() => onDropNewField('phone')}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                + افزودن شماره موبایل
              </button>
              <button
                type="button"
                onClick={() => onDropNewField('student_id')}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                + افزودن شماره دانشجویی
              </button>
            </div>
          </div>
        ) : (
          /* List of fields */
          <div className="space-y-3 max-w-3xl mx-auto">
            {form.fields.map((field, index) => (
              <React.Fragment key={field.id}>
                {dragOverIndex === index && (
                  <div className="h-1 bg-indigo-500 rounded-full my-1 animate-pulse" />
                )}
                <FieldPreviewItem
                  field={field}
                  isSelected={selectedFieldId === field.id}
                  index={index}
                  totalFields={form.fields.length}
                  onSelect={() => onSelectField(field.id)}
                  onDuplicate={(e) => handleDuplicateField(field, e)}
                  onDelete={(e) => handleDeleteField(field.id, e)}
                  onMoveUp={(e) => handleMoveUp(index, e)}
                  onMoveDown={(e) => handleMoveDown(index, e)}
                  onDragStart={() => handleItemDragStart(index)}
                  onDragOver={(e) => handleItemDragOver(e, index)}
                  onDrop={handleCanvasDrop}
                />
              </React.Fragment>
            ))}

            {/* Bottom Drop Zone Indicator */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverIndex(form.fields.length);
              }}
              className="py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl text-center text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2 cursor-pointer bg-white/40 dark:bg-slate-900/40"
              onClick={() => onDropNewField('text')}
            >
              <Plus className="w-4 h-4" />
              <span>فیلد جدید را اینجا رها کنید یا کلیک کنید</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
