(() => {
  const videos = [
    { id: "ysTGb27yCcc" },
    { id: "cH0gED2stDM" },
    { id: "S2eso4vLPms" },
    { id: "5fkhdbG6-wo" }
  ];

  const style = document.createElement("style");
  style.textContent = `
    .motivation-bar{
      width:100%;border:1px solid rgba(255,255,255,.10);border-radius:16px;
      background:linear-gradient(90deg,rgba(124,58,237,.22),rgba(34,197,94,.12));
      color:#fff;padding:14px 14px;margin:0 0 14px;display:flex;align-items:center;
      justify-content:center;gap:12px;font-weight:900;font-size:13px;position:relative;
      letter-spacing:.12em;text-transform:uppercase;box-shadow:0 8px 28px rgba(0,0,0,.24)
    }
    .motivation-bar .motivation-chevron{font-size:20px;color:#c4b5fd;line-height:1;position:absolute;right:14px;top:50%;transform:translateY(-50%)}
    #motivation{position:relative;min-height:calc(100vh - 130px);overflow:hidden;border-radius:28px;--motivation-bg:none}
    #motivation::before{content:"";position:absolute;inset:0;background-image:var(--motivation-bg);background-position:center 18%;background-size:cover;background-repeat:no-repeat;opacity:.54;filter:brightness(1.08) saturate(.95);pointer-events:none}
    #motivation::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,6,23,.22),rgba(2,6,23,.48) 58%,rgba(2,6,23,.72));pointer-events:none}
    .motivation-inner{position:relative;z-index:2;padding:16px 14px 130px}
    .motivation-head{display:flex;align-items:center;gap:12px;margin-bottom:18px}
    .motivation-back{width:44px;height:44px;border-radius:16px;border:1px solid rgba(255,255,255,.12);background:rgba(2,6,23,.72);color:#fff;font-size:22px;font-weight:900}
    .motivation-kicker{font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#c4b5fd;font-weight:900}
    .motivation-title{font-size:32px;line-height:1;font-weight:900;margin-top:4px}
    .motivation-sub{color:#e2e8f0;font-size:13px;margin-top:6px;text-shadow:0 1px 8px rgba(2,6,23,.75)}
    .motivation-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .motivation-video{display:block;text-decoration:none;color:#fff;min-width:0}
    .motivation-thumb{position:relative;aspect-ratio:1/1;border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,.15);background:#020617;box-shadow:0 12px 34px rgba(0,0,0,.38)}
    .motivation-thumb img{width:100%;height:100%;object-fit:cover;display:block}
    .motivation-play{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:48px;height:48px;border-radius:999px;background:rgba(2,6,23,.78);border:1px solid rgba(255,255,255,.24);display:flex;align-items:center;justify-content:center;font-size:19px;padding-left:3px;backdrop-filter:blur(8px)}
    .motivation-duration{position:absolute;right:8px;bottom:8px;z-index:3;display:none;padding:3px 6px;border-radius:6px;background:rgba(2,6,23,.88);color:#fff;font-size:11px;font-weight:900;line-height:1.15;letter-spacing:.02em;font-variant-numeric:tabular-nums;box-shadow:0 2px 8px rgba(0,0,0,.32)}
    .motivation-duration.ready{display:block}
    #motivation-duration-probes{position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none}
    @media(max-width:350px){.motivation-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const home = document.getElementById("home");
  const app = document.querySelector(".app");
  if (!home || !app || document.getElementById("motivation")) return;

  const bar = document.createElement("button");
  bar.type = "button";
  bar.className = "motivation-bar";
  bar.innerHTML = `<span>Motivation</span><span class="motivation-chevron">›</span>`;
  home.appendChild(bar);

  const section = document.createElement("section");
  section.id = "motivation";
  section.className = "tab-page";
  section.innerHTML = `
    <div class="motivation-inner">
      <div class="motivation-head">
        <button type="button" class="motivation-back" aria-label="Back to Home">‹</button>
        <div>
          <div class="motivation-kicker">Lock In</div>
          <div class="motivation-title">Motivation</div>
          <div class="motivation-sub">“My definition of discipline is doing what you hate to do, but do it like you love it.” — Mike Tyson</div>
        </div>
      </div>
      <div class="motivation-grid">
        ${videos.map(v => `
          <a class="motivation-video" href="https://youtu.be/${v.id}" target="_blank" rel="noopener noreferrer" aria-label="Open motivational video on YouTube">
            <div class="motivation-thumb">
              <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="YouTube video thumbnail" loading="lazy">
              <div class="motivation-play">▶</div>
              <div class="motivation-duration" data-duration-for="${v.id}"></div>
            </div>
          </a>`).join("")}
      </div>
    </div>`;
  app.appendChild(section);

  fetch("/images/motivation-bg.b64?v=43")
    .then(r => r.ok ? r.text() : Promise.reject(new Error("background unavailable")))
    .then(data => section.style.setProperty("--motivation-bg", `url("data:image/webp;base64,${data.trim()}")`))
    .catch(() => {});

  function formatDuration(seconds){
    const total = Math.round(Number(seconds) || 0);
    if (!total) return "";
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return hours
      ? `${hours}:${String(minutes).padStart(2,"0")}:${String(secs).padStart(2,"0")}`
      : `${minutes}:${String(secs).padStart(2,"0")}`;
  }

  function showDuration(videoId, seconds){
    const badge = section.querySelector(`[data-duration-for="${videoId}"]`);
    const text = formatDuration(seconds);
    if (!badge || !text) return;
    badge.textContent = text;
    badge.classList.add("ready");
  }

  function initDurationPlayers(){
    if (section.dataset.durationPlayersStarted === "1" || !window.YT?.Player) return;
    section.dataset.durationPlayersStarted = "1";

    let probes = document.getElementById("motivation-duration-probes");
    if (!probes){
      probes = document.createElement("div");
      probes.id = "motivation-duration-probes";
      document.body.appendChild(probes);
    }

    videos.forEach(v => {
      const probe = document.createElement("div");
      probe.id = `yt-duration-${v.id}`;
      probes.appendChild(probe);
      let attempts = 0;

      new YT.Player(probe.id, {
        width: "1",
        height: "1",
        videoId: v.id,
        playerVars: { controls: 0, disablekb: 1, playsinline: 1, rel: 0 },
        events: {
          onReady: event => {
            try { event.target.cueVideoById(v.id); } catch (_) {}
            const readDuration = () => {
              let duration = 0;
              try { duration = event.target.getDuration(); } catch (_) {}
              if (duration > 0){
                showDuration(v.id, duration);
                try { event.target.destroy(); } catch (_) {}
                return;
              }
              attempts += 1;
              if (attempts < 32) setTimeout(readDuration, 250);
              else try { event.target.destroy(); } catch (_) {}
            };
            setTimeout(readDuration, 150);
          },
          onError: event => {
            try { event.target.destroy(); } catch (_) {}
          }
        }
      });
    });
  }

  function ensureYouTubeDurationAPI(){
    if (window.YT?.Player){
      initDurationPlayers();
      return;
    }

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousReady === "function"){
        try { previousReady(); } catch (_) {}
      }
      initDurationPlayers();
    };

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')){
      const api = document.createElement("script");
      api.src = "https://www.youtube.com/iframe_api";
      api.async = true;
      document.head.appendChild(api);
    }
  }

  function openMotivation(){
    document.querySelectorAll(".tab-page").forEach(p => p.classList.toggle("active", p.id === "motivation"));
    document.querySelectorAll(".nav button").forEach(b => b.classList.remove("active"));
    window.scrollTo({top:0,behavior:"smooth"});
    ensureYouTubeDurationAPI();
  }

  bar.addEventListener("click", openMotivation);
  section.querySelector(".motivation-back").addEventListener("click", () => showTab("home"));
})();
