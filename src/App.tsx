import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { ConfirmModal } from './components/common/ConfirmModal';
import { DeviceFrame } from './components/common/DeviceFrame';
import { DashboardView } from './components/dashboard/DashboardView';
import { FormListView } from './components/forms/FormListView';
import { CreateFormModal } from './components/forms/CreateFormModal';
import { FormSettingsModal } from './components/forms/FormSettingsModal';
import { ShareFormModal } from './components/forms/ShareFormModal';
import { FormBuilderView } from './components/builder/FormBuilderView';
import { ResponsesView } from './components/responses/ResponsesView';
import { PublicFormView } from './components/renderer/PublicFormView';
import { FormRenderer } from './components/renderer/FormRenderer';
import { ApiDocsView } from './components/docs/ApiDocsView';
import { Form, FormResponse, DashboardStats, AuditLog } from './types/form';
import { dbService } from './services/db';

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    'dashboard' | 'forms' | 'builder' | 'responses' | 'public' | 'api-docs'
  >('dashboard');

  const [forms, setForms] = useState<Form[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [stats, setStats] = useState<DashboardStats>(dbService.getDashboardStats());
  const [logs, setLogs] = useState<AuditLog[]>(dbService.getAuditLogs());

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [settingsModalForm, setSettingsModalForm] = useState<Form | null>(null);
  const [previewModalForm, setPreviewModalForm] = useState<Form | null>(null);
  const [shareModalForm, setShareModalForm] = useState<Form | null>(null);

  // User-Only (Standalone Public View - No Admin Panel)
  const [isUserOnlyMode, setIsUserOnlyMode] = useState<boolean>(false);

  // Confirm delete dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Load initial data and parse URL params for direct form access
  const refreshData = () => {
    const loadedForms = dbService.getForms();
    setForms(loadedForms);
    if (!selectedFormId && loadedForms.length > 0) {
      setSelectedFormId(loadedForms[0].id);
    }
    setResponses(dbService.getResponses());
    setStats(dbService.getDashboardStats());
    setLogs(dbService.getAuditLogs());
  };

  useEffect(() => {
    refreshData();

    // Check URL parameters for direct public form access (e.g., ?form=xxx or ?f=xxx or ?view=user)
    try {
      const params = new URLSearchParams(window.location.search);
      const formParam =
        params.get('form') ||
        params.get('f') ||
        params.get('id') ||
        params.get('slug');
      const viewParam = params.get('view') || params.get('mode');

      if (formParam) {
        const loaded = dbService.getForms();
        const matched = loaded.find(
          (f) =>
            f.id === formParam ||
            f.slug === formParam ||
            f.id.toLowerCase() === formParam.toLowerCase() ||
            (f.slug && f.slug.toLowerCase() === formParam.toLowerCase())
        );

        if (matched) {
          setSelectedFormId(matched.id);
          setCurrentTab('public');
          // If view=user or accessed directly through ?form=, isolate user from admin panel
          setIsUserOnlyMode(true);
        }
      } else if (viewParam === 'user' || viewParam === 'public') {
        setCurrentTab('public');
        setIsUserOnlyMode(true);
      } else {
        const tabParam = params.get('tab');
        if (tabParam === 'docs' || tabParam === 'swagger' || tabParam === 'api-docs') {
          setCurrentTab('api-docs');
        }
      }
    } catch (e) {
      console.error('Error parsing URL parameters:', e);
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Create Form
  const handleCreateForm = (newFormData: Partial<Form>) => {
    const created = dbService.createForm(newFormData);
    refreshData();
    setSelectedFormId(created.id);
    setCurrentTab('builder');
    showToast(`فرم «${created.title}» با موفقیت ایجاد شد.`, 'success');
  };

  // Save Form from Builder
  const handleSaveForm = (updatedForm: Form) => {
    dbService.updateForm(updatedForm.id, updatedForm);
    refreshData();
  };

  // Duplicate Form
  const handleDuplicateForm = (formId: string) => {
    const duplicated = dbService.duplicateForm(formId);
    if (duplicated) {
      refreshData();
      showToast(`فرم «${duplicated.title}» با موفقیت تکثیر شد.`, 'success');
    }
  };

  // Toggle Status
  const handleToggleStatus = (formId: string) => {
    const updated = dbService.toggleFormStatus(formId);
    if (updated) {
      refreshData();
      showToast(
        `وضعیت فرم به «${updated.status === 'active' ? 'فعال' : 'غیرفعال'}» تغییر یافت.`,
        'info'
      );
    }
  };

  // Delete Form Request
  const handleDeleteFormRequest = (form: Form) => {
    setConfirmDialog({
      isOpen: true,
      title: 'حذف فرم',
      message: `آیا از حذف فرم «${form.title}» و تمامی پاسخ‌های ثبت‌شده آن اطمینان دارید؟ این عملیات قابل بازگشت نیست.`,
      onConfirm: () => {
        dbService.deleteForm(form.id);
        refreshData();
        if (selectedFormId === form.id) {
          const remaining = dbService.getForms();
          setSelectedFormId(remaining[0]?.id || '');
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('فرم با موفقیت حذف گردید.', 'info');
      },
    });
  };

  // Delete Response Request
  const handleDeleteResponse = (responseId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'حذف پاسخ',
      message: 'آیا از حذف این رکورد پاسخ اطمینان دارید؟',
      onConfirm: () => {
        dbService.deleteResponse(responseId);
        refreshData();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('پاسخ مورد نظر حذف شد.', 'info');
      },
    });
  };

  // Clear all responses for a form
  const handleClearAllResponses = (formId: string) => {
    const form = forms.find((f) => f.id === formId);
    setConfirmDialog({
      isOpen: true,
      title: 'پاکسازی تمام پاسخ‌ها',
      message: `آیا مطمئن هستید که می‌خواهید همه پاسخ‌های فرم «${form?.title}» را حذف کنید؟`,
      onConfirm: () => {
        dbService.clearAllResponsesForForm(formId);
        refreshData();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('تمام پاسخ‌ها با موفقیت پاکسازی شدند.', 'info');
      },
    });
  };

  // Copy shareable link / Open Share modal
  const handleCopyLink = (formId: string) => {
    const form = forms.find((f) => f.id === formId);
    if (form) {
      setShareModalForm(form);
    }
  };

  // Export CSV
  const handleExportCSV = (formId: string) => {
    const csvContent = dbService.exportFormResponsesToCSV(formId);
    const form = forms.find((f) => f.id === formId);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `${form?.slug || 'form'}-responses-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('فایل اکسل (CSV) با کدگذاری UTF-8 دانلود شد.', 'success');
  };

  // Reset Demo Data
  const handleResetData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'بازنشانی داده‌های نمونه',
      message:
        'آیا می‌خواهید داده‌های اولیه سیستم (شامل فرم پیش‌فرض اطلاعات دانشجویان و پاسخ‌های نمونه) مجدداً بارگذاری شوند؟',
      onConfirm: () => {
        dbService.resetToInitialSeed();
        refreshData();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('داده‌های نمونه اولیه با موفقیت بازنشانی شدند.', 'success');
      },
    });
  };

  // Public Submit Handler
  const handlePublicSubmit = async (values: Record<string, any>) => {
    const targetForm = forms.find((f) => f.id === selectedFormId) || forms[0];
    if (!targetForm) {
      return { success: false, message: 'فرم یافت نشد.' };
    }

    const res = dbService.submitFormResponse(targetForm.id, values);
    if (res.success) {
      refreshData();
    }
    return res;
  };

  const selectedForm = forms.find((f) => f.id === selectedFormId) || forms[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200" dir="rtl">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Create Form Modal */}
      <CreateFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateForm}
      />

      {/* Form Settings Modal */}
      <FormSettingsModal
        isOpen={!!settingsModalForm}
        form={settingsModalForm}
        onClose={() => setSettingsModalForm(null)}
        onSave={(formId, updated) => {
          dbService.updateForm(formId, updated);
          refreshData();
          showToast('تنظیمات فرم با موفقیت به‌روزرسانی شد.', 'success');
        }}
      />

      {/* Share and Public User Link Modal */}
      <ShareFormModal
        isOpen={!!shareModalForm}
        form={shareModalForm}
        onClose={() => setShareModalForm(null)}
        onOpenUserView={(formId) => {
          setSelectedFormId(formId);
          setCurrentTab('public');
          setIsUserOnlyMode(true);
        }}
        onShowToast={showToast}
      />

      {/* Form Device Preview Modal */}
      {previewModalForm && (
        <div className="fixed inset-0 z-50 p-2 sm:p-6 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center animate-in fade-in">
          <div className="w-full h-full max-w-5xl flex flex-col">
            <DeviceFrame
              title={`پیش‌نمایش تعاملی: ${previewModalForm.title}`}
              onClose={() => setPreviewModalForm(null)}
            >
              <FormRenderer
                form={previewModalForm}
                onSubmit={async (values) => {
                  showToast('پیش‌نمایش: پاسخ با موفقیت شبیه‌سازی شد!', 'success');
                  return { success: true };
                }}
              />
            </DeviceFrame>
          </div>
        </div>
      )}

      {/* Top Header (Hidden in Public and User-Only modes) */}
      {currentTab !== 'public' && !isUserOnlyMode && (
        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          forms={forms}
          selectedFormId={selectedFormId}
          setSelectedFormId={setSelectedFormId}
          onResetData={handleResetData}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'public' ? (
          /* Public End-User Form Submission View */
          <PublicFormView
            form={selectedForm}
            onSubmit={handlePublicSubmit}
            onBackToDashboard={() => {
              setIsUserOnlyMode(false);
              setCurrentTab('dashboard');
            }}
            onShowToast={showToast}
            isUserOnlyMode={isUserOnlyMode}
            onToggleUserOnlyMode={() => setIsUserOnlyMode((prev) => !prev)}
            onOpenAdminLogin={() => {
              setIsUserOnlyMode(false);
              setCurrentTab('dashboard');
              showToast('ورود به پنل مدیریت با موفقیت انجام شد.', 'info');
            }}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {currentTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                forms={forms}
                logs={logs}
                onOpenCreateForm={() => setIsCreateModalOpen(true)}
                onSelectFormForBuilder={(id) => {
                  setSelectedFormId(id);
                  setCurrentTab('builder');
                }}
                onSelectFormForResponses={(id) => {
                  setSelectedFormId(id);
                  setCurrentTab('responses');
                }}
                onOpenPublicForm={(id) => {
                  setSelectedFormId(id);
                  setCurrentTab('public');
                }}
                onOpenShare={(f) => setShareModalForm(f)}
                onOpenApiDocs={() => setCurrentTab('api-docs')}
              />
            )}

            {currentTab === 'forms' && (
              <FormListView
                forms={forms}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onEditBuilder={(id) => {
                  setSelectedFormId(id);
                  setCurrentTab('builder');
                }}
                onViewResponses={(id) => {
                  setSelectedFormId(id);
                  setCurrentTab('responses');
                }}
                onOpenSettings={(f) => setSettingsModalForm(f)}
                onOpenPreview={(f) => setPreviewModalForm(f)}
                onDuplicateForm={handleDuplicateForm}
                onDeleteForm={handleDeleteFormRequest}
                onToggleStatus={handleToggleStatus}
                onOpenPublicForm={(id) => {
                  setSelectedFormId(id);
                  setCurrentTab('public');
                }}
                onCopyLink={handleCopyLink}
              />
            )}

            {currentTab === 'builder' && (
              selectedForm ? (
                <FormBuilderView
                  key={selectedForm.id}
                  form={selectedForm}
                  onSaveForm={handleSaveForm}
                  onOpenPreview={(f) => setPreviewModalForm(f)}
                  onOpenSettings={(f) => setSettingsModalForm(f)}
                  onOpenShare={(f) => setShareModalForm(f)}
                  onBackToForms={() => setCurrentTab('forms')}
                  onShowToast={showToast}
                />
              ) : (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 dark:text-slate-400">فرمی انتخاب نشده است.</p>
                </div>
              )
            )}

            {currentTab === 'responses' && (
              <ResponsesView
                forms={forms}
                selectedFormId={selectedFormId}
                onSelectForm={setSelectedFormId}
                responses={responses}
                onDeleteResponse={handleDeleteResponse}
                onExportCSV={handleExportCSV}
                onClearAllResponses={handleClearAllResponses}
                onShowToast={showToast}
              />
            )}

            {currentTab === 'api-docs' && (
              <ApiDocsView />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
