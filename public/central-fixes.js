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
  loadSync("/motivation-v43.js?v=43");
})();
