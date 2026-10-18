import React, { useState, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Monitor,
  Laptop,
  Tablet,
  Smartphone,
  ChevronUp,
  ChevronDown,
  Layers,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export type WorkViewDensity = 'compact' | 'comfortable' | 'spacious';
export type ViewportPreset = 'full' | 'desktop-1920' | 'laptop-1440' | 'tablet-1024' | 'mobile-430';

const ZOOM_PRESETS = [75, 85, 90, 100, 110, 125];

export const WorkViewScaleHUD: React.FC = () => {
  const [zoom, setZoom] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('rf_workview_zoom');
      return saved ? parseInt(saved, 10) : 100;
    } catch {
      return 100;
    }
  });

  const [density, setDensity] = useState<WorkViewDensity>(() => {
    try {
      const saved = localStorage.getItem('rf_workview_density');
      return (saved as WorkViewDensity) || 'comfortable';
    } catch {
      return 'comfortable';
    }
  });

  const [viewportPreset, setViewportPreset] = useState<ViewportPreset>(() => {
    try {
      const saved = localStorage.getItem('rf_viewport_preset');
      return (saved as ViewportPreset) || 'full';
    } catch {
      return 'full';
    }
  });

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Apply zoom and density to document
  useEffect(() => {
    try {
      localStorage.setItem('rf_workview_zoom', zoom.toString());
      localStorage.setItem('rf_workview_density', density);
      localStorage.setItem('rf_viewport_preset', viewportPreset);

      // Apply zoom directly to root container / body
      const rootEl = document.getElementById('root');
      if (rootEl) {
        (rootEl.style as any).zoom = `${zoom / 100}`;
      } else {
        (document.body.style as any).zoom = `${zoom / 100}`;
      }

      // Apply density classes
      document.body.classList.remove('rf-density-compact', 'rf-density-comfortable', 'rf-density-spacious');
      document.body.classList.add(`rf-density-${density}`);

      // Apply viewport container styling if constrained
      if (rootEl) {
        if (viewportPreset === 'laptop-1440') {
          rootEl.style.maxWidth = '1440px';
          rootEl.style.margin = '0 auto';
          rootEl.style.boxShadow = '0 0 50px rgba(0,0,0,0.5)';
        } else if (viewportPreset === 'tablet-1024') {
          rootEl.style.maxWidth = '1024px';
          rootEl.style.margin = '0 auto';
          rootEl.style.boxShadow = '0 0 50px rgba(0,0,0,0.5)';
        } else if (viewportPreset === 'mobile-430') {
          rootEl.style.maxWidth = '430px';
          rootEl.style.margin = '0 auto';
          rootEl.style.boxShadow = '0 0 50px rgba(0,0,0,0.5)';
        } else {
          rootEl.style.maxWidth = 'none';
          rootEl.style.margin = '0';
          rootEl.style.boxShadow = 'none';
        }
      }
    } catch (err) {
      console.error('Failed to apply WorkView HUD scales:', err);
    }
  }, [zoom, density, viewportPreset]);

  const handleZoomChange = (newZoom: number) => {
    const clamped = Math.max(70, Math.min(140, newZoom));
    setZoom(clamped);
  };

  const handleReset = () => {
    setZoom(100);
    setDensity('comfortable');
    setViewportPreset('full');
  };

  return (
    <aside
      aria-label="WorkView Scale HUD"
      className="fixed bottom-3 left-4 z-40 select-none font-sans print:hidden"
    >
      <div className="bg-[#0A1128]/95 border border-white/[0.12] backdrop-blur-[24px] rounded-[6px] shadow-2xl overflow-hidden transition-all duration-200">
        {/* Collapsed Bar / Trigger */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors py-0.5 focus:outline-hidden"
            title="Toggle WorkView Scaling HUD"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="font-serif font-bold text-[11px] tracking-wide text-foreground">
              WorkView HUD
            </span>
            <Badge
              variant="outline"
              className="font-mono text-[10px] h-4 px-1.5 py-0 bg-slate-900/60 border-white/[0.08] text-sky-300 tabular-nums"
            >
              {zoom}%
            </Badge>
          </button>

          {/* Quick Zoom Controls */}
          <div className="flex items-center gap-0.5 ml-1 border-l border-white/[0.08] pl-1.5">
            <button
              type="button"
              onClick={() => handleZoomChange(zoom - 5)}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-[4px] transition-colors"
              title="Zoom Out (-5%)"
            >
              <ZoomOut className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-1 py-0.5 text-[10px] font-mono text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-[4px] transition-colors"
              title="Reset Zoom to 100%"
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>

            <button
              type="button"
              onClick={() => handleZoomChange(zoom + 5)}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-[4px] transition-colors"
              title="Zoom In (+5%)"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          {/* Expand / Collapse Chevron */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 text-slate-400 hover:text-white ml-0.5 rounded-[4px]"
            title={isExpanded ? 'Collapse HUD' : 'Expand full WorkView HUD controls'}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expanded Panel */}
        {isExpanded && (
          <div className="p-3 border-t border-white/[0.08] bg-[#101C40]/55 space-y-3 w-72 text-xs">
            {/* 1. Zoom Presets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                <span>Scale Zoom Presets</span>
                <span className="font-bold text-sky-400 tabular-nums">{zoom}% Active</span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {ZOOM_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleZoomChange(preset)}
                    className={`h-6 text-[10px] font-mono rounded-[4px] transition-all border ${
                      zoom === preset
                        ? 'bg-sky-500 text-white font-bold border-sky-400 shadow-xs'
                        : 'bg-slate-900/60 text-slate-300 border-white/[0.07] hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Layout Density Modes */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                <span>Layout Density</span>
                <span className="capitalize text-slate-300">{density}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {(['compact', 'comfortable', 'spacious'] as WorkViewDensity[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDensity(d)}
                    className={`h-6 text-[10px] capitalize rounded-[4px] transition-all border flex items-center justify-center gap-1 ${
                      density === d
                        ? 'bg-emerald-600 text-white font-semibold border-emerald-500'
                        : 'bg-slate-900/60 text-slate-300 border-white/[0.07] hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {density === d && <Check className="w-2.5 h-2.5" />}
                    <span>{d}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Viewport Presets Simulator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                <span>Viewport Width Simulation</span>
                <span className="text-slate-300 font-mono text-[9px]">{viewportPreset}</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                <button
                  type="button"
                  onClick={() => setViewportPreset('full')}
                  className={`h-6 text-[9px] rounded-[4px] transition-all border flex items-center justify-center gap-0.5 ${
                    viewportPreset === 'full'
                      ? 'bg-purple-600 text-white font-semibold border-purple-500'
                      : 'bg-slate-900/60 text-slate-300 border-white/[0.07] hover:bg-slate-800'
                  }`}
                  title="Full Viewport Width"
                >
                  <Layers className="w-2.5 h-2.5" />
                  <span>Full</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewportPreset('laptop-1440')}
                  className={`h-6 text-[9px] rounded-[4px] transition-all border flex items-center justify-center gap-0.5 ${
                    viewportPreset === 'laptop-1440'
                      ? 'bg-purple-600 text-white font-semibold border-purple-500'
                      : 'bg-slate-900/60 text-slate-300 border-white/[0.07] hover:bg-slate-800'
                  }`}
                  title="1440px Laptop Frame"
                >
                  <Laptop className="w-2.5 h-2.5" />
                  <span>1440p</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewportPreset('tablet-1024')}
                  className={`h-6 text-[9px] rounded-[4px] transition-all border flex items-center justify-center gap-0.5 ${
                    viewportPreset === 'tablet-1024'
                      ? 'bg-purple-600 text-white font-semibold border-purple-500'
                      : 'bg-slate-900/60 text-slate-300 border-white/[0.07] hover:bg-slate-800'
                  }`}
                  title="1024px Tablet Frame"
                >
                  <Tablet className="w-2.5 h-2.5" />
                  <span>1024p</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewportPreset('mobile-430')}
                  className={`h-6 text-[9px] rounded-[4px] transition-all border flex items-center justify-center gap-0.5 ${
                    viewportPreset === 'mobile-430'
                      ? 'bg-purple-600 text-white font-semibold border-purple-500'
                      : 'bg-slate-900/60 text-slate-300 border-white/[0.07] hover:bg-slate-800'
                  }`}
                  title="430px Mobile Device"
                >
                  <Smartphone className="w-2.5 h-2.5" />
                  <span>430p</span>
                </button>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-2 border-t border-white/[0.07] flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground font-mono">Quiet Couture HUD v2.5</span>
              <button
                type="button"
                onClick={handleReset}
                className="text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-2.5 h-2.5" /> Reset Default
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
