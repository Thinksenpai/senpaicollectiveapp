import type { Activity } from '@/types'

// Shared verb -> display mapping for activity feeds (personal, project, task).
// Kept in one place so new verbs only need adding here, not in every feed.
function meta(a: Activity, key: string): string {
  const v = a.metadata?.[key]
  return typeof v === 'string' ? v : ''
}

export function activityVerbPhrase(a: Activity): string {
  switch (a.verb) {
    case 'task_submitted': return 'Submitted'
    case 'task_completed': return 'Completed'
    case 'task_assigned': return 'Assigned'
    case 'task_unassigned': return 'Removed from'
    case 'commented': return 'Commented on'
    case 'pod_joined': return 'Joined'
    case 'accepted': return 'Accepted into'
    case 'approved': {
      const by = meta(a, 'approved_by')
      return by ? `Approved by ${by}` : 'Approved'
    }
    case 'enrichment_completed': return 'Completed profile enrichment'
    case 'guidelines_accepted': return 'Accepted community guidelines'
    case 'pledge_accepted': return 'Accepted the scout pledge'
    case 'became_scout': return 'Became a scout'
    case 'induction_attended': return 'Attended induction'
    case 'inducted': return 'Inducted into'
    case 'active': return 'Was active'
    case 'project_proposed': return 'Proposed'
    case 'project_approved': return 'Approved'
    case 'project_joined': return 'Joined the team on'
    case 'project_left': return 'Left the team on'
    case 'project_member_removed': {
      const by = meta(a, 'removed_by')
      return by ? `Removed from the team by ${by} —` : 'Removed from the team —'
    }
    case 'project_shipped': return 'Shipped'
    default: return a.verb.replace(/_/g, ' ')
  }
}

// The clickable chip text — the task/pod/cohort/project name, not any comment content.
export function activityChip(a: Activity): string {
  return meta(a, 'task') || meta(a, 'pod') || meta(a, 'cohort') || meta(a, 'project')
}

// Where the chip links to. Tasks (and comments on them) go to the task's own
// page; projects go to the project page; pod/cohort activities go to the
// dashboard, since there's no separate pod/cohort detail route yet.
export function activityLink(a: Activity): string | null {
  if (a.target_type === 'task' && a.target_id) return `/tasks/${a.target_id}`
  if (a.target_type === 'assignment') {
    const taskId = meta(a, 'task_id')
    return taskId ? `/tasks/${taskId}` : null
  }
  if (a.target_type === 'project' && a.target_id) return `/projects/${a.target_id}`
  if (a.target_type === 'pod' || a.target_type === 'cohort') return '/dashboard'
  return null
}

export function activityTimeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function activityInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/)
  return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0]?.slice(0, 2).toUpperCase() || '?'
}
