import React, { useState } from 'react';
import {
  Plus,
  Hammer,
  FileSpreadsheet,
  Copy,
  Trash2,
  Share2,
  Check,
  Eye,
  Settings,
  Calendar,
  Layers,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  X,
  RotateCcw,
  Filter,
  Mail,
} from 'lucide-react';
import { Form } from '../../types/form';
import { formatToPersianDate } from '../../services/db';

interface FormListViewProps {
  forms: Form[];
  onOpenCreateModal: () => void;
  onEditBuilder: (formId: string) => void;
  onViewResponses: (formId: string) => void;
  onOpenSettings: (form: Form) => void;
  onOpenPreview: (form: Form) => void;
  onDuplicateForm: (formId: string) => void;
  onDeleteForm: (form: Form) => void;
  onToggleStatus: (formId: string) => void;
  onOpenPublicForm: (formId: string) => void;
  onCopyLink: (formId: string) => void;
}

export const FormListView: React.FC<FormListViewProps> = ({
  forms,
  onOpenCreateModal,
  onEditBuilder,
  onViewResponses,
  onOpenSettings,
  onOpenPreview,
  onDuplicateForm,
  onDeleteForm,
  onToggleStatus,
  onOpenPublicForm,
  onCopyLink,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Helper to normalize Persian text for resilient search
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[یي]/g, 'ی')
      .replace(/[کك]/g, 'ک')
      .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728))
      .trim();
  };

  const filteredForms = forms.filter((f) => {
    const term = normalizeText(searchTerm);
    const titleNorm = normalizeText(f.title);
    const descNorm = normalizeText(f.description || '');

    // Check if the search term matches title or description
    const matchesTitleOrDesc =
      !term || titleNorm.includes(term) || descNorm.includes(term);

    // Also allow searching status directly in the search input
    const matchesStatusKeyword =
      term &&
      ((('فعال'.includes(term) || 'active'.includes(term)) && f.status === 'active') ||
        (('غیرفعال'.includes(term) ||
          'غیر فعال'.includes(term) ||
          'inactive'.includes(term)) &&
          f.status === 'inactive'));

    const matchesSearch = matchesTitleOrDesc || matchesStatusKeyword;

    // Filter by selected status tab
    const matchesStatus =
      statusFilter === 'all' ? true : f.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCount = forms.filter((f) => f.status === 'active').length;
  const inactiveCount = forms.filter((f) => f.status === 'inactive').length;
  const isFilteringActive = searchTerm.trim().length > 0 || statusFilter !== 'all';

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">مدیریت فرم‌ها</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            ایجاد، ویرایش، جستجو و فیلتر بر اساس عنوان و وضعیت، و استخراج گزارش پاسخ‌ها
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-950 transition-all text-sm shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          ساخت فرم جدید
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input with clear button */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="جستجو در عنوان، توضیحات یا وضعیت فرم‌ها (فعال/غیرفعال)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="پاک کردن متن جستجو"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filters and Counter */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>همه</span>
              <span className="text-[11px] px-1.5 py-0.2 bg-slate-200/70 dark:bg-slate-600 rounded-full font-mono">
                {forms.length}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('active')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>فعال</span>
              <span className="text-[11px] px-1.5 py-0.2 bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-full font-mono">
                {activeCount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('inactive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === 'inactive'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>غیرفعال</span>
              <span className="text-[11px] px-1.5 py-0.2 bg-slate-200/70 dark:bg-slate-600 rounded-full font-mono">
                {inactiveCount}
              </span>
            </button>
          </div>

          {/* Reset button if filter is active */}
          {isFilteringActive && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="بازنشانی فیلترها و نمایش همه فرم‌ها"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">بازنشانی</span>
            </button>
          )}
        </div>
      </div>

      {/* Results summary bar when filtered */}
      {isFilteringActive && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>
              نمایش <strong className="text-slate-800 dark:text-slate-200">{filteredForms.length}</strong> فرم از کل{' '}
              <strong className="text-slate-800 dark:text-slate-200">{forms.length}</strong> فرم
            </span>
            {searchTerm && (
              <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900">
                عبارت: «{searchTerm}»
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                وضعیت: {statusFilter === 'active' ? 'فعال' : 'غیرفعال'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Forms Cards Grid */}
      {filteredForms.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {forms.length === 0 ? 'هنوز فرمی ایجاد نشده است' : 'فرمی با این مشخصات یافت نشد'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
            {forms.length === 0
              ? 'با کلیک روی دکمه زیر می‌توانید اولین فرم خود را ایجاد کنید.'
              : `هیچ فرمی مطابق با جستجوی ${
                  searchTerm ? `«${searchTerm}»` : ''
                } ${statusFilter !== 'all' ? `در وضعیت «${statusFilter === 'active' ? 'فعال' : 'غیرفعال'}»` : ''} پیدا نشد.`}
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            {forms.length > 0 && isFilteringActive && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                پاکسازی فیلترها و مشاهده همه
              </button>
            )}
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-indigo-200 dark:shadow-indigo-950 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              ایجاد فرم جدید
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <div
              key={form.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
            >
              {/* Top Accent Strip */}
              <div
                className="h-2 w-full"
                style={{ backgroundColor: form.settings?.themeColor || '#4f46e5' }}
              />

              <div className="p-5 flex-1 flex flex-col">
                {/* Header row: Status badge & Toggle */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <button
                    onClick={() => onToggleStatus(form.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      form.status === 'active'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    title="کلیک برای تغییر وضعیت فعال/غیرفعال"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        form.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`}
                    />
                    {form.status === 'active' ? 'فعال (در حال دریافت)' : 'غیرفعال'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenSettings(form)}
                      title="تنظیمات فرم"
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onCopyLink(form.id)}
                      title="کپی لینک اختصاصی فرم"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Form Title & Description */}
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {form.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed flex-1">
                  {form.description || 'بدون توضیحات تکمیلی'}
                </p>

                {/* Form Meta Stats */}
                <div className="grid grid-cols-2 gap-2 my-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">تعداد فیلدها</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {form.fields.length} فیلد ورودی
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">تعداد پاسخ‌ها</span>
                    <span className="font-bold text-violet-700 dark:text-violet-400 mt-0.5 block">
                      {form.responseCount} پاسخ ثبت‌شده
                    </span>
                  </div>
                </div>

                {/* Timestamps & Badges */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mb-4 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    ایجاد: {formatToPersianDate(form.createdAt)}
                  </span>

                  {form.settings?.emailNotificationEnabled && form.settings?.notificationEmail && (
                    <span
                      className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium"
                      title={`ارسال اعلان خودکار به ${form.settings.notificationEmail}`}
                    >
                      <Mail className="w-3 h-3" />
                      اعلان ایمیل فعال
                    </span>
                  )}
                </div>

                {/* Action Buttons Toolbar */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onEditBuilder(form.id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold transition-colors"
                  >
                    <Hammer className="w-3.5 h-3.5" />
                    طراحی فرم
                  </button>

                  <button
                    onClick={() => onViewResponses(form.id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-xs font-bold transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    پاسخ‌ها ({form.responseCount})
                  </button>
                </div>

                {/* Secondary Actions */}
                <div className="flex items-center justify-between gap-1 mt-2 pt-2 border-t border-slate-50 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenPreview(form)}
                      className="flex items-center gap-1 px-2 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="پیش‌نمایش فرم در دستگاه‌های مختلف"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      پیش‌نمایش
                    </button>
                    <button
                      onClick={() => onOpenPublicForm(form.id)}
                      className="flex items-center gap-1 px-2 py-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                      title="مشاهده مستقیم فرم نهایی"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      لینک عمومی
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDuplicateForm(form.id)}
                      title="کپی کردن و داپلیکیت این فرم"
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteForm(form)}
                      title="حذف فرم"
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
