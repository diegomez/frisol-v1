import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './features/auth/store/auth.store';
import { LoginPage } from './features/auth/pages/LoginPage';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { ProjectLayout } from './features/projects/components/ProjectLayout';
import { Page1Cliente } from './features/projects/pages/Page1Cliente';
import { Page2Diagnostico } from './features/diagnostico/pages/Page2Diagnostico';
import { Page3Evidencia } from './features/evidencia/pages/Page3Evidencia';
import { Page4VozDolor } from './features/voz-dolor/pages/Page4VozDolor';
import { Page5Causas } from './features/causas/pages/Page5Causas';
import { Page6Impacto } from './features/impacto/pages/Page6Impacto';
import { Page7Cierre } from './features/cierre/pages/Page7Cierre';
import { AdminUsersPage } from './features/admin/pages/AdminUsersPage';

const queryClient = new QueryClient();

function AppContent() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectLayout />
          </ProtectedRoute>
        }
      >
        <Route path="1-cliente" element={<Page1Cliente />} />
        <Route path="2-diagnostico" element={<Page2Diagnostico />} />
        <Route path="3-evidencia" element={<Page3Evidencia />} />
        <Route path="4-voz-dolor" element={<Page4VozDolor />} />
        <Route path="5-causas" element={<Page5Causas />} />
        <Route path="6-impacto" element={<Page6Impacto />} />
        <Route path="7-cierre" element={<Page7Cierre />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}