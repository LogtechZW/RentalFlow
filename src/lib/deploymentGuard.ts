export interface DeploymentModeInput {
  hasSupabaseCredentials: boolean;
  isDevelopment: boolean;
  demoModeRequested: boolean;
}

/**
 * Demo data must never be available once real Supabase credentials are present.
 * This makes an accidentally retained VITE_DEMO_MODE flag harmless in production.
 */
export function shouldEnableDemoMode({
  hasSupabaseCredentials,
  isDevelopment,
  demoModeRequested,
}: DeploymentModeInput): boolean {
  return !hasSupabaseCredentials && (isDevelopment || demoModeRequested);
}
