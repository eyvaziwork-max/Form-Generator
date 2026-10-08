export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'سامانه فرم‌ساز پرو (FormSaz Pro API)',
    version: '1.0.0',
    description: `
## سامانه جامع و هوشمند فرم‌ساز سازمانی (FormSaz Pro RESTful API)

این مستندات استاندارد **OpenAPI 3.0 / Swagger** تمامی وب‌سرویس‌ها و APIهای سامانه را پوشش می‌دهد:

- 📋 **Forms Management API:** ایجاد، ویرایش، حذف، دریافت، شبیه‌سازی و مدیریت وضعیت فرم‌ها
- 🧩 **Fields API:** افزودن، ویرایش، حذف و مرتب‌سازی فیلدهای پیشرفته
- 🌐 **Public Forms & Submissions:** واکشی اسکیما و ارسال امن پاسخ‌های کاربران همراه با اعتبارسنجی بلادرنگ سرور، صدور کد رهگیری \`TRK-XXXXXX\` و ارسال خودکار وب‌هوک
- 📊 **Responses & Exports:** فهرست، فیلتر، جزئیات و دانلود خروجی‌های استاندارد اکسل (CSV با UTF-8 BOM) و JSON
- 📈 **Analytics & KPI:** شاخص‌های کلیدی عملکرد، روندهای ثبت و آمار تحلیلی تفکیکی هر فرم
- 🔍 **Audit Logs:** لاگ‌ها و رخدادهای سیستمی
- 🤖 **AI Form Generator:** تولید خودکار ساختار فرم با هوش مصنوعی چندمدلی Gemini و پشتیبان هوشمند
- 🔔 **Webhooks:** تست اتصال و مخابره آنی رویدادهای ثبت پاسخ به وب‌هوک‌های خارجی (Zapier, n8n, Make)
    `,
    contact: {
      name: 'پشتیبانی فنی فرم‌ساز پرو',
      email: 'support@formsaz.local',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: '/',
      description: 'سرور محلی / توسعه فعال (Current Server)',
    },
  ],
  tags: [
    { name: 'Forms', description: 'مدیریت فرم‌ها (CRUD, وضعیت، شبیه‌سازی)' },
    { name: 'Fields', description: 'مدیریت فیلدهای اختصاصی فرم‌ها' },
    { name: 'Public Submissions', description: 'نمای عمومی، ثبت پاسخ و رهگیری با کد پیگیری' },
    { name: 'Responses', description: 'مدیریت پاسخ‌ها، جستجو و خروجی اکسل/JSON' },
    { name: 'Analytics', description: 'آمار داشبورد و تحلیل‌های تفکیکی فرم' },
    { name: 'Logs', description: 'گزارش‌های حسابرسی و لاگ‌های رخدادهای سیستم' },
    { name: 'AI Generator', description: 'تولید هوشمند فرم با مدل‌های هوش مصنوعی Gemini' },
    { name: 'Webhooks', description: 'تست و ارسال وب‌هوک به سرویس‌های بیرونی' },
  ],
  paths: {
    '/api/forms': {
      get: {
        tags: ['Forms'],
        summary: 'دریافت فهرست فرم‌ها',
        description: 'فهرست تمامی فرم‌های موجود را همراه با تعداد پاسخ‌های دریافتی برمی‌گرداند.',
        parameters: [
          {
            name: 'search',
            in: 'query',
            description: 'عبارت جستجو در عنوان یا توضیحات یا اسلاگ فرم',
            required: false,
            schema: { type: 'string' },
          },
          {
            name: 'status',
            in: 'query',
            description: 'فیلتر بر اساس وضعیت فرم',
            required: false,
            schema: { type: 'string', enum: ['active', 'inactive'] },
          },
        ],
        responses: {
          '200': {
            description: 'عملیات موفق',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    count: { type: 'integer', example: 2 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Form' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Forms'],
        summary: 'ایجاد فرم جدید',
        description: 'ایجاد یک فرم جدید به همراه تنظیمات اولیه و فیلدها.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateFormDto' },
            },
          },
        },
        responses: {
          '201': {
            description: 'فرم با موفقیت ایجاد شد',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'فرم با موفقیت ایجاد گردید.' },
                    data: { $ref: '#/components/schemas/Form' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'داده‌های ارسالی ناقص یا نامعتبر است',
          },
        },
      },
    },

    '/api/forms/{id}': {
      get: {
        tags: ['Forms'],
        summary: 'دریافت مشخصات یک فرم',
        description: 'دریافت اطلاعات و فیلدهای یک فرم از طریق شناسه (ID) یا اسلاگ (Slug).',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'شناسه فرم (مانند form-student-reg-01) یا اسلاگ',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'اطلاعات فرم',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Form' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'فرم مورد نظر یافت نشد',
          },
        },
      },
      put: {
        tags: ['Forms'],
        summary: 'ویرایش مشخصات فرم',
        description: 'به‌روزرسانی عنوان، توضیحات، اسلاگ، تنظیمات و فیلدهای فرم.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'شناسه فرم',
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateFormDto' },
            },
          },
        },
        responses: {
          '200': {
            description: 'فرم با موفقیت به‌روزرسانی شد',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'تغییرات فرم با موفقیت ذخیره شد.' },
                    data: { $ref: '#/components/schemas/Form' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'فرم مورد نظر یافت نشد',
          },
        },
      },
      delete: {
        tags: ['Forms'],
        summary: 'حذف فرم',
        description: 'حذف دائمی فرم و کلیه پاسخ‌های ثبت‌شده برای آن.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'شناسه فرم',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'فرم با موفقیت حذف شد',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'فرم و کلیه پاسخ‌های آن با موفقیت حذف گردید.' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'فرم مورد نظر یافت نشد',
          },
        },
      },
    },

    '/api/forms/{id}/clone': {
      post: {
        tags: ['Forms'],
        summary: 'شبیه‌سازی و تکثیر فرم',
        description: 'ایجاد یک رونوشت مستقل از فرم موجود با شناسه‌ها و اسلاگ مجزا.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'شناسه فرم جهت تکثیر',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '201': {
            description: 'رونوشت با موفقیت ساخته شد',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'رونوشت جدید از فرم با موفقیت ایجاد گردید.' },
                    data: { $ref: '#/components/schemas/Form' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'فرم اصلی یافت نشد',
          },
        },
      },
    },

    '/api/forms/{id}/status': {
      patch: {
        tags: ['Forms'],
        summary: 'تغییر وضعیت فعال/غیرفعال بودن فرم',
        description: 'فعال یا متوقف‌سازی فرم جهت دریافت پاسخ‌های جدید.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'وضعیت فرم با موفقیت به‌روزرسانی شد',
          },
        },
      },
    },

    '/api/forms/{id}/fields': {
      get: {
        tags: ['Fields'],
        summary: 'دریافت لیست فیلدهای فرم',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'لیست فیلدها',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    fields: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/FormField' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Fields'],
        summary: 'افزودن فیلد جدید به فرم',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FormField' },
            },
          },
        },
        responses: {
          '201': {
            description: 'فیلد با موفقیت اضافه شد',
          },
        },
      },
    },

    '/api/forms/{id}/fields/{fieldId}': {
      put: {
        tags: ['Fields'],
        summary: 'ویرایش مشخصات یک فیلد',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'fieldId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FormField' },
            },
          },
        },
        responses: {
          '200': {
            description: 'فیلد با موفقیت ویرایش شد',
          },
        },
      },
      delete: {
        tags: ['Fields'],
        summary: 'حذف فیلد از فرم',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'fieldId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'فیلد حذف گردید',
          },
        },
      },
    },

    '/api/public/forms/{slugOrId}': {
      get: {
        tags: ['Public Submissions'],
        summary: 'دریافت ساختار فرم عمومی برای کاربر نهایی',
        description: 'اسکیما، فیلدها و عنوان فرم را برای رندر کردن در فرانت‌اند عمومی برمی‌گرداند. همچنین فعال بودن و سقف پاسخ‌دهی را اعتبارسنجی می‌کند.',
        parameters: [
          {
            name: 'slugOrId',
            in: 'path',
            required: true,
            description: 'شناسه فرم یا اسلاگ (مانند student-registration)',
            schema: { type: 'string', example: 'student-registration' },
          },
        ],
        responses: {
          '200': {
            description: 'فرم آماده نمایش است',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    isOpen: { type: 'boolean', example: true },
                    form: { $ref: '#/components/schemas/Form' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'فرم پیدا نشد',
          },
        },
      },
    },

    '/api/public/forms/{slugOrId}/submit': {
      post: {
        tags: ['Public Submissions'],
        summary: 'ثبت پاسخ در فرم عمومی',
        description: 'ارسال مقادیر فرم توسط کاربر، انجام اعتبارسنجی سمت سرور، تولید کد رهگیری منحصر‌به‌فرد، ذخیره در دیتابیس و مخابره به وب‌هوک.',
        parameters: [
          {
            name: 'slugOrId',
            in: 'path',
            required: true,
            description: 'شناسه یا اسلاگ فرم',
            schema: { type: 'string', example: 'student-registration' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SubmitResponseDto' },
            },
          },
        },
        responses: {
          '200': {
            description: 'پاسخ با موفقیت ثبت شد',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SubmissionResult' },
              },
            },
          },
          '400': {
            description: 'خطای اعتبارسنجی فیلدها',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'برخی فیلدها نامعتبر هستند.' },
                    errors: {
                      type: 'object',
                      additionalProperties: { type: 'string' },
                      example: { phone: 'شماره موبایل باید ۱۱ رقم باشد.' },
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'فرم یافت نشد',
          },
        },
      },
    },

    '/api/public/tracking/{trackingCode}': {
      get: {
        tags: ['Public Submissions'],
        summary: 'استعلام وضعیت پاسخ با کد پیگیری',
        description: 'بررسی وضعیت و بازیابی خلاصه اطلاعات ثبت‌شده با کد پیگیری (مانند TRK-491024).',
        parameters: [
          {
            name: 'trackingCode',
            in: 'path',
            required: true,
            description: 'کد پیگیری معتبر ۶ رقمی',
            schema: { type: 'string', example: 'TRK-491024' },
          },
        ],
        responses: {
          '200': {
            description: 'اطلاعات پاسخ یافت شد',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    submission: { $ref: '#/components/schemas/FormResponse' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'کد پیگیری یافت نشد',
          },
        },
      },
    },

    '/api/responses': {
      get: {
        tags: ['Responses'],
        summary: 'دریافت فهرست پاسخ‌ها',
        description: 'لیست تمامی پاسخ‌های کاربران را با قابلیت فیلتر بر اساس فرم و جستجوی متن برمی‌گرداند.',
        parameters: [
          {
            name: 'formId',
            in: 'query',
            description: 'شناسه فرم جهت فیلتر',
            required: false,
            schema: { type: 'string', example: 'form-student-reg-01' },
          },
          {
            name: 'search',
            in: 'query',
            description: 'جستجو در کد پیگیری یا مقادیر فیلدها',
            required: false,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'فهرست پاسخ‌ها',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    total: { type: 'integer', example: 5 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/FormResponse' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/responses/{id}': {
      get: {
        tags: ['Responses'],
        summary: 'دریافت جزئیات یک پاسخ',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'پاسخ یافت شد',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/FormResponse' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'پاسخ یافت نشد',
          },
        },
      },
      delete: {
        tags: ['Responses'],
        summary: 'حذف یک پاسخ',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'پاسخ حذف شد',
          },
        },
      },
    },

    '/api/forms/{id}/export/csv': {
      get: {
        tags: ['Responses'],
        summary: 'دانلود خروجی CSV سازگار با مایکروسافت اکسل',
        description: 'فایل CSV با فرمت UTF-8 و BOM به منظور نمایش صحیح کاراکترهای فارسی در نرم‌افزار اکسل دانلود می‌شود.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'فایل اکسل/CSV',
            content: {
              'text/csv': {
                schema: { type: 'string' },
              },
            },
          },
        },
      },
    },

    '/api/forms/{id}/export/json': {
      get: {
        tags: ['Responses'],
        summary: 'خروجی کامل پاسخ‌ها در قالب JSON',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'فایل خروجی JSON',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/FormResponse' },
                },
              },
            },
          },
        },
      },
    },

    '/api/stats': {
      get: {
        tags: ['Analytics'],
        summary: 'شاخص‌های کلیدی عملکرد و آمار داشبورد',
        description: 'تعداد کل فرم‌ها، فرم‌های فعال، پاسخ‌های ثبت‌شده، آمار امروز و نمودار روند ۷ روز گذشته.',
        responses: {
          '200': {
            description: 'آمار داشبورد',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/DashboardStats' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/stats/form/{id}': {
      get: {
        tags: ['Analytics'],
        summary: 'آمار و تحلیل تفصیلی یک فرم مشخص',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'آمار تفکیکی فرم',
          },
        },
      },
    },

    '/api/logs': {
      get: {
        tags: ['Logs'],
        summary: 'فهرست گزارش‌های حسابرسی و لاگ‌های سیستم',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['info', 'success', 'warning', 'error'] } },
        ],
        responses: {
          '200': {
            description: 'لیست لاگ‌ها',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/AuditLog' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Logs'],
        summary: 'پاکسازی تاریخچه لاگ‌ها',
        responses: {
          '200': {
            description: 'لاگ‌ها پاک شدند',
          },
        },
      },
    },

    '/api/generate-form': {
      post: {
        tags: ['AI Generator'],
        summary: 'تولید هوشمند اسکیما و ساختار فرم با هوش مصنوعی',
        description: 'ایجاد فیلدها و عنوان فرم بر اساس پرامپت متنی کاربر به زبان فارسی با استفاده از مدل‌های Gemini و سیستم فال‌بک پایدار.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GenerateFormRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'ساختار فرم با موفقیت تولید شد',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        title: { type: 'string', example: 'فرم رزرو نوبت کلینیک' },
                        description: { type: 'string', example: 'لطفاً اطلاعات خود را تکمیل فرمایید.' },
                        fields: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/FormField' },
                        },
                      },
                    },
                    isFallback: { type: 'boolean', example: false },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/webhook/test': {
      post: {
        tags: ['Webhooks'],
        summary: 'ارسال درخواست آزمایشی جهت راستی‌آزمایی وب‌هوک',
        description: 'ارسال یک پینگ تستی با متد POST به نشانی وب‌هوک مقصد و سنجش زمان پاسخ و کد وضعیت HTTP.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/WebhookTestRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'نتیجه تست وب‌هوک',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    status: { type: 'integer', example: 200 },
                    statusText: { type: 'string', example: 'OK' },
                    durationMs: { type: 'integer', example: 120 },
                    responsePreview: { type: 'string', example: '{"received": true}' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/webhook/dispatch': {
      post: {
        tags: ['Webhooks'],
        summary: 'مخابره مستقیم رویداد و داده به وب‌هوک',
        description: 'ارسال پی‌لود حاوی رویداد و مقادیر به اندپوینت وب‌هوک مقصد همراه با هدرهای استاندارد امنیتی.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/WebhookDispatchDto' },
            },
          },
        },
        responses: {
          '200': {
            description: 'نتیجه مخابره وب‌هوک',
          },
        },
      },
    },
  },

  components: {
    schemas: {
      Form: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'form-student-reg-01' },
          title: { type: 'string', example: 'فرم ثبت اطلاعات دانشجویان' },
          description: { type: 'string', example: 'ثبت اطلاعات هویتی و تحصیلی دانشجویان' },
          slug: { type: 'string', example: 'student-registration' },
          status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
          fields: {
            type: 'array',
            items: { $ref: '#/components/schemas/FormField' },
          },
          settings: { $ref: '#/components/schemas/FormSettings' },
          responseCount: { type: 'integer', example: 5 },
          lastResponseAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      FormField: {
        type: 'object',
        required: ['type', 'label', 'name', 'required'],
        properties: {
          id: { type: 'string', example: 'f-first-name' },
          type: {
            type: 'string',
            enum: [
              'text',
              'fullname',
              'phone',
              'student_id',
              'national_id',
              'email',
              'number',
              'textarea',
              'password',
              'date',
              'time',
              'datetime',
              'select',
              'radio',
              'checkbox',
              'multiselect',
              'star_rating',
              'file',
              'image',
              'static_text',
              'divider',
            ],
            example: 'text',
          },
          label: { type: 'string', example: 'نام' },
          name: { type: 'string', example: 'first_name' },
          placeholder: { type: 'string', example: 'مثال: علی' },
          description: { type: 'string', example: 'نام خود را مطابق شناسنامه وارد کنید' },
          required: { type: 'boolean', example: true },
          active: { type: 'boolean', example: true },
          order: { type: 'integer', example: 1 },
          minLength: { type: 'integer', example: 2 },
          maxLength: { type: 'integer', example: 30 },
          minValue: { type: 'number' },
          maxValue: { type: 'number' },
          regexPattern: { type: 'string', example: '^[0-9]+$' },
          customErrorMessage: { type: 'string', example: 'لطفاً نام را به درستی وارد کنید' },
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'opt-1' },
                label: { type: 'string', example: 'گزینه اول' },
                value: { type: 'string', example: 'opt_1' },
              },
            },
          },
        },
      },

      FormSettings: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'فرم ثبت اطلاعات دانشجویان' },
          description: { type: 'string', example: 'راهنمای ثبت اطلاعات' },
          slug: { type: 'string', example: 'student-registration' },
          status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
          successMessage: { type: 'string', example: 'اطلاعات شما با موفقیت ثبت شد.' },
          maxResponses: { type: 'integer', nullable: true, example: 200 },
          enableCaptcha: { type: 'boolean', example: false },
          allowMultipleSubmissions: { type: 'boolean', example: true },
          themeColor: { type: 'string', example: '#4f46e5' },
          emailNotificationEnabled: { type: 'boolean', example: true },
          notificationEmail: { type: 'string', example: 'admin@university.ac.ir' },
          webhookEnabled: { type: 'boolean', example: false },
          webhookUrl: { type: 'string', example: 'https://webhook.site/test' },
          webhookSecret: { type: 'string', example: 'my-secret-key' },
          webhookIncludeMetadata: { type: 'boolean', example: true },
        },
      },

      FormResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'resp-std-001' },
          formId: { type: 'string', example: 'form-student-reg-01' },
          formTitle: { type: 'string', example: 'فرم ثبت اطلاعات دانشجویان' },
          trackingCode: { type: 'string', example: 'TRK-491024' },
          submittedAt: { type: 'string', example: '۱۴ مهر ۱۴۰۵، ساعت ۱۱:۳۰' },
          ipAddress: { type: 'string', example: '192.168.1.104' },
          values: {
            type: 'object',
            additionalProperties: true,
            example: {
              first_name: 'علی',
              last_name: 'احمدی',
              student_id: '40114021',
              phone: '09123456789',
            },
          },
        },
      },

      DashboardStats: {
        type: 'object',
        properties: {
          totalForms: { type: 'integer', example: 2 },
          activeForms: { type: 'integer', example: 2 },
          totalResponses: { type: 'integer', example: 7 },
          todayResponses: { type: 'integer', example: 3 },
          thisWeekResponses: { type: 'integer', example: 7 },
          averageFieldsPerForm: { type: 'number', example: 3.5 },
          recentResponsesChart: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string', example: 'دوشنبه ۱۴' },
                count: { type: 'integer', example: 2 },
              },
            },
          },
        },
      },

      AuditLog: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'log-1' },
          action: { type: 'string', example: 'ثبت پاسخ جدید' },
          details: { type: 'string', example: 'پاسخ با کد رهگیری TRK-491024 ثبت شد.' },
          timestamp: { type: 'string', example: '۱۴ مهر ۱۴۰۵، ساعت ۱۱:۳۵' },
          type: { type: 'string', enum: ['info', 'success', 'warning', 'error'], example: 'success' },
        },
      },

      CreateFormDto: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', example: 'فرم ثبت‌نام دوره آموزشی پاییزی' },
          description: { type: 'string', example: 'جهت حضور در دوره لطفاً مشخصات خود را وارد کنید.' },
          slug: { type: 'string', example: 'fall-course-reg' },
          fields: {
            type: 'array',
            items: { $ref: '#/components/schemas/FormField' },
          },
          settings: { $ref: '#/components/schemas/FormSettings' },
        },
      },

      UpdateFormDto: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          slug: { type: 'string' },
          status: { type: 'string', enum: ['active', 'inactive'] },
          fields: {
            type: 'array',
            items: { $ref: '#/components/schemas/FormField' },
          },
          settings: { $ref: '#/components/schemas/FormSettings' },
        },
      },

      SubmitResponseDto: {
        type: 'object',
        required: ['values'],
        properties: {
          values: {
            type: 'object',
            additionalProperties: true,
            description: 'مقادیر متناظر با فیلدهای فرم بر اساس نام فنی (name)',
            example: {
              first_name: 'رضا',
              last_name: 'سلیمانی',
              student_id: '40123456',
              phone: '09121112233',
            },
          },
        },
      },

      SubmissionResult: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          trackingCode: { type: 'string', example: 'TRK-982143' },
          message: { type: 'string', example: 'اطلاعات دانشجویی شما با موفقیت در سامانه ثبت شد.' },
          submittedAt: { type: 'string', example: '۱۴ مهر ۱۴۰۵' },
          webhookDispatched: { type: 'boolean', example: true },
        },
      },

      GenerateFormRequest: {
        type: 'object',
        required: ['prompt'],
        properties: {
          prompt: {
            type: 'string',
            example: 'یک فرم نوبت‌دهی دندان‌پزشکی با امکان تعیین تخصص، نام، شماره همراه و تاریخ مراجعه',
          },
        },
      },

      WebhookTestRequest: {
        type: 'object',
        required: ['url'],
        properties: {
          url: { type: 'string', example: 'https://httpbin.org/post' },
          secret: { type: 'string', example: 'test-secret-key' },
          payload: { type: 'object', additionalProperties: true },
        },
      },

      WebhookDispatchDto: {
        type: 'object',
        required: ['url', 'payload'],
        properties: {
          url: { type: 'string', example: 'https://api.my-domain.com/webhook' },
          secret: { type: 'string', example: 'bearer-token' },
          payload: { type: 'object', additionalProperties: true },
        },
      },
    },
  },
};

