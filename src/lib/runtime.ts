/**
 * Demo mode is deliberately opt-in in production. Local development remains
 * frictionless, while deployed instances must use a real identity provider.
 */
export const isProductionAuthConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export const isDemoMode = !isProductionAuthConfigured && (
  import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true'
);
