import { Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";

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
        <Route path="/investigasi" element={<DashboardInvestigasi />} />
        <Route path="/kuis" element={<CheckpointKuis />} />
        <Route path="/simulator" element={<SimulatorAI />} />
        <Route path="/galeri" element={<Galeri />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}
