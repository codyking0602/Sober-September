(() => {
  const COMPETITION_TZ = "America/Chicago";
  const pad2 = n => String(n).padStart(2, "0");
  const partsFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: COMPETITION_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });

  function tzParts(date = new Date()) {
    const parts = {};
    partsFormatter.formatToParts(date).forEach(p => {
      if (p.type !== "literal") parts[p.type] = p.value;
    });
    return {
      year: Number(parts.year),
      month: Number(parts.month),
      day: Number(parts.day),
      hour: Number(parts.hour),
      minute: Number(parts.minute),
      second: Number(parts.second)
    };
  }

  function keyFromParts(p) {
    return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`;
  }

  function utcDayNumberFromKey(key) {
    const [y, m, d] = String(key).split("-").map(Number);
    return Date.UTC(y, m - 1, d) / 86400000;
  }

  function shiftKey(key, days) {
    const [y, m, d] = String(key).split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d + days));
    return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
  }

  function zonedDateFromParts(year, month, day, hour = 0, minute = 0, second = 0) {
    const target = Date.UTC(year, month - 1, day, hour, minute, second);
    let guess = target;
    for (let i = 0; i < 3; i++) {
      const p = tzParts(new Date(guess));
      const represented = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
      guess += target - represented;
    }
    return new Date(guess);
  }

  // One competition clock for everybody: America/Chicago.
  dateObj = function(v) {
    const s = String(v || "").trim();
    const match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    if (match) {
      return zonedDateFromParts(
        Number(match[3]),
        Number(match[1]),
        Number(match[2]),
        Number(match[4] || 0),
        Number(match[5] || 0),
        Number(match[6] || 0)
      );
    }
    const d = new Date(v);
    return isNaN(d) ? null : d;
  };

  dayKey = function(d) {
    return d ? keyFromParts(tzParts(d)) : "";
  };

  niceDate = function(d) {
    return d ? d.toLocaleDateString(undefined, {
      timeZone: COMPETITION_TZ,
      month: "short",
      day: "numeric"
    }) : "—";
  };

  daysAgo = function(d) {
    if (!d) return null;
    const today = dayKey(new Date());
    return Math.max(0, utcDayNumberFromKey(today) - utcDayNumberFromKey(dayKey(d)));
  };

  bestConsecutiveStreak = function(days) {
    const keys = [...new Set((days || []).map(d => d.key || dayKey(d.date)).filter(Boolean))]
      .sort((a, b) => utcDayNumberFromKey(a) - utcDayNumberFromKey(b));
    let best = 0, run = 0, prev = null;
    keys.forEach(key => {
      const n = utcDayNumberFromKey(key);
      run = prev !== null && n - prev === 1 ? run + 1 : 1;
      best = Math.max(best, run);
      prev = n;
    });
    return best;
  };

  // Keep a streak alive all day if the athlete was current through yesterday.
  // It breaks only once a full Central-time day was missed.
  streakEndingToday = function(days) {
    const keys = new Set((days || []).map(d => d.key || dayKey(d.date)).filter(Boolean));
    let key = dayKey(new Date());
    if (!keys.has(key)) key = shiftKey(key, -1);
    let count = 0;
    while (keys.has(key)) {
      count++;
      key = shiftKey(key, -1);
    }
    return count;
  };

  challengeProgressPct = function() {
    const todayKey = dayKey(new Date());
    const startKey = "2026-09-01";
    const endKey = "2026-10-01";
    if (todayKey < startKey) return 0;
    if (todayKey >= endKey) return 100;
    const completed = Math.min(
      30,
      Math.max(1, utcDayNumberFromKey(todayKey) - utcDayNumberFromKey(startKey) + 1)
    );
    return Math.round((completed / 30) * 100);
  };

  isRedemptionDate = function(d) {
    const key = dayKey(d);
    return key === "2026-09-19" || key === "2026-09-20";
  };

  getChallengePhase = function() {
    const now = new Date();
    const today = dayKey(now);
    const p = tzParts(now);
    const centralDayOfWeek = new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay();

    const septStart = zonedDateFromParts(2026, 9, 1);
    const redStart = zonedDateFromParts(2026, 9, 19);
    const redEnd = zonedDateFromParts(2026, 9, 21);
    const monthEnd = zonedDateFromParts(2026, 10, 1);
    const inSeason = today >= "2026-09-01" && today < "2026-10-01";
    const isSaturday = centralDayOfWeek === 6;

    if (FORCE_REDEMPTION) {
      const targetKey = shiftKey(today, 2);
      const [y, m, d] = targetKey.split("-").map(Number);
      return {
        phase: "redemption",
        both: false,
        title: "Redemption Weekend",
        sub: "Replace Your Two Lowest Non-Zero Scores",
        icon: "↩️",
        kicker: "Second Chance",
        target: zonedDateFromParts(y, m, d, 23, 59, 59),
        badge: "Rewrite History"
      };
    }

    if (FORCE_MAXOUT) {
      const tomorrowKey = shiftKey(today, 1);
      const [y, m, d] = tomorrowKey.split("-").map(Number);
      return {
        phase: "maxout",
        both: false,
        title: "⚡ Max-Out Saturday",
        sub: "+50 Bonus Points For Highest Strict Pull-Up Set",
        icon: "⚡",
        kicker: "Weekend Mode",
        target: zonedDateFromParts(y, m, d),
        badge: "⚡ +50 PTS On The Line"
      };
    }

    if (now >= redStart && now < redEnd) {
      const both = isSaturday;
      return {
        phase: "redemption",
        both,
        title: "Redemption Weekend",
        sub: both ? "Redemption + Max-Out Bonus Active" : "Replace Your Two Lowest Non-Zero Scores",
        icon: "↩️",
        kicker: both ? "Championship Saturday" : "Second Chance",
        target: redEnd,
        badge: both ? "Second Chance +50 Active" : "Second Chance"
      };
    }

    if (inSeason && isSaturday) {
      const tomorrowKey = shiftKey(today, 1);
      const [y, m, d] = tomorrowKey.split("-").map(Number);
      return {
        phase: "maxout",
        both: false,
        title: "⚡ Max-Out Saturday",
        sub: "+50 Bonus Points For Highest Strict Pull-Up Set",
        icon: "⚡",
        kicker: "Weekend Mode",
        target: zonedDateFromParts(y, m, d),
        badge: "⚡ +50 PTS On The Line"
      };
    }

    if (inSeason) {
      return {
        phase: "live",
        both: false,
        title: "Sober September Is Live",
        sub: "Days Remaining In The Challenge",
        icon: "🔥",
        kicker: "Challenge Mode",
        target: monthEnd,
        badge: "Normal Mode"
      };
    }

    let start = septStart;
    if (today >= "2026-10-01") start = zonedDateFromParts(2027, 9, 1);
    return {
      phase: "pre",
      both: false,
      title: "Sober September Starts In",
      sub: "Challenge Begins September 1",
      icon: "🚀",
      kicker: "Countdown",
      target: start,
      badge: "Normal Mode"
    };
  };

  updateCountdown = function() {
    const e = getChallengePhase();
    const now = new Date();
    const isMax = e.phase === "maxout" || e.both;
    const isRed = e.phase === "redemption";

    document.body.classList.remove("maxout-mode", "redemption-mode");
    if (isMax) document.body.classList.add("maxout-mode");
    if (isRed) document.body.classList.add("redemption-mode");

    document.getElementById("eventTitle").textContent = e.title;
    document.getElementById("eventSub").textContent = e.sub;
    document.getElementById("eventIcon").textContent = e.icon;
    document.getElementById("eventKicker").textContent = e.kicker;
    document.getElementById("mainTitle").innerHTML = isMax
      ? "MAX OUT<br>SATURDAY"
      : (isRed ? "REDEMPTION<br>WEEKEND" : "SOBER<br>SEPTEMBER");
    document.getElementById("logRepsBtn").textContent = isMax
      ? "⚡ LOG YOUR MAX SET"
      : (isRed ? "↩️ LOG REDEMPTION SCORE" : "📝 LOG TODAY'S REPS");

    let diff = Math.max(0, e.target - now);
    const d = Math.floor(diff / 86400000);
    diff -= d * 86400000;
    const h = Math.floor(diff / 3600000);
    diff -= h * 3600000;
    const m = Math.floor(diff / 60000);
    diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    ["d", "h", "m", "s"].forEach((id, i) => {
      document.getElementById(id).textContent = String([d, h, m, s][i]).padStart(2, "0");
    });
  };

  getCallout = function(stats, rows) {
    const phase = getChallengePhase();
    if (phase.both) return { main: "🔥 Championship Saturday Is LIVE", sub: "Redemption +50 Max-Out Bonus" };
    if (phase.phase === "redemption") return { main: "Last Chance To Rewrite History", sub: "Replace Your Two Lowest Scores" };
    if (phase.phase === "maxout") return { main: "⚡ Saturday Is Worth EVERYTHING", sub: "+50 Bonus Points On The Line" };

    const nowParts = tzParts(new Date());
    const hour = nowParts.hour;
    const today = dayKey(new Date());
    const todayRows = (rows || []).filter(r => r.key === today && r.reps > 0);
    const submitters = new Set(todayRows.map(r => r.name));
    const missing = (stats || []).filter(s => !submitters.has(s.name)).sort((a, b) => b.total - a.total);
    const todayLeader = [...(stats || [])].sort((a, b) => b.today - a.today)[0];

    if (todayRows.length === 0) {
      if (hour < 16) return { main: "🌅 Today Is Wide Open", sub: "First Entry Takes The Early Lead" };
      return { main: "🍺 Nobody Break Sobriety Now", sub: "Waiting For Today’s First Entry" };
    }

    if (hour < 16) {
      return {
        main: `🔥 ${todayLeader.name} Sets The Early Pace`,
        sub: `${Math.round(todayLeader.today)} Points On The Board`
      };
    }

    if (hour < 20 && missing.length) {
      return {
        main: `⏳ ${missing.length} ${missing.length === 1 ? "Athlete Still Has" : "Athletes Still Have"} Today Open`,
        sub: "Plenty Of Time Left"
      };
    }

    if (missing.length) {
      return {
        main: `👀 ${missing[0].name} Has Not Logged Reps Today`,
        sub: "Still Time To Check In"
      };
    }

    if (stats.length >= 2) {
      const diff = Math.round(stats[0].total - stats[1].total);
      if (diff > 0 && diff <= 25) {
        return { main: "⚔️ This Race Is Tightening Up", sub: `${stats[1].name} Is Only ${diff} Points Back` };
      }
    }

    return {
      main: `👑 ${stats[0].name} Extending His Lead`,
      sub: `${Math.round(stats[0].today)} Points Today`
    };
  };

  renderAthleteCards = function(stats) {
    const isMax = getChallengePhase().phase === "maxout";
    document.getElementById("athleteCards").innerHTML = stats.map(s => {
      const maxText = s.best > 0 ? s.best : "—";
      const todayPending = s.streak > 0 && s.daysSinceLast === 1 ? " • today open" : "";
      return `<button class="ath-card" onclick="selectAthlete('${s.name}')">
        <div class="ath-card-top">${avatarHTML(s.name,44,18)}<div><div class="name">${s.name}</div><div class="small">${initials(s.name)}</div></div></div>
        <div class="pts">${Math.round(s.total)} PTS</div>
        <div class="small" style="margin-top:6px">🔥 ${s.streak}d${todayPending} • 💪 ${maxText}</div>
        ${isMax ? `<div style="font-size:12px;font-weight:900;margin-top:4px;color:#fde047">⚡ Saturday Max: ${getTodayMaxFor(s.name,window.currentRows||[]) ? getTodayMaxFor(s.name,window.currentRows||[]) + " reps" : "No entry"}</div>` : ""}
        <div class="${checkInClass(s)}" style="font-size:12px;font-weight:900;margin-top:4px">${checkInShort(s)}</div>
      </button>`;
    }).join("");
  };

  function streakVisual(s) {
    if (!s.streak) return `<div class="small empty-stat">No active streak yet</div>`;
    const flames = "🔥".repeat(Math.min(3, s.streak));
    const pending = s.daysSinceLast === 1 ? `<div class="small pending-note">Today is still open</div>` : "";
    return `<div class="stat-visual">${flames}</div>${pending}`;
  }

  function maxVisual(s) {
    if (!(s.best > 0)) return `<div class="small empty-stat">No max set recorded yet</div>`;
    return spark();
  }

  renderProfile = function(s) {
    if (!s) return;
    const panel = document.getElementById("profilePanel");
    panel.style.setProperty("--athlete-glow", ATHLETE_GLOW[s.name] || "#7c3aed");
    panel.innerHTML = `<div class="profile-head">${profilePhotoHTML(s.name,116,116)}<div>
      <div class="profile-name">${s.name}</div>
      <div class="profile-points">${Math.round(s.total)} PTS</div>
      <div class="${weightClass(s)}" style="font-size:13px;font-weight:900;margin-top:5px">Current Weight: ${weightChangeText(s)}</div>
      <div class="${checkInClass(s)}" style="font-size:13px;font-weight:900;margin-top:4px">Last Check-In: ${checkInShort(s).replace(/^\S+\s/,"")}</div>
    </div></div>
    <div class="stat-grid">
      ${stat("Current Streak", s.streak || "—", streakVisual(s))}
      ${stat("Best Max Set", s.best > 0 ? s.best : "—", maxVisual(s))}
      ${stat("Avg Daily", s.avg.toFixed(1))}
      ${stat("Total Reps", s.reps)}
    </div>
    ${renderRedemptionCard(s)}
    <div class="card" style="margin:14px 0 0;padding:14px"><h2 style="font-size:24px">Daily Log</h2><div class="small">Every scoring day this month</div><div class="daily-log-list">${renderDailyLog(s)}</div></div>
    <div class="card chart-card" style="margin:14px 0 0;padding:14px"><h2 style="font-size:24px">Pull-Up Chart</h2><div class="small">Daily reps trend</div>${renderChart(s)}</div>`;
  };

  renderDailyLog = function(s) {
    if (!s.days.length) {
      return `<div class="daily-row"><div>—</div><div class="small">No entries yet</div><div></div></div>`;
    }
    return [...s.days].reverse().map(d => `<div class="daily-row">
      <div style="font-weight:900">${niceDate(d.date)}</div>
      <div><b>${Math.round(d.score)} pts</b><div class="small">${d.reps} reps • max ${d.max > 0 ? d.max : "—"} • ${d.bw || "—"} lbs</div></div>
      <div class="entry-pill">${d.entries} ${d.entries === 1 ? "entry" : "entries"}</div>
    </div>`).join("");
  };

  renderLeague = function(stats, rows) {
    const daily = {};
    rows.forEach(r => {
      const k = r.name + "|" + r.key;
      if (!daily[k]) daily[k] = { name:r.name, key:r.key, score:0, reps:0, max:0, date:r.date };
      daily[k].score += r.score;
      daily[k].reps += r.reps;
      daily[k].max = Math.max(daily[k].max, r.max || 0);
    });

    const days = Object.values(daily);
    const highScore = [...days].sort((a,b) => b.score - a.score)[0];
    const mostReps = [...days].sort((a,b) => b.reps - a.reps)[0];
    const highMax = [...stats].filter(s => s.best > 0).sort((a,b) => b.best - a.best)[0];
    const longStreak = [...stats].sort((a,b) => b.bestStreak - a.bestStreak)[0];

    const records = [
      ["🔥","Highest Daily Score",highScore ? `${Math.round(highScore.score)} pts` : "—",highScore ? `${highScore.name} • ${niceDate(highScore.date)}` : "No entries yet"],
      ["🏋️","Most Reps In One Day",mostReps ? `${mostReps.reps} reps` : "—",mostReps ? `${mostReps.name} • ${niceDate(mostReps.date)}` : "No entries yet"],
      ["💪","Highest Max Set",highMax ? `${highMax.best} reps` : "—",highMax ? highMax.name : "No max set recorded yet"],
      ["⚡","Longest Streak",longStreak && longStreak.bestStreak > 0 ? `${longStreak.bestStreak} days` : "—",longStreak && longStreak.bestStreak > 0 ? longStreak.name : "No streak recorded yet"]
    ];

    document.getElementById("records").innerHTML = records.map(r => `<div class="record-row">
      <div class="record-icon">${r[0]}</div>
      <div><div class="record-title">${r[1]}</div><div class="record-sub">${r[3]}</div></div>
      <div class="record-value">${r[2]}</div>
    </div>`).join("");
  };

  maybeShowChampionModal = function(stats) {
    const now = new Date();
    const champStart = zonedDateFromParts(2026, 10, 1);
    if ((!FORCE_CHAMPION_MODAL && now < champStart) || !stats || !stats.length) return;

    const winner = stats[0];
    const overlay = document.getElementById("championOverlay");
    if (!overlay) return;

    document.getElementById("championPhoto").src = PROFILE_IMAGES[winner.name] || "";
    document.getElementById("championName").textContent = winner.name;
    document.getElementById("championPoints").textContent = `${Math.round(winner.total)} PTS`;
    document.getElementById("championCopy").textContent = `${winner.name} survived Sober September and took the crown.`;
    overlay.classList.add("show");
  };

  let lastUpdatedAt = null;

  function renderLastUpdated() {
    const el = document.getElementById("lastUpdated");
    if (!el || !lastUpdatedAt) return;
    const seconds = Math.max(0, Math.floor((Date.now() - lastUpdatedAt) / 1000));
    if (seconds < 45) el.textContent = "Updated just now";
    else if (seconds < 90) el.textContent = "Updated 1 min ago";
    else if (seconds < 3600) el.textContent = `Updated ${Math.floor(seconds / 60)} min ago`;
    else el.textContent = `Updated ${Math.floor(seconds / 3600)} hr ago`;
  }

  loadAndRender = async function() {
    document.body.classList.add("loading");
    document.getElementById("lastUpdated").textContent = "Updating standings...";
    try {
      const rows = await loadData();
      await new Promise(r => setTimeout(r, 350));
      render(calc(rows), rows);
      document.body.classList.remove("loading");
      lastUpdatedAt = Date.now();
      renderLastUpdated();
    } catch (e) {
      console.error(e);
      document.body.classList.remove("loading");
      document.getElementById("lastUpdated").textContent = "Could not load";
    }
  };

  // Small UI polish only; no redesign.
  const style = document.createElement("style");
  style.textContent = `
    .app{
      padding-top:calc(12px + env(safe-area-inset-top))!important;
    }
    .count-card{
      padding:13px 16px!important;
    }
    .count-card #eventIcon{
      width:48px!important;
      height:48px!important;
      border-radius:17px!important;
      font-size:25px!important;
    }
    .count-card h2{
      font-size:26px!important;
    }
    .count-card .count-grid{
      margin-top:11px!important;
    }
    .count-card .count{
      padding:8px 4px!important;
    }
    .count-card .count div:first-child{
      font-size:24px!important;
    }
    .empty-stat{
      margin-top:10px;
      color:#64748b;
      font-weight:700;
      line-height:1.25;
    }
    .stat-visual{
      margin-top:8px;
      font-size:24px;
      letter-spacing:2px;
    }
    .pending-note{
      margin-top:4px;
      color:#facc15;
      font-weight:800;
    }
    .ath-grid{
      padding-right:28px!important;
    }
  `;
  document.head.appendChild(style);

  setInterval(renderLastUpdated, 30000);
})();