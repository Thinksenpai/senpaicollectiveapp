<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { completeZitadelLogin } from '@/lib/oidc'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const message = ref('Signing you in…')
const failed = ref(false)

onMounted(async () => {
  try {
    // Finish the redirect from Zitadel and grab the ID token.
    const user = await completeZitadelLogin()
    if (!user.id_token) throw new Error('No identity token returned')

    // Trade it with our backend for a Senpai session.
    const result = await authStore.loginWithZitadel(user.id_token)

    if (result.success) {
      router.replace('/dashboard')
      return
    }

    // Verified identity, but not (yet) a member.
    if (result.reason === 'no_membership') {
      message.value = 'Identity verified — but you are not a member yet. Taking you to the application…'
      router.replace({ name: 'join', query: { email: result.email, name: result.name } })
      return
    }
    if (result.reason === 'pending_approval') {
      router.replace({ name: 'pending' })
      return
    }

    failed.value = true
    message.value = authStore.error || 'Sign in failed. Please try again.'
  } catch (e: any) {
    failed.value = true
    message.value = e?.message || 'Sign in failed. Please try again.'
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
    <img src="/senpai_logo.svg" alt="Senpai" class="h-12 w-auto mb-6" />
    <p class="text-gray-700 max-w-sm">{{ message }}</p>
    <RouterLink
      v-if="failed"
      to="/login"
      class="mt-4 font-medium text-senpai-600 hover:text-senpai-500"
    >
      Back to sign in
    </RouterLink>
  </div>
</template>
