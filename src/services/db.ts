import { Form, FormField, FormResponse, DashboardStats, AuditLog } from '../types/form';
import { validateFormSubmission, sanitizeInput, normalizePersianNumbers } from './validation';

const STORAGE_KEY_FORMS = 'formsaz_forms_v2';
const STORAGE_KEY_RESPONSES = 'formsaz_responses_v2';
const STORAGE_KEY_LOGS = 'formsaz_logs_v2';

// Iranian Shamsi date formatter utility
export function formatToPersianDate(dateInput: Date | number | string): string {
  try {
    const d = new Date(dateInput);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return String(dateInput);
  }
}

export function formatShortPersianDate(dateInput: Date | number | string): string {
  try {
    const d = new Date(dateInput);
    return new Intl.DateTimeFormat('fa-IR', {
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return String(dateInput);
  }
}

// Generate random tracking code
export function generateTrackingCode(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `TRK-${num}`;
}

// Initial Sample Form as specifically requested by user:
// 1. نام (first_name)
// 2. نام خانوادگی (last_name)
// 3. شماره دانشجویی (student_id)
// 4. شماره موبایل (phone)
const initialStudentForm: Form = {
  id: 'form-student-reg-01',
  title: 'فرم ثبت اطلاعات دانشجویان',
  description: 'لطفاً اطلاعات هویتی و تحصیلی خود را با دقت در فرم زیر ثبت نمایید تا در سامانه یکپارچه دانشگاه ذخیره گردد.',
  slug: 'student-registration',
  status: 'active',
  createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
  responseCount: 5,
  lastResponseAt: new Date(Date.now() - 3600000).toISOString(),
  settings: {
    title: 'فرم ثبت اطلاعات دانشجویان',
    description: 'لطفاً مشخصات فردی و دانشجویی خود را با دقت در فرم زیر ثبت فرمایید.',
    slug: 'student-registration',
    status: 'active',
    successMessage: 'اطلاعات دانشجویی شما با موفقیت در سامانه ثبت شد. کد پیگیری شما برای مراجعات بعدی معتبر است.',
    maxResponses: 200,
    enableCaptcha: false,
    allowMultipleSubmissions: true,
    themeColor: '#4f46e5',
    emailNotificationEnabled: true,
    notificationEmail: 'admin@university.ac.ir',
    emailSubjectTemplate: 'ثبت پاسخ جدید در فرم {form_title} (کد: {tracking_code})',
    includeSubmissionSummary: true,
  },
  fields: [
    {
      id: 'f-first-name',
      type: 'text',
      label: 'نام',
      name: 'first_name',
      placeholder: 'مثال: علی',
      description: 'نام کوچک خود را مطابق با شناسنامه وارد نمایید.',
      required: true,
      active: true,
      order: 1,
      minLength: 2,
      maxLength: 30,
      customErrorMessage: 'لطفاً نام خود را به صورت کامل وارد کنید (حداقل ۲ حرف).',
    },
    {
      id: 'f-last-name',
      type: 'text',
      label: 'نام خانوادگی',
      name: 'last_name',
      placeholder: 'مثال: احمدی',
      description: 'نام خانوادگی خود را مطابق با شناسنامه وارد نمایید.',
      required: true,
      active: true,
      order: 2,
      minLength: 2,
      maxLength: 40,
      customErrorMessage: 'لطفاً نام خانوادگی خود را وارد نمایید.',
    },
    {
      id: 'f-student-id',
      type: 'student_id',
      label: 'شماره دانشجویی',
      name: 'student_id',
      placeholder: 'مثال: 40112345',
      description: 'شماره دانشجویی رسمی دانشگاه (بین ۵ الی ۱۲ رقم عددی)',
      required: true,
      active: true,
      order: 3,
      minLength: 5,
      maxLength: 12,
      regexPattern: '^[0-9]{5,12}$',
      customErrorMessage: 'شماره دانشجویی نامعتبر است (فقط اعداد بین ۵ تا ۱۲ رقم).',
    },
    {
      id: 'f-phone',
      type: 'phone',
      label: 'شماره موبایل',
      name: 'phone',
      placeholder: 'مثال: 09123456789',
      description: 'شماره موبایل جهت ارسال پیامک تأییدیه و اطلاعیه‌ها',
      required: true,
      active: true,
      order: 4,
      minLength: 11,
      maxLength: 11,
      regexPattern: '^09[0-9]{9}$',
      customErrorMessage: 'شماره موبایل باید ۱۱ رقم بوده و با ۰۹ شروع شود.',
    },
  ],
};

// Bonus rich demo form with conditional logic and diverse field types
const initialSurveyForm: Form = {
  id: 'form-survey-course-02',
  title: 'ارزیابی کیفیت آموزشی و کارگاه‌های تخصصی',
  description: 'نظرسنجی رسمی پایان ترم جهت ارتقای سطح کیفی اساتید و دوره‌های دانشگاهی',
  slug: 'course-evaluation',
  status: 'active',
  createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
  responseCount: 3,
  lastResponseAt: new Date(Date.now() - 12000000).toISOString(),
  settings: {
    title: 'ارزیابی کیفیت آموزشی و کارگاه‌های تخصصی',
    description: 'نظرسنجی رسمی پایان ترم جهت ارتقای سطح کیفی اساتید و دوره‌های دانشگاهی',
    slug: 'course-evaluation',
    status: 'active',
    successMessage: 'با سپاس از مشارکت شما، نظرات شما با دقت بررسی خواهد شد.',
    maxResponses: 100,
    enableCaptcha: false,
    allowMultipleSubmissions: true,
    themeColor: '#059669',
    emailNotificationEnabled: true,
    notificationEmail: 'survey-admin@university.ac.ir',
    emailSubjectTemplate: 'ارزیابی جدید ثبت شد: {form_title}',
    includeSubmissionSummary: true,
  },
  fields: [
    {
      id: 'f-student-name',
      type: 'fullname',
      label: 'نام و نام خانوادگی دانشجو',
      name: 'student_fullname',
      placeholder: 'اختیاری (در صورت تمایل به ثبت نظر ناشناس خالی بگذارید)',
      required: false,
      active: true,
      order: 1,
    },
    {
      id: 'f-course-name',
      type: 'select',
      label: 'رشته و درس مورد نظر',
      name: 'course_title',
      description: 'درس مربوطه را انتخاب کنید',
      required: true,
      active: true,
      order: 2,
      options: [
        { id: 'c1', label: 'مهندسی کامپیوتر - هوش مصنوعی', value: 'computer_ai' },
        { id: 'c2', label: 'مهندسی کامپیوتر - معماری وب', value: 'computer_web' },
        { id: 'c3', label: 'مهندسی برق - کنترل و دیجیتال', value: 'electrical_eng' },
        { id: 'c4', label: 'مدیریت کسب‌وکار و فناوری اطلاعات', value: 'mba_it' },
      ],
    },
    {
      id: 'f-satisfaction',
      type: 'star_rating',
      label: 'میزان رضایت کلی از تدریس استاد',
      name: 'satisfaction_stars',
      description: 'از ۱ تا ۵ ستاره امتیاز دهید',
      required: true,
      active: true,
      order: 3,
      defaultValue: 5,
    },
    {
      id: 'f-has-project',
      type: 'radio',
      label: 'آیا در این ترم پروژه عملی تحویل داده‌اید؟',
      name: 'has_project',
      required: true,
      active: true,
      order: 4,
      options: [
        { id: 'p_yes', label: 'بله، پروژه تحویل داده شد', value: 'yes' },
        { id: 'p_no', label: 'خیر، فقط آزمون تئوری بود', value: 'no' },
      ],
    },
    {
      id: 'f-project-details',
      type: 'textarea',
      label: 'عنوان و خلاصه پروژه عملی',
      name: 'project_details',
      placeholder: 'توضیحات مختصر در رابطه با عنوان و تکنولوژی‌های پروژه...',
      required: false,
      active: true,
      order: 5,
      conditionalLogic: {
        enabled: true,
        action: 'show',
        rules: [
          {
            fieldId: 'f-has-project',
            operator: 'equals',
            value: 'yes',
          },
        ],
      },
    },
    {
      id: 'f-feedback-text',
      type: 'textarea',
      label: 'پیشنهادات و انتقادات شما برای بهبود دوره',
      name: 'feedback_text',
      placeholder: 'هرگونه پیشنهاد سازنده جهت ارتقای امکانات یا سرفصل‌ها...',
      required: false,
      active: true,
      order: 6,
    },
  ],
};

// Initial Seed Responses for the Student Registration Form
const initialResponses: FormResponse[] = [
  {
    id: 'resp-std-001',
    formId: 'form-student-reg-01',
    formTitle: 'فرم ثبت اطلاعات دانشجویان',
    trackingCode: 'TRK-491024',
    ipAddress: '192.168.1.104',
    submittedAt: formatToPersianDate(new Date(Date.now() - 4 * 86400000)),
    submittedAtTimestamp: Date.now() - 4 * 86400000,
    values: {
      first_name: 'علی',
      last_name: 'احمدی',
      student_id: '40114021',
      phone: '09123456789',
    },
  },
  {
    id: 'resp-std-002',
    formId: 'form-student-reg-01',
    formTitle: 'فرم ثبت اطلاعات دانشجویان',
    trackingCode: 'TRK-782190',
    ipAddress: '192.168.1.115',
    submittedAt: formatToPersianDate(new Date(Date.now() - 3 * 86400000)),
    submittedAtTimestamp: Date.now() - 3 * 86400000,
    values: {
      first_name: 'فاطمه زهرا',
      last_name: 'حسینی',
      student_id: '40221890',
      phone: '09359876543',
    },
  },
  {
    id: 'resp-std-003',
    formId: 'form-student-reg-01',
    formTitle: 'فرم ثبت اطلاعات دانشجویان',
    trackingCode: 'TRK-315892',
    ipAddress: '192.168.1.120',
    submittedAt: formatToPersianDate(new Date(Date.now() - 2 * 86400000)),
    submittedAtTimestamp: Date.now() - 2 * 86400000,
    values: {
      first_name: 'محمد',
      last_name: 'محمدی',
      student_id: '40033012',
      phone: '09191112233',
    },
  },
  {
    id: 'resp-std-004',
    formId: 'form-student-reg-01',
    formTitle: 'فرم ثبت اطلاعات دانشجویان',
    trackingCode: 'TRK-904123',
    ipAddress: '192.168.1.140',
    submittedAt: formatToPersianDate(new Date(Date.now() - 1 * 86400000)),
    submittedAtTimestamp: Date.now() - 1 * 86400000,
    values: {
      first_name: 'سارا',
      last_name: 'رضایی',
      student_id: '40125544',
      phone: '09184445566',
    },
  },
  {
    id: 'resp-std-005',
    formId: 'form-student-reg-01',
    formTitle: 'فرم ثبت اطلاعات دانشجویان',
    trackingCode: 'TRK-618742',
    ipAddress: '192.168.1.155',
    submittedAt: formatToPersianDate(new Date(Date.now() - 3600000)),
    submittedAtTimestamp: Date.now() - 3600000,
    values: {
      first_name: 'امیرحسین',
      last_name: 'کریمی',
      student_id: '40210987',
      phone: '09367778899',
    },
  },
];

// Initial Audit Logs
const initialLogs: AuditLog[] = [
  {
    id: 'log-1',
    action: 'ایجاد فرم اولیه',
    details: 'فرم ثبت اطلاعات دانشجویان توسط مدیر سیستم ایجاد شد.',
    timestamp: formatToPersianDate(new Date(Date.now() - 7 * 86400000)),
    type: 'success',
  },
  {
    id: 'log-2',
    action: 'تأیید فیلدهای فرم',
    details: 'فیلدهای نام، نام خانوادگی، شماره دانشجویی و شماره موبایل تنظیم شدند.',
    timestamp: formatToPersianDate(new Date(Date.now() - 7 * 86400000)),
    type: 'info',
  },
  {
    id: 'log-3',
    action: 'ثبت پاسخ جدید',
    details: 'پاسخ دانشجو امیرحسین کریمی با موفقیت ثبت شد.',
    timestamp: formatToPersianDate(new Date(Date.now() - 3600000)),
    type: 'success',
  },
];

class DatabaseService {
  private forms: Form[] = [];
  private responses: FormResponse[] = [];
  private logs: AuditLog[] = [];
  private lastSubmissionTime: Map<string, number> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedForms = localStorage.getItem(STORAGE_KEY_FORMS);
      if (storedForms) {
        this.forms = JSON.parse(storedForms);
      } else {
        this.forms = [initialStudentForm, initialSurveyForm];
        this.saveForms();
      }

      const storedResponses = localStorage.getItem(STORAGE_KEY_RESPONSES);
      if (storedResponses) {
        this.responses = JSON.parse(storedResponses);
      } else {
        this.responses = initialResponses;
        this.saveResponses();
      }

      const storedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      } else {
        this.logs = initialLogs;
        this.saveLogs();
      }
    } catch (e) {
      console.warn('LocalStorage error, falling back to in-memory state:', e);
      this.forms = [initialStudentForm, initialSurveyForm];
      this.responses = initialResponses;
      this.logs = initialLogs;
    }
  }

  private saveForms() {
    try {
      localStorage.setItem(STORAGE_KEY_FORMS, JSON.stringify(this.forms));
    } catch (e) {
      console.error('Error saving forms:', e);
    }
  }

  private saveResponses() {
    try {
      localStorage.setItem(STORAGE_KEY_RESPONSES, JSON.stringify(this.responses));
    } catch (e) {
      console.error('Error saving responses:', e);
    }
  }

  private saveLogs() {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(this.logs));
    } catch (e) {
      console.error('Error saving logs:', e);
    }
  }

  public logAction(action: string, details: string, type: AuditLog['type'] = 'info') {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      details,
      timestamp: formatToPersianDate(new Date()),
      type,
    };
    this.logs.unshift(newLog);
    if (this.logs.length > 50) this.logs.pop();
    this.saveLogs();
  }

  public getForms(): Form[] {
    // Recount responses to keep counts exact
    return this.forms.map((f) => {
      const count = this.responses.filter((r) => r.formId === f.id).length;
      return { ...f, responseCount: count };
    });
  }

  public getFormById(id: string): Form | undefined {
    const form = this.forms.find((f) => f.id === id);
    if (!form) return undefined;
    const count = this.responses.filter((r) => r.formId === id).length;
    return { ...form, responseCount: count };
  }

  public createForm(formData: Partial<Form>): Form {
    const id = `form-${Date.now()}`;
    const now = new Date().toISOString();
    const newForm: Form = {
      id,
      title: formData.title || 'فرم بدون عنوان',
      description: formData.description || '',
      slug: formData.slug || `form-${Date.now()}`,
      status: formData.status || 'active',
      fields: formData.fields || [],
      settings: formData.settings || {
        title: formData.title || 'فرم بدون عنوان',
        description: formData.description || '',
        slug: formData.slug || `form-${Date.now()}`,
        status: 'active',
        successMessage: 'اطلاعات با موفقیت ثبت گردید.',
        enableCaptcha: false,
        allowMultipleSubmissions: true,
        themeColor: '#4f46e5',
        emailNotificationEnabled: false,
        notificationEmail: '',
        emailSubjectTemplate: 'ثبت پاسخ جدید در {form_title}',
        includeSubmissionSummary: true,
        webhookEnabled: false,
        webhookUrl: '',
        webhookSecret: '',
        webhookIncludeMetadata: true,
      },
      createdAt: now,
      updatedAt: now,
      responseCount: 0,
    };

    this.forms.unshift(newForm);
    this.saveForms();
    this.logAction('ایجاد فرم جدید', `فرم «${newForm.title}» ایجاد شد.`, 'success');
    return newForm;
  }

  public updateForm(id: string, updates: Partial<Form>): Form | null {
    const index = this.forms.findIndex((f) => f.id === id);
    if (index === -1) return null;

    const current = this.forms[index];
    const updatedForm: Form = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Keep settings in sync if title changed
    if (updates.title && updatedForm.settings) {
      updatedForm.settings.title = updates.title;
    }
    if (updates.description !== undefined && updatedForm.settings) {
      updatedForm.settings.description = updates.description;
    }

    this.forms[index] = updatedForm;
    this.saveForms();
    this.logAction('ویرایش فرم', `تغییرات فرم «${updatedForm.title}» ذخیره شد.`, 'info');
    return updatedForm;
  }

  public duplicateForm(id: string): Form | null {
    const original = this.getFormById(id);
    if (!original) return null;

    const newId = `form-${Date.now()}`;
    const duplicated: Form = {
      ...JSON.parse(JSON.stringify(original)),
      id: newId,
      title: `${original.title} (کپی)`,
      slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responseCount: 0,
      lastResponseAt: undefined,
    };

    // Re-generate field IDs to prevent conflict
    duplicated.fields = duplicated.fields.map((f: FormField, idx: number) => ({
      ...f,
      id: `f-${Date.now()}-${idx}`,
    }));

    this.forms.unshift(duplicated);
    this.saveForms();
    this.logAction('کپی فرم', `یک نسخه کپی از فرم «${original.title}» ساخته شد.`, 'info');
    return duplicated;
  }

  public deleteForm(id: string): boolean {
    const target = this.getFormById(id);
    if (!target) return false;

    this.forms = this.forms.filter((f) => f.id !== id);
    // Also remove responses of this form
    this.responses = this.responses.filter((r) => r.formId !== id);
    this.saveForms();
    this.saveResponses();
    this.logAction('حذف فرم', `فرم «${target.title}» و تمام پاسخ‌های آن حذف گردید.`, 'warning');
    return true;
  }

  public toggleFormStatus(id: string): Form | null {
    const form = this.getFormById(id);
    if (!form) return null;
    const newStatus = form.status === 'active' ? 'inactive' : 'active';
    return this.updateForm(id, {
      status: newStatus,
      settings: { ...form.settings, status: newStatus },
    });
  }

  public getResponses(formId?: string): FormResponse[] {
    if (!formId) return this.responses;
    return this.responses.filter((r) => r.formId === formId);
  }

  public deleteResponse(responseId: string): boolean {
    const target = this.responses.find((r) => r.id === responseId);
    if (!target) return false;

    this.responses = this.responses.filter((r) => r.id !== responseId);
    this.saveResponses();
    this.logAction('حذف پاسخ', `پاسخ با کد رهگیری ${target.trackingCode} حذف شد.`, 'warning');
    return true;
  }

  public clearAllResponsesForForm(formId: string): void {
    this.responses = this.responses.filter((r) => r.formId !== formId);
    this.saveResponses();
    this.logAction('پاکسازی پاسخ‌ها', `تمام پاسخ‌های فرم حذف شد.`, 'warning');
  }

  /**
   * Submit a response with full validation, sanitization, rate limiting, and timestamping
   */
  public submitFormResponse(
    formId: string,
    rawValues: Record<string, any>,
    clientIp = '127.0.0.1'
  ): {
    success: boolean;
    trackingCode?: string;
    errors?: Record<string, string>;
    message?: string;
    emailNotified?: boolean;
    notificationEmail?: string;
    emailSummary?: { to: string; subject: string; itemsCount: number };
    webhookDispatched?: boolean;
    webhookUrl?: string;
  } {
    const form = this.getFormById(formId);
    if (!form) {
      return { success: false, message: 'فرم مورد نظر یافت نشد.' };
    }

    if (form.status !== 'active') {
      return { success: false, message: 'این فرم در حال حاضر غیرفعال است و امکان ثبت پاسخ وجود ندارد.' };
    }

    // Rate Limiting check (prevent multiple submits within 4 seconds from same IP/device)
    const now = Date.now();
    const lastSubmit = this.lastSubmissionTime.get(clientIp);
    if (lastSubmit && now - lastSubmit < 4000) {
      return {
        success: false,
        message: 'لطفاً کمی صبر کنید. ثبت‌های پشت‌سر‌هم مجاز نیست (حفاظت در برابر اسپم).',
      };
    }

    // Max responses limit check
    if (form.settings?.maxResponses && form.responseCount >= form.settings.maxResponses) {
      return {
        success: false,
        message: `ظرفیت ثبت پاسخ برای این فرم تکمیل شده است (حداکثر ${form.settings.maxResponses} پاسخ).`,
      };
    }

    // Server-side / Engine Validation
    const validation = validateFormSubmission(form.fields, rawValues);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        message: 'برخی از فیلدهای فرم به درستی تکمیل نشده‌اند. لطفاً خطاها را برطرف فرمایید.',
      };
    }

    // Sanitize values
    const sanitizedValues: Record<string, any> = {};
    for (const [key, val] of Object.entries(rawValues)) {
      if (typeof val === 'string') {
        sanitizedValues[key] = sanitizeInput(normalizePersianNumbers(val.trim()));
      } else {
        sanitizedValues[key] = val;
      }
    }

    const trackingCode = generateTrackingCode();
    const newResponse: FormResponse = {
      id: `resp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      formId: form.id,
      formTitle: form.title,
      values: sanitizedValues,
      trackingCode,
      ipAddress: clientIp,
      submittedAt: formatToPersianDate(new Date()),
      submittedAtTimestamp: now,
    };

    this.responses.unshift(newResponse);
    this.saveResponses();
    this.lastSubmissionTime.set(clientIp, now);

    // Update lastResponseAt on form
    const formIndex = this.forms.findIndex((f) => f.id === formId);
    if (formIndex !== -1) {
      this.forms[formIndex].lastResponseAt = new Date().toISOString();
      this.forms[formIndex].responseCount = (this.forms[formIndex].responseCount || 0) + 1;
      this.saveForms();
    }

    this.logAction(
      'ثبت پاسخ کاربر',
      `پاسخ جدید در فرم «${form.title}» با کد رهگیری ${trackingCode} ثبت گردید.`,
      'success'
    );

    // Email Notification Processing
    const emailNotified = Boolean(
      form.settings?.emailNotificationEnabled && form.settings?.notificationEmail?.trim()
    );

    let emailSummaryData: { to: string; subject: string; itemsCount: number } | undefined;

    if (emailNotified && form.settings?.notificationEmail) {
      const recipient = form.settings.notificationEmail.trim();
      const subject = (form.settings.emailSubjectTemplate || 'ثبت پاسخ جدید در فرم {form_title}')
        .replace('{form_title}', form.title)
        .replace('{tracking_code}', trackingCode);

      const itemsCount = Object.keys(sanitizedValues).length;
      emailSummaryData = { to: recipient, subject, itemsCount };

      this.logAction(
        'ارسال اعلان ایمیلی',
        `خلاصه ارسال کاربر با کد ${trackingCode} به ایمیل مدیر «${recipient}» ارسال شد.`,
        'info'
      );
    }

    // Webhook Integration Processing
    const webhookConfigured = Boolean(
      form.settings?.webhookEnabled && form.settings?.webhookUrl?.trim()
    );

    if (webhookConfigured && form.settings?.webhookUrl) {
      const targetUrl = form.settings.webhookUrl.trim();
      const includeMeta = form.settings.webhookIncludeMetadata !== false;

      const webhookPayload = {
        event: 'form_response.submitted',
        timestamp: new Date().toISOString(),
        form: {
          id: form.id,
          title: form.title,
          slug: form.slug,
        },
        response: {
          id: newResponse.id,
          trackingCode,
          submittedAt: newResponse.submittedAt,
          submittedAtTimestamp: now,
          ipAddress: includeMeta ? clientIp : undefined,
          values: sanitizedValues,
          fields: form.fields
            .filter((f) => f.type !== 'divider' && f.type !== 'static_text')
            .map((f) => ({
              id: f.id,
              name: f.name,
              label: f.label,
              type: f.type,
              value: sanitizedValues[f.name] !== undefined ? sanitizedValues[f.name] : null,
            })),
        },
      };

      try {
        fetch('/api/webhook/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: targetUrl,
            secret: form.settings.webhookSecret || '',
            payload: webhookPayload,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              this.logAction(
                'ارسال موفق وب‌هوک',
                `پاسخ کاربر (کد ${trackingCode}) با موفقیت به «${targetUrl}» با وضعیت HTTP ${data.status} مخابره شد.`,
                'success'
              );
            } else {
              this.logAction(
                'خطا در ارسال وب‌هوک',
                `ارسال به وب‌هوک «${targetUrl}» با خطا مواجه شد: ${data.error || data.statusText || 'خطای اتصال'}`,
                'warning'
              );
            }
          })
          .catch((err) => {
            this.logAction(
              'خطا در وب‌هوک',
              `عدم برقراری ارتباط با وب‌هوک «${targetUrl}»: ${err.message}`,
              'warning'
            );
          });
      } catch (err: any) {
        console.warn('Webhook dispatch call error:', err);
      }
    }

    return {
      success: true,
      trackingCode,
      message: form.settings?.successMessage || 'اطلاعات شما با موفقیت ثبت شد.',
      emailNotified,
      notificationEmail: form.settings?.notificationEmail,
      emailSummary: emailSummaryData,
      webhookDispatched: webhookConfigured,
      webhookUrl: form.settings?.webhookUrl,
    };
  }

  /**
   * Helper to generate a live sample Webhook payload preview for a form
   */
  public generateWebhookPayloadPreview(form: Form): Record<string, any> {
    const sampleValues: Record<string, any> = {};
    form.fields
      .filter((f) => f.type !== 'divider' && f.type !== 'static_text')
      .forEach((f) => {
        if (f.type === 'email') sampleValues[f.name] = 'user@example.com';
        else if (f.type === 'phone') sampleValues[f.name] = '09123456789';
        else if (f.type === 'number') sampleValues[f.name] = 25;
        else if (f.type === 'date') sampleValues[f.name] = '1403/07/15';
        else if (f.type === 'checkbox') sampleValues[f.name] = true;
        else if (f.type === 'star_rating') sampleValues[f.name] = 5;
        else sampleValues[f.name] = f.defaultValue || `نمونه ${f.label}`;
      });

    return {
      event: 'form_response.submitted',
      timestamp: new Date().toISOString(),
      form: {
        id: form.id,
        title: form.title,
        slug: form.slug,
      },
      response: {
        id: 'resp-sample-1001',
        trackingCode: 'TRK-WEBHOOK-842',
        submittedAt: '۱۴۰۳/۰۷/۱۵ ساعت ۱۰:۳۰',
        submittedAtTimestamp: Date.now(),
        ipAddress: '192.168.1.1',
        values: sampleValues,
        fields: form.fields
          .filter((f) => f.type !== 'divider' && f.type !== 'static_text')
          .map((f) => ({
            id: f.id,
            name: f.name,
            label: f.label,
            type: f.type,
            value: sampleValues[f.name],
          })),
      },
    };
  }

  /**
   * Helper to preview the email summary structure for testing/UI inspection
   */
  public generateEmailSummaryPreview(
    form: Form,
    customValues?: Record<string, any>,
    customTrackingCode?: string
  ): {
    to: string;
    subject: string;
    trackingCode: string;
    fields: { label: string; value: string }[];
  } {
    const trackingCode = customTrackingCode || 'TRK-PREVIEW-992';
    const recipient = form.settings?.notificationEmail?.trim() || 'مدیر سیستم (تنظیم نشده)';
    const subjectTemplate =
      form.settings?.emailSubjectTemplate || 'ثبت پاسخ جدید در فرم {form_title} (کد: {tracking_code})';
    const subject = subjectTemplate
      .replace('{form_title}', form.title)
      .replace('{tracking_code}', trackingCode);

    const values = customValues || {};
    const fieldsList = form.fields
      .filter((f) => f.type !== 'divider' && f.type !== 'static_text' && f.type !== 'hidden')
      .map((f) => {
        let val = values[f.name];
        if (val === undefined || val === '') {
          val = f.defaultValue !== undefined ? String(f.defaultValue) : '—';
        }
        if (Array.isArray(val)) {
          val = val.join('، ');
        }
        return {
          label: f.label,
          value: String(val),
        };
      });

    return {
      to: recipient,
      subject,
      trackingCode,
      fields: fieldsList,
    };
  }

  public getDashboardStats(): DashboardStats {
    const totalForms = this.forms.length;
    const activeForms = this.forms.filter((f) => f.status === 'active').length;
    const totalResponses = this.responses.length;

    const oneDayAgo = Date.now() - 24 * 3600 * 1000;
    const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;

    const todayResponses = this.responses.filter((r) => r.submittedAtTimestamp >= oneDayAgo).length;
    const thisWeekResponses = this.responses.filter((r) => r.submittedAtTimestamp >= sevenDaysAgo).length;

    const totalFields = this.forms.reduce((acc, f) => acc + (f.fields ? f.fields.length : 0), 0);
    const averageFieldsPerForm = totalForms > 0 ? Math.round((totalFields / totalForms) * 10) / 10 : 0;

    // Generate recent 7 days chart points
    const recentResponsesChart: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const endOfDay = startOfDay + 86400000;

      const dayCount = this.responses.filter(
        (r) => r.submittedAtTimestamp >= startOfDay && r.submittedAtTimestamp < endOfDay
      ).length;

      recentResponsesChart.push({
        date: formatShortPersianDate(d),
        count: dayCount,
      });
    }

    return {
      totalForms,
      activeForms,
      totalResponses,
      todayResponses,
      thisWeekResponses,
      averageFieldsPerForm,
      recentResponsesChart,
    };
  }

  public getAuditLogs(): AuditLog[] {
    return this.logs;
  }

  /**
   * Generates a Persian UTF-8 BOM CSV for flawless Excel display
   */
  public exportFormResponsesToCSV(formId: string): string {
    const form = this.getFormById(formId);
    if (!form) return '';

    const responses = this.getResponses(formId);
    const activeFields = form.fields.filter((f) => f.type !== 'static_text' && f.type !== 'divider');

    // Header row
    const headers = [
      'کد رهگیری',
      'تاریخ و ساعت ثبت',
      ...activeFields.map((f) => `"${f.label.replace(/"/g, '""')}"`),
    ];

    // Data rows
    const rows = responses.map((r) => {
      const rowValues = activeFields.map((f) => {
        const val = r.values[f.name] ?? r.values[f.id] ?? '';
        let str = '';
        if (Array.isArray(val)) {
          str = val.join('، ');
        } else if (typeof val === 'boolean') {
          str = val ? 'بله' : 'خیر';
        } else {
          str = String(val);
        }
        return `"${str.replace(/"/g, '""')}"`;
      });
      return [`"${r.trackingCode}"`, `"${r.submittedAt}"`, ...rowValues].join(',');
    });

    // UTF-8 BOM byte marker (\uFEFF) to make Microsoft Excel recognize Persian characters correctly
    return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  }

  public resetToInitialSeed() {
    this.forms = [initialStudentForm, initialSurveyForm];
    this.responses = initialResponses;
    this.logs = initialLogs;
    this.saveForms();
    this.saveResponses();
    this.saveLogs();
  }
}

export const dbService = new DatabaseService();
