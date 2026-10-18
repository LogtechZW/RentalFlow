import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  FolderArchive,
  Plus,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Building,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface DocumentItem {
  id: string;
  title: string;
  category: 'Lease Agreement' | 'Floor Plan' | 'Municipal Compliance' | 'Fire Safety' | 'Generator Service' | 'Tenant KYC';
  propertyName: string;
  fileSize: string;
  uploadedDate: string;
  uploadedBy: string;
  status: 'Verified' | 'Pending Review';
}

const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Joina City Ground Floor Master Retail CAD Layout',
    category: 'Floor Plan',
    propertyName: 'Joina City Commercial Complex',
    fileSize: '4.8 MB',
    uploadedDate: '2026-09-12',
    uploadedBy: 'Farai Moyo',
    status: 'Verified',
  },
  {
    id: 'doc-2',
    title: 'City of Harare Commercial Health & Safety Clearance 2026/2027',
    category: 'Municipal Compliance',
    propertyName: 'Eastgate Commercial Centre',
    fileSize: '1.2 MB',
    uploadedDate: '2026-08-30',
    uploadedBy: 'Tendai Mutasa',
    status: 'Verified',
  },
  {
    id: 'doc-3',
    title: 'Bakers Inn Zimbabwe 5-Year Anchor Lease Agreement (Executed)',
    category: 'Lease Agreement',
    propertyName: 'Joina City Commercial Complex',
    fileSize: '2.4 MB',
    uploadedDate: '2026-10-01',
    uploadedBy: 'Farai Moyo',
    status: 'Verified',
  },
  {
    id: 'doc-4',
    title: 'ZESA & Fire Brigade Escalator & Chiller Inspection Certificate',
    category: 'Fire Safety',
    propertyName: 'Eastgate Commercial Centre',
    fileSize: '890 KB',
    uploadedDate: '2026-07-15',
    uploadedBy: 'Tendai Mutasa',
    status: 'Verified',
  },
  {
    id: 'doc-5',
    title: 'Cummins 500 KVA Generator 1000-Hour Major Service Report',
    category: 'Generator Service',
    propertyName: 'Joina City Commercial Complex',
    fileSize: '3.1 MB',
    uploadedDate: '2026-10-05',
    uploadedBy: 'Diesel Power Zim',
    status: 'Verified',
  },
  {
    id: 'doc-6',
    title: "Chicken Inn Express Sam Levy's Village KYC & CR14 Reg Form",
    category: 'Tenant KYC',
    propertyName: "Sam Levy's Village Plaza",
    fileSize: '1.5 MB',
    uploadedDate: '2026-09-20',
    uploadedBy: 'Simbisa Brands',
    status: 'Verified',
  }
];

