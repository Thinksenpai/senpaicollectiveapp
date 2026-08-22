// Engine types — cohorts, pods, Senpai ID, enrichment, tasks, activity.
// Mirror the Go models in pkg/models (cohort.go, task.go, enrichment.go, activity.go).

import type { Member } from './index'

export type CohortStatus = 'forming' | 'active' | 'closed'
export type MembershipState = 'accepted' | 'inducted' | 'active' | 'withdrawn'

export interface Cohort {
  id: string
  name: string
  slug: string
  sequence: number
  status: CohortStatus
  induction_date?: string | null
  description?: string | null
  created_at: string
  updated_at: string
  member_count?: number
  pod_count?: number
  pods?: Pod[]
}

export interface Pod {
  id: string
  cohort_id: string
  name: string
  description?: string | null
  region?: string | null
  whatsapp_invite_url?: string | null
  capacity: number
  member_count?: number
}

export interface CohortMembership {
  id: string
  cohort_id: string
  member_id: string
  pod_id?: string | null
  state: MembershipState
  accepted_at: string
  inducted_at?: string | null
  cohort?: Cohort
  pod?: Pod
  member?: Member
}

export interface SenpaiID {
  member_id: string
  handle?: string | null
  offered_options: string[]
  assigned_at?: string | null
  revealed_at?: string | null
}

export type TaskKind = 'reflection' | 'portfolio' | 'build' | 'publish' | 'research' | 'custom'
export type TaskTrack = 'induction' | 'personal_dev' | 'building'
export type HandinType = 'none' | 'link' | 'text' | 'file' | 'external_form' | 'structured_form'
export type AssignmentStatus = 'assigned' | 'in_progress' | 'submitted' | 'completed' | 'returned'
export type TaskAudience = 'open' | 'verified' | 'restricted'

export interface Task {
  id: string
  title: string
  slug: string
  description: string
  kind: TaskKind
  track: TaskTrack // deprecated: programs + kind replaced it
  handin_type: HandinType
  external_url?: string | null
  cohort_id?: string | null
  program_id?: string | null
  project_id?: string | null
  is_required: boolean
  show_submissions: boolean
  order_index: number
  available_at?: string | null
  due_at?: string | null
  status: 'draft' | 'published' | 'archived'
  // Role/claiming layer
  skill_id?: number | null
  reviewer_id?: string | null
  audience: TaskAudience
  claimable: boolean
  claim_cap?: number | null
  circle?: string | null // slug; kept in sync with circle_id server-side
  circle_id?: string | null
  job_role_id?: number | null
  skill_name?: string | null
  creator_name?: string | null
  reviewer_name?: string | null
  assignment_count?: number
  completed_count?: number
  claim_count?: number // self-claimed only — what claim_cap governs
  assigned_to?: string[]
}

export interface TaskAssignment {
  id: string
  task_id: string
  member_id: string
  assigned_via: 'individual' | 'pod' | 'cohort' | 'global' | 'claim'
  status: AssignmentStatus
  link_url?: string | null
  body?: string | null
  file_url?: string | null
  submitted_at?: string | null
  completed_at?: string | null
  review_note?: string | null
  task?: Task
  member?: Member
}

// One attempt at a task. The assignment carries the latest inline; this is the
// trail behind it, so returning work no longer erases what was returned.
export interface TaskSubmission {
  id: string
  assignment_id: string
  attempt: number
  link_url?: string | null
  body?: string | null
  file_url?: string | null
  submitted_at: string
  outcome?: 'completed' | 'returned' | null // null while still in review
  review_note?: string | null
  reviewed_by?: string | null
  reviewed_at?: string | null
  reviewer_name?: string | null
}

export interface TaskComment {
  id: string
  task_id: string
  member_id: string
  body: string
  created_at: string
  member?: Member
}

export interface AssignmentComment {
  id: string
  assignment_id: string
  member_id: string
  body: string
  created_at: string
  member?: Member
}

export type WorkStatus = 'student' | 'employed' | 'freelance' | 'founder' | 'between_roles' | 'other'
export type SchoolStatus = 'not_student' | 'undergrad' | 'postgrad' | 'bootcamp' | 'graduated'

export interface MemberEnrichment {
  member_id: string
  goal?: string | null
  timezone?: string | null
  date_of_birth?: string | null
  country?: string | null
  work_status?: WorkStatus | null
  school_status?: SchoolStatus | null
  school_name?: string | null
  mbti?: string | null
  job_title?: string | null
  organization?: string | null
  social_links?: Record<string, string> | null
  weekly_commitment_hours?: number | null
  gender?: string | null
  languages?: string | null
  completed_at?: string | null
}

