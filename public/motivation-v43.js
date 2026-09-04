(() => {
  const videos = [
    { id: "ysTGb27yCcc", title: "Motivation 01" }
  ];

  const style = document.createElement("style");
  style.textContent = `
    .motivation-bar{
      width:100%;border:1px solid rgba(255,255,255,.10);border-radius:16px;
      background:linear-gradient(90deg,rgba(124,58,237,.22),rgba(34,197,94,.12));
      color:#fff;padding:10px 14px;margin:0 0 14px;display:flex;align-items:center;
      justify-content:space-between;gap:12px;font-weight:900;font-size:13px;
      letter-spacing:.12em;text-transform:uppercase;box-shadow:0 8px 28px rgba(0,0,0,.24)
    }
    .motivation-bar .motivation-bar-sub{color:#94a3b8;font-size:10px;letter-spacing:.08em;font-weight:800;margin-top:3px;text-transform:none}
    .motivation-bar .motivation-chevron{font-size:20px;color:#c4b5fd}
    #motivation{position:relative;min-height:calc(100vh - 130px);overflow:hidden;border-radius:28px;--motivation-bg:none}
    #motivation::before{content:"";position:absolute;inset:0;background-image:var(--motivation-bg);background-position:center 18%;background-size:cover;background-repeat:no-repeat;opacity:.30;pointer-events:none}
    #motivation::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,6,23,.55),rgba(2,6,23,.84) 55%,rgba(2,6,23,.95));pointer-events:none}
    .motivation-inner{position:relative;z-index:2;padding:16px 14px 130px}
    .motivation-head{display:flex;align-items:center;gap:12px;margin-bottom:18px}
    .motivation-back{width:44px;height:44px;border-radius:16px;border:1px solid rgba(255,255,255,.12);background:rgba(2,6,23,.72);color:#fff;font-size:22px;font-weight:900}
    .motivation-kicker{font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#c4b5fd;font-weight:900}
    .motivation-title{font-size:32px;line-height:1;font-weight:900;margin-top:4px}
    .motivation-sub{color:#cbd5e1;font-size:13px;margin-top:6px}
    .motivation-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .motivation-video{display:block;text-decoration:none;color:#fff;min-width:0}
    .motivation-thumb{position:relative;aspect-ratio:1/1;border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,.15);background:#020617;box-shadow:0 12px 34px rgba(0,0,0,.38)}
    .motivation-thumb img{width:100%;height:100%;object-fit:cover;display:block}
    .motivation-play{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:48px;height:48px;border-radius:999px;background:rgba(2,6,23,.78);border:1px solid rgba(255,255,255,.24);display:flex;align-items:center;justify-content:center;font-size:19px;padding-left:3px;backdrop-filter:blur(8px)}
    .motivation-video-title{font-size:12px;font-weight:900;margin:7px 2px 0;color:#cbd5e1;line-height:1.2}
    @media(max-width:350px){.motivation-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const home = document.getElementById("home");
  const app = document.querySelector(".app");
  if (!home || !app || document.getElementById("motivation")) return;

  const bar = document.createElement("button");
  bar.type = "button";
  bar.className = "motivation-bar";
  bar.innerHTML = `<span><span>🔥 Motivation</span><div class="motivation-bar-sub">Tap for the video wall</div></span><span class="motivation-chevron">›</span>`;
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
          <div class="motivation-sub">Pick one. Get moving.</div>
        </div>
      </div>
      <div class="motivation-grid">
        ${videos.map((v, i) => `
          <a class="motivation-video" href="https://youtu.be/${v.id}" target="_blank" rel="noopener noreferrer" aria-label="Open ${v.title} on YouTube">
            <div class="motivation-thumb">
              <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="YouTube thumbnail for ${v.title}" loading="lazy">
              <div class="motivation-play">▶</div>
            </div>
            <div class="motivation-video-title">Video ${String(i + 1).padStart(2,"0")}</div>
          </a>`).join("")}
      </div>
    </div>`;
  app.appendChild(section);

  fetch("/images/motivation-bg.b64?v=43")
    .then(r => r.ok ? r.text() : Promise.reject(new Error("background unavailable")))
    .then(data => section.style.setProperty("--motivation-bg", `url("data:image/webp;base64,${data.trim()}")`))
    .catch(() => {});

  function openMotivation(){
    document.querySelectorAll(".tab-page").forEach(p => p.classList.toggle("active", p.id === "motivation"));
    document.querySelectorAll(".nav button").forEach(b => b.classList.remove("active"));
    window.scrollTo({top:0,behavior:"smooth"});
  }

  bar.addEventListener("click", openMotivation);
  section.querySelector(".motivation-back").addEventListener("click", () => showTab("home"));
})();
