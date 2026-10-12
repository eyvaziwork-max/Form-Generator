import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  Link2,
  Copy,
  Check,
  Download,
  Printer,
  ExternalLink,
  Building2,
  FileCheck2,
  Sparkles,
  Smartphone,
  Eye,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { Survey, OrganizationalUnit } from '../../types/survey';
import { QRCodeManager } from './QRCodeManager';

export interface SurveyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey?: Survey | null;
  unit?: OrganizationalUnit | null;
  allSurveys: Survey[];
  allUnits: OrganizationalUnit[];
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export type PosterTemplate = 'a4_vertical' | 'table_tent' | 'compact_badge';

export const SurveyShareModal: React.FC<SurveyShareModalProps> = ({
  isOpen,
  onClose,
  survey,
  unit,
  allSurveys,
  allUnits,
  onShowToast,
}) => {
  // If modal is not open, render nothing
  if (!isOpen) return null;

  // Selected survey and unit within the modal
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>(
    survey ? survey.id : allSurveys[0]?.id || ''
  );
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    unit ? unit.id : 'all'
  );

  // Link status & options
  const [isLinkActive, setIsLinkActive] = useState<boolean>(true);
  const [linkMode, setLinkMode] = useState<'survey_direct' | 'unit_portal'>(
    unit && !survey ? 'unit_portal' : 'survey_direct'
  );

  // Active view tab: 'link_qr' (Simple QR & Link) | 'poster' (Printable Poster Designer)
  const [activeTab, setActiveTab] = useState<'link_qr' | 'poster'>('link_qr');
  const [posterTemplate, setPosterTemplate] = useState<PosterTemplate>('a4_vertical');

  // Poster customizable texts
  const [orgName, setOrgName] = useState<string>('مرکز درمانی و آموزشی تخصصی بیمارستان ولی‌عصر (عج)');
  const [posterTitle, setPosterTitle] = useState<string>('');
  const [posterSubtitle, setPosterSubtitle] = useState<string>('');
  const [posterNotice, setPosterNotice] = useState<string>(
    'با اسکن این بارکد از طریق دوربین تلفن همراه خود، در ارتقای کیفیت و ایمنی خدمات مشارکت فرمایید.'
  );

  // Generated QR Code Data URLs
  const [qrPngUrl, setQrPngUrl] = useState<string>('');
  const [qrSvgString, setQrSvgString] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [customSlug, setCustomSlug] = useState<string>('');

  const currentSurvey = allSurveys.find((s) => s.id === selectedSurveyId) || survey;
  const currentUnit = allUnits.find((u) => u.id === selectedUnitId) || unit;

  // Sync initial titles
  useEffect(() => {
    if (linkMode === 'unit_portal' && currentUnit) {
      setPosterTitle(`پرتال نظرسنجی و ارزیابی ${currentUnit.name}`);
      setPosterSubtitle(`سامانه صدای پرسنل و مراجعین - واحد ${currentUnit.code}`);
    } else if (currentSurvey) {
      setPosterTitle(currentSurvey.title);
      setPosterSubtitle(
        currentUnit && currentUnit.id !== 'all'
          ? `اختصاصی: ${currentUnit.name}`
          : 'سامانه سراسری سنجش رضایت و بازخورد سازمانی'
      );
    }
  }, [linkMode, selectedSurveyId, selectedUnitId, currentSurvey, currentUnit]);

  // Calculate full URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://survey.example.com';
  
  const generatedUrl = React.useMemo(() => {
    const params = new URLSearchParams();
    if (linkMode === 'unit_portal' && currentUnit && currentUnit.id !== 'all') {
      params.append('unit', currentUnit.id);
      params.append('tab', 'surveys');
      return `${baseUrl}/?${params.toString()}`;
    }

    if (currentSurvey) {
      const slugOrId = customSlug.trim() || currentSurvey.slug || currentSurvey.id;
      params.append('survey', slugOrId);
      if (currentUnit && currentUnit.id !== 'all') {
        params.append('unit', currentUnit.id);
      }
      return `${baseUrl}/?${params.toString()}`;
    }

    return baseUrl;
  }, [baseUrl, linkMode, currentSurvey, currentUnit, customSlug]);

  // Generate QR code whenever the URL changes
  useEffect(() => {
    if (!generatedUrl) return;

    QRCode.toDataURL(generatedUrl, {
      width: 800,
      margin: 2,
      color: {
        dark: '#1e1b4b', // Deep indigo
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrPngUrl(url))
      .catch((err) => console.error('Error generating PNG QR Code:', err));

    QRCode.toString(generatedUrl, {
      type: 'svg',
      margin: 2,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((svg) => setQrSvgString(svg))
      .catch((err) => console.error('Error generating SVG QR Code:', err));
  }, [generatedUrl]);

  // Copy link handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopiedLink(true);
    onShowToast('لینک مستقیم نظرسنجی در حافظه کپی گردید.', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Download PNG QR Code
  const handleDownloadPng = () => {
    if (!qrPngUrl) return;
    const link = document.createElement('a');
    const filename = `qrcode-${(currentSurvey?.slug || currentUnit?.code || 'survey').toLowerCase()}-${Date.now()}.png`;
    link.href = qrPngUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('تصویر بارکد با کیفیت بالا (PNG) دانلود شد.', 'success');
  };

  // Download SVG QR Code
  const handleDownloadSvg = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `qrcode-${(currentSurvey?.slug || currentUnit?.code || 'survey').toLowerCase()}-${Date.now()}.svg`;
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('فایل برداری بارکد (SVG) دانلود شد.', 'success');
  };

  // Print poster
  const handlePrintPoster = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      {/* Outer container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150 overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>اشتراک‌گذاری، لینک مستقیم و QR Code</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  اتصال یکپارچه
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تولید لینک اختصاصی، بارکد دوبعدی و پوستر چاپی استند رومیزی و دیواری
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch bar */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('link_qr')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'link_qr'
                  ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>لینک و QR Code اختصاصی</span>
            </button>

            <button
              onClick={() => setActiveTab('poster')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'poster'
                  ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طراحی و چاپ پوستر سازمانی (A4 و استند)</span>
            </button>
          </div>

          {/* Quick link status indicator */}
          <div className="hidden sm:flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                isLinkActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {isLinkActive ? 'وضعیت لینک: فعال و آماده دسترسی' : 'لینک غیرفعال'}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          
          {/* Target Config: Mode, Survey selection, Unit selection */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>تنظیم هدف لینک و انتساب واحد</span>
              </span>

              {/* Mode switch */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setLinkMode('survey_direct')}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    linkMode === 'survey_direct'
                      ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  نظرسنجی مستقیم
                </button>
                <button
                  type="button"
                  onClick={() => setLinkMode('unit_portal')}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    linkMode === 'unit_portal'
                      ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  پرتال واحد سازمانی (چندین نظرسنجی)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Survey Selector (if in survey direct mode) */}
              {linkMode === 'survey_direct' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نظرسنجی هدف:
                  </label>
                  <select
                    value={selectedSurveyId}
                    onChange={(e) => setSelectedSurveyId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                  >
                    {allSurveys.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Unit Selector */}
              <div className={linkMode === 'unit_portal' ? 'sm:col-span-2' : ''}>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {linkMode === 'unit_portal' ? 'واحد سازمانی مرجع *' : 'انتساب به واحد سازمانی (اختیاری):'}
                </label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                >
                  {linkMode !== 'unit_portal' && (
                    <option value="all">سراسری (انتخاب توسط پاسخ‌دهنده یا عمومی)</option>
                  )}
                  {allUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.code})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  {linkMode === 'unit_portal'
                    ? 'کاربر با اسکن این کد، کلیه نظرسنجی‌های مجاز برای این بخش را مشاهده می‌کند.'
                    : 'در صورت انتخاب یک بخش، پاسخ‌ها به صورت قطعی و امن به آن واحد منتسب خواهند شد.'}
                </p>
              </div>
            </div>
          </div>

          {/* TAB 1: Link & QR View */}
          {activeTab === 'link_qr' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Left Column: QRCodeManager Utility Component */}
              <div className="md:col-span-5 flex flex-col items-center">
                <QRCodeManager
                  url={generatedUrl}
                  title={currentUnit && currentUnit.id !== 'all' ? currentUnit.name : currentSurvey?.title || 'بارکد نظرسنجی'}
                  subtitle={linkMode === 'unit_portal' ? `پرتال اختصاصی واحد ${currentUnit?.code || ''}` : 'اسکن با دوربین تلفن همراه'}
                  size={190}
                  downloadFileName={`survey-qr-${(currentSurvey?.slug || currentUnit?.code || 'survey').toLowerCase()}`}
                  showDownloadButtons={true}
                  showUrlControls={false}
                  onShowToast={onShowToast}
                  className="w-full"
                />

                <button
                  type="button"
                  onClick={() => setActiveTab('poster')}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs border border-emerald-200/80 dark:border-emerald-800 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طراحی و چاپ پوستر و استند</span>
                </button>
              </div>

              {/* Right Column: URLs, copy, slug, toggle */}
              <div className="md:col-span-7 space-y-4">
                
                {/* Full Direct URL box */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    آدرس مستقیم اختصاصی (URL):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      dir="ltr"
                      value={generatedUrl}
                      className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-xs select-all focus:outline-hidden"
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 ${
                        copiedLink
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? 'کپی شد' : 'کپی لینک'}</span>
                    </button>
                  </div>
                </div>

                {/* Open preview link */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-indigo-500" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        پیش‌نمایش فرم در مرورگر
                      </span>
                      <span className="text-[10px] text-slate-400">
                        مشاهده فرم همانند یک پاسخ‌دهنده واقعی در موبایل و دسکتاپ
                      </span>
                    </div>
                  </div>
                  <a
                    href={generatedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-colors"
                  >
                    مشاهده فرم
                  </a>
                </div>

                {/* Custom Slug or Token */}
                {linkMode === 'survey_direct' && currentSurvey && (
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      شناسه یکتا (Slug) در آدرس:
                    </label>
                    <div className="flex items-center gap-2" dir="ltr">
                      <span className="text-slate-400 font-mono text-xs">/s/</span>
                      <input
                        type="text"
                        placeholder={currentSurvey.slug}
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-xs focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block" dir="rtl">
                      می‌توانید کلمه دلخواه انگلیسی یا فارسی برای کوتاه کردن لینک وارد نمایید.
                    </span>
                  </div>
                )}

                {/* Link Status & Expiry controls */}
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="font-bold text-amber-900 dark:text-amber-200">
                        کنترل اعتبار و ابطال لینک
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLinkActive(!isLinkActive);
                        onShowToast(
                          isLinkActive ? 'لینک موقتاً باطل و غیرفعال شد.' : 'لینک مجدداً فعال گردید.',
                          isLinkActive ? 'error' : 'success'
                        );
                      }}
                      className={`px-3 py-1 rounded-xl font-bold text-[11px] transition-colors cursor-pointer ${
                        isLinkActive
                          ? 'bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {isLinkActive ? 'ابطال / توقف لینک' : 'فعال‌سازی مجدد لینک'}
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                    در صورت ابطال یا توقف نظرسنجی، مراجعین با اسکن این بارکد به صفحه راهنما با پیام مناسب هدایت خواهند شد.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Printable Poster Designer & Stencils */}
          {activeTab === 'poster' && (
            <div className="space-y-5">
              
              {/* Template Style Selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>انتخاب قالب چاپی:</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPosterTemplate('a4_vertical')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      posterTemplate === 'a4_vertical'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    پوستر دیواری A4
                  </button>

                  <button
                    type="button"
                    onClick={() => setPosterTemplate('table_tent')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      posterTemplate === 'table_tent'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    استند رومیزی (Table Tent)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPosterTemplate('compact_badge')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      posterTemplate === 'compact_badge'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    کارت و برچسب کوچک
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handlePrintPoster}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ مستقیم پوستر (Print)</span>
                </button>
              </div>

              {/* Poster Customization Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نام سازمان یا بیمارستان:
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    عنوان اصلی پوستر:
                  </label>
                  <input
                    type="text"
                    value={posterTitle}
                    onChange={(e) => setPosterTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    زیرعنوان یا نام بخش:
                  </label>
                  <input
                    type="text"
                    value={posterSubtitle}
                    onChange={(e) => setPosterSubtitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    پیام دعوت و راهنما:
                  </label>
                  <input
                    type="text"
                    value={posterNotice}
                    onChange={(e) => setPosterNotice(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* POSTER LIVE PRINT PREVIEW CONTAINER */}
              <div className="flex justify-center p-4 bg-slate-100 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
                
                {/* Printable Canvas Sheet (also targeted by print media queries) */}
                <div
                  id="survey-printable-poster"
                  className={`bg-white text-slate-900 shadow-xl border border-slate-200 rounded-2xl flex flex-col items-center justify-between transition-all ${
                    posterTemplate === 'a4_vertical'
                      ? 'w-[440px] min-h-[620px] p-8'
                      : posterTemplate === 'table_tent'
                      ? 'w-[440px] min-h-[480px] p-6 border-4 border-indigo-600'
                      : 'w-[360px] min-h-[380px] p-5 border-2 border-slate-300'
                  }`}
                >
                  {/* Top Emblem & Header */}
                  <div className="w-full text-center space-y-2 border-b-2 border-slate-100 pb-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-xs text-indigo-950 tracking-tight">
                        {orgName}
                      </span>
                    </div>

                    <h2 className="text-lg font-black text-slate-950 pt-1 leading-snug">
                      {posterTitle || 'نظرسنجی و ارزیابی سازمانی'}
                    </h2>

                    <div className="inline-block px-3 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 font-extrabold text-[11px]">
                      {posterSubtitle || (currentUnit ? currentUnit.name : 'سامانه جامع بازخورد')}
                    </div>
                  </div>

                  {/* QR Code Centerpiece */}
                  <div className="my-5 flex flex-col items-center justify-center space-y-3">
                    <div className="p-3 bg-white rounded-2xl border-2 border-slate-900 shadow-lg flex items-center justify-center">
                      {qrPngUrl ? (
                        <img
                          src={qrPngUrl}
                          alt="Survey QR Code"
                          className={`${
                            posterTemplate === 'compact_badge' ? 'w-44 h-44' : 'w-52 h-52'
                          } object-contain`}
                        />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                          بارکد
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-black text-[11px]">
                      <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                      <span>اسکن از طریق دوربین تلفن همراه</span>
                    </div>
                  </div>

                  {/* Instructions & Footnotes */}
                  <div className="w-full text-center space-y-2 border-t-2 border-slate-100 pt-3">
                    <p className="text-xs text-slate-700 font-medium leading-relaxed max-w-xs mx-auto">
                      {posterNotice}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                      <span>شناسه: {currentSurvey?.code || currentUnit?.code || 'SRV-100'}</span>
                      <span dir="ltr">{generatedUrl.slice(0, 32)}...</span>
                      <span>طراحی‌شده توسط سیستم نظرسنجی</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>پشتیبانی کامل از QR Code و لینک‌های بهینه‌شده برای موبایل</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              کپی پیوند
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
            >
              بستن پنجره
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
