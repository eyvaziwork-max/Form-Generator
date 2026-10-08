export type FormFieldType =
  | 'text'
  | 'fullname'
  | 'phone'
  | 'student_id'
  | 'email'
  | 'number'
  | 'textarea'
  | 'password'
  | 'date'
  | 'time'
  | 'datetime'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'multiselect'
  | 'file'
  | 'image'
  | 'hidden'
  | 'static_text'
  | 'divider'
  | 'star_rating'
  | 'national_id';

export interface FieldOption {
  id: string;
  label: string;
  value: string;
}

export type ConditionalOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'is_empty'
  | 'is_not_empty';

export interface ConditionalRule {
  fieldId: string;
  operator: ConditionalOperator;
  value: string;
}

export interface ConditionalLogic {
  enabled: boolean;
  action: 'show' | 'hide';
  rules: ConditionalRule[];
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  name: string; // Technical field name (e.g., student_id, first_name)
  placeholder?: string;
  description?: string; // Help text / hint
  defaultValue?: string | number | boolean | string[];
  required: boolean;
  active: boolean;
  order: number;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  regexPattern?: string;
  customErrorMessage?: string;
  cssClass?: string;
  options?: FieldOption[];
  conditionalLogic?: ConditionalLogic;
}

export interface FormSettings {
  title: string;
  description: string;
  slug: string;
  status: 'active' | 'inactive';
  successMessage: string;
  redirectUrl?: string;
  maxResponses?: number | null;
  enableCaptcha: boolean;
  allowMultipleSubmissions: boolean;
  startDate?: string;
  endDate?: string;
  themeColor: string;
  // Email Notifications
  emailNotificationEnabled?: boolean;
  notificationEmail?: string;
  emailSubjectTemplate?: string;
  includeSubmissionSummary?: boolean;
  // Webhook Integration
  webhookEnabled?: boolean;
  webhookUrl?: string;
  webhookSecret?: string;
  webhookIncludeMetadata?: boolean;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  slug: string;
  status: 'active' | 'inactive';
  fields: FormField[];
  settings: FormSettings;
  createdAt: string;
  updatedAt: string;
  responseCount: number;
  lastResponseAt?: string;
}

export interface FormResponseValue {
  fieldId: string;
  fieldName: string;
  fieldLabel: string;
  value: any;
}

export interface FormResponse {
  id: string;
  formId: string;
  formTitle: string;
  values: Record<string, any>; // fieldName -> value
  formattedValues?: FormResponseValue[];
  trackingCode: string;
  ipAddress?: string;
  submittedAt: string; // Persian formatted or ISO
  submittedAtTimestamp: number;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface DashboardStats {
  totalForms: number;
  activeForms: number;
  totalResponses: number;
  todayResponses: number;
  thisWeekResponses: number;
  averageFieldsPerForm: number;
  recentResponsesChart: { date: string; count: number }[];
}
