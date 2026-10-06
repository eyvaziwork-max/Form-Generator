import React, { useState } from 'react';
import {
  Search,
  Download,
  Printer,
  Trash2,
  Eye,
  Calendar,
  Layers,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Filter,
  BarChart3,
  Table,
  LayoutGrid,
} from 'lucide-react';
import { Form, FormResponse } from '../../types/form';
import { ResponseDetailModal } from './ResponseDetailModal';
import { ResponsesAnalytics } from './ResponsesAnalytics';

interface ResponsesViewProps {
  forms: Form[];
  selectedFormId: string;
  onSelectForm: (id: string) => void;
  responses: FormResponse[];
  onDeleteResponse: (responseId: string) => void;
  onExportCSV: (formId: string) => void;
  onClearAllResponses: (formId: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ResponsesView: React.FC<ResponsesViewProps> = ({
  forms,
  selectedFormId,
  onSelectForm,
  responses,
  onDeleteResponse,
  onExportCSV,
  onClearAllResponses,
  onShowToast,
}) => {
  const [viewMode, setViewMode] = useState<'combined' | 'analytics' | 'table'>('combined');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const currentForm = forms.find((f) => f.id === selectedFormId) || forms[0];
  const formResponses = responses.filter((r) => r.formId === currentForm?.id);

  // Search filter
  const filteredResponses = formResponses.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();

    // Match tracking code
    if (r.trackingCode.toLowerCase().includes(term)) return true;

    // Match any field value
    const matchValue = Object.values(r.values).some((v) =>
      String(v).toLowerCase().includes(term)
    );
    return matchValue;
  });

  // Sort
  const sortedResponses = [...filteredResponses].sort((a, b) => {
    if (sortOrder === 'desc') {
      return b.submittedAtTimestamp - a.submittedAtTimestamp;
    }
    return a.submittedAtTimestamp - b.submittedAtTimestamp;
  });

  // Pagination
  const totalPages = Math.ceil(sortedResponses.length / pageSize) || 1;
  const paginatedResponses = sortedResponses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Active fields for table header
  const tableFields =
    currentForm?.fields.filter(
      (f) => f.type !== 'static_text' && f.type !== 'divider' && f.type !== 'hidden'
    ) || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Form Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            پاسخ‌ها و گزارش‌های دریافتی
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            مشاهده رکوردها، تحلیل‌های آماری بصری (Recharts)، فیلتر و خروجی اکسل/CSV
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setViewMode('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'analytics'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>نمودارها</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>جدول داده‌ها</span>
            </button>

            <button
              onClick={() => setViewMode('combined')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'combined'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">نمای ترکیبی</span>
            </button>
          </div>

          {/* Form Selector Dropdown */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mr-1" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">فرم:</span>
            <select
              value={currentForm?.id}
              onChange={(e) => {
                onSelectForm(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer max-w-[180px] truncate"
            >
              {forms.map((f) => (
                <option key={f.id} value={f.id} className="dark:bg-slate-800 dark:text-slate-200">
                  {f.title} ({responses.filter((r) => r.formId === f.id).length})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Visual Analytics Section (Recharts) */}
      {(viewMode === 'analytics' || viewMode === 'combined') && currentForm && (
        <div className="animate-in fade-in duration-200">
          <ResponsesAnalytics form={currentForm} responses={formResponses} />
        </div>
      )}

      {/* Table Section */}
      {(viewMode === 'table' || viewMode === 'combined') && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {viewMode === 'combined' && (
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  جدول پاسخ‌های دریافتی ({formResponses.length} رکورد)
                </h3>
              </div>
            </div>
          )}

          {/* Control Toolbar: Search, Sort, Export CSV, Print */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="جستجو در نام، شماره دانشجویی، کد رهگیری..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pr-10 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              {/* Sort toggle */}
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>{sortOrder === 'desc' ? 'جدیدترین‌ها' : 'قدیمی‌ترین‌ها'}</span>
              </button>

              {/* Export CSV (UTF-8 BOM for Persian Excel) */}
              <button
                onClick={() => onExportCSV(currentForm.id)}
                disabled={formResponses.length === 0}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 disabled:opacity-50 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                title="دانلود فایل CSV سازگار با اکسل فارسی"
              >
                <Download className="w-3.5 h-3.5" />
                <span>خروجی اکسل (CSV)</span>
              </button>

              {/* Print Report */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>چاپ گزارش</span>
              </button>

              {/* Clear Responses */}
              {formResponses.length > 0 && (
                <button
                  onClick={() => onClearAllResponses(currentForm.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
                  title="پاکسازی تمام پاسخ‌های این فرم"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

      {/* Responses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {paginatedResponses.length === 0 ? (
          /* Empty Responses State */
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">هنوز پاسخی ثبت نشده است</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              کاربران هنوز این فرم را تکمیل نکرده‌اند یا با عبارت جستجوی فعلی رکوردی یافت نشد.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-bold">
                <tr>
                  <th className="py-3.5 px-5">کد رهگیری</th>
                  {tableFields.slice(0, 5).map((f) => (
                    <th key={f.id} className="py-3.5 px-5">
                      {f.label}
                    </th>
                  ))}
                  <th className="py-3.5 px-5">تاریخ و ساعت ثبت</th>
                  <th className="py-3.5 px-5 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedResponses.map((resp) => (
                  <tr
                    key={resp.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedResponse(resp)}
                  >
                    {/* Tracking Code */}
                    <td className="py-4 px-5">
                      <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800">
                        {resp.trackingCode}
                      </span>
                    </td>

                    {/* Dynamic Field Values */}
                    {tableFields.slice(0, 5).map((field) => {
                      const val = resp.values[field.name] ?? resp.values[field.id];
                      const displayVal =
                        val === undefined || val === null || val === ''
                          ? '—'
                          : Array.isArray(val)
                          ? val.join('، ')
                          : String(val);

                      return (
                        <td key={field.id} className="py-4 px-5">
                          <span className="font-medium text-slate-800 dark:text-slate-200 max-w-[180px] truncate block">
                            {displayVal}
                          </span>
                        </td>
                      );
                    })}

                    {/* Submitted Date */}
                    <td className="py-4 px-5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {resp.submittedAt}
                    </td>

                    {/* Operations */}
                    <td className="py-4 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedResponse(resp)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                          title="مشاهده جزئیات کامل پاسخ"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteResponse(resp.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          title="حذف این رکورد"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              نمایش صفحه {currentPage} از {totalPages} ({sortedResponses.length} رکورد)
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
              <span className="font-bold text-slate-700 dark:text-slate-200 px-2">{currentPage}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )}

  {/* Response Detail Modal */}
      <ResponseDetailModal
        isOpen={!!selectedResponse}
        response={selectedResponse}
        form={currentForm}
        onClose={() => setSelectedResponse(null)}
        onDelete={(id) => onDeleteResponse(id)}
      />
    </div>
  );
};
