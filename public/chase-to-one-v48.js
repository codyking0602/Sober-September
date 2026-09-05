(() => {
  const calloutText = document.getElementById("calloutText");
  const card = calloutText ? calloutText.closest(".card") : null;
  const grid = card ? card.parentElement : null;
  if (!card || !grid) return;

  grid.classList.add("home-race-grid");
  card.classList.add("chase-card");
  card.innerHTML = `
    <div id="chaseLabel" class="label">Chase To #1</div>
    <div id="chaseList" class="chase-list"></div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .home-race-grid{
      grid-template-columns:minmax(0,.82fr) minmax(0,1.68fr);
      align-items:stretch;
    }
    .home-race-grid > .mini:first-child{
      display:flex;
      flex-direction:column;
      justify-content:center;
    }
    .home-race-grid > .max-only,
    .home-race-grid > .redemption-only{
      display:none!important;
    }
    .chase-card{
      min-height:126px;
      padding:13px 14px 11px!important;
    }
    .chase-list{
      margin-top:7px;
    }
    .chase-row{
      display:grid;
      grid-template-columns:22px minmax(0,.8fr) minmax(0,1.35fr);
      align-items:center;
      gap:6px;
      padding:6px 0;
      border-bottom:1px solid rgba(255,255,255,.07);
    }
    .chase-row:last-child{border-bottom:0}
    .chase-rank{
      color:#94a3b8;
      font-size:12px;
      font-weight:900;
      text-align:center;
    }
    .chase-name{
      font-size:13px;
      font-weight:900;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }
    .chase-main{
      color:#7dd3fc;
      font-size:12px;
      line-height:1.05;
      font-weight:900;
      text-align:right;
      white-space:nowrap;
    }
    .chase-sub{
      color:#94a3b8;
      font-size:10px;
      line-height:1.1;
      font-weight:800;
      text-align:right;
      margin-top:2px;
      white-space:nowrap;
    }
    .chase-row.leader .chase-rank{color:#fde047}
    .chase-row.leader .chase-name{color:#fff}
    .chase-row.leader .chase-main{color:#fde047}
    body.maxout-mode .chase-card{border-color:rgba(250,204,21,.28)}
    body.maxout-mode .chase-card #chaseLabel{color:#fde047}
    body.redemption-mode .chase-card{border-color:rgba(251,113,133,.26)}
    body.redemption-mode .chase-card #chaseLabel{color:#fb7185}
    @media(max-width:390px){
      .home-race-grid{grid-template-columns:minmax(0,.76fr) minmax(0,1.74fr);gap:9px}
      .home-race-grid > .mini{padding:13px}
      .chase-card{padding:12px 11px 10px!important}
      .chase-row{grid-template-columns:20px minmax(0,.72fr) minmax(0,1.38fr);gap:4px}
      .chase-name,.chase-main{font-size:11px}
      .chase-sub{font-size:9px}
    }
  `;
  document.head.appendChild(style);

  function fmtPoints(value) {
    return Math.round(Number(value) || 0).toLocaleString();
  }

  function rowHTML(rank, name, main, sub, leader = false) {
    return `<div class="chase-row${leader ? " leader" : ""}">
      <div class="chase-rank">${leader ? "👑" : rank}</div>
      <div class="chase-name">${name}</div>
      <div><div class="chase-main">${main}</div>${sub ? `<div class="chase-sub">${sub}</div>` : ""}</div>
    </div>`;
  }

  function normalRows(stats) {
    if (!stats || !stats.length) return `<div class="small" style="margin-top:10px">Waiting for standings</div>`;
    const leader = stats[0];
    return stats.map((s, i) => {
      if (i === 0) return rowHTML(1, s.name, `${fmtPoints(s.total)} pts`, "Current leader", true);
      const gap = Math.max(0, Number(leader.total || 0) - Number(s.total || 0));
      if (gap <= .0001) return rowHTML(i + 1, s.name, "Tied for 1st", "0 reps to tie");
      const reps = Number(s.currentWeight) > 0 ? Math.ceil(gap / (Number(s.currentWeight) / 100)) : null;
      return rowHTML(
        i + 1,
        s.name,
        `${fmtPoints(gap)} pts back`,
        reps === null ? "Weight needed for rep target" : `${reps.toLocaleString()} reps to tie`
      );
    }).join("");
  }

  function todayMaxes(stats, rows) {
    const key = dayKey(new Date());
    const maxByName = Object.fromEntries((stats || []).map(s => [s.name, 0]));
    (rows || []).forEach(r => {
      if (r.key !== key || !(Number(r.max) > 0)) return;
      maxByName[r.name] = Math.max(maxByName[r.name] || 0, Number(r.max) || 0);
    });
    return (stats || []).map(s => ({ ...s, eventMax:maxByName[s.name] || 0 }))
      .sort((a, b) => b.eventMax - a.eventMax || b.total - a.total);
  }

  function maxOutRows(stats, rows) {
    const ranked = todayMaxes(stats, rows);
    return ranked.map((s, i) => rowHTML(
      i + 1,
      s.name,
      s.eventMax > 0 ? `${s.eventMax} reps` : "No max yet",
      i === 0 && s.eventMax > 0 ? "Current Max-Out leader" : "Saturday max",
      i === 0 && s.eventMax > 0
    )).join("");
  }

  function redemptionRows(stats) {
    const ranked = [...(stats || [])].sort((a, b) => {
      const ag = Number(a.redemption?.totalGain || 0);
      const bg = Number(b.redemption?.totalGain || 0);
      return bg - ag || b.total - a.total;
    });
    return ranked.map((s, i) => {
      const gain = Number(s.redemption?.totalGain || 0);
      return rowHTML(
        i + 1,
        s.name,
        gain > 0 ? `+${fmtPoints(gain)} pts` : "No gain yet",
        gain > 0 ? "Redeemed" : "Redemption open",
        i === 0 && gain > 0
      );
    }).join("");
  }

  function championshipRows(stats, rows) {
    const maxByName = Object.fromEntries(todayMaxes(stats, rows).map(s => [s.name, s.eventMax]));
    return (stats || []).map((s, i) => {
      const gain = Number(s.redemption?.totalGain || 0);
      const max = Number(maxByName[s.name] || 0);
      return rowHTML(
        i + 1,
        s.name,
        `${fmtPoints(s.total)} pts`,
        `Max ${max || "—"} • ${gain > 0 ? `+${fmtPoints(gain)} redeemed` : "No redemption gain"}`,
        i === 0
      );
    }).join("");
  }

  function renderChase(stats, rows) {
    const label = document.getElementById("chaseLabel");
    const list = document.getElementById("chaseList");
    if (!label || !list) return;

    const phase = typeof getChallengePhase === "function" ? getChallengePhase() : { phase:"live", both:false };
    if (phase.both) {
      label.textContent = "Championship Saturday";
      list.innerHTML = championshipRows(stats, rows);
    } else if (phase.phase === "maxout") {
      label.textContent = "Max-Out Race";
      list.innerHTML = maxOutRows(stats, rows);
    } else if (phase.phase === "redemption") {
      label.textContent = "Redemption Race";
      list.innerHTML = redemptionRows(stats);
    } else {
      label.textContent = "Chase To #1";
      list.innerHTML = normalRows(stats);
    }
  }

  const previousRender = render;
  render = function(stats, rows) {
    previousRender(stats, rows);
    renderChase(stats, rows);
  };
})();
