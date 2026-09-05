(() => {
  const calloutText = document.getElementById("calloutText");
  const chaseCard = calloutText ? calloutText.closest(".card") : null;
  const todayLeaderEl = document.getElementById("todayLeader");
  const todayCard = todayLeaderEl ? todayLeaderEl.closest(".card") : null;
  const oldGrid = chaseCard ? chaseCard.parentElement : null;
  const podiumCard = document.querySelector(".podium-card");
  if (!chaseCard || !todayCard || !oldGrid || !podiumCard) return;

  // Home hierarchy: Today's Leader -> Podium -> Chase To #1 -> Motivation.
  podiumCard.parentElement.insertBefore(todayCard, podiumCard);
  podiumCard.insertAdjacentElement("afterend", chaseCard);
  oldGrid.classList.add("home-old-summary-hidden");

  todayCard.classList.remove("mini");
  todayCard.classList.add("today-strip");
  todayCard.innerHTML = `
    <div class="today-strip-icon">⚡</div>
    <div class="today-strip-leader">
      <div class="label">Today’s Leader</div>
      <div id="todayLeader" class="today-strip-name">—</div>
    </div>
    <div class="today-strip-stat">
      <div id="todayReps" class="today-strip-value">—</div>
      <div class="today-strip-caption">reps today</div>
    </div>
    <div class="today-strip-stat">
      <div id="todayPoints" class="today-strip-value">—</div>
      <div class="today-strip-caption">points today</div>
    </div>
  `;

  chaseCard.classList.remove("mini");
  chaseCard.classList.add("chase-card");
  chaseCard.innerHTML = `
    <div id="chaseLabel" class="label chase-title">Chase To #1</div>
    <div id="chaseContext" class="chase-context">—</div>
    <div id="chaseList" class="chase-list"></div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .home-old-summary-hidden{display:none!important}

    .today-strip{
      display:grid;
      grid-template-columns:38px minmax(112px,1.25fr) minmax(82px,.8fr) minmax(82px,.8fr);
      align-items:center;
      gap:10px;
      min-height:96px;
      padding:14px 16px!important;
      margin-bottom:14px;
      border-radius:26px;
      background:radial-gradient(circle at left center,rgba(56,189,248,.11),transparent 33%),linear-gradient(180deg,rgba(8,15,30,.96),rgba(2,6,23,.92));
    }
    .today-strip-icon{
      font-size:32px;
      line-height:1;
      text-align:center;
      filter:drop-shadow(0 0 14px rgba(56,189,248,.25));
    }
    .today-strip-leader .label{
      font-size:9px;
      letter-spacing:.22em;
      white-space:nowrap;
    }
    .today-strip-name{
      margin-top:4px;
      font-size:27px;
      line-height:1;
      font-weight:900;
      letter-spacing:-.03em;
    }
    .today-strip-stat{
      min-width:0;
      text-align:center;
      padding-left:10px;
      border-left:1px solid rgba(255,255,255,.12);
    }
    .today-strip-value{
      color:#7dd3fc;
      font-size:24px;
      line-height:1;
      font-weight:900;
      white-space:nowrap;
    }
    .today-strip-caption{
      margin-top:5px;
      color:#cbd5e1;
      font-size:10px;
      line-height:1.1;
      font-weight:800;
      white-space:nowrap;
    }

    .chase-card{
      width:100%;
      min-height:0!important;
      padding:16px 18px 12px!important;
      margin-bottom:14px;
    }
    .chase-title{
      text-align:center;
      color:#e2e8f0;
      font-size:11px;
      letter-spacing:.30em;
      white-space:nowrap;
    }
    .chase-context{
      margin-top:6px;
      text-align:center;
      color:#94a3b8;
      font-size:12px;
      font-weight:800;
    }
    .chase-list{
      margin-top:10px;
      border:1px solid rgba(255,255,255,.07);
      border-radius:18px;
      padding:0 12px;
      background:rgba(2,6,23,.24);
    }
    .chase-row{
      display:grid;
      grid-template-columns:28px minmax(0,.85fr) minmax(0,1.9fr);
      align-items:center;
      gap:10px;
      min-height:58px;
      padding:8px 0;
      border-bottom:1px solid rgba(255,255,255,.08);
    }
    .chase-row:last-child{border-bottom:0}
    .chase-rank{
      color:#94a3b8;
      font-size:15px;
      font-weight:900;
      text-align:center;
    }
    .chase-name{
      color:#fff;
      font-size:16px;
      font-weight:900;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }
    .chase-targets{
      display:grid;
      grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);
      align-items:center;
      gap:12px;
      min-width:0;
    }
    .chase-target{
      min-width:0;
      white-space:nowrap;
    }
    .chase-target + .chase-target{
      padding-left:12px;
      border-left:1px solid rgba(255,255,255,.12);
    }
    .chase-target strong{
      color:#7dd3fc;
      font-size:23px;
      line-height:1;
      font-weight:900;
    }
    .chase-target span{
      margin-left:4px;
      color:#cbd5e1;
      font-size:10px;
      font-weight:800;
    }
    .chase-target.secondary strong{
      color:#fff;
      font-size:18px;
    }
    .chase-event-main{
      color:#7dd3fc;
      font-size:14px;
      font-weight:900;
      text-align:right;
    }
    .chase-event-sub{
      margin-top:2px;
      color:#94a3b8;
      font-size:10px;
      font-weight:800;
      text-align:right;
    }
    body.maxout-mode .chase-card{border-color:rgba(250,204,21,.28)}
    body.maxout-mode .chase-title{color:#fde047}
    body.redemption-mode .chase-card{border-color:rgba(251,113,133,.26)}
    body.redemption-mode .chase-title{color:#fb7185}

    @media(max-width:390px){
      .today-strip{
        grid-template-columns:32px minmax(92px,1.15fr) minmax(68px,.8fr) minmax(68px,.8fr);
        gap:7px;
        min-height:88px;
        padding:12px 11px!important;
      }
      .today-strip-icon{font-size:27px}
      .today-strip-leader .label{font-size:8px;letter-spacing:.16em}
      .today-strip-name{font-size:23px}
      .today-strip-stat{padding-left:7px}
      .today-strip-value{font-size:20px}
      .today-strip-caption{font-size:9px}
      .chase-card{padding:14px 13px 11px!important}
      .chase-list{padding:0 9px}
      .chase-row{grid-template-columns:23px minmax(0,.75fr) minmax(0,2fr);gap:7px;min-height:54px}
      .chase-rank{font-size:13px}
      .chase-name{font-size:14px}
      .chase-targets{gap:8px}
      .chase-target + .chase-target{padding-left:8px}
      .chase-target strong{font-size:20px}
      .chase-target.secondary strong{font-size:16px}
      .chase-target span{font-size:9px;margin-left:3px}
    }
  `;
  document.head.appendChild(style);

  function fmtPoints(value) {
    return Math.round(Number(value) || 0).toLocaleString();
  }

  function chaseWeight(s) {
    const entered = Number(s.currentWeight) || 0;
    if (entered > 0) return entered;
    if (s.name === "DJ") return 180;
    return 0;
  }

  function challengerRowHTML(rank, name, reps, gap) {
    const repsText = reps === null ? "—" : reps.toLocaleString();
    return `<div class="chase-row">
      <div class="chase-rank">${rank}</div>
      <div class="chase-name">${name}</div>
      <div class="chase-targets">
        <div class="chase-target"><strong>${repsText}</strong><span>${reps === null ? "weight needed" : "reps needed"}</span></div>
        <div class="chase-target secondary"><strong>${gap.toLocaleString()}</strong><span>pts back</span></div>
      </div>
    </div>`;
  }

  function eventRowHTML(rank, name, main, sub) {
    return `<div class="chase-row">
      <div class="chase-rank">${rank}</div>
      <div class="chase-name">${name}</div>
      <div><div class="chase-event-main">${main}</div>${sub ? `<div class="chase-event-sub">${sub}</div>` : ""}</div>
    </div>`;
  }

  function normalRows(stats) {
    if (!stats || stats.length < 2) return `<div class="small" style="padding:14px 0;text-align:center">Waiting for challengers</div>`;
    const leaderDisplay = Math.round(Number(stats[0].total) || 0);

    return stats.slice(1).map((s, index) => {
      const shownTotal = Math.round(Number(s.total) || 0);
      const gap = Math.max(0, leaderDisplay - shownTotal);
      const weight = chaseWeight(s);
      const reps = gap === 0 ? 0 : (weight > 0 ? Math.ceil(gap / (weight / 100)) : null);
      return challengerRowHTML(index + 2, s.name, reps, gap);
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
    return todayMaxes(stats, rows).map((s, i) => eventRowHTML(
      i + 1,
      s.name,
      s.eventMax > 0 ? `${s.eventMax} reps` : "No max yet",
      i === 0 && s.eventMax > 0 ? "Current Max-Out leader" : "Saturday max"
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
      return eventRowHTML(
        i + 1,
        s.name,
        gain > 0 ? `+${fmtPoints(gain)} pts` : "No gain yet",
        gain > 0 ? "Redeemed" : "Redemption open"
      );
    }).join("");
  }

  function championshipRows(stats, rows) {
    const maxByName = Object.fromEntries(todayMaxes(stats, rows).map(s => [s.name, s.eventMax]));
    return (stats || []).map((s, i) => {
      const gain = Number(s.redemption?.totalGain || 0);
      const max = Number(maxByName[s.name] || 0);
      return eventRowHTML(
        i + 1,
        s.name,
        `${fmtPoints(s.total)} pts`,
        `Max ${max || "—"} • ${gain > 0 ? `+${fmtPoints(gain)} redeemed` : "No redemption gain"}`
      );
    }).join("");
  }

  function renderTodaySummary(stats, rows) {
    const nameEl = document.getElementById("todayLeader");
    const repsEl = document.getElementById("todayReps");
    const pointsEl = document.getElementById("todayPoints");
    if (!nameEl || !repsEl || !pointsEl || !stats || !stats.length) return;

    const todayLeader = [...stats].sort((a, b) => b.today - a.today)[0];
    if (!todayLeader) return;

    const key = dayKey(new Date());
    const reps = (rows || [])
      .filter(r => r.name === todayLeader.name && r.key === key)
      .reduce((sum, r) => sum + (Number(r.reps) || 0), 0);

    nameEl.textContent = todayLeader.name;
    repsEl.textContent = reps.toLocaleString();
    pointsEl.textContent = fmtPoints(todayLeader.today);
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
      const leader = stats && stats[0];
      context.textContent = leader ? `To catch ${leader.name} • ${fmtPoints(leader.total)} pts` : "To catch the leader";
      list.innerHTML = normalRows(stats);
    }
  }

  const previousRender = render;
  render = function(stats, rows) {
    previousRender(stats, rows);
    renderTodaySummary(stats, rows);
    renderChase(stats, rows);
  };
})();
