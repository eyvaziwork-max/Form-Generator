export type SurveyRole =
  | 'super_admin'
  | 'unit_manager'
  | 'designer'
  | 'analyst'
  | 'respondent';

export interface UserAccessProfile {
  id: string;
  fullName: string;
  role: SurveyRole;
  roleTitle: string;
  unitId?: string;
  unitName?: string;
  allowedUnitIds: string[]; // If empty and super_admin, means all
}

export interface StaffMember {
  id: string;
  unitId: string;
  fullName: string;
  personnelCode: string;
  jobTitle: string;
  avatarUrl?: string;
  roleInUnit?: string; // e.g. سرپرستار، کارشناس مسئول، پرستار بالینی، بهیار
  email?: string;
  phone?: string;
  isActive: boolean;
}

export interface OrganizationalUnit {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
  description?: string;
  managerName?: string;
  staffCount: number;
  order: number;
  isActive: boolean;
  surveyCount?: number;
  responseCount?: number;
  imageUrl?: string;
  staffMembers?: StaffMember[];
}

export type SurveyEvaluationTargetMode =
  | 'general' // General unit / organization feedback
  | 'staff_evaluation' // Evaluate a specific individual in selected unit
  | 'both'; // Can evaluate unit and optionally or mandatorily a staff member

export type SurveyQuestionType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multi_choice'
  | 'yes_no'
  | 'likert'
  | 'rating_5'
  | 'rating_10'
  | 'star_rating'
  | 'matrix'
  | 'dropdown'
  | 'date'
  | 'number'
  | 'ranking'
  | 'image_choice'
  | 'file_upload'
  | 'nps'
  | 'info_block';

export interface SurveyQuestionOption {
  id: string;
  label: string;
  value: string;
  score?: number; // Score mapping for calculating satisfaction
  imageUrl?: string;
}

export interface SurveyMatrixRow {
  id: string;
  label: string;
}

export type ConditionalOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty';

export type ConditionalAction =
  | 'show'
  | 'hide'
  | 'require'
  | 'jump_to_question'
  | 'jump_to_section'
  | 'end_survey';

export interface SurveyConditionalRule {
  id: string;
  triggerQuestionId: string;
  operator: ConditionalOperator;
  value: any;
  action: ConditionalAction; // THEN action
  targetQuestionId?: string;
  targetSectionId?: string;
  elseAction?: ConditionalAction | 'none'; // ELSE action
  elseTargetQuestionId?: string;
  elseTargetSectionId?: string;
}

export interface SurveyQuestion {
  id: string;
  sectionId: string; // Belongs to a TopicSection
  type: SurveyQuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  placeholder?: string;
  options?: SurveyQuestionOption[];
  matrixRows?: SurveyMatrixRow[];
  matrixColumns?: SurveyQuestionOption[];
  min?: number;
  max?: number;
  npsLabels?: { low: string; high: string };
  rules?: SurveyConditionalRule[];
  isStaffSpecific?: boolean; // If true, questions apply specifically to selected staff member
  targetStaffId?: string; // Optional: can be bound to a specific staff member or 'any_selected'
}

export interface SurveyTopicSection {
  id: string;
  surveyId: string;
  title: string;
  description?: string;
  order: number;
  weight?: number; // Weight in overall calculation (default 1)
}

export type SurveyAllocationMode =
  | 'independent' // Dedicated survey for each branch
  | 'shared_segmented' // Shared survey, response segmented by unit
  | 'respondent_selection'; // Public/staff selects unit before answering

export type SurveyAnonymityMode =
  | 'identified' // Full identity recorded
  | 'confidential' // Identity recorded but hidden from standard unit managers
  | 'anonymous'; // True anonymity, decoupled identity

export type SurveyTargetAudience =
  | 'all_staff'
  | 'unit_staff'
  | 'specific_groups'
  | 'invited_only'
  | 'public';

export interface SurveyPeriod {
  id: string;
  surveyId: string;
  name: string; // e.g. بهار ۱۴۰۵, تابستان ۱۴۰۵, پاییز ۱۴۰۵
  code: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isClosed: boolean;
  responseCount?: number;
  avgScore?: number;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  code: string;
  slug: string;
  version: number;
  status: 'draft' | 'active' | 'paused' | 'archived';
  allocationMode: SurveyAllocationMode;
  evaluationTargetMode?: SurveyEvaluationTargetMode; // 'general' | 'staff_evaluation' | 'both'
  assignedUnitIds: string[];
  anonymityMode: SurveyAnonymityMode;
  minAnonymousGroupSize: number; // e.g. 3 or 5 for privacy protection
  targetAudience: SurveyTargetAudience;
  currentPeriodId?: string;
  periods: SurveyPeriod[];
  sections: SurveyTopicSection[];
  questions: SurveyQuestion[];
  createdAt: string;
  updatedAt: string;
  responseCount: number;
  avgScore?: number;
  npsScore?: number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  surveyTitle: string;
  periodId?: string;
  periodName?: string;
  unitId: string;
  unitName: string;
  evaluatedStaff?: {
    id: string;
    fullName: string;
    personnelCode?: string;
    jobTitle?: string;
  };
  trackingCode: string;
  anonymityMode: SurveyAnonymityMode;
  respondent?: {
    personnelCode?: string;
    fullName?: string;
    jobTitle?: string;
  };
  answers: Record<string, any>; // questionId -> answer value
  topicScores?: Record<string, number>; // sectionId -> score out of 100
  overallScore?: number; // 0 to 100 percentage
  overallRating5?: number; // 1 to 5 scale
  submittedAt: string;
  submittedAtTimestamp: number;
}

export interface UnitAnalyticsSummary {
  unitId: string;
  unitName: string;
  staffCount: number;
  responseCount: number;
  participationRate: number; // percentage
  avgSatisfactionScore5: number; // 1 to 5
  avgScorePercent: number; // 0 to 100
  topicScores: Record<string, number>;
}

export interface TopicAnalyticsSummary {
  sectionId: string;
  title: string;
  questionCount: number;
  avgScorePercent: number;
  avgRating5: number;
  satisfactionStatus: 'excellent' | 'good' | 'moderate' | 'needs_improvement';
}

export interface SurveyAnalyticsData {
  survey: Survey;
  totalResponses: number;
  totalInvited: number;
  overallParticipationRate: number;
  overallAvgScore5: number;
  overallScorePercent: number;
  npsScore: number;
  unitSummaries: UnitAnalyticsSummary[];
  topicSummaries: TopicAnalyticsSummary[];
  trendHistory: { periodName: string; date: string; score5: number; responses: number }[];
}
