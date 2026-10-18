import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Grid, Shield, LogOut, ChevronRight } from 'lucide-react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { UserRole } from '@/types/rentflow';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
  isAppsHub?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ breadcrumbs = [], isAppsHub = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    corporateLogo,
    activeRole,
    setActiveRole,
    currentUser,
    signOut,
    rbzExchangeRate
  } = useRentFlow();

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
  };

  const handleSignOut = () => {
    void signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A1128]/95 backdrop-blur-2xl border-b border-white/[0.07] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Navigation Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          <Link to="/apps" className="flex items-center space-x-3 shrink-0 group">
            <img
              src={corporateLogo}
              alt="RentFlowPro Logo"
              className="h-9 w-auto max-w-[140px] sm:max-w-[170px] object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {!isAppsHub && (
            <div className="flex items-center space-x-2 pl-2 border-l border-white/[0.07]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="h-8 px-2.5 text-xs font-medium flex items-center gap-1 bg-[#101C40]/50 hover:bg-[#101C40] border-white/[0.07] text-slate-200 rounded-[6px]"
                title="Back to Previous Page"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/apps')}
                className="h-8 px-2.5 text-xs font-medium flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-[6px]"
                title="Return to Apps Hub"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Apps Hub</span>
              </Button>
            </div>
          )}

          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && !isAppsHub && (
            <nav className="hidden md:flex items-center space-x-1.5 text-xs text-slate-400 ml-3 truncate">
              <Link to="/apps" className="hover:text-slate-200 transition-colors">
                Apps
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="w-3 h-3 shrink-0 opacity-40 text-slate-500" />
                  {crumb.href && idx < breadcrumbs.length - 1 ? (
                    <Link to={crumb.href} className="hover:text-slate-200 transition-colors truncate max-w-[120px]">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-slate-200 truncate max-w-[160px]">
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
        </div>

        {/* Right: Currency Indicator, Role Switcher, Account */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <Badge variant="outline" className="hidden lg:flex items-center gap-1 text-[11px] font-mono py-1 px-2.5 border-white/[0.07] bg-[#101C40]/60 text-slate-300 rounded-[6px]">
            <span className="text-slate-400">RBZ:</span>
            <span className="font-semibold text-slate-100">1 USD = {rbzExchangeRate} ZiG</span>
          </Badge>

          {/* Role Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs gap-1.5 bg-[#101C40]/50 hover:bg-[#101C40] border-white/[0.07] text-slate-200 rounded-[6px]">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline font-medium">{activeRole}</span>
                <span className="sm:hidden font-medium">{activeRole.split(' ')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Active Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(currentUser?.availableRoles ?? [activeRole]).map((r) => (
                <DropdownMenuItem
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`text-xs cursor-pointer flex items-center justify-between ${
                    activeRole === r ? 'font-semibold bg-muted' : ''
                  }`}
                >
                  <span>{r}</span>
                  {activeRole === r && <Badge variant="secondary" className="text-[10px] h-4">Active</Badge>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile & Sign Out */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 gap-2 hover:bg-muted">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden lg:inline text-xs font-medium text-foreground truncate max-w-[100px]">
                  {currentUser?.name || 'User'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal">
                <div className="text-xs font-semibold text-foreground">{currentUser?.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{currentUser?.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')} className="text-xs cursor-pointer">
                Settings & Preferences
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/about')} className="text-xs cursor-pointer">
                About RentFlow
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-xs text-destructive cursor-pointer flex items-center gap-1.5">
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
