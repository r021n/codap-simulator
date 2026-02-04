import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/button";

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
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">Climate Learning App</div>
          <nav className="flex gap-2">
            {user ? null : <TopLink to="/login" label="Login" />}

            <TopLink to="/investigasi" label="Investigasi" />
            <TopLink to="/kuis" label="Kuis" />
            <TopLink to="/simulator" label="Simulator AI" />
            <TopLink to="/galeri" label="Galeri" />
          </nav>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-xs text-slate-600 hidden md:block">
                {user.email}
              </div>
              <Button variant="outline" onClick={() => signOut(auth)}>
                Logout
              </Button>
            </div>
          ) : null}
        </div>
        <Separator />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
