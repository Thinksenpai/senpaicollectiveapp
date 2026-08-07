import type { Activity } from './engine'

// API Response types
export interface ApiResponse<T = unknown> {
  status: boolean
  message: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination
}

export interface Pagination {
  current_page: number
  per_page: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

// Skill types
export interface Skill {
  id: number
  name: string
  category: SkillCategory
  is_active: boolean
}

export type SkillCategory = 'design' | 'media' | 'tech' | 'content' | 'business' | 'other'

// Additional link type
export interface AdditionalLink {
  label?: string
  url: string
}

// Member types
export type MemberStatus = 'pending' | 'approved' | 'declined' | 'deactivated'
export type ExperienceLevel = 'none' | 'junior' | 'mid' | 'senior'
export type DiscoverySource = 'scout' | 'social' | 'friend' | 'event' | 'returning' | 'other'

export interface Role {
  id: number
  name: string
  description: string
}

export interface MemberProfile {
  member_id: string
  full_name: string
  first_name?: string
  last_name?: string
  middle_name?: string
  phone?: string
  city: string
  country: string
  photo_url?: string
  bio: string
  cover_letter?: string
  recent_work: string
  unique_view: string
  primary_skill_id: number
  experience_level: ExperienceLevel
  portfolio_url: string
  additional_links?: AdditionalLink[]
  is_og_member: boolean
  og_member_details?: string
  discovery_source: DiscoverySource
  profile_completeness: number
  primary_skill?: Skill
}

export interface Member {
  id: string
  email: string
  email_verified: boolean
  status: MemberStatus
  created_at: string
  updated_at: string
  approved_at?: string
  decline_reason?: string
  profile?: MemberProfile
  skills?: Skill[]
  roles?: Role[]
  scout?: Scout | null
  referred_by_scout_id?: string
  referred_by_scout_name?: string
  referred_by_scout_photo_url?: string
  scout_note?: string
}

export interface PublicMemberProfile {
  id: string
  full_name: string
  photo_url?: string
  city: string
  country: string
  bio: string
  experience_level: ExperienceLevel
  primary_skill?: Skill
  skills?: Skill[]
  portfolio_url: string
  additional_links?: AdditionalLink[]
  member_since: string
  badges?: string[]
  roles?: Role[]
  cohort_name?: string | null
  cohort_status?: string | null
  pod_name?: string | null
  recent_work?: string
  unique_view?: string
}

// Scout types
export type ScoutStatus = 'active' | 'inactive' | 'removed'

export interface Scout {
  member_id: string
  invite_code: string
  status: ScoutStatus
  accepted_agreement_at?: string
  accepted_pledge_version?: number
  score: number
  created_at: string
  removed_at?: string
  member?: Member
}

export type ScoutRequestStatus = 'pending' | 'approved' | 'declined'

export interface ScoutRequest {
  id: string
  member_id: string
  status: ScoutRequestStatus
  requested_at: string
  reviewed_by?: string
  reviewed_at?: string
  decline_reason?: string
  member?: Member
}

export interface MyScoutRequestStatus {
  is_scout: boolean
  has_pending: boolean
  request_id?: string
  last_status?: ScoutRequestStatus
}

export interface ScoutInvite {
  id: string
  scout_id: string
  invited_member_id?: string
  invite_link_clicked_at?: string
  registered_at?: string
  application_status: 'pending' | 'approved' | 'declined'
  created_at: string
}

export interface ScoutPledge {
  id: number
  title: string
  content: string
  version: number
  is_active: boolean
}

export interface ScoutRecruit {
  invite_id: string
  scout_note?: string
  registered_at?: string
  application_status: 'pending' | 'approved' | 'declined'
  decline_reason?: string
  member_id?: string
  full_name?: string
  email?: string
  city?: string
  country?: string
  primary_skill?: string
  experience_level?: ExperienceLevel
  photo_url?: string
}

export interface ScoutStats {
  total_invited: number
  total_registered: number
  total_approved: number
  total_declined: number
  pending_applications: number
  approval_rate: number
  conversion_rate: number
  scout_score: number
}

export interface ScoutDashboardData {
  scout: Scout
  invite_url: string
  pledge_accepted: boolean
  stats: ScoutStats
  recruits: ScoutRecruit[]
  pending_recruits: ScoutRecruit[]
}

export interface ScoutLeaderboardEntry {
  rank: number
  member: {
    id: string
    full_name: string
    city: string
    country: string
    photo_url?: string
  }
  stats: {
    total_invited: number
    total_registered: number
    total_approved: number
    approval_rate: number
    scout_score: number
  }
}

// Auth types
export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  member: Member
}

export interface RegisterData {
  full_name: string
  first_name?: string
  last_name?: string
  email: string
  password: string
  password_confirm: string
  phone?: string
  city: string
  country: string
  primary_skill_id: number
  other_skill_ids?: number[]
  experience_level: ExperienceLevel
  portfolio_url: string
  additional_links?: AdditionalLink[]
  bio: string
  cover_letter?: string
  recent_work: string
  unique_view: string
  is_og_member: boolean
  og_member_details?: string
  discovery_source: DiscoverySource
  scout_code?: string
}

export interface RegisterResponse {
  member_id: string
  email: string
  status: MemberStatus
  message: string
}

// Dashboard types
export interface DashboardData {
  member_id: string
  pending_scout_invitation: boolean
  notifications: Notification[]
  recent_activity: Activity[]
  job_recommendations: Job[]
}

