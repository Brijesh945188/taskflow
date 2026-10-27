"use client";

/**
 * TaskFlow — Full-Stack Task Management System
 * Root single-page application shell:
 *  - boots the session (GET /api/auth/me)
 *  - shows the marketing landing page for guests
 *  - shows the authenticated app for logged-in users
 *
 * Developed by Brijesh Mishra
 */

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Landing } from "@/components/taskflow/landing";
import { AppShell } from "@/components/taskflow/app-shell";
import { api } from "@/lib/api";
import type { PublicUser } from "@/lib/types";

export default function Home() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api<{ user: PublicUser | null }>("/api/auth/me");
        if (!cancelled) setUser(data.user);
      } catch {
        // Not authenticated — stay on the landing view.
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (booting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">Loading TaskFlow…</p>
      </div>
    );
  }

  if (user) {
    return <AppShell user={user} onLogout={() => setUser(null)} />;
  }

  return <Landing onAuthed={setUser} />;
}
