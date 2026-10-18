import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRentFlow } from '@/contexts/RentFlowContext';
import { SYSTEM_MODULES, PREDEFINED_WORKFLOW_CATEGORIES } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Rocket,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';

export const AppFlowProLauncher: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeRole,
    isMonthEndActive,
    setMonthEndActive,
    customWorkflows,
    addCustomWorkflow,
    deleteCustomWorkflow
  } = useRentFlow();

  const [selectedCategory, setSelectedCategory] = useState<string>('wf-billing');
  const [selectedModules, setSelectedModules] = useState<string[]>(['invoices', 'payments', 'turnover-rent']);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newGroupingName, setNewGroupingName] = useState<string>('');
  const [newGroupingModuleIds, setNewGroupingModuleIds] = useState<string[]>([]);

  // Filter modules accessible to current role
  const allowedModules = SYSTEM_MODULES.filter(m => m.allowedRoles.includes(activeRole));
  const isPrivilegedRole = ['Property Manager', 'Accountant', 'Administrator'].includes(activeRole);

  const handleLaunchWorkflow = (moduleIds: string[]) => {
    if (moduleIds.length === 0) {
      toast.error('Select at least one module to launch.');
      return;
    }
    const target = SYSTEM_MODULES.find(m => m.id === moduleIds[0]);
    if (target) {
      toast.success(`Launching coordinated workflow: ${moduleIds.join(' + ')}`);
      navigate(target.path);
    }
  };

  const handleToggleModule = (modId: string) => {
    setSelectedModules(prev =>
      prev.includes(modId) ? prev.filter(id => id !== modId) : [...prev, modId]
    );
  };

  const handleToggleNewModule = (modId: string) => {
    setNewGroupingModuleIds(prev =>
      prev.includes(modId) ? prev.filter(id => id !== modId) : [...prev, modId]
    );
  };

  const handleSaveCustomGrouping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupingName.trim()) {
      toast.error('Please enter a name for your workflow grouping.');
      return;
    }
    if (newGroupingModuleIds.length < 2) {
      toast.error('Please select at least 2 modules for the custom grouping.');
      return;
    }
    addCustomWorkflow(newGroupingName.trim(), newGroupingModuleIds);
    toast.success(`Custom grouping "${newGroupingName}" saved!`);
    setNewGroupingName('');
    setNewGroupingModuleIds([]);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="bg-card/95 border border-border/80 backdrop-blur-md rounded-lg p-5 shadow-lg space-y-4">
      {/* Top Header of Launcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
            <Rocket className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-serif font-bold text-foreground">
                AppFlowPro Launcher
              </h3>
              <Badge variant="outline" className="text-[10px] font-mono py-0">v2.4</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Simultaneously coordinate interconnected operational workflows
            </p>
          </div>
        </div>

        {/* Month-End Billing Trigger Notification Badge & One-Click Launch */}
        {isPrivilegedRole && (
          <div className="flex items-center space-x-2">
            {isMonthEndActive ? (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-300 dark:bg-rose-950/40 dark:border-rose-800 px-3 py-1.5 rounded-md">
                <Calendar className="w-4 h-4 text-rose-600 animate-pulse" />
                <div className="text-left">
                  <div className="text-[11px] font-semibold text-rose-900 dark:text-rose-200">
                    Month-End Billing Cycle Active
                  </div>
                  <div className="text-[10px] text-rose-700 dark:text-rose-300">
                    Invoicing & reconciliation due
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleLaunchWorkflow(['invoices', 'payments', 'reports'])}
                  className="h-7 text-xs bg-rose-700 hover:bg-rose-800 text-white ml-1 px-2.5 shadow-sm"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Launch Month-End Flow
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMonthEndActive(true)}
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                title="Test trigger month-end window"
              >
                Simulate Month-End Trigger
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="h-8 text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Grouping</span>
            </Button>
          </div>
        )}
      </div>

      {/* Predefined Categories Tabs */}
      <div className="space-y-3">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
          Predefined Workflow Categories
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {PREDEFINED_WORKFLOW_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const accessibleInCat = cat.moduleIds.filter(id => allowedModules.some(m => m.id === id));
            if (accessibleInCat.length < 2) return null;

            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedModules(accessibleInCat);
                }}
                className={`p-3 rounded-md border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-muted/40 hover:bg-muted/80 border-border/70 text-card-foreground'
                }`}
              >
                <div className="font-semibold text-xs truncate">{cat.name}</div>
                <div className={`text-[10px] line-clamp-2 mt-1 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {cat.description}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {accessibleInCat.map(mid => (
                    <span
                      key={mid}
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        isSelected
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-background border border-border/60 text-foreground'
                      }`}
                    >
                      {SYSTEM_MODULES.find(m => m.id === mid)?.name || mid}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Custom Workflow Groupings */}
      {customWorkflows.length > 0 && (
        <div className="pt-2 border-t border-border/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Custom User-Defined Groupings ({customWorkflows.length})
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {customWorkflows.map((cwf) => (
              <div
                key={cwf.id}
                className="p-3 bg-muted/30 border border-border/80 rounded-md flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-foreground truncate">{cwf.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {cwf.moduleIds.map(id => SYSTEM_MODULES.find(m => m.id === id)?.name || id).join(', ')}
                  </div>
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleLaunchWorkflow(cwf.moduleIds)}
                    className="h-7 text-xs px-2"
                  >
                    Launch
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteCustomWorkflow(cwf.id)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Module Selector & Launch Action */}
      <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground mr-1">Modules in session:</span>
          {allowedModules.map((mod) => {
            const isChecked = selectedModules.includes(mod.id);
            return (
              <label
                key={mod.id}
                className={`flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded border cursor-pointer select-none transition-colors ${
                  isChecked
                    ? 'bg-primary/10 border-primary text-primary font-medium'
                    : 'bg-background border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => handleToggleModule(mod.id)}
                  className="w-3.5 h-3.5"
                />
                <span>{mod.name}</span>
              </label>
            );
          })}
        </div>

        <Button
          onClick={() => handleLaunchWorkflow(selectedModules)}
          disabled={selectedModules.length === 0}
          className="h-9 px-5 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shrink-0"
        >
          <span>Launch Selected Flow</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Create Custom Grouping Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <form onSubmit={handleSaveCustomGrouping}>
            <DialogHeader>
              <DialogTitle className="text-base font-serif">Create Custom Workflow Grouping</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Combine two or more modules that you frequently operate together in commercial property management.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="group-name" className="text-xs">Grouping Name *</Label>
                <Input
                  id="group-name"
                  placeholder="e.g. Daily Operations & Metering"
                  value={newGroupingName}
                  onChange={(e) => setNewGroupingName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Select Modules (Minimum 2) *</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-md bg-muted/20">
                  {allowedModules.map((mod) => (
                    <label
                      key={mod.id}
                      className="flex items-center space-x-2 text-xs cursor-pointer p-1 rounded hover:bg-muted"
                    >
                      <Checkbox
                        checked={newGroupingModuleIds.includes(mod.id)}
                        onCheckedChange={() => handleToggleNewModule(mod.id)}
                      />
                      <span className="truncate">{mod.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs">
                Save Grouping
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
