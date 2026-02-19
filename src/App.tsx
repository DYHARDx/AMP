import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminLayout from "@/layouts/AdminLayout";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Portal from "./pages/Portal";
import TrackingRedirect from "./pages/TrackingRedirect";
import NotFound from "./pages/NotFound";

// Admin pages
import Intelligence from "./pages/admin/Intelligence";
import AffiliateManagement from "./pages/admin/AffiliateManagement";
import LinkManagement from "./pages/admin/LinkManagement";
import TeamAccess from "./pages/admin/TeamAccess";
import DataRecovery from "./pages/admin/DataRecovery";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/r/:linkId" element={<TrackingRedirect />} />

            {/* Affiliate Portal */}
            <Route
              path="/portal"
              element={
                <ProtectedRoute requiredRole="affiliate">
                  <Portal />
                </ProtectedRoute>
              }
            />

            {/* Admin Dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout><Intelligence /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/affiliates"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout><AffiliateManagement /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/links"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout><LinkManagement /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/team"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout><TeamAccess /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/recovery"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout><DataRecovery /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout><Settings /></AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
