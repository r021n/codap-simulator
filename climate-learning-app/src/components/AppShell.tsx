import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

function TopLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "text-sm px-3 py-2 rounded-md",
          isActive
            ? "bg-slate-900 text-white"
            : "text-slate-700 hover:bg-slate-100",
        )
      }
    >
      {label}
    </NavLink>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">Climate Learning App</div>
          <nav className="flex gap-2">
            <TopLink to="/login" label="Login" />
            <TopLink to="/investigasi" label="Investigasi" />
            <TopLink to="/kuis" label="Kuis" />
            <TopLink to="/simulator" label="Simulator AI" />
            <TopLink to="/galeri" label="Galeri" />
          </nav>
        </div>
        <Separator />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
