import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Form, FormField, FormResponse, DashboardStats, AuditLog } from '../types/form.js';
import { validateFormSubmission, sanitizeInput } from '../services/validation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'formsaz-db.json');

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

export function generateTrackingCode(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `TRK-${num}`;
}

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
    webhookEnabled: false,
    webhookUrl: '',
    webhookSecret: '',
    webhookIncludeMetadata: true,
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

const initialSurveyForm: Form = {
  id: 'form-survey-course-02',
  title: 'ارزیابی کیفیت آموزشی و کارگاه‌های تخصصی',
  description: 'نظرسنجی رسمی پایان ترم جهت ارتقای سطح کیفی اساتید و دوره‌های دانشگاهی',
  slug: 'course-evaluation',
  status: 'active',
  createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
  responseCount: 2,
  lastResponseAt: new Date(Date.now() - 7200000).toISOString(),
  settings: {
    title: 'ارزیابی کیفیت آموزشی و کارگاه‌های تخصصی',
    description: 'نظرسنجی پایان ترم',
    slug: 'course-evaluation',
    status: 'active',
    successMessage: 'با تشکر از مشارکت شما در بهبود فرآیندهای آموزشی دانشگاه.',
    enableCaptcha: false,
    allowMultipleSubmissions: false,
    themeColor: '#059669',
  },
  fields: [
    {
      id: 'f-course-name',
      type: 'select',
      label: 'عنوان دوره / کارگاه',
      name: 'course_name',
      required: true,
      active: true,
      order: 1,
      options: [
        { id: 'opt-1', label: 'طراحی رابط کاربری پیشرفته', value: 'ui_design' },
        { id: 'opt-2', label: 'توسعه وب فول‌استک با ری‌اکت و نودجی‌اس', value: 'fullstack_web' },
        { id: 'opt-3', label: 'هوش مصنوعی و یادگیری ماشین', value: 'ai_ml' },
      ],
    },
    {
      id: 'f-satisfaction',
      type: 'star_rating',
      label: 'میزان رضایت کلی از تدریس استاد',
      name: 'satisfaction_rating',
      required: true,
      active: true,
      order: 2,
    },
    {
      id: 'f-feedback',
      type: 'textarea',
      label: 'پیشنهادات و انتقادات سازنده',
      name: 'feedback_text',
      placeholder: 'نکات مثبت و نقاط قابل بهبود دوره را بنویسید...',
      required: false,
      active: true,
      order: 3,
    },
  ],
};

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

interface DatabaseData {
  forms: Form[];
  responses: FormResponse[];
  logs: AuditLog[];
}

