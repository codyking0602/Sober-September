from pathlib import Path

p = Path('public/index.html')
s = p.read_text()

s = s.replace('Sober September V40 Stable Event Logic', 'Sober September V42 Champion Modal Preview')

css = '''.champion-overlay{position:fixed;inset:0;z-index:999;display:none;align-items:center;justify-content:center;padding:22px;background:radial-gradient(circle at 50% 18%,rgba(250,204,21,.26),transparent 34%),rgba(2,6,23,.86);backdrop-filter:blur(18px)}.champion-overlay.show{display:flex}.champion-card{width:min(430px,100%);border-radius:34px;padding:22px 18px 18px;background:radial-gradient(circle at top,rgba(250,204,21,.18),transparent 36%),linear-gradient(180deg,rgba(15,23,42,.98),rgba(2,6,23,.97));border:1px solid rgba(250,204,21,.35);box-shadow:0 0 80px rgba(250,204,21,.26),0 25px 80px rgba(0,0,0,.65);text-align:center;position:relative;overflow:hidden}.champion-card:before{content:"";position:absolute;inset:-40%;background:conic-gradient(from 90deg,transparent,rgba(250,204,21,.18),transparent,rgba(168,85,247,.14),transparent);animation:champSpin 8s linear infinite}.champion-card>*{position:relative;z-index:2}@keyframes champSpin{to{transform:rotate(360deg)}}.champion-kicker{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#fde68a;font-weight:900;margin-bottom:8px}.champion-title{font-size:30px;line-height:.96;font-weight:900;letter-spacing:-.04em;margin-bottom:12px}.champion-photo-wrap{width:178px;height:178px;margin:0 auto 12px;border-radius:32px;overflow:hidden;border:3px solid rgba(250,204,21,.72);box-shadow:0 0 44px rgba(250,204,21,.35);background:#020617;transform:rotate(-2deg)}.champion-photo-wrap img{width:100%;height:100%;object-fit:cover;object-position:center}.champion-name{font-size:42px;line-height:.95;font-weight:900;letter-spacing:-.05em}.champion-points{font-size:25px;color:#7dd3fc;font-weight:900;margin-top:5px}.champion-copy{color:#cbd5e1;font-size:16px;line-height:1.35;margin:14px auto 0;max-width:320px}.champion-party{font-size:21px;font-weight:900;color:#fde047;margin:14px auto 0;line-height:1.12}.champion-button{width:100%;margin-top:18px;border:0;border-radius:20px;padding:15px 16px;background:linear-gradient(135deg,#facc15,#a855f7);color:#020617;font-size:17px;font-weight:900;box-shadow:0 0 32px rgba(250,204,21,.28)}'''
if '.champion-overlay' not in s:
    s = s.replace('@media(max-width:390px)', css + '@media(max-width:390px)')

modal = '''<div id="championOverlay" class="champion-overlay">
  <div class="champion-card">
    <div class="champion-kicker">🏆 Sober September 2026 Champion</div>
    <div class="champion-title">Final Winner</div>
    <div class="champion-photo-wrap"><img id="championPhoto" src="" alt="Champion"></div>
    <div id="championName" class="champion-name">—</div>
    <div id="championPoints" class="champion-points">— PTS</div>
    <div id="championCopy" class="champion-copy">— survived Sober September and took the crown.</div>
    <div class="champion-party">Everybody, let’s celebrate.</div>
    <button class="champion-button" onclick="closeChampionModal()">Proceed</button>
  </div>
</div>
'''
if 'championOverlay' not in s:
    s = s.replace('<nav class="nav">', modal + '<nav class="nav">')

if 'const FORCE_CHAMPION_MODAL' not in s:
    s = s.replace('const FORCE_REDEMPTION = false;', 'const FORCE_REDEMPTION = false;\nconst FORCE_CHAMPION_MODAL = true;')

if 'function maybeShowChampionModal' not in s:
    champ_js = '''function closeChampionModal(){const el=document.getElementById("championOverlay");if(el)el.classList.remove("show")}
function maybeShowChampionModal(stats){const now=new Date(),champStart=new Date(2026,9,1,0,0,0,0);if((!FORCE_CHAMPION_MODAL&&now<champStart)||!stats||!stats.length)return;const winner=stats[0],overlay=document.getElementById("championOverlay");if(!overlay)return;document.getElementById("championPhoto").src=PROFILE_IMAGES[winner.name]||"";document.getElementById("championName").textContent=winner.name;document.getElementById("championPoints").textContent=`${Math.round(winner.total)} PTS`;document.getElementById("championCopy").textContent=`${winner.name} survived Sober September and took the crown.`;overlay.classList.add("show")}
'''
    s = s.replace('function render(stats,rows){', champ_js + 'function render(stats,rows){')

s = s.replace('renderProfile(stats[0])}', 'renderProfile(stats[0]);maybeShowChampionModal(stats)}')

p.write_text(s)