export interface Notification {
  id: string
  type: string
  message: string
  read: boolean
  created_at: string
}

// Job types
export type JobType = 'full_time' | 'contract' | 'project' | 'internship'
export type JobStatus = 'pending_approval' | 'active' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'rejected'
export type JobListingType = 'basic' | 'featured' | 'premium'
export type ApplicationStatus = 'submitted' | 'viewed' | 'shortlisted' | 'hired' | 'rejected' | 'withdrawn'
export type DeliverableType = 'file' | 'link' | 'note'

export interface Job {
  id: string
  title: string
  description: string
  company_name: string
  contact_email: string
  client_name?: string
  skills_needed: number[]
  job_type: JobType
  budget_range?: string
  timeline?: string
  listing_type: JobListingType
  status: JobStatus
  views_count: number
  application_count?: number
  assigned_member_id?: string
  assigned_at?: string
  created_at: string
  expires_at?: string
  skills?: Skill[]
}

export interface JobApplication {
  id: string
  job_id: string
  member_id: string
  cover_message: string
  proposal_text: string
  proposed_rate?: string
  proposed_timeline?: string
  attachment_urls?: string[]
  status: ApplicationStatus
  rejection_reason?: string
  admin_notes?: string
  created_at: string
  updated_at: string
  job?: Job
  member?: PublicMemberProfile
}

export interface JobDeliverable {
  id: string
  job_id: string
  member_id: string
  title: string
  description?: string
  deliverable_type: DeliverableType
  file_url?: string
  external_url?: string
  is_final: boolean
  created_at: string
}

export interface ClientReview {
  id: string
  job_id: string
  member_id: string
  overall_rating: number
  quality_rating: number
  communication_rating: number
  timeliness_rating: number
  professionalism_rating: number
  review_text?: string
  would_hire_again: boolean
  client_name: string
  client_email: string
  created_at: string
}

export interface InternalReview {
  id: string
  job_id: string
  member_id: string
  admin_id: string
  overall_rating: number
  skill_demonstration: number
  reliability: number
  collaboration: number
  growth_potential: number
  strengths?: string
  areas_for_improvement?: string
  internal_notes?: string
  recommend_for_similar: boolean
  flag_concerns: boolean
  created_at: string
}

export interface MemberPerformance {
  member_id: string
  total_jobs_completed: number
  total_jobs_assigned: number
  jobs_completed_on_time: number
  total_applications: number
  applications_hired: number
  application_success_rate: number
  avg_client_rating: number
  avg_internal_rating: number
  total_client_reviews: number
  is_top_performer: boolean
  is_recommended: boolean
}

export interface JobSubmissionData {
  title: string
  description: string
  client_name: string
  contact_email: string
  client_company?: string
  skills_needed: number[]
  job_type: JobType
  budget_range?: string
  timeline?: string
}

export interface JobSubmissionResponse {
  submission_id: string
  submission_token: string
  message: string
  status: string
}

export interface JobStatusResponse {
  status: JobStatus
  title: string
  submitted_at: string
  approved_at?: string
}

export interface JobFilters {
  search?: string
  skill_ids?: number[]
  job_type?: JobType
  status?: JobStatus
  sort_by?: 'newest' | 'deadline' | 'budget'
  limit?: number
  offset?: number
}

export interface JobApplicationData {
  cover_message: string
  proposal_text: string
  proposed_rate?: string
  proposed_timeline?: string
  attachment_urls?: string[]
}

export interface DeliverableData {
  title: string
  description?: string
  deliverable_type: DeliverableType
  file_url?: string
  external_url?: string
  is_final: boolean
}

export interface ClientReviewData {
  overall_rating: number
  quality_rating: number
  communication_rating: number
  timeliness_rating: number
  professionalism_rating: number
  review_text?: string
  would_hire_again: boolean
  client_name: string
  client_email: string
}

export interface InternalReviewData {
  overall_rating: number
  skill_demonstration: number
  reliability: number
  collaboration: number
  growth_potential: number
  strengths?: string
  areas_for_improvement?: string
  internal_notes?: string
  recommend_for_similar: boolean
  flag_concerns: boolean
}

// Admin types
export interface Application {
  id: string
  email: string
  email_verified: boolean
  status: MemberStatus
  created_at: string
  updated_at: string
  decline_reason?: string
  referred_by_scout_name?: string
  referred_by_scout_photo_url?: string
  scout_note?: string
  profile: MemberProfile
}

export interface AdminStats {
  total_members: number
  approved_members: number
  pending_applications: number
  active_scouts: number
  job_postings: number
  approval_rate: number
  growth_this_month: number
}

export interface AdminAnalytics {
  skill_distribution: { skill_name: string; count: number }[]
  location_distribution: { city: string; country: string; count: number }[]
}

export interface AdminNote {
  id: string
  note_text: string
  created_at: string
  admin: { full_name: string }
}

// Filter types
export interface MemberFilters {
  search?: string
  skill_ids?: number[]
  cities?: string[]
  countries?: string[]
  experience_levels?: ExperienceLevel[]
  roles?: string[]
  sort_by?: 'name' | 'newest' | 'recently_active'
  limit?: number
  offset?: number
}

export interface ApplicationFilters {
  status?: 'pending' | 'declined'
  limit?: number
  offset?: number
}

export interface AdminMemberFilters {
  status?: MemberStatus
  search?: string
  limit?: number
  offset?: number
}
export * from './engine'
