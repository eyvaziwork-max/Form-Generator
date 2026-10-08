import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { serverStorage } from './src/server/storage.js';
import { openApiSpec, getSwaggerHtml } from './src/server/swaggerSpec.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS & Security headers for APIs
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ==========================================
// SWAGGER & OPENAPI DOCUMENTATION ENDPOINTS
// ==========================================

// OpenAPI 3.0.3 JSON Specification endpoints
app.get(['/api/openapi.json', '/api/docs/swagger.json'], (_req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json(openApiSpec);
});

// Interactive Swagger UI HTML
app.get(['/api/docs', '/swagger'], (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(getSwaggerHtml('/api/docs/swagger.json'));
});

// ==========================================
// FORMS MANAGEMENT APIS
// ==========================================

// 1. List Forms with search & status filters
app.get('/api/forms', (req, res) => {
  try {
    const { search, status } = req.query as { search?: string; status?: 'active' | 'inactive' };
    const forms = serverStorage.getForms({ search, status });
    return res.json({
      success: true,
      count: forms.length,
      data: forms,
    });
  } catch (err: any) {
    console.error('Error fetching forms:', err);
    return res.status(500).json({ success: false, error: 'خطا در واکشی فهرست فرم‌ها.' });
  }
});

// 2. Create a new Form
app.post('/api/forms', (req, res) => {
  try {
    const formData = req.body;
    if (!formData.title || typeof formData.title !== 'string') {
      return res.status(400).json({ success: false, error: 'عنوان فرم الزامی است.' });
    }

    const created = serverStorage.createForm(formData);
    return res.status(201).json({
      success: true,
      message: 'فرم با موفقیت ایجاد گردید.',
      data: created,
    });
  } catch (err: any) {
    console.error('Error creating form:', err);
    return res.status(500).json({ success: false, error: 'خطا در ایجاد فرم جدید.' });
  }
});

// 3. Get single Form by ID or Slug
app.get('/api/forms/:id', (req, res) => {
  try {
    const { id } = req.params;
    const form = serverStorage.getFormById(id);
    if (!form) {
      return res.status(404).json({ success: false, error: 'فرم مورد نظر یافت نشد.' });
    }
    return res.json({ success: true, data: form });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در واکشی اطلاعات فرم.' });
  }
});

// 4. Update Form by ID
app.put('/api/forms/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = serverStorage.updateForm(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'فرم مورد نظر جهت ویرایش پیدا نشد.' });
    }
    return res.json({
      success: true,
      message: 'اطلاعات فرم با موفقیت به‌روزرسانی شد.',
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در به‌روزرسانی فرم.' });
  }
});

// 5. Delete Form by ID
app.delete('/api/forms/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = serverStorage.deleteForm(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'فرم مورد نظر یافت نشد.' });
    }
    return res.json({
      success: true,
      message: 'فرم و کلیه پاسخ‌های ثبت‌شده آن با موفقیت حذف گردید.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در حذف فرم.' });
  }
});

// 6. Clone Form
app.post('/api/forms/:id/clone', (req, res) => {
  try {
    const { id } = req.params;
    const cloned = serverStorage.cloneForm(id);
    if (!cloned) {
      return res.status(404).json({ success: false, error: 'فرم اصلی یافت نشد.' });
    }
    return res.status(201).json({
      success: true,
      message: 'رونوشت جدید از فرم با موفقیت ایجاد گردید.',
      data: cloned,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در ایجاد رونوشت فرم.' });
  }
});

// 7. Toggle / Update Form Status
app.patch('/api/forms/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, error: 'وضعیت باید active یا inactive باشد.' });
    }
    const updated = serverStorage.setFormStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'فرم یافت نشد.' });
    }
    return res.json({
      success: true,
      message: `وضعیت فرم به ${status === 'active' ? 'فعال' : 'غیرفعال'} تغییر یافت.`,
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در تغییر وضعیت فرم.' });
  }
});

// ==========================================
// FORM FIELDS MANAGEMENT APIS
// ==========================================

// List fields of a form
app.get('/api/forms/:id/fields', (req, res) => {
  try {
    const { id } = req.params;
    const fields = serverStorage.getFormFields(id);
    if (fields === undefined) {
      return res.status(404).json({ success: false, error: 'فرم یافت نشد.' });
    }
    return res.json({ success: true, count: fields.length, fields });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در دریافت فیلدها.' });
  }
});

