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
  AssignmentComment,
  TaskPeerStatus
} from '@/types'

export const engineApi = {
  // Member dashboard: cohort, pod, Senpai ID, tasks, enrichment status
  async getDashboard(): Promise<ApiResponse<MemberDashboard>> {
    return apiClient.get('/me/dashboard')
  },

  async getMyTasks(): Promise<ApiResponse<TaskAssignment[]>> {
    return apiClient.get('/me/tasks')
  },

  async submitTask(taskId: string, payload: SubmitTaskPayload): Promise<ApiResponse<TaskAssignment>> {
    return apiClient.post(`/tasks/${taskId}/submit`, payload)
  },

  async getTaskPeers(taskId: string): Promise<ApiResponse<TaskPeerStatus[]>> {
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

  // Task comments (shared Q&A thread on the task)
  async getTaskComments(taskId: string): Promise<ApiResponse<TaskComment[]>> {
    return apiClient.get(`/tasks/${taskId}/comments`)
  },
  async postTaskComment(taskId: string, body: string): Promise<ApiResponse<TaskComment>> {
    return apiClient.post(`/tasks/${taskId}/comments`, { body })
  },

  // Assignment comments (private thread on one member's submission)
  async getAssignmentComments(assignmentId: string): Promise<ApiResponse<AssignmentComment[]>> {
    return apiClient.get(`/assignments/${assignmentId}/comments`)
  },
  async postAssignmentComment(assignmentId: string, body: string): Promise<ApiResponse<AssignmentComment>> {
    return apiClient.post(`/assignments/${assignmentId}/comments`, { body })
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

  // Tasks
  listTasks(cohortId: string): Promise<ApiResponse<Task[]>> {
    return apiClient.get(`/admin/tasks?cohort_id=${cohortId}`)
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
