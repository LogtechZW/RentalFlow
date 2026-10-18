import { describe, expect, it } from 'vitest';
import { shouldEnableDemoMode } from './deploymentGuard';

describe('shouldEnableDemoMode', () => {
  it('never enables demo mode when Supabase credentials are configured', () => {
    expect(shouldEnableDemoMode({
      hasSupabaseCredentials: true,
      isDevelopment: true,
      demoModeRequested: true,
    })).toBe(false);
  });

  it('permits local development without production credentials', () => {
    expect(shouldEnableDemoMode({
      hasSupabaseCredentials: false,
      isDevelopment: true,
      demoModeRequested: false,
    })).toBe(true);
  });

  it('requires an explicit demo flag outside development', () => {
    expect(shouldEnableDemoMode({
      hasSupabaseCredentials: false,
      isDevelopment: false,
      demoModeRequested: false,
    })).toBe(false);
  });
});
