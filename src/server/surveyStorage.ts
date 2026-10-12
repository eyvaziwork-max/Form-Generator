import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  OrganizationalUnit,
  Survey,
  SurveyResponse,
  SurveyTopicSection,
  SurveyQuestion,
  SurveyPeriod,
  SurveyAnalyticsData,
  UnitAnalyticsSummary,
  TopicAnalyticsSummary,
  UserAccessProfile,
} from '../types/survey.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'surveys-db.json');

// Shamsi date formatter
function formatToPersianDate(dateInput: Date | number | string): string {
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

function generateTrackingCode(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `SRV-${num}`;
}

// 1. Initial Hospital Structure Seed
const initialUnits: OrganizationalUnit[] = [
  // Root Level: Hospital
  {
    id: 'unit-hosp-01',
    name: 'بیمارستان تخصصی و فوق‌تخصصی نمونه',
    code: 'HOSP-01',
    parentId: null,
    description: 'مرکز آموزشی، پژوهشی و درمانی بیمارستان نمونه',
    managerName: 'دکتر علیرضا فرهادی (رئیس بیمارستان)',
    staffCount: 450,
    order: 1,
    isActive: true,
  },

  // Level 1: Nursing Division
  {
    id: 'unit-nurse-01',
    name: 'معاونت پرستاری و خدمات بالینی',
    code: 'NURSE-01',
    parentId: 'unit-hosp-01',
    description: 'مدیریت جامع کادر پرستاری و بخش‌های مراقبت از بیمار',
    managerName: 'خانم مریم صادقی (مترون بیمارستان)',
    staffCount: 220,
    order: 1,
    isActive: true,
  },
  // Sub-units of Nursing
  {
    id: 'unit-icu-01',
    name: 'بخش مراقبت‌های ویژه (ICU)',
    code: 'ICU-01',
    parentId: 'unit-nurse-01',
    description: 'بخش آی‌سی‌یو جنرال و جراحی مغز و اعصاب',
    managerName: 'خانم فاطمه سلیمانی (سرپرستار ICU)',
    staffCount: 45,
    order: 1,
    isActive: true,
  },
  {
    id: 'unit-ccu-01',
    name: 'بخش مراقبت‌های ویژه قلبی (CCU)',
    code: 'CCU-01',
    parentId: 'unit-nurse-01',
    description: 'بخش مراقبت از بیماران قلبی و عروقی',
    managerName: 'آقای محمدرضا کریمی (سرپرستار CCU)',
    staffCount: 32,
    order: 2,
    isActive: true,
  },
  {
    id: 'unit-emg-01',
    name: 'بخش اورژانس و تروما',
    code: 'EMG-01',
    parentId: 'unit-nurse-01',
    description: 'پذیرش فوری، تریاژ و مراقبت‌های اورژانسی ۲۴ ساعته',
    managerName: 'آقای حمید حسینی (سرپرستار اورژانس)',
    staffCount: 50,
    order: 3,
    isActive: true,
  },
  {
    id: 'unit-int-01',
    name: 'بخش بستری داخلی',
    code: 'INT-01',
    parentId: 'unit-nurse-01',
    description: 'بخش تخصصی بیماران داخلی و گوارش',
    managerName: 'خانم زهرا نوری',
    staffCount: 28,
    order: 4,
    isActive: true,
  },
  {
    id: 'unit-surg-01',
    name: 'بخش جراحی عمومی و تخصصی',
    code: 'SURG-01',
    parentId: 'unit-nurse-01',
    description: 'بخش بستری قبل و بعد از عمل‌های جراحی',
    managerName: 'آقای علی اکبری',
    staffCount: 30,
    order: 5,
    isActive: true,
  },
  {
    id: 'unit-ped-01',
    name: 'بخش کودکان و اطفال',
    code: 'PED-01',
    parentId: 'unit-nurse-01',
    description: 'مراقبت‌های درمانی تخصصی نوزادان و کودکان',
    managerName: 'خانم مینا رضایی',
    staffCount: 20,
    order: 6,
    isActive: true,
  },
  {
    id: 'unit-or-01',
    name: 'اتاق‌های عمل و بیهوشی',
    code: 'OR-01',
    parentId: 'unit-nurse-01',
    description: 'مجموعه اتاق‌های عمل جنرال و لاپاراسکوپی',
    managerName: 'آقای دکتر بهرامی',
    staffCount: 35,
    order: 7,
    isActive: true,
  },

  // Level 1: Administrative Division
  {
    id: 'unit-admin-01',
    name: 'امور اداری و منابع انسانی',
    code: 'ADMIN-01',
    parentId: 'unit-hosp-01',
    description: 'مدیریت امور پرسنلی، رفاهی، حقوق و دستمزد',
    managerName: 'آقای کامران ملکی',
    staffCount: 65,
    order: 2,
    isActive: true,
  },
  {
    id: 'unit-hr-01',
    name: 'مدیریت منابع انسانی و آموزش',
    code: 'HR-01',
    parentId: 'unit-admin-01',
    description: 'جذب، آموزش ضمن خدمت و ارزیابی عملکرد پرسنل',
    managerName: 'خانم الهام کاظمی',
    staffCount: 25,
    order: 1,
    isActive: true,
  },
  {
    id: 'unit-fin-01',
    name: 'امور مالی و حسابداری',
    code: 'FIN-01',
    parentId: 'unit-admin-01',
    description: 'حسابداری درآمد، بیمه‌گری و اسناد مالی',
    managerName: 'آقای مسعود تهرانی',
    staffCount: 22,
    order: 2,
    isActive: true,
  },
  {
    id: 'unit-sec-01',
    name: 'دبیرخانه و بایگانی اسناد',
    code: 'SEC-01',
    parentId: 'unit-admin-01',
    description: 'ثبت و پیگیری مکاتبات اداری و پرونده‌ها',
    managerName: 'خانم پریسا نجفی',
    staffCount: 18,
    order: 3,
    isActive: true,
  },

  // Level 1: General Services Division
  {
    id: 'unit-svc-01',
    name: 'خدمات و پشتیبانی عمومی',
    code: 'SVC-01',
    parentId: 'unit-hosp-01',
    description: 'نظافت بهداشتی، بهداشت محیط و تأسیسات فیزیکی',
    managerName: 'آقای اصغر مرادی',
    staffCount: 85,
    order: 3,
    isActive: true,
  },
  {
    id: 'unit-clean-01',
    name: 'خدمات بهداشت و نظافت بیمارستان',
    code: 'CLEAN-01',
    parentId: 'unit-svc-01',
    description: 'ضدعفونی بخش‌ها و بهداشت محیط درمانی',
    managerName: 'آقای بیات',
    staffCount: 55,
    order: 1,
    isActive: true,
  },
  {
    id: 'unit-fac-01',
    name: 'تأسیسات و مهندسی نگهداری',
    code: 'FAC-01',
    parentId: 'unit-svc-01',
    description: 'تجهیزات تهویه، ژنراتورها، اکسیژن‌ساز و برق اضطراری',
    managerName: 'مهندس احمد پور',
    staffCount: 30,
    order: 2,
    isActive: true,
  },

  // Level 1: IT Department
  {
    id: 'unit-it-01',
    name: 'واحد فناوری اطلاعات و HIS',
    code: 'IT-01',
    parentId: 'unit-hosp-01',
    description: 'پشتیبانی نرم‌افزار بیمارستانی HIS، شبکه و امنیت داده‌ها',
    managerName: 'مهندس سعید ایزدی',
    staffCount: 18,
    order: 4,
    isActive: true,
  },

  // Level 1: Admission & Discharge
  {
    id: 'unit-rec-01',
    name: 'پذیرش و ترخیص بیماران',
    code: 'REC-01',
    parentId: 'unit-hosp-01',
    description: 'پذیرش بستری، سرپایی، صندوق و بیمه تکمیلی',
    managerName: 'خانم ناهید طاهری',
    staffCount: 32,
    order: 5,
    isActive: true,
  },
];

// 2. Initial Survey Seed: Nursing Job Satisfaction Survey
const initialSurvey: Survey = {
  id: 'survey-nursing-eval-01',
  title: 'ارزیابی جامع رضایت شغلی و تعهد سازمانی پرسنل پرستاری',
  description: 'نظرسنجی دوره‌ای با هدف سنجش رضایت شغلی، کیفیت مدیریت سرپرستاران، کفایت تجهیزات پزشکی و بهبود شرایط محیط کاری بخش‌های بیمارستان نمونه',
  code: 'SRV-NURSE-01',
  slug: 'nursing-satisfaction-eval',
  version: 2,
  status: 'active',
  allocationMode: 'shared_segmented', // Shared survey across departments, segmented by unit
  assignedUnitIds: [
    'unit-nurse-01',
    'unit-icu-01',
    'unit-ccu-01',
    'unit-emg-01',
    'unit-int-01',
    'unit-surg-01',
    'unit-ped-01',
    'unit-or-01',
  ],
  anonymityMode: 'confidential', // Confidentiality protected with min group size threshold
  minAnonymousGroupSize: 3,
  targetAudience: 'unit_staff',
  currentPeriodId: 'period-fall-1405',
  periods: [
    {
      id: 'period-spring-1405',
      surveyId: 'survey-nursing-eval-01',
      name: 'دوره ارزیابی بهار ۱۴۰۵',
      code: 'PER-1405-01',
      startDate: '2026-03-21T00:00:00Z',
      endDate: '2026-06-20T23:59:59Z',
      isActive: false,
      isClosed: true,
      responseCount: 88,
      avgScore: 71,
    },
    {
      id: 'period-summer-1405',
      surveyId: 'survey-nursing-eval-01',
      name: 'دوره ارزیابی تابستان ۱۴۰۵',
      code: 'PER-1405-02',
      startDate: '2026-06-21T00:00:00Z',
      endDate: '2026-09-21T23:59:59Z',
      isActive: false,
      isClosed: true,
      responseCount: 104,
      avgScore: 75,
    },
    {
      id: 'period-fall-1405',
      surveyId: 'survey-nursing-eval-01',
      name: 'دوره ارزیابی پاییز ۱۴۰۵ (دوره جاری)',
      code: 'PER-1405-03',
      startDate: '2026-09-22T00:00:00Z',
      endDate: '2026-12-21T23:59:59Z',
      isActive: true,
      isClosed: false,
      responseCount: 127,
      avgScore: 78,
    },
  ],
  sections: [
    {
      id: 'sec-job-sat',
      surveyId: 'survey-nursing-eval-01',
      title: 'رضایت شغلی و انگیزش پرسنل',
      description: 'ارزیابی حس تعلق، رضایت از شرایط کار و تعادل زندگی-شغل',
      order: 1,
      weight: 1.2,
    },
    {
      id: 'sec-mgmt',
      surveyId: 'survey-nursing-eval-01',
      title: 'کیفیت مدیریت بالینی و سرپرستاری',
      description: 'نحوه برنامه‌ریزی شیفت‌ها، عدالت سازمانی و حمایت سرپرستار',
      order: 2,
      weight: 1.0,
    },
    {
      id: 'sec-equip',
      surveyId: 'survey-nursing-eval-01',
      title: 'تجهیزات، امکانات و ایمنی بیمار',
      description: 'کفایت داروها، دستگاه‌های ونتیلاتور و مانیتورینگ، ایمنی فردی',
      order: 3,
      weight: 1.0,
    },
    {
      id: 'sec-comm',
      surveyId: 'survey-nursing-eval-01',
      title: 'ارتباطات و کار تیمی بین‌رشته‌ای',
      description: 'تعامل با پزشکان معالج، کادر خدمات و همکاران پرستار',
      order: 4,
      weight: 0.8,
    },
    {
      id: 'sec-feedback',
      surveyId: 'survey-nursing-eval-01',
      title: 'پیشنهادات سازنده و توسعه فردی',
      description: 'بازخورد آزاد، نقاط قوت و پیشنهادهای بهبود عملکرد بیمارستان',
      order: 5,
      weight: 0.5,
    },
  ],
  questions: [
    // Section 1: Job Satisfaction
    {
      id: 'q-sat-01',
      sectionId: 'sec-job-sat',
      type: 'likert',
      title: 'میزان رضایت کلی شما از شغل پرستاری در این بخش و بیمارستان چقدر است؟',
      required: true,
      order: 1,
      options: [
        { id: 'opt-l1', label: 'بسیار کم (ناراضی)', value: '1', score: 20 },
        { id: 'opt-l2', label: 'کم', value: '2', score: 40 },
        { id: 'opt-l3', label: 'متوسط', value: '3', score: 60 },
        { id: 'opt-l4', label: 'زیاد (راضی)', value: '4', score: 80 },
        { id: 'opt-l5', label: 'بسیار زیاد (بسیار راضی)', value: '5', score: 100 },
      ],
    },
    {
      id: 'q-sat-02',
      sectionId: 'sec-job-sat',
      type: 'yes_no',
      title: 'آیا تناسب منطقی بین حجم کار محوله با تعداد پرسنل حاضر در شیفت وجود دارد؟',
      description: 'در صورت انتخاب «خیر»، پرسش توضیحی دلیل فشردگی شیفت نمایش داده می‌شود.',
      required: true,
      order: 2,
      options: [
        { id: 'opt-yn-yes', label: 'بله، حجم کار متناسب است', value: 'yes', score: 100 },
        { id: 'opt-yn-no', label: 'خیر، فشار کاری بیش از ظرفیت است', value: 'no', score: 30 },
      ],
      rules: [
        {
          id: 'rule-sat-02-1',
          triggerQuestionId: 'q-sat-02',
          operator: 'equals',
          value: 'no',
          action: 'show',
          targetQuestionId: 'q-sat-02-reason',
        },
      ],
    },
    {
      id: 'q-sat-02-reason',
      sectionId: 'sec-job-sat',
      type: 'single_choice',
      title: 'مهم‌ترین دلیل نامتناسب بودن فشار کاری چیست؟',
      required: false,
      order: 3,
      options: [
        { id: 'opt-r1', label: 'کمبود شدید نیروی پرستار در شیفت', value: 'staff_shortage', score: 20 },
        { id: 'opt-r2', label: 'تعداد زیاد بیماران بدحال و پذیرش اورژانس', value: 'patient_overload', score: 30 },
        { id: 'opt-r3', label: 'حجم بالای ثبت اسناد و پرونده الکترونیک', value: 'paperwork', score: 40 },
        { id: 'opt-r4', label: 'شیفت‌های فشرده و اضافه کار اجباری', value: 'forced_overtime', score: 20 },
      ],
    },
    {
      id: 'q-sat-03',
      sectionId: 'sec-job-sat',
      type: 'rating_5',
      title: 'میزان تمایل و انگیزه شما برای ادامه خدمت در این مرکز در یک سال آینده:',
      required: true,
      order: 4,
      options: [
        { id: 'r5-1', label: '۱ (کاملاً متمایل به جابجایی)', value: '1', score: 20 },
        { id: 'r5-2', label: '۲', value: '2', score: 40 },
        { id: 'r5-3', label: '۳ (متوسط)', value: '3', score: 60 },
        { id: 'r5-4', label: '۴', value: '4', score: 80 },
        { id: 'r5-5', label: '۵ (کاملاً علاقه‌مند به ماندن)', value: '5', score: 100 },
      ],
    },

    // Section 2: Management & Leadership
    {
      id: 'q-mgmt-01',
      sectionId: 'sec-mgmt',
      type: 'star_rating',
      title: 'میزان عدالت در تدوین برنامه شیفت‌های ماهانه و مرخصی‌ها توسط سرپرستار بخش:',
      description: 'امتیاز از ۱ ستاره (بسیار ناعادلانه) تا ۵ ستاره (کاملاً عادلانه و شفاف)',
      required: true,
      order: 5,
    },
    {
      id: 'q-mgmt-02',
      sectionId: 'sec-mgmt',
      type: 'single_choice',
      title: 'میزان پیگیری و رسیدگی مسئولین به چالش‌ها و دغدغه‌های اعلام‌شده پرسنل:',
      required: true,
      order: 6,
      options: [
        { id: 'm-opt-1', label: 'بسیار عالی و با پیگیری مداوم', value: 'excellent', score: 100 },
        { id: 'm-opt-2', label: 'مناسب و در حد توان', value: 'good', score: 75 },
        { id: 'm-opt-3', label: 'ضعیف و با تأخیر طولانی', value: 'weak', score: 40 },
        { id: 'm-opt-4', label: 'اصلاً پیگیری نمی‌شود', value: 'none', score: 10 },
      ],
    },

    // Section 3: Equipment & Patient Safety
    {
      id: 'q-equip-01',
      sectionId: 'sec-equip',
      type: 'likert',
      title: 'کفایت و سلامت تجهیزات پزشکی ضروری (ونتیلاتور، مانیتورینگ، الکتروشوک، پمپ سرم) در بخش شما:',
      required: true,
      order: 7,
      options: [
        { id: 'e-1', label: 'کاملاً ناکافی و مستهلک', value: '1', score: 20 },
        { id: 'e-2', label: 'ناکافی', value: '2', score: 40 },
        { id: 'e-3', label: 'در حد متوسط', value: '3', score: 60 },
        { id: 'e-4', label: 'کافی و به روز', value: '4', score: 80 },
        { id: 'e-5', label: 'بسیار مجهز و استاندارد', value: '5', score: 100 },
      ],
    },
    {
      id: 'q-equip-02',
      sectionId: 'sec-equip',
      type: 'multi_choice',
      title: 'کدام اقلام در بخش شما بیشترین کمبود را در ماه‌های اخیر داشته‌اند؟ (امکان انتخاب چندگانه)',
      required: false,
      order: 8,
      options: [
        { id: 'eq-short-1', label: 'تجهیزات حفاظت فردی (ماسک، گان، دستکش استاندارد)', value: 'ppe' },
        { id: 'eq-short-2', label: 'سرم‌ها و داروهای احیا و تخصصی', value: 'meds' },
        { id: 'eq-short-3', label: 'ست‌های پانسمان و کاتترهای عروقی', value: 'consumables' },
        { id: 'eq-short-4', label: 'تخت‌های برقی و تشک‌های مواج استاندارد', value: 'beds' },
        { id: 'eq-short-5', label: 'هیچ کمبودی وجود ندارد', value: 'no_shortage' },
      ],
    },

    // Section 4: Communication & Teamwork
    {
      id: 'q-comm-01',
      sectionId: 'sec-comm',
      type: 'likert',
      title: 'کیفیت همکاری و احترام متقابل بین پزشکان معالج و کادر پرستاری در بالین بیمار:',
      required: true,
      order: 9,
      options: [
        { id: 'c-1', label: 'خیلی ضعیف و تنش‌آلود', value: '1', score: 20 },
        { id: 'c-2', label: 'ضعیف', value: '2', score: 40 },
        { id: 'c-3', label: 'متوسط و قابل قبول', value: '3', score: 60 },
        { id: 'c-4', label: 'خوب و محترمانه', value: '4', score: 80 },
        { id: 'c-5', label: 'عالی و الگوی کار تیمی', value: '5', score: 100 },
      ],
    },
    {
      id: 'q-comm-02',
      sectionId: 'sec-comm',
      type: 'nps',
      title: 'شاخص وفاداری و توصیه (NPS): تا چه حد بیمارستان نمونه را به عنوان محل کار به سایر همکاران و فارغ‌التحصیلان توصیه می‌کنید؟',
      description: 'از ۰ (اصلاً توصیه نمی‌کنم) تا ۱۰ (قطعاً و با افتخار توصیه می‌کنم)',
      required: true,
      order: 10,
      min: 0,
      max: 10,
      npsLabels: { low: 'اصلاً توصیه نمی‌کنم (۰)', high: 'قطعاً توصیه می‌کنم (۱۰)' },
    },

    // Section 5: Feedback & Open Suggestions
    {
      id: 'q-feed-01',
      sectionId: 'sec-feedback',
      type: 'long_text',
      title: 'مهم‌ترین پیشنهاد شما برای افزایش رضایت پرسنل و ارتقای ایمنی بیماران در بخش چیست؟',
      placeholder: 'دیدگاه‌ها و راهکارهای اصلاحی خود را آزادانه و بدون نگرانی بنویسید (پاسخ‌ها در حالت محرمانه نگهداری می‌شوند)...',
      required: false,
      order: 11,
    },
  ],
  createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
  responseCount: 127,
  avgScore: 78,
  npsScore: 42,
};

// Seed Realistic Responses across ICU, CCU, اورژانس for testing scenario
function generateSampleResponses(): SurveyResponse[] {
  const responses: SurveyResponse[] = [];
  const baseTimestamp = Date.now();

  const unitConfigs = [
    {
      unitId: 'unit-icu-01',
      unitName: 'بخش مراقبت‌های ویژه (ICU)',
      count: 45,
      satLevel: 4.3, // High satisfaction
      npsRange: [8, 10],
      overloadReasons: ['patient_overload', 'paperwork'],
    },
    {
      unitId: 'unit-ccu-01',
      unitName: 'بخش مراقبت‌های ویژه قلبی (CCU)',
      count: 32,
      satLevel: 3.8, // Moderate-high
      npsRange: [7, 9],
      overloadReasons: ['staff_shortage', 'paperwork'],
    },
    {
      unitId: 'unit-emg-01',
      unitName: 'بخش اورژانس و تروما',
      count: 50,
      satLevel: 3.5, // Moderate with high pressure
      npsRange: [5, 8],
      overloadReasons: ['staff_shortage', 'patient_overload', 'forced_overtime'],
    },
  ];

  let respIndex = 1;

  unitConfigs.forEach((cfg) => {
    for (let i = 0; i < cfg.count; i++) {
      const daysAgo = Math.floor(Math.random() * 25);
      const hoursAgo = Math.floor(Math.random() * 24);
      const ts = baseTimestamp - (daysAgo * 86400000 + hoursAgo * 3600000);

      const isHigh = Math.random() < (cfg.satLevel / 5);
      const satScoreVal = isHigh ? (Math.random() > 0.4 ? '5' : '4') : (Math.random() > 0.5 ? '3' : '2');
      const isOverloaded = cfg.unitId === 'unit-emg-01' ? Math.random() > 0.3 : Math.random() > 0.6;
      const npsVal = Math.floor(cfg.npsRange[0] + Math.random() * (cfg.npsRange[1] - cfg.npsRange[0] + 1));
      const starRatingVal = isHigh ? (Math.random() > 0.3 ? 5 : 4) : 3;

      const answers: Record<string, any> = {
        'q-sat-01': satScoreVal,
        'q-sat-02': isOverloaded ? 'no' : 'yes',
        'q-sat-03': isHigh ? (Math.random() > 0.4 ? '5' : '4') : '3',
        'q-mgmt-01': starRatingVal,
        'q-mgmt-02': isHigh ? 'excellent' : (Math.random() > 0.5 ? 'good' : 'weak'),
        'q-equip-01': cfg.unitId === 'unit-icu-01' ? (Math.random() > 0.3 ? '5' : '4') : (Math.random() > 0.4 ? '3' : '2'),
        'q-equip-02': isOverloaded ? ['ppe', 'consumables'] : ['no_shortage'],
        'q-comm-01': isHigh ? '4' : '3',
        'q-comm-02': npsVal,
      };

      if (isOverloaded) {
        answers['q-sat-02-reason'] = cfg.overloadReasons[Math.floor(Math.random() * cfg.overloadReasons.length)];
      }

      if (Math.random() > 0.4) {
        const sampleComments = [
          'رسیدگی سریع‌تر به درخواست‌های تعویض شیفت و پرداخت به‌موقع کارانه‌ها موجب انگیزه بیشتر کادر درمان خواهد شد.',
          'تجهیزات ونتیلاتور بخش عالی است اما نیاز به برگزاری کارگاه‌های آموزشی تخصصی دوره‌ای داریم.',
          'حجم بیماران تریاژ در شیفت‌های عصر بسیار سنگین است و نیاز به تزریق نیروی کمکی احساس می‌شود.',
          'همکاری پزشکان مقیم در این بخش شایسته تقدیر است.',
        ];
        answers['q-feed-01'] = sampleComments[Math.floor(Math.random() * sampleComments.length)];
      }

      // Calculate score out of 100 for this response
      const overallScore = Math.round(
        ((parseInt(satScoreVal, 10) * 20) + (starRatingVal * 20) + (npsVal * 10)) / 3
      );
      const overallRating5 = Math.round((overallScore / 20) * 10) / 10;

      responses.push({
        id: `sresp-${respIndex}`,
        surveyId: 'survey-nursing-eval-01',
        surveyTitle: 'ارزیابی جامع رضایت شغلی و تعهد سازمانی پرسنل پرستاری',
        periodId: 'period-fall-1405',
        periodName: 'دوره ارزیابی پاییز ۱۴۰۵ (دوره جاری)',
        unitId: cfg.unitId,
        unitName: cfg.unitName,
        trackingCode: `SRV-${400000 + respIndex}`,
        anonymityMode: 'confidential',
        respondent: {
          personnelCode: `EMP-9${respIndex + 100}`,
          fullName: `پرسنل کادر بالینی ${respIndex}`,
          jobTitle: 'کارشناس پرستاری',
        },
        answers,
        topicScores: {
          'sec-job-sat': isHigh ? 84 : 65,
          'sec-mgmt': isHigh ? 88 : 70,
          'sec-equip': cfg.unitId === 'unit-icu-01' ? 90 : 64,
          'sec-comm': isHigh ? 82 : 72,
          'sec-feedback': 80,
        },
        overallScore,
        overallRating5,
        submittedAt: formatToPersianDate(new Date(ts)),
        submittedAtTimestamp: ts,
      });

      respIndex++;
    }
  });

  return responses;
}

interface SurveyDbData {
  units: OrganizationalUnit[];
  surveys: Survey[];
  responses: SurveyResponse[];
}

export class SurveyStorage {
  private data: SurveyDbData = {
    units: initialUnits,
    surveys: [initialSurvey],
    responses: generateSampleResponses(),
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
        if (parsed && Array.isArray(parsed.units) && Array.isArray(parsed.surveys)) {
          this.data = parsed;
          return;
        }
      }
      this.saveData();
    } catch (e) {
      console.warn('[SurveyStorage] Using in-memory fallback:', e);
    }
  }

  private saveData() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[SurveyStorage] Could not write to disk:', e);
    }
  }

  // --- Organizational Units Operations ---

  public getUnits(filter?: { search?: string; parentId?: string | null }): OrganizationalUnit[] {
    let result = this.data.units.map((u) => {
      // Calculate dynamic counts
      const directResponses = this.data.responses.filter((r) => r.unitId === u.id).length;
      const assignedSurveys = this.data.surveys.filter(
        (s) => s.assignedUnitIds.includes(u.id) || s.assignedUnitIds.includes('unit-hosp-01')
      ).length;
      return {
        ...u,
        surveyCount: assignedSurveys,
        responseCount: directResponses,
      };
    });

    if (filter?.parentId !== undefined) {
      result = result.filter((u) => u.parentId === filter.parentId);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.code.toLowerCase().includes(q) ||
          (u.managerName && u.managerName.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => a.order - b.order);
  }

  public getUnitById(idOrCode: string): OrganizationalUnit | undefined {
    return this.getUnits().find(
      (u) => u.id === idOrCode || u.code.toLowerCase() === idOrCode.toLowerCase()
    );
  }

  public getSurveysForUnit(unitId: string): Survey[] {
    return this.data.surveys.filter(
      (s) =>
        s.status === 'active' &&
        (s.assignedUnitIds.includes(unitId) ||
          s.assignedUnitIds.includes('unit-hosp-01') ||
          s.assignedUnitIds.length === 0)
    );
  }

  public createUnit(unitData: Partial<OrganizationalUnit>): OrganizationalUnit {
    const id = unitData.id || `unit-${Date.now()}`;
    const newUnit: OrganizationalUnit = {
      id,
      name: unitData.name || 'واحد سازمانی جدید',
      code: unitData.code || `UNIT-${Math.floor(100 + Math.random() * 900)}`,
      parentId: unitData.parentId ?? null,
      description: unitData.description || '',
      managerName: unitData.managerName || '',
      staffCount: unitData.staffCount || 10,
      order: unitData.order || this.data.units.length + 1,
      isActive: unitData.isActive ?? true,
    };

    this.data.units.push(newUnit);
    this.saveData();
    return newUnit;
  }

  public updateUnit(id: string, updates: Partial<OrganizationalUnit>): OrganizationalUnit | undefined {
    const idx = this.data.units.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;

    this.data.units[idx] = {
      ...this.data.units[idx],
      ...updates,
      id: this.data.units[idx].id,
    };
    this.saveData();
    return this.data.units[idx];
  }

  public deleteUnit(id: string, options?: { transferChildrenToId?: string | null }): { success: boolean; message: string } {
    const unit = this.data.units.find((u) => u.id === id);
    if (!unit) return { success: false, message: 'واحد سازمانی مورد نظر یافت نشد.' };

    const children = this.data.units.filter((u) => u.parentId === id);
    if (children.length > 0 && !options?.transferChildrenToId) {
      return {
        success: false,
        message: `این واحد دارای ${children.length} زیرشاخه فعال است. لطفاً ابتدا زیرشاخه‌ها را منتقل یا غیرفعال فرمایید.`,
      };
    }

    // Transfer children if specified
    if (children.length > 0 && options?.transferChildrenToId !== undefined) {
      children.forEach((c) => {
        c.parentId = options.transferChildrenToId || null;
      });
    }

    this.data.units = this.data.units.filter((u) => u.id !== id);
    this.saveData();
    return { success: true, message: `واحد سازمانی «${unit.name}» با موفقیت حذف شد.` };
  }

  public reorderUnits(orderedIds: string[]): boolean {
    orderedIds.forEach((id, index) => {
      const u = this.data.units.find((item) => item.id === id);
      if (u) u.order = index + 1;
    });
    this.saveData();
    return true;
  }

  // --- Surveys Management Operations ---

  public getSurveys(filter?: { unitId?: string; status?: string; search?: string }): Survey[] {
    let result = this.data.surveys.map((s) => {
      const count = this.data.responses.filter((r) => r.surveyId === s.id).length;
      return { ...s, responseCount: count };
    });

    if (filter?.status) {
      result = result.filter((s) => s.status === filter.status);
    }

    if (filter?.unitId) {
      result = result.filter(
        (s) => s.assignedUnitIds.includes(filter.unitId!) || s.assignedUnitIds.includes('unit-hosp-01')
      );
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public getSurveyById(idOrSlug: string): Survey | undefined {
    const s = this.data.surveys.find(
      (item) => item.id === idOrSlug || item.slug === idOrSlug || item.code.toLowerCase() === idOrSlug.toLowerCase()
    );
    if (!s) return undefined;
    const count = this.data.responses.filter((r) => r.surveyId === s.id).length;
    return { ...s, responseCount: count };
  }

  public createSurvey(surveyData: Partial<Survey>): Survey {
    const id = surveyData.id || `survey-${Date.now()}`;
    const now = new Date().toISOString();
    const title = surveyData.title || 'نظرسنجی سازمانی جدید';
    const slug =
      surveyData.slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
        .replace(/^-+|-+$/g, '') ||
      `survey-${Date.now()}`;

    const newPeriod: SurveyPeriod = {
      id: `period-${Date.now()}`,
      surveyId: id,
      name: 'دوره ارزیابی پاییز ۱۴۰۵',
      code: 'PER-1405-01',
      startDate: now,
      endDate: new Date(Date.now() + 60 * 86400000).toISOString(),
      isActive: true,
      isClosed: false,
      responseCount: 0,
    };

    const newSurvey: Survey = {
      id,
      title,
      description: surveyData.description || '',
      code: surveyData.code || `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
      slug,
      version: 1,
      status: surveyData.status || 'active',
      allocationMode: surveyData.allocationMode || 'shared_segmented',
      assignedUnitIds: surveyData.assignedUnitIds || ['unit-hosp-01'],
      anonymityMode: surveyData.anonymityMode || 'confidential',
      minAnonymousGroupSize: surveyData.minAnonymousGroupSize || 3,
      targetAudience: surveyData.targetAudience || 'all_staff',
      currentPeriodId: newPeriod.id,
      periods: surveyData.periods || [newPeriod],
      sections: surveyData.sections || [
        {
          id: `sec-${Date.now()}-1`,
          surveyId: id,
          title: 'محور اصلی ارزیابی',
          description: 'سؤالات عمومی',
          order: 1,
          weight: 1.0,
        },
      ],
      questions: surveyData.questions || [],
      createdAt: now,
      updatedAt: now,
      responseCount: 0,
      avgScore: 0,
    };

    this.data.surveys.unshift(newSurvey);
    this.saveData();
    return newSurvey;
  }

  public updateSurvey(id: string, updates: Partial<Survey>): Survey | undefined {
    const idx = this.data.surveys.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;

    this.data.surveys[idx] = {
      ...this.data.surveys[idx],
      ...updates,
      id: this.data.surveys[idx].id,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.surveys[idx];
  }

  public deleteSurvey(id: string): boolean {
    const exists = this.data.surveys.some((s) => s.id === id);
    if (!exists) return false;

    this.data.surveys = this.data.surveys.filter((s) => s.id !== id);
    this.data.responses = this.data.responses.filter((r) => r.surveyId !== id);
    this.saveData();
    return true;
  }

  public cloneSurvey(id: string, newTitle?: string): Survey | undefined {
    const original = this.getSurveyById(id);
    if (!original) return undefined;

    const newId = `survey-${Date.now()}`;
    const now = new Date().toISOString();
    const clonedSlug = `${original.slug}-copy-${Math.floor(100 + Math.random() * 900)}`;

    const cloned: Survey = {
      ...original,
      id: newId,
      title: newTitle || `${original.title} (نسخه رونوشت)`,
      code: `SRV-COPY-${Math.floor(100 + Math.random() * 900)}`,
      slug: clonedSlug,
      version: original.version + 1,
      createdAt: now,
      updatedAt: now,
      responseCount: 0,
      avgScore: 0,
      sections: original.sections.map((s, idx) => ({
        ...s,
        id: `sec-${newId}-${idx + 1}`,
        surveyId: newId,
      })),
      questions: original.questions.map((q, idx) => ({
        ...q,
        id: `q-${newId}-${idx + 1}`,
        sectionId: `sec-${newId}-1`,
      })),
      periods: original.periods.map((p) => ({
        ...p,
        id: `period-${newId}-${Date.now()}`,
        surveyId: newId,
        responseCount: 0,
      })),
    };

    this.data.surveys.unshift(cloned);
    this.saveData();
    return cloned;
  }

  // --- Response Submission & Scoring ---

  public async submitSurveyResponse(
    surveyIdOrSlug: string,
    submissionData: {
      unitId: string;
      answers: Record<string, any>;
      respondent?: { personnelCode?: string; fullName?: string; jobTitle?: string };
    }
  ): Promise<{ success: boolean; trackingCode?: string; message: string; overallScore?: number }> {
    const survey = this.getSurveyById(surveyIdOrSlug);
    if (!survey) return { success: false, message: 'نظرسنجی مورد نظر یافت نشد.' };

    if (survey.status !== 'active') {
      return { success: false, message: 'این نظرسنجی در حال حاضر غیرفعال یا متوقف شده است.' };
    }

    const unit = this.getUnitById(submissionData.unitId);
    const unitName = unit ? unit.name : 'واحد نامشخص';
    const trackingCode = generateTrackingCode();
    const nowTimestamp = Date.now();
    const nowPersian = formatToPersianDate(nowTimestamp);

    // Calculate score metrics
    let totalScoreSum = 0;
    let scoredQuestionCount = 0;
    const topicScores: Record<string, number> = {};

    survey.sections.forEach((sec) => {
      const secQuestions = survey.questions.filter((q) => q.sectionId === sec.id);
      let secScoreSum = 0;
      let secQuestionCount = 0;

      secQuestions.forEach((q) => {
        const answerVal = submissionData.answers[q.id];
        if (answerVal !== undefined && answerVal !== null) {
          let questionScore: number | null = null;

          if (q.type === 'likert' || q.type === 'rating_5' || q.type === 'yes_no' || q.type === 'single_choice') {
            const opt = q.options?.find((o) => o.value === String(answerVal));
            if (opt && opt.score !== undefined) {
              questionScore = opt.score;
            } else {
              const numVal = parseFloat(String(answerVal));
              if (!isNaN(numVal) && numVal >= 1 && numVal <= 5) {
                questionScore = (numVal / 5) * 100;
              }
            }
          } else if (q.type === 'star_rating') {
            const stars = parseFloat(String(answerVal));
            if (!isNaN(stars)) questionScore = (stars / 5) * 100;
          } else if (q.type === 'nps') {
            const npsVal = parseFloat(String(answerVal));
            if (!isNaN(npsVal)) questionScore = (npsVal / 10) * 100;
          }

          if (questionScore !== null) {
            secScoreSum += questionScore;
            secQuestionCount++;
            totalScoreSum += questionScore;
            scoredQuestionCount++;
          }
        }
      });

      topicScores[sec.id] = secQuestionCount > 0 ? Math.round(secScoreSum / secQuestionCount) : 75;
    });

    const overallScore = scoredQuestionCount > 0 ? Math.round(totalScoreSum / scoredQuestionCount) : 75;
    const overallRating5 = Math.round((overallScore / 20) * 10) / 10;

    // Handle anonymity protection
    let storedRespondent = submissionData.respondent;
    if (survey.anonymityMode === 'anonymous') {
      // True anonymity: decoupled from identity
      storedRespondent = undefined;
    }

    const responseRecord: SurveyResponse = {
      id: `sresp-${nowTimestamp}-${Math.floor(Math.random() * 1000)}`,
      surveyId: survey.id,
      surveyTitle: survey.title,
      periodId: survey.currentPeriodId,
      periodName: survey.periods.find((p) => p.id === survey.currentPeriodId)?.name || 'دوره جاری',
      unitId: submissionData.unitId,
      unitName,
      trackingCode,
      anonymityMode: survey.anonymityMode,
      respondent: storedRespondent,
      answers: submissionData.answers,
      topicScores,
      overallScore,
      overallRating5,
      submittedAt: nowPersian,
      submittedAtTimestamp: nowTimestamp,
    };

    this.data.responses.unshift(responseRecord);

    // Update survey count and scores
    const sIndex = this.data.surveys.findIndex((s) => s.id === survey.id);
    if (sIndex !== -1) {
      this.data.surveys[sIndex].responseCount++;
    }

    this.saveData();

    return {
      success: true,
      trackingCode,
      overallScore,
      message: 'پاسخ شما با موفقیت ثبت گردید. با تشکر از مشارکت شما در ارزیابی و بهبود فرآیندهای سازمانی.',
    };
  }

  // --- Analytics & Reports Calculation ---

  public getSurveyAnalytics(surveyId: string, filterUnitId?: string, periodId?: string): SurveyAnalyticsData | null {
    const survey = this.getSurveyById(surveyId);
    if (!survey) return null;

    let responses = this.data.responses.filter((r) => r.surveyId === survey.id);

    if (periodId) {
      responses = responses.filter((r) => r.periodId === periodId);
    }

    if (filterUnitId) {
      responses = responses.filter((r) => r.unitId === filterUnitId);
    }

    const totalResponses = responses.length;
    const assignedUnits = this.getUnits().filter((u) => survey.assignedUnitIds.includes(u.id));
    const totalInvited = assignedUnits.reduce((acc, u) => acc + u.staffCount, 0) || 150;
    const overallParticipationRate = totalInvited > 0 ? Math.min(100, Math.round((totalResponses / totalInvited) * 100)) : 80;

    // Overall Score & Rating
    const totalScoreSum = responses.reduce((acc, r) => acc + (r.overallScore || 75), 0);
    const overallScorePercent = totalResponses > 0 ? Math.round(totalScoreSum / totalResponses) : 78;
    const overallAvgScore5 = Math.round((overallScorePercent / 20) * 10) / 10;

    // NPS Score Calculation (Promoters 9-10 %, Detractors 0-6 %)
    const npsQuestions = survey.questions.filter((q) => q.type === 'nps');
    let promoters = 0;
    let detractors = 0;
    let npsCount = 0;

    responses.forEach((r) => {
      npsQuestions.forEach((q) => {
        const val = parseFloat(r.answers[q.id]);
        if (!isNaN(val)) {
          npsCount++;
          if (val >= 9) promoters++;
          else if (val <= 6) detractors++;
        }
      });
    });

    const npsScore = npsCount > 0 ? Math.round(((promoters - detractors) / npsCount) * 100) : 42;

    // Unit Summaries
    const unitSummaries: UnitAnalyticsSummary[] = assignedUnits
      .filter((u) => u.id !== 'unit-hosp-01')
      .map((u) => {
        const unitResps = this.data.responses.filter((r) => r.surveyId === survey.id && r.unitId === u.id);
        const count = unitResps.length;
        const pRate = u.staffCount > 0 ? Math.min(100, Math.round((count / u.staffCount) * 100)) : 70;
        const uScoreSum = unitResps.reduce((acc, r) => acc + (r.overallScore || 75), 0);
        const avgPercent = count > 0 ? Math.round(uScoreSum / count) : 75;
        const avgScore5 = Math.round((avgPercent / 20) * 10) / 10;

        const topicScores: Record<string, number> = {};
        survey.sections.forEach((sec) => {
          const secSum = unitResps.reduce((acc, r) => acc + (r.topicScores?.[sec.id] || 75), 0);
          topicScores[sec.id] = count > 0 ? Math.round(secSum / count) : 75;
        });

        return {
          unitId: u.id,
          unitName: u.name,
          staffCount: u.staffCount,
          responseCount: count,
          participationRate: pRate,
          avgSatisfactionScore5: avgScore5,
          avgScorePercent: avgPercent,
          topicScores,
        };
      });

    // Topic Summaries
    const topicSummaries: TopicAnalyticsSummary[] = survey.sections.map((sec) => {
      const qCount = survey.questions.filter((q) => q.sectionId === sec.id).length;
      const secScores = responses.map((r) => r.topicScores?.[sec.id]).filter((s) => s !== undefined) as number[];
      const avgPercent = secScores.length > 0 ? Math.round(secScores.reduce((a, b) => a + b, 0) / secScores.length) : 76;
      const avgRating5 = Math.round((avgPercent / 20) * 10) / 10;

      let status: TopicAnalyticsSummary['satisfactionStatus'] = 'good';
      if (avgPercent >= 80) status = 'excellent';
      else if (avgPercent >= 70) status = 'good';
      else if (avgPercent >= 60) status = 'moderate';
      else status = 'needs_improvement';

      return {
        sectionId: sec.id,
        title: sec.title,
        questionCount: qCount,
        avgScorePercent: avgPercent,
        avgRating5,
        satisfactionStatus: status,
      };
    });

    // Trend History across Periods
    const trendHistory = [
      { periodName: 'بهار ۱۴۰۵', date: 'خرداد ۱۴۰۵', score5: 3.6, responses: 88 },
      { periodName: 'تابستان ۱۴۰۵', date: 'شهریور ۱۴۰۵', score5: 3.8, responses: 104 },
      { periodName: 'پاییز ۱۴۰۵', date: 'مهر ۱۴۰۵', score5: overallAvgScore5, responses: totalResponses },
    ];

    return {
      survey,
      totalResponses,
      totalInvited,
      overallParticipationRate,
      overallAvgScore5,
      overallScorePercent,
      npsScore,
      unitSummaries,
      topicSummaries,
      trendHistory,
    };
  }

  // --- Response Listing & Exports ---

  public getResponses(filter?: { surveyId?: string; unitId?: string; periodId?: string; search?: string }): SurveyResponse[] {
    let result = [...this.data.responses];

    if (filter?.surveyId) {
      result = result.filter((r) => r.surveyId === filter.surveyId);
    }

    if (filter?.unitId) {
      result = result.filter((r) => r.unitId === filter.unitId);
    }

    if (filter?.periodId) {
      result = result.filter((r) => r.periodId === filter.periodId);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.trackingCode.toLowerCase().includes(q) ||
          r.unitName.toLowerCase().includes(q) ||
          (r.respondent?.fullName && r.respondent.fullName.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => b.submittedAtTimestamp - a.submittedAtTimestamp);
  }

  public exportSurveyResponsesCSV(surveyId: string, unitId?: string): string {
    const survey = this.getSurveyById(surveyId);
    let responses = this.getResponses({ surveyId, unitId });

    if (!survey || responses.length === 0) {
      return '\ufeff"کد رهگیری","واحد سازمانی","تاریخ ثبت","امتیاز کل (از ۱۰۰)"\n';
    }

    const headers = [
      'کد رهگیری',
      'واحد سازمانی',
      'تاریخ ثبت',
      'امتیاز کلی (از ۱۰۰)',
      'میانگین از ۵',
      ...survey.questions.map((q) => q.title),
    ];

    const escapeCsv = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = responses.map((r) => {
      const row = [r.trackingCode, r.unitName, r.submittedAt, r.overallScore ?? '-', r.overallRating5 ?? '-'];

      survey.questions.forEach((q) => {
        let answer = r.answers[q.id];
        if (Array.isArray(answer)) answer = answer.join('، ');
        row.push(answer ?? '-');
      });

      return row.map(escapeCsv).join(',');
    });

    return '\ufeff' + [headers.map(escapeCsv).join(','), ...rows].join('\n');
  }
}

export const surveyStorage = new SurveyStorage();
