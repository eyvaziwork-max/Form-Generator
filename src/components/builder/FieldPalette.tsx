import React, { useState } from 'react';
import {
  Type,
  User,
  Phone,
  GraduationCap,
  Mail,
  Hash,
  AlignLeft,
  Lock,
  ChevronDownSquare,
  Disc,
  CheckSquare,
  ListChecks,
  Calendar,
  Clock,
  CalendarClock,
  UploadCloud,
  Image,
  CreditCard,
  Star,
  EyeOff,
  FileText,
  Minus,
  Search,
  Plus,
} from 'lucide-react';
import { FormFieldType } from '../../types/form';
import { AVAILABLE_FIELD_TYPES, FIELD_CATEGORIES } from '../../constants/fieldTypes';

interface FieldPaletteProps {
  onAddField: (type: FormFieldType) => void;
  onDragStart: (e: React.DragEvent, type: FormFieldType) => void;
}

export const FieldPalette: React.FC<FieldPaletteProps> = ({ onAddField, onDragStart }) => {
  const [search, setSearch] = useState('');

  // Map icon strings to Lucide components
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Type':
        return <Type className="w-4 h-4" />;
      case 'User':
        return <User className="w-4 h-4" />;
      case 'Phone':
        return <Phone className="w-4 h-4" />;
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4" />;
      case 'Mail':
        return <Mail className="w-4 h-4" />;
      case 'Hash':
        return <Hash className="w-4 h-4" />;
      case 'AlignLeft':
        return <AlignLeft className="w-4 h-4" />;
      case 'Lock':
        return <Lock className="w-4 h-4" />;
      case 'ChevronDownSquare':
        return <ChevronDownSquare className="w-4 h-4" />;
      case 'Disc':
        return <Disc className="w-4 h-4" />;
      case 'CheckSquare':
        return <CheckSquare className="w-4 h-4" />;
      case 'ListChecks':
        return <ListChecks className="w-4 h-4" />;
      case 'Calendar':
        return <Calendar className="w-4 h-4" />;
      case 'Clock':
        return <Clock className="w-4 h-4" />;
      case 'CalendarClock':
        return <CalendarClock className="w-4 h-4" />;
      case 'UploadCloud':
        return <UploadCloud className="w-4 h-4" />;
      case 'Image':
        return <Image className="w-4 h-4" />;
      case 'CreditCard':
        return <CreditCard className="w-4 h-4" />;
      case 'Star':
        return <Star className="w-4 h-4" />;
      case 'EyeOff':
        return <EyeOff className="w-4 h-4" />;
      case 'FileText':
        return <FileText className="w-4 h-4" />;
      case 'Minus':
        return <Minus className="w-4 h-4" />;
      default:
        return <Type className="w-4 h-4" />;
    }
  };

  const filteredFields = AVAILABLE_FIELD_TYPES.filter((f) =>
    f.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full lg:w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 flex flex-col h-[750px] shrink-0">
      {/* Title & Search */}
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center justify-between">
          <span>انواع فیلدها</span>
          <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">بخش اول - پالت فیلد</span>
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          فیلد را بکشید یا برای افزودن روی آن کلیک کنید
        </p>

        <div className="relative mt-2.5">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="جستجوی فیلد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-8 pl-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Field List by Category */}
      <div className="flex-1 overflow-y-auto pt-3 space-y-4 pr-1">
        {FIELD_CATEGORIES.map((category) => {
          const categoryFields = filteredFields.filter((f) => f.category === category.id);
          if (categoryFields.length === 0) return null;

          return (
            <div key={category.id} className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 block px-1">
                {category.title}
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {categoryFields.map((field) => (
                  <div
                    key={field.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, field.type)}
                    onClick={() => onAddField(field.type)}
                    className="group flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-grab active:cursor-grabbing shadow-2xs hover:shadow-xs"
                    title="کلیک یا درگ برای افزودن به فرم"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors">
                        {getIcon(field.icon)}
                      </div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-900 dark:group-hover:text-indigo-300 transition-colors">
                        {field.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
                      title="افزودن مستقیم"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
