import {
  OrganizationalUnit,
  Survey,
  SurveyResponse,
  SurveyAnalyticsData,
  UserAccessProfile,
  SurveyRole,
} from '../types/survey';

// Available test user roles for demonstrating RBAC
export const SAMPLE_USER_ROLES: UserAccessProfile[] = [
  {
    id: 'user-admin',
    fullName: 'دکتر علیرضا فرهادی',
    role: 'super_admin',
    roleTitle: 'مدیر کل بیمارستان (دسترسی به تمام بخش‌ها)',
    allowedUnitIds: [], // All units
  },
  {
    id: 'user-icu-mgr',
    fullName: 'خانم فاطمه سلیمانی',
    role: 'unit_manager',
    roleTitle: 'مدیر و سرپرستار بخش مراقبت‌های ویژه (ICU)',
    unitId: 'unit-icu-01',
    unitName: 'بخش مراقبت‌های ویژه (ICU)',
    allowedUnitIds: ['unit-icu-01'], // Restricted to ICU
  },
  {
    id: 'user-ccu-mgr',
    fullName: 'آقای محمدرضا کریمی',
    role: 'unit_manager',
    roleTitle: 'سرپرستار بخش CCU',
    unitId: 'unit-ccu-01',
    unitName: 'بخش مراقبت‌های ویژه قلبی (CCU)',
    allowedUnitIds: ['unit-ccu-01'],
  },
  {
    id: 'user-designer',
    fullName: 'مهندس مهدی شمس',
    role: 'designer',
    roleTitle: 'طراح و مدیر نظرسنجی‌ها',
    allowedUnitIds: [],
  },
  {
    id: 'user-analyst',
    fullName: 'خانم دکتر اسدی',
    role: 'analyst',
    roleTitle: 'تحلیلگر کیفیت و اعتباربخشی بالینی',
    allowedUnitIds: [],
  },
  {
    id: 'user-staff',
    fullName: 'پرستار بالینی نسترن نوری',
    role: 'respondent',
    roleTitle: 'پرسنل پرستار (پاسخ‌دهنده)',
    unitId: 'unit-icu-01',
    unitName: 'بخش مراقبت‌های ویژه (ICU)',
    allowedUnitIds: ['unit-icu-01'],
  },
];

class SurveyService {
  private currentProfile: UserAccessProfile = SAMPLE_USER_ROLES[0]; // Default: Super Admin
  private listeners: (() => void)[] = [];

  public getCurrentProfile(): UserAccessProfile {
    return this.currentProfile;
  }

