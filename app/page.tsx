import AppShell from "@/components/layout/AppShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grocery Tracker",
  description: "Track grocery spending",
};

export default function Page() {
  return <AppShell />;
}