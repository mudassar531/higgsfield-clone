"use client";

import type { ReactNode } from "react";
import { AccountProvider } from "@/components/nova/account";
import { SiteHeader } from "@/components/nova/NavigationRail";

export default function Workspace({ children }: { children: ReactNode }) {
  return (
    <AccountProvider>
      <div className="support-workspace">
        <SiteHeader />
        <main className="support-main">{children}</main>
      </div>
    </AccountProvider>
  );
}
