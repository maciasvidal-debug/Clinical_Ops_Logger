"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistry() {
  useEffect(() => {
    // Only register the service worker if HTTPS (or localhost) to avoid mixed content errors during dev.
    if (
      "serviceWorker" in navigator &&
      (window.location.protocol === "https:" || window.location.hostname === "localhost")
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered successfully with scope:", registration.scope);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  // This component doesn't render any UI.
  return null;
}
