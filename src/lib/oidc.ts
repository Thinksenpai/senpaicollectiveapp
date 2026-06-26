import { UserManager, WebStorageStateStore, type User } from 'oidc-client-ts'

// Central auth (self-hosted Zitadel). These default to production but can be
// overridden per-environment via Vite env vars.
const authority = import.meta.env.VITE_ZITADEL_AUTHORITY || 'https://auth.henryikoh.com'
const clientId = import.meta.env.VITE_ZITADEL_CLIENT_ID || '379045769489009814'

// One shared manager for the Authorization Code + PKCE flow. We use
// window.location.origin so the same build works on localhost and in production
// without hardcoding the redirect host (both URIs are registered in Zitadel).
export const userManager = new UserManager({
  authority,
  client_id: clientId,
  redirect_uri: `${window.location.origin}/auth/callback`,
  post_logout_redirect_uri: `${window.location.origin}/`,
  response_type: 'code',
  scope: 'openid profile email',
  // Persist PKCE state across the redirect round-trip to Zitadel.
  userStore: new WebStorageStateStore({ store: window.localStorage }),
})

// Redirect the browser to Zitadel's hosted login (password / passkey / Google).
export function startZitadelLogin(): Promise<void> {
  return userManager.signinRedirect()
}

// Complete the redirect back from Zitadel and return the signed-in user
// (whose id_token we hand to our backend to mint a Senpai session).
export function completeZitadelLogin(): Promise<User> {
  return userManager.signinRedirectCallback()
}
