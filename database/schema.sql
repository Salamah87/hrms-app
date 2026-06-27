-- =============================================================
-- PulseHR Database Schema
-- Org Chart & Leave Management Modules
-- PostgreSQL 15+
-- =============================================================

-- 1. COMPANIES (multi-tenant)
CREATE TABLE companies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  code          VARCHAR(50) UNIQUE NOT NULL,
  locale        VARCHAR(10) DEFAULT 'en',
  timezone      VARCHAR(50) DEFAULT 'UTC',
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. DEPARTMENTS (nested hierarchy)
CREATE TABLE departments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  parent_id     UUID REFERENCES departments(id) ON DELETE SET NULL,
  name          VARCHAR(255) NOT NULL,
  name_ar       VARCHAR(255),
  code          VARCHAR(50) NOT NULL,
  manager_id    UUID,  -- FK to employees, added after employees table
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 3. JOB TITLES
CREATE TABLE job_titles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  title_ar      VARCHAR(255),
  grade         VARCHAR(20),
  min_salary    DECIMAL(12,2),
  max_salary    DECIMAL(12,2),
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 4. EMPLOYEES (core node)
CREATE TABLE employees (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  department_id   UUID REFERENCES departments(id) ON DELETE SET NULL,
  job_title_id    UUID REFERENCES job_titles(id) ON DELETE SET NULL,
  manager_id      UUID REFERENCES employees(id) ON DELETE SET NULL,
  employee_number VARCHAR(50) UNIQUE NOT NULL,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  full_name       VARCHAR(201) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  email           VARCHAR(255) UNIQUE NOT NULL,
  phone           VARCHAR(50),
  avatar_url      VARCHAR(500),
  location        VARCHAR(255),
  employment_type VARCHAR(50) DEFAULT 'full_time',
  status          VARCHAR(50) DEFAULT 'active',
  joining_date    DATE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 5. DOTTED LINE REPORTS (matrix reporting)
CREATE TABLE dotted_line_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  dotted_to_id    UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  relationship   VARCHAR(100),
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, dotted_to_id)
);

-- 6. LEAVE TYPES (HR-configurable policies)
CREATE TABLE leave_types (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name              VARCHAR(255) NOT NULL,
  code              VARCHAR(50) NOT NULL,
  is_paid           BOOLEAN DEFAULT true,
  max_days_per_year INTEGER NOT NULL,
  max_consecutive   INTEGER,
  requires_document BOOLEAN DEFAULT false,
  gender_restricted VARCHAR(20),  -- 'male', 'female', null
  accrual_rate      DECIMAL(5,4),  -- per month fraction
  carry_over_limit  INTEGER DEFAULT 0,
  is_encashable     BOOLEAN DEFAULT false,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, code)
);

-- 7. PUBLIC HOLIDAYS
CREATE TABLE public_holidays (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  date          DATE NOT NULL,
  country       VARCHAR(10),  -- ISO country code
  is_recurring  BOOLEAN DEFAULT false,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, date, country)
);

