import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI client with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: AI Form Schema Generation
app.post('/api/generate-form', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'لطفاً توضیحات یا ایده فرم مورد نظر خود را وارد فرمایید.' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'کلید وب‌سرویس هوش مصنوعی (GEMINI_API_KEY) در سرور یافت نشد. لطفاً آن را در بخش Secrets تنظیم فرمایید.',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `شما یک معمار و طراح فرم‌های وب حرفه‌ای، مدرن و با تجربه هستید.
بر اساس ایده یا توضیحات زیر از کاربر، یک فرم شیک، جامع و استاندارد به زبان فارسی همراه با فیلدهای متناسب و اعتبارسنجی‌های لازم تولید کنید:

توضیحات کاربر:
"${prompt.trim()}"

قوانین و استانداردهای طراحی فرم:
۱. عنوان فرم (title) باید واضح، رسمی، محترمانه و دقیق باشد.
۲. توضیحات راهنما (description) باید مختصر و صمیمی باشد و نحوه تکمیل فرم را شرح دهد.
۳. فیلدها (fields) باید ساختارمند و با ترتیب منطقی (نام، اطلاعات تماس، فیلدهای اصلی و سوالات و پیام) چیده شوند.
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
۶. نام فنی (name) به صورت انگلیسی با حروف کوچک و snake_case باشد (مانند applicant_name, user_email, mobile_number, satisfaction_level).`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'عنوان جذاب و فارسی فرم',
            },
            description: {
              type: Type.STRING,
              description: 'توضیحات و راهنمای کوتاه فرم برای کاربران',
            },
            fields: {
              type: Type.ARRAY,
              description: 'لیست فیلدهای هوشمند و استاندارد فرم',
              items: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    description: 'نوع معتبر فیلد',
                  },
                  label: {
                    type: Type.STRING,
                    description: 'عنوان فارسی فیلد',
                  },
                  name: {
                    type: Type.STRING,
                    description: 'نام فنی انگلیسی snake_case',
                  },
                  placeholder: {
                    type: Type.STRING,
                    description: 'متن راهنما درون فیلد',
                  },
                  description: {
                    type: Type.STRING,
                    description: 'توضیح زیر فیلد در صورت لزوم',
                  },
                  required: {
                    type: Type.BOOLEAN,
                    description: 'آیا فیلد اجباری است',
                  },
                  options: {
                    type: Type.ARRAY,
                    description: 'گزینه‌ها برای فیلدهای انتخابی',
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
      },
    });

    const text = response.text?.trim();
    if (!text) {
      return res.status(502).json({ error: 'پاسخی از هوش مصنوعی دریافت نشد.' });
    }

    const parsedData = JSON.parse(text);
    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error generating form schema via Gemini:', error);
    return res.status(500).json({
      error: error?.message || 'خطا در ارتباط با سرور هوش مصنوعی و تولید فرم.',
    });
  }
});

// Serve frontend in dev (Vite middleware) and prod (static files)
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
    console.log(`Server listening on port ${port}`);
  });
}

startServer();
