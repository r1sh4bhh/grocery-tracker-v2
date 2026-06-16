import AppShell from "@/components/layout/AppShell";

export default function Page() {
  return <AppShell />;
}

export const metadata = {
  title: "Grocery Tracker",
  description: "Track grocery spending",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#10b981",
};