import React, { useState } from 'react';
import {
  ArrowRight,
  Plus,
  Save,
  Eye,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Settings,
  Layers,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ListOrdered,
  Star,
  Sliders,
  Split,
  MoveUp,
  MoveDown,
  X,
  FileCheck,
  ArrowLeftRight,
  FolderTree,
  Edit3,
  GripVertical,
  Kanban,
  LayoutList,
  GitBranch,
} from 'lucide-react';
import {
  Survey,
  SurveyTopicSection,
  SurveyQuestion,
  SurveyQuestionType,
  SurveyConditionalRule,
  OrganizationalUnit,
} from '../../types/survey';
import { TopicSectionModal } from './TopicSectionModal';
import { DeleteSectionModal } from './DeleteSectionModal';
import { ConditionalLogicModal } from './ConditionalLogicModal';

interface SurveyBuilderViewProps {
  survey: Survey;
  units: OrganizationalUnit[];
  onSaveSurvey: (updatedSurvey: Survey) => Promise<boolean>;
  onBackToSurveys: () => void;
  onPreviewSurvey: (survey: Survey) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const QUESTION_TYPE_LABELS: Record<SurveyQuestionType, { label: string; icon: string }> = {
  likert: { label: 'طیف لیکرت (۵ سطحی)', icon: '📊' },
  rating_5: { label: 'امتیازدهی ۱ تا ۵', icon: '🔢' },
  star_rating: { label: 'امتیاز ستاره‌ای (⭐ ۱ تا ۵)', icon: '⭐' },
  nps: { label: 'شاخص وفاداری و توصیه (NPS ۰ تا ۱۰)', icon: '🎯' },
  single_choice: { label: 'تک انتخابی (رادیویی)', icon: '🔘' },
  multi_choice: { label: 'چند انتخابی (چک‌باکس)', icon: '☑️' },
  yes_no: { label: 'بله / خیر (دودویی)', icon: '⚖️' },
  dropdown: { label: 'انتخاب از منوی کشویی', icon: '📋' },
  short_text: { label: 'متن تک‌خطی کوتاه', icon: '✍️' },
  long_text: { label: 'پاسخ تشریحی بلند', icon: '📝' },
  rating_10: { label: 'امتیازدهی ۱ تا ۱۰', icon: '🔟' },
  number: { label: 'عدد و رقم', icon: '🧮' },
  date: { label: 'تاریخ', icon: '📅' },
  matrix: { label: 'سؤال ماتریسی جدولی', icon: '▦' },
  ranking: { label: 'رتبه‌بندی اولویت‌ها', icon: '🥇' },
  image_choice: { label: 'انتخاب تصویر', icon: '🖼️' },
  file_upload: { label: 'آپلود فایل و مستندات', icon: '📎' },
  info_block: { label: 'متن راهنما و اطلاعیه', icon: 'ℹ️' },
};

export const SurveyBuilderView: React.FC<SurveyBuilderViewProps> = ({
  survey,
  units,
  onSaveSurvey,
  onBackToSurveys,
  onPreviewSurvey,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'sections' | 'settings'>('questions');
  const [viewLayout, setViewLayout] = useState<'list' | 'swimlanes'>('list');
  const [formData, setFormData] = useState<Survey>({ ...survey });
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    survey.sections[0]?.id || 'all'
  );

  // Active question being edited in right panel
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);

