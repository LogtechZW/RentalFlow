import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { MaintenanceTicket } from '@/types/rentflow';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Wrench,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

export const MaintenancePage: React.FC = () => {
  const {
    maintenanceTickets,
    properties,
    addMaintenanceTicket,
    updateMaintenanceTicket,
    bulkDeleteMaintenanceTickets,
    deleteMaintenanceTicket,
    rbzExchangeRate,
    activeRole
  } = useRentFlow();

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<MaintenanceTicket | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Form states
  const [title, setTitle] = useState<string>('');
  const [propId, setPropId] = useState<string>(properties[0]?.id || 'prop-1');
  const [category, setCategory] = useState<MaintenanceTicket['category']>('Electrical');
  const [priority, setPriority] = useState<MaintenanceTicket['priority']>('High');
  const [description, setDescription] = useState<string>('');
  const [estimatedCostUSD, setEstimatedCostUSD] = useState<string>('350');

  const canManage = ['Property Manager', 'Administrator'].includes(activeRole);

  const filteredTickets = maintenanceTickets.filter(t => {
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required.');
      return;
    }
    const prop = properties.find(p => p.id === propId);
    const est = parseFloat(estimatedCostUSD) || 0;

    addMaintenanceTicket({
      propertyId: propId,
      propertyName: prop?.name || 'Property',
      category,
      priority,
      title: title.trim(),
      description: description.trim() || 'Preventative commercial maintenance work order.',
      status: 'Open',
      reportedBy: activeRole,
      costUSD: est,
    });

    toast.success(`Work Order "${title}" logged!`);
    setIsAddModalOpen(false);
  };

  const handleToggleStatus = (ticket: MaintenanceTicket) => {
    const nextStatus: MaintenanceTicket['status'] =
      ticket.status === 'Open' ? 'In Progress' :
      ticket.status === 'In Progress' ? 'Resolved' :
      ticket.status === 'Resolved' ? 'Closed' : 'Open';

    updateMaintenanceTicket(ticket.id, {
      status: nextStatus,
      resolvedAt: nextStatus === 'Resolved' || nextStatus === 'Closed' ? new Date().toISOString().split('T')[0] : undefined
    });
    toast.success(`Work Order #${ticket.ticketNumber} marked as ${nextStatus}.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header breadcrumbs={[{ label: 'Maintenance' }]} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-foreground">
                Maintenance & Asset Work Orders
              </h1>
              <Badge variant="outline" className="text-[11px] font-mono">
                {maintenanceTickets.length} Work Orders
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Escalators, elevators, chillers, electrical boards, and emergency generator service dispatch.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Plumbing">Plumbing</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="HVAC">HVAC / Chiller</SelectItem>
                <SelectItem value="Elevator">Elevator / Escalator</SelectItem>
                <SelectItem value="Generator">Generator Plant</SelectItem>
                <SelectItem value="Structural">Structural / Roof</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="h-9 text-xs flex items-center gap-1.5 shrink-0">
              <Plus className="w-4 h-4" />
              <span>Log Work Order</span>
            </Button>

            {maintenanceTickets.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 text-xs border-destructive/40 text-destructive hover:bg-destructive/10 flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete All</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-base font-serif">Delete All Maintenance Tickets?</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-muted-foreground">
                      This will remove all work order records and statutory maintenance histories.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => { bulkDeleteMaintenanceTickets(); toast.success('All tickets wiped.'); }} className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Confirm Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Work Orders Table */}
        <div className="w-full max-w-full overflow-x-auto border border-border rounded-md bg-card shadow-sm">
          <Table className="[&>div]:max-w-full text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">WO #</TableHead>
                <TableHead className="whitespace-nowrap">Title & Description</TableHead>
                <TableHead className="whitespace-nowrap">Property</TableHead>
                <TableHead className="whitespace-nowrap">Category</TableHead>
                <TableHead className="whitespace-nowrap">Priority</TableHead>
                <TableHead className="whitespace-nowrap">Reported By</TableHead>
                <TableHead className="whitespace-nowrap text-right">Cost (USD)</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((t) => (
                <TableRow key={t.id} className="hover:bg-muted/50">
                  <TableCell className="whitespace-nowrap font-mono font-semibold text-foreground">
                    {t.ticketNumber}
                  </TableCell>
                  <TableCell className="whitespace-nowrap max-w-xs">
                    <div className="font-semibold text-foreground truncate">{t.title}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{t.description}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {t.propertyName}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant="outline" className="text-[10px] h-5">
                      {t.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant={t.priority === 'Emergency' ? 'destructive' : t.priority === 'High' ? 'default' : 'secondary'}
                      className="text-[10px] h-5"
                    >
                      {t.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-[11px] text-foreground">
                    {t.reportedBy}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right font-mono font-semibold text-foreground">
                    ${(t.costUSD || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant={t.status === 'Resolved' || t.status === 'Closed' ? 'outline' : 'secondary'}
                      className={`text-[10px] h-5 ${t.status === 'Resolved' || t.status === 'Closed' ? 'border-emerald-300 text-emerald-700' : ''}`}
                    >
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(t)}
                        className="h-7 text-xs text-primary hover:underline"
                      >
                        {t.status === 'Open' ? 'Start' : t.status === 'In Progress' ? 'Resolve' : t.status === 'Resolved' ? 'Close' : 'Reopen'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTicket(t)}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        title="View Work Order"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTicketToDelete(t)}
                        className="h-7 px-2 text-xs text-rose-500 hover:text-rose-700"
                        title="Delete Ticket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Log Work Order Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <form onSubmit={handleCreateTicket}>
            <DialogHeader>
              <DialogTitle className="text-base font-serif flex items-center gap-2">
                <Wrench className="w-4 h-4 text-primary" />
                Log Maintenance Work Order
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Dispatch internal technical teams or specialized commercial contractors.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Issue Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chiller Condenser Pump Overhaul"
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Commercial Property</Label>
                  <Select value={propId} onValueChange={setPropId}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Category</Label>
                  <Select value={category} onValueChange={(val) => setCategory(val as any)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Plumbing">Plumbing</SelectItem>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="HVAC">HVAC / Chiller</SelectItem>
                      <SelectItem value="Elevator">Elevator / Escalator</SelectItem>
                      <SelectItem value="Generator">Generator Plant</SelectItem>
                      <SelectItem value="Structural">Structural / Roof</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Priority</Label>
                  <Select value={priority} onValueChange={(val) => setPriority(val as any)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Est. Cost (USD)</Label>
                  <Input
                    type="number"
                    value={estimatedCostUSD}
                    onChange={(e) => setEstimatedCostUSD(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Description & Scope</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="text-xs resize-none"
                  placeholder="Detail symptoms, affected floor/wing, and parts required..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs">
                Log Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Inspection Modal with In-Page Switching & Universal Actions */}
      {selectedTicket && (() => {
        const ticketIdx = filteredTickets.findIndex(t => t.id === selectedTicket.id);
        const hasPrev = ticketIdx > 0;
        const hasNext = ticketIdx >= 0 && ticketIdx < filteredTickets.length - 1;

        return (
          <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
            <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md text-xs space-y-3">
              {/* In-Page Switching Bar */}
              <div className="flex items-center justify-between bg-muted/60 p-2 rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!hasPrev}
                  onClick={() => setSelectedTicket(filteredTickets[ticketIdx - 1])}
                  className="h-7 px-2 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev WO</span>
                </Button>

                <span className="text-[11px] font-mono text-muted-foreground">
                  Work Order {ticketIdx >= 0 ? ticketIdx + 1 : 1} of {filteredTickets.length}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!hasNext}
                  onClick={() => setSelectedTicket(filteredTickets[ticketIdx + 1])}
                  className="h-7 px-2 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <span>Next WO</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              <DialogHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <DialogTitle className="font-serif text-base">{selectedTicket.title}</DialogTitle>
                    <DialogDescription className="text-xs font-mono">{selectedTicket.ticketNumber} • {selectedTicket.propertyName}</DialogDescription>
                  </div>
                  <Badge
                    variant={selectedTicket.priority === 'Emergency' ? 'destructive' : selectedTicket.priority === 'High' ? 'default' : 'secondary'}
                    className="text-[10px]"
                  >
                    {selectedTicket.priority}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-2 py-1">
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded bg-muted/40 border border-border/60">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Category</span>
                    <span className="font-semibold text-foreground">{selectedTicket.category}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Status</span>
                    <span className="font-semibold text-foreground">{selectedTicket.status}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Estimated Cost</span>
                    <span className="font-mono text-foreground font-semibold">${(selectedTicket.costUSD || 0).toLocaleString()} USD</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">ZiG Equivalent</span>
                    <span className="font-mono text-foreground">ZiG {((selectedTicket.costUSD || 0) * rbzExchangeRate).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Reported By</span>
                    <span className="text-foreground">{selectedTicket.reportedBy}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Created Date</span>
                    <span className="font-mono text-foreground">{selectedTicket.createdAt}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground block text-[10px] mb-1">Scope & Description</span>
                  <p className="text-xs text-foreground leading-relaxed">{selectedTicket.description}</p>
                </div>
              </div>

              <DialogFooter className="flex items-center justify-between sm:justify-between border-t border-border/60 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    deleteMaintenanceTicket(selectedTicket.id);
                    toast.success(`Ticket ${selectedTicket.ticketNumber} deleted.`);
                    setSelectedTicket(null);
                  }}
                  className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete Ticket
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      handleToggleStatus(selectedTicket);
                      setSelectedTicket({
                        ...selectedTicket,
                        status: selectedTicket.status === 'Open' ? 'In Progress' : selectedTicket.status === 'In Progress' ? 'Resolved' : selectedTicket.status === 'Resolved' ? 'Closed' : 'Open'
                      });
                    }}
                    className="h-8 text-xs bg-primary text-primary-foreground"
                  >
                    Update Status ({selectedTicket.status === 'Open' ? 'Start' : selectedTicket.status === 'In Progress' ? 'Resolve' : selectedTicket.status === 'Resolved' ? 'Close' : 'Reopen'})
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)} className="h-8 text-xs">
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* Delete Maintenance Ticket Alert Dialog */}
      <AlertDialog open={!!ticketToDelete} onOpenChange={(open) => !open && setTicketToDelete(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-serif">
              Delete Work Order "{ticketToDelete?.ticketNumber}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete this maintenance ticket ({ticketToDelete?.title})?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (ticketToDelete) {
                  deleteMaintenanceTicket(ticketToDelete.id);
                  toast.success(`Work order ${ticketToDelete.ticketNumber} deleted.`);
                  if (selectedTicket?.id === ticketToDelete.id) {
                    setSelectedTicket(null);
                  }
                  setTicketToDelete(null);
                }
              }}
              className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};