/**
 * Returns a styled, high-performance Swagger UI standalone HTML template.
 */
export function getSwaggerHtml(specUrl: string = '/api/docs/swagger.json'): string {
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>مستندات کامل API - سامانه فرم‌ساز پرو (Swagger UI)</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #4f46e5;
      --primary-hover: #4338ca;
    }
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      direction: rtl;
    }
    .custom-header {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
      color: white;
      padding: 1.25rem 2rem;
      box-shadow: 0 4px 20px -5px rgba(0,0,0,0.25);
      position: sticky;
      top: 0;
      z-index: 999;
    }
    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .header-brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .badge {
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.25);
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-weight: 600;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 0.9rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
    }
    .btn-light {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
    .btn-light:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateY(-1px);
    }
    .btn-accent {
      background: #10b981;
      color: white;
    }
    .btn-accent:hover {
      background: #059669;
      transform: translateY(-1px);
    }
    .swagger-container {
      max-width: 1400px;
      margin: 1.5rem auto 3rem auto;
      padding: 0 1.5rem;
      direction: ltr; /* Swagger UI internal structure works reliably in LTR with Persian text rendered cleanly */
    }
    /* Polish Swagger UI styling */
    .swagger-ui {
      font-family: inherit;
    }
    .swagger-ui .topbar {
      display: none !important;
    }
    .swagger-ui .info {
      margin: 1.5rem 0 2rem 0;
      background: white;
      padding: 1.75rem;
      border-radius: 1rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      direction: rtl;
    }
    .swagger-ui .info .title {
      font-family: 'Vazirmatn', sans-serif;
      font-weight: 800;
      color: #1e1b4b;
      margin-bottom: 0.5rem;
    }
    .swagger-ui .info p, .swagger-ui .info li {
      font-family: 'Vazirmatn', sans-serif;
      line-height: 1.8;
      color: #334155;
    }
    .swagger-ui .opblock {
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      margin-bottom: 1rem;
      border: 1px solid rgba(0,0,0,0.07);
    }
    .swagger-ui .opblock .opblock-summary-operation-id, 
    .swagger-ui .opblock .opblock-summary-path, 
    .swagger-ui .opblock .opblock-summary-path__deprecated {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.95rem;
      font-weight: 600;
    }
    .swagger-ui .opblock .opblock-summary-description {
      font-family: 'Vazirmatn', sans-serif;
      font-size: 0.88rem;
    }
    .swagger-ui .btn.execute {
      background-color: #4f46e5 !important;
      border-color: #4f46e5 !important;
      color: white !important;
      border-radius: 0.5rem;
      font-weight: 700;
    }
    .swagger-ui .btn.try-out__btn {
      border-radius: 0.5rem;
      font-weight: 600;
    }
    .swagger-ui select {
      border-radius: 0.5rem;
    }
  </style>
</head>
<body>
  <header class="custom-header">
    <div class="header-content">
      <div class="header-brand">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
        <div>
          <strong style="font-size: 1.15rem; letter-spacing: -0.02em;">مستندات رسمی و تعاملی API (Swagger)</strong>
          <span class="badge">OpenAPI 3.0.3</span>
        </div>
      </div>
      <div class="header-actions">
        <a href="/" class="btn btn-light" title="بازگشت به محیط کاربری فرم‌ساز">
          ← بازگشت به برنامه
        </a>
        <a href="/api/openapi.json" target="_blank" class="btn btn-light" title="دریافت فایل JSON مشخصات OpenAPI">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          دانلود OpenAPI JSON
        </a>
      </div>
    </div>
  </header>

  <main class="swagger-container">
    <div id="swagger-ui"></div>
  </main>

  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: "${specUrl}",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        docExpansion: "list",
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
        persistAuthorization: true
      });
      window.ui = ui;
    };
  </script>
</body>
</html>`;
}
