-- RentalFlow multi-tenant foundation. Run this migration in a new Supabase project.
-- All tenant-owned records are isolated by organisation_id and enforced with RLS.

create extension if not exists pgcrypto;

create type public.rentflow_role as enum ('administrator', 'property_manager', 'accountant', 'property_owner', 'tenant');
create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'cancelled');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 120),
  country_code text not null default 'ZW' check (country_code ~ '^[A-Z]{2}$'),
  currency_code text not null default 'USD' check (currency_code ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute procedure public.handle_new_user();

create table public.organization_memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.rentflow_role not null default 'property_manager',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null check (position('@' in email) > 1),
  role public.rentflow_role not null check (role <> 'tenant'),
  invited_by uuid not null references public.profiles(id) on delete restrict,
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index organization_invitations_pending_email_idx
  on public.organization_invitations (organization_id, lower(email))
  where accepted_at is null;

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  provider text not null check (provider in ('manual', 'paynow', 'stripe')),
  provider_customer_id text,
  provider_subscription_id text,
  plan_code text not null default 'starter',
  status public.subscription_status not null default 'trialing',
  seats integer not null default 3 check (seats > 0),
  trial_ends_at timestamptz,
  current_period_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The UI domain model is intentionally kept in one versioned JSON document while
-- RentalFlow transitions its legacy modules to normalized tables. This gives all
-- authorised organisation members one consistent workspace immediately, without
-- exposing another organisation's data through browser-local storage.
create table public.workspace_snapshots (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  portfolio_id uuid references public.portfolios(id) on delete set null,
  name text not null,
  code text not null,
  address text,
  city text,
  country_code text not null default 'ZW' check (country_code ~ '^[A-Z]{2}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  unit_number text not null,
  size_sqm numeric(12,2) not null default 0 check (size_sqm >= 0),
  base_rent numeric(14,2) not null default 0 check (base_rent >= 0),
  currency_code text not null default 'USD' check (currency_code ~ '^[A-Z]{3}$'),
  status text not null default 'vacant' check (status in ('vacant', 'occupied', 'under_maintenance')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, unit_number)
);

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  legal_name text not null,
  trading_name text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete restrict,
  space_id uuid not null references public.spaces(id) on delete restrict,
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  starts_on date not null,
  ends_on date not null check (ends_on > starts_on),
  rent_amount numeric(14,2) not null check (rent_amount >= 0),
  currency_code text not null default 'USD' check (currency_code ~ '^[A-Z]{3}$'),
  status text not null default 'draft' check (status in ('draft', 'active', 'terminated', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  lease_id uuid references public.leases(id) on delete set null,
  invoice_number text not null,
  issue_date date not null,
  due_date date not null,
  currency_code text not null default 'USD' check (currency_code ~ '^[A-Z]{3}$'),
  total_amount numeric(14,2) not null check (total_amount >= 0),
  status text not null default 'draft' check (status in ('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'void')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, invoice_number)
);

create table public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric(12,3) not null default 1 check (quantity > 0),
  unit_amount numeric(14,2) not null check (unit_amount >= 0),
  line_amount numeric(14,2) not null check (line_amount >= 0),
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null,
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  amount numeric(14,2) not null check (amount > 0),
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  method text not null,
  reference text not null,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (organization_id, reference)
);

create table public.maintenance_tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete restrict,
  space_id uuid references public.spaces(id) on delete set null,
  title text not null,
  description text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'emergency')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.organization_memberships (user_id);
create index on public.properties (organization_id);
create index on public.spaces (organization_id, property_id);
create index on public.leases (organization_id, tenant_id, status);
create index on public.invoices (organization_id, tenant_id, due_date);
create index on public.payments (organization_id, tenant_id, paid_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create or replace function public.is_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.organization_memberships where organization_id = target_org and user_id = auth.uid());
$$;

revoke all on function public.is_org_member(uuid) from public;
grant execute on function public.is_org_member(uuid) to authenticated;

create or replace function public.is_org_manager(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.organization_memberships
    where organization_id = target_org and user_id = auth.uid()
      and role in ('administrator', 'property_manager', 'accountant', 'property_owner'));
$$;

revoke all on function public.is_org_manager(uuid) from public;
grant execute on function public.is_org_manager(uuid) to authenticated;

create or replace function public.create_organization_with_admin(
  organization_name text,
  organization_country_code text default 'ZW',
  organization_currency_code text default 'USD'
)
returns uuid language plpgsql security definer set search_path = public as $$
declare organization_uuid uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if char_length(trim(organization_name)) < 2 then raise exception 'Organization name is required'; end if;

  insert into public.organizations (name, country_code, currency_code, created_by)
  values (trim(organization_name), organization_country_code, organization_currency_code, auth.uid())
  returning id into organization_uuid;

  insert into public.organization_memberships (organization_id, user_id, role)
  values (organization_uuid, auth.uid(), 'administrator');

  insert into public.subscriptions (organization_id, provider, plan_code, status, seats, trial_ends_at)
  values (organization_uuid, 'manual', 'starter', 'trialing', 3, now() + interval '14 days');

  return organization_uuid;
end; $$;

revoke all on function public.create_organization_with_admin(text, text, text) from public;
grant execute on function public.create_organization_with_admin(text, text, text) to authenticated;

create or replace function public.create_organization_invitation(
  target_organization_id uuid,
  invitee_email text,
  invited_role public.rentflow_role
)
returns uuid language plpgsql security definer set search_path = public as $$
declare invitation_uuid uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.is_org_manager(target_organization_id) then raise exception 'Staff management permission required'; end if;
  if invited_role = 'tenant' then raise exception 'Tenant invitations require the tenant portal workflow'; end if;
  if position('@' in trim(invitee_email)) <= 1 then raise exception 'A valid email address is required'; end if;

  insert into public.organization_invitations (organization_id, email, role, invited_by)
  values (target_organization_id, lower(trim(invitee_email)), invited_role, auth.uid())
  on conflict (organization_id, lower(email)) where accepted_at is null
  do update set role = excluded.role, invited_by = excluded.invited_by, expires_at = now() + interval '7 days', created_at = now()
  returning id into invitation_uuid;

  return invitation_uuid;
end; $$;

revoke all on function public.create_organization_invitation(uuid, text, public.rentflow_role) from public;
grant execute on function public.create_organization_invitation(uuid, text, public.rentflow_role) to authenticated;

create or replace function public.accept_pending_organization_invitations()
returns integer language plpgsql security definer set search_path = public as $$
declare accepted_count integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;

  with pending as (
    select id, organization_id, role
    from public.organization_invitations
    where accepted_at is null
      and expires_at > now()
      and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ), memberships as (
    insert into public.organization_memberships (organization_id, user_id, role)
    select organization_id, auth.uid(), role from pending
    on conflict (organization_id, user_id) do nothing
    returning organization_id
  ), marked as (
    update public.organization_invitations invitation
    set accepted_at = now()
    where invitation.id in (select id from pending)
    returning invitation.id
  )
  select count(*) into accepted_count from marked;

  return accepted_count;
end; $$;

revoke all on function public.accept_pending_organization_invitations() from public;
grant execute on function public.accept_pending_organization_invitations() to authenticated;

-- Owner bootstrap: the authenticated user may create an organisation, then add themselves as administrator.
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.organization_invitations enable row level security;
alter table public.subscriptions enable row level security;
alter table public.workspace_snapshots enable row level security;
alter table public.portfolios enable row level security;
alter table public.properties enable row level security;
alter table public.spaces enable row level security;
alter table public.tenants enable row level security;
alter table public.leases enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.payments enable row level security;
alter table public.maintenance_tickets enable row level security;

create policy "profiles are self readable" on public.profiles for select using (id = auth.uid());
create policy "profiles are self editable" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "members read organizations" on public.organizations for select using (public.is_org_member(id));
create policy "authenticated create organizations" on public.organizations for insert to authenticated with check (created_by = auth.uid());
create policy "managers update organizations" on public.organizations for update using (public.is_org_manager(id));
create policy "members read memberships" on public.organization_memberships for select using (public.is_org_member(organization_id));
create policy "creator becomes first administrator" on public.organization_memberships for insert to authenticated with check (
  user_id = auth.uid() and role = 'administrator' and exists (
    select 1 from public.organizations where id = organization_id and created_by = auth.uid()
  )
);
create policy "managers manage memberships" on public.organization_memberships for all using (public.is_org_manager(organization_id)) with check (public.is_org_manager(organization_id));
create policy "staff read organization invitations" on public.organization_invitations for select using (public.is_org_manager(organization_id));
create policy "staff read subscriptions" on public.subscriptions for select using (public.is_org_manager(organization_id));
create policy "staff read workspace snapshots" on public.workspace_snapshots for select using (public.is_org_manager(organization_id));
create policy "managers mutate workspace snapshots" on public.workspace_snapshots for all using (public.is_org_manager(organization_id)) with check (public.is_org_manager(organization_id));

do $$
declare tab text;
begin
  foreach tab in array array['portfolios','properties','spaces','tenants','leases','invoices','invoice_line_items','payments','maintenance_tickets'] loop
    execute format('create policy "staff access %1$s" on public.%1$I for select using (public.is_org_manager(organization_id))', tab);
    execute format('create policy "managers mutate %1$s" on public.%1$I for all using (public.is_org_manager(organization_id)) with check (public.is_org_manager(organization_id))', tab);
  end loop;
end $$;

create trigger organizations_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();
create trigger workspace_snapshots_updated_at before update on public.workspace_snapshots for each row execute function public.set_updated_at();
create trigger portfolios_updated_at before update on public.portfolios for each row execute function public.set_updated_at();
create trigger properties_updated_at before update on public.properties for each row execute function public.set_updated_at();
create trigger spaces_updated_at before update on public.spaces for each row execute function public.set_updated_at();
create trigger tenants_updated_at before update on public.tenants for each row execute function public.set_updated_at();
create trigger leases_updated_at before update on public.leases for each row execute function public.set_updated_at();
create trigger invoices_updated_at before update on public.invoices for each row execute function public.set_updated_at();
create trigger maintenance_tickets_updated_at before update on public.maintenance_tickets for each row execute function public.set_updated_at();