// Add field to form
app.post('/api/forms/:id/fields', (req, res) => {
  try {
    const { id } = req.params;
    const fieldData = req.body;
    if (!fieldData.type || !fieldData.label || !fieldData.name) {
      return res.status(400).json({ success: false, error: 'اطلاعات ضروری فیلد (type, label, name) ناقص است.' });
    }
    const newField = serverStorage.addFormField(id, fieldData);
    if (!newField) {
      return res.status(404).json({ success: false, error: 'فرم یافت نشد.' });
    }
    return res.status(201).json({ success: true, message: 'فیلد با موفقیت اضافه شد.', field: newField });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در افزودن فیلد.' });
  }
});

// Update specific field
app.put('/api/forms/:id/fields/:fieldId', (req, res) => {
  try {
    const { id, fieldId } = req.params;
    const fieldUpdates = req.body;
    const updated = serverStorage.updateFormField(id, fieldId, fieldUpdates);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'فرم یا فیلد مورد نظر یافت نشد.' });
    }
    return res.json({ success: true, message: 'فیلد با موفقیت ویرایش شد.', field: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در به‌روزرسانی فیلد.' });
  }
});

// Delete specific field
app.delete('/api/forms/:id/fields/:fieldId', (req, res) => {
  try {
    const { id, fieldId } = req.params;
    const deleted = serverStorage.deleteFormField(id, fieldId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'فیلد پیدا نشد.' });
    }
    return res.json({ success: true, message: 'فیلد با موفقیت حذف شد.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در حذف فیلد.' });
  }
});

// ==========================================
// PUBLIC FORMS & SUBMISSIONS APIS
// ==========================================

// Public form schema lookup for end-users
app.get('/api/public/forms/:slugOrId', (req, res) => {
  try {
    const { slugOrId } = req.params;
    const form = serverStorage.getFormById(slugOrId);
    if (!form) {
      return res.status(404).json({ success: false, error: 'فرم مورد نظر یافت نشد.' });
    }

    const isOpen = form.status === 'active' && (!form.settings.maxResponses || form.responseCount < form.settings.maxResponses);
    return res.json({
      success: true,
      isOpen,
      reason: !isOpen ? (form.status !== 'active' ? 'فرم در حال حاضر غیرفعال است.' : 'ظرفیت ثبت‌نام تکمیل شده است.') : undefined,
      form,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در دریافت اطلاعات فرم عمومی.' });
  }
});

// Public Form Submission Endpoint
app.post('/api/public/forms/:slugOrId/submit', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const { values } = req.body;
    if (!values || typeof values !== 'object') {
      return res.status(400).json({ success: false, error: 'داده‌های ارسالی فرم نامعتبر است (values الزامی است).' });
    }

    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await serverStorage.submitFormResponse(slugOrId, values, {
      ipAddress: clientIp,
      userAgent,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err: any) {
    console.error('Submission error:', err);
    return res.status(500).json({ success: false, error: 'خطا در پردازش و ذخیره پاسخ فرم.' });
  }
});

// Public Tracking Code Lookup
app.get('/api/public/tracking/:trackingCode', (req, res) => {
  try {
    const { trackingCode } = req.params;
    const submission = serverStorage.getResponseByTrackingCode(trackingCode);
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: `پاسخی با کد پیگیری "${trackingCode}" در سامانه یافت نشد.`,
      });
    }

    return res.json({
      success: true,
      submission,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در استعلام کد پیگیری.' });
  }
});

// ==========================================
// RESPONSES & EXPORT APIS
// ==========================================

// List Responses
app.get('/api/responses', (req, res) => {
  try {
    const { formId, search } = req.query as { formId?: string; search?: string };
    const responses = serverStorage.getResponses({ formId, search });
    return res.json({
      success: true,
      total: responses.length,
      data: responses,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در واکشی پاسخ‌ها.' });
  }
});

// Single Response Detail
app.get('/api/responses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const response = serverStorage.getResponseById(id);
    if (!response) {
      return res.status(404).json({ success: false, error: 'پاسخ مورد نظر یافت نشد.' });
    }
    return res.json({ success: true, data: response });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در واکشی جزئیات پاسخ.' });
  }
});

// Delete Response
app.delete('/api/responses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = serverStorage.deleteResponse(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'پاسخ پیدا نشد.' });
    }
    return res.json({ success: true, message: 'پاسخ با موفقیت حذف گردید.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در حذف پاسخ.' });
  }
});

