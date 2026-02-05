import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { EventProvider } from "@/contexts/EventContext";
import { JudgeProvider } from "@/contexts/JudgeContext";
import { CompetitionProvider } from "@/contexts/CompetitionContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import DirectorDashboard from "./pages/DirectorDashboard";
import JudgePanel from "./pages/JudgePanel";
import ResultsPage from "./pages/ResultsPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <JudgeProvider>
            <EventProvider>
              <CompetitionProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route element={<AppLayout />}>
                      {/* Rotte protette per Direttore/Admin */}
                      <Route path="/" element={
                        <ProtectedRoute allowedRoles={['director', 'admin']}>
                          <DirectorDashboard />
                        </ProtectedRoute>
                      } />

                      <Route path="/settings" element={
                        <ProtectedRoute allowedRoles={['director', 'admin']}>
                          <SettingsPage />
                        </ProtectedRoute>
                      } />

                      {/* Rotte per Risultati Pubblici */}
                      <Route path="/results" element={<ResultsPage />} />

                      {/* Rotta Giudice */}
                      <Route path="/judge" element={<JudgePanel />} />

                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </CompetitionProvider>
            </EventProvider>
          </JudgeProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
