export function registerSW() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Infinite Coaching SW registered:", reg.scope);
        })
        .catch((err) => {
          console.log("SW registration failed:", err);
        });
    });
  }
}

let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  window.dispatchEvent(new CustomEvent("pwa-installable"));
});

export function triggerInstall() {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(() => {
    deferredPrompt = null;
  });
  return true;
}

export function isInstallable() {
  return !!deferredPrompt;
}