  public setRoleProfile(profile: UserAccessProfile) {
    this.currentProfile = profile;
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- Organizational Units ---

  public async getUnits(filter?: { search?: string; parentId?: string | null }): Promise<OrganizationalUnit[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.search) params.append('search', filter.search);
      if (filter?.parentId !== undefined) params.append('parentId', String(filter.parentId));

      const res = await fetch(`/api/surveys/units?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
      return [];
    } catch (e) {
      console.warn('API error fetching units, falling back:', e);
      return [];
    }
  }

  public async getUnitById(idOrCode: string): Promise<OrganizationalUnit | null> {
    try {
      const res = await fetch(`/api/surveys/units/${idOrCode}`);
      const json = await res.json();
      if (json.success && json.data) return json.data;
      return null;
    } catch {
      return null;
    }
  }

  public async getUnitSurveys(unitIdOrCode: string): Promise<{ unit: OrganizationalUnit; surveys: Survey[] } | null> {
    try {
      const res = await fetch(`/api/surveys/units/${unitIdOrCode}/surveys`);
      const json = await res.json();
      if (json.success && json.data) return json.data;
      return null;
    } catch {
      return null;
    }
  }

  public async createUnit(unitData: Partial<OrganizationalUnit>): Promise<OrganizationalUnit | null> {
    try {
      const res = await fetch('/api/surveys/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unitData),
      });
      const json = await res.json();
      if (json.success) return json.data;
      return null;
    } catch {
      return null;
    }
  }

  public async updateUnit(id: string, updates: Partial<OrganizationalUnit>): Promise<OrganizationalUnit | null> {
    try {
      const res = await fetch(`/api/surveys/units/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.success) return json.data;
      return null;
    } catch {
      return null;
    }
  }

  public async deleteUnit(id: string, transferChildrenToId?: string | null): Promise<{ success: boolean; message: string }> {
    try {
      const params = new URLSearchParams();
      if (transferChildrenToId) params.append('transferChildrenToId', transferChildrenToId);

      const res = await fetch(`/api/surveys/units/${id}?${params.toString()}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message || 'خطا در برقراری ارتباط با سرور' };
    }
  }

  public async reorderUnits(orderedIds: string[]): Promise<boolean> {
    try {
      const res = await fetch('/api/surveys/units/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });
      const json = await res.json();
      return !!json.success;
    } catch {
      return false;
    }
  }

  // --- Surveys Management ---

  public async getSurveys(filter?: { unitId?: string; status?: string; search?: string }): Promise<Survey[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.unitId) params.append('unitId', filter.unitId);
      if (filter?.status) params.append('status', filter.status);
      if (filter?.search) params.append('search', filter.search);

      const res = await fetch(`/api/surveys?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
      return [];
    } catch {
      return [];
    }
  }

  public async getSurveyById(idOrSlug: string): Promise<Survey | null> {
    try {
      const res = await fetch(`/api/surveys/${idOrSlug}`);
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
      return null;
    } catch {
      return null;
    }
  }

  public async createSurvey(data: Partial<Survey>): Promise<Survey | null> {
    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) return json.data;
      return null;
    } catch {
      return null;
    }
  }

  public async updateSurvey(id: string, updates: Partial<Survey>): Promise<Survey | null> {
    try {
      const res = await fetch(`/api/surveys/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.success) return json.data;
      return null;
    } catch {
      return null;
    }
  }

  public async deleteSurvey(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/surveys/${id}`, { method: 'DELETE' });
      const json = await res.json();
      return !!json.success;
    } catch {
      return false;
    }
  }

  public async cloneSurvey(id: string, newTitle?: string): Promise<Survey | null> {
    try {
      const res = await fetch(`/api/surveys/${id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newTitle }),
      });
      const json = await res.json();
      if (json.success) return json.data;
      return null;
    } catch {
      return null;
    }
  }

  public async setSurveyStatus(id: string, status: Survey['status']): Promise<Survey | null> {
    try {
      const res = await fetch(`/api/surveys/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) return json.data;
      return null;
    } catch {
      return null;
    }
  }

  // --- Submissions & Analytics ---

  public async submitSurveyResponse(
    surveyId: string,
    submission: {
      unitId: string;
      answers: Record<string, any>;
      respondent?: { personnelCode?: string; fullName?: string; jobTitle?: string };
    }
  ): Promise<{ success: boolean; trackingCode?: string; message: string; overallScore?: number }> {
    try {
      const res = await fetch(`/api/surveys/${surveyId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message || 'خطا در ثبت پاسخ نظرسنجی' };
    }
  }

  public async getSurveyAnalytics(surveyId: string, filterUnitId?: string, periodId?: string): Promise<SurveyAnalyticsData | null> {
    try {
      const params = new URLSearchParams();
      if (filterUnitId) params.append('unitId', filterUnitId);
      if (periodId) params.append('periodId', periodId);

      const res = await fetch(`/api/surveys/${surveyId}/analytics?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
      return null;
    } catch {
      return null;
    }
  }

  public async getResponses(
    surveyId: string,
    filter?: { unitId?: string; periodId?: string; search?: string }
  ): Promise<SurveyResponse[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.unitId) params.append('unitId', filter.unitId);
      if (filter?.periodId) params.append('periodId', filter.periodId);
      if (filter?.search) params.append('search', filter.search);

      const res = await fetch(`/api/surveys/${surveyId}/responses?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
      return [];
    } catch {
      return [];
    }
  }

  public getExportCSVUrl(surveyId: string, unitId?: string): string {
    const params = new URLSearchParams();
    if (unitId) params.append('unitId', unitId);
    return `/api/surveys/${surveyId}/export/csv?${params.toString()}`;
  }
}

export const surveyService = new SurveyService();
