import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Building2,
  BarChart3,
  Edit3,
  Plus,
  RefreshCw,
  FolderTree,
  Send,
  ShieldCheck,
  Eye,
  Sliders,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import {
  Survey,
  OrganizationalUnit,
  UserAccessProfile,
} from '../../types/survey';
import { surveyService } from '../../services/surveyService';
import { SurveyListView } from './SurveyListView';
import { OrganizationUnitsView } from './OrganizationUnitsView';
import { SurveyBuilderView } from './SurveyBuilderView';
import { SurveyAnalyticsView } from './SurveyAnalyticsView';
import { SurveyPublicForm } from './SurveyPublicForm';
import { SurveyRoleSwitcher } from './SurveyRoleSwitcher';
import { CreateSurveyModal } from './CreateSurveyModal';
import { SurveyShareModal } from './SurveyShareModal';
import { UnitPortalView } from './UnitPortalView';

interface SurveyMainViewProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SurveyMainView: React.FC<SurveyMainViewProps> = ({ onShowToast }) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'surveys' | 'units' | 'builder' | 'analytics' | 'runner' | 'unit_portal'
  >(surveyService.getCurrentProfile().role === 'respondent' ? 'runner' : 'surveys');

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [units, setUnits] = useState<OrganizationalUnit[]>([]);
  const [currentProfile, setCurrentProfile] = useState<UserAccessProfile>(
    surveyService.getCurrentProfile()
  );

  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('');
  const [publicUnitId, setPublicUnitId] = useState<string | undefined>(undefined);
  const [portalUnitId, setPortalUnitId] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetSurvey, setShareTargetSurvey] = useState<Survey | null>(null);
  const [shareTargetUnit, setShareTargetUnit] = useState<OrganizationalUnit | null>(null);
  const [loading, setLoading] = useState(false);

  // Subscribe to profile changes
  useEffect(() => {
    const unsub = surveyService.subscribe(() => {
      const p = surveyService.getCurrentProfile();
      setCurrentProfile(p);
      if (p.role === 'respondent') {
        setActiveSubTab('runner');
      }
    });
    return unsub;
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allSurveys, allUnits] = await Promise.all([
        surveyService.getSurveys(),
        surveyService.getUnits(),
      ]);
      setSurveys(allSurveys);
      setUnits(allUnits);
      if (!selectedSurveyId && allSurveys.length > 0) {
        setSelectedSurveyId(allSurveys[0].id);
      }
    } catch {
      onShowToast('خطا در دریافت اطلاعات ماژول نظرسنجی', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle direct URL query params for survey and unit
  useEffect(() => {
    if (surveys.length === 0 && units.length === 0) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const sParam = params.get('survey') || params.get('s');
      const uParam = params.get('unit') || params.get('u');

      if (sParam) {
        const found = surveys.find(
          (s) =>
            s.id === sParam ||
            s.slug === sParam ||
            s.code.toLowerCase() === sParam.toLowerCase()
        );
        if (found) {
          setSelectedSurveyId(found.id);
          if (uParam) setPublicUnitId(uParam);
          setActiveSubTab('runner');
        }
      } else if (uParam) {
        setPortalUnitId(uParam);
        setActiveSubTab('unit_portal');
      }
    } catch {
      // ignore
    }
  }, [surveys, units]);

  const selectedSurvey = surveys.find((s) => s.id === selectedSurveyId) || surveys[0];

  // Actions
  const handleOpenBuilder = (surveyId: string) => {
    setSelectedSurveyId(surveyId);
    setActiveSubTab('builder');
  };

  const handleOpenAnalytics = (surveyId: string) => {
    setSelectedSurveyId(surveyId);
    setActiveSubTab('analytics');
  };

  const handleOpenPublicSurvey = (surveyId: string, unitId?: string) => {
    setSelectedSurveyId(surveyId);
    setPublicUnitId(unitId);
    setActiveSubTab('runner');
  };

  const handleOpenShareSurvey = (surveyItem: Survey) => {
    setShareTargetSurvey(surveyItem);
    setShareTargetUnit(null);
    setIsShareModalOpen(true);
  };

  const handleOpenShareUnit = (unitItem: OrganizationalUnit) => {
    setShareTargetUnit(unitItem);
    setShareTargetSurvey(null);
    setIsShareModalOpen(true);
  };

  const handleSaveSurvey = async (updated: Survey): Promise<boolean> => {
    const res = await surveyService.updateSurvey(updated.id, updated);
    if (res) {
      setSurveys((prev) => prev.map((s) => (s.id === updated.id ? res : s)));
      return true;
    }
    return false;
  };

  const handleCloneSurvey = async (surveyId: string) => {
    const cloned = await surveyService.cloneSurvey(surveyId);
    if (cloned) {
      setSurveys((prev) => [cloned, ...prev]);
      onShowToast('رونوشت نظرسنجی با موفقیت ایجاد گردید.', 'success');
    } else {
      onShowToast('خطا در تکثیر نظرسنجی', 'error');
    }
  };

  const handleToggleStatus = async (surveyId: string, currentStatus: Survey['status']) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    const updated = await surveyService.setSurveyStatus(surveyId, nextStatus);
    if (updated) {
      setSurveys((prev) => prev.map((s) => (s.id === surveyId ? updated : s)));
      onShowToast(
        nextStatus === 'active' ? 'نظرسنجی فعال گردید.' : 'نظرسنجی به حالت تعلیق درآمد.',
        'info'
      );
    }
  };

  const handleDeleteSurvey = async (surveyId: string) => {
    if (!window.confirm('آیا از حذف این نظرسنجی و پاسخ‌های آن اطمینان دارید؟')) return;
    const ok = await surveyService.deleteSurvey(surveyId);
    if (ok) {
      setSurveys((prev) => prev.filter((s) => s.id !== surveyId));
      onShowToast('نظرسنجی با موفقیت حذف شد.', 'success');
    } else {
      onShowToast('خطا در حذف نظرسنجی', 'error');
    }
  };

  const handleCreateSurvey = async (data: Partial<Survey>): Promise<boolean> => {
    const created = await surveyService.createSurvey(data);
    if (created) {
      setSurveys((prev) => [created, ...prev]);
      setSelectedSurveyId(created.id);
      return true;
    }
    return false;
  };

  // Unit handlers
  const handleCreateUnit = async (data: Partial<OrganizationalUnit>) => {
    const created = await surveyService.createUnit(data);
    if (created) {
      await loadData();
      return created;
    }
    return null;
  };

  const handleUpdateUnit = async (id: string, data: Partial<OrganizationalUnit>) => {
    const updated = await surveyService.updateUnit(id, data);
    if (updated) {
      await loadData();
      return updated;
    }
    return null;
  };

  const handleDeleteUnit = async (id: string, transferChildrenToId?: string | null) => {
    const res = await surveyService.deleteUnit(id, transferChildrenToId);
    if (res.success) {
      await loadData();
    }
    return res;
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation & RBAC Role Switcher (Hidden in respondent runner mode) */}
      {activeSubTab !== 'runner' ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-3 sm:p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Sub Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
              <button
                onClick={() => setActiveSubTab('surveys')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'surveys'
                    ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ClipboardCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>فهرست نظرسنجی‌ها</span>
                <span className="font-mono text-[11px] bg-slate-200/70 dark:bg-slate-700 px-1.5 py-0.2 rounded-md">
                  {surveys.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSubTab('units')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'units'
                    ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FolderTree className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>ساختار درختی سازمان و واحدها</span>
                <span className="font-mono text-[11px] bg-slate-200/70 dark:bg-slate-700 px-1.5 py-0.2 rounded-md">
                  {units.length}
                </span>
              </button>

              {selectedSurvey && (
                <>
                  <button
                    onClick={() => setActiveSubTab('builder')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeSubTab === 'builder'
                        ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Edit3 className="w-4 h-4 text-amber-500" />
                    <span>طراحی سؤالات پرسشنامه</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('analytics')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeSubTab === 'analytics'
                        ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-emerald-500" />
                    <span>داشبورد تحلیلی و مقایسه‌ای</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('runner')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Send className="w-4 h-4 text-purple-500" />
                    <span>پاسخ‌دهی به نظرسنجی</span>
                  </button>
                </>
              )}
              {activeSubTab === 'unit_portal' && (
                <button
                  onClick={() => setActiveSubTab('unit_portal')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-xs cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  <span>پرتال اختصاصی واحد</span>
                </button>
              )}
            </div>

            {/* Right: RBAC Switcher & Quick Create */}
            <div className="flex items-center gap-2">
              <SurveyRoleSwitcher
                currentProfile={currentProfile}
                onSelectProfile={(p) => surveyService.setRoleProfile(p)}
              />

              {currentProfile.role !== 'respondent' && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">نظرسنجی جدید</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Minimal Top Bar for Respondent Runner Mode */
        <div className="flex items-center justify-between px-2 py-1 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-700 dark:text-slate-300">
              نمای اختصاصی ثبت نظر و پاسخ‌دهی
            </span>
          </div>

          <button
            onClick={() => setActiveSubTab('surveys')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>بازگشت به پنل نظرسنجی‌ها</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div>
        {activeSubTab === 'surveys' && (
          <SurveyListView
            surveys={surveys}
            units={units}
            currentProfile={currentProfile}
            onSelectSurveyForBuilder={handleOpenBuilder}
            onSelectSurveyForAnalytics={handleOpenAnalytics}
            onOpenPublicSurvey={handleOpenPublicSurvey}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenShareModal={handleOpenShareSurvey}
            onCloneSurvey={handleCloneSurvey}
            onToggleStatus={handleToggleStatus}
            onDeleteSurvey={handleDeleteSurvey}
            onShowToast={onShowToast}
          />
        )}

        {activeSubTab === 'units' && (
          <OrganizationUnitsView
            units={units}
            onRefresh={loadData}
            onCreateUnit={handleCreateUnit}
            onUpdateUnit={handleUpdateUnit}
            onDeleteUnit={handleDeleteUnit}
            onOpenShareModal={handleOpenShareUnit}
            onShowToast={onShowToast}
          />
        )}

        {activeSubTab === 'unit_portal' && portalUnitId && (
          <div className="bg-slate-50 dark:bg-slate-950/60 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800">
            <UnitPortalView
              unitIdOrCode={portalUnitId}
              onSelectSurvey={(srvId, uId) => {
                setSelectedSurveyId(srvId);
                setPublicUnitId(uId);
                setActiveSubTab('runner');
              }}
              onOpenShareModal={handleOpenShareUnit}
              onShowToast={onShowToast}
              onBackToMain={() => setActiveSubTab('units')}
            />
          </div>
        )}

        {activeSubTab === 'builder' && selectedSurvey && (
          <SurveyBuilderView
            survey={selectedSurvey}
            units={units}
            onSaveSurvey={handleSaveSurvey}
            onBackToSurveys={() => setActiveSubTab('surveys')}
            onPreviewSurvey={() => setActiveSubTab('runner')}
            onShowToast={onShowToast}
          />
        )}

        {activeSubTab === 'analytics' && selectedSurvey && (
          <SurveyAnalyticsView
            survey={selectedSurvey}
            units={units}
            currentProfile={currentProfile}
            onBackToSurveys={() => setActiveSubTab('surveys')}
            onOpenPublicSurvey={handleOpenPublicSurvey}
            onShowToast={onShowToast}
          />
        )}

        {activeSubTab === 'runner' && selectedSurvey && (
          <div className="bg-slate-50 dark:bg-slate-950/60 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800">
            <SurveyPublicForm
              survey={selectedSurvey}
              units={units}
              defaultUnitId={publicUnitId}
              onBackToDashboard={() => setActiveSubTab('surveys')}
              onSubmitResponse={async (subData) => {
                const res = await surveyService.submitSurveyResponse(selectedSurvey.id, subData);
                if (res.success) {
                  onShowToast('پاسخ نظرسنجی با موفقیت ثبت شد.', 'success');
                  await loadData();
                }
                return res;
              }}
              onShowToast={onShowToast}
            />
          </div>
        )}
      </div>

      {/* Create Survey Modal */}
      <CreateSurveyModal
        isOpen={isCreateModalOpen}
        units={units}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateSurvey}
        onShowToast={onShowToast}
      />

      {/* Survey & Unit Share / QR Code / Poster Modal */}
      <SurveyShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        survey={shareTargetSurvey}
        unit={shareTargetUnit}
        allSurveys={surveys}
        allUnits={units}
        onShowToast={onShowToast}
      />
    </div>
  );
};