// Export CSV for Excel
app.get('/api/forms/:id/export/csv', (req, res) => {
  try {
    const { id } = req.params;
    const form = serverStorage.getFormById(id);
    if (!form) {
      return res.status(404).json({ success: false, error: 'فرم یافت نشد.' });
    }
    const csvContent = serverStorage.exportResponsesToCSV(id);
    const filename = `responses-${form.slug || id}-${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    return res.send(csvContent);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در خروجی CSV.' });
  }
});

// Export JSON
app.get('/api/forms/:id/export/json', (req, res) => {
  try {
    const { id } = req.params;
    const form = serverStorage.getFormById(id);
    if (!form) {
      return res.status(404).json({ success: false, error: 'فرم یافت نشد.' });
    }
    const responses = serverStorage.getResponses({ formId: id });
    const filename = `responses-${form.slug || id}.json`;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    return res.json(responses);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در خروجی JSON.' });
  }
});

// ==========================================
// ANALYTICS & STATS APIS
// ==========================================

// Dashboard KPI metrics
app.get('/api/stats', (_req, res) => {
  try {
    const stats = serverStorage.getDashboardStats();
    return res.json({ success: true, data: stats });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در دریافت آمار داشبورد.' });
  }
});

// Single Form detailed stats
app.get('/api/stats/form/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stats = serverStorage.getFormStats(id);
    if (!stats) {
      return res.status(404).json({ success: false, error: 'فرم مورد نظر یافت نشد.' });
    }
    return res.json({ success: true, data: stats });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در دریافت آمار فرم.' });
  }
});

// ==========================================
// AUDIT LOGS APIS
// ==========================================

app.get('/api/logs', (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const type = req.query.type as any;
    const logs = serverStorage.getAuditLogs(limit, type);
    return res.json({ success: true, count: logs.length, data: logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در واکشی لاگ‌ها.' });
  }
});

app.delete('/api/logs', (_req, res) => {
  try {
    serverStorage.clearAuditLogs();
    return res.json({ success: true, message: 'کلیه گزارش‌های لاگ پاکسازی شدند.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در پاکسازی لاگ‌ها.' });
  }
});

// System data reset
app.post('/api/system/reset', (_req, res) => {
  try {
    serverStorage.resetToInitialSeed();
    return res.json({ success: true, message: 'داده‌های سامانه با موفقیت به حالت اولیه بازنشانی شدند.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در بازنشانی سیستم.' });
  }
});

// ==========================================
// AI FORM GENERATOR API (Gemini Multi-Model Fallback)
// ==========================================

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.post('/api/generate-form', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'لطفاً توضیحات یا ایده فرم مورد نظر خود را وارد فرمایید.' });
    }

    const trimmedPrompt = prompt.trim();
    const candidateModels = [
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
      'gemini-flash-latest',
    ];

    const formGenerationPrompt = `شما یک معمار و طراح فرم‌های وب حرفه‌ای، مدرن و با تجربه هستید.
بر اساس ایده یا توضیحات زیر از کاربر، یک فرم شیک، جامع و استاندارد به زبان فارسی همراه با فیلدهای متناسب و اعتبارسنجی‌های لازم تولید کنید:

توضیحات کاربر:
"${trimmedPrompt}"

قوانین و استانداردهای طراحی فرم:
۱. عنوان فرم (title) باید واضح، رسمی، محترمانه و دقیق باشد.
۲. توضیحات راهنما (description) باید مختصر و صمیمی باشد و نحوه تکمیل فرم را شرح دهد.
۳. فیلدها (fields) باید ساختارمند و با ترتیب منطقی چیده شوند.
۴. نوع فیلد (type) باید از میان موارد معتبر زیر انتخاب شود:
   - 'text': متن تک‌خطی کوتاه
   - 'fullname': نام و نام خانوادگی
   - 'phone': شماره همراه
   - 'student_id': شماره دانشجویی
   - 'national_id': کد ملی
   - 'email': پست الکترونیکی
   - 'number': عدد
   - 'textarea': متن چندخطی بلند
   - 'password': رمز عبور
   - 'date': تاریخ
   - 'time': ساعت
   - 'datetime': تاریخ و ساعت
   - 'select': منوی کشویی تک انتخابی
   - 'radio': دکمه‌های رادیویی
   - 'checkbox': چک‌باکس تکی
   - 'multiselect': چند انتخابی
   - 'star_rating': امتیازدهی ستاره‌ای (۱ تا ۵)
   - 'file': بارگذاری فایل
   - 'image': بارگذاری تصویر
   - 'static_text': متن راهنما یا نکته
   - 'divider': خط جداکننده

۵. برای فیلدهای انتخابی ('select', 'radio', 'multiselect')، حتماً ۲ الی ۵ گزینه معتبر (options) با label فارسی و value انگلیسی تعریف کنید.
۶. نام فنی (name) به صورت انگلیسی با حروف کوچک و snake_case باشد (مانند applicant_name, user_email, mobile_number).`;

    const schemaConfig = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'عنوان جذاب و فارسی فرم' },
          description: { type: Type.STRING, description: 'توضیحات و راهنمای کوتاه فرم' },
          fields: {
            type: Type.ARRAY,
            description: 'لیست فیلدهای هوشمند و استاندارد فرم',
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                label: { type: Type.STRING },
                name: { type: Type.STRING },
                placeholder: { type: Type.STRING },
                description: { type: Type.STRING },
                required: { type: Type.BOOLEAN },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      value: { type: Type.STRING },
                    },
                    required: ['label', 'value'],
                  },
                },
              },
              required: ['type', 'label', 'name', 'required'],
            },
          },
        },
        required: ['title', 'description', 'fields'],
      },
    };

    let generatedData = null;

    if (apiKey) {
      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: formGenerationPrompt,
            config: schemaConfig,
          });

          const text = response.text?.trim();
          if (text) {
            generatedData = JSON.parse(text);
            break;
          }
        } catch (modelError: any) {
          console.warn(`[AI-Form] Model ${model} failed, trying fallback:`, modelError?.message || modelError);
        }
      }
    }

    if (generatedData && generatedData.title && Array.isArray(generatedData.fields)) {
      return res.json({ success: true, data: generatedData });
    }

    // Heuristic Fallback Generator
    const fallbackData = createHeuristicForm(trimmedPrompt);
    return res.json({
      success: true,
      data: fallbackData,
      isFallback: true,
      notice: 'فرم بر اساس الگوریتم هوشمند با پایداری کامل ایجاد شد.',
    });
  } catch (error: any) {
    console.error('Error in /api/generate-form:', error);
    return res.status(500).json({
      error: 'سامانه هوش مصنوعی در این لحظه با ترافیک موقت مواجه شد. لطفاً مجدداً دکمه تلاش را فشار دهید.',
    });
  }
});

function createHeuristicForm(prompt: string) {
  const p = prompt.toLowerCase();
  if (p.includes('نوبت') || p.includes('پزشک') || p.includes('کلینیک') || p.includes('درمان') || p.includes('ویزیت')) {
    return {
      title: 'فرم رزرو نوبت کلینیک و ویزیت تخصصی',
      description: 'جهت رزرو نوبت مشاوره و ویزیت پزشک، لطفاً اطلاعات زیر را با دقت تکمیل فرمایید.',
      fields: [
        { type: 'fullname', label: 'نام و نام خانوادگی بیمار', name: 'patient_name', placeholder: 'مثال: علیرضا محمدی', required: true },
        { type: 'phone', label: 'شماره تلفن همراه', name: 'phone_number', placeholder: '09123456789', required: true },
        {
          type: 'select',
          label: 'تخصص پزشکی مورد نظر',
          name: 'medical_specialty',
          required: true,
          options: [
            { label: 'پزشک عمومی', value: 'general_practitioner' },
            { label: 'داخلی و گوارش', value: 'internal_medicine' },
            { label: 'قلب و عروق', value: 'cardiology' },
          ],
        },
        { type: 'date', label: 'تاریخ مراجعه مورد نظر', name: 'appointment_date', required: true },
        { type: 'time', label: 'ساعت مراجعه', name: 'appointment_time', placeholder: 'مثال: 16:30', required: true },
        { type: 'textarea', label: 'شرح علائم و علت مراجعه', name: 'symptoms_description', required: false },
      ],
    };
  }

  if (p.includes('استخدام') || p.includes('برنامه‌نویس') || p.includes('شغل') || p.includes('رزومه')) {
    return {
      title: 'فرم جذب و استخدام همکاران جدید',
      description: 'جهت بررسی رزومه و پیوستن به تیم ما، لطفاً مشخصات و سوابق خود را ارسال فرمایید.',
      fields: [
        { type: 'fullname', label: 'نام و نام خانوادگی', name: 'candidate_name', placeholder: 'مثال: رضا سلیمانی', required: true },
        { type: 'email', label: 'پست الکترونیکی', name: 'email_address', placeholder: 'candidate@example.com', required: true },
        { type: 'phone', label: 'شماره تلفن همراه', name: 'mobile_number', placeholder: '09123456789', required: true },
        { type: 'text', label: 'لینک رزومه یا گیت‌هاب', name: 'portfolio_link', placeholder: 'https://github.com/...', required: false },
        { type: 'number', label: 'سابقه کار مرتبط (سال)', name: 'experience_years', placeholder: 'مثال: 3', required: true },
        { type: 'textarea', label: 'شرح مهارت‌ها و پروژه‌ها', name: 'skills_summary', required: true },
      ],
    };
  }

  return {
    title: prompt.length > 50 ? `${prompt.slice(0, 48)}...` : prompt,
    description: 'لطفاً فیلدهای زیر را با دقت تکمیل فرمایید.',
    fields: [
      { type: 'fullname', label: 'نام و نام خانوادگی', name: 'full_name', placeholder: 'نام کامل خود را وارد فرمایید', required: true },
      { type: 'phone', label: 'شماره تلفن همراه', name: 'phone_number', placeholder: '09123456789', required: true },
      { type: 'email', label: 'پست الکترونیکی', name: 'email', placeholder: 'name@example.com', required: false },
      { type: 'textarea', label: 'توضیحات و متن درخواست', name: 'request_details', placeholder: 'توضیحات تکمیلی...', required: true },
    ],
  };
}

// ==========================================
// WEBHOOK APIS
// ==========================================

app.post('/api/webhook/dispatch', async (req, res) => {
  const startTime = Date.now();
  try {
    const { url, secret, payload } = req.body;
    if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) {
      return res.status(400).json({ success: false, error: 'آدرس وب‌هوک معتبر نیست (باید با http:// یا https:// آغاز شود).' });
    }

    const targetUrl = url.trim();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'FormSaz-Pro-Webhook/1.0',
      'X-FormSaz-Event': payload?.event || 'form_response.submitted',
      'X-FormSaz-Delivery': `del_${Date.now()}`,
    };

    if (secret && typeof secret === 'string' && secret.trim()) {
      headers['X-Webhook-Secret'] = secret.trim();
      headers['Authorization'] = `Bearer ${secret.trim()}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const externalResponse = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload || {}),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const durationMs = Date.now() - startTime;
    let responseText = '';
    try {
      responseText = (await externalResponse.text()).slice(0, 500);
    } catch {
      // ignore
    }

    return res.json({
      success: externalResponse.ok,
      status: externalResponse.status,
      statusText: externalResponse.statusText,
      durationMs,
      responsePreview: responseText,
    });
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    return res.status(502).json({
      success: false,
      error: error?.message || 'خطا در برقراری ارتباط با آدرس وب‌هوک مقصد.',
      durationMs,
    });
  }
});

