from pathlib import Path
import re

p = Path('public/index.html')
s = p.read_text()

# Preview Redemption Weekend instead of Max-Out.
s = s.replace('const FORCE_MAXOUT = true;', 'const FORCE_MAXOUT = false;\nconst FORCE_REDEMPTION = true;')
if 'const FORCE_REDEMPTION' not in s:
    s = s.replace('const CSV_URL=', 'const FORCE_MAXOUT = false;\nconst FORCE_REDEMPTION = true;\nconst CSV_URL=')

# CSS additions.
if '.redemption-banner' not in s:
    anchor = '.maxout-banner .sub{font-size:13px;margin-top:5px;color:#111827}'
    add = anchor + '.redemption-banner{display:none;border-radius:24px;padding:15px 16px;margin-bottom:14px;background:linear-gradient(135deg,#fb7185,#f97316);color:#fff;font-weight:900;box-shadow:0 0 35px rgba(249,115,22,.34);border:2px solid rgba(255,255,255,.16)}.redemption-banner .title{font-size:22px;line-height:1}.redemption-banner .sub{font-size:13px;margin-top:5px;color:#ffe4e6}.redemption-only{display:none}.redemption-card{border-color:rgba(248,113,113,.24)!important;background:radial-gradient(circle at top left,rgba(248,113,113,.14),transparent 38%),rgba(255,255,255,.025)!important}.redemption-list{display:grid;gap:9px;margin-top:10px}.redemption-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.08)}.redemption-row:last-child{border-bottom:0}.redemption-score{color:#fb7185;font-weight:900}.redemption-gain{color:#f97316;font-weight:900}body.redemption-mode .app{background:radial-gradient(circle at 50% -8%,rgba(248,113,113,.32),transparent 28%),radial-gradient(circle at 0% 42%,rgba(249,115,22,.22),transparent 26%),radial-gradient(circle at 100% 36%,rgba(251,113,133,.14),transparent 24%),linear-gradient(#020617,#111827 45%,#0f172a)}body.redemption-mode .redemption-banner{display:block}body.redemption-mode .redemption-only{display:block;grid-column:1/-1}body.redemption-mode .count-card{border-color:rgba(248,113,113,.42)!important;box-shadow:0 0 0 1px rgba(248,113,113,.12),0 10px 42px rgba(0,0,0,.45),0 0 60px rgba(249,115,22,.18)!important;background:radial-gradient(circle at top left,rgba(248,113,113,.18),transparent 42%),radial-gradient(circle at bottom right,rgba(249,115,22,.16),transparent 44%),linear-gradient(180deg,rgba(8,15,30,.98),rgba(2,6,23,.94))!important}body.redemption-mode #eventIcon{background:rgba(248,113,113,.18)!important;box-shadow:0 0 30px rgba(248,113,113,.38);animation:maxPulse 1.8s infinite}body.redemption-mode .log-reps-btn{background:linear-gradient(135deg,#fb7185,#f97316);color:#fff;box-shadow:0 0 35px rgba(249,115,22,.32)}body.redemption-mode .progress-bar{background:linear-gradient(90deg,#ef4444,#f97316,#facc15)}'
    s = s.replace(anchor, add)

# Home banner.
if 'redemptionBanner' not in s:
    s = s.replace('<section id="maxoutBanner" class="maxout-banner"><div class="title">⚡ MAX-OUT SATURDAY ACTIVE</div><div class="sub">+50 BONUS TO HIGHEST STRICT SET</div></section>', '<section id="maxoutBanner" class="maxout-banner"><div class="title">⚡ MAX-OUT SATURDAY ACTIVE</div><div class="sub">+50 BONUS TO HIGHEST STRICT SET</div></section>\n<section id="redemptionBanner" class="redemption-banner"><div class="title">🔥 REDEMPTION WEEKEND ACTIVE</div><div class="sub">LAST CHANCE TO REWRITE HISTORY</div></section>')

# Home redemption watch.
if 'redemptionWatchName' not in s:
    s = s.replace('<div class="card mini max-only"><div class="label">Current Max Leader</div><div id="maxLeaderName" class="big">—</div><div id="maxLeaderSet" style="font-size:21px;color:#fde047;font-weight:900;margin-top:8px">—</div></div></section>', '<div class="card mini max-only"><div class="label">Current Max Leader</div><div id="maxLeaderName" class="big">—</div><div id="maxLeaderSet" style="font-size:21px;color:#fde047;font-weight:900;margin-top:8px">—</div></div><div class="card mini redemption-only"><div class="label">Redemption Watch</div><div id="redemptionWatchName" class="big">—</div><div id="redemptionWatchGain" style="font-size:21px;color:#fb7185;font-weight:900;margin-top:8px">—</div></div></section>')

# League tracker.
if 'redemptionTracker' not in s:
    s = s.replace('<section class="card"><h2>Records</h2><div id="records"></div></section><section class="card"><div class="label" style="color:#c4b5fd">Special Events</div>', '<section class="card"><h2>Records</h2><div id="records"></div></section><section class="card redemption-only redemption-card"><div class="label" style="color:#fb7185">Redemption Tracker</div><h2>Replacement Watch</h2><div id="redemptionTracker" class="redemption-list"></div></section><section class="card"><div class="label" style="color:#c4b5fd">Special Events</div>')

