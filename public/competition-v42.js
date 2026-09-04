(() => {
  const MAXOUT_SATURDAYS = new Set([
    "2026-09-05",
    "2026-09-12",
    "2026-09-19",
    "2026-09-26"
  ]);
  const expandedDailyLogs = new Set();

  function maxOutAwards(rows) {
    const byDay = {};
    const awards = Object.fromEntries(ATHLETES.map(name => [name, 0]));

    (rows || []).forEach(r => {
      if (!MAXOUT_SATURDAYS.has(r.key) || !(Number(r.max) > 0)) return;
      if (!byDay[r.key]) byDay[r.key] = {};
      byDay[r.key][r.name] = Math.max(byDay[r.key][r.name] || 0, Number(r.max) || 0);
    });

    Object.values(byDay).forEach(day => {
      const best = Math.max(...Object.values(day), 0);
      if (!(best > 0)) return;
      Object.entries(day).forEach(([name, value]) => {
        if (value === best && Object.prototype.hasOwnProperty.call(awards, name)) awards[name] += 50;
      });
    });

    return awards;
  }

  // Redemption scores replace old scoring days, but Sept 19-20 still count as
  // participation days for streaks / perfect-month eligibility and remain visible
  // in the athlete's actual activity history.
  applyRedemption = function(days) {
    const participationDays = (days || [])
      .map(d => ({ ...d, originalScore: d.score, redeemed: false, replacement: null }))
      .sort((a, b) => a.date - b.date);

    const base = participationDays
      .filter(d => !isRedemptionDate(d.date))
      .map(d => ({ ...d }));

    const redScores = participationDays
      .filter(d => isRedemptionDate(d.date) && d.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(d => ({ ...d }));

    const eligible = [...base]
      .filter(d => d.score > 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 2);

    const applied = [];
    eligible.forEach((low, i) => {
      const candidate = redScores[i];
      if (!candidate || candidate.score <= low.score) return;
      const target = base.find(d => d.key === low.key);
      if (!target) return;

      const gain = candidate.score - low.score;
      target.redeemed = true;
      target.replacement = {
        score: candidate.score,
        reps: candidate.reps,
        max: candidate.max,
        date: candidate.date,
        gain
      };
      target.score = candidate.score;
      target.reps = candidate.reps;
      target.max = Math.max(target.max || 0, candidate.max || 0);
      applied.push({ original: low, replacement: candidate, gain });
    });

    return {
      days: base.sort((a, b) => a.date - b.date),
      participationDays,
      eligible,
      redScores,
      applied,
      totalGain: applied.reduce((sum, item) => sum + item.gain, 0)
    };
  };

  streakBonus = function(participationDays) {
    const streak = bestConsecutiveStreak(participationDays || []);
    const totalDays = (participationDays || []).length;
    let bonus = 0;
    if (streak >= 7) bonus += 100;
    if (streak >= 14) bonus += 200;
    if (streak >= 21) bonus += 300;
    if (totalDays >= 30) bonus += 500;
    return bonus;
  };

  calc = function(rows) {
    const maxOutBonusByName = maxOutAwards(rows);

    return ATHLETES.map(name => {
      const r = rows.filter(x => x.name === name);
      const day = {};

      r.forEach(x => {
        if (!day[x.key]) day[x.key] = { score:0, reps:0, max:0, date:x.date, bw:0, entries:0 };
        day[x.key].score += x.score;
        day[x.key].reps += x.reps;
        day[x.key].max = Math.max(day[x.key].max, x.max || 0);
        day[x.key].bw = x.bw || day[x.key].bw;
        day[x.key].entries++;
      });

      const originalDays = Object.entries(day)
        .map(([key, v]) => ({ key, ...v }))
        .filter(x => x.date)
        .sort((a, b) => a.date - b.date);

      const redemption = applyRedemption(originalDays);
      const scoringDays = redemption.days;
      const participationDays = redemption.participationDays || originalDays;
      const baseTotal = scoringDays.reduce((sum, d) => sum + d.score, 0);
      const consistencyBonus = streakBonus(participationDays);
      const maxOutBonus = maxOutBonusByName[name] || 0;
      const bonus = consistencyBonus + maxOutBonus;
      const total = baseTotal + bonus;

      // Actual physical reps performed, not redemption-adjusted replacement reps.
      const reps = participationDays.reduce((sum, d) => sum + d.reps, 0);
      const best = Math.max(...participationDays.map(x => x.max || 0), ...r.map(x => x.max || 0), 0);

      // Average scoring output only. Streak and Max-Out bonuses do not inflate this.
      const avg = scoringDays.length ? baseTotal / scoringDays.length : 0;
      const today = day[dayKey(new Date())]?.score || 0;

      const weights = r.filter(x => x.bw > 0 && x.date).sort((a, b) => a.date - b.date);
      const startWeight = weights.length ? weights[0].bw : 0;
      const currentWeight = weights.length ? weights[weights.length - 1].bw : 0;
      const weightChange = currentWeight && startWeight ? currentWeight - startWeight : 0;
      const lastEntry = r.filter(x => x.date).sort((a, b) => b.date - a.date)[0]?.date || null;
      const daysSinceLast = daysAgo(lastEntry);
      const currentStreak = streakEndingToday(participationDays);
      const bestStreak = bestConsecutiveStreak(participationDays);

      return {
        name,
        total,
        bonus,
        consistencyBonus,
        maxOutBonus,
        reps,
        best,
        avg,
        streak: currentStreak,
        bestStreak,
        today,
        startWeight,
        currentWeight,
        weightChange,
        lastEntry,
        daysSinceLast,
        days: scoringDays,
        participationDays,
        originalDays,
        redemption,
        rawRows: r
      };
    }).sort((a, b) => b.total - a.total);
  };

  function leaderGapHTML(s) {
    const stats = window.currentStats || [];
    const leader = stats[0];
    if (!leader) return "";

    const gap = Number(leader.total || 0) - Number(s.total || 0);
    if (leader.name === s.name || gap <= 0.0001) {
      return `<div class="leader-gap leader-gap-current">👑 Current leader</div>`;
    }

    if (s.currentWeight > 0) {
      const repsBehind = Math.ceil(gap / (s.currentWeight / 100));
      return `<div class="leader-gap">↗ ${repsBehind} reps behind ${leader.name} at ${s.currentWeight} lb</div>`;
    }

    return `<div class="leader-gap">↗ ${Math.ceil(gap)} pts behind ${leader.name}</div>`;
  }

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

  selectAthlete = function(name) {
    showTab("athletes");
    window.selectedAthleteName = name;
    const athlete = (window.currentStats || []).find(x => x.name === name);
    if (athlete) renderProfile(athlete);
  };

  window.toggleDailyLog = function(name) {
    if (expandedDailyLogs.has(name)) expandedDailyLogs.delete(name);
    else expandedDailyLogs.add(name);
    const athlete = (window.currentStats || []).find(x => x.name === name);
    if (athlete) renderProfile(athlete);
  };

  renderProfile = function(s) {
    if (!s) return;
    window.selectedAthleteName = s.name;
    const panel = document.getElementById("profilePanel");
    panel.style.setProperty("--athlete-glow", ATHLETE_GLOW[s.name] || "#7c3aed");
    panel.innerHTML = `<div class="profile-head">${profilePhotoHTML(s.name,116,116)}<div>
      <div class="profile-name">${s.name}</div>
      <div class="profile-points">${Math.round(s.total)} PTS</div>
      ${leaderGapHTML(s)}
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
    const actualDays = (s.originalDays && s.originalDays.length ? s.originalDays : s.days) || [];
    if (!actualDays.length) {
      return `<div class="daily-row"><div>—</div><div class="small">No entries yet</div><div></div></div>`;
    }

    const all = [...actualDays].reverse();
    const expanded = expandedDailyLogs.has(s.name);
    const visible = expanded || all.length <= 5 ? all : all.slice(0, 5);

    const rows = visible.map(d => `<div class="daily-row">
      <div style="font-weight:900">${niceDate(d.date)}</div>
      <div><b>${Math.round(d.score)} pts</b><div class="small">${d.reps} reps • max ${d.max > 0 ? d.max : "—"} • ${d.bw || "—"} lbs</div></div>
      <div class="entry-pill">${d.entries} ${d.entries === 1 ? "entry" : "entries"}</div>
    </div>`).join("");

    if (all.length <= 5) return rows;

    const button = expanded
      ? `<button class="daily-toggle" onclick="toggleDailyLog('${s.name}')">Show latest 5</button>`
      : `<button class="daily-toggle" onclick="toggleDailyLog('${s.name}')">Show all ${all.length} days</button>`;

    return rows + button;
  };

  renderChart = function(s) {
    const chartDays = (s.originalDays && s.originalDays.length ? s.originalDays : s.days) || [];
    if (!chartDays.length) return `<div class="chart"></div>`;

    const vals = chartDays.map(d => ({ date:d.date, reps:d.reps }));
    const rawMax = Math.max(...vals.map(v => v.reps), 1);
    const yMax = Math.max(10, Math.ceil((rawMax * 1.15) / 10) * 10);
    const w = 460, h = 190, pL = 46, pR = 28, pT = 28, pB = 34;
    const plotW = w - pL - pR;
    const plotH = h - pT - pB;

    const yTicks = [0, Math.round(yMax / 2), yMax];
    const grid = yTicks.map(v => {
      const y = h - pB - (v / yMax) * plotH;
      return `<line x1="${pL}" y1="${y}" x2="${w-pR}" y2="${y}" stroke="rgba(148,163,184,.16)" stroke-width="1"/>
        <text class="chart-label" x="${pL-8}" y="${y+4}" text-anchor="end">${v}</text>`;
    }).join("");

    const pts = vals.map((v, i) => {
      const x = pL + (i / Math.max(vals.length - 1, 1)) * plotW;
      const y = h - pB - (v.reps / yMax) * plotH;
      return [x, y, v];
    });

    const line = pts.map(p => `${p[0]},${p[1]}`).join(" ");
    const dots = pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#22c55e" stroke="#dcfce7" stroke-width="1.5"/>`).join("");

    const labelStep = vals.length <= 7 ? 1 : vals.length <= 14 ? 2 : vals.length <= 21 ? 3 : 4;
    const xLabels = pts.map((p, i) => {
      if (i % labelStep !== 0 && i !== pts.length - 1) return "";
      const d = p[2].date;
      const label = `${d.toLocaleDateString(undefined,{timeZone:"America/Chicago",month:"numeric",day:"numeric"})}`;
      return `<text class="chart-label" x="${p[0]}" y="${h-10}" text-anchor="middle">${label}</text>`;
    }).join("");

    const valueLabels = pts.map((p, i) => {
      if (vals.length > 7 && i !== pts.length - 1) return "";
      return `<text class="chart-point-value" x="${p[0]}" y="${Math.max(16,p[1]-10)}" text-anchor="middle">${p[2].reps}</text>`;
    }).join("");

    return `<div class="chart"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">
      ${grid}
      <line x1="${pL}" y1="${pT}" x2="${pL}" y2="${h-pB}" stroke="rgba(148,163,184,.18)"/>
      <polyline points="${line}" fill="none" stroke="#22c55e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
      ${valueLabels}
      ${xLabels}
    </svg></div>`;
  };

  const extraStyle = document.createElement("style");
  extraStyle.textContent = `
    .leader-gap{
      margin-top:5px;
      color:#7dd3fc;
      font-size:12px;
      line-height:1.25;
      font-weight:900;
    }
    .leader-gap-current{color:#fde047}
    .daily-log-list{
      max-height:none!important;
      overflow:visible!important;
      padding-right:0!important;
    }
    .daily-toggle{
      width:100%;
      margin-top:10px;
      border:1px solid rgba(125,211,252,.22);
      border-radius:16px;
      padding:11px 12px;
      background:rgba(56,189,248,.08);
      color:#7dd3fc;
      font-size:13px;
      font-weight:900;
    }
    .chart-point-value{
      fill:#7dd3fc;
      font-size:12px;
      font-weight:900;
    }
  `;
  document.head.appendChild(extraStyle);
})();
