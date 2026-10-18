import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRentFlow } from '@/contexts/RentFlowContext';
import { supabase } from '@/lib/supabase';

export function OrganizationSetupPage() {
  const navigate = useNavigate();
  const { currentUser } = useRentFlow();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabase || !currentUser) return;
    void supabase
      .from('organization_memberships')
      .select('organization_id')
      .eq('user_id', currentUser.id)
      .limit(1)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) navigate('/apps', { replace: true });
      });
  }, [currentUser, navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) {
      toast.error('Organization setup requires a configured Supabase project.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc('create_organization_with_admin', {
      organization_name: name,
      organization_country_code: 'ZW',
      organization_currency_code: 'USD',
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Workspace created. Your 14-day Starter trial has begun.');
    navigate('/apps', { replace: true });
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:py-16">
      <section className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur sm:p-10">
        <div className="mb-8 flex items-start gap-4">
          <div className="rounded-xl bg-blue-500/15 p-3 text-blue-300"><Building2 /></div>
          <div>
            <p className="text-sm font-medium text-blue-300">Step 1 of 3</p>
            <h1 className="text-2xl font-semibold tracking-tight">Create your RentalFlow workspace</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">Your workspace keeps your properties, tenants and financial records separate from every other organisation.</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="organization-name">Organisation name</Label>
            <Input id="organization-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Example Property Holdings" minLength={2} required />
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            <div className="mb-1 flex items-center gap-2 font-medium"><CheckCircle2 className="h-4 w-4" /> Starter trial included</div>
            14 days, 3 staff seats and 1 property. You can add portfolio details after setup.
          </div>
          <Button className="w-full" type="submit" disabled={saving}>
            {saving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create secure workspace
          </Button>
        </form>
      </section>
    </main>
  );
}
