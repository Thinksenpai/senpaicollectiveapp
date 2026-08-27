import { apiClient } from './client'
import type {
  ApiResponse,
  MemberDashboard,
  TaskAssignment,
  MemberEnrichment,
  EnrichmentPayload,
  SenpaiID,
  Activity,
  SubmitTaskPayload,
  Cohort,
  Pod,
  CohortMembership,
  CohortDashboard,
  Task,
  MembershipState,
  AssignmentStatus,
  CreateCohortPayload,
  UpdateCohortPayload,
  CreatePodPayload,
  CreateTaskPayload,
  AssignTaskPayload,
  MemberEngineStatus,
  TaskComment,
  TaskSubmission,
  AssignmentComment,
  Program,
  Project,
  ProjectStatus,
  ProposeProjectPayload,
  CreateProjectTaskPayload,
  CreateCircleTrackPayload,
  Circle,
  CircleMetric,
  CircleSeat,
  LogCadencePayload,
  ReportMetricPayload,
  GrantSeatPayload
} from '@/types'

export const engineApi = {
  // Member dashboard: cohort, pod, Senpai ID, tasks, enrichment status
  async getDashboard(): Promise<ApiResponse<MemberDashboard>> {
    return apiClient.get('/me/dashboard')
  },

  async getMyTasks(): Promise<ApiResponse<TaskAssignment[]>> {
    return apiClient.get('/me/tasks')
  },

  // A task's own metadata (no submission content) — lets the task page show
  // project/program context even for a task not (only) assigned to you.
  async getTask(taskId: string): Promise<ApiResponse<Task>> {
    return apiClient.get(`/tasks/${taskId}`)
  },

  async submitTask(taskId: string, payload: SubmitTaskPayload): Promise<ApiResponse<TaskAssignment>> {
    return apiClient.post(`/tasks/${taskId}/submit`, payload)
  },

  // The open board: published, claimable tasks anyone can pull.
  async getOpenTasks(): Promise<ApiResponse<Task[]>> {
    return apiClient.get('/tasks/open')
  },

  // Circle tracks — global (cross-cohort) programs, browsable by any member.
  async listCircleTracks(): Promise<ApiResponse<Program[]>> {
    return apiClient.get('/circle-tracks')
  },
  async getProgram(programId: string): Promise<ApiResponse<{ program: Program; tasks: Task[] }>> {
    return apiClient.get(`/programs/${programId}`)
  },

  // Circles — the standing machines. Reads are open to any member: the
  // charter, the seats and the cadence are meant to be visible.
  async listCircles(): Promise<ApiResponse<Circle[]>> {
    return apiClient.get('/circles')
  },
  async getCircle(slug: string): Promise<ApiResponse<Circle>> {
    return apiClient.get(`/circles/${slug}`)
  },
  async getCircleTasks(slug: string): Promise<ApiResponse<Task[]>> {
    return apiClient.get(`/circles/${slug}/tasks`)
  },
  async getCircleMetrics(slug: string): Promise<ApiResponse<CircleMetric[]>> {
    return apiClient.get(`/circles/${slug}/metrics`)
  },
  // Seat holders (or admins) log the circle's own cadence and metrics.
  async logCadence(slug: string, payload: LogCadencePayload): Promise<ApiResponse<null>> {
    return apiClient.post(`/circles/${slug}/cadence`, payload)
  },
  async reportCircleMetric(slug: string, payload: ReportMetricPayload): Promise<ApiResponse<null>> {
    return apiClient.post(`/circles/${slug}/metrics`, payload)
  },

  async claimTask(taskId: string): Promise<ApiResponse<TaskAssignment>> {
    return apiClient.post(`/tasks/${taskId}/claim`)
  },

  async startTask(taskId: string): Promise<ApiResponse<TaskAssignment>> {
    return apiClient.post(`/tasks/${taskId}/start`)
  },

  async getTaskPeers(taskId: string): Promise<ApiResponse<TaskAssignment[]>> {
    return apiClient.get(`/tasks/${taskId}/peers`)
  },

  async getEnrichment(): Promise<ApiResponse<MemberEnrichment | null>> {
    return apiClient.get('/me/enrichment')
  },

  async saveEnrichment(payload: EnrichmentPayload): Promise<ApiResponse<MemberEnrichment>> {
    return apiClient.put('/me/enrichment', payload)
  },

  // Another member's enrichment — profiles are fully visible across the
  // collective, so this backs both the directory and the admin member view.
  async getMemberEnrichment(memberId: string): Promise<ApiResponse<MemberEnrichment | null>> {
    return apiClient.get(`/members/${memberId}/enrichment`)
  },

  async getSenpaiId(): Promise<ApiResponse<SenpaiID | null>> {
    return apiClient.get('/me/senpai-id')
  },

  async chooseSenpaiHandle(handle: string): Promise<ApiResponse<void>> {
    return apiClient.post('/me/senpai-id/choose', { handle })
  },

  async getMyActivity(): Promise<ApiResponse<Activity[]>> {
    return apiClient.get('/me/activity')
  },

  async acceptGuidelines(): Promise<ApiResponse<void>> {
    return apiClient.post('/me/accept-guidelines')
  },

  async acceptPledge(): Promise<ApiResponse<void>> {
    return apiClient.post('/me/accept-pledge')
  },

  // Task comments (shared Q&A thread on the task)
  async getTaskComments(taskId: string): Promise<ApiResponse<TaskComment[]>> {
    return apiClient.get(`/tasks/${taskId}/comments`)
  },
  async postTaskComment(taskId: string, body: string): Promise<ApiResponse<TaskComment>> {
    return apiClient.post(`/tasks/${taskId}/comments`, { body })
  },

  // Every attempt on an assignment, oldest first — the member, the task's
  // named reviewer and admins can read it.
  async getSubmissionHistory(assignmentId: string): Promise<ApiResponse<TaskSubmission[]>> {
    return apiClient.get(`/assignments/${assignmentId}/submissions`)
  },

  // Assignment comments (private thread on one member's submission)
  async getAssignmentComments(assignmentId: string): Promise<ApiResponse<AssignmentComment[]>> {
    return apiClient.get(`/assignments/${assignmentId}/comments`)
  },
  async postAssignmentComment(assignmentId: string, body: string): Promise<ApiResponse<AssignmentComment>> {
    return apiClient.post(`/assignments/${assignmentId}/comments`, { body })
  },

  // Projects — the builder primitive
  async listProjects(status?: ProjectStatus): Promise<ApiResponse<Project[]>> {
    return apiClient.get('/projects', { params: status ? { status } : undefined })
  },
  async proposeProject(payload: ProposeProjectPayload): Promise<ApiResponse<Project>> {
    return apiClient.post('/projects', payload)
  },
  async getProject(id: string): Promise<ApiResponse<{ project: Project; tasks: Task[] | null }>> {
    return apiClient.get(`/projects/${id}`)
  },
  // skillId is the seat's role — what you join the team AS (optional).
  async joinProject(id: string, skillId?: number): Promise<ApiResponse<Project>> {
    return apiClient.post(`/projects/${id}/join`, skillId ? { skill_id: skillId } : {})
  },
  async leaveProject(id: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/projects/${id}/leave`)
  },
  // Creator/admin pulling a specific person onto (or off of) the team directly.
  async addTeamMember(id: string, memberId: string): Promise<ApiResponse<Project>> {
    return apiClient.post(`/projects/${id}/members`, { member_id: memberId })
  },
  async removeTeamMember(id: string, memberId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/projects/${id}/members/${memberId}`)
  },
  async updateProjectStatus(id: string, status: ProjectStatus, outcomeUrl?: string): Promise<ApiResponse<Project>> {
    return apiClient.put(`/projects/${id}/status`, { status, outcome_url: outcomeUrl })
  },
  async getMemberProjects(memberId: string): Promise<ApiResponse<Project[]>> {
    return apiClient.get(`/members/${memberId}/projects`)
  },

  // Peer tasks — a project team assigns and reviews its own work
  async createProjectTask(projectId: string, payload: CreateProjectTaskPayload): Promise<ApiResponse<Task>> {
    return apiClient.post(`/projects/${projectId}/tasks`, payload)
  },
  async getProjectRoster(projectId: string): Promise<ApiResponse<TaskAssignment[]>> {
    return apiClient.get(`/projects/${projectId}/roster`)
  },
  async getProjectActivity(projectId: string): Promise<ApiResponse<Activity[]>> {
    return apiClient.get(`/projects/${projectId}/activity`)
  },
  async getTaskActivity(taskId: string): Promise<ApiResponse<Activity[]>> {
    return apiClient.get(`/tasks/${taskId}/activity`)
  },
  async peerReviewAssignment(assignmentId: string, status: 'completed' | 'returned', note?: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/assignments/${assignmentId}/peer-review`, { status, note })
  }
}

export const adminEngineApi = {
  // Cohorts
  listCohorts(): Promise<ApiResponse<Cohort[]>> {
    return apiClient.get('/admin/cohorts')
  },
  getCurrentCohort(): Promise<ApiResponse<Cohort | null>> {
    return apiClient.get('/admin/cohorts/current')
  },
  getCohort(id: string): Promise<ApiResponse<Cohort>> {
    return apiClient.get(`/admin/cohorts/${id}`)
  },
  createCohort(payload: CreateCohortPayload): Promise<ApiResponse<Cohort>> {
    return apiClient.post('/admin/cohorts', payload)
  },
  updateCohort(id: string, payload: UpdateCohortPayload): Promise<ApiResponse<Cohort>> {
    return apiClient.put(`/admin/cohorts/${id}`, payload)
  },

  // Pods
  listPods(cohortId: string): Promise<ApiResponse<Pod[]>> {
    return apiClient.get(`/admin/cohorts/${cohortId}/pods`)
  },
  createPod(cohortId: string, payload: CreatePodPayload): Promise<ApiResponse<Pod>> {
    return apiClient.post(`/admin/cohorts/${cohortId}/pods`, payload)
  },
  updatePod(podId: string, payload: CreatePodPayload): Promise<ApiResponse<Pod>> {
    return apiClient.put(`/admin/pods/${podId}`, payload)
  },
  listPodMembers(podId: string): Promise<ApiResponse<CohortMembership[]>> {
    return apiClient.get(`/admin/pods/${podId}/members`)
  },
  bulkAssignPod(podId: string, membershipIds: string[]): Promise<ApiResponse<{ assigned: number }>> {
    return apiClient.post(`/admin/pods/${podId}/assign-members`, { membership_ids: membershipIds })
  },
  autoAssignPods(cohortId: string): Promise<ApiResponse<{ assigned: number }>> {
    return apiClient.post(`/admin/cohorts/${cohortId}/auto-assign-pods`)
  },

  // Members / memberships
  listCohortMembers(cohortId: string): Promise<ApiResponse<CohortMembership[]>> {
    return apiClient.get(`/admin/cohorts/${cohortId}/members`)
  },
  // The cohort control room: intake funnel, pacing against target and close
  // date, baseline coverage, review backlog, and per-member induction progress.
  getCohortDashboard(cohortId: string): Promise<ApiResponse<CohortDashboard>> {
    return apiClient.get(`/admin/cohorts/${cohortId}/dashboard`)
  },
  // The induction ceremony: inducts everyone still 'accepted' and reveals
  // their Senpai IDs. Idempotent — safe to re-run on the night.
  runInduction(cohortId: string): Promise<ApiResponse<{ inducted: number; revealed: number }>> {
    return apiClient.post(`/admin/cohorts/${cohortId}/induct`)
  },
  listCohortPrograms(cohortId: string): Promise<ApiResponse<Program[]>> {
    return apiClient.get(`/admin/cohorts/${cohortId}/programs`)
  },
  approveProject(projectId: string): Promise<ApiResponse<Project>> {
    return apiClient.post(`/admin/projects/${projectId}/approve`)
  },
  createProgram(cohortId: string, payload: { name: string; description?: string }): Promise<ApiResponse<Program>> {
    return apiClient.post(`/admin/cohorts/${cohortId}/programs`, payload)
  },
  updateProgram(programId: string, payload: { name: string; description?: string }): Promise<ApiResponse<Program>> {
    return apiClient.put(`/admin/programs/${programId}`, payload)
  },
  createCircleTrack(payload: CreateCircleTrackPayload): Promise<ApiResponse<Program>> {
    return apiClient.post('/admin/circle-tracks', payload)
  },

  // Circles (admin): the charter, status, and seats. Seats are granted while
  // the collective seeds its first circles; entry becomes earned later.
  updateCircle(slug: string, payload: Partial<Circle>): Promise<ApiResponse<Circle>> {
    return apiClient.put(`/admin/circles/${slug}`, payload)
  },
  grantCircleSeat(slug: string, payload: GrantSeatPayload): Promise<ApiResponse<CircleSeat>> {
    return apiClient.post(`/admin/circles/${slug}/seats`, payload)
  },
  endCircleSeat(slug: string, seatId: string, endedNote?: string): Promise<ApiResponse<null>> {
    return apiClient.post(`/admin/circles/${slug}/seats/${seatId}/end`, { ended_note: endedNote })
  },
  memberRoster(): Promise<ApiResponse<MemberEngineStatus[]>> {
    return apiClient.get('/admin/roster')
  },
  acceptIntoCohort(memberId: string): Promise<ApiResponse<CohortMembership>> {
    return apiClient.post(`/admin/members/${memberId}/accept-cohort`)
  },
  assignPod(membershipId: string, podId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/admin/memberships/${membershipId}/assign-pod`, { pod_id: podId })
  },
  updateMembershipState(membershipId: string, state: MembershipState): Promise<ApiResponse<void>> {
    return apiClient.post(`/admin/memberships/${membershipId}/state`, { state })
  },

  // Tasks — omit cohortId (or pass '') for the global/circle-track task list.
  // No cohortId → the cohort-less (circle/global) tasks. 'all' → everything,
  // which is the only view that shows circle work created inside a cohort.
  listTasks(cohortId?: string): Promise<ApiResponse<Task[]>> {
    if (cohortId === 'all') return apiClient.get('/admin/tasks?scope=all')
    return apiClient.get(cohortId ? `/admin/tasks?cohort_id=${cohortId}` : '/admin/tasks')
  },
  createTask(payload: CreateTaskPayload): Promise<ApiResponse<Task>> {
    return apiClient.post('/admin/tasks', payload)
  },
  updateTask(taskId: string, payload: CreateTaskPayload): Promise<ApiResponse<Task>> {
    return apiClient.put(`/admin/tasks/${taskId}`, payload)
  },
  deleteTask(taskId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/admin/tasks/${taskId}`)
  },
  assignTask(taskId: string, payload: AssignTaskPayload): Promise<ApiResponse<{ assigned: number }>> {
    return apiClient.post(`/admin/tasks/${taskId}/assign`, payload)
  },
  getRoster(taskId: string): Promise<ApiResponse<TaskAssignment[]>> {
    return apiClient.get(`/admin/tasks/${taskId}/roster`)
  },
  reviewAssignment(assignmentId: string, status: AssignmentStatus, note?: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/admin/assignments/${assignmentId}/review`, { status, note })
  },
  unassignTask(assignmentId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/admin/assignments/${assignmentId}`)
  }
}