-- 8. LEAVE BALANCES (per employee/type/year)
CREATE TABLE leave_balances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id   UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  year            INTEGER NOT NULL,
  entitled_days   DECIMAL(8,2) NOT NULL DEFAULT 0,
  used_days       DECIMAL(8,2) NOT NULL DEFAULT 0,
  pending_days    DECIMAL(8,2) NOT NULL DEFAULT 0,
  carried_over    DECIMAL(8,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- 9. LEAVE REQUESTS
CREATE TABLE leave_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id   UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  total_days      DECIMAL(6,2) NOT NULL,
  half_day        BOOLEAN DEFAULT false,
  reason          TEXT,
  attachment_url  VARCHAR(500),
  status          VARCHAR(20) DEFAULT 'pending',
                    CHECK (status IN ('pending','approved','rejected','cancelled')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 10. APPROVAL CHAIN CONFIGS (multi-level rules)
CREATE TABLE approval_chain_configs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  leave_type_id   UUID REFERENCES leave_types(id) ON DELETE CASCADE,
  min_days        INTEGER DEFAULT 1,
  max_days        INTEGER,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 11. APPROVAL STEPS (per-request approval instances)
CREATE TABLE approval_steps (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id        UUID NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
  approver_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  chain_config_id   UUID REFERENCES approval_chain_configs(id),
  level             INTEGER NOT NULL,
  status            VARCHAR(20) DEFAULT 'pending',
                      CHECK (status IN ('pending','approved','rejected','skipped')),
  comment           TEXT,
  actioned_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 12. BLACKOUT DATES (no-leave periods)
CREATE TABLE blackout_dates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  reason        TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 13. LEAVE AUDIT LOG (immutable history)
CREATE TABLE leave_audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id    UUID REFERENCES leave_requests(id) ON DELETE SET NULL,
  employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  action        VARCHAR(50) NOT NULL,
                CHECK (action IN (
                  'submitted','approved','rejected','cancelled',
                  'modified','deleted','auto_approved','escalated',
                  'notified','balance_adjusted','override'
                )),
  old_value     JSONB,
  new_value     JSONB,
  performed_by  UUID REFERENCES employees(id) ON DELETE SET NULL,
  ip_address    INET,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 14. NOTIFICATIONS (in-app alerts)
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  body          TEXT,
  type          VARCHAR(50) DEFAULT 'info',
  is_read       BOOLEAN DEFAULT false,
  link          VARCHAR(500),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- VIEWS
-- =============================================================

CREATE VIEW leave_balance_summary AS
SELECT
  lb.employee_id,
  lb.leave_type_id,
  lb.year,
  lb.entitled_days,
  lb.used_days,
  lb.pending_days,
  lb.carried_over,
  (lb.entitled_days + lb.carried_over - lb.used_days - lb.pending_days) AS available_days
FROM leave_balances lb;

-- =============================================================
-- FOREIGN KEY FIXES (circular refs resolved)
-- =============================================================

ALTER TABLE departments
  ADD CONSTRAINT fk_dept_manager
  FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;

-- =============================================================
-- INDEXES
-- =============================================================

-- Org tree traversal
CREATE INDEX idx_employees_manager_id ON employees(manager_id);
CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_departments_parent_id ON departments(parent_id);
CREATE INDEX idx_departments_company_id ON departments(company_id);
CREATE INDEX idx_dotted_line_reports_employee ON dotted_line_reports(employee_id);
CREATE INDEX idx_dotted_line_reports_dotted_to ON dotted_line_reports(dotted_to_id);

-- Leave queries
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_balances_employee_year ON leave_balances(employee_id, year);
CREATE INDEX idx_approval_steps_request ON approval_steps(request_id);
CREATE INDEX idx_approval_steps_approver ON approval_steps(approver_id);
CREATE INDEX idx_leave_audit_log_request ON leave_audit_log(request_id);
CREATE INDEX idx_notifications_employee ON notifications(employee_id);
CREATE INDEX idx_blackout_dates_company ON blackout_dates(company_id);

-- =============================================================
-- AUTO-UPDATE TRIGGERS
-- =============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'companies', 'departments', 'job_titles', 'employees',
    'leave_types', 'leave_balances', 'leave_requests',
    'approval_chain_configs', 'approval_steps',
    'jobs', 'applications', 'offers'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()',
      tbl
    );
  END LOOP;
END;
$$;

-- =============================================================
-- SEED DATA (sample leave types)
-- =============================================================

-- INSERT INTO leave_types (company_id, name, code, is_paid, max_days_per_year, max_consecutive, carry_over_limit, is_encashable)
-- VALUES
--   ('<company_uuid>', 'Annual Leave',     'annual',    true,  30, 30, 10, true),
--   ('<company_uuid>', 'Sick Leave',       'sick',      true,  14, 14,  0, false),
--   ('<company_uuid>', 'Personal Leave',   'personal',  true,   5,  5,  0, false),
--   ('<company_uuid>', 'Emergency Leave',  'emergency', true,   3,  3,  0, false),
--   ('<company_uuid>', 'Maternity Leave',  'maternity', true,  90, 90,  0, false),
--   ('<company_uuid>', 'Paternity Leave',  'paternity', true,   3,  3,  0, false),
--   ('<company_uuid>', 'Hajj Leave',       'hajj',      true,  15, 15,  0, false),
--   ('<company_uuid>', 'Unpaid Leave',     'unpaid',    false, 30, 30,  0, false);

-- =============================================================
-- RECRUITMENT & ATS MODULE
-- =============================================================

-- 15. JOBS
CREATE TABLE jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  department_id   UUID REFERENCES departments(id) ON DELETE SET NULL,
  title           VARCHAR(255) NOT NULL,
  location        VARCHAR(255),
  type            VARCHAR(50) NOT NULL DEFAULT 'full_time',
                    CHECK (type IN ('full_time','part_time','contract','internship')),
  description     TEXT,
  requirements    TEXT,
  salary_min      DECIMAL(12,2),
  salary_max      DECIMAL(12,2),
  status          VARCHAR(50) NOT NULL DEFAULT 'draft',
                    CHECK (status IN ('draft','open','closed','on_hold')),
  posted_by       UUID REFERENCES employees(id) ON DELETE SET NULL,
  published_at    TIMESTAMPTZ,
  closes_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 16. CANDIDATES
CREATE TABLE candidates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(30),
  linkedin_url    VARCHAR(500),
  avatar_url      VARCHAR(500),
  current_title   VARCHAR(255),
  current_company VARCHAR(255),
  location        VARCHAR(255),
  tags            TEXT[],
  source          VARCHAR(100),
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, email)
);