export class ServerStorage {
  private data: DatabaseData = {
    forms: [initialStudentForm, initialSurveyForm],
    responses: initialResponses,
    logs: initialLogs,
  };

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed && Array.isArray(parsed.forms)) {
          this.data = parsed;
          return;
        }
      }
      this.saveData();
    } catch (e) {
      console.warn('[ServerStorage] Using memory storage, could not read file:', e);
    }
  }

  private saveData() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[ServerStorage] Could not write to disk:', e);
    }
  }

  public logAction(action: string, details: string, type: AuditLog['type'] = 'info'): AuditLog {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      details,
      timestamp: formatToPersianDate(new Date()),
      type,
    };
    this.data.logs.unshift(newLog);
    if (this.data.logs.length > 100) this.data.logs.pop();
    this.saveData();
    return newLog;
  }

  public getForms(filter?: { search?: string; status?: 'active' | 'inactive' }): Form[] {
    let result = this.data.forms.map((f) => {
      const count = this.data.responses.filter((r) => r.formId === f.id).length;
      return { ...f, responseCount: count };
    });

    if (filter?.status) {
      result = result.filter((f) => f.status === filter.status);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.slug.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public getFormById(idOrSlug: string): Form | undefined {
    const form = this.data.forms.find(
      (f) =>
        f.id === idOrSlug ||
        f.slug === idOrSlug ||
        f.id.toLowerCase() === idOrSlug.toLowerCase() ||
        (f.slug && f.slug.toLowerCase() === idOrSlug.toLowerCase())
    );
    if (!form) return undefined;
    const count = this.data.responses.filter((r) => r.formId === form.id).length;
    return { ...form, responseCount: count };
  }

  public createForm(formData: Partial<Form>): Form {
    const id = formData.id || `form-${Date.now()}`;
    const now = new Date().toISOString();
    const title = formData.title || 'فرم بدون عنوان';
    const slug =
      formData.slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
        .replace(/^-+|-+$/g, '') ||
      `form-${Date.now()}`;

    const newForm: Form = {
      id,
      title,
      description: formData.description || '',
      slug,
      status: formData.status || 'active',
      fields: formData.fields || [],
      settings: {
        title,
        description: formData.description || '',
        slug,
        status: formData.status || 'active',
        successMessage: formData.settings?.successMessage || 'پاسخ شما با موفقیت ثبت شد.',
        enableCaptcha: !!formData.settings?.enableCaptcha,
        allowMultipleSubmissions: formData.settings?.allowMultipleSubmissions ?? true,
        themeColor: formData.settings?.themeColor || '#4f46e5',
        ...formData.settings,
      },
      createdAt: now,
      updatedAt: now,
      responseCount: 0,
    };

    this.data.forms.unshift(newForm);
    this.logAction('ایجاد فرم جدید', `فرم "${newForm.title}" در سامانه تعریف شد.`, 'success');
    this.saveData();
    return newForm;
  }

  public updateForm(id: string, updates: Partial<Form>): Form | undefined {
    const index = this.data.forms.findIndex((f) => f.id === id);
    if (index === -1) return undefined;

    const current = this.data.forms[index];
    const updated: Form = {
      ...current,
      ...updates,
      id: current.id,
      updatedAt: new Date().toISOString(),
      settings: {
        ...current.settings,
        ...(updates.settings || {}),
        title: updates.title || updates.settings?.title || current.settings.title,
        description: updates.description ?? updates.settings?.description ?? current.settings.description,
        slug: updates.slug || updates.settings?.slug || current.settings.slug,
        status: updates.status || updates.settings?.status || current.settings.status,
      },
    };

    this.data.forms[index] = updated;
    this.logAction('ویرایش فرم', `تنظیمات یا فیلدهای فرم "${updated.title}" به‌روزرسانی شد.`, 'info');
    this.saveData();
    return updated;
  }

  public deleteForm(id: string): boolean {
    const form = this.data.forms.find((f) => f.id === id);
    if (!form) return false;

    this.data.forms = this.data.forms.filter((f) => f.id !== id);
    this.data.responses = this.data.responses.filter((r) => r.formId !== id);
    this.logAction('حذف فرم', `فرم "${form.title}" و کلیه پاسخ‌های آن حذف گردید.`, 'warning');
    this.saveData();
    return true;
  }

  public cloneForm(id: string): Form | undefined {
    const form = this.data.forms.find((f) => f.id === id);
    if (!form) return undefined;

    const clonedId = `form-${Date.now()}`;
    const clonedSlug = `${form.slug}-copy-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const cloned: Form = {
      ...form,
      id: clonedId,
      title: `${form.title} (نسخه رونوشت)`,
      slug: clonedSlug,
      createdAt: now,
      updatedAt: now,
      responseCount: 0,
      lastResponseAt: undefined,
      fields: form.fields.map((fld, idx) => ({
        ...fld,
        id: `f-${clonedId}-${idx + 1}`,
      })),
      settings: {
        ...form.settings,
        title: `${form.title} (نسخه رونوشت)`,
        slug: clonedSlug,
      },
    };

    this.data.forms.unshift(cloned);
    this.logAction('شبیه‌سازی فرم', `رونوشت جدیدی از فرم "${form.title}" ایجاد شد.`, 'info');
    this.saveData();
    return cloned;
  }

  public setFormStatus(id: string, status: 'active' | 'inactive'): Form | undefined {
    return this.updateForm(id, { status });
  }

  // Fields operations
  public getFormFields(formId: string): FormField[] | undefined {
    const form = this.data.forms.find((f) => f.id === formId);
    return form ? form.fields : undefined;
  }

  public addFormField(formId: string, field: FormField): FormField | undefined {
    const form = this.data.forms.find((f) => f.id === formId);
    if (!form) return undefined;

    const newField: FormField = {
      ...field,
      id: field.id || `f-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      order: form.fields.length + 1,
    };
    form.fields.push(newField);
    form.updatedAt = new Date().toISOString();
    this.saveData();
    return newField;
  }

  public updateFormField(formId: string, fieldId: string, fieldUpdates: Partial<FormField>): FormField | undefined {
    const form = this.data.forms.find((f) => f.id === formId);
    if (!form) return undefined;

    const fieldIndex = form.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) return undefined;

    form.fields[fieldIndex] = { ...form.fields[fieldIndex], ...fieldUpdates };
    form.updatedAt = new Date().toISOString();
    this.saveData();
    return form.fields[fieldIndex];
  }

  public deleteFormField(formId: string, fieldId: string): boolean {
    const form = this.data.forms.find((f) => f.id === formId);
    if (!form) return false;

    const originalLen = form.fields.length;
    form.fields = form.fields.filter((f) => f.id !== fieldId);
    if (form.fields.length === originalLen) return false;

    // reorder
    form.fields.forEach((f, idx) => {
      f.order = idx + 1;
    });
    form.updatedAt = new Date().toISOString();
    this.saveData();
    return true;
  }

  // Responses operations
  public getResponses(filter?: { formId?: string; search?: string }): FormResponse[] {
    let result = [...this.data.responses];
    if (filter?.formId) {
      result = result.filter((r) => r.formId === filter.formId);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.trackingCode.toLowerCase().includes(q) ||
          r.formTitle.toLowerCase().includes(q) ||
          Object.values(r.values).some((v) => String(v).toLowerCase().includes(q))
      );
    }
    return result;
  }

  public getResponseById(id: string): FormResponse | undefined {
    return this.data.responses.find((r) => r.id === id);
  }

  public getResponseByTrackingCode(code: string): FormResponse | undefined {
    const normalized = code.trim().toUpperCase();
    return this.data.responses.find(
      (r) => r.trackingCode.toUpperCase() === normalized || r.trackingCode.includes(code.trim())
    );
  }

  public deleteResponse(id: string): boolean {
    const res = this.data.responses.find((r) => r.id === id);
    if (!res) return false;

    this.data.responses = this.data.responses.filter((r) => r.id !== id);
    this.logAction('حذف پاسخ', `پاسخ با کد رهگیری ${res.trackingCode} از سامانه حذف شد.`, 'warning');
    this.saveData();
    return true;
  }

  public async submitFormResponse(
    formIdOrSlug: string,
    rawValues: Record<string, any>,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<{
    success: boolean;
    trackingCode?: string;
    message?: string;
    errors?: Record<string, string>;
    submittedAt?: string;
    webhookDispatched?: boolean;
    webhookUrl?: string;
    emailSummary?: { to: string; subject: string; itemsCount: number };
  }> {
    const form = this.getFormById(formIdOrSlug);
    if (!form) {
      return { success: false, message: 'فرم مورد نظر یافت نشد.' };
    }

    if (form.status !== 'active') {
      return { success: false, message: 'این فرم در حال حاضر غیرفعال است و امکان ثبت پاسخ جدید وجود ندارد.' };
    }

    if (form.settings.maxResponses && form.responseCount >= form.settings.maxResponses) {
      return { success: false, message: 'ظرفیت ثبت‌نام و پاسخ‌گویی به این فرم تکمیل گردیده است.' };
    }

    // Sanitize input values
    const sanitizedValues: Record<string, any> = {};
    for (const [key, val] of Object.entries(rawValues)) {
      if (typeof val === 'string') {
        sanitizedValues[key] = sanitizeInput(val);
      } else {
        sanitizedValues[key] = val;
      }
    }

    // Validate fields according to rules
    const validation = validateFormSubmission(form.fields, sanitizedValues);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'برخی فیلدها معتبر نیستند. لطفاً موارد مشخص شده را اصلاح فرمایید.',
        errors: validation.errors,
      };
    }

    const trackingCode = generateTrackingCode();
    const nowTimestamp = Date.now();
    const formattedDate = formatToPersianDate(new Date(nowTimestamp));

    // Formatted field values for rich reporting
    const formattedValues = form.fields.map((fld) => ({
      fieldId: fld.id,
      fieldName: fld.name,
      fieldLabel: fld.label,
      value: sanitizedValues[fld.name] ?? null,
    }));

    const responseRecord: FormResponse = {
      id: `resp-${nowTimestamp}-${Math.floor(Math.random() * 1000)}`,
      formId: form.id,
      formTitle: form.title,
      trackingCode,
      values: sanitizedValues,
      formattedValues,
      ipAddress: metadata?.ipAddress || '127.0.0.1',
      submittedAt: formattedDate,
      submittedAtTimestamp: nowTimestamp,
    };

    this.data.responses.unshift(responseRecord);

    // Update form response count and timestamp
    const formIndex = this.data.forms.findIndex((f) => f.id === form.id);
    if (formIndex !== -1) {
      this.data.forms[formIndex].responseCount = (this.data.forms[formIndex].responseCount || 0) + 1;
      this.data.forms[formIndex].lastResponseAt = new Date().toISOString();
    }

    this.logAction(
      'ثبت پاسخ جدید',
      `پاسخ جدید در فرم "${form.title}" با کد رهگیری ${trackingCode} ثبت شد.`,
      'success'
    );
    this.saveData();

    // Trigger webhook if enabled
    let webhookDispatched = false;
    let targetWebhookUrl: string | undefined;

    if (form.settings.webhookEnabled && form.settings.webhookUrl) {
      targetWebhookUrl = form.settings.webhookUrl;
      const webhookPayload = {
        event: 'form_response.submitted',
        timestamp: new Date().toISOString(),
        form: {
          id: form.id,
          title: form.title,
          slug: form.slug,
        },
        response: {
          id: responseRecord.id,
          trackingCode: responseRecord.trackingCode,
          submittedAt: responseRecord.submittedAt,
          values: responseRecord.values,
          formattedValues: responseRecord.formattedValues,
        },
        metadata: form.settings.webhookIncludeMetadata
          ? {
              ipAddress: responseRecord.ipAddress,
              userAgent: metadata?.userAgent,
            }
          : undefined,
      };

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'FormSaz-Pro-Webhook/1.0',
          'X-FormSaz-Event': 'form_response.submitted',
          'X-FormSaz-Delivery': `del_${Date.now()}`,
        };

        if (form.settings.webhookSecret) {
          headers['X-Webhook-Secret'] = form.settings.webhookSecret;
          headers['Authorization'] = `Bearer ${form.settings.webhookSecret}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        const hookRes = await fetch(targetWebhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(webhookPayload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        webhookDispatched = hookRes.ok;
        this.logAction(
          'مخابره وب‌هوک',
          `وب‌هوک پاسخ ${trackingCode} به آدرس ${targetWebhookUrl} ارسال شد (وضعیت: ${hookRes.status}).`,
          hookRes.ok ? 'success' : 'warning'
        );
      } catch (webhookErr: any) {
        console.warn('[Webhook] Dispatch failed:', webhookErr?.message || webhookErr);
        this.logAction(
          'خطای وب‌هوک',
          `ارسال وب‌هوک به ${targetWebhookUrl} ناموفق بود: ${webhookErr?.message || 'خطای شبکه'}`,
          'error'
        );
      }
    }

    // Email simulation summary
    let emailSummary: { to: string; subject: string; itemsCount: number } | undefined;
    if (form.settings.emailNotificationEnabled && form.settings.notificationEmail) {
      const subject = (form.settings.emailSubjectTemplate || 'ثبت پاسخ جدید در فرم {form_title}')
        .replace('{form_title}', form.title)
        .replace('{tracking_code}', trackingCode);

      emailSummary = {
        to: form.settings.notificationEmail,
        subject,
        itemsCount: Object.keys(sanitizedValues).length,
      };
      this.logAction(
        'اطلاع‌رسانی ایمیل',
        `اعلان ثبت پاسخ به ${form.settings.notificationEmail} ارسال شد.`,
        'info'
      );
    }

    return {
      success: true,
      trackingCode,
      message: form.settings.successMessage || 'اطلاعات شما با موفقیت ثبت شد.',
      submittedAt: formattedDate,
      webhookDispatched,
      webhookUrl: targetWebhookUrl,
      emailSummary,
    };
  }

  // Dashboard Stats
  public getDashboardStats(): DashboardStats {
    const totalForms = this.data.forms.length;
    const activeForms = this.data.forms.filter((f) => f.status === 'active').length;
    const totalResponses = this.data.responses.length;

    const oneDayAgo = Date.now() - 86400000;
    const todayResponses = this.data.responses.filter((r) => r.submittedAtTimestamp >= oneDayAgo).length;

    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const thisWeekResponses = this.data.responses.filter((r) => r.submittedAtTimestamp >= sevenDaysAgo).length;

    const totalFields = this.data.forms.reduce((acc, f) => acc + f.fields.length, 0);
    const averageFieldsPerForm = totalForms > 0 ? Math.round((totalFields / totalForms) * 10) / 10 : 0;

    // Last 7 days chart
    const recentResponsesChart: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 86400000;
      const count = this.data.responses.filter(
        (r) => r.submittedAtTimestamp >= dayStart && r.submittedAtTimestamp < dayEnd
      ).length;

      const dateLabel = new Intl.DateTimeFormat('fa-IR', { weekday: 'short', day: 'numeric' }).format(d);
      recentResponsesChart.push({ date: dateLabel, count });
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

  public getFormStats(formId: string) {
    const form = this.getFormById(formId);
    if (!form) return null;

    const responses = this.data.responses.filter((r) => r.formId === formId);
    const fieldCounts: Record<string, { label: string; filled: number; type: string }> = {};

    form.fields.forEach((fld) => {
      const filled = responses.filter(
        (r) => r.values[fld.name] !== undefined && r.values[fld.name] !== '' && r.values[fld.name] !== null
      ).length;
      fieldCounts[fld.name] = {
        label: fld.label,
        type: fld.type,
        filled,
      };
    });

    return {
      formId: form.id,
      title: form.title,
      totalResponses: responses.length,
      status: form.status,
      fieldsBreakdown: fieldCounts,
      lastResponseAt: form.lastResponseAt,
    };
  }

  // Logs
  public getAuditLogs(limit = 50, type?: AuditLog['type']): AuditLog[] {
    let result = [...this.data.logs];
    if (type) {
      result = result.filter((l) => l.type === type);
    }
    return result.slice(0, limit);
  }

  public clearAuditLogs(): void {
    this.data.logs = [];
    this.saveData();
  }

  // Export CSV
  public exportResponsesToCSV(formId: string): string {
    const form = this.getFormById(formId);
    const responses = this.data.responses.filter((r) => r.formId === formId);

    if (!form || responses.length === 0) {
      return '\ufeff"کد رهگیری","تاریخ ثبت"\n';
    }

    const headers = ['کد رهگیری', 'تاریخ ثبت', ...form.fields.map((f) => f.label)];
    const escapeCsv = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = responses.map((r) => {
      const row = [r.trackingCode, r.submittedAt];
      form.fields.forEach((f) => {
        let val = r.values[f.name];
        if (Array.isArray(val)) val = val.join('، ');
        row.push(val ?? '-');
      });
      return row.map(escapeCsv).join(',');
    });

    return '\ufeff' + [headers.map(escapeCsv).join(','), ...rows].join('\n');
  }

  public resetToInitialSeed() {
    this.data = {
      forms: [initialStudentForm, initialSurveyForm],
      responses: initialResponses,
      logs: [
        {
          id: `log-${Date.now()}`,
          action: 'بازنشانی سامانه',
          details: 'کلیه داده‌ها به حالت اولیه پیش‌فرض بازنشانی شدند.',
          timestamp: formatToPersianDate(new Date()),
          type: 'info',
        },
      ],
    };
    this.saveData();
  }
}

export const serverStorage = new ServerStorage();
