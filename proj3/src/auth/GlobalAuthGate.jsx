import { useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useAuthUI } from "./AuthUIContext";

export default function GlobalAuthGate() {
  const { isAuthed } = useAuth();
  const { openAuth } = useAuthUI();

  useEffect(() => {
    if (isAuthed) return; // nothing to intercept when logged in

    function shouldBypass(node) {
      // allow clicks inside the auth modal
      let el = node;
      while (el) {
        if (el.id === "auth-modal-root") return true;
        // allow explicit public elements
        if (el.dataset && el.dataset.public === "true") return true;
        el = el.parentElement;
      }
      return false;
    }

    function onCaptureClick(e) {
      if (isAuthed) return;
      if (shouldBypass(e.target)) return;

      // Block all interactions and show the auth modal
      e.preventDefault();
      e.stopPropagation();
      openAuth();
    }

    // Capture phase to stop navigation before it happens
    document.addEventListener("click", onCaptureClick, true);
    return () => document.removeEventListener("click", onCaptureClick, true);
  }, [isAuthed, openAuth]);

  return null;
}
