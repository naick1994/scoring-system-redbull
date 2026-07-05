import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScoringProvider } from "./contexts/ScoringContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Header } from "./components/Header";
import NewJump from "./pages/NewJump";
import PresetEvents from "./pages/PresetEvents";
import Result from "./pages/Result";
import ParametersGuide from "./pages/ParametersGuide";
import OverallImpression from "./pages/OverallImpression";
import Demo from "./pages/Demo";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import RiderResults from "./pages/rider/RiderResults";
import RiderFeedback from "./pages/rider/RiderFeedback";
import RiderRanking from "./pages/rider/RiderRanking";
import Admin from "./pages/Admin";
import ChangeTheTide from "./pages/ChangeTheTide";
import AboutNick from "./pages/AboutNick";

const queryClient = new QueryClient();

const BUILD_TIME = new Date(__BUILD_TIME__);
const BUILD_LABEL = `${BUILD_TIME.toLocaleDateString('it-IT')} ${BUILD_TIME.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ScoringProvider>
          <Toaster />
          <Sonner />
          <div className="fixed bottom-2 right-3 z-[300] text-[10px] text-muted-foreground/50 select-none pointer-events-none tabular-nums">
            deploy {BUILD_LABEL}
          </div>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/change-the-tide" element={<ChangeTheTide />} />
              <Route path="/about-nick" element={<AboutNick />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Header />
                    <Routes>
                      <Route path="/" element={<ProtectedRoute allowedRoles={['judge']}><NewJump /></ProtectedRoute>} />
                      <Route path="/preset" element={<ProtectedRoute allowedRoles={['judge']}><PresetEvents /></ProtectedRoute>} />
                      <Route path="/result" element={<ProtectedRoute allowedRoles={['judge']}><Result /></ProtectedRoute>} />
                      <Route path="/parameters-guide" element={<ParametersGuide />} />
                      <Route path="/overall-impression" element={<ProtectedRoute allowedRoles={['judge']}><OverallImpression /></ProtectedRoute>} />
                      <Route path="/demo" element={<ProtectedRoute allowedRoles={['judge']}><Demo /></ProtectedRoute>} />
                      <Route path="/rider" element={<ProtectedRoute allowedRoles={['rider']}><RiderResults /></ProtectedRoute>} />
                      <Route path="/rider/feedback" element={<ProtectedRoute allowedRoles={['rider']}><RiderFeedback /></ProtectedRoute>} />
                      <Route path="/rider/ranking" element={<RiderRanking />} />
                      <Route path="/admin" element={<ProtectedRoute allowedRoles={['judge']}><Admin /></ProtectedRoute>} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </ScoringProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
