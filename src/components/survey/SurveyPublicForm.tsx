import React, { useState, useMemo, useEffect } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  ShieldCheck,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Send,
  Star,
  Sparkles,
  ArrowRight,
  Check,
  FileCheck2,
  UserCheck,
  BadgeCheck,
  Briefcase,
  User,
  RefreshCw,
  Search,
  Activity,
  Heart,
  Zap,
  Stethoscope,
  Layers,
  FolderTree,
  X,
  Camera,
  UploadCloud,
  Image as ImageIcon,
} from 'lucide-react';
import { Survey, OrganizationalUnit, StaffMember } from '../../types/survey';

interface SurveyPublicFormProps {
  survey: Survey;
  units: OrganizationalUnit[];
  defaultUnitId?: string;
  onBackToDashboard?: () => void;
  onSubmitResponse: (data: {
    unitId: string;
    answers: Record<string, any>;
    evaluatedStaff?: {
      id: string;
      fullName: string;
      personnelCode?: string;
      jobTitle?: string;
    };
    respondent?: { personnelCode?: string; fullName?: string; jobTitle?: string };
  }) => Promise<{ success: boolean; trackingCode?: string; message: string }>;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SurveyPublicForm: React.FC<SurveyPublicFormProps> = ({
  survey,
  units,
  defaultUnitId,
  onBackToDashboard,
  onSubmitResponse,
  onShowToast,
}) => {
  // Candidate Units that are assigned to this survey
  const allowedUnits = useMemo(() => {
    return units.filter(
      (u) =>
        survey.assignedUnitIds.includes(u.id) ||
        survey.assignedUnitIds.includes('unit-hosp-01') ||
        survey.assignedUnitIds.length === 0
    );
  }, [units, survey]);

  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    defaultUnitId || (allowedUnits.find((u) => u.id === 'unit-icu-01')?.id || allowedUnits[0]?.id || '')
  );

  const [selectedStaffMember, setSelectedStaffMember] = useState<StaffMember | null>(null);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'staff' | 'units'>('staff');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [unitSearchQuery, setUnitSearchQuery] = useState('');
  const [showUnitsSection, setShowUnitsSection] = useState(true);

  // Persistent / dynamic photos for unit cards & staff cards (supports adding photos to cards)
  const [unitPhotos, setUnitPhotos] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('survey_unit_photos');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [staffPhotos, setStaffPhotos] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('survey_staff_photos');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [questionPhotos, setQuestionPhotos] = useState<Record<string, string>>({});

