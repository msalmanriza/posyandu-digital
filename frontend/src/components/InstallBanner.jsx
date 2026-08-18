import { useEffect, useState } from "react";

function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      setShow(false);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    let t;
    if (isIos) {
      t = setTimeout(() => {
        setIsIOS(true);
        setShow(true);
      }, 2000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      clearTimeout(t);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="bg-white/95 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center gap-3 print:hidden">
      <span className="text-2xl">📲</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">
          Install Aplikasi Posyandu
        </p>
        <p className="text-xs text-gray-500">
          {isIOS
            ? "Ketuk ikon Bagikan di Safari, lalu pilih 'Add to Home Screen'."
            : "Pasang aplikasi agar mudah diakses langsung dari layar utama HP Anda."}
        </p>
      </div>
      {!isIOS && deferredPrompt && (
        <button
          onClick={handleInstall}
          className="shrink-0 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Install
        </button>
      )}
      <button
        onClick={() => setShow(false)}
        aria-label="Tutup"
        className="shrink-0 text-gray-400 hover:text-gray-600"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default InstallBanner;