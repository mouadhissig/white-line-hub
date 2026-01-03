import { toast } from "@/hooks/use-toast";

/**
 * Open an external URL safely.
 * - Tries to open a new tab
 * - If popups are blocked and we're embedded (preview/iframe), shows a toast and copies the URL
 * - Otherwise falls back to same-tab navigation
 */
export function openExternalUrl(url: string) {
  try {
    const newWin = window.open(url, "_blank", "noopener,noreferrer");
    if (newWin) {
      // Extra safety for older browsers
      newWin.opener = null;
      return;
    }

    const isEmbedded = (() => {
      try {
        return window.top !== window.self;
      } catch {
        return true;
      }
    })();

    if (isEmbedded) {
      // In embedded previews, external sites (Facebook) can refuse to load.
      // Help the user by copying the URL.
      void navigator.clipboard?.writeText(url).catch(() => undefined);
      toast({
        title: "Lien externe bloqué",
        description:
          "Votre navigateur/preview empêche l'ouverture dans un nouvel onglet. Le lien a été copié : collez-le dans un nouvel onglet.",
      });
      return;
    }

    window.location.assign(url);
  } catch {
    // Last resort
    window.location.assign(url);
  }
}
