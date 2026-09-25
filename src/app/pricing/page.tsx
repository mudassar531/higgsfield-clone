import type { Metadata } from "next";
import CreditsPanel from "@/components/nova/CreditsPanel";
import Workspace from "@/components/nova/Workspace";

export const metadata: Metadata = { title: "Credits — Nova" };

export default function CreditsPage() {
  return (
    <Workspace>
      <CreditsPanel />
    </Workspace>
  );
}
