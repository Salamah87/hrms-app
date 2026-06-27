import type { Role } from '@/lib/constants';

export interface User {
  id: string;
  employeeId?: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
}

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  fullNameAr?: string;
  email: string;
  phone?: string;
  mobile?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  nationality?: string;
  nationalId?: string;
  passportNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  avatar?: string;
  departmentId?: string;
  positionId?: string;
  managerId?: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  joiningDate: string;
  contractEndDate?: string;
  salary?: number;
  salaryType?: 'monthly' | 'daily' | 'hourly' | 'weekly';
  housingOverride?: number;
  transportOverride?: number;
  currency?: string;
  bankAccount?: string;
  bankName?: string;
  createdAt: string;
  updatedAt: string;
  department?: Department;
  position?: Position;
  manager?: Employee;
}

export type EmploymentType =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'intern'
  | 'temporary'
  | 'freelance';

export type EmployeeStatus =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'terminated'
  | 'resigned';

export interface Department {
  id: string;
  companyId?: string;
  name: string;
  nameAr?: string;
  code: string;
  description?: string;
  managerId?: string;
  parentId?: string;
  isActive: boolean;
  employeeCount?: number;
  budget?: number;
  createdAt: string;
  updatedAt: string;
  manager?: Employee;
  children?: Department[];
}

export interface Position {
  id: string;
  title: string;
  titleAr?: string;
  code: string;
  departmentId: string;
  description?: string;
  requirements?: string;
  minSalary?: number;
  maxSalary?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  hoursWorked?: number;
  overtimeHours?: number;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
}

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'half_day'
  | 'overtime'
  | 'weekend'
  | 'holiday';

export interface Leave {
  id: string;
  employeeId: string;
  leaveType: LeaveTypeCode;
  status: LeaveStatus;
  startDate: string;
  endDate: string;
  totalDays: number;
  halfDay?: boolean;
  reason?: string;
  attachmentUrl?: string;
  approvedById?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
  approvedBy?: Employee;
}

export type LeaveTypeCode =
  | 'annual'
  | 'sick'
  | 'personal'
  | 'emergency'
  | 'maternity'
  | 'paternity'
  | 'hajj'
  | 'unpaid'
  | 'study';

export type LeaveStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface Grade {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  minSalary: number;
  maxSalary: number;
  description?: string;
  isActive: boolean;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  description?: string;
  budget: number;
  allocated: number;
  managerId?: string;
  isActive: boolean;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  leaveType: LeaveTypeCode;
  leaveTypeId?: string;
  year?: number;
  entitlement: number;
  used: number;
  pending?: number;
  carriedOver?: number;
  remaining: number;
}

export interface Payroll {
  id: string;
  employeeId: string;
  period: string;
  basicSalary: number;
  allowances: PayrollAllowance[];
  deductions: PayrollDeduction[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  status: PayrollStatus;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
}

export interface PayrollAllowance {
  type: string;
  amount: number;
  isTaxable: boolean;
}

export interface PayrollDeduction {
  type: string;
  amount: number;
  isMandatory: boolean;
}

export type PayrollStatus = 'draft' | 'calculated' | 'approved' | 'paid' | 'cancelled';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  labelAr?: string;
  disabled?: boolean;
}

// =============================================================
// Schema-matching types (Org Chart + Leave Management)
// =============================================================

