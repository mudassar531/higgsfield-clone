"use client";

import type { ReactNode } from "react";
import { AccountProvider } from "@/components/nova/account";
import { MobileBar, NavigationRail } from "@/components/nova/NavigationRail";

export default function Workspace({ children }: { children: ReactNode }) {
  return (
    <AccountProvider>
      <div className="workbench workbench-page">
        <NavigationRail />
        <MobileBar />
        <div className="studio-col">{children}</div>
      </div>
    </AccountProvider>
  );
}
