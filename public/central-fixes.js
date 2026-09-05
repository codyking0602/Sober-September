(() => {
  function loadSync(url) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send(null);
    if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0)) {
      throw new Error(`Could not load ${url}: ${xhr.status}`);
    }

    const script = document.createElement("script");
    script.textContent = xhr.responseText + `\n//# sourceURL=${url}`;
    document.head.appendChild(script);
  }

  loadSync("/central-fixes-v41.js?v=41");
  loadSync("/competition-v42.js?v=42");
  loadSync("/motivation-v43.js?v=49");
  loadSync("/podium-photos-v46.js?v=46");
  loadSync("/chase-to-one-v48.js?v=50");
  loadSync("/submission-auto-refresh-v51.js?v=55");
  loadSync("/maxout-bolt-cleanup-v52.js?v=52");
})();
