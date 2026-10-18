const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const missing = required.filter((name) => !process.env[name]?.trim());
const problems = [];

if (missing.length) {
  problems.push(`Missing required environment variables: ${missing.join(', ')}`);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
if (supabaseUrl && (!supabaseUrl.startsWith('https://') || supabaseUrl.includes('your-project'))) {
  problems.push('VITE_SUPABASE_URL must be a real HTTPS Supabase project URL.');
}

const anonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim();
if (anonKey && anonKey.includes('your-public')) {
  problems.push('VITE_SUPABASE_ANON_KEY is still a placeholder.');
}

if (process.env.VITE_DEMO_MODE === 'true') {
  problems.push('VITE_DEMO_MODE must not be true in production.');
}

if (problems.length) {
  console.error('RentalFlow production preflight failed:');
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

if (!process.env.VITE_SENTRY_DSN?.trim()) {
  console.warn('RentalFlow production preflight warning: VITE_SENTRY_DSN is not configured. Error reporting will be disabled.');
}

console.log('RentalFlow production environment preflight passed.');