export interface Company {
  id: string;
  name: string;
  code: string;
  locale: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DottedLineReport {
  id: string;
  employeeId: string;
  dottedToId: string;
  relationship?: string;
  isActive: boolean;
  createdAt: string;
  dottedTo?: Employee;
}

export interface PublicHoliday {
  id: string;
  companyId: string;
  name: string;
  date: string;
  country?: string;
  isRecurring: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface ApprovalChainConfig {
  id: string;
  companyId: string;
  name: string;
  leaveTypeId?: string;
  minDays: number;
  maxDays?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  leaveType?: LeaveType;
}

export interface ApprovalStep {
  id: string;
  requestId: string;
  approverId: string;
  chainConfigId?: string;
  level: number;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comment?: string;
  actionedAt?: string;
  createdAt: string;
  approver?: Employee;
}

export interface BlackoutDate {
  id: string;
  companyId: string;
  departmentId?: string;
  name: string;
  startDate: string;
  endDate: string;
  reason?: string;
  isActive: boolean;
  createdAt: string;
}

export interface LeaveAuditLog {
  id: string;
  requestId?: string;
  employeeId: string;
  action: 'submitted' | 'approved' | 'rejected' | 'cancelled' | 'modified' | 'deleted' | 'auto_approved' | 'escalated' | 'notified' | 'balance_adjusted' | 'override';
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  performedBy?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  employeeId: string;
  title: string;
  body?: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface LeaveBalanceSummary {
  employeeId: string;
  leaveTypeId: string;
  year: number;
  entitledDays: number;
  usedDays: number;
  pendingDays: number;
  carriedOver: number;
  availableDays: number;
}

// =============================================================
// Recruitment / ATS Types
// =============================================================

export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship';
export type JobStatus = 'draft' | 'open' | 'closed' | 'on_hold';
export type ApplicationStatus = 'active' | 'hired' | 'rejected' | 'withdrawn';
export type InterviewType = 'phone' | 'video' | 'onsite' | 'technical';
export type OfferStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface Job {
  id: string;
  companyId: string;
  departmentId?: string;
  title: string;
  location?: string;
  type: JobType;
  description?: string;
  requirements?: string;
  salaryMin?: number;
  salaryMax?: number;
  status: JobStatus;
  postedBy?: string;
  publishedAt?: string;
  closesAt?: string;
  createdAt: string;
  updatedAt: string;
  department?: Department;
  postedByEmployee?: Employee;
  applicationCount?: number;
  pipelineStages?: PipelineStage[];
}

export interface Candidate {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  avatarUrl?: string;
  currentTitle?: string;
  currentCompany?: string;
  location?: string;
  tags?: string[];
  source?: string;
  createdAt: string;
}

export interface PipelineStage {
  id: string;
  companyId: string;
  jobId?: string;
  name: string;
  stageOrder: number;
  autoAdvance?: boolean;
  disqualifyOnFail?: boolean;
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  source?: string;
  stageId?: string;
  status: ApplicationStatus;
  aiScore?: number;
  aiSummary?: string;
  resumeUrl?: string;
  coverLetter?: string;
  createdAt: string;
  updatedAt: string;
  candidate?: Candidate;
  job?: Job;
  stage?: PipelineStage;
  interviews?: Interview[];
  offer?: Offer;
}

export interface Interview {
  id: string;
  applicationId: string;
  stageId?: string;
  interviewerIds?: string[];
  scheduledAt?: string;
  durationMins?: number;
  type: InterviewType;
  locationLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  feedback?: string;
  rating?: number;
  createdAt: string;
  stage?: PipelineStage;
  interviewers?: Employee[];
}

export interface Offer {
  id: string;
  applicationId: string;
  salary?: number;
  currency?: string;
  startDate?: string;
  contractType?: string;
  benefits?: string;
  status: OfferStatus;
  offerLetterUrl?: string;
  sentAt?: string;
  respondedAt?: string;
  createdAt: string;
  application?: Application;
}

// ============ Performance Management ============

export type PerformanceCycleStatus = 'draft' | 'active' | 'closed';
export type PerformanceCycleType = 'quarterly' | 'semi_annual' | 'annual';
export type GoalStatus = 'on_track' | 'at_risk' | 'behind' | 'completed';
export type ReviewStyle = 'manager_only' | '360' | 'okr' | 'all';

export interface PerformanceCycle {
  id: string;
  companyId: string;
  name: string;
  type: PerformanceCycleType;
  startDate: string;
  endDate: string;
  status: PerformanceCycleStatus;
  reviewStyle: ReviewStyle;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type GoalType = 'objective' | 'key_result';

export interface Goal {
  id: string;
  employeeId: string;
  cycleId: string;
  title: string;
  description?: string;
  type: GoalType;
  parentId?: string;
  targetValue?: number;
  currentValue: number;
  unit?: string;
  weight: number;
  status: GoalStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  children?: Goal[];
}

export interface KPI {
  id: string;
  employeeId: string;
  cycleId: string;
  name: string;
  target: number;
  actual: number;
  unit?: string;
  weight: number;
  source: 'manual' | 'auto';
  updatedAt: string;
}

export type ReviewType = 'self' | 'manager' | 'peer' | 'subordinate';
export type ReviewStatus = 'pending' | 'in_progress' | 'submitted' | 'acknowledged';

export interface PerformanceReview {
  id: string;
  cycleId: string;
  revieweeId: string;
  reviewerId: string;
  type: ReviewType;
  status: ReviewStatus;
  overallRating?: number;
  submittedAt?: string;
  acknowledgedAt?: string;
  createdAt: string;
  sections?: ReviewSection[];
  reviewee?: Employee;
  reviewer?: Employee;
}

export interface ReviewSection {
  id: string;
  reviewId: string;
  sectionName: string;
  rating?: number;
  comment?: string;
  weight: number;
  sectionOrder: number;
}

export type FeedbackType = 'praise' | 'constructive' | 'general';

export interface Feedback {
  id: string;
  giverId: string;
  receiverId: string;
  cycleId?: string;
  type: FeedbackType;
  content: string;
  isAnonymous: boolean;
  giverName?: string;
  createdAt: string;
}

export type PIPStatus = 'active' | 'completed' | 'extended' | 'failed';

export interface PIP {
  id: string;
  employeeId: string;
  managerId: string;
  cycleId?: string;
  reason?: string;
  goalsText?: string;
  startDate?: string;
  endDate?: string;
  checkInFrequency?: string;
  status: PIPStatus;
  outcomeNotes?: string;
  createdAt: string;
  checkIns?: PIPCheckIn[];
}

export interface PIPCheckIn {
  id: string;
  pipId: string;
  date: string;
  notes?: string;
  rating?: number;
  createdBy?: string;
  createdAt: string;
}

export interface Competency {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CompetencyRating {
  id: string;
  reviewId: string;
  competencyId: string;
  rating: number;
  comment?: string;
  competency?: Competency;
}

// ============ Overtime Management ============

export type OvertimeStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type OvertimeDayType = 'weekday' | 'weekend' | 'public_holiday';

export interface OvertimePolicy {
  id: string;
  companyId: string;
  name: string;
  standardHoursPerDay: number;
  standardHoursPerWeek: number;
  weekdayRate: number;
  weekendRate: number;
  holidayRate: number;
  maxHoursPerMonth: number;
  minClaimableHours: number;
  maxHoursPerRequest: number;
  pastDaysLimit: number;
  eligibleGrades?: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  policyId?: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  dayType: OvertimeDayType;
  rateMultiplier: number;
  hourlyRate?: number;
  estimatedAmount?: number;
  reason?: string;
  status: OvertimeStatus;
  currentLevel: number;
  approvedBy?: string;
  approvedAt?: string;
  payrollProcessed: boolean;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
  approvalSteps?: OvertimeApprovalStep[];
}

export interface OvertimeApprovalStep {
  id: string;
  requestId: string;
  approverId: string;
  level: number;
  status: ApprovalStatus;
  comment?: string;
  actionedAt?: string;
  createdAt: string;
  approver?: Employee;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface OvertimeMonthlySummary {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  totalHours: number;
  weekdayHours: number;
  weekendHours: number;
  holidayHours: number;
  totalAmount: number;
  currency: string;
  payrollExported: boolean;
  exportedAt?: string;
  employee?: Employee;
}
