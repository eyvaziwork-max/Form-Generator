import React, { useState, useMemo } from 'react';
import {
  Building2,
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronLeft,
  Search,
  Users,
  FileCheck2,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Move,
  CornerDownLeft,
  X,
  ShieldAlert,
  QrCode,
  Link2,
} from 'lucide-react';
import { OrganizationalUnit } from '../../types/survey';

interface OrganizationUnitsViewProps {
  units: OrganizationalUnit[];
  onRefresh: () => void;
  onCreateUnit: (data: Partial<OrganizationalUnit>) => Promise<any>;
  onUpdateUnit: (id: string, data: Partial<OrganizationalUnit>) => Promise<any>;
  onDeleteUnit: (id: string, transferChildrenToId?: string | null) => Promise<{ success: boolean; message: string }>;
  onOpenShareModal?: (unit: OrganizationalUnit) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const OrganizationUnitsView: React.FC<OrganizationUnitsViewProps> = ({
  units,
  onRefresh,
  onCreateUnit,
  onUpdateUnit,
  onDeleteUnit,
  onOpenShareModal,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(units.map((u) => u.id)));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<OrganizationalUnit | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);

  // Safe delete dialog
  const [deleteTargetUnit, setDeleteTargetUnit] = useState<OrganizationalUnit | null>(null);
  const [transferTargetId, setTransferTargetId] = useState<string>('null');

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [managerName, setManagerName] = useState('');
  const [staffCount, setStaffCount] = useState<number>(20);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Build tree from Adjacency list
  const unitTree = useMemo(() => {
    const map = new Map<string, OrganizationalUnit & { children: any[] }>();
    units.forEach((u) => map.set(u.id, { ...u, children: [] }));

    const roots: (OrganizationalUnit & { children: any[] })[] = [];

    units.forEach((u) => {
      const node = map.get(u.id)!;
      if (u.parentId && map.has(u.parentId)) {
        map.get(u.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [units]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpenCreateModal = (parent?: string | null) => {
    setEditingUnit(null);
    setName('');
    setCode(`UNIT-${Math.floor(100 + Math.random() * 900)}`);
    setParentId(parent ?? null);
    setManagerName('');
    setStaffCount(25);
    setDescription('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (unit: OrganizationalUnit) => {
    setEditingUnit(unit);
    setName(unit.name);
    setCode(unit.code);
    setParentId(unit.parentId);
    setManagerName(unit.managerName || '');
    setStaffCount(unit.staffCount);
    setDescription(unit.description || '');
    setIsActive(unit.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('لطفاً عنوان واحد سازمانی را وارد نمایید.', 'error');
      return;
    }

    if (editingUnit) {
      if (parentId === editingUnit.id) {
        onShowToast('یک واحد نمی‌تواند زیرمجموعه خودش باشد.', 'error');
        return;
      }
      const res = await onUpdateUnit(editingUnit.id, {
        name,
        code,
        parentId,
        managerName,
        staffCount,
        description,
        isActive,
      });
      if (res) {
        onShowToast('واحد سازمانی با موفقیت به‌روزرسانی شد.', 'success');
        setIsModalOpen(false);
        onRefresh();
      }
    } else {
      const res = await onCreateUnit({
        name,
        code,
        parentId,
        managerName,
        staffCount,
        description,
        isActive,
      });
      if (res) {
        onShowToast('واحد سازمانی جدید ایجاد گردید.', 'success');
        setIsModalOpen(false);
        onRefresh();
      }
    }
  };

  const handleDeletePrompt = (unit: OrganizationalUnit) => {
    setDeleteTargetUnit(unit);
    const possibleParents = units.filter((u) => u.id !== unit.id && u.parentId !== unit.id);
    setTransferTargetId(possibleParents[0]?.id || 'null');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetUnit) return;
    const transferId = transferTargetId === 'null' ? null : transferTargetId;
    const res = await onDeleteUnit(deleteTargetUnit.id, transferId);
    if (res.success) {
      onShowToast(res.message, 'success');
      setDeleteTargetUnit(null);
      onRefresh();
    } else {
      onShowToast(res.message, 'error');
    }
  };

  // Filter matching nodes
  const isMatchSearch = (unit: OrganizationalUnit) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      unit.name.toLowerCase().includes(q) ||
      unit.code.toLowerCase().includes(q) ||
      (unit.managerName && unit.managerName.toLowerCase().includes(q))
    );
  };

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: OrganizationalUnit & { children: any[] }, depth: number = 0) => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children.length > 0;
    const isMatched = isMatchSearch(node);

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
            isMatched
              ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-xs'
              : 'opacity-50 bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50'
          }`}
          style={{ marginRight: `${depth * 24}px` }}
        >
          {/* Node Info & Expand Toggle */}
          <div className="flex items-center gap-2.5 min-w-0">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(node.id)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                )}
              </button>
            ) : (
              <div className="w-6 flex items-center justify-center text-slate-300 dark:text-slate-700">
                •
              </div>
            )}

            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                depth === 0
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : depth === 1
                  ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {depth === 0 ? <Building2 className="w-5 h-5" /> : <FolderTree className="w-4 h-4" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {node.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border border-slate-200/60 dark:border-slate-700/60">
                  {node.code}
                </span>
                {!node.isActive && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 font-bold">
                    غیرفعال
                  </span>
                )}
              </div>

              {node.managerName && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  مسئول: <strong className="font-semibold text-slate-700 dark:text-slate-300">{node.managerName}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Node Metrics & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Staff Count Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs border border-slate-200/60 dark:border-slate-700/60">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>{node.staffCount} پرسنل</span>
            </div>

            {/* Responses Count Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-200/60 dark:border-emerald-800/60">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>{node.responseCount || 0} پاسخ ثبت‌شده</span>
            </div>

            {/* Link & QR Code button */}
            <button
              onClick={() => onOpenShareModal?.(node)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200/80 dark:border-indigo-800 transition-colors cursor-pointer"
              title="تولید لینک اختصاصی، بارکد QR و پوستر چاپی این واحد سازمانی"
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">لینک و QR</span>
            </button>

            {/* Add Sub-unit button */}
            <button
              onClick={() => handleOpenCreateModal(node.id)}
              className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
              title="افزودن زیرشاخه برای این واحد"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Edit button */}
            <button
              onClick={() => handleOpenEditModal(node)}
              className="p-1.5 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 transition-colors cursor-pointer"
              title="ویرایش مشخصات واحد"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Delete button (except root organization) */}
            {depth > 0 && (
              <button
                onClick={() => handleDeletePrompt(node)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                title="حذف واحد سازمانی"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Child branches */}
        {hasChildren && isExpanded && (
          <div className="space-y-1 mt-1 border-r-2 border-indigo-100 dark:border-indigo-950/80 mr-4 pr-1">
            {node.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const totalStaffCount = units.reduce((acc, u) => acc + (u.staffCount || 0), 0);
  const totalResponses = units.reduce((acc, u) => acc + (u.responseCount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                ساختار سلسله‌مراتبی و واحدهای سازمانی
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                مدیریت چندسطحی بخش‌ها، بیمارستان، معاونت‌ها و زیرواحدهای بالینی جهت تخصیص و تفکیک گزارش‌های نظرسنجی
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenCreateModal(null)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تعریف واحد اصلی جدید</span>
          </button>
        </div>
      </div>

      {/* KPI Cards for Organization Hierarchy */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">کل واحدهای تعریف‌شده</span>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{units.length} واحد</div>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">سلسله‌مراتبی پویا</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">مجموع کادر و پرسنل</span>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{totalStaffCount} نفر</div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">جامعه هدف ارزیابی</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">بخش‌های پرستاری و بالینی</span>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
            {units.filter((u) => u.parentId === 'unit-nurse-01').length} بخش
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">ICU, CCU, اورژانس و...</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">پاسخ‌های ثبت‌شده در واحدها</span>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{totalResponses} رکورد</div>
          <span className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">تفکیک‌شده در درخت</span>
        </div>
      </div>

      {/* Search & Tree Controls Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="جستجو در نام، کد یا مدیر بخش..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setExpandedIds(new Set(units.map((u) => u.id)))}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            باز کردن همه شاخه‌ها
          </button>
          <button
            onClick={() => setExpandedIds(new Set(['unit-hosp-01']))}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            بستن شاخه‌ها
          </button>
        </div>
      </div>

      {/* Recursive Interactive Tree View */}
      <div className="space-y-3">
        {unitTree.map((rootNode) => renderTreeNode(rootNode, 0))}
      </div>

      {/* Create / Edit Unit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingUnit ? 'ویرایش مشخصات واحد سازمانی' : 'افزودن واحد یا زیرشاخه سازمانی جدید'}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    تعیین موقعیت در درخت، مدیر و تعداد پرسنل
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان واحد سازمانی *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: بخش مراقبت‌های ویژه (ICU)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    کد شناسایی یا فنی
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: ICU-01"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تعداد پرسنل واحد
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={staffCount}
                    onChange={(e) => setStaffCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  واحد والد (شاخه بالادست در درخت)
                </label>
                <select
                  value={parentId || 'null'}
                  onChange={(e) => setParentId(e.target.value === 'null' ? null : e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                >
                  <option value="null">-- بدون والد (شاخه اصلی / بیمارستان) --</option>
                  {units
                    .filter((u) => !editingUnit || u.id !== editingUnit.id)
                    .map((u) => (
                      <option key={u.id} value={u.id} className="dark:bg-slate-800">
                        {u.name} ({u.code})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نام مدیر / سرپرستار بخش
                </label>
                <input
                  type="text"
                  placeholder="مثال: خانم فاطمه سلیمانی (سرپرستار ICU)"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  شرح وظایف یا توضیحات واحد
                </label>
                <textarea
                  rows={2}
                  placeholder="توضیحات اختیاری درباره دامنه فعالیت این بخش..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded-md text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isActiveCheck" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  واحد سازمانی فعال است (امکان تخصیص نظرسنجی و ثبت پاسخ)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {editingUnit ? 'ذخیره تغییرات' : 'ایجاد واحد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safe Delete & Transfer Dialog */}
      {deleteTargetUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                حذف کنترل‌شده واحد «{deleteTargetUnit.name}»
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                جهت جلوگیری از حذف ناخواسته اطلاعات و پاسخ‌های ثبت‌شده، در صورت وجود زیرشاخه‌ها، می‌توانید آن‌ها را به شاخه دیگری منتقل فرمایید.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                انتقال زیرشاخه‌ها و نظرسنجی‌های مرتبط به:
              </label>
              <select
                value={transferTargetId}
                onChange={(e) => setTransferTargetId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
              >
                <option value="null">-- شاخه اصلی (سطح بالای بیمارستان) --</option>
                {units
                  .filter((u) => u.id !== deleteTargetUnit.id && u.parentId !== deleteTargetUnit.id)
                  .map((u) => (
                    <option key={u.id} value={u.id} className="dark:bg-slate-800">
                      {u.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setDeleteTargetUnit(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer"
              >
                تأیید و حذف ایمن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
