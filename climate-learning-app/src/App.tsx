import { Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";

import Login from "@/pages/Login";
import DashboardInvestigasi from "@/pages/DashboardInvestigasi";
import CheckpointKuis from "@/pages/CheckpointKuis";
import SimulatorAI from "@/pages/SimulatorAI";
import Galeri from "@/pages/Galeri";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/investigasi"
          element={
            <ProtectedRoute>
              <DashboardInvestigasi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kuis"
          element={
            <ProtectedRoute>
              <CheckpointKuis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/simulator"
          element={
            <ProtectedRoute>
              <SimulatorAI />
            </ProtectedRoute>
          }
        />
        <Route
          path="/galeri"
          element={
            <ProtectedRoute>
              <Galeri />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}
