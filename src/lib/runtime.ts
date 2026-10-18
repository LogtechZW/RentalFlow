/**
 * Demo mode is deliberately opt-in in production. Local development remains
 * frictionless, while deployed instances must use a real identity provider.
 */
export const isProductionAuthConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export const isDemoMode = shouldEnableDemoMode({
  hasSupabaseCredentials: isProductionAuthConfigured,
  isDevelopment: import.meta.env.DEV,
  demoModeRequested: import.meta.env.VITE_DEMO_MODE === 'true',
});
import { shouldEnableDemoMode } from './deploymentGuard';

