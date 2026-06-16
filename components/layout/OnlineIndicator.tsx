"use client";

export default function OnlineIndicator() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium">
      📡 You're offline. Your data is synced locally.
    </div>
  );
}