export const DocumentsPage: React.FC = () => {
  const { properties, activeRole } = useRentFlow();
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [viewingDoc, setViewingDoc] = useState<DocumentItem | null>(null);

  // Form states
  const [docTitle, setDocTitle] = useState<string>('');
  const [docCategory, setDocCategory] = useState<DocumentItem['category']>('Lease Agreement');
  const [docProp, setDocProp] = useState<string>(properties[0]?.name || 'Joina City');

  const filteredDocs = documents.filter(d => {
    if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
    if (searchQuery.trim() && !d.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) {
      toast.error('Document title is required.');
      return;
    }

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: docTitle.trim(),
      category: docCategory,
      propertyName: docProp,
      fileSize: '1.8 MB',
      uploadedDate: new Date().toISOString().split('T')[0],
      uploadedBy: activeRole,
      status: 'Verified'
    };

    setDocuments([newDoc, ...documents]);
    toast.success(`Document "${docTitle}" uploaded to repository!`);
    setIsUploadModalOpen(false);
    setDocTitle('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header breadcrumbs={[{ label: 'Documents' }]} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-foreground">
                Document Repository & Vault
              </h1>
              <Badge variant="outline" className="text-[11px] font-mono">
                {documents.length} Archival Files
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Secure institutional archive for commercial leases, floor blueprints, City of Harare permits, and KYC files.
            </p>
          </div>

          <Button size="sm" onClick={() => setIsUploadModalOpen(true)} className="h-9 text-xs flex items-center gap-1.5 shrink-0">
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-card border border-border rounded-md shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search documents by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px] h-9 text-xs">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Lease Agreement">Lease Agreement</SelectItem>
              <SelectItem value="Floor Plan">Floor Plan</SelectItem>
              <SelectItem value="Municipal Compliance">Municipal Compliance</SelectItem>
              <SelectItem value="Fire Safety">Fire Safety</SelectItem>
              <SelectItem value="Generator Service">Generator Service</SelectItem>
              <SelectItem value="Tenant KYC">Tenant KYC</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Documents Table */}
        <div className="w-full max-w-full overflow-x-auto border border-border rounded-md bg-card shadow-sm">
          <Table className="[&>div]:max-w-full text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Document Title</TableHead>
                <TableHead className="whitespace-nowrap">Category</TableHead>
                <TableHead className="whitespace-nowrap">Property</TableHead>
                <TableHead className="whitespace-nowrap">Size</TableHead>
                <TableHead className="whitespace-nowrap">Uploaded Date</TableHead>
                <TableHead className="whitespace-nowrap">Uploaded By</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocs.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-muted/50">
                  <TableCell className="whitespace-nowrap font-medium text-foreground max-w-sm truncate flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">{doc.title}</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant="outline" className="text-[10px] h-5">
                      {doc.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {doc.propertyName}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-[11px]">
                    {doc.fileSize}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-[11px]">
                    {doc.uploadedDate}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-[11px] text-muted-foreground">
                    {doc.uploadedBy}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant="secondary" className="text-[10px] h-5 border-emerald-300 text-emerald-700">
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingDoc(doc)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        title="Preview Document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.success(`Downloading ${doc.title}...`)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Document Preview Modal */}
      {viewingDoc && (
        <Dialog open={!!viewingDoc} onOpenChange={() => setViewingDoc(null)}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-serif">{viewingDoc.title}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {viewingDoc.category} • {viewingDoc.propertyName}
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 bg-muted/40 border border-border rounded text-center space-y-3">
              <FileText className="w-12 h-12 text-primary mx-auto opacity-80" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-foreground">Verified Digital Archive Copy</p>
                <p className="text-muted-foreground text-[11px]">File Size: {viewingDoc.fileSize} • Uploaded by {viewingDoc.uploadedBy} on {viewingDoc.uploadedDate}</p>
                <p className="text-[11px] text-emerald-700 font-medium">Compliance Seal: City of Harare & ZESA Authorized</p>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
              <Button variant="outline" size="sm" onClick={() => setViewingDoc(null)} className="h-8 text-xs">
                Close
              </Button>
              <Button size="sm" onClick={() => toast.success(`Downloading ${viewingDoc.title}...`)} className="h-8 text-xs flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Upload Document Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <form onSubmit={handleUpload}>
            <DialogHeader>
              <DialogTitle className="text-base font-serif">Upload Archival Document</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Store compliance certificates, floor plans, and commercial leases.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Document Title *</Label>
                <Input
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. 2026 Chiller Maintenance Contract"
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Category</Label>
                  <Select value={docCategory} onValueChange={(val) => setDocCategory(val as any)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lease Agreement">Lease Agreement</SelectItem>
                      <SelectItem value="Floor Plan">Floor Plan</SelectItem>
                      <SelectItem value="Municipal Compliance">Municipal Compliance</SelectItem>
                      <SelectItem value="Fire Safety">Fire Safety</SelectItem>
                      <SelectItem value="Generator Service">Generator Service</SelectItem>
                      <SelectItem value="Tenant KYC">Tenant KYC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Property</Label>
                  <Select value={docProp} onValueChange={setDocProp}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map(p => (
                        <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Select File</Label>
                <Input type="file" className="h-9 text-xs file:text-xs" />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsUploadModalOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs">
                Upload to Vault
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};