export interface EnrichmentPayload {
  goal?: string
  timezone?: string
  date_of_birth?: string
  country?: string
  work_status?: WorkStatus
  school_status?: SchoolStatus
  school_name?: string
  mbti?: string
  job_title?: string
  organization?: string
  social_links?: Record<string, string>
  weekly_commitment_hours?: number
  gender?: string
  languages?: string
}

export interface MemberDashboard {
  guidelines_accepted: boolean
  pledge_accepted: boolean
  membership?: CohortMembership | null
  cohort?: Cohort | null
  pod?: Pod | null
  senpai_id?: SenpaiID | null
  tasks: TaskAssignment[]
  enrichment_complete: boolean
}

export interface MemberEngineStatus {
  member_id: string
  cohort_name: string
  pod_name?: string | null
  state: string
  last_active_at?: string | null
}

export interface Activity {
  id: string
  member_id: string
  verb: string
  target_type?: string | null
  target_id?: string | null
  metadata?: Record<string, unknown> | null
  source: 'system' | 'manual'
  created_at: string
  member?: Member
}

export interface SubmitTaskPayload {
  link_url?: string
  body?: string
  file_url?: string
}

// ---- Admin payloads ----

export interface CreateCohortPayload {
  name: string
  slug?: string // auto-derived from name if omitted
  sequence?: number // auto-incremented if omitted
  description?: string
  induction_date?: string
}

export interface UpdateCohortPayload {
  name: string
  slug: string
  sequence: number
  status: CohortStatus
  description?: string
  induction_date?: string
}

export interface CreatePodPayload {
  name: string
  description?: string
  region?: string
  whatsapp_invite_url?: string
  capacity?: number
}

export interface CreateTaskPayload {
  title: string
  slug: string
  description: string
  kind: TaskKind
  track: TaskTrack
  handin_type: HandinType
  external_url?: string
  cohort_id?: string
  program_id?: string
  project_id?: string
  is_required: boolean
  show_submissions: boolean
  order_index?: number
  available_at?: string
  due_at?: string
  status: 'draft' | 'published' | 'archived'
  // Role/claiming layer
  skill_id?: number
  reviewer_id?: string
  audience?: TaskAudience
  claimable?: boolean
  claim_cap?: number
  circle?: string
}

// ============ Programs & Projects (blueprint v3) ============

// A program is an ordered task series for a cohort with a completion state.
// Induction is the first: finishing its required tasks matriculates you.
export interface Program {
  id: string
  cohort_id?: string | null // null = global/cross-cohort (a circle track)
  circle?: string | null // "content" / "product" / "growth", set for circle tracks
  name: string
  kind: 'induction' | 'series'
  description?: string | null
  created_at: string
}

export interface CreateCircleTrackPayload {
  name: string
  circle: string
  description?: string
}

export type ProjectStatus = 'proposed' | 'active' | 'shipped' | 'parked'

// The builder primitive: a problem statement + a small team + linked tasks +
// an outcome. Members propose, an admin approves, open join up to team_cap.
export interface Project {
  id: string
  title: string
  problem_statement: string
  status: ProjectStatus
  team_cap: number
  outcome_url?: string | null
  created_by: string
  approved_at?: string | null
  shipped_at?: string | null
  created_at: string
  team?: ProjectMember[]
  team_count: number
  creator?: Member
}

export interface ProjectMember {
  id: string
  project_id: string
  member_id: string
  skill_id?: number | null
  job_role_id?: number | null // the seat's role (blueprint v4) — the tag reviews are scored against
  joined_at: string
  member?: Member
}

export interface ProposeProjectPayload {
  title: string
  problem_statement: string
  team_cap: number
}

// A teammate creating work inside their project. Empty assignee_ids = whole team.
export interface CreateProjectTaskPayload {
  title: string
  description: string
  kind: TaskKind
  handin_type: HandinType
  due_at?: string
  assignee_ids?: string[]
}

export interface AssignTaskPayload {
  target_type: 'individual' | 'pod' | 'cohort' | 'global'
  target_id?: string
}

// ============ Review system (blueprint v4) ============
// The unit of reputation is the skill, not the role. Mirrors pkg/models/review.go.

export type MemberSkillStatus = 'claimed' | 'nominated' | 'verified' | 'dormant'

export interface MemberSkill {
  member_id: string
  skill_id: number
  is_primary: boolean
  status: MemberSkillStatus
  verified_at?: string | null
  verified_by?: string | null
  skill_name?: string | null
}

// A job role is an admin-curated title — a named recipe of skills, earned
// through reviewed work, never self-assigned.
export interface JobRole {
  id: number
  name: string
  description?: string | null
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
  skills?: JobRoleSkill[]
}

export interface JobRoleSkill {
  job_role_id: number
  skill_id: number
  required: boolean
  skill_name?: string | null
}