-- 17. PIPELINE STAGES
CREATE TABLE pipeline_stages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id          UUID REFERENCES jobs(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  stage_order     INTEGER NOT NULL,
  auto_advance    BOOLEAN DEFAULT false,
  disqualify_on_fail BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 18. APPLICATIONS
CREATE TABLE applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id    UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  source          VARCHAR(100),
  stage_id        UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  status          VARCHAR(50) NOT NULL DEFAULT 'active',
                    CHECK (status IN ('active','hired','rejected','withdrawn')),
  ai_score        SMALLINT,
  ai_summary      TEXT,
  resume_url      VARCHAR(500),
  cover_letter    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, candidate_id)
);

-- 19. INTERVIEWS
CREATE TABLE interviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  stage_id        UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  interviewer_ids UUID[],
  scheduled_at    TIMESTAMPTZ,
  duration_mins   INTEGER DEFAULT 60,
  type            VARCHAR(50) DEFAULT 'video',
                    CHECK (type IN ('phone','video','onsite','technical')),
  location_link   VARCHAR(500),
  status          VARCHAR(50) DEFAULT 'scheduled',
                    CHECK (status IN ('scheduled','completed','cancelled','rescheduled')),
  feedback        TEXT,
  rating          SMALLINT CHECK (rating BETWEEN 1 AND 5),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 20. OFFERS
CREATE TABLE offers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  salary          DECIMAL(12,2),
  currency        CHAR(3) DEFAULT 'USD',
  start_date      DATE,
  contract_type   VARCHAR(50),
  benefits        TEXT,
  status          VARCHAR(50) NOT NULL DEFAULT 'draft',
                    CHECK (status IN ('draft','sent','accepted','rejected','expired')),
  offer_letter_url VARCHAR(500),
  sent_at         TIMESTAMPTZ,
  responded_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- RECRUITMENT INDEXES
-- =============================================================

CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_department ON jobs(department_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_published_at ON jobs(published_at);

CREATE INDEX idx_candidates_company ON candidates(company_id);
CREATE INDEX idx_candidates_email ON candidates(email);

CREATE INDEX idx_pipeline_stages_company ON pipeline_stages(company_id);
CREATE INDEX idx_pipeline_stages_job ON pipeline_stages(job_id);
CREATE INDEX idx_pipeline_stages_order ON pipeline_stages(job_id, stage_order);

CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_stage ON applications(stage_id);
CREATE INDEX idx_applications_status ON applications(status);

CREATE INDEX idx_interviews_application ON interviews(application_id);
CREATE INDEX idx_interviews_scheduled ON interviews(scheduled_at);

CREATE INDEX idx_offers_application ON offers(application_id);
CREATE INDEX idx_offers_status ON offers(status);

-- =============================================================
-- RECRUITMENT DEFAULT STAGES (seed per company)
-- =============================================================

-- Default pipeline stages are inserted per-company via the application
-- when the first job is created. Stages: Applied, AI Screening, CV Review,
-- Phone Screen, Technical Interview, Final Interview, Reference Check,
-- Offer Sent, Hired / Rejected.

-- =============================================================
-- GENERIC JSONB COLLECTIONS STORE
-- Acts as a PostgreSQL-backed replacement for JSON file stores.
-- Each row stores one named collection as JSONB.
-- =============================================================
CREATE TABLE IF NOT EXISTS collections (
  name        TEXT PRIMARY KEY,
  data        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION upsert_collection(p_name TEXT, p_data JSONB)
RETURNS VOID AS $$
BEGIN
  INSERT INTO collections (name, data, updated_at)
  VALUES (p_name, p_data, now())
  ON CONFLICT (name)
  DO UPDATE SET data = p_data, updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- =============================================================
-- 21. SALARY COMPONENTS
-- =============================================================
CREATE TABLE salary_components (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(255) NOT NULL,
  type              VARCHAR(20) NOT NULL CHECK (type IN ('earning','deduction')),
  calculation_type  VARCHAR(20) NOT NULL CHECK (calculation_type IN ('fixed','percentage')),
  value             DECIMAL(12,2) NOT NULL,
  is_taxable        BOOLEAN DEFAULT false,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- 22. PERFORMANCE CYCLES
-- =============================================================
CREATE TABLE performance_cycles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  type          VARCHAR(50) NOT NULL CHECK (type IN ('quarterly','semi_annual','annual')),
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','closed')),
  review_style  VARCHAR(50) NOT NULL CHECK (review_style IN ('manager_only','360','okr','all')),
  created_by    UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- 23. GOALS & OKRs
-- =============================================================
CREATE TABLE goals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  cycle_id      UUID NOT NULL REFERENCES performance_cycles(id) ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  type          VARCHAR(20) NOT NULL CHECK (type IN ('objective','key_result')),
  parent_id     UUID REFERENCES goals(id) ON DELETE CASCADE,
  target_value  DECIMAL(12,2),
  current_value DECIMAL(12,2) DEFAULT 0,
  unit          VARCHAR(50),
  weight        DECIMAL(5,2) DEFAULT 100,
  status        VARCHAR(20) DEFAULT 'on_track' CHECK (status IN ('on_track','at_risk','behind','completed')),
  due_date      DATE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- 24. KPIs
-- =============================================================
CREATE TABLE kpis (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  cycle_id      UUID NOT NULL REFERENCES performance_cycles(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  target        DECIMAL(12,2) NOT NULL,
  actual        DECIMAL(12,2) DEFAULT 0,
  unit          VARCHAR(50),
  weight        DECIMAL(5,2) DEFAULT 100,
  source        VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual','auto')),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- 25. PERFORMANCE REVIEWS
-- =============================================================
CREATE TABLE performance_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id        UUID NOT NULL REFERENCES performance_cycles(id) ON DELETE CASCADE,
  reviewee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  reviewer_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type            VARCHAR(20) NOT NULL CHECK (type IN ('self','manager','peer','subordinate')),
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','in_progress','submitted','acknowledged')),
  overall_rating  SMALLINT CHECK (overall_rating BETWEEN 1 AND 5),
  submitted_at    TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- 26. REVIEW SECTIONS
-- =============================================================
CREATE TABLE review_sections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id     UUID NOT NULL REFERENCES performance_reviews(id) ON DELETE CASCADE,
  section_name  VARCHAR(255) NOT NULL,
  rating        SMALLINT CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  weight        DECIMAL(5,2) DEFAULT 100,
  section_order INTEGER NOT NULL
);

-- =============================================================
-- 27. CONTINUOUS FEEDBACK
-- =============================================================
CREATE TABLE continuous_feedback (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giver_id      UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  receiver_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  cycle_id      UUID REFERENCES performance_cycles(id) ON DELETE SET NULL,
  type          VARCHAR(20) NOT NULL CHECK (type IN ('praise','constructive','general')),
  content       TEXT NOT NULL,
  is_anonymous  BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- 28. PERFORMANCE IMPROVEMENT PLANS (PIPs)
-- =============================================================
CREATE TABLE pips (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  manager_id        UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  cycle_id          UUID REFERENCES performance_cycles(id) ON DELETE SET NULL,
  reason            TEXT,
  goals_text        TEXT,
  start_date        DATE,
  end_date          DATE,
  check_in_frequency VARCHAR(50),
  status            VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','completed','extended','failed')),
  outcome_notes     TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- 29. PIP CHECK-INS
-- =============================================================
CREATE TABLE pip_check_ins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pip_id        UUID NOT NULL REFERENCES pips(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  notes         TEXT,
  rating        SMALLINT CHECK (rating BETWEEN 1 AND 5),
  created_by    UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- 30. COMPETENCIES
-- =============================================================
CREATE TABLE competencies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  category      VARCHAR(100),
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- 31. COMPETENCY RATINGS
-- =============================================================
CREATE TABLE competency_ratings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id     UUID NOT NULL REFERENCES performance_reviews(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  UNIQUE(review_id, competency_id)
);

-- =============================================================
-- 32. OVERTIME POLICIES
-- =============================================================
CREATE TABLE overtime_policies (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name                  VARCHAR(255) NOT NULL,
  standard_hours_per_day  DECIMAL(5,2) DEFAULT 8,
  standard_hours_per_week DECIMAL(5,2) DEFAULT 40,
  weekday_rate          DECIMAL(5,2) DEFAULT 1.5,
  weekend_rate          DECIMAL(5,2) DEFAULT 2.0,
  holiday_rate          DECIMAL(5,2) DEFAULT 2.5,
  max_hours_per_month   DECIMAL(5,2) DEFAULT 40,
  min_claimable_hours   DECIMAL(5,2) DEFAULT 1,
  max_hours_per_request DECIMAL(5,2) DEFAULT 12,
  past_days_limit       INTEGER DEFAULT 7,
  eligible_grades       TEXT[],
  active                BOOLEAN DEFAULT true,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- 33. OVERTIME REQUESTS
-- =============================================================
CREATE TABLE overtime_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  policy_id         UUID REFERENCES overtime_policies(id) ON DELETE SET NULL,
  date              DATE NOT NULL,
  start_time        TIME NOT NULL,
  end_time          TIME NOT NULL,
  total_hours       DECIMAL(6,2) NOT NULL,
  day_type          VARCHAR(20) NOT NULL CHECK (day_type IN ('weekday','weekend','public_holiday')),
  rate_multiplier   DECIMAL(5,2) NOT NULL,
  hourly_rate       DECIMAL(12,2),
  estimated_amount  DECIMAL(12,2),
  reason            TEXT,
  status            VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  current_level     INTEGER DEFAULT 1,
  approved_by       UUID REFERENCES employees(id) ON DELETE SET NULL,
  approved_at       TIMESTAMPTZ,
  payroll_processed BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- 34. OVERTIME APPROVAL STEPS
-- =============================================================
CREATE TABLE overtime_approval_steps (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id    UUID NOT NULL REFERENCES overtime_requests(id) ON DELETE CASCADE,
  approver_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  level         INTEGER NOT NULL,
  status        VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  comment       TEXT,
  actioned_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- 35. OVERTIME MONTHLY SUMMARIES
-- =============================================================
CREATE TABLE overtime_monthly_summaries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month             INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year              INTEGER NOT NULL,
  total_hours       DECIMAL(8,2) DEFAULT 0,
  weekday_hours     DECIMAL(8,2) DEFAULT 0,
  weekend_hours     DECIMAL(8,2) DEFAULT 0,
  holiday_hours     DECIMAL(8,2) DEFAULT 0,
  total_amount      DECIMAL(12,2) DEFAULT 0,
  currency          VARCHAR(10) DEFAULT 'USD',
  payroll_exported  BOOLEAN DEFAULT false,
  exported_at       TIMESTAMPTZ,
  UNIQUE(employee_id, month, year)
);

-- =============================================================
-- 36. ONBOARDING TASKS
-- =============================================================
CREATE TABLE onboarding_tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  task          VARCHAR(255) NOT NULL,
  category      VARCHAR(50) NOT NULL CHECK (category IN ('document','setup','training','introduction','compliance')),
  assigned_to   VARCHAR(100) NOT NULL,
  due_days      INTEGER NOT NULL,
  is_completed  BOOLEAN DEFAULT false,
  completed_at  TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- PERFORMANCE INDEXES
-- =============================================================
CREATE INDEX idx_performance_cycles_company ON performance_cycles(company_id);
CREATE INDEX idx_goals_employee ON goals(employee_id);
CREATE INDEX idx_goals_cycle ON goals(cycle_id);
CREATE INDEX idx_kpis_employee ON kpis(employee_id);
CREATE INDEX idx_kpis_cycle ON kpis(cycle_id);
CREATE INDEX idx_performance_reviews_cycle ON performance_reviews(cycle_id);
CREATE INDEX idx_performance_reviews_reviewee ON performance_reviews(reviewee_id);
CREATE INDEX idx_performance_reviews_reviewer ON performance_reviews(reviewer_id);
CREATE INDEX idx_review_sections_review ON review_sections(review_id);
CREATE INDEX idx_continuous_feedback_receiver ON continuous_feedback(receiver_id);
CREATE INDEX idx_continuous_feedback_giver ON continuous_feedback(giver_id);
CREATE INDEX idx_pips_employee ON pips(employee_id);
CREATE INDEX idx_pip_check_ins_pip ON pip_check_ins(pip_id);

-- =============================================================
-- OVERTIME INDEXES
-- =============================================================
CREATE INDEX idx_overtime_policies_company ON overtime_policies(company_id);
CREATE INDEX idx_overtime_requests_employee ON overtime_requests(employee_id);
CREATE INDEX idx_overtime_requests_status ON overtime_requests(status);
CREATE INDEX idx_overtime_requests_date ON overtime_requests(date);
CREATE INDEX idx_overtime_approval_steps_request ON overtime_approval_steps(request_id);
CREATE INDEX idx_overtime_approval_steps_approver ON overtime_approval_steps(approver_id);
CREATE INDEX idx_overtime_monthly_summaries_employee ON overtime_monthly_summaries(employee_id);

-- =============================================================
-- ONBOARDING INDEXES
-- =============================================================
CREATE INDEX idx_onboarding_tasks_employee ON onboarding_tasks(employee_id);

-- =============================================================
-- UPDATE AUTO-TRIGGER TABLE LIST
-- =============================================================

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'performance_cycles', 'goals', 'overtime_policies', 'overtime_requests',
    'overtime_approval_steps'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()',
      tbl
    );
  END LOOP;
END;
$$;