  // Section Modals State
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSectionItem, setEditingSectionItem] = useState<SurveyTopicSection | null>(null);
  const [deleteSectionTarget, setDeleteSectionTarget] = useState<SurveyTopicSection | null>(null);

  // Conditional Logic Modal State
  const [conditionalQuestionTarget, setConditionalQuestionTarget] = useState<SurveyQuestion | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [searchQuestionTerm, setSearchQuestionTerm] = useState('');

  // Drag and Drop State for Questions across topics
  const [draggedQuestion, setDraggedQuestion] = useState<{
    id: string;
    sectionId: string;
    index: number;
  } | null>(null);

  const [dragOverQuestionId, setDragOverQuestionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);

  // Save all changes
  const handleSaveAll = async () => {
    setIsSaving(true);
    const ok = await onSaveSurvey(formData);
    setIsSaving(false);
    if (ok) {
      onShowToast('کلیه تغییرات پرسشنامه، محورها و منطق شرطی با موفقیت ذخیره گردید.', 'success');
    }
  };

  // Filter questions for active section view or search
  const filteredQuestions = formData.questions.filter((q) => {
    if (selectedSectionId !== 'all' && q.sectionId !== selectedSectionId) return false;
    if (searchQuestionTerm.trim()) {
      const term = searchQuestionTerm.toLowerCase();
      return (
        q.title.toLowerCase().includes(term) ||
        (q.description && q.description.toLowerCase().includes(term))
      );
    }
    return true;
  });

  // Add Question
  const handleAddNewQuestion = (type: SurveyQuestionType = 'likert', targetSectionId?: string) => {
    const secId =
      targetSectionId ||
      (selectedSectionId === 'all'
        ? formData.sections[0]?.id || 'sec-1'
        : selectedSectionId);

    const newQ: SurveyQuestion = {
      id: `q-${Date.now()}`,
      sectionId: secId,
      type,
      title: 'عنوان سؤال جدید',
      description: '',
      required: true,
      order: formData.questions.length + 1,
      options:
        type === 'likert'
          ? [
              { id: '1', label: 'کاملاً ناراضی', value: '1', score: 20 },
              { id: '2', label: 'ناراضی', value: '2', score: 40 },
              { id: '3', label: 'تا حدودی', value: '3', score: 60 },
              { id: '4', label: 'راضی', value: '4', score: 80 },
              { id: '5', label: 'کاملاً راضی', value: '5', score: 100 },
            ]
          : type === 'yes_no'
          ? [
              { id: 'y', label: 'بله', value: 'yes', score: 100 },
              { id: 'n', label: 'خیر', value: 'no', score: 20 },
            ]
          : type === 'single_choice' || type === 'multi_choice' || type === 'dropdown'
          ? [
              { id: 'o1', label: 'گزینه اول', value: 'opt_1', score: 50 },
              { id: 'o2', label: 'گزینه دوم', value: 'opt_2', score: 100 },
            ]
          : undefined,
      matrixRows:
        type === 'matrix'
          ? [
              { id: 'r1', label: 'معیار اول' },
              { id: 'r2', label: 'معیار دوم' },
            ]
          : undefined,
      matrixColumns:
        type === 'matrix'
          ? [
              { id: 'c1', label: 'ضعیف', value: '1', score: 20 },
              { id: 'c2', label: 'متوسط', value: '2', score: 60 },
              { id: 'c3', label: 'عالی', value: '3', score: 100 },
            ]
          : undefined,
      npsLabels:
        type === 'nps'
          ? { low: 'اصلاً توصیه نمی‌کنم (۰)', high: 'قطعاً توصیه می‌کنم (۱۰)' }
          : undefined,
    };

    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQ],
    }));
    setEditingQuestion(newQ);
    onShowToast('سؤال جدید ایجاد شد.', 'info');
  };

  // Move Question to another Topic Section
  const handleMoveQuestionToSection = (questionId: string, newSectionId: string) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, sectionId: newSectionId } : q
      ),
    }));

    if (editingQuestion?.id === questionId) {
      setEditingQuestion((prev) => (prev ? { ...prev, sectionId: newSectionId } : null));
    }

    const secObj = formData.sections.find((s) => s.id === newSectionId);
    onShowToast(`سؤال به موضوع "${secObj?.title || 'جدید'}" منتقل گردید.`, 'success');
  };

  // Drag and Drop Handlers for Questions
  const handleDragStartQuestion = (e: React.DragEvent, question: SurveyQuestion, index: number) => {
    setDraggedQuestion({
      id: question.id,
      sectionId: question.sectionId,
      index,
    });
    e.dataTransfer.setData('text/plain', question.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverQuestion = (e: React.DragEvent, targetQuestionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverQuestionId !== targetQuestionId) {
      setDragOverQuestionId(targetQuestionId);
    }
  };

  const handleDragOverSectionTab = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSectionId !== sectionId) {
      setDragOverSectionId(sectionId);
    }
  };

  const handleDropOnQuestion = (e: React.DragEvent, targetQuestion: SurveyQuestion) => {
    e.preventDefault();
    if (!draggedQuestion || draggedQuestion.id === targetQuestion.id) {
      setDraggedQuestion(null);
      setDragOverQuestionId(null);
      return;
    }

    const list = [...formData.questions];
    const sourceIdx = list.findIndex((q) => q.id === draggedQuestion.id);
    const targetIdx = list.findIndex((q) => q.id === targetQuestion.id);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const [moved] = list.splice(sourceIdx, 1);
      // Transfer section if different
      moved.sectionId = targetQuestion.sectionId;
      list.splice(targetIdx, 0, moved);

      // Re-index order
      list.forEach((q, i) => {
        q.order = i + 1;
      });

      setFormData((prev) => ({ ...prev, questions: list }));

      const secObj = formData.sections.find((s) => s.id === targetQuestion.sectionId);
      onShowToast(`سؤال جابه‌جا شد و به موضوع «${secObj?.title}» اختصاص یافت.`, 'success');
    }

    setDraggedQuestion(null);
    setDragOverQuestionId(null);
    setDragOverSectionId(null);
  };

  const handleDropOnSection = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    if (!draggedQuestion) return;

    if (targetSectionId !== 'all' && draggedQuestion.sectionId !== targetSectionId) {
      handleMoveQuestionToSection(draggedQuestion.id, targetSectionId);
    }

    setDraggedQuestion(null);
    setDragOverQuestionId(null);
    setDragOverSectionId(null);
  };

  const handleDragEndQuestion = () => {
    setDraggedQuestion(null);
    setDragOverQuestionId(null);
    setDragOverSectionId(null);
  };

  // Reorder Question buttons
  const handleMoveQuestionOrder = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= formData.questions.length) return;

    const list = [...formData.questions];
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    list.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setFormData((prev) => ({ ...prev, questions: list }));
  };

  // Duplicate Question
  const handleDuplicateQuestion = (q: SurveyQuestion) => {
    const dup: SurveyQuestion = {
      ...q,
      id: `q-${Date.now()}`,
      title: `${q.title} (رونوشت)`,
      order: q.order + 1,
    };
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, dup],
    }));
    onShowToast('سؤال با موفقیت تکثیر شد.', 'info');
  };

  // Delete Question
  const handleDeleteQuestion = (qId: string) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== qId),
    }));
    if (editingQuestion?.id === qId) setEditingQuestion(null);
    onShowToast('سؤال حذف شد.', 'info');
  };

  // Topic Section Handlers
  const handleSaveSection = (savedSection: SurveyTopicSection) => {
    setFormData((prev) => {
      const exists = prev.sections.some((s) => s.id === savedSection.id);
      if (exists) {
        return {
          ...prev,
          sections: prev.sections.map((s) => (s.id === savedSection.id ? savedSection : s)),
        };
      } else {
        return {
          ...prev,
          sections: [...prev.sections, savedSection],
        };
      }
    });
    onShowToast('محور موضوعی با موفقیت ذخیره گردید.', 'success');
  };

  const handleConfirmDeleteSection = (
    secId: string,
    transferQuestionsToSectionId?: string | null
  ) => {
    setFormData((prev) => {
      let updatedQuestions = prev.questions;
      if (transferQuestionsToSectionId) {
        updatedQuestions = updatedQuestions.map((q) =>
          q.sectionId === secId ? { ...q, sectionId: transferQuestionsToSectionId } : q
        );
      } else {
        updatedQuestions = updatedQuestions.filter((q) => q.sectionId !== secId);
      }

      return {
        ...prev,
        sections: prev.sections.filter((s) => s.id !== secId),
        questions: updatedQuestions,
      };
    });

    if (selectedSectionId === secId) {
      setSelectedSectionId('all');
    }
    onShowToast('محور موضوعی حذف گردید.', 'info');
  };

  const handleMoveSectionOrder = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= formData.sections.length) return;

    const list = [...formData.sections];
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    list.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setFormData((prev) => ({ ...prev, sections: list }));
  };

  // Conditional Logic Handler
  const handleSaveRules = (questionId: string, rules: SurveyConditionalRule[]) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === questionId ? { ...q, rules } : q)),
    }));

    if (editingQuestion?.id === questionId) {
      setEditingQuestion((prev) => (prev ? { ...prev, rules } : null));
    }
    onShowToast('قوانین منطق شرطی (IF/THEN/ELSE) سؤال به‌روزرسانی شد.', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToSurveys}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="بازگشت به فهرست نظرسنجی‌ها"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {formData.code}
              </span>
              <span className="text-xs text-slate-400">طراح پیشرفته نظرسنجی سازمانی</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {formData.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onPreviewSurvey(formData)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>پیش‌نمایش پرسشنامه</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'در حال ذخیره...' : 'ذخیره کل تغییرات'}</span>
          </button>
        </div>
      </div>

      {/* Builder Main Navigation Tabs & View Layout Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold w-fit">
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>مدیریت و طراحی سؤال‌ها ({formData.questions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sections')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'sections'
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>مدیریت محورها و موضوعات ({formData.sections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>تنظیمات تخصیص و محرمانگی</span>
          </button>
        </div>

        {/* In Questions tab: Toggle List vs Swimlanes layout */}
        {activeTab === 'questions' && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <button
              onClick={() => setViewLayout('list')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewLayout === 'list'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="نمای ترتیبی و خطی سؤالات"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>نمای خطی (List)</span>
            </button>
            <button
              onClick={() => setViewLayout('swimlanes')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewLayout === 'swimlanes'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="نمای ستونی موضوعات جهت Drag & Drop آسان بین شاخه‌ها"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>نمای ستونی موضوعات (Swimlanes)</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: QUESTIONS DESIGNER WITH DRAG & DROP ACROSS TOPICS */}
      {/* ======================================================== */}
      {activeTab === 'questions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Area: Questions List or Swimlanes */}
          <div className="lg:col-span-8 space-y-4">
            {/* Topic Filter Pills / Drop Targets Banner */}
            <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <GripVertical className="w-3.5 h-3.5 text-indigo-500" />
                  <span>محورهای موضوعی (می‌توانید سؤال را کشیده و روی هر موضوع رها کنید):</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
                  Drag & Drop Questions Across Topics
                </span>
              </div>

              {/* Active Dropzone Topic Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setSelectedSectionId('all')}
                  onDragOver={(e) => handleDragOverSectionTab(e, 'all')}
                  onDrop={(e) => handleDropOnSection(e, 'all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                    selectedSectionId === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  همه موضوعات ({formData.questions.length})
                </button>

                {formData.sections.map((sec) => {
                  const isHovered = dragOverSectionId === sec.id;
                  const secQuestionsCount = formData.questions.filter((q) => q.sectionId === sec.id).length;

                  return (
                    <button
                      key={sec.id}
                      onClick={() => setSelectedSectionId(sec.id)}
                      onDragOver={(e) => handleDragOverSectionTab(e, sec.id)}
                      onDragLeave={() => setDragOverSectionId(null)}
                      onDrop={(e) => handleDropOnSection(e, sec.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        isHovered
                          ? 'ring-2 ring-indigo-500 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 scale-105 shadow-md'
                          : selectedSectionId === sec.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-400'
                      }`}
                    >
                      <span>{sec.title}</span>
                      <span className="text-[10px] opacity-80 font-mono">
                        ({secQuestionsCount})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search bar */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="جست‌وجوی سؤال در موضوعات..."
                  value={searchQuestionTerm}
                  onChange={(e) => setSearchQuestionTerm(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* VIEW MODE 1: LIST VIEW WITH DRAG & DROP REORDERING */}
            {viewLayout === 'list' && (
              <div className="space-y-3">
                {filteredQuestions.length === 0 ? (
                  <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                    <p className="text-slate-500 font-medium text-xs">سؤالی در این محور یافت نشد.</p>
                    <button
                      onClick={() => handleAddNewQuestion('likert')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                    >
                      + افزودن سؤال جدید به این موضوع
                    </button>
                  </div>
                ) : (
                  filteredQuestions.map((question, index) => {
                    const typeInfo = QUESTION_TYPE_LABELS[question.type] || { label: question.type, icon: '❓' };
                    const sec = formData.sections.find((s) => s.id === question.sectionId);
                    const isEditing = editingQuestion?.id === question.id;
                    const isDragging = draggedQuestion?.id === question.id;
                    const isOver = dragOverQuestionId === question.id;
                    const ruleCount = question.rules?.length || 0;

                    return (
                      <div
                        key={question.id}
                        draggable
                        onDragStart={(e) => handleDragStartQuestion(e, question, index)}
                        onDragOver={(e) => handleDragOverQuestion(e, question.id)}
                        onDragLeave={() => setDragOverQuestionId(null)}
                        onDrop={(e) => handleDropOnQuestion(e, question)}
                        onDragEnd={handleDragEndQuestion}
                        className={`bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border transition-all cursor-move select-none ${
                          isDragging
                            ? 'opacity-40 border-dashed border-indigo-400 scale-98'
                            : isOver
                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-md'
                            : isEditing
                            ? 'border-indigo-500 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/10'
                            : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Grip Handle & Content */}
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <div
                              className="text-slate-400 hover:text-indigo-600 p-1 cursor-grab active:cursor-grabbing shrink-0 mt-0.5"
                              title="برای جابه‌جایی و مرتب‌سازی، بکشید و رها کنید (Drag to Reorder)"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>

                            <div className="space-y-2 min-w-0 flex-1">
                              {/* Badges & Topic Switcher */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-black text-slate-400">
                                  #{index + 1}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                                  <span>{typeInfo.icon}</span>
                                  <span>{typeInfo.label}</span>
                                </span>

                                {/* Quick Topic Selector Dropdown */}
                                <div className="flex items-center gap-1 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg px-2 py-0.5 text-xs font-medium border border-indigo-200/60 dark:border-indigo-900">
                                  <ArrowLeftRight className="w-3 h-3 text-indigo-500 shrink-0" />
                                  <span className="text-[10px] text-indigo-400">موضوع:</span>
                                  <select
                                    value={question.sectionId}
                                    onChange={(e) => handleMoveQuestionToSection(question.id, e.target.value)}
                                    className="bg-transparent font-bold cursor-pointer focus:outline-hidden text-xs max-w-[140px] truncate"
                                    title="تغییر سریع محور موضوعی این سؤال"
                                  >
                                    {formData.sections.map((s) => (
                                      <option key={s.id} value={s.id} className="dark:bg-slate-900 dark:text-white">
                                        {s.title}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {question.required && (
                                  <span className="text-[11px] text-rose-500 font-bold">* الزامی</span>
                                )}
                              </div>

                              {/* Question Title */}
                              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                                {question.title}
                              </h4>

                              {question.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {question.description}
                                </p>
                              )}

                              {/* Options Preview */}
                              {question.options && question.options.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                  {question.options.slice(0, 5).map((opt) => (
                                    <span
                                      key={opt.id}
                                      className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700"
                                    >
                                      {opt.label}
                                    </span>
                                  ))}
                                  {question.options.length > 5 && (
                                    <span className="text-[10px] text-slate-400">
                                      +{question.options.length - 5} گزینه دیگر
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Conditional Logic IF / THEN / ELSE Visual Pills */}
                              <div className="pt-1 flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setConditionalQuestionTarget(question)}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                    ruleCount > 0
                                      ? 'bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                                  }`}
                                  title="طراحی قوانین شرطی IF / THEN / ELSE برای این سؤال"
                                >
                                  <GitBranch className="w-3.5 h-3.5 text-purple-600" />
                                  <span>منطق شرطی: {ruleCount > 0 ? `${ruleCount} قانون IF/THEN/ELSE` : 'تعریف شرط'}</span>
                                </button>

                                {question.rules?.map((r, rIdx) => {
                                  const targetQ = formData.questions.find((x) => x.id === r.targetQuestionId);
                                  return (
                                    <span
                                      key={r.id || rIdx}
                                      className="text-[10px] px-2 py-0.5 rounded-lg bg-purple-100/70 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 border border-purple-200/50 dark:border-purple-800 flex items-center gap-1 font-mono"
                                    >
                                      <span>IF = "{r.value}"</span>
                                      <span>➡️</span>
                                      <span>THEN {r.action}</span>
                                      {r.elseAction && r.elseAction !== 'none' && (
                                        <span>| ELSE {r.elseAction}</span>
                                      )}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Action Toolbar */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleMoveQuestionOrder(index, 'up')}
                              disabled={index === 0}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              title="انتقال به بالا"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveQuestionOrder(index, 'down')}
                              disabled={index === formData.questions.length - 1}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              title="انتقال به پایین"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicateQuestion(question)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 cursor-pointer"
                              title="تکثیر سؤال"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingQuestion(question)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 cursor-pointer"
                              title="تنظیمات و خصوصیات سؤال"
                            >
                              <Settings className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="حذف سؤال"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* VIEW MODE 2: TOPIC SWIMLANES KANBAN VIEW (DRAG QUESTIONS DIRECTLY BETWEEN COLUMNS) */}
            {viewLayout === 'swimlanes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.sections.map((section) => {
                  const secQuestions = formData.questions.filter((q) => q.sectionId === section.id);
                  const isSecOver = dragOverSectionId === section.id;

                  return (
                    <div
                      key={section.id}
                      onDragOver={(e) => handleDragOverSectionTab(e, section.id)}
                      onDragLeave={() => setDragOverSectionId(null)}
                      onDrop={(e) => handleDropOnSection(e, section.id)}
                      className={`p-4 rounded-3xl border transition-all flex flex-col justify-between space-y-3 ${
                        isSecOver
                          ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Section Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {section.title}
                            </h4>
                            <span className="text-[11px] text-slate-400">
                              وزن: {(section.weight ?? 1.0).toFixed(1)}x • {secQuestions.length} سؤال
                            </span>
                          </div>

                          <button
                            onClick={() => handleAddNewQuestion('likert', section.id)}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-indigo-600 text-xs font-bold"
                            title="افزودن سؤال به این ستون"
                          >
                            + سؤال
                          </button>
                        </div>

                        {/* Questions inside this Swimlane */}
                        <div className="space-y-2 min-h-[120px]">
                          {secQuestions.length === 0 ? (
                            <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] text-slate-400">
                              سؤالی در این موضوع نیست. سؤالی را بکشید و اینجا رها کنید.
                            </div>
                          ) : (
                            secQuestions.map((q, qIndex) => {
                              const qTypeInfo = QUESTION_TYPE_LABELS[q.type] || { label: q.type, icon: '❓' };
                              const isDraggingThis = draggedQuestion?.id === q.id;

                              return (
                                <div
                                  key={q.id}
                                  draggable
                                  onDragStart={(e) => handleDragStartQuestion(e, q, qIndex)}
                                  onDragOver={(e) => handleDragOverQuestion(e, q.id)}
                                  onDrop={(e) => handleDropOnQuestion(e, q)}
                                  onDragEnd={handleDragEndQuestion}
                                  className={`p-3 rounded-2xl border text-xs cursor-move select-none transition-all ${
                                    isDraggingThis
                                      ? 'opacity-40 border-dashed border-indigo-400 scale-95'
                                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 hover:border-indigo-400'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1 min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-slate-400">#{qIndex + 1}</span>
                                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                          {qTypeInfo.icon} {qTypeInfo.label}
                                        </span>
                                      </div>
                                      <h5 className="font-extrabold text-slate-900 dark:text-white truncate">
                                        {q.title}
                                      </h5>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={() => setConditionalQuestionTarget(q)}
                                        className="p-1 text-purple-600 hover:bg-purple-50 rounded-lg"
                                        title="منطق شرطی"
                                      >
                                        <GitBranch className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setEditingQuestion(q)}
                                        className="p-1 text-slate-400 hover:text-amber-500 rounded-lg"
                                        title="ویرایش"
                                      >
                                        <Settings className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteQuestion(q.id)}
                                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg"
                                        title="حذف"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Dropzone Footer */}
                      <div className="p-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-[10px] text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">
                        رها کردن سؤال برای انتقال به «{section.title}»
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Add Question Toolbar */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                افزودن سریع سؤال به محور موضوعی انتخابی:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleAddNewQuestion('likert')}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 cursor-pointer"
                >
                  + طیف لیکرت
                </button>
                <button
                  onClick={() => handleAddNewQuestion('star_rating')}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-amber-700 dark:text-amber-300 border border-slate-200 dark:border-slate-700 hover:border-amber-400 cursor-pointer"
                >
                  + ستاره‌ای ⭐
                </button>
                <button
                  onClick={() => handleAddNewQuestion('nps')}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 cursor-pointer"
                >
                  + شاخص NPS
                </button>
                <button
                  onClick={() => handleAddNewQuestion('yes_no')}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 cursor-pointer"
                >
                  + بله / خیر
                </button>
                <button
                  onClick={() => handleAddNewQuestion('matrix')}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 cursor-pointer"
                >
                  + ماتریسی
                </button>
                <button
                  onClick={() => handleAddNewQuestion('long_text')}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 cursor-pointer"
                >
                  + تشریحی
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Question Properties & Detailed Editor Panel */}
          <div className="lg:col-span-4">
            {editingQuestion ? (
              <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-indigo-200 dark:border-indigo-900 shadow-md sticky top-20 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-black text-sm text-slate-900 dark:text-white">
                    تنظیمات و خصوصیات سؤال
                  </span>
                  <button
                    onClick={() => setEditingQuestion(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Title */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    عنوان سؤال *
                  </label>
                  <textarea
                    rows={2}
                    value={editingQuestion.title}
                    onChange={(e) => {
                      const updated = { ...editingQuestion, title: e.target.value };
                      setEditingQuestion(updated);
                      setFormData((prev) => ({
                        ...prev,
                        questions: prev.questions.map((q) => (q.id === updated.id ? updated : q)),
                      }));
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden font-medium"
                  />
                </div>

                {/* Section Assignment */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    محور موضوعی مرتبط (انتقال بین موضوعات)
                  </label>
                  <select
                    value={editingQuestion.sectionId}
                    onChange={(e) => {
                      handleMoveQuestionToSection(editingQuestion.id, e.target.value);
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden cursor-pointer font-bold text-indigo-600 dark:text-indigo-400"
                  >
                    {formData.sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Selection */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نوع سؤال
                  </label>
                  <select
                    value={editingQuestion.type}
                    onChange={(e) => {
                      const newType = e.target.value as SurveyQuestionType;
                      const updated = { ...editingQuestion, type: newType };
                      setEditingQuestion(updated);
                      setFormData((prev) => ({
                        ...prev,
                        questions: prev.questions.map((q) => (q.id === updated.id ? updated : q)),
                      }));
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden cursor-pointer font-medium"
                  >
                    {Object.entries(QUESTION_TYPE_LABELS).map(([tKey, tVal]) => (
                      <option key={tKey} value={tKey}>
                        {tVal.icon} {tVal.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Required Toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="reqCheckEdit"
                    checked={editingQuestion.required}
                    onChange={(e) => {
                      const updated = { ...editingQuestion, required: e.target.checked };
                      setEditingQuestion(updated);
                      setFormData((prev) => ({
                        ...prev,
                        questions: prev.questions.map((q) => (q.id === updated.id ? updated : q)),
                      }));
                    }}
                    className="w-4 h-4 rounded-md text-indigo-600"
                  />
                  <label htmlFor="reqCheckEdit" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    پاسخ به این سؤال اجباری است
                  </label>
                </div>

                {/* Options Editor for Choice Types */}
                {editingQuestion.options && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        گزینه‌های پاسخ و امتیاز رضایت:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newOpt = {
                            id: `opt-${Date.now()}`,
                            label: `گزینه ${editingQuestion.options!.length + 1}`,
                            value: `opt_${editingQuestion.options!.length + 1}`,
                            score: 50,
                          };
                          const updated = {
                            ...editingQuestion,
                            options: [...editingQuestion.options!, newOpt],
                          };
                          setEditingQuestion(updated);
                          setFormData((prev) => ({
                            ...prev,
                            questions: prev.questions.map((q) => (q.id === updated.id ? updated : q)),
                          }));
                        }}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                      >
                        + افزودن گزینه
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {editingQuestion.options.map((opt, optIdx) => (
                        <div key={opt.id} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={opt.label}
                            onChange={(e) => {
                              const newOpts = editingQuestion.options!.map((o) =>
                                o.id === opt.id ? { ...o, label: e.target.value } : o
                              );
                              const updated = { ...editingQuestion, options: newOpts };
                              setEditingQuestion(updated);
                              setFormData((prev) => ({
                                ...prev,
                                questions: prev.questions.map((q) => (q.id === updated.id ? updated : q)),
                              }));
                            }}
                            className="flex-1 p-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs"
                          />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={opt.score ?? 50}
                            title="امتیاز وزنی (۰ تا ۱۰۰)"
                            onChange={(e) => {
                              const newOpts = editingQuestion.options!.map((o) =>
                                o.id === opt.id ? { ...o, score: Number(e.target.value) } : o
                              );
                              const updated = { ...editingQuestion, options: newOpts };
                              setEditingQuestion(updated);
                              setFormData((prev) => ({
                                ...prev,
                                questions: prev.questions.map((q) => (q.id === updated.id ? updated : q)),
                              }));
                            }}
                            className="w-14 p-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-mono text-center"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newOpts = editingQuestion.options!.filter((o) => o.id !== opt.id);
                              const updated = { ...editingQuestion, options: newOpts };
                              setEditingQuestion(updated);
                              setFormData((prev) => ({
                                ...prev,
                                questions: prev.questions.map((q) => (q.id === updated.id ? updated : q)),
                              }));
                            }}
                            className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conditional Logic Action in Sidebar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setConditionalQuestionTarget(editingQuestion)}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/70 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
                  >
                    <GitBranch className="w-4 h-4" />
                    <span>سازنده منطق شرطی (IF / THEN / ELSE)</span>
                    {editingQuestion.rules && editingQuestion.rules.length > 0 && (
                      <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                        {editingQuestion.rules.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  پنل ویرایش اختصاصی سؤال
                </h4>
                <p className="text-[11px] text-slate-400">
                  برای ویرایش گزینه‌ها، شروط منطقی و نمره‌گذاری، روی آیکون چرخ‌دنده سؤال مورد نظر کلیک فرمایید.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ADVANCED TOPIC SECTIONS MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'sections' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                مدیریت محورها و موضوعات پرسشنامه (Survey Topics & Weights)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تعریف حوزه‌های تخصصی نظرسنجی (مانند رضایت شغلی، مدیریت، تجهیزات) به همراه تعیین ضریب وزنی در محاسبه شاخص کل
              </p>
            </div>
            <button
              onClick={() => {
                setEditingSectionItem(null);
                setIsSectionModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن محور موضوعی جدید</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.sections.map((sec, idx) => {
              const questionsInSec = formData.questions.filter((q) => q.sectionId === sec.id);
              const qCount = questionsInSec.length;

              return (
                <div
                  key={sec.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs bg-slate-50/50 dark:bg-slate-850"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-slate-400 w-5">#{idx + 1}</span>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                        {sec.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                        ضریب وزنی: {(sec.weight ?? 1.0).toFixed(1)}x
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        {qCount} سؤال تخصیص یافته
                      </span>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400">
                      {sec.description || 'بدون توضیح تفصیلی'}
                    </p>

                    {/* Quick Question Preview In this topic */}
                    {qCount > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500">
                        <span className="text-slate-400">سؤالات:</span>
                        {questionsInSec.slice(0, 3).map((q) => (
                          <span
                            key={q.id}
                            className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700 truncate max-w-[200px]"
                          >
                            {q.title}
                          </span>
                        ))}
                        {qCount > 3 && (
                          <span className="text-slate-400 font-mono">+{qCount - 3} سؤال دیگر</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Topic Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleMoveSectionOrder(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      title="انتقال موضوع به بالا"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveSectionOrder(idx, 'down')}
                      disabled={idx === formData.sections.length - 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      title="انتقال موضوع به پایین"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingSectionItem(sec);
                        setIsSectionModalOpen(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>ویرایش</span>
                    </button>
                    <button
                      onClick={() => setDeleteSectionTarget(sec)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors cursor-pointer"
                      title="حذف موضوع"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ALLOCATION MODES & ANONYMITY SETTINGS */}
      {/* ======================================================== */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 text-xs max-w-4xl">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              تنظیمات عمومی، شیوه تخصیص و محرمانگی نظرسنجی
            </h3>
            <p className="text-slate-400 mt-0.5">
              تعیین بخش‌های مجاز، شیوه پاسخ‌دهی و قوانین محافظت از هویت کارکنان
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                عنوان نظرسنجی *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                توضیحات و راهنمای شرکت در نظرسنجی
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            {/* Allocation Mode */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 space-y-2">
              <label className="block font-bold text-indigo-900 dark:text-indigo-200">
                شیوه تخصیص نظرسنجی به ساختار سازمانی
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'shared_segmented', title: 'حالت دوم: نظرسنجی مشترک', desc: 'نظرسنجی یکپارچه برای چند واحد با تفکیک نتایج و گزارش‌ها' },
                  { id: 'independent', title: 'حالت اول: نظرسنجی مستقل', desc: 'برای هر شاخه به صورت کاملاً مجزا و مستقل اجرا می‌شود' },
                  { id: 'respondent_selection', title: 'حالت سوم: انتخاب واحد توسط کاربر', desc: 'کاربر در ابتدای ورود، واحد خود را انتخاب می‌کند' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, allocationMode: item.id as any })}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      formData.allocationMode === item.id
                        ? 'bg-white dark:bg-slate-800 border-indigo-600 text-indigo-700 dark:text-indigo-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.title}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Anonymity Mode */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="block font-bold text-slate-900 dark:text-white">
                سطح محرمانگی و حفاظت از هویت پاسخ‌دهندگان (Anonymity)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'confidential', title: 'محرمانه سازمانی', desc: 'هویت برای مدیران عادی واحد مخفی است و فقط آمار کل نمایش داده می‌شود' },
                  { id: 'anonymous', title: 'کاملاً ناشناس', desc: 'هیچ ارتباط مستقیم هویتی بین فرد و پاسخ در دیتابیس ثبت نمی‌شود' },
                  { id: 'identified', title: 'شناسنامه‌دار', desc: 'کد پرسنلی و نام پاسخ‌دهنده به همراه پاسخ ثبت می‌گردد' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, anonymityMode: item.id as any })}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      formData.anonymityMode === item.id
                        ? 'bg-white dark:bg-slate-700 border-emerald-600 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.title}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Units Allocation Checkboxes */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-900 dark:text-white">
                واحدهای سازمانی مجاز به شرکت در این نظرسنجی:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-xl bg-slate-50 dark:bg-slate-800/40">
                {units.map((u) => {
                  const isChecked = formData.assignedUnitIds.includes(u.id);
                  return (
                    <label key={u.id} className="flex items-center gap-2 text-xs cursor-pointer p-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...formData.assignedUnitIds, u.id]
                            : formData.assignedUnitIds.filter((id) => id !== u.id);
                          setFormData({ ...formData, assignedUnitIds: updated });
                        }}
                        className="rounded-sm text-indigo-600"
                      />
                      <span className="truncate">{u.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS */}
      {/* ======================================================== */}

      {/* 1. Topic Section Add / Edit Modal */}
      <TopicSectionModal
        isOpen={isSectionModalOpen}
        section={editingSectionItem}
        surveyId={formData.id}
        existingCount={formData.sections.length}
        onClose={() => {
          setIsSectionModalOpen(false);
          setEditingSectionItem(null);
        }}
        onSave={handleSaveSection}
      />

      {/* 2. Topic Section Safe Delete Modal */}
      <DeleteSectionModal
        isOpen={!!deleteSectionTarget}
        section={deleteSectionTarget}
        otherSections={formData.sections.filter((s) => s.id !== deleteSectionTarget?.id)}
        questionCount={
          deleteSectionTarget
            ? formData.questions.filter((q) => q.sectionId === deleteSectionTarget.id).length
            : 0
        }
        onClose={() => setDeleteSectionTarget(null)}
        onConfirmDelete={handleConfirmDeleteSection}
      />

      {/* 3. Advanced IF / THEN / ELSE Conditional Logic Builder Modal */}
      <ConditionalLogicModal
        isOpen={!!conditionalQuestionTarget}
        question={conditionalQuestionTarget}
        allQuestions={formData.questions}
        allSections={formData.sections}
        onClose={() => setConditionalQuestionTarget(null)}
        onSaveRules={handleSaveRules}
      />
    </div>
  );
};
