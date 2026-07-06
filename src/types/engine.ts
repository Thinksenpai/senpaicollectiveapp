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

export interface Task {
  id: string
  title: string
  slug: string
  description: string
  kind: TaskKind
  track: TaskTrack
  handin_type: HandinType
  external_url?: string | null
  cohort_id?: string | null
  is_required: boolean
  show_submissions: boolean
  order_index: number
  available_at?: string | null
  due_at?: string | null
  status: 'draft' | 'published' | 'archived'
  assignment_count?: number
  completed_count?: number
  assigned_to?: string[]
}

export interface TaskAssignment {
  id: string
  task_id: string
  member_id: string
  assigned_via: 'individual' | 'pod' | 'cohort' | 'global'
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

export interface TaskPeerStatus {
  member_id: string
  member_name: string
  status: AssignmentStatus
  is_self: boolean
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
  is_required: boolean
  show_submissions: boolean
  order_index?: number
  available_at?: string
  due_at?: string
  status: 'draft' | 'published' | 'archived'
}

export interface AssignTaskPayload {
  target_type: 'individual' | 'pod' | 'cohort' | 'global'
  target_id?: string
}
