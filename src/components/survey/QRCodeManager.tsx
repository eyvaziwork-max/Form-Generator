import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  Download,
  Copy,
  Check,
  QrCode,
  FileCode,
  ImageIcon,
  ExternalLink,
  Printer,
  Sparkles,
  ShieldCheck,
  Building2,
  Smartphone,
  Calendar,
  Eye,
  Sliders,
  Layers,
} from 'lucide-react';

export interface QRCodeManagerProps {
  /** The target URL or text to encode (Required) */
  url: string;
  /** Optional title shown on the QR code and printable poster */
  title?: string;
  /** Optional subtitle or organizational unit name */
  subtitle?: string;
  /** Name of the organization / hospital */
  orgName?: string;
  /** Optional custom URL or base64 for organization logo */
  orgLogoUrl?: string;
  /** Primary instruction text below the QR code */
  instructionText?: string;
  /** Secondary guidance text on the poster */
  additionalNote?: string;
  /** Optional survey validity or expiration date string */
  expiryText?: string;
  /** Default paper size for poster print & SVG ('a4' | 'a5') */
  defaultPaperSize?: 'a4' | 'a5';
  /** Display size in pixels for component card (default: 220) */
  size?: number;
  /** Dark color of modules (default: '#1e1b4b') */
  darkColor?: string;
  /** Light background color (default: '#ffffff') */
  lightColor?: string;
  /** Error correction level ('L' | 'M' | 'Q' | 'H', default: 'H' for high redundancy) */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  /** Margin/quiet zone in modules (default: 2) */
  margin?: number;
  /** Filename prefix when saving files (default: 'survey-qr') */
  downloadFileName?: string;
  /** Whether to show download buttons (default: true) */
  showDownloadButtons?: boolean;
  /** Whether to show print button (default: true) */
  showPrintButton?: boolean;
  /** Whether to show target URL input with copy button (default: true) */
  showUrlControls?: boolean;
  /** Whether to allow opening the live poster preview panel (default: true) */
  allowPosterPreview?: boolean;
  /** Optional extra CSS class name */
  className?: string;
  /** Callback when link is copied */
  onCopySuccess?: () => void;
  /** Optional custom toast notifier */
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const QRCodeManager: React.FC<QRCodeManagerProps> = ({
  url,
  title = 'نظرسنجی رضایت پرسنل پرستاری',
  subtitle = 'بخش مراقبت‌های ویژه (ICU)',
  orgName = 'مرکز درمانی و آموزشی تخصصی بیمارستان نمونه',
  orgLogoUrl,
  instructionText = 'برای شرکت در نظرسنجی، دوربین تلفن همراه خود را مقابل کد قرار دهید.',
  additionalNote = 'صدای شما، مسیر بهبود ماست. با شرکت در این نظرسنجی، به ما کمک کنید خدمات، محیط کار و کیفیت عملکرد سازمان را بهبود دهیم.',
  expiryText = 'تا پایان دوره ارزیابی جاری',
  defaultPaperSize = 'a4',
  size = 220,
  darkColor = '#1e1b4b',
  lightColor = '#ffffff',
  errorCorrectionLevel = 'H',
  margin = 2,
  downloadFileName = 'survey-qrcode',
  showDownloadButtons = true,
  showPrintButton = true,
  showUrlControls = true,
  allowPosterPreview = true,
  className = '',
  onCopySuccess,
  onShowToast,
}) => {
  const qrSvgRef = useRef<SVGSVGElement | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [paperSize, setPaperSize] = useState<'a4' | 'a5'>(defaultPaperSize);
  const [showPosterPreview, setShowPosterPreview] = useState<boolean>(false);
  const [customOrgName, setCustomOrgName] = useState<string>(orgName);
  const [customTitle, setCustomTitle] = useState<string>(title);
  const [customSubtitle, setCustomSubtitle] = useState<string>(subtitle);
  const [customInstruction, setCustomInstruction] = useState<string>(instructionText);

  // Sync state if props change
  useEffect(() => {
    if (orgName) setCustomOrgName(orgName);
  }, [orgName]);

  useEffect(() => {
    if (title) setCustomTitle(title);
  }, [title]);

  useEffect(() => {
    if (subtitle) setCustomSubtitle(subtitle);
  }, [subtitle]);

  useEffect(() => {
    if (instructionText) setCustomInstruction(instructionText);
  }, [instructionText]);

  // Escape helper for XML/SVG safety
  const escapeXml = (str: string): string => {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  /**
   * Primary Action: Download as SVG (Vector format)
   * Serializes the vector SVG rendered by qrcode.react into an SVG file download
   */
  const handleDownloadSVG = () => {
    if (!qrSvgRef.current) {
      if (onShowToast) onShowToast('خطا در دریافت وکتور بارکد', 'error');
      return;
    }

    try {
      const serializer = new XMLSerializer();
      let svgData = serializer.serializeToString(qrSvgRef.current);

      if (!svgData.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgData = svgData.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const fullSvgFile = `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n${svgData}`;

      const blob = new Blob([fullSvgFile], { type: 'image/svg+xml;charset=utf-8' });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const cleanName = downloadFileName.replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, '_');
      link.href = objectUrl;
      link.download = `${cleanName}-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      if (onShowToast) {
        onShowToast('فایل بارکد برداری (SVG) با موفقیت دانلود شد.', 'success');
      }
    } catch (err) {
      console.error('Failed to download QR code as SVG:', err);
      if (onShowToast) {
        onShowToast('خطا در دانلود فایل SVG', 'error');
      }
    }
  };

  /**
   * Generates a complete, professional A4 or A5 vector SVG Poster
   * including organization logo emblem, headers, QR code, and placeholder texts.
   */
  const createPosterSvgString = (targetPaperSize: 'a4' | 'a5'): string => {
    const width = targetPaperSize === 'a4' ? 794 : 559;
    const height = targetPaperSize === 'a4' ? 1123 : 792;
    const isA4 = targetPaperSize === 'a4';

    let innerQrPaths = '';
    let qrViewBox = '0 0 33 33';

    if (qrSvgRef.current) {
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(qrSvgRef.current);
      const match = svgStr.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
      if (match) innerQrPaths = match[1];
      const viewBoxMatch = svgStr.match(/viewBox="([^"]+)"/i);
      if (viewBoxMatch) qrViewBox = viewBoxMatch[1];
    }

    const qrBoxSize = isA4 ? 280 : 210;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = isA4 ? 350 : 240;

    const qrInnerSize = isA4 ? 250 : 185;
    const qrInnerX = qrBoxX + (qrBoxSize - qrInnerSize) / 2;
    const qrInnerY = qrBoxY + (qrBoxSize - qrInnerSize) / 2;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" direction="rtl" style="background:#ffffff; font-family:'Vazirmatn', Tahoma, 'Segoe UI', Arial, sans-serif;">
  <defs>
    <style type="text/css">
      @import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css');
      text { font-family: 'Vazirmatn', Tahoma, 'Segoe UI', Arial, sans-serif; text-anchor: middle; }
      .bold { font-weight: 800; }
      .semi { font-weight: 600; }
      .regular { font-weight: 400; }
    </style>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#312e81"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#eef2ff"/>
      <stop offset="100%" stop-color="#e0e7ff"/>
    </linearGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="#ffffff"/>
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="2.5"/>
  <rect x="34" y="34" width="${width - 68}" height="${height - 68}" rx="20" fill="none" stroke="#6366f1" stroke-width="1.5" stroke-dasharray="8,5" stroke-opacity="0.5"/>

  <path d="M 34 54 C 34 43 43 34 54 34 L ${width - 54} 34 C ${width - 43} 34 ${width - 34} 43 ${width - 34} 54 L ${width - 34} ${isA4 ? 140 : 105} L 34 ${isA4 ? 140 : 105} Z" fill="url(#headerGrad)"/>

  <g transform="translate(${width / 2}, ${isA4 ? 80 : 64})">
    <rect x="-24" y="-24" width="48" height="48" rx="14" fill="#ffffff" filter="url(#cardShadow)"/>
    <path d="M -5 -14 L 5 -14 L 5 -5 L 14 -5 L 14 5 L 5 5 L 5 14 L -5 14 L -5 5 L -14 5 L -14 -5 L -5 -5 Z" fill="#4f46e5"/>
  </g>

  <text x="${width / 2}" y="${isA4 ? 122 : 94}" fill="#ffffff" font-size="${isA4 ? 16 : 13}" class="semi" letter-spacing="0.5">
    ${escapeXml(customOrgName)}
  </text>

  <text x="${width / 2}" y="${isA4 ? 205 : 148}" fill="#0f172a" font-size="${isA4 ? 25 : 18}" class="bold">
    «${escapeXml(customTitle)}»
  </text>

  <g transform="translate(${width / 2}, ${isA4 ? 245 : 180})">
    <rect x="-160" y="-16" width="320" height="32" rx="16" fill="url(#badgeGrad)" stroke="#c7d2fe" stroke-width="1.2"/>
    <text x="0" y="5" fill="#3730a3" font-size="${isA4 ? 13 : 11}" class="semi">
      واحد سازمانی: ${escapeXml(customSubtitle)}
    </text>
  </g>

  <text x="${width / 2}" y="${isA4 ? 305 : 216}" fill="#64748b" font-size="${isA4 ? 13 : 10.5}" class="regular">
    سامانه ملی سنجش رضایت، بازخورد و ارتقای مستمر کیفیت عملکرد
  </text>

  <g filter="url(#cardShadow)">
    <rect x="${qrBoxX}" y="${qrBoxY}" width="${qrBoxSize}" height="${qrBoxSize}" rx="24" fill="#ffffff" stroke="#1e1b4b" stroke-width="3"/>
  </g>

  <svg x="${qrInnerX}" y="${qrInnerY}" width="${qrInnerSize}" height="${qrInnerSize}" viewBox="${qrViewBox}" shape-rendering="crispEdges">
    ${innerQrPaths}
  </svg>

  <g transform="translate(${width / 2}, ${qrBoxY + qrBoxSize + (isA4 ? 38 : 28)})">
    <rect x="-240" y="-18" width="480" height="36" rx="18" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
    <text x="0" y="5" fill="#0f172a" font-size="${isA4 ? 13 : 10.5}" class="bold">
      ${escapeXml(customInstruction)}
    </text>
  </g>

  <text x="${width / 2}" y="${qrBoxY + qrBoxSize + (isA4 ? 100 : 75)}" fill="#334155" font-size="${isA4 ? 13 : 10}" class="semi">
    صدای شما، مسیر بهبود ماست
  </text>
  <text x="${width / 2}" y="${qrBoxY + qrBoxSize + (isA4 ? 126 : 94)}" fill="#64748b" font-size="${isA4 ? 11.5 : 9}" class="regular">
    با شرکت در این نظرسنجی، به ما در ارتقای سطح خدمات، بهینه‌سازی فرآیندها و رضایتمندی همکاران یاری فرمایید.
  </text>

  <g transform="translate(${width / 2}, ${qrBoxY + qrBoxSize + (isA4 ? 172 : 130)})">
    <rect x="-210" y="-14" width="420" height="28" rx="8" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1"/>
    <text x="0" y="4" fill="#475569" font-size="${isA4 ? 11 : 9}" font-family="monospace" letter-spacing="0.5">
      ${escapeXml(url)}
    </text>
  </g>

  <line x1="60" y1="${height - (isA4 ? 90 : 70)}" x2="${width - 60}" y2="${height - (isA4 ? 90 : 70)}" stroke="#e2e8f0" stroke-width="1"/>
  <text x="${width / 2}" y="${height - (isA4 ? 66 : 52)}" fill="#64748b" font-size="${isA4 ? 11 : 9}" class="semi">
    تاریخ اعتبار: ${escapeXml(expiryText)} • قطع استاندارد چاپی: ${targetPaperSize.toUpperCase()}
  </text>
  <text x="${width / 2}" y="${height - (isA4 ? 44 : 35)}" fill="#94a3b8" font-size="${isA4 ? 9.5 : 8}" class="regular">
    طراحی‌شده با کیفیت چاپ ۳۰۰DPI وکتور • سیستم یکپارچه نظرسنجی
  </text>
</svg>`;
  };

  /**
   * Handle Download as SVG Poster (Vector Print File)
   */
  const handleDownloadSVGPoster = () => {
    try {
      const fullPosterSvg = createPosterSvgString(paperSize);
      const blob = new Blob([fullPosterSvg], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const cleanName = downloadFileName.replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, '_');
      link.href = objectUrl;
      link.download = `${cleanName}-${paperSize.toUpperCase()}-poster-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      if (onShowToast) {
        onShowToast(
          `پوستر وکتور با ابعاد ${paperSize.toUpperCase()} بدون افت کیفیت (SVG) دانلود شد.`,
          'success'
        );
      }
    } catch (err) {
      console.error('Failed to download SVG poster:', err);
      if (onShowToast) {
        onShowToast('خطا در تولید فایل وکتور پوستر', 'error');
      }
    }
  };

  /**
   * Handle Download as PNG
   */
  const handleDownloadPNG = () => {
    if (!qrCanvasRef.current) return;

    try {
      const pngUrl = qrCanvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      const cleanName = downloadFileName.replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, '_');
      link.href = pngUrl;
      link.download = `${cleanName}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onShowToast) {
        onShowToast('تصویر بارکد با کیفیت بالا (PNG) دانلود شد.', 'success');
      }
    } catch (err) {
      console.error('Failed to download PNG file:', err);
      if (onShowToast) {
        onShowToast('خطا در دانلود فایل PNG', 'error');
      }
    }
  };

  /**
   * Handle Copy URL with Visual Feedback
   */
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setHasCopied(true);
      if (onCopySuccess) onCopySuccess();
      if (onShowToast) {
        onShowToast('پیوند مستقیم با موفقیت در کلیپ‌بورد کپی شد.', 'success');
      }
      setTimeout(() => setHasCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      // Fallback for older environments
      try {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setHasCopied(true);
        if (onCopySuccess) onCopySuccess();
        setTimeout(() => setHasCopied(false), 2500);
      } catch (fallbackErr) {
        if (onShowToast) onShowToast('خطا در کپی کردن پیوند', 'error');
      }
    }
  };

  /**
   * Handle Direct Browser Print formatted as A4/A5 poster
   */
  const handlePrintPoster = () => {
    window.print();
    if (onShowToast) {
      onShowToast('کادر چاپ پوستر آماده گردید.', 'info');
    }
  };

  return (
    <div className={`w-full flex flex-col items-center space-y-4 ${className}`}>
      {/* Dynamic CSS Print Utility embedded specifically for this component */}
      <style>{`
        @media print {
          @page {
            size: ${paperSize.toUpperCase()} portrait;
            margin: 6mm;
          }

          body * {
            visibility: hidden !important;
          }

          #qrcode-printable-poster-sheet,
          #qrcode-printable-poster-sheet * {
            visibility: visible !important;
          }

          #qrcode-printable-poster-sheet {
            display: flex !important;
            visibility: visible !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            margin: 0 !important;
            padding: ${paperSize === 'a5' ? '8mm 6mm' : '14mm 10mm'} !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            color: #0f172a !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            z-index: 2147483647 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Hidden high-res canvas used for PNG export */}
      {url && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none' }}>
          <QRCodeCanvas
            ref={qrCanvasRef}
            value={url}
            size={1024}
            level={errorCorrectionLevel}
            bgColor={lightColor}
            fgColor={darkColor}
            marginSize={margin}
          />
        </div>
      )}

      {/* Main Interactive QR Card Container */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col items-center text-center space-y-4">
        
        {/* Title & Subtitle */}
        {(customTitle || customSubtitle) && (
          <div className="space-y-1 w-full text-center">
            {customTitle && (
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{customTitle}</span>
              </h4>
            )}
            {customSubtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {customSubtitle}
              </p>
            )}
          </div>
        )}

        {/* QR Code Graphic Display Frame using qrcode.react (QRCodeSVG) */}
        <div className="relative p-3 bg-white rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center">
          {url ? (
            <div className="qr-svg-wrapper flex items-center justify-center transition-all select-none">
              <QRCodeSVG
                ref={qrSvgRef}
                value={url}
                size={size}
                level={errorCorrectionLevel}
                bgColor={lightColor}
                fgColor={darkColor}
                marginSize={margin}
                className="transition-transform duration-200"
              />
            </div>
          ) : (
            <div
              style={{ width: size, height: size }}
              className="flex items-center justify-center text-slate-400 text-xs"
            >
              پیوند وارد نشده است
            </div>
          )}

          {/* Quality badge indicator */}
          <div className="absolute -bottom-2 right-3 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 shadow-xs flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>وکتور برداری SVG</span>
          </div>
        </div>

        {/* Paper Size Selector */}
        <div className="w-full flex items-center justify-between text-xs pt-1 px-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>ابعاد چاپ پوستر:</span>
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setPaperSize('a4')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                paperSize === 'a4'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              پوستر A4 (دیواری)
            </button>
            <button
              type="button"
              onClick={() => setPaperSize('a5')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                paperSize === 'a5'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              استند A5 (رومیزی)
            </button>
          </div>
        </div>

        {/* Display Area for the URL & 'Copy Link' button with visual feedback */}
        {showUrlControls && url && (
          <div className="w-full space-y-1.5 text-right">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                پیوند اختصاصی نظرسنجی (URL):
              </span>
              <span className="text-slate-400 font-mono text-[10px]" dir="ltr">
                URL
              </span>
            </div>

            {/* Display Area for URL + Copy Link Button */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                dir="ltr"
                value={url}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-xs select-all focus:outline-hidden"
                title="آدرس مستقیم اینترنتی"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer shrink-0 shadow-xs ${
                  hasCopied
                    ? 'bg-emerald-600 text-white scale-[1.02]'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white'
                }`}
                title="کپی پیوند در کلیپ‌بورد"
              >
                {hasCopied ? (
                  <>
                    <Check className="w-4 h-4 animate-in zoom-in-75 duration-200 text-white" />
                    <span>کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white" />
                    <span>کپی لینک</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Primary Action Buttons: 'Download as SVG', Print, PNG, Poster */}
        {(showDownloadButtons || showPrintButton) && (
          <div className="w-full pt-1 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              
              {/* 'Download as SVG' button */}
              {showDownloadButtons && (
                <button
                  type="button"
                  onClick={handleDownloadSVG}
                  disabled={!url}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                  title="دانلود کد QR به صورت فایل برداری با کیفیت نامحدود (SVG)"
                >
                  <Download className="w-4 h-4" />
                  <span>دانلود به عنوان SVG (بارکد)</span>
                </button>
              )}

              {/* Direct Print Poster button */}
              {showPrintButton && (
                <button
                  type="button"
                  onClick={handlePrintPoster}
                  disabled={!url}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                  title="چاپ مستقیم پوستر آماده سازمانی از طریق مرورگر (A4/A5)"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ پوستر (Print)</span>
                </button>
              )}

              {/* Download Full Poster as SVG button */}
              {showDownloadButtons && (
                <button
                  type="button"
                  onClick={handleDownloadSVGPoster}
                  disabled={!url}
                  className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                  title={`دانلود پوستر برداری کامل شامل لوگو، کادر و متن در قطع ${paperSize.toUpperCase()}`}
                >
                  <FileCode className="w-4 h-4 text-indigo-500" />
                  <span>دانلود پوستر کامل (SVG)</span>
                </button>
              )}

              {/* Download as PNG button */}
              {showDownloadButtons && (
                <button
                  type="button"
                  onClick={handleDownloadPNG}
                  disabled={!url}
                  className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                  title="دانلود تصویر پیکسلی با وضوح بالا برای پیام‌رسان‌ها (PNG)"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  <span>دانلود تصویر (PNG)</span>
                </button>
              )}
            </div>

            {/* Toggle Poster Live Preview */}
            {allowPosterPreview && (
              <button
                type="button"
                onClick={() => setShowPosterPreview(!showPosterPreview)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {showPosterPreview
                    ? 'بستن پیش‌نمایش زنده پوستر چاپی'
                    : 'مشاهده و ویرایش پیش‌نمایش پوستر چاپی'}
                </span>
              </button>
            )}

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              تولیدشده با کتابخانه <strong>qrcode.react</strong> • خروجی وکتور <strong>SVG</strong> بدون افت کیفیت و مناسب انواع چاپگرها و استندهای تبلیغاتی
            </p>
          </div>
        )}
      </div>

      {/* Interactive Poster Customizer & Screen Preview Panel */}
      {showPosterPreview && (
        <div className="w-full bg-slate-50 dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                شخصی‌سازی محتوای پوستر چاپی
              </h5>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              ابعاد فعلی: {paperSize.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                نام سازمان یا بیمارستان:
              </label>
              <input
                type="text"
                value={customOrgName}
                onChange={(e) => setCustomOrgName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                عنوان اصلی نظرسنجی:
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                نام بخش / واحد سازمانی:
              </label>
              <input
                type="text"
                value={customSubtitle}
                onChange={(e) => setCustomSubtitle(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                متن دعوت و راهنمای اسکن:
              </label>
              <input
                type="text"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED PRINTABLE POSTER CONTAINER (Targeted by @media print) */}
      <div
        className={`w-full flex justify-center ${
          showPosterPreview ? 'block mt-2' : 'hidden print:flex'
        }`}
      >
        <div
          id="qrcode-printable-poster-sheet"
          className={`qrcode-poster-print-container bg-white text-slate-900 border-2 border-slate-200 rounded-3xl shadow-xl flex flex-col items-center justify-between mx-auto transition-all ${
            paperSize === 'a5'
              ? 'w-full max-w-[420px] min-h-[580px] p-6'
              : 'w-full max-w-[520px] min-h-[740px] p-8'
          }`}
          style={{ boxSizing: 'border-box' }}
        >
          {/* Header & Official Organization Crest */}
          <div className="w-full text-center space-y-2 border-b-2 border-slate-100 pb-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-700 text-white flex items-center justify-center shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="font-black text-sm text-indigo-950 block leading-tight">
                  {customOrgName}
                </span>
                <span className="text-[10px] text-slate-500 font-medium block">
                  سامانه رسمی پایش عملکرد و رضایت سازمانی
                </span>
              </div>
            </div>

            <h2 className="text-xl font-black text-slate-950 pt-2 leading-snug">
              {customTitle}
            </h2>

            <div className="inline-block px-4 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 font-extrabold text-xs">
              واحد سازمانی: {customSubtitle}
            </div>
          </div>

          {/* Center QR Code Showcase */}
          <div className="my-4 flex flex-col items-center justify-center space-y-3">
            <div className="p-4 bg-white rounded-2xl border-4 border-slate-900 shadow-xl flex items-center justify-center">
              {url ? (
                <QRCodeSVG
                  value={url}
                  size={paperSize === 'a5' ? 180 : 230}
                  level={errorCorrectionLevel}
                  bgColor="#ffffff"
                  fgColor={darkColor}
                  marginSize={1}
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                  بارکد نظرسنجی
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-black text-xs shadow-2xs">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span>{customInstruction}</span>
            </div>
          </div>

          {/* Guide Text, Explanations & Monospace Link */}
          <div className="w-full text-center space-y-2 border-t-2 border-slate-100 pt-4">
            <p className="text-xs text-slate-800 font-bold">
              صدای شما، مسیر بهبود ماست
            </p>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
              {additionalNote}
            </p>

            <div className="flex items-center justify-center pt-2">
              <span
                dir="ltr"
                className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-mono text-[11px]"
              >
                {url}
              </span>
            </div>

            {/* Poster Details & Expiry */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-3 border-t border-slate-100">
              <span className="flex items-center gap-1 font-semibold text-slate-500">
                <Calendar className="w-3 h-3 text-indigo-500" />
                <span>تاریخ اعتبار: {expiryText}</span>
              </span>
              <span>قطع چاپی: {paperSize.toUpperCase()}</span>
              <span>سیستم یکپارچه نظرسنجی</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
