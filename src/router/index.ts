import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public routes
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/public/HomePage.vue')
    },
    {
      path: '/manifesto',
      name: 'manifesto',
      component: () => import('@/views/public/ManifestoPage.vue')
    },
    {
      path: '/join',
      name: 'join',
      component: () => import('@/views/auth/RegisterPage.vue'),
      meta: { guest: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginPage.vue'),
      meta: { guest: true }
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
      component: () => import('@/views/public/PublicProfilePage.vue')
    },
    {
      path: '/submit-job',
      name: 'submit-job',
      component: () => import('@/views/public/JobSubmitPage.vue')
    },
    {
      path: '/job-status',
      name: 'job-status',
      component: () => import('@/views/public/JobStatusPage.vue')
    },
    {
      path: '/review/:token',
      name: 'client-review',
      component: () => import('@/views/public/ClientReviewPage.vue')
    },

    // Protected member routes
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/member/DashboardPage.vue'),
      meta: { requiresAuth: true }
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

    // Scout routes
    {
      path: '/scout',
      name: 'scout-dashboard',
      component: () => import('@/views/scout/ScoutDashboardPage.vue'),
      meta: { requiresAuth: true, requiresScout: true }
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
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/applications/:id',
      name: 'admin-application-detail',
      component: () => import('@/views/admin/ApplicationDetailPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
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

  // If we have a token but no member data, fetch it
  if (authStore.isAuthenticated && !authStore.member) {
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

  // Scout only
  if (to.meta.requiresScout && !authStore.isScout) {
    return next({ name: 'dashboard' })
  }

  next()
})

export default router
