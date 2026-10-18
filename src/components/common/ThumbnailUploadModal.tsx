import React, { useState } from 'react';
import { useRentFlow } from '@/contexts/RentFlowContext';
import type { SystemModuleConfig } from '@/services/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, RotateCcw, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ThumbnailUploadModalProps {
  module: SystemModuleConfig | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ThumbnailUploadModal: React.FC<ThumbnailUploadModalProps> = ({
  module,
  isOpen,
  onClose,
}) => {
  const { moduleThumbnails, updateModuleThumbnail, resetModuleThumbnail } = useRentFlow();
  const [customUrl, setCustomUrl] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  if (!module) return null;

  const currentImage = moduleThumbnails[module.id] || module.defaultImage;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) {
      toast.error('Please enter an image URL.');
      return;
    }
    updateModuleThumbnail(module.id, customUrl.trim());
    toast.success(`Custom thumbnail updated for ${module.name}!`);
    onClose();
  };

  const handleReset = () => {
    resetModuleThumbnail(module.id);
    toast.success(`Reverted ${module.name} thumbnail to standard commercial photograph.`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle className="text-base font-serif flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              Customize Thumbnail: {module.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Replace the default commercial photograph with custom corporate imagery.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            {/* Live Card Preview */}
            <div className="relative aspect-video w-full rounded-md overflow-hidden border border-border shadow-sm group">
              <img
                src={previewUrl || currentImage}
                alt={module.name}
                className="w-full h-full object-cover"
                onError={() => toast.error('Failed to load image preview from URL')}
              />
              <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px] flex flex-col justify-end p-3">
                <span className="text-sm font-serif font-bold text-white drop-shadow">
                  {module.name}
                </span>
                <span className="text-[10px] text-slate-300">
                  {module.description}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="img-url" className="text-xs">Image URL</Label>
              <Input
                id="img-url"
                placeholder="https://images.unsplash.com/..."
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  setPreviewUrl(e.target.value);
                }}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Default
            </Button>

            <div className="flex items-center space-x-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Save Thumbnail
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