app.post('/api/webhook/test', async (req, res) => {
  const startTime = Date.now();
  try {
    const { url, secret, payload } = req.body;
    if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) {
      return res.status(400).json({ success: false, error: 'آدرس وب‌هوک باید با http:// یا https:// شروع شود.' });
    }

    const targetUrl = url.trim();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'FormSaz-Pro-Webhook-Test/1.0',
      'X-FormSaz-Event': 'webhook.test_ping',
      'X-FormSaz-Delivery': `test_${Date.now()}`,
    };

    if (secret && typeof secret === 'string' && secret.trim()) {
      headers['X-Webhook-Secret'] = secret.trim();
      headers['Authorization'] = `Bearer ${secret.trim()}`;
    }

    const testPayload = payload || {
      event: 'webhook.test_ping',
      timestamp: new Date().toISOString(),
      message: 'این یک درخواست آزمایشی برای بررسی صحت اتصال وب‌هوک فرم‌ساز است.',
      sampleData: {
        trackingCode: 'TRK-TEST-7890',
        formTitle: 'فرم آزمایشی تست وب‌هوک',
        sampleValues: {
          fullName: 'کاربر آزمایشی',
          email: 'test@example.com',
          message: 'تست موفقیت‌آمیز است.',
        },
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const externalResponse = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(testPayload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const durationMs = Date.now() - startTime;
    let responseText = '';
    try {
      responseText = (await externalResponse.text()).slice(0, 500);
    } catch {
      // ignore
    }

    return res.json({
      success: externalResponse.ok,
      status: externalResponse.status,
      statusText: externalResponse.statusText,
      durationMs,
      responsePreview: responseText,
    });
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    return res.status(502).json({
      success: false,
      error: error?.message || 'برقراری ارتباط با وب‌هوک با خطا یا وقفه زمانی (Timeout) مواجه شد.',
      durationMs,
    });
  }
});

// ==========================================
// SERVE FRONTEND (DEV OR PROD)
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 FormSaz Pro Server is running on port ${port}`);
    console.log(`📖 Swagger UI Documentation: http://localhost:${port}/api/docs or http://localhost:${port}/swagger`);
    console.log(`📄 OpenAPI 3.0 Specification: http://localhost:${port}/api/openapi.json`);
  });
}

startServer();