export interface CreateJobRolePayload {
  name: string
  description?: string
  skills: JobRoleSkillInput[]
}

export interface JobRoleSkillInput {
  skill_id: number
  required: boolean
}

export type ReviewSourceType = 'task' | 'project'
export type SoftDimension = 'collaboration' | 'communication' | 'reliability'
export const ALL_SOFT_DIMENSIONS: SoftDimension[] = ['collaboration', 'communication', 'reliability']

// One person's judgment of another's work on one work unit — the envelope;
// the actual scores live in skill_scores and soft_scores.
export interface Review {
  id: string
  source_type: ReviewSourceType
  source_id: string
  ratee_id: string
  rater_id: string
  job_role_id?: number | null
  weight: number
  comment?: string | null
  created_at: string
  skill_scores?: ReviewSkillScore[]
  soft_scores?: ReviewSoftScore[]
  rater_name?: string | null
  ratee_name?: string | null
  job_role_name?: string | null
  work_title?: string | null // the project or task title this review was scored against
  work_url?: string | null // frontend path to the actual work — /projects/{id} or /tasks/{id}
}

export interface ReviewSkillScore {
  review_id: string
  skill_id: number
  score: number
  in_recipe: boolean
  skill_name?: string | null
}

export interface ReviewSoftScore {
  review_id: string
  dimension: SoftDimension
  score: number
}

export interface SubmitReviewPayload {
  source_type: ReviewSourceType
  source_id: string
  ratee_id: string
  job_role_id?: number
  comment?: string
  skill_scores: SkillScoreInput[]
  soft_scores: SoftScoreInput[]
}

export interface SkillScoreInput {
  skill_id: number
  score: number
  in_recipe: boolean
}

export interface SoftScoreInput {
  dimension: SoftDimension
  score: number
}

export interface SkillVerificationSummary {
  member_id: string
  skill_id: number
  contribution_count: number
  weighted_avg_score: number
  distinct_raters: number
  has_verified_rater: boolean
  meets_threshold: boolean
}

export type ProjectInviteStatus = 'pending' | 'accepted' | 'declined'

// A lead/creator inviting a specific member to a project seat. Kept separate
// from ProjectMember — accepting creates the membership row, a decline
// leaves no debris.
export interface ProjectInvite {
  id: string
  project_id: string
  member_id: string
  invited_by: string
  job_role_id?: number | null
  note?: string | null
  status: ProjectInviteStatus
  created_at: string
  responded_at?: string | null
  project_title?: string | null
  member_name?: string | null
  inviter_name?: string | null
  job_role_name?: string | null
}

export interface CreateProjectInvitePayload {
  member_id: string
  job_role_id?: number
  note?: string
}

// ============ Circles (standing machines) ============

// A circle is a capped crew running a standing machine, with a charter, a
// cadence and metrics it exists to move. Distinct from a pod (belonging),
// a role (capability) and a project team (one outcome, then dissolved).
//
// Before the circles migration this was only a free-text label on tasks,
// which meant a circle existed only while it had open tasks.
export type CircleStatus = 'proposed' | 'active' | 'dormant' | 'closed'

export type CadenceKind = 'call_held' | 'tasks_published' | 'metrics_reported'

// Computed on read, never stored — the mechanism behind "a circle missing
// its cadence is a visible fact, not a private suspicion".
export interface CadenceHealth {
  last_call_held?: string | null
  last_tasks_published?: string | null
  last_metrics_report?: string | null
  on_cadence: boolean
  days_since_call?: number | null
}

export interface CircleSeat {
  id: string
  circle_id: string
  member_id: string
  term_start: string
  term_end?: string | null // null = currently held
  is_lead: boolean
  ended_note?: string | null
  member_name?: string | null
  avatar_url?: string | null
  circle_slug?: string | null
  circle_name?: string | null
}

export interface Circle {
  id: string
  slug: string
  name: string
  tagline?: string | null
  status: CircleStatus
  charter_md?: string | null
  cadence_note?: string | null
  seat_cap?: number | null
  lead_id?: string | null
  activated_at?: string | null
  lead_name?: string | null
  seat_count: number
  open_tasks: number
  seats?: CircleSeat[]
  cadence?: CadenceHealth | null
}

export interface CircleMetric {
  id: string
  circle_id: string
  period_start: string
  metric_key: string
  metric_label: string
  value: number
  target?: number | null
  reported_by?: string | null
}

export interface LogCadencePayload {
  kind: CadenceKind
  note?: string
}

export interface ReportMetricPayload {
  period_start: string
  metric_key: string
  metric_label: string
  value: number
  target?: number
}

export interface GrantSeatPayload {
  member_id: string
  term_start?: string
  is_lead?: boolean
}
