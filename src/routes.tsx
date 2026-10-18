import React from 'react';
import type { ReactNode } from 'react';
import { SplashPage } from './pages/SplashPage';
import { SignInPage } from './pages/SignInPage';
import { RegisterPage } from './pages/RegisterPage';
import { AppsHubPage } from './pages/AppsHubPage';
import { DashboardPage } from './pages/DashboardPage';
import { PortfoliosPage } from './pages/PortfoliosPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { TenantsPage } from './pages/TenantsPage';
import { LeasesPage } from './pages/LeasesPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { TurnoverRentPage } from './pages/TurnoverRentPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { InfrastructurePage } from './pages/InfrastructurePage';
import { ReportsPage } from './pages/ReportsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { WhatsAppDispatcherPage } from './pages/WhatsAppDispatcherPage';
import { MeterReadingsPage } from './pages/MeterReadingsPage';
import { OrganizationSetupPage } from './pages/OrganizationSetupPage';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: 'Splash',
    path: '/',
    element: <SplashPage />,
    public: true,
  },
  {
    name: 'Splash Alias',
    path: '/splash',
    element: <SplashPage />,
    public: true,
  },
  {
    name: 'Sign In',
    path: '/signin',
    element: <SignInPage />,
    public: true,
  },
  {
    name: 'Login Alias',
    path: '/login',
    element: <SignInPage />,
    public: true,
  },
  {
    name: 'Register',
    path: '/register',
    element: <RegisterPage />,
    public: true,
  },
  {
    name: 'Apps Hub',
    path: '/apps',
    element: <AppsHubPage />,
  },
  {
    name: 'Organization Setup',
    path: '/onboarding',
    element: <OrganizationSetupPage />,
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    name: 'Portfolios',
    path: '/portfolios',
    element: <PortfoliosPage />,
  },
  {
    name: 'Properties',
    path: '/properties',
    element: <PropertiesPage />,
  },
  {
    name: 'Tenants',
    path: '/tenants',
    element: <TenantsPage />,
  },
  {
    name: 'Leases',
    path: '/leases',
    element: <LeasesPage />,
  },
  {
    name: 'Invoices & Charges',
    path: '/invoices',
    element: <InvoicesPage />,
  },
  {
    name: 'Payments',
    path: '/payments',
    element: <PaymentsPage />,
  },
  {
    name: 'Turnover Rent',
    path: '/turnover-rent',
    element: <TurnoverRentPage />,
  },
  {
    name: 'Maintenance',
    path: '/maintenance',
    element: <MaintenancePage />,
  },
  {
    name: 'Infrastructure & CAM',
    path: '/infrastructure',
    element: <InfrastructurePage />,
  },
  {
    name: 'Sub-Meter Readings & Utilities',
    path: '/meter-readings',
    element: <MeterReadingsPage />,
  },
  {
    name: 'Sub-Meters Alias',
    path: '/meters',
    element: <MeterReadingsPage />,
  },
  {
    name: 'Reports & Analytics',
    path: '/reports',
    element: <ReportsPage />,
  },
  {
    name: 'Documents',
    path: '/documents',
    element: <DocumentsPage />,
  },
  {
    name: 'Integrations & Gateways',
    path: '/integrations',
    element: <IntegrationsPage />,
  },
  {
    name: 'Settings',
    path: '/settings',
    element: <SettingsPage />,
  },
  {
    name: 'WhatsApp Reminders',
    path: '/whatsapp',
    element: <WhatsAppDispatcherPage />,
  },
  {
    name: 'About',
    path: '/about',
    element: <AboutPage />,
  },
];
