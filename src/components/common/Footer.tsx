import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 px-6 border-t border-border/40 bg-card/60 text-center text-xs text-muted-foreground mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>© 2026 RentFlowPro Commercial Management</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900 font-medium">
            RentFlowPro v27.0 Enterprise
          </span>
          <span className="text-muted-foreground">•</span>
          <span>Zimbabwe Commercial Real Estate</span>
        </div>
      </div>
    </footer>
  );
};
