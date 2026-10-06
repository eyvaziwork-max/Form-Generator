import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Sparkles,
  FileText,
  UserCheck,
  MessageSquare,
  Star,
  UserPlus,
  Calendar,
  Check,
  Search,
  Layers,
  Eye,
  Info,
  ChevronDown,
  ChevronUp,
  BookmarkCheck,
  GraduationCap,
  Mail,
  Phone,
  HelpCircle,
  Wand2,
  Bot,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Send,
} from 'lucide-react';
import { Form, FormField, FormFieldType } from '../../types/form';

interface CreateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (form: Partial<Form>) => void;
}

interface TemplateDefinition {
  id: string;
  name: string;
  category: 'all' | 'contact' | 'survey' | 'registration' | 'education' | 'event';
  categoryLabel: string;
  badge: string;
  description: string;
  color: string;
  bgLight: string;
  bgDark: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultTitle: string;
  defaultDescription: string;
  fields: FormField[];
}

export const CreateFormModal: React.FC<CreateFormModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [creationMode, setCreationMode] = useState<'template' | 'ai'>('template');

  // Manual / Template Mode States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('contact');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewingTemplateId, setPreviewingTemplateId] = useState<string | null>(null);

  // AI Assist States
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [aiGeneratedData, setAiGeneratedData] = useState<{
    title: string;
    description: string;
    fields: FormField[];
  } | null>(null);

  // Pre-built Form Templates
  const templates: TemplateDefinition[] = useMemo(() => [
    {
      id: 'contact',
      name: 'فرم تماس با ما و ارتباط با مشتریان',
      category: 'contact',
      categoryLabel: 'تماس و پشتیبانی',
      badge: '۵ فیلد استاندارد',
      description: 'دریافت پیام‌ها، استعلامات و درخواست‌های پشتیبانی کاربران با فیلدهای اعتبارسنجی‌شده',
      color: 'text-blue-600 dark:text-blue-400',
      bgLight: 'bg-blue-50',
      bgDark: 'dark:bg-blue-950/60',
      icon: MessageSquare,
      defaultTitle: 'فرم تماس با ما و ارسال درخواست',
      defaultDescription: 'جهت ارتباط با واحد پشتیبانی و مشاوره، لطفاً مشخصات و متن پیام خود را در فرم زیر ارسال فرمایید.',
      fields: [
        {
          id: `f-${Date.now()}-1`,
          type: 'fullname',
          label: 'نام و نام خانوادگی',
          name: 'fullname',
          placeholder: 'مثال: محمد رضایی',
          required: true,
          active: true,
          order: 1,
        },
        {
          id: `f-${Date.now()}-2`,
          type: 'email',
          label: 'پست الکترونیکی (ایمیل)',
          name: 'email',
          placeholder: 'name@example.com',
          description: 'پاسخ پیام شما به این آدرس ایمیل ارسال خواهد شد.',
          required: true,
          active: true,
          order: 2,
        },
        {
          id: `f-${Date.now()}-3`,
          type: 'phone',
          label: 'شماره تلفن همراه',
          name: 'phone',
          placeholder: '09123456789',
          required: true,
          active: true,
          order: 3,
          regexPattern: '^09[0-9]{9}$',
        },
        {
          id: `f-${Date.now()}-4`,
          type: 'select',
          label: 'موضوع درخواست / واحد مربوطه',
          name: 'department',
          placeholder: 'انتخاب کنید...',
          required: true,
          active: true,
          order: 4,
          options: [
            { id: 'opt_1', label: 'پشتیبانی فنی سامانه', value: 'tech_support' },
            { id: 'opt_2', label: 'امور مالی و فاکتور', value: 'billing' },
            { id: 'opt_3', label: 'مشاوره و فروش', value: 'sales' },
            { id: 'opt_4', label: 'پیشنهادات و سایر موارد', value: 'general' },
          ],
        },
        {
          id: `f-${Date.now()}-5`,
          type: 'textarea',
          label: 'متن پیام یا شرح درخواست',
          name: 'message',
          placeholder: 'توضیحات کامل درخواست خود را بنویسید...',
          required: true,
          active: true,
          order: 5,
        },
      ],
    },
    {
      id: 'survey',
      name: 'نظرسنجی و ارزیابی رضایت مشتریان',
      category: 'survey',
      categoryLabel: 'نظرسنجی و ارزیابی',
      badge: '۴ فیلد تحلیلی',
      description: 'سنجش کیفیت خدمات با امتیازدهی ستاره‌ای، گزینه‌های چندانتخابی و دریافت بازخورد متنی',
      color: 'text-amber-500 dark:text-amber-400',
      bgLight: 'bg-amber-50',
      bgDark: 'dark:bg-amber-950/60',
      icon: Star,
      defaultTitle: 'نظرسنجی کیفیت خدمات و ارزیابی رضایت',
      defaultDescription: 'دیدگاه‌های ارزشمند شما ما را در بهبود و توسعه روزافزون خدمات یاری می‌رساند.',
      fields: [
        {
          id: `f-${Date.now()}-1`,
          type: 'star_rating',
          label: 'میزان رضایت کلی شما از خدمات',
          name: 'satisfaction_stars',
          description: 'از ۱ تا ۵ ستاره امتیاز دهید',
          required: true,
          active: true,
          order: 1,
          defaultValue: 5,
        },
        {
          id: `f-${Date.now()}-2`,
          type: 'radio',
          label: 'آیا این سرویس را به دوستان و همکاران خود پیشنهاد می‌کنید؟',
          name: 'recommend_to_others',
          required: true,
          active: true,
          order: 2,
          options: [
            { id: 'rec_1', label: 'حتماً پیشنهاد می‌کنم (بسیار راضی)', value: 'strongly_agree' },
            { id: 'rec_2', label: 'شاید پیشنهاد دهم', value: 'neutral' },
            { id: 'rec_3', label: 'خیر پیشنهاد نمی‌کنم', value: 'disagree' },
          ],
        },
        {
          id: `f-${Date.now()}-3`,
          type: 'multiselect',
          label: 'نقاط قوت اصلی از نظر شما',
          name: 'strengths',
          placeholder: 'انتخاب یک یا چند مورد...',
          required: false,
          active: true,
          order: 3,
          options: [
            { id: 'str_1', label: 'سرعت و پاسخگویی سریع', value: 'speed' },
            { id: 'str_2', label: 'کیفیت بالا و بدون نقص', value: 'quality' },
            { id: 'str_3', label: 'رفتار محترمانه پشتیبانی', value: 'behavior' },
            { id: 'str_4', label: 'طراحی شیک و کاربری آسان', value: 'ux_design' },
          ],
        },
        {
          id: `f-${Date.now()}-4`,
          type: 'textarea',
          label: 'پیشنهادات و راهکارهای شما برای بهبود',
          name: 'feedback_text',
          placeholder: 'هرگونه پیشنهاد، انتقاد یا نکته تکمیلی را با ما در میان بگذارید...',
          required: false,
          active: true,
          order: 4,
        },
      ],
    },
    {
      id: 'registration',
      name: 'ثبت‌نام عمومی و عضویت در سامانه',
      category: 'registration',
      categoryLabel: 'ثبت‌نام و عضویت',
      badge: '۶ فیلد هویتی',
      description: 'فرم جامع جذب کاربران با فیلدهای هویتی، کدملی، موبایل، ایمیل و پذیرش قوانین',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgLight: 'bg-emerald-50',
      bgDark: 'dark:bg-emerald-950/60',
      icon: UserPlus,
      defaultTitle: 'فرم ثبت‌نام و عضویت در پورتال',
      defaultDescription: 'جهت ایجاد حساب کاربری و فعال‌سازی دسترسی، مشخصات هویتی خود را با دقت وارد فرمایید.',
      fields: [
        {
          id: `f-${Date.now()}-1`,
          type: 'fullname',
          label: 'نام و نام خانوادگی کامل',
          name: 'applicant_name',
          placeholder: 'مطابق شناسنامه وارد کنید',
          required: true,
          active: true,
          order: 1,
        },
        {
          id: `f-${Date.now()}-2`,
          type: 'national_id',
          label: 'کد ملی ۱۰ رقمی',
          name: 'national_id',
          placeholder: 'مثال: 0012345678',
          required: true,
          active: true,
          order: 2,
        },
        {
          id: `f-${Date.now()}-3`,
          type: 'phone',
          label: 'شماره تلفن همراه',
          name: 'mobile_number',
          placeholder: '09123456789',
          description: 'کد تأیید به این شماره پیامک خواهد شد',
          required: true,
          active: true,
          order: 3,
          regexPattern: '^09[0-9]{9}$',
        },
        {
          id: `f-${Date.now()}-4`,
          type: 'email',
          label: 'پست الکترونیکی',
          name: 'user_email',
          placeholder: 'user@example.com',
          required: true,
          active: true,
          order: 4,
        },
        {
          id: `f-${Date.now()}-5`,
          type: 'date',
          label: 'تاریخ تولد',
          name: 'birth_date',
          placeholder: 'انتخاب تاریخ...',
          required: false,
          active: true,
          order: 5,
        },
        {
          id: `f-${Date.now()}-6`,
          type: 'checkbox',
          label: 'کلیه قوانین و شرایط استفاده از خدمات را مطالعه کرده و می‌پذیرم',
          name: 'accept_terms',
          required: true,
          active: true,
          order: 6,
        },
      ],
    },
    {
      id: 'student',
      name: 'ثبت اطلاعات دانشجویان و سوابق تحصیلی',
      category: 'education',
      categoryLabel: 'دانشگاهی و آموزشی',
      badge: '۶ فیلد دانشگاهی',
      description: 'فرم اختصاصی مراکز آموزشی با شماره دانشجویی، رشته تحصیلی، مقطع و شماره تماس',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgLight: 'bg-indigo-50',
      bgDark: 'dark:bg-indigo-950/60',
      icon: GraduationCap,
      defaultTitle: 'فرم ثبت اطلاعات و پرونده دانشجویان',
      defaultDescription: 'ثبت مشخصات شناسنامه‌ای و آموزشی دانشجویان جدیدالورود دانشگاه',
      fields: [
        {
          id: `f-${Date.now()}-1`,
          type: 'text',
          label: 'نام',
          name: 'first_name',
          placeholder: 'مثال: علی',
          required: true,
          active: true,
          order: 1,
          minLength: 2,
        },
        {
          id: `f-${Date.now()}-2`,
          type: 'text',
          label: 'نام خانوادگی',
          name: 'last_name',
          placeholder: 'مثال: احمدی',
          required: true,
          active: true,
          order: 2,
          minLength: 2,
        },
        {
          id: `f-${Date.now()}-3`,
          type: 'student_id',
          label: 'شماره دانشجویی',
          name: 'student_id',
          placeholder: 'مثال: 40112345',
          description: 'شماره دانشجویی رسمی دانشگاه',
          required: true,
          active: true,
          order: 3,
          regexPattern: '^[0-9]{5,12}$',
        },
        {
          id: `f-${Date.now()}-4`,
          type: 'phone',
          label: 'شماره موبایل',
          name: 'phone',
          placeholder: '09123456789',
          required: true,
          active: true,
          order: 4,
          regexPattern: '^09[0-9]{9}$',
        },
        {
          id: `f-${Date.now()}-5`,
          type: 'select',
          label: 'مقطع تحصیلی',
          name: 'degree_level',
          required: true,
          active: true,
          order: 5,
          options: [
            { id: 'd_1', label: 'کارشناسی پیوسته', value: 'bachelor' },
            { id: 'd_2', label: 'کارشناسی ارشد', value: 'master' },
            { id: 'd_3', label: 'دکتری تخصصی (PhD)', value: 'phd' },
          ],
        },
        {
          id: `f-${Date.now()}-6`,
          type: 'select',
          label: 'رشته تحصیلی',
          name: 'academic_major',
          required: true,
          active: true,
          order: 6,
          options: [
            { id: 'm_1', label: 'مهندسی کامپیوتر', value: 'computer' },
            { id: 'm_2', label: 'مهندسی برق', value: 'electrical' },
            { id: 'm_3', label: 'مدیریت و فناوری اطلاعات', value: 'management' },
            { id: 'm_4', label: 'حسابداری و مالی', value: 'accounting' },
          ],
        },
      ],
    },
    {
      id: 'event',
      name: 'ثبت‌نام در کارگاه و رویدادهای تخصصی',
      category: 'event',
      categoryLabel: 'رویداد و وبینار',
      badge: '۵ فیلد کارگاهی',
      description: 'مدیریت رزرو صندلی با انتخاب شیوه حضور حضوری/آنلاین، شماره همراه و درخواست گواهی',
      color: 'text-purple-600 dark:text-purple-400',
      bgLight: 'bg-purple-50',
      bgDark: 'dark:bg-purple-950/60',
      icon: Calendar,
      defaultTitle: 'ثبت‌نام کارگاه آموزشی و رویداد تخصصی',
      defaultDescription: 'جهت رزرو صندلی و دریافت لینک ورود به وبینار، فرم زیر را تکمیل نمایید.',
      fields: [
        {
          id: `f-${Date.now()}-1`,
          type: 'fullname',
          label: 'نام و نام خانوادگی شرکت‌کننده',
          name: 'attendee_name',
          placeholder: 'جهت درج روی گواهینامه دوره',
          required: true,
          active: true,
          order: 1,
        },
        {
          id: `f-${Date.now()}-2`,
          type: 'phone',
          label: 'شماره تلفن همراه',
          name: 'attendee_phone',
          placeholder: '09123456789',
          description: 'ارسال یادآوری و لینک اتاق مجازی وبینار',
          required: true,
          active: true,
          order: 2,
        },
        {
          id: `f-${Date.now()}-3`,
          type: 'radio',
          label: 'نحوه حضور در رویداد',
          name: 'attendance_mode',
          required: true,
          active: true,
          order: 3,
          options: [
            { id: 'mode_1', label: 'حضور آنلاین (پخش زنده وبینار)', value: 'online' },
            { id: 'mode_2', label: 'حضور حضوری (سالن همایش‌های مرکزی)', value: 'in_person' },
          ],
        },
        {
          id: `f-${Date.now()}-4`,
          type: 'checkbox',
          label: 'متقاضی دریافت گواهینامه بین‌المللی معتبر پایان دوره هستم',
          name: 'request_certificate',
          required: false,
          active: true,
          order: 4,
        },
        {
          id: `f-${Date.now()}-5`,
          type: 'textarea',
          label: 'سؤالات یا موضوعات مورد علاقه شما جهت طرح در رویداد',
          name: 'topics_of_interest',
          placeholder: 'هرگونه سوال یا سرفصل مدنظر را ذکر کنید...',
          required: false,
          active: true,
          order: 5,
        },
      ],
    },
    {
      id: 'blank',
      name: 'فرم خام و سفارشی (شروع از صفر)',
      category: 'all',
      categoryLabel: 'طراحی آزاد',
      badge: 'بدون فیلد اولیه',
      description: 'ایجاد بوم خالی و طراحی تمامی فیلدها با ابزار کشیدن و رها کردن (Drag & Drop)',
      color: 'text-slate-600 dark:text-slate-400',
      bgLight: 'bg-slate-100',
      bgDark: 'dark:bg-slate-800',
      icon: FileText,
      defaultTitle: '',
      defaultDescription: '',
      fields: [],
    },
  ], []);

  // Filter templates based on category and search query
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const matchCategory = activeCategory === 'all' || tpl.category === activeCategory || tpl.id === 'blank';
      const matchSearch =
        !searchQuery.trim() ||
        tpl.name.includes(searchQuery.trim()) ||
        tpl.description.includes(searchQuery.trim()) ||
        tpl.categoryLabel.includes(searchQuery.trim()) ||
        tpl.fields.some((f) => f.label.includes(searchQuery.trim()));
      return matchCategory && matchSearch;
    });
  }, [templates, activeCategory, searchQuery]);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Select a template & auto-fill title/description if empty or placeholder
  const handleSelectTemplate = (template: TemplateDefinition) => {
    setSelectedTemplateId(template.id);
    if (!title.trim() || templates.some((t) => t.defaultTitle === title)) {
      setTitle(template.defaultTitle);
    }
    if (!description.trim() || templates.some((t) => t.defaultDescription === description)) {
      setDescription(template.defaultDescription);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Clone fields with freshly generated IDs
    const clonedFields: FormField[] = selectedTemplate.fields.map((field, idx) => ({
      ...field,
      id: `f-${Date.now()}-${idx + 1}`,
    }));

    onCreate({
      title: title.trim(),
      description: description.trim(),
      fields: clonedFields,
      status: 'active',
    });

    setTitle('');
    setDescription('');
    setSelectedTemplateId('contact');
    setAiGeneratedData(null);
    setAiPrompt('');
    onClose();
  };

  const quickAiPrompts = [
    { label: 'سفارش آنلاین غذا', prompt: 'فرم ثبت سفارش آنلاین غذای رستوران با انتخاب شعبه، نشانی تحویل، شیوه پرداخت و فیلد توضیحات غذا' },
    { label: 'استخدام برنامه‌نویس', prompt: 'فرم جذب و استخدام برنامه‌نویس با مشخصات فردی، لینک رزومه و گیت‌هاب، سابقه کار و زبان‌های برنامه‌نویسی' },
    { label: 'رزرو نوبت پزشکی', prompt: 'فرم رزرو نوبت کلینیک با انتخاب تخصص پزشک، تاریخ و ساعت مراجعه، شماره همراه و شرح علائم' },
    { label: 'نظرسنجی خدمات مشتریان', prompt: 'فرم سنجش رضایت مشتریان از خدمات و پشتیبانی با امتیازدهی ستاره‌ای، گزینه‌های چندانتخابی و پیشنهادات' },
    { label: 'ثبت‌نام همایش تخصصی', prompt: 'فرم ثبت‌نام سمینار هوش مصنوعی با مشخصات، نوع حضور آنلاین یا حضوری و درخواست صدور گواهینامه' },
    { label: 'درخواست وام و تسهیلات', prompt: 'فرم درخواست تسهیلات با مبلغ درخواستی، میزان درآمد ماهانه، نوع شغل و مشخصات ضامن' },
  ];

  // AI Assist Generator handler
  const handleGenerateWithAI = async (customPrompt?: string) => {
    const promptToUse = (customPrompt !== undefined ? customPrompt : aiPrompt).trim();
    if (!promptToUse) return;

    if (customPrompt) {
      setAiPrompt(customPrompt);
    }

    setIsGenerating(true);
    setAiError(null);
    setAiNotice(null);

    try {
      const response = await fetch('/api/generate-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptToUse }),
      });

      const resJson = await response.json();
      if (!response.ok || !resJson.success) {
        throw new Error(resJson.error || 'خطایی در ارتباط با هوش مصنوعی و تولید ساختار فرم رخ داد.');
      }

      if (resJson.notice) {
        setAiNotice(resJson.notice);
      }

      const generated = resJson.data;
      const formattedFields: FormField[] = (generated.fields || []).map((f: any, idx: number) => ({
        id: `f-${Date.now()}-${idx + 1}`,
        type: (f.type as FormFieldType) || 'text',
        label: f.label || `فیلد ${idx + 1}`,
        name: f.name || `field_${idx + 1}`,
        placeholder: f.placeholder || '',
        description: f.description || '',
        required: Boolean(f.required),
        active: true,
        order: idx + 1,
        options: Array.isArray(f.options)
          ? f.options.map((opt: any, oIdx: number) => ({
              id: `opt_${Date.now()}_${oIdx}`,
              label: opt.label || String(opt),
              value: opt.value || `val_${oIdx}`,
            }))
          : undefined,
      }));

      const newTitle = generated.title || promptToUse.slice(0, 45);
      const newDesc = generated.description || '';

      setAiGeneratedData({
        title: newTitle,
        description: newDesc,
        fields: formattedFields,
      });

      setTitle(newTitle);
      setDescription(newDesc);
    } catch (err: any) {
      console.error('AI Form Generation error:', err);
      let errMsg = err?.message || 'برقراری ارتباط با وب‌سرویس هوش مصنوعی با خطا مواجه شد.';
      if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        errMsg = 'سرورهای هوش مصنوعی در این لحظه با ترافیک موقت مواجه هستند. لطفاً مجدداً دکمه «تلاش مجدد» را بزنید.';
      } else if (errMsg.includes('{') && errMsg.includes('}')) {
        try {
          const parsed = JSON.parse(errMsg.replace(/^error:\s*/, ''));
          errMsg = parsed.message || parsed.error?.message || errMsg;
        } catch {
          // ignore
        }
      }
      setAiError(errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIAssistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiGeneratedData || !aiGeneratedData.fields.length) return;

    onCreate({
      title: title.trim() || aiGeneratedData.title,
      description: description.trim() || aiGeneratedData.description,
      fields: aiGeneratedData.fields,
      status: 'active',
    });

    setTitle('');
    setDescription('');
    setAiGeneratedData(null);
    setAiPrompt('');
    onClose();
  };

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'همه الگوها' },
    { id: 'contact', label: 'ارتباط با ما' },
    { id: 'survey', label: 'نظرسنجی' },
    { id: 'registration', label: 'ثبت‌نام' },
    { id: 'education', label: 'دانشگاهی' },
    { id: 'event', label: 'رویداد و وبینار' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                ایجاد فرم جدید
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                طراحی با هوش مصنوعی Gemini یا انتخاب از کتابخانه الگوهای آماده
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-2 mt-3.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setCreationMode('template')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
              creationMode === 'template'
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>کتابخانه الگوهای آماده (Templates)</span>
          </button>

          <button
            type="button"
            onClick={() => setCreationMode('ai')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
              creationMode === 'ai'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>طراحی هوشمند با هوش مصنوعی (AI Assist ✨)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">
              Gemini
            </span>
          </button>
        </div>

        {/* Body Content */}
        {creationMode === 'ai' ? (
          /* ================= AI ASSIST MODE ================= */
          <div className="flex-1 overflow-y-auto mt-4 space-y-5 pr-1">
            {/* AI Hero Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/60 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-300 dark:shadow-indigo-950">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      دستیار هوشمند ساخت فرم با هوش مصنوعی Gemini
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-200/70 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 font-bold">
                      پایداری ابری
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    ایده یا هدف فرم خود را به زبان فارسی ساده بنویسید؛ هوش مصنوعی مناسب‌ترین فیلدها، گزینه‌های کشویی و اعتبارسنجی‌ها را در چند ثانیه به صورت خودکار طراحی می‌کند.
                  </p>
                </div>
              </div>

              {/* Prompt Input Area */}
              <div className="mt-4 space-y-2">
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="مثال: یک فرم استخدام برنامه‌نویس ارشد با فیلدهای نام، ایمیل، شماره تماس، لینک گیت‌هاب، سوابق شغلی و سطح تسلط بر تایپ‌اسکریپت و ری‌اکت..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={isGenerating}
                    className="w-full p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-2xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed shadow-xs"
                  />
                  {aiPrompt && !isGenerating && (
                    <button
                      type="button"
                      onClick={() => setAiPrompt('')}
                      className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="پاک کردن متن"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Quick Prompts Chips */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                    نمونه ایده‌های آماده جهت امتحان سریع:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickAiPrompts.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleGenerateWithAI(item.prompt)}
                        disabled={isGenerating}
                        className="text-[11px] px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all cursor-pointer shadow-2xs"
                      >
                        ⚡ {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    با زدن دکمه زیر ساختار فرم بلافاصله توسط Gemini تحلیل و تولید می‌شود.
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGenerateWithAI()}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-300 dark:shadow-indigo-950 disabled:opacity-50 transition-all cursor-pointer shrink-0"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>در حال تولید هوشمند فرم...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 text-amber-300" />
                        <span>تولید فرم با هوش مصنوعی</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {aiError && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">خطا در تولید فرم توسط هوش مصنوعی</p>
                  <p className="mt-0.5 text-[11px]">{aiError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerateWithAI()}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                >
                  تلاش مجدد
                </button>
              </div>
            )}

            {/* Loading Indicator Card */}
            {isGenerating && (
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-indigo-300 dark:border-indigo-800 text-center space-y-3 animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 animate-spin" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  هوش مصنوعی در حال چیدمان و معماری فیلدهای فرم شماست...
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                  شناسایی نیازمندی‌ها، عناوین فارسی، نام‌های فنی و گزینه‌های انتخابی در حال انجام است.
                </p>
              </div>
            )}

            {/* Notice Message */}
            {aiNotice && (
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs flex items-center gap-2 animate-in fade-in">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>{aiNotice}</span>
              </div>
            )}

            {/* AI Generated Result Preview */}
            {aiGeneratedData && !isGenerating && (
              <form onSubmit={handleAIAssistSubmit} className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                        ساختار فرم با موفقیت تولید شد
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                      {aiGeneratedData.fields.length} فیلد آماده
                    </span>
                  </div>

                  {/* Title & Description inputs */}
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        عنوان فرم تولیدشده (امکان ویرایش):
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        توضیحات فرم:
                      </label>
                      <textarea
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Generated Fields Table / Cards */}
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                      لیست فیلدهای تولید شده توسط هوش مصنوعی:
                    </span>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden text-xs">
                      {aiGeneratedData.fields.map((field, idx) => (
                        <div key={field.id} className="p-3 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-mono text-[11px] font-bold">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {field.label}
                                </span>
                                {field.required ? (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                                    اجباری
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                    اختیاری
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <code className="text-indigo-600 dark:text-indigo-400 font-mono">
                                  {field.name}
                                </code>
                                {field.placeholder && (
                                  <span>• راهنما: «{field.placeholder}»</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {field.options && field.options.length > 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                {field.options.length} گزینه
                              </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold">
                              {field.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleGenerateWithAI()}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>تولید مجدد با همین توضیحات</span>
                  </button>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    >
                      انصراف
                    </button>

                    <button
                      type="submit"
                      disabled={!title.trim()}
                      className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-950 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>تأیید و ساخت فرم در فرم‌ساز</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* ================= TEMPLATE LIBRARY MODE ================= */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto mt-4 space-y-6 pr-1">
            {/* Section: Template Library */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <label className="text-sm font-bold text-slate-900 dark:text-white">
                    کتابخانه الگوهای آماده (Template Library)
                  </label>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                    انتخاب سریع
                  </span>
                </div>

                {/* Template Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="جستجو در نام الگوها و فیلدها..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-8 pl-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Template Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {filteredTemplates.map((template) => {
                  const isSelected = selectedTemplateId === template.id;
                  const isPreviewOpen = previewingTemplateId === template.id;
                  const IconComponent = template.icon;

                  return (
                    <div
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-md ring-2 ring-indigo-500/30 dark:ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
                      }`}
                    >
                      {/* Top Row: Icon, Badge & Selection Tick */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-xl ${template.bgLight} ${template.bgDark} ${template.color} flex items-center justify-center shrink-0 shadow-xs`}
                            >
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                                {template.categoryLabel}
                              </span>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                {template.badge}
                              </span>
                            </div>
                          </div>

                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0 group-hover:border-indigo-400" />
                          )}
                        </div>

                        {/* Title & Description */}
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-snug">
                          {template.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {template.description}
                        </p>
                      </div>

                      {/* Bottom: Fields Preview Pill Tags & Drawer */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                        {template.fields.length > 0 ? (
                          <div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400 dark:text-slate-500 font-medium">
                                فیلدهای آماده:
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewingTemplateId(isPreviewOpen ? null : template.id);
                                }}
                                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                              >
                                {isPreviewOpen ? (
                                  <>
                                    <span>بستن</span>
                                    <ChevronUp className="w-3 h-3" />
                                  </>
                                ) : (
                                  <>
                                    <span>مشاهده ({template.fields.length})</span>
                                    <ChevronDown className="w-3 h-3" />
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Quick Pills (always visible) */}
                            {!isPreviewOpen && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {template.fields.slice(0, 3).map((f) => (
                                  <span
                                    key={f.id}
                                    className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-[110px]"
                                  >
                                    {f.label}
                                  </span>
                                ))}
                                {template.fields.length > 3 && (
                                  <span className="text-[10px] px-1 py-0.5 text-slate-400">
                                    +{template.fields.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Expanded Fields List Drawer */}
                            {isPreviewOpen && (
                              <div className="mt-2 space-y-1 bg-slate-50 dark:bg-slate-900/90 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] animate-in fade-in">
                                {template.fields.map((f, i) => (
                                  <div key={f.id} className="flex items-center justify-between py-0.5">
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                                      {i + 1}. {f.label}
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                                      {f.type}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 py-1">
                            طراحی کامل فیلدها در محیط Form Builder
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section: Form Metadata Customization */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-2.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  مشخصات و عنوان فرم انتخابی
                </span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                  الگوی انتخاب‌شده: {selectedTemplate.name}
                </span>
              </div>

              {/* Form Title */}
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  عنوان فرم <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="عنوان فرم را وارد کنید..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
                />
              </div>

              {/* Form Description */}
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  توضیحات و راهنمای فرم (نمایش در بالای فرم)
                </label>
                <textarea
                  rows={2}
                  placeholder="توضیحاتی که کاربران در بالای فرم مشاهده خواهند کرد..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>
                  پس از ایجاد فرم، می‌توانید در صفحه فرم‌ساز فیلدها را کم، زیاد یا تغییر دهید.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50 rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-950 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>ایجاد فرم و ورود به فرم‌ساز</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

