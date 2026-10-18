import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { RentFlowProvider } from '@/contexts/RentFlowContext';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { GlobalBackground } from '@/components/common/GlobalBackground';
import { WorkViewScaleHUD } from '@/components/common/WorkViewScaleHUD';
import { RouteGuard } from '@/components/common/RouteGuard';
import { routes } from './routes';

const App: React.FC = () => {
  return (
    <RentFlowProvider>
      <Router>
        <GlobalBackground />
        <IntersectObserver />
        <div className="relative z-10 flex flex-col min-h-screen bg-transparent">
          <main className="flex-grow bg-transparent">
            <Routes>
              {routes.map((route, index) => (
                <Route
                  key={index}
                  path={route.path}
                  element={<RouteGuard>{route.element}</RouteGuard>}
                />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <WorkViewScaleHUD />
          <MobileBottomNav />
        </div>
        <Toaster position="top-right" richColors />
      </Router>
    </RentFlowProvider>
  );
};

export default App;
