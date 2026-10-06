import { FormFieldType } from '../types/form';

export interface FieldTypeDefinition {
  type: FormFieldType;
  title: string;
  category: 'basic' | 'personal' | 'choices' | 'datetime' | 'media' | 'structure';
  icon: string;
  defaultLabel: string;
  defaultPlaceholder?: string;
  defaultDescription?: string;
  hasOptions?: boolean;
}

export const FIELD_CATEGORIES = [
  { id: 'personal', title: 'اطلاعات هویتی و پرکاربرد' },
  { id: 'basic', title: 'فیلدهای ورودی متنی' },
  { id: 'choices', title: 'گزینه‌ای و چندانتخابی' },
  { id: 'datetime', title: 'تاریخ و زمان' },
  { id: 'media', title: 'فایل و چندرسانه‌ای' },
  { id: 'structure', title: 'ساختار و توضیحات' },
] as const;

export const AVAILABLE_FIELD_TYPES: FieldTypeDefinition[] = [
  // Personal / Common
  {
    type: 'fullname',
    title: 'نام و نام خانوادگی',
    category: 'personal',
    icon: 'User',
    defaultLabel: 'نام و نام خانوادگی',
    defaultPlaceholder: 'مثال: علی احمدی',
    defaultDescription: 'نام و نام خانوادگی کامل را وارد کنید.',
  },
  {
    type: 'student_id',
    title: 'شماره دانشجویی',
    category: 'personal',
    icon: 'GraduationCap',
    defaultLabel: 'شماره دانشجویی',
    defaultPlaceholder: 'مثال: 40112345',
    defaultDescription: 'شماره دانشجویی بین ۵ تا ۱۲ رقم عددی',
  },
  {
    type: 'phone',
    title: 'شماره موبایل',
    category: 'personal',
    icon: 'Phone',
    defaultLabel: 'شماره موبایل',
    defaultPlaceholder: 'مثال: 09123456789',
    defaultDescription: 'شماره همراه معتبر با ۰۹ شروع شود.',
  },
  {
    type: 'national_id',
    title: 'کد ملی',
    category: 'personal',
    icon: 'CreditCard',
    defaultLabel: 'کد ملی',
    defaultPlaceholder: 'مثال: 0012345678',
    defaultDescription: 'کد ملی ۱۰ رقمی معتبر',
  },

  // Basic Text
  {
    type: 'text',
    title: 'متن تک‌خطی',
    category: 'basic',
    icon: 'Type',
    defaultLabel: 'عنوان فیلد متنی',
    defaultPlaceholder: 'متن خود را وارد کنید...',
  },
  {
    type: 'textarea',
    title: 'متن چندخطی (Textarea)',
    category: 'basic',
    icon: 'AlignLeft',
    defaultLabel: 'توضیحات و یادداشت',
    defaultPlaceholder: 'توضیحات تکمیلی را در اینجا بنویسید...',
  },
  {
    type: 'number',
    title: 'عدد',
    category: 'basic',
    icon: 'Hash',
    defaultLabel: 'مقدار عددی',
    defaultPlaceholder: '0',
  },
  {
    type: 'email',
    title: 'ایمیل (Email)',
    category: 'basic',
    icon: 'Mail',
    defaultLabel: 'پست الکترونیک',
    defaultPlaceholder: 'example@domain.com',
  },
  {
    type: 'password',
    title: 'کلمه عبور (Password)',
    category: 'basic',
    icon: 'Lock',
    defaultLabel: 'رمز عبور',
    defaultPlaceholder: '••••••••',
  },

  // Choices
  {
    type: 'select',
    title: 'منوی کشویی (Dropdown)',
    category: 'choices',
    icon: 'ChevronDownSquare',
    defaultLabel: 'انتخاب گزینه',
    hasOptions: true,
  },
  {
    type: 'radio',
    title: 'تک‌انتخابی (Radio)',
    category: 'choices',
    icon: 'Disc',
    defaultLabel: 'یک مورد را انتخاب کنید',
    hasOptions: true,
  },
  {
    type: 'checkbox',
    title: 'چک‌باکس تکی (تأییدیه)',
    category: 'choices',
    icon: 'CheckSquare',
    defaultLabel: 'قوانین و شرایط را مطالعه کردم و می‌پذیرم',
  },
  {
    type: 'multiselect',
    title: 'چندانتخابی (Multi-select)',
    category: 'choices',
    icon: 'ListChecks',
    defaultLabel: 'چند مورد را انتخاب کنید',
    hasOptions: true,
  },
  {
    type: 'star_rating',
    title: 'امتیازدهی ستاره‌ای',
    category: 'choices',
    icon: 'Star',
    defaultLabel: 'میزان رضایت',
    defaultDescription: 'از ۱ تا ۵ ستاره امتیاز دهید',
  },

  // DateTime
  {
    type: 'date',
    title: 'تاریخ',
    category: 'datetime',
    icon: 'Calendar',
    defaultLabel: 'تاریخ مورد نظر',
  },
  {
    type: 'time',
    title: 'زمان / ساعت',
    category: 'datetime',
    icon: 'Clock',
    defaultLabel: 'ساعت',
  },
  {
    type: 'datetime',
    title: 'تاریخ و زمان',
    category: 'datetime',
    icon: 'CalendarClock',
    defaultLabel: 'تاریخ و ساعت',
  },

  // Media
  {
    type: 'file',
    title: 'بارگذاری فایل',
    category: 'media',
    icon: 'UploadCloud',
    defaultLabel: 'پیوست فایل مدرک',
    defaultDescription: 'حداکثر حجم مجاز: ۵ مگابایت (PDF، Word، ZIP)',
  },
  {
    type: 'image',
    title: 'بارگذاری تصویر',
    category: 'media',
    icon: 'Image',
    defaultLabel: 'عکس پرسنلی یا مدرک',
    defaultDescription: 'فرمت‌های مجاز: JPG, PNG',
  },

  // Structure
  {
    type: 'static_text',
    title: 'متن ثابت / راهنما',
    category: 'structure',
    icon: 'FileText',
    defaultLabel: 'راهنمای تکمیل این بخش',
    defaultDescription: 'این متن صرفاً جهت راهنمایی کاربر نمایش داده می‌شود و نیاز به پاسخ ندارد.',
  },
  {
    type: 'divider',
    title: 'خط جداکننده',
    category: 'structure',
    icon: 'Minus',
    defaultLabel: 'خط جداکننده بخش‌ها',
  },
  {
    type: 'hidden',
    title: 'فیلد مخفی (Hidden)',
    category: 'structure',
    icon: 'EyeOff',
    defaultLabel: 'فیلد سیستمی مخفی',
    defaultDescription: 'برای ارسال متغیرهای مخفی سیستمی',
  },
];