  const handleUploadUnitPhoto = (unitId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUnitPhotos((prev) => {
        const next = { ...prev, [unitId]: dataUrl };
        try {
          localStorage.setItem('survey_unit_photos', JSON.stringify(next));
        } catch {}
        return next;
      });
      onShowToast('عکس کارت بخش با موفقیت بارگذاری شد.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadStaffPhoto = (staffId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setStaffPhotos((prev) => {
        const next = { ...prev, [staffId]: dataUrl };
        try {
          localStorage.setItem('survey_staff_photos', JSON.stringify(next));
        } catch {}
        return next;
      });
      onShowToast('عکس پرسنل با موفقیت ذخیره گردید.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadQuestionPhoto = (questionId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setQuestionPhotos((prev) => ({ ...prev, [questionId]: dataUrl }));
      onShowToast('عکس مستندات به این نظر پیوست شد.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQuestionPhoto = (questionId: string) => {
    setQuestionPhotos((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  // High quality default medical/ward images
  const DEFAULT_UNIT_IMAGES: Record<string, string> = {
    'unit-icu-01': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80',
    'unit-ccu-01': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=80',
    'unit-emg-01': 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
    'unit-int-01': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
    'unit-surg-01': 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&auto=format&fit=crop&q=80',
    'unit-ped-01': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
    'unit-or-01': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
    'unit-nurse-01': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&auto=format&fit=crop&q=80',
    'unit-hosp-01': 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&auto=format&fit=crop&q=80',
  };

  const DEFAULT_STAFF_AVATARS: Record<string, string> = {
    'staff-icu-01': 'https://images.unsplash.com/photo-1594824813589-98007e997235?w=200&auto=format&fit=crop&q=80',
    'staff-icu-02': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
    'staff-icu-03': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
    'staff-icu-04': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&auto=format&fit=crop&q=80',
    'staff-icu-05': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80',
    'staff-ccu-01': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&auto=format&fit=crop&q=80',
    'staff-ccu-02': 'https://images.unsplash.com/photo-1594824813589-98007e997235?w=200&auto=format&fit=crop&q=80',
    'staff-emg-01': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
    'staff-emg-02': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
  };

  // Icon mapper for units
  const getUnitIcon = (unit: OrganizationalUnit) => {
    const code = (unit.code || '').toUpperCase();
    const name = unit.name || '';
    if (code.includes('ICU')) return <Activity className="w-5 h-5 text-rose-500" />;
    if (code.includes('CCU')) return <Heart className="w-5 h-5 text-red-500" />;
    if (code.includes('EMG') || name.includes('اورژانس')) return <Zap className="w-5 h-5 text-amber-500" />;
    if (code.includes('NURSE') || name.includes('پرستاری')) return <Stethoscope className="w-5 h-5 text-indigo-500" />;
    if (code.includes('INT') || name.includes('داخلی')) return <UserCheck className="w-5 h-5 text-teal-500" />;
    return <Building2 className="w-5 h-5 text-indigo-500" />;
  };

  // Units displayed as visual cards (no dropdown)
  const displayUnits = useMemo(() => {
    // Exclude the root hospital summary card if multiple ward cards exist
    const base = allowedUnits.filter((u) => u.id !== 'unit-hosp-01' || allowedUnits.length === 1);
    if (!unitSearchQuery.trim()) return base;
    const q = unitSearchQuery.trim().toLowerCase();
    return base.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.code.toLowerCase().includes(q) ||
        (u.description && u.description.toLowerCase().includes(q))
    );
  }, [allowedUnits, unitSearchQuery]);

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [personnelCode, setPersonnelCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('کارشناس پرستاری');
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState<{
    trackingCode: string;
    message: string;
    evaluatedStaff?: {
      id: string;
      fullName: string;
      personnelCode?: string;
      jobTitle?: string;
    };
  } | null>(null);

  const DRAFT_STORAGE_KEY = `survey_draft_${survey.id}`;

  // Fallback nursing staff member data if unit lacks staffMembers
  const defaultNursingStaff: Record<string, StaffMember[]> = useMemo(
    () => ({
      'unit-icu-01': [
        {
          id: 'staff-icu-01',
          unitId: 'unit-icu-01',
          fullName: 'خانم فاطمه سلیمانی',
          personnelCode: 'N-1014',
          jobTitle: 'سرپرستار بخش مراقبت‌های ویژه (ICU)',
          roleInUnit: 'سرپرستار بخش',
          isActive: true,
        },
        {
          id: 'staff-icu-02',
          unitId: 'unit-icu-01',
          fullName: 'خانم نسترن نوری',
          personnelCode: 'N-2045',
          jobTitle: 'کارشناس ارشد پرستاری مراقبت‌های ویژه',
          roleInUnit: 'پرستار مسئول شیفت',
          isActive: true,
        },
        {
          id: 'staff-icu-03',
          unitId: 'unit-icu-01',
          fullName: 'آقای محمدمهدی طاهری',
          personnelCode: 'N-3088',
          jobTitle: 'کارشناس پرستاری بالینی',
          roleInUnit: 'پرستار بالینی',
          isActive: true,
        },
        {
          id: 'staff-icu-04',
          unitId: 'unit-icu-01',
          fullName: 'خانم سارا حسینی',
          personnelCode: 'N-4012',
          jobTitle: 'کارشناس پرستاری بالینی',
          roleInUnit: 'پرستار بالینی',
          isActive: true,
        },
        {
          id: 'staff-icu-05',
          unitId: 'unit-icu-01',
          fullName: 'آقای پیام احمدی',
          personnelCode: 'N-5091',
          jobTitle: 'بهیار بخش مراقبت‌های ویژه',
          roleInUnit: 'بهیار',
          isActive: true,
        },
      ],
      'unit-ccu-01': [
        {
          id: 'staff-ccu-01',
          unitId: 'unit-ccu-01',
          fullName: 'آقای محمدرضا کریمی',
          personnelCode: 'N-1088',
          jobTitle: 'سرپرستار بخش مراقبت‌های ویژه قلبی',
          roleInUnit: 'سرپرستار بخش',
          isActive: true,
        },
        {
          id: 'staff-ccu-02',
          unitId: 'unit-ccu-01',
          fullName: 'خانم الهام رضوی',
          personnelCode: 'N-2114',
          jobTitle: 'کارشناس پرستاری قلب و عروق',
          roleInUnit: 'پرستار مسئول شیفت',
          isActive: true,
        },
        {
          id: 'staff-ccu-03',
          unitId: 'unit-ccu-01',
          fullName: 'آقای حسین فرهمند',
          personnelCode: 'N-3155',
          jobTitle: 'کارشناس پرستاری بالینی',
          roleInUnit: 'پرستار بالینی',
          isActive: true,
        },
        {
          id: 'staff-ccu-04',
          unitId: 'unit-ccu-01',
          fullName: 'خانم رویا مرادی',
          personnelCode: 'N-4190',
          jobTitle: 'کارشناس پرستاری بالینی',
          roleInUnit: 'پرستار بالینی',
          isActive: true,
        },
      ],
      'unit-emg-01': [
        {
          id: 'staff-emg-01',
          unitId: 'unit-emg-01',
          fullName: 'آقای حمید حسینی',
          personnelCode: 'N-1120',
          jobTitle: 'سرپرستار بخش اورژانس و تروما',
          roleInUnit: 'سرپرستار بخش',
          isActive: true,
        },
        {
          id: 'staff-emg-02',
          unitId: 'unit-emg-01',
          fullName: 'خانم شیما زارع',
          personnelCode: 'N-2240',
          jobTitle: 'کارشناس پرستاری تریاژ اورژانس',
          roleInUnit: 'مسئول تریاژ',
          isActive: true,
        },
        {
          id: 'staff-emg-03',
          unitId: 'unit-emg-01',
          fullName: 'آقای داوود قاسمی',
          personnelCode: 'N-3310',
          jobTitle: 'کارشناس پرستاری احیا (CPR)',
          roleInUnit: 'پرستار اتاق احیا',
          isActive: true,
        },
        {
          id: 'staff-emg-04',
          unitId: 'unit-emg-01',
          fullName: 'خانم پروانه بهمنی',
          personnelCode: 'N-4425',
          jobTitle: 'کارشناس پرستاری بخش تحت نظر',
          roleInUnit: 'پرستار بالینی',
          isActive: true,
        },
      ],
      'unit-int-01': [
        {
          id: 'staff-int-01',
          unitId: 'unit-int-01',
          fullName: 'خانم زهرا نوری',
          personnelCode: 'N-1145',
          jobTitle: 'سرپرستار بخش بستری داخلی',
          roleInUnit: 'سرپرستار بخش',
          isActive: true,
        },
        {
          id: 'staff-int-02',
          unitId: 'unit-int-01',
          fullName: 'آقای علیرضا مقدسی',
          personnelCode: 'N-2280',
          jobTitle: 'کارشناس پرستاری داخلی',
          roleInUnit: 'پرستار بالینی',
          isActive: true,
        },
        {
          id: 'staff-int-03',
          unitId: 'unit-int-01',
          fullName: 'خانم مهسا کاظمی',
          personnelCode: 'N-3395',
          jobTitle: 'کارشناس پرستاری بالینی',
          roleInUnit: 'پرستار بالینی',
          isActive: true,
        },
      ],
    }),
    []
  );

  // Available staff members for the currently selected unit
  const availableStaff = useMemo(() => {
    if (!selectedUnitId) return [];
    const directUnit = units.find((u) => u.id === selectedUnitId);
    let list: StaffMember[] = [];

    if (directUnit?.staffMembers && directUnit.staffMembers.length > 0) {
      list = [...directUnit.staffMembers];
    } else if (defaultNursingStaff[selectedUnitId]) {
      list = [...defaultNursingStaff[selectedUnitId]];
    }

    // Also include staff from child wards if parent unit is selected (e.g. Nursing department)
    const childUnits = units.filter((u) => u.parentId === selectedUnitId);
    for (const child of childUnits) {
      if (child.staffMembers && child.staffMembers.length > 0) {
        list = [...list, ...child.staffMembers];
      } else if (defaultNursingStaff[child.id]) {
        list = [...list, ...defaultNursingStaff[child.id]];
      }
    }

    // Deduplicate
    const map = new Map<string, StaffMember>();
    list.forEach((m) => map.set(m.id, m));
    return Array.from(map.values());
  }, [selectedUnitId, units, defaultNursingStaff]);

  // Auto-select initial active staff member for the unit if none selected yet
  useEffect(() => {
    if (!selectedStaffMember && availableStaff.length > 0) {
      setSelectedStaffMember(availableStaff[0]);
    }
  }, [availableStaff, selectedStaffMember]);

  // Filtered staff list by search query
  const filteredStaff = useMemo(() => {
    if (!staffSearchQuery.trim()) return availableStaff;
    const q = staffSearchQuery.trim().toLowerCase();
    return availableStaff.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.personnelCode.toLowerCase().includes(q) ||
        (s.roleInUnit && s.roleInUnit.toLowerCase().includes(q)) ||
        (s.jobTitle && s.jobTitle.toLowerCase().includes(q))
    );
  }, [availableStaff, staffSearchQuery]);

  // Check if survey contains staff-specific questions or sections
  const hasStaffEvaluation = useMemo(() => {
    return (
      survey.evaluationTargetMode === 'staff_evaluation' ||
      survey.evaluationTargetMode === 'both' ||
      survey.questions.some((q) => q.isStaffSpecific) ||
      survey.sections.some((s) => s.id === 'sec-staff-eval')
    );
  }, [survey]);

  // Helper to personalize question title with selected staff member
  const formatQuestionTitle = (rawTitle: string, isStaffSpecific?: boolean) => {
    if (!selectedStaffMember) return rawTitle;
    let title = rawTitle;
    if (title.includes('{نام فرد}')) {
      title = title.replace(/{نام فرد}/g, selectedStaffMember.fullName);
    }
    if (title.includes('{همکار}')) {
      title = title.replace(
        /{همکار}/g,
        `${selectedStaffMember.fullName} (${selectedStaffMember.roleInUnit || selectedStaffMember.jobTitle})`
      );
    }
    if (title.includes('همکار منتخب')) {
      title = title.replace(
        /همکار منتخب/g,
        `${selectedStaffMember.fullName} (${selectedStaffMember.roleInUnit || selectedStaffMember.jobTitle})`
      );
    }
    if (isStaffSpecific && !title.includes(selectedStaffMember.fullName)) {
      title = `${title} [ارزیابی: ${selectedStaffMember.fullName}]`;
    }
    return title;
  };

  // Restore draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.answers === 'object' && Object.keys(parsed.answers).length > 0) {
          setAnswers(parsed.answers);
          if (parsed.unitId && !defaultUnitId) setSelectedUnitId(parsed.unitId);
          if (parsed.personnelCode) setPersonnelCode(parsed.personnelCode);
          if (parsed.fullName) setFullName(parsed.fullName);
          if (parsed.selectedStaffMember) setSelectedStaffMember(parsed.selectedStaffMember);
          setHasRestoredDraft(true);
        }
      }
    } catch {
      // ignore
    }
  }, [survey.id, defaultUnitId]);

  // Autosave draft to localStorage
  useEffect(() => {
    if (Object.keys(answers).length > 0 && !submittedReceipt) {
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            answers,
            unitId: selectedUnitId,
            personnelCode,
            fullName,
            selectedStaffMember,
            savedAt: new Date().toISOString(),
          })
        );
      } catch {
        // ignore
      }
    }
  }, [answers, selectedUnitId, personnelCode, fullName, selectedStaffMember, survey.id, submittedReceipt]);

  const currentSection = survey.sections[activeSectionIndex] || survey.sections[0];

  const evalRuleCondition = (triggerVal: any, operator: string, ruleVal: any): boolean => {
    switch (operator) {
      case 'equals':
        return triggerVal !== undefined && String(triggerVal) === String(ruleVal);
      case 'not_equals':
        return triggerVal !== undefined && String(triggerVal) !== String(ruleVal);
      case 'contains':
        return (
          triggerVal !== undefined &&
          String(triggerVal).toLowerCase().includes(String(ruleVal).toLowerCase())
        );
      case 'greater_than':
        return triggerVal !== undefined && Number(triggerVal) > Number(ruleVal);
      case 'less_than':
        return triggerVal !== undefined && Number(triggerVal) < Number(ruleVal);
      case 'is_empty':
        return (
          triggerVal === undefined ||
          triggerVal === '' ||
          (Array.isArray(triggerVal) && triggerVal.length === 0)
        );
      case 'is_not_empty':
        return (
          triggerVal !== undefined &&
          triggerVal !== '' &&
          (!Array.isArray(triggerVal) || triggerVal.length > 0)
        );
      default:
        return triggerVal !== undefined && String(triggerVal) === String(ruleVal);
    }
  };

  // Evaluate conditional visibility for questions
  const isQuestionVisible = (qId: string) => {
    // Check if any rules affect this question
    for (const q of survey.questions) {
      if (!q.rules) continue;
      for (const rule of q.rules) {
        const triggerVal = answers[rule.triggerQuestionId];
        const isTriggerMet = evalRuleCondition(triggerVal, rule.operator, rule.value);

        // Direct target match
        if (rule.targetQuestionId === qId) {
          if (isTriggerMet) {
            if (rule.action === 'show') return true;
            if (rule.action === 'hide') return false;
          } else if (rule.elseAction) {
            if (rule.elseAction === 'show') return true;
            if (rule.elseAction === 'hide') return false;
          }
        }

        // Else target match
        if (rule.elseTargetQuestionId === qId && !isTriggerMet) {
          if (rule.elseAction === 'show') return true;
          if (rule.elseAction === 'hide') return false;
        }
      }
    }
    return true;
  };

  const currentSectionQuestions = useMemo(() => {
    if (!currentSection) return [];
    return survey.questions
      .filter((q) => q.sectionId === currentSection.id)
      .filter((q) => isQuestionVisible(q.id));
  }, [currentSection, survey.questions, answers]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNextSection = () => {
    // Validate required questions in current section
    const missing = currentSectionQuestions.find(
      (q) =>
        q.required &&
        (answers[q.id] === undefined ||
          answers[q.id] === '' ||
          (Array.isArray(answers[q.id]) && answers[q.id].length === 0))
    );

    if (missing) {
      onShowToast(`لطفاً به سؤال «${missing.title}» پاسخ دهید.`, 'error');
      return;
    }

    // Check if any question rule in current section triggers jump_to_section
    for (const q of currentSectionQuestions) {
      if (!q.rules) continue;
      for (const rule of q.rules) {
        const triggerVal = answers[q.id];
        if (evalRuleCondition(triggerVal, rule.operator, rule.value)) {
          if (rule.action === 'jump_to_section' && rule.targetSectionId) {
            const targetIdx = survey.sections.findIndex((s) => s.id === rule.targetSectionId);
            if (targetIdx !== -1) {
              setActiveSectionIndex(targetIdx);
              window.scrollTo({ top: 0, behavior: 'smooth' });
              return;
            }
          }
        }
      }
    }

    if (activeSectionIndex < survey.sections.length - 1) {
      setActiveSectionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevSection = () => {
    if (activeSectionIndex > 0) {
      setActiveSectionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId) {
      onShowToast('لطفاً واحد سازمانی خود را انتخاب فرمایید.', 'error');
      return;
    }

    // Check all required questions across all sections
    for (const q of survey.questions) {
      if (q.required && isQuestionVisible(q.id)) {
        const val = answers[q.id];
        if (val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
          onShowToast(`لطفاً سؤال الزامی «${q.title}» را تکمیل فرمایید.`, 'error');
          return;
        }
      }
    }

    // If survey contains staff-specific questions or evaluation mode, ensure staff member is chosen
    if (hasStaffEvaluation && !selectedStaffMember) {
      onShowToast('لطفاً همکار مورد نظر خود در بخش را جهت ثبت ارزیابی انتخاب فرمایید.', 'error');
      return;
    }

    setIsSubmitting(true);
    const respondentData =
      survey.anonymityMode !== 'anonymous'
        ? {
            personnelCode: personnelCode || undefined,
            fullName: fullName || undefined,
            jobTitle: jobTitle || undefined,
          }
        : undefined;

    const evaluatedStaffData = selectedStaffMember
      ? {
          id: selectedStaffMember.id,
          fullName: selectedStaffMember.fullName,
          personnelCode: selectedStaffMember.personnelCode,
          jobTitle: selectedStaffMember.jobTitle,
        }
      : undefined;

    const res = await onSubmitResponse({
      unitId: selectedUnitId,
      answers,
      evaluatedStaff: evaluatedStaffData,
      respondent: respondentData,
    });

    setIsSubmitting(false);

    if (res.success && res.trackingCode) {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // ignore
      }
      setSubmittedReceipt({
        trackingCode: res.trackingCode,
        message: res.message,
        evaluatedStaff: evaluatedStaffData,
      });
      onShowToast('پاسخ نظرسنجی با موفقیت ثبت شد.', 'success');
    } else {
      onShowToast(res.message || 'خطا در ثبت پاسخ نظرسنجی', 'error');
    }
  };

  // Render Inactive / Paused Survey Screen
  if (survey.status !== 'active') {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900/60 text-center space-y-4 shadow-sm animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">
          این نظرسنجی در حال حاضر غیرفعال یا متوقف شده است
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
          نظرسنجی «{survey.title}» موقتاً در وضعیت {survey.status === 'paused' ? 'متوقف‌شده' : 'پیش‌نویس'} قرار دارد و امکان ثبت پاسخ جدید برای آن وجود ندارد.
        </p>
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            بازگشت به پنل
          </button>
        )}
      </div>
    );
  }

  // Render Submitted Receipt Screen
  if (submittedReceipt) {
    const unitObj = units.find((u) => u.id === selectedUnitId);

    const handleCopyTracking = () => {
      navigator.clipboard.writeText(submittedReceipt.trackingCode);
      setCopiedTracking(true);
      onShowToast('کد پیگیری در حافظه کپی شد.', 'success');
      setTimeout(() => setCopiedTracking(false), 2500);
    };

    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in zoom-in-95 duration-200">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200/90 dark:border-slate-800 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              پاسخ شما با موفقیت در سامانه ثبت شد
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {submittedReceipt.message}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 max-w-md mx-auto space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">کد پیگیری نظرسنجی:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm tracking-wider">
                  {submittedReceipt.trackingCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyTracking}
                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors cursor-pointer"
                  title="کپی کد رهگیری"
                >
                  {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ClipboardCheck className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">بخش و واحد منتسب:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {unitObj ? unitObj.name : 'واحد سازمانی'}
              </span>
            </div>

            {submittedReceipt.evaluatedStaff && (
              <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-2.5">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>همکار ارزیابی‌شده:</span>
                </span>
                <span className="font-extrabold text-indigo-700 dark:text-indigo-400">
                  {submittedReceipt.evaluatedStaff.fullName}
                  {submittedReceipt.evaluatedStaff.jobTitle && (
                    <span className="text-[11px] font-normal text-slate-500 mr-1">
                      ({submittedReceipt.evaluatedStaff.jobTitle})
                    </span>
                  )}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">سطح محرمانگی:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {survey.anonymityMode === 'anonymous' ? 'ناشناس' : 'محرمانه سازمانی'}
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                بازگشت به پنل مدیریت
              </button>
            )}

            {hasStaffEvaluation && (
              <button
                onClick={() => {
                  setSubmittedReceipt(null);
                  setAnswers({});
                  setSelectedStaffMember(null);
                  setActiveSectionIndex(0);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ارزیابی همکار دیگر در این بخش</span>
              </button>
            )}

            <button
              onClick={() => {
                setSubmittedReceipt(null);
                setAnswers({});
                setActiveSectionIndex(0);
              }}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              ثبت پاسخ جدید
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedUnitObj = units.find((u) => u.id === selectedUnitId);
  const progressPercent = Math.round(((activeSectionIndex + 1) / survey.sections.length) * 100);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20">
      {/* Questionnaire Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4">
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>بازگشت به پنل</span>
          </button>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {survey.code}
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>نظرسنجی محرمانه و محافظت‌شده</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
            {survey.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {survey.description}
          </p>
        </div>

        {/* Compact Context & Target Indicator Bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              {selectedUnitObj ? getUnitIcon(selectedUnitObj) : <Building2 className="w-4 h-4" />}
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-semibold">بخش انتخابی:</span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              {selectedUnitObj ? selectedUnitObj.name : 'انتخاب نشده'}
            </span>

            {selectedStaffMember && (
              <>
                <span className="text-slate-300 dark:text-slate-700 mx-1">•</span>
                <span className="text-slate-500 dark:text-slate-400 font-semibold">ارزیابی همکار:</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                  {selectedStaffMember.fullName}
                  {selectedStaffMember.roleInUnit && (
                    <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mr-1">
                      ({selectedStaffMember.roleInUnit})
                    </span>
                  )}
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowUnitsSection((prev) => !prev)}
            className="text-[11px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-bold flex items-center gap-1.5 cursor-pointer hover:underline self-start sm:self-auto py-1 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{showUnitsSection ? 'بستن کارت‌های بخش و همکار' : 'نمایش کارت‌های بخش و همکار'}</span>
          </button>
        </div>

        {/* Restored Draft Banner */}
        {hasRestoredDraft && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>پیش‌نویس ذخیره‌شده قبلی شما به صورت خودکار بازیابی گردید.</span>
            </div>
            <button
              type="button"
              onClick={() => setHasRestoredDraft(false)}
              className="text-blue-500 hover:text-blue-700 font-bold text-[11px] cursor-pointer"
            >
              متوجه شدم
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <div className="pt-2 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>
              محور {activeSectionIndex + 1} از {survey.sections.length}: <strong>{currentSection?.title}</strong>
            </span>
            <span>{progressPercent}٪ تکمیل شده</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 1. Unit Cards Section (Cards with Image & Add Photo Capability) */}
      {showUnitsSection && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    انتخاب بخش سازمانی (کارت‌های بخش با امکان افزودن عکس)
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    روی کارت بخش کلیک فرمایید. با دکمه دوربین می‌توانید برای هر کارت، عکس اختصاصی اضافه کنید.
                  </p>
                </div>
              </div>

              {displayUnits.length > 4 && (
                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={unitSearchQuery}
                    onChange={(e) => setUnitSearchQuery(e.target.value)}
                    placeholder="جست‌وجوی بخش..."
                    className="w-full pr-8 pl-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Units Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {displayUnits.map((u) => {
                const isSelected = selectedUnitId === u.id;
                const img = unitPhotos[u.id] || u.imageUrl || DEFAULT_UNIT_IMAGES[u.id];

                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUnitId(u.id)}
                    className={`group relative rounded-2xl border text-right transition-all overflow-hidden cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-600 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xs'
                    }`}
                  >
                    {/* Card Image Banner */}
                    <div className="relative h-28 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      {img ? (
                        <img
                          src={img}
                          alt={u.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-indigo-100 to-slate-100 dark:from-slate-800 dark:to-indigo-950/40 text-indigo-500">
                          {getUnitIcon(u)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Add / Change Photo Button */}
                      <label
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        title="بارگذاری یا تغییر عکس این کارت"
                      >
                        <Camera className="w-3 h-3 text-amber-300" />
                        <span>{img ? 'تغییر عکس' : 'افزودن عکس'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadUnitPhoto(u.id, file);
                          }}
                        />
                      </label>

                      {/* Selection Check Badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>انتخاب شده</span>
                        </div>
                      )}

                      {/* Code Badge */}
                      <div className="absolute bottom-2 right-2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200">
                        {u.code}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-3 space-y-1">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white block line-clamp-1">
                        {u.name}
                      </span>
                      {u.managerName && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          مسئول: {u.managerName}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Staff Cards Section (If unit has staff) */}
          {availableStaff.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      کادر و همکاران «{selectedUnitObj?.name || 'این بخش'}» (کارت همکار با افزودن عکس)
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      همکار مورد نظر برای ثبت بازخورد را انتخاب کنید و در صورت نیاز، عکس پرسنلی را در کارت بارگذاری فرمایید.
                    </p>
                  </div>
                </div>

                {availableStaff.length > 4 && (
                  <input
                    type="text"
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    placeholder="جست‌وجوی همکار..."
                    className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 w-40"
                  />
                )}
              </div>

              {/* Staff Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredStaff.map((staff) => {
                  const isSelected = selectedStaffMember?.id === staff.id;
                  const avatar = staffPhotos[staff.id] || staff.avatarUrl || DEFAULT_STAFF_AVATARS[staff.id];

                  return (
                    <div
                      key={staff.id}
                      onClick={() => setSelectedStaffMember(staff)}
                      className={`group relative p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-600 dark:border-indigo-500 shadow-sm ring-2 ring-indigo-500/20'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={staff.fullName}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm shadow-2xs">
                              {staff.fullName.charAt(0) || '👤'}
                            </div>
                          )}

                          {/* Add Photo to Staff Card */}
                          <label
                            onClick={(e) => e.stopPropagation()}
                            className="absolute -bottom-1 -left-1 p-1 rounded-full bg-slate-900/80 hover:bg-black text-white cursor-pointer shadow-xs"
                            title="افزودن یا تغییر عکس همکار"
                          >
                            <Camera className="w-2.5 h-2.5 text-amber-300" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadStaffPhoto(staff.id, file);
                              }}
                            />
                          </label>
                        </div>

                        <div className="min-w-0">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white block truncate">
                            {staff.fullName}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                            {staff.roleInUnit || staff.jobTitle}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            کد: {staff.personnelCode}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Target Selector Modal (If triggered) */}
      {isTargetModalOpen && (
        <div className="fixed inset-0 z-50 p-4 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  انتخاب بخش و همکار (کارت با امکان افزودن عکس)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTargetModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setModalTab('units')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  modalTab === 'units'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                ۱. بخش سازمانی ({displayUnits.length})
              </button>
              <button
                type="button"
                onClick={() => setModalTab('staff')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  modalTab === 'staff'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                ۲. کادر و پرسنل بخش ({availableStaff.length})
              </button>
            </div>

            {/* Tab 1: Units Grid (Cards with Photo) */}
            {modalTab === 'units' && (
              <div className="overflow-y-auto space-y-3 flex-1 pr-1">
                <p className="text-xs text-slate-500">جهت تغییر بخش، روی کارت مورد نظر کلیک فرمایید:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {displayUnits.map((u) => {
                    const isSelected = selectedUnitId === u.id;
                    const img = unitPhotos[u.id] || u.imageUrl || DEFAULT_UNIT_IMAGES[u.id];

                    return (
                      <div
                        key={u.id}
                        onClick={() => {
                          setSelectedUnitId(u.id);
                          setModalTab('staff');
                        }}
                        className={`group relative rounded-2xl border text-right transition-all overflow-hidden cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-600 shadow-xs ring-1 ring-indigo-500/20'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        <div className="relative h-20 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          {img ? (
                            <img src={img} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-indigo-500">
                              {getUnitIcon(u)}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <label
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 hover:bg-black text-white text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Camera className="w-2.5 h-2.5 text-amber-300" />
                            <span>عکس</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadUnitPhoto(u.id, file);
                              }}
                            />
                          </label>
                        </div>
                        <div className="p-2.5 flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {u.name}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Staff Grid (Cards with Photo) */}
            {modalTab === 'staff' && (
              <div className="overflow-y-auto space-y-3 flex-1 pr-1">
                <p className="text-xs text-slate-500">
                  همکار مورد نظر در «{selectedUnitObj?.name || 'این بخش'}» را انتخاب کنید:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredStaff.map((staff) => {
                    const isSelected = selectedStaffMember?.id === staff.id;
                    const avatar = staffPhotos[staff.id] || staff.avatarUrl || DEFAULT_STAFF_AVATARS[staff.id];

                    return (
                      <div
                        key={staff.id}
                        onClick={() => {
                          setSelectedStaffMember(staff);
                          setIsTargetModalOpen(false);
                        }}
                        className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-600 shadow-xs ring-1 ring-indigo-500/20'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            {avatar ? (
                              <img src={avatar} alt={staff.fullName} className="w-10 h-10 rounded-xl object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                                {staff.fullName.charAt(0) || '👤'}
                              </div>
                            )}
                            <label
                              onClick={(e) => e.stopPropagation()}
                              className="absolute -bottom-1 -left-1 p-0.5 rounded-full bg-black text-white cursor-pointer"
                            >
                              <Camera className="w-2.5 h-2.5 text-amber-300" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleUploadStaffPhoto(staff.id, file);
                                }}
                              />
                            </label>
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                              {staff.fullName}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                              {staff.roleInUnit || staff.jobTitle}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsTargetModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                تأیید و بازگشت به سؤالات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Section Questions */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base sm:text-lg font-black text-indigo-700 dark:text-indigo-400">
              {currentSection?.title}
            </h3>
            {currentSection?.description && (
              <p className="text-xs text-slate-400 mt-1">{currentSection.description}</p>
            )}
          </div>

          {/* Question List */}
          <div className="space-y-6">
            {currentSectionQuestions.map((question, qIdx) => {
              const currentVal = answers[question.id];
              const isStaffTargetQ = question.isStaffSpecific || currentSection?.id === 'sec-staff-eval';

              return (
                <div
                  key={question.id}
                  className={`space-y-3 p-4 sm:p-5 rounded-2xl border transition-all animate-in fade-in duration-150 ${
                    isStaffTargetQ
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 ring-1 ring-indigo-500/10'
                      : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/80'
                  }`}
                >
                  <div>
                    {/* Staff-Specific Indicator Badge */}
                    {isStaffTargetQ && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300/80 dark:border-indigo-800 flex items-center gap-1.5 shadow-xs">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                          <span>
                            ارزیابی عملکرد: {selectedStaffMember ? `${selectedStaffMember.fullName} (${selectedStaffMember.roleInUnit || selectedStaffMember.jobTitle})` : 'نیازمند انتخاب همکار از لیست بالا'}
                          </span>
                        </span>
                      </div>
                    )}

                    <label className="font-extrabold text-sm text-slate-900 dark:text-white flex items-start gap-1.5 leading-relaxed">
                      <span className="text-indigo-600 font-mono text-xs mt-0.5">#{qIdx + 1}</span>
                      <span>{formatQuestionTitle(question.title, isStaffTargetQ)}</span>
                      {question.required && <span className="text-rose-500">*</span>}
                    </label>
                    {question.description && (
                      <p className="text-xs text-slate-400 mt-1">{question.description}</p>
                    )}
                  </div>

                  {/* Input Types */}
                  {/* 1. Likert Scale */}
                  {question.type === 'likert' && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                      {question.options?.map((opt) => {
                        const isSelected = String(currentVal) === String(opt.value);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleAnswerChange(question.id, opt.value)}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 font-bold'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                            }`}
                          >
                            <span className="text-xs block font-bold">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 2. Star Rating */}
                  {question.type === 'star_rating' && (
                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((starNum) => {
                        const isFilled = (currentVal || 0) >= starNum;
                        return (
                          <button
                            key={starNum}
                            type="button"
                            onClick={() => handleAnswerChange(question.id, starNum)}
                            className="p-1 rounded-lg transition-transform hover:scale-110 cursor-pointer"
                          >
                            <Star
                              className={`w-7 h-7 ${
                                isFilled
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          </button>
                        );
                      })}
                      {currentVal && (
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 mr-2">
                          ({currentVal} ستاره از ۵)
                        </span>
                      )}
                    </div>
                  )}

                  {/* 3. NPS Scale (0 to 10) */}
                  {question.type === 'nps' && (
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
                          const isSelected = currentVal === n;
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => handleAnswerChange(question.id, n)}
                              className={`py-2 rounded-xl border text-center font-mono font-bold text-xs transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-black scale-105'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                              }`}
                            >
                              {n}
                            </button>
                          );
                        })}
                      </div>
                      {question.npsLabels && (
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 px-1">
                          <span>{question.npsLabels.low}</span>
                          <span>{question.npsLabels.high}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. Yes / No */}
                  {question.type === 'yes_no' && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {question.options?.map((opt) => {
                        const isSelected = currentVal === opt.value;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleAnswerChange(question.id, opt.value)}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-bold'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                            }`}
                          >
                            <span className="text-xs font-bold">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 5. Single Choice */}
                  {question.type === 'single_choice' && (
                    <div className="space-y-1.5 pt-1">
                      {question.options?.map((opt) => {
                        const isSelected = currentVal === opt.value;
                        return (
                          <label
                            key={opt.id}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-bold'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={question.id}
                              value={opt.value}
                              checked={isSelected}
                              onChange={() => handleAnswerChange(question.id, opt.value)}
                              className="w-4 h-4 text-indigo-600"
                            />
                            <span>{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* 6. Multiple Choice */}
                  {question.type === 'multi_choice' && (
                    <div className="space-y-1.5 pt-1">
                      {question.options?.map((opt) => {
                        const arr = Array.isArray(currentVal) ? currentVal : [];
                        const isChecked = arr.includes(opt.value);
                        return (
                          <label
                            key={opt.id}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-bold'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const nextArr = e.target.checked
                                  ? [...arr, opt.value]
                                  : arr.filter((x: any) => x !== opt.value);
                                handleAnswerChange(question.id, nextArr);
                              }}
                              className="w-4 h-4 text-indigo-600 rounded-sm"
                            />
                            <span>{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* 7. Long Text / Textarea */}
                  {question.type === 'long_text' && (
                    <textarea
                      rows={3}
                      placeholder={question.placeholder || 'پاسخ یا نظر خود را بنویسید...'}
                      value={currentVal || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-indigo-500"
                    />
                  )}

                  {/* 8. Short Text */}
                  {question.type === 'short_text' && (
                    <input
                      type="text"
                      placeholder={question.placeholder || 'پاسخ کوتاه...'}
                      value={currentVal || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-indigo-500"
                    />
                  )}

                  {/* 9. Rating 1 to 5 */}
                  {question.type === 'rating_5' && (
                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((num) => {
                        const isSelected = currentVal === num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleAnswerChange(question.id, num)}
                            className={`w-11 h-11 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-black scale-105'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 10. Rating 1 to 10 */}
                  {question.type === 'rating_10' && (
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                        const isSelected = currentVal === num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleAnswerChange(question.id, num)}
                            className={`py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-black scale-105'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 11. Single Select Choice Cards (No Dropdown) */}
                  {question.type === 'dropdown' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                      {question.options?.map((opt) => {
                        const isSelected = String(currentVal) === String(opt.value);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleAnswerChange(question.id, opt.value)}
                            className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-600 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs ring-1 ring-indigo-500/30'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                            }`}
                          >
                            <span className="text-xs">{opt.label}</span>
                            {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 12. Date Picker */}
                  {question.type === 'date' && (
                    <input
                      type="date"
                      value={currentVal || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-full sm:w-64 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-indigo-500"
                    />
                  )}

                  {/* 13. Number Input */}
                  {question.type === 'number' && (
                    <input
                      type="number"
                      placeholder={question.placeholder || 'عدد مورد نظر را وارد نمایید...'}
                      value={currentVal || ''}
                      min={question.min}
                      max={question.max}
                      onChange={(e) => handleAnswerChange(question.id, Number(e.target.value))}
                      className="w-full sm:w-64 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  )}

                  {/* 14. Matrix Question */}
                  {question.type === 'matrix' && (
                    <div className="overflow-x-auto pt-1">
                      <table className="w-full text-xs text-center border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                            <th className="p-2 text-right font-medium text-slate-500">معیار / سوال</th>
                            {(question.matrixColumns || question.options || [
                              { id: 'c1', label: 'خیلی کم', value: '1' },
                              { id: 'c2', label: 'کم', value: '2' },
                              { id: 'c3', label: 'متوسط', value: '3' },
                              { id: 'c4', label: 'زیاد', value: '4' },
                              { id: 'c5', label: 'خیلی زیاد', value: '5' },
                            ]).map((col) => (
                              <th key={col.id} className="p-2 font-medium text-slate-600 dark:text-slate-300">
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {(question.matrixRows || [
                            { id: 'r1', label: 'تجهیزات و ملزومات' },
                            { id: 'r2', label: 'پشتیبانی مدیریت' },
                            { id: 'r3', label: 'محیط فیزیکی و ایمنی' },
                          ]).map((row) => {
                            const matrixAnswers = currentVal || {};
                            const rowVal = matrixAnswers[row.id];
                            const cols = question.matrixColumns || question.options || [
                              { id: 'c1', label: 'خیلی کم', value: '1' },
                              { id: 'c2', label: 'کم', value: '2' },
                              { id: 'c3', label: 'متوسط', value: '3' },
                              { id: 'c4', label: 'زیاد', value: '4' },
                              { id: 'c5', label: 'خیلی زیاد', value: '5' },
                            ];
                            return (
                              <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                <td className="p-2.5 text-right font-semibold text-slate-800 dark:text-slate-200">
                                  {row.label}
                                </td>
                                {cols.map((col) => {
                                  const isChecked = rowVal === col.value;
                                  return (
                                    <td key={col.id} className="p-2">
                                      <input
                                        type="radio"
                                        name={`${question.id}_${row.id}`}
                                        checked={isChecked}
                                        onChange={() =>
                                          handleAnswerChange(question.id, {
                                            ...matrixAnswers,
                                            [row.id]: col.value,
                                          })
                                        }
                                        className="w-4 h-4 text-indigo-600 cursor-pointer"
                                      />
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 15. Ranking Question */}
                  {question.type === 'ranking' && (
                    <div className="space-y-2 pt-1">
                      <p className="text-[11px] text-slate-400">
                        ترتیب اولویت‌ها (برای جابه‌جایی روی موارد کلیک کنید):
                      </p>
                      <div className="space-y-1.5">
                        {(Array.isArray(currentVal) ? currentVal : (question.options || []).map((o) => o.label)).map(
                          (item: string, rankIdx: number, allItems: string[]) => (
                            <div
                              key={item}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                                  {rankIdx + 1}
                                </span>
                                <span className="font-medium text-slate-800 dark:text-slate-200">{item}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {rankIdx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...allItems];
                                      [next[rankIdx - 1], next[rankIdx]] = [next[rankIdx], next[rankIdx - 1]];
                                      handleAnswerChange(question.id, next);
                                    }}
                                    className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                                    title="بالاتر"
                                  >
                                    ▲
                                  </button>
                                )}
                                {rankIdx < allItems.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...allItems];
                                      [next[rankIdx + 1], next[rankIdx]] = [next[rankIdx], next[rankIdx + 1]];
                                      handleAnswerChange(question.id, next);
                                    }}
                                    className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                                    title="پایین‌تر"
                                  >
                                    ▼
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* 16. Image Choice */}
                  {question.type === 'image_choice' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                      {(question.options || [
                        { id: 'img-1', label: 'گزینه الف', value: 'opt_a' },
                        { id: 'img-2', label: 'گزینه ب', value: 'opt_b' },
                      ]).map((opt) => {
                        const isSelected = currentVal === opt.value;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleAnswerChange(question.id, opt.value)}
                            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer space-y-2 ${
                              isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 shadow-md font-bold'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                            }`}
                          >
                            <div className="w-full h-20 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                              🖼️
                            </div>
                            <span className="text-xs block font-bold">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 17. File Upload */}
                  {question.type === 'file_upload' && (
                    <div className="pt-1">
                      <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 rounded-2xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 transition-colors">
                        <span className="text-xl mb-1">📎</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {currentVal ? `فایل انتخاب شد: ${currentVal}` : 'برای بارگذاری فایل کلیک کنید'}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">فرمت‌های مجاز: PDF, PNG, JPG (حداکثر ۱۰ مگابایت)</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleAnswerChange(question.id, e.target.files[0].name);
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}

                  {/* 18. Info Block */}
                  {question.type === 'info_block' && (
                    <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs leading-relaxed">
                      ℹ️ {question.description || 'لطفاً پیش از ادامه، توضیحات این بخش را به دقت مطالعه فرمایید.'}
                    </div>
                  )}

                  {/* Photo Attachment Bar for this question / feedback item */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                    {questionPhotos[question.id] ? (
                      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs">
                        <img
                          src={questionPhotos[question.id]}
                          alt="ضمیمه نظر"
                          className="w-10 h-10 rounded-lg object-cover border border-indigo-300 dark:border-indigo-700 shadow-2xs"
                        />
                        <div>
                          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 block">
                            عکس ضمیمه این پاسخ گردید
                          </span>
                          <span className="text-[10px] text-slate-400">تصویر با فرم بازخورد شما ذخیره می‌شود</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestionPhoto(question.id)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 cursor-pointer mr-1"
                          title="حذف عکس"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 text-xs font-semibold cursor-pointer transition-colors bg-white/50 dark:bg-slate-800/50">
                        <Camera className="w-3.5 h-3.5 text-indigo-500" />
                        <span>افزودن عکس یا مدرک به این نظر (اختیاری)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadQuestionPhoto(question.id, file);
                          }}
                        />
                      </label>
                    )}
                    <span className="text-[10px] text-slate-400">
                      پاسخ شما به صورت خودکار ثبت می‌شود
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons between Sections */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {activeSectionIndex > 0 ? (
            <button
              type="button"
              onClick={handlePrevSection}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>محور قبلی</span>
            </button>
          ) : (
            <div />
          )}

          {activeSectionIndex < survey.sections.length - 1 ? (
            <button
              type="button"
              onClick={handleNextSection}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <span>محور بعدی</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'در حال ثبت...' : 'ارسال نهایی پاسخ‌ها'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
