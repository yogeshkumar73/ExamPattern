"use client";

import { useEffect } from "react";

export function PurgeNetlify() {
  useEffect(() => {
    function purge() {
      try {
        const selectors = [
          "iframe#netlify-badge",
          'iframe[src*="netlify"]',
          "netlify-badge",
          "#netlify-feedback-drawer",
          "[data-netlify-feedback-drawer]",
          '[id*="netlify-badge"]',
          '[class*="netlify-badge"]',
        ];
        selectors.forEach((s) => {
          document.querySelectorAll(s).forEach((el) => el.remove());
        });
        document.querySelectorAll("iframe, div, a").forEach((el) => {
          const text = (el as HTMLElement).innerText;
          if (text && text.trim().toLowerCase() === "powered by netlify") {
            el.remove();
          }
        });
      } catch {
        // ignore
      }
    }

    purge();
    window.addEventListener("DOMContentLoaded", purge);
    window.addEventListener("load", purge);

    let obs: MutationObserver | null = null;
    if (typeof window !== "undefined" && "MutationObserver" in window) {
      obs = new MutationObserver(purge);
      obs.observe(document.documentElement, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener("DOMContentLoaded", purge);
      window.removeEventListener("load", purge);
      if (obs) obs.disconnect();
    };
  }, []);

  return null;
}
