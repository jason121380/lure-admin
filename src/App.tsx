
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="flex relative">      
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Index sidebarVisible={sidebarVisible} setSidebarVisible={setSidebarVisible} />
            </ProtectedRoute>
          } 
        />
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => {
  // Move queryClient creation inside the component
  const [queryClient] = useState(() => new QueryClient());
  
  // PWA 安裝和設置
  useEffect(() => {
    // 註冊 Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // 設置 PWA 主題色
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', '#000000');
    }

    // 處理 iOS Safari 的狀態欄樣式
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
    }
  }, []);
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
