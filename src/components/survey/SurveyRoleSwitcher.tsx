import React from 'react';
import { ShieldCheck, UserCheck, ChevronDown, Check } from 'lucide-react';
import { SAMPLE_USER_ROLES } from '../../services/surveyService';
import { UserAccessProfile } from '../../types/survey';

interface SurveyRoleSwitcherProps {
  currentProfile: UserAccessProfile;
  onSelectProfile: (profile: UserAccessProfile) => void;
}

export const SurveyRoleSwitcher: React.FC<SurveyRoleSwitcherProps> = ({
  currentProfile,
  onSelectProfile,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'unit_manager':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'designer':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'analyst':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 transition-all text-xs cursor-pointer"
        title="تغییر نقش کاربری جهت شبیه‌سازی و تست دسترسی‌های سازمانی (RBAC)"
      >
        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <div className="text-right truncate max-w-[170px]">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-none">نقش فعال:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
            {currentProfile.fullName}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                تغییر هویت و سطح دسترسی (RBAC)
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                تست سناریوی تفکیک دسترسی مدیر کل و مدیران واحدها
              </p>
            </div>

            {SAMPLE_USER_ROLES.map((roleProfile) => {
              const isSelected = currentProfile.id === roleProfile.id;
              return (
                <button
                  key={roleProfile.id}
                  onClick={() => {
                    onSelectProfile(roleProfile);
                    setIsOpen(false);
                  }}
                  className={`w-full text-right p-2.5 rounded-xl transition-all flex items-start justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {roleProfile.fullName}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium border ${getRoleBadge(roleProfile.role)}`}>
                        {roleProfile.role === 'super_admin' ? 'مدیر کل' : roleProfile.role === 'unit_manager' ? 'مدیر واحد' : roleProfile.role === 'designer' ? 'طراح' : roleProfile.role === 'analyst' ? 'تحلیلگر' : 'پرسنل'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {roleProfile.roleTitle}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
