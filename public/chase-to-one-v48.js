(() => {
  const calloutText = document.getElementById("calloutText");
  const card = calloutText ? calloutText.closest(".card") : null;
  const grid = card ? card.parentElement : null;
  if (!card || !grid) return;

  grid.classList.add("home-race-grid");
  card.classList.add("chase-card");

  // The old Today's Leader / event mini-cards are now folded into one full-width summary.
  Array.from(grid.children).forEach(child => {
    if (child !== card) child.classList.add("home-race-hidden");
  });

  card.innerHTML = `
    <div id="chaseLabel" class="label chase-title">Chase To #1</div>
    <div id="chaseToday" class="chase-today"></div>
    <div id="chaseContext" class="chase-context"></div>
    <div id="chaseList" class="chase-list"></div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .home-race-grid{
      display:block!important;
    }
    .home-race-hidden{
      display:none!important;
    }
    .chase-card{
      width:100%;
      min-height:0!important;
      padding:14px 16px 12px!important;
      margin-bottom:14px;
    }
    .chase-title{
      text-align:center;
      font-size:10px;
      letter-spacing:.28em;
      color:#c4b5fd;
      white-space:nowrap;
    }
    .chase-today{
      margin-top:10px;
      padding:9px 11px;
      border-radius:15px;
      background:rgba(125,211,252,.07);
      border:1px solid rgba(125,211,252,.12);
      display:flex;
      align-items:center;
      justify-content:center;
      gap:7px;
      color:#cbd5e1;
      font-size:12px;
      font-weight:800;
      line-height:1.15;
      text-align:center;
      flex-wrap:wrap;
    }
    .chase-today strong{
      color:#fff;
      font-size:13px;
    }
    .chase-today .today-value{
      color:#7dd3fc;
      font-weight:900;
    }
    .chase-context{
      margin:10px 0 4px;
      text-align:center;
      color:#94a3b8;
      font-size:10px;
      font-weight:900;
      letter-spacing:.12em;
      text-transform:uppercase;
    }
    .chase-list{
      margin-top:0;
    }
    .chase-row{
      display:grid;
      grid-template-columns:26px minmax(0,1fr) minmax(108px,auto);
      align-items:center;
      gap:9px;
      padding:8px 0;
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
      color:#fff;
      font-size:14px;
      font-weight:900;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }
    .chase-value{
      text-align:right;
      min-width:0;
    }
    .chase-main{
      color:#7dd3fc;
      font-size:13px;
      line-height:1.05;
      font-weight:900;
      white-space:nowrap;
    }
    .chase-sub{
      color:#94a3b8;
      font-size:10px;
      line-height:1.1;
      font-weight:800;
      margin-top:2px;
      white-space:nowrap;
    }
    .chase-row.leader .chase-rank{color:#fde047}
    .chase-row.leader .chase-main{color:#fde047}
    body.maxout-mode .chase-card{border-color:rgba(250,204,21,.28)}
    body.maxout-mode .chase-title{color:#fde047}
    body.redemption-mode .chase-card{border-color:rgba(251,113,133,.26)}
    body.redemption-mode .chase-title{color:#fb7185}
    @media(max-width:390px){
      .chase-card{padding:13px 13px 11px!important}
      .chase-row{grid-template-columns:23px minmax(0,1fr) minmax(96px,auto);gap:7px;padding:7px 0}
      .chase-name{font-size:13px}
      .chase-main{font-size:12px}
      .chase-sub{font-size:9px}
      .chase-today{font-size:11px;padding:8px 9px}
      .chase-today strong{font-size:12px}
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
      <div class="chase-value"><div class="chase-main">${main}</div>${sub ? `<div class="chase-sub">${sub}</div>` : ""}</div>
    </div>`;
  }

  function chaseWeight(s) {
    const entered = Number(s.currentWeight) || 0;
    if (entered > 0) return entered;
    if (s.name === "DJ") return 180;
    return 0;
  }

  function normalRows(stats) {
    if (!stats || !stats.length) return `<div class="small" style="margin-top:10px;text-align:center">Waiting for standings</div>`;
    const leader = stats[0];
    const leaderDisplay = Math.round(Number(leader.total) || 0);

    return stats.map((s, i) => {
      const shownTotal = Math.round(Number(s.total) || 0);
      if (i === 0) return rowHTML(1, s.name, `${shownTotal.toLocaleString()} pts`, "Current leader", true);

      const gap = Math.max(0, leaderDisplay - shownTotal);
      if (gap === 0) return rowHTML(i + 1, s.name, "0 reps needed", "Tied for 1st");

      const weight = chaseWeight(s);
      const reps = weight > 0 ? Math.ceil(gap / (weight / 100)) : null;
      return rowHTML(
        i + 1,
        s.name,
        reps === null ? `${gap.toLocaleString()} pts back` : `${reps.toLocaleString()} reps needed`,
        reps === null ? "Add weight for rep target" : `${gap.toLocaleString()} pts back`
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

  function renderTodayLine(stats, rows) {
    const el = document.getElementById("chaseToday");
    if (!el || !stats || !stats.length) return;

    const todayLeader = [...stats].sort((a, b) => b.today - a.today)[0];
    if (!todayLeader) return;

    const key = dayKey(new Date());
    const reps = (rows || [])
      .filter(r => r.name === todayLeader.name && r.key === key)
      .reduce((sum, r) => sum + (Number(r.reps) || 0), 0);

    el.innerHTML = `<span>Today:</span><strong>${todayLeader.name}</strong><span class="today-value">${reps.toLocaleString()} reps</span><span>•</span><span class="today-value">${fmtPoints(todayLeader.today)} pts</span>`;
  }

  function renderChase(stats, rows) {
    const label = document.getElementById("chaseLabel");
    const context = document.getElementById("chaseContext");
    const list = document.getElementById("chaseList");
    if (!label || !context || !list) return;

    const phase = typeof getChallengePhase === "function" ? getChallengePhase() : { phase:"live", both:false };
    if (phase.both) {
      label.textContent = "Championship Saturday";
      context.textContent = "Overall points • max • redemption";
      list.innerHTML = championshipRows(stats, rows);
    } else if (phase.phase === "maxout") {
      label.textContent = "Max-Out Race";
      context.textContent = "Highest strict set today";
      list.innerHTML = maxOutRows(stats, rows);
    } else if (phase.phase === "redemption") {
      label.textContent = "Redemption Race";
      context.textContent = "Points gained by replacing low scores";
      list.innerHTML = redemptionRows(stats);
    } else {
      label.textContent = "Chase To #1";
      const leaderName = stats && stats[0] ? stats[0].name : "1st";
      context.textContent = `To catch ${leaderName}`;
      list.innerHTML = normalRows(stats);
    }
  }

  const previousRender = render;
  render = function(stats, rows) {
    previousRender(stats, rows);
    renderTodayLine(stats, rows);
    renderChase(stats, rows);
  };
})();
