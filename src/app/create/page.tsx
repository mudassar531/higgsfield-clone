import type { Metadata } from "next";
import CreateStudio from "@/components/CreateStudio";

export const metadata: Metadata = { title: "Create — Nova" };

export default function CreatePage() {
  return <CreateStudio />;
}
