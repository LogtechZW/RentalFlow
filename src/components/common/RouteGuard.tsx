import { Navigate, useLocation } from 'react-router-dom';
import { useRentFlow } from '@/contexts/RentFlowContext';
import { routes } from '@/routes';

interface RouteGuardProps {
  children: React.ReactNode;
}

// System-level public routes (no need to register in routes.tsx)
const SYSTEM_PUBLIC_ROUTES = ['/login', '/403', '/404'];

// Derived from routes.tsx: all routes marked with public: true
const routePublicPaths = routes.filter(r => r.public).map(r => r.path);

const PUBLIC_ROUTES = [...SYSTEM_PUBLIC_ROUTES, ...routePublicPaths];

function matchPublicRoute(path: string, patterns: string[]) {
  return patterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
      return regex.test(path);
    }
    return path === pattern;
  });
}

export function RouteGuard({ children }: RouteGuardProps) {
  const location = useLocation();
  const { isAuthenticated, authLoading, organizationId, workspaceLoading } = useRentFlow();
  const isPublic = matchPublicRoute(location.pathname, PUBLIC_ROUTES);

  if ((authLoading || (isAuthenticated && workspaceLoading)) && !isPublic) {
    return <div className="flex min-h-screen items-center justify-center" aria-label="Loading secure session"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  if (!isAuthenticated && !isPublic) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  if (isAuthenticated && !organizationId && !isPublic && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