# Force redemption phase.
s = s.replace('if(FORCE_MAXOUT){const tomorrow=new Date(now);tomorrow.setDate(now.getDate()+1);tomorrow.setHours(0,0,0,0);return{phase:"maxout",title:"⚡ Max-Out Saturday",sub:"+50 Bonus Points For Highest Strict Pull-Up Set",icon:"⚡",kicker:"Weekend Mode",target:tomorrow,badge:"⚡ +50 PTS On The Line"}}if(now>=redStart', 'if(FORCE_REDEMPTION){const target=new Date(now);target.setDate(now.getDate()+2);target.setHours(23,59,59,999);return{phase:"redemption",both:false,title:"🔥 Redemption Weekend",sub:"Replace Your Two Lowest Non-Zero Scores",icon:"🔥",kicker:"Second Chance",target,badge:"Rewrite History"}}if(FORCE_MAXOUT){const tomorrow=new Date(now);tomorrow.setDate(now.getDate()+1);tomorrow.setHours(0,0,0,0);return{phase:"maxout",title:"⚡ Max-Out Saturday",sub:"+50 Bonus Points For Highest Strict Pull-Up Set",icon:"⚡",kicker:"Weekend Mode",target:tomorrow,badge:"⚡ +50 PTS On The Line"}}if(now>=redStart')

# Header/button redemption mode.
s = s.replace('document.getElementById("mainTitle").innerHTML=isMax?"MAX OUT<br>SATURDAY":"SOBER<br>SEPTEMBER";document.getElementById("logRepsBtn").textContent=isMax?"⚡ LOG YOUR MAX SET":"📝 LOG TODAY\'S REPS";', 'const isRed=e.phase==="redemption";document.getElementById("mainTitle").innerHTML=isMax?"MAX OUT<br>SATURDAY":(isRed?"REDEMPTION<br>WEEKEND":"SOBER<br>SEPTEMBER");document.getElementById("logRepsBtn").textContent=isMax?"⚡ LOG YOUR MAX SET":(isRed?"🔥 LOG REDEMPTION SCORE":"📝 LOG TODAY\'S REPS");')

# Redemption callout.
s = s.replace('if(phase.phase==="redemption")return{main:"🔥 Redemption Weekend Is LIVE",sub:"Two Scores Can Be Replaced"};', 'if(phase.phase==="redemption")return{main:"🔥 Last Chance To Rewrite History",sub:"Replace Your Two Lowest Scores"};')

# Helpers and profile card.
if 'function getRedemptionInfo' not in s:
    helpers = '''function getRedemptionInfo(s){const eligible=[...(s.days||[])].filter(d=>d.score>0).sort((a,b)=>a.score-b.score).slice(0,2);const redScores=(s.days||[]).filter(d=>{const dt=d.date;return dt&&dt.getMonth()===8&&(dt.getDate()===19||dt.getDate()===20)}).sort((a,b)=>b.score-a.score).slice(0,2);let gain=0;eligible.forEach((low,i)=>{const candidate=redScores[i]?.score||0;if(candidate>low.score)gain+=candidate-low.score});return{eligible,redScores,gain:Math.round(gain)}}
function renderRedemptionCard(s){const info=getRedemptionInfo(s);const rows=info.eligible.length?info.eligible.map(d=>`<div class="redemption-row"><div><b>${niceDate(d.date)}</b><div class="small">${d.reps} reps • ${Math.round(d.score)} pts</div></div><div class="redemption-score">Replace</div></div>`).join(""):`<div class="small" style="margin-top:8px">No eligible scoring days yet.</div>`;return `<div class="card redemption-only redemption-card" style="margin:14px 0 0;padding:14px"><div class="label" style="color:#fb7185">Redemption Weekend</div><h2 style="font-size:24px">Days Eligible For Replacement</h2><div class="redemption-list">${rows}</div><div class="redemption-gain" style="font-size:18px;margin-top:10px">Potential Gain: +${info.gain} pts</div></div>`}
function renderRedemptionTracker(stats){const el=document.getElementById("redemptionTracker");if(!el)return;el.innerHTML=[...stats].map(s=>{const info=getRedemptionInfo(s);const low=info.eligible.map(d=>Math.round(d.score)+" pts").join(" / ")||"No eligible days";return `<div class="redemption-row"><div><b>${s.name}</b><div class="small">Lowest scores: ${low}</div></div><div class="redemption-gain">+${info.gain}</div></div>`}).join("");const watch=[...stats].sort((a,b)=>getRedemptionInfo(b).gain-getRedemptionInfo(a).gain)[0];const nameEl=document.getElementById("redemptionWatchName"),gainEl=document.getElementById("redemptionWatchGain");if(nameEl)nameEl.textContent=watch?.name||"No Eligible Days";if(gainEl)gainEl.textContent=watch?`+${getRedemptionInfo(watch).gain} pts possible`:"Waiting For Scores"}
'''
    s = s.replace('function renderProfile(s){const panel=document.getElementById("profilePanel");', helpers + 'function renderProfile(s){const panel=document.getElementById("profilePanel");')
    s = s.replace('<div class="card" style="margin:14px 0 0;padding:14px"><h2 style="font-size:24px">Daily Log</h2>', '${renderRedemptionCard(s)}<div class="card" style="margin:14px 0 0;padding:14px"><h2 style="font-size:24px">Daily Log</h2>')

# Call tracker in render.
s = s.replace('renderLeague(stats,rows);renderMaxLeader(stats,rows);', 'renderLeague(stats,rows);renderRedemptionTracker(stats);renderMaxLeader(stats,rows);')
s = s.replace('renderLeague(stats,rows);renderMaxLeader(stats);', 'renderLeague(stats,rows);renderRedemptionTracker(stats);renderMaxLeader(stats,rows);')

p.write_text(s)
