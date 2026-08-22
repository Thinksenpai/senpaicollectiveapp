import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiClient } from '@/api'

// SEO metadata for pages
interface RouteMeta {
  title?: string
  description?: string
  guest?: boolean
  requiresAuth?: boolean
  requiresApproved?: boolean
  requiresAdmin?: boolean
  requiresCommunityAccess?: boolean // admin OR community_lead
  requiresScout?: boolean
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public routes
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/public/HomePage.vue'),
      meta: {
        title: "Senpai Collective | Africa's Elite Creative Community",
        description: "Join Africa's elite community of creatives building the future through culture, technology, business, art, and systems."
      }
    },
    {
      path: '/manifesto',
      name: 'manifesto',
      component: () => import('@/views/public/ManifestoPage.vue'),
      meta: {
        title: 'Our Manifesto | Senpai Collective',
        description: "Read the Senpai Collective manifesto. Our core values, beliefs, and the movement we're building for African creatives."
      }
    },
    {
      path: '/join',
      name: 'join',
      component: () => import('@/views/auth/RegisterPage.vue'),
      meta: {
        guest: true,
        title: 'Apply to Join | Senpai Collective',
        description: 'Apply to join the Senpai Collective. We review every application looking for builders with skill, ambition, and character.'
      }
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('@/views/public/TermsPage.vue'),
      meta: {
        title: 'Terms of Membership | Senpai Collective',
        description: 'The terms of membership for the Senpai Collective.'
      }
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/public/PrivacyPage.vue'),
      meta: {
        title: 'Privacy Policy | Senpai Collective',
        description: 'How the Senpai Collective collects, uses, and protects your data.'
      }
    },
    {
      path: '/pool',
      name: 'pool',
      component: () => import('@/views/public/PoolPage.vue'),
      meta: {
        title: 'The Collective Pool | Senpai Collective',
        description: 'How members earn real ownership in everything the Senpai Collective builds.'
      }
    },
    {
      path: '/guidelines',
      name: 'guidelines',
      component: () => import('@/views/public/GuidelinesPage.vue'),
      meta: {
        title: 'Community Guidelines | Senpai Collective',
        description: 'What every Senpai Collective member agrees to on day one.'
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginPage.vue'),
      meta: {
        guest: true,
        title: 'Sign In | Senpai Collective',
        description: 'Sign in to your Senpai Collective account to access the member dashboard, directory, and opportunities.'
      }
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('@/views/auth/CallbackPage.vue'),
      meta: { title: 'Signing in… | Senpai Collective' }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/auth/ForgotPasswordPage.vue'),
      meta: { guest: true }
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/auth/ResetPasswordPage.vue'),
      meta: { guest: true }
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('@/views/auth/VerifyEmailPage.vue')
    },
    {
      path: '/m/:id',
      name: 'public-profile',
      component: () => import('@/views/public/PublicProfilePage.vue'),
      meta: {
        title: 'Member Profile | Senpai Collective',
        description: 'View this Senpai Collective member profile. Connect with talented African creatives.'
      }
    },
    {
      path: '/submit-job',
      name: 'submit-job',
      component: () => import('@/views/public/JobSubmitPage.vue'),
      meta: {
        title: 'Post a Job | Senpai Collective',
        description: 'Hire from the Senpai Collective. Post a job to connect with pre-vetted, values-aligned African creatives.'
      }
    },
    {
      path: '/job-status',
      name: 'job-status',
      component: () => import('@/views/public/JobStatusPage.vue'),
      meta: {
        title: 'Job Status | Senpai Collective',
        description: 'Check the status of your job submission to Senpai Collective.'
      }
    },
    {
      path: '/review/:token',
      name: 'client-review',
      component: () => import('@/views/public/ClientReviewPage.vue'),
      meta: {
        title: 'Leave a Review | Senpai Collective',
        description: 'Share your experience working with a Senpai Collective member.'
      }
    },

    // Protected member routes
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/member/DashboardPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      // The cohort hub now lives on the dashboard.
      path: '/cohort',
      redirect: '/dashboard'
    },
    {
      path: '/tasks',
      name: 'my-tasks',
      component: () => import('@/views/member/MemberTasksPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/tasks/open',
      name: 'open-tasks',
      component: () => import('@/views/member/OpenTasksPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/programs',
      name: 'programs',
      component: () => import('@/views/member/ProgramsPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/programs/:id',
      name: 'program-detail',
      component: () => import('@/views/member/ProgramDetailPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/tasks/:id',
      name: 'my-task-detail',
      component: () => import('@/views/member/MemberTaskDetailPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/circles',
      name: 'circles',
      component: () => import('@/views/member/CirclesPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/circles/:slug',
      name: 'circle-detail',
      component: () => import('@/views/member/CircleDetailPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('@/views/member/ProjectsPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/projects/:id',
      name: 'project-detail',
      component: () => import('@/views/member/ProjectDetailPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      // The enhanced profile is now consolidated into the single profile edit page.
      path: '/enrichment',
      redirect: '/profile/edit'
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/member/ProfilePage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile/edit',
      name: 'profile-edit',
      component: () => import('@/views/member/EditProfilePage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/members',
      name: 'members',
      component: () => import('@/views/member/DirectoryPage.vue'),
      meta: { requiresAuth: true, requiresApproved: true }
    },
    {
      path: '/members/:id',
      name: 'member-profile',
      component: () => import('@/views/member/MemberProfilePage.vue'),
      meta: { requiresAuth: true, requiresApproved: true }
    },
    {
      path: '/jobs',
      name: 'jobs',
      component: () => import('@/views/member/JobBoardPage.vue'),
      meta: { requiresAuth: true, requiresApproved: true }
    },
    {
      path: '/jobs/:id',
      name: 'job-detail',
      component: () => import('@/views/member/JobDetailPage.vue'),
      meta: { requiresAuth: true, requiresApproved: true }
    },
    {
      path: '/my-applications',
      name: 'my-applications',
      component: () => import('@/views/member/MyApplicationsPage.vue'),
      meta: { requiresAuth: true, requiresApproved: true }
    },
    {
      path: '/assigned-jobs',
      name: 'assigned-jobs',
      component: () => import('@/views/member/AssignedJobsPage.vue'),
      meta: { requiresAuth: true, requiresApproved: true }
    },
    {
      path: '/performance',
      name: 'performance',
      component: () => import('@/views/member/PerformancePage.vue'),
      meta: { requiresAuth: true, requiresApproved: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/member/SettingsPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/invites',
      name: 'my-invites',
      component: () => import('@/views/member/MyInvitesPage.vue'),
      meta: { requiresAuth: true, requiresApproved: true, title: 'My Invites | Senpai Collective' }
    },

    // Scout routes
    {
      path: '/scout',
      name: 'scout-dashboard',
      component: () => import('@/views/scout/ScoutDashboardPage.vue'),
      meta: { requiresAuth: true, requiresScout: true }
    },
    {
      path: '/scout/guide',
      name: 'scout-guide',
      component: () => import('@/views/scout/ScoutGuidePage.vue'),
      meta: { requiresAuth: true, requiresApproved: true }
    },

    // Admin routes
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/admin/AdminDashboardPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/applications',
      name: 'admin-applications',
      component: () => import('@/views/admin/ApplicationsPage.vue'),
      meta: { requiresAuth: true, requiresCommunityAccess: true }
    },
    {
      path: '/admin/applications/:id',
      name: 'admin-application-detail',
      component: () => import('@/views/admin/ApplicationDetailPage.vue'),
      meta: { requiresAuth: true, requiresCommunityAccess: true }
    },
    {
      path: '/admin/members',
      name: 'admin-members',
      component: () => import('@/views/admin/MembersPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/members/:id',
      name: 'admin-member-detail',
      component: () => import('@/views/admin/MemberDetailPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/cohorts',
      name: 'admin-cohorts',
      component: () => import('@/views/admin/AdminCohortsPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, title: 'Cohorts | Admin' }
    },
    {
      path: '/admin/tasks',
      name: 'admin-tasks',
      component: () => import('@/views/admin/AdminTasksPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, title: 'Tasks | Admin' }
    },
    {
      path: '/admin/programs',
      name: 'admin-programs',
      component: () => import('@/views/admin/AdminProgramsPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, title: 'Programs | Admin' }
    },
    {
      path: '/admin/circles',
      name: 'admin-circles',
      component: () => import('@/views/admin/AdminCirclesPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, title: 'Circles | Admin' }
    },
    {
      path: '/admin/projects',
      name: 'admin-projects',
      component: () => import('@/views/admin/AdminProjectsPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, title: 'Projects | Admin' }
    },
    {
      path: '/admin/scouts',
      name: 'admin-scouts',
      component: () => import('@/views/admin/AdminScoutsPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, title: 'Scouts | Admin' }
    },
    {
      path: '/admin/job-roles',
      name: 'admin-job-roles',
      component: () => import('@/views/admin/AdminJobRolesPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, title: 'Job Roles | Admin' }
    },
    {
      path: '/admin/skill-verification',
      name: 'admin-skill-verification',
      component: () => import('@/views/admin/AdminSkillVerificationPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, title: 'Skill Verification | Admin' }
    },
    {
      path: '/admin/analytics',
      name: 'admin-analytics',
      component: () => import('@/views/admin/AnalyticsPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/jobs',
      name: 'admin-jobs',
      component: () => import('@/views/admin/AdminJobsPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/jobs/:id',
      name: 'admin-job-detail',
      component: () => import('@/views/admin/AdminJobDetailPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },

    // Pending status page
    {
      path: '/pending',
      name: 'pending',
      component: () => import('@/views/auth/PendingApprovalPage.vue'),
      meta: { requiresAuth: true }
    },

    // 404
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/public/NotFoundPage.vue')
    }
  ]
})

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Update document title for SEO
  const meta = to.meta as RouteMeta
  if (meta.title) {
    document.title = meta.title
  } else {
    document.title = 'Senpai Collective'
  }

  // Update meta description
  const descriptionMeta = document.querySelector('meta[name="description"]')
  if (descriptionMeta && meta.description) {
    descriptionMeta.setAttribute('content', meta.description)
  }

  // If we have a token but haven't loaded the member yet (e.g. a fresh page
  // load/reload, where Pinia state resets but localStorage persists), fetch
  // it now. NOTE: this must check the raw token, not authStore.isAuthenticated —
  // that computed already requires `member` to be set, so checking it here
  // would always be false on a cold load and this fetch would never run,
  // silently bouncing a validly-logged-in user to /login.
  if (apiClient.getToken() && !authStore.member) {
    await authStore.fetchCurrentMember()
  }

  // Guest only routes (login, register, etc.)
  if (to.meta.guest && authStore.isAuthenticated) {
    return next({ name: 'dashboard' })
  }

  // Protected routes
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  // Approved members only
  if (to.meta.requiresApproved && !authStore.isApproved) {
    return next({ name: 'pending' })
  }

  // Admin only
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next({ name: 'dashboard' })
  }

  // Admin or community lead
  if (to.meta.requiresCommunityAccess && !authStore.isAdmin && !authStore.isCommunityLead) {
    return next({ name: 'dashboard' })
  }

  // Scout only
  if (to.meta.requiresScout && !authStore.isScout) {
    return next({ name: 'dashboard' })
  }

  next()
})

export default router
