(() => {
  const STORAGE_KEY = "soberSeptemberSubmissionRefreshV51";
  const POLL_MS = 5000;
  const POLL_WINDOW_MS = 120000;
  const RETURN_DELAY_MS = 1500;
  const MARKER_TTL_MS = 15 * 60 * 1000;

  let polling = false;
  let pollTimer = null;
  let stopTimer = null;
  let lastFocusStart = 0;

  function getMarker() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const marker = JSON.parse(raw);
      if (!marker || !marker.clickedAt || Date.now() - marker.clickedAt > MARKER_TTL_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return marker;
    } catch (_) {
      return null;
    }
  }

  function setMarker() {
    const marker = {
      clickedAt: Date.now(),
      baselineRows: Array.isArray(window.currentRows) ? window.currentRows.length : null
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(marker));
    } catch (_) {}
  }

  function clearMarker() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }

  function setStatus(text) {
    const el = document.getElementById("lastUpdated");
    if (el) el.textContent = text;
  }

  async function pollOnce() {
    if (document.visibilityState === "hidden") return;
    try {
      setStatus("Checking for your reps…");
      const rows = await loadData();
      render(calc(rows), rows);
      setStatus(`Auto-updated ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
    } catch (err) {
      console.error("Auto-refresh after submission failed", err);
      setStatus("Still checking…");
    }
  }

  function stopPolling() {
    if (pollTimer) clearInterval(pollTimer);
    if (stopTimer) clearTimeout(stopTimer);
    pollTimer = null;
    stopTimer = null;
    polling = false;
    clearMarker();
  }

  function startPollingAfterReturn() {
    const marker = getMarker();
    if (!marker || polling) return;
    if (Date.now() - marker.clickedAt < RETURN_DELAY_MS) return;

    // Debounce duplicate focus/pageshow/visibility events on iOS.
    if (Date.now() - lastFocusStart < 1000) return;
    lastFocusStart = Date.now();
    polling = true;

    pollOnce();
    pollTimer = setInterval(pollOnce, POLL_MS);
    stopTimer = setTimeout(() => {
      stopPolling();
      setStatus(`Updated ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
    }, POLL_WINDOW_MS);
  }

  const logButton = document.getElementById("logRepsBtn");
  if (logButton) {
    logButton.addEventListener("click", () => {
      stopPolling();
      setMarker();
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") startPollingAfterReturn();
  });
  window.addEventListener("focus", startPollingAfterReturn);
  window.addEventListener("pageshow", startPollingAfterReturn);

  // Covers the case where iOS reloads the PWA while the form is open.
  if (document.visibilityState === "visible" && getMarker()) {
    setTimeout(startPollingAfterReturn, RETURN_DELAY_MS + 100);
  }
})();
