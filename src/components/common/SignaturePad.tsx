import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Check } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  onClear?: () => void;
  width?: number;
  height?: number;
  initialSignature?: string;
  label?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  onClear,
  width = 460,
  height = 160,
  initialSignature,
  label = 'Digital Signature Pad'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset background to clean off-white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#0f172a'; // Deep midnight corporate ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    if (onClear) onClear();
  };

  return (
    <div className="flex flex-col space-y-2 p-3 bg-muted/30 border border-border rounded-md">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground tracking-wide uppercase">
          {label}
        </label>
        <span className="text-[11px] text-muted-foreground">Sign with mouse or stylus</span>
      </div>

      <div className="relative border-2 border-dashed border-border/80 rounded bg-white overflow-hidden shadow-inner touch-none">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full h-auto cursor-crosshair block"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <div className="absolute bottom-2 right-2 pointer-events-none text-[10px] text-muted-foreground/60 select-none">
          RENTFLOW DIGITAL SIGNATURE
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="h-8 text-xs flex items-center gap-1.5"
        >
          <Eraser className="w-3.5 h-3.5" />
          Clear
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!hasSignature}
          onClick={() => {
            if (canvasRef.current) {
              onSave(canvasRef.current.toDataURL('image/png'));
            }
          }}
          className="h-8 text-xs flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5 text-primary" />
          Confirm Signature
        </Button>
      </div>
    </div>
  );
};
