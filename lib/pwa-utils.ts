// Sync queue for offline purchases
type QueuedAction = {
  type: "purchase" | "product" | "delete";
  data: any;
  timestamp: number;
};

const QUEUE_KEY = "pwa-sync-queue";

export const addToSyncQueue = (action: QueuedAction) => {
  try {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    queue.push({ ...action, timestamp: Date.now() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("Failed to queue action:", error);
  }
};

export const getSyncQueue = (): QueuedAction[] => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const clearSyncQueue = () => {
  localStorage.removeItem(QUEUE_KEY);
};

export const isOnline = () => typeof navigator !== "undefined" && navigator.onLine;

export const registerPeriodicSync = async () => {
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register("sync-purchases");
    } catch (error) {
      console.log("Periodic sync not available:", error);
    }
  }
};

export const shareAppInstall = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Grocery Tracker",
        text: "Track your grocery spending offline!",
        url: window.location.href,
      });
    } catch (error) {
      console.log("Share failed:", error);
    }
  }
};
