(() => {
  const style = document.createElement("style");
  style.textContent = `
    .podium-photo img{
      width:100%;
      height:100%;
      object-fit:cover;
      object-position:center;
      display:block;
    }
  `;
  document.head.appendChild(style);

  function podiumAvatarHTML(name, size, font) {
    const src = PROFILE_IMAGES[name];
    if (!src) return avatarHTML(name, size, font);
    const fallback = initials(name);
    return `<div class="avatar ${colorClass(name)} podium-photo" style="width:${size}px;height:${size}px;font-size:${font}px"><img src="${src}" alt="${name}" onerror="this.remove();this.parentElement.textContent='${fallback}'"></div>`;
  }

  podiumSlot = function(s, place) {
    const size = place === 1 ? 100 : 76;
    const font = place === 1 ? 37 : 29;
    const target = Math.round(s.total || 0);
    const isMax = getChallengePhase().phase === "maxout";
    const block = isMax ? ["🥇", "🥈", "🥉"][place - 1] : place;
    return `<div class="p-slot p${place}">${place === 1 ? '<div class="crown">👑</div>' : ''}<div class="p-avatar">${podiumAvatarHTML(s.name, size, font)}</div><div class="p-name">${s.name}</div><div class="p-score podium-score" data-target="${target}">0</div><div class="p-block">${block}</div></div>`;
  };
})();
